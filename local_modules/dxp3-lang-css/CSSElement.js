/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-lang-css
 *
 * NAME
 * CSSElement
 */
const packageName = 'dxp3-lang-css';
const moduleName = 'CSSElement';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * @module dxp3-lang-css/CSSElement
 */
const util = require('dxp3-util');

class CSSElement {
    /*********************************************
     * CONSTRUCTORS
     ********************************************/

	constructor() {
	}

    /*********************************************
     * PUBLIC METHODS
     ********************************************/

	toString() {
	}
}
// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
    util.Help.print(CSSElement);
    return;
}
module.exports = CSSElement;