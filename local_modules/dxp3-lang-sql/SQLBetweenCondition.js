/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-lang-sql
 *
 * NAME
 * SQLBetweenCondition
 */
const packageName = 'dxp3-lang-sql';
const moduleName = 'SQLBetweenCondition';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
// Check if someone tried to run/execute this file.
const util = require('dxp3-util');
if(util.Assert.isFileToExecute(canonicalName)) {
    util.Help.print();
    return;
}
/**
 * @module dxp3-lang-sql/SQLBetweenCondition
 */
const logging = require('dxp3-logging');
const SQLSingleCondition = require('./SQLSingleCondition');

const logger = logging.getLogger(canonicalName);

class SQLBetweenCondition extends SQLSingleCondition {
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
            if(this._rightOperand[0] <= leftValue <= this._rightOperand[1]) {
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
        return await tableIndex.between(this._rightOperand[0], this._rightOperand[1]);
    }

    toString() {
        let result = this._leftOperand.toStringForQuery();
        result += " BETWEEN ";
        if(typeof this._rightOperand[0] === 'string') {
            result += '\'' + this._rightOperand[0] + '\' AND \'' + this._rightOperand[1] + '\'';
        } else {
            result += this._rightOperand[0] + ' AND ' + this._rightOperand[1];
        }        
        return result;
    }
}

module.exports = SQLBetweenCondition;