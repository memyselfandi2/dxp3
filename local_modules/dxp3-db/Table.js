/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-db
 *
 * NAME
 * Table
 */
const packageName = 'dxp3-db';
const moduleName = 'Table';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * @module dxp3-db/Table
 */
const Column = require('./Column');
const StringColumn = require('./StringColumn');
const DatabaseError = require('./DatabaseError');
const logging = require('dxp3-logging');
const mutex = require('dxp3-mutex-inmemory');
const sql = require('dxp3-lang-sql');
const util = require('dxp3-util');
const UUID = require('dxp3-uuid');

const Assert = util.Assert;
const logger = logging.getLogger(canonicalName);

class Table extends sql.SQLTable {
    /*********************************************
     * CONSTRUCTOR
     ********************************************/

    /**
     * @param {String} _uuid
     * @param {String} _name
     * @param {Column|Array<Column>} _columns
     */
	constructor(_uuid, _name, _columns) {
        super();
        this._uuid = _uuid;
        this._name = _name;
        // We need to maintain the order of the columns, so we use an array.
        this._columns = [];
        // All SQL commands deal with column names and not with unique identifiers (UUID's).
        this._columnNames = [];
        // Because column names can change we need mappings from column name to their identifier (UUID).
        this._columnNameToUUID = new Map();
        // For convenience purposes we also maintain a mapping from UUID to column name.
        this._columnUUIDToName = new Map();
        if(_columns != undefined && _columns != null) {
            if(_columns instanceof Column) {
                _columns = [_columns];
            }
            if(Array.isArray(_columns)) {
                for(let i=0;i < _columns.length;i++) {
                    let column = _columns[i];
                    this._columns.push(column);
                    this._columnNames.push(column.getName());
                    this._columnUUIDToName.set(column.getUUID(), column.getName());
                    this._columnNameToUUID.set(column.getName(), column.getUUID());
                }
            }
        }
        // The order of indices is not important, so we can use a map.
        // The key is the UUID of the index.
        this._tableIndices = new Map();
        this._tableIndexNameToUUID = new Map();
        this._tableIndexUUIDByColumnUUID = new Map();
        this._tableIndexUUIDByColumnName = new Map();
        this._readWriteLock = new mutex.ReadWriteLock({timeout:5000});
	}

    /*********************************************
     * PROTECTED METHODS
     ********************************************/

    _getDefaultTableIndex(_columnName) {
        throw DatabaseError.NOT_IMPLEMENTED;
    }

    /*********************************************
     * PUBLIC METHODS
     ********************************************/

    async addColumns(_columns) {
        logger.trace('addColumns(...): start.');
        let writeLock = null;
        try {
            writeLock = await this._readWriteLock.writeLock(this._uuid);
            for(let i=0;i < _columns.length;i++) {
                let _column = _columns[i];
                let found = this._columnNames.includes(_column.getName());
                if(!found) {
                    this._columns.push(_column);
                    this._columnNames.push(_column.getName());
                    this._columnUUIDToName.set(_column.getUUID(), _column.getName());
                    this._columnNameToUUID.set(_column.getName(), _column.getUUID());
                }
            }
            await this._addColumns(_columns);
        } catch(_exception) {
            logger.warn('addColumns(...): ' + _exception);
        } finally {
            if(writeLock != null) {
                writeLock.release();
            }
            logger.trace('addColumns(...): end.');
        }
    }

    async _addColumns(_columns) {
    }

    // Alias of createIndex
    async addTableIndex(_uuid, _tableIndexName, _columnName, _indexType) {
        return createIndex(_uuid, _tableIndexName, _columnName, _indexType);
    }
    // Alias of createIndex
    async createTableIndex(_uuid, _tableIndexName, _columnName, _indexType) {
        return createIndex(_uuid, _tableIndexName, _columnName, _indexType);
    }
    // Alias of createIndex
    async addIndex(_uuid, _indexName, _columnName, _indexType) {
        return createIndex(_uuid, _indexName, _columnName, _indexType);
    }

