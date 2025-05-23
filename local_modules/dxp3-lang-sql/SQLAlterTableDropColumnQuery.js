/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-lang-sql
 *
 * NAME
 * SQLAlterTableDropColumnQuery
 */
const packageName = 'dxp3-lang-sql';
const moduleName = 'SQLAlterTableDropColumnQuery';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
// Check if someone tried to run/execute this file.
const util = require('dxp3-util');
if(util.Assert.isFileToExecute(canonicalName)) {
    util.Help.print();
    return;
}
/**
 * @module dxp3-lang-sql/SQLAlterTableDropColumnQuery
 */
const logging = require('dxp3-logging');
const SQLColumn = require('./SQLColumn');
const SQLError = require('./SQLError');
const SQLQuery = require('./SQLQuery');

const logger = logging.getLogger(canonicalName);

class SQLAlterTableDropColumnQuery extends SQLQuery {
    /*********************************************
     * CONSTRUCTOR
     ********************************************/

	/**
     * constructor(String _tableName);
     * constructor(String _tableName, String|SQLColumn _column);
     * constructor(String _tableName, Array<String|SQLColumn> _columns);
	 */
	constructor() {
		super();
		if(arguments.length < 1) {
            // Calling constructor(...) without the required arguments could be
            // a programming error. Lets log a warning.
            logger.warn('constructor(...): Missing arguments.');
            throw SQLError.ILLEGAL_ARGUMENT;
		}
		// First argument must be the name of the table to create.
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
        this._columnNames = [];
        let _columns = arguments[1];
        if(_columns === undefined || _columns === null) {
            return;
        }
        if(typeof _columns === 'string') {
            _columns = _columns.split(',');
        } else if(_columns instanceof SQLColumn) {
            _columns = [_columns]
        } else if(!Array.isArray(_columns)) {
            throw SQLError.ILLEGAL_ARGUMENT;
        }
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
                let columnName = column.replaceAll('[', '').replaceAll(']','').trim();
                this._columnNames.push(columnName);
            } else if(column instanceof SQLColumn) {
                this._columnNames.push(column.getName());
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
        let result = await _sqlConnection.alterTableDropColumns(this._tableName, this._columnNames);
        return result;
    }

	toString() {
        let result = 'ALTER TABLE ';
        if(this._tableName.includes(' ')) {
            result += '[' + this._tableName + ']';
        } else {
            result += this._tableName;
        }
    	result += ' DROP COLUMN ';
        for(let i = 0; i < this._columnNames.length; i++) {
            let columnName = this._columnNames[i];
            if(columnName.indexOf(' ') > 0) {
                result += '[' + columnName + ']';
            } else {
                result += columnName;
            }
            if(i < (this._columnNames.length - 1)) {
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

module.exports = SQLAlterTableDropColumnQuery;