/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-db/inmemory
 *
 * NAME
 * InMemoryTableIndex
 */
const path = require('path');
const packageName = 'dxp3-db' + path.sep + 'inmemory';
const moduleName = 'InMemoryTableIndex';
const canonicalName = packageName + path.sep + moduleName;
/**
 * @module dxp3-db/inmemory/InMemoryTableIndex
 */
const DatabaseError = require('../DatabaseError');
const TableIndex = require('../TableIndex');
const logging = require('dxp3-logging');
const sql = require('dxp3-lang-sql');
const util = require('dxp3-util');

const logger = logging.getLogger(canonicalName);

class InMemoryTableIndex extends TableIndex {

    constructor(_uuid, _name, _table, _columnUUID, _columnName) {
		super(_uuid, _name, _table.getUUID(), _columnUUID);
		this._table = _table;
        let column = null;
        if(this._columnUUID != undefined && this._columnUUID != null) {
            column = this._table.getColumnByUUID(this._columnUUID);
        }
        if(column === null) {
            this._columnName = _columnName;
        } else {
    		this._columnName = column.getName();
        }
	}

    async init() {
    }

    async close() {
        logger.trace('close(...): start.');
        logger.trace('close(...): end.');
    }

    equal(_value) {
        let result = [];
        for(let [id, row] of this._table._rows) {
            let columnValue = row[this._columnName];
            if(columnValue === _value) {
                result.push(row);
            }
        }
        return result;
    }

    equalColumn(_columnName) {
        let result = [];
        for(let [id, row] of this._table._rows) {
            let columnValue = row[this._columnName];
            let otherColumnValue = row[_columnName];
            if(columnValue === otherColumnValue) {
                result.push(row);
            }
        }
        return result;
    }

    greater(_value) {
        let result = [];
        for(let [id, row] of this._table._rows) {
            let columnValue = row[this._columnName];
            if(columnValue > _value) {
                result.push(row);
            }
        }
        return result;
    }

    greaterColumn(_columnName) {
        let result = [];
        for(let [id, row] of this._table._rows) {
            let columnValue = row[this._columnName];
            let otherColumnValue = row[_columnName];
            if(columnValue > otherColumnValue) {
                result.push(row);
            }
        }
        return result;
    }

    greaterOrEqual(_value) {
        let result = [];
        for(let [id, row] of this._table._rows) {
            let columnValue = row[this._columnName];
            if(columnValue >= _value) {
                result.push(row);
            }
        }
        return result;
    }

    greaterOrEqualColumn(_columnName) {
        let result = [];
        for(let [id, row] of this._table._rows) {
            let columnValue = row[this._columnName];
            let otherColumnValue = row[_columnName];
            if(columnValue >= otherColumnValue) {
                result.push(row);
            }
        }
        return result;
    }

    in(_values) {
        let result = [];
        for(let [id, row] of this._table._rows) {
            let columnValue = row[this._columnName];
            if(_values.includes(columnValue)) {
                result.push(row);
            }
        }
        return result;
    }

    less(_value) {
        let result = [];
        for(let [id, row] of this._table._rows) {
            let columnValue = row[this._columnName];
            if(columnValue < _value) {
                result.push(row);
            }
        }
        return result;
    }

    lessColumn(_columnName) {
        let result = [];
        for(let [id, row] of this._table._rows) {
            let columnValue = row[this._columnName];
            let otherColumnValue = row[_columnName];
            if(columnValue < otherColumnValue) {
                result.push(row);
            }
        }
        return result;
    }

    lessOrEqual(_value) {
        let result = [];
        for(let [id, row] of this._table._rows) {
            let columnValue = row[this._columnName];
            if(columnValue <= _value) {
                result.push(row);
            }
        }
        return result;
    }

    lessOrEqualColumn(_columnName) {
        let result = [];
        for(let [id, row] of this._table._rows) {
            let columnValue = row[this._columnName];
            let otherColumnValue = row[_columnName];
            if(columnValue <= otherColumnValue) {
                result.push(row);
            }
        }
        return result;
    }

    like(_value) {
        _value = _value.replace(/%/g, '.*').replace(/_/g, '.');
        _value = '^' + _value + '$';
        let result = [];
        for(let [id, row] of this._table._rows) {
            let columnValue = row[this._columnName];
            if(columnValue === undefined || columnValue === null) {
                continue;
            }
            if(columnValue.match(_value)) {
                result.push(row);
            }
        }
        return result;
    }

    refresh() {
        throw DatabaseError.NOT_IMPLEMENTED;
    }

    unequal(_value) {
        let result = [];
        for(let [id, row] of this._table._rows) {
            let columnValue = row[this._columnName];
            if(columnValue != _value) {
                result.push(row);
            }
        }
        return result;
    }

    unequalColumn(_columnName) {
        let result = [];
        for(let [id, row] of this._table._rows) {
            let columnValue = row[this._columnName];
            let otherColumnValue = row[_columnName];
            if(columnValue != otherColumnValue) {
                result.push(row);
            }
        }
        return result;
    }
}

module.exports = InMemoryTableIndex;