/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-lang-sql
 *
 * NAME
 * SQLGroupBy
 */
const packageName = 'dxp3-lang-sql';
const moduleName = 'SQLGroupBy';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
// Check if someone tried to run/execute this file.
const util = require('dxp3-util');
if(util.Assert.isFileToExecute(canonicalName)) {
    util.Help.print();
    return;
}
/**
 * @module dxp3-lang-sql/SQLGroupBy
 */
const logging = require('dxp3-logging');

const logger = logging.getLogger(canonicalName);

class SQLGroupBy {
    /*********************************************
     * CONSTRUCTOR
     ********************************************/

	constructor() {
        this._columns = [];

	}

    /*********************************************
     * PUBLIC METHODS
     ********************************************/

    toString() {
        let result = '';
        if(this._columns.length > 0) {
            result += 'GROUP BY ';
            for(let i=0;i < this._columns.length-1;i++) {
                result += this._columns[i] + ',';
            }
            result += this._columns[this._columns.length - 1];
        }
        return result;
    }

    groupKey(_object) {
        let result = {};
        let groupKey = '';
        for(let i=0;i < this._columns.length;i++) {
            let column = this._columns[i];
            let value = _object[column];
            result[column] = value;
            groupKey += value;
        }
        result.id = groupKey;
        return result;
    }

    addColumn(_column) {
        this._columns.push(_column);
    }
}

module.exports = SQLGroupBy;