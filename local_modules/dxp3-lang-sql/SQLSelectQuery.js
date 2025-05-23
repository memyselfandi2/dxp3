/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-lang-sql
 *
 * NAME
 * SQLSelectQuery
 */
const packageName = 'dxp3-lang-sql';
const moduleName = 'SQLSelectQuery';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
// Check if someone tried to run/execute this file.
const util = require('dxp3-util');
if(util.Assert.isFileToExecute(canonicalName)) {
	util.Help.print();
	return;
}
/**
 * @module dxp3-lang-sql/SQLSelectQuery
 */
const logging = require('dxp3-logging');
const SQLCondition = require('./SQLCondition');
const SQLError = require('./SQLError');
const SQLGroupBy = require('./SQLGroupBy');
const SQLOrderBy = require('./SQLOrderBy');
const SQLQuery = require('./SQLQuery');

const logger = logging.getLogger(canonicalName);

/**
 * Examples:
 * SELECT * FROM users;
 * SELECT firstName,lastName FROM users;
 * SELECT DISTINCT customerID FROM orders;
 * SELECT COUNT(*) AS [Number of Orders],AVG(unit_price) AS "Average Unit Price",SUM(quantity) AS [Total Units] FROM orders;
 */
class SQLSelectQuery extends SQLQuery {
    /*********************************************
     * CONSTRUCTOR
     ********************************************/

	/**
	 * constructor(String _tableName);
	 * constructor(Array<SQLSelectExpression> _sqlSelectExpressions, String _tableName);
	 * constructor(String _tableName, SQLCondition _sqlCondition);
	 * constructor(Array<SQLSelectExpression> _sqlSelectExpressions, String _tableName, SQLCondition _sqlCondition);
	 */
	constructor() {
		super();
		if(arguments.length <= 0) {
            // Calling constructor(...) without any arguments could be
            // a programming error. Lets log a warning.
            logger.warn('constructor(...): Missing arguments.');
            throw SQLError.ILLEGAL_ARGUMENT;
		}
		this._sqlSelectExpressions = null;
		this._tableName = null;
		this._sqlCondition = null;
		if(arguments.length === 1) {
			this._tableName = arguments[0];
		} else if(arguments.length === 2) {
			if(typeof arguments[0] === 'string') {
				this._tableName = arguments[0];
				this._sqlCondition = arguments[1];
			} else {
				this._sqlSelectExpressions = arguments[0];
				this._tableName = arguments[1];
			}
		} else if(arguments.length === 3) {
			this._sqlSelectExpressions = arguments[0];
			this._tableName = arguments[1];
			this._sqlCondition = arguments[2];
		}
		if(this._tableName === undefined || this._tableName === null) {
            // Calling constructor(...) without a _tableName could be
            // a programming error. Lets log a warning.
            logger.warn('constructor(...): Missing arguments.');
            throw SQLError.ILLEGAL_ARGUMENT;
		}
		if(typeof this._tableName != 'string') {
            // Calling constructor(...) with a non-string argument could be
            // a programming error. Lets log a warning.
            logger.warn('constructor(...): Argument of wrong type.');
            throw SQLError.ILLEGAL_ARGUMENT;
		}
		this._tableName = this._tableName.trim();
		if(this._tableName.length <= 0) {
            // Calling constructor(...) with an empty _tableName could be
            // a programming error. Lets log a warning.
            logger.warn('constructor(...): Empty argument.');
			throw SQLError.ILLEGAL_ARGUMENT;
		}
		this._distinct = false;
		this._groupBy = null;
		this._having = null;
		this._orderBy = null;
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
        if(this._distinct) {
			return _sqlConnection.selectDistinct(this._sqlSelectExpressions, this._tableName, this._sqlCondition, this._groupBy, this._having, this._orderBy);
        } else {
			return _sqlConnection.select(this._sqlSelectExpressions, this._tableName, this._sqlCondition, this._groupBy, this._having, this._orderBy);
        }
    }

	toString() {
        let result = 'SELECT ';
        if(this._distinct) {
        	result += 'DISTINCT ';
        }
        if((this._sqlSelectExpressions != null) &&
           (this._sqlSelectExpressions.length > 0)) {
            let sqlSelectExpression = null;
            let i = 0;
            let lastIndex = this._sqlSelectExpressions.length - 1;
            for(i = 0; i < lastIndex; i++) {
                sqlSelectExpression = this._sqlSelectExpressions[i];
	            result += sqlSelectExpression.toString();
                result += ', ';
            }
            sqlSelectExpression = this._sqlSelectExpressions[i];
            result += sqlSelectExpression;
        } else {
	        result += '*';
	    }
	    result += ' FROM ';
	    if(this._tableName.includes(' ')) {
	    	result += '[' + this._tableName + ']';
	    } else {
	        result += this._tableName;
	    }
        if(this._sqlCondition != null) {
            result += ' WHERE ';
            result += this._sqlCondition.toString();
        }
        if(this._groupBy != null) {
        	result += ' ' + this._groupBy.toString();
        }
        if(this._having != null) {
        	result += ' ' + this._having.toString();
        }
        if(this._orderBy != null) {
        	result += ' ' + this._orderBy.toString();
        } 
        result += ';';

        return result;
    }

    /*********************************************
     * GETTERS
     ********************************************/

	get sqlSelectExpressions() {
		return this.getSQLSelectExpression();
	}

	getSQLSelectExpression() {
		return this._sqlSelectExpressions;
	}

	get distinct() {
		return this.getDistinct();
	}

	getDistinct() {
		return this._distinct;
	}

	get sqlCondition() {
		return this.getSQLCondition();
	}

	getSQLCondition() {
		return this._sqlCondition;
	}

	get tableName() {
		return getTableName();
	}

	getTableName() {
		return this._tableName;
	}

	get groupBy() {
		return getGroupBy();
	}

	getGroupBy() {
		return this._groupBy;
	}

	get having() {
		return getHaving();
	}

	getHaving() {
		return this._having;
	}

	get orderBy() {
		return getOrderBy();
	}

	getOrderBy() {
		return this._orderBy;
	}

    /*********************************************
     * SETTERS
     ********************************************/

	set distinct(_distinct) {
		this.setDistinct(_distinct);
	}

	setDistinct(_distinct) {
		this._distinct = _distinct;
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
		if(this._sqlSelectExpressions != undefined && this._sqlSelectExpressions != null) {
			for(let i=0;i < this._sqlSelectExpressions.length;i++) {
				let sqlSelectExpression = this._sqlSelectExpressions[i];
				sqlSelectExpression.setGroupBy(this._groupBy);
			}
		}
	}

	set having(_having) {
		this.setHaving(_having);
	}

	setHaving(_having) {
		if(_having === undefined) {
			this._having = null;
		} else {
			this._having = _having;
		}
	}

	set orderBy(_orderBy) {
		if(_orderBy === undefined) {
			this._orderBy = null;
		} else {
			this._orderBy = _orderBy;
		}
	}

	setOrderBy(_orderBy) {
		this.orderBy = _orderBy;
	}
}

module.exports = SQLSelectQuery;