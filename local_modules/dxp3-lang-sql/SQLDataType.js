/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-lang-sql
 *
 * NAME
 * SQLDataType
 */
const packageName = 'dxp3-lang-sql';
const moduleName = 'SQLDataType';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
// Check if someone tried to run/execute this file.
const util = require('dxp3-util');
if(util.Assert.isFileToExecute(canonicalName)) {
    util.Help.print();
    return;
}
/**
 * @module dxp3-lang-sql/SQLDataType
 */
const SQLError = require('./SQLError');

class SQLDataType {
   /*********************************************
    * CONSTRUCTOR
    ********************************************/

    /**
     * @param {Number} _code
     * @param {String} _name
     */
	constructor(_code, _name) {
		this._code = _code;
		this._name = _name;
	}

   /*********************************************
    * PUBLIC METHODS
    ********************************************/

	equals(_otherSQLDataType) {
		return (this._code === _otherSQLDataType.code);
	}

	/**
	* @function
	* @param {String} dataTypeAsString - The column type given as a string to be transformed to a value of the SQLDataType enumeration.
	* @returns {SQLDataType}
	*/
	static parse(_dataTypeAsString) {
		if(_dataTypeAsString === undefined || _dataTypeAsString === null) {
			throw SQLError.ILLEGAL_ARGUMENT;
		}
		if(typeof _dataTypeAsString != 'string') {
			throw SQLError.ILLEGAL_ARGUMENT;
		}
		_dataTypeAsString = _dataTypeAsString.trim();
		if(_dataTypeAsString.length <= 0) {
			throw SQLError.ILLEGAL_ARGUMENT;
		}
		_dataTypeAsString = _dataTypeAsString.toUpperCase();
		switch(_dataTypeAsString) {
			case "BOOLEAN":
				return SQLDataType.BOOLEAN;
			case "DATE":
				return SQLDataType.DATE;
			case "DOUBLE":
				return SQLDataType.DOUBLE;
			case "FLOAT":
				return SQLDataType.FLOAT;
			case 'INT':
			case 'INTEGER':
			case 'NUMBER':
				return SQLDataType.INTEGER;
			case "STRING":
			case "TEXT":
			case "TXT":
			case "VARCHAR":
			case "VARCHARS":
				return SQLDataType.STRING;
			default:
				throw SQLError.ILLEGAL_ARGUMENT;
		}
	}

    toString() {
    	return this._name;
    }

   /*********************************************
    * GETTERS
    ********************************************/

	get code() {
		return this.getCode();
	}

	getCode() {
		return this._code;
	}

	get name() {
		return this.getName();
	}

	getName() {
		return this._name;
	}
}
SQLDataType.BOOLEAN = new SQLDataType(10, 'BOOLEAN');
SQLDataType.DATE = new SQLDataType(20, 'DATE');
SQLDataType.DOUBLE = new SQLDataType(30, 'DOUBLE');
SQLDataType.FLOAT = new SQLDataType(40, 'FLOAT');
SQLDataType.INTEGER = new SQLDataType(50, 'INTEGER');
SQLDataType.STRING = new SQLDataType(60, 'STRING');

// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
   util.Help.print(SQLDataType);
   return;
}
module.exports = SQLDataType;