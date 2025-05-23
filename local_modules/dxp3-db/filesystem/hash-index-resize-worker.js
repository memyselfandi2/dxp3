/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-db
 *
 * NAME
 * Hash Index Resize Worker
 *
 * DESCRIPTION
 * This worker thread handles the resizing of a FileSystemHashIndex.
 * It reads entries from an existing index file, re-hashes them into a new
 * temporary index file with a larger number of buckets, and then signals
 * the main thread upon completion or error.
 */
const { parentPort, workerData } = require('worker_threads');
const path = require('path');
const fs = require('fs').promises; // Used by RecordFile, but not directly here usually
const RecordFile = require('./RecordFile');
const DatabaseHash = require('../DatabaseHash');

// These constants should be consistent with FileSystemHashIndex.js
const BUCKET_START_INDEX = 1;
const MAX_ENTRIES_PER_RECORD = 6;

let stopWorker = false; // Flag to signal cancellation
let currentOutputTempPath = null; // Path being written to by the worker
let sourceCopyPath = null; // Path to the copy of the source index

let workerTempIndexFile = null;
let workerOriginalIndexFile = null;

/**
 * Prepares a new hash index by rehashing an existing one and then keeps it updated.
 * @param {string} sourceDataIndexPath - Path to the current live hash index file (to be copied and rehashed).
 * @param {number} newNumBuckets - The new number of buckets for the resized index.
 * @param {number} recordLength - The length of each record in the index file.
 * @param {number} loadFactorThreshold - The load factor threshold for the index.
 * @param {string} outputTempPath - The path where the worker should build the new index.
 */
