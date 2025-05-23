/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-microservice
 *
 * NAME
 * MicroServiceError
 */
const packageName = 'dxp3-microservice';
const moduleName = 'MicroServiceError';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
// Check if someone tried to run/execute this file.
const util = require('dxp3-util');
if(util.Assert.isFileToExecute(canonicalName)) {
	util.Help.print();
	return;
}
/**
 * @module dxp3-microservice/MicroServiceError
 */

/**
 * A Micro service error may contain both a message and a code.
 *
 * @property {String} message
 * @property {String} code
 */
class MicroServiceError extends Error {
	constructor(_code, _message) {
		super(_message);
		this.code = _code;
	}

	toString() {
		return this.code + ': ' + this.message;
	}

	static from(_error) {
		if(_error === undefined || _error === null) {
			return MicroServiceError.UNKNOWN;
		}
		return new MicroServiceError('UNKNOWN', _error.message);
	}
}
/** @member {module:dxp3-microservice/MicroServiceError~MicroServiceError} NOT_FOUND */
MicroServiceError.NOT_FOUND = new MicroServiceError('NOT_FOUND', 'Not found');
/** @member {module:dxp3-microservice/MicroServiceError~MicroServiceError} ILLEGAL_ARGUMENT */
MicroServiceError.ILLEGAL_ARGUMENT = new MicroServiceError('ILLEGAL_ARGUMENT', 'Illegal argument');
/** @member {module:dxp3-microservice/MicroServiceError~MicroServiceError} ILLEGAL_STATE */
MicroServiceError.ILLEGAL_STATE = new MicroServiceError('ILLEGAL_STATE', 'Illegal state');
/** @member {module:dxp3-microservice/MicroServiceError~MicroServiceError} NOT_IMPLEMENTED */
MicroServiceError.NOT_IMPLEMENTED = new MicroServiceError('NOT_IMPLEMENTED', 'Not implemented');
/** @member {module:dxp3-microservice/MicroServiceError~MicroServiceError} UNKNOWN */
MicroServiceError.UNKNOWN = new MicroServiceError('UNKNOWN', 'Unknown');

module.exports = MicroServiceError;