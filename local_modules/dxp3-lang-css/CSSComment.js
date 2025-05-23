/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-lang-css
 *
 * NAME
 * CSSComment
 */
const packageName = 'dxp3-lang-css';
const moduleName = 'CSSComment';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * @module dxp3-lang-css/CSSComment
 */
const CSSElement = require('./CSSElement');
const util = require('dxp3-util');

class CSSComment extends CSSElement {
    /*********************************************
     * CONSTRUCTOR
     ********************************************/

	constructor(_text) {
		super();
		this.text = '';
		if(_text != undefined && _text != null) {
			this.text = _text;
		}
	}

    /*********************************************
     * PUBLIC METHODS
     ********************************************/

	toString() {
		let result = '';
		result += '/*' + this.text + '*/\n';
		return result;
	}

    /*********************************************
     * GETTERS
     ********************************************/

	getText() {
		return this.text;
	}

    /*********************************************
     * SETTERS
     ********************************************/

	setText(_text) {
		this.text = '';
		if(_text != undefined && _text != null) {
			this.text = _text;
		}
	}
}
// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
    util.Help.print(CSSComment);
    return;
}
module.exports = CSSComment;