/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-lang-sql
 *
 * NAME
 * SQLAggregateFunction
 */
const packageName = 'dxp3-lang-sql';
const moduleName = 'SQLAggregateFunction';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
// Check if someone tried to run/execute this file.
const util = require('dxp3-util');
if(util.Assert.isFileToExecute(canonicalName)) {
    util.Help.print();
    return;
}
/**
 * @module dxp3-lang-sql/SQLAggregateFunction
 */
const SQLError = require('./SQLError');
const SQLSelectExpression = require('./SQLSelectExpression');
/**
 * An SQL aggregate function is one of AVG, COUNT, MAX, MIN, and SUM.
 * Some of these allow a distinct value as well.
 * Use these to count the number of all rows with a certain value or
 * add values up to calculate the sum or the average.
 * When you set the column name to *, null values will be included in the count.
 * Null values are not applicable to calculate the average, maximum, minimum or sum. 
 */
class SQLAggregateFunction extends SQLSelectExpression {
    /*********************************************
     * CONSTRUCTOR
     ********************************************/

    constructor(_columnName) {
        super(_columnName);
        this._distinct = false;
    }

    /*********************************************
     * PUBLIC METHODS
     ********************************************/

    /**
     * An aggregate function will be reset at the start of the execution of the select
     * statement. Typically any counters will be set to 0.
     */
    start(_resultSet) {
        throw SQLError.NOT_IMPLEMENTED;
    }

    /**
     * An aggregate function will get access to each row through this process function.
     * Typically this function will increase any appropriate counters.
     */
    process(_object, _result) {
        throw SQLError.NOT_IMPLEMENTED;
    }

    /**
     * After all rows have been processed the aggregate function will be asked to
     * finish its calculation and provide the result by this end function.
     */
    end(_resultSet) {
        throw SQLError.NOT_IMPLEMENTED;
    }

    toString() {
        throw SQLError.NOT_IMPLEMENTED;
    }

    /*********************************************
     * GETTERS
     ********************************************/

    get columnName() {
        return this.getColumnName();
    }

    getColumnName() {
        return this._columnName;
    }    

    /*********************************************
     * SETTERS
     ********************************************/

    set distinct(_distinct) {
        this.setDistinct(_distinct);
    }

    setDistinct(_distinct) {
        if(_distinct === undefined || _distinct === null) {
            this._distinct = false;
            return;
        }
        if(typeof _distinct === 'string') {
            _distinct = _distinct.toLowerCase();
            if(_distinct === 'true' ||
               _distinct === 'yes'  ||
               _distinct === 'on'   ||
               _distinct === 'y') {
                this._distinct = true;
            } else {
                this._distinct = false;
            }
        } else if(typeof _distinct === 'boolean') {
            this._distinct = _distinct;
        } else {
            this._distinct = false;
        }
    }
}

module.exports = SQLAggregateFunction;