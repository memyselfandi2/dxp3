/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-lang-sql
 *
 * NAME
 * SQLAlterTableRenameColumnQuery
 */
const packageName = 'dxp3-lang-sql';
const moduleName = 'SQLAlterTableRenameColumnQuery';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
// Check if someone tried to run/execute this file.
const util = require('dxp3-util');
if(util.Assert.isFileToExecute(canonicalName)) {
    util.Help.print();
    return;
}
/**
 * @module dxp3-lang-sql/SQLAlterTableRenameColumnQuery
 */
const logging = require('dxp3-logging');
const SQLColumn = require('./SQLColumn');
const SQLError = require('./SQLError');
const SQLQuery = require('./SQLQuery');

const logger = logging.getLogger(canonicalName);

class SQLAlterTableRenameColumnQuery extends SQLQuery {
    /*********************************************
     * CONSTRUCTOR
     ********************************************/

	/**
     * constructor(String _tableName);
     * constructor(String _tableName, String|SQLColumn _from, String|SQLColumn _to);
     * constructor(String _tableName, Array<String|SQLColumn> _from, Array<String|SQLColumn> _to);
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
        this._from = [];
        this._to = [];
        let _from = arguments[1];
        if(_from === undefined || _from === null) {
            throw SQLError.ILLEGAL_ARGUMENT;
        }
        if(typeof _from === 'string') {
            _from = [_from];
        } else if(_from instanceof SQLColumn) {
            _from = [_from]
        } else if(!Array.isArray(_from)) {
            return;
        }
        for(let i=0;i < _from.length;i++) {
            let from = _from[i];
            if(from === undefined || from === null) {
                continue;
            }
            if(typeof from === 'string') {
                from = from.trim();
                if(from.length <= 0) {
                    continue;
                }
                let columnName = from.replaceAll('[', '').replaceAll(']','').trim();
                this._from.push(columnName);
            } else if(from instanceof SQLColumn) {
                this._from.push(from.getName());
            }
        }
        let _to = arguments[2];
        if(_to === undefined || _to === null) {
            throw SQLError.ILLEGAL_ARGUMENT;
        }
        if(typeof _to === 'string') {
            _to = [_to];
        } else if(_to instanceof SQLColumn) {
            _to = [_to]
        } else if(!Array.isArray(_to)) {
            return;
        }
        for(let i=0;i < _to.length;i++) {
            let to = _to[i];
            if(to === undefined || to === null) {
                continue;
            }
            if(typeof to === 'string') {
                to = to.trim();
                if(to.length <= 0) {
                    continue;
                }
                let columnName = to.replaceAll('[', '').replaceAll(']','').trim();
                this._to.push(columnName);
            } else if(to instanceof SQLColumn) {
                this._to.push(to.getName());
            }
        }
        if(this._from.length != this._to.length) {
            logger.warn('constructor(...): Different number of from and to columns.');
            throw SQLError.ILLEGAL_ARGUMENT;
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
        let result = await _sqlConnection.alterTableRenameColumns(this._tableName, this._from, this._to);
        return result;
    }

	toString() {
        let result = 'ALTER TABLE ';
        if(this._tableName.includes(' ')) {
            result += '[' + this._tableName + ']';
        } else {
            result += this._tableName;
        }
    	result += ' RENAME COLUMN ';
        for(let i = 0; i < this._from.length; i++) {
            let from = this._from[i];
            if(from.indexOf(' ') > 0) {
                result += '[' + from + ']';
            } else {
                result += from;
            }
            result += ' TO ';
            let to = this._to[i];
            if(to.indexOf(' ') > 0) {
                result += '[' + to + ']';
            } else {
                result += to;
            }
            if(i < (this._from.length - 1)) {
                result += ', ';
            }
        }
    	result += ';';
        return result;
    }

    /*********************************************
     * GETTERS
     ********************************************/

    get from() {
        return getFrom();
    }

    getFrom() {
        return this._from;
    }

    get to() {
        return getTo();
    }

    getTo() {
        return this._to;
    }

    get tableName() {
        return getTableName();
    }

    getTableName() {
        return this._tableName;
    }
}

module.exports = SQLAlterTableRenameColumnQuery;