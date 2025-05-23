/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-db
 *
 * NAME
 * FileSystemHashIndex
 */
const path = require('path');
const packageName = 'dxp3-db';
const moduleName = 'filesystem' + path.sep + 'FileSystemHashIndex';
const canonicalName = packageName + path.sep + moduleName;
/**
 * @module dxp3-db/filesystem/FileSystemHashIndex
 */
const fs = require('fs').promises;
// We use a worker to resize the index while we still allow inserts and deletes
const { Worker } = require('worker_threads');
const DatabaseError = require('../DatabaseError');
const DatabaseHash = require('../DatabaseHash');
const RecordFile = require('./RecordFile');
const TableIndex = require('../TableIndex');
const logging = require('dxp3-logging');
const mutex = require('dxp3-mutex-inmemory');

const logger = logging.getLogger(canonicalName);

// Each bucket can store multiple hashed entries.
// Therefor we need a decent size.
const BUCKET_RECORD_LENGTH = 512;
const MAX_ENTRIES_PER_BUCKET = 6;
const DEFAULT_NUMBER_OF_BUCKETS = 1024;
const DEFAULT_LOAD_FACTOR_THRESHOLD = 0.75;
const BUCKET_START_INDEX = 1;

class FileSystemHashIndex extends TableIndex {

    constructor(_sourceFolder, _uuid, _name, _table, _columnUUID, _dataFile) {
        super(_uuid, _name, _table.getUUID(), _columnUUID, 'hash index');
        this._sourceFolder = _sourceFolder;
        this._currentIndexPath = path.join(this._sourceFolder, `${this._uuid}.hdx`);
        this._currentIndexFile = new RecordFile(this._currentIndexPath, BUCKET_RECORD_LENGTH);
        this._dataFile = _dataFile;
        this._table = _table;

        this._currentNumberOfBuckets = DEFAULT_NUMBER_OF_BUCKETS;
        this._totalNumberOfEntries = 0;
        this._loadFactorThreshold = DEFAULT_LOAD_FACTOR_THRESHOLD;

        this._standbyWorker = null;
        this._standbyWorkerTempPath = null;
        this._standbyWorkerState = 'idle'; // 'idle', 'building', 'ready_for_live_updates', 'finalizing', 'error'
        this._isSwapping = false; // True during the critical file swap phase
        this._operationQueue = []; // For operations during swap or when standby is not ready
        this._isProcessingQueue = false; // To prevent re-entrant queue processing

        this._readWriteLock = new mutex.ReadWriteLock({timeout:60000});
    }

    async _readHeader() {
        // The header is the first record in the file.
        const headerRecord = await this._currentIndexFile.readRecord(0);
        if(headerRecord === undefined || headerRecord === null) {
            logger.error('_readHeader(): headerRecord is undefined or null for index ' + this._currentIndexPath);
            throw DatabaseError.INTERNAL_SERVER_ERROR;
        }
        this._currentNumberOfBuckets = headerRecord.numberOfBuckets;
        this._totalNumberOfEntries = headerRecord.numberOfEntries;
        this._loadFactorThreshold = headerRecord.loadFactorThreshold;
    }

    async _writeHeader() {
        const headerRecord = {
            numberOfBuckets: this._currentNumberOfBuckets,
            numberOfEntries: this._totalNumberOfEntries,
            loadFactorThreshold: this._loadFactorThreshold,
        };
        await this._currentIndexFile.updateRecord(0, headerRecord);
    }

    _getBucketHeaderRecordIndex(bucketIndex) {
        return BUCKET_START_INDEX + bucketIndex;
    }

    async close() {
        logger.debug(`close(): Closing hash index: ${this._currentIndexPath}`);
        if (this._standbyWorker) {
            logger.info(`Terminating active standby worker for ${this._currentIndexPath}.`);
            this._standbyWorker.postMessage({ action: 'stopGracefully' });
            try {
                // Wait for worker to confirm stop or timeout
                await new Promise((resolve, reject) => {
                    const timeout = setTimeout(() => reject(new Error("Timeout waiting for worker to stop gracefully")), 5000);
                    this._standbyWorker.on('message', (msg) => {
                        if (msg.status === 'stopped') { clearTimeout(timeout); resolve(); }
                    });
                    this._standbyWorker.on('exit', () => { clearTimeout(timeout); resolve(); }); // Resolve if it exits for any reason
                });
            } catch (e) {
                logger.warn(`Error or timeout stopping worker gracefully, terminating: ${e.message}`);
                if (this._standbyWorker) await this._standbyWorker.terminate().catch(termErr => logger.warn(`Error terminating worker: ${termErr.message}`));
            }
            this._standbyWorker = null;
            // The worker should clean its own temp file on 'stopGracefully'
            this._standbyWorkerTempPath = null;
            this._standbyWorkerState = 'idle';
        }
        await this._currentIndexFile.close();
        logger.debug(`close(): Hash index closed: ${this._currentIndexPath}`);
    }

