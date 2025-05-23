/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-lang-sql
 *
 * NAME
 * SQLMin
 */
const packageName = 'dxp3-lang-sql';
const moduleName = 'SQLMinAggregateFunction';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
// Check if someone tried to run/execute this file.
const util = require('dxp3-util');
if(util.Assert.isFileToExecute(canonicalName)) {
   util.Help.print();
   return;
}
/**
 * @module dxp3-lang-sql/SQLMin
 */
const SQLError = require('./SQLError');
const SQLAggregateFunction = require('./SQLAggregateFunction');

class SQLMinAggregateFunction extends SQLAggregateFunction {
    /*********************************************
     * CONSTRUCTOR
     ********************************************/

    /**
     * @param {String} _columnName
 	 * @throws {module:dxp3-lang-sql/SQLError~SQLError.ILLEGAL_ARGUMENT} When the name is
 	 * undefined, null or empty.
     */
	constructor(_columnName) {
        if(_columnName === undefined || _columnName === null) {
            throw SQLError.ILLEGAL_ARGUMENT;
        }
        _columnName = _columnName.trim();
        if(_columnName.length <= 0) {
            throw SQLError.ILLEGAL_ARGUMENT;
        }
		super(_columnName);
        this._min = null;
        this._groups = new Map();
	}

    start(_resultSet) {
        this._min = null;
        this._groups = new Map();
    }

    process(_object, _result) {
        let value = _object[this._columnName];
        if(value === undefined || value === null) {
            return _result;
        }
        if(this._groupBy === null) {
            if(this._min === null) {
                this._min = value;
            } else if(value < this._min) {
                this._min = value;
            }
        } else {
            let groupKey = this._groupBy.groupKey(_object);
            let group = this._groups.get(groupKey.id);
            if(group === undefined || group === null) {
                group = groupKey;
                group.min = null;
                this._groups.set(groupKey.id, group);
            }
            if(group.min === null) {
                group.min = value;
            } else if(value < group.min) {
                group.min = value;
            }
        }
        return _result;
    }

    end(_resultSet) {
        let property = super.getAliasNoWhiteSpace();
        if(property.length <= 0) {
            property = 'min_' + super.getColumnName();
        }
        if(this._groupBy === null) {
            let result = _resultSet[0];
            if(result === undefined || result === null) {
                result = {};
                _resultSet.push(result);
            }
            result[property] = this._min;
        } else {
            for(const [groupKey, group] of this._groups) {
                let found = false;
                for(let j=0;j < _resultSet.length;j++) {
                    let row = _resultSet[j];
                    let rowGroupKey = this._groupBy.groupKey(row);
                    if(rowGroupKey.id === groupKey) {
                        row[property] = group.min;
                        found = true;
                        break;
                    }
                }
                if(!found) {
                    let result = group;
                    delete group.id;
                    result[property] = group.min;
                    delete group.min;
                    _resultSet.push(result);
                }
            }
        }
    }

    /*********************************************
     * PUBLIC METHODS
     ********************************************/

    toString() {
        let result = 'MIN(';
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
}

module.exports = SQLMinAggregateFunction;