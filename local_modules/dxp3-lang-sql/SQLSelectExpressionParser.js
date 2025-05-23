/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-lang-sql
 *
 * NAME
 * SQLSelectExpressionParser
 */
const packageName = 'dxp3-lang-sql';
const moduleName = 'SQLSelectExpressionParser';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * @module dxp3-lang-sql/SQLSelectExpressionParser
 */
const SQLSelectExpression = require('./SQLSelectExpression');
const SQLSelectExpressionParserState = require('./SQLSelectExpressionParserState');
const logging = require('dxp3-logging');

const logger = logging.getLogger(canonicalName);

class SQLSelectExpressionParser {

	constructor(_sql) {
		if(_sql != undefined && _sql != null) {
			this.initialize(_sql);
		} else {
			this._reset();
		}
    }

	getSQL() {
		return this.sql;
	}

	getState() {
		return this.state;
	}

	/**
	 * This is an alias for our initialize method.
	 */
	init(_sql) {
		this.initialize(_sql);
	}

	initialize(_sql) {
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
         * statement it is, so set state to SQLSelectExpressionParserState.SQL_
         */
        this._setState(SQLSelectExpressionParserState.SQL_);
	}

	/**
	 * This is an alias for our initialize method.
	 */
	setSQL(_sql) {
		this.initialize(_sql);
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

    async nextSQLSelectExpression() {
        return this._parseSelectExpression();
    }

	_parseSelectExpression() {
        let sqlSelectExpression = null;
		let selectExpression = '';
        let distinct = false;
        let alias = '';
		let state = SQLSelectExpressionParserState.SQL_;
		let character = null;
		while ((character = this._read()) != null) {
            switch (state) {
                case SQLSelectExpressionParserState.SQL_:
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
                            state = SQLSelectExpressionParserState.SQL_A;
                            selectExpression = '' + character;
                            break;
                        case 'C': 
                        case 'c':
                            // Possible COUNT(...).
                            state = SQLSelectExpressionParserState.SQL_C;
                            selectExpression = '' + character;
                            break;
                        case 'M': 
                        case 'm':
                            // Possible MAX(...) or MIN(...).
                            state = SQLSelectExpressionParserState.SQL_M;
                            selectExpression = '' + character;
                            break;
                        case 'S': 
                        case 's':
                            // Possible SUM(...).
                            state = SQLSelectExpressionParserState.SQL_S;
                            selectExpression = '' + character;
                            break;
                        case '[':
                            // Possible column name with some whitespace.
                            state = SQLSelectExpressionParserState.SQL_READ_SQUARE_BRACKET_VALUE;
                            selectExpression = '';
                            break;
                        case '"':
                            // Possible column name with some whitespace.
                            state = SQLSelectExpressionParserState.SQL_READ_DOUBLE_QUOTE_VALUE;
                            selectExpression = '';
                            break;
                        case '\'':
                            // Possible column name with some whitespace.
                            state = SQLSelectExpressionParserState.SQL_READ_SINGLE_QUOTE_VALUE;
                            selectExpression = '';
                            break;
                        default:
                            // Possible column name without whitespace
                            state = SQLSelectExpressionParserState.SQL_READ_NO_QUOTE_VALUE;
                            selectExpression = '' + character;
                            break;
                    }
                    break;
                case SQLSelectExpressionParserState.SQL_A:
                    switch (character) {
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            sqlSelectExpression = new SQLSelectExpression(selectExpression);
                            state = SQLSelectExpressionParserState.SQL_CSSTRING_NEXT;
                            this._mark();
                            break;
                        case ',':
                            sqlSelectExpression = new SQLSelectExpression(selectExpression);
                            return sqlSelectExpression;
                        case 'V':
                        case 'v':
                            state = SQLSelectExpressionParserState.SQL_AV;
                            selectExpression += character;
                            break;
                        default:
                            state = SQLSelectExpressionParserState.SQL_READ_NO_QUOTE_VALUE;
                            selectExpression += character;
                            break;
                    }
                    break;
                case SQLSelectExpressionParserState.SQL_AV:
                    switch (character) {
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            sqlSelectExpression = new SQLSelectExpression(selectExpression);
                            state = SQLSelectExpressionParserState.SQL_CSSTRING_NEXT;
                            this._mark();
                            break;
                        case ',':
                            sqlSelectExpression = new SQLSelectExpression(selectExpression);
                            return sqlSelectExpression;
                        case 'G':
                        case 'g':
                            state = SQLSelectExpressionParserState.SQL_AVG;
                            selectExpression += character;
                            break;
                        default:
                            state = SQLSelectExpressionParserState.SQL_READ_NO_QUOTE_VALUE;
                            selectExpression += character;
                            break;
                    }
                    break;
                case SQLSelectExpressionParserState.SQL_AVG:
                    switch (character) {
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            break;
                        case ',':
                            sqlSelectExpression = new SQLSelectExpression(selectExpression);
                            return sqlSelectExpression;
                        case '(':
                            selectExpression = '';
                            if(this._parseDistinctString()) {
                                distinct = true;
                            } else {
                                distinct = false;
                            }
                            state = SQLSelectExpressionParserState.SQL_READING_FUNCTION_AVG;
                            break;
                        default:
                            state = SQLSelectExpressionParserState.SQL_READ_NO_QUOTE_VALUE;
                            selectExpression += character;
                            break;
                    }
                    break;
                case SQLSelectExpressionParserState.SQL_READING_FUNCTION_AVG:
                    switch (character) {
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            break;
                        case ')':
                            sqlSelectExpression = new SQLAvgAggregateFunction(selectExpression);
                            sqlSelectExpression.setDistinct(distinct);
                            state = SQLSelectExpressionParserState.SQL_CSSTRING_NEXT;
                            this._mark();
                            break;
                        default:
                            selectExpression += character;
                            break;
                    }
                    break;
                case SQLSelectExpressionParserState.SQL_C:
                    switch (character) {
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            sqlSelectExpression = new SQLSelectExpression(selectExpression);
                            state = SQLSelectExpressionParserState.SQL_CSSTRING_NEXT;
                            this._mark();
                            break;
                        case ',':
                            sqlSelectExpression = new SQLSelectExpression(selectExpression);
                            return sqlSelectExpression;
                        case 'O':
                        case 'o':
                            state = SQLSelectExpressionParserState.SQL_CO;
                            selectExpression += character;
                            break;
                        default:
                            state = SQLSelectExpressionParserState.SQL_READ_NO_QUOTE_VALUE;
                            selectExpression += character;
                            break;
                    }
                    break;
                case SQLSelectExpressionParserState.SQL_CO:
                    switch (character) {
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            sqlSelectExpression = new SQLSelectExpression(selectExpression);
                            state = SQLSelectExpressionParserState.SQL_CSSTRING_NEXT;
                            this._mark();
                            break;
                        case ',':
                            sqlSelectExpression = new SQLSelectExpression(selectExpression);
                            return sqlSelectExpression;
                        case 'U':
                        case 'u':
                            state = SQLSelectExpressionParserState.SQL_COU;
                            selectExpression += character;
                            break;
                        default:
                            state = SQLSelectExpressionParserState.SQL_READ_NO_QUOTE_VALUE;
                            selectExpression += character;
                            break;
                    }
                    break;
                case SQLSelectExpressionParserState.SQL_COU:
                    switch (character) {
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            sqlSelectExpression = new SQLSelectExpression(selectExpression);
                            state = SQLSelectExpressionParserState.SQL_CSSTRING_NEXT;
                            this._mark();
                            break;
                        case ',':
                            sqlSelectExpression = new SQLSelectExpression(selectExpression);
                            return sqlSelectExpression;
                        case 'N':
                        case 'n':
                            state = SQLSelectExpressionParserState.SQL_COUN;
                            selectExpression += character;
                            break;
                        default:
                            state = SQLSelectExpressionParserState.SQL_READ_NO_QUOTE_VALUE;
                            selectExpression += character;
                            break;
                    }
                    break;
                case SQLSelectExpressionParserState.SQL_COUN:
                    switch (character) {
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            sqlSelectExpression = new SQLSelectExpression(selectExpression);
                            state = SQLSelectExpressionParserState.SQL_CSSTRING_NEXT;
                            this._mark();
                            break;
                        case ',':
                            sqlSelectExpression = new SQLSelectExpression(selectExpression);
                            return sqlSelectExpression;
                        case 'T':
                        case 't':
                            state = SQLSelectExpressionParserState.SQL_COUNT;
                            selectExpression += character;
                            break;
                        default:
                            state = SQLSelectExpressionParserState.SQL_READ_NO_QUOTE_VALUE;
                            selectExpression += character;
                            break;
                    }
                    break;
                case SQLSelectExpressionParserState.SQL_COUNT:
                    switch (character) {
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            break;
                        case ',':
                            sqlSelectExpression = new SQLSelectExpression(selectExpression);
                            return sqlSelectExpression;
                        case '(':
                            selectExpression = '';
                            if(this._parseDistinctString()) {
                                distinct = true;
                            } else {
                                distinct = false;
                            }
                            state = SQLSelectExpressionParserState.SQL_READING_FUNCTION_COUNT;
                            break;
                        default:
                            state = SQLSelectExpressionParserState.SQL_READ_NO_QUOTE_VALUE;
                            selectExpression += character;
                            break;
                    }
                    break;
                case SQLSelectExpressionParserState.SQL_READING_FUNCTION_COUNT:
                    switch (character) {
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            break;
                        case ')':
                            sqlSelectExpression = new SQLCountAggregateFunction(selectExpression);
                            sqlSelectExpression.setDistinct(distinct);
                            state = SQLSelectExpressionParserState.SQL_CSSTRING_NEXT;
                            this._mark();
                            break;
                        default:
                            selectExpression += character;
                            break;
                    }
                    break;
                case SQLSelectExpressionParserState.SQL_M:
                    switch (character) {
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            sqlSelectExpression = new SQLSelectExpression(selectExpression);
                            state = SQLSelectExpressionParserState.SQL_CSSTRING_NEXT;
                            this._mark();
                            break;
                        case ',':
                            sqlSelectExpression = new SQLSelectExpression(selectExpression);
                            return sqlSelectExpression;
                        case 'A':
                        case 'a':
                            state = SQLSelectExpressionParserState.SQL_MA;
                            selectExpression += character;
                            break;
                        case 'I':
                        case 'i':
                            state = SQLSelectExpressionParserState.SQL_MI;
                            selectExpression += character;
                            break;
                        default:
                            state = SQLSelectExpressionParserState.SQL_READ_NO_QUOTE_VALUE;
                            selectExpression += character;
                            break;
                    }
                    break;
                case SQLSelectExpressionParserState.SQL_MA:
                    switch (character) {
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            sqlSelectExpression = new SQLSelectExpression(selectExpression);
                            state = SQLSelectExpressionParserState.SQL_CSSTRING_NEXT;
                            this._mark();
                            break;
                        case ',':
                            sqlSelectExpression = new SQLSelectExpression(selectExpression);
                            return sqlSelectExpression;
                        case 'X':
                        case 'x':
                            state = SQLSelectExpressionParserState.SQL_MAX;
                            selectExpression += character;
                            break;
                        default:
                            state = SQLSelectExpressionParserState.SQL_READ_NO_QUOTE_VALUE;
                            selectExpression += character;
                            break;
                    }
                    break;
                case SQLSelectExpressionParserState.SQL_MAX:
                    switch (character) {
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            break;
                        case ',':
                            sqlSelectExpression = new SQLSelectExpression(selectExpression);
                            return sqlSelectExpression;
                        case '(':
                            selectExpression = '';
                            if(this._parseDistinctString()) {
                                distinct = true;
                            } else {
                                distinct = false;
                            }
                            state = SQLSelectExpressionParserState.SQL_READING_FUNCTION_MAX;
                            break;
                        default:
                            state = SQLSelectExpressionParserState.SQL_READ_NO_QUOTE_VALUE;
                            selectExpression += character;
                            break;
                    }
                    break;
                case SQLSelectExpressionParserState.SQL_READING_FUNCTION_MAX:
                    switch (character) {
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            break;
                        case ')':
                            sqlSelectExpression = new SQLMaxAggregateFunction(selectExpression);
                            sqlSelectExpression.setDistinct(distinct);
                            state = SQLSelectExpressionParserState.SQL_CSSTRING_NEXT;
                            this._mark();
                            break;
                        default:
                            selectExpression += character;
                            break;
                    }
                    break;
                case SQLSelectExpressionParserState.SQL_MI:
                    switch (character) {
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            sqlSelectExpression = new SQLSelectExpression(selectExpression);
                            state = SQLSelectExpressionParserState.SQL_CSSTRING_NEXT;
                            this._mark();
                            break;
                        case ',':
                            sqlSelectExpression = new SQLSelectExpression(selectExpression);
                            return sqlSelectExpression;
                        case 'N':
                        case 'n':
                            state = SQLSelectExpressionParserState.SQL_MIN;
                            selectExpression += character;
                            break;
                        default:
                            state = SQLSelectExpressionParserState.SQL_READ_NO_QUOTE_VALUE;
                            selectExpression += character;
                            break;
                    }
                    break;
                case SQLSelectExpressionParserState.SQL_MIN:
                    switch (character) {
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            break;
                        case ',':
                            sqlSelectExpression = new SQLSelectExpression(selectExpression);
                            return sqlSelectExpression;
                        case '(':
                            selectExpression = '';
                            if(this._parseDistinctString()) {
                                distinct = true;
                            } else {
                                distinct = false;
                            }
                            state = SQLSelectExpressionParserState.SQL_READING_FUNCTION_MIN;
                            break;
                        default:
                            state = SQLSelectExpressionParserState.SQL_READ_NO_QUOTE_VALUE;
                            selectExpression += character;
                            break;
                    }
                    break;
                case SQLSelectExpressionParserState.SQL_READING_FUNCTION_MIN:
                    switch (character) {
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            break;
                        case ')':
                            sqlSelectExpression = new SQLMinAggregateFunction(selectExpression);
                            sqlSelectExpression.setDistinct(distinct);
                            state = SQLSelectExpressionParserState.SQL_CSSTRING_NEXT;
                            this._mark();
                            break;
                        default:
                            selectExpression += character;
                            break;
                    }
                    break;
                case SQLSelectExpressionParserState.SQL_S:
                    switch (character) {
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            sqlSelectExpression = new SQLSelectExpression(selectExpression);
                            state = SQLSelectExpressionParserState.SQL_CSSTRING_NEXT;
                            this._mark();
                            break;
                        case ',':
                            sqlSelectExpression = new SQLSelectExpression(selectExpression);
                            return sqlSelectExpression;
                        case 'U':
                        case 'u':
                            state = SQLSelectExpressionParserState.SQL_SU;
                            selectExpression += character;
                            break;
                        default:
                            state = SQLSelectExpressionParserState.SQL_READ_NO_QUOTE_VALUE;
                            selectExpression += character;
                            break;
                    }
                    break;
                case SQLSelectExpressionParserState.SQL_SU:
                    switch (character) {
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            sqlSelectExpression = new SQLSelectExpression(selectExpression);
                            state = SQLSelectExpressionParserState.SQL_CSSTRING_NEXT;
                            this._mark();
                            break;
                        case ',':
                            sqlSelectExpression = new SQLSelectExpression(selectExpression);
                            return sqlSelectExpression;
                        case 'M':
                        case 'm':
                            state = SQLSelectExpressionParserState.SQL_SUM;
                            selectExpression += character;
                            break;
                        default:
                            state = SQLSelectExpressionParserState.SQL_READ_NO_QUOTE_VALUE;
                            selectExpression += character;
                            break;
                    }
                    break;
                case SQLSelectExpressionParserState.SQL_SUM:
                    switch (character) {
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            break;
                        case ',':
                            sqlSelectExpression = new SQLSelectExpression(selectExpression);
                            return sqlSelectExpression;
                        case '(':
                            selectExpression = '';
                            if(this._parseDistinctString()) {
                                distinct = true;
                            } else {
                                distinct = false;
                            }
                            state = SQLSelectExpressionParserState.SQL_READING_FUNCTION_SUM;
                            break;
                        default:
                            state = SQLSelectExpressionParserState.SQL_READ_NO_QUOTE_VALUE;
                            selectExpression += character;
                            break;
                    }
                    break;
                case SQLSelectExpressionParserState.SQL_READING_FUNCTION_SUM:
                    switch (character) {
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            break;
                        case ')':
                            sqlSelectExpression = new SQLSumAggregateFunction(selectExpression);
                            sqlSelectExpression.setDistinct(distinct);
                            state = SQLSelectExpressionParserState.SQL_CSSTRING_NEXT;
                            this._mark();
                            break;
                        default:
                            selectExpression += character;
                            break;
                    }
                    break;
                case SQLSelectExpressionParserState.SQL_READ_SQUARE_BRACKET_VALUE:
                    switch(character) {
                        case ']':
                            sqlSelectExpression = new SQLSelectExpression(selectExpression);
                            state = SQLSelectExpressionParserState.SQL_CSSTRING_NEXT;
                            this._mark();
                            break;
                        default:
                            selectExpression += character;
                            break;
                    }
                    break;
                case SQLSelectExpressionParserState.SQL_READ_DOUBLE_QUOTE_VALUE:
                    switch(character) {
                        case '"':
                            sqlSelectExpression = new SQLSelectExpression(selectExpression);
                            state = SQLSelectExpressionParserState.SQL_CSSTRING_NEXT;
                            this._mark();
                            break;
                        default:
                            selectExpression += character;
                            break;
                    }
                    break;
                case SQLSelectExpressionParserState.SQL_READ_SINGLE_QUOTE_VALUE:
                    switch(character) {
                        case '\'':
                            sqlSelectExpression = new SQLSelectExpression(selectExpression);
                            state = SQLSelectExpressionParserState.SQL_CSSTRING_NEXT;
                            this._mark();
                            break;
                        default:
                            selectExpression += character;
                            break;
                    }
                    break;
                case SQLSelectExpressionParserState.SQL_READ_NO_QUOTE_VALUE:
                    switch (character) {
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            sqlSelectExpression = new SQLSelectExpression(selectExpression);
                            state = SQLSelectExpressionParserState.SQL_CSSTRING_NEXT;
                            this._mark();
                            break;
                        case ',':
                            sqlSelectExpression = new SQLSelectExpression(selectExpression);
                            return sqlSelectExpression;
                        default:
                            selectExpression += character;
                            break;
                    }
                    break;
                case SQLSelectExpressionParserState.SQL_CSSTRING_NEXT:
                    switch (character) {
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            break;
                        case ',':
                            return sqlSelectExpression;
                        case 'A':
                        case 'a':
                            state = SQLSelectExpressionParserState.SQL_ALIAS_A;
                            break;
                        default:
                        	this._toMark();
                            return sqlSelectExpression;
                    }
                    break;
                case SQLSelectExpressionParserState.SQL_ALIAS_A:
                    switch(character) {
                        case 'S':
                        case 's':
                            state = SQLSelectExpressionParserState.SQL_ALIAS_AS;
                            break;
                        default:
                            // This really should not happen...
                            this._toMark();
                            return sqlSelectExpression;
                    }
                    break;
                case SQLSelectExpressionParserState.SQL_ALIAS_AS:
                    switch(character) {
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            alias = '';
                            state = SQLSelectExpressionParserState.SQL_READ_ALIAS;
                            break;
                        default:
                            // This really should not happen...
                            this._toMark();
                            return sqlSelectExpression;
                    }
                    break;
                case SQLSelectExpressionParserState.SQL_READ_ALIAS:
                    switch(character) {
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            break;
                        case '[':
                            state = SQLSelectExpressionParserState.SQL_READ_ALIAS_SQUARE_BRACKET;
                            break;
                        case '"':
                            state = SQLSelectExpressionParserState.SQL_READ_ALIAS_DOUBLE_QUOTE;
                            break;
                        case '\'':
                            state = SQLSelectExpressionParserState.SQL_READ_ALIAS_SINGLE_QUOTE;
                            break;
                        case ',':
                            return sqlSelectExpression;
                        default:
                            alias += character;
                            state = SQLSelectExpressionParserState.SQL_READ_ALIAS_NO_QUOTE;
                            break;
                    }
                    break;
                case SQLSelectExpressionParserState.SQL_READ_ALIAS_SQUARE_BRACKET:
                    switch(character) {
                        case ']':
                            sqlSelectExpression.setAlias(alias);
                            alias = '';
                            state = SQLSelectExpressionParserState.SQL_CSSTRING_NEXT;  
                            this._mark();
                            break;
                        default:
                            alias += character;
                            break;
                    }
                    break;
                case SQLSelectExpressionParserState.SQL_READ_ALIAS_DOUBLE_QUOTE:
                    switch(character) {
                        case '"':
                            sqlSelectExpression.setAlias(alias);
                            alias = '';
                            state = SQLSelectExpressionParserState.SQL_CSSTRING_NEXT;  
                            this._mark();
                            break;
                        default:
                            alias += character;
                            break;
                    }
                    break;
                case SQLSelectExpressionParserState.SQL_READ_ALIAS_SINGLE_QUOTE:
                    switch(character) {
                        case '\'':
                            sqlSelectExpression.setAlias(alias);
                            alias = '';
                            state = SQLSelectExpressionParserState.SQL_CSSTRING_NEXT;  
                            this._mark();
                            break;
                        default:
                            alias += character;
                            break;
                    }
                    break;
                case SQLSelectExpressionParserState.SQL_READ_ALIAS_NO_QUOTE:
                    switch(character) {
                        case ' ':
                        case '\r':
                        case '\t':
                        case '\n':
                            sqlSelectExpression.setAlias(alias);
                            alias = '';
                            state = SQLSelectExpressionParserState.SQL_CSSTRING_NEXT;  
                            this._mark();
                            break;
                        case ',':
                            sqlSelectExpression.setAlias(alias);
                            return sqlSelectExpression;
                        default:
                            alias += character;
                            break;
                    }
                    break;
                default:
                    break;
            }
        }
        if(sqlSelectExpression === null) {
            if(selectExpression.length > 0) {
                sqlSelectExpression = new SQLSelectExpression(selectExpression);
            }
        }
        if(alias.length > 0) {
            sqlSelectExpression.setAlias(alias);
        }
        return sqlSelectExpression;
    }
}

module.exports = SQLSelectExpressionParser;