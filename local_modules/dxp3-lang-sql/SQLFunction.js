/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-lang-sql
 *
 * NAME
 * SQLFunction
 */
const packageName = 'dxp3-lang-sql';
const moduleName = 'SQLFunction';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
// Check if someone tried to run/execute this file.
const util = require('dxp3-util');
if(util.Assert.isFileToExecute(canonicalName)) {
    util.Help.print();
    return;
}
/**
 * @module dxp3-lang-sql/SQLFunction
 */
const SQLError = require('./SQLError');
const SQLSelectExpression = require('./SQLSelectExpression');
/**
 * An SQL function allows one to extract/manipulate strings, numbers and dates.
 */
class SQLFunction extends SQLSelectExpression {
    /**
     * A SQL function does not necessarily have a specific column it acts on.
     */
    constructor() {
        super(null);
    }

    toString() {
        throw SQLError.NOT_IMPLEMENTED;
    }

    /**
     * A function will be reset at the start of the execution of the select
     * statement. Typically any counters will be set to 0.
     */
    start(_resultSet) {
        throw SQLError.NOT_IMPLEMENTED;
    }

    /**
     * A function will get access to each row through this process function.
     * Typically this function will increase any appropriate counters.
     */
    process(_object, _result) {
        throw SQLError.NOT_IMPLEMENTED;
    }

    /**
     * After all rows have been processed the function will be asked to
     * finish its calculation and provide the result by this end function.
     */
    end(_resultSet) {
        throw SQLError.NOT_IMPLEMENTED;
    }

    /*********************************************
     * GETTERS
     ********************************************/


    /*********************************************
     * SETTERS
     ********************************************/
}

module.exports = SQLFunction;