/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-lang-sql
 *
 * NAME
 * SQLDropTableQuery
 */
const packageName = 'dxp3-lang-sql';
const moduleName = 'SQLDropTableQuery';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
// Check if someone tried to run/execute this file.
const util = require('dxp3-util');
if(util.Assert.isFileToExecute(canonicalName)) {
    util.Help.print();
    return;
}
/**
 * @module dxp3-lang-sql/SQLDropTableQuery
 */
const logging = require('dxp3-logging');
const SQLError = require('./SQLError');
const SQLQuery = require('./SQLQuery');

const logger = logging.getLogger(canonicalName);

class SQLDropTableQuery extends SQLQuery {
    /*********************************************
     * CONSTRUCTOR
     ********************************************/

	/**
 	 * constructor(String _tableName);
	 */
	constructor() {
		super();
		if(arguments.length < 1) {
            // Calling constructor(...) without any arguments could be
            // a programming error. Lets log a warning.
            logger.warn('constructor(...): Missing arguments.');
            throw SQLError.ILLEGAL_ARGUMENT;
		}
		// First argument must be the name of the table to drop.
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
        let result = await _sqlConnection.dropTable(this._tableName);
        return result;
    }

	toString() {
        let result = 'DROP TABLE ';
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
     	return getTableName();
     }

     getTableName() {
     	return this._tableName;
     }
}

module.exports = SQLDropTableQuery;