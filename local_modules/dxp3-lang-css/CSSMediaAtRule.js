/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-lang-css
 *
 * NAME
 * CSSMediaAtRule
 */
const packageName = 'dxp3-lang-css';
const moduleName = 'CSSMediaAtRule';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/*
 * @module dxp3-lang-css/CSSMediaAtRule
 */
const CSSAtRule = require('./CSSAtRule');
const util = require('dxp3-util');

class CSSMediaAtRule extends CSSAtRule {
    /*********************************************
     * CONSTRUCTOR
     ********************************************/

    constructor() {
        super();
        this.mediaTypes = [];
        this.rules = [];
    }
 
    /*********************************************
     * PUBLIC METHODS
     ********************************************/

    toString() {
        let result = "@media";
        let i=1;
        let numberOfMediaTypesMinusOne = this.mediaTypes.length - 1;
        for(let index=0;index <this.mediaTypes.length;index++) {
            let mediaType = this.mediaTypes[index];
            result += " " + mediaType;
            if(index < numberOfMediaTypesMinusOne) {
                result += ',';
            }
        }
        result += " {\n";
        for(let index=0;index < this.rules.length;index++) {
            let rule = this.rules[index];
            result += rule.toString();
        }
        result += "}\n";
        return result;
    }

    /*********************************************
     * SETTERS
     ********************************************/

    addMediaType(_mediaType) {
        if(_mediaType == null) {
            return;
        }
        _mediaType = _mediaType.trim();
        if(_mediaType.length <= 0) {
            return;
        }
        this.mediaTypes.push(_mediaType);
    }

    addRule(_rule) {
        this.addCSSRule(_rule);
    }

    addCSSRule(_rule) {
        if(_rule === undefined || _rule === null) {
            return;
        }
        this.rules.push(_rule);
    }
}
// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
    util.Help.print(CSSMediaAtRule);
    return;
}
module.exports = CSSMediaAtRule;