async function prepareAndMaintainIndex(sourceFolder, sourceDataIndexPath, newNumBuckets, recordLength, loadFactorThreshold, outputTempPath) {
    currentOutputTempPath = outputTempPath; // Store for cleanup
    sourceCopyPath = path.join(sourceFolder, 'worker_source_copy_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7) + '.hdx');

    let tempEntryCount = 0;
    // Cache for the temporary index file being built.
    // Key: temp bucket header index (number)
    // Value: Array of record objects: { data: object, diskIndex: number | null, isDirty: boolean }
    const tempFileCache = new Map();

    // console.log(`[Worker] Starting prepareAndMaintainIndex. Source: ${sourceDataIndexPath}, New buckets: ${newNumBuckets}, Output: ${currentOutputTempPath}`);

    try {
        if (stopWorker) {
            console.log('[Worker] Worker cancelled before starting file operations.');
            parentPort.postMessage({ status: 'cancelled', message: 'Worker cancelled by main thread early.', tempPath: currentOutputTempPath });
            return;
        }
        // 0. Copy the source index file and open it for reading
        console.log(`[Worker] Copying ${sourceDataIndexPath} to ${sourceCopyPath}`);
    console.log('0');
    console.log('sourceCopyPath: ' + sourceCopyPath);
        await fs.copyFile(sourceDataIndexPath, sourceCopyPath);
        if (stopWorker) { // Check before long loop
            throw new Error("Worker cancelled during initialization.");
        }
        workerOriginalIndexFile = new RecordFile(sourceCopyPath, recordLength);
        await workerOriginalIndexFile.open();
        const originalHeader = await workerOriginalIndexFile.readRecord(0);
        if (!originalHeader) {
            // If the source is a brand new empty file, it might only have a basic header.
            // This is acceptable if it's an initial build from an empty source.
            if (await workerOriginalIndexFile.getNumberOfRecords() === 0 && await workerOriginalIndexFile.getTotalNumberOfRecords() === 0) {
                console.log('[Worker] Source index file appears to be new or empty. Proceeding with empty source.');
                originalHeader = { numberOfBuckets: 0, numberOfEntries: 0 }; // Simulate empty header
            } else {
                throw new Error("Failed to read header from source index file copy.");
            }
        }
        const oldNumBuckets = originalHeader.numberOfBuckets;
        const originalTotalEntries = originalHeader.numberOfEntries;
        console.log(`[Worker] Source index (copy) stats - Buckets: ${oldNumBuckets}, Entries: ${originalTotalEntries}`);

        // 1. Create and initialize the temporary index file
        workerTempIndexFile = new RecordFile(currentOutputTempPath, recordLength);
        await workerTempIndexFile.open();
        await workerTempIndexFile.clear(); // Ensure it's empty and header space is allocated

        const tempHeader = {
            numberOfBuckets: newNumBuckets,
            numberOfEntries: 0, // Will be updated at the end
            loadFactorThreshold: loadFactorThreshold,
        };
        await workerTempIndexFile.appendRecord(tempHeader);

        console.log(`[Worker] Initializing ${newNumBuckets} empty buckets in temporary file.`);
        const emptyBucketRecord = { entries: [], nextEntryIndex: null };
        let bucketBatch = [];
        const batchSize = 1000;
        if (stopWorker) { // Check before long loop
            throw new Error("Worker cancelled during initialization.");
        }

        for (let i = 0; i < newNumBuckets; i++) {
            bucketBatch.push(emptyBucketRecord);
            if (bucketBatch.length >= batchSize || i === (newNumBuckets - 1)) {
                await workerTempIndexFile.appendRecords(bucketBatch);
                bucketBatch = [];
            }
        }
        if (stopWorker) { // Check after long loop
            throw new Error("Worker cancelled after bucket initialization.");
        }

        console.log(`[Worker] Finished initializing empty buckets.`);

        // 2. Iterate through original file and re-insert entries into the temp file
        console.log(`[Worker] Reading entries from source index (copy) and rehashing into temporary index file...`);

        if (oldNumBuckets > 0) { // Only rehash if the source had buckets
            for (let oldBucketIdx = 0; oldBucketIdx < oldNumBuckets; oldBucketIdx++) {
                const oldBucketHeaderIndex = BUCKET_START_INDEX + oldBucketIdx;
                if (stopWorker) { // Check inside the main loop
                    throw new Error("Worker cancelled during entry rehashing.");
                }

                let currentOldRecordIndex = oldBucketHeaderIndex;
                let currentOldRecord = await workerOriginalIndexFile.readRecord(currentOldRecordIndex);

                while (currentOldRecord !== null && currentOldRecordIndex !== null) {
                    if (currentOldRecord.entries && currentOldRecord.entries.length > 0) {
                        for (const entry of currentOldRecord.entries) {
                            if (entry.key === undefined || entry.key === null) {
                                console.warn(`[Worker] Skipping invalid entry in source index (copy): ${JSON.stringify(entry)}`);
                                continue;
                            }

                            const tempBucketIndex = Math.abs(DatabaseHash.new(entry.key) % newNumBuckets);
                            const tempBucketHeaderIndex = BUCKET_START_INDEX + tempBucketIndex;

                            // --- Logic to insert into temp file's bucket chain (via cache) ---
                            if (!tempFileCache.has(tempBucketHeaderIndex)) {
                                const bucketHeaderRecordData = await workerTempIndexFile.readRecord(tempBucketHeaderIndex);
                                if (!bucketHeaderRecordData) {
                                    throw new Error(`[Worker] Failed to read bucket header ${tempBucketHeaderIndex} from temp file.`);
                                }
                                tempFileCache.set(tempBucketHeaderIndex, [{ data: bucketHeaderRecordData, diskIndex: tempBucketHeaderIndex, isDirty: false }]);
                            }

                            const bucketChain = tempFileCache.get(tempBucketHeaderIndex);
                            let insertedInTemp = false;

                            for (let i = 0; i < bucketChain.length; i++) {
                                const chainNode = bucketChain[i];
                                if (!chainNode.data.entries) chainNode.data.entries = [];

                                if (chainNode.data.entries.length < MAX_ENTRIES_PER_RECORD) {
                                    chainNode.data.entries.push({ key: entry.key, value: entry.value });
                                    chainNode.isDirty = true;
                                    insertedInTemp = true;
                                    tempEntryCount++;
                                    break;
                                }

                                if (i === bucketChain.length - 1) { // Last record in cached chain is full
                                    const newChainNodeData = {
                                        entries: [{ key: entry.key, value: entry.value }],
                                        nextEntryIndex: null
                                    };
                                    const newCachedNode = { data: newChainNodeData, diskIndex: null, isDirty: true };
                                    bucketChain.push(newCachedNode);
                                    chainNode.isDirty = true; // Previous node needs nextEntryIndex updated
                                    insertedInTemp = true;
                                    tempEntryCount++;
                                    break;
                                }
                            }

                            if (!insertedInTemp) {
                                console.error(`[Worker] CRITICAL: Failed to insert entry for key ${entry.key} into temporary index. This should not happen.`);
                                throw new Error("Failed to insert entry into cached bucket chain.");
                            }
                            // --- End logic to insert into temp file (via cache) ---
                        } // End loop through entries in the current old record
                    } // End if old record has entries

                    const nextOldIndex = currentOldRecord.nextEntryIndex;
                    currentOldRecordIndex = (nextOldIndex !== null) ? nextOldIndex : null;
                    currentOldRecord = (currentOldRecordIndex !== null) ? await workerOriginalIndexFile.readRecord(currentOldRecordIndex) : null;
                } // End while loop (traversing a single old bucket's chain)
            } // End for loop (iterating through all old buckets)
        } else {
            console.log(`[Worker] Source index has no buckets or entries to rehash.`);
        }

        console.log(`[Worker] Rehashed ${tempEntryCount} entries into temporary index cache.`);

        // 3. Flush the cache to disk
        console.log(`[Worker] Flushing temporary index cache to disk...`);
        if (stopWorker) throw new Error("Worker cancelled before cache flush.");

        const newRecordsToAppendData = [];
        const newRecordsToAppendCacheRef = [];

        for (const chain of tempFileCache.values()) {
            for (const node of chain) {
                if (node.diskIndex === null && node.isDirty) { // New and dirty (i.e., has content)
                    newRecordsToAppendData.push(node.data);
                    newRecordsToAppendCacheRef.push(node);
                }
            }
        }

        if (newRecordsToAppendData.length > 0) {
            console.log(`[Worker] Batch appending ${newRecordsToAppendData.length} new records.`);
            if (stopWorker) throw new Error("Worker cancelled during batch append phase.");
            const appendedIndices = await workerTempIndexFile.appendRecords(newRecordsToAppendData);
            for (let i = 0; i < appendedIndices.length; i++) {
                newRecordsToAppendCacheRef[i].diskIndex = appendedIndices[i];
                // It's now on disk, but isDirty remains true if its content was set.
            }
        }

        console.log(`[Worker] Linking records in cache and marking for update...`);
        if (stopWorker) throw new Error("Worker cancelled during linking phase.");
        for (const chain of tempFileCache.values()) {
            let previousNode = null;
            for (const node of chain) {
                if (previousNode) {
                    // Ensure previousNode.data.nextEntryIndex points to current node's diskIndex
                    if (node.diskIndex === null) throw new Error("[Worker] Encountered node with null diskIndex after append phase.");
                    if (previousNode.data.nextEntryIndex !== node.diskIndex) {
                        previousNode.data.nextEntryIndex = node.diskIndex;
                        previousNode.isDirty = true;
                    }
                }
                previousNode = node;
            }
        }

        console.log(`[Worker] Updating dirty records in temporary index...`);
        if (stopWorker) throw new Error("Worker cancelled during update phase.");
        for (const chain of tempFileCache.values()) {
            for (const node of chain) {
                if (node.isDirty) {
                    if (node.diskIndex === null) throw new Error("[Worker] Dirty node with null diskIndex found during update phase.");
                    await workerTempIndexFile.updateRecord(node.diskIndex, node.data);
                    node.isDirty = false;
                }
            }
        }
        // 4. Update and write the final header to the temporary file
        tempHeader.numberOfEntries = tempEntryCount;
        await workerTempIndexFile.updateRecord(0, tempHeader);
        console.log(`[Worker] Final header written to temporary file.`);

        // Initial build complete, ready for live updates.
        parentPort.postMessage({ status: 'readyForLiveUpdates', tempPath: currentOutputTempPath });

        // Clean up the source copy now that rehash is done
        if (workerOriginalIndexFile) {
            await workerOriginalIndexFile.close();
            workerOriginalIndexFile = null;
        }
        if (sourceCopyPath) {
            await fs.unlink(sourceCopyPath);
            console.log(`[Worker] Cleaned up source copy ${sourceCopyPath}.`);
            sourceCopyPath = null;
        }

        // Worker now stays alive to apply operations until finalized or stopped.
        // The actual application of operations will be handled in the 'message' listener.

    } catch (error) {
        console.error('[Worker] Error during prepareAndMaintainIndex operation:', error.stack || error);
        if (stopWorker && error.message.includes("Worker cancelled")) {
            // This is an expected cancellation
            parentPort.postMessage({ status: 'cancelled', message: error.message, tempPath: currentOutputTempPath });
        } else {
            parentPort.postMessage({ status: 'error', message: error.message, stack: error.stack, tempPath: currentOutputTempPath });
        }
    } finally {
        console.log(`[Worker] Initial build phase finished. Cleaning up initial build resources.`);
        // workerTempIndexFile remains open if successful, for subsequent operations.
        // workerOriginalIndexFile and sourceCopyPath should be cleaned up if initial build succeeded or failed.
        if (workerOriginalIndexFile) {
            try {
                await workerOriginalIndexFile.close();
                console.log(`[Worker] Closed source index file (copy) in finally.`);
            } catch (e) {
                console.error('[Worker] Error closing source index file (copy) in finally:', e.stack || e);
            }
            workerOriginalIndexFile = null;
        }
        if (sourceCopyPath) { // If it still exists (e.g. error before explicit cleanup)
            try {
                await fs.access(sourceCopyPath);
                await fs.unlink(sourceCopyPath);
                console.log(`[Worker] Cleaned up source copy ${sourceCopyPath} in finally block.`);
            } catch (e) {
                if (e.code !== 'ENOENT') console.warn(`[Worker] Could not delete source copy ${sourceCopyPath} in finally: ${e.message}`);
            }
            sourceCopyPath = null;
        }

        // If the worker is stopping or an error occurred that prevents further operation,
        // close and delete the output temp file.
        if (stopWorker || (parentPort && parentPort.listenerCount('message') === 0)) { // Heuristic for error/stop
            await cleanupWorkerResources();
        }
    }
}

/**
 * Helper to get bucket index within the worker's temporary index.
 * @param {any} key The key to hash.
 * @param {number} numBuckets The number of buckets in the worker's temporary index.
 * @returns {number} The bucket index.
 */
function _getWorkerBucketIndex(key, numBuckets) {
    if (numBuckets === 0) {
        console.error("[Worker] _getWorkerBucketIndex: numBuckets is 0. Worker index might be uninitialized.");
        throw new Error("Worker index is not properly initialized: number of buckets is zero.");
    }
    const hash = DatabaseHash.new(key);
    return Math.abs(hash % numBuckets);
}

/**
 * Helper to get the record index of a bucket header in the worker's temporary index.
 * @param {number} bucketIndex The bucket index.
 * @returns {number} The record index for the bucket header.
 */
function _getWorkerBucketHeaderRecordIndex(bucketIndex) {
    return BUCKET_START_INDEX + bucketIndex;
}

/**
 * Directly inserts an entry into the worker's temporary index file.
 * Mirrors the logic of FileSystemHashIndex._directInsert.
 * @param {any} key The key to insert.
 * @param {any} dataFileRecordIndex The value (data file record index).
 * @param {RecordFile} tempIndexFile The worker's temporary RecordFile instance.
 * @param {number} numBucketsInTemp The number of buckets in the temporary index.
 * @returns {Promise<boolean>} True if a new entry was added, false otherwise.
 */
async function _workerDirectInsert(key, dataFileRecordIndex, tempIndexFile, numBucketsInTemp) {
    if (key === undefined || key === null) {
        console.warn("[Worker] _workerDirectInsert: Attempted to insert null or undefined key. Skipping.");
        return false;
    }

    const bucketIndex = _getWorkerBucketIndex(key, numBucketsInTemp);
    let currentRecordIndex = _getWorkerBucketHeaderRecordIndex(bucketIndex);
    let currentRecord = await tempIndexFile.readRecord(currentRecordIndex);

    if (!currentRecord) {
        console.error(`[Worker] _workerDirectInsert: Bucket header record at index ${currentRecordIndex} for bucket ${bucketIndex} is null.`);
        throw new Error(`[Worker] Corrupt state: Bucket header ${currentRecordIndex} missing in temp index.`);
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
                    currentRecord.entries[i].value = dataFileRecordIndex;
                    await tempIndexFile.updateRecord(currentRecordIndex, currentRecord);
                }
                entryFound = true;
                break;
            }
        }
        if (entryFound) break;

        if (currentRecord.entries.length < MAX_ENTRIES_PER_RECORD) {
            currentRecord.entries.push({ key: key, value: dataFileRecordIndex });
            await tempIndexFile.updateRecord(currentRecordIndex, currentRecord);
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
            currentRecord = await tempIndexFile.readRecord(currentRecordIndex);
        }
    }

    if (!entryFound) {
        if (!recordToUpdate) { // Should point to the last record in the chain, or the header if chain was empty/full
             recordToUpdate = await tempIndexFile.readRecord(_getWorkerBucketHeaderRecordIndex(bucketIndex));
             indexToUpdate = _getWorkerBucketHeaderRecordIndex(bucketIndex);
             if (!recordToUpdate) {
                console.error(`[Worker] _workerDirectInsert: CRITICAL - Bucket header for key ${key} is still null. Cannot append new record.`);
                throw new Error(`[Worker] Corrupt state: Bucket header for key ${key} missing during append in temp index.`);
             }
        }
        const newEntryRecord = {
            entries: [{ key: key, value: dataFileRecordIndex }],
            nextEntryIndex: null
        };
        const newRecordIndex = await tempIndexFile.appendRecord(newEntryRecord);
        recordToUpdate.nextEntryIndex = newRecordIndex;
        await tempIndexFile.updateRecord(indexToUpdate, recordToUpdate);
        addedNewEntry = true;
    }
    return addedNewEntry;
}

