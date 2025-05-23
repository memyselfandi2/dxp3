/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-lang-sql
 *
 * NAME
 * SQLQueryParser
 */
const packageName = 'dxp3-lang-sql';
const moduleName = 'SQLQueryParser';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * @module dxp3-lang-sql/SQLQueryParser
 */
const logging = require('dxp3-logging');
const SQLAlterTableAddColumnQuery = require('./SQLAlterTableAddColumnQuery');
const SQLAlterTableAlterColumnQuery = require('./SQLAlterTableAlterColumnQuery');
const SQLAlterTableDropColumnQuery = require('./SQLAlterTableDropColumnQuery');
const SQLAlterTableRenameColumnQuery = require('./SQLAlterTableRenameColumnQuery');
const SQLAndCondition = require('./SQLAndCondition');
const SQLAvgAggregateFunction = require('./SQLAvgAggregateFunction');
const SQLColumn = require('./SQLColumn');
const SQLCountAggregateFunction = require('./SQLCountAggregateFunction');
const SQLCreateSequenceQuery = require('./SQLCreateSequenceQuery');
const SQLCreateTableQuery = require('./SQLCreateTableQuery');
const SQLDeleteFromQuery = require('./SQLDeleteFromQuery');
const SQLDescQuery = require('./SQLDescQuery');
const SQLError = require('./SQLError');
const SQLGroupBy = require('./SQLGroupBy');
const SQLHaving = require('./SQLHaving');
const SQLIncludesCondition = require('./SQLIncludesCondition');
const SQLInsertIntoQuery = require('./SQLInsertIntoQuery');
const SQLLikeCondition = require('./SQLLikeCondition');
const SQLMaxAggregateFunction = require('./SQLMaxAggregateFunction');
const SQLMinAggregateFunction = require('./SQLMinAggregateFunction');
const SQLConcatFunction = require('./SQLConcatFunction');
const SQLOrCondition = require('./SQLOrCondition');
const SQLOrderBy = require('./SQLOrderBy');
const SQLQueryParserState = require('./SQLQueryParserState');
const SQLSelectQuery = require('./SQLSelectQuery');
const SQLSelectExpression = require('./SQLSelectExpression');
const SQLSumAggregateFunction = require('./SQLSumAggregateFunction');
const SQLUpdateQuery = require('./SQLUpdateQuery');
const SQLLessCondition = require('./SQLLessCondition');
const SQLLessOrEqualCondition = require('./SQLLessOrEqualCondition');
const SQLGreaterCondition = require('./SQLGreaterCondition');
const SQLGreaterOrEqualCondition = require('./SQLGreaterOrEqualCondition');
const SQLEqualCondition = require('./SQLEqualCondition');
const SQLNotEqualCondition = require('./SQLNotEqualCondition');
const SQLInCondition = require('./SQLInCondition');
const SQLBetweenCondition = require('./SQLBetweenCondition');

const logger = logging.getLogger(canonicalName);

const OPERATOR = {
    BETWEEN: 2080,
    EQUAL: 2090,
    NOT_EQUAL: 3000,
    LESS_THAN: 3010,
    LESS_THAN_EQUAL: 3020,
    LIKE: 3030,
    GREATER_THAN: 3040,
    GREATER_THAN_EQUAL: 3050,
    INCLUDES: 3060
}

class SQLQueryParser {
    /*********************************************
     * CONSTRUCTOR
     ********************************************/

	constructor(_sql) {
		this.initialize(_sql);
    }

    /*********************************************
     * PUBLIC METHODS
     ********************************************/

	/**
	 * This is an alias for our initialize method.
	 */
	init(_sql) {
		this.initialize(_sql);
	}

	initialize(_sql) {
        // Set everything to 0.
		this._reset();
		// Defensive programming...check input...
		if(_sql === undefined || _sql === null) {
			_sql = '';
		}
		this.sql = _sql;
        this.length = this.sql.length;
	}

	/**
	 * This is an alias for our initialize method.
	 */
	load(_sql) {
		this.initialize(_sql);
	}

	/**
	 * This is an alias for our initialize method.
	 */
	parse(_sql) {
		this.initialize(_sql);
	}

    async nextSQLQuery() {
        let self = this;
        let character = null;
        try {
            self.state = SQLQueryParserState.SQL_;
            let sqlQuery = null;
            // Keep reading until we have reached the end of the file/text.
            self._mark();
            while ((character = this._read()) != null) {
                switch (self.state) {
                    case SQLQueryParserState.SQL_:
                        switch (character) {
                            // Ignore whitespace and free standing semicolons...
                            case ' ':
                            case '\r':
                            case '\t':
                            case '\n':
                            case ';':
                                self._mark();
                                break;
                            // Possible ALTER TABLE query.
                            case 'A':
                            case 'a':
                                self._unread();
                                sqlQuery = self._parseSQLAlterQuery();
                                break;
                            // Possible CREATE TABLE query.
                            case 'C':
                            case 'c':
                                self._unread();
                                sqlQuery = self._parseSQLCreateQuery();
                                break;
                            // Possible 'DELETE FROM' or 'DESC' query
                            case 'D':
                            case 'd':
                                self.state = SQLQueryParserState.SQL_D;
                                break;
                            // Possible 'INSERT INTO' query
                            case 'I':
                            case 'i':
                                self._unread();
                                sqlQuery = self._parseSQLInsertIntoQuery();
                                break;
                            // Possible MODIFY TABLE query.
                            // We are treating MODIFY as an alias of ALTER.
                            case 'M':
                            case 'm':
                                self._unread();
                                sqlQuery = self._parseSQLAlterQuery();
                                break;
                            // Possible 'UPDATE' query
                            case 'U':
                            case 'u':
                                self._unread();
                                sqlQuery = self._parseUpdateQuery();
                                break;
                            // Possible 'SELECT' query
                            case 'S':
                            case 's':
                                self._unread();
                                sqlQuery = self._parseSQLSelectQuery();
                                break;
                            // Unknown query
                            default:
                                self.state = SQLQueryParserState.SQL_ERROR;
                                break;
                        }
                        break;
                    case SQLQueryParserState.SQL_D:
                        switch (character) {
                            // Possible 'DELETE FROM' or 'DESC' query
                            case 'E':
                            case 'e':
                                self.state = SQLQueryParserState.SQL_DE;
                                break;
                            // Unknown query
                            default:
                                self.state = SQLQueryParserState.SQL_ERROR;
                                break;
                        }
                        break;
                    case SQLQueryParserState.SQL_DE:
                        switch (character) {
                            // Possible 'DELETE FROM' query
                            case 'L':
                            case 'l':
                                self._toMark();
                                sqlQuery = self._parseDeleteFromQuery();
                                break;
                            // Possible 'DESC' query
                            case 'S':
                            case 's':
                                self._toMark();
                                sqlQuery = self._parseDescQuery();
                                break;
                            // Unknown query
                            default:
                                self.state = SQLQueryParserState.SQL_ERROR;
                                break;
                        }
                        break;
                    case SQLQueryParserState.SQL_ERROR:
                        throw SQLError.ILLEGAL_ARGUMENT;
                    default:
                        logger.warn('Unknown state \'' + self.state + '\' while parsing the next SQL query.');
                        throw SQLError.INTERNAL_SERVER_ERROR;
                }
                // If we found a valid SQLQuery, lets return it.
                if(sqlQuery != null) {
                    return sqlQuery;
                }
            }
            return sqlQuery;
        } catch(exception) {
            throw exception;
        }
    }

    /*********************************************
     * GETTERS
     ********************************************/

    getSQL() {
        return this.sql;
    }

    getState() {
        return this.state;
    }

    /*********************************************
     * SETTERS
     ********************************************/

    /**
     * This is an alias for our initialize method.
     */
    setSQL(_sql) {
        this.initialize(_sql);
    }

    /*********************************************
     * PRIVATE METHODS
     ********************************************/

	_read() {
        this.index++;
        if(this.index >= this.length) {
            return null;
        }
        return this.sql.charAt(this.index);
    }

    _unread() {
        this.index--;
        if(this.index < -1) {
            this.index = -1;
        }
    }

	_reset() {
        this.index = -1;
        this.length = 0;
        this.sql = '';
        this._marker = -1;
        /*
         * Start from the beginning. We don't yet know what sql
         * statement it is, so set state to SQLQueryParserState.SQL_
         */
        this._setState(SQLQueryParserState.SQL_);
	}

    _mark() {
        this._marker = this.index;
    }

    _toMark() {
        this.index = this._marker;
    }

	_setState(_state) {
		this.state = _state;
	}

    _parseSQLAlterQuery() {
        if((!this._parseAlterString()) && (!this._parseModifyString())) {
            throw new Error("SQLQueryParser.parseSQLAlterQuery(): Unknown SQL query ");
        }
        // Lets make the table string optional
        if(!this._parseTableString()) {
            logger.debug("SQLQueryParser.parseSQLAlterQuery(): Alter table <tableName> is missing the table string. Ignoring its omission.");
        }
        let tableName = this._parseTableName();
        if(tableName === undefined || tableName === null) {
            throw new Error("SQLQueryParser.parseSQLAlterQuery(): No table name defined ");
        }
        let sqlQuery = null;
        if(this._parseAddString()) {
            // Lets make the column string optional
            if(!this._parseColumnString()) {
                logger.debug("SQLQueryParser.parseSQLAlterQuery(): Alter table <tableName> add column ... is missing the column string. Ignoring its omission.");
            }
            let tableColumns = this._parseAlterTableAddorAlterColumns();
            sqlQuery = new SQLAlterTableAddColumnQuery(tableName, tableColumns.columns, tableColumns.dataTypes);
        } else if(this._parseAlterString() || this._parseModifyString()) {
            // Lets make the column string optional
            if(!this._parseColumnString()) {
                logger.debug("SQLQueryParser.parseSQLAlterQuery(): Alter table <tableName> alter column ... is missing the column string. Ignoring its omission.");
            }
            let tableColumns = this._parseAlterTableAddorAlterColumns();
            sqlQuery = new SQLAlterTableAlterColumnQuery(tableName, tableColumns.columns, tableColumns.dataTypes);
        } else if(this._parseDropString() || this._parseDeleteString() || this._parseRemoveString()) {
            // Lets make the column string optional
            if(!this._parseColumnString()) {
                logger.debug("SQLQueryParser.parseSQLAlterQuery(): Alter table <tableName> drop column ... is missing the column string. Ignoring its omission.");
            }
            let columnNames = this._parseColumnNamesCommaSeparated();
            sqlQuery = new SQLAlterTableDropColumnQuery(tableName, columnNames);
        } else if(this._parseRenameString()) {
            // Lets make the column string optional
            if(!this._parseColumnString()) {
                logger.debug("SQLQueryParser.parseSQLAlterQuery(): Alter table <tableName> rename column ... is missing the column string. Ignoring its omission.");
            }
            let tableColumns = this._parseAlterTableRenameColumns();
    console.log('from: ' + tableColumns.from + ' to: ' + tableColumns.to);
            sqlQuery = new SQLAlterTableRenameColumnQuery(tableName, tableColumns.from, tableColumns.to);
        } else {
            throw new Error("SQLQueryParser.parseSQLAlterQuery(): Alter table unknown action.");
        }        
        return sqlQuery;
    }

    _parseSQLCreateQuery() {
        if(!this._parseCreateString()) {
            throw new Error("SQLQueryParser.parseSQLCreateQuery(): Unknown SQL query ");
        }
        if(!this._parseTableString()) {
            if(!this._parseSequenceString()) {
                throw new Error("SQLQueryParser.parseSQLCreateQuery(): Unknown SQL query ");
            }
            let sequenceName = this._parseSequenceName();
            if(sequenceName === undefined || sequenceName === null) {
                throw new Error("SQLQueryParser.parseSQLCreateQuery(): No sequence name defined ");
            }
            return new SQLCreateSequenceQuery(sequenceName);
        } else {
            let tableName = this._parseTableName();
            if(tableName === undefined || tableName === null) {
                throw new Error("SQLQueryParser.parseSQLCreateQuery(): No table name defined ");
            }
            let tableColumns = this._parseCreateTableColumns();
            return new SQLCreateTableQuery(tableName, tableColumns.columns, tableColumns.dataTypes);
        }
    }

    _parseSQLInsertIntoQuery() {
        if(!this._parseInsertString()) {
            throw new Error("SQLQueryParser.parseInsertIntoQuery(): Unknown SQL query ");
        }
        if(!this._parseIntoString()) {
            throw new Error("SQLQueryParser.parseInsertIntoQuery(): Unknown SQL query ");
        }
        let tableName = this._parseTableName();
        if(tableName === undefined || tableName === null) {
            throw new Error("SQLQueryParser.parseInsertIntoQuery(): No table name defined ");
        }
        let columns = this._parseStringsBetweenParenthesis(false);
        if(!this._parseValuesString()) {
            throw new Error("SQLQueryParser.parseInsertIntoQuery(): Missing VALUES() in query ");
        }
        // These can be an comma separated list of values, each representing a row.
        let values = this._parseStringsBetweenParenthesis(false, true);
        let valuesArray = [];
        valuesArray.push(values);
        while(values != null) {
            if(this._parseCommaSeparator()) {
                values = this._parseStringsBetweenParenthesis(false, true);
                valuesArray.push(values);
            } else {
                values = null;
            }
        }
        return new SQLInsertIntoQuery(tableName, columns, valuesArray);
    }

