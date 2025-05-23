/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-lang-sql
 *
 * NAME
 * SQLLikeCondition
 */
const packageName = 'dxp3-lang-sql';
const moduleName = 'SQLLikeCondition';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
// Check if someone tried to run/execute this file.
const util = require('dxp3-util');
if(util.Assert.isFileToExecute(canonicalName)) {
    util.Help.print();
    return;
}
/**
 * @module dxp3-lang-sql/SQLLikeCondition
 */
const logging = require('dxp3-logging');
const SQLSingleCondition = require('./SQLSingleCondition');

const logger = logging.getLogger(canonicalName);

class SQLLikeCondition extends SQLSingleCondition {
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
        let rightOperand = '^' + this._rightOperand.replaceAll('%', '.*').replaceAll('_', '.') + '$';
        for(let i=0;i < _rows.length;i++) {
            let row = _rows[i];
            let leftValue = row[leftOperand];
            if(leftValue.match(rightOperand)) {
                result.push(row);
            }
        }
        return result;
    }

    async evaluateWhere(_sqlTable) {
        // Defensive programming...check input...
        if(_sqlTable === undefined || _sqlTable === null) {
            // Calling evaluateWhere(...) without an argument could be
            // a programming error. Lets log a warning.
            logger.warn('evaluateWhere(...): Missing arguments.');
            throw SQLError.ILLEGAL_ARGUMENT;
        }
        let tableIndex = _sqlTable.getSQLTableIndex(this._leftOperand);
        return await tableIndex.like(this._rightOperand);
    }

    toString() {
        let result = this._leftOperand.toStringForQuery();
        result += " LIKE ";
        result += '\'' + this._rightOperand + '\'';
        return result;
    }
}

module.exports = SQLLikeCondition;