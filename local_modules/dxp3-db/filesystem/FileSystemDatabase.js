/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-db/filesystem
 *
 * NAME
 * FileSystemDatabase
 */
const packageName = 'dxp3-db/filesystem';
const moduleName = 'FileSystemDatabase';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;

const ColumnType = require('../ColumnType');
const BooleanColumn = require('../BooleanColumn');
const DateColumn = require('../DateColumn');
const DoubleColumn = require('../DoubleColumn');
const FloatColumn = require('../FloatColumn');
const IntegerColumn = require('../IntegerColumn');
const StringColumn = require('../StringColumn');
const BooleanArrayColumn = require('../BooleanArrayColumn');
const DateArrayColumn = require('../DateArrayColumn');
const DoubleArrayColumn = require('../DoubleArrayColumn');
const FloatArrayColumn = require('../FloatArrayColumn');
const IntegerArrayColumn = require('../IntegerArrayColumn');
const StringArrayColumn = require('../StringArrayColumn');
const DatabaseError = require('../DatabaseError');
const FileSystemBPlusTreeTableIndex = require('./FileSystemBPlusTreeTableIndex');
const FileSystemSequence = require('./FileSystemSequence');
const FileSystemTable = require('./FileSystemTable');
const fs = require('fs').promises;
const logging = require('dxp3-logging');
const util = require('dxp3-util');
const UUID = require('dxp3-uuid');

const Assert = util.Assert;
const logger = logging.getLogger(canonicalName);

const DEFINITION_FILE_SUFFIX = ".db";
const TABLE_DEFINITION_FILE_SUFFIX = "_tables.def";
const SEQUENCE_DEFINITION_FILE_SUFFIX = "_sequences.def";
const INDEX_DEFINITION_FILE_SUFFIX = "_indices.def";

class FileSystemDatabase {
    /*********************************************
     * CONSTRUCTOR
     ********************************************/

	/**
	 * Constructor for the FileSystemDatabase class.
	 * @param {string} _name - The name of the database.
	 * @param {string} _sourceFolder - The source folder for the database.
	 */
	constructor(_name, _sourceFolder) {
		logger.trace('constructor(...): start.');
		// Defensive programming...check input..
		if(Assert.isUndefinedOrNullOrNotAStringOrEmpty(_name)) {
			logger.warn('constructor(...): _name is undefined, null, empty or not a string.');
			logger.trace('constructor(...): end.');
			throw DatabaseError.ILLEGAL_ARGUMENT;
		}
		this._name = _name.trim();
		if(Assert.isUndefinedOrNullOrNotAStringOrEmpty(_sourceFolder)) {
			logger.warn('constructor(...): _sourceFolder is undefined, null, empty or not a string.');
			logger.trace('constructor(...): end.');
			throw DatabaseError.ILLEGAL_ARGUMENT;
		}
		_sourceFolder = _sourceFolder.trim();
		if(!_sourceFolder.endsWith(path.sep)) {
        	_sourceFolder += path.sep;
    	}
		this._sourceFolder = _sourceFolder;
		// Our database definition file.
		// This file contains pointers to our tables, sequences and indices files.
        this._definitionFile = null;
        // File containing our list of indices.
        this._indicesFile = null;
        // File containing our list of sequences.
        this._sequencesFile = null;
        // File containing our list of tables.
        this._tablesFile = null;
		this._indices = new Map();
		this._sequences = new Map();
		this._sequenceNameToUUID = new Map();
		this._tables = new Map();
		this._tableNameToUUID = new Map();
		this._uuid = null;
		logger.info('Name         : \'' + this._name + '\'.');
		logger.info('Source folder: \'' + this._sourceFolder + '\'.');
		logger.trace('constructor(...): end.');
	}

    /*********************************************
     * PRIVATE METHODS
     ********************************************/

	async _closeDatabase() {
	}

	async _closeSequences() {
		for(let [sequenceUUID, sequence] of this._sequences) {
			await sequence.close();
		}
	}

	async _closeTables() {
		for(let [tableUUID, table] of this._tables) {
			await table.close();
		}
	}

	async _readDatabase() {
		logger.trace('_readDatabase(): start.');
		let fileHandle = null;
		try {
			fileHandle = await fs.open(this._definitionFile);
			let rawData = await fileHandle.readFile("utf-8");
			let definition = JSON.parse(rawData);
			this._uuid = definition.uuid;
	        this._tablesFile = this._sourceFolder + this._uuid + TABLE_DEFINITION_FILE_SUFFIX;
	        this._sequencesFile = this._sourceFolder + this._uuid + SEQUENCE_DEFINITION_FILE_SUFFIX;
	        this._indicesFile = this._sourceFolder + this._uuid + INDEX_DEFINITION_FILE_SUFFIX;
			logger.info('Tables definition file   : \'' + this._tablesFile + '\'.');
			logger.info('Sequences definition file: \'' + this._sequencesFile + '\'.');
			logger.info('Indices definition file  : \'' + this._indicesFile + '\'.');
		} catch(_exception) {
			if(_exception.code === 'ENOENT') {
				logger.error('_readDatabase(): Database definition file \'' + this._definitionFile + '\' not found.');
				throw DatabaseError.FILE_NOT_FOUND;
			}
			logger.error('_readDatabase(): ' + _exception);
			throw _exception;
		} finally {
			if(fileHandle != null) {
				await fileHandle.close();
				fileHandle = null;
			}
			logger.trace('_readDatabase(): end.');
		}
	}