/**
 * Directly deletes an entry from the worker's temporary index file.
 * Mirrors the logic of FileSystemHashIndex._directDelete.
 * @param {any} key The key to delete.
 * @param {RecordFile} tempIndexFile The worker's temporary RecordFile instance.
 * @param {number} numBucketsInTemp The number of buckets in the temporary index.
 * @returns {Promise<boolean>} True if an entry was deleted, false otherwise.
 */
async function _workerDirectDelete(key, tempIndexFile, numBucketsInTemp) {
    if (key === undefined || key === null) {
        console.warn("[Worker] _workerDirectDelete: Attempted to delete null or undefined key. Skipping.");
        return false;
    }
    const bucketIndex = _getWorkerBucketIndex(key, numBucketsInTemp);
    let currentRecordIndex = _getWorkerBucketHeaderRecordIndex(bucketIndex);
    let currentRecord = await tempIndexFile.readRecord(currentRecordIndex);
    let deleted = false;

    while (currentRecord !== null) {
        if (currentRecord.entries) {
            const initialLength = currentRecord.entries.length;
            currentRecord.entries = currentRecord.entries.filter(entry => entry.key !== key);

            if (currentRecord.entries.length < initialLength) {
                await tempIndexFile.updateRecord(currentRecordIndex, currentRecord);
                deleted = true;
                break;
            }
        }
        currentRecordIndex = currentRecord.nextEntryIndex;
        if (currentRecordIndex !== null) {
            currentRecord = await tempIndexFile.readRecord(currentRecordIndex);
        } else {
            currentRecord = null;
        }
    }
    return deleted;
}

