/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-lang-sql
 *
 * NAME
 * SQLUpdateQuery
 */
const packageName = 'dxp3-lang-sql';
const moduleName = 'SQLUpdateQuery';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
// Check if someone tried to run/execute this file.
const util = require('dxp3-util');
if(util.Assert.isFileToExecute(canonicalName)) {
	util.Help.print();
	return;
}
/**
 * @module dxp3-lang-sql/SQLUpdateQuery
 */
const logging = require('dxp3-logging');
const SQLColumn = require('./SQLColumn')
const SQLCondition = require('./SQLCondition');
const SQLError = require('./SQLError');
const SQLQuery = require('./SQLQuery');

const logger = logging.getLogger(canonicalName);

class SQLUpdateQuery extends SQLQuery {
    /*********************************************
     * CONSTRUCTOR
     ********************************************/

	/**
	 * constructor(String _tableName, Array<?>|Map|Object _values);
	 * constructor(String _tableName, Array<?>|Map|Object _values, SQLCondition _sqlCondition);
	 * constructor(String _tableName, Array<String|SQLColumn> _columns, Array<?> _values);
	 * constructor(String _tableName, Array<?> _values, SQLCondition _sqlCondition);
	 * constructor(String _tableName, Array<String|SQLColumn> _columns, Array<?> _values, SQLCondition _sqlCondition);
	 * 
	 * When the provided value is a string it will be interpreted as the name of a column unless the value is 
	 * enclosed between single quotes or double quotes.
	 * For example:
	 * update users set first='David'
	 * Should be represented as:
	 * // An object
	 * SQLUpdateQuery updateQuery = new SQLUpdateQuery('users', {first: '\'David\''});
	 * // A Map
	 * SQLUpdateQuery updateQuery = new SQLUpdateQuery('users', new Map([['first', '\'David\'']]));
	 * // An Array
	 * SQLUpdateQuery updateQuery = new SQLUpdateQuery('users', ['first'], ['\'David\'']);
	 */
	constructor() {
		super();
		if(arguments.length <= 1) {
            logger.warn('constructor(...): Missing arguments.');
            throw SQLError.ILLEGAL_ARGUMENT;
		}
		// First argument must be the name of the table to update.
		let _tableName = arguments[0];
		if(_tableName === undefined || _tableName === null) {
            logger.warn('constructor(...): Missing _tableName.');
            throw SQLError.ILLEGAL_ARGUMENT;
		}
		if(typeof _tableName != 'string') {
            logger.warn('constructor(...): _tableName is not a String.');
            throw SQLError.ILLEGAL_ARGUMENT;
		}
		_tableName = _tableName.trim();
		if(_tableName.length <= 0) {
            logger.warn('constructor(...): Empty argument.');
            throw SQLError.ILLEGAL_ARGUMENT;
		}
		this._tableName = _tableName;
		let _columns = null;
		let _values = null;
		this._sqlCondition = null;
		if(arguments.length === 2) {
			_values = arguments[1];
		} else if(arguments.length === 3) {
			if(arguments[2] === undefined || arguments[2] === null) {
				_values = arguments[1];
			} else if(arguments[2] instanceof SQLCondition) {
				_values = arguments[1];
				this._sqlCondition = arguments[2];
			} else if(Array.isArray(arguments[1]) && Array.isArray(arguments[2])) {
				_columns = arguments[1];
				_values = arguments[2];
			} else if(arguments[1] instanceof Map) {
				_values = arguments[1];
				this._sqlCondition = arguments[2];
			} else {
	            logger.warn('constructor(...): Illegal arguments.');
	            throw SQLError.ILLEGAL_ARGUMENT;
			}
		} else {
			_columns = arguments[1];
			_values = arguments[2];
			this._sqlCondition = arguments[3];
		}
		if(_values === undefined || _values === null) {
            logger.warn('constructor(...): Missing _values.');
            throw SQLError.ILLEGAL_ARGUMENT;
		}
		this._columns = [];
		if(_columns != undefined && _columns != null) {
			for(let i=0;i < _columns.length;i++) {
				let column = _columns[i];
				if(typeof column === 'string') {
					column = column.trim();
					if(column.length <= 0) {
						continue;
					}
					column = new SQLColumn(column);
					this._columns.push(column);
				} else if(column instanceof SQLColumn) {
					this._columns.push(column);
				}
			}
		}
		if(Array.isArray(_values)) {
			this._values = [];
			for(let i=0;i < _values.length;i++) {
				let value = _values[i];
				if(typeof value === 'string') {
					value = value.trim();
					if((value.startsWith('\'') && value.endsWith('\'')) ||
					   (value.startsWith('"') && value.endsWith('"'))) {
						value = value.substring(1, value.length - 1);
					} else {
						value = new SQLColumn(value);
					}
				}
				this._values.push(value);
			}
		} else if(_values instanceof Map) {
			this._columns = [];
			this._values = [];
			for(let [columnName, value] of _values) {
				let column = new SQLColumn(columnName);
				this._columns.push(column);
				if(typeof value === 'string') {
					value = value.trim();
					if((value.startsWith('\'') && value.endsWith('\'')) ||
					   (value.startsWith('"') && value.endsWith('"'))) {
						value = value.substring(1, value.length - 1);
					} else {
						value = new SQLColumn(value);
					}
				}
				this._values.push(value);
			}
		} else if(typeof _values === 'object') {
			this._columns = [];
			this._values = [];
			let columnNames = Object.keys(_values);
			for(let i=0;i < columnNames.length;i++) {
				let columnName = columnNames[i];
				let column = new SQLColumn(columnName);
				this._columns.push(column);
				let value = _values[columnName];
				if(typeof value === 'string') {
					value = value.trim();
					if((value.startsWith('\'') && value.endsWith('\'')) ||
					   (value.startsWith('"') && value.endsWith('"'))) {
						value = value.substring(1, value.length - 1);
					} else {
						value = new SQLColumn(value);
					}
				}
				this._values.push(value);
			}
		} else {
            logger.warn('constructor(...): _values is not an Array, not a Map, nor an object.');
            throw SQLError.ILLEGAL_ARGUMENT;
		}
	}