    async equal(_key) {
        let result = [];
        if (_key === undefined || _key === null) {
            return result;
        }
        if (this._isSwapping) {
            logger.debug(`equal: Reading key ${_key} while swap is in progress. Data might be from pre-swap state or fail. Consider queuing reads or retrying.`);
            // For simplicity, we read from current. A robust solution might queue reads or use snapshotting.
        }

        const bucketIndex = this._getBucketIndex(_key);
        if (this._currentNumberOfBuckets === 0) { // Not initialized
            logger.warn(`equal: Index ${this._currentIndexPath} not initialized or empty, cannot find key ${_key}.`);
            return result;
        }
        let currentRecordIndex = this._getBucketHeaderRecordIndex(bucketIndex);
        let currentRecord = await this._currentIndexFile.readRecord(currentRecordIndex);

        while(currentRecord !== null) {
            if (!currentRecord.entries) {
                currentRecord.entries = [];
            }
            for (const entry of currentRecord.entries) {
                if (entry.key === _key) {
                    const dataFileRecordIndex = entry.value;
                    const record = await this._dataFile.readRecord(dataFileRecordIndex);
                    // record can be null if it was deleted from dataFile but index not yet updated,
                    // or if dataFileRecordIndex is somehow invalid.
                    if (record !== null) {
                        result.push(record);
                    }
                    return result; // Assuming keys are unique within the hash index for `equal`
                }
            }
            currentRecordIndex = currentRecord.nextEntryIndex;
            if (currentRecordIndex === undefined || currentRecordIndex === null) {
                currentRecord = null;
                break;
            }
            currentRecord = await this._currentIndexFile.readRecord(currentRecordIndex);
        }
        return result;
    }

    async equalColumn(_columnName) {
        logger.error("equalColumn is not implemented for FileSystemHashIndex.");
        throw DatabaseError.NOT_IMPLEMENTED;
    }

    async greater(_value) {
        logger.error("greater is not implemented for FileSystemHashIndex.");
        throw DatabaseError.NOT_IMPLEMENTED;
    }

    async greaterColumn(_columnName) {
        logger.error("greaterColumn is not implemented for FileSystemHashIndex.");
        throw DatabaseError.NOT_IMPLEMENTED;
    }

    async greaterOrEqual(_value) {
        logger.error("greaterOrEqual is not implemented for FileSystemHashIndex.");
        throw DatabaseError.NOT_IMPLEMENTED;
    }

    async greaterOrEqualColumn(_columnName) {
        logger.error("greaterOrEqualColumn is not implemented for FileSystemHashIndex.");
        throw DatabaseError.NOT_IMPLEMENTED;
    }

    async in(_values) {
        const results = [];
        if (!_values || _values.length === 0) return results;

        // Consider parallelizing if _values array is very large, but respect potential file handle limits.
        for (const value of _values) {
            const records = await this.equal(value);
            results.push(...records);
        }
        // Deduplicate if necessary, as different values in _values might point to the same record.
        // This depends on whether the underlying data records can be identical.
        // For now, assuming results from `equal` are what's needed.
        return results;
    }

    async open() {
        await this.init();
    }

    async init() {
        logger.trace(`init(): start for ${this._currentIndexPath}`);
        try {
            logger.debug(`init(): Check if index file '${this._currentIndexPath}' exists.`);
            let exists = await this._currentIndexFile.exists();
            // Calling open() will create the file if it did not exist.
            await this._currentIndexFile.open();
            // Now that we know the file exist check if we need to refresh the index.
            if(!exists) {
                logger.info(`init(): Index file '${this._currentIndexPath}' did NOT exist. Refreshing.`);
                await this.refresh();
            } else {
                logger.debug(`init(): Index file '${this._currentIndexPath}' exists. Reading header.`);
                await this._readHeader();
                await this._launchStandbyWorker();
            }
        } catch(_exception) {
            logger.error(`init(): Failed for ${this._currentIndexPath}: ${_exception.stack || _exception}`);
            throw _exception; // Re-throw to signal failure
        } finally {
            logger.trace(`init(): end for ${this._currentIndexPath}`);
        }
    }

    _getBucketIndex(_key) {
        if (this._currentNumberOfBuckets === 0) {
            // This case should ideally be prevented by proper initialization or recovery.
            logger.error("_getBucketIndex: _currentNumberOfBuckets is 0. This indicates an uninitialized or corrupt index state.");
            // Throw an error or return a default to prevent NaN, though this is a symptom of a larger issue.
            throw new DatabaseError("Hash index is not properly initialized: number of buckets is zero.");
        }
        const hash = DatabaseHash.new(_key);
        return Math.abs(hash % this._currentNumberOfBuckets);
    }

    _needsResize() {
        if (this._currentNumberOfBuckets <= 0) return false;
        const currentLoadFactor = this._totalNumberOfEntries / this._currentNumberOfBuckets;
        return currentLoadFactor > this._loadFactorThreshold;
    }

    async _launchStandbyWorker() {
        if (this._standbyWorker) {
            logger.info(`_launchStandbyWorker: Terminating existing standby worker for ${this._currentIndexPath}.`);
            this._standbyWorker.postMessage({ action: 'stopGracefully' });
            // Await termination or timeout
            try {
                await new Promise((resolve, reject) => {
                    const t = setTimeout(() => reject(new Error("Timeout stopping old standby worker")), 2000);
                    this._standbyWorker.on('exit', () => { clearTimeout(t); resolve(); });
                });
            } catch (e) {
                if (this._standbyWorker) await this._standbyWorker.terminate().catch(err => logger.warn("Error terminating old worker:", err));
            }
            this._standbyWorker = null;
        }

        let targetBuckets = (this._currentNumberOfBuckets || DEFAULT_NUMBER_OF_BUCKETS) * 2;
         // Ensure newNumBuckets is reasonable, e.g., if totalEntries is very high due to a large insertMany
        if (this._totalNumberOfEntries > 0) {
            while(targetBuckets < (this._totalNumberOfEntries * 2)) { // Ensure enough buckets for a lower load factor
                targetBuckets = targetBuckets * 2;
            }
        }


        this._standbyWorkerTempPath = this._currentIndexPath + '.standby_build_' + Date.now() + '_' + Math.random().toString(36).substring(2,7) + '.hdx';
        this._standbyWorkerState = 'building';

        const workerPath = path.join(__dirname, 'hash-index-resize-worker.js');
        this._standbyWorker = new Worker(workerPath);
        logger.info(`_launchStandbyWorker: Launched new standby worker for ${this._currentIndexPath}. Target buckets: ${targetBuckets}, Temp path: ${this._standbyWorkerTempPath}`);

        this._standbyWorker.postMessage({
            action: 'prepareNextIndex',
            sourceFolder: this._sourceFolder,
            currentDataIndexPath: this._currentIndexPath, // Worker will copy this
            newNumBuckets: targetBuckets,
            recordLength: BUCKET_RECORD_LENGTH,
            loadFactorThreshold: this._loadFactorThreshold,
            outputTempPath: this._standbyWorkerTempPath
        });

        this._standbyWorker.on('message', (message) => this._handleStandbyWorkerMessage(message));
        this._standbyWorker.on('error', (err) => this._handleStandbyWorkerError(err));
        this._standbyWorker.on('exit', (code) => this._handleStandbyWorkerExit(code));
    }