	async _readSequences() {
		logger.trace('_readSequences(): start.');
		this._sequences = new Map();
		let fileHandle = null;
		try {
			fileHandle = await fs.open(this._sequencesFile);
			let rawData = await fileHandle.readFile("utf-8");
			let sequenceDefinitionArray = JSON.parse(rawData);
			for(let i=0;i < sequenceDefinitionArray.length;i++) {
				let sequenceDefinition = sequenceDefinitionArray[i];
				let sequenceName = sequenceDefinition.name;
				let sequenceUUID = sequenceDefinition.uuid;
				let sequence = new FileSystemSequence(this._sourceFolder, sequenceUUID, sequenceName);
				await sequence.init();
				this._sequences.set(sequenceUUID, sequence);
				this._sequenceNameToUUID.set(sequenceName, sequenceUUID);
			}
		} catch(_exception) {
			if(_exception.code === 'ENOENT') {
				logger.error('_readSequences(): Sequences definition file \'' + this._sequencesFile + '\' not found.');
				throw DatabaseError.FILE_NOT_FOUND;
			}
			logger.error('_readSequences(): ' + _exception);
			throw _exception;
		} finally {
			if(fileHandle != null) {
				await fileHandle.close();
			}
			logger.trace('_readSequences(): end.');
		}
	}

	async _readIndices() {
		logger.trace('_readIndices(): start.');
		this._indices = new Map();
		let fileHandle = null;
		try {
			fileHandle = await fs.open(this._indicesFile);
			let rawData = await fileHandle.readFile("utf-8");
			let indicesDefinitionArray = JSON.parse(rawData);
			for(let i=0;i < indicesDefinitionArray.length;i++) {
				let indexDefinition = indicesDefinitionArray[i];
				let indexUUID = indexDefinition.uuid;
				let indexName = indexDefinition.name;
				let tableUUID = indexDefinition.tableUUID;
				let table = this._tables.get(tableUUID);
				let columnUUID = indexDefinition.columnUUID;
				let indexType = indexDefinition.type;
				let tableIndex = await table.createIndexWithColumnUUID(indexUUID, indexName, columnUUID, indexType);
				this._indices.set(indexUUID, tableIndex);
			}
		} catch(_exception) {
			if(_exception.code === 'ENOENT') {
				logger.error('_readIndices(): Indices definition file \'' + this._indicesFile + '\' not found.');
				throw DatabaseError.FILE_NOT_FOUND;
			}
			logger.error('_readIndices(): ' + _exception);
			throw _exception;
		} finally {
			if(fileHandle != null) {
				await fileHandle.close();
				fileHandle = null;
			}
			logger.trace('_readIndices(): end.');
		}
	}

	async _readTables() {
		logger.trace('_readTables(): start.');
		this._tables = new Map();
		let fileHandle = null;
		try {
			fileHandle = await fs.open(this._tablesFile);
			let rawData = await fileHandle.readFile("utf-8");
			let tableDefinitionArray = JSON.parse(rawData);
			for(let i=0;i < tableDefinitionArray.length;i++) {
				let table = null;
				let tableDefinition = tableDefinitionArray[i];
				let tableName = tableDefinition.name;
				let tableUUID = tableDefinition.uuid;
				let tableColumns = tableDefinition.columns;
				if(tableColumns === undefined || tableColumns === null) {
					table = new FileSystemTable(this._sourceFolder, tableUUID, tableName);
				} else {
					let columns = [];
					for(let j=0;j < tableColumns.length;j++) {
						let columnDefinition = tableColumns[j];
						let columnName = columnDefinition.name;
						let columnTypeAsString = columnDefinition.type;
						let columnUUID = columnDefinition.uuid;
						// Old definition files may not have a UUID for the column.
						if(columnUUID === undefined || columnUUID === null) {
							columnUUID = UUID.newInstance();
						}
						let columnType = ColumnType.parse(columnTypeAsString);
						let column = null;
						if(columnType.equals(ColumnType.BOOLEAN)) {
							column = new BooleanColumn(columnUUID, columnName);
						} else if(columnType.equals(ColumnType.BOOLEAN_ARRAY)) {
							column = new BooleanArrayColumn(columnUUID, columnName);
						} else if(columnType.equals(ColumnType.DATE)) {
							column = new DateColumn(columnUUID, columnName);
						} else if(columnType.equals(ColumnType.DATE_ARRAY)) {
							column = new DateArrayColumn(columnUUID, columnName);
						} else if(columnType.equals(ColumnType.DOUBLE)) {
							column = new DoubleColumn(columnUUID, columnName);
						} else if(columnType.equals(ColumnType.DOUBLE_ARRAY)) {
							column = new DoubleArrayColumn(columnUUID, columnName);
						} else if(columnType.equals(ColumnType.FLOAT)) {
							column = new FloatColumn(columnUUID, columnName);
						} else if(columnType.equals(ColumnType.FLOAT_ARRAY)) {
							column = new FloatArrayColumn(columnUUID, columnName);
						} else if(columnType.equals(ColumnType.INTEGER)) {
							column = new IntegerColumn(columnUUID, columnName);
						} else if(columnType.equals(ColumnType.INTEGER_ARRAY)) {
							column = new IntegerArrayColumn(columnUUID, columnName);
						} else if(columnType.equals(ColumnType.STRING)) {
							let length = columnDefinition.length;
							if(length === undefined || length === null || length === -1) {
								column = new StringColumn(columnUUID, columnName);
							} else {
								column = new StringColumn(columnUUID, columnName, length);
							}
						} else if(columnType.equals(ColumnType.STRING_ARRAY)) {
							let length = columnDefinition.length;
							if(length === undefined || length === null || length === -1) {
								column = new StringArrayColumn(columnUUID, columnName);
							} else {
								column = new StringArrayColumn(columnUUID, columnName, length);
							}
						}
						if(column != null) {
							columns.push(column);
						}
					}
					table = new FileSystemTable(this._sourceFolder, tableUUID, tableName, columns);
				}
				await table.init();
				this._tables.set(tableUUID, table);
				this._tableNameToUUID.set(tableName, tableUUID);
			}
		} catch(_exception) {
			if(_exception.code === 'ENOENT') {
				logger.error('_readTables(...): Tables definition file \'' + this._tablesFile + '\' not found.');
				throw DatabaseError.FILE_NOT_FOUND;
			}
			logger.error('_readTables(...): ' + _exception);
			throw _exception;
		} finally {
			if(fileHandle != null) {
				await fileHandle.close();
			}
			logger.trace('_readTables(): end.');
		}
	}

