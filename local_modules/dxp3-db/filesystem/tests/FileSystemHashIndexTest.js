const path = require('path');
const fs = require('fs');
const fsPromises = fs.promises;

const FileSystemHashIndex = require('../FileSystemHashIndex');
const RecordFile = require('../RecordFile');
const DatabaseError = require('../../DatabaseError');
const DatabaseHash = require('../../DatabaseHash'); // Assuming DatabaseHash is accessible
const logging = require('dxp3-logging');

const logger = logging.getLogger('test');
// --- Mock Dependencies ---

// // Simple mock logger (can be expanded if needed)
// const logger = {
//     trace: (...args) => console.log('TRACE:', ...args),
//     debug: (...args) => console.log('DEBUG:', ...args),
//     info: (...args) => console.log('INFO:', ...args),
//     warn: (...args) => console.warn('WARN:', ...args),
//     error: (...args) => console.error('ERROR:', ...args),
//     getLogger: () => logger, // Return itself for nested calls
// };

// // Mock dxp3-logging
// const mockLogging = {
//     getLogger: () => logger,
// };
// Inject mock logger if FileSystemHashIndex requires it directly
// (Adjust based on actual usage in FileSystemHashIndex)
// FileSystemHashIndex.__setLogger(logger); // Example if a setter exists

// Mock Table
class MockTable {
    constructor(uuid, name, columns = []) {
        this._uuid = uuid;
        this._name = name;
        this._columns = columns;
        this._columnMap = new Map(columns.map(c => [c.getUUID(), c]));
    }
    getUUID() {
        return this._uuid;
    }
    getColumnByUUID(uuid) {
        return this._columnMap.get(uuid);
    }
    // Add other methods if FileSystemHashIndex calls them
}

// Mock Column
class MockColumn {
    constructor(uuid, name, type) {
        this._uuid = uuid;
        this._name = name;
        this._type = type;
    }
    getUUID() {
        return this._uuid;
    }
    getName() {
        return this._name;
    }
    getType() {
        return this._type;
    }
    // Add other methods if needed
}

// Mock ColumnType (very basic)
class MockColumnType {
    constructor(typeName) {
        this._typeName = typeName;
    }
    getName() {
        return this._typeName;
    }
    // Add other methods if needed
}


// --- Test Setup ---

const TEST_DIR = path.join('C:\\Temp\\', 'hash_index_test_temp2');
const DB_UUID = 'test-db-uuid';
const TABLE_UUID = 'test-table-uuid';
const INDEX_UUID = 'test-index-uuid';
const COLUMN_UUID = 'test-column-uuid';
const TABLE_NAME = 'test_table';
const INDEX_NAME = 'test_index';
const COLUMN_NAME = '_uuid'; // Indexing the _uuid column for simplicity
const LARGE_NUM_RECORDS = 100000; // For the large insert test
const DEFAULT_INITIAL_BUCKETS = 1024; // From FileSystemHashIndex.js

const DATA_FILE_PATH = path.join(TEST_DIR, `${TABLE_UUID}.def`);
const INDEX_FILE_PATH = path.join(TEST_DIR, `${INDEX_UUID}.hdx`);

const DATA_RECORD_LENGTH = 257; // Match FileSystemTable
const INDEX_RECORD_LENGTH = 512; // Match FileSystemHashIndex BUCKET_RECORD_LENGTH

let dataFile;
let mockTable;
let hashIndex;

async function setup() {
    try {
        await fsPromises.rm(TEST_DIR, { recursive: true, force: true });
    } catch (err) {
        // Ignore errors if directory doesn't exist
    }
    await fsPromises.mkdir(TEST_DIR, { recursive: true });

    dataFile = new RecordFile(DATA_FILE_PATH, DATA_RECORD_LENGTH);
    await dataFile.open(); // Creates the file if it doesn't exist

    const mockColumn = new MockColumn(COLUMN_UUID, COLUMN_NAME, new MockColumnType('STRING'));
    mockTable = new MockTable(TABLE_UUID, TABLE_NAME, [mockColumn]);

    hashIndex = new FileSystemHashIndex(TEST_DIR, INDEX_UUID, INDEX_NAME, mockTable, COLUMN_UUID, dataFile);
    // Manually inject logger if needed and not handled by require cache manipulation
    // hashIndex.logger = logger; // Or however logging is accessed internally
}

async function teardown() {
    if (hashIndex) {
        await hashIndex.close();
    }
    if (dataFile) {
        await dataFile.close();
    }
    try {
        await fsPromises.rm(TEST_DIR, { recursive: true, force: true });
    } catch (err) {
        console.error("Error during teardown:", err);
    }
    dataFile = null;
    hashIndex = null;
    mockTable = null;
}