    _handleStandbyWorkerMessage(message) {
        logger.debug(`[FSIndex ${this.getName()}] Worker message: ${JSON.stringify(message)}`);
        if (message.status === 'readyForLiveUpdates') {
            this._standbyWorkerState = 'ready_for_live_updates';
            this._standbyWorkerTempPath = message.tempPath; // Confirm path
            logger.info(`Standby worker for ${this._currentIndexPath} is ready for live updates at ${this._standbyWorkerTempPath}.`);
            this._triggerSwapIfNecessary(); // Check if we were waiting for it
        } else if (message.status === 'finalized') {
            if (this._isSwapping && this._standbyWorkerState === 'finalizing') {
                this._handleStandbyFinalized(message.finalPath);
            } else {
                logger.warn(`Received 'finalized' from worker for ${this._currentIndexPath}, but not in a swapping/finalizing state. Ignoring.`);
            }
        } else if (message.status === 'error') {
            logger.error(`Standby worker for ${this._currentIndexPath} reported an error: ${message.message} \nStack: ${message.stack}`);
            this._standbyWorkerState = 'error';
            // Worker should have cleaned up its temp file. If path is known, try to ensure.
            if (message.tempPath) {
                fs.unlink(message.tempPath).catch(e => { if (e.code !== 'ENOENT') logger.warn(`Could not delete worker temp file ${message.tempPath} on error: ${e.message}`); });
            }
            // Optionally, try to relaunch worker after a delay or on next operation.
        } else if (message.status === 'cancelled' || message.status === 'stopped') {
            logger.info(`Standby worker for ${this._currentIndexPath} reported: ${message.status}.`);
            if (this._standbyWorkerState !== 'idle' && this._standbyWorkerState !== 'error') { // Avoid if already handled by exit/error
                this._standbyWorkerState = 'idle'; // Or 'error' if cancelled due to an issue
            }
             if (message.tempPath) { // Worker might report its temp path on cancellation
                fs.unlink(message.tempPath).catch(e => { if (e.code !== 'ENOENT') logger.warn(`Could not delete worker temp file ${message.tempPath} on ${message.status}: ${e.message}`); });
            }
        }
    }

    async insertMany(entries) {
        let writeLock = null;
        try {
            writeLock = await this._readWriteLock.writeLock(this._uuid);
            if (this._isSwapping || (this._needsResize() && this._standbyWorkerState !== 'ready_for_live_updates')) {
                logger.debug(`insertMany: Queuing ${entries.length} entries for ${this._currentIndexPath}. Swap: ${this._isSwapping}, NeedsResize: ${this._needsResize()}, WorkerState: ${this._standbyWorkerState}`);
                this._operationQueue.push({ type: 'insertMany', entries: entries });
            } else {
                await this._directInsertMany(entries); // Applies to _currentIndexFile
                if (this._standbyWorker && this._standbyWorkerState === 'ready_for_live_updates') {
                    this._standbyWorker.postMessage({ action: 'applyOperation', operation: { type: 'insertMany', entries: entries } });
                }
            }
        } catch(_exception) {
            logger.error(`Error in insertMany for ${this._currentIndexPath}: ${_exception.stack || _exception}`);
        } finally {
            if(writeLock != null) {
                writeLock.release();
            }
        }
        await this._triggerSwapIfNecessary();
    }

