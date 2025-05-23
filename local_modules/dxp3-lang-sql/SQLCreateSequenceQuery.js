/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-lang-sql
 *
 * NAME
 * SQLCreateSequenceQuery
 */
const packageName = 'dxp3-lang-sql';
const moduleName = 'SQLCreateSequenceQuery';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
// Check if someone tried to run/execute this file.
const util = require('dxp3-util');
if(util.Assert.isFileToExecute(canonicalName)) {
	util.Help.print();
	return;
}
/**
 * @module dxp3-lang-sql/SQLCreateSequenceQuery
 */
const logging = require('dxp3-logging');
const SQLError = require('./SQLError');
const SQLQuery = require('./SQLQuery');

const logger = logging.getLogger(canonicalName);

class SQLCreateSequenceQuery extends SQLQuery {
	/**
	 * constructor(String _sequenceName);
	 */
	constructor() {
		super();
		if(arguments.length < 1) {
            logger.warn('constructor(...): Missing arguments.');
            throw SQLError.ILLEGAL_ARGUMENT;
		}
		// First argument must be the name of the sequence to create.
		let _sequenceName = arguments[0];
		if(_sequenceName === undefined || _sequenceName === null) {
            logger.warn('constructor(...): Missing _sequenceName.');
            throw SQLError.ILLEGAL_ARGUMENT;
		}
		if(typeof _sequenceName != 'string') {
            logger.warn('constructor(...): _sequenceName is not a String.');
            throw SQLError.ILLEGAL_ARGUMENT;
		}
		_sequenceName = _sequenceName.trim();
		if(_sequenceName.length <= 0) {
            logger.warn('constructor(...): Empty argument.');
            throw SQLError.ILLEGAL_ARGUMENT;
		}
		this._sequenceName = _sequenceName;
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
		return _sqlConnection.createSequence(this._sequenceName);
    }

	toString() {
        let result = 'CREATE SEQUENCE ';
        result += this._sequenceName;
        result += ';';
        return result;
    }

    /*********************************************
     * GETTERS
     ********************************************/

	get sequenceName() {
		return getSequenceName();
	}

	getSequenceName() {
		return this._sequenceName;
	}
}

module.exports = SQLCreateSequenceQuery;