	async _writeIndices() {
		logger.trace('_writeIndices(): start.');
		let tableIndexDefinitionArray = [];
		for(let [tableIndexUUID, tableIndex] of this._indices) {
			let tableIndexDefinition = {
				uuid: tableIndexUUID,
				name: tableIndex.getName(),
				tableUUID: tableIndex.getTableUUID(),
				columnUUID: tableIndex.getColumnUUID(),
				type: tableIndex.getType()
			}
			tableIndexDefinitionArray.push(tableIndexDefinition);
		}
		let fileHandle = null;
		try {
			fileHandle = await fs.open(this._indicesFile, 'w+');
			await fileHandle.writeFile(JSON.stringify(tableIndexDefinitionArray), "utf-8");
		} catch(_exception) {
			logger.error('_writeIndices(): ' + _exception);
			logger.trace('_writeIndices(): end.');
			throw DatabaseError.INTERNAL_SERVER_ERROR;
		} finally {
			if(fileHandle != null) {
				await fileHandle.close();
			}
		}
		logger.trace('_writeIndices(): end.');
	}

	async _writeSequences() {
		logger.trace('_writeSequences(): start.');
		let data = '';
		let sequenceDefinitionArray = [];
		for(let [sequenceUUID, sequence] of this._sequences) {
			let sequenceDefinition = {
				uuid: sequenceUUID,
				name: sequence.getName()
			}
			sequenceDefinitionArray.push(sequenceDefinition);
		}
		let fileHandle = null;
		try {
			fileHandle = await fs.open(this._sequencesFile, 'w+');
			await fileHandle.writeFile(JSON.stringify(sequenceDefinitionArray), "utf-8");
		} catch(_exception) {
			logger.error('_writeSequences(): ' + _exception);
			throw DatabaseError.INTERNAL_SERVER_ERROR;
		} finally {
			if(fileHandle != null) {
				await fileHandle.close();
			}
			logger.trace('_writeSequences(): end.');
		}
	}

	async _writeTables() {
		logger.trace('_writeTables(): start.');
		let tableDefinitionArray = [];
		for(let [tableUUID, table] of this._tables) {
			let tableDefinition = {
				uuid: tableUUID,
				name: table.getName()
			}
			let tableColumns = table.getColumns();
			if(tableColumns != undefined && tableColumns != null) {
				tableDefinition.columns = [];
				for(let i=0;i < tableColumns.length;i++) {
					let column = tableColumns[i];
					let columnDefinition = {
						uuid: column.getUUID(),
						name: column.getName(),
						type: column.getType().getName()
					}
					if(column.getType().equals(ColumnType.STRING)) {
						columnDefinition.length = column.getLength();
					}
					tableDefinition.columns.push(columnDefinition);
				}
			}
			tableDefinitionArray.push(tableDefinition);
		}
		let fileHandle = null;
		try {
			fileHandle = await fs.open(this._tablesFile, 'w+');
			await fileHandle.writeFile(JSON.stringify(tableDefinitionArray), "utf-8");
		} catch(_exception) {
			logger.error('_writeTables(): ' + _exception);
			logger.trace('_writeTables(): end.');
			throw DatabaseError.INTERNAL_SERVER_ERROR;
		} finally {
			if(fileHandle != null) {
				await fileHandle.close();
			}
		}
		logger.trace('_writeTables(): end.');
	}

	async _writeDatabase() {
		logger.trace('_writeDatabase(): start.');
		let definition = {};
		definition.uuid = this._uuid;
		definition.name = this._name;
		let fileHandle = null;
		try {
			fileHandle = await fs.open(this._definitionFile, 'w+');
			await fileHandle.writeFile(JSON.stringify(definition), "utf-8");
		} catch(_exception) {
			logger.error('_writeDatabase(): ' + _exception);
			logger.trace('_writeDatabase(): end.');
			throw DatabaseError.INTERNAL_SERVER_ERROR;
		} finally {
			if(fileHandle != null) {
				await fileHandle.close();
				fileHandle = null;
			}
		}
		logger.trace('_writeDatabase(): end.');
	}

    /*********************************************
     * PUBLIC METHODS
     ********************************************/

	async alterTableAddColumns(_tableName, _columns) {
		logger.trace('alterTableAddColumns(...): start.');
		let tableUUID = this._tableNameToUUID.get(_tableName);
		if(tableUUID === undefined || tableUUID === null) {
			logger.trace('alterTableAddColumns(...): end.');
			throw DatabaseError.FILE_NOT_FOUND;
		}
		let table = this._tables.get(tableUUID);
		if(table === undefined || table === null) {
			logger.trace('alterTableAddColumns(...): end.');
			throw DatabaseError.FILE_NOT_FOUND;
		}
		await table.addColumns(_columns);
		try {
			await this._writeTables();
		} catch(_exception) {
			logger.trace('alterTableAddColumns(...): end.');
			throw DatabaseError.INTERNAL_SERVER_ERROR;
		}
		logger.trace('alterTableAddColumns(...): end.');
	}