    async _directInsertMany(entries) {
        if (!entries || entries.length === 0) {
            logger.debug("_directInsertMany: No entries provided. Skipping.");
            return;
        }
        logger.debug(`_directInsertMany: Processing ${entries.length} entries for ${this._currentIndexPath}.`);

        const bucketsToProcess = new Map();
        for (const entry of entries) {
            if (entry.key === undefined || entry.key === null || entry.dataFileRecordIndex === undefined || entry.dataFileRecordIndex === null) {
                logger.warn(`_directInsertMany: Skipping invalid entry: ${JSON.stringify(entry)}`);
                continue;
            }
            const bucketIndex = this._getBucketIndex(entry.key);
            if (!bucketsToProcess.has(bucketIndex)) {
                bucketsToProcess.set(bucketIndex, []);
            }
            bucketsToProcess.get(bucketIndex).push({
                key: entry.key,
                value: entry.dataFileRecordIndex
            });
        }

        if (bucketsToProcess.size === 0) {
            logger.debug("_directInsertMany: No valid entries after filtering. Skipping.");
            return;
        }

        let newEntriesCount = 0;

        for (const [bucketIndex, bucketEntries] of bucketsToProcess) {
            logger.trace(`_directInsertMany: Processing bucket ${bucketIndex} with ${bucketEntries.length} entries.`);
            const bucketHeaderIndex = this._getBucketHeaderRecordIndex(bucketIndex);
            let entriesToInsertForThisBucket = JSON.parse(JSON.stringify(bucketEntries)); // Deep copy for manipulation

            let currentRecordIndex = bucketHeaderIndex;
            let currentRecord = await this._currentIndexFile.readRecord(currentRecordIndex);
            let lastRecordInChain = null;
            let lastRecordInChainIndex = -1;

            while (currentRecord !== null && entriesToInsertForThisBucket.length > 0) {
                 if (!currentRecord.entries) currentRecord.entries = [];
                 lastRecordInChain = currentRecord;
                 lastRecordInChainIndex = currentRecordIndex;

                 let recordUpdated = false;
                 const remainingEntriesForBucket = [];

                 for (const entry of entriesToInsertForThisBucket) {
                    let processed = false;
                    const existingEntryIndex = currentRecord.entries.findIndex(e => e.key === entry.key);
                    if (existingEntryIndex !== -1) {
                        if (currentRecord.entries[existingEntryIndex].value !== entry.value) {
                            currentRecord.entries[existingEntryIndex].value = entry.value;
                            recordUpdated = true;
                        }
                        processed = true;
                    } else if (currentRecord.entries.length < MAX_ENTRIES_PER_BUCKET) {
                        currentRecord.entries.push(entry);
                        recordUpdated = true;
                        newEntriesCount++;
                        processed = true;
                    }
                    if (!processed) {
                        remainingEntriesForBucket.push(entry);
                    }
                 }

                 if (recordUpdated) {
                    await this._currentIndexFile.updateRecord(currentRecordIndex, currentRecord);
                 }
                 entriesToInsertForThisBucket = remainingEntriesForBucket;

                 if (entriesToInsertForThisBucket.length > 0) {
                    const nextIndex = currentRecord.nextEntryIndex;
                    if (nextIndex !== null) {
                        currentRecordIndex = nextIndex;
                        currentRecord = await this._currentIndexFile.readRecord(currentRecordIndex);
                    } else {
                        currentRecord = null;
                    }
                 } else {
                    currentRecord = null;
                 }
            }

            while (entriesToInsertForThisBucket.length > 0) {
                const entriesForNewRecord = entriesToInsertForThisBucket.splice(0, MAX_ENTRIES_PER_BUCKET);
                const newRecord = {
                    entries: entriesForNewRecord,
                    nextEntryIndex: null
                };
                const newRecordIndex = await this._currentIndexFile.appendRecord(newRecord);
                newEntriesCount += entriesForNewRecord.length;

                if (lastRecordInChain) {
                    lastRecordInChain.nextEntryIndex = newRecordIndex;
                    await this._currentIndexFile.updateRecord(lastRecordInChainIndex, lastRecordInChain);
                } else {
                    logger.error(`_directInsertMany: lastRecordInChain is null for bucket ${bucketIndex}. This should not happen if bucket header exists.`);
                    // Attempt to recover by directly updating the bucket header if it was the one supposed to be `lastRecordInChain`
                    let bucketHeaderRecord = await this._currentIndexFile.readRecord(bucketHeaderIndex);
                    if (bucketHeaderRecord) { // Should exist
                        bucketHeaderRecord.nextEntryIndex = newRecordIndex; // This assumes the header itself was full or didn't fit the first entry.
                        await this._currentIndexFile.updateRecord(bucketHeaderIndex, bucketHeaderRecord);
                    }
                }
                lastRecordInChain = newRecord;
                lastRecordInChainIndex = newRecordIndex;
            }
        }

        if (newEntriesCount > 0) {
            logger.debug(`_directInsertMany: Added ${newEntriesCount} new entries.`);
            this._totalNumberOfEntries += newEntriesCount;
            await this._writeHeader();
        } else {
            logger.debug("_directInsertMany: No new entries were added (only updates or duplicates).");
        }
        logger.debug(`_directInsertMany: Finished processing for ${this._currentIndexPath}.`);
    }

    async insert(_key, _dataFileRecordIndex) {
        let writeLock = null;
        try {
            writeLock = await this._readWriteLock.writeLock(this._uuid);
            if (this._isSwapping || (this._needsResize() && this._standbyWorkerState !== 'ready_for_live_updates')) {
                logger.debug(`insert: Queuing key ${_key} for ${this._currentIndexPath}. Swap: ${this._isSwapping}, NeedsResize: ${this._needsResize()}, WorkerState: ${this._standbyWorkerState}`);
                this._operationQueue.push({ type: 'insert', key: _key, value: _dataFileRecordIndex });
            } else {
                await this._directInsert(_key, _dataFileRecordIndex);
                if (this._standbyWorker && this._standbyWorkerState === 'ready_for_live_updates') {
                    this._standbyWorker.postMessage({ action: 'applyOperation', operation: { type: 'insert', key: _key, value: _dataFileRecordIndex } });
                }
            }
        } catch(_exception) {
            logger.error(`Error in insert for ${this._currentIndexPath}, key ${_key}: ${_exception.stack || _exception}`);
        } finally {
            if(writeLock != null) {
                writeLock.release();
            }
        }
        await this._triggerSwapIfNecessary();
    }

