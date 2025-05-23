/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-lang-sql
 *
 * NAME
 * SQLQuery
 */
const packageName = 'dxp3-lang-sql';
const moduleName = 'SQLQuery';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
// Check if someone tried to run/execute this file.
const util = require('dxp3-util');
if(util.Assert.isFileToExecute(canonicalName)) {
	util.Help.print();
	return;
}
/**
 * @module dxp3-lang-sql/SQLQuery
 */
const logging = require('dxp3-logging');
const SQLError = require('./SQLError');

const logger = logging.getLogger(canonicalName);

class SQLQuery {
    /*********************************************
     * CONSTRUCTOR
     ********************************************/

	constructor() {
	}

    /*********************************************
     * PUBLIC METHODS
     ********************************************/

	async execute(_sqlConnection) {
        logger.trace('execute(...): start.');
        logger.warn('execute(...): Not implemented.');
        logger.trace('execute(...): end.');
        throw SQLError.NOT_IMPLEMENTED;
    }

	toString() {
        logger.trace('toString(...): start.');
        logger.warn('toString(): Not implemented.');
        logger.trace('toString(...): end.');
    	throw SQLError.NOT_IMPLEMENTED;
	}
}

module.exports = SQLQuery;