/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-lang-sql
 *
 * NAME
 * SQLDescQuery
 */
const packageName = 'dxp3-lang-sql';
const moduleName = 'SQLDescQuery';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
// Check if someone tried to run/execute this file.
const util = require('dxp3-util');
if(util.Assert.isFileToExecute(canonicalName)) {
	util.Help.print();
	return;
}
/**
 * @module dxp3-lang-sql/SQLDescQuery
 */
const logging = require('dxp3-logging');
const SQLQuery = require('./SQLQuery');

const logger = logging.getLogger(canonicalName);

class SQLDescQuery extends SQLQuery {
    /*********************************************
     * CONSTRUCTOR
     ********************************************/

    /**
     * @param {String} _tableName
 	 * @throws {module:dxp3-lang-sql/SQLError~SQLError.ILLEGAL_ARGUMENT} When the _tableName is
 	 * undefined, null or empty.
     */
	constructor(_tableName) {
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
        return _sqlConnection.desc(this._tableName);
    }

	toString() {
        let result = 'DESC ';
        if(this._tableName.includes(' ')) {
            result += '[' + this._tableName + ']';
        } else {
            result += this._tableName;
        }
        result += ';';
        return result;
	}

    /*********************************************
     * GETTERS
     ********************************************/

    get tableName() {
    	return this.getTableName();
    }

	getTableName() {
		return this._tableName;
	}
}

module.exports = SQLDescQuery;