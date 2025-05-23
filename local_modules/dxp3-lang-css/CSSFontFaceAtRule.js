/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-lang-css
 *
 * NAME
 * CSSFontFaceAtRule
 */
const packageName = 'dxp3-lang-css';
const moduleName = 'CSSFontFaceAtRule';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/*
 * @module dxp3-lang-css/CSSFontFaceAtRule
 */
const CSSAtRule = require('./CSSAtRule');
const util = require('dxp3-util');

class CSSFontFaceAtRule extends CSSAtRule {
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
        let result = "@fontface";
        result += ";\n";
        return result;
    }
}
// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
    util.Help.print(CSSFontFaceAtRule);
    return;
}
module.exports = CSSFontFaceAtRule;