/**
 * Directly inserts multiple entries into the worker's temporary index file.
 * Mirrors the logic of FileSystemHashIndex._directInsertMany.
 * @param {Array<object>} entries An array of {key, value} objects to insert.
 * @param {RecordFile} tempIndexFile The worker's temporary RecordFile instance.
 * @param {number} numBucketsInTemp The number of buckets in the temporary index.
 * @returns {Promise<number>} The number of new entries actually added.
 */
async function _workerDirectInsertMany(entries, tempIndexFile, numBucketsInTemp) {
    if (!entries || entries.length === 0) {
        // console.debug("[Worker] _workerDirectInsertMany: No entries provided. Skipping.");
        return 0;
    }

    const bucketsToProcess = new Map();
    for (const entry of entries) {
        if (entry.key === undefined || entry.key === null || entry.value === undefined || entry.value === null) {
            console.warn(`[Worker] _workerDirectInsertMany: Skipping invalid entry: ${JSON.stringify(entry)}`);
            continue;
        }
        const bucketIndex = _getWorkerBucketIndex(entry.key, numBucketsInTemp);
        if (!bucketsToProcess.has(bucketIndex)) {
            bucketsToProcess.set(bucketIndex, []);
        }
        bucketsToProcess.get(bucketIndex).push({ key: entry.key, value: entry.value });
    }

    if (bucketsToProcess.size === 0) {
        // console.debug("[Worker] _workerDirectInsertMany: No valid entries after filtering. Skipping.");
        return 0;
    }

    let newEntriesCount = 0;

    for (const [bucketIndex, bucketEntries] of bucketsToProcess) {
        const bucketHeaderIndex = _getWorkerBucketHeaderRecordIndex(bucketIndex);
        let entriesToInsertForThisBucket = JSON.parse(JSON.stringify(bucketEntries));
        let currentRecordIndex = bucketHeaderIndex;
        let currentRecord = await tempIndexFile.readRecord(currentRecordIndex);
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
                } else if (currentRecord.entries.length < MAX_ENTRIES_PER_RECORD) {
                    currentRecord.entries.push(entry);
                    recordUpdated = true;
                    newEntriesCount++;
                    processed = true;
                }
                if (!processed) remainingEntriesForBucket.push(entry);
            }

            if (recordUpdated) await tempIndexFile.updateRecord(currentRecordIndex, currentRecord);
            entriesToInsertForThisBucket = remainingEntriesForBucket;

            if (entriesToInsertForThisBucket.length > 0) {
                const nextIdx = currentRecord.nextEntryIndex;
                currentRecord = nextIdx !== null ? await tempIndexFile.readRecord(nextIdx) : null;
                currentRecordIndex = nextIdx;
            } else {
                currentRecord = null;
            }
        }

        while (entriesToInsertForThisBucket.length > 0) {
            const entriesForNewRecord = entriesToInsertForThisBucket.splice(0, MAX_ENTRIES_PER_RECORD);
            const newRecord = { entries: entriesForNewRecord, nextEntryIndex: null };
            const newRecordIndex = await tempIndexFile.appendRecord(newRecord);
            newEntriesCount += entriesForNewRecord.length;

            if (lastRecordInChain) {
                lastRecordInChain.nextEntryIndex = newRecordIndex;
                await tempIndexFile.updateRecord(lastRecordInChainIndex, lastRecordInChain);
            } else {
                let bucketHdr = await tempIndexFile.readRecord(bucketHeaderIndex);
                if (bucketHdr) {
                    bucketHdr.nextEntryIndex = newRecordIndex;
                    await tempIndexFile.updateRecord(bucketHeaderIndex, bucketHdr);
                } else {
                     console.error(`[Worker] _workerDirectInsertMany: CRITICAL - Bucket header for bucket ${bucketIndex} is null. Cannot link new record.`);
                     throw new Error(`[Worker] Corrupt state: Bucket header for bucket ${bucketIndex} missing during append in temp index.`);
                }
            }
            lastRecordInChain = newRecord;
            lastRecordInChainIndex = newRecordIndex;
        }
    }
    return newEntriesCount;
}