    async _directInsert(key, dataFileRecordIndex) {
        if (key === undefined || key === null) {
            logger.warn("_directInsert: Attempted to insert null or undefined key. Skipping.");
            return;
        }
        const bucketIndex = this._getBucketIndex(key);
        let currentRecordIndex = this._getBucketHeaderRecordIndex(bucketIndex);
        let currentRecord = await this._currentIndexFile.readRecord(currentRecordIndex);

        if (!currentRecord) {
            logger.error(`_directInsert: Bucket header record at index ${currentRecordIndex} for bucket ${bucketIndex} is null. Index ${this._currentIndexPath} might be corrupt or uninitialized.`);
            // Attempt to create it if it's missing, this is a recovery attempt.
            currentRecord = { entries: [], nextEntryIndex: null };
            await this._currentIndexFile.updateRecord(currentRecordIndex, currentRecord); // This assumes the record slot was allocated.
            logger.warn(`_directInsert: Re-initialized bucket header for bucket ${bucketIndex} at index ${currentRecordIndex}.`);
        }

        let recordToUpdate = null;
        let indexToUpdate = -1;
        let entryFound = false;
        let addedNewEntry = false;

        while (currentRecord !== null) {
            if (!currentRecord.entries) currentRecord.entries = [];

            for (let i = 0; i < currentRecord.entries.length; i++) {
                if (currentRecord.entries[i].key === key) {
                    if (currentRecord.entries[i].value !== dataFileRecordIndex) {
                        currentRecord.entries[i].value = dataFileRecordIndex; // Update existing entry
                        await this._currentIndexFile.updateRecord(currentRecordIndex, currentRecord);
                    }
                    entryFound = true;
                    break;
                }
            }
            if (entryFound) break;

            if (currentRecord.entries.length < MAX_ENTRIES_PER_BUCKET) {
                currentRecord.entries.push({ key: key, value: dataFileRecordIndex });
                await this._currentIndexFile.updateRecord(currentRecordIndex, currentRecord);
                entryFound = true;
                addedNewEntry = true;
                break;
            }

            const nextIndex = currentRecord.nextEntryIndex;
            if (nextIndex === null) {
                recordToUpdate = currentRecord;
                indexToUpdate = currentRecordIndex;
                break;
            } else {
                currentRecordIndex = nextIndex;
                currentRecord = await this._currentIndexFile.readRecord(currentRecordIndex);
            }
        }

        if (!entryFound) {
            if (!recordToUpdate) {
                 // This implies the bucket header itself was null, which should have been handled earlier.
                 // Or, the bucket header was the only record and it was full.
                 logger.error(`_directInsert: recordToUpdate is null for key ${key}. This indicates a problem with chain traversal or bucket header initialization.`);
                 // As a fallback, assume recordToUpdate should have been the initial currentRecord (bucket header)
                 // This is a defensive measure.
                 recordToUpdate = await this._currentIndexFile.readRecord(this._getBucketHeaderRecordIndex(bucketIndex));
                 indexToUpdate = this._getBucketHeaderRecordIndex(bucketIndex);
                 if (!recordToUpdate) {
                    logger.error(`_directInsert: CRITICAL - Bucket header for key ${key} is still null. Cannot append new record.`);
                    return; // Cannot proceed
                 }
            }
            const newEntryRecord = {
                entries: [{ key: key, value: dataFileRecordIndex }],
                nextEntryIndex: null
            };
            const newRecordIndex = await this._currentIndexFile.appendRecord(newEntryRecord);
            recordToUpdate.nextEntryIndex = newRecordIndex;
            await this._currentIndexFile.updateRecord(indexToUpdate, recordToUpdate);
            addedNewEntry = true;
        }

        if (addedNewEntry) {
            this._totalNumberOfEntries++;
            await this._writeHeader();
        }
    }

    async _processQueuedOperations() {
        if (this._isProcessingQueue || this._operationQueue.length === 0) return;
        this._isProcessingQueue = true;
        logger.info(`_processQueuedOperations: Processing ${this._operationQueue.length} queued operations for ${this._currentIndexPath}.`);

        const queue = [...this._operationQueue];
        this._operationQueue = [];
        let lock = null;

        try {
            lock = await this._readWriteLock.writeLock(this._uuid);
            for (const op of queue) {
                logger.debug(`_processQueuedOperations: Executing ${op.type} for key ${op.key || (op.entries ? op.entries.length + ' entries' : '(unknown)')}`);
                let appliedToCurrent = false;
                if (this._isSwapping) { // If a swap started during queue processing, re-queue
                    this._operationQueue.push(op);
                    continue;
                }

                if (op.type === 'insert') {
                    await this._directInsert(op.key, op.value); // Applies to this._currentIndexFile
                    appliedToCurrent = true;
                } else if (op.type === 'delete') {
                    await this._directDelete(op.key); // Applies to this._currentIndexFile
                    appliedToCurrent = true;
                } else if (op.type === 'insertMany') {
                    await this._directInsertMany(op.entries); // Applies to this._currentIndexFile
                    appliedToCurrent = true;
                }

                if (appliedToCurrent && this._standbyWorker && this._standbyWorkerState === 'ready_for_live_updates') {
                    this._standbyWorker.postMessage({ action: 'applyOperation', operation: op });
                }
            }
        } catch (error) {
            logger.error(`_processQueuedOperations: Error during processing for ${this._currentIndexPath}: ${error.stack || error}`);
            // Re-queue remaining unprocessed operations from the original 'queue' array if error occurs mid-processing
            const processedCount = queue.length - this._operationQueue.length; // ops already processed + re-queued
            const remainingOriginalQueueOps = queue.slice(processedCount);
            this._operationQueue.unshift(...remainingOriginalQueueOps); // Add them to the front
        } finally {
            if (lock) lock.release();
            this._isProcessingQueue = false;
        }

        logger.info(`_processQueuedOperations: Finished processing. Remaining in queue: ${this._operationQueue.length}`);
        // After processing, check if a swap is now possible/needed, especially if queue processing itself triggered resize conditions
        if (this._operationQueue.length === 0) { // Only trigger if queue is empty, to avoid recursive calls if swap conditions aren't met yet
            await this._triggerSwapIfNecessary();
        }
    }


