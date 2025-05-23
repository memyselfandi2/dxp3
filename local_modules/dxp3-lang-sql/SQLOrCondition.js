/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-lang-sql
 *
 * NAME
 * SQLOrCondition
 */
const packageName = 'dxp3-lang-sql';
const moduleName = 'SQLOrCondition';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
// Check if someone tried to run/execute this file.
const util = require('dxp3-util');
if(util.Assert.isFileToExecute(canonicalName)) {
    util.Help.print();
    return;
}
/**
 * @module dxp3-lang-sql/SQLOrCondition
 */
const logging = require('dxp3-logging');
const SQLCondition = require('./SQLCondition');

const logger = logging.getLogger(canonicalName);

class SQLOrCondition extends SQLCondition {
    /*********************************************
     * CONSTRUCTOR
     ********************************************/

    /**
     * @param {module:dxp3-lang-sql/SQLCondition~SQLCondition} _leftSQLCondition
     * @param {module:dxp3-lang-sql/SQLCondition~SQLCondition} _rightSQLCondition
     */
    constructor(_leftSQLCondition, _rightSQLCondition) {
        super();
        this._leftSQLCondition = _leftSQLCondition;
        this._rightSQLCondition = _rightSQLCondition;
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
        let leftSQLRowArray = await this._leftSQLCondition.evaluateHaving(_rows);
        if(leftSQLRowArray === undefined || leftSQLRowArray === null) {
            leftSQLRowArray = [];
        }
        let rightSQLRowArray = await this._rightSQLCondition.evaluateHaving(_rows);
        if(rightSQLRowArray === undefined || rightSQLRowArray === null) {
            rightSQLRowArray = [];
        }
        // Add all the left rows to the result set.
        let result = [...leftSQLRowArray];
        // Loop through the right rows
        for(let i=0;i < rightSQLRowArray.length;i++) {
            let rightSQLRow = rightSQLRowArray[i];
            let found = false;
            // Check if this right row is also present in the left rows
            let rightJSON = JSON.stringify(rightSQLRow);    
            for(let j=0;j < leftSQLRowArray.length;j++) {
                let leftSQLRow = leftSQLRowArray[j];
                let leftJSON = JSON.stringify(leftSQLRow);
                if(leftJSON === rightJSON) {
                    found = true;
                    break;
                }
            }
            if(!found) {
                result.push(rightSQLRow);
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
        let leftSQLRowArray = await this._leftSQLCondition.evaluateWhere(_sqlTable);
        if(leftSQLRowArray === undefined || leftSQLRowArray === null) {
            leftSQLRowArray = [];
        }
        let rightSQLRowArray = await this._rightSQLCondition.evaluateWhere(_sqlTable);
        if(rightSQLRowArray === undefined || rightSQLRowArray === null) {
            rightSQLRowArray = [];
        }
        // Add all the left rows to the result set.
        let result = [...leftSQLRowArray];
        // Loop through the right rows
        for(let i=0;i < rightSQLRowArray.length;i++) {
            let rightSQLRow = rightSQLRowArray[i];
            let found = false;
            // Check if this right row is also present in the left rows
            for(let j=0;j < leftSQLRowArray.length;j++) {
                let leftSQLRow = leftSQLRowArray[j];
                if(leftSQLRow._uuid === rightSQLRow._uuid) {
                    found = true;
                    break;
                }
            }
            if(!found) {
                result.push(rightSQLRow);
            }
        }
        return result;
    }

    toString() {
        return "(" + this._leftSQLCondition.toString() + " OR " + this._rightSQLCondition.toString() + ")";
    }
}

module.exports = SQLOrCondition;