async function applyOperationToWorkerIndex(op) {
    if (!workerTempIndexFile || stopWorker) {
        console.warn(`[Worker] Cannot apply operation, worker not ready or stopping: ${JSON.stringify(op)}`);
        return;
    }
    try {
        const header = await workerTempIndexFile.readRecord(0);
        if (!header) {
            console.error("[Worker] applyOperationToWorkerIndex: Failed to read header from worker's temp index file.");
            throw new Error("Worker temp index header is missing.");
        }
        const numBucketsInTemp = header.numberOfBuckets;
        let currentTotalEntries = header.numberOfEntries;
        let entriesDelta = 0;

        if (op.type === 'insert') {
            // console.log(`[Worker] Applying insert: ${op.key}`);
            const added = await _workerDirectInsert(op.key, op.value, workerTempIndexFile, numBucketsInTemp);
            if (added) entriesDelta = 1;
        } else if (op.type === 'delete') {
            // console.log(`[Worker] Applying delete: ${op.key}`);
            const deleted = await _workerDirectDelete(op.key, workerTempIndexFile, numBucketsInTemp);
            if (deleted) entriesDelta = -1;
        } else if (op.type === 'insertMany') {
            // console.log(`[Worker] Applying insertMany: ${op.entries.length} entries`);
            // op.entries is an array of {key, value} objects from the main thread
            const newEntriesAdded = await _workerDirectInsertMany(op.entries, workerTempIndexFile, numBucketsInTemp);
            entriesDelta = newEntriesAdded;
        }

        if (entriesDelta !== 0) {
            header.numberOfEntries = currentTotalEntries + entriesDelta;
            await workerTempIndexFile.updateRecord(0, header);
            // console.log(`[Worker] Updated temp index header. New total entries: ${header.numberOfEntries}`);
        }
    } catch (error) {
        console.error(`[Worker] Error applying operation ${JSON.stringify(op)}:`, error.stack || error);
        // Signal error back to main thread. This could indicate an inconsistent standby index.
        parentPort.postMessage({
            status: 'error',
            message: `Worker error applying operation: ${error.message}`,
            tempPath: currentOutputTempPath,
            stack: error.stack
        });
        // Depending on the severity, the worker might need to stop or be restarted by the main thread.
        // For now, it will continue trying to process further operations unless explicitly stopped.
    }
}

