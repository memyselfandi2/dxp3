/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-lang-css
 *
 * NAME
 * CSSReaderError
 */
const packageName = 'dxp3-lang-css';
const moduleName = 'CSSReaderError';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * @module dxp3-lang-css/CSSReaderError
 */
const util = require('dxp3-util');

class CSSReaderError extends Error {
    /*********************************************
     * CONSTRUCTOR
     ********************************************/

	constructor(_code, _message) {
		super(_message);
		this.code = _code;
	}

    /*********************************************
     * PUBLIC METHODS
     ********************************************/

	toString() {
		return this.code + ': ' + this.message;
	}

	static from(_error) {
		if(_error === undefined || _error === null) {
			return CSSReaderError.UNKNOWN;
		}
		return new CSSReaderError('UNKNOWN', _error.message);
	}
}
/** @member {module:dxp3-lang-css/CSSReaderError~CSSReaderError} ILLEGAL_ARGUMENT */
CSSReaderError.ILLEGAL_ARGUMENT = new CSSReaderError('ILLEGAL_ARGUMENT', 'Illegal argument');
/** @member {module:dxp3-lang-css/CSSReaderError~CSSReaderError} ILLEGAL_STATE */
CSSReaderError.ILLEGAL_STATE = new CSSReaderError('ILLEGAL_STATE', 'Illegal state');
/** @member {module:dxp3-lang-css/CSSReaderError~CSSReaderError} UNKNOWN */
CSSReaderError.UNKNOWN = new CSSReaderError('UNKNOWN', 'Unknown');
/** @member {module:dxp3-lang-css/CSSReaderError~CSSReaderError} UNSUPPORTED_MEDIA_TYPE */
CSSReaderError.UNSUPPORTED_MEDIA_TYPE = new CSSReaderError('UNSUPPORTED_MEDIA_TYPE', 'Unsupported Media Type');

// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
	util.Help.print();
	return;
}
module.exports = CSSReaderError;