    async _triggerSwapIfNecessary() {
        if (this._isSwapping) {
            logger.debug(`_triggerSwapIfNecessary: Already swapping ${this._currentIndexPath}, skipping.`);
            return;
        }

        if (!this._needsResize()) {
            return;
        }

        logger.info(`_triggerSwapIfNecessary: Load factor exceeded for ${this._currentIndexPath}. Checking standby worker.`);

        if (this._standbyWorker && this._standbyWorkerState === 'ready_for_live_updates') {
            logger.info(`Standby worker for ${this._currentIndexPath} is ready. Initiating swap.`);
            this._isSwapping = true;
            this._standbyWorkerState = 'finalizing';
            this._standbyWorker.postMessage({ action: 'finalize' });
            // The actual swap logic will be triggered by the worker's 'finalized' message
            // in _handleStandbyWorkerMessage -> _handleStandbyFinalized
        } else if (this._standbyWorker && (this._standbyWorkerState === 'building' || this._standbyWorkerState === 'finalizing')) {
            logger.info(`Load factor high for ${this._currentIndexPath}, but standby worker is busy ('${this._standbyWorkerState}'). Operations will be queued.`);
        } else { // No worker, or worker in error/idle state
            logger.warn(`Load factor high for ${this._currentIndexPath}, but no usable standby worker (state: ${this._standbyWorkerState}). Relaunching worker. Operations will be queued.`);
            await this._launchStandbyWorker(); // Attempt to (re)launch
        }
    }

    async _handleStandbyFinalized(finalizedPathFromWorker) {
        logger.info(`_handleStandbyFinalized: Received finalized path ${finalizedPathFromWorker} for ${this._currentIndexPath}.`);
        let lock = null;
        try {
            lock = await this._readWriteLock.writeLock(this._uuid); // Full write lock for the swap

            const oldLiveFile = this._currentIndexFile;
            const oldLivePath = this._currentIndexPath;

            const newLiveFile = new RecordFile(finalizedPathFromWorker, BUCKET_RECORD_LENGTH);
            await newLiveFile.open();

            // Temporarily point instance variables to the new file for queue processing
            this._currentIndexFile = newLiveFile;
            await this._readHeader(); // Read header of new file to set _currentNumBuckets, _totalNumberOfEntries

            logger.info(`_handleStandbyFinalized: Replaying ${this._operationQueue.length} operations onto new index ${finalizedPathFromWorker}.`);
            // Process queue onto the new file (which is now this._currentIndexFile)
            // Need a dedicated method that processes queue onto current file without sending to standby
            const tempQueue = [...this._operationQueue];
            this._operationQueue = [];
            for (const op of tempQueue) {
                 if (op.type === 'insert') await this._directInsert(op.key, op.value);
                 else if (op.type === 'delete') await this._directDelete(op.key);
                 else if (op.type === 'insertMany') await this._directInsertMany(op.entries);
            }
            // Header of newLiveFile (this._currentIndexFile) is now fully up-to-date.

            await oldLiveFile.close();
            await fs.unlink(oldLivePath);
            await fs.rename(finalizedPathFromWorker, oldLivePath); // Rename worker's file to the original live path

            // The newLiveFile instance was operating on finalizedPathFromWorker.
            // That physical file is now oldLivePath. Close newLiveFile as its path is stale.
            await newLiveFile.close();

            this._currentIndexPath = oldLivePath; // Update path to the official one
            this._currentIndexFile = new RecordFile(this._currentIndexPath, BUCKET_RECORD_LENGTH);
            await this._currentIndexFile.open();
            await this._readHeader(); // Final read from the newly promoted index.

            logger.info(`Swap complete for ${this._currentIndexPath}. New buckets: ${this._currentNumberOfBuckets}, Entries: ${this._totalNumberOfEntries}.`);

        } catch (error) {
            logger.error(`CRITICAL error during file swap for ${this._currentIndexPath}: ${error.stack || error}. Index may be in an inconsistent state.`);
            // Attempt to revert to old file if possible, or mark index as broken.
            // This recovery is complex and depends on which step failed.
            // For now, we might be left with the new file at oldLivePath or an error state.
            // Best effort: try to ensure _currentIndexFile points to _currentIndexPath and is open.
            try {
                if (this._currentIndexFile && typeof this._currentIndexFile.close === 'function' && this._currentIndexFile._randomAccessFile && this._currentIndexFile._randomAccessFile._fileHandle === null) {
                    // If it was closed due to rename, reopen
                } else if (this._currentIndexFile && this._currentIndexFile._filePath !== this._currentIndexPath) {
                     // If it points to the wrong path, close it
                    await this._currentIndexFile.close().catch(()=>{});
                    this._currentIndexFile = new RecordFile(this._currentIndexPath, BUCKET_RECORD_LENGTH);
                }
                 if (!this._currentIndexFile._randomAccessFile || this._currentIndexFile._randomAccessFile._fileHandle === null) {
                    await this._currentIndexFile.open();
                 }
                await this._readHeader();
            } catch (recoveryErr) {
                logger.error(`Failed to recover current index file after swap error: ${recoveryErr.stack || recoveryErr}`);
                this._currentNumberOfBuckets = 0; // Mark as potentially unusable
            }
        } finally {
            this._standbyWorkerState = 'idle';
            if (this._standbyWorker) { // Terminate the worker that just finished
                await this._standbyWorker.terminate().catch(e => logger.warn(`Error terminating finalized standby worker: ${e.message}`));
                this._standbyWorker = null;
            }
            this._isSwapping = false;
            if (lock) lock.release();

            await this._launchStandbyWorker(); // Launch a new standby worker for the next generation

            // Process any operations that were queued during the critical swap lock.
            if (this._operationQueue.length > 0) {
                logger.info(`Processing ${this._operationQueue.length} operations queued during swap.`);
                await this._processQueuedOperations();
            }
        }
    }