async function finalizeWorkerIndex() {
    console.log('[Worker] Finalizing index...');
    if (workerTempIndexFile) {
        try {
            await workerTempIndexFile.close();
            console.log(`[Worker] Closed worker's temporary index file: ${currentOutputTempPath}`);
            parentPort.postMessage({ status: 'finalized', finalPath: currentOutputTempPath });
        } catch (e) {
            console.error('[Worker] Error closing worker temporary index file during finalization:', e.stack || e);
            parentPort.postMessage({ status: 'error', message: 'Error during finalization: ' + e.message, tempPath: currentOutputTempPath });
        }
    } else {
        parentPort.postMessage({ status: 'error', message: 'No temporary index file to finalize.', tempPath: currentOutputTempPath });
    }
    currentOutputTempPath = null; // Path is now managed by main thread
}

async function cleanupWorkerResources() {
    console.log('[Worker] Cleaning up worker resources...');
    stopWorker = true; // Ensure any ongoing loops break

    if (workerOriginalIndexFile) {
        try { await workerOriginalIndexFile.close(); } catch (e) { /* ignore */ }
        workerOriginalIndexFile = null;
    }
    if (sourceCopyPath) {
        try { await fs.unlink(sourceCopyPath); } catch (e) { if (e.code !== 'ENOENT') console.warn(`[Worker] Could not delete source copy ${sourceCopyPath} in cleanup: ${e.message}`); }
        sourceCopyPath = null;
    }
    if (workerTempIndexFile) {
        try {
            const pathToDelete = currentOutputTempPath; // Capture before nullifying workerTempIndexFile
            await workerTempIndexFile.close();
            if (pathToDelete) { // Only unlink if path is known and file was managed by this worker instance
                try {
                    await fs.access(pathToDelete);
                    await fs.unlink(pathToDelete);
                    console.log(`[Worker] Cleaned up temporary output file ${pathToDelete} in cleanup.`);
                } catch (e) {
                    if (e.code !== 'ENOENT') console.warn(`[Worker] Could not delete temp output file ${pathToDelete} in cleanup: ${e.message}`);
                }
            }
        } catch (e) {
            console.error('[Worker] Error closing temporary index file during cleanup:', e.stack || e);
        }
        workerTempIndexFile = null;
        currentOutputTempPath = null;
    }
}

