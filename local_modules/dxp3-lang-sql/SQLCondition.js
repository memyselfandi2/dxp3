/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-lang-sql
 *
 * NAME
 * SQLCondition
 */
const packageName = 'dxp3-lang-sql';
const moduleName = 'SQLCondition';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
// Check if someone tried to run/execute this file.
const util = require('dxp3-util');
if(util.Assert.isFileToExecute(canonicalName)) {
	util.Help.print();
	return;
}
/**
 * @module dxp3-lang-sql/SQLCondition
 */
const logging = require('dxp3-logging');
const SQLError = require('./SQLError');
const SQLRow = require('./SQLRow');
const SQLTable = require('./SQLTable');

const logger = logging.getLogger(canonicalName);

class SQLCondition {
    /*********************************************
     * CONSTRUCTOR
     ********************************************/

	constructor() {
	}

    /*********************************************
     * PUBLIC METHODS
     ********************************************/

	async evaluateHaving(_rows) {
        logger.warn('evaluateHaving(...): Not implemented.');
		throw SQLError.NOT_IMPLEMENTED;
    }

	async evaluateWhere(_sqlTable) {
        logger.warn('evaluateWhere(...): Not implemented.');
		throw SQLError.NOT_IMPLEMENTED;
    }

	toString() {
        logger.warn('toString(): Not implemented.');
    	throw SQLError.NOT_IMPLEMENTED;
	}
}

module.exports = SQLCondition;