	async alterTableAlterColumns(_tableName, _columns) {
		logger.trace('alterTableAlterColumns(...): start.');
		let tableUUID = this._tableNameToUUID.get(_tableName);
		if(tableUUID === undefined || tableUUID === null) {
			logger.trace('alterTableAlterColumns(...): end.');
			throw DatabaseError.FILE_NOT_FOUND;
		}
		let table = this._tables.get(tableUUID);
		if(table === undefined || table === null) {
			logger.trace('alterTableAlterColumns(...): end.');
			throw DatabaseError.FILE_NOT_FOUND;
		}
		await table.alterColumns(_columns);
		try {
			await this._writeTables();
			await this._writeIndices();
		} catch(_exception) {
			logger.trace('alterTableAlterColumns(...): end.');
			throw DatabaseError.INTERNAL_SERVER_ERROR;
		}
		logger.trace('alterTableAlterColumns(...): end.');
	}

	async alterTableDropColumns(_tableName, _columns) {
		logger.trace('alterTableDropColumns(...): start.');
		let tableUUID = this._tableNameToUUID.get(_tableName);
		if(tableUUID === undefined || tableUUID === null) {
			logger.trace('alterTableDropColumns(...): end.');
			throw DatabaseError.FILE_NOT_FOUND;
		}
		let table = this._tables.get(tableUUID);
		if(table === undefined || table === null) {
			logger.trace('alterTableDropColumns(...): end.');
			throw DatabaseError.FILE_NOT_FOUND;
		}
		await table.dropColumns(_columns);
		try {
			await this._writeTables();
			await this._writeIndices();
		} catch(_exception) {
			logger.trace('alterTableDropColumns(...): end.');
			throw DatabaseError.INTERNAL_SERVER_ERROR;
		}
		logger.trace('alterTableDropColumns(...): end.');
	}

	async alterTableRenameColumns(_tableName, _from, _to) {
		logger.trace('alterTableRenameColumns(...): start.');
		let tableUUID = this._tableNameToUUID.get(_tableName);
		if(tableUUID === undefined || tableUUID === null) {
			logger.trace('alterTableRenameColumns(...): end.');
			throw DatabaseError.FILE_NOT_FOUND;
		}
		let table = this._tables.get(tableUUID);
		if(table === undefined || table === null) {
			logger.trace('alterTableRenameColumns(...): end.');
			throw DatabaseError.FILE_NOT_FOUND;
		}
		await table.renameColumns(_from, _to);
		try {
			await this._writeTables();
			await this._writeIndices();
		} catch(_exception) {
			logger.trace('alterTableRenameColumns(...): end.');
			throw DatabaseError.INTERNAL_SERVER_ERROR;
		}
		logger.trace('alterTableRenameColumns(...): end.');
	}

	async count(_tableName, _sqlCondition) {
		logger.trace('count(...): start.');
		let tableUUID = this._tableNameToUUID.get(_tableName);
		if(tableUUID === undefined || tableUUID === null) {
			logger.trace('count(...): end.');
			throw DatabaseError.FILE_NOT_FOUND;
		}
		let table = this._tables.get(tableUUID);
		if(table === undefined || table === null) {
			logger.trace('count(...): end.');
			throw DatabaseError.FILE_NOT_FOUND;
		}
		let result = await table.count(_sqlCondition);
		logger.trace('count(...): end.');
		return result;
	}

	async close() {
		logger.trace('close(...): start.');
		try {
        	await this._closeSequences();
        	await this._closeTables();
        	await this._closeDatabase();
		} catch(_exception) {
			if(_exception.code === 'ENOENT') {
				throw DatabaseError.FILE_NOT_FOUND;
			}
			throw _exception;
		}
		logger.trace('close(...): end.');
	}

	async init() {
		logger.trace('init(): start.');
        this._definitionFile = this._sourceFolder + this._name + DEFINITION_FILE_SUFFIX;
		logger.debug('init(): Database definition file is \'' + this._definitionFile + '\'.');
		let stats = null;
		try {
			stats = await fs.stat(this._definitionFile);
			// if the stat method did not throw any errors, we may safely assume the file exists.
			// Lets attempt to read it.
        	await this._readDatabase();
		} catch(_exception) {
			if(_exception.code === 'ENOENT') {
				logger.error('init(): Database definition file \'' + this._definitionFile + '\' not found.');
				logger.trace('init(): end.');
				throw DatabaseError.FILE_NOT_FOUND;
			}
			logger.error('init(): ' + _exception);
			logger.trace('init(): end.');
			throw _exception;
		}
		// When we reach here it means we were able to read the database definition file.
		try {
        	// Could be that we don't have any tables yet.
        	stats = await fs.stat(this._tablesFile);
        	await this._readTables();
        } catch(_exception) {
        }
        try {
        	// Could be that we don't have any sequences yet.
        	stats = await fs.stat(this._sequencesFile);
        	await this._readSequences();
        } catch(_exception) {
        }
        try {
        	// We must wait until after we have read all the tables
        	// before we read all our indices.
        	stats = await fs.stat(this._indicesFile);
        	await this._readIndices();
        } catch(_exception) {
        }
		logger.trace('init(...): end.');
	}

