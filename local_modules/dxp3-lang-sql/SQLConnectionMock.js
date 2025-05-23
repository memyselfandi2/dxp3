const SQLConnection = require('./SQLConnection');
const SQLTable = require('./SQLTable');

class SQLSequenceMock {
	constructor(_sequenceName) {
		this._sequenceName = _sequenceName;
	}
}

class SQLTableMock extends SQLTable {
	constructor(_tableName) {
		super();
		this._tableName = _tableName;
	}

	async deleteFrom(_sqlCondition) {
	}

	async desc() {
	}

	async insertInto(_columns, _values) {
	}

	async select(_sqlSelectExpressions, _sqlCondition, _groupBy, _orderBy) {
	}

	async selectDistinct(_sqlSelectExpressions, _sqlCondition, _groupBy, _orderBy) {
	}

	async update(_columns, _values, _sqlCondition) {
	}
}

class SQLConnectionMock extends SQLConnection {

	constructor() {
		this._tables = new Map();
		this._sequences = new Map();
	}

	async createSequence(_sequenceName) {
		let sequence = new SQLSequenceMock(_sequenceName);
		this._sequences.set(_sequenceName, sequence);
	}

	async createTable(_tableName) {
		let table = new SQLTableMock(_tableName);
		this._tables.set(_tableName, table);
	}

	async destroySequence(_sequenceName) {
		this._sequences.delete(_sequenceName);
	}

	async destroyTable(_tableName) {
		this._tables.delete(_tableName);
	}

	async deleteFrom(_tableName, _sqlCondition) {
		let table = this._tables.get(_tableName);
		let result = table.deleteFrom(_sqlCondition);
		return result;
	}

	async desc(_tableOrSequenceName) {
		let table = this._tables.get(_tableOrSequenceName);
		let result = await table.desc();
		return result;
	}

	async insertInto(_tableName, _columns, _values) {
		let table = this._tables.get(_tableName);
		let result = await table.insertInto(_columns, _values);
		return result;
	}

	async select(_sqlSelectExpressions, _tableName, _sqlCondition, _groupBy, _orderBy) {
		let table = this._tables.get(_tableName);
		let result = await table.select(_sqlSelectExpressions, _sqlCondition, _groupBy, _orderBy);
		return result;
	}

	async selectDistinct(_sqlSelectExpressions, _tableName, _sqlCondition, _groupBy, _orderBy) {
		let table = this._tables.get(_tableName);
		let result = await table.select(_sqlSelectExpressions, _sqlCondition, _groupBy, _orderBy);
		return result;
	}

	async update(_tableName, _columns, _values, _sqlCondition) {
		let table = this._tables.get(_tableName);
		let result = table.update(_columns, _values, _sqlCondition);
		return result;
	}
}

module.exports = SQLConnectionMock;