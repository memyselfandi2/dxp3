/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-lang-sql
 *
 * NAME
 * SQLConditionParser
 */
const packageName = 'dxp3-lang-sql';
const moduleName = 'SQLConditionParser';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * @module dxp3-lang-sql/SQLConditionParser
 */
const logging = require('dxp3-logging');
const SQLAndCondition = require('./SQLAndCondition');
const SQLColumn = require('./SQLColumn');
const SQLOrCondition = require('./SQLOrCondition');
const SQLConditionParserState = require('./SQLConditionParserState');
const SQLLessCondition = require('./SQLLessCondition');
const SQLLessOrEqualCondition = require('./SQLLessOrEqualCondition');
const SQLLikeCondition = require('./SQLLikeCondition');
const SQLGreaterCondition = require('./SQLGreaterCondition');
const SQLGreaterOrEqualCondition = require('./SQLGreaterOrEqualCondition');
const SQLEqualCondition = require('./SQLEqualCondition');
const SQLNotEqualCondition = require('./SQLNotEqualCondition');
const SQLInCondition = require('./SQLInCondition');

const logger = logging.getLogger(canonicalName);

const OPERATOR = {
    EQUAL: 2090,
    NOT_EQUAL: 3000,
    LESS_THAN: 3010,
    LESS_THAN_EQUAL: 3020,
    LIKE: 3030,
    GREATER_THAN: 3040,
    GREATER_THAN_EQUAL: 3050
}

class SQLConditionParser {

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
         * condition it is, so set state to SQLConditionParserState.SQL_
         */
        this._setState(SQLConditionParserState.SQL_);
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

    async nextSQLCondition() {
        return this._parseCondition();
    }

    _parseCondition() {
        let sqlCondition = null;
        let sqlConditionOne;
        let sqlConditionTwo;
        let state = SQLConditionParserState.SQL_;
        let character = null;
        while ((character = this._read()) != null) {
            switch (state) {
                case SQLConditionParserState.SQL_:
                    switch (character) {
                        // Remove whitespace
                        case ' ':
                        case '\r':
                        case '\t':
                            break;
                        case ';':
                            return null;
                        case '(':
                            sqlCondition = this._parseCondition();
                            if(sqlCondition === null) {
                                state = SQLConditionParserState.SQL_ERROR;
                            } else {
                                state = SQLConditionParserState.SQL_LP_CONDITION;
                            }
                            break;
                        // Start of a condition
                        default:
                            this._unread();
                            sqlCondition = this._parseSingleCondition();
                            if(sqlCondition === null) {
                                state = SQLConditionParserState.SQL_ERROR;
                            } else {
                                state = SQLConditionParserState.SQL_OPERATOR;
                            }
                            break;
                    }
                    break;
                case SQLConditionParserState.SQL_LP_CONDITION:
                    switch (character) {
                        case ' ':
                        case '\r':
                        case '\t':
                            break;
                        case ')':
                            state = SQLConditionParserState.SQL_OPERATOR;
                            break;
                        default:
                            state = SQLConditionParserState.SQL_ERROR;
                            break;
                    }
                    break;
                case SQLConditionParserState.SQL_OPERATOR:
                    switch (character) {
                        case ' ':
                        case '\r':
                        case '\t':
                            break;
                        case ';':
                        case ')':
                            this._unread();
                            return sqlCondition;
                        case 'A':
                        case 'a':
                            state = SQLConditionParserState.SQL_A;
                            break;
                        case 'O':
                        case 'o':
                            state = SQLConditionParserState.SQL_O;
                            break;
                        default:
                            state = SQLConditionParserState.SQL_ERROR;
                            break;
                    }
                    break;
                case SQLConditionParserState.SQL_A:
                    switch (character) {
                        case 'N':
                        case 'n':
                            state = SQLConditionParserState.SQL_AN;
                            break;
                        default:
                            state = SQLConditionParserState.SQL_ERROR;
                            break;
                    }
                    break;
                case SQLConditionParserState.SQL_O:
                    switch (character) {
                        case 'R':
                        case 'r':
                            state = SQLConditionParserState.SQL_OR;
                            break;
                        default:
                            state = SQLConditionParserState.SQL_ERROR;
                            break;
                    }
                    break;
                case SQLConditionParserState.SQL_AN:
                    switch (character) {
                        case 'D':
                        case 'd':
                            state = SQLConditionParserState.SQL_AND;
                            break;
                        default:
                            state = SQLConditionParserState.SQL_ERROR;
                            break;
                    }
                    break;
                case SQLConditionParserState.SQL_OR:
                    switch (character) {
                        case ' ':
                        case '\r':
                        case '\t':
                            sqlConditionOne = sqlCondition;
                            sqlConditionTwo = this._parseCondition();
                            if(sqlConditionTwo === null) {
                                state = SQLConditionParserState.SQL_ERROR;
                            } else {
                                sqlCondition = new SQLOrCondition(sqlConditionOne, sqlConditionTwo);
                                state = SQLConditionParserState.SQL_OPERATOR;
                            }
                            break;
                        default:
                            state = SQLConditionParserState.SQL_ERROR;
                            break;
                    }
                    break;
                case SQLConditionParserState.SQL_AND:
                    switch (character) {
                        case ' ':
                        case '\r':
                        case '\t':
                            sqlConditionOne = sqlCondition;
                            sqlConditionTwo = this._parseCondition();
                            if(sqlCondition === null) {
                                state = SQLConditionParserState.SQL_ERROR;
                            } else {
                                sqlCondition = new SQLAndCondition(sqlConditionOne, sqlConditionTwo);
                                state = SQLConditionParserState.SQL_OPERATOR;
                            }
                            break;
                        default:
                            state = SQLConditionParserState.SQL_ERROR;
                            break;
                    }
                    break;
                case SQLConditionParserState.SQL_ERROR:
                    throw new Error("Error in parsing condition");
                // Should never be reached!
                default:
                    break;
            }
        }
        return sqlCondition;
	}