	async createIndex(_indexName, _tableName, _columnName, _indexType) {
		logger.trace('createIndex(...): start.');
		// Lets make sure a table with the specified name exists.
		let tableUUID = this._tableNameToUUID.get(_tableName);
		if(tableUUID === undefined || tableUUID === null) {
			logger.warn('createIndex(...): Table \'' + _tableName + '\' does not exist.');
			logger.trace('createIndex(...): end.');
			throw DatabaseError.FILE_NOT_FOUND;
		}
		let table = this._tables.get(tableUUID);
		if(table === undefined || table === null) {
			logger.warn('createIndex(...): Table \'' + _tableName + '\' and UUID \'' + tableUUID + '\' does not exist.');
			logger.trace('createIndex(...): end.');
			throw DatabaseError.FILE_NOT_FOUND;
		}
		// Lets make sure the index name is unique.
		if(table.hasIndex(_indexName)) {
			logger.debug('createIndex(...): An index with name \'' + _indexName + '\' already exists.');
			logger.trace('createIndex(...): end.');
			throw DatabaseError.CONFLICT;
		}
		let tableIndexUUID = UUID.newInstance();
		let tableIndex = await table.createIndex(tableIndexUUID, _indexName, _columnName, _indexType);
		logger.info('created index \'' + tableIndex.getName() + '\' with uuid \'' + tableIndex.getUUID() + '\'.');
		logger.info(await tableIndex.toString());
		this._indices.set(tableIndexUUID, tableIndex);
		try {
			await this._writeIndices();
		} catch(_exception) {
			this._indices.delete(tableIndexUUID);
			logger.error('createIndex(...): ' + _exception);
			logger.trace('createIndex(...): end.');
			throw DatabaseError.INTERNAL_SERVER_ERROR;
		}
		logger.trace('createIndex(...): end.');
	}

	async createSequence(_sequenceName) {
		logger.trace('createSequence(...): start.');
		if(this._sequenceNameToUUID.has(_sequenceName)) {
			logger.trace('createSequence(...): end.');
			throw DatabaseError.CONFLICT;
		}
		if(this._tableNameToUUID.has(_sequenceName)) {
			logger.trace('createSequence(...): end.');
			throw DatabaseError.CONFLICT;
		}
		let sequenceUUID = UUID.newInstance();
		let sequence = new FileSystemSequence(this._sourceFolder, sequenceUUID, _sequenceName);
		this._sequences.set(sequenceUUID, sequence);
		this._sequenceNameToUUID.set(_sequenceName, sequenceUUID);
		await sequence.init();
		try {
			await this._writeSequences();
		} catch(_exception) {
			this._sequences.delete(sequenceUUID);
			this._sequenceNameToUUID.delete(sequenceName);
			logger.error('createSequence(...): ' + _exception);
			logger.trace('createSequence(...): end.');
			throw DatabaseError.INTERNAL_SERVER_ERROR;
		}
		logger.trace('createSequence(...): end.');
	}

	async createTable(_tableName, _columns) {
		logger.trace('createTable(...): start.');
		if(this._tableNameToUUID.has(_tableName)) {
			logger.trace('createTable(...): end.');
			throw DatabaseError.CONFLICT;
		}
		if(this._sequenceNameToUUID.has(_tableName)) {
			logger.trace('createTable(...): end.');
			throw DatabaseError.CONFLICT;
		}
		let tableUUID = UUID.newInstance();
		let table = new FileSystemTable(this._sourceFolder, tableUUID, _tableName, _columns);
		this._tables.set(tableUUID, table);
		this._tableNameToUUID.set(_tableName, tableUUID);
		await table.init();
		try {
			await this._writeTables();
		} catch(_exception) {
			this._tables.delete(tableUUID);
			this._tableNameToUUID.delete(_tableName);
			logger.trace('createTable(...): end.');
			throw DatabaseError.INTERNAL_SERVER_ERROR;
		}
		logger.trace('createTable(...): end.');
	}

	async deleteFrom(_tableName, _sqlCondition) {
		logger.trace('deleteFrom(...): start.');
		let tableUUID = this._tableNameToUUID.get(_tableName);
		if(tableUUID === undefined || tableUUID === null) {
			logger.trace('deleteFrom(...): end.');
			throw DatabaseError.FILE_NOT_FOUND;
		}
		let table = this._tables.get(tableUUID);
		if(table === undefined || table === null) {
			logger.trace('deleteFrom(...): end.');
			throw DatabaseError.FILE_NOT_FOUND;
		}
		let result = await table.deleteFrom(_sqlCondition);
		logger.trace('deleteFrom(...): end.');
		return result;
	}

	// Alias of deleteSequence
	async dropSequence(_sequenceName) {
		return deleteSequence(_sequenceName);
	}

	async deleteSequence(_sequenceName) {
		logger.trace('deleteSequence(...): start.');
		let sequenceUUID = this._sequenceNameToUUID.get(_sequenceName);
		if(sequenceUUID === undefined || sequenceUUID === null) {
			logger.trace('deleteSequence(...): end.');
			throw DatabaseError.FILE_NOT_FOUND;
		}
		this._sequenceNameToUUID.delete(_sequenceName);
		let sequence = this._sequences.get(sequenceUUID);
		await sequence.close();
		this._sequences.delete(sequenceUUID);
		try {
			await this._writeSequences();
		} catch(_exception) {
			logger.trace('deleteSequence(...): end.');
			throw DatabaseError.INTERNAL_SERVER_ERROR;
		}
		logger.trace('deleteSequence(...): end.');
	}

	async deleteIndex(_indexName, _tableName) {
		let tableUUID = this._tableNameToUUID.get(_tableName);
		if(tableUUID === undefined || tableUUID === null) {
			throw DatabaseError.FILE_NOT_FOUND;
		}
		let table = this._tables.get(tableUUID);
		let tableIndexUUID = await table.deleteIndex(_indexName);
		this._indices.delete(tableIndexUUID);
		try {
			await this._writeIndices();
		} catch(_exception) {
			throw DatabaseError.INTERNAL_SERVER_ERROR;
		}
	}

