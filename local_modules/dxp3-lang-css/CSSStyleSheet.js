/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-lang-css
 *
 * NAME
 * CSSStyleSheet
 */
const packageName = 'dxp3-lang-css';
const moduleName = 'CSSStyleSheet';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/*
 * @module dxp3-lang-css/CSSStyleSheet
 */
const util = require('dxp3-util');

class CSSStyleSheet {
    /*********************************************
     * CONSTRUCTOR
     ********************************************/

	constructor() {
		this.rules = [];
	}

    /*********************************************
     * PUBLIC METHODS
     ********************************************/

	insertRule(_rule, _index) {
		if(_index === undefined || _index === null) {
			this.rules.push(_rule);
		} else {
			this.rules[_index] = _rule;
		}
	}

	toString() {
		let result = '';
		for(let i=0;i < this.rules.length;i++) {
			result += this.rules[i];
		}
		return result;
	}
}
// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
    util.Help.print(CSSStyleSheet);
    return;
}
module.exports = CSSStyleSheet;