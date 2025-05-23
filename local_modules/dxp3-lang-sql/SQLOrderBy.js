/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-lang-sql
 *
 * NAME
 * SQLOrderBy
 */
const packageName = 'dxp3-lang-sql';
const moduleName = 'SQLOrderBy';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
// Check if someone tried to run/execute this file.
const util = require('dxp3-util');
if(util.Assert.isFileToExecute(canonicalName)) {
    util.Help.print();
    return;
}
/**
 * @module dxp3-lang-sql/SQLOrderBy
 */
const logging = require('dxp3-logging');

const logger = logging.getLogger(canonicalName);

class SQLOrderBy {
    /*********************************************
     * CONSTRUCTOR
     ********************************************/

	constructor() {
        this._columns = [];
        this._order = SQLOrderBy.ASCENDING;
        this._multiplier = 1;
	}

    /*********************************************
     * PUBLIC METHODS
     ********************************************/

    toString() {
        let result = '';
        if(this._columns.length > 0) {
            result += 'ORDER BY ';
            for(let i=0;i < this._columns.length-1;i++) {
                result += this._columns[i] + ',';
            }
            result += this._columns[this._columns.length - 1] + ' ';
            result += this._order;
        }
        return result;
    }

    sort(a, b) {
        let valueA = '';
        let valueB = '';
        let propertyA = null;
        let propertyB = null;
        let column = null;
        for(let i=0;i < this._columns.length;i++) {
            column = this._columns[i];
            propertyA = a[column];
            if(propertyA === undefined || propertyA === null) {
                propertyA = '';
            }
            propertyB = b[column];
            if(propertyB === undefined || propertyB === null) {
                propertyB = '';
            }
            propertyA = '' + propertyA;
            propertyB = '' + propertyB;
            valueA += propertyA.toUpperCase(); // ignore upper and lowercase
            valueB += propertyB.toUpperCase(); // ignore upper and lowercase
        }
        if (valueA < valueB) {
            return -1 * this._multiplier;
        }
        if (valueA > valueB) {
            return 1 * this._multiplier;
        }
        // names must be equal
        return 0;
    }

    /*********************************************
     * SETTERS
     ********************************************/

    addColumn(_column) {
        this._columns.push(_column);
    }

    setOrder(_order) {
        if(_order === undefined || _order === null) {
            _order = '';
        }
        _order = _order.trim().toUpperCase();
        switch(_order) {
        case 'ASC':
        case 'ASCENDING':
            this._order = SQLOrderBy.ASCENDING;
            break;
        case 'DESC':
        case 'DESCENDING':
            this._order = SQLOrderBy.DESCENDING;
            break;
        default:
            this._order = SQLOrderBy.ASCENDING;
            break;
        }
        this._multiplier = (this._order === SQLOrderBy.ASCENDING) ? 1 : -1;
    }
}
SQLOrderBy.ASCENDING = "ASC";
SQLOrderBy.DESCENDING = "DESC";

module.exports = SQLOrderBy;