// --- Assertion Helpers ---

let testCount = 0;
let passCount = 0;
let failCount = 0;

function logTestStart(name) {
    testCount++;
    console.log(`\n--- Running test ${testCount}: ${name} ---`);
}

function logResult(passed, message = '', error = null) {
    if (passed) {
        passCount++;
        console.log(`✅ PASSED: ${message}`);
    } else {
        failCount++;
        console.error(`❌ FAILED: ${message}`);
        if (error) {
            console.error(error.stack || error);
        }
    }
}

async function assertEqual(actual, expected, message) {
    const condition = actual === expected;
    logResult(condition, `${message} (Expected: ${expected}, Actual: ${actual})`);
    if (!condition) throw new Error(`Assertion failed: ${message}`); // Stop test on failure
}

async function assertNotEqual(actual, expected, message) {
    const condition = actual !== expected;
    logResult(condition, `${message} (Expected not: ${expected}, Actual: ${actual})`);
     if (!condition) throw new Error(`Assertion failed: ${message}`);
}

async function assertDeepEqual(actual, expected, message) {
    const actualJson = JSON.stringify(actual);
    const expectedJson = JSON.stringify(expected);
    const condition = actualJson === expectedJson;
    logResult(condition, `${message} (Expected: ${expectedJson}, Actual: ${actualJson})`);
     if (!condition) throw new Error(`Assertion failed: ${message}`);
}

async function assertTrue(value, message) {
    const condition = value === true;
    logResult(condition, `${message} (Expected: true, Actual: ${value})`);
     if (!condition) throw new Error(`Assertion failed: ${message}`);
}

async function assertFalse(value, message) {
    const condition = value === false;
    logResult(condition, `${message} (Expected: false, Actual: ${value})`);
     if (!condition) throw new Error(`Assertion failed: ${message}`);
}

async function assertNull(value, message) {
    const condition = value === null;
    logResult(condition, `${message} (Expected: null, Actual: ${value})`);
     if (!condition) throw new Error(`Assertion failed: ${message}`);
}

async function assertEmptyArray(value, message) {
    const condition = (Array.isArray(value) && (value.length <= 0));
    logResult(condition, `${message} (Expected: empty array, Actual: ${JSON.stringify(value)})`);
     if (!condition) throw new Error(`Assertion failed: ${message}`);
}

async function assertNotNull(value, message) {
    const condition = value !== null;
    logResult(condition, `${message} (Expected not null, Actual: ${value})`);
     if (!condition) throw new Error(`Assertion failed: ${message}`);
}

async function assertUndefined(value, message) {
    const condition = value === undefined;
    logResult(condition, `${message} (Expected: undefined, Actual: ${value})`);
     if (!condition) throw new Error(`Assertion failed: ${message}`);
}

async function assertNotUndefined(value, message) {
    const condition = value !== undefined;
    logResult(condition, `${message} (Expected not undefined, Actual: ${value})`);
     if (!condition) throw new Error(`Assertion failed: ${message}`);
}

async function assertFileExists(filePath, message) {
    let exists = false;
    try {
        await fsPromises.access(filePath, fs.constants.F_OK);
        exists = true;
    } catch (e) {
        exists = false;
    }
    logResult(exists, `${message} (File: ${filePath})`);
     if (!exists) throw new Error(`Assertion failed: ${message}`);
}

async function assertThrowsAsync(asyncFn, expectedErrorType, message) {
    let thrownError = null;
    try {
        await asyncFn();
    } catch (error) {
        thrownError = error;
    }
    const condition = thrownError !== null && (expectedErrorType ? thrownError instanceof expectedErrorType : true);
    logResult(condition, `${message} (Expected error: ${expectedErrorType ? expectedErrorType.name : 'any'}, Actual: ${thrownError ? thrownError.constructor.name : 'none'})`);
     if (!condition) throw new Error(`Assertion failed: ${message}`);
}

// --- Test Cases ---

