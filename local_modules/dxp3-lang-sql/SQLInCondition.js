/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-lang-sql
 *
 * NAME
 * SQLInCondition
 */
const packageName = 'dxp3-lang-sql';
const moduleName = 'SQLInCondition';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
// Check if someone tried to run/execute this file.
const util = require('dxp3-util');
if(util.Assert.isFileToExecute(canonicalName)) {
    util.Help.print();
    return;
}
/**
 * @module dxp3-lang-sql/SQLInCondition
 */
const logging = require('dxp3-logging');
const SQLSingleCondition = require('./SQLSingleCondition');

const logger = logging.getLogger(canonicalName);

class SQLInCondition extends SQLSingleCondition {
    /*********************************************
     * CONSTRUCTOR
     ********************************************/

	constructor(_leftOperand, _rightOperand) {
		super(_leftOperand, _rightOperand);
	}

    /*********************************************
     * PUBLIC METHODS
     ********************************************/

    async evaluateHaving(_rows) {
        // Defensive programming...check input...
        if(_rows === undefined || _rows === null) {
            // Calling evaluateHaving(...) without an argument could be
            // a programming error. Lets log a warning.
            logger.warn('evaluateHaving(...): Missing arguments.');
            throw SQLError.ILLEGAL_ARGUMENT;
        }
        let result = [];
        let leftOperand = this._leftOperand.getName().replaceAll(' ', '_');
        for(let i=0;i < _rows.length;i++) {
            let row = _rows[i];
            let leftValue = row[leftOperand];
            if(this._rightOperand.includes(leftValue)) {
                result.push(row);
            }
        }
        return result;
    }

    async evaluateWhere(_sqlTable) {
        logger.trace('evaluateWhere(...): start.');
        // Defensive programming...check input...
        if(_sqlTable === undefined || _sqlTable === null) {
            // Calling evaluateWhere(...) without an argument could be
            // a programming error. Lets log a warning.
            logger.warn('evaluateWhere(...): Missing arguments.');
            logger.trace('evaluateWhere(...): end.');
            throw SQLError.ILLEGAL_ARGUMENT;
        }
        let tableIndex = _sqlTable.getSQLTableIndex(this._leftOperand);
        let result = await tableIndex.in(this._rightOperand);
        logger.trace('evaluateWhere(...): end.');
        return result;
    }

    toString() {
        let result = this._leftOperand.toStringForQuery();
        result += ' IN (';
        let i = 0;
        let lastIndex = this._rightOperand.length - 1;
        let value = null;
        for(i = 0; i < lastIndex; i++) {
            value = this._rightOperand[i];
            if(typeof value === 'string') {
                result += '\'' + value + '\'';
            } else {
                result += value;
            }
            result += ', ';
        }
        value = this._rightOperand[i];
        if(typeof value === 'string') {
            result += '\'' + value + '\'';
        } else {
            result += value;
        }
        result += ')';
        return result;
    }
}

module.exports = SQLInCondition;