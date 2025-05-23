/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-lang-sql
 *
 * NAME
 * SQLGreaterOrEqualCondition
 */
const packageName = 'dxp3-lang-sql';
const moduleName = 'SQLGreaterOrEqualCondition';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
// Check if someone tried to run/execute this file.
const util = require('dxp3-util');
if(util.Assert.isFileToExecute(canonicalName)) {
    util.Help.print();
    return;
}
/**
 * @module dxp3-lang-sql/SQLGreaterOrEqualCondition
 */
const logging = require('dxp3-logging');
const SQLSingleCondition = require('./SQLSingleCondition');

const logger = logging.getLogger(canonicalName);

class SQLGreaterOrEqualCondition extends SQLSingleCondition {
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
        if(this.operandType === SQLSingleCondition.OPERANDTYPE.COLUMN_COLUMN) {
            let rightOperand = this._rightOperand.replaceAll(' ', '_');
            for(let i=0;i < _rows.length;i++) {
                let row = _rows[i];
                let leftValue = row[leftOperand];
                let rightValue = row[rightOperand];
                if(leftValue >= rightValue) {
                    result.push(row);
                }
            }
        } else {
            for(let i=0;i < _rows.length;i++) {
                let row = _rows[i];
                let leftValue = row[leftOperand];
                if(leftValue >= this._rightOperand) {
                    result.push(row);
                }
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
        let result = [];
        let tableIndex = _sqlTable.getSQLTableIndex(this._leftOperand);
        if(this.operandType === SQLSingleCondition.OPERANDTYPE.COLUMN_COLUMN) {
            result = await tableIndex.greaterOrEqualColumn(this._rightOperand.getName());            
        } else {
            result = await tableIndex.greaterOrEqual(this._rightOperand);
        }
        return result;
    }

    toString() {
        let result = this._leftOperand.toStringForQuery();
        result += " >= ";
        switch (this.operandType) {
            case SQLSingleCondition.OPERANDTYPE.COLUMN_COLUMN:
                result += this._rightOperand.toStringForQuery();
                break;
            case SQLSingleCondition.OPERANDTYPE.COLUMN_BOOLEAN:
                result += this._rightOperand;
                break;
            case SQLSingleCondition.OPERANDTYPE.COLUMN_DATE:
                result += this._rightOperand.toString();
                break;
            case SQLSingleCondition.OPERANDTYPE.COLUMN_NUMBER:
                result += this._rightOperand;
                break;
            case SQLSingleCondition.OPERANDTYPE.COLUMN_STRING:
                result += '\'' + this._rightOperand + '\'';
                break;
            default:
                break;
        }
        return result;
    }
}

module.exports = SQLGreaterOrEqualCondition;