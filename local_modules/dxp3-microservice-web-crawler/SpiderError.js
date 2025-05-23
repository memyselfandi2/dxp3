/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-microservice-web-crawler
 *
 * NAME
 * SpiderError
 */
const packageName = 'dxp3-microservice-web-crawler';
const moduleName = 'SpiderError';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
// Check if someone tried to run/execute this file.
const util = require('dxp3-util');
if(util.Assert.isFileToExecute(canonicalName)) {
	util.Help.print();
	return;
}
/**
 * A collection of error codes a Spider may return/throw.
 *
 * @module dxp3-microservice-web-crawler/SpiderError
 */

/**
 * @property {String} code
 * @property {String} message
 * @extends Error
 */
class SpiderError extends Error {

	constructor(_code, _message) {
		super(_message);
		this.code = _code;
	}

	toString() {
		return this.code + ': ' + this.message;
	}

	static from(_error) {
		if(_error === undefined || _error === null) {
			return SpiderError.UNKNOWN;
		}
		return new SpiderError('UNKNOWN', _error.message);
	}
}
/**
 * This is typically used in an error that is returned/thrown when the argument(s)
 * of a method/operation is/are invalid.
 * @type {module:dxp3-microservice-web-crawler/SpiderError~SpiderError}
 * @static
 */
SpiderError.ILLEGAL_ARGUMENT = new SpiderError('ILLEGAL_ARGUMENT', 'Illegal argument');
/**
 * This is typically used in an error that is returned/thrown when a method/operation
 * is called during the wrong state of a Spider.
 * One can for example not set the port when an Spider server is RUNNING.
 * @type {module:dxp3-microservice-web-crawler/SpiderError~SpiderError}
 * @static
 */
SpiderError.ILLEGAL_STATE = new SpiderError('ILLEGAL_STATE', 'Illegal state');
/** @member {module:dxp3-microservice-web-crawler/SpiderError~SpiderError} UNKNOWN */
SpiderError.UNKNOWN = new SpiderError('UNKNOWN', 'Unknown');

module.exports = SpiderError;