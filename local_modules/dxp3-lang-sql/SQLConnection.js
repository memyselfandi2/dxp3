const SQLError = require('./SQLError');

class SQLConnection {

	constructor() {
	}

	async alterTableAddColumns(_tableName, _columns) {
    	throw SQLError.NOT_IMPLEMENTED;		
	}

	async alterTableAlterColumns(_tableName, _columns) {
    	throw SQLError.NOT_IMPLEMENTED;		
	}

	async alterTableDropColumns(_tableName, _columns) {
    	throw SQLError.NOT_IMPLEMENTED;		
	}

	async alterTableRenameColumns(_tableName, _columns) {
    	throw SQLError.NOT_IMPLEMENTED;		
	}

	async createTable(_tableName, _columns) {
    	throw SQLError.NOT_IMPLEMENTED;		
	}

	async createSequence(_sequenceName) {
    	throw SQLError.NOT_IMPLEMENTED;		
	}

	async dropTable(_tableName) {
    	throw SQLError.NOT_IMPLEMENTED;		
	}

	async dropSequence(_sequenceName) {
    	throw SQLError.NOT_IMPLEMENTED;		
	}

	async deleteFrom(_tableName, _sqlCondition) {
    	throw SQLError.NOT_IMPLEMENTED;
	}

	async desc(_tableOrSequenceName) {
    	throw SQLError.NOT_IMPLEMENTED;
	}

	async insertInto(_tableName, _columns, _values) {
    	throw SQLError.NOT_IMPLEMENTED;
	}

	async nextValue(_sequenceName) {
    	throw SQLError.NOT_IMPLEMENTED;
	}

	async select(_sqlSelectExpressions, _tableName, _sqlCondition, _groupBy, _having, _orderBy) {
    	throw SQLError.NOT_IMPLEMENTED;
	}

	async selectDistinct(_sqlSelectExpressions, _tableName, _sqlCondition, _groupBy, _having, _orderBy) {
    	throw SQLError.NOT_IMPLEMENTED;
	}

	async update(_tableName, _columns, _values, _sqlCondition) {
    	throw SQLError.NOT_IMPLEMENTED;
	}
}

module.exports = SQLConnection;