    async createIndex(_uuid, _indexName, _columnName, _indexType) {
        logger.trace('createIndex(...): start.');
        if(arguments.length === 2) {
            _uuid = null;
            _indexName = arguments[0];
            _columnName = arguments[1];
            _indexType = '';
        } else if(arguments.length === 3) {
            _uuid = arguments[0];
            _indexName = arguments[1];
            _columnName = arguments[2];
            _indexType = '';
        }
        // Defensive programming...check input...
        if(Assert.isUndefinedOrNullOrNotAStringOrEmpty(_columnName)) {
            logger.warn('createIndex(...): _columnName is undefined, null, empty or not a string.');
            logger.trace('createIndex(...): end.');
            throw DatabaseError.ILLEGAL_ARGUMENT;
        }
        if(_uuid === undefined || _uuid === null) {
            _uuid = UUID.newInstance();
        }
        let columnUUID = this._columnNameToUUID.get(_columnName);
        if(Assert.isUndefinedOrNullOrNotAStringOrEmpty(columnUUID)) {
            logger.warn('createIndex(...): Unknown column \'' + _columnName + '\'.');
            logger.trace('createIndex(...): end.');
            throw DatabaseError.ILLEGAL_ARGUMENT;
        }
        let tableIndex = await this.createIndexWithColumnUUID(_uuid, _indexName, columnUUID, _indexType);
        logger.trace('createIndex(...): end.');
        return tableIndex;
    }

    async createIndexWithColumnUUID(_uuid, _indexName, _columnUUID, _indexType) {
        logger.trace('createIndexWithColumnUUID(...): start.');
        // Defensive programming...check input...
        if(Assert.isUndefinedOrNullOrNotAStringOrEmpty(_uuid)) {
            logger.warn('createIndexWithColumnUUID(...): _uuid is undefined, null, empty or not a string.');
            logger.trace('createIndexWithColumnUUID(...): end.');
            throw DatabaseError.FILE_NOT_FOUND;
        }
        if(Assert.isUndefinedOrNullOrNotAStringOrEmpty(_indexName)) {
            logger.warn('createIndexWithColumnUUID(...): _indexName is undefined, null, empty or not a string.');
            logger.trace('createIndexWithColumnUUID(...): end.');
            throw DatabaseError.ILLEGAL_ARGUMENT;
        }
        _indexName = _indexName.trim();
        if(this.hasIndex(_indexName)) {
            logger.warn('createIndexWithColumnUUID(...): An index with name \'' + _indexName + '\' already exists.');
            logger.trace('createIndexWithColumnUUID(...): end.');
            throw DatabaseError.CONFLICT;
        }
        if(Assert.isUndefinedOrNullOrNotAStringOrEmpty(_columnUUID)) {
            logger.warn('createIndexWithColumnUUID(...): _columnUUID is undefined, null, empty or not a string.');
            logger.trace('createIndexWithColumnUUID(...): end.');
            throw DatabaseError.ILLEGAL_ARGUMENT;
        }
        let tableIndex = await this._createIndexWithColumnUUID(_uuid, _indexName, _columnUUID, _indexType);
        this._tableIndices.set(_uuid, tableIndex);
        this._tableIndexNameToUUID.set(tableIndex.getName(), _uuid);
        this._tableIndexUUIDByColumnUUID.set(_columnUUID, _uuid);
        let columnName = this._columnUUIDToName.get(_columnUUID);
        this._tableIndexUUIDByColumnName.set(columnName, _uuid);
        logger.trace('createIndexWithColumnUUID(...): end.');
        return tableIndex;
    }

    async _createIndexWithColumnUUID(_uuid, _indexName, _columnUUID, _indexType) {
        throw DatabaseError.NOT_IMPLEMENTED;
    }

    // Alias of deleteIndex
    async dropTableIndex(_tableIndexName) {
        return deleteIndex(_tableIndexName);
    }
    // Alias of deleteIndex
    async deleteTableIndex(_tableIndexName) {
        return deleteIndex(_tableIndexName);
    }
    // Alias of deleteIndex
    async dropIndex(_indexName) {
        return deleteIndex(_indexName);
    }

