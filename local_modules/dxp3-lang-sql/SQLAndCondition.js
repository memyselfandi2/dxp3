/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-lang-sql
 *
 * NAME
 * SQLAndCondition
 */
const packageName = 'dxp3-lang-sql';
const moduleName = 'SQLAndCondition';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
// Check if someone tried to run/execute this file.
const util = require('dxp3-util');
if(util.Assert.isFileToExecute(canonicalName)) {
    util.Help.print();
    return;
}
/**
 * @module dxp3-lang-sql/SQLAndCondition
 */
const logging = require('dxp3-logging');
const SQLCondition = require('./SQLCondition');

const logger = logging.getLogger(canonicalName);

class SQLAndCondition extends SQLCondition {
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
            return [];
        }
        if(leftSQLRowArray.length <= 0) {
            return [];
        }
        let rightSQLRowArray = await this._rightSQLCondition.evaluateHaving(_rows);
        if(rightSQLRowArray === undefined || rightSQLRowArray === null) {
            return [];
        }
        if(rightSQLRowArray.length <= 0) {
            return [];
        }
        // Here we implement a small attempt at efficiency by
        // ensuring the outer loop is using the shortest array.
        if(leftSQLRowArray.length > rightSQLRowArray.length) {
            let tmpArray = leftSQLRowArray;
            leftSQLRowArray = rightSQLRowArray;
            rightSQLRowArray = tmpArray;
            tmpArray = null;
        }
        let result = [];
        for(let i=0;i < leftSQLRowArray.length;i++) {
            let leftSQLRow = leftSQLRowArray[i];
            let leftJSON = JSON.stringify(leftSQLRow);    
            for(let j=0;j < rightSQLRowArray.length;j++) {
                let rightSQLRow = rightSQLRowArray[j];
                let rightJSON = JSON.stringify(rightSQLRow);    
                if(leftJSON === rightJSON) {
                    result.push(leftSQLRow);
                    break;
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
        let leftSQLRowArray = await this._leftSQLCondition.evaluateWhere(_sqlTable);
        if(leftSQLRowArray === undefined || leftSQLRowArray === null) {
            return [];
        }
        if(leftSQLRowArray.length <= 0) {
            return [];
        }
        let rightSQLRowArray = await this._rightSQLCondition.evaluateWhere(_sqlTable);
        if(rightSQLRowArray === undefined || rightSQLRowArray === null) {
            return [];
        }
        if(rightSQLRowArray.length <= 0) {
            return [];
        }
        // Here we implement a small attempt at efficiency by
        // ensuring the outer loop is using the shortest array.
        if(leftSQLRowArray.length > rightSQLRowArray.length) {
            let tmpArray = leftSQLRowArray;
            leftSQLRowArray = rightSQLRowArray;
            rightSQLRowArray = tmpArray;
            tmpArray = null;
        }
        let result = [];
        for(let i=0;i < leftSQLRowArray.length;i++) {
            let leftSQLRow = leftSQLRowArray[i];
            for(let j=0;j < rightSQLRowArray.length;j++) {
                let rightSQLRow = rightSQLRowArray[j];
                if(leftSQLRow._uuid === rightSQLRow._uuid) {
                    result.push(leftSQLRow);
                    break;
                }
            }
        }
        return result;
    }

    toString() {
        return "(" + this._leftSQLCondition.toString() + " AND " + this._rightSQLCondition.toString() + ")";
    }
}

module.exports = SQLAndCondition;