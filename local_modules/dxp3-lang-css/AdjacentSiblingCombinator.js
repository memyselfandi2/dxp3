/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-lang-css
 *
 * NAME
 * AdjacentSiblingCombinator
 */
const packageName = 'dxp3-lang-css';
const moduleName = 'AdjacentSiblingCombinator';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * @module dxp3-lang-css/AdjacentSiblingCombinator
 */
const Combinator = require('./Combinator');
const util = require('dxp3-util');

class AdjacentSiblingCombinator extends Combinator {
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
        return "+";
    }
}
// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
    util.Help.print(AdjacentSiblingCombinator);
    return;
}
module.exports = AdjacentSiblingCombinator;