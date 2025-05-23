/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-db/filesystem
 *
 * NAME
 * RandomAccessFile Speed Tests
 */
const path = require('path');
const fs = require('fs');
const fsPromises = fs.promises;
const RandomAccessFile = require('../RandomAccessFile'); // Assuming this file is in the same directory
const DatabaseError = require('../../DatabaseError'); // Adjust path if necessary

const TEST_FOLDER = path.join(__dirname, 'raf_speed_test_dir');
const TEST_FILE_PATH = path.join(TEST_FOLDER, 'speed_test_file.bin');
const NUM_OPERATIONS = 1000; // Number of operations for loop tests
const RECORD_SIZE_ESTIMATE = 100; // Estimate for random access tests

const NUMBER_START = 0;
const NUMBER_END = NUM_OPERATIONS;
const NUMBERS_START = NUMBER_END;
const NUMBERS_END = NUMBERS_START + NUM_OPERATIONS;
const STRING_START = NUMBERS_END;
const STRING_END = STRING_START + NUM_OPERATIONS;
const OBJECT_START = STRING_END;
const OBJECT_END = OBJECT_START + NUM_OPERATIONS;
const OBJECTS_START = OBJECT_END;
const OBJECTS_END = OBJECTS_START + NUM_OPERATIONS;
const BUFFER_START = OBJECTS_END;
const BUFFER_END = BUFFER_START + NUM_OPERATIONS;

// Helper function to measure execution time
async function measureTime(description, operationFn) {
    const start = performance.now();
    try {
        await operationFn();
        const end = performance.now();
        console.log(`${description}: ${((end - start)).toFixed(3)} ms`);
    } catch (error) {
        const end = performance.now();
        console.error(`${description}: FAILED in ${((end - start)).toFixed(3)} ms - ${error}`);
    }
}

// Helper function for setup
async function setup() {
    try {
        await fsPromises.mkdir(TEST_FOLDER, { recursive: true });
        // Ensure the file is created for tests that need it to exist initially
        const handle = await fsPromises.open(TEST_FILE_PATH, 'w');
        await handle.close();
    } catch (err) {
        console.error("Setup failed:", err);
        process.exit(1); // Exit if setup fails
    }
}

// Helper function for teardown
async function teardown() {
    try {
        await fsPromises.rm(TEST_FOLDER, { recursive: true, force: true });
    } catch (err) {
        // Ignore errors during cleanup, but log them
        console.warn("Teardown warning:", err.message);
    }
}

