/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-lang-sql
 *
 * NAME
 * SQLInsertIntoQuery
 */
const packageName = 'dxp3-lang-sql';
const moduleName = 'SQLInsertIntoQuery';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
// Check if someone tried to run/execute this file.
const util = require('dxp3-util');
if(util.Assert.isFileToExecute(canonicalName)) {
    util.Help.print();
    return;
}
/**
 * @module dxp3-lang-sql/SQLInsertIntoQuery
 */
const logging = require('dxp3-logging');
const SQLError = require('./SQLError');
const SQLQuery = require('./SQLQuery');

const logger = logging.getLogger(canonicalName);

class SQLInsertIntoQuery extends SQLQuery {
    /*********************************************
     * CONSTRUCTOR
     ********************************************/

	/**
	 * constructor(String _tableName, Object _values);
	 * constructor(String _tableName, Array<?> _values);
 	 * constructor(String _tableName, Array<String> _columnNames, Object _values);
 	 * constructor(String _tableName, Array<String> _columnNames, Array<Array<?>> _values);
	 */
	constructor() {
		super();
		if(arguments.length <= 1) {
            // Calling constructor(...) without any arguments could be
            // a programming error. Lets log a warning.
            logger.warn('constructor(...): Missing arguments.');
            throw SQLError.ILLEGAL_ARGUMENT;
		}
		// First argument must be the name of the table to insert into.
		let _tableName = arguments[0];
		if(_tableName === undefined || _tableName === null) {
            // Calling constructor(...) without a _tableName could be
            // a programming error. Lets log a warning.
            logger.warn('constructor(...): Missing arguments.');
            throw SQLError.ILLEGAL_ARGUMENT;
		}
		if(typeof _tableName != 'string') {
            // Calling constructor(...) with a non-string argument could be
            // a programming error. Lets log a warning.
            logger.warn('constructor(...): Argument of wrong type.');
            throw SQLError.ILLEGAL_ARGUMENT;
		}
		_tableName = _tableName.trim();
		if(_tableName.length <= 0) {
            // Calling constructor(...) with an empty _tableName could be
            // a programming error. Lets log a warning.
            logger.warn('constructor(...): Empty argument.');
			throw SQLError.ILLEGAL_ARGUMENT;
		}
		this._tableName = _tableName;
		this._columnNames = null;
		let _valuesArray = null;
		if(arguments.length === 2) {
			_valuesArray = arguments[1];
		} else {
			this._columnNames = arguments[1];
			_valuesArray = arguments[2];
		}
		if(_valuesArray === undefined || _valuesArray === null) {
			throw SQLError.BAD_REQUEST;
		}
		if(Array.isArray(_valuesArray)) {
			this._valuesArray = _valuesArray;
		} else if(typeof _valuesArray === 'object') {
			this._valuesArray = [];
			if(this._columnNames === null) {
				this._columnNames = Object.keys(_valuesArray);
			}
            let row = [];
			for(let i=0;i < this._columnNames.length;i++) {
				let columnName = this._columnNames[i];
				let value = _valuesArray[columnName];
				row.push(value);
			}
            this._valuesArray.push(row);
		} else {
			throw SQLError.BAD_REQUEST;
		}
	}

    /*********************************************
     * PUBLIC METHODS
     ********************************************/

    async execute(_sqlConnection) {
        // Defensive programming...check input...
        if(_sqlConnection === undefined || _sqlConnection === null) {
            // Calling execute(...) without a _sqlConnection could be
            // a programming error. Lets log a warning.
            logger.warn('execute(...): Missing arguments.');
            throw SQLError.ILLEGAL_ARGUMENT;
        }
        let result = {
            ids: [],
            nInserted: 0
        };
        for(let i=0;i < this._valuesArray.length;i++) {
            let values = this._valuesArray[i];
            let resultOne = await _sqlConnection.insertInto(this._tableName, this._columnNames, values);
            result.ids = result.ids.concat(resultOne.ids);
            result.nInserted += resultOne.nInserted;
        }
        return result;
    }

	toString() {
        let result = 'INSERT INTO ';
        if(this._tableName.includes(' ')) {
            result += '[' + this._tableName + ']';
        } else {
            result += this._tableName;
        }
        if((this._columnNames != null) &&
           (this._columnNames.length > 0)) {
        	result += ' (';
            let columnName = null;
            let i = 0;
            let lastIndex = this._columnNames.length - 1;
            for(i = 0; i < lastIndex; i++) {
                columnName = this._columnNames[i];
                if(columnName.indexOf(' ') < 0) {
    	            result += columnName;
                } else {
                    result += '[' + columnName + ']';
                }
                result += ', ';
            }
            columnName = this._columnNames[i];
            if(columnName.indexOf(' ') < 0) {
                result += columnName;
            } else {
                result += '[' + columnName + ']';
            }
        	result += ')';
        }
        result += ' VALUES';
        let rowIndex = 0;
        let rowLastIndex = this._valuesArray.length - 1;
        for(let rowIndex = 0;rowIndex < this._valuesArray.length;rowIndex++) {
            result += '(';
            let row = this._valuesArray[rowIndex];
            let value = null;
            let columnIndex = 0;
            let columnLastIndex = row.length - 1;
            for(columnIndex = 0; columnIndex < row.length; columnIndex++) {
                value = row[columnIndex];
                if(typeof value === 'string') {
	               result += '\'' + value + '\'';
                } else if(Array.isArray(value)) {
                    result += '[';
                    for(let valueIndex = 0;valueIndex < value.length;valueIndex++) {
                        if(typeof value[valueIndex] === 'string') {
                            result += '\'' + value[valueIndex] + '\'';
                        } else {
                            result += value[valueIndex];
                        }
                        if(valueIndex < (value.length - 1)) {
                            result += ', ';
                        }
                    }
                    result += ']';
                } else {
                    result += value;
                }
                if(columnIndex < columnLastIndex) {
                    result += ', ';
                }
            }
            result += ')';
            if(rowIndex < rowLastIndex) {
                result += ', ';
            }
        }
        result += ';';
        return result;
    }

    /*********************************************
     * GETTERS
     ********************************************/

     get tableName() {
     	return getTableName();
     }

     getTableName() {
     	return this._tableName;
     }
}

module.exports = SQLInsertIntoQuery;