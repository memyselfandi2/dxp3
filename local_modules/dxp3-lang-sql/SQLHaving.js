/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-lang-sql
 *
 * NAME
 * SQLHaving
 */
const packageName = 'dxp3-lang-sql';
const moduleName = 'SQLHaving';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
// Check if someone tried to run/execute this file.
const util = require('dxp3-util');
if(util.Assert.isFileToExecute(canonicalName)) {
    util.Help.print();
    return;
}
/**
 * @module dxp3-lang-sql/SQLHaving
 */
const logging = require('dxp3-logging');

const logger = logging.getLogger(canonicalName);

class SQLHaving {
    /*********************************************
     * CONSTRUCTOR
     ********************************************/

	constructor(_sqlCondition) {
        this._sqlCondition = _sqlCondition
	}

    /*********************************************
     * PUBLIC METHODS
     ********************************************/

    async evaluate(_rows) {
        return await this._sqlCondition.evaluateHaving(_rows);
    }

    toString() {
        let result = 'HAVING ';
        result += this._sqlCondition.toString();
        return result;
    }
}

module.exports = SQLHaving;