    async deleteIndex(_indexName) {
        logger.trace('deleteIndex(...): start.');
        let tableIndexUUID = this._tableIndexNameToUUID.get(_indexName);
        if(tableIndexUUID === undefined || tableIndexUUID === null) {
            // Not too worried. Apparently it is already gone.
            logger.trace('deleteIndex(...): end.');
            return null;
        }
        let tableIndex = this._tableIndices.get(tableIndexUUID);
        if(tableIndex === undefined || tableIndex === null) {
            // Not too worried. Apparently it is already gone.
            this._tableIndexNameToUUID.delete(_indexName);
            logger.trace('deleteIndex(...): end.');
            return tableIndexUUID;
        }
        let columnUUID = tableIndex.getColumnUUID();
        let columnName = this._columnUUIDToName.get(columnUUID);
        this._tableIndices.delete(tableIndex.getUUID());
        this._tableIndexNameToUUID.delete(tableIndex.getName());
        this._tableIndexUUIDByColumnUUID.delete(columnUUID);
        this._tableIndexUUIDByColumnName.delete(columnName);
        tableIndex.close();
        logger.trace('deleteIndex(...): end.');
        return tableIndexUUID;
    }

    async renameIndex(_from, _to) {
        logger.trace('renameIndex(...): start.');
        _to = _to.trim();
        if(this.hasIndex(_to)) {
            logger.trace('renameIndex(...): end.');
            throw DatabaseError.CONFLICT;
        }
        let tableIndexUUID = this._tableIndexNameToUUID.get(_from);
        if(tableIndexUUID === undefined || tableIndexUUID === null) {
            logger.trace('renameIndex(...): end.');
            throw DatabaseError.FILE_NOT_FOUND;
        }
        this._tableIndexNameToUUID.delete(_from);
        this._tableIndexNameToUUID.set(_to, tableIndexUUID);
        let tableIndex = this._tableIndices.get(tableIndexUUID);
        tableIndex.setName(_to);
        logger.trace('renameIndex(...): end.');
    }

    async alterColumns(_columns) {
        logger.trace('alterColumns(...): start.');
        let writeLock = null;
        try {
            writeLock = await this._readWriteLock.writeLock(this._uuid);
            let indicesToRefresh = [];
            for(let i=0;i < _columns.length;i++) {
                let newColumn = _columns[i];
                for(let j=0;j < this._columns.length;j++) {
                    let currentColumn = this._columns[j];
                    let currentColumnName = currentColumn.getName();
                    if(currentColumnName === newColumn.getName()) {
                        // Keep track of any indices we need to refresh afterwards.
                        let tableIndexUUID = this._tableIndexUUIDByColumnName.get(currentColumnName);
                        if(tableIndexUUID != undefined && tableIndexUUID != null) {
                            let tableIndex = this._tableIndices.get(tableIndexUUID);
                            indicesToRefresh.push(tableIndex);
                        }
                        // We are keeping the column UUID.
                        newColumn.setUUID(currentColumn.getUUID());
                        this._columns[j] = newColumn;
                        break;
                    }
                }
            }
            await this._alterColumns(_columns);
            // refresh any indices.
            for(let i=0;i < indicesToRefresh.length;i++) {
                let tableIndex = indicesToRefresh[i];
                await tableIndex.refresh();
            }
        } catch(_exception) {
            logger.warn('alterColumns(...): ' + _exception);
        } finally {
            if(writeLock != null) {
                writeLock.release();
            }
            logger.trace('alterColumns(...): end.');
        }
    }

    async _alterColumns(_columns) {
    }

    async count(_sqlCondition) {
        throw DatabaseError.NOT_IMPLEMENTED;
    }

    async deleteFrom(_sqlCondition) {
        throw DatabaseError.NOT_IMPLEMENTED;
    }

    async desc() {
        throw DatabaseError.NOT_IMPLEMENTED;
    }