	// Alias of deleteTable
	async dropTable(_tableName) {
		return deleteTable(_tableName);
	}

	async deleteTable(_tableName) {
		let tableUUID = this._tableNameToUUID.get(_tableName);
		if(tableUUID === undefined || tableUUID === null) {
			throw DatabaseError.FILE_NOT_FOUND;
		}
		this._tableNameToUUID.delete(_tableName);
		let table = this._tables.get(tableUUID);
		// delete all the indices associated with this table.
		for(const [tableIndexUUID, tableIndex] of this._indices) {
			if(tableIndex.getTableUUID() === tableUUID) {
				await tableIndex.close();
				this._indices.delete(tableIndexUUID);
			}
		}
		await table.close();
		this._tables.delete(tableUUID);
		try {
			await this._writeTables();
			await this._writeIndices();
		} catch(_exception) {
			throw DatabaseError.INTERNAL_SERVER_ERROR;
		}
		return true;
	}

	async desc(_tableOrSequenceName) {
		logger.trace('desc(...): start.');
		let tableUUID = this._tableNameToUUID.get(_tableOrSequenceName);
		if(tableUUID === undefined || tableUUID === null) {
			let sequenceUUID = this._sequenceNameToUUID.get(_tableOrSequenceName);
			if(sequenceUUID === undefined || sequenceUUID === null) {
				logger.warn('desc(...): No \'' + _tableOrSequenceName + '\' table or sequence found.');
				throw DatabaseError.FILE_NOT_FOUND;
			}
			let sequence = this._sequences.get(sequenceUUID);
			return await sequence.desc();
		}
		let table = this._tables.get(tableUUID);
		return await table.desc();
	}

	hasIndex(_indexName, _tableName) {
		let tableUUID = this._tableNameToUUID.get(_tableName);
		let tableIndices = this._indicesNameToUUID.get(_tableUUID);
		return this.tableIndices.has(_indexName);
	}

	hasSequence(_sequenceName) {
		return this._sequenceNameToUUID.has(_sequenceName);
	}

	hasTable(_tableName) {
		return this._tableNameToUUID.has(_tableName);
	}

	async insertMany(_tableName, _array) {
		let tableUUID = this._tableNameToUUID.get(_tableName);
		if(tableUUID === undefined || tableUUID === null) {
			logger.warn('insertMany(...): Table \'' + _tableName + '\' does not exist.');
			logger.trace('insertMany(...): end.');
			throw DatabaseError.FILE_NOT_FOUND;
		}
		let table = this._tables.get(tableUUID);
		if(table === undefined || table === null) {
			logger.warn('insertMany(...): Table \'' + _tableName + '\' and UUID \'' + tableUUID + '\' does not exist.');
			logger.trace('insertMany(...): end.');
			throw DatabaseError.FILE_NOT_FOUND;
		}
		return await table.insertMany(_array);
	}

	async insertInto(_tableName, _columnNames, _values) {
		logger.trace('insertInto(...): start.');
		let tableUUID = this._tableNameToUUID.get(_tableName);
		if(tableUUID === undefined || tableUUID === null) {
			logger.warn('insertInto(...): Table \'' + _tableName + '\' does not exist.');
			logger.trace('insertInto(...): end.');
			throw DatabaseError.FILE_NOT_FOUND;
		}
		let table = this._tables.get(tableUUID);
		if(table === undefined || table === null) {
			logger.warn('insertInto(...): Table \'' + _tableName + '\' and UUID \'' + tableUUID + '\' does not exist.');
			logger.trace('insertInto(...): end.');
			throw DatabaseError.FILE_NOT_FOUND;
		}
		return await table.insertInto(_columnNames, _values);
	}

	async insertOne(_tableName, _object) {
		let tableUUID = this._tableNameToUUID.get(_tableName);
		if(tableUUID === undefined || tableUUID === null) {
			logger.warn('insertOne(...): Table \'' + _tableName + '\' does not exist.');
			logger.trace('insertOne(...): end.');
			throw DatabaseError.FILE_NOT_FOUND;
		}
		let table = this._tables.get(tableUUID);
		if(table === undefined || table === null) {
			logger.warn('insertOne(...): Table \'' + _tableName + '\' and UUID \'' + tableUUID + '\' does not exist.');
			logger.trace('insertOne(...): end.');
			throw DatabaseError.FILE_NOT_FOUND;
		}
		return await table.insertOne(_object);
	}


	async listIndices() {
		logger.trace('listIndices(): start.');
		let result = [];
		for(const [tableIndexUUID, tableIndex] of this._indices) {
			let tableUUID = tableIndex.getTableUUID();
			let table = this._tables.get(tableUUID);
			let tableName = table.getName();
			let columnUUID = tableIndex.getColumnUUID();
			let columnName = table.getColumnByUUID(columnUUID).getName();
			let indexType = tableIndex.getType();
			let tableIndexDetails = {
				uuid: tableIndexUUID,
				name: tableIndex.getName(),
				tableName: tableName,
				tableUUID: tableUUID,
				columnName: columnName,
				columnUUID: columnUUID,
				indexType: indexType
			}
			result.push(tableIndexDetails);
		}
		logger.trace('listIndices(): end.');
		return result;
	}

	async listSequences() {
		return Array.from(this._sequenceNameToUUID.keys());
	}

	async listTables() {
		return Array.from(this._tableNameToUUID.keys());
	}