async function testConstructor() {
    logTestStart("Constructor");
    await assertNotNull(hashIndex, "HashIndex object should be created");
    await assertEqual(hashIndex._sourceFolder, TEST_DIR, "Source folder should be set");
    await assertEqual(hashIndex._uuid, INDEX_UUID, "Index UUID should be set");
    await assertEqual(hashIndex._name, INDEX_NAME, "Index name should be set");
    await assertEqual(hashIndex._tableUUID, TABLE_UUID, "Table UUID should be set");
    await assertEqual(hashIndex._columnUUID, COLUMN_UUID, "Column UUID should be set");
    await assertNotNull(hashIndex._dataFile, "DataFile should be set");
    await assertNotNull(hashIndex._currentIndexFile, "Index RecordFile should be set");
    await assertEqual(hashIndex._currentIndexFile._filePath, INDEX_FILE_PATH, "Index file path should be correct");
}
/*
async function testInitNewFile() {
    logTestStart("Init - New File");
    await hashIndex.init();
    await assertFileExists(INDEX_FILE_PATH, "Index file should be created on init");

    // Check header defaults
    const header = await hashIndex._currentIndexFile.readRecord(0);
    await assertNotNull(header, "Header record should exist");
    // Default number of buckets is set during refresh called by init if file doesn't exist
    await assertEqual(header.numberOfBuckets, DEFAULT_INITIAL_BUCKETS, "Default number of buckets should be written");
    await assertEqual(header.numberOfEntries, 0, "Initial number of entries should be 0");
    await assertEqual(header.loadFactorThreshold, 0.75, "Default load factor threshold should be written");

    // Check bucket headers
    const numBuckets = header.numberOfBuckets;
    for (let i = 0; i < numBuckets; i++) {
        const bucketHeaderIndex = hashIndex._getBucketHeaderRecordIndex(i); // This method still exists and is valid
        const bucketHeader = await hashIndex._currentIndexFile.readRecord(bucketHeaderIndex);
        await assertNotNull(bucketHeader, `Bucket header ${i} should exist`);
        await assertNull(bucketHeader.nextEntryIndex, `Bucket header ${i} nextEntryIndex should be null`);
    }
}

async function testInitExistingFile() {
    logTestStart("Init - Existing File");
    // 1. Manually create and populate an index file
    const initialBuckets = 8;
    const initialEntries = 5;
    const initialThreshold = 0.8;

    const existingIndexFile = new RecordFile(INDEX_FILE_PATH, INDEX_RECORD_LENGTH);
    await existingIndexFile.open();
    await existingIndexFile.appendRecord({ // Header at index 0
        numberOfBuckets: initialBuckets,
        numberOfEntries: initialEntries,
        loadFactorThreshold: initialThreshold,
    });
    for (let i = 0; i < initialBuckets; i++) { // Bucket headers
        await existingIndexFile.appendRecord({ entries: [], nextEntryIndex: i === 0 ? 99 : null }); // Dummy value for first bucket
    }
    await existingIndexFile.close(); // Close it before hashIndex tries to open it

    // 2. Initialize the hashIndex - it should read the existing file
    await hashIndex.init();

    // 3. Verify the properties were read correctly
    await assertEqual(hashIndex._currentNumberOfBuckets, initialBuckets, "Number of buckets should be read from existing file");
    await assertEqual(hashIndex._totalNumberOfEntries, initialEntries, "Number of entries should be read from existing file");
    await assertEqual(hashIndex._loadFactorThreshold, initialThreshold, "Load factor threshold should be read from existing file");
}
*/
async function testInsertAndEqual() {
    logTestStart("Insert and Equal");
    await hashIndex.init();

    const record1 = { _uuid: "uuid-1", data: "value1" };
    const record2 = { _uuid: "uuid-2", data: "value2" };
    const record3 = { _uuid: "uuid-3", data: "value3" }; // Collision with uuid-1 if buckets=2

    const index1 = await dataFile.appendRecord(record1);
    const index2 = await dataFile.appendRecord(record2);
    const index3 = await dataFile.appendRecord(record3);

    await hashIndex.insert(record1._uuid, index1);
    await hashIndex.insert(record2._uuid, index2);
    await hashIndex.insert(record3._uuid, index3); // Potential collision

    await assertEqual(hashIndex._totalNumberOfEntries, 3, "Total entries should be 3 after inserts");

    const found1 = (await hashIndex.equal(record1._uuid))[0];
    await assertNotNull(found1, "Record 1 should be found");
    await assertDeepEqual(found1, { ...record1, _index: index1 }, "Found record 1 data should match");

    const found2 = (await hashIndex.equal(record2._uuid))[0];
    await assertNotNull(found2, "Record 2 should be found");
    await assertDeepEqual(found2, { ...record2, _index: index2 }, "Found record 2 data should match");

    const found3 = (await hashIndex.equal(record3._uuid))[0];
    await assertNotNull(found3, "Record 3 should be found (collision handled)");
    await assertDeepEqual(found3, { ...record3, _index: index3 }, "Found record 3 data should match");

    // Check header entry count
    const header = await hashIndex._currentIndexFile.readRecord(0);
    await assertEqual(header.numberOfEntries, 3, "Header entry count should be updated");
}

