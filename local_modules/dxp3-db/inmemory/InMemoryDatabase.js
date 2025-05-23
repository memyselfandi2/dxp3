/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-db/inmemory
 *
 * NAME
 * InMemoryDatabase
 */
const packageName = 'dxp3-db/inmemory';
const moduleName = 'InMemoryDatabase';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;

const DatabaseError = require('../DatabaseError');
const InMemorySequence = require('./InMemorySequence');
const InMemoryTable = require('./InMemoryTable');

const logging = require('dxp3-logging');
const util = require('dxp3-util');
const UUID = require('dxp3-uuid');

const Assert = util.Assert;
const logger = logging.getLogger(canonicalName);

class InMemoryDatabase {
    /*********************************************
     * CONSTRUCTOR
     ********************************************/

	constructor(_name) {
		logger.trace('constructor(...): start.');
		// Defensive programming...check input..
		if(Assert.isUndefinedOrNullOrNotAStringOrEmpty(_name)) {
			logger.warn('constructor(...): _name is undefined, null, empty or not a string.');
			logger.trace('constructor(...): end.');
			throw DatabaseError.ILLEGAL_ARGUMENT;
		}
		this._name = _name.trim();
		this._sequences = new Map();
		this._sequenceNameToUUID = new Map();
		this._tables = new Map();
		this._tableNameToUUID = new Map();
		this._tableIndices = new Map();
		logger.info('Name         : \'' + this._name + '\'.');
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
		logger.trace('alterTableRenameColumns(...): end.');
	}

