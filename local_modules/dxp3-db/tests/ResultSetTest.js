const ResultSet = require('../ResultSet');

// Simple Assertion Functions
function assertEqual(actual, expected, message) {
    if (actual !== expected) {
        throw new Error(`Assertion failed: ${message} - Expected: ${expected}, Actual: ${actual}`);
    }
}

function assertDeepEqual(actual, expected, message) {
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        throw new Error(`Assertion failed: ${message} - Expected: ${JSON.stringify(expected)}, Actual: ${JSON.stringify(actual)}`);
    }
}

function assertTrue(value, message) {
    if (value !== true) {
        throw new Error(`Assertion failed: ${message} - Expected: true, Actual: ${value}`);
    }
}

function assertFalse(value, message) {
    if (value !== false) {
        throw new Error(`Assertion failed: ${message} - Expected: false, Actual: ${value}`);
    }
}

function assertArrayLength(array, expectedLength, message) {
    if (array.length !== expectedLength) {
        throw new Error(`Assertion failed: ${message} - Expected array length: ${expectedLength}, Actual length: ${array.length}`);
    }
}

// Test Suite
async function runTests() {
    console.log('Starting ResultSet tests...');

    const sampleData = [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
        { id: 3, name: 'Charlie' },
        { id: 4, name: 'David' },
        { id: 5, name: 'Eve' },
        { id: 6, name: 'Frank' },
        { id: 7, name: 'Grace' },
    ];

    // Test Case 1: Initialization without pagination
    async function testInitWithoutPagination() {
        console.log('  testInitWithoutPagination: started');
        const rs = new ResultSet(sampleData);

        assertFalse(rs._isPaginated, 'Should not be paginated');
        assertEqual(rs.getTotalNumberOfRows(), sampleData.length, 'Total rows should match input data length');
        assertEqual(rs.getTotalPages(), 1, 'Should have 1 total page');
        assertEqual(rs.getCurrentPageNumber(), 0, 'Current page should be 0');
        assertEqual(rs.getPageSize(), 0, 'Page size should be 0');
        assertArrayLength(rs.getRows(), sampleData.length, 'Current page should contain all rows');
        assertEqual(rs.getRow(), null, 'Cursor should be before the first row');
        assertTrue(rs.hasMoreRows(), 'Should have more rows before moving cursor');
        assertFalse(rs.hasMorePages(), 'Should not have more pages');

        await rs.close();
        assertEqual(rs.getTotalNumberOfRows(), 0, 'Total rows should be 0 after close');
        assertArrayLength(rs.getRows(), 0, 'Current page should be empty after close');
        console.log('  testInitWithoutPagination: finished');
    }

    // Test Case 2: Initialization with pagination
    async function testInitWithPagination() {
        console.log('  testInitWithPagination: started');
        const pageSize = 3;
        const rs = new ResultSet(sampleData, pageSize);

        assertTrue(rs._isPaginated, 'Should be paginated');
        assertEqual(rs.getTotalNumberOfRows(), sampleData.length, 'Total rows should match input data length');
        assertEqual(rs.getTotalPages(), Math.ceil(sampleData.length / pageSize), 'Total pages should be calculated correctly');
        assertEqual(rs.getCurrentPageNumber(), 0, 'Should start at page 0');
        assertEqual(rs.getPageSize(), pageSize, 'Page size should match input');
        assertArrayLength(rs.getRows(), pageSize, 'Current page should contain the first page of rows');
        assertDeepEqual(rs.getRows(), sampleData.slice(0, pageSize), 'Current page rows should match the first slice');
        assertEqual(rs.getRow(), null, 'Cursor should be before the first row');
        assertTrue(rs.hasMoreRows(), 'Should have more rows before moving cursor');
        assertTrue(rs.hasMorePages(), 'Should have more pages');

        await rs.close();
        console.log('  testInitWithPagination: finished');
    }

    // Test Case 3: Cursor movement within a page (no pagination)
    async function testCursorMovementNoPagination() {
        console.log('  testCursorMovementNoPagination: started');
        const rs = new ResultSet(sampleData);

        assertTrue(rs.toLastRow(), 'toLastRow should return true if there are rows');
        assertTrue(rs.toFirstRow(), 'toFirstRow should return true if there are rows');
        assertTrue(rs.toNextRow(), 'toNextRow should return true if there are rows');
        assertTrue(rs.toPreviousRow(), 'toPreviousRow should return true if there are rows');

        // Add data and re-test
        rs._allResults = [...sampleData]; // Manually add data back for this test instance
        rs._currentPageResults = [...sampleData];
        rs._totalPages = 1;

        assertTrue(rs.toFirstRow(), 'toFirstRow should return true');
        assertEqual(rs._cursor, 0, 'Cursor should be at index 0');
        assertDeepEqual(rs.getRow(), sampleData[0], 'getRow should return the first row');
        assertTrue(rs.hasMoreRows(), 'Should have more rows after moving to first');

        assertTrue(rs.toNextRow(), 'toNextRow should return true');
        assertEqual(rs._cursor, 1, 'Cursor should be at index 1');
        assertDeepEqual(rs.getRow(), sampleData[1], 'getRow should return the second row');
        assertTrue(rs.hasMoreRows(), 'Should have more rows');

        assertTrue(rs.toLastRow(), 'toLastRow should return true');
        assertEqual(rs._cursor, sampleData.length - 1, 'Cursor should be at the last index');
        assertDeepEqual(rs.getRow(), sampleData[sampleData.length - 1], 'getRow should return the last row');
        assertFalse(rs.hasMoreRows(), 'Should not have more rows after moving to last');

        assertTrue(rs.toPreviousRow(), 'toPreviousRow should return true');
        assertEqual(rs._cursor, sampleData.length - 2, 'Cursor should move back one');
        assertDeepEqual(rs.getRow(), sampleData[sampleData.length - 2], 'getRow should return the previous row');
        assertTrue(rs.hasMoreRows(), 'Should have more rows');

        assertTrue(rs.toFirstRow(), 'toFirstRow should return true if there are rows');
        assertFalse(rs.toPreviousRow(), 'toPreviousRow should return false before the first row'); // Try moving back again
        assertEqual(rs._cursor, 0, 'Cursor should stay at 0');

        assertTrue(rs.toLastRow(), 'toLastRow should return true if there are rows');
        assertFalse(rs.toNextRow(), 'toNextRow should return false when we are at the last row');

        await rs.close();
        console.log('  testCursorMovementNoPagination: finished');
    }

    // Test Case 4: Cursor movement within a page (with pagination)
    async function testCursorMovementWithPagination() {
        console.log('  testCursorMovementWithPagination: started');
        const pageSize = 3;
        const rs = new ResultSet(sampleData, pageSize); // Page 0: [0, 1, 2]

        assertTrue(rs.toFirstRow(), 'toFirstRow should return true on page 0');
        assertEqual(rs._cursor, 0, 'Cursor should be at 0 on page 0');
        assertDeepEqual(rs.getRow(), sampleData[0], 'getRow should return first row of page 0');
        assertTrue(rs.hasMoreRows(), 'Should have more rows on page 0');

        assertTrue(rs.toNextRow(), 'toNextRow should return true');
        assertEqual(rs._cursor, 1, 'Cursor should be at 1 on page 0');
        assertDeepEqual(rs.getRow(), sampleData[1], 'getRow should return second row of page 0');

        assertTrue(rs.toNextRow(), 'toNextRow should return true');
        assertEqual(rs._cursor, 2, 'Cursor should be at 2 on page 0');
        assertDeepEqual(rs.getRow(), sampleData[2], 'getRow should return third row of page 0');
        assertFalse(rs.hasMoreRows(), 'Should not have more rows after last on page 0');
        assertFalse(rs.toNextRow(), 'toNextRow should return false at end of page 0');

        assertTrue(rs.toPreviousRow(), 'toPreviousRow should return true');
        assertEqual(rs._cursor, 1, 'Cursor should move back to 1 on page 0');

        assertTrue(await rs.toNextPage(), 'toNextPage should move to page 1'); // Page 1: [3, 4, 5]
        assertEqual(rs.getCurrentPageNumber(), 1, 'Should be on page 1');
        assertArrayLength(rs.getRows(), pageSize, 'Current page should contain 3 rows');
        assertDeepEqual(rs.getRows(), sampleData.slice(pageSize, pageSize * 2), 'Current page rows should match page 1 slice');
        assertEqual(rs.getRow(), null, 'Cursor should be reset after page change');
        assertTrue(rs.hasMoreRows(), 'Should have more rows on page 1');

        assertTrue(rs.toFirstRow(), 'toFirstRow should work on page 1');
        assertDeepEqual(rs.getRow(), sampleData[3], 'getRow should return first row of page 1');

        assertTrue(rs.toLastRow(), 'toLastRow should work on page 1');
        assertDeepEqual(rs.getRow(), sampleData[5], 'getRow should return last row of page 1');
        assertFalse(rs.hasMoreRows(), 'Should not have more rows after last on page 1');

        assertTrue(await rs.toNextPage(), 'toNextPage should move to page 2'); // Page 2: [6]
        assertEqual(rs.getCurrentPageNumber(), 2, 'Should be on page 2');
        assertArrayLength(rs.getRows(), 1, 'Current page should contain 1 row');
        assertDeepEqual(rs.getRows(), sampleData.slice(pageSize * 2), 'Current page rows should match page 2 slice');
        assertFalse(rs.hasMorePages(), 'Should not have more pages after page 2');

        assertFalse(await rs.toNextPage(), 'toNextPage should return false at end');
        assertEqual(rs.getCurrentPageNumber(), 2, 'Should remain on page 2'); // Should not advance past last page

        await rs.close();
        console.log('  testCursorMovementWithPagination: finished');
    }

    // Test Case 5: goToPage method
    async function testGoToPage() {
        console.log('  testGoToPage: started');
        const pageSize = 2;
        const rs = new ResultSet(sampleData, pageSize); // Pages: [0,1], [2,3], [4,5], [6]

        assertEqual(rs.getTotalPages(), 4, 'Total pages should be 4');

        assertTrue(await rs.goToPage(2), 'goToPage(2) should return true'); // Page 2: [4, 5]
        assertEqual(rs.getCurrentPageNumber(), 2, 'Should be on page 2');
        assertArrayLength(rs.getRows(), pageSize, 'Page 2 should have 2 rows');
        assertDeepEqual(rs.getRows(), sampleData.slice(pageSize * 2, pageSize * 3), 'Page 2 rows should be correct');

        assertTrue(await rs.goToPage(0), 'goToPage(0) should return true'); // Page 0: [0, 1]
        assertEqual(rs.getCurrentPageNumber(), 0, 'Should be back on page 0');
        assertArrayLength(rs.getRows(), pageSize, 'Page 0 should have 2 rows');
        assertDeepEqual(rs.getRows(), sampleData.slice(0, pageSize), 'Page 0 rows should be correct');

        assertTrue(await rs.goToPage(3), 'goToPage(3) should return true'); // Page 3: [6]
        assertEqual(rs.getCurrentPageNumber(), 3, 'Should be on page 3');
        assertArrayLength(rs.getRows(), 1, 'Page 3 should have 1 row');
        assertDeepEqual(rs.getRows(), sampleData.slice(pageSize * 3), 'Page 3 rows should be correct');

        assertFalse(await rs.goToPage(4), 'goToPage(4) should return false (invalid page)');
        assertEqual(rs.getCurrentPageNumber(), 3, 'Should remain on page 3');

        assertFalse(await rs.goToPage(-1), 'goToPage(-1) should return false (invalid page)');
        assertEqual(rs.getCurrentPageNumber(), 3, 'Should remain on page 3');

        await rs.close();
        console.log('  testGoToPage: finished');
    }

    // Test Case 6: Empty result set
    async function testEmptyResultSet() {
        console.log('  testEmptyResultSet: started');
        const rs = new ResultSet([]);

        assertFalse(rs._isPaginated, 'Empty result set should not be paginated');
        assertEqual(rs.getTotalNumberOfRows(), 0, 'Total rows should be 0');
        assertEqual(rs.getTotalPages(), 0, 'Total pages should be 0');
        assertEqual(rs.getCurrentPageNumber(), 0, 'Current page should be 0');
        assertEqual(rs.getPageSize(), 0, 'Page size should be 0');
        assertArrayLength(rs.getRows(), 0, 'Current page should be empty');
        assertEqual(rs.getRow(), null, 'getRow should return null');
        assertFalse(rs.hasMoreRows(), 'Should not have more rows');
        assertFalse(rs.hasMorePages(), 'Should not have more pages');

        assertFalse(rs.toFirstRow(), 'toFirstRow should return false');
        assertFalse(rs.toLastRow(), 'toLastRow should return false');
        assertFalse(rs.toNextRow(), 'toNextRow should return false');
        assertFalse(rs.toPreviousRow(), 'toPreviousRow should return false');
        assertFalse(await rs.toNextPage(), 'toNextPage should return false');
        assertFalse(await rs.goToPage(0), 'goToPage(0) should return false');

        await rs.close();
        console.log('  testEmptyResultSet: finished');
    }

    // Test Case 7: Empty result set with pagination attempt
    async function testEmptyResultSetWithPagination() {
        console.log('  testEmptyResultSetWithPagination: started');
        const rs = new ResultSet([], 5);

        assertFalse(rs._isPaginated, 'Empty result set should not be paginated even if page size is given');
        assertEqual(rs.getTotalNumberOfRows(), 0, 'Total rows should be 0');
        assertEqual(rs.getTotalPages(), 0, 'Total pages should be 0');
        assertEqual(rs.getCurrentPageNumber(), 0, 'Current page should be 0');
        assertEqual(rs.getPageSize(), 0, 'Page size should be 0'); // Page size should be 0 if not paginated
        assertArrayLength(rs.getRows(), 0, 'Current page should be empty');

        await rs.close();
        console.log('  testEmptyResultSetWithPagination: finished');
    }

    // Test Case 8: Pagination with page size larger than total rows
    async function testPaginationPageSizeLargerThanTotal() {
        console.log('  testPaginationPageSizeLargerThanTotal: started');
        const pageSize = 10; // Larger than sampleData.length (7)
        const rs = new ResultSet(sampleData, pageSize);

        assertFalse(rs._isPaginated, 'Should not be paginated');
        assertEqual(rs.getTotalNumberOfRows(), sampleData.length, 'Total rows should match input data length');
        assertEqual(rs.getTotalPages(), 1, 'Should have 1 total page');
        assertEqual(rs.getCurrentPageNumber(), 0, 'Should start at page 0');
        assertEqual(rs.getPageSize(), 0, 'Page size should be 0.');
        assertArrayLength(rs.getRows(), sampleData.length, 'Current page should contain all rows');
        assertFalse(rs.hasMorePages(), 'Should not have more pages');

        await rs.close();
        console.log('  testPaginationPageSizeLargerThanTotal: finished');
    }

    // Run all tests
    try {
        await testInitWithoutPagination();
        await testInitWithPagination();
        await testCursorMovementNoPagination();
        await testCursorMovementWithPagination();
        await testGoToPage();
        await testEmptyResultSet();
        await testEmptyResultSetWithPagination();
        await testPaginationPageSizeLargerThanTotal();

        console.log('All ResultSet tests passed!');
    } catch (error) {
        console.error('ResultSet test failed:', error.message);
        // Optionally re-throw the error if you want the process to exit with a non-zero code
        // throw error;
    }
}

// Execute the test suite
runTests();