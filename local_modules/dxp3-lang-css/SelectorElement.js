/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-lang-css
 *
 * NAME
 * SelectorElement
 */
const packageName = 'dxp3-lang-css';
const moduleName = 'SelectorElement';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/*
 * @module dxp3-lang-css/SelectorElement
 */
const util = require('dxp3-util');

class SelectorElement {
    /*********************************************
     * CONSTRUCTOR
     ********************************************/

	constructor() {
	}

    /*********************************************
     * PUBLIC METHODS
     ********************************************/

    toString() {
    	return '';
    }
}
// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
    util.Help.print(SelectorElement);
    return;
}
module.exports = SelectorElement;