    /*********************************************
     * PUBLIC METHODS
     ********************************************/

	async execute(_sqlConnection) {
        logger.trace('execute(...): start.');
        // Defensive programming...check input...
        if(_sqlConnection === undefined || _sqlConnection === null) {
            // Calling execute(...) without a _sqlConnection could be
            // a programming error. Lets log a warning.
            logger.warn('execute(...): Missing arguments.');
	        logger.trace('execute(...): end.');
            throw SQLError.ILLEGAL_ARGUMENT;
        }
		let result = _sqlConnection.update(this._tableName, this._columns, this._values, this._sqlCondition);
        logger.trace('execute(...): end.');
        return result;
    }

	toString() {
        let result = 'UPDATE ';
	    if(this._tableName.includes(' ')) {
	    	result += '[' + this._tableName + ']';
	    } else {
	        result += this._tableName;
	    }
        result += ' SET ';
        if((this._columns != null) &&
           (this._columns.length > 0)) {
            let column = null;
	        let value = null;
            let i = 0;
            let lastIndex = this._columns.length - 1;
            for(i = 0; i < this._columns.length; i++) {
                column = this._columns[i];
	            value = this._values[i];
	            if(Array.isArray(value)) {
		            result += column.toStringForQuery() + '=[';
		            for(let j=0;j < value.length;j++) {
		            	if(typeof value[j] === 'string') {
				            result += '\'' + value[j] + '\'';
			            } else if(value[j] instanceof SQLColumn) {
				            result += value[j].toString();
			            } else {
				            result += value[j];
			            }
			            if(j < (value.length - 1)) {
			                result += ',';
			            }
		            }
		            result += ']';
	            } else if(typeof value === 'string') {
		            result += column.toStringForQuery() + '=\'' + value + '\'';
	            } else if(value instanceof SQLColumn) {
		            result += column.toStringForQuery() + '=' + value.toString();
	            } else {
		            result += column.toStringForQuery() + '=' + value;
	            }
	            if(i < lastIndex) {
	                result += ',';
	            }
            }
        } else {
	        result += 'VALUES(';
	        let value = null;
	        let i=0;
	        let lastIndex = this._values.length - 1;
	        for(i = 0; i < this._values.length; i++) {
	            value = this._values[i];
	            if(Array.isArray(value)) {
		            result += '[';
		            for(let j=0;j < value.length;j++) {
		            	if(typeof value[j] === 'string') {
				            result += '\'' + value[j] + '\'';
			            } else if(value[j] instanceof SQLColumn) {
				            result += value[j].toString();
			            } else {
				            result += value[j];
			            }
			            if(j < (value.length - 1)) {
			                result += ',';
			            }
		            }
		            result += ']';
	            } else if(typeof value === 'string') {
		            result += '\'' + value + '\'';
	            } else if(value instanceof SQLColumn) {
		            result += value.toString();
	            } else {
		            result += value;
		        }
		        if(i < lastIndex) {
		            result += ', ';
		        }
	        }
	        result += ')';
	    }
        if(this._sqlCondition != null) {
            result += ' WHERE ';
            result += this._sqlCondition.toString();
        }
        result += ';';
        return result;
    }

    /*********************************************
     * GETTERS
     ********************************************/

	get columns() {
		return this.getColumns();
	}

	getColumns() {
		return this._columns;
	}

	get sqlCondition() {
		return this.getSQLCondition();
	}

	getSQLCondition() {
		return this._sqlCondition;
	}

	get tableName() {
		return getTableName();
	}

	getTableName() {
		return this._tableName;
	}

	get values() {
		return this.getValues();
	}

	getValues() {
		return this._values;
	}
}

module.exports = SQLUpdateQuery;