    _handleStandbyWorkerError(err) {
        logger.error(`Standby worker for ${this._currentIndexPath} encountered an error: ${err.stack || err}`);
        this._standbyWorkerState = 'error';
        if (this._standbyWorkerTempPath) {
            fs.unlink(this._standbyWorkerTempPath).catch(e => { if (e.code !== 'ENOENT') logger.warn(`Could not delete standby temp file ${this._standbyWorkerTempPath} on worker error: ${e.message}`); });
            this._standbyWorkerTempPath = null;
        }
        // Terminate the worker if it hasn't exited
        if (this._standbyWorker) {
            this._standbyWorker.terminate().catch(e => logger.warn(`Error terminating worker on error event: ${e.message}`));
            this._standbyWorker = null;
        }
        // If we were swapping, this is a problem.
        if (this._isSwapping) {
            logger.error(`Standby worker errored during a swap operation for ${this._currentIndexPath}. Swap aborted.`);
            this._isSwapping = false;
            // Process queue on the current (old) index.
            this._processQueuedOperations();
        }
    }

    _handleStandbyWorkerExit(code) {
        logger.info(`Standby worker for ${this._currentIndexPath} exited with code ${code}. Current state: ${this._standbyWorkerState}`);
        if (this._standbyWorkerState !== 'idle' && this._standbyWorkerState !== 'error') { // Avoid double handling if error/message already processed
            if (code !== 0) {
                logger.error(`Standby worker for ${this._currentIndexPath} exited unexpectedly (code ${code}).`);
                this._standbyWorkerState = 'error';
            } else {
                this._standbyWorkerState = 'idle';
            }

            if (this._standbyWorkerTempPath) {
                fs.unlink(this._standbyWorkerTempPath).catch(e => { if (e.code !== 'ENOENT') logger.warn(`Could not delete standby temp file ${this._standbyWorkerTempPath} on worker exit: ${e.message}`); });
                this._standbyWorkerTempPath = null;
            }

            if (this._isSwapping) {
                logger.error(`Standby worker exited during a swap operation for ${this._currentIndexPath}. Swap aborted.`);
                this._isSwapping = false;
                this._processQueuedOperations(); // Process queue on current (old) index
            }
        }
        this._standbyWorker = null; // Ensure worker instance is cleared
    }


    async delete(_key) {
        let writeLock = null;
        try {
            writeLock = await this._readWriteLock.writeLock(this._uuid);
            if (this._isSwapping || (this._needsResize() && this._standbyWorkerState !== 'ready_for_live_updates')) {
                logger.debug(`delete: Queuing key ${_key} for ${this._currentIndexPath}. Swap: ${this._isSwapping}, NeedsResize: ${this._needsResize()}, WorkerState: ${this._standbyWorkerState}`);
                this._operationQueue.push({ type: 'delete', key: _key });
            } else {
                await this._directDelete(_key);
                if (this._standbyWorker && this._standbyWorkerState === 'ready_for_live_updates') {
                    this._standbyWorker.postMessage({ action: 'applyOperation', operation: { type: 'delete', key: _key } });
                }
            }
        } catch(_exception) {
            logger.error(`Error in delete for ${this._currentIndexPath}, key ${_key}: ${_exception.stack || _exception}`);
        } finally {
            if(writeLock != null) {
                writeLock.release();
            }
        }
        await this._triggerSwapIfNecessary();
    }

    async _directDelete(key) {
        if (key === undefined || key === null) {
            logger.warn("_directDelete: Attempted to delete null or undefined key. Skipping.");
            return;
        }
        const bucketIndex = this._getBucketIndex(key);
        let currentRecordIndex = this._getBucketHeaderRecordIndex(bucketIndex);
        let currentRecord = await this._currentIndexFile.readRecord(currentRecordIndex);
        let deleted = false;

        while (currentRecord !== null) {
            if (currentRecord.entries) {
                const initialLength = currentRecord.entries.length;
                currentRecord.entries = currentRecord.entries.filter(entry => entry.key !== key);

                if (currentRecord.entries.length < initialLength) {
                    await this._currentIndexFile.updateRecord(currentRecordIndex, currentRecord);
                    this._totalNumberOfEntries--;
                    deleted = true;
                    break;
                }
            }
            currentRecordIndex = currentRecord.nextEntryIndex;
            if (currentRecordIndex !== null) {
                currentRecord = await this._currentIndexFile.readRecord(currentRecordIndex);
            } else {
                currentRecord = null;
            }
        }

        if (deleted) {
            await this._writeHeader();
        } else {
            logger.debug(`_directDelete: Key ${key} not found in index ${this._currentIndexPath}.`);
        }
    }

    async empty() {
        return this.clear();
    }

