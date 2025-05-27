/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-util
 *
 * NAME
 * CommandLineError
 */
const packageName = 'dxp3-util';
const moduleName = 'CommandLineError';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * A collection of error codes any command line functionality may return/throw.
 *
 * @module dxp3-util/CommandLineError
 */
const Assert = require('./Assert');
const Help = require('./Help');
/**
 * @property {String} message
 * @property {String} code
 * @extends Error
 */
class CommandLineError extends Error {

	/**
	 * @description TODO: Describe this method.
	 * @param {string} _code - TODO: Describe parameter.
	 * @param {string} _message - TODO: Describe parameter.
	 */
	constructor(_code, _message) {
		super(_message);
		this.code = _code;
	}

	/**
	 * @description TODO: Describe this method.
	 * @returns {string} TODO: Describe return value.
	 */
	toString() {
		return this.code + ': ' + this.message;
	}

	/**
	 * @description TODO: Describe this method.
	 * @param {Error} _error - TODO: Describe parameter.
	 * @returns {CommandLineError} TODO: Describe return value.
	 */
	static from(_error) {
		if(_error === undefined || _error === null) {
			return CommandLineError.UNKNOWN;
		}
		return new CommandLineError('UNKNOWN', _error.message);
	}
}
/**
 * This is typically used in an error that is returned/thrown when the argument(s)
 * of a method/operation is/are invalid.
 * @member {module:dxp3-util/CommandLineError~CommandLineError} ILLEGAL_ARGUMENT
 */
CommandLineError.ILLEGAL_ARGUMENT = new CommandLineError('ILLEGAL_ARGUMENT', 'Illegal argument');
/** @member {module:dxp3-util/CommandLineError~CommandLineError} UNKNOWN */
CommandLineError.UNKNOWN = new CommandLineError('UNKNOWN', 'Unknown');

// Check if someone tried to run/execute this file.
if(Assert.isFileToExecute(canonicalName)) {
    Help.print(CommandLineError);
    return;
}
module.exports = CommandLineError;