	async nextValue(_sequenceName) {
		logger.trace('nextValue(...): start.');
		let sequenceUUID = this._sequenceNameToUUID.get(_sequenceName);
		if(sequenceUUID === undefined || sequenceUUID === null) {
			logger.trace('nextValue(...): end.');
			throw DatabaseError.FILE_NOT_FOUND;
		}
		logger.debug('nextValue(...): sequenceUUID is \'' + sequenceUUID + '\'.');
		let sequence = this._sequences.get(sequenceUUID);
		if(sequence === undefined || sequence === null) {
			logger.trace('nextValue(...): end.');
			throw DatabaseError.FILE_NOT_FOUND;
		}
		let result = await sequence.nextValue();
		logger.trace('nextValue(...): end.');
		return result;
	}

	async refreshIndex(_tableName, _columnName) {
		let tableUUID = this._tableNameToUUID.get(_tableName);
		if(tableUUID === undefined || tableUUID === null) {
			throw DatabaseError.FILE_NOT_FOUND;
		}
		let table = this._tables.get(tableUUID);
		if(table === undefined || table === null) {
			throw DatabaseError.FILE_NOT_FOUND;
		}
		table.refreshIndex(_columnName);		
	}

	async refreshIndices(_tableName) {
		logger.trace('refreshIndices(): start.');
		if(_tableName === undefined || _tableName === null) {
			for(let [tableUUID, table] in this._tables) {
				table.refreshIndices();
			}
		} else {
			let tableUUID = this._tableNameToUUID.get(_tableName);
			if(tableUUID === undefined || tableUUID === null) {
				throw DatabaseError.FILE_NOT_FOUND;
			}
			let table = this._tables.get(tableUUID);
			if(table === undefined || table === null) {
				throw DatabaseError.FILE_NOT_FOUND;
			}
			table.refreshIndices();		
		}
		logger.trace('refreshIndices(): end.');
	}

	async renameIndex(_from, _to, _tableName) {
		logger.trace('renameIndex(...): start.');
		let tableUUID = this._tableNameToUUID.get(_tableName);
		if((tableUUID === undefined) || (tableUUID === null)) {
			logger.trace('renameIndex(...): end.');
			throw DatabaseError.FILE_NOT_FOUND;
		}
		let table = this._tables.get(tableUUID);
		if(table === undefined || table === null) {
			logger.trace('renameIndex(...): end.');
			throw DatabaseError.FILE_NOT_FOUND;
		}
		await table.renameIndex(_from, _to);
		try {
			await this._writeIndices();
		} catch(_exception) {
			logger.trace('renameIndex(...): end.');
			throw DatabaseError.INTERNAL_SERVER_ERROR;
		}
		logger.trace('renameIndex(...): end.');
	}

	async renameSequence(_from, _to) {
		let sequenceUUID = this._sequenceNameToUUID.get(_to);
		if((sequenceUUID != undefined) && (sequenceUUID != null)) {
			throw DatabaseError.CONFLICT;
		}
		sequenceUUID = this._sequenceNameToUUID.get(_from);
		if(sequenceUUID === undefined || sequenceUUID === null) {
			throw DatabaseError.FILE_NOT_FOUND;
		}
		let sequence = this._sequences.get(sequenceUUID);
		sequence.setName(_to);
		this._sequenceNameToUUID.delete(_from);
		this._sequenceNameToUUID.set(_to, sequenceUUID);
		try {
			await this._writeSequences();
		} catch(_exception) {
			throw DatabaseError.INTERNAL_SERVER_ERROR;
		}
	}

	async renameTable(_from, _to) {
		logger.trace('renameTable(...): start.');
		let tableUUID = this._tableNameToUUID.get(_to);
		if((tableUUID != undefined) && (tableUUID != null)) {
			logger.warn('renameTable(...): Table \'' + _to + '\' already exists.');
			logger.trace('renameTable(...): end.');
			throw DatabaseError.CONFLICT;
		}
		tableUUID = this._tableNameToUUID.get(_from);
		if(tableUUID === undefined || tableUUID === null) {
			logger.warn('renameTable(...): Table \'' + _from + '\' does not exist.');
			logger.trace('renameTable(...): end.');
			throw DatabaseError.FILE_NOT_FOUND;
		}
		let table = this._tables.get(tableUUID);
		table.setName(_to);
		logger.trace('renameTable(...): Delete \'' + _from + '\'.');
		this._tableNameToUUID.delete(_from);
		logger.trace('renameTable(...): Set \'' + _to + '\'.');
		this._tableNameToUUID.set(_to, tableUUID);
		try {
			await this._writeTables();
		} catch(_exception) {
			logger.trace('renameTable(...): end.');
			throw DatabaseError.INTERNAL_SERVER_ERROR;
		}
		logger.trace('renameTable(...): end.');
	}

	async selectAll(_tableName, _orderBy) {
		logger.trace('selectAll(...): start.');
		let tableUUID = this._tableNameToUUID.get(_tableName);
		if(tableUUID === undefined || tableUUID === null) {
			logger.trace('selectAll(...): end.');
			throw DatabaseError.FILE_NOT_FOUND;
		}
		let table = this._tables.get(tableUUID);
		if(table === undefined || table === null) {
			logger.trace('selectAll(...): end.');
			throw DatabaseError.FILE_NOT_FOUND;
		}
		let result = await table.selectAll(_orderBy);
		logger.trace('selectAll(...): end.');
		return result;
	}

