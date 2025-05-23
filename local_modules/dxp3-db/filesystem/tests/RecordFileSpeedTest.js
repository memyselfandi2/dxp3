/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-db/filesystem
 *
 * NAME
 * RecordFileSpeedTest
 *
 * DESCRIPTION
 * Basic speed tests for the RecordFile class without external libraries.
 */
const path = require('path');
const fs = require('fs').promises;
const { performance } = require('perf_hooks'); // For timing
const RecordFile = require('../RecordFile');
const logging = require('dxp3-logging'); // Required by RecordFile/RandomAccessFile

// Configure logging (optional, but helps if RecordFile logs errors)
logging.setLevel(logging.Level.WARN); // Set to WARN or ERROR to reduce noise

// --- Configuration ---
const TEST_DIR = path.join(__dirname, 'recordfile_speed_test_temp');
const TEST_FILE_PATH = path.join(TEST_DIR, 'speed_test_data.rec');
const RECORD_LENGTH = 257; // Match the length used in your examples
const NUM_RECORDS_TO_TEST = 1000; // Number of records for bulk operations
// --- End Configuration ---

/**
 * Helper function to create a sample record object.
 * Ensure its JSON string representation fits within RECORD_LENGTH.
 * @param {number} id - An identifier for the record.
 * @returns {object} A sample record.
 */
function createSampleRecord(id) {
    return {
        id: `record_${id}`,
        timestamp: Date.now(),
        data: `Some data for record ${id}`.padEnd(100, '.'), // Pad to ensure size
        value: Math.random() * 1000,
        active: id % 2 === 0,
    };
}

/**
 * Helper function to measure the execution time of an async function.
 * @param {string} testName - The name of the test being run.
 * @param {Function} asyncFn - The asynchronous function to measure.
 */
async function measureTime(testName, asyncFn) {
    console.log(`\n--- Running test: ${testName} ---`);
    const startTime = performance.now();
    try {
        await asyncFn();
    } catch (error) {
        console.error(`Error during test "${testName}":`, error);
    }
    const endTime = performance.now();
    const duration = (endTime - startTime).toFixed(2);
    console.log(`--- Finished test: ${testName} in ${duration} ms ---`);
    return parseFloat(duration);
}

/**
 * Main function to run all speed tests.
 */
