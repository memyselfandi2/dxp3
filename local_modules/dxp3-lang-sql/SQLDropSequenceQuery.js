/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-lang-sql
 *
 * NAME
 * SQLDropSequenceQuery
 */
const packageName = 'dxp3-lang-sql';
const moduleName = 'SQLDropSequenceQuery';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
// Check if someone tried to run/execute this file.
const util = require('dxp3-util');
if(util.Assert.isFileToExecute(canonicalName)) {
    util.Help.print();
    return;
}
/**
 * @module dxp3-lang-sql/SQLDropSequenceQuery
 */
const logging = require('dxp3-logging');
const SQLError = require('./SQLError');
const SQLQuery = require('./SQLQuery');

const logger = logging.getLogger(canonicalName);

class SQLDropSequenceQuery extends SQLQuery {
    /*********************************************
     * CONSTRUCTOR
     ********************************************/

    /**
     * constructor(String _sequenceName);
     */
    constructor() {
        super();
        if(arguments.length < 1) {
            // Calling constructor(...) without any arguments could be
            // a programming error. Lets log a warning.
            logger.warn('constructor(...): Missing arguments.');
            throw SQLError.ILLEGAL_ARGUMENT;
        }
        // First argument must be the name of the sequence to drop.
        let _sequenceName = arguments[0];
        if(_sequenceName === undefined || _sequenceName === null) {
            // Calling constructor(...) without a _sequenceName could be
            // a programming error. Lets log a warning.
            logger.warn('constructor(...): Missing arguments.');
            throw SQLError.ILLEGAL_ARGUMENT;
        }
        if(typeof _sequenceName != 'string') {
            // Calling constructor(...) with a non-string argument could be
            // a programming error. Lets log a warning.
            logger.warn('constructor(...): Argument of wrong type.');
            throw SQLError.ILLEGAL_ARGUMENT;
        }
        _sequenceName = _sequenceName.trim();
        if(_sequenceName.length <= 0) {
            // Calling constructor(...) with an empty _sequenceName could be
            // a programming error. Lets log a warning.
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
        let result = await _sqlConnection.dropSequence(this._sequenceName);
        return result;
    }

    toString() {
        let result = 'DROP TABLE ';
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

module.exports = SQLDropSequenceQuery;