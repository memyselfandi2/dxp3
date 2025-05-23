/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-lang-css
 *
 * NAME
 * CSSCharsetAtRule
 */
const packageName = 'dxp3-lang-css';
const moduleName = 'CSSCharsetAtRule';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/*
 * @module dxp3-lang-css/CSSCharsetAtRule
 */
const CSSAtRule = require('./CSSAtRule');
const util = require('dxp3-util');

class CSSCharsetAtRule extends CSSAtRule {
    /*********************************************
     * CONSTRUCTOR
     ********************************************/

    constructor(_encoding) {
        super();
        this.encoding = _encoding;
    }

    /*********************************************
     * PUBLIC METHODS
     ********************************************/

    toString() {
        let result = "@charset";
        if(this.encoding != null) {
            result += " \"" + this.encoding + "\"";
        }
        result += ";\n";
        return result;
    }
}
// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
    util.Help.print(CSSCharsetAtRule);
    return;
}
module.exports = CSSCharsetAtRule;