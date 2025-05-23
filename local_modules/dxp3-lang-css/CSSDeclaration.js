/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-lang-css
 *
 * NAME
 * CSSDeclaration
 */
const packageName = 'dxp3-lang-css';
const moduleName = 'CSSDeclaration';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * @module dxp3-lang-css/CSSDeclaration
 */
const logging = require('dxp3-logging');
const util = require('dxp3-util');

const logger = logging.getLogger(canonicalName);

class CSSDeclaration {
    /*********************************************
     * CONSTRUCTOR
     ********************************************/

	constructor(_property, _value) {
		this.property = _property;
		this.value = _value;
	}

    /*********************************************
     * PUBLIC METHODS
     ********************************************/

    toString() {
        let result = '';
        result += this.property + ':';
        result += this.value;
        return result;
    }

    /*********************************************
     * GETTERS
     ********************************************/

	getProperty() {
		return this.property;
	}

	getValue() {
		return this.value;
	}

    /*********************************************
     * SETTERS
     ********************************************/

	setProperty(_property) {
        if((_property != undefined) && (_property != null)) {
            this.property = _property.trim();
        } else {
            this.property = '';
        }
	}

	setValue(_value) {
        if((_value != undefined) && (_value != null)) {
            this.value = _value.trim();
        } else {
            this.value = '';
        }
	}
}
// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
    util.Help.print(CSSDeclaration);
    return;
}
module.exports = CSSDeclaration;