    _parseStringsBetweenParenthesis() {
    	let values = [];
        let value = null;
        let state = SQLConditionParserState.SQL_;
        let character = null;
        this._mark();
        while ((character = this._read()) != null) {
            switch (state) {
                case SQLConditionParserState.SQL_:
                    switch (character) {
                        case ' ':
                        case '\r':
                        case '\t':
                            break;
                        case '(':
                            state = SQLConditionParserState.SQL_LP;
                            break;
                        default:
                            this._toMark();
		                    return null;
                    }
                    break;
                case SQLConditionParserState.SQL_LP:
                    switch (character) {
                        case ' ':
                        case '\r':
                        case '\t':
                        case ',':
                            break;
                        case ')':
                            return values;
                        case '\'':
                            state = SQLConditionParserState.SQL_READ_SINGLE_QUOTED_VALUE;
                            value = "";
                            break;
                        case '"':
                            state = SQLConditionParserState.SQL_READ_DOUBLE_QUOTED_VALUE;
                            value = "";
                            break;
                        case 'F':
                        case 'f':
                            state = SQLConditionParserState.SQL_READ_NO_QUOTED_VALUE_F;
                            value = '' + character;
                            break;
                        case 'T':
                        case 't':
                            state = SQLConditionParserState.SQL_READ_NO_QUOTED_VALUE_T;
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
                            state = SQLConditionParserState.SQL_READ_NO_QUOTED_VALUE_NUMBER;
                            value = '' + character;
                            break;
                        default:
                            state = SQLConditionParserState.SQL_READ_NO_QUOTED_VALUE;
                            value = "";
                            value += character;
                            break;
                    }
                    break;
                case SQLConditionParserState.SQL_READ_SINGLE_QUOTED_VALUE:
                    switch (character) {
                        case '\'':
                            values.push(value);
                            state = SQLConditionParserState.SQL_LP;
                            break;
                        default:
                            value += character;
                            break;
                    }
                    break;
                case SQLConditionParserState.SQL_READ_DOUBLE_QUOTED_VALUE:
                    switch (character) {
                        case '"':
                            values.push(value);
                            state = SQLConditionParserState.SQL_LP;
                            break;
                        default:
                            value += character;
                            break;
                    }
                    break;
                case SQLConditionParserState.SQL_READ_NO_QUOTED_VALUE_NUMBER:
                    switch(character) {
                        case ',':
                            values.push(parseInt(value));
                            state = SQLConditionParserState.SQL_LP;
                            break;
                        case ')':
                            values.push(parseInt(value));
                            return values;
                        case '.':
                            value += character;
                            state = SQLConditionParserState.SQL_READ_NO_QUOTED_VALUE_NUMBER_DOT;
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
                            state = SQLConditionParserState.SQL_READ_NO_QUOTED_VALUE;
                            value += character;
                            break;
                    }
                    break;
                case SQLConditionParserState.SQL_READ_NO_QUOTED_VALUE_NUMBER_DOT:
                    switch(character) {
                        case ',':
                            values.push(parseFloat(value));
                            state = SQLConditionParserState.SQL_LP;
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
                            state = SQLConditionParserState.SQL_READ_NO_QUOTED_VALUE;
                            value += character;
                            break;
                    }
                    break;
                case SQLConditionParserState.SQL_READ_NO_QUOTED_VALUE_F:
                    switch (character) {
                        case ',':
                            values.push(value);
                            state = SQLConditionParserState.SQL_LP;
                            break;
                        case ')':
                            values.push(value);
                            return values;
                        case 'A':
                        case 'a':
                            state = SQLConditionParserState.SQL_READ_NO_QUOTED_VALUE_FA;
                            value += character;
                            break;
                        default:
                            state = SQLConditionParserState.SQL_READ_NO_QUOTED_VALUE;
                            value += character;
                            break;
                    }
                    break;
                case SQLConditionParserState.SQL_READ_NO_QUOTED_VALUE_FA:
                    switch (character) {
                        case ',':
                            values.push(value);
                            state = SQLConditionParserState.SQL_LP;
                            break;
                        case ')':
                            values.push(value);
                            return values;
                        case 'L':
                        case 'l':
                            state = SQLConditionParserState.SQL_READ_NO_QUOTED_VALUE_FAL;
                            value += character;
                            break;
                        default:
                            state = SQLConditionParserState.SQL_READ_NO_QUOTED_VALUE;
                            value += character;
                            break;
                    }
                    break;
                case SQLConditionParserState.SQL_READ_NO_QUOTED_VALUE_FAL:
                    switch (character) {
                        case ',':
                            values.push(value);
                            state = SQLConditionParserState.SQL_LP;
                            break;
                        case ')':
                            values.push(value);
                            return values;
                        case 'S':
                        case 's':
                            state = SQLConditionParserState.SQL_READ_NO_QUOTED_VALUE_FALS;
                            value += character;
                            break;
                        default:
                            state = SQLConditionParserState.SQL_READ_NO_QUOTED_VALUE;
                            value += character;
                            break;
                    }
                    break;
                case SQLConditionParserState.SQL_READ_NO_QUOTED_VALUE_FALS:
                    switch (character) {
                        case ',':
                            values.push(value);
                            state = SQLConditionParserState.SQL_LP;
                            break;
                        case ')':
                            values.push(value);
                            return values;
                        case 'E':
                        case 'e':
                            state = SQLConditionParserState.SQL_READ_NO_QUOTED_VALUE_FALSE;
                            value += character;
                            break;
                        default:
                            state = SQLConditionParserState.SQL_READ_NO_QUOTED_VALUE;
                            value += character;
                            break;
                    }
                    break;
                case SQLConditionParserState.SQL_READ_NO_QUOTED_VALUE_FALSE:
                    switch (character) {
                        case ' ':
                        case '\r':
                        case '\t':
                            break;
                        case ',':
                            values.push(false);
                            state = SQLConditionParserState.SQL_LP;
                            break;
                        case ')':
                            values.push(false);
                            return values;
                        default:
                            state = SQLConditionParserState.SQL_READ_NO_QUOTED_VALUE;
                            value += character;
                            break;
                    }
                    break;
                case SQLConditionParserState.SQL_READ_NO_QUOTED_VALUE_T:
                    switch (character) {
                        case ',':
                            values.push(value);
                            state = SQLConditionParserState.SQL_LP;
                            break;
                        case ')':
                            values.push(value);
                            return values;
                        case 'R':
                        case 'r':
                            state = SQLConditionParserState.SQL_READ_NO_QUOTED_VALUE_TR;
                            value += character;
                            break;
                        default:
                            state = SQLConditionParserState.SQL_READ_NO_QUOTED_VALUE;
                            value += character;
                            break;
                    }
                    break;
                case SQLConditionParserState.SQL_READ_NO_QUOTED_VALUE_TR:
                    switch (character) {
                        case ',':
                            values.push(value);
                            state = SQLConditionParserState.SQL_LP;
                            break;
                        case ')':
                            values.push(value);
                            return values;
                        case 'U':
                        case 'u':
                            state = SQLConditionParserState.SQL_READ_NO_QUOTED_VALUE_TRU;
                            value += character;
                            break;
                        default:
                            state = SQLConditionParserState.SQL_READ_NO_QUOTED_VALUE;
                            value += character;
                            break;
                    }
                    break;
                case SQLConditionParserState.SQL_READ_NO_QUOTED_VALUE_TRU:
                    switch (character) {
                        case ',':
                            values.push(value);
                            state = SQLConditionParserState.SQL_LP;
                            break;
                        case ')':
                            values.push(value);
                            return values;
                        case 'E':
                        case 'e':
                            state = SQLConditionParserState.SQL_READ_NO_QUOTED_VALUE_TRUE;
                            value += character;
                            break;
                        default:
                            state = SQLConditionParserState.SQL_READ_NO_QUOTED_VALUE;
                            value += character;
                            break;
                    }
                    break;
                case SQLConditionParserState.SQL_READ_NO_QUOTED_VALUE_TRUE:
                    switch (character) {
                        case ' ':
                        case '\r':
                        case '\t':
                            break;
                        case ',':
                            values.push(true);
                            state = SQLConditionParserState.SQL_LP;
                            break;
                        case ')':
                            values.push(true);
                            return values;
                        default:
                            state = SQLConditionParserState.SQL_READ_NO_QUOTED_VALUE;
                            value += character;
                            break;
                    }
                    break;
                case SQLConditionParserState.SQL_READ_NO_QUOTED_VALUE:
                    switch (character) {
                        case ',':
                            values.push(value.trim());
                            state = SQLConditionParserState.SQL_LP;
                            break;
                        case ')':
                            values.push(value.trim());
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

    _parseSingleCondition() {
        let leftOperand = '';
        let operator = null;
        let rightOperand = null;
        let state = SQLConditionParserState.SQL_LEFT_OPERAND;
        let character = null;
        while ((character = this._read()) != null) {
            switch (state) {
                case SQLConditionParserState.SQL_LEFT_OPERAND:
                    switch (character) {
                        case ' ':
                        case '\r':
                        case '\t':
                            state = SQLConditionParserState.SQL_OPERATOR;
                            break;
                        // Start of the operator.
                        // We are finished reading
                        // the left operand
                        case '<':
                            state = SQLConditionParserState.SQL_OPERATOR_LT;
                            break;
                        case '>':
                            state = SQLConditionParserState.SQL_OPERATOR_GT;
                            break;
                        case '=':
                            state = SQLConditionParserState.SQL_RIGHT_OPERAND;
                            operator = OPERATOR.EQUAL;
                            break;
                        case '!':
                            state = SQLConditionParserState.SQL_OPERATOR_EX;
                            break;
                        // Otherwise we assume all characters
                        // belong to our left operand
                        default:
                            leftOperand += character;
                            break;
                    }
                    break;
                case SQLConditionParserState.SQL_OPERATOR_L:
                    switch(character) {
                        case 'I':
                        case 'i':
                            state = SQLConditionParserState.SQL_OPERATOR_LI;
                            break;
                        default:
                            state = SQLConditionParserState.SQL_ERROR;
                            break;
                    }
                    break;
                case SQLConditionParserState.SQL_OPERATOR_LI:
                    switch(character) {
                        case 'K':
                        case 'k':
                            state = SQLConditionParserState.SQL_OPERATOR_LIK;
                            break;
                        default:
                            state = SQLConditionParserState.SQL_ERROR;
                            break;
                    }
                    break;
                case SQLConditionParserState.SQL_OPERATOR_LIK:
                    switch(character) {
                        case 'E':
                        case 'e':
                            state = SQLConditionParserState.SQL_OPERATOR_LIKE;
                            break;
                        default:
                            state = SQLConditionParserState.SQL_ERROR;
                            break;
                    }
                    break;
                case SQLConditionParserState.SQL_OPERATOR_LIKE:
                    switch(character) {
                        case ' ':
                        case '\r':
                        case '\t':
                            break;
                        case '\'':
                            operator = OPERATOR.LIKE;
                            state = SQLConditionParserState.SQL_RIGHT_OPERAND_SINGLE_QUOTE_STRING;
                            rightOperand = "";
                            break;
                        case '"':
                            operator = OPERATOR.LIKE;
                            state = SQLConditionParserState.SQL_RIGHT_OPERAND_DOUBLE_QUOTE_STRING;
                            rightOperand = "";
                            break;
                        default:
                            state = SQLConditionParserState.SQL_ERROR;
                            break;
                    }
                    break;
                case SQLConditionParserState.SQL_OPERATOR_I:
                    switch(character) {
                        case 'N':
                        case 'n':
                            state = SQLConditionParserState.SQL_OPERATOR_IN;
                            break;
                        default:
                            state = SQLConditionParserState.SQL_ERROR;
                            break;
                    }
                    break;
                case SQLConditionParserState.SQL_OPERATOR_IN:
                    switch(character) {
                        case ' ':
                        case '\r':
                        case '\t':
                            break;
                        case '(':
                            this._unread();
                            let values = this._parseStringsBetweenParenthesis();
                            return new SQLInCondition(leftOperand, values);
                        default:
                            state = SQLConditionParserState.SQL_ERROR;
                            break;
                    }
                    break;
                case SQLConditionParserState.SQL_OPERATOR:
                    switch (character) {
                        // Ignore whitespace
                        case ' ':
                        case '\r':
                        case '\t':
                            break;
                        // Start of the operator
                        case '<':
                            state = SQLConditionParserState.SQL_OPERATOR_LT;
                            break;
                        case '>':
                            state = SQLConditionParserState.SQL_OPERATOR_GT;
                            break;
                        case '=':
                            state = SQLConditionParserState.SQL_RIGHT_OPERAND;
                            operator = OPERATOR.EQUAL;
                            break;
                        case '!':
                            state = SQLConditionParserState.SQL_OPERATOR_EX;
                            break;
                        case 'I':
                        case 'i':
                            state = SQLConditionParserState.SQL_OPERATOR_I;
                            break;
                        case 'L':
                        case 'l':
                            state = SQLConditionParserState.SQL_OPERATOR_L;
                            break;
                        // Other characters indicate
                        // an error
                        default:
                            state = SQLConditionParserState.SQL_ERROR;
                            break;
                    }
                    break;
                case SQLConditionParserState.SQL_OPERATOR_LT:
                    switch (character) {
                        case ' ':
                        case '\t':
                        case '\r':
                            state = SQLConditionParserState.SQL_RIGHT_OPERAND;
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
                            state = SQLConditionParserState.SQL_RIGHT_OPERAND_NUMBER;
                            operator = OPERATOR.LESS_THAN;
                            rightOperand = "";
                            rightOperand += character;
                            break;
                        case '=':
                            state = SQLConditionParserState.SQL_RIGHT_OPERAND;
                            operator = OPERATOR.LESS_THAN_EQUAL;
                            break;
                        case '>':
                            state = SQLConditionParserState.SQL_RIGHT_OPERAND;
                            operator = OPERATOR.NOT_EQUAL;
                            break;
                        default:
                            state = SQLConditionParserState.SQL_ERROR;
                            break;
                    }
                    break;
                case SQLConditionParserState.SQL_OPERATOR_GT:
                    switch (character) {
                        case ' ':
                        case '\t':
                        case '\r':
                            state = SQLConditionParserState.SQL_RIGHT_OPERAND;
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
                            state = SQLConditionParserState.SQL_RIGHT_OPERAND_NUMBER;
                            operator = OPERATOR.GREATER_THAN;
                            rightOperand = "";
                            rightOperand += character;
                            break;
                        case '=':
                            state = SQLConditionParserState.SQL_RIGHT_OPERAND;
                            operator = OPERATOR.GREATER_THAN_EQUAL;
                            break;
                        default:
                            state = SQLConditionParserState.SQL_ERROR;
                            break;
                    }
                    break;
                case SQLConditionParserState.SQL_OPERATOR_EX:
                    switch (character) {
                        case '=':
                            state = SQLConditionParserState.SQL_RIGHT_OPERAND;
                            operator = OPERATOR.NOT_EQUAL;
                            break;
                        default:
                            state = SQLConditionParserState.SQL_ERROR;
                            break;
                    }
                    break;
                case SQLConditionParserState.SQL_RIGHT_OPERAND:
                    switch (character) {
                        // Ignore whitespace
                        case ' ':
                        case '\r':
                        case '\t':
                            break;
                        // Any non-letter, non-number
                        // characters indicate an error
                        case '<':
                        case '>':
                        case '=':
                        case '!':
                        case '?':
                            state = SQLConditionParserState.SQL_ERROR;
                            break;
                        // A quote indicates the start of a string
                        case '\'':
                            state = SQLConditionParserState.SQL_RIGHT_OPERAND_SINGLE_QUOTE_STRING;
                            rightOperand = "";
                            break;
                        case '"':
                            state = SQLConditionParserState.SQL_RIGHT_OPERAND_DOUBLE_QUOTE_STRING;
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
                            state = SQLConditionParserState.SQL_RIGHT_OPERAND_NUMBER;
                            rightOperand = "";
                            rightOperand += character;
                            break;
                        // Potential UNDEFINED
                        case 'U':
                        case 'u':
                            state = SQLConditionParserState.SQL_RIGHT_OPERAND_U;
                            rightOperand = "";
                            rightOperand += character;
                            break;
                        // Potential TRUE indicating a boolean
                        case 'T':
                        case 't':
                            state = SQLConditionParserState.SQL_RIGHT_OPERAND_T;
                            rightOperand = "";
                            rightOperand += character;
                            break;
                        // Potential FALSE indicating a boolean
                        case 'F':
                        case 'f':
                            state = SQLConditionParserState.SQL_RIGHT_OPERAND_F;
                            rightOperand = "";
                            rightOperand += character;
                            break;
                        // Any other character indicates the start
                        // of a column name
                        default:
                            state = SQLConditionParserState.SQL_RIGHT_OPERAND_COLUMN;
                            rightOperand = "";
                            rightOperand += character;
                            break;
                    }
                    break;
                case SQLConditionParserState.SQL_RIGHT_OPERAND_U:
                    switch (character) {
                        case ' ':
                        case '\t':
                        case '\r':
                            return this._builtColumnColumnSQLCondition(leftOperand, operator, rightOperand);
                        case ';':
                        case ')':
                            this._unread();
                            return this._builtColumnColumnSQLCondition(leftOperand, operator, rightOperand);
                        case 'N':
                        case 'n':
                            state = SQLConditionParserState.SQL_RIGHT_OPERAND_UN;
                            rightOperand += character;
                            break;
                        default:
                            state = SQLConditionParserState.SQL_RIGHT_OPERAND_COLUMN;
                            rightOperand += character;
                            break;
                    }
                    break;
                case SQLConditionParserState.SQL_RIGHT_OPERAND_UN:
                    switch (character) {
                        case ' ':
                        case '\t':
                        case '\r':
                            return this._builtColumnColumnSQLCondition(leftOperand, operator, rightOperand);
                        case ';':
                        case ')':
                            this._unread();
                            return this._builtColumnColumnSQLCondition(leftOperand, operator, rightOperand);
                        case 'D':
                        case 'd':
                            state = SQLConditionParserState.SQL_RIGHT_OPERAND_UND;
                            rightOperand += character;
                            break;
                        default:
                            state = SQLConditionParserState.SQL_RIGHT_OPERAND_COLUMN;
                            rightOperand += character;
                            break;
                    }
                    break;
                case SQLConditionParserState.SQL_RIGHT_OPERAND_UND:
                    switch (character) {
                        case ' ':
                        case '\t':
                        case '\r':
                            return this._builtColumnColumnSQLCondition(leftOperand, operator, rightOperand);
                        case ';':
                        case ')':
                            this._unread();
                            return this._builtColumnColumnSQLCondition(leftOperand, operator, rightOperand);
                        case 'E':
                        case 'e':
                            state = SQLConditionParserState.SQL_RIGHT_OPERAND_UNDE;
                            rightOperand += character;
                            break;
                        default:
                            state = SQLConditionParserState.SQL_RIGHT_OPERAND_COLUMN;
                            rightOperand += character;
                            break;
                    }
                    break;
                case SQLConditionParserState.SQL_RIGHT_OPERAND_UNDE:
                    switch (character) {
                        case ' ':
                        case '\t':
                        case '\r':
                            return this._builtColumnColumnSQLCondition(leftOperand, operator, rightOperand);
                        case ';':
                        case ')':
                            this._unread();
                            return this._builtColumnColumnSQLCondition(leftOperand, operator, rightOperand);
                        case 'F':
                        case 'f':
                            state = SQLConditionParserState.SQL_RIGHT_OPERAND_UNDEF;
                            rightOperand += character;
                            break;
                        default:
                            state = SQLConditionParserState.SQL_RIGHT_OPERAND_COLUMN;
                            rightOperand += character;
                            break;
                    }
                    break;
                case SQLConditionParserState.SQL_RIGHT_OPERAND_UNDEF:
                    switch (character) {
                        case ' ':
                        case '\t':
                        case '\r':
                            return this._builtColumnColumnSQLCondition(leftOperand, operator, rightOperand);
                        case ';':
                        case ')':
                            this._unread();
                            return this._builtColumnColumnSQLCondition(leftOperand, operator, rightOperand);
                        case 'I':
                        case 'i':
                            state = SQLConditionParserState.SQL_RIGHT_OPERAND_UNDEFI;
                            rightOperand += character;
                            break;
                        default:
                            state = SQLConditionParserState.SQL_RIGHT_OPERAND_COLUMN;
                            rightOperand += character;
                            break;
                    }
                    break;
                case SQLConditionParserState.SQL_RIGHT_OPERAND_UNDEFI:
                    switch (character) {
                        case ' ':
                        case '\t':
                        case '\r':
                            return this._builtColumnColumnSQLCondition(leftOperand, operator, rightOperand);
                        case ';':
                        case ')':
                            this._unread();
                            return this._builtColumnColumnSQLCondition(leftOperand, operator, rightOperand);
                        case 'N':
                        case 'n':
                            state = SQLConditionParserState.SQL_RIGHT_OPERAND_UNDEFIN;
                            rightOperand += character;
                            break;
                        default:
                            state = SQLConditionParserState.SQL_RIGHT_OPERAND_COLUMN;
                            rightOperand += character;
                            break;
                    }
                    break;
                case SQLConditionParserState.SQL_RIGHT_OPERAND_UNDEFIN:
                    switch (character) {
                        case ' ':
                        case '\t':
                        case '\r':
                            return this._builtColumnColumnSQLCondition(leftOperand, operator, rightOperand);
                        case ';':
                        case ')':
                            this._unread();
                            return this._builtColumnColumnSQLCondition(leftOperand, operator, rightOperand);
                        case 'E':
                        case 'e':
                            state = SQLConditionParserState.SQL_RIGHT_OPERAND_UNDEFINE;
                            rightOperand += character;
                            break;
                        default:
                            state = SQLConditionParserState.SQL_RIGHT_OPERAND_COLUMN;
                            rightOperand += character;
                            break;
                    }
                    break;
                case SQLConditionParserState.SQL_RIGHT_OPERAND_UNDEFINE:
                    switch (character) {
                        case ' ':
                        case '\t':
                        case '\r':
                            return this._builtColumnColumnSQLCondition(leftOperand, operator, rightOperand);
                        case ';':
                        case ')':
                            this._unread();
                            return this._builtColumnColumnSQLCondition(leftOperand, operator, rightOperand);
                        case 'D':
                        case 'd':
                            state = SQLConditionParserState.SQL_RIGHT_OPERAND_UNDEFINED;
                            rightOperand += character;
                            break;
                        default:
                            state = SQLConditionParserState.SQL_RIGHT_OPERAND_COLUMN;
                            rightOperand += character;
                            break;
                    }
                    break;
                case SQLConditionParserState.SQL_RIGHT_OPERAND_UNDEFINED:
                    switch (character) {
                        case ' ':
                        case '\t':
                        case '\r':
                            return this._builtColumnStringSQLCondition(leftOperand, operator, undefined);
                        case ';':
                        case ')':
                            this._unread();
                            return this._builtColumnStringSQLCondition(leftOperand, operator, undefined);
                        default:
                            state = SQLConditionParserState.SQL_RIGHT_OPERAND_COLUMN;
                            rightOperand += character;
                            break;
                    }
                    break;
                case SQLConditionParserState.SQL_RIGHT_OPERAND_T:
                    switch (character) {
                        case ' ':
                        case '\t':
                        case '\r':
                            return this._builtColumnColumnSQLCondition(leftOperand, operator, rightOperand);                            
                        case ';':
                        case ')':
                            this._unread();
                            return this._builtColumnColumnSQLCondition(leftOperand, operator, rightOperand);
                        case 'R':
                        case 'r':
                            state = SQLConditionParserState.SQL_RIGHT_OPERAND_TR;
                            rightOperand += character;
                            break;
                        default:
                            state = SQLConditionParserState.SQL_RIGHT_OPERAND_COLUMN;
                            rightOperand += character;
                            break;
                    }
                    break;
                case SQLConditionParserState.SQL_RIGHT_OPERAND_TR:
                    switch (character) {
                        case ' ':
                        case '\t':
                        case '\r':
                            return this._builtColumnColumnSQLCondition(leftOperand, operator, rightOperand);
                        case ';':
                        case ')':
                            this._unread();
                            return this._builtColumnColumnSQLCondition(leftOperand, operator, rightOperand);
                        case 'U':
                        case 'u':
                            state = SQLConditionParserState.SQL_RIGHT_OPERAND_TRU;
                            rightOperand += character;
                            break;
                        default:
                            state = SQLConditionParserState.SQL_RIGHT_OPERAND_COLUMN;
                            rightOperand += character;
                            break;
                    }
                    break;
                case SQLConditionParserState.SQL_RIGHT_OPERAND_TRU:
                    switch (character) {
                        case ' ':
                        case '\t':
                        case '\r':
                            return this._builtColumnColumnSQLCondition(leftOperand, operator, rightOperand);
                        case ';':
                        case ')':
                            this._unread();
                            return this._builtColumnColumnSQLCondition(leftOperand, operator, rightOperand);
                        case 'E':
                        case 'e':
                            state = SQLConditionParserState.SQL_RIGHT_OPERAND_TRUE;
                            rightOperand += character;
                            break;
                        default:
                            state = SQLConditionParserState.SQL_RIGHT_OPERAND_COLUMN;
                            rightOperand += character;
                            break;
                    }
                    break;
                case SQLConditionParserState.SQL_RIGHT_OPERAND_TRUE:
                    switch (character) {
                        case ' ':
                        case '\t':
                        case '\r':
                            return this._builtColumnBooleanSQLCondition(leftOperand, operator, true);
                        case ';':
                        case ')':
                            this._unread();
                            return this._builtColumnBooleanSQLCondition(leftOperand, operator, true);
                        default:
                            state = SQLConditionParserState.SQL_RIGHT_OPERAND_COLUMN;
                            rightOperand += character;
                            break;
                    }
                    break;
                case SQLConditionParserState.SQL_RIGHT_OPERAND_F:
                    switch (character) {
                        case ' ':
                        case '\t':
                        case '\r':
                            return this._builtColumnColumnSQLCondition(leftOperand, operator, rightOperand);
                        case ';':
                        case ')':
                            this._unread();
                            return this._builtColumnColumnSQLCondition(leftOperand, operator, rightOperand);
                        case 'A':
                        case 'a':
                            state = SQLConditionParserState.SQL_RIGHT_OPERAND_FA;
                            rightOperand += character;
                            break;
                        default:
                            state = SQLConditionParserState.SQL_RIGHT_OPERAND_COLUMN;
                            rightOperand += character;
                            break;
                    }
                    break;
                case SQLConditionParserState.SQL_RIGHT_OPERAND_FA:
                    switch (character) {
                        case ' ':
                        case '\t':
                        case '\r':
                            return this._builtColumnColumnSQLCondition(leftOperand, operator, rightOperand);
                        case ';':
                        case ')':
                            this._unread();
                            return this._builtColumnColumnSQLCondition(leftOperand, operator, rightOperand);
                        case 'L':
                        case 'l':
                            state = SQLConditionParserState.SQL_RIGHT_OPERAND_FAL;
                            rightOperand += character;
                            break;
                        default:
                            state = SQLConditionParserState.SQL_RIGHT_OPERAND_COLUMN;
                            rightOperand += character;
                            break;
                    }
                    break;
                case SQLConditionParserState.SQL_RIGHT_OPERAND_FAL:
                    switch (character) {
                        case ' ':
                        case '\t':
                        case '\r':
                            return this._builtColumnColumnSQLCondition(leftOperand, operator, rightOperand);
                        case ';':
                        case ')':
                            this._unread();
                            return this._builtColumnColumnSQLCondition(leftOperand, operator, rightOperand);
                        case 'S':
                        case 's':
                            state = SQLConditionParserState.SQL_RIGHT_OPERAND_FALS;
                            rightOperand += character;
                            break;
                        default:
                            state = SQLConditionParserState.SQL_RIGHT_OPERAND_COLUMN;
                            rightOperand += character;
                            break;
                    }
                    break;
                case SQLConditionParserState.SQL_RIGHT_OPERAND_FALS:
                    switch (character) {
                        case ' ':
                        case '\t':
                        case '\r':
                            return this._builtColumnColumnSQLCondition(leftOperand, operator, rightOperand);
                        case ';':
                        case ')':
                            this._unread();
                            return this._builtColumnColumnSQLCondition(leftOperand, operator, rightOperand);
                        case 'E':
                        case 'e':
                            state = SQLConditionParserState.SQL_RIGHT_OPERAND_FALSE;
                            rightOperand += character;
                            break;
                        default:
                            state = SQLConditionParserState.SQL_RIGHT_OPERAND_COLUMN;
                            rightOperand += character;
                            break;
                    }
                    break;
                case SQLConditionParserState.SQL_RIGHT_OPERAND_FALSE:
                    switch (character) {
                        case ' ':
                        case '\t':
                        case '\r':
                            return this._builtColumnBooleanSQLCondition(leftOperand, operator, false);
                        case ';':
                        case ')':
                            this._unread();
                            return this._builtColumnBooleanSQLCondition(leftOperand, operator, false);
                        default:
                            state = SQLConditionParserState.SQL_RIGHT_OPERAND_COLUMN;
                            rightOperand += character;
                            break;
                    }
                    break;
                case SQLConditionParserState.SQL_RIGHT_OPERAND_SINGLE_QUOTE_STRING:
                    switch (character) {
                        // The end of our quoted right operand
                        case '\'':
                            return this._builtColumnStringSQLCondition(leftOperand, operator, rightOperand);
                        default:
                            rightOperand += character;
                            break;
                    }
                    break;
                case SQLConditionParserState.SQL_RIGHT_OPERAND_DOUBLE_QUOTE_STRING:
                    switch (character) {
                        // The end of our quoted right operand
                        case '"':
                            return this._builtColumnStringSQLCondition(leftOperand, operator, rightOperand);
                        default:
                            rightOperand += character;
                            break;
                    }
                    break;
                case SQLConditionParserState.SQL_RIGHT_OPERAND_NUMBER:
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
                            return this._builtColumnNumberSQLCondition(leftOperand, operator, rightOperand);
                        case '.':
                            state = SQLConditionParserState.SQL_RIGHT_OPERAND_NUMBER_DOT;
                            rightOperand += character;
                            break;
                        case '/':
                            state = SQLConditionParserState.SQL_RIGHT_OPERAND_DATE;
                            rightOperand += character;
                            break;
                        case ';':
                        case ')':
                            this._unread();
                            return this._builtColumnNumberSQLCondition(leftOperand, operator, rightOperand);
                        default:
                            state = SQLConditionParserState.SQL_ERROR;
                            break;
                    }
                    break;
                case SQLConditionParserState.SQL_RIGHT_OPERAND_NUMBER_DOT:
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
                            return this._builtColumnNumberSQLCondition(leftOperand, operator, rightOperand);
                        case ';':
                        case ')':
                            this._unread();
                            return this._builtColumnNumberSQLCondition(leftOperand, operator, rightOperand);
                        default:
                            state = SQLConditionParserState.SQL_ERROR;
                            break;
                    }
                    break;
                case SQLConditionParserState.SQL_RIGHT_OPERAND_DATE:
                    switch (character) {
                        case ' ':
                        case '\t':
                        case '\r':
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
                case SQLConditionParserState.SQL_RIGHT_OPERAND_COLUMN:
                    switch (character) {
                        case ' ':
                        case '\r':
                        case '\t':
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
                case SQLConditionParserState.SQL_ERROR:
                    throw new Error("Error in parsing condition ");
                // Should never be reached!!!
                default:
                    break;
            }
        }
        switch(state) {
            case SQLConditionParserState.SQL_RIGHT_OPERAND_FALSE:
                return this._builtColumnBooleanSQLCondition(leftOperand, operator, false);
            case SQLConditionParserState.SQL_RIGHT_OPERAND_TRUE:
                return this._builtColumnBooleanSQLCondition(leftOperand, operator, true);
            case SQLConditionParserState.SQL_RIGHT_OPERAND_UNDEFINED:
                return this._builtColumnUndefinedSQLCondition(leftOperand, operator, undefined);
            case SQLConditionParserState.SQL_RIGHT_OPERAND_DATE:
                return this._builtColumnDateSQLCondition(leftOperand, operator, rightOperand);
            case SQLConditionParserState.SQL_RIGHT_OPERAND_NUMBER:
            case SQLConditionParserState.SQL_RIGHT_OPERAND_NUMBER_DOT:
                return this._builtColumnNumberSQLCondition(leftOperand, operator, rightOperand);
            case SQLConditionParserState.SQL_RIGHT_OPERAND_COLUMN:
                return this._builtColumnColumnSQLCondition(leftOperand, operator, rightOperand);
        }
        return null;
    }

    _builtColumnStringSQLCondition(leftOperand, operator, rightOperand) {
        switch (operator) {
            case OPERATOR.NOT_EQUAL:
                return new SQLNotEqualCondition(new SQLColumn(leftOperand),
                        rightOperand);
            case OPERATOR.EQUAL:
                return new SQLEqualCondition(new SQLColumn(leftOperand),
                        rightOperand);
            case OPERATOR.LIKE:
                return new SQLLikeCondition(new SQLColumn(leftOperand),
                        rightOperand);
            default:
                throw new Error("Only the operators =, <>, !=, or like may be used when comparing a Column to a String");
        }
    }

    _builtColumnColumnSQLCondition(leftOperand, operator, rightOperand) {
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
            default:
                throw new Error("Unknown operator type : " + operator);
        }
    }

    _builtColumnBooleanSQLCondition(leftOperand, operator, rightOperand) {
        switch (operator) {
            case OPERATOR.NOT_EQUAL:
                return new SQLNotEqualCondition(new SQLColumn(leftOperand), rightOperand);
            case OPERATOR.EQUAL:
                return new SQLEqualCondition(new SQLColumn(leftOperand), rightOperand);
            default:
                throw new Error("Only the operators =, <> or != may be used when comparing a Column to a Boolean");
        }
    }

    _builtColumnNumberSQLCondition(leftOperand, operator, rightOperand) {
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
            default:
                throw new Error("Unknown operator type : " + operator);
        }
    }

    _builtColumnDateSQLCondition(leftOperand, operator, rightOperand) {
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
            default:
                throw new Error("Unknown operator type : " + operator);
        }
    }
}

module.exports = SQLConditionParser;