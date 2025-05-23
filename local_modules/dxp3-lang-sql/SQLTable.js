/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-lang-sql
 *
 * NAME
 * SQLTable
 */
const packageName = 'dxp3-lang-sql';
const moduleName = 'SQLTable';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
// Check if someone tried to run/execute this file.
const util = require('dxp3-util');
if(util.Assert.isFileToExecute(canonicalName)) {
	util.Help.print();
	return;
}
/**
 * @module dxp3-lang-sql/SQLTable
 */
const SQLError = require('./SQLError');

class SQLTable {
    /*********************************************
     * CONSTRUCTOR
     ********************************************/

	constructor() {
	}

    /*********************************************
     * PUBLIC METHODS
     ********************************************/

	/**
	 * Upon execution of a SQLQuery each of its SQLConditions gets passed
	 * a reference to a SQLTable.
	 * Each SQLCondition will call this method to get a reference to
	 * a SQLTableIndex for the column specified in the SQLCondition.
	 * Anyone who implements a SQLTable must return a SQLTableIndex instance otherwise
	 * the SQLQuery will fail.
	 */
	getSQLTableIndex(_columnName) {
		throw SQLError.NOT_IMPLEMENTED;
	}
}

module.exports = SQLTable;