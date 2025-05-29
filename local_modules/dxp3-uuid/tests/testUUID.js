const testing = require('dxp3-testing');
const UUID = require('../index');


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

async function testValidUUID() {
    const id = UUID.v4();
    console.log(`    Generated UUID: ${id}`);
    await testing.assertTrue(isValidUUIDv4(id), `${id} should be a valid UUID.`);
}

async function testDifferentUUIDs() {
    const id1 = UUID.v4();
    const id2 = UUID.v4();
    console.log(`    Generated UUID 1: ${id1}`);
    console.log(`    Generated UUID 2: ${id2}`);
    await testing.assertTrue(isValidUUIDv4(id1), `${id1} should be a valid UUID.`);
    await testing.assertTrue(isValidUUIDv4(id2), `${id2} should be a valid UUID.`);
    await testing.assertNotEqual(id1, id2, `UUID.v4() should return different UUIDs on subsequent calls.`);
}

async function testAliasCreateMethod() {
    const id = UUID.create();
    console.log(`    Generated UUID from create(): ${id}`);
    await testing.assertTrue(isValidUUIDv4(id), `UUID from create() (${id}) should be a valid UUID v4.`);
}

async function testAliasNewMethod() {
    const id = UUID.new();
    console.log(`    Generated UUID from new(): ${id}`);
    await testing.assertTrue(isValidUUIDv4(id), `UUID from new() (${id}) should be a valid UUID v4.`);
}

async function testAliasNewInstanceMethod() {
    const id = UUID.newInstance();
    console.log(`    Generated UUID from newInstance(): ${id}`);
    await testing.assertTrue(isValidUUIDv4(id), `UUID from newInstance() (${id}) should be a valid UUID v4.`);
}

async function testAliasNextMethod() {
    const id = UUID.next();
    console.log(`    Generated UUID from next(): ${id}`);
    await testing.assertTrue(isValidUUIDv4(id), `UUID from next() (${id}) should be a valid UUID v4.`);
}

async function testAliasVersion4Method() {
    const id = UUID.version4();
    console.log(`    Generated UUID from version4(): ${id}`);
    await testing.assertTrue(isValidUUIDv4(id), `UUID from version4() (${id}) should be a valid UUID v4.`);
}

async function runTests() {
    console.log("Starting UUID tests...");

    testing.addTest("Valid UUID", testValidUUID);
    testing.addTest("Different UUIDs", testDifferentUUIDs);
    testing.addTest("Alias: create()", testAliasCreateMethod);
    testing.addTest("Alias: new()", testAliasNewMethod);
    testing.addTest("Alias: newInstance()", testAliasNewInstanceMethod);
    testing.addTest("Alias: next()", testAliasNextMethod);
    testing.addTest("Alias: version4()", testAliasVersion4Method);
    await testing.run();
    testing.summary();
}

runTests();