// ReadWriteLockTest.js
const ReadWriteLock = require('../ReadWriteLock'); // Assuming ReadWriteLock.js is in the same directory

const VERBOSE = true; // Set to true for more detailed logging

// --- Helper Functions ---

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let testsPassed = 0;
let testsFailed = 0;

// Simple assertion helper
function assert(condition, message) {
    if (!condition) {
        throw new Error(`Assertion Failed: ${message}`);
    }
}

// Function to run a single test
async function runTest(testName, testFn) {
    if (VERBOSE) console.log(`\n--- Running Test: ${testName} ---`);
    try {
        await testFn();
        if (VERBOSE) console.log(`[PASS] ${testName}`);
        testsPassed++;
    } catch (error) {
        console.error(`[FAIL] ${testName}`);
        console.error(error); // Log the specific error
        testsFailed++;
    }
}

// --- Test Cases ---

async function testBasicWriteLock() {
    const lockManager = new ReadWriteLock();
    const key = 'basicWrite';
    let lockAcquired = false;

    const lock = await lockManager.writeLock(key);
    lockAcquired = true;
    assert(lockAcquired, 'Write lock should be acquired immediately');
    lock.release();
    if (VERBOSE) console.log('Write lock acquired and released.');
}

async function testSequentialWriteLocks() {
    const lockManager = new ReadWriteLock();
    const key = 'sequentialWrite';
    let lock1Acquired = false;
    let lock2Acquired = false;
    let lock2Waited = false;

    const lock1 = await lockManager.writeLock(key);
    lock1Acquired = true;
    if (VERBOSE) console.log('Lock 1 acquired.');

    const lock2Promise = lockManager.writeLock(key);

    // Check if lock2 waits
    const raceResult = await Promise.race([
        lock2Promise.then(() => 'acquired'),
        delay(50).then(() => 'waited')
    ]);

    lock2Waited = (raceResult === 'waited');
    assert(lock2Waited, 'Lock 2 should wait for Lock 1');
    if (VERBOSE) console.log('Lock 2 is waiting (as expected).');

    lock1.release();
    if (VERBOSE) console.log('Lock 1 released.');

    const lock2 = await lock2Promise;
    lock2Acquired = true;
    assert(lock2Acquired, 'Lock 2 should be acquired after Lock 1 is released');
    if (VERBOSE) console.log('Lock 2 acquired.');

    lock2.release();
    if (VERBOSE) console.log('Lock 2 released.');
}

async function testBasicReadLock() {
    const lockManager = new ReadWriteLock();
    const key = 'basicRead';
    let lockAcquired = false;

    const lock = await lockManager.readLock(key);
    lockAcquired = true;
    assert(lockAcquired, 'Read lock should be acquired immediately');
    lock.release();
    if (VERBOSE) console.log('Read lock acquired and released.');
}

async function testConcurrentReadLocks() {
    const lockManager = new ReadWriteLock();
    const key = 'concurrentRead';
    let locksAcquired = 0;

    const lockPromise1 = lockManager.readLock(key).then(lock => { locksAcquired++; return lock; });
    const lockPromise2 = lockManager.readLock(key).then(lock => { locksAcquired++; return lock; });
    const lockPromise3 = lockManager.readLock(key).then(lock => { locksAcquired++; return lock; });

    const locks = await Promise.all([lockPromise1, lockPromise2, lockPromise3]);

    assert(locksAcquired === 3, `Expected 3 concurrent read locks, got ${locksAcquired}`);
    if (VERBOSE) console.log('All 3 concurrent read locks acquired.');

    locks.forEach((lock, i) => {
        lock.release();
        if (VERBOSE) console.log(`Read lock ${i + 1} released.`);
    });
}