    async clear() {
        logger.info(`Clearing hash index: ${this._currentIndexPath}`);
        let lock = null;
        try {
            lock = await this._readWriteLock.writeLock(this._uuid);

            if (this._standbyWorker) {
                logger.info(`clear: Signaling and terminating active standby worker for ${this._currentIndexPath}.`);
                this._standbyWorker.postMessage({ action: 'stopGracefully' });
                try {
                    await new Promise((resolve, reject) => {
                        const t = setTimeout(() => reject(new Error("Timeout stopping standby worker during clear")), 2000);
                        this._standbyWorker.on('exit', () => { clearTimeout(t); resolve(); });
                    });
                } catch (e) {
                    if (this._standbyWorker) await this._standbyWorker.terminate().catch(err => logger.warn("Error terminating worker in clear:", err));
                }
                this._standbyWorker = null;
                this._standbyWorkerTempPath = null; // Worker should have cleaned its temp file
                this._standbyWorkerState = 'idle';
            }

            this._isSwapping = false;
            this._operationQueue = [];

            await this._currentIndexFile.clear();
            this._currentNumberOfBuckets = DEFAULT_NUMBER_OF_BUCKETS;
            this._totalNumberOfEntries = 0;

            const headerRecord = {
                numberOfBuckets: this._currentNumberOfBuckets,
                numberOfEntries: this._totalNumberOfEntries,
                loadFactorThreshold: this._loadFactorThreshold,
            };
            await this._currentIndexFile.appendRecord(headerRecord);
            const emptyBucketRecord = { entries: [], nextEntryIndex: null };
            const batchSize = 1000;
            let bucketBatch = [];
            for (let i = 0; i < this._currentNumberOfBuckets; i++) {
                bucketBatch.push(emptyBucketRecord);
                if (bucketBatch.length >= batchSize || i === this._currentNumberOfBuckets - 1) {
                    await this._currentIndexFile.appendRecords(bucketBatch);
                    bucketBatch = [];
                }
            }
            logger.info(`Hash index ${this._currentIndexPath} cleared and initialized with ${this._currentNumberOfBuckets} buckets.`);
        } catch (error) {
            logger.error(`Error during clear operation for ${this._currentIndexPath}: ${error.stack || error}`);
            throw error; // Re-throw
        } finally {
            if (lock) lock.release();
        }
        // Launch a new standby worker after clearing and re-initializing the current index
        await this._launchStandbyWorker();
    }

    async less(_value) {
        logger.error("less is not implemented for FileSystemHashIndex.");
        throw DatabaseError.NOT_IMPLEMENTED;
    }

    async lessColumn(_columnName) {
        logger.error("lessColumn is not implemented for FileSystemHashIndex.");
        throw DatabaseError.NOT_IMPLEMENTED;
    }

    async lessOrEqual(_value) {
        logger.error("lessOrEqual is not implemented for FileSystemHashIndex.");
        throw DatabaseError.NOT_IMPLEMENTED;
    }

    async lessOrEqualColumn(_columnName) {
        logger.error("lessOrEqualColumn is not implemented for FileSystemHashIndex.");
        throw DatabaseError.NOT_IMPLEMENTED;
    }

    async like(_value) {
        logger.error("like is not implemented for FileSystemHashIndex.");
        throw DatabaseError.NOT_IMPLEMENTED;
    }

    async refresh() {
        logger.info(`Refreshing hash index: ${this._currentIndexPath}`);
        await this.clear(); // This will also handle stopping standby worker and re-launching it.

        const column = this._table.getColumnByUUID(this._columnUUID);
        const columnName = column.getName();
        const totalNumberOfRecordsInDataFile = await this._dataFile.getTotalNumberOfRecords();
        logger.debug(`refresh: Re-indexing ${totalNumberOfRecordsInDataFile} potential records from data file for ${this._currentIndexPath}.`);

        let entriesToInsert = [];
        const batchSize = 1000; // Adjust batch size as needed

        for(let i=0; i < totalNumberOfRecordsInDataFile; i++) {
            let record = await this._dataFile.readRecord(i);
            if(record === null) continue; // Skip deleted records

            const valueToIndex = record[columnName];
            if(valueToIndex === undefined || valueToIndex === null) continue;

            entriesToInsert.push({ key: valueToIndex, dataFileRecordIndex: i });

            if (entriesToInsert.length >= batchSize || (i === totalNumberOfRecordsInDataFile - 1 && entriesToInsert.length > 0)) {
                logger.trace(`refresh: Inserting batch of ${entriesToInsert.length} entries.`);
                await this.insertMany(entriesToInsert); // insertMany handles queuing and worker forwarding
                entriesToInsert = [];
            }
        }

        // If operations were queued (e.g. due to rapid load factor increase and standby not ready), process them.
        if (this._operationQueue.length > 0) {
            logger.info(`refresh: Processing ${this._operationQueue.length} operations queued during refresh.`);
            await this._processQueuedOperations();
        }

        // Wait for any ongoing swap to complete if triggered by insertMany
        while (this._isSwapping) {
            logger.info(`refresh: Waiting for ongoing swap to complete for ${this._currentIndexPath}.`);
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        logger.info(`Hash index ${this._currentIndexPath} refreshed. Final entry count: ${this._totalNumberOfEntries}.`);
    }

    async unequal(_value) {
        logger.error("unequal is not implemented for FileSystemHashIndex.");
        throw DatabaseError.NOT_IMPLEMENTED;
    }

    async unequalColumn(_columnName) {
        logger.error("unequalColumn is not implemented for FileSystemHashIndex.");
        throw DatabaseError.NOT_IMPLEMENTED;
    }
}

module.exports = FileSystemHashIndex;
