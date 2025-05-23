/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-lang-sql
 *
 * NAME
 * SQLSingleCondition
 */
const packageName = 'dxp3-lang-sql';
const moduleName = 'SQLSingleCondition';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
// Check if someone tried to run/execute this file.
const util = require('dxp3-util');
if(util.Assert.isFileToExecute(canonicalName)) {
    util.Help.print();
    return;
}
/**
 * @module dxp3-lang-sql/SQLSingleCondition
 */
const logging = require('dxp3-logging');
const SQLCondition = require('./SQLCondition');

const logger = logging.getLogger(canonicalName);

class SQLSingleCondition extends SQLCondition {
    /*********************************************
     * CONSTRUCTOR
     ********************************************/

    constructor(_leftOperand, _rightOperand) {
        super();
        this._leftOperand = _leftOperand;
        this._rightOperand = _rightOperand;
        if(this._rightOperand === null) {
            this.operandType = SQLSingleCondition.OPERANDTYPE.COLUMN_STRING; 
        } else if(Array.isArray(this._rightOperand)) {
            this.operandType = SQLSingleCondition.OPERANDTYPE.COLUMN_ARRAY;
        } else {
            let typeOfOperand = typeof this._rightOperand;
            switch(typeOfOperand) {
                case 'object':
                    if(this._rightOperand instanceof Date) {
                        this.operandType = SQLSingleCondition.OPERANDTYPE.COLUMN_DATE;
                    } else {
                        this.operandType = SQLSingleCondition.OPERANDTYPE.COLUMN_COLUMN;
                    }
                    break;
                case 'boolean':
                    this.operandType = SQLSingleCondition.OPERANDTYPE.COLUMN_BOOLEAN;
                    break;
                case 'string':
                    this.operandType = SQLSingleCondition.OPERANDTYPE.COLUMN_STRING;
                    break;
                case 'number':
                    this.operandType = SQLSingleCondition.OPERANDTYPE.COLUMN_NUMBER;
                    break;
                default:
                    break;
            }
        }
    }

    /*********************************************
     * PUBLIC METHODS
     ********************************************/

    async evaluateHaving(_rows) {
        logger.warn('evaluateHaving(...): Not implemented.');
        throw SQLError.NOT_IMPLEMENTED;
    }

    async evaluateWhere(_sqlTable) {
        logger.warn('evaluateWhere(...): Not implemented.');
        throw SQLError.NOT_IMPLEMENTED;
    }

    toString() {
        super.toString();
    }
}
SQLSingleCondition.OPERANDTYPE = {
    COLUMN_COLUMN: 10,
    COLUMN_BOOLEAN: 20,
    COLUMN_DATE: 30,
    COLUMN_NUMBER: 40,
    COLUMN_STRING: 50,
    COLUMN_ARRAY: 60
}

module.exports = SQLSingleCondition;