    _parseSQLBetweenCondition() {
        let values = [];
        let value = null;
        let state = SQLQueryParserState.SQL_;
        let character = null;
        while ((character = this._read()) != null) {
            switch (state) {
                case SQLQueryParserState.SQL_:
                    switch (character) {
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            break;
                        case '\'':
                            state = SQLQueryParserState.SQL_READ_SINGLE_QUOTE_VALUE;
                            value = "";
                            break;
                        case '"':
                            state = SQLQueryParserState.SQL_READ_DOUBLE_QUOTE_VALUE;
                            value = "";
                            break;
                        case '1':
                        case '2':
                        case '3':
                        case '4':
                        case '5':
                        case '6':
                        case '7':
                        case '8':
                        case '9':
                        case '-':
                            state = SQLQueryParserState.SQL_READ_NO_QUOTE_VALUE_NUMBER;
                            value = '' + character;
                            break;
                        default:
                            state = SQLQueryParserState.SQL_READ_NO_QUOTE_VALUE;
                            value = "";
                            value += character;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_READ_SINGLE_QUOTE_VALUE:
                    switch (character) {
                        case '\'':
                            values.push(value);
                            state = SQLQueryParserState.SQL_OPERATOR;
                            break;
                        default:
                            value += character;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_READ_DOUBLE_QUOTE_VALUE:
                    switch (character) {
                        case '"':
                            values.push(value);
                            state = SQLQueryParserState.SQL_OPERATOR;
                            break;
                        default:
                            value += character;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_READ_NO_QUOTE_VALUE_NUMBER:
                    switch(character) {
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            values.push(parseInt(value));
                            value = "";
                            state = SQLQueryParserState.SQL_OPERATOR;
                            break;
                        case ';':
                            values.push(parseInt(value));
                            return values;
                        case '.':
                            value += character;
                            state = SQLQueryParserState.SQL_READ_NO_QUOTE_VALUE_NUMBER_DOT;
                            break;
                        case '1':
                        case '2':
                        case '3':
                        case '4':
                        case '5':
                        case '6':
                        case '7':
                        case '8':
                        case '9':
                        case '0':
                            value += character;
                            break;
                        default:
                            state = SQLQueryParserState.SQL_READ_NO_QUOTE_VALUE;
                            value += character;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_READ_NO_QUOTE_VALUE_NUMBER_DOT:
                    switch(character) {
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            values.push(parseFloat(value));
                            value = "";
                            state = SQLQueryParserState.SQL_OPERATOR;
                            break;
                        case ';':
                            values.push(parseFloat(value));
                            return values;
                        case '1':
                        case '2':
                        case '3':
                        case '4':
                        case '5':
                        case '6':
                        case '7':
                        case '8':
                        case '9':
                        case '0':
                            value += character;
                            break;
                        default:
                            state = SQLQueryParserState.SQL_READ_NO_QUOTE_VALUE;
                            value += character;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_READ_NO_QUOTE_VALUE:
                    switch (character) {
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            values.push(value.trim());
                            value = "";
                            state = SQLQueryParserState.SQL_OPERATOR;
                            break;
                        case ';':
                            values.push(value.trim());
                            return values;
                        default:
                            value += character;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_OPERATOR:
                    if(values.length === 2) {
                        this._unread();
                        return values;
                    }
                    switch(character) {
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            break;
                        case 'A':
                        case 'a':
                            state = SQLQueryParserState.SQL_A;
                            break;
                        default:
                            state = SQLQueryParserState.SQL_ERROR;
                            return null;
                    }
                    break;
                case SQLQueryParserState.SQL_A:
                    switch(character) {
                        case 'N':
                        case 'n':
                            state = SQLQueryParserState.SQL_AN;
                            break;
                        default:
                            state = SQLQueryParserState.SQL_ERROR;
                            return null;
                    }
                    break;
                case SQLQueryParserState.SQL_AN:
                    switch(character) {
                        case 'D':
                        case 'd':
                            state = SQLQueryParserState.SQL_AND;
                            break;
                        default:
                            state = SQLQueryParserState.SQL_ERROR;
                            return null;
                    }
                    break;
                case SQLQueryParserState.SQL_AND:
                    switch(character) {
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            state = SQLQueryParserState.SQL_;
                            break;
                        default:
                            state = SQLQueryParserState.SQL_ERROR;
                            return null;
                    }
                    break;
                default:
                    break;
            }
        }
        switch (state) {
            case SQLQueryParserState.SQL_READ_SINGLE_QUOTE_VALUE:
                values.push(value);
                break;
            case SQLQueryParserState.SQL_READ_DOUBLE_QUOTE_VALUE:
                values.push(value);
                break;
            case SQLQueryParserState.SQL_READ_NO_QUOTE_VALUE_NUMBER:
                values.push(parseInt(value));
                break;
            case SQLQueryParserState.SQL_READ_NO_QUOTE_VALUE_NUMBER_DOT:
                values.push(parseFloat(value));
                break;
            case SQLQueryParserState.SQL_READ_NO_QUOTE_VALUE:
                values.push(value.trim());
                break;
            default:
                values.push(value.trim());
                break;                
        }
        return values;
    }

    _parseColumnNamesCommaSeparated() {
        let columnNames = [];
        let columnName = null;
        let state = SQLQueryParserState.SQL_;
        let character = null;
        this._mark();
        while ((character = this._read()) != null) {
            switch (state) {
                case SQLQueryParserState.SQL_:
                    switch (character) {
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                        case ',':
                            break;
                        case ';':
                            return columnNames;
                        case '[':
                            columnName = "";
                            state = SQLQueryParserState.SQL_READ_SQUARE_BRACKET_VALUE;
                            break;
                        case '"':
                            columnName = "";
                            state = SQLQueryParserState.SQL_READ_DOUBLE_QUOTE_VALUE;
                            break;
                        case '\'':
                            columnName = "";
                            state = SQLQueryParserState.SQL_READ_SINGLE_QUOTE_VALUE;
                            break;
                        default:
                            columnName = "" + character;
                            state = SQLQueryParserState.SQL_READ_NO_QUOTE_VALUE;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_READ_SQUARE_BRACKET_VALUE:
                    switch (character) {
                        case ']':
                            columnNames.push(columnName);
                            columnName = "";
                            state = SQLQueryParserState.SQL_;
                            break;
                        default:
                            columnName += character;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_READ_DOUBLE_QUOTE_VALUE:
                    switch (character) {
                        case '"':
                            columnNames.push(columnName);
                            columnName = "";
                            state = SQLQueryParserState.SQL_;
                            break;
                        default:
                            columnName += character;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_READ_SINGLE_QUOTE_VALUE:
                    switch (character) {
                        case '\'':
                            columnNames.push(columnName);
                            columnName = "";
                            state = SQLQueryParserState.SQL_;
                            break;
                        default:
                            columnName += character;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_READ_NO_QUOTE_VALUE:
                    switch (character) {
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            state = SQLQueryParserState.SQL_WHITESPACE;
                            break;
                        case ',':
                            columnNames.push(columnName);
                            columnName = "";
                            state = SQLQueryParserState.SQL_;
                            break;
                        case ';':
                            columnNames.push(columnName);
                            columnName = "";
                            return columnNames;
                        default:
                            columnName += character;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_WHITESPACE:
                    switch (character) {
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            break;
                        case ',':
                            columnNames.push(columnName);
                            columnName = "";
                            state = SQLQueryParserState.SQL_;
                            break;
                        case ';':
                            columnNames.push(columnName);
                            columnName = "";
                            return columnNames;
                        default:
                            this._unread();
                            return columnNames;
                   }
                   break;                                                                 
                default:
                    break;
            }
        }
        if(columnName.length > 0) {
            columnNames.push(columnName);
        }
        return columnNames;
    }

    _parseCommaSeparator() {
        let character = null;
        this._mark();
        while ((character = this._read()) != null) {
            switch (character) {
                // Ignore any whitespace at the beginning
                case ' ':
                case '\r':
                case '\t':
                case '\n':
                    break;
                case ',':
                    return true;
                    break;
                default:
                    this._toMark();
                    return false;
            }
        }
        this._toMark();
        return false;
    }

    _parseDeleteFromQuery() {
        if(!this._parseDeleteString()) {
            throw new Error("SQLQueryParser.parseDeleteFromQuery(): Missing DELETE. Unknown SQL query ");
        }
        if(!this._parseFromString()) {
            throw new Error("SQLQueryParser.parseDeleteFromQuery(): Missing FROM. Unknown SQL query ");
        }
        let tableName = this._parseTableName();
        if(tableName === undefined || tableName === null) {
            throw new Error("SQLQueryParser.parseDeleteFromQuery(): No table name defined ");
        }
        let sqlCondition = null;
        if(this._parseWhereString()) {
        	sqlCondition = this._parseCondition();
        }
        return new SQLDeleteFromQuery(tableName, sqlCondition);
    }
    
    _parseDescQuery() {
        if(!this._parseDescString()) {
            throw new Error("SQLQueryParser.parseDescQuery(): Unknown SQL query ");
        }
        let tableName = this._parseTableName();
        if(tableName === undefined || tableName === null) {
            throw new Error("SQLQueryParser.parseDescQuery(): No table name specified ");
        }
        return new SQLDescQuery(tableName);
    }

    _parseUpdateQuery() {
        if(!this._parseUpdateString()) {
            throw new Error("SQLQueryParser.parseUpdateQuery(): Unknown SQL query ");
        }
        let tableName = this._parseTableName();
        if(tableName === undefined || tableName === null) {
            throw new Error("SQLQueryParser.parseUpdateQuery(): No table name specified ");
        }
        if(!this._parseSetString()) {
            throw new Error("SQLQueryParser.parseUpdateQuery(): No SET following table name ");
        }
        let columnValuePairsMap = this._parseColumnValuePairs();
        let sqlCondition = null;
        if(this._parseWhereString()) {
        	sqlCondition = this._parseCondition();
        }
        return new SQLUpdateQuery(tableName, columnValuePairsMap, sqlCondition);
    }

    _parseSQLSelectQuery() {
        if(!this._parseSelectString()) {
            throw new Error("SQLQueryParser.parseSelectQuery(): Unknown SQL query");
        }
        // Check for DISTINCT
        let isDistinct = false;
        if(this._parseDistinctString()) {
            isDistinct = true;
        }
        // Parse the select expressions.
        // Note these could be functions like AVG(...), COUNT(*) or SUM(...)
        let selectExpressions = this._parseSelectExpressions();
		if(selectExpressions.length <= 0) {
			selectExpressions = null;
		} else if(selectExpressions.length === 1) {
	        let selectExpression = selectExpressions[0];
            if(selectExpression === undefined || selectExpression === null) {
                selectExpressions = null;
            } else if(typeof selectExpression === 'string') {
                selectExpression = selectExpression.trim();
                if(selectExpression === "*") {
                    selectExpressions = null;
                }
            }
	    }
        if(!this._parseFromString()) {
            throw new Error("SQLQueryParser.parseSelectQuery(): Missing FROM in SELECT");
        }
        let tableName = this._parseTableName();
        if(tableName === null) {
            throw new Error("SQLQueryParser.parseSelectQuery(): No table name specified");
        }
        let sqlCondition = null;
        if(this._parseWhereString()) {
        	sqlCondition = this._parseCondition();
        }
        let sqlSelectQuery = new SQLSelectQuery(selectExpressions, tableName, sqlCondition);
        sqlSelectQuery.setDistinct(isDistinct);
        if(this._parseGroupByString()) {
            sqlSelectQuery.groupBy = this._parseGroupBy();
        }
        if(this._parseHavingString()) {
            let sqlHavingCondition = this._parseCondition();
            sqlSelectQuery.having = new SQLHaving(sqlHavingCondition);
        }
        if(this._parseOrderByString()) {
            sqlSelectQuery.orderBy = this._parseOrderBy();
        }
        return sqlSelectQuery;
    }

    _parseAddString() {
        let state = SQLQueryParserState.SQL_;
        let character = null;
        this._mark();
        while ((character = this._read()) != null) {
            switch (state) {
                case SQLQueryParserState.SQL_:
                    switch (character) {
                        // Ignore any whitespace at the beginning
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            break;
                        case 'A':
                        case 'a':
                            state = SQLQueryParserState.SQL_A;
                            break;
                        default:
                            this._toMark();
                            return false;
                    }
                    break;
                case SQLQueryParserState.SQL_A:
                    switch (character) {
                        case 'D':
                        case 'd':
                            state = SQLQueryParserState.SQL_AD;
                            break;
                        default:
                            this._toMark();
                            return false;
                    }
                    break;
                case SQLQueryParserState.SQL_AD:
                    switch (character) {
                        case 'D':
                        case 'd':
                            return true;
                        default:
                            this._toMark();
                            return false;
                    }
                    break;
                default:
                    this._toMark();
                    return false;
            }
        }
        this._toMark();
        return false;
    }

    _parseAlterString() {
        let state = SQLQueryParserState.SQL_;
        let character = null;
        this._mark();
        while ((character = this._read()) != null) {
            switch (state) {
                case SQLQueryParserState.SQL_:
                    switch (character) {
                        // Ignore any whitespace at the beginning
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            break;
                        case 'A':
                        case 'a':
                            state = SQLQueryParserState.SQL_A;
                            break;
                        default:
                            this._toMark();
                            return false;
                    }
                    break;
                case SQLQueryParserState.SQL_A:
                    switch (character) {
                        case 'L':
                        case 'l':
                            state = SQLQueryParserState.SQL_AL;
                            break;
                        default:
                            this._toMark();
                            return false;
                    }
                    break;
                case SQLQueryParserState.SQL_AL:
                    switch (character) {
                        case 'T':
                        case 't':
                            state = SQLQueryParserState.SQL_ALT;
                            break;
                        default:
                            this._toMark();
                            return false;
                    }
                    break;
                case SQLQueryParserState.SQL_ALT:
                    switch (character) {
                        case 'E':
                        case 'e':
                            state = SQLQueryParserState.SQL_ALTE;
                            break;
                        default:
                            this._toMark();
                            return false;
                    }
                    break;
                case SQLQueryParserState.SQL_ALTE:
                    switch (character) {
                        case 'R':
                        case 'r':
                            return true;
                        default:
                            this._toMark();
                            return false;
                    }
                    break;
                default:
                    this._toMark();
                    return false;
            }
        }
        this._toMark();
        return false;
    }

    _parseDropString() {
        let state = SQLQueryParserState.SQL_;
        let character = null;
        this._mark();
        while ((character = this._read()) != null) {
            switch (state) {
                case SQLQueryParserState.SQL_:
                    switch (character) {
                        // Ignore any whitespace at the beginning
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            break;
                        case 'D':
                        case 'd':
                            state = SQLQueryParserState.SQL_D;
                            break;
                        default:
                            this._toMark();
                            return false;
                    }
                    break;
                case SQLQueryParserState.SQL_D:
                    switch (character) {
                        case 'R':
                        case 'r':
                            state = SQLQueryParserState.SQL_DR;
                            break;
                        default:
                            this._toMark();
                            return false;
                    }
                    break;
                case SQLQueryParserState.SQL_DR:
                    switch (character) {
                        case 'O':
                        case 'o':
                            state = SQLQueryParserState.SQL_DRO;
                            break;
                        default:
                            this._toMark();
                            return false;
                    }
                    break;
                case SQLQueryParserState.SQL_DRO:
                    switch (character) {
                        case 'P':
                        case 'p':
                            return true;
                        default:
                            this._toMark();
                            return false;
                    }
                    break;
                default:
                    this._toMark();
                    return false;
            }
        }
        this._toMark();
        return false;
    }

    _parseColumnString() {
        let state = SQLQueryParserState.SQL_;
        let character = null;
        this._mark();
        while ((character = this._read()) != null) {
            switch (state) {
                case SQLQueryParserState.SQL_:
                    switch (character) {
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            break;
                        case 'C':
                        case 'c':
                            state = SQLQueryParserState.SQL_C;
                            break;
                        default:
                            this._toMark();
                            return false;
                    }
                    break;
                case SQLQueryParserState.SQL_C:
                    switch (character) {
                        case 'O':
                        case 'o':
                            state = SQLQueryParserState.SQL_CO;
                            break;
                        default:
                            this._toMark();
                            return false;
                    }
                    break;
                case SQLQueryParserState.SQL_CO:
                    switch (character) {
                        case 'L':
                        case 'l':
                            state = SQLQueryParserState.SQL_COL;
                            break;
                        default:
                            this._toMark();
                            return false;
                    }
                    break;
                case SQLQueryParserState.SQL_COL:
                    switch (character) {
                        case 'U':
                        case 'u':
                            state = SQLQueryParserState.SQL_COLU;
                            break;
                        default:
                            this._toMark();
                            return false;
                    }
                    break;
                case SQLQueryParserState.SQL_COLU:
                    switch (character) {
                        case 'M':
                        case 'm':
                            state = SQLQueryParserState.SQL_COLUM;
                            break;
                        default:
                            this._toMark();
                            return false;
                    }
                    break;
                case SQLQueryParserState.SQL_COLUM:
                    switch (character) {
                        case 'N':
                        case 'n':
                            return true;
                        default:
                            this._toMark();
                            return false;
                    }
                    break;
                default:
                    this._toMark();
                    return false;
            }
        }
        this._toMark();
        return false;
    }

    _parseCreateString() {
        let state = SQLQueryParserState.SQL_;
        let character = null;
        this._mark();
        while ((character = this._read()) != null) {
            switch (state) {
                case SQLQueryParserState.SQL_:
                    switch (character) {
                        // Ignore any whitespace at the beginning
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            break;
                        case 'C':
                        case 'c':
                            state = SQLQueryParserState.SQL_C;
                            break;
                        default:
                            this._toMark();
                            return false;
                    }
                    break;
                case SQLQueryParserState.SQL_C:
                    switch (character) {
                        case 'R':
                        case 'r':
                            state = SQLQueryParserState.SQL_CR;
                            break;
                        default:
                            this._toMark();
                            return false;
                    }
                    break;
                case SQLQueryParserState.SQL_CR:
                    switch (character) {
                        case 'E':
                        case 'e':
                            state = SQLQueryParserState.SQL_CRE;
                            break;
                        default:
                            this._toMark();
                            return false;
                    }
                    break;
                case SQLQueryParserState.SQL_CRE:
                    switch (character) {
                        case 'A':
                        case 'a':
                            state = SQLQueryParserState.SQL_CREA;
                            break;
                        default:
                            this._toMark();
                            return false;
                    }
                    break;
                case SQLQueryParserState.SQL_CREA:
                    switch (character) {
                        case 'T':
                        case 't':
                            state = SQLQueryParserState.SQL_CREAT;
                            break;
                        default:
                            this._toMark();
                            return false;
                    }
                    break;
                case SQLQueryParserState.SQL_CREAT:
                    switch (character) {
                        case 'E':
                        case 'e':
                            return true;
                        default:
                            this._toMark();
                            return false;
                    }
                    break;
                default:
                    this._toMark();
                    return false;
            }
        }
        this._toMark();
        return false;
    }

    _parseInsertString() {
        let state = SQLQueryParserState.SQL_;
        let character = null;
        this._mark();
        while ((character = this._read()) != null) {
            switch (state) {
                case SQLQueryParserState.SQL_:
                    switch (character) {
                        // Ignore any whitespace at the beginning
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            break;
                        case 'I':
                        case 'i':
                            state = SQLQueryParserState.SQL_I;
                            break;
                        default:
		                	this._toMark();
		                    return false;
                    }
                    break;
                case SQLQueryParserState.SQL_I:
                    switch (character) {
                        case 'N':
                        case 'n':
                            state = SQLQueryParserState.SQL_IN;
                            break;
                        default:
		                	this._toMark();
		                    return false;
                    }
                    break;
                case SQLQueryParserState.SQL_IN:
                    switch (character) {
                        case 'S':
                        case 's':
                            state = SQLQueryParserState.SQL_INS;
                            break;
                        default:
		                	this._toMark();
		                    return false;
                    }
                    break;
                case SQLQueryParserState.SQL_INS:
                    switch (character) {
                        case 'E':
                        case 'e':
                            state = SQLQueryParserState.SQL_INSE;
                            break;
                        default:
		                	this._toMark();
		                    return false;
                    }
                    break;
                case SQLQueryParserState.SQL_INSE:
                    switch (character) {
                        case 'R':
                        case 'r':
                            state = SQLQueryParserState.SQL_INSER;
                            break;
                        default:
		                	this._toMark();
		                    return false;
                    }
                    break;
                case SQLQueryParserState.SQL_INSER:
                    switch (character) {
                        case 'T':
                        case 't':
                            return true;
                        default:
		                	this._toMark();
		                    return false;
                    }
                    break;
                default:
                	this._toMark();
                    return false;
            }
        }
    	this._toMark();
        return false;
    }

    _parseIntoString() {
        let state = SQLQueryParserState.SQL_;
        let character = null;
        this._mark();
        while ((character = this._read()) != null) {
            switch (state) {
                case SQLQueryParserState.SQL_:
                    switch (character) {
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            break;
                        case 'I':
                        case 'i':
                            state = SQLQueryParserState.SQL_I;
                            break;
                        default:
		                	this._toMark();
		                    return false;
                    }
                    break;
                case SQLQueryParserState.SQL_I:
                    switch (character) {
                        case 'N':
                        case 'n':
                            state = SQLQueryParserState.SQL_IN;
                            break;
                        default:
		                	this._toMark();
		                    return false;
                    }
                    break;
                case SQLQueryParserState.SQL_IN:
                    switch (character) {
                        case 'T':
                        case 't':
                            state = SQLQueryParserState.SQL_INT;
                            break;
                        default:
		                	this._toMark();
		                    return false;
                    }
                    break;
                case SQLQueryParserState.SQL_INT:
                    switch (character) {
                        case 'O':
                        case 'o':
                            return true;
                        default:
		                	this._toMark();
		                    return false;
                    }
                    break;
                default:
	            	this._toMark();
	                return false;
            }
        }
		this._toMark();
		return false;
    }

    _parseModifyString() {
        let state = SQLQueryParserState.SQL_;
        let character = null;
        this._mark();
        while ((character = this._read()) != null) {
            switch (state) {
                case SQLQueryParserState.SQL_:
                    switch (character) {
                        // Ignore any whitespace at the beginning
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            break;
                        case 'M':
                        case 'm':
                            state = SQLQueryParserState.SQL_M;
                            break;
                        default:
                            this._toMark();
                            return false;
                    }
                    break;
                case SQLQueryParserState.SQL_M:
                    switch (character) {
                        case 'O':
                        case 'o':
                            state = SQLQueryParserState.SQL_MO;
                            break;
                        default:
                            this._toMark();
                            return false;
                    }
                    break;
                case SQLQueryParserState.SQL_MO:
                    switch (character) {
                        case 'D':
                        case 'd':
                            state = SQLQueryParserState.SQL_MOD;
                            break;
                        default:
                            this._toMark();
                            return false;
                    }
                    break;
                case SQLQueryParserState.SQL_MOD:
                    switch (character) {
                        case 'I':
                        case 'i':
                            state = SQLQueryParserState.SQL_MODI;
                            break;
                        default:
                            this._toMark();
                            return false;
                    }
                    break;
                case SQLQueryParserState.SQL_MODI:
                    switch (character) {
                        case 'F':
                        case 'f':
                            state = SQLQueryParserState.SQL_MODIF;
                            break;
                        default:
                            this._toMark();
                            return false;
                    }
                    break;
                case SQLQueryParserState.SQL_MODIF:
                    switch (character) {
                        case 'Y':
                        case 'y':
                            return true;
                        default:
                            this._toMark();
                            return false;
                    }
                    break;
                default:
                    this._toMark();
                    return false;
            }
        }
        this._toMark();
        return false;
    }

    _parseSequenceName() {
        let sequenceName = null;
        let state = SQLQueryParserState.SQL_;
        let character = null;
        while ((character = this._read()) != null) {
console.log(character + ' state: ' + state);
console.log('sequenceName: ' + sequenceName);
             switch (state) {
                case SQLQueryParserState.SQL_:
                    switch (character) {
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            break;
                        case '[':
                            state = SQLQueryParserState.SQL_READ_SQUARE_BRACKET_VALUE;
                            sequenceName = '';
                            break;
                        default:
                            state = SQLQueryParserState.SQL_READING_SEQUENCE;
                            sequenceName = '' + character;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_READ_SQUARE_BRACKET_VALUE:
                    switch (character) {
                        case ']':
                            return sequenceName;
                        default:
                            sequenceName += character;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_READING_SEQUENCE:
                    switch (character) {
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            return sequenceName;
                        case '(':
                        case ';':
                            this._unread();
                            return sequenceName;
                        default:
                            sequenceName += character;
                            break;
                    }
                    break;
                default:
                    break;
            }
        }
        return sequenceName;
    }

    _parseSequenceString() {
        let state = SQLQueryParserState.SQL_;
        let character = null;
        this._mark();
        while ((character = this._read()) != null) {
            switch (state) {
                case SQLQueryParserState.SQL_:
                    switch (character) {
                        // Ignore any whitespace at the beginning
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            break;
                        case 'S':
                        case 's':
                            state = SQLQueryParserState.SQL_S;
                            break;
                        default:
                            this._toMark();
                            return false;
                    }
                    break;
                case SQLQueryParserState.SQL_S:
                    switch (character) {
                        case 'E':
                        case 'e':
                            state = SQLQueryParserState.SQL_SE;
                            break;
                        default:
                            this._toMark();
                            return false;
                    }
                    break;
                case SQLQueryParserState.SQL_SE:
                    switch (character) {
                        case 'Q':
                        case 'q':
                            state = SQLQueryParserState.SQL_SEQ;
                            break;
                        default:
                            this._toMark();
                            return false;
                    }
                    break;
                case SQLQueryParserState.SQL_SEQ:
                    switch (character) {
                        case 'U':
                        case 'u':
                            state = SQLQueryParserState.SQL_SEQU;
                            break;
                        default:
                            this._toMark();
                            return false;
                    }
                    break;
                case SQLQueryParserState.SQL_SEQU:
                    switch (character) {
                        case 'E':
                        case 'e':
                            state = SQLQueryParserState.SQL_SEQUE;
                            break;
                        default:
                            this._toMark();
                            return false;
                    }
                    break;
                case SQLQueryParserState.SQL_SEQUE:
                    switch (character) {
                        case 'N':
                        case 'n':
                            state = SQLQueryParserState.SQL_SEQUEN;
                            break;
                        default:
                            this._toMark();
                            return false;
                    }
                    break;
                case SQLQueryParserState.SQL_SEQUEN:
                    switch (character) {
                        case 'C':
                        case 'c':
                            state = SQLQueryParserState.SQL_SEQUENC;
                            break;
                        default:
                            this._toMark();
                            return false;
                    }
                    break;
                case SQLQueryParserState.SQL_SEQUENC:
                    switch (character) {
                        case 'E':
                        case 'e':
                            return true;
                        default:
                            this._toMark();
                            return false;
                    }
                    break;
                default:
                    this._toMark();
                    return false;
            }
        }
        this._toMark();
        return false;
    }

    _parseTableName() {
        let tableName = null;
		let state = SQLQueryParserState.SQL_;
        let character = null;
        while ((character = this._read()) != null) {
             switch (state) {
                case SQLQueryParserState.SQL_:
                    switch (character) {
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            break;
                        case '[':
                            state = SQLQueryParserState.SQL_READ_SQUARE_BRACKET_VALUE;
                            tableName = '';
                            break;
                        default:
                            state = SQLQueryParserState.SQL_READING_TABLE;
                            tableName = '' + character;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_READ_SQUARE_BRACKET_VALUE:
                    switch (character) {
                        case ']':
                            return tableName;
                        default:
                            tableName += character;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_READING_TABLE:
                    switch (character) {
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            return tableName;
                        case '(':
                        case ';':
                            this._unread();
                            return tableName;
                        default:
                            tableName += character;
                            break;
                    }
                    break;
                default:
                    break;
            }
        }
        return tableName;
    }

    _parseTableString() {
        let state = SQLQueryParserState.SQL_;
        let character = null;
        this._mark();
        while ((character = this._read()) != null) {
            switch (state) {
                case SQLQueryParserState.SQL_:
                    switch (character) {
                        // Ignore any whitespace at the beginning
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            break;
                        case 'T':
                        case 't':
                            state = SQLQueryParserState.SQL_T;
                            break;
                        default:
                            this._toMark();
                            return false;
                    }
                    break;
                case SQLQueryParserState.SQL_T:
                    switch (character) {
                        case 'A':
                        case 'a':
                            state = SQLQueryParserState.SQL_TA;
                            break;
                        default:
                            this._toMark();
                            return false;
                    }
                    break;
                case SQLQueryParserState.SQL_TA:
                    switch (character) {
                        case 'B':
                        case 'b':
                            state = SQLQueryParserState.SQL_TAB;
                            break;
                        default:
                            this._toMark();
                            return false;
                    }
                    break;
                case SQLQueryParserState.SQL_TAB:
                    switch (character) {
                        case 'L':
                        case 'l':
                            state = SQLQueryParserState.SQL_TABL;
                            break;
                        default:
                            this._toMark();
                            return false;
                    }
                    break;
                case SQLQueryParserState.SQL_TABL:
                    switch (character) {
                        case 'E':
                        case 'e':
                            return true;
                        default:
                            this._toMark();
                            return false;
                    }
                    break;
                default:
                    this._toMark();
                    return false;
            }
        }
        this._toMark();
        return false;
    }

	_parseValuesString() {
		let state = SQLQueryParserState.SQL_;
        let character = null;
        this._mark();
        while ((character = this._read()) != null) {
            switch (state) {
                case SQLQueryParserState.SQL_:
                    switch (character) {
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            break;
                        case 'V':
                        case 'v':
                            state = SQLQueryParserState.SQL_V;
                            break;
                        default:
		                	this._toMark();
		                    return false;
                    }
                    break;
                case SQLQueryParserState.SQL_V:
                    switch (character) {
                        case 'A':
                        case 'a':
                            state = SQLQueryParserState.SQL_VA;
                            break;
                        default:
		                	this._toMark();
		                    return false;
                    }
                    break;
                case SQLQueryParserState.SQL_VA:
                    switch (character) {
                        case 'L':
                        case 'l':
                            state = SQLQueryParserState.SQL_VAL;
                            break;
                        default:
		                	this._toMark();
		                    return false;
                    }
                    break;
                case SQLQueryParserState.SQL_VAL:
                    switch (character) {
                        case 'U':
                        case 'u':
                            state = SQLQueryParserState.SQL_VALU;
                            break;
                        default:
		                	this._toMark();
		                    return false;
                    }
                    break;
                case SQLQueryParserState.SQL_VALU:
                    switch (character) {
                        case 'E':
                        case 'e':
                            state = SQLQueryParserState.SQL_VALUE;
                            break;
                        default:
		                	this._toMark();
		                    return false;
                    }
                    break;
                case SQLQueryParserState.SQL_VALUE:
                    switch (character) {
                        case 'S':
                        case 's':
                            state = SQLQueryParserState.SQL_VALUES;
                            break;
                        default:
                            this._toMark();
                            return false;
                    }
                    break;
                case SQLQueryParserState.SQL_VALUES:
                    switch (character) {
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            break;
                        case '(':
                            this._unread();
                            return true;
                        default:
                            this._toMark();
                            return false;
                    }
                    break;
                default:
                	this._toMark();
                    return false;
            }
        }
    	this._toMark();
        return false;
    }

    _parseDescString() {
        let state = SQLQueryParserState.SQL_;
        let character = null;
        this._mark();
        while ((character = this._read()) != null) {
            switch (state) {
                case SQLQueryParserState.SQL_:
                    switch (character) {
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            break;
                        case 'D':
                        case 'd':
                            state = SQLQueryParserState.SQL_D;
                            break;
                        default:
                            this._toMark();
                            return false;
                    }
                    break;
                case SQLQueryParserState.SQL_D:
                    switch (character) {
                        case 'E':
                        case 'e':
                            state = SQLQueryParserState.SQL_DE;
                            break;
                        default:
                            this._toMark();
                            return false;
                    }
                    break;
                case SQLQueryParserState.SQL_DE:
                    switch (character) {
                        case 'S':
                        case 's':
                            state = SQLQueryParserState.SQL_DES;
                            break;
                        default:
                            this._toMark();
                            return false;
                    }
                    break;
                case SQLQueryParserState.SQL_DES:
                    switch (character) {
                        case 'C':
                        case 'c':
                            state = SQLQueryParserState.SQL_DESC;
                            break;
                        default:
                            this._toMark();
                            return false;
                    }
                    break;
                case SQLQueryParserState.SQL_DESC:
                    switch (character) {
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            return true;
                        default:
                            this._toMark();
                            return false;
                    }
                    break;
                default:
                    this._toMark();
                    return false;
            }
        }
        this._toMark();
        return false;
    }

    _parseDistinctString() {
        let state = SQLQueryParserState.SQL_;
        let character = null;
        this._mark();
        while ((character = this._read()) != null) {
            switch (state) {
                case SQLQueryParserState.SQL_:
                    switch (character) {
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            break;
                        case 'D':
                        case 'd':
                            state = SQLQueryParserState.SQL_D;
                            break;
                        default:
                            this._toMark();
                            return false;
                    }
                    break;
                case SQLQueryParserState.SQL_D:
                    switch (character) {
                        case 'I':
                        case 'i':
                            state = SQLQueryParserState.SQL_DI;
                            break;
                        default:
                            this._toMark();
                            return false;
                    }
                    break;
                case SQLQueryParserState.SQL_DI:
                    switch (character) {
                        case 'S':
                        case 's':
                            state = SQLQueryParserState.SQL_DIS;
                            break;
                        default:
                            this._toMark();
                            return false;
                    }
                    break;
                case SQLQueryParserState.SQL_DIS:
                    switch (character) {
                        case 'T':
                        case 't':
                            state = SQLQueryParserState.SQL_DIST;
                            break;
                        default:
                            this._toMark();
                            return false;
                    }
                    break;
                case SQLQueryParserState.SQL_DIST:
                    switch (character) {
                        case 'I':
                        case 'i':
                            state = SQLQueryParserState.SQL_DISTI;
                            break;
                        default:
                            this._toMark();
                            return false;
                    }
                    break;
                case SQLQueryParserState.SQL_DISTI:
                    switch (character) {
                        case 'N':
                        case 'n':
                            state = SQLQueryParserState.SQL_DISTIN;
                            break;
                        default:
                            this._toMark();
                            return false;
                    }
                    break;
                case SQLQueryParserState.SQL_DISTIN:
                    switch (character) {
                        case 'C':
                        case 'c':
                            state = SQLQueryParserState.SQL_DISTINC;
                            break;
                        default:
                            this._toMark();
                            return false;
                    }
                    break;
                case SQLQueryParserState.SQL_DISTINC:
                    switch (character) {
                        case 'T':
                        case 't':
                            state = SQLQueryParserState.SQL_DISTINCT;
                            break;
                        default:
                            this._toMark();
                            return false;
                    }
                    break;
                case SQLQueryParserState.SQL_DISTINCT:
                    switch (character) {
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            return true;
                        default:
                            this._toMark();
                            return false;
                    }
                    break;
                default:
                    this._toMark();
                    return false;
            }
        }
        this._toMark();
        return false;
    }

	_parseSelectString() {
		let state = SQLQueryParserState.SQL_;
        let character = null;
        this._mark();
        while ((character = this._read()) != null) {
            switch (state) {
                case SQLQueryParserState.SQL_:
                    switch (character) {
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            break;
                        case 'S':
                        case 's':
                            state = SQLQueryParserState.SQL_S;
                            break;
                        default:
                            this._toMark();
		                    return false;
                    }
                    break;
                case SQLQueryParserState.SQL_S:
                    switch (character) {
                        case 'E':
                        case 'e':
                            state = SQLQueryParserState.SQL_SE;
                            break;
                        default:
                            this._toMark();
		                    return false;
                    }
                    break;
                case SQLQueryParserState.SQL_SE:
                    switch (character) {
                        case 'L':
                        case 'l':
                            state = SQLQueryParserState.SQL_SEL;
                            break;
                        default:
                            this._toMark();
		                    return false;
                    }
                    break;
                case SQLQueryParserState.SQL_SEL:
                    switch (character) {
                        case 'E':
                        case 'e':
                            state = SQLQueryParserState.SQL_SELE;
                            break;
                        default:
                            this._toMark();
		                    return false;
                    }
                    break;
                case SQLQueryParserState.SQL_SELE:
                    switch (character) {
                        case 'C':
                        case 'c':
                            state = SQLQueryParserState.SQL_SELEC;
                            break;
                        default:
                            this._toMark();
		                    return false;
                    }
                    break;
                case SQLQueryParserState.SQL_SELEC:
                    switch (character) {
                        case 'T':
                        case 't':
                            state = SQLQueryParserState.SQL_SELECT;
                            break;
                        default:
                            this._toMark();
                            return false;
                    }
                    break;
                case SQLQueryParserState.SQL_SELECT:
                    switch (character) {
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            return true;
                        default:
                            this._toMark();
		                    return false;
                    }
                    break;
                default:
                    this._toMark();
                    return false;
            }
        }
        this._toMark();
        return false;
    }

	_parseUpdateString() {
		let state = SQLQueryParserState.SQL_;
        let character = null;
        this._mark();
        while ((character = this._read()) != null) {
            switch (state) {
                case SQLQueryParserState.SQL_:
                    switch (character) {
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            break;
                        case 'U':
                        case 'u':
                            state = SQLQueryParserState.SQL_U;
                            break;
                        default:
		                	this._toMark();
		                    return false;
                    }
                    break;
                case SQLQueryParserState.SQL_U:
                    switch (character) {
                        case 'P':
                        case 'p':
                            state = SQLQueryParserState.SQL_UP;
                            break;
                        default:
		                	this._toMark();
		                    return false;
                    }
                    break;
                case SQLQueryParserState.SQL_UP:
                    switch (character) {
                        case 'D':
                        case 'd':
                            state = SQLQueryParserState.SQL_UPD;
                            break;
                        default:
		                	this._toMark();
		                    return false;
                    }
                    break;
                case SQLQueryParserState.SQL_UPD:
                    switch (character) {
                        case 'A':
                        case 'a':
                            state = SQLQueryParserState.SQL_UPDA;
                            break;
                        default:
		                	this._toMark();
		                    return false;
                    }
                    break;
                case SQLQueryParserState.SQL_UPDA:
                    switch (character) {
                        case 'T':
                        case 't':
                            state = SQLQueryParserState.SQL_UPDAT;
                            break;
                        default:
                            this._toMark();
                            return false;
                    }
                    break;
                case SQLQueryParserState.SQL_UPDAT:
                    switch (character) {
                        case 'E':
                        case 'e':
                            state = SQLQueryParserState.SQL_UPDATE;
                            break;
                        default:
                            this._toMark();
                            return false;
                    }
                    break;
                case SQLQueryParserState.SQL_UPDATE:
                    switch (character) {
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            return true;
                        default:
		                	this._toMark();
		                    return false;
                    }
                    break;
                default:
                	this._toMark();
                    return false;
            }
        }
    	this._toMark();
        return false;
    }

	_parseDeleteString() {
		let state = SQLQueryParserState.SQL_;
        let character = null;
        this._mark();
        while ((character = this._read()) != null) {
            switch (state) {
                case SQLQueryParserState.SQL_:
                    switch (character) {
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            break;
                        case 'D':
                        case 'd':
                            state = SQLQueryParserState.SQL_D;
                            break;
                        default:
		                	this._toMark();
		                    return false;
                    }
                    break;
                case SQLQueryParserState.SQL_D:
                    switch (character) {
                        case 'E':
                        case 'e':
                            state = SQLQueryParserState.SQL_DE;
                            break;
                        default:
		                	this._toMark();
		                    return false;
                    }
                    break;
                case SQLQueryParserState.SQL_DE:
                    switch (character) {
                        case 'L':
                        case 'l':
                            state = SQLQueryParserState.SQL_DEL;
                            break;
                        default:
		                	this._toMark();
		                    return false;
                    }
                    break;
                case SQLQueryParserState.SQL_DEL:
                    switch (character) {
                        case 'E':
                        case 'e':
                            state = SQLQueryParserState.SQL_DELE;
                            break;
                        default:
		                	this._toMark();
		                    return false;
                    }
                    break;
                case SQLQueryParserState.SQL_DELE:
                    switch (character) {
                        case 'T':
                        case 't':
                            state = SQLQueryParserState.SQL_DELET;
                            break;
                        default:
                            this._toMark();
                            return false;
                    }
                    break;
                case SQLQueryParserState.SQL_DELET:
                    switch (character) {
                        case 'E':
                        case 'e':
                            state = SQLQueryParserState.SQL_DELETE;
                            break;
                        default:
                            this._toMark();
                            return false;
                    }
                    break;
                case SQLQueryParserState.SQL_DELETE:
                    switch (character) {
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            return true;
                        default:
		                	this._toMark();
		                    return false;
                    }
                    break;
                default:
                	this._toMark();
                    return false;
            }
        }
    	this._toMark();
        return false;
    }

	_parseFromString() {
		let state = SQLQueryParserState.SQL_;
        let character = null;
        this._mark();
        while ((character = this._read()) != null) {
            switch (state) {
                case SQLQueryParserState.SQL_:
                    switch (character) {
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            break;
                        case 'F':
                        case 'f':
                            state = SQLQueryParserState.SQL_F;
                            break;
                        default:
		                	this._toMark();
		                    return false;
                    }
                    break;
                case SQLQueryParserState.SQL_F:
                    switch (character) {
                        case 'R':
                        case 'r':
                            state = SQLQueryParserState.SQL_FR;
                            break;
                        default:
		                	this._toMark();
		                    return false;
                    }
                    break;
                case SQLQueryParserState.SQL_FR:
                    switch (character) {
                        case 'O':
                        case 'o':
                            state = SQLQueryParserState.SQL_FRO;
                            break;
                        default:
                            this._toMark();
                            return false;
                    }
                    break;
                case SQLQueryParserState.SQL_FRO:
                    switch (character) {
                        case 'M':
                        case 'm':
                            state = SQLQueryParserState.SQL_FROM;
                            break;
                        default:
                            this._toMark();
                            return false;
                    }
                    break;
                case SQLQueryParserState.SQL_FROM:
                    switch (character) {
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            return true;
                        default:
		                	this._toMark();
		                    return false;
                    }
                    break;
                default:
                	this._toMark();
                    return false;
            }
        }
    	this._toMark();
        return false;
    }

	_parseColumnsString() {
		let state = SQLQueryParserState.SQL_;
        let character = null;
        this._mark();
        while ((character = this._read()) != null) {
            switch (state) {
                case SQLQueryParserState.SQL_:
                    switch (character) {
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            break;
                        case 'C':
                        case 'c':
                            state = SQLQueryParserState.SQL_C;
                            break;
                        default:
		                	this._toMark();
		                    return false;
                    }
                    break;
                case SQLQueryParserState.SQL_C:
                    switch (character) {
                        case 'O':
                        case 'o':
                            state = SQLQueryParserState.SQL_CO;
                            break;
                        default:
		                	this._toMark();
		                    return false;
                    }
                    break;
                case SQLQueryParserState.SQL_CO:
                    switch (character) {
                        case 'L':
                        case 'l':
                            state = SQLQueryParserState.SQL_COL;
                            break;
                        default:
		                	this._toMark();
		                    return false;
                    }
                    break;
                case SQLQueryParserState.SQL_COL:
                    switch (character) {
                        case 'U':
                        case 'u':
                            state = SQLQueryParserState.SQL_COLU;
                            break;
                        default:
		                	this._toMark();
		                    return false;
                    }
                    break;
                case SQLQueryParserState.SQL_COLU:
                    switch (character) {
                        case 'M':
                        case 'm':
                            state = SQLQueryParserState.SQL_COLUM;
                            break;
                        default:
		                	this._toMark();
		                    return false;
                    }
                    break;
                case SQLQueryParserState.SQL_COLUM:
                    switch (character) {
                        case 'N':
                        case 'n':
                            state = SQLQueryParserState.SQL_COLUMN;
                            break;
                        default:
		                	this._toMark();
		                    return false;
                    }
                    break;
                case SQLQueryParserState.SQL_COLUMN:
                    switch (character) {
                        case 'S':
                        case 's':
                            state = SQLQueryParserState.SQL_COLUMNS;
                            break;
                        default:
		                	this._toMark();
		                    return false;
                    }
                    break;
                case SQLQueryParserState.SQL_COLUMNS:
                    switch(character) {
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            break;
                        case '(':
                            this._unread();
                            return true;
                        default:
                            this._toMark();
                            return false;
                    }
                default:
                	this._toMark();
                    return false;
            }
        }
    	this._toMark();
        return false;
    }

    _parseRemoveString() {
        let state = SQLQueryParserState.SQL_;
        let character = null;
        this._mark();
        while ((character = this._read()) != null) {
            switch (state) {
                case SQLQueryParserState.SQL_:
                    switch (character) {
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            break;
                        case 'R':
                        case 'r':
                            state = SQLQueryParserState.SQL_R;
                            break;
                        default:
                            this._toMark();
                            return false;
                    }
                    break;
                case SQLQueryParserState.SQL_R:
                    switch (character) {
                        case 'E':
                        case 'e':
                            state = SQLQueryParserState.SQL_RE;
                            break;
                        default:
                            this._toMark();
                            return false;
                    }
                    break;
                case SQLQueryParserState.SQL_RE:
                    switch (character) {
                        case 'M':
                        case 'm':
                            state = SQLQueryParserState.SQL_REM;
                            break;
                        default:
                            this._toMark();
                            return false;
                    }
                    break;
                case SQLQueryParserState.SQL_REM:
                    switch (character) {
                        case 'O':
                        case 'o':
                            state = SQLQueryParserState.SQL_REMO;
                            break;
                        default:
                            this._toMark();
                            return false;
                    }
                    break;
                case SQLQueryParserState.SQL_REMO:
                    switch (character) {
                        case 'V':
                        case 'v':
                            state = SQLQueryParserState.SQL_REMOV;
                            break;
                        default:
                            this._toMark();
                            return false;
                    }
                    break;
                case SQLQueryParserState.SQL_REMOV:
                    switch (character) {
                        case 'E':
                        case 'e':
                            state = SQLQueryParserState.SQL_REMOVE;
                            break;
                        default:
                            this._toMark();
                            return false;
                    }
                    break;
                case SQLQueryParserState.SQL_REMOVE:
                    switch (character) {
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            return true;
                        default:
                            this._toMark();
                            return false;
                    }
                    break;
                default:
                    this._toMark();
                    return false;
            }
        }
        this._toMark();
        return false;
    }

    _parseRenameString() {
        let state = SQLQueryParserState.SQL_;
        let character = null;
        this._mark();
        while ((character = this._read()) != null) {
            switch (state) {
                case SQLQueryParserState.SQL_:
                    switch (character) {
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            break;
                        case 'R':
                        case 'r':
                            state = SQLQueryParserState.SQL_R;
                            break;
                        default:
                            this._toMark();
                            return false;
                    }
                    break;
                case SQLQueryParserState.SQL_R:
                    switch (character) {
                        case 'E':
                        case 'e':
                            state = SQLQueryParserState.SQL_RE;
                            break;
                        default:
                            this._toMark();
                            return false;
                    }
                    break;
                case SQLQueryParserState.SQL_RE:
                    switch (character) {
                        case 'N':
                        case 'n':
                            state = SQLQueryParserState.SQL_REN;
                            break;
                        default:
                            this._toMark();
                            return false;
                    }
                    break;
                case SQLQueryParserState.SQL_REN:
                    switch (character) {
                        case 'A':
                        case 'a':
                            state = SQLQueryParserState.SQL_RENA;
                            break;
                        default:
                            this._toMark();
                            return false;
                    }
                    break;
                case SQLQueryParserState.SQL_RENA:
                    switch (character) {
                        case 'M':
                        case 'm':
                            state = SQLQueryParserState.SQL_RENAM;
                            break;
                        default:
                            this._toMark();
                            return false;
                    }
                    break;
                case SQLQueryParserState.SQL_RENAM:
                    switch (character) {
                        case 'E':
                        case 'e':
                            state = SQLQueryParserState.SQL_RENAME;
                            break;
                        default:
                            this._toMark();
                            return false;
                    }
                    break;
                case SQLQueryParserState.SQL_RENAME:
                    switch (character) {
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            return true;
                        default:
                            this._toMark();
                            return false;
                    }
                    break;
                default:
                    this._toMark();
                    return false;
            }
        }
        this._toMark();
        return false;
    }

	_parseSetString() {
		let state = SQLQueryParserState.SQL_;
        let character = null;
        this._mark();
        while ((character = this._read()) != null) {
            switch (state) {
                case SQLQueryParserState.SQL_:
                    switch (character) {
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            break;
                        case 'S':
                        case 's':
                            state = SQLQueryParserState.SQL_S;
                            break;
                        default:
		                	this._toMark();
		                    return false;
                    }
                    break;
                case SQLQueryParserState.SQL_S:
                    switch (character) {
                        case 'E':
                        case 'e':
                            state = SQLQueryParserState.SQL_SE;
                            break;
                        default:
                            this._toMark();
                            return false;
                    }
                    break;
                case SQLQueryParserState.SQL_SE:
                    switch (character) {
                        case 'T':
                        case 't':
                            state = SQLQueryParserState.SQL_SET;
                            break;
                        default:
                            this._toMark();
                            return false;
                    }
                    break;
                case SQLQueryParserState.SQL_SET:
                    switch (character) {
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            return true;
                        default:
		                	this._toMark();
		                    return false;
                    }
                    break;
                default:
                	this._toMark();
                    return false;
            }
        }
    	this._toMark();
        return false;
    }

    _parseGroupByString() {
        let state = SQLQueryParserState.SQL_;
        let column = '';
        let character = null;
        this._mark();
        while ((character = this._read()) != null) {
            switch (state) {
                case SQLQueryParserState.SQL_:
                    switch (character) {
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            break;
                        case 'G':
                        case 'g':
                            state = SQLQueryParserState.SQL_G;
                            break;
                        default:
                            this._toMark();
                            return false;
                    }
                    break;
                case SQLQueryParserState.SQL_G:
                    switch (character) {
                        case 'R':
                        case 'r':
                            state = SQLQueryParserState.SQL_GR;
                            break;
                        default:
                            this._toMark();
                            return false;
                    }
                    break;
                case SQLQueryParserState.SQL_GR:
                    switch (character) {
                        case 'O':
                        case 'o':
                            state = SQLQueryParserState.SQL_GRO;
                            break;
                        default:
                            this._toMark();
                            return false;
                    }
                    break;
                case SQLQueryParserState.SQL_GRO:
                    switch (character) {
                        case 'U':
                        case 'u':
                            state = SQLQueryParserState.SQL_GROU;
                            break;
                        default:
                            this._toMark();
                            return false;
                    }
                    break;
                case SQLQueryParserState.SQL_GROU:
                    switch (character) {
                        case 'P':
                        case 'p':
                            state = SQLQueryParserState.SQL_GROUP;
                            break;
                        default:
                            this._toMark();
                            return false;
                    }
                    break;
                case SQLQueryParserState.SQL_GROUP:
                    switch (character) {
                        case ' ':
                        case '\t':
                        case '\r':
                        case '\n':
                            break;
                        case 'B':
                        case 'b':
                            state = SQLQueryParserState.SQL_GROUP_B;
                            break;
                        default:
                            this._toMark();
                            return false;
                    }
                    break;
                case SQLQueryParserState.SQL_GROUP_B:
                    switch (character) {
                        case 'Y':
                        case 'y':
                            state = SQLQueryParserState.SQL_GROUP_BY;
                            break;
                        default:
                            this._toMark();
                            return false;
                    }
                    break;
                case SQLQueryParserState.SQL_GROUP_BY:
                    switch (character) {
                        case ' ':
                        case '\t':
                        case '\r':
                        case '\n':
                            return true;
                        default:
                            this._toMark();
                            return false;
                    }
                    break;
                default:
                    this._toMark();
                    return false;
            }
        }
        this._toMark();
        return false;
    }

    _parseHavingString() {
        let state = SQLQueryParserState.SQL_;
        let column = '';
        let character = null;
        this._mark();
        while ((character = this._read()) != null) {
            switch (state) {
                case SQLQueryParserState.SQL_:
                    switch (character) {
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            break;
                        case 'H':
                        case 'h':
                            state = SQLQueryParserState.SQL_H;
                            break;
                        default:
                            this._toMark();
                            return false;
                    }
                    break;
                case SQLQueryParserState.SQL_H:
                    switch (character) {
                        case 'A':
                        case 'a':
                            state = SQLQueryParserState.SQL_HA;
                            break;
                        default:
                            this._toMark();
                            return false;
                    }
                    break;
                case SQLQueryParserState.SQL_HA:
                    switch (character) {
                        case 'V':
                        case 'v':
                            state = SQLQueryParserState.SQL_HAV;
                            break;
                        default:
                            this._toMark();
                            return false;
                    }
                    break;
                case SQLQueryParserState.SQL_HAV:
                    switch (character) {
                        case 'I':
                        case 'i':
                            state = SQLQueryParserState.SQL_HAVI;
                            break;
                        default:
                            this._toMark();
                            return false;
                    }
                    break;
                case SQLQueryParserState.SQL_HAVI:
                    switch (character) {
                        case 'N':
                        case 'n':
                            state = SQLQueryParserState.SQL_HAVIN;
                            break;
                        default:
                            this._toMark();
                            return false;
                    }
                    break;
                case SQLQueryParserState.SQL_HAVIN:
                    switch (character) {
                        case 'G':
                        case 'g':
                            state = SQLQueryParserState.SQL_HAVING;
                            break;
                        default:
                            this._toMark();
                            return false;
                    }
                    break;
                case SQLQueryParserState.SQL_HAVING:
                    switch (character) {
                        case ' ':
                        case '\t':
                        case '\r':
                        case '\n':
                            return true;
                        default:
                            this._toMark();
                            return false;
                    }
                    break;
                default:
                    this._toMark();
                    return false;
            }
        }
        this._toMark();
        return false;
    }

    _parseOrderByString() {
        let state = SQLQueryParserState.SQL_;
        let column = '';
        let character = null;
        this._mark();
        while ((character = this._read()) != null) {
            switch (state) {
                case SQLQueryParserState.SQL_:
                    switch (character) {
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            break;
                        case 'O':
                        case 'o':
                            state = SQLQueryParserState.SQL_O;
                            break;
                        default:
                            this._toMark();
                            return false;
                    }
                    break;
                case SQLQueryParserState.SQL_O:
                    switch (character) {
                        case 'R':
                        case 'r':
                            state = SQLQueryParserState.SQL_OR;
                            break;
                        default:
                            this._toMark();
                            return false;
                    }
                    break;
                case SQLQueryParserState.SQL_OR:
                    switch (character) {
                        case 'D':
                        case 'd':
                            state = SQLQueryParserState.SQL_ORD;
                            break;
                        default:
                            this._toMark();
                            return false;
                    }
                    break;
                case SQLQueryParserState.SQL_ORD:
                    switch (character) {
                        case 'E':
                        case 'e':
                            state = SQLQueryParserState.SQL_ORDE;
                            break;
                        default:
                            this._toMark();
                            return false;
                    }
                    break;
                case SQLQueryParserState.SQL_ORDE:
                    switch (character) {
                        case 'R':
                        case 'r':
                            state = SQLQueryParserState.SQL_ORDER;
                            break;
                        default:
                            this._toMark();
                            return false;
                    }
                    break;
                case SQLQueryParserState.SQL_ORDER:
                    switch (character) {
                        case ' ':
                        case '\t':
                        case '\r':
                        case '\n':
                            break;
                        case 'B':
                        case 'b':
                            state = SQLQueryParserState.SQL_ORDER_B;
                            break;
                        default:
                            this._toMark();
                            return false;
                    }
                    break;
                case SQLQueryParserState.SQL_ORDER_B:
                    switch (character) {
                        case 'Y':
                        case 'y':
                            state = SQLQueryParserState.SQL_ORDER_BY;
                            break;
                        default:
                            this._toMark();
                            return false;
                    }
                    break;
                case SQLQueryParserState.SQL_ORDER_BY:
                    switch (character) {
                        case ' ':
                        case '\t':
                        case '\r':
                        case '\n':
                            return true;
                        default:
                            this._toMark();
                            return false;
                    }
                    break;
                default:
                    this._toMark();
                    return false;
            }
        }
        this._toMark();
        return false;
    }

	_parseWhereString() {
		let state = SQLQueryParserState.SQL_;
        let character = null;
        this._mark();
        while ((character = this._read()) != null) {
            switch (state) {
                case SQLQueryParserState.SQL_:
                    switch (character) {
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            break;
                        case 'W':
                        case 'w':
                            state = SQLQueryParserState.SQL_W;
                            break;
                        default:
		                	this._toMark();
		                    return false;
                    }
                    break;
                case SQLQueryParserState.SQL_W:
                    switch (character) {
                        case 'H':
                        case 'h':
                            state = SQLQueryParserState.SQL_WH;
                            break;
                        default:
		                	this._toMark();
		                    return false;
                    }
                    break;
                case SQLQueryParserState.SQL_WH:
                    switch (character) {
                        case 'E':
                        case 'e':
                            state = SQLQueryParserState.SQL_WHE;
                            break;
                        default:
		                	this._toMark();
		                    return false;
                    }
                    break;
                case SQLQueryParserState.SQL_WHE:
                    switch (character) {
                        case 'R':
                        case 'r':
                            state = SQLQueryParserState.SQL_WHER;
                            break;
                        default:
                            this._toMark();
                            return false;
                    }
                    break;
                case SQLQueryParserState.SQL_WHER:
                    switch (character) {
                        case 'E':
                        case 'e':
                            state = SQLQueryParserState.SQL_WHERE;
                            break;
                        default:
                            this._toMark();
                            return false;
                    }
                    break;
                case SQLQueryParserState.SQL_WHERE:
                    switch (character) {
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            return true;
                        default:
		                	this._toMark();
		                    return false;
                    }
                    break;
                default:
                	this._toMark();
                    return false;
            }
        }
    	this._toMark();
        return false;
    }

	_parseSelectExpressions() {
		let sqlSelectExpressions = [];
        let sqlSelectExpression = null;
		let selectExpression = null;
        let distinct = false;
        let alias = null;
		let state = SQLQueryParserState.SQL_;
		let character = null;
		while ((character = this._read()) != null) {
            switch (state) {
                case SQLQueryParserState.SQL_:
                    switch (character) {
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            // Ignore initial whitespace.
                            break;
                        case 'A': 
                        case 'a':
                            // Possible AVG(...).
                            state = SQLQueryParserState.SQL_A;
                            selectExpression = '' + character;
                            break;
                        case 'C': 
                        case 'c':
                            // Possible COUNT(...) or CONCAT(...).
                            state = SQLQueryParserState.SQL_C;
                            selectExpression = '' + character;
                            break;
                        case 'M': 
                        case 'm':
                            // Possible MAX(...) or MIN(...).
                            state = SQLQueryParserState.SQL_M;
                            selectExpression = '' + character;
                            break;
                        case 'S': 
                        case 's':
                            // Possible SUM(...).
                            state = SQLQueryParserState.SQL_S;
                            selectExpression = '' + character;
                            break;
                        case '[':
                            // Possible column name with some whitespace.
                            state = SQLQueryParserState.SQL_READ_SQUARE_BRACKET_VALUE;
                            selectExpression = '';
                            break;
                        case '"':
                            // Possible column name with some whitespace.
                            state = SQLQueryParserState.SQL_READ_DOUBLE_QUOTE_VALUE;
                            selectExpression = '';
                            break;
                        case '\'':
                            // Possible column name with some whitespace.
                            state = SQLQueryParserState.SQL_READ_SINGLE_QUOTE_VALUE;
                            selectExpression = '';
                            break;
                        default:
                            // Possible column name without whitespace
                            state = SQLQueryParserState.SQL_READ_NO_QUOTE_VALUE;
                            selectExpression = '' + character;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_A:
                    switch (character) {
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            sqlSelectExpression = new SQLSelectExpression(selectExpression);
                            sqlSelectExpressions.push(sqlSelectExpression);
                            state = SQLQueryParserState.SQL_CSSTRING_NEXT;
                            this._mark();
                            break;
                        case ',':
                            sqlSelectExpression = new SQLSelectExpression(selectExpression);
                            sqlSelectExpressions.push(sqlSelectExpression);
                            state = SQLQueryParserState.SQL_;
                            break;
                        case 'V':
                        case 'v':
                            state = SQLQueryParserState.SQL_AV;
                            selectExpression += character;
                            break;
                        default:
                            state = SQLQueryParserState.SQL_READ_NO_QUOTE_VALUE;
                            selectExpression += character;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_AV:
                    switch (character) {
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            sqlSelectExpression = new SQLSelectExpression(selectExpression);
                            sqlSelectExpressions.push(sqlSelectExpression);
                            state = SQLQueryParserState.SQL_CSSTRING_NEXT;
                            this._mark();
                            break;
                        case ',':
                            sqlSelectExpression = new SQLSelectExpression(selectExpression);
                            sqlSelectExpressions.push(sqlSelectExpression);
                            state = SQLQueryParserState.SQL_;
                            break;
                        case 'G':
                        case 'g':
                            state = SQLQueryParserState.SQL_AVG;
                            selectExpression += character;
                            break;
                        default:
                            state = SQLQueryParserState.SQL_READ_NO_QUOTE_VALUE;
                            selectExpression += character;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_AVG:
                    switch (character) {
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            break;
                        case ',':
                            sqlSelectExpression = new SQLSelectExpression(selectExpression);
                            sqlSelectExpressions.push(sqlSelectExpression);
                            state = SQLQueryParserState.SQL_;
                            break;
                        case '(':
                            selectExpression = '';
                            if(this._parseDistinctString()) {
                                distinct = true;
                            } else {
                                distinct = false;
                            }
                            state = SQLQueryParserState.SQL_READING_FUNCTION_AVG;
                            break;
                        default:
                            state = SQLQueryParserState.SQL_READ_NO_QUOTE_VALUE;
                            selectExpression += character;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_READING_FUNCTION_AVG:
                    switch (character) {
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            break;
                        case ')':
                            sqlSelectExpression = new SQLAvgAggregateFunction(selectExpression);
                            sqlSelectExpression.setDistinct(distinct);
                            sqlSelectExpressions.push(sqlSelectExpression);
                            state = SQLQueryParserState.SQL_CSSTRING_NEXT;
                            this._mark();
                            break;
                        default:
                            selectExpression += character;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_C:
                    switch (character) {
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            sqlSelectExpression = new SQLSelectExpression(selectExpression);
                            sqlSelectExpressions.push(sqlSelectExpression);
                            state = SQLQueryParserState.SQL_CSSTRING_NEXT;
                            this._mark();
                            break;
                        case ',':
                            sqlSelectExpression = new SQLSelectExpression(selectExpression);
                            sqlSelectExpressions.push(sqlSelectExpression);
                            state = SQLQueryParserState.SQL_;
                            break;
                        case 'O':
                        case 'o':
                            state = SQLQueryParserState.SQL_CO;
                            selectExpression += character;
                            break;
                        default:
                            state = SQLQueryParserState.SQL_READ_NO_QUOTE_VALUE;
                            selectExpression += character;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_CO:
                    switch (character) {
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            sqlSelectExpression = new SQLSelectExpression(selectExpression);
                            sqlSelectExpressions.push(sqlSelectExpression);
                            state = SQLQueryParserState.SQL_CSSTRING_NEXT;
                            this._mark();
                            break;
                        case ',':
                            sqlSelectExpression = new SQLSelectExpression(selectExpression);
                            sqlSelectExpressions.push(sqlSelectExpression);
                            state = SQLQueryParserState.SQL_;
                            break;
                        case 'N':
                        case 'n':
                            state = SQLQueryParserState.SQL_CON;
                            selectExpression += character;
                            break;
                            break;
                        case 'U':
                        case 'u':
                            state = SQLQueryParserState.SQL_COU;
                            selectExpression += character;
                            break;
                        default:
                            state = SQLQueryParserState.SQL_READ_NO_QUOTE_VALUE;
                            selectExpression += character;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_CON:
                    switch (character) {
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            sqlSelectExpression = new SQLSelectExpression(selectExpression);
                            sqlSelectExpressions.push(sqlSelectExpression);
                            state = SQLQueryParserState.SQL_CSSTRING_NEXT;
                            this._mark();
                            break;
                        case ',':
                            sqlSelectExpression = new SQLSelectExpression(selectExpression);
                            sqlSelectExpressions.push(sqlSelectExpression);
                            state = SQLQueryParserState.SQL_;
                            break;
                        case 'C':
                        case 'c':
                            state = SQLQueryParserState.SQL_CONC;
                            selectExpression += character;
                            break;
                        default:
                            state = SQLQueryParserState.SQL_READ_NO_QUOTE_VALUE;
                            selectExpression += character;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_CONC:
                    switch (character) {
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            sqlSelectExpression = new SQLSelectExpression(selectExpression);
                            sqlSelectExpressions.push(sqlSelectExpression);
                            state = SQLQueryParserState.SQL_CSSTRING_NEXT;
                            this._mark();
                            break;
                        case ',':
                            sqlSelectExpression = new SQLSelectExpression(selectExpression);
                            sqlSelectExpressions.push(sqlSelectExpression);
                            state = SQLQueryParserState.SQL_;
                            break;
                        case 'A':
                        case 'a':
                            state = SQLQueryParserState.SQL_CONCA;
                            selectExpression += character;
                            break;
                        default:
                            state = SQLQueryParserState.SQL_READ_NO_QUOTE_VALUE;
                            selectExpression += character;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_CONCA:
                    switch (character) {
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            sqlSelectExpression = new SQLSelectExpression(selectExpression);
                            sqlSelectExpressions.push(sqlSelectExpression);
                            state = SQLQueryParserState.SQL_CSSTRING_NEXT;
                            this._mark();
                            break;
                        case ',':
                            sqlSelectExpression = new SQLSelectExpression(selectExpression);
                            sqlSelectExpressions.push(sqlSelectExpression);
                            state = SQLQueryParserState.SQL_;
                            break;
                        case 'T':
                        case 't':
                            state = SQLQueryParserState.SQL_CONCAT;
                            selectExpression += character;
                            break;
                        default:
                            state = SQLQueryParserState.SQL_READ_NO_QUOTE_VALUE;
                            selectExpression += character;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_CONCAT:
                    switch (character) {
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            break;
                        case ',':
                            sqlSelectExpression = new SQLSelectExpression(selectExpression);
                            sqlSelectExpressions.push(sqlSelectExpression);
                            state = SQLQueryParserState.SQL_;
                            break;
                        case '(':
                            this._unread();
                            // the true parameter will indicate that strings without
                            // single or double quotes represent column names.
                            let values = this._parseStringsBetweenParenthesis(true);
                            sqlSelectExpression = new SQLConcatFunction(values);
                            sqlSelectExpressions.push(sqlSelectExpression);
                            state = SQLQueryParserState.SQL_CSSTRING_NEXT;
                            this._mark();
                            break;
                        default:
                            state = SQLQueryParserState.SQL_READ_NO_QUOTE_VALUE;
                            selectExpression += character;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_COU:
                    switch (character) {
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            sqlSelectExpression = new SQLSelectExpression(selectExpression);
                            sqlSelectExpressions.push(sqlSelectExpression);
                            state = SQLQueryParserState.SQL_CSSTRING_NEXT;
                            this._mark();
                            break;
                        case ',':
                            sqlSelectExpression = new SQLSelectExpression(selectExpression);
                            sqlSelectExpressions.push(sqlSelectExpression);
                            state = SQLQueryParserState.SQL_;
                            break;
                        case 'N':
                        case 'n':
                            state = SQLQueryParserState.SQL_COUN;
                            selectExpression += character;
                            break;
                        default:
                            state = SQLQueryParserState.SQL_READ_NO_QUOTE_VALUE;
                            selectExpression += character;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_COUN:
                    switch (character) {
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            sqlSelectExpression = new SQLSelectExpression(selectExpression);
                            sqlSelectExpressions.push(sqlSelectExpression);
                            state = SQLQueryParserState.SQL_CSSTRING_NEXT;
                            this._mark();
                            break;
                        case ',':
                            sqlSelectExpression = new SQLSelectExpression(selectExpression);
                            sqlSelectExpressions.push(sqlSelectExpression);
                            state = SQLQueryParserState.SQL_;
                            break;
                        case 'T':
                        case 't':
                            state = SQLQueryParserState.SQL_COUNT;
                            selectExpression += character;
                            break;
                        default:
                            state = SQLQueryParserState.SQL_READ_NO_QUOTE_VALUE;
                            selectExpression += character;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_COUNT:
                    switch (character) {
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            break;
                        case ',':
                            sqlSelectExpression = new SQLSelectExpression(selectExpression);
                            sqlSelectExpressions.push(sqlSelectExpression);
                            state = SQLQueryParserState.SQL_;
                            break;
                        case '(':
                            selectExpression = '';
                            if(this._parseDistinctString()) {
                                distinct = true;
                            } else {
                                distinct = false;
                            }
                            state = SQLQueryParserState.SQL_READING_FUNCTION_COUNT;
                            break;
                        default:
                            state = SQLQueryParserState.SQL_READ_NO_QUOTE_VALUE;
                            selectExpression += character;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_READING_FUNCTION_COUNT:
                    switch (character) {
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            break;
                        case ')':
                            sqlSelectExpression = new SQLCountAggregateFunction(selectExpression);
                            sqlSelectExpression.setDistinct(distinct);
                            sqlSelectExpressions.push(sqlSelectExpression);
                            state = SQLQueryParserState.SQL_CSSTRING_NEXT;
                            this._mark();
                            break;
                        default:
                            selectExpression += character;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_M:
                    switch (character) {
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            sqlSelectExpression = new SQLSelectExpression(selectExpression);
                            sqlSelectExpressions.push(sqlSelectExpression);
                            state = SQLQueryParserState.SQL_CSSTRING_NEXT;
                            this._mark();
                            break;
                        case ',':
                            sqlSelectExpression = new SQLSelectExpression(selectExpression);
                            sqlSelectExpressions.push(sqlSelectExpression);
                            state = SQLQueryParserState.SQL_;
                            break;
                        case 'A':
                        case 'a':
                            state = SQLQueryParserState.SQL_MA;
                            selectExpression += character;
                            break;
                        case 'I':
                        case 'i':
                            state = SQLQueryParserState.SQL_MI;
                            selectExpression += character;
                            break;
                        default:
                            state = SQLQueryParserState.SQL_READ_NO_QUOTE_VALUE;
                            selectExpression += character;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_MA:
                    switch (character) {
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            sqlSelectExpression = new SQLSelectExpression(selectExpression);
                            sqlSelectExpressions.push(sqlSelectExpression);
                            state = SQLQueryParserState.SQL_CSSTRING_NEXT;
                            this._mark();
                            break;
                        case ',':
                            sqlSelectExpression = new SQLSelectExpression(selectExpression);
                            sqlSelectExpressions.push(sqlSelectExpression);
                            state = SQLQueryParserState.SQL_;
                            break;
                        case 'X':
                        case 'x':
                            state = SQLQueryParserState.SQL_MAX;
                            selectExpression += character;
                            break;
                        default:
                            state = SQLQueryParserState.SQL_READ_NO_QUOTE_VALUE;
                            selectExpression += character;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_MAX:
                    switch (character) {
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            break;
                        case ',':
                            sqlSelectExpression = new SQLSelectExpression(selectExpression);
                            sqlSelectExpressions.push(sqlSelectExpression);
                            state = SQLQueryParserState.SQL_;
                            break;
                        case '(':
                            selectExpression = '';
                            if(this._parseDistinctString()) {
                                distinct = true;
                            } else {
                                distinct = false;
                            }
                            state = SQLQueryParserState.SQL_READING_FUNCTION_MAX;
                            break;
                        default:
                            state = SQLQueryParserState.SQL_READ_NO_QUOTE_VALUE;
                            selectExpression += character;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_READING_FUNCTION_MAX:
                    switch (character) {
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            break;
                        case ')':
                            sqlSelectExpression = new SQLMaxAggregateFunction(selectExpression);
                            sqlSelectExpression.setDistinct(distinct);
                            sqlSelectExpressions.push(sqlSelectExpression);
                            state = SQLQueryParserState.SQL_CSSTRING_NEXT;
                            this._mark();
                            break;
                        default:
                            selectExpression += character;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_MI:
                    switch (character) {
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            sqlSelectExpression = new SQLSelectExpression(selectExpression);
                            sqlSelectExpressions.push(sqlSelectExpression);
                            state = SQLQueryParserState.SQL_CSSTRING_NEXT;
                            this._mark();
                            break;
                        case ',':
                            sqlSelectExpression = new SQLSelectExpression(selectExpression);
                            sqlSelectExpressions.push(sqlSelectExpression);
                            state = SQLQueryParserState.SQL_;
                            break;
                        case 'N':
                        case 'n':
                            state = SQLQueryParserState.SQL_MIN;
                            selectExpression += character;
                            break;
                        default:
                            state = SQLQueryParserState.SQL_READ_NO_QUOTE_VALUE;
                            selectExpression += character;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_MIN:
                    switch (character) {
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            break;
                        case ',':
                            sqlSelectExpression = new SQLSelectExpression(selectExpression);
                            sqlSelectExpressions.push(sqlSelectExpression);
                            state = SQLQueryParserState.SQL_;
                            break;
                        case '(':
                            selectExpression = '';
                            if(this._parseDistinctString()) {
                                distinct = true;
                            } else {
                                distinct = false;
                            }
                            state = SQLQueryParserState.SQL_READING_FUNCTION_MIN;
                            break;
                        default:
                            state = SQLQueryParserState.SQL_READ_NO_QUOTE_VALUE;
                            selectExpression += character;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_READING_FUNCTION_MIN:
                    switch (character) {
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            break;
                        case ')':
                            sqlSelectExpression = new SQLMinAggregateFunction(selectExpression);
                            sqlSelectExpression.setDistinct(distinct);
                            sqlSelectExpressions.push(sqlSelectExpression);
                            state = SQLQueryParserState.SQL_CSSTRING_NEXT;
                            this._mark();
                            break;
                        default:
                            selectExpression += character;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_S:
                    switch (character) {
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            sqlSelectExpression = new SQLSelectExpression(selectExpression);
                            sqlSelectExpressions.push(sqlSelectExpression);
                            state = SQLQueryParserState.SQL_CSSTRING_NEXT;
                            this._mark();
                            break;
                        case ',':
                            sqlSelectExpression = new SQLSelectExpression(selectExpression);
                            sqlSelectExpressions.push(sqlSelectExpression);
                            state = SQLQueryParserState.SQL_;
                            break;
                        case 'U':
                        case 'u':
                            state = SQLQueryParserState.SQL_SU;
                            selectExpression += character;
                            break;
                        default:
                            state = SQLQueryParserState.SQL_READ_NO_QUOTE_VALUE;
                            selectExpression += character;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_SU:
                    switch (character) {
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            sqlSelectExpression = new SQLSelectExpression(selectExpression);
                            sqlSelectExpressions.push(sqlSelectExpression);
                            state = SQLQueryParserState.SQL_CSSTRING_NEXT;
                            this._mark();
                            break;
                        case ',':
                            sqlSelectExpression = new SQLSelectExpression(selectExpression);
                            sqlSelectExpressions.push(sqlSelectExpression);
                            state = SQLQueryParserState.SQL_;
                            break;
                        case 'M':
                        case 'm':
                            state = SQLQueryParserState.SQL_SUM;
                            selectExpression += character;
                            break;
                        default:
                            state = SQLQueryParserState.SQL_READ_NO_QUOTE_VALUE;
                            selectExpression += character;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_SUM:
                    switch (character) {
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            break;
                        case ',':
                            sqlSelectExpression = new SQLSelectExpression(selectExpression);
                            sqlSelectExpressions.push(sqlSelectExpression);
                            state = SQLQueryParserState.SQL_;
                            break;
                        case '(':
                            selectExpression = '';
                            if(this._parseDistinctString()) {
                                distinct = true;
                            } else {
                                distinct = false;
                            }
                            state = SQLQueryParserState.SQL_READING_FUNCTION_SUM;
                            break;
                        default:
                            state = SQLQueryParserState.SQL_READ_NO_QUOTE_VALUE;
                            selectExpression += character;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_READING_FUNCTION_SUM:
                    switch (character) {
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            break;
                        case ')':
                            sqlSelectExpression = new SQLSumAggregateFunction(selectExpression);
                            sqlSelectExpression.setDistinct(distinct);
                            sqlSelectExpressions.push(sqlSelectExpression);
                            state = SQLQueryParserState.SQL_CSSTRING_NEXT;
                            this._mark();
                            break;
                        default:
                            selectExpression += character;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_READ_SQUARE_BRACKET_VALUE:
                    switch(character) {
                        case ']':
                            sqlSelectExpression = new SQLSelectExpression(selectExpression);
                            sqlSelectExpressions.push(sqlSelectExpression);
                            state = SQLQueryParserState.SQL_CSSTRING_NEXT;
                            this._mark();
                            break;
                        default:
                            selectExpression += character;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_READ_DOUBLE_QUOTE_VALUE:
                    switch(character) {
                        case '"':
                            sqlSelectExpression = new SQLSelectExpression(selectExpression);
                            sqlSelectExpressions.push(sqlSelectExpression);
                            state = SQLQueryParserState.SQL_CSSTRING_NEXT;
                            this._mark();
                            break;
                        default:
                            selectExpression += character;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_READ_SINGLE_QUOTE_VALUE:
                    switch(character) {
                        case '\'':
                            sqlSelectExpression = new SQLSelectExpression(selectExpression);
                            sqlSelectExpressions.push(sqlSelectExpression);
                            state = SQLQueryParserState.SQL_CSSTRING_NEXT;
                            this._mark();
                            break;
                        default:
                            selectExpression += character;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_READ_NO_QUOTE_VALUE:
                    switch (character) {
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            sqlSelectExpression = new SQLSelectExpression(selectExpression);
                            sqlSelectExpressions.push(sqlSelectExpression);
                            state = SQLQueryParserState.SQL_CSSTRING_NEXT;
                            this._mark();
                            break;
                        case ',':
                            sqlSelectExpression = new SQLSelectExpression(selectExpression);
                            sqlSelectExpressions.push(sqlSelectExpression);
                            state = SQLQueryParserState.SQL_;
                            break;
                        default:
                            selectExpression += character;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_CSSTRING_NEXT:
                    switch (character) {
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            break;
                        case ',':
                            state = SQLQueryParserState.SQL_;
                            break;
                        case 'A':
                        case 'a':
                            state = SQLQueryParserState.SQL_ALIAS_A;
                            break;
                        default:
                        	this._toMark();
                            return sqlSelectExpressions;
                    }
                    break;
                case SQLQueryParserState.SQL_ALIAS_A:
                    switch(character) {
                        case 'S':
                        case 's':
                            state = SQLQueryParserState.SQL_ALIAS_AS;
                            break;
                        default:
                            // This really should not happen...
                            this._toMark();
                            return sqlSelectExpressions;
                    }
                    break;
                case SQLQueryParserState.SQL_ALIAS_AS:
                    switch(character) {
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            alias = '';
                            state = SQLQueryParserState.SQL_READ_ALIAS;
                            break;
                        default:
                            // This really should not happen...
                            this._toMark();
                            return sqlSelectExpressions;
                    }
                    break;
                case SQLQueryParserState.SQL_READ_ALIAS:
                    switch(character) {
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            break;
                        case '[':
                            state = SQLQueryParserState.SQL_READ_ALIAS_SQUARE_BRACKET;
                            break;
                        case '"':
                            state = SQLQueryParserState.SQL_READ_ALIAS_DOUBLE_QUOTE;
                            break;
                        case '\'':
                            state = SQLQueryParserState.SQL_READ_ALIAS_SINGLE_QUOTE;
                            break;
                        case ',':
                            state = SQLQueryParserState.SQL_;
                            break;
                        default:
                            alias += character;
                            state = SQLQueryParserState.SQL_READ_ALIAS_NO_QUOTE;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_READ_ALIAS_SQUARE_BRACKET:
                    switch(character) {
                        case ']':
                            sqlSelectExpression.setAlias(alias);
                            state = SQLQueryParserState.SQL_CSSTRING_NEXT;  
                            this._mark();
                            break;
                        default:
                            alias += character;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_READ_ALIAS_DOUBLE_QUOTE:
                    switch(character) {
                        case '"':
                            sqlSelectExpression.setAlias(alias);
                            state = SQLQueryParserState.SQL_CSSTRING_NEXT;  
                            this._mark();
                            break;
                        default:
                            alias += character;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_READ_ALIAS_SINGLE_QUOTE:
                    switch(character) {
                        case '\'':
                            sqlSelectExpression.setAlias(alias);
                            state = SQLQueryParserState.SQL_CSSTRING_NEXT;  
                            this._mark();
                            break;
                        default:
                            alias += character;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_READ_ALIAS_NO_QUOTE:
                    switch(character) {
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            sqlSelectExpression.setAlias(alias);
                            state = SQLQueryParserState.SQL_CSSTRING_NEXT;  
                            this._mark();
                            break;
                        case ',':
                            sqlSelectExpression.setAlias(alias);
                            state = SQLQueryParserState.SQL_;              
                        default:
                            alias += character;
                            break;
                    }
                    break;
                default:
                    break;
            }
        }
        throw new Error("SQLQueryParser.parseCSColumns(): Error reading sqlSelectExpressions ");
    }

    _parseColumnValuePairs() {
        let result = new Map();
        let leftOperand = '';
        let rightOperand = null;
        let state = SQLQueryParserState.SQL_;
        let character = null;
        while ((character = this._read()) != null) {
            switch (state) {
                case SQLQueryParserState.SQL_:
                    switch (character) {
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            break;
                        case '[':
                            state = SQLQueryParserState.SQL_LEFT_OPERAND_SQUARE_BRACKET;
                            break;
                        case '"':
                            state = SQLQueryParserState.SQL_LEFT_OPERAND_DOUBLE_QUOTE;
                            break;
                        case '\'':
                            state = SQLQueryParserState.SQL_LEFT_OPERAND_SINGLE_QUOTE;
                            break;
                        default:
                            leftOperand = character;
                            state = SQLQueryParserState.SQL_LEFT_OPERAND;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_LEFT_OPERAND_SQUARE_BRACKET:
                    switch (character) {
                        case ']':
                            state = SQLQueryParserState.SQL_OPERATOR;
                            break;
                        default:
                            leftOperand += character;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_LEFT_OPERAND_DOUBLE_QUOTE:
                    switch (character) {
                        case '"':
                            state = SQLQueryParserState.SQL_OPERATOR;
                            break;
                        default:
                            leftOperand += character;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_LEFT_OPERAND_SINGLE_QUOTE:
                    switch (character) {
                        case '\'':
                            state = SQLQueryParserState.SQL_OPERATOR;
                            break;
                        default:
                            leftOperand += character;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_LEFT_OPERAND:
                    switch (character) {
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            state = SQLQueryParserState.SQL_OPERATOR;
                            break;
                        case '=':
                            state = SQLQueryParserState.SQL_RIGHT_OPERAND;
                            break;
                        default:
                            leftOperand += character;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_OPERATOR:
                    switch (character) {
                        // Ignore whitespace
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            break;
                        case '=':
                            state = SQLQueryParserState.SQL_RIGHT_OPERAND;
                            break;
                        default:
                            state = SQLQueryParserState.SQL_ERROR;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_RIGHT_OPERAND:
                    switch (character) {
                        // Ignore whitespace
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            break;
                        // Open square bracket indicates either an array, or
                        // a column name (with whitespace). 
                        case '[':
                            this._unread();
                            // We set the _noQuotesAreColumns to true.
                            rightOperand = this._parseArray(true);
                            // If there is only one element in this array and it is
                            // a SQLColumn we assume the square brackets where there to
                            // allow for whitespaces in the column name.
                            // Extract the one element and assign it to the right operand instead.
                            if(rightOperand.length === 1) {
                                if(rightOperand[0] instanceof SQLColumn) {
                                    rightOperand = rightOperand[0];
                                }
                            }
                            result.set(leftOperand,rightOperand);
                            state = SQLQueryParserState.SQL_WHITESPACE;
                            break;
                        // Any other non-letter, non-number
                        // characters indicate an error.
                        case '<':
                        case '>':
                        case '=':
                        case '!':
                        case '?':
                            state = SQLQueryParserState.SQL_ERROR;
                            break;
                        // A quote indicates the start of a string
                        case '\'':
                            state = SQLQueryParserState.SQL_RIGHT_OPERAND_SINGLE_QUOTE;
                            rightOperand = "'";
                            break;
                        case '"':
                            state = SQLQueryParserState.SQL_RIGHT_OPERAND_DOUBLE_QUOTE;
                            rightOperand = "'";
                            break;
                        // A number indicates either the start of a number
                        // or a date. Numbers are allowed to be negative.
                        case '1':
                        case '2':
                        case '3':
                        case '4':
                        case '5':
                        case '6':
                        case '7':
                        case '8':
                        case '9':
                        case '0':
                        case '-':
                            state = SQLQueryParserState.SQL_RIGHT_OPERAND_NUMBER;
                            rightOperand = "";
                            rightOperand += character;
                            break;
                        // Potential TRUE indicating a boolean
                        case 'T':
                        case 't':
                            state = SQLQueryParserState.SQL_RIGHT_OPERAND_T;
                            rightOperand = "";
                            rightOperand += character;
                            break;
                        // Potential FALSE indicating a boolean
                        case 'F':
                        case 'f':
                            state = SQLQueryParserState.SQL_RIGHT_OPERAND_F;
                            rightOperand = "";
                            rightOperand += character;
                            break;
                        case 'N':
                        case 'n':
                            state = SQLQueryParserState.SQL_RIGHT_OPERAND_N;
                            rightOperand = "";
                            rightOperand += character;
                            break;
                        case 'U':
                        case 'u':
                            state = SQLQueryParserState.SQL_RIGHT_OPERAND_U;
                            rightOperand = "";
                            rightOperand += character;
                            break;
                        default:
                            rightOperand = "";
                            rightOperand += character;
                            state = SQLQueryParserState.SQL_RIGHT_OPERAND_COLUMN;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_RIGHT_OPERAND_COLUMN:
                    switch (character) {
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            result.set(leftOperand,rightOperand);
                            state = SQLQueryParserState.SQL_WHITESPACE;
                            break;
                        case ',':
                            result.set(leftOperand,rightOperand);
                            state = SQLQueryParserState.SQL_;
                            break;
                        case ';':
                            result.set(leftOperand,rightOperand);
                            return result;
                        default:
                            rightOperand += character;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_RIGHT_OPERAND_N:
                    switch (character) {
                        case 'U':
                        case 'u':
                            state = SQLQueryParserState.SQL_RIGHT_OPERAND_NU;
                            rightOperand += character;
                            break;
                        default:
                            state = SQLQueryParserState.SQL_ERROR;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_RIGHT_OPERAND_NU:
                    switch (character) {
                        case 'L':
                        case 'l':
                            state = SQLQueryParserState.SQL_RIGHT_OPERAND_NUL;
                            rightOperand += character;
                            break;
                        default:
                            state = SQLQueryParserState.SQL_ERROR;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_RIGHT_OPERAND_NUL:
                    switch (character) {
                        case 'L':
                        case 'l':
                            state = SQLQueryParserState.SQL_RIGHT_OPERAND_NULL;
                            rightOperand += character;
                            break;
                        default:
                            state = SQLQueryParserState.SQL_ERROR;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_RIGHT_OPERAND_NULL:
                    switch (character) {
                        case ' ':
                        case '\t':
                        case '\r':
                        case '\n':
                            result.set(leftOperand,null);
                            state = SQLQueryParserState.SQL_WHITESPACE;
                            break;
                        case ',':
                            result.set(leftOperand,null);
                            state = SQLQueryParserState.SQL_;
                            break;
                        case ';':
                            result.set(leftOperand,null);
                            return result;
                        default:
                            rightOperand += character;
                            state = SQLQueryParserState.SQL_RIGHT_OPERAND_COLUMN;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_RIGHT_OPERAND_U:
                    switch (character) {
                        case 'N':
                        case 'n':
                            state = SQLQueryParserState.SQL_RIGHT_OPERAND_UN;
                            rightOperand += character;
                            break;
                        default:
                            state = SQLQueryParserState.SQL_ERROR;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_RIGHT_OPERAND_UN:
                    switch (character) {
                        case 'D':
                        case 'd':
                            state = SQLQueryParserState.SQL_RIGHT_OPERAND_UND;
                            rightOperand += character;
                            break;
                        default:
                            state = SQLQueryParserState.SQL_ERROR;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_RIGHT_OPERAND_UND:
                    switch (character) {
                        case 'E':
                        case 'e':
                            state = SQLQueryParserState.SQL_RIGHT_OPERAND_UNDE;
                            rightOperand += character;
                            break;
                        default:
                            state = SQLQueryParserState.SQL_ERROR;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_RIGHT_OPERAND_UNDE:
                    switch (character) {
                        case 'F':
                        case 'f':
                            state = SQLQueryParserState.SQL_RIGHT_OPERAND_UNDEF;
                            rightOperand += character;
                            break;
                        default:
                            state = SQLQueryParserState.SQL_ERROR;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_RIGHT_OPERAND_UNDEF:
                    switch (character) {
                        case 'I':
                        case 'i':
                            state = SQLQueryParserState.SQL_RIGHT_OPERAND_UNDEFI;
                            rightOperand += character;
                            break;
                        default:
                            state = SQLQueryParserState.SQL_ERROR;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_RIGHT_OPERAND_UNDEFI:
                    switch (character) {
                        case 'N':
                        case 'n':
                            state = SQLQueryParserState.SQL_RIGHT_OPERAND_UNDEFIN;
                            rightOperand += character;
                            break;
                        default:
                            state = SQLQueryParserState.SQL_ERROR;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_RIGHT_OPERAND_UNDEFIN:
                    switch (character) {
                        case 'E':
                        case 'e':
                            state = SQLQueryParserState.SQL_RIGHT_OPERAND_UNDEFINE;
                            rightOperand += character;
                            break;
                        default:
                            state = SQLQueryParserState.SQL_ERROR;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_RIGHT_OPERAND_UNDEFINE:
                    switch (character) {
                        case 'D':
                        case 'd':
                            state = SQLQueryParserState.SQL_RIGHT_OPERAND_UNDEFINED;
                            rightOperand += character;
                            break;
                        default:
                            state = SQLQueryParserState.SQL_ERROR;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_RIGHT_OPERAND_UNDEFINED:
                    switch (character) {
                        case ' ':
                        case '\t':
                        case '\r':
                        case '\n':
                            result.set(leftOperand,undefined);
                            state = SQLQueryParserState.SQL_WHITESPACE;
                            break;
                        case ',':
                            result.set(leftOperand,undefined);
                            state = SQLQueryParserState.SQL_;
                            break;
                        case ';':
                            result.set(leftOperand,undefined);
                            return result;
                        default:
                            rightOperand += character;
                            state = SQLQueryParserState.SQL_RIGHT_OPERAND_COLUMN;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_RIGHT_OPERAND_T:
                    switch (character) {
                        case 'R':
                        case 'r':
                            state = SQLQueryParserState.SQL_RIGHT_OPERAND_TR;
                            rightOperand += character;
                            break;
                        default:
                            state = SQLQueryParserState.SQL_ERROR;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_RIGHT_OPERAND_TR:
                    switch (character) {
                        case 'U':
                        case 'u':
                            state = SQLQueryParserState.SQL_RIGHT_OPERAND_TRU;
                            rightOperand += character;
                            break;
                        default:
                            state = SQLQueryParserState.SQL_ERROR;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_RIGHT_OPERAND_TRU:
                    switch (character) {
                        case 'E':
                        case 'e':
                            state = SQLQueryParserState.SQL_RIGHT_OPERAND_TRUE;
                            rightOperand += character;
                            break;
                        default:
                            state = SQLQueryParserState.SQL_ERROR;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_RIGHT_OPERAND_TRUE:
                    switch (character) {
                        case ' ':
                        case '\t':
                        case '\r':
                        case '\n':
                            result.set(leftOperand,true);
                            state = SQLQueryParserState.SQL_WHITESPACE;
                            break;
                        case ',':
                            result.set(leftOperand,true);
                            state = SQLQueryParserState.SQL_;
                            break;
                        case ';':
                            result.set(leftOperand,true);
                            return result;
                        default:
                            rightOperand += character;
                            state = SQLQueryParserState.SQL_RIGHT_OPERAND_COLUMN;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_WHITESPACE:
                    switch(character) {
                        case ' ':
                        case '\t':
                        case '\r':
                        case '\n':
                            break;
                        case ',':
                            state = SQLQueryParserState.SQL_;
                            break;
                        case ';':
                            return result;
                        case 'W':
                        case 'w':
                            this._unread();
                            return result;
                        default:
                            state = SQLQueryParserState.SQL_ERROR;
                            break;                            
                    }
                    break;
                case SQLQueryParserState.SQL_RIGHT_OPERAND_F:
                    switch (character) {
                        case 'A':
                        case 'a':
                            state = SQLQueryParserState.SQL_RIGHT_OPERAND_FA;
                            rightOperand += character;
                            break;
                        default:
                            rightOperand += character;
                            state = SQLQueryParserState.SQL_RIGHT_OPERAND_COLUMN;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_RIGHT_OPERAND_FA:
                    switch (character) {
                        case 'L':
                        case 'l':
                            state = SQLQueryParserState.SQL_RIGHT_OPERAND_FAL;
                            rightOperand += character;
                            break;
                        default:
                            rightOperand += character;
                            state = SQLQueryParserState.SQL_RIGHT_OPERAND_COLUMN;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_RIGHT_OPERAND_FAL:
                    switch (character) {
                        case 'S':
                        case 's':
                            state = SQLQueryParserState.SQL_RIGHT_OPERAND_FALS;
                            rightOperand += character;
                            break;
                        default:
                            rightOperand += character;
                            state = SQLQueryParserState.SQL_RIGHT_OPERAND_COLUMN;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_RIGHT_OPERAND_FALS:
                    switch (character) {
                        case 'E':
                        case 'e':
                            state = SQLQueryParserState.SQL_RIGHT_OPERAND_FALSE;
                            rightOperand += character;
                            break;
                        default:
                            rightOperand += character;
                            state = SQLQueryParserState.SQL_RIGHT_OPERAND_COLUMN;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_RIGHT_OPERAND_FALSE:
                    switch (character) {
                        case ' ':
                        case '\t':
                        case '\r':
                        case '\n':
                            result.set(leftOperand,false);
                            state = SQLQueryParserState.SQL_WHITESPACE;
                            break;
                        case ',':
                            result.set(leftOperand,false);
                            state = SQLQueryParserState.SQL_;
                            break;
                        case ';':
                            result.set(leftOperand,false);
                            return result;
                        default:
                            rightOperand += character;
                            state = SQLQueryParserState.SQL_RIGHT_OPERAND_COLUMN;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_RIGHT_OPERAND_SINGLE_QUOTE:
                    switch (character) {
                        // The end of our quoted right operand
                        case '\'':
                            rightOperand += "'";
                            result.set(leftOperand, rightOperand);
                            state = SQLQueryParserState.SQL_WHITESPACE;
                            break;
                        default:
                            rightOperand += character;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_RIGHT_OPERAND_DOUBLE_QUOTE:
                    switch (character) {
                        // The end of our quoted right operand
                        case '"':
                            rightOperand += "'";
                            result.set(leftOperand, rightOperand);
                            state = SQLQueryParserState.SQL_WHITESPACE;
                            break;
                        default:
                            rightOperand += character;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_RIGHT_OPERAND_NUMBER:
                    switch (character) {
                        case '1':
                        case '2':
                        case '3':
                        case '4':
                        case '5':
                        case '6':
                        case '7':
                        case '8':
                        case '9':
                        case '0':
                            rightOperand += character;
                            break;
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            result.set(leftOperand,parseFloat(rightOperand));
                            state = SQLQueryParserState.SQL_WHITESPACE;
                            break;
                        case ';':
                            result.set(leftOperand,parseFloat(rightOperand));
                            return result;                            
                        case ',':
                            result.set(leftOperand,parseFloat(rightOperand));
                            state = SQLQueryParserState.SQL_;
                            break;
                        case '.':
                            state = SQLQueryParserState.SQL_RIGHT_OPERAND_NUMBER_DOT;
                            rightOperand += character;
                            break;
                        default:
                            state = SQLQueryParserState.SQL_ERROR;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_RIGHT_OPERAND_NUMBER_DOT:
                    switch (character) {
                        case '1':
                        case '2':
                        case '3':
                        case '4':
                        case '5':
                        case '6':
                        case '7':
                        case '8':
                        case '9':
                        case '0':
                            rightOperand += character;
                            break;
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            result.set(leftOperand,parseFloat(rightOperand));
                            state = SQLQueryParserState.SQL_WHITESPACE;
                            break;
                        case ';':
                            result.set(leftOperand,parseFloat(rightOperand));
                            return result;
                        case ',':
                            result.set(leftOperand,parseFloat(rightOperand));
                            state = SQLQueryParserState.SQL_;
                            break;
                        default:
                            state = SQLQueryParserState.SQL_ERROR;
                            break;
                    }
                    break;
            }
        }
        switch(state) {
            case SQLQueryParserState.SQL_RIGHT_OPERAND_FALSE:
                result.set(leftOperand,false);
                break;
            case SQLQueryParserState.SQL_RIGHT_OPERAND_NUMBER:
            case SQLQueryParserState.SQL_RIGHT_OPERAND_NUMBER_DOT:
                result.set(leftOperand,parseFloat(rightOperand));
                break;
            case SQLQueryParserState.SQL_RIGHT_OPERAND_TRUE:
                result.set(leftOperand,true);
                break;
            case SQLQueryParserState.SQL_RIGHT_OPERAND_NULL:
                result.set(leftOperand,null);
                break;
            case SQLQueryParserState.SQL_RIGHT_OPERAND_UNDEFINED:
                result.set(leftOperand,undefined);
                break;
        }
        return result;
    }

    _parseCreateTableColumns() {
        let result = {
            columns: [],
            dataTypes: []
        }
        let columnName = null;
        let dataType = null;
        let state = SQLQueryParserState.SQL_;
        let character = null;
        this._mark();
        while ((character = this._read()) != null) {
            switch (state) {
                case SQLQueryParserState.SQL_:
                    switch (character) {
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            break;
                        case '(':
                            state = SQLQueryParserState.SQL_LP;
                            break;
                        default:
                            this._toMark();
                            return null;
                    }
                    break;
                case SQLQueryParserState.SQL_LP:
                    switch (character) {
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                        case ',':
                            break;
                        case ')':
                            return result;
                        case '\'':
                            state = SQLQueryParserState.SQL_READ_SINGLE_QUOTE_VALUE;
                            columnName = "";
                            break;
                        case '"':
                            state = SQLQueryParserState.SQL_READ_DOUBLE_QUOTE_VALUE;
                            columnName = "";
                            break;
                        case '[':
                            state = SQLQueryParserState.SQL_READ_SQUARE_BRACKET_VALUE;
                            columnName = "";
                            break;
                        default:
                            state = SQLQueryParserState.SQL_READ_NO_QUOTE_VALUE;
                            columnName = "";
                            columnName += character;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_READ_SINGLE_QUOTE_VALUE:
                    switch (character) {
                        case '\'':
                            result.columns.push(columnName);
                            dataType = "";
                            state = SQLQueryParserState.SQL_READ_DATA_TYPE;
                            break;
                        default:
                            columnName += character;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_READ_DOUBLE_QUOTE_VALUE:
                    switch (character) {
                        case '"':
                            result.columns.push(columnName);
                            dataType = "";
                            state = SQLQueryParserState.SQL_READ_DATA_TYPE;
                            break;
                        default:
                            columnName += character;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_READ_SQUARE_BRACKET_VALUE:
                    switch (character) {
                        case ']':
                            result.columns.push(columnName);
                            dataType = "";
                            state = SQLQueryParserState.SQL_READ_DATA_TYPE;
                            break;
                        default:
                            columnName += character;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_READ_NO_QUOTE_VALUE:
                    switch (character) {
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            result.columns.push(columnName);
                            dataType = "";
                            state = SQLQueryParserState.SQL_READ_DATA_TYPE;
                            break;
                        default:
                            columnName += character;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_READ_DATA_TYPE:
                    switch(character) {
                        case ',':
                            result.dataTypes.push(dataType);
                            state = SQLQueryParserState.SQL_LP;
                            break;
                        case ')':
                            result.dataTypes.push(dataType);
                            return result;                            
                        default:
                            dataType += character;
                            break;
                    }
                    break;
                default:
                    break;
            }
        }
        this._toMark();
        return null;
    }

    _parseAlterTableRenameColumns() {
        let result = {
            from: [],
            to: []
        }
        let fromName = null;
        let toName = null;
        let state = SQLQueryParserState.SQL_;
        let character = null;
        while ((character = this._read()) != null) {
            switch (state) {
                case SQLQueryParserState.SQL_:
                    switch (character) {
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            break;
                        case '\'':
                            state = SQLQueryParserState.SQL_LEFT_OPERAND_SINGLE_QUOTE;
                            fromName = "";
                            break;
                        case '"':
                            state = SQLQueryParserState.SQL_LEFT_OPERAND_DOUBLE_QUOTE;
                            fromName = "";
                            break;
                        case '[':
                            state = SQLQueryParserState.SQL_LEFT_OPERAND_SQUARE_BRACKET;
                            fromName = "";
                            break;
                        default:
                            state = SQLQueryParserState.SQL_LEFT_OPERAND;
                            fromName = "";
                            fromName += character;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_LEFT_OPERAND:
                    switch (character) {
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            result.from.push(new SQLColumn(fromName));
                            fromName = "";
                            toName = "";
                            state = SQLQueryParserState.SQL_OPERATOR;
                            break;
                        default:
                            fromName += character;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_LEFT_OPERAND_SINGLE_QUOTE:
                    switch (character) {
                        case '\'':
                            result.from.push(new SQLColumn(fromName));
                            fromName = "";
                            toName = "";
                            state = SQLQueryParserState.SQL_OPERATOR;
                            break;
                        default:
                            fromName += character;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_LEFT_OPERAND_DOUBLE_QUOTE:
                    switch (character) {
                        case '"':
                            result.from.push(new SQLColumn(fromName));
                            fromName = "";
                            toName = "";
                            state = SQLQueryParserState.SQL_OPERATOR;
                            break;
                        default:
                            fromName += character;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_LEFT_OPERAND_SQUARE_BRACKET:
                    switch (character) {
                        case ']':
                            result.from.push(new SQLColumn(fromName));
                            fromName = "";
                            toName = "";
                            state = SQLQueryParserState.SQL_OPERATOR;
                            break;
                        default:
                            fromName += character;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_OPERATOR:
                    switch(character) {
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            break;
                        case 'T':
                        case 't':
                            state = SQLQueryParserState.SQL_OPERATOR_T;
                            toName += character;
                            break;
                        case '\'':
                            state = SQLQueryParserState.SQL_RIGHT_OPERAND_SINGLE_QUOTE
                            break;
                        case '"':
                            state = SQLQueryParserState.SQL_RIGHT_OPERAND_DOUBLE_QUOTE;
                            break;
                        case '[':
                            state = SQLQueryParserState.SQL_RIGHT_OPERAND_SQUARE_BRACKET;
                            break;
                        default:
                            state = SQLQueryParserState.SQL_RIGHT_OPERAND;
                            toName += character;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_OPERATOR_T:
                    switch(character) {
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            result.to.push(new SQLColumn(toName));
                            state = SQL_WHITESPACE;
                            break;
                        case ';':
                            result.to.push(new SQLColumn(toName));
                            return result;
                        case ',':
                            result.to.push(new SQLColumn(toName));
                            state = SQLQueryParserState.SQL_;
                            break;
                        case 'O':
                        case 'o':
                            state = SQLQueryParserState.SQL_OPERATOR_TO;
                            toName += character;
                            break;
                        case '\'':
                            state = SQLQueryParserState.SQL_RIGHT_OPERAND_SINGLE_QUOTE
                            break;
                        case '"':
                            state = SQLQueryParserState.SQL_RIGHT_OPERAND_DOUBLE_QUOTE;
                            break;
                        case '[':
                            state = SQLQueryParserState.SQL_RIGHT_OPERAND_SQUARE_BRACKET;
                            break;
                        default:
                            state = SQLQueryParserState.SQL_RIGHT_OPERAND;
                            toName += character;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_OPERATOR_TO:
                    switch(character) {
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            toName = "";
                            break;
                        case '\'':
                            toName = "";
                            state = SQLQueryParserState.SQL_RIGHT_OPERAND_SINGLE_QUOTE
                            break;
                        case '"':
                            toName = "";
                            state = SQLQueryParserState.SQL_RIGHT_OPERAND_DOUBLE_QUOTE;
                            break;
                        case '[':
                            toName = "";
                            state = SQLQueryParserState.SQL_RIGHT_OPERAND_SQUARE_BRACKET;
                            break;
                        default:
                            state = SQLQueryParserState.SQL_RIGHT_OPERAND;
                            toName += character;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_WHITESPACE:
                    switch(character) {
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            break;
                        case ';':
                            return result;
                        case ',':
                            state = SQLQueryParserState.SQL_;
                            break;
                        default:
                            this._unread();
                            return result;

                    }
                    break;
                case SQLQueryParserState.SQL_RIGHT_OPERAND:
                    switch(character) {
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            state = SQLQueryParserState.SQL_WHITESPACE;
                            break;
                        case ';':
                            result.to.push(new SQLColumn(toName));
                            return result;
                        case ',':
                            result.to.push(new SQLColumn(toName));
                            state = SQLQueryParserState.SQL_;
                            break;
                        default:
                            toName += character;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_RIGHT_OPERAND_SINGLE_QUOTE:
                    switch (character) {
                        case '\'':
                            result.to.push(new SQLColumn(toName));
                            state = SQLQueryParserState.SQL_WHITESPACE;
                            break;
                        default:
                            toName += character;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_RIGHT_OPERAND_DOUBLE_QUOTE:
                    switch (character) {
                        case '"':
                            result.to.push(new SQLColumn(toName));
                            state = SQLQueryParserState.SQL_WHITESPACE;
                            break;
                        default:
                            toName += character;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_RIGHT_OPERAND_SQUARE_BRACKET:
                    switch (character) {
                        case ']':
                            result.to.push(new SQLColumn(toName));
                            state = SQLQueryParserState.SQL_WHITESPACE;
                            break;
                        default:
                            toName += character;
                            break;
                    }
                    break;
                default:
                    break;
            }
        }
        switch(state) {
            case SQLQueryParserState.SQL_OPERATOR_T:
            case SQLQueryParserState.SQL_OPERATOR_TO:
            case SQLQueryParserState.SQL_RIGHT_OPERAND:
                result.to.push(new SQLColumn(toName));
                break;
        }
        return result;
    }

    _parseAlterTableAddorAlterColumns() {
        let result = {
            columns: [],
            dataTypes: []
        }
        let columnName = null;
        let dataType = null;
        let state = SQLQueryParserState.SQL_;
        let character = null;
        while ((character = this._read()) != null) {
            switch (state) {
                case SQLQueryParserState.SQL_:
                    switch (character) {
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            break;
                        case '\'':
                            state = SQLQueryParserState.SQL_READ_SINGLE_QUOTE_VALUE;
                            columnName = "";
                            break;
                        case '"':
                            state = SQLQueryParserState.SQL_READ_DOUBLE_QUOTE_VALUE;
                            columnName = "";
                            break;
                        case '[':
                            state = SQLQueryParserState.SQL_READ_SQUARE_BRACKET_VALUE;
                            columnName = "";
                            break;
                        default:
                            state = SQLQueryParserState.SQL_READ_NO_QUOTE_VALUE;
                            columnName = "";
                            columnName += character;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_READ_SINGLE_QUOTE_VALUE:
                    switch (character) {
                        case '\'':
                            result.columns.push(columnName);
                            columnName = "";
                            dataType = "";
                            state = SQLQueryParserState.SQL_READ_DATA_TYPE;
                            break;
                        default:
                            columnName += character;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_READ_DOUBLE_QUOTE_VALUE:
                    switch (character) {
                        case '"':
                            result.columns.push(columnName);
                            columnName = "";
                            dataType = "";
                            state = SQLQueryParserState.SQL_READ_DATA_TYPE;
                            break;
                        default:
                            columnName += character;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_READ_SQUARE_BRACKET_VALUE:
                    switch (character) {
                        case ']':
                            result.columns.push(columnName);
                            columnName = "";
                            dataType = "";
                            state = SQLQueryParserState.SQL_READ_DATA_TYPE;
                            break;
                        default:
                            columnName += character;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_READ_NO_QUOTE_VALUE:
                    switch (character) {
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            result.columns.push(columnName);
                            columnName = "";
                            dataType = "";
                            state = SQLQueryParserState.SQL_READ_DATA_TYPE;
                            break;
                        default:
                            columnName += character;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_READ_DATA_TYPE:
                    switch(character) {
                        case ';':
                            result.dataTypes.push(dataType);
                            return result;
                        case ',':
                            result.dataTypes.push(dataType);
                            dataType = "";
                            state = SQLQueryParserState.SQL_;
                            break;
                        default:
                            dataType += character;
                            break;
                    }
                    break;
                default:
                    break;
            }
        }
        switch(state) {
            case SQLQueryParserState.SQL_READ_NO_QUOTE_VALUE:
                if(columnName.length > 0) {
                    result.columns.push(columnName);
                }
                break;
            case SQLQueryParserState.SQL_READ_DATA_TYPE:
                if(dataType.length > 0) {
                    result.dataTypes.push(dataType);
                }
                break;            
        }
        return result;
    }

    _parseStringsBetweenParenthesis(_noQuotesAreColumns = false, _squareBracketsAreArrays = false) {
    	let values = [];
        let value = null;
        let state = SQLQueryParserState.SQL_;
        let character = null;
        this._mark();
        while ((character = this._read()) != null) {
            switch (state) {
                case SQLQueryParserState.SQL_:
                    switch (character) {
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            break;
                        case '(':
                            state = SQLQueryParserState.SQL_LP;
                            break;
                        default:
                            this._toMark();
		                    return null;
                    }
                    break;
                case SQLQueryParserState.SQL_WHITESPACE:
                    switch (character) {
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            break;
                        case ',':
                            state = SQLQueryParserState.SQL_LP;
                            break;
                        case ')':
                            return values;
                        default:
                            this._toMark();
                            return null;
                    }
                    break;
                case SQLQueryParserState.SQL_LP:
                    switch (character) {
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                        case ',':
                            break;
                        case ')':
                            return values;
                        case '\'':
                            state = SQLQueryParserState.SQL_READ_SINGLE_QUOTE_VALUE;
                            value = "";
                            break;
                        case '"':
                            state = SQLQueryParserState.SQL_READ_DOUBLE_QUOTE_VALUE;
                            value = "";
                            break;
                        case '[':
                            if(_squareBracketsAreArrays) {
                                this._unread();
                                value = this._parseArray();
                                values.push(value);
                                state = SQLQueryParserState.SQL_WHITESPACE;
                            } else {
                                state = SQLQueryParserState.SQL_READ_SQUARE_BRACKET_VALUE;
                                value = "";
                            }
                            break;
                        case 'F':
                        case 'f':
                            state = SQLQueryParserState.SQL_READ_NO_QUOTE_VALUE_F;
                            value = '' + character;
                            break;
                        case 'N':
                        case 'n':
                            state = SQLQueryParserState.SQL_READ_NO_QUOTE_VALUE_N;
                            value = '' + character;
                            break;
                        case 'T':
                        case 't':
                            state = SQLQueryParserState.SQL_READ_NO_QUOTE_VALUE_T;
                            value = '' + character;
                            break;
                        case '1':
                        case '2':
                        case '3':
                        case '4':
                        case '5':
                        case '6':
                        case '7':
                        case '8':
                        case '9':
                        case '-':
                            state = SQLQueryParserState.SQL_READ_NO_QUOTE_VALUE_NUMBER;
                            value = '' + character;
                            break;
                        default:
                            state = SQLQueryParserState.SQL_READ_NO_QUOTE_VALUE;
                            value = "";
                            value += character;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_READ_SINGLE_QUOTE_VALUE:
                    switch (character) {
                        case '\'':
                            values.push(value);
                            state = SQLQueryParserState.SQL_LP;
                            break;
                        default:
                            value += character;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_READ_DOUBLE_QUOTE_VALUE:
                    switch (character) {
                        case '"':
                            values.push(value);
                            state = SQLQueryParserState.SQL_LP;
                            break;
                        default:
                            value += character;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_READ_SQUARE_BRACKET_VALUE:
                    switch (character) {
                        case ']':
                            values.push(value);
                            state = SQLQueryParserState.SQL_LP;
                            break;
                        default:
                            value += character;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_READ_NO_QUOTE_VALUE_NUMBER:
                    switch(character) {
                        case ',':
                            values.push(parseInt(value));
                            state = SQLQueryParserState.SQL_LP;
                            break;
                        case ')':
                            values.push(parseInt(value));
                            return values;
                        case '.':
                            value += character;
                            state = SQLQueryParserState.SQL_READ_NO_QUOTE_VALUE_NUMBER_DOT;
                            break;
                        case '1':
                        case '2':
                        case '3':
                        case '4':
                        case '5':
                        case '6':
                        case '7':
                        case '8':
                        case '9':
                        case '0':
                            value += character;
                            break;
                        default:
                            state = SQLQueryParserState.SQL_READ_NO_QUOTE_VALUE;
                            value += character;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_READ_NO_QUOTE_VALUE_NUMBER_DOT:
                    switch(character) {
                        case ',':
                            values.push(parseFloat(value));
                            state = SQLQueryParserState.SQL_LP;
                            break;
                        case ')':
                            values.push(parseFloat(value));
                            return values;
                        case '1':
                        case '2':
                        case '3':
                        case '4':
                        case '5':
                        case '6':
                        case '7':
                        case '8':
                        case '9':
                        case '0':
                            value += character;
                            break;
                        default:
                            state = SQLQueryParserState.SQL_READ_NO_QUOTE_VALUE;
                            value += character;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_READ_NO_QUOTE_VALUE_F:
                    switch (character) {
                        case ',':
                            values.push(value);
                            state = SQLQueryParserState.SQL_LP;
                            break;
                        case ')':
                            values.push(value);
                            return values;
                        case 'A':
                        case 'a':
                            state = SQLQueryParserState.SQL_READ_NO_QUOTE_VALUE_FA;
                            value += character;
                            break;
                        default:
                            state = SQLQueryParserState.SQL_READ_NO_QUOTE_VALUE;
                            value += character;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_READ_NO_QUOTE_VALUE_FA:
                    switch (character) {
                        case ',':
                            values.push(value);
                            state = SQLQueryParserState.SQL_LP;
                            break;
                        case ')':
                            values.push(value);
                            return values;
                        case 'L':
                        case 'l':
                            state = SQLQueryParserState.SQL_READ_NO_QUOTE_VALUE_FAL;
                            value += character;
                            break;
                        default:
                            state = SQLQueryParserState.SQL_READ_NO_QUOTE_VALUE;
                            value += character;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_READ_NO_QUOTE_VALUE_FAL:
                    switch (character) {
                        case ',':
                            values.push(value);
                            state = SQLQueryParserState.SQL_LP;
                            break;
                        case ')':
                            values.push(value);
                            return values;
                        case 'S':
                        case 's':
                            state = SQLQueryParserState.SQL_READ_NO_QUOTE_VALUE_FALS;
                            value += character;
                            break;
                        default:
                            state = SQLQueryParserState.SQL_READ_NO_QUOTE_VALUE;
                            value += character;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_READ_NO_QUOTE_VALUE_FALS:
                    switch (character) {
                        case ',':
                            values.push(value);
                            state = SQLQueryParserState.SQL_LP;
                            break;
                        case ')':
                            values.push(value);
                            return values;
                        case 'E':
                        case 'e':
                            state = SQLQueryParserState.SQL_READ_NO_QUOTE_VALUE_FALSE;
                            value += character;
                            break;
                        default:
                            state = SQLQueryParserState.SQL_READ_NO_QUOTE_VALUE;
                            value += character;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_READ_NO_QUOTE_VALUE_FALSE:
                    switch (character) {
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            break;
                        case ',':
                            values.push(false);
                            state = SQLQueryParserState.SQL_LP;
                            break;
                        case ')':
                            values.push(false);
                            return values;
                        default:
                            state = SQLQueryParserState.SQL_READ_NO_QUOTE_VALUE;
                            value += character;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_READ_NO_QUOTE_VALUE_N:
                    switch (character) {
                        case ',':
                            values.push(value);
                            state = SQLQueryParserState.SQL_LP;
                            break;
                        case ')':
                            values.push(value);
                            return values;
                        case 'U':
                        case 'u':
                            state = SQLQueryParserState.SQL_READ_NO_QUOTE_VALUE_NU;
                            value += character;
                            break;
                        default:
                            state = SQLQueryParserState.SQL_READ_NO_QUOTE_VALUE;
                            value += character;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_READ_NO_QUOTE_VALUE_NU:
                    switch (character) {
                        case ',':
                            values.push(value);
                            state = SQLQueryParserState.SQL_LP;
                            break;
                        case ')':
                            values.push(value);
                            return values;
                        case 'L':
                        case 'l':
                            state = SQLQueryParserState.SQL_READ_NO_QUOTE_VALUE_NUL;
                            value += character;
                            break;
                        default:
                            state = SQLQueryParserState.SQL_READ_NO_QUOTE_VALUE;
                            value += character;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_READ_NO_QUOTE_VALUE_NUL:
                    switch (character) {
                        case ',':
                            values.push(value);
                            state = SQLQueryParserState.SQL_LP;
                            break;
                        case ')':
                            values.push(value);
                            return values;
                        case 'L':
                        case 'l':
                            state = SQLQueryParserState.SQL_READ_NO_QUOTE_VALUE_NULL;
                            value += character;
                            break;
                        default:
                            state = SQLQueryParserState.SQL_READ_NO_QUOTE_VALUE;
                            value += character;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_READ_NO_QUOTE_VALUE_NULL:
                    switch (character) {
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            break;
                        case ',':
                            values.push(null);
                            state = SQLQueryParserState.SQL_LP;
                            break;
                        case ')':
                            values.push(null);
                            return values;
                        default:
                            state = SQLQueryParserState.SQL_READ_NO_QUOTE_VALUE;
                            value += character;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_READ_NO_QUOTE_VALUE_T:
                    switch (character) {
                        case ',':
                            values.push(value);
                            state = SQLQueryParserState.SQL_LP;
                            break;
                        case ')':
                            values.push(value);
                            return values;
                        case 'R':
                        case 'r':
                            state = SQLQueryParserState.SQL_READ_NO_QUOTE_VALUE_TR;
                            value += character;
                            break;
                        default:
                            state = SQLQueryParserState.SQL_READ_NO_QUOTE_VALUE;
                            value += character;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_READ_NO_QUOTE_VALUE_TR:
                    switch (character) {
                        case ',':
                            values.push(value);
                            state = SQLQueryParserState.SQL_LP;
                            break;
                        case ')':
                            values.push(value);
                            return values;
                        case 'U':
                        case 'u':
                            state = SQLQueryParserState.SQL_READ_NO_QUOTE_VALUE_TRU;
                            value += character;
                            break;
                        default:
                            state = SQLQueryParserState.SQL_READ_NO_QUOTE_VALUE;
                            value += character;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_READ_NO_QUOTE_VALUE_TRU:
                    switch (character) {
                        case ',':
                            values.push(value);
                            state = SQLQueryParserState.SQL_LP;
                            break;
                        case ')':
                            values.push(value);
                            return values;
                        case 'E':
                        case 'e':
                            state = SQLQueryParserState.SQL_READ_NO_QUOTE_VALUE_TRUE;
                            value += character;
                            break;
                        default:
                            state = SQLQueryParserState.SQL_READ_NO_QUOTE_VALUE;
                            value += character;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_READ_NO_QUOTE_VALUE_TRUE:
                    switch (character) {
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            break;
                        case ',':
                            values.push(true);
                            state = SQLQueryParserState.SQL_LP;
                            break;
                        case ')':
                            values.push(true);
                            return values;
                        default:
                            state = SQLQueryParserState.SQL_READ_NO_QUOTE_VALUE;
                            value += character;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_READ_NO_QUOTE_VALUE:
                    switch (character) {
                        case ',':
                            value = value.trim();
                            if(_noQuotesAreColumns) {
                                values.push(new SQLColumn(value));
                            } else {
                                values.push(value);
                            }
                            state = SQLQueryParserState.SQL_LP;
                            break;
                        case ')':
                            value = value.trim();
                            if(_noQuotesAreColumns) {
                                values.push(new SQLColumn(value));
                            } else {
                                values.push(value);
                            }
                            return values;
                        default:
                            value += character;
                            break;
                    }
                    break;
                default:
                    break;
            }
        }
        this._toMark();
        return null;
    }

    _parseArray(_noQuotesAreColumns = false) {
        let values = [];
        let value = null;
        let state = SQLQueryParserState.SQL_;
        let character = null;
        this._mark();
        while ((character = this._read()) != null) {
            switch (state) {
                case SQLQueryParserState.SQL_:
                    switch (character) {
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            break;
                        case '[':
                            state = SQLQueryParserState.SQL_VALUES;
                            value = "";
                            break;
                        default:
                            this._toMark();
                            return null;
                    }
                    break;
                case SQLQueryParserState.SQL_WHITESPACE:
                    switch (character) {
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            break;
                        case ']':
                            return values;
                        case ',':
                            state = SQLQueryParserState.SQL_VALUES;
                            value = "";
                            break;
                        default:
                            this._toMark();
                            return null;
                    }
                    break;
                case SQLQueryParserState.SQL_VALUES:
                    switch(character) {
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                        case ',':
                            break;
                        case '\'':
                            state = SQLQueryParserState.SQL_READ_SINGLE_QUOTE_VALUE;
                            value = "";
                            break;
                        case '"':
                            state = SQLQueryParserState.SQL_READ_DOUBLE_QUOTE_VALUE;
                            value = "";
                            break;
                        case 'F':
                        case 'f':
                            state = SQLQueryParserState.SQL_READ_NO_QUOTE_VALUE_F;
                            value = '' + character;
                            break;
                        case 'N':
                        case 'n':
                            state = SQLQueryParserState.SQL_READ_NO_QUOTE_VALUE_N;
                            value = '' + character;
                            break;
                        case 'T':
                        case 't':
                            state = SQLQueryParserState.SQL_READ_NO_QUOTE_VALUE_T;
                            value = '' + character;
                            break;
                        case '1':
                        case '2':
                        case '3':
                        case '4':
                        case '5':
                        case '6':
                        case '7':
                        case '8':
                        case '9':
                        case '-':
                            state = SQLQueryParserState.SQL_READ_NO_QUOTE_VALUE_NUMBER;
                            value = '' + character;
                            break;
                        case ']':
                            return values;
                        default:
                            state = SQLQueryParserState.SQL_READ_NO_QUOTE_VALUE;
                            value = "";
                            value += character;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_READ_SINGLE_QUOTE_VALUE:
                    switch (character) {
                        case '\'':
                            values.push(value);
                            state = SQLQueryParserState.SQL_WHITESPACE;
                            break;
                        default:
                            value += character;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_READ_DOUBLE_QUOTE_VALUE:
                    switch (character) {
                        case '"':
                            values.push(value);
                            state = SQLQueryParserState.SQL_WHITESPACE;
                            break;
                        default:
                            value += character;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_READ_NO_QUOTE_VALUE_NUMBER:
                    switch(character) {
                        case ',':
                            values.push(parseInt(value));
                            state = SQLQueryParserState.SQL_VALUES;
                            break;
                        case ']':
                            values.push(parseInt(value));
                            return values;
                        case '.':
                            value += character;
                            state = SQLQueryParserState.SQL_READ_NO_QUOTE_VALUE_NUMBER_DOT;
                            break;
                        case '1':
                        case '2':
                        case '3':
                        case '4':
                        case '5':
                        case '6':
                        case '7':
                        case '8':
                        case '9':
                        case '0':
                            value += character;
                            break;
                        default:
                            state = SQLQueryParserState.SQL_READ_NO_QUOTE_VALUE;
                            value += character;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_READ_NO_QUOTE_VALUE_NUMBER_DOT:
                    switch(character) {
                        case ',':
                            values.push(parseFloat(value));
                            state = SQLQueryParserState.SQL_VALUES;
                            break;
                        case ']':
                            values.push(parseFloat(value));
                            return values;
                        case '1':
                        case '2':
                        case '3':
                        case '4':
                        case '5':
                        case '6':
                        case '7':
                        case '8':
                        case '9':
                        case '0':
                            value += character;
                            break;
                        default:
                            state = SQLQueryParserState.SQL_READ_NO_QUOTE_VALUE;
                            value += character;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_READ_NO_QUOTE_VALUE_F:
                    switch (character) {
                        case ',':
                            values.push(value);
                            state = SQLQueryParserState.SQL_VALUES;
                            break;
                        case ']':
                            values.push(value);
                            return values;
                        case 'A':
                        case 'a':
                            state = SQLQueryParserState.SQL_READ_NO_QUOTE_VALUE_FA;
                            value += character;
                            break;
                        default:
                            state = SQLQueryParserState.SQL_READ_NO_QUOTE_VALUE;
                            value += character;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_READ_NO_QUOTE_VALUE_FA:
                    switch (character) {
                        case ',':
                            values.push(value);
                            state = SQLQueryParserState.SQL_VALUES;
                            break;
                        case ']':
                            values.push(value);
                            return values;
                        case 'L':
                        case 'l':
                            state = SQLQueryParserState.SQL_READ_NO_QUOTE_VALUE_FAL;
                            value += character;
                            break;
                        default:
                            state = SQLQueryParserState.SQL_READ_NO_QUOTE_VALUE;
                            value += character;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_READ_NO_QUOTE_VALUE_FAL:
                    switch (character) {
                        case ',':
                            values.push(value);
                            state = SQLQueryParserState.SQL_VALUES;
                            break;
                        case ']':
                            values.push(value);
                            return values;
                        case 'S':
                        case 's':
                            state = SQLQueryParserState.SQL_READ_NO_QUOTE_VALUE_FALS;
                            value += character;
                            break;
                        default:
                            state = SQLQueryParserState.SQL_READ_NO_QUOTE_VALUE;
                            value += character;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_READ_NO_QUOTE_VALUE_FALS:
                    switch (character) {
                        case ',':
                            values.push(value);
                            state = SQLQueryParserState.SQL_VALUES;
                            break;
                        case ']':
                            values.push(value);
                            return values;
                        case 'E':
                        case 'e':
                            state = SQLQueryParserState.SQL_READ_NO_QUOTE_VALUE_FALSE;
                            value += character;
                            break;
                        default:
                            state = SQLQueryParserState.SQL_READ_NO_QUOTE_VALUE;
                            value += character;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_READ_NO_QUOTE_VALUE_FALSE:
                    switch (character) {
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            break;
                        case ',':
                            values.push(false);
                            state = SQLQueryParserState.SQL_VALUES;
                            break;
                        case ']':
                            values.push(false);
                            return values;
                        default:
                            state = SQLQueryParserState.SQL_READ_NO_QUOTE_VALUE;
                            value += character;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_READ_NO_QUOTE_VALUE_N:
                    switch (character) {
                        case ',':
                            values.push(value);
                            state = SQLQueryParserState.SQL_VALUES;
                            break;
                        case ']':
                            values.push(value);
                            return values;
                        case 'U':
                        case 'u':
                            state = SQLQueryParserState.SQL_READ_NO_QUOTE_VALUE_NU;
                            value += character;
                            break;
                        default:
                            state = SQLQueryParserState.SQL_READ_NO_QUOTE_VALUE;
                            value += character;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_READ_NO_QUOTE_VALUE_NU:
                    switch (character) {
                        case ',':
                            values.push(value);
                            state = SQLQueryParserState.SQL_VALUES;
                            break;
                        case ']':
                            values.push(value);
                            return values;
                        case 'L':
                        case 'l':
                            state = SQLQueryParserState.SQL_READ_NO_QUOTE_VALUE_NUL;
                            value += character;
                            break;
                        default:
                            state = SQLQueryParserState.SQL_READ_NO_QUOTE_VALUE;
                            value += character;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_READ_NO_QUOTE_VALUE_NUL:
                    switch (character) {
                        case ',':
                            values.push(value);
                            state = SQLQueryParserState.SQL_VALUES;
                            break;
                        case ']':
                            values.push(value);
                            return values;
                        case 'L':
                        case 'l':
                            state = SQLQueryParserState.SQL_READ_NO_QUOTE_VALUE_NULL;
                            value += character;
                            break;
                        default:
                            state = SQLQueryParserState.SQL_READ_NO_QUOTE_VALUE;
                            value += character;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_READ_NO_QUOTE_VALUE_NULL:
                    switch (character) {
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            break;
                        case ',':
                            values.push(null);
                            state = SQLQueryParserState.SQL_VALUES;
                            break;
                        case ']':
                            values.push(null);
                            return values;
                        default:
                            state = SQLQueryParserState.SQL_READ_NO_QUOTE_VALUE;
                            value += character;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_READ_NO_QUOTE_VALUE_T:
                    switch (character) {
                        case ',':
                            values.push(value);
                            state = SQLQueryParserState.SQL_VALUES;
                            break;
                        case ']':
                            values.push(value);
                            return values;
                        case 'R':
                        case 'r':
                            state = SQLQueryParserState.SQL_READ_NO_QUOTE_VALUE_TR;
                            value += character;
                            break;
                        default:
                            state = SQLQueryParserState.SQL_READ_NO_QUOTE_VALUE;
                            value += character;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_READ_NO_QUOTE_VALUE_TR:
                    switch (character) {
                        case ',':
                            values.push(value);
                            state = SQLQueryParserState.SQL_VALUES;
                            break;
                        case ']':
                            values.push(value);
                            return values;
                        case 'U':
                        case 'u':
                            state = SQLQueryParserState.SQL_READ_NO_QUOTE_VALUE_TRU;
                            value += character;
                            break;
                        default:
                            state = SQLQueryParserState.SQL_READ_NO_QUOTE_VALUE;
                            value += character;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_READ_NO_QUOTE_VALUE_TRU:
                    switch (character) {
                        case ',':
                            values.push(value);
                            state = SQLQueryParserState.SQL_VALUES;
                            break;
                        case ']':
                            values.push(value);
                            return values;
                        case 'E':
                        case 'e':
                            state = SQLQueryParserState.SQL_READ_NO_QUOTE_VALUE_TRUE;
                            value += character;
                            break;
                        default:
                            state = SQLQueryParserState.SQL_READ_NO_QUOTE_VALUE;
                            value += character;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_READ_NO_QUOTE_VALUE_TRUE:
                    switch (character) {
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            break;
                        case ',':
                            values.push(true);
                            state = SQLQueryParserState.SQL_VALUES;
                            break;
                        case ']':
                            values.push(true);
                            return values;
                        default:
                            state = SQLQueryParserState.SQL_READ_NO_QUOTE_VALUE;
                            value += character;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_READ_NO_QUOTE_VALUE:
                    switch (character) {
                        case ',':
                            value = value.trim();
                            if(_noQuotesAreColumns) {
                                values.push(new SQLColumn(value));
                            } else {
                                values.push(value);
                            }
                            state = SQLQueryParserState.SQL_VALUES;
                            break;
                        case ']':
                            value = value.trim();
                            if(_noQuotesAreColumns) {
                                values.push(new SQLColumn(value));
                            } else {
                                values.push(value);
                            }
                            return values;
                        default:
                            value += character;
                            break;
                    }
                    break;
                default:
                    break;
            }
        }
        this._toMark();
        return null;
    }

    _parseGroupBy() {
        let column = null;
        let result = new SQLGroupBy();
        let state = SQLQueryParserState.SQL_;
        let character = null;
        while ((character = this._read()) != null) {
            switch (state) {
                case SQLQueryParserState.SQL_:
                    switch (character) {
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                        case ',':
                            break;
                        case ';':
                            this._unread();
                            return columns;
                        default:
                            column = character;
                            state = SQLQueryParserState.SQL_COLUMN;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_COLUMN:
                    switch(character) {
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            result.addColumn(column);
                            column = null;
                            state = SQLQueryParserState.SQL_WHITESPACE;
                            break;
                        case ',':
                            result.addColumn(column);
                            column = null;
                            state = SQLQueryParserState.SQL_;
                            break;
                        case ';':
                            this._unread();
                            result.addColumn(column);
                            return result;
                        default:
                            column += character;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_WHITESPACE:
                    switch(character) {
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            break;
                        case ',':
                            column = null;
                            state = SQLQueryParserState.SQL_;
                            break;
                        default:
                            this._unread();
                            return result;
                    }
                    break;
                default:
                    return result;
            }
        }
        if(column != null) {
            result.addColumn(column);
        }
        return result;
    }

    _parseOrderBy() {
        let column = null;
        let state = SQLQueryParserState.SQL_;
        let result = new SQLOrderBy();
        let character = null;
        while ((character = this._read()) != null) {
            switch (state) {
                case SQLQueryParserState.SQL_:
                    switch (character) {
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                        case ',':
                            break;
                        case ';':
                            this._unread();
                            return result;
                        default:
                            column = character;
                            state = SQLQueryParserState.SQL_COLUMN;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_COLUMN:
                    switch(character) {
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            result.addColumn(column);
                            column = null;
                            state = SQLQueryParserState.SQL_WHITESPACE;
                            break;
                        case ',':
                            result.addColumn(column);
                            column = null;
                            state = SQLQueryParserState.SQL_;
                            break;
                        case ';':
                            this._unread();
                            result.addColumn(column);
                            return result;
                        default:
                            column += character;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_A:
                    switch(character) {
                        case 'S':
                        case 's':
                            state = SQLQueryParserState.SQL_AS;
                            break;
                        default:
                            return result;
                    }
                    break;
                case SQLQueryParserState.SQL_AS:
                    switch(character) {
                        case 'C':
                        case 'c':
                            result.setOrder('ASC');
                            state = SQLQueryParserState.SQL_ASC;
                            break;
                        default:
                            return result;
                    }
                    break;
                case SQLQueryParserState.SQL_ASC:
                    switch(character) {
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            result.setOrder('ASC');
                            return result;
                        case ';':
                            result.setOrder('ASC');
                            this._unread();
                            return result;
                        default:
                            return result;
                    }
                    break;
                case SQLQueryParserState.SQL_D:
                    switch(character) {
                        case 'E':
                        case 'e':
                            state = SQLQueryParserState.SQL_DE;
                            break;
                        default:
                            return result;
                    }
                    break;
                case SQLQueryParserState.SQL_DE:
                    switch(character) {
                        case 'S':
                        case 's':
                            state = SQLQueryParserState.SQL_DES;
                            break;
                        default:
                            return result;
                    }
                    break;
                case SQLQueryParserState.SQL_DES:
                    switch(character) {
                        case 'C':
                        case 'c':
                            result.setOrder('DESC');
                            state = SQLQueryParserState.SQL_DESC;
                            break;
                        default:
                            return result;
                    }
                    break;
                case SQLQueryParserState.SQL_DESC:
                    switch(character) {
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            result.setOrder('DESC');
                            return result;
                        case ';':
                            result.setOrder('DESC');
                            this._unread();
                            return result;
                        default:
                            return result;
                    }
                    break;
                case SQLQueryParserState.SQL_WHITESPACE:
                    switch(character) {
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            break;
                        case 'A':
                        case 'a':
                            state = SQLQueryParserState.SQL_A;
                            break;
                        case 'D':
                        case 'd':
                            state = SQLQueryParserState.SQL_D;
                            break;
                        case ',':
                            column = null;
                            state = SQLQueryParserState.SQL_;
                            break;
                        default:
                            this._unread();
                            return result;        
                    }
                    break;
                default:
                    return result;
            }
        }
        if(column != null) {
            result.addColumn(column);
        }
        return result;
    }

    _parseCondition() {
        let sqlCondition = null;
        let sqlConditionOne = null;
        let sqlConditionTwo = null;
        let state = SQLQueryParserState.SQL_;
        let character = null;
        while ((character = this._read()) != null) {
            switch (state) {
                case SQLQueryParserState.SQL_:
                    switch (character) {
                        // Remove whitespace
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            break;
                        case ';':
                            return null;
                        case '(':
                            sqlCondition = this._parseCondition();
                            if(sqlCondition === null) {
                                state = SQLQueryParserState.SQL_ERROR;
                            } else {
                                state = SQLQueryParserState.SQL_LP_CONDITION;
                            }
                            break;
                        // Start of a condition
                        default:
                            this._unread();
                            sqlCondition = this._parseSingleCondition();
                            if(sqlCondition === null) {
                                state = SQLQueryParserState.SQL_ERROR;
                            } else {
                                this._mark();
                                state = SQLQueryParserState.SQL_OPERATOR;
                            }
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_LP_CONDITION:
                    switch (character) {
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            break;
                        case ')':
                            state = SQLQueryParserState.SQL_OPERATOR;
                            break;
                        default:
                            state = SQLQueryParserState.SQL_ERROR;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_OPERATOR:
                    switch (character) {
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            break;
                        case ';':
                        case ')':
                            this._unread();
                            return sqlCondition;
                        // Potential AND operator
                        case 'A':
                        case 'a':
                            state = SQLQueryParserState.SQL_A;
                            break;
                        // Potential AND operator specified as &&
                        case '&':
                            state = SQLQueryParserState.SQL_AMPERSAND;
                            break;
                        // Potention OR operator specified as ||
                        case '|':
                            state = SQLQueryParserState.SQL_PIPE;
                            break;
                        // Potential GROUP BY
                        case 'G':
                        case 'g':
                            this._unread();
                            return sqlCondition;
                        // Potential OR operator or ORDER BY 
                        case 'O':
                        case 'o':
                            state = SQLQueryParserState.SQL_O;
                            break;
                        default:
                            state = SQLQueryParserState.SQL_ERROR;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_A:
                    switch (character) {
                        case 'N':
                        case 'n':
                            state = SQLQueryParserState.SQL_AN;
                            break;
                        default:
                            state = SQLQueryParserState.SQL_ERROR;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_O:
                    switch (character) {
                        case 'R':
                        case 'r':
                            state = SQLQueryParserState.SQL_OR;
                            break;
                        default:
                            state = SQLQueryParserState.SQL_ERROR;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_AN:
                    switch (character) {
                        case 'D':
                        case 'd':
                            state = SQLQueryParserState.SQL_AND;
                            break;
                        default:
                            state = SQLQueryParserState.SQL_ERROR;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_AMPERSAND:
                    switch (character) {
                        case '&':
                            sqlConditionOne = sqlCondition;
                            sqlConditionTwo = this._parseCondition();
                            if(sqlCondition === null) {
                                state = SQLQueryParserState.SQL_ERROR;
                            } else {
                                sqlCondition = new SQLAndCondition(sqlConditionOne, sqlConditionTwo);
                                state = SQLQueryParserState.SQL_OPERATOR;
                            }
                            break;
                        default:
                            state = SQLQueryParserState.SQL_ERROR;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_PIPE:
                    switch (character) {
                        case '|':
                            sqlConditionOne = sqlCondition;
                            sqlConditionTwo = this._parseCondition();
                            if(sqlConditionTwo === null) {
                                state = SQLQueryParserState.SQL_ERROR;
                            } else {
                                sqlCondition = new SQLOrCondition(sqlConditionOne, sqlConditionTwo);
                                state = SQLQueryParserState.SQL_OPERATOR;
                            }
                            break;
                        default:
                            state = SQLQueryParserState.SQL_ERROR;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_OR:
                    switch (character) {
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            sqlConditionOne = sqlCondition;
                            sqlConditionTwo = this._parseCondition();
                            if(sqlConditionTwo === null) {
                                state = SQLQueryParserState.SQL_ERROR;
                            } else {
                                sqlCondition = new SQLOrCondition(sqlConditionOne, sqlConditionTwo);
                                state = SQLQueryParserState.SQL_OPERATOR;
                            }
                            break;
                        case 'D':
                        case 'd':
                            // Potential start of order by
                            this._unread();
                            this._unread();
                            this._unread();
                            return sqlCondition;
                        default:
                            state = SQLQueryParserState.SQL_ERROR;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_AND:
                    switch (character) {
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            sqlConditionOne = sqlCondition;
                            sqlConditionTwo = this._parseCondition();
                            if(sqlCondition === null) {
                                state = SQLQueryParserState.SQL_ERROR;
                            } else {
                                sqlCondition = new SQLAndCondition(sqlConditionOne, sqlConditionTwo);
                                state = SQLQueryParserState.SQL_OPERATOR;
                            }
                            break;
                        default:
                            state = SQLQueryParserState.SQL_ERROR;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_ERROR:
                    throw new Error("Error in parsing condition.");
                // Should never be reached!
                default:
                    break;
            }
        }
        return sqlCondition;
    }

    _parseSingleCondition() {
        let leftOperand = '';
        let operator = null;
        let rightOperand = null;
        let state = SQLQueryParserState.SQL_LEFT_OPERAND;
        let character = null;
        while ((character = this._read()) != null) {
            switch (state) {
                case SQLQueryParserState.SQL_LEFT_OPERAND:
                    switch (character) {
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            state = SQLQueryParserState.SQL_OPERATOR;
                            break;
                        // Start of the operator.
                        // We are finished reading
                        // the left operand
                        case '<':
                            state = SQLQueryParserState.SQL_OPERATOR_LT;
                            break;
                        case '>':
                            state = SQLQueryParserState.SQL_OPERATOR_GT;
                            break;
                        case '=':
                            state = SQLQueryParserState.SQL_RIGHT_OPERAND;
                            operator = OPERATOR.EQUAL;
                            break;
                        case '!':
                            state = SQLQueryParserState.SQL_OPERATOR_EX;
                            break;
                        case '[':
                            state = SQLQueryParserState.SQL_LEFT_OPERAND_SQUARE_BRACKET;
                            break;
                        case '"':
                            state = SQLQueryParserState.SQL_LEFT_OPERAND_DOUBLE_QUOTE;
                            break;
                        case '\'':
                            state = SQLQueryParserState.SQL_LEFT_OPERAND_SINGLE_QUOTE;
                            break;
                        // Otherwise we assume all characters
                        // belong to our left operand
                        default:
                            leftOperand += character;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_LEFT_OPERAND_SQUARE_BRACKET:
                    switch (character) {
                        case ']':
                            state = SQLQueryParserState.SQL_OPERATOR;
                            break;
                        default:
                            leftOperand += character;
                            break;
                    }                    
                    break;
                case SQLQueryParserState.SQL_LEFT_OPERAND_SINGLE_QUOTE:
                    switch (character) {
                        case '\'':
                            state = SQLQueryParserState.SQL_OPERATOR;
                            break;
                        default:
                            leftOperand += character;
                            break;
                    }                    
                    break;
                case SQLQueryParserState.SQL_LEFT_OPERAND_DOUBLE_QUOTE:
                    switch (character) {
                        case '"':
                            state = SQLQueryParserState.SQL_OPERATOR;
                            break;
                        default:
                            leftOperand += character;
                            break;
                    }                    
                    break;
                case SQLQueryParserState.SQL_OPERATOR_B:
                    switch(character) {
                        case 'E':
                        case 'e':
                            state = SQLQueryParserState.SQL_OPERATOR_BE;
                            break;
                        default:
                            state = SQLQueryParserState.SQL_ERROR;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_OPERATOR_BE:
                    switch(character) {
                        case 'T':
                        case 't':
                            state = SQLQueryParserState.SQL_OPERATOR_BET;
                            break;
                        default:
                            state = SQLQueryParserState.SQL_ERROR;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_OPERATOR_BET:
                    switch(character) {
                        case 'W':
                        case 'w':
                            state = SQLQueryParserState.SQL_OPERATOR_BETW;
                            break;
                        default:
                            state = SQLQueryParserState.SQL_ERROR;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_OPERATOR_BETW:
                    switch(character) {
                        case 'E':
                        case 'e':
                            state = SQLQueryParserState.SQL_OPERATOR_BETWE;
                            break;
                        default:
                            state = SQLQueryParserState.SQL_ERROR;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_OPERATOR_BETWE:
                    switch(character) {
                        case 'E':
                        case 'e':
                            state = SQLQueryParserState.SQL_OPERATOR_BETWEE;
                            break;
                        default:
                            state = SQLQueryParserState.SQL_ERROR;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_OPERATOR_BETWEE:
                    switch(character) {
                        case 'N':
                        case 'n':
                            state = SQLQueryParserState.SQL_OPERATOR_BETWEEN;
                            break;
                        default:
                            state = SQLQueryParserState.SQL_ERROR;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_OPERATOR_BETWEEN:
                    switch(character) {
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                        case '\'':
                        case '"':
                            this._unread();
                            let values = this._parseSQLBetweenCondition();
                            return new SQLBetweenCondition(new SQLColumn(leftOperand), values);
                        default:
                            state = SQLQueryParserState.SQL_ERROR;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_OPERATOR_C:
                    switch(character) {
                        case 'O':
                        case 'o':
                            state = SQLQueryParserState.SQL_OPERATOR_CO;
                            break;
                        default:
                            state = SQLQueryParserState.SQL_ERROR;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_OPERATOR_CO:
                    switch(character) {
                        case 'N':
                        case 'n':
                            state = SQLQueryParserState.SQL_OPERATOR_CON;
                            break;
                        default:
                            state = SQLQueryParserState.SQL_ERROR;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_OPERATOR_CON:
                    switch(character) {
                        case 'T':
                        case 't':
                            state = SQLQueryParserState.SQL_OPERATOR_CONT;
                            break;
                        default:
                            state = SQLQueryParserState.SQL_ERROR;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_OPERATOR_CONT:
                    switch(character) {
                        case 'A':
                        case 'a':
                            state = SQLQueryParserState.SQL_OPERATOR_CONTA;
                            break;
                        default:
                            state = SQLQueryParserState.SQL_ERROR;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_OPERATOR_CONTA:
                    switch(character) {
                        case 'I':
                        case 'i':
                            state = SQLQueryParserState.SQL_OPERATOR_CONTAI;
                            break;
                        default:
                            state = SQLQueryParserState.SQL_ERROR;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_OPERATOR_CONTAI:
                    switch(character) {
                        case 'N':
                        case 'n':
                            state = SQLQueryParserState.SQL_OPERATOR_CONTAIN;
                            break;
                        default:
                            state = SQLQueryParserState.SQL_ERROR;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_OPERATOR_CONTAIN:
                    switch(character) {
                        case 'S':
                        case 's':
                            state = SQLQueryParserState.SQL_OPERATOR_CONTAINS;
                            break;
                        default:
                            state = SQLQueryParserState.SQL_ERROR;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_OPERATOR_CONTAINS:
                    switch(character) {
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            operator = OPERATOR.INCLUDES;
                            state = SQLQueryParserState.SQL_RIGHT_OPERAND;
                            break;
                        default:
                            state = SQLQueryParserState.SQL_ERROR;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_OPERATOR_L:
                    switch(character) {
                        case 'I':
                        case 'i':
                            state = SQLQueryParserState.SQL_OPERATOR_LI;
                            break;
                        default:
                            state = SQLQueryParserState.SQL_ERROR;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_OPERATOR_LI:
                    switch(character) {
                        case 'K':
                        case 'k':
                            state = SQLQueryParserState.SQL_OPERATOR_LIK;
                            break;
                        default:
                            state = SQLQueryParserState.SQL_ERROR;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_OPERATOR_LIK:
                    switch(character) {
                        case 'E':
                        case 'e':
                            state = SQLQueryParserState.SQL_OPERATOR_LIKE;
                            break;
                        default:
                            state = SQLQueryParserState.SQL_ERROR;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_OPERATOR_LIKE:
                    switch(character) {
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            break;
                        case '\'':
                            operator = OPERATOR.LIKE;
                            state = SQLQueryParserState.SQL_RIGHT_OPERAND_SINGLE_QUOTE;
                            rightOperand = "";
                            break;
                        case '"':
                            operator = OPERATOR.LIKE;
                            state = SQLQueryParserState.SQL_RIGHT_OPERAND_DOUBLE_QUOTE;
                            rightOperand = "";
                            break;
                        default:
                            state = SQLQueryParserState.SQL_ERROR;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_OPERATOR_H:
                    switch(character) {
                        case 'A':
                        case 'a':
                            state = SQLQueryParserState.SQL_OPERATOR_HA;
                            break;
                        default:
                            state = SQLQueryParserState.SQL_ERROR;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_OPERATOR_HA:
                    switch(character) {
                        case 'S':
                        case 's':
                            state = SQLQueryParserState.SQL_OPERATOR_HAS;
                            break;
                        default:
                            state = SQLQueryParserState.SQL_ERROR;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_OPERATOR_HAS:
                    switch(character) {
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            operator = OPERATOR.INCLUDES;
                            state = SQLQueryParserState.SQL_RIGHT_OPERAND;
                            break;
                        default:
                            state = SQLQueryParserState.SQL_ERROR;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_OPERATOR_I:
                    switch(character) {
                        case 'N':
                        case 'n':
                            state = SQLQueryParserState.SQL_OPERATOR_IN;
                            break;
                        default:
                            state = SQLQueryParserState.SQL_ERROR;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_OPERATOR_IN:
                    switch(character) {
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            break;
                        case '(':
                            this._unread();
                            let values = this._parseStringsBetweenParenthesis(false);
                            return new SQLInCondition(new SQLColumn(leftOperand), values);
                        case 'C':
                        case 'c':
                            state = SQLQueryParserState.SQL_OPERATOR_INC;
                            break;
                        default:
                            state = SQLQueryParserState.SQL_ERROR;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_OPERATOR_INC:
                    switch(character) {
                        case 'L':
                        case 'l':
                            state = SQLQueryParserState.SQL_OPERATOR_INCL;
                            break;
                        default:
                            state = SQLQueryParserState.SQL_ERROR;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_OPERATOR_INCL:
                    switch(character) {
                        case 'U':
                        case 'u':
                            state = SQLQueryParserState.SQL_OPERATOR_INCLU;
                            break;
                        default:
                            state = SQLQueryParserState.SQL_ERROR;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_OPERATOR_INCLU:
                    switch(character) {
                        case 'D':
                        case 'd':
                            state = SQLQueryParserState.SQL_OPERATOR_INCLUD;
                            break;
                        default:
                            state = SQLQueryParserState.SQL_ERROR;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_OPERATOR_INCLUD:
                    switch(character) {
                        case 'E':
                        case 'e':
                            state = SQLQueryParserState.SQL_OPERATOR_INCLUDE;
                            break;
                        default:
                            state = SQLQueryParserState.SQL_ERROR;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_OPERATOR_INCLUDE:
                    switch(character) {
                        case 'S':
                        case 's':
                            state = SQLQueryParserState.SQL_OPERATOR_INCLUDES;
                            break;
                        default:
                            state = SQLQueryParserState.SQL_ERROR;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_OPERATOR_INCLUDES:
                    switch(character) {
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            operator = OPERATOR.INCLUDES;
                            state = SQLQueryParserState.SQL_RIGHT_OPERAND;
                            break;
                        default:
                            state = SQLQueryParserState.SQL_ERROR;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_OPERATOR:
                    switch (character) {
                        // Ignore whitespace
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            break;
                        // Start of the operator
                        case '<':
                            state = SQLQueryParserState.SQL_OPERATOR_LT;
                            break;
                        case '>':
                            state = SQLQueryParserState.SQL_OPERATOR_GT;
                            break;
                        case '=':
                            state = SQLQueryParserState.SQL_RIGHT_OPERAND;
                            operator = OPERATOR.EQUAL;
                            break;
                        case '!':
                            state = SQLQueryParserState.SQL_OPERATOR_EX;
                            break;
                        case 'B':
                        case 'b':
                            state = SQLQueryParserState.SQL_OPERATOR_B;
                            break;
                        case 'C':
                        case 'c':
                            state = SQLQueryParserState.SQL_OPERATOR_C;
                            break;
                        case 'H':
                        case 'h':
                            state = SQLQueryParserState.SQL_OPERATOR_H;
                            break;
                        case 'I':
                        case 'i':
                            state = SQLQueryParserState.SQL_OPERATOR_I;
                            break;
                        case 'L':
                        case 'l':
                            state = SQLQueryParserState.SQL_OPERATOR_L;
                            break;
                        // Other characters indicate
                        // an error
                        default:
                            state = SQLQueryParserState.SQL_ERROR;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_OPERATOR_LT:
                    switch (character) {
                        case ' ':
                        case '\t':
                        case '\r':
                        case '\n':
                            state = SQLQueryParserState.SQL_RIGHT_OPERAND;
                            operator = OPERATOR.LESS_THAN;
                            break;
                        // A number indicates either the start of a number
                        // or a date. Numbers are allowed to be negative.
                        case '1':
                        case '2':
                        case '3':
                        case '4':
                        case '5':
                        case '6':
                        case '7':
                        case '8':
                        case '9':
                        case '0':
                        case '-':
                            state = SQLQueryParserState.SQL_RIGHT_OPERAND_NUMBER;
                            operator = OPERATOR.LESS_THAN;
                            rightOperand = "";
                            rightOperand += character;
                            break;
                        case '=':
                            state = SQLQueryParserState.SQL_RIGHT_OPERAND;
                            operator = OPERATOR.LESS_THAN_EQUAL;
                            break;
                        case '>':
                            state = SQLQueryParserState.SQL_RIGHT_OPERAND;
                            operator = OPERATOR.NOT_EQUAL;
                            break;
                        default:
                            state = SQLQueryParserState.SQL_ERROR;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_OPERATOR_GT:
                    switch (character) {
                        case ' ':
                        case '\t':
                        case '\r':
                        case '\n':
                            state = SQLQueryParserState.SQL_RIGHT_OPERAND;
                            operator = OPERATOR.GREATER_THAN;
                            break;
                        // A number indicates either the start of a number
                        // or a date. Numbers are allowed to be negative.
                        case '1':
                        case '2':
                        case '3':
                        case '4':
                        case '5':
                        case '6':
                        case '7':
                        case '8':
                        case '9':
                        case '0':
                        case '-':
                            state = SQLQueryParserState.SQL_RIGHT_OPERAND_NUMBER;
                            operator = OPERATOR.GREATER_THAN;
                            rightOperand = "";
                            rightOperand += character;
                            break;
                        case '=':
                            state = SQLQueryParserState.SQL_RIGHT_OPERAND;
                            operator = OPERATOR.GREATER_THAN_EQUAL;
                            break;
                        default:
                            state = SQLQueryParserState.SQL_ERROR;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_OPERATOR_EX:
                    switch (character) {
                        case '=':
                            state = SQLQueryParserState.SQL_RIGHT_OPERAND;
                            operator = OPERATOR.NOT_EQUAL;
                            break;
                        default:
                            state = SQLQueryParserState.SQL_ERROR;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_RIGHT_OPERAND:
                    switch (character) {
                        // Ignore whitespace
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            break;
                        // Open square bracket indicates either an array, or
                        // a column name (with whitespace). 
                        case '[':
                            this._unread();
                            // We set the _noQuotesAreColumns to true.
                            rightOperand = this._parseArray(true);
                            // If there is only one element in this array and it is
                            // a SQLColumn we assume the square brackets were there to
                            // allow for whitespaces in the column name.
                            // Extract the one element and assign it to the right operand instead.
                            if(rightOperand.length === 1) {
                                if(rightOperand[0] instanceof SQLColumn) {
                                    rightOperand = rightOperand[0].getName();
                                    return this._builtColumnColumnSQLCondition(leftOperand, operator, rightOperand);
                                }
                            }
                            return this._builtColumnArraySQLCondition(leftOperand, operator, rightOperand);
                        // Any other non-letter, non-number
                        // characters indicate an error.
                        case '<':
                        case '>':
                        case '=':
                        case '!':
                        case '?':
                            state = SQLQueryParserState.SQL_ERROR;
                            break;
                        // A quote indicates the start of a string
                        case '\'':
                            state = SQLQueryParserState.SQL_RIGHT_OPERAND_SINGLE_QUOTE;
                            rightOperand = "";
                            break;
                        case '"':
                            state = SQLQueryParserState.SQL_RIGHT_OPERAND_DOUBLE_QUOTE;
                            rightOperand = "";
                            break;
                        // A number indicates either the start of a number
                        // or a date. Numbers are allowed to be negative.
                        case '1':
                        case '2':
                        case '3':
                        case '4':
                        case '5':
                        case '6':
                        case '7':
                        case '8':
                        case '9':
                        case '0':
                        case '-':
                            state = SQLQueryParserState.SQL_RIGHT_OPERAND_NUMBER;
                            rightOperand = "";
                            rightOperand += character;
                            break;
                        // Potential FALSE indicating a boolean
                        case 'F':
                        case 'f':
                            state = SQLQueryParserState.SQL_RIGHT_OPERAND_F;
                            rightOperand = "";
                            rightOperand += character;
                            break;
                        // Potential NULL
                        case 'N':
                        case 'n':
                            state = SQLQueryParserState.SQL_RIGHT_OPERAND_N;
                            rightOperand = "";
                            rightOperand += character;
                            break;
                        // Potential TRUE indicating a boolean
                        case 'T':
                        case 't':
                            state = SQLQueryParserState.SQL_RIGHT_OPERAND_T;
                            rightOperand = "";
                            rightOperand += character;
                            break;
                        // Potential UNDEFINED
                        case 'U':
                        case 'u':
                            state = SQLQueryParserState.SQL_RIGHT_OPERAND_U;
                            rightOperand = "";
                            rightOperand += character;
                            break;
                        // Any other character indicates the start
                        // of a column name
                        default:
                            state = SQLQueryParserState.SQL_RIGHT_OPERAND_COLUMN;
                            rightOperand = "";
                            rightOperand += character;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_RIGHT_OPERAND_N:
                    switch (character) {
                        case ' ':
                        case '\t':
                        case '\r':
                        case '\n':
                            return this._builtColumnColumnSQLCondition(leftOperand, operator, rightOperand);
                        case ';':
                        case ')':
                            this._unread();
                            return this._builtColumnColumnSQLCondition(leftOperand, operator, rightOperand);
                        case 'U':
                        case 'u':
                            state = SQLQueryParserState.SQL_RIGHT_OPERAND_NU;
                            rightOperand += character;
                            break;
                        default:
                            state = SQLQueryParserState.SQL_RIGHT_OPERAND_COLUMN;
                            rightOperand += character;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_RIGHT_OPERAND_NU:
                    switch (character) {
                        case ' ':
                        case '\t':
                        case '\r':
                        case '\n':
                            return this._builtColumnColumnSQLCondition(leftOperand, operator, rightOperand);
                        case ';':
                        case ')':
                            this._unread();
                            return this._builtColumnColumnSQLCondition(leftOperand, operator, rightOperand);
                        case 'L':
                        case 'l':
                            state = SQLQueryParserState.SQL_RIGHT_OPERAND_NUL;
                            rightOperand += character;
                            break;
                        default:
                            state = SQLQueryParserState.SQL_RIGHT_OPERAND_COLUMN;
                            rightOperand += character;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_RIGHT_OPERAND_NUL:
                    switch (character) {
                        case ' ':
                        case '\t':
                        case '\r':
                        case '\n':
                            return this._builtColumnColumnSQLCondition(leftOperand, operator, rightOperand);
                        case ';':
                        case ')':
                            this._unread();
                            return this._builtColumnColumnSQLCondition(leftOperand, operator, rightOperand);
                        case 'L':
                        case 'l':
                            state = SQLQueryParserState.SQL_RIGHT_OPERAND_NULL;
                            rightOperand += character;
                            break;
                        default:
                            state = SQLQueryParserState.SQL_RIGHT_OPERAND_COLUMN;
                            rightOperand += character;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_RIGHT_OPERAND_NULL:
                    switch (character) {
                        case ' ':
                        case '\t':
                        case '\r':
                        case '\n':
                            return this._builtColumnStringSQLCondition(leftOperand, operator, null);
                        case ';':
                        case ')':
                            this._unread();
                            return this._builtColumnStringSQLCondition(leftOperand, operator, null);
                        default:
                            state = SQLQueryParserState.SQL_RIGHT_OPERAND_COLUMN;
                            rightOperand += character;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_RIGHT_OPERAND_U:
                    switch (character) {
                        case ' ':
                        case '\t':
                        case '\r':
                        case '\n':
                            return this._builtColumnColumnSQLCondition(leftOperand, operator, rightOperand);
                        case ';':
                        case ')':
                            this._unread();
                            return this._builtColumnColumnSQLCondition(leftOperand, operator, rightOperand);
                        case 'N':
                        case 'n':
                            state = SQLQueryParserState.SQL_RIGHT_OPERAND_UN;
                            rightOperand += character;
                            break;
                        default:
                            state = SQLQueryParserState.SQL_RIGHT_OPERAND_COLUMN;
                            rightOperand += character;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_RIGHT_OPERAND_UN:
                    switch (character) {
                        case ' ':
                        case '\t':
                        case '\r':
                        case '\n':
                            return this._builtColumnColumnSQLCondition(leftOperand, operator, rightOperand);
                        case ';':
                        case ')':
                            this._unread();
                            return this._builtColumnColumnSQLCondition(leftOperand, operator, rightOperand);
                        case 'D':
                        case 'd':
                            state = SQLQueryParserState.SQL_RIGHT_OPERAND_UND;
                            rightOperand += character;
                            break;
                        default:
                            state = SQLQueryParserState.SQL_RIGHT_OPERAND_COLUMN;
                            rightOperand += character;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_RIGHT_OPERAND_UND:
                    switch (character) {
                        case ' ':
                        case '\t':
                        case '\r':
                        case '\n':
                            return this._builtColumnColumnSQLCondition(leftOperand, operator, rightOperand);
                        case ';':
                        case ')':
                            this._unread();
                            return this._builtColumnColumnSQLCondition(leftOperand, operator, rightOperand);
                        case 'E':
                        case 'e':
                            state = SQLQueryParserState.SQL_RIGHT_OPERAND_UNDE;
                            rightOperand += character;
                            break;
                        default:
                            state = SQLQueryParserState.SQL_RIGHT_OPERAND_COLUMN;
                            rightOperand += character;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_RIGHT_OPERAND_UNDE:
                    switch (character) {
                        case ' ':
                        case '\t':
                        case '\r':
                        case '\n':
                            return this._builtColumnColumnSQLCondition(leftOperand, operator, rightOperand);
                        case ';':
                        case ')':
                            this._unread();
                            return this._builtColumnColumnSQLCondition(leftOperand, operator, rightOperand);
                        case 'F':
                        case 'f':
                            state = SQLQueryParserState.SQL_RIGHT_OPERAND_UNDEF;
                            rightOperand += character;
                            break;
                        default:
                            state = SQLQueryParserState.SQL_RIGHT_OPERAND_COLUMN;
                            rightOperand += character;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_RIGHT_OPERAND_UNDEF:
                    switch (character) {
                        case ' ':
                        case '\t':
                        case '\r':
                        case '\n':
                            return this._builtColumnColumnSQLCondition(leftOperand, operator, rightOperand);
                        case ';':
                        case ')':
                            this._unread();
                            return this._builtColumnColumnSQLCondition(leftOperand, operator, rightOperand);
                        case 'I':
                        case 'i':
                            state = SQLQueryParserState.SQL_RIGHT_OPERAND_UNDEFI;
                            rightOperand += character;
                            break;
                        default:
                            state = SQLQueryParserState.SQL_RIGHT_OPERAND_COLUMN;
                            rightOperand += character;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_RIGHT_OPERAND_UNDEFI:
                    switch (character) {
                        case ' ':
                        case '\t':
                        case '\r':
                        case '\n':
                            return this._builtColumnColumnSQLCondition(leftOperand, operator, rightOperand);
                        case ';':
                        case ')':
                            this._unread();
                            return this._builtColumnColumnSQLCondition(leftOperand, operator, rightOperand);
                        case 'N':
                        case 'n':
                            state = SQLQueryParserState.SQL_RIGHT_OPERAND_UNDEFIN;
                            rightOperand += character;
                            break;
                        default:
                            state = SQLQueryParserState.SQL_RIGHT_OPERAND_COLUMN;
                            rightOperand += character;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_RIGHT_OPERAND_UNDEFIN:
                    switch (character) {
                        case ' ':
                        case '\t':
                        case '\r':
                        case '\n':
                            return this._builtColumnColumnSQLCondition(leftOperand, operator, rightOperand);
                        case ';':
                        case ')':
                            this._unread();
                            return this._builtColumnColumnSQLCondition(leftOperand, operator, rightOperand);
                        case 'E':
                        case 'e':
                            state = SQLQueryParserState.SQL_RIGHT_OPERAND_UNDEFINE;
                            rightOperand += character;
                            break;
                        default:
                            state = SQLQueryParserState.SQL_RIGHT_OPERAND_COLUMN;
                            rightOperand += character;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_RIGHT_OPERAND_UNDEFINE:
                    switch (character) {
                        case ' ':
                        case '\t':
                        case '\r':
                        case '\n':
                            return this._builtColumnColumnSQLCondition(leftOperand, operator, rightOperand);
                        case ';':
                        case ')':
                            this._unread();
                            return this._builtColumnColumnSQLCondition(leftOperand, operator, rightOperand);
                        case 'D':
                        case 'd':
                            state = SQLQueryParserState.SQL_RIGHT_OPERAND_UNDEFINED;
                            rightOperand += character;
                            break;
                        default:
                            state = SQLQueryParserState.SQL_RIGHT_OPERAND_COLUMN;
                            rightOperand += character;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_RIGHT_OPERAND_UNDEFINED:
                    switch (character) {
                        case ' ':
                        case '\t':
                        case '\r':
                        case '\n':
                            return this._builtColumnStringSQLCondition(leftOperand, operator, undefined);
                        case ';':
                        case ')':
                            this._unread();
                            return this._builtColumnStringSQLCondition(leftOperand, operator, undefined);
                        default:
                            state = SQLQueryParserState.SQL_RIGHT_OPERAND_COLUMN;
                            rightOperand += character;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_RIGHT_OPERAND_T:
                    switch (character) {
                        case ' ':
                        case '\t':
                        case '\r':
                        case '\n':
                            return this._builtColumnColumnSQLCondition(leftOperand, operator, rightOperand);                            
                        case ';':
                        case ')':
                            this._unread();
                            return this._builtColumnColumnSQLCondition(leftOperand, operator, rightOperand);
                        case 'R':
                        case 'r':
                            state = SQLQueryParserState.SQL_RIGHT_OPERAND_TR;
                            rightOperand += character;
                            break;
                        default:
                            state = SQLQueryParserState.SQL_RIGHT_OPERAND_COLUMN;
                            rightOperand += character;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_RIGHT_OPERAND_TR:
                    switch (character) {
                        case ' ':
                        case '\t':
                        case '\r':
                        case '\n':
                            return this._builtColumnColumnSQLCondition(leftOperand, operator, rightOperand);
                        case ';':
                        case ')':
                            this._unread();
                            return this._builtColumnColumnSQLCondition(leftOperand, operator, rightOperand);
                        case 'U':
                        case 'u':
                            state = SQLQueryParserState.SQL_RIGHT_OPERAND_TRU;
                            rightOperand += character;
                            break;
                        default:
                            state = SQLQueryParserState.SQL_RIGHT_OPERAND_COLUMN;
                            rightOperand += character;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_RIGHT_OPERAND_TRU:
                    switch (character) {
                        case ' ':
                        case '\t':
                        case '\r':
                        case '\n':
                            return this._builtColumnColumnSQLCondition(leftOperand, operator, rightOperand);
                        case ';':
                        case ')':
                            this._unread();
                            return this._builtColumnColumnSQLCondition(leftOperand, operator, rightOperand);
                        case 'E':
                        case 'e':
                            state = SQLQueryParserState.SQL_RIGHT_OPERAND_TRUE;
                            rightOperand += character;
                            break;
                        default:
                            state = SQLQueryParserState.SQL_RIGHT_OPERAND_COLUMN;
                            rightOperand += character;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_RIGHT_OPERAND_TRUE:
                    switch (character) {
                        case ' ':
                        case '\t':
                        case '\r':
                        case '\n':
                            return this._builtColumnBooleanSQLCondition(leftOperand, operator, true);
                        case ';':
                        case ')':
                            this._unread();
                            return this._builtColumnBooleanSQLCondition(leftOperand, operator, true);
                        default:
                            state = SQLQueryParserState.SQL_RIGHT_OPERAND_COLUMN;
                            rightOperand += character;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_RIGHT_OPERAND_F:
                    switch (character) {
                        case ' ':
                        case '\t':
                        case '\r':
                        case '\n':
                            return this._builtColumnColumnSQLCondition(leftOperand, operator, rightOperand);
                        case ';':
                        case ')':
                            this._unread();
                            return this._builtColumnColumnSQLCondition(leftOperand, operator, rightOperand);
                        case 'A':
                        case 'a':
                            state = SQLQueryParserState.SQL_RIGHT_OPERAND_FA;
                            rightOperand += character;
                            break;
                        default:
                            state = SQLQueryParserState.SQL_RIGHT_OPERAND_COLUMN;
                            rightOperand += character;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_RIGHT_OPERAND_FA:
                    switch (character) {
                        case ' ':
                        case '\t':
                        case '\r':
                        case '\n':
                            return this._builtColumnColumnSQLCondition(leftOperand, operator, rightOperand);
                        case ';':
                        case ')':
                            this._unread();
                            return this._builtColumnColumnSQLCondition(leftOperand, operator, rightOperand);
                        case 'L':
                        case 'l':
                            state = SQLQueryParserState.SQL_RIGHT_OPERAND_FAL;
                            rightOperand += character;
                            break;
                        default:
                            state = SQLQueryParserState.SQL_RIGHT_OPERAND_COLUMN;
                            rightOperand += character;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_RIGHT_OPERAND_FAL:
                    switch (character) {
                        case ' ':
                        case '\t':
                        case '\r':
                        case '\n':
                            return this._builtColumnColumnSQLCondition(leftOperand, operator, rightOperand);
                        case ';':
                        case ')':
                            this._unread();
                            return this._builtColumnColumnSQLCondition(leftOperand, operator, rightOperand);
                        case 'S':
                        case 's':
                            state = SQLQueryParserState.SQL_RIGHT_OPERAND_FALS;
                            rightOperand += character;
                            break;
                        default:
                            state = SQLQueryParserState.SQL_RIGHT_OPERAND_COLUMN;
                            rightOperand += character;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_RIGHT_OPERAND_FALS:
                    switch (character) {
                        case ' ':
                        case '\t':
                        case '\r':
                        case '\n':
                            return this._builtColumnColumnSQLCondition(leftOperand, operator, rightOperand);
                        case ';':
                        case ')':
                            this._unread();
                            return this._builtColumnColumnSQLCondition(leftOperand, operator, rightOperand);
                        case 'E':
                        case 'e':
                            state = SQLQueryParserState.SQL_RIGHT_OPERAND_FALSE;
                            rightOperand += character;
                            break;
                        default:
                            state = SQLQueryParserState.SQL_RIGHT_OPERAND_COLUMN;
                            rightOperand += character;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_RIGHT_OPERAND_FALSE:
                    switch (character) {
                        case ' ':
                        case '\t':
                        case '\r':
                        case '\n':
                            return this._builtColumnBooleanSQLCondition(leftOperand, operator, false);
                        case ';':
                        case ')':
                            this._unread();
                            return this._builtColumnBooleanSQLCondition(leftOperand, operator, false);
                        default:
                            state = SQLQueryParserState.SQL_RIGHT_OPERAND_COLUMN;
                            rightOperand += character;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_RIGHT_OPERAND_SINGLE_QUOTE:
                    switch (character) {
                        // The end of our quoted right operand
                        case '\'':
                            return this._builtColumnStringSQLCondition(leftOperand, operator, rightOperand);
                        default:
                            rightOperand += character;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_RIGHT_OPERAND_DOUBLE_QUOTE:
                    switch (character) {
                        // The end of our quoted right operand
                        case '"':
                            return this._builtColumnStringSQLCondition(leftOperand, operator, rightOperand);
                        default:
                            rightOperand += character;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_RIGHT_OPERAND_NUMBER:
                    switch (character) {
                        case '1':
                        case '2':
                        case '3':
                        case '4':
                        case '5':
                        case '6':
                        case '7':
                        case '8':
                        case '9':
                        case '0':
                            rightOperand += character;
                            break;
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            return this._builtColumnNumberSQLCondition(leftOperand, operator, rightOperand);
                        case '.':
                            state = SQLQueryParserState.SQL_RIGHT_OPERAND_NUMBER_DOT;
                            rightOperand += character;
                            break;
                        case '/':
                            state = SQLQueryParserState.SQL_RIGHT_OPERAND_DATE;
                            rightOperand += character;
                            break;
                        case ';':
                        case ')':
                            this._unread();
                            return this._builtColumnNumberSQLCondition(leftOperand, operator, rightOperand);
                        default:
                            state = SQLQueryParserState.SQL_ERROR;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_RIGHT_OPERAND_NUMBER_DOT:
                    switch (character) {
                        case '1':
                        case '2':
                        case '3':
                        case '4':
                        case '5':
                        case '6':
                        case '7':
                        case '8':
                        case '9':
                        case '0':
                            rightOperand += character;
                            break;
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            return this._builtColumnNumberSQLCondition(leftOperand, operator, rightOperand);
                        case ';':
                        case ')':
                            this._unread();
                            return this._builtColumnNumberSQLCondition(leftOperand, operator, rightOperand);
                        default:
                            state = SQLQueryParserState.SQL_ERROR;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_RIGHT_OPERAND_DATE:
                    switch (character) {
                        case ' ':
                        case '\t':
                        case '\r':
                        case '\n':
                            return this._builtColumnDateSQLCondition(leftOperand, operator, rightOperand);
                        case ';':
                        case ')':
                            this._unread();
                            return this._builtColumnDateSQLCondition(leftOperand, operator, rightOperand);
                        default:
                            rightOperand += character;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_RIGHT_OPERAND_COLUMN:
                    switch (character) {
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            return this._builtColumnColumnSQLCondition(leftOperand, operator, rightOperand);
                        case ';':
                        case ')':
                            this._unread();
                            return this._builtColumnColumnSQLCondition(leftOperand, operator, rightOperand);
                        default:
                            rightOperand += character;
                            break;
                    }
                    break;
                case SQLQueryParserState.SQL_ERROR:
                    throw new Error("Error in parsing condition.");
                // Should never be reached!!!
                default:
                    break;
            }
        }
        switch(state) {
            case SQLQueryParserState.SQL_RIGHT_OPERAND_FALSE:
                return this._builtColumnBooleanSQLCondition(leftOperand, operator, false);
            case SQLQueryParserState.SQL_RIGHT_OPERAND_TRUE:
                return this._builtColumnBooleanSQLCondition(leftOperand, operator, true);
            case SQLQueryParserState.SQL_RIGHT_OPERAND_UNDEFINED:
                return this._builtColumnStringSQLCondition(leftOperand, operator, undefined);
            case SQLQueryParserState.SQL_RIGHT_OPERAND_NULL:
                return this._builtColumnStringSQLCondition(leftOperand, operator, null);
            case SQLQueryParserState.SQL_RIGHT_OPERAND_DATE:
                return this._builtColumnDateSQLCondition(leftOperand, operator, rightOperand);
            case SQLQueryParserState.SQL_RIGHT_OPERAND_NUMBER:
            case SQLQueryParserState.SQL_RIGHT_OPERAND_NUMBER_DOT:
                return this._builtColumnNumberSQLCondition(leftOperand, operator, rightOperand);
            case SQLQueryParserState.SQL_RIGHT_OPERAND_COLUMN:
                return this._builtColumnColumnSQLCondition(leftOperand, operator, rightOperand);
        }
        return null;
    }

    _builtColumnStringSQLCondition(leftOperand, operator, rightOperand) {
        logger.trace('_builtColumnStringSQLCondition(...): start.');
        logger.trace('_builtColumnStringSQLCondition(...): leftOperand \'' + leftOperand + '\'.');
        logger.trace('_builtColumnStringSQLCondition(...): rightOperand \'' + rightOperand + '\'.');
        switch (operator) {
            case OPERATOR.NOT_EQUAL:
                return new SQLNotEqualCondition(new SQLColumn(leftOperand), rightOperand);
            case OPERATOR.EQUAL:
                return new SQLEqualCondition(new SQLColumn(leftOperand), rightOperand);
            case OPERATOR.LIKE:
                return new SQLLikeCondition(new SQLColumn(leftOperand), rightOperand);
            case OPERATOR.INCLUDES:
                return new SQLIncludesCondition(new SQLColumn(leftOperand), rightOperand);
            default:
                throw new Error("Only the operators =, <>, !=, or like may be used when comparing a Column to a String.");
        }
    }

    _builtColumnColumnSQLCondition(leftOperand, operator, rightOperand) {
        logger.trace('_builtColumnColumnSQLCondition(...): start.');
        logger.trace('_builtColumnColumnSQLCondition(...): leftOperand \'' + leftOperand + '\'.');
        logger.trace('_builtColumnColumnSQLCondition(...): rightOperand \'' + rightOperand + '\'.');
        switch (operator) {
            case OPERATOR.LESS_THAN:
                return new SQLLessCondition(new SQLColumn(leftOperand),
                        new SQLColumn(rightOperand));
            case OPERATOR.GREATER_THAN:
                return new SQLGreaterCondition(new SQLColumn(leftOperand),
                        new SQLColumn(rightOperand));
            case OPERATOR.LESS_THAN_EQUAL:
                return new SQLLessOrEqualCondition(new SQLColumn(leftOperand),
                        new SQLColumn(rightOperand));
            case OPERATOR.GREATER_THAN_EQUAL:
                return new SQLGreaterOrEqualCondition(new SQLColumn(leftOperand),
                        new SQLColumn(rightOperand));
            case OPERATOR.NOT_EQUAL:
                return new SQLNotEqualCondition(new SQLColumn(leftOperand),
                        new SQLColumn(rightOperand));
            case OPERATOR.EQUAL:
                return new SQLEqualCondition(new SQLColumn(leftOperand),
                        new SQLColumn(rightOperand));
            case OPERATOR.INCLUDES:
                return new SQLIncludesCondition(new SQLColumn(leftOperand), new SQLColumn(rightOperand));
            default:
                throw new Error("Unknown operator type: " + operator + ".");
        }
    }

    _builtColumnArraySQLCondition(leftOperand, operator, rightOperand) {
        logger.trace('_builtColumnArraySQLCondition(...): start.');
        logger.trace('_builtColumnArraySQLCondition(...): leftOperand \'' + leftOperand + '\'.');
        logger.trace('_builtColumnArraySQLCondition(...): rightOperand \'' + rightOperand + '\'.');
        switch (operator) {
            case OPERATOR.NOT_EQUAL:
                return new SQLNotEqualCondition(new SQLColumn(leftOperand), rightOperand);
            case OPERATOR.EQUAL:
                return new SQLEqualCondition(new SQLColumn(leftOperand), rightOperand);
            default:
                throw new Error("Only the operators =, <> or != may be used when comparing a Column to an Array.");
        }
    }

    _builtColumnBooleanSQLCondition(leftOperand, operator, rightOperand) {
        logger.trace('_builtColumnBooleanSQLCondition(...): start.');
        logger.trace('_builtColumnBooleanSQLCondition(...): leftOperand \'' + leftOperand + '\'.');
        logger.trace('_builtColumnBooleanSQLCondition(...): rightOperand \'' + rightOperand + '\'.');
        switch (operator) {
            case OPERATOR.NOT_EQUAL:
                return new SQLNotEqualCondition(new SQLColumn(leftOperand), rightOperand);
            case OPERATOR.EQUAL:
                return new SQLEqualCondition(new SQLColumn(leftOperand), rightOperand);
            case OPERATOR.INCLUDES:
                return new SQLIncludesCondition(new SQLColumn(leftOperand), rightOperand);
            default:
                throw new Error("Only the operators =, <> or != may be used when comparing a Column to a Boolean.");
        }
    }

    _builtColumnNumberSQLCondition(leftOperand, operator, rightOperand) {
        logger.trace('_builtColumnNumberSQLCondition(...): start.');
        logger.trace('_builtColumnNumberSQLCondition(...): leftOperand \'' + leftOperand + '\'.');
        logger.trace('_builtColumnNumberSQLCondition(...): rightOperand \'' + rightOperand + '\'.');
        if(typeof rightOperand === 'string') {
            rightOperand = parseFloat(rightOperand);
        }
        switch (operator) {
            case OPERATOR.LESS_THAN:
                return new SQLLessCondition(new SQLColumn(leftOperand),
                        rightOperand);
            case OPERATOR.GREATER_THAN:
                return new SQLGreaterCondition(new SQLColumn(leftOperand),
                        rightOperand);
            case OPERATOR.LESS_THAN_EQUAL:
                return new SQLLessOrEqualCondition(new SQLColumn(leftOperand),
                        rightOperand);
            case OPERATOR.GREATER_THAN_EQUAL:
                return new SQLGreaterOrEqualCondition(new SQLColumn(leftOperand),
                        rightOperand);
            case OPERATOR.NOT_EQUAL:
                return new SQLNotEqualCondition(new SQLColumn(leftOperand),
                        rightOperand);
            case OPERATOR.EQUAL:
                return new SQLEqualCondition(new SQLColumn(leftOperand),
                        rightOperand);
            case OPERATOR.INCLUDES:
                return new SQLIncludesCondition(new SQLColumn(leftOperand), rightOperand);
            default:
                throw new Error("Unknown operator type: " + operator + ".");
        }
    }

    _builtColumnDateSQLCondition(leftOperand, operator, rightOperand) {
        logger.trace('_builtColumnDateSQLCondition(...): start.');
        logger.trace('_builtColumnDateSQLCondition(...): leftOperand \'' + leftOperand + '\'.');
        logger.trace('_builtColumnDateSQLCondition(...): rightOperand \'' + rightOperand + '\'.');
        let day;
        let month;
        let year;
        let parts = rightOperand.split('/');
        day = parseInt(parts[0]);
        month = parseInt(parts[1]);
        year = parseInt(parts[2]);
        let date = new Date(year, month - 1, day);
        switch (operator) {
            case OPERATOR.LESS_THAN:
                return new SQLLessCondition(new SQLColumn(leftOperand),
                        date);
            case OPERATOR.GREATER_THAN:
                return new SQLGreaterCondition(new SQLColumn(leftOperand),
                        date);
            case OPERATOR.LESS_THAN_EQUAL:
                return new SQLLessOrEqualCondition(new SQLColumn(leftOperand),
                        date);
            case OPERATOR.GREATER_THAN_EQUAL:
                return new SQLGreaterOrEqualCondition(new SQLColumn(leftOperand),
                        date);
            case OPERATOR.NOT_EQUAL:
                return new SQLNotEqualCondition(new SQLColumn(leftOperand),
                        date);
            case OPERATOR.EQUAL:
                return new SQLEqualCondition(new SQLColumn(leftOperand),
                        date);
            case OPERATOR.INCLUDES:
                return new SQLIncludesCondition(new SQLColumn(leftOperand), date);
            default:
                throw new Error("Unknown operator type: " + operator + ".");
        }
    }
}

module.exports = SQLQueryParser;