async function testEqualNotFound() {
    logTestStart("Equal - Not Found");
    await hashIndex.init();
    const record1 = { _uuid: "uuid-1", data: "value1" };
    const index1 = await dataFile.appendRecord(record1);
    await hashIndex.insert(record1._uuid, index1);

    const found = await hashIndex.equal("non-existent-uuid");
    await assertEmptyArray(found, "Should return an empty array for a non-existent key");
}

async function testInsertDuplicateKey() {
    logTestStart("Insert - Duplicate Key (Update)");
    await hashIndex.init();

    const record1a = { _uuid: "uuid-1", data: "value1a" };
    const record1b = { _uuid: "uuid-1", data: "value1b" }; // Same key

    const index1a = await dataFile.appendRecord(record1a);
    const index1b = await dataFile.appendRecord(record1b);

    await hashIndex.insert(record1a._uuid, index1a);
    let found = (await hashIndex.equal(record1a._uuid))[0];
    await assertNotNull(found, "Record 1a should be found initially");
    await assertDeepEqual(found, { ...record1a, _index: index1a }, "Initial record 1a data should match");
    await assertEqual(hashIndex._totalNumberOfEntries, 1, "Total entries should be 1");

    // Insert with the same key - should update
    await hashIndex.insert(record1b._uuid, index1b);
    found = (await hashIndex.equal(record1a._uuid))[0]; // Use original key to find
    await assertNotNull(found, "Record 1b should be found after update");
    await assertDeepEqual(found, { ...record1b, _index: index1b }, "Updated record 1b data should match");
    await assertEqual(hashIndex._totalNumberOfEntries, 1, "Total entries should still be 1 after update");

    // Check header entry count
    const header = await hashIndex._currentIndexFile.readRecord(0);
    await assertEqual(header.numberOfEntries, 1, "Header entry count should be 1 after update");
}

async function testDelete() {
    logTestStart("Delete");
    await hashIndex.init();

    const record1 = { _uuid: "uuid-1", data: "value1" };
    const record2 = { _uuid: "uuid-2", data: "value2" }; // Collision with uuid-1 if buckets=1
    const record3 = { _uuid: "uuid-3", data: "value3" };

    const index1 = await dataFile.appendRecord(record1);
    const index2 = await dataFile.appendRecord(record2);
    const index3 = await dataFile.appendRecord(record3);

    await hashIndex.insert(record1._uuid, index1);
    await hashIndex.insert(record2._uuid, index2);
    await hashIndex.insert(record3._uuid, index3);

    await assertEqual(hashIndex._totalNumberOfEntries, 3, "Entries should be 3 before delete");

    // Delete record 2 (potentially middle of a chain)
    await hashIndex.delete(record2._uuid);
    await assertEmptyArray(await hashIndex.equal(record2._uuid), "Record 2 should not be found after delete");
    await assertEqual(hashIndex._totalNumberOfEntries, 2, "Entries should be 2 after deleting record 2");
    await assertNotNull((await hashIndex.equal(record1._uuid))[0], "Record 1 should still exist");
    await assertNotNull((await hashIndex.equal(record3._uuid))[0], "Record 3 should still exist");

    // Delete record 1 (potentially head of a chain)
    await hashIndex.delete(record1._uuid);
    await assertEmptyArray(await hashIndex.equal(record1._uuid), "Record 1 should not be found after delete");
    await assertEqual(hashIndex._totalNumberOfEntries, 1, "Entries should be 1 after deleting record 1");
    await assertNotNull((await hashIndex.equal(record3._uuid))[0], "Record 3 should still exist");

    // Delete record 3 (last one)
    await hashIndex.delete(record3._uuid);
    await assertEmptyArray(await hashIndex.equal(record3._uuid), "Record 3 should not be found after delete");
    await assertEqual(hashIndex._totalNumberOfEntries, 0, "Entries should be 0 after deleting record 3");

    // Check header entry count
    const header = await hashIndex._currentIndexFile.readRecord(0);
    await assertEqual(header.numberOfEntries, 0, "Header entry count should be 0 after deletes");
}

