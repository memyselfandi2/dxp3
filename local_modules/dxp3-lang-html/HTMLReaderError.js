/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-lang-html
 *
 * NAME
 * HTMLReaderError
 */
const packageName = 'dxp3-lang-html';
const moduleName = 'HTMLReaderError';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
// Check if someone tried to run/execute this file.
const util = require('dxp3-util');
if(util.Assert.isFileToExecute(canonicalName)) {
	util.Help.print();
	return;
}
/**
 * @module dxp3-lang-html/HTMLReaderError
 */
class HTMLReaderError extends Error {
	constructor(_code, _message) {
		super(_message);
		this.code = _code;
	}

	toString() {
		return this.code + ': ' + this.message;
	}

	static from(_error) {
		if(_error === undefined || _error === null) {
			return HTMLReaderError.UNKNOWN;
		}
		return new HTMLReaderError('UNKNOWN', _error.message);
	}
}
/** @member {module:dxp3-lang-html/HTMLReaderError~HTMLReaderError} ILLEGAL_ARGUMENT */
HTMLReaderError.ILLEGAL_ARGUMENT = new HTMLReaderError('ILLEGAL_ARGUMENT', 'Illegal argument');
/** @member {module:dxp3-lang-html/HTMLReaderError~HTMLReaderError} ILLEGAL_STATE */
HTMLReaderError.ILLEGAL_STATE = new HTMLReaderError('ILLEGAL_STATE', 'Illegal state');
/** @member {module:dxp3-lang-html/HTMLReaderError~HTMLReaderError} UNKNOWN */
HTMLReaderError.UNKNOWN = new HTMLReaderError('UNKNOWN', 'Unknown');
/** @member {module:dxp3-lang-html/HTMLReaderError~HTMLReaderError} UNSUPPORTED_MEDIA_TYPE */
HTMLReaderError.UNSUPPORTED_MEDIA_TYPE = new HTMLReaderError('UNSUPPORTED_MEDIA_TYPE', 'Unsupported Media Type');

module.exports = HTMLReaderError;