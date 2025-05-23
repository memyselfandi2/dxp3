/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-lang-css
 *
 * NAME
 * GeneralSiblingCombinator
 */
const packageName = 'dxp3-lang-css';
const moduleName = 'GeneralSiblingCombinator';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * @module dxp3-lang-css/GeneralSiblingCombinator
 */
const Combinator = require('./Combinator');
const util = require('dxp3-util');

class GeneralSiblingCombinator extends Combinator {
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
        return '~';
    }
}
// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
    util.Help.print(GeneralSiblingCombinator);
    return;
}
module.exports = GeneralSiblingCombinator;