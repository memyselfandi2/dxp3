/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-lang-css
 *
 * NAME
 * CSSAtRule
 */
const packageName = 'dxp3-lang-css';
const moduleName = 'CSSAtRule';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/*
 * @module dxp3-lang-css/CSSAtRule
 */
const CSSElement = require('./CSSElement');
const util = require('dxp3-util');

class CSSAtRule extends CSSElement {
    /*********************************************
     * CONSTRUCTOR
     ********************************************/

	constructor() {
		super();
	}

    /*********************************************
     * PUBLIC METHODS
     ********************************************/

	toString() {
		let result = '';
		return result;
	}
}
// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
    util.Help.print(CSSAtRule);
    return;
}
module.exports = CSSAtRule;