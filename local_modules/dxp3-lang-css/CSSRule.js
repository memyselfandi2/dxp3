/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-lang-css
 *
 * NAME
 * CSSRule
 */
const packageName = 'dxp3-lang-css';
const moduleName = 'CSSRule';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/*
 * @module dxp3-lang-css/CSSRule
 */
const CSSElement = require('./CSSElement');
const util = require('dxp3-util');

class CSSRule extends CSSElement {
    /*********************************************
     * CONSTRUCTOR
     ********************************************/

	constructor() {
		super();
		this.selectorGroup = [];
		this.declarationGroup = null;
	}

    /*********************************************
     * PUBLIC METHODS
     ********************************************/

	toString() {
		let result = '';
		let numberOfSelectors = this.selectorGroup.length;
		let lastIndex = numberOfSelectors - 1;
		for(let i=0;i < numberOfSelectors;i++) {
			let selector = this.selectorGroup[i];
			result += selector.toString();
			if(i < lastIndex) {
				result += ',\n';
			}
		}
		result += ' ';
		if(this.declarationGroup != null) {
			result += this.declarationGroup.toString();
		}
		return result;
	}

    /*********************************************
     * GETTERS
     ********************************************/

	getSelectorGroup() {
		return this.selectorGroup;
	}

	getDeclarationGroup() {
		return this.declarationGroup;
	}

    /*********************************************
     * SETTERS
     ********************************************/

	setDeclarationGroup(_declarationGroup) {
		this.declarationGroup = _declarationGroup
	}

	addSelector(_selector) {
		if(_selector === undefined || _selector === null) {
			return;
		}
		this.selectorGroup.push(_selector);
	}
}
// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
    util.Help.print(CSSRule);
    return;
}
module.exports = CSSRule;