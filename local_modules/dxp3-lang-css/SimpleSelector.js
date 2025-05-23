/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-lang-css
 *
 * NAME
 * SimpleSelector
 */
const packageName = 'dxp3-lang-css';
const moduleName = 'SimpleSelector';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * A simple selector is either a type selector or universal selector followed
 * immediately by zero or more attribute selectors, ID selectors, or pseudo-classes,
 * in any order. The simple selector matches if all of its components match.
 *
 * @module dxp3-lang-css/SimpleSelector
 */
const SelectorElement = require('./SelectorElement');
const util = require('dxp3-util');

class SimpleSelector extends SelectorElement {
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
    	return '';
    }
}
// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
    util.Help.print(SimpleSelector);
    return;
}
module.exports = SimpleSelector;