async function testDeleteNotFound() {
    logTestStart("Delete - Not Found");
    await hashIndex.init();
    const record1 = { _uuid: "uuid-1", data: "value1" };
    const index1 = await dataFile.appendRecord(record1);
    await hashIndex.insert(record1._uuid, index1);

    await assertEqual(hashIndex._totalNumberOfEntries, 1, "Entries should be 1 before delete");
    await hashIndex.delete("non-existent-uuid"); // Should not throw error
    await assertEqual(hashIndex._totalNumberOfEntries, 1, "Entries should still be 1 after trying to delete non-existent key");
    await assertNotNull((await hashIndex.equal(record1._uuid))[0], "Record 1 should still exist");
}

async function testClear() {
    logTestStart("Clear");
    await hashIndex.init();

    const record1 = { _uuid: "uuid-1", data: "value1" };
    const record2 = { _uuid: "uuid-2", data: "value2" };
    const index1 = await dataFile.appendRecord(record1);
    const index2 = await dataFile.appendRecord(record2);
    await hashIndex.insert(record1._uuid, index1);
    await hashIndex.insert(record2._uuid, index2);

    await assertEqual(hashIndex._totalNumberOfEntries, 2, "Entries should be 2 before clear");

    await hashIndex.clear();

    await assertEqual(hashIndex._totalNumberOfEntries, 0, "Entries should be 0 after clear");
    await assertEqual(hashIndex._currentNumberOfBuckets, DEFAULT_INITIAL_BUCKETS, "Buckets should reset to default after clear");
    await assertEmptyArray(await hashIndex.equal(record1._uuid), "Record 1 should not be found after clear");
    await assertEmptyArray(await hashIndex.equal(record2._uuid), "Record 2 should not be found after clear");

    // Verify file structure reset
    const header = await hashIndex._currentIndexFile.readRecord(0);
    await assertEqual(header.numberOfBuckets, DEFAULT_INITIAL_BUCKETS, "Header buckets should be reset");
    await assertEqual(header.numberOfEntries, 0, "Header entries should be 0");
    const bucketHeader0 = await hashIndex._currentIndexFile.readRecord(hashIndex._getBucketHeaderRecordIndex(0));
    await assertNull(bucketHeader0.nextEntryIndex, "Next bucket header should be reset");
}