    async dropColumns(_columnNames) {
        logger.trace('dropColumns(...): start.');
        try {
            let writeLock = await this._readWriteLock.writeLock(this._uuid);
            // We need to drop any indices as well.
            // We need to do that first.
            for(let i=0;i < _columnNames.length;i++) {
                let columnName = _columnNames[i];
                let tableIndexUUID = this._tableIndexUUIDByColumnName.get(columnName);
                if(tableIndexUUID != undefined && tableIndexUUID != null) {
                    let tableIndex = this._tableIndices.get(tableIndexUUID);
                    let columnUUID = tableIndex.getColumnUUID();
                    let columnName = this._columnUUIDToName.get(columnUUID);
                    this._tableIndices.delete(tableIndex.getUUID());
                    this._tableIndexNameToUUID.delete(tableIndex.getName());
                    this._tableIndexUUIDByColumnUUID.delete(columnUUID);
                    this._tableIndexUUIDByColumnName.delete(columnName);
                    tableIndex.close();
                }
                // Now that the index on this column is closed and deleted, we can
                // drop the column.
                for(let j=0;j < this._columns.length;j++) {
                    let column = this._columns[j];
                    if(column.getName() === columnName) {
                        this._columns.splice(j,1);
                        this._columnNames.splice(j, 1);
                        this._columnUUIDToName.delete(column.getUUID());
                        this._columnNameToUUID.delete(column.getName());
                        break;
                    }
                }
            }
            await this._dropColumns(_columnNames);
            writeLock.release();
        } catch(_exception) {
            logger.warn('dropColumns(...): ' + _exception);
        } finally {
            logger.trace('dropColumns(...): end.');
        }
    }

    async _dropColumns(_columnNames) {
    }

    async insertInto(_columnNames, _values) {
        logger.trace('insertInto(...): start.');
        let startColumn = 0;
        if(_columnNames === undefined || _columnNames === null) {
            _columnNames = [...this._columnNames];
            // we ignore the first _uuid column.
            // That one is auto-generated.
            _columnNames.shift();
        }
        let object = {};
        for(let i=0;i < _columnNames.length;i++) {
            let columnName = _columnNames[i].trim();
            object[columnName] = _values[i];
        }
        let result = await this.insertOne(object);
        logger.trace('insertInto(...): end.');
        return result;
    }

	async insertMany(_array) {
        let result = {
            ids: [],
            nInserted: 0
        };
        let writeLock = null;
        try {
            writeLock = await this._readWriteLock.writeLock(this._uuid);
            for(let i=0;i < _array.length;i++) {
                _array[i]._uuid = UUID.new();
            }
            result = await this._insertMany(_array);
        } catch(_exception) {
        } finally {
            if(writeLock != null) {
                writeLock.release();
            }
        }
        return result;
	}

    async _insertMany(_array) {
        throw DatabaseError.NOT_IMPLEMENTED;
    }

	async insertOne(_object) {
        let result = {
            ids: [],
            nInserted: 0
        };
        let writeLock = null;
        try {
            writeLock = await this._readWriteLock.writeLock(this._uuid);
            _object._uuid = UUID.new();
            result = await this._insertOne(_object);
        } catch(_exception) {
            logger.warn('insertOne(...): ' + _exception);
        } finally {
            if(writeLock != null) {
                writeLock.release();
            }
        }
        return result;
	}

    async _insertOne() {
        throw DatabaseError.NOT_IMPLEMENTED;
    }

    async renameColumns(_currentColumnNames, _newColumnNames) {
        logger.trace('renameColumns(...): start.');
        let writeLock = null;
        try {
            writeLock = await this._readWriteLock.writeLock(this._uuid);
            for(let i=0;i < _currentColumnNames.length;i++) {
                let currentColumnName = _currentColumnNames[i];
                for(let j=0;j < this._columns.length;j++) {
                    let column = this._columns[j];
                    if(column.getName() === currentColumnName) {
                        let newColumnName = _newColumnNames[i];
                        this._columnNameToUUID.delete(column.getName());
                        column.setName(newColumnName);
                        this._columnNameToUUID.set(newColumnName, column.getUUID());
                        this._columnNames[j] = newColumnName;
                        this._columnUUIDToName.set(column.getUUID(), newColumnName);
                        break;
                    }
                }
                // Update all our indices.
                let tableIndexUUID = this._tableIndexUUIDByColumnName.get(currentColumnName);
                if(tableIndexUUID != undefined && tableIndexUUID != null) {
                    this._tableIndexUUIDByColumnName.delete(currentColumnName);
                    this._tableIndexUUIDByColumnName.set(newColumnName, tableIndexUUID);
                }
            }
            await this._renameColumns(_currentColumnNames, _newColumnNames);
        } catch(_exception) {
            logger.warn('renameColumns(...): ' + _exception);
        } finally {
            if(writeLock != null) {
                writeLock.release();
            }
            logger.trace('renameColumns(...): end.');
        }
    }

