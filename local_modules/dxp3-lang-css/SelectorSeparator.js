/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-lang-css
 *
 * NAME
 * SelectorSeparator
 */
const packageName = 'dxp3-lang-css';
const moduleName = 'SelectorSeparator';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/*
 * @module dxp3-lang-css/SelectorSeparator
 */
const SelectorElement = require('./SelectorElement');
const util = require('dxp3-util');

class SelectorSeparator extends SelectorElement {
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
    	return ',';
    }
}
// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
    util.Help.print(SelectorSeparator);
    return;
}
module.exports = SelectorSeparator;