	async close() {
		logger.trace('close(): start.');
		try {
        	await this._closeSequences();
        	await this._closeTables();
        	await this._closeDatabase();
		} catch(_exception) {
			logger.error('close(): exception: ' + _exception);
			logger.trace('close(): end.');
			throw _exception;
		}
		logger.trace('close(): end.');
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
	
	async createIndex(_indexName, _tableName, _columnName) {
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
		let tableIndex = await table.createIndex(tableIndexUUID, _indexName, _columnName);
		logger.info('created index \'' + tableIndex.getName() + '\' with uuid \'' + tableIndex.getUUID() + '\'.');
		logger.info(await tableIndex.toString());
		this._tableIndices.set(tableIndexUUID, tableIndex);
		logger.trace('createIndex(...): end.');
		return tableIndex;
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
		let sequence = new InMemorySequence(sequenceUUID, _sequenceName);
		this._sequences.set(sequenceUUID, sequence);
		this._sequenceNameToUUID.set(_sequenceName, sequenceUUID);
		await sequence.init();
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
		if(_columns === undefined || _columns === null) {
			_columns = [];
		}
		let table = new InMemoryTable(tableUUID, _tableName, _columns);
		this._tables.set(tableUUID, table);
		this._tableNameToUUID.set(_tableName, tableUUID);
		await table.init();
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

	async deleteIndex(_indexName, _tableName) {
		logger.trace('deleteIndex(...): start.');
		let tableUUID = this._tableNameToUUID.get(_tableName);
		if(tableUUID === undefined || tableUUID === null) {
			logger.trace('deleteIndex(...): end.');
			throw DatabaseError.FILE_NOT_FOUND;
		}
		let table = this._tables.get(tableUUID);
		let tableIndexUUID = await table.deleteIndex(_indexName);
		this._tableIndices.delete(tableIndexUUID);
		logger.trace('deleteIndex(...): end.');
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
		logger.trace('deleteSequence(...): end.');
	}

	async deleteTable(_tableName) {
		logger.trace('deleteTable(...): start.');
		let tableUUID = this._tableNameToUUID.get(_tableName);
		if(tableUUID === undefined || tableUUID === null) {
			logger.trace('deleteTable(...): end.');
			throw DatabaseError.FILE_NOT_FOUND;
		}
		this._tableNameToUUID.delete(_tableName);
		let table = this._tables.get(tableUUID);
		// delete all the indices associated with this table.
		for(const [tableIndexUUID, tableIndex] of this._tableIndices) {
			if(tableIndex.getTableUUID() === tableUUID) {
				await tableIndex.close();
				this._tableIndices.delete(tableIndexUUID);
			}
		}
		await table.close();
		this._tables.delete(tableUUID);
		logger.trace('deleteTable(...): end.');
	}

	async desc(_tableOrSequenceName) {
		logger.trace('desc(...): start.');
		let result = null;
		let tableUUID = this._tableNameToUUID.get(_tableOrSequenceName);
		if(tableUUID === undefined || tableUUID === null) {
			let sequenceUUID = this._sequenceNameToUUID.get(_tableOrSequenceName);
			if(sequenceUUID === undefined || sequenceUUID === null) {
				logger.warn('desc(...): No \'' + _tableOrSequenceName + '\' table or sequence found.');
				logger.trace('desc(...): end.');
				throw DatabaseError.FILE_NOT_FOUND;
			}
			let sequence = this._sequences.get(sequenceUUID);
			result = await sequence.desc();
		} else {
			let table = this._tables.get(tableUUID);
			result = await table.desc();
		}
		logger.trace('desc(...): end.');
		return result;
	}

	async init() {
		logger.trace('init(): start.');
		logger.trace('init(): end.');
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
			logger.trace('insertInto(...): end.');
			throw DatabaseError.FILE_NOT_FOUND;
		}
		let result = await table.insertInto(_columnNames, _values);
		logger.trace('insertInto(...): end.');
		return result;
	}

	async insertMany(_tableName, _array) {
		logger.trace('insertMany(...): start.');
		let tableUUID = this._tableNameToUUID.get(_tableName);
		if(tableUUID === undefined || tableUUID === null) {
			logger.warn('insertMany(...): Table \'' + _tableName + '\' does not exist.');
			logger.trace('insertMany(...): end.');
			throw DatabaseError.FILE_NOT_FOUND;
		}
		let table = this._tables.get(tableUUID);
		if(table === undefined || table === null) {
			logger.trace('insertMany(...): end.');
			throw DatabaseError.FILE_NOT_FOUND;
		}
		let result = await table.insertMany(_array);
		logger.trace('insertMany(...): end.');
		return result;
	}

	async insertOne(_tableName, _object) {
		logger.trace('insertOne(...): start.');
		let tableUUID = this._tableNameToUUID.get(_tableName);
		if(tableUUID === undefined || tableUUID === null) {
			logger.warn('insertOne(...): Table \'' + _tableName + '\' does not exist.');
			logger.trace('insertOne(...): end.');
			throw DatabaseError.FILE_NOT_FOUND;
		}
		let table = this._tables.get(tableUUID);
		if(table === undefined || table === null) {
			logger.trace('insertOne(...): end.');
			throw DatabaseError.FILE_NOT_FOUND;
		}
		let result = await table.insertOne(_object);
		logger.trace('insertOne(...): end.');
		return result;
	}

	async listIndices() {
		logger.trace('listIndices(): start.');
		let result = [];
		for(const [tableIndexUUID, tableIndex] of this._tableIndices) {
			let tableUUID = tableIndex.getTableUUID();
			let table = this._tables.get(tableUUID);
			let tableName = table.getName();
			let columnUUID = tableIndex.getColumnUUID();
			let columnName = table.getColumnByUUID(columnUUID).getName();
			let tableIndexDetails = {
				uuid: tableIndexUUID,
				name: tableIndex.getName(),
				tableName: tableName,
				tableUUID: tableUUID,
				columnName: columnName,
				columnUUID: columnUUID
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
		let sequence = this._sequences.get(sequenceUUID);
		if(sequence === undefined || sequence === null) {
			logger.trace('nextValue(...): end.');
			throw DatabaseError.FILE_NOT_FOUND;
		}
		let result = await sequence.nextValue();
		logger.trace('nextValue(...): end.');
		return result;
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
		logger.trace('renameIndex(...): end.');
	}

	async renameSequence(_from, _to) {
		logger.trace('renameSequence(...): start.');
		let sequenceUUID = this._sequenceNameToUUID.get(_to);
		if((sequenceUUID != undefined) && (sequenceUUID != null)) {
			logger.warn('renameSequence(...): Sequence \'' + _to + '\' already exists.');
			logger.trace('renameSequence(...): end.');
			throw DatabaseError.CONFLICT;
		}
		sequenceUUID = this._sequenceNameToUUID.get(_from);
		if(sequenceUUID === undefined || sequenceUUID === null) {
			logger.warn('renameSequence(...): Sequence \'' + _from + '\' does not exist.');
			logger.trace('renameSequence(...): end.');
			throw DatabaseError.FILE_NOT_FOUND;
		}
		let sequence = this._sequences.get(sequenceUUID);
		if(sequence === undefined || sequence === null) {
			logger.trace('renameSequence(...): end.');
			throw DatabaseError.FILE_NOT_FOUND;
		}
		sequence.setName(_to);
		this._sequenceNameToUUID.delete(_from);
		this._sequenceNameToUUID.set(_to, sequenceUUID);
		logger.trace('renameSequence(...): end.');
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
		if(table === undefined || table === null) {
			logger.trace('renameTable(...): end.');
			throw DatabaseError.FILE_NOT_FOUND;
		}
		table.setName(_to);
		this._tableNameToUUID.delete(_from);
		this._tableNameToUUID.set(_to, tableUUID);
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
		logger.trace('selectDisinctSubset(...): start.');
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
		let tableUUID = this._tableNameToUUID.get(_tableName);
		if(tableUUID === undefined || tableUUID === null) {
			throw DatabaseError.FILE_NOT_FOUND;
		}
		let table = this._tables.get(tableUUID);
		if(table === undefined || table === null) {
			throw DatabaseError.FILE_NOT_FOUND;
		}
		return await table.update(_columns, _values, _sqlCondition);
	}

	async updateByObject(_tableName, _object, _sqlCondition) {
		let tableUUID = this._tableNameToUUID.get(_tableName);
		if(tableUUID === undefined || tableUUID === null) {
			throw DatabaseError.FILE_NOT_FOUND;
		}
		let table = this._tables.get(tableUUID);
		if(table === undefined || table === null) {
			throw DatabaseError.FILE_NOT_FOUND;
		}
		return await table.updateByObject(_object, _sqlCondition);
	}

    /*********************************************
     * GETTERS
     ********************************************/

	hasSequence(_sequenceName) {
		return this._sequenceNameToUUID.has(_sequenceName);
	}

	hasTable(_tableName) {
		return this._tableNameToUUID.has(_tableName);
	}

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
		this._name = _name;
		logger.trace('setName(...): end.');
	}	
}

module.exports = InMemoryDatabase;