async function testResize() {
    logTestStart("Resize");
    await hashIndex.init(); // Starts with DEFAULT_NUMBER_OF_BUCKETS buckets, threshold 0.75

    const initialBuckets = hashIndex._currentNumberOfBuckets;
    const loadFactor = hashIndex._loadFactorThreshold;
    const numToInsert = Math.ceil(initialBuckets * loadFactor) + 1;
    const records = [];

    for (let i = 0; i < numToInsert; i++) {
        const record = { _uuid: `uuid-${i}`, data: `value${i}` };
        records.push(record);
    }
    // Use appendRecords for potentially faster data file population, though not strictly necessary for index logic
    const indices = await dataFile.appendRecords(records);

    // Insert records one by one to trigger resize check
    for (let i = 0; i < numToInsert; i++) {
        await hashIndex.insert(records[i]._uuid, indices[i]);
        if (i === (numToInsert - 2)) {
             await assertEqual(hashIndex._currentNumberOfBuckets, initialBuckets, `Buckets should be ${initialBuckets} before resize (at entry ${i+1})`);
        }
    }

    // Wait for potential swap to complete
    while (hashIndex._isSwapping || hashIndex._standbyWorkerState === 'building' || hashIndex._standbyWorkerState === 'finalizing' || hashIndex._isProcessingQueue) {
        console.log(`testResize: Waiting for swap/worker. State: ${hashIndex._standbyWorkerState}, Swapping: ${hashIndex._isSwapping}, ProcessingQ: ${hashIndex._isProcessingQueue}`);
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    const expectedBucketsAfterResize = initialBuckets * 2; // Assuming doubling for the first resize from default
    await assertEqual(hashIndex._currentNumberOfBuckets, expectedBucketsAfterResize, `Buckets should be ${expectedBucketsAfterResize} after resize (was ${initialBuckets})`);
    await assertEqual(hashIndex._totalNumberOfEntries, numToInsert, `Total entries should be ${numToInsert} after resize`);

    // Verify all records are still findable after resize
    for (let i = 0; i < numToInsert; i++) {
        const found = (await hashIndex.equal(records[i]._uuid))[0];
        await assertNotNull(found, `Record ${i} should be found after resize`);
        // Ensure the record from dataFile includes its _index for proper comparison
        const expectedRecord = { ...records[i], _index: indices[i] };
        await assertDeepEqual(found, expectedRecord, `Record ${i} data should match after resize`);
    }

    // Verify header reflects the resize
    const header = await hashIndex._currentIndexFile.readRecord(0);
    await assertEqual(header.numberOfBuckets, expectedBucketsAfterResize, `Header buckets should be ${expectedBucketsAfterResize} after resize`);
    await assertEqual(header.numberOfEntries, numToInsert, "Header entries should be correct after resize");

    // Verify new bucket headers exist
     const lastBucketHeaderIndex = hashIndex._getBucketHeaderRecordIndex(expectedBucketsAfterResize - 1);
     const lastBucketHeader = await hashIndex._currentIndexFile.readRecord(lastBucketHeaderIndex);
     await assertNotNull(lastBucketHeader, `Last bucket header (index ${expectedBucketsAfterResize - 1}) should exist after resize`);
     // We can't easily assert nextEntryIndex without knowing hash distribution
}

async function testRefresh() {
    logTestStart("Refresh");
    // 1. Pre-populate data file WITHOUT adding to index initially
    const record1 = { _uuid: "uuid-1", data: "value1" };
    const record2 = { _uuid: "uuid-2", data: "value2" };
    const record3 = { _uuid: "uuid-3", data: "value3" }; // Deleted record
    const record4 = { _uuid: "uuid-4", data: "value4" };

    const index1 = await dataFile.appendRecord(record1);
    const index2 = await dataFile.appendRecord(record2);
    const index3 = await dataFile.appendRecord(record3); // Index 2
    const index4 = await dataFile.appendRecord(record4);

    await dataFile.deleteRecord(index3); // Delete record 3

    // 2. Initialize index (creates empty index file)
    await assertEqual(hashIndex._totalNumberOfEntries, 0, "Index should be empty initially");

    // 3. Call init (which internally calls refresh).
    await hashIndex.init();

    // 4. Verify index is populated correctly
    await assertEqual(hashIndex._totalNumberOfEntries, 3, "Entries should be 3 after refresh (excluding deleted)");

    const found1 = (await hashIndex.equal(record1._uuid))[0];
    await assertNotNull(found1, "Record 1 should be found after refresh");
    await assertDeepEqual(found1, { ...record1, _index: index1 }, "Record 1 data should match after refresh");

    const found2 = (await hashIndex.equal(record2._uuid))[0];
    await assertNotNull(found2, "Record 2 should be found after refresh");
    await assertDeepEqual(found2, { ...record2, _index: index2 }, "Record 2 data should match after refresh");

    const found3 = await hashIndex.equal(record3._uuid);
    await assertEmptyArray(found3, "Deleted Record 3 should NOT be found after refresh");

    const found4 = (await hashIndex.equal(record4._uuid))[0];
    await assertNotNull(found4, "Record 4 should be found after refresh");
    await assertDeepEqual(found4, { ...record4, _index: index4 }, "Record 4 data should match after refresh");

     // Check header entry count
    const header = await hashIndex._currentIndexFile.readRecord(0);
    await assertEqual(header.numberOfEntries, 3, "Header entry count should be 3 after refresh");
}

async function testIn() {
    logTestStart("In");
    await hashIndex.init();

    const record1 = { _uuid: "uuid-1", data: "value1" };
    const record2 = { _uuid: "uuid-2", data: "value2" };
    const record3 = { _uuid: "uuid-3", data: "value3" };
    const record4 = { _uuid: "uuid-4", data: "value4" };

    const index1 = await dataFile.appendRecord(record1);
    const index2 = await dataFile.appendRecord(record2);
    const index3 = await dataFile.appendRecord(record3);
    const index4 = await dataFile.appendRecord(record4);

    await hashIndex.insert(record1._uuid, index1);
    await hashIndex.insert(record2._uuid, index2);
    await hashIndex.insert(record3._uuid, index3);
    await hashIndex.insert(record4._uuid, index4);

    const keysToFind = [record1._uuid, record3._uuid, "non-existent-uuid"];
    const results = await hashIndex.in(keysToFind);

    await assertNotNull(results, "`in` should return an array");
    await assertEqual(results.length, 2, "`in` result array length should match input keys length except for the non existing keys");

    // Check found items (order might not be guaranteed, depends on Promise.all)
    const foundItems = results.filter(r => r !== null);
    await assertEqual(foundItems.length, 2, "Should find 2 non-null records");

    const expectedRecord1 = { ...record1, _index: index1 };
    const expectedRecord3 = { ...record3, _index: index3 };

    // Check if expected records are present (ignoring order)
    const foundJson = foundItems.map(JSON.stringify).sort();
    const expectedJson = [JSON.stringify(expectedRecord1), JSON.stringify(expectedRecord3)].sort();
    await assertDeepEqual(foundJson, expectedJson, "Found records should match expected records");
}

async function testNullUndefinedKeys() {
    logTestStart("Null/Undefined Keys");
    await hashIndex.init();

    // Insert should skip null/undefined
    await hashIndex.insert(null, 1);
    await hashIndex.insert(undefined, 2);
    await assertEqual(hashIndex._totalNumberOfEntries, 0, "Entries should be 0 after inserting null/undefined");

    // Equal should return empty array
    await assertEmptyArray(await hashIndex.equal(null), "equal(null) should return empty array");
    await assertEmptyArray(await hashIndex.equal(undefined), "equal(undefined) should return empty array");

    // Delete should skip
    await hashIndex.delete(null);
    await hashIndex.delete(undefined);
    await assertEqual(hashIndex._totalNumberOfEntries, 0, "Entries should still be 0 after deleting null/undefined");
}

async function testLargeNumberOfInserts() {
    logging.setLevel(logging.Level.INFO);
    logTestStart(`Insert ${LARGE_NUM_RECORDS} entries`);
    await hashIndex.init();

    console.log(`Starting insertion of ${LARGE_NUM_RECORDS} records... (This may take a while)`);
    const recordsToVerify = new Map(); // Store some records to verify later
    const verifyIndices = [0, Math.floor(LARGE_NUM_RECORDS / 2), LARGE_NUM_RECORDS - 1];
    let records = [];
    let recordIndices = [];
    let startTime = performance.now();
    let lastLogTime = startTime;
    let batch = [];
    let batchSize = 1000; // Increased batch size for data file appends
    let numberOfBatches = Math.floor(LARGE_NUM_RECORDS/batchSize);
    let numberOfLeftOvers = LARGE_NUM_RECORDS%batchSize;

    // Batch append to dataFile first
    for (let i = 0; i < numberOfBatches; i++) {
        for(let j=0;j < batchSize;j++) {
            const uuid = i*batchSize + j;
            const record = { _uuid: `large-uuid-${uuid}`, data: `value-${uuid}` };
            records.push(record); // Store for later index insertion
            batch.push(record);
        }
        const dataIndices = await dataFile.appendRecords(batch);
        recordIndices.push(...dataIndices);
        batch = [];
    }
    for (let i = 0; i < numberOfLeftOvers; i++) {
        const uuid = numberOfBatches * batchSize + i;
        const record = { _uuid: `large-uuid-${uuid}`, data: `value-${uuid}` };
        records.push(record);
        batch.push(record);
    }
    if(batch.length > 0) {
        const dataIndices = await dataFile.appendRecords(batch);
        recordIndices.push(...dataIndices);
        batch = [];
    }
    let now = performance.now();
    let elapsedSeconds = ((now - startTime) / 1000).toFixed(1);
    let rate = (LARGE_NUM_RECORDS/ elapsedSeconds).toFixed(0);
    console.log(`  ... inserted ${LARGE_NUM_RECORDS} data records (${rate} rec/s) [${elapsedSeconds}s elapsed]`);

    // Now insert into hash index, also in batches for insertMany
    const logInterval = 2000; // Log progress every 2 seconds
    startTime = performance.now();
    lastLogTime = startTime;
    let numberOfRecordsInserted = 0;
    batchSize = 500; // Batch size for hashIndex.insertMany
    numberOfBatches = Math.floor(LARGE_NUM_RECORDS/batchSize);
    numberOfLeftOvers = LARGE_NUM_RECORDS%batchSize;

    for (let i = 0; i < numberOfBatches; i++) {
        for(let j=0;j < batchSize;j++) {
            let recordIndex = i*batchSize + j;
            const record = records[recordIndex];
            const dataIndex = recordIndices[recordIndex];
            let entry = {
                key: record._uuid,
                dataFileRecordIndex: dataIndex
            };
            batch.push(entry);
            if (verifyIndices.includes(recordIndex)) {
                recordsToVerify.set(record._uuid, { ...record, _index: dataIndex });
            }
        }
        await hashIndex.insertMany(batch);
        now = performance.now();
        numberOfRecordsInserted += batch.length;
        if (now - lastLogTime > logInterval || (i === (numberOfBatches - 1))) {
            const elapsedSeconds = ((now - startTime) / 1000).toFixed(1);
            const currentRate = (batch.length / ((now - lastLogTime)/1000) ).toFixed(0);
            const overallRate = (numberOfRecordsInserted / elapsedSeconds).toFixed(0);
            console.log(`  ... inserted ${numberOfRecordsInserted} / ${LARGE_NUM_RECORDS} index records (Batch: ${currentRate} rec/s, Overall: ${overallRate} rec/s) [${elapsedSeconds}s elapsed]`);
            lastLogTime = now;
        }
        batch = [];
    }
    // Handle leftovers for index insertion
    for (let i = 0; i < numberOfLeftOvers; i++) {
        let recordIndex = numberOfBatches*batchSize + i;
        const record = records[recordIndex];
        const dataIndex = recordIndices[recordIndex];
        let entry = {
            key: record._uuid,
            dataFileRecordIndex: dataIndex
        };
        batch.push(entry);
        if (verifyIndices.includes(recordIndex)) {
            recordsToVerify.set(record._uuid, { ...record, _index: dataIndex });
        }
    }
    if(batch.length > 0) {
        await hashIndex.insertMany(batch);
        now = performance.now();
        numberOfRecordsInserted += batch.length;
        const elapsedSeconds = ((now - startTime) / 1000).toFixed(1);
        const overallRate = (numberOfRecordsInserted / elapsedSeconds).toFixed(0);
        console.log(`  ... inserted ${numberOfRecordsInserted} / ${LARGE_NUM_RECORDS} index records (Overall: ${overallRate} rec/s) [${elapsedSeconds}s elapsed]`);
        batch = [];
    }
    const endTime = performance.now();
    const durationSeconds = ((endTime - startTime) / 1000).toFixed(2);
    console.log(`Finished inserting ${LARGE_NUM_RECORDS} index records in ${durationSeconds} seconds.`);
    
    // Wait for any potential swap to complete
    while (hashIndex._isSwapping || hashIndex._standbyWorkerState === 'building' || hashIndex._standbyWorkerState === 'finalizing' || hashIndex._isProcessingQueue) {
        console.log(`testLargeNumberOfInserts: Waiting for swap/worker. State: ${hashIndex._standbyWorkerState}, Swapping: ${hashIndex._isSwapping}, ProcessingQ: ${hashIndex._isProcessingQueue}`);
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    await assertEqual(hashIndex._totalNumberOfEntries, LARGE_NUM_RECORDS, `Total entries should be ${LARGE_NUM_RECORDS} after large insert`);

    // Verify a few specific records
    console.log("Verifying specific records after large insert...");
    for (const [key, expectedRecord] of recordsToVerify.entries()) {
        const found = (await hashIndex.equal(key))[0];
        await assertNotNull(found, `Record with key ${key} should be found`);
        await assertEqual(found._index, expectedRecord._index, `Index for key ${key} should match`);
    }
    console.log("Specific records verified.");

    // Check header entry count
    const header = await hashIndex._currentIndexFile.readRecord(0);
    await assertEqual(header.numberOfEntries, LARGE_NUM_RECORDS, "Header entry count should match total records");
    await assertNotEqual(header.numberOfBuckets, DEFAULT_INITIAL_BUCKETS, "Number of buckets should have increased due to resizing from default");
    console.log(`Final number of buckets: ${header.numberOfBuckets}`);
}

// --- Test Runner ---

async function runAllTests() {
    console.log("Starting FileSystemHashIndex tests...");
    const tests = [
        testConstructor,
        // testInitNewFile, // Covered by refresh logic in init
        // testInitExistingFile, // Covered by init reading existing header
        testInsertAndEqual,
        testEqualNotFound,
        testInsertDuplicateKey,
        testDelete,
        testDeleteNotFound,
        testClear,
        testResize, 
        testRefresh, // Init calls refresh if file doesn't exist
        testIn,
        testNullUndefinedKeys,
        testLargeNumberOfInserts
    ];

    for (const test of tests) {
        try {
            await setup();
            await test();
        } catch (error) {
            // Error is already logged by assertion helpers if it's an assertion failure
             if (!error.message.startsWith("Assertion failed:")) {
                 // Log unexpected errors
                 failCount++; // Count unexpected errors as failures
                 console.error(`❌ UNEXPECTED ERROR in test ${test.name}:`, error);
             }
             // Optionally stop all tests on first failure:
             // console.error("\nStopping tests due to failure.");
             break;
        } finally {
            await teardown();
        }
    }

    console.log("\n--- Test Summary ---");
    console.log(`Total tests: ${testCount}`);
    console.log(`✅ Passed: ${passCount}`);
    console.log(`❌ Failed: ${failCount}`);
    console.log("--------------------\n");

    // Exit with status code 1 if any tests failed
    process.exitCode = failCount > 0 ? 1 : 0;
}

// Execute the tests
runAllTests();
