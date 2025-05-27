// test.js for dxp3-uuid

// Assuming test.js is in the same directory as index.js
const UUID = require('../index');

let testsPassed = 0;
let testsFailed = 0;

/**
 * Runs a test function and logs its result.
 * @param {string} testName - The name of the test.
 * @param {function(): boolean} testFunction - The test function. Should return true for pass, false for fail.
 */
function runTest(testName, testFunction) {
    console.log(`\nRunning test: "${testName}"`);
    try {
        const result = testFunction();
        if (result === true) {
            testsPassed++;
            console.log(`  PASSED: "${testName}"`);
        } else {
            testsFailed++;
            // Error messages should be printed by the testFunction itself for clarity
            console.error(`  FAILED: "${testName}"`);
        }
    } catch (e) {
        testsFailed++;
        console.error(`  FAILED: "${testName}" (with error: ${e.message})`);
        console.error(e.stack);
    }
}

// --- Test Helper ---
// Regex for UUID v4: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
// y can be 8, 9, A, or B.
const UUID_V4_REGEX = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;

/**
 * Validates if a given string is a UUID v4.
 * @param {string} uuid - The string to validate.
 * @returns {boolean} True if valid, false otherwise.
 */
function isValidUUIDv4(uuid) {
    if (typeof uuid !== 'string') {
        console.error('    Validation failed: UUID is not a string.');
        return false;
    }
    if (!UUID_V4_REGEX.test(uuid)) {
        console.error(`    Validation failed: UUID "${uuid}" does not match v4 format.`);
        return false;
    }
    return true;
}

// --- Test Cases ---

runTest('UUID.v4() returns a valid UUID v4 string', () => {
    const id = UUID.v4();
    console.log(`    Generated UUID: ${id}`);
    if (!isValidUUIDv4(id)) {
        console.error('    UUID.v4() did not return a valid v4 UUID.');
        return false;
    }
    return true;
});

runTest('UUID.v4() returns different UUIDs on subsequent calls', () => {
    const id1 = UUID.v4();
    const id2 = UUID.v4();
    console.log(`    Generated UUID 1: ${id1}`);
    console.log(`    Generated UUID 2: ${id2}`);
    if (!isValidUUIDv4(id1) || !isValidUUIDv4(id2)) {
        console.error('    One of the generated UUIDs is not a valid v4 UUID.');
        return false;
    }
    if (id1 === id2) {
        console.error('    UUID.v4() returned identical UUIDs on subsequent calls.');
        return false;
    }
    return true;
});

// Test alias methods
const aliasMethods = {
    create: UUID.create,
    new: UUID.new,
    newInstance: UUID.newInstance,
    next: UUID.next,
    version4: UUID.version4,
};

for (const methodName of Object.keys(aliasMethods)) {
    const method = aliasMethods[methodName];

    runTest(`UUID.${methodName}() returns a valid UUID v4 string`, () => {
        const id = method();
        console.log(`    Generated UUID via ${methodName}(): ${id}`);
        if (!isValidUUIDv4(id)) {
            console.error(`    UUID.${methodName}() did not return a valid v4 UUID.`);
            return false;
        }
        return true;
    });

    runTest(`UUID.${methodName}() returns different UUIDs on subsequent calls`, () => {
        const id1 = method();
        const id2 = method();
        console.log(`    Generated UUID 1 via ${methodName}(): ${id1}`);
        console.log(`    Generated UUID 2 via ${methodName}(): ${id2}`);
        if (!isValidUUIDv4(id1) || !isValidUUIDv4(id2)) {
            console.error('    One of the generated UUIDs via ${methodName}() is not a valid v4 UUID.');
            return false;
        }
        if (id1 === id2) {
            console.error(`    UUID.${methodName}() returned identical UUIDs on subsequent calls.`);
            return false;
        }
        return true;
    });
}

// --- Summary ---
console.log('\n--- Test Summary ---');
console.log(`Total tests run: ${testsPassed + testsFailed}`);
console.log(`Tests passed: ${testsPassed}`);
console.log(`Tests failed: ${testsFailed}`);

if (testsFailed > 0) {
    process.exitCode = 1; // Indicate failure to shell/CI environments
}