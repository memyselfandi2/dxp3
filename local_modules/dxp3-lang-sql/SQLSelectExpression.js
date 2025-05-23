/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-lang-sql
 *
 * NAME
 * SQLSelectExpression
 */
const packageName = 'dxp3-lang-sql';
const moduleName = 'SQLSelectExpression';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
// Check if someone tried to run/execute this file.
const util = require('dxp3-util');
if(util.Assert.isFileToExecute(canonicalName)) {
   util.Help.print();
   return;
}
/**
 * @module dxp3-lang-sql/SQLSelectExpression
 */
class SQLSelectExpression {
    /*********************************************
     * CONSTRUCTOR
     ********************************************/

    constructor(_columnName) {
        if(_columnName === undefined || _columnName === null) {
            _columnName = '*';
        } else {
            _columnName = _columnName.trim();
            if(_columnName.length <= 0) {
                _columnName = '*';
            }
        }
        this._columnName = _columnName;
        this._columnNameNoWhiteSpace = _columnName.replaceAll(' ', '_');
        this._alias = '';
        this._aliasNoWhiteSpace = '';
        this._groupBy = null;
        this._property = this._columnNameNoWhiteSpace;
    }

    /*********************************************
     * PUBLIC METHODS
     ********************************************/

    start(_resultSet) {
    }

    process(_object, _result) {
        _result[this._property] = _object[this._columnNameNoWhiteSpace];
        return _result;
    }

    end(_resultSet) {
    }

    toString() {
        let result = '';
        if(this.columnName.indexOf(' ') < 0) {
            result += this.columnName;
        } else {
            result += '[' + this.columnName + ']';
        }
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

    /*********************************************
     * GETTERS
     ********************************************/

    get alias() {
        return this.getAlias();
    }

    get aliasNoWhiteSpace() {
        return this.getAliasNoWhiteSpace();
    }

    getAlias() {
        return this._alias;
    }

    getAliasNoWhiteSpace() {
        return this._aliasNoWhiteSpace;
    }

    get columnName() {
        return this.getColumnName();
    }

    getColumnName() {
        return this._columnName;
    }

    get columnNameNoWhiteSpace() {
        return this.getColumnNameNoWhiteSpace();
    }

    getColumnNameNoWhiteSpace() {
        return this._columnNameNoWhiteSpace;
    }

    /*********************************************
     * SETTERS
     ********************************************/

    set alias(_alias) {
        this.setAlias(_alias);
    }

    setAlias(_alias) {
        if(_alias === undefined || _alias === null) {
            _alias = '';
        }
        this._alias = _alias.trim();
        this._aliasNoWhiteSpace = _alias.trim().replaceAll(' ', '_');
        this._property = this._aliasNoWhiteSpace;
    }

    set groupBy(_groupBy) {
        this.setGroupBy(_groupBy);
    }

    setGroupBy(_groupBy) {
        if(_groupBy === undefined) {
            this._groupBy = null;
        } else {
            this._groupBy = _groupBy;
        }
    }
}

module.exports = SQLSelectExpression;