async function testReadWaitsForWrite() {
    const lockManager = new ReadWriteLock();
    const key = 'readWaitsWrite';
    let writeLockAcquired = false;
    let readLockAcquired = false;
    let readLockWaited = false;

    const writeLock = await lockManager.writeLock(key);
    writeLockAcquired = true;
    if (VERBOSE) console.log('Write lock acquired.');

    const readLockPromise = lockManager.readLock(key);

    // Check if read lock waits
    const raceResult = await Promise.race([
        readLockPromise.then(() => 'acquired'),
        delay(50).then(() => 'waited')
    ]);

    readLockWaited = (raceResult === 'waited');
    assert(readLockWaited, 'Read lock should wait for Write lock');
    if (VERBOSE) console.log('Read lock is waiting (as expected).');

    writeLock.release();
    if (VERBOSE) console.log('Write lock released.');

    const readLock = await readLockPromise;
    readLockAcquired = true;
    assert(readLockAcquired, 'Read lock should be acquired after Write lock is released');
    if (VERBOSE) console.log('Read lock acquired.');

    readLock.release();
    if (VERBOSE) console.log('Read lock released.');
}

async function testWriteWaitsForRead() {
    const lockManager = new ReadWriteLock();
    const key = 'writeWaitsRead';
    let readLockAcquired = false;
    let writeLockAcquired = false;
    let writeLockWaited = false;

    const readLock = await lockManager.readLock(key);
    readLockAcquired = true;
    if (VERBOSE) console.log('Read lock acquired.');

    const writeLockPromise = lockManager.writeLock(key);

    // Check if write lock waits
    const raceResult = await Promise.race([
        writeLockPromise.then(() => 'acquired'),
        delay(50).then(() => 'waited')
    ]);

    writeLockWaited = (raceResult === 'waited');
    assert(writeLockWaited, 'Write lock should wait for Read lock');
    if (VERBOSE) console.log('Write lock is waiting (as expected).');

    readLock.release();
    if (VERBOSE) console.log('Read lock released.');

    const writeLock = await writeLockPromise;
    writeLockAcquired = true;
    assert(writeLockAcquired, 'Write lock should be acquired after Read lock is released');
    if (VERBOSE) console.log('Write lock acquired.');

    writeLock.release();
    if (VERBOSE) console.log('Write lock released.');
}

async function testWriteWaitsForMultipleReads() {
    const lockManager = new ReadWriteLock();
    const key = 'writeWaitsMultiRead';
    let writeLockAcquired = false;
    let writeLockWaited = false;

    const readLock1 = await lockManager.readLock(key);
    const readLock2 = await lockManager.readLock(key);
    if (VERBOSE) console.log('Read locks 1 & 2 acquired.');

    const writeLockPromise = lockManager.writeLock(key);

    // Check if write lock waits
    let raceResult = await Promise.race([
        writeLockPromise.then(() => 'acquired'),
        delay(50).then(() => 'waited')
    ]);
    writeLockWaited = (raceResult === 'waited');
    assert(writeLockWaited, 'Write lock should wait for Read locks');
    if (VERBOSE) console.log('Write lock is waiting (as expected).');

    readLock1.release();
    if (VERBOSE) console.log('Read lock 1 released.');

    // Check if write lock still waits
    raceResult = await Promise.race([
        writeLockPromise.then(() => 'acquired'),
        delay(50).then(() => 'waited')
    ]);
    writeLockWaited = (raceResult === 'waited');
    assert(writeLockWaited, 'Write lock should still wait for Read lock 2');
    if (VERBOSE) console.log('Write lock is still waiting (as expected).');

    readLock2.release();
    if (VERBOSE) console.log('Read lock 2 released.');

    const writeLock = await writeLockPromise;
    writeLockAcquired = true;
    assert(writeLockAcquired, 'Write lock should be acquired after all Read locks are released');
    if (VERBOSE) console.log('Write lock acquired.');

    writeLock.release();
    if (VERBOSE) console.log('Write lock released.');
}

async function testWriteLockTimeout() {
    const lockManager = new ReadWriteLock({ timeout: 100 }); // Default timeout
    const key = 'writeTimeout';
    let timedOut = false;

    const lock1 = await lockManager.writeLock(key); // Hold the lock
    if (VERBOSE) console.log('Lock 1 acquired (will hold).');

    try {
        // This should time out because lock1 is held
        await lockManager.writeLock(key, { timeout: 50 }); // Shorter timeout for test
    } catch (error) {
        if (VERBOSE) console.log('Caught error:', error.message);
        assert(error.message.includes('Timed out'), 'Error should be a timeout error');
        timedOut = true;
    }

    assert(timedOut, 'Write lock should have timed out');
    if (VERBOSE) console.log('Second write lock timed out (as expected).');

    lock1.release(); // Release the original lock
    if (VERBOSE) console.log('Lock 1 released.');
}

