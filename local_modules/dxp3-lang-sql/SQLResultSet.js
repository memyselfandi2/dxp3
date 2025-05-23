/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-lang-sql
 *
 * NAME
 * SQLResultSet
 */
const packageName = 'dxp3-lang-sql';
const moduleName = 'SQLResultSet';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
// Check if someone tried to run/execute this file.
const util = require('dxp3-util');
if(util.Assert.isFileToExecute(canonicalName)) {
    util.Help.print();
    return;
}
/**
 * @module dxp3-lang-sql/SQLResultSet
 */
const SQLError = require('./SQLError');
const SQLResult = require('./SQLResult');

class SQLResultSet extends SQLResult {
    constructor() {
        super();
    }

    getRow() {
        throw SQLError.NOT_IMPLEMENTED;
    }
    /*
     * Returns an array of rows currently present in the resultset.
     * If the resultset consists of more pages, one will
     * have to check if there are more rows to fetch
     * by calling hasMorePages().
     */
    getRows() {
        throw SQLError.NOT_IMPLEMENTED;
    }
    /*
     * Move curser to the first row.
     * Returns true if there is a first row.
     * Returns false if there are no rows.
     */
    toFirstRow() {
        throw SQLError.NOT_IMPLEMENTED;
    }
    /*
     * Move curser to the last row.
     * Returns true if there is a last row.
     * Returns false if there are no rows.
     */
    toLastRow() {
        throw SQLError.NOT_IMPLEMENTED;
    }
    /*
     * Move cursor forward.
     * Returns true if there was a next row.
     * Returns false if there is no next row.
     */
    toNextRow() {
        throw SQLError.NOT_IMPLEMENTED;
    }
    /*
     * Move curser to the previous row.
     * Returns true if there is a previous row.
     * Returns false if there is no previous row.
     */
    toPreviousRow() {
        throw SQLError.NOT_IMPLEMENTED;
    }

    async close() {
        throw SQLError.NOT_IMPLEMENTED;
    }

    hasMorePages() {
        throw SQLError.NOT_IMPLEMENTED;
    }

    hasMoreRows() {
        throw SQLError.NOT_IMPLEMENTED;
    }

    async toNextPage() {
        throw SQLError.NOT_IMPLEMENTED;
    }
}

module.exports = SQLResultSet;