	async selectDistinctAll(_tableName, _orderBy) {
		logger.trace('selectDistinctAll(...): start.');
		let tableUUID = this._tableNameToUUID.get(_tableName);
		if(tableUUID === undefined || tableUUID === null) {
			logger.trace('selectDistinctAll(...): end.');
			throw DatabaseError.FILE_NOT_FOUND;
		}
		let table = this._tables.get(tableUUID);
		if(table === undefined || table === null) {
			logger.trace('selectDistinctAll(...): end.');
			throw DatabaseError.FILE_NOT_FOUND;
		}
		let result = await table.selectDistinctAll(_orderBy);
		logger.trace('selectDistinctAll(...): end.');
		return result;
	}

	async selectSlice(_sqlSelectExpressions, _tableName, _sqlCondition, _groupBy, _having, _orderBy) {
		logger.trace('selectSlice(...): start.');
		let tableUUID = this._tableNameToUUID.get(_tableName);
		if(tableUUID === undefined || tableUUID === null) {
			logger.trace('selectSlice(...): end.');
			throw DatabaseError.FILE_NOT_FOUND;
		}
		let table = this._tables.get(tableUUID);
		if(table === undefined || table === null) {
			logger.trace('selectSlice(...): end.');
			throw DatabaseError.FILE_NOT_FOUND;
		}
		let result = await table.selectSlice(_sqlSelectExpressions, _sqlCondition, _groupBy, _having, _orderBy);
		logger.trace('selectSlice(...): end.');
		return result;
	}

	async selectDistinctSlice(_sqlSelectExpressions, _tableName, _sqlCondition, _groupBy, _having, _orderBy) {
		logger.trace('selectDistinctSlice(...): start.');
		let tableUUID = this._tableNameToUUID.get(_tableName);
		if(tableUUID === undefined || tableUUID === null) {
			logger.trace('selectDistinctSlice(...): end.');
			throw DatabaseError.FILE_NOT_FOUND;
		}
		let table = this._tables.get(tableUUID);
		if(table === undefined || table === null) {
			logger.trace('selectDistinctSlice(...): end.');
			throw DatabaseError.FILE_NOT_FOUND;
		}
		let result = await table.selectDistinctSlice(_sqlSelectExpressions, _sqlCondition, _groupBy, _having, _orderBy);
		logger.trace('selectDistinctSlice(...): end.');
		return result;
	}

	async selectSubset(_tableName, _sqlCondition, _orderBy) {
		logger.trace('selectSubset(...): start.');
		let tableUUID = this._tableNameToUUID.get(_tableName);
		if(tableUUID === undefined || tableUUID === null) {
			logger.trace('selectSubset(...): end.');
			throw DatabaseError.FILE_NOT_FOUND;
		}
		let table = this._tables.get(tableUUID);
		if(table === undefined || table === null) {
			logger.trace('selectSubset(...): end.');
			throw DatabaseError.FILE_NOT_FOUND;
		}
		let result = await table.selectSubset(_sqlCondition, _orderBy);
		logger.trace('selectSubset(...): end.');
		return result;
	}

	async selectDistinctSubset(_tableName, _sqlCondition, _orderBy) {
		logger.trace('selectDistinctSubset(...): start.');
		let tableUUID = this._tableNameToUUID.get(_tableName);
		if(tableUUID === undefined || tableUUID === null) {
			logger.trace('selectDistinctSubset(...): end.');
			throw DatabaseError.FILE_NOT_FOUND;
		}
		let table = this._tables.get(tableUUID);
		if(table === undefined || table === null) {
			logger.trace('selectDistinctSubset(...): end.');
			throw DatabaseError.FILE_NOT_FOUND;
		}
		let result = await table.selectDistinctSubset(_sqlCondition, _orderBy);
		logger.trace('selectDistinctSubset(...): end.');
		return result;
	}

	async update(_tableName, _columns, _values, _sqlCondition) {
		logger.trace('update(...): start.');
		let tableUUID = this._tableNameToUUID.get(_tableName);
		if(tableUUID === undefined || tableUUID === null) {
			logger.trace('update(...): end.');
			throw DatabaseError.FILE_NOT_FOUND;
		}
		let table = this._tables.get(tableUUID);
		if(table === undefined || table === null) {
			logger.trace('update(...): end.');
			throw DatabaseError.FILE_NOT_FOUND;
		}
		let result = await table.update(_columns, _values, _sqlCondition);
		logger.trace('update(...): end.');
		return result;
	}

	async updateByObject(_tableName, _object, _sqlCondition) {
		logger.trace('updateByObject(...): start.');
		let tableUUID = this._tableNameToUUID.get(_tableName);
		if(tableUUID === undefined || tableUUID === null) {
			logger.trace('updateByObject(...): end.');
			throw DatabaseError.FILE_NOT_FOUND;
		}
		let table = this._tables.get(tableUUID);
		if(table === undefined || table === null) {
			logger.trace('updateByObject(...): end.');
			throw DatabaseError.FILE_NOT_FOUND;
		}
		let result = await table.updateByObject(_object, _sqlCondition);
		logger.trace('updateByObject(...): end.');
		return result;
	}


    /*********************************************
     * GETTERS
     ********************************************/

	get name() {
		return this.getName();
	}

	getName() {
		return this._name;
	}

    /*********************************************
     * SETTERS
     ********************************************/

	async setName(_name) {
		logger.trace('setName(...): start.');
		try {
			let currentDefinitionFile = this._definitionFile;
	        let newDefinitionFile = this._sourceFolder + _name + DEFINITION_FILE_SUFFIX;
			await fs.rename(currentDefinitionFile, newDefinitionFile);
			this._name = _name;
			this._definitionFile = newDefinitionFile;
			await this._writeDatabase();
		} catch(_exception) {
			logger.error('setName(...): ' + _exception);
			logger.trace('setName(...): end.');
			throw _exception;
		}
		logger.trace('setName(...): end.');
	}
}

module.exports = FileSystemDatabase;