    async _renameColumns(_currentColumnNames, _newColumnNames) {
    }

    async selectAll(_orderBy) {
        let result = [];
        let readLock = null;
        try {
            readLock = await this._readWriteLock.readLock(this._uuid);
            result = await this._selectAll(_orderBy);
            readLock.release();
            readLock = null;
        } catch(_exception) {

        } finally {
            if(readLock != null) {
                readLock.release();
            }
        }
        return result;
    }

    async _selectAll(_orderBy) {
        throw DatabaseError.NOT_IMPLEMENTED;
    }

    async selectSlice(_columns, _sqlCondition) {
        throw DatabaseError.NOT_IMPLEMENTED;
    }

    async selectSubset(_sqlCondition) {
        throw DatabaseError.NOT_IMPLEMENTED;
    }

    async update(_columns, _values, _sqlCondition) {
        throw DatabaseError.NOT_IMPLEMENTED;
    }

    /*********************************************
     * GETTERS
     ********************************************/

    // Alias of hasIndex
    hasTableIndex(_tableIndexName) {
        return hasIndex(_tableIndexName);
    }

    hasIndex(_indexName) {
        logger.trace('hasIndex(...): start.');
        // Defensive programming...check input...
        if(Assert.isUndefinedOrNullOrNotAStringOrEmpty(_indexName)) {
            logger.warn('hasIndex(...): _indexName is undefined, null, empty or not a string.');
            logger.trace('hasIndex(...): end.');
            throw DatabaseError.ILLEGAL_ARGUMENT;
        }
        _indexName = _indexName.trim();
        let result = this._tableIndexNameToUUID.has(_indexName);
        logger.trace('hasIndex(...): end.');
        return result;
    }

    getColumnByUUID(_columnUUID) {
        logger.trace('getColumnByUUID(...): start.');
        // Defensive programming...check input...
        if(Assert.isUndefinedOrNullOrNotAStringOrEmpty(_columnUUID)) {
            logger.warn('getColumnByUUID(...): _columnUUID is undefined, null, empty or not a string.');
            logger.trace('getColumnByUUID(...): end.');
            throw DatabaseError.ILLEGAL_ARGUMENT;
        }
        _columnUUID = _columnUUID.trim();
        for(let i=0;i < this._columns.length;i++) {
            let column = this._columns[i];
            if(column.getUUID() === _columnUUID) {
                logger.debug('getColumnByUUID(...): Found column with UUID: ' + _columnUUID);
                logger.trace('getColumnByUUID(...): end.');
                return column;
            }
        }
        logger.debug('getColumnByUUID(...): Did NOT find column with UUID: ' + _columnUUID);
        logger.trace('getColumnByUUID(...): end.');
        return null;
    }

    get columns() {
        return this.getColumns();
    }

    getColumns() {
        return this._columns;
    }

    get name() {
        return this.getName();
    }

    getName() {
        return this._name;
    }

    getSQLTableIndex(_columnName) {
        logger.trace('getSQLTableIndex(...): start.');
        _columnName = _columnName.toString();
        logger.trace('getSQLTableIndex(...): columnName : ' + _columnName);
        let tableIndexUUID = this._tableIndexUUIDByColumnName.get(_columnName);
        logger.debug('getSQLTableIndex(...): column with name name \'' + _columnName + '\' has tableIndexUUID \'' + tableIndexUUID + '\'.');
        let sqlTableIndex = this._tableIndices.get(tableIndexUUID);
        if(sqlTableIndex === undefined || sqlTableIndex === null) {
            logger.debug('getSQLTableIndex(...): column with name name \'' + _columnName + '\' does not have an index.');
            return this._getDefaultTableIndex(_columnName);
        }
        logger.trace('getSQLTableIndex(...): end.');
        return sqlTableIndex;
    }

    get UUID() {
        return this.getUUID();
    }

    getUUID() {
        return this._uuid;
    }


    /*********************************************
     * SETTERS
     ********************************************/

    set name(_name) {
        this.setName(_name);
    }

    setName(_name) {
        this._name = _name;
    }

    setDefaultTableIndex(_tableIndex) {
        this._defaultTableIndex = _tableIndex;
    }
}
// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
   util.Help.print(Table);
   return;
}
module.exports = Table;