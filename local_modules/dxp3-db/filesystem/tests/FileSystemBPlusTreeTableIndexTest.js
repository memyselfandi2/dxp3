const path = require('path');
const fs = require('fs').promises;
const FileSystemBPlusTreeTableIndex = require('../FileSystemBPlusTreeTableIndex'); // Adjust the path if necessary
const ColumnType = require('../../ColumnType'); // Adjust the path if necessary
const RecordFile = require('../RecordFile'); // Adjust the path if necessary

// Mock Table and Column for testing
class MockTable {
    constructor(uuid, columns) {
        this._uuid = uuid;
        this._columns = columns;
    }

    getUUID() {
        return this._uuid;
    }

    getColumnByUUID(columnUUID) {
        return this._columns.find(col => col.getUUID() === columnUUID);
    }
}

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
}

// Mock DataFile for testing
class MockDataFile {
    constructor() {
        this.records = [];
        this.deletedRecords = [];
        this.nextIndex = 0;
    }

    async readRecord(index) {
        if (index < 0 || index >= this.records.length) {
            return null;
        }
        return this.records[index];
    }

    async appendRecord(record) {
        record._index = this.nextIndex++;
        this.records.push(record);
        return record._index;
    }

    async updateRecord(index, record) {
        if (index < 0 || index >= this.records.length) {
            throw new Error(`Index out of bounds: ${index}`);
        }
        this.records[index] = record;
    }

    async deleteRecord(index) {
        if (index < 0 || index >= this.records.length) {
            throw new Error(`Index out of bounds: ${index}`);
        }
        this.deletedRecords.push(this.records[index]);
        this.records[index] = null;
    }

    async getNumberOfRecords() {
        return this.records.length;
    }

    async getNumberOfDeletedRecords() {
        return this.deletedRecords.length;
    }

    async clear() {
        this.records = [];
        this.deletedRecords = [];
        this.nextIndex = 0;
    }
}

async function runTests() {
    const testFolder = path.join(__dirname, 'test_index192');
    const testUUID = 'test-index';
    const testName = 'Test Index';
    const tableUUID = 'test-table';
    const columnUUID = 'test-column';
    const columnName = 'testColumn';

    // Create the test folder if it doesn't exist
    try {
        await fs.mkdir(testFolder, { recursive: true });
    } catch (err) {
        console.error('Error creating test folder:', err);
        return;
    }

    // Create mock table, column, and data file
    const mockColumn = new MockColumn(columnUUID, columnName, ColumnType.STRING);
    const mockTable = new MockTable(tableUUID, [mockColumn]);
    const mockDataFile = new MockDataFile();

    // Create the index
    const index = new FileSystemBPlusTreeTableIndex(testFolder, testUUID, testName, mockTable, columnUUID, mockDataFile);

    // Initialize the index
    await index.init();

    // Test insertion
    console.log('Testing insertion...');
    await index.insert('apple', 0);
    await index.insert('banana', 1);
    await index.insert('banana', 1001);
    await index.insert('banana', 102);
    await index.insert('banana', 103);
    await index.insert('banana', 104);
    await index.insert('banana', 105);
    await index.insert('banana', 106);
    await index.insert('cherry', 2);
    await index.insert('date', 3);
    await index.insert('elderberry', 4);
    await index.insert('fig', 5);
    await index.insert('grape', 6);
    await index.insert('honeydew', 7);
    await index.insert('imbe', 8);
    await index.insert('jackfruit', 9);
    await index.insert('kiwi', 10);
    await index.insert('lemon', 11);
    await index.insert('mango', 12);
    await index.insert('nectarine', 13);
    await index.insert('orange', 14);
    await index.insert('papaya', 15);
    await index.insert('quince', 16);
    await index.insert('raspberry', 17);
    await index.insert('strawberry', 18);
    await index.insert('tangerine', 19);
    await index.insert('ugli', 20);
    await index.insert('vanilla', 21);
    await index.insert('watermelon', 22);
    await index.insert('xigua', 23);
    await index.insert('yellow', 24);
    await index.insert('zucchini', 25);

    console.log('Insertion test complete.');
    console.log('Index after insertion:');
    console.log(await index.toString());

    // Test deletion
    console.log('Testing deletion...');
    await index.delete('banana', 1);
    await index.delete('cherry', 2);
    await index.delete('date', 3);
    await index.delete('elderberry', 4);
    await index.delete('fig', 5);
    await index.delete('grape', 6);
    await index.delete('honeydew', 7);
    await index.delete('imbe', 8);
    await index.delete('jackfruit', 9);
    await index.delete('kiwi', 10);
    await index.delete('lemon', 11);
    await index.delete('mango', 12);
    await index.delete('nectarine', 13);
    await index.delete('orange', 14);
    await index.delete('papaya', 15);
    await index.delete('quince', 16);
    await index.delete('raspberry', 17);
    await index.delete('strawberry', 18);
    await index.delete('tangerine', 19);
    await index.delete('ugli', 20);
    await index.delete('vanilla', 21);
    await index.delete('watermelon', 22);
    await index.delete('xigua', 23);
    await index.delete('yellow', 24);
    await index.delete('zucchini', 25);
    await index.delete('apple', 0);

    console.log('Deletion test complete.');
    console.log('Index after deletion:');
    console.log(await index.toString());

    // Test refresh
    console.log('Testing refresh...');
    await index.refresh();
    console.log('Refresh test complete.');
    console.log('Index after refresh:');
    console.log(await index.toString());

    // Close the index
    await index.close();

    // Clean up the test folder
    try {
        await fs.rm(testFolder, { recursive: true, force: true });
    } catch (err) {
        console.error('Error cleaning up test folder:', err);
    }
}

runTests();