async function testReadLockTimeout() {
    const lockManager = new ReadWriteLock({ timeout: 100 }); // Default timeout
    const key = 'readTimeout';
    let timedOut = false;

    const lock1 = await lockManager.writeLock(key); // Hold a write lock
    if (VERBOSE) console.log('Write Lock 1 acquired (will hold).');

    try {
        // This should time out because write lock1 is held
        await lockManager.readLock(key, { timeout: 50 }); // Shorter timeout for test
    } catch (error) {
        if (VERBOSE) console.log('Caught error:', error.message);
        assert(error.message.includes('Timed out'), 'Error should be a timeout error');
        timedOut = true;
    }

    assert(timedOut, 'Read lock should have timed out');
    if (VERBOSE) console.log('Read lock timed out (as expected).');

    lock1.release(); // Release the original lock
    if (VERBOSE) console.log('Write Lock 1 released.');
}

async function testDifferentKeys() {
    const lockManager = new ReadWriteLock();
    const keyA = 'keyA';
    const keyB = 'keyB';
    let lockAAcquired = false;
    let lockBAcquired = false;

    const lockAPromise = lockManager.writeLock(keyA).then(lock => { lockAAcquired = true; return lock; });
    const lockBPromise = lockManager.writeLock(keyB).then(lock => { lockBAcquired = true; return lock; });

    const [lockA, lockB] = await Promise.all([lockAPromise, lockBPromise]);

    assert(lockAAcquired, 'Lock for keyA should be acquired');
    assert(lockBAcquired, 'Lock for keyB should be acquired');
    if (VERBOSE) console.log('Locks for different keys acquired concurrently.');

    lockA.release();
    lockB.release();
    if (VERBOSE) console.log('Locks for different keys released.');
}

async function testMaximumLocks() {
    const maxLocks = 2;
    const lockManager = new ReadWriteLock({ maximumNumberOfLocks: maxLocks });
    const key = 'key1';
    let maxLocksReachedError = false;

    let lock1 = await lockManager.readLock(key);
    let lock2 = await lockManager.readLock(key);
    if (VERBOSE) console.log(`Acquired ${maxLocks} locks.`);

    try {
        await lockManager.writeLock(key); // Attempt to acquire one more
    } catch (error) {
        if (VERBOSE) console.log('Caught error:', error.message);
        assert(error.message.includes('Maximum number of locks reached'), 'Error should be max locks reached');
        maxLocksReachedError = true;
    }

    assert(maxLocksReachedError, 'Should have thrown max locks error');
    if (VERBOSE) console.log('Max locks error thrown (as expected).');

    lock1.release();
    lock2.release();
    if (VERBOSE) console.log('Locks released.');
}


// --- Test Runner ---

async function runAllTests() {
    console.log('Starting ReadWriteLock Tests...');

    await runTest('Basic Write Lock Acquisition', testBasicWriteLock);
    await runTest('Sequential Write Locks', testSequentialWriteLocks);
    await runTest('Basic Read Lock Acquisition', testBasicReadLock);
    await runTest('Concurrent Read Locks', testConcurrentReadLocks);
    await runTest('Read Lock Waits for Write Lock', testReadWaitsForWrite);
    await runTest('Write Lock Waits for Read Lock', testWriteWaitsForRead);
    await runTest('Write Lock Waits for Multiple Read Locks', testWriteWaitsForMultipleReads);
    await runTest('Write Lock Timeout', testWriteLockTimeout);
    await runTest('Read Lock Timeout', testReadLockTimeout);
    await runTest('Different Keys Do Not Block Each Other', testDifferentKeys);
    await runTest('Maximum Number of Locks', testMaximumLocks);


    console.log('\n--- Test Summary ---');
    console.log(`Total Tests: ${testsPassed + testsFailed}`);
    console.log(`Passed: ${testsPassed}`);
    console.log(`Failed: ${testsFailed}`);
    console.log('--------------------\n');

    if (testsFailed > 0) {
        process.exit(1); // Indicate failure
    } else {
        process.exit(0); // Indicate success
    }
}

// Execute the tests
runAllTests();
