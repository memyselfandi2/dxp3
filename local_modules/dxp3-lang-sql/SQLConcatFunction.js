/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-lang-sql
 *
 * NAME
 * SQLSum
 */
const packageName = 'dxp3-lang-sql';
const moduleName = 'SQLConcatFunction';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
// Check if someone tried to run/execute this file.
const util = require('dxp3-util');
if(util.Assert.isFileToExecute(canonicalName)) {
   util.Help.print();
   return;
}
/**
 * @module dxp3-lang-sql/SQLConcatFunction
 */
const SQLColumn = require('./SQLColumn');
const SQLError = require('./SQLError');
const SQLFunction = require('./SQLFunction');

class SQLConcatFunction extends SQLFunction {
    /*********************************************
     * CONSTRUCTOR
     ********************************************/

	constructor(_arrayOfColumnsAndValues) {
		super();
        this._arrayOfColumnsAndValues = _arrayOfColumnsAndValues;
        this._property = 'concat';
	}

    /*********************************************
     * PUBLIC METHODS
     ********************************************/

    toString() {
        let result = 'CONCAT(';
        for(let i=0;i < this._arrayOfColumnsAndValues.length;i++) {
            let valueAtIndex = this._arrayOfColumnsAndValues[i];
            result += valueAtIndex;
            if(i < (this._arrayOfColumnsAndValues.length - 1)) {
                result += ', ';
            }
        }
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
    }

    process(_object, _result) {
        let concatenatedString = '';
        for(let i=0;i < this._arrayOfColumnsAndValues.length;i++) {
            let valueAtIndex = this._arrayOfColumnsAndValues[i];
            if(valueAtIndex instanceof SQLColumn) {
                concatenatedString += _object[valueAtIndex.getName()];
            } else {
                concatenatedString += valueAtIndex;
            }
        }
        _result[this._property] = concatenatedString;
        return _result;
    }

    end(_resultSet) {
    }
}

module.exports = SQLConcatFunction;