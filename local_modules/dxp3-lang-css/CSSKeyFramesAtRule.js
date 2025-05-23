/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-lang-css
 *
 * NAME
 * CSSKeyFramesAtRule
 */
const packageName = 'dxp3-lang-css';
const moduleName = 'CSSKeyFramesAtRule';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/*
 * @module dxp3-lang-css/CSSKeyFramesAtRule
 */
const CSSAtRule = require('./CSSAtRule');
const util = require('dxp3-util');

class CSSKeyFramesAtRule extends CSSAtRule {
    /*********************************************
     * CONSTRUCTOR
     ********************************************/

    constructor() {
        super();
        this._name = '';
        this._selectors = [];
        this._declarationGroups = [];
    }
 
    /*********************************************
     * PUBLIC METHODS
     ********************************************/

    toString() {
        let result = "@keyframes";
        result += ' ' + this._name;
        result += " {\n";
        for(let i=0;i < this._selectors.length;i++) {
            let selectors = this._selectors[i];
            let declarationGroup = this._declarationGroups[i];
            for(let j=0;j < selectors.length;j++) {
                result += selectors[j];
                if(j < (selectors.length-1)) {
                    result += ',';
                }
            }
            result += declarationGroup.toString();
        }
        result += "}\n";
        return result;
    }

    /*********************************************
     * SETTERS
     ********************************************/

    setName(_name) {
        this._name = _name;
    }

    setPercentage(_selectors, _declarationGroup) {
        this._selectors.push(_selectors);
        this._declarationGroups.push(_declarationGroup);
    }
}
// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
    util.Help.print(CSSKeyFramesAtRule);
    return;
}
module.exports = CSSKeyFramesAtRule;