parentPort.on('message', async (data) => {
    console.log('[Worker] Received message from main thread:', data.action);
    if (data.action === 'prepareNextIndex') {
        stopWorker = false; // Reset stop flag for new task
        prepareAndMaintainIndex(
            data.sourceFolder,
            data.currentDataIndexPath,
            data.newNumBuckets,
            data.recordLength,
            data.loadFactorThreshold,
            data.outputTempPath
        ).catch(err => {
            console.error('[Worker] Unhandled error in prepareAndMaintainIndex promise chain:', err.stack || err);
            parentPort.postMessage({ status: 'error', message: err.message || 'Unknown error in prepareAndMaintainIndex', tempPath: data.outputTempPath, stack: err.stack });
            cleanupWorkerResources();
        });
    } else if (data.action === 'applyOperation') {
        if (!stopWorker) {
            await applyOperationToWorkerIndex(data.operation);
        }
    } else if (data.action === 'finalize') {
        if (!stopWorker) {
            await finalizeWorkerIndex();
        }
    } else if (data.action === 'stopGracefully') {
        console.log('[Worker] Received stopGracefully signal from main thread.');
        stopWorker = true;
        await cleanupWorkerResources();
        parentPort.postMessage({ status: 'stopped', message: 'Worker stopped gracefully.' });
        // Optional: process.exit(0) if worker should terminate itself after cleanup
    } else {
        console.warn('[Worker] Received unknown action:', data.action);
    }
});

process.on('unhandledRejection', async (reason, promise) => {
  console.error('[Worker] Unhandled Rejection at:', promise, 'reason:', reason.stack || reason);
  parentPort.postMessage({ status: 'error', message: `Unhandled Rejection: ${reason?.message || reason}`, tempPath: currentOutputTempPath, stack: reason?.stack });
  await cleanupWorkerResources();
  process.exit(1); // Exit worker on unhandled rejection
});

process.on('uncaughtException', async (err) => {
  console.error('[Worker] Uncaught Exception:', err.stack || err);
  parentPort.postMessage({ status: 'error', message: `Uncaught Exception: ${err.message}`, tempPath: currentOutputTempPath, stack: err.stack });
  await cleanupWorkerResources();
  process.exit(1); // Exit worker on uncaught exception
});

console.log('[Worker] Worker thread started and listening for messages.');
