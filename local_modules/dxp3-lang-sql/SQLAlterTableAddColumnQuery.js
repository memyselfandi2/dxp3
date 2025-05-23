/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-lang-sql
 *
 * NAME
 * SQLAlterTableAddColumnQuery
 */
const packageName = 'dxp3-lang-sql';
const moduleName = 'SQLAlterTableAddColumnQuery';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
// Check if someone tried to run/execute this file.
const util = require('dxp3-util');
if(util.Assert.isFileToExecute(canonicalName)) {
    util.Help.print();
    return;
}
/**
 * @module dxp3-lang-sql/SQLAlterTableAddColumnQuery
 */
const logging = require('dxp3-logging');
const SQLError = require('./SQLError');
const SQLQuery = require('./SQLQuery');

const logger = logging.getLogger(canonicalName);

class SQLAlterTableAddColumnQuery extends SQLQuery {
    /*********************************************
     * CONSTRUCTOR
     ********************************************/

    /**
     * constructor(String _tableName);
     * constructor(String _tableName, Array<Object> _columns);
     * constructor(String _tableName, Array<String> _columns, Array<String> _dataTypes);
     */
    constructor() {
        super();
        if(arguments.length < 1) {
            // Calling constructor(...) without the required arguments could be
            // a programming error. Lets log a warning.
            logger.warn('constructor(...): Missing arguments.');
            throw SQLError.ILLEGAL_ARGUMENT;
        }
        // First argument must be the name of the table to alter.
        let _tableName = arguments[0];
        if(_tableName === undefined || _tableName === null) {
            // Calling constructor(...) without a _tableName could be
            // a programming error. Lets log a warning.
            logger.warn('constructor(...): Missing arguments.');
            throw SQLError.ILLEGAL_ARGUMENT;
        }
        if(typeof _tableName != 'string') {
            // Calling constructor(...) with a non-string argument could be
            // a programming error. Lets log a warning.
            logger.warn('constructor(...): Argument of wrong type.');
            throw SQLError.ILLEGAL_ARGUMENT;
        }
        _tableName = _tableName.trim();
        if(_tableName.length <= 0) {
            // Calling constructor(...) with an empty _tableName could be
            // a programming error. Lets log a warning.
            logger.warn('constructor(...): Empty argument.');
            throw SQLError.ILLEGAL_ARGUMENT;
        }
        this._tableName = _tableName;
        let _columns = arguments[1];
        let _dataTypes = arguments[2];
        this._columns = [];
        if(_columns === undefined || _columns === null) {
            return;
        }
        if(_dataTypes === undefined || _dataTypes === null) {
            for(let i=0;i < _columns.length;i++) {
                let column = _columns[i];
                if(column === undefined || column === null) {
                    continue;
                }
                if(typeof column === 'string') {
                    column = column.trim();
                    if(column.length <= 0) {
                        continue;
                    }
                    column = column.replaceAll('[', '').replaceAll(']',' ');
                    let lastIndexOfWhiteSpace = column.lastIndexOf(' ');
                    if(lastIndexOfWhiteSpace < 0) {
                        continue;
                    }
                    let columnName = column.substring(0, lastIndexOfWhiteSpace).trim();
                    let dataType = column.substring(lastIndexOfWhiteSpace).trim();
                    column = {
                        name: columnName,
                        dataType: dataType
                    }
                    this._columns.push(column);
                } else {
                    this._columns.push(column);
                }
            }
        } else {
            for(let i=0;i < _columns.length;i++) {
                let columnName = _columns[i];
                if(columnName === undefined || columnName === null) {
                    continue;
                }
                columnName = columnName.trim();
                if(columnName.length <= 0) {
                    continue;
                }
                let dataType = _dataTypes[i].trim();
                let column = {
                    name: columnName,
                    dataType: dataType
                }
                this._columns.push(column);
            }            
        }
    }

    /*********************************************
     * PUBLIC METHODS
     ********************************************/

    async execute(_sqlConnection) {
        // Defensive programming...check input...
        if(_sqlConnection === undefined || _sqlConnection === null) {
            // Calling execute(...) without a _sqlConnection could be
            // a programming error. Lets log a warning.
            logger.warn('execute(...): Missing arguments.');
            throw SQLError.ILLEGAL_ARGUMENT;
        }
        let result = await _sqlConnection.alterTableAddColumns(this._tableName, this._columns);
        return result;
    }

    toString() {
        let result = 'ALTER TABLE ';
        if(this._tableName.includes(' ')) {
            result += '[' + this._tableName + ']';
        } else {
            result += this._tableName;
        }
        result += ' ADD COLUMN ';
        for(let i = 0; i < this._columns.length; i++) {
            let column = this._columns[i];
            if(column.name.indexOf(' ') < 0) {
                result += column.name;
            } else {
                result += '[' + column.name + ']';
            }
            result += ' ';
            result += column.dataType;
            if(i < (this._columns.length - 1)) {
                result += ', ';
            }
        }
        result += ';';
        return result;
    }

    /*********************************************
     * GETTERS
     ********************************************/

    get columns() {
        return getColumns();
    }

    getColumns() {
        return this._columns;
    }

    get tableName() {
        return getTableName();
    }

    getTableName() {
        return this._tableName;
    }
}

module.exports = SQLAlterTableAddColumnQuery;