// --- Test Suite ---
async function runSpeedTests() {
    console.log(`--- RandomAccessFile Speed Tests (Operations: ${NUM_OPERATIONS}) ---`);

    await setup(); // Initial setup

    const raf = new RandomAccessFile(TEST_FILE_PATH);

    // --- Basic File Operations ---
    await measureTime('Initial exists() check (file exists)', async () => {
        await raf.exists();
    });

    await measureTime(`open() and close() x ${NUM_OPERATIONS}`, async () => {
        for (let i = 0; i < NUM_OPERATIONS; i++) {
            const tempRaf = new RandomAccessFile(TEST_FILE_PATH + i); // Use different paths to avoid caching effects?
            await tempRaf.open();
            await tempRaf.close();
            // Clean up the temp file immediately
            try { await fsPromises.unlink(TEST_FILE_PATH + i); } catch (e) { /* ignore */ }
        }
    });

    // Re-open the main file for subsequent tests
    await raf.open();

    await measureTime('size() (empty file)', async () => {
        await raf.size();
    });

    // --- Write Operations ---
    const testString = "This is a test string for speed testing.";
    const testObject = { a: 1, b: "hello", c: true, d: [1, 2, 3], e: null };
    const testNumber = 123456789;
    const testBuffer = Buffer.from(testString.repeat(5)); // A larger buffer


    await measureTime(`writeNumber() x ${NUM_OPERATIONS} (sequential)`, async () => {
        for (let i = NUMBER_START; i < NUMBER_END; i++) {
            await raf.writeNumber(i * RECORD_SIZE_ESTIMATE, testNumber + i);
        }
    });

    await measureTime(`writeNumbers() x ${NUM_OPERATIONS} (sequential)`, async () => {
        let offsets = [];
        let numbers = [];
        for (let i = NUMBERS_START; i < NUMBERS_END; i++) {
            offsets.push(i * RECORD_SIZE_ESTIMATE);
            numbers.push(testNumber + 1);
        }
        await raf.writeNumbers(offsets, numbers);
    });

    await measureTime(`writeString() x ${NUM_OPERATIONS} (sequential)`, async () => {
        for (let i = STRING_START; i < STRING_END; i++) {
            await raf.writeString(i * RECORD_SIZE_ESTIMATE, testString + i);
        }
    });

    await measureTime(`writeObject() x ${NUM_OPERATIONS} (sequential)`, async () => {
        for (let i = OBJECT_START; i < OBJECT_END; i++) {
            await raf.writeObject(i * RECORD_SIZE_ESTIMATE, { ...testObject, index: i });
        }
    });

    await measureTime(`writeObjects() x ${NUM_OPERATIONS} (sequential)`, async () => {
        let offsets = [];
        let objects = [];
        for (let i = OBJECTS_START; i < OBJECTS_END; i++) {
            offsets.push(i * RECORD_SIZE_ESTIMATE);
            objects.push({ ...testObject, index: i });
        }
        await raf.writeObjects(offsets, objects);
    });

    await measureTime(`writeBuffer() x ${NUM_OPERATIONS} (sequential)`, async () => {
        for (let i = BUFFER_START; i < BUFFER_END; i++) {
            await raf.writeBuffer(i * RECORD_SIZE_ESTIMATE, testBuffer);
        }
    });

    await measureTime('size() (after writes)', async () => {
        await raf.size();
    });

    // --- Read Operations ---
    await measureTime(`readNumber() x ${NUM_OPERATIONS} (sequential)`, async () => {
        for (let i = NUMBER_START; i < NUMBER_END; i++) {
            await raf.readNumber(i * RECORD_SIZE_ESTIMATE);
        }
    });

    await measureTime(`readNumbers() x ${NUM_OPERATIONS} (sequential)`, async () => {
        let offsets = [];
        for (let i = NUMBERS_START; i < NUMBERS_END; i++) {
            offsets.push(i * RECORD_SIZE_ESTIMATE);
        }
        await raf.readNumbers(offsets);
    });

    await measureTime(`readString() x ${NUM_OPERATIONS} (sequential)`, async () => {
        for (let i = STRING_START; i < STRING_END; i++) {
            await raf.readString(i * RECORD_SIZE_ESTIMATE);
        }
    });

    await measureTime(`readObject() x ${NUM_OPERATIONS} (sequential)`, async () => {
        for (let i = OBJECT_START; i < OBJECT_END; i++) {
            await raf.readObject(i * RECORD_SIZE_ESTIMATE);
        }
    });

    await measureTime(`readObjects() x ${NUM_OPERATIONS} (sequential)`, async () => {
        let offsets = [];
        for (let i = OBJECTS_START; i < OBJECTS_END; i++) {
            offsets.push(i * RECORD_SIZE_ESTIMATE);
        }
        await raf.readObjects(offsets);
    });

    await measureTime(`readBuffer() x ${NUM_OPERATIONS} (sequential)`, async () => {
        for (let i = BUFFER_START; i < BUFFER_END; i++) {
            await raf.readBuffer(i * RECORD_SIZE_ESTIMATE);
        }
    });

    // --- Random Access ---
    const randomOffsets = [];
    const fileSize = await raf.size();
    for (let i = 0; i < NUM_OPERATIONS; i++) {
        // Generate random offsets, ensuring they align roughly with potential record starts
        randomOffsets.push(Math.floor(Math.random() * (fileSize / RECORD_SIZE_ESTIMATE)) * RECORD_SIZE_ESTIMATE);
    }

    await measureTime(`writeNumber() x ${NUM_OPERATIONS} (random)`, async () => {
        for (let i = 0; i < NUM_OPERATIONS; i++) {
            await raf.writeNumber(randomOffsets[i], testNumber + i);
        }
    });

    await measureTime(`readNumber() x ${NUM_OPERATIONS} (random)`, async () => {
        for (let i = 0; i < NUM_OPERATIONS; i++) {
            try {
                await raf.readNumber(randomOffsets[i]);
            } catch (e) {
                // Ignore END_OF_FILE or other read errors during random access test
                if (e !== DatabaseError.END_OF_FILE) {
                   // console.warn(`Read error at offset ${randomOffsets[i]}: ${e.message}`);
                }
            }
        }
    });

     // --- Truncate Operations ---
    const initialSize = await raf.size();
    await measureTime('truncate() to half size', async () => {
        await raf.truncate(Math.floor(initialSize / 2));
    });
     await measureTime('size() (after truncate half)', async () => {
        await raf.size();
    });
    await measureTime('truncate() to zero size (clear)', async () => {
        await raf.truncate(0);
    });
     await measureTime('size() (after truncate zero)', async () => {
        await raf.size();
    });


    // --- Cleanup ---
    await raf.close();
    await teardown(); // Final cleanup

    // Test exists() when file doesn't exist
    const nonExistentRaf = new RandomAccessFile(TEST_FILE_PATH + '_nonexistent');
    await measureTime('exists() check (file does NOT exist)', async () => {
        await nonExistentRaf.exists();
    });


    console.log("--- Tests Complete ---");
}

// Run the tests
runSpeedTests().catch(err => {
    console.error("An unexpected error occurred during testing:", err);
    // Attempt cleanup even if tests fail
    teardown();
});
