/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-lang-css
 *
 * NAME
 * CSSDeclarationGroup
 */
const packageName = 'dxp3-lang-css';
const moduleName = 'CSSDeclarationGroup';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * @module dxp3-lang-css/CSSDeclarationGroup
 */
const CSSDeclaration = require('./CSSDeclaration');
const logging = require('dxp3-logging');
const util = require('dxp3-util');

const logger = logging.getLogger(canonicalName);

class CSSDeclarationGroup {
	/*********************************************
     * CONSTRUCTOR
     ********************************************/

	constructor() {
		this.declarations = [];
	}

    /*********************************************
     * PUBLIC METHODS
     ********************************************/

	hasProperty(_property) {
		if(_property === undefined || _property === null) {
			return false;
		}
		_property = _property.trim();
		for(let i=0;i < this.declarations.length;i++) {
			let tmpDeclaration = this.declarations[i];
			if(tmpDeclaration.getProperty() === _property) {
				return true;
			}
		}
		return false;
	}

	updateDeclaration() {
		let cssDeclaration = null;
		if(arguments.length === 1) {
			cssDeclaration = arguments[0];
		} else if(arguments.length === 2) {
			let property = arguments[0];
			let value = arguments[1];
			if(property != undefined && property != null) {
				cssDeclaration = new CSSDeclaration(property,value);
			}
		}
		if(cssDeclaration === undefined || cssDeclaration === null) {
			return;
		}
		let foundAtIndex = -1;
		for(let i=0;i < this.declarations.length;i++) {
			let tmpDeclaration = this.declarations[i];
			if(tmpDeclaration.getProperty() === cssDeclaration.getProperty()) {
				foundAtIndex = i;
				break;
			}
		}
		if(foundAtIndex > -1) {
			this.declarations[foundAtIndex] = cssDeclaration;
		} else {
			this.declarations.push(cssDeclaration);
		}
	}

    toString() {
        let result = '{\n';
		for(let i=0;i < this.declarations.length;i++) {
			let tmpDeclaration = this.declarations[i];
			result += tmpDeclaration.toString() + '\n';
		}
		result += '}\n';
        return result;
    }

    /*********************************************
     * GETTERS
     ********************************************/

	getDeclaration(_property) {
		let result = null;
		if(_property === undefined || _property === null) {
			return result;
		}
		_property = _property.trim();
		for(let i=0;i < this.declarations.length;i++) {
			let tmpDeclaration = this.declarations[i];
			if(tmpDeclaration.getProperty() === _property) {
				result = tmpDeclaration;
				break;
			}
		}
		return result;
	}

    /*********************************************
     * SETTERS
     ********************************************/

	addDeclaration() {
		let cssDeclaration = null;
		if(arguments.length === 1) {
			cssDeclaration = arguments[0];
		} else if(arguments.length === 2) {
			let property = arguments[0];
			let value = arguments[1];
			if(property != undefined && property != null) {
				cssDeclaration = new CSSDeclaration(property,value);
			}
		}
		if(cssDeclaration === undefined || cssDeclaration === null) {
			return;
		}
		this.declarations.push(cssDeclaration);
	}
}
// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
    util.Help.print(CSSDeclarationGroup);
    return;
}
module.exports = CSSDeclarationGroup;