async function runSpeedTests() {
    let recordFile;
    const results = {};

    // --- Setup ---
    console.log(`Setting up test environment in: ${TEST_DIR}`);
    try {
        await fs.mkdir(TEST_DIR, { recursive: true });
        recordFile = new RecordFile(TEST_FILE_PATH, RECORD_LENGTH);
        await recordFile.open();
        await recordFile.clear(); // Start with an empty file
        console.log('Setup complete.');
    } catch (error) {
        console.error('Setup failed:', error);
        return; // Stop if setup fails
    }
    // --- End Setup ---

    // --- Test: Append Records ---
    results.append = await measureTime(`Append ${NUM_RECORDS_TO_TEST} records`, async () => {
        for (let i = 0; i < NUM_RECORDS_TO_TEST; i++) {
            const record = createSampleRecord(i);
            await recordFile.appendRecord(record);
        }
    });
    console.log(`Total records after append: ${await recordFile.getNumberOfRecords()}`);
    console.log(`Deleted records after append: ${await recordFile.getNumberOfDeletedRecords()}`);

    results.appendMany = await measureTime(`Append batch ${NUM_RECORDS_TO_TEST} records`, async () => {
        let records = [];
        for (let i = 0; i < NUM_RECORDS_TO_TEST; i++) {
            const record = createSampleRecord(i);
            records.push(record);
        }
        await recordFile.appendRecords(records);
    });
    console.log(`Total records after append batch: ${await recordFile.getNumberOfRecords()}`);
    console.log(`Deleted records after append batch: ${await recordFile.getNumberOfDeletedRecords()}`);


    // --- Test: Read Records ---
    results.read = await measureTime(`Read ${NUM_RECORDS_TO_TEST} records sequentially`, async () => {
        for (let i = 0; i < NUM_RECORDS_TO_TEST; i++) {
            const record = await recordFile.readRecord(i);
            if (!record) {
                // This might happen if append failed or indexing is off
                console.warn(`Warning: Could not read record at index ${i}`);
            }
        }
    });

    results.readMany = await measureTime(`Read batch ${NUM_RECORDS_TO_TEST} records `, async () => {
        let indices = [];
        for (let i = 0; i < NUM_RECORDS_TO_TEST; i++) {
            indices.push(i);
        }
        const records = await recordFile.readRecords(indices);
        if (!records || records.length <= 0) {
            // This might happen if append failed or indexing is off
            console.warn(`Warning: Could not read records.`);
        }
    });

    // --- Test: Update Records ---
    results.update = await measureTime(`Update ${NUM_RECORDS_TO_TEST} records sequentially`, async () => {
        for (let i = 0; i < NUM_RECORDS_TO_TEST; i++) {
            const updatedRecord = createSampleRecord(i);
            updatedRecord.data = `Updated data for record ${i}`.padEnd(100, '*');
            updatedRecord.updatedAt = Date.now();
            await recordFile.updateRecord(i, updatedRecord);
        }
    });

    // --- Test: Delete Records ---
    // Note: Deleting sequentially might not fully test the reuse mechanism
    // if reads/appends aren't interleaved.
    results.delete = await measureTime(`Delete ${NUM_RECORDS_TO_TEST} records sequentially`, async () => {
        for (let i = 0; i < NUM_RECORDS_TO_TEST; i++) {
            await recordFile.deleteRecord(i);
        }
    });
    console.log(`Total records after delete: ${await recordFile.getNumberOfRecords()}`);
    console.log(`Deleted records after delete: ${await recordFile.getNumberOfDeletedRecords()}`);

    results.deleteMany = await measureTime(`Delete batch ${NUM_RECORDS_TO_TEST} records`, async () => {
        let indices = [];
        for (let i = 0; i < NUM_RECORDS_TO_TEST; i++) {
            indices.push(i);
        }
        await recordFile.deleteRecords(indices);
    });
    console.log(`Total records after delete batch: ${await recordFile.getNumberOfRecords()}`);
    console.log(`Deleted records after delete batch: ${await recordFile.getNumberOfDeletedRecords()}`);

    // --- Test: Append Records (Testing Reuse) ---
    results.appendReuse = await measureTime(`Append ${NUM_RECORDS_TO_TEST} records (testing reuse)`, async () => {
        for (let i = 0; i < NUM_RECORDS_TO_TEST; i++) {
            const record = createSampleRecord(i + NUM_RECORDS_TO_TEST); // Use new IDs
            await recordFile.appendRecord(record);
        }
    });
    console.log(`Total records after reuse append: ${await recordFile.getNumberOfRecords()}`);
    console.log(`Deleted records after reuse append: ${await recordFile.getNumberOfDeletedRecords()}`);


    // --- Test: Clear File ---
    results.clear = await measureTime(`Clear file with ${NUM_RECORDS_TO_TEST} records`, async () => {
        await recordFile.clear();
    });
    console.log(`Total records after clear: ${await recordFile.getNumberOfRecords()}`);
    console.log(`Deleted records after clear: ${await recordFile.getNumberOfDeletedRecords()}`);


    // --- Teardown ---
    console.log('\nCleaning up test environment...');
    try {
        await recordFile.close();
        await fs.rm(TEST_DIR, { recursive: true, force: true });
        console.log('Cleanup complete.');
    } catch (error) {
        console.error('Cleanup failed:', error);
    }
    // --- End Teardown ---

    // --- Summary ---
    console.log('\n--- Speed Test Summary ---');
    for (const testName in results) {
        console.log(`${testName.padEnd(15)}: ${results[testName].toFixed(2)} ms`);
    }
    console.log('--------------------------');
}

// Run the tests
runSpeedTests().catch(err => {
    console.error("An unexpected error occurred during the test run:", err);
});
