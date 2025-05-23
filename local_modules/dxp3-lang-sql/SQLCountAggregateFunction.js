/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-lang-sql
 *
 * NAME
 * SQLCountAggregateFunction
 */
const packageName = 'dxp3-lang-sql';
const moduleName = 'SQLCountAggregateFunction';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
// Check if someone tried to run/execute this file.
const util = require('dxp3-util');
if(util.Assert.isFileToExecute(canonicalName)) {
   util.Help.print();
   return;
}
/**
 * @module dxp3-lang-sql/SQLCount
 */
const SQLError = require('./SQLError');
const SQLAggregateFunction = require('./SQLAggregateFunction');

class SQLCountAggregateFunction extends SQLAggregateFunction {
    /*********************************************
     * CONSTRUCTOR
     ********************************************/

    /**
     * @param {String} _columnName
     */
	constructor(_columnName) {
		super(_columnName);
        this._counter = 0;
        this._groups = new Map();
	}

    /*********************************************
     * PUBLIC METHODS
     ********************************************/

    toString() {
        let result = 'COUNT(';
        if(this._distinct) {
            result += 'DISTINCT ';
        }
        result += this._columnName;
        result += ')';
        if(this._alias.length > 0) {
            result += ' AS ';
            if(this._alias.includes(' ')) {
                result += '[' + this._alias + ']';
            } else {
                result += this._alias;
            }
        }
        return result;
    }

    start(_resultSet) {
        this._counter = 0;
        this._groups = new Map();
        this._distinctValues = new Set();
    }

    process(_object, _result) {
        if(this._groupBy === null) {
            if(this._columnName === '*') {
                this._counter++;
            } else {
                let value = _object[this._columnName];
                if(value != undefined && value != null) {
                    if(this._distinct) {
                        if(!this._distinctValues.has(value)) {
                            this._counter++;
                            this._distinctValues.add(value);
                        }
                    } else {
                        this._counter++;
                    }
                }
            }
        } else {
            let groupKey = this._groupBy.groupKey(_object);
            let group = this._groups.get(groupKey.id);
            if(this._columnName === '*') {
                if(group === undefined || group === null) {
                    group = groupKey;
                    group.groupCounter = 0;
                    group.distinctValues = new Set();
                    this._groups.set(groupKey.id, group);
                }
                group.groupCounter++;
            } else {
                let value = _object[this._columnName];
                if(value != undefined && value != null) {
                    if(group === undefined || group === null) {
                        group = groupKey;
                        group.groupCounter = 0;
                        group.distinctValues = new Set();
                        this._groups.set(groupKey.id, group);
                    }
                    if(this._distinct) {
                        if(!group.distinctValues.has(value)) {
                            group.groupCounter++;
                            group.distinctValues.add(value);
                        }
                    } else {
                        group.groupCounter++;
                    }
                }
            }
        }
        return _result;
    }

    end(_resultSet) {
        let property = super.getAliasNoWhiteSpace();
        if(property.length <= 0) {
            property = super.getColumnName();
            if(property === '*') {
                property = 'count';
            } else {
                property = 'count_' + property;
            }
        }
        if(this._groupBy === null) {
            let result = _resultSet[0];
            if(result === undefined || result === null) {
                result = {};
                _resultSet.push(result);
            }
            result[property] = this._counter;
        } else {
            for(const [groupKey, group] of this._groups) {
                let found = false;
                for(let j=0;j < _resultSet.length;j++) {
                    let row = _resultSet[j];
                    let rowGroupKey = this._groupBy.groupKey(row);
                    if(rowGroupKey.id === groupKey) {
                        row[property] = group.groupCounter;
                        found = true;
                        break;
                    }
                }
                if(!found) {
                    let result = group;
                    delete group.id;
                    result[property] = group.groupCounter;
                    delete group.groupCounter;
                    delete group.distinctValues;
                    _resultSet.push(result);
                }
            }            
        }
    }
}

module.exports = SQLCountAggregateFunction;