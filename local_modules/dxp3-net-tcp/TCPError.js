/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-net-tcp
 *
 * NAME
 * TCPError
 */
const packageName = 'dxp3-net-tcp';
const moduleName = 'TCPError';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
// Check if someone tried to run/execute this file.
const util = require('dxp3-util');
if(util.Assert.isFileToExecute(canonicalName)) {
    util.Help.print();
    return;
}
/**
 * A collection of error codes a TCPServer or TCPClient may return/throw.
 *
 * @module dxp3-net-tcp/TCPError
 */

/**
 * @property {String} message
 * @property {String} code
 * @extends Error
 */
class TCPError extends Error {

	constructor(_code, _message) {
		super(_message);
		this.code = _code;
	}

	toString() {
		return this.code + ': ' + this.message;
	}

	static from(_error) {
		if(_error === undefined || _error === null) {
			return TCPError.SOCKET_EXCEPTION;
		}
		return new TCPError('SOCKET_EXCEPTION', _error.message);
	}
}
/**
 * This is typically used in an error that is returned/thrown when the argument(s)
 * of a method/operation is/are invalid.
 * @type {module:dxp3-net-tcp/TCPError~TCPError}
 * @static
 */
TCPError.ILLEGAL_ARGUMENT = new TCPError('ILLEGAL_ARGUMENT', 'Illegal argument');
/**
 * This is typically used in an error that is returned/thrown when a method/operation
 * is called during the wrong state of an TCP server or client.
 * One can for example not set the port when an TCP server is RUNNING.
 * @type {module:dxp3-net-tcp/TCPError~TCPError}
 * @static
 */
TCPError.ILLEGAL_STATE = new TCPError('ILLEGAL_STATE', 'Illegal state');
/**
 * This is thrown when a sub class has not implemented a method defined to be overridden by its super class.
 * @type {module:dxp3-net-tcp/TCPError~TCPError}
 * @static
 */
TCPError.NOT_IMPLEMENTED = new TCPError('NOT_IMPLEMENTED', 'Not implemented');
/**
 * This is thrown when something goes wrong attempting to listen on/bind a socket.
 * @type {module:dxp3-net-tcp/TCPError~TCPError}
 * @static
 */
TCPError.SOCKET_EXCEPTION = new TCPError('SOCKET_EXCEPTION', 'Socket exception');

module.exports = TCPError;