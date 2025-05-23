/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-lang-css
 *
 * NAME
 * DescendantCombinator
 */
const packageName = 'dxp3-lang-css';
const moduleName = 'DescendantCombinator';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * @module dxp3-lang-css/DescendantCombinator
 */
const Combinator = require('./Combinator');
const util = require('dxp3-util');

class DescendantCombinator extends Combinator {
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
        return ' ';
    }
}
// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
    util.Help.print(DescendantCombinator);
    return;
}
module.exports = DescendantCombinator;