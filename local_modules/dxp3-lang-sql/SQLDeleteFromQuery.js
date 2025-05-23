/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-lang-sql
 *
 * NAME
 * SQLDeleteFromQuery
 */
const packageName = 'dxp3-lang-sql';
const moduleName = 'SQLDeleteFromQuery';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
// Check if someone tried to run/execute this file.
const util = require('dxp3-util');
if(util.Assert.isFileToExecute(canonicalName)) {
	util.Help.print();
	return;
}
/**
 * @module dxp3-lang-sql/SQLDeleteFromQuery
 */
const logging = require('dxp3-logging');
const SQLCondition = require('./SQLCondition');
const SQLError = require('./SQLError');
const SQLQuery = require('./SQLQuery');

const logger = logging.getLogger(canonicalName);

class SQLDeleteFromQuery extends SQLQuery {
    /*********************************************
     * CONSTRUCTOR
     ********************************************/

    /**
     * constructor(String _tableName);
     * constructor(String _tableName, SQLCondition _sqlCondition);
     */
	constructor(_tableName, _sqlCondition) {
		super();
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
		this._sqlCondition = null;
		if(_sqlCondition != undefined && _sqlCondition != null) {
			if(!(_sqlCondition instanceof SQLCondition)) {
				throw SQLError.ILLEGAL_ARGUMENT;
			}
			this._sqlCondition = _sqlCondition;
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
        return _sqlConnection.deleteFrom(this._tableName, this._sqlCondition);
    }

	toString() {
        let result = 'DELETE FROM ';
        if(this._tableName.includes(' ')) {
            result += '[' + this._tableName + ']';
        } else {
            result += this._tableName;
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

     get tableName() {
     	return getTableName();
     }

     getTableName() {
     	return this._tableName;
     }

     get sqlCondition() {
     	return this.getSQLCondition();
     }

     getSQLCondition() {
     	return this._sqlCondition;
     }
}

module.exports = SQLDeleteFromQuery;