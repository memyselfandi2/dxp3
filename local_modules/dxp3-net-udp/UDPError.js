/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-net-udp
 *
 * NAME
 * UDPError
 */
const packageName = 'dxp3-net-udp';
const moduleName = 'UDPError';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * A collection of error codes an UDPServer or UDPClient may return/throw.
 *
 * @module dxp3-net-udp/UDPError
 */
// We use the util.Help class to print out help information.
const util = require('dxp3-util');
/**
 * @property {String} code
 * @property {String} message
 * @extends Error
 */
class UDPError extends Error {

	constructor(_code, _message) {
		super(_message);
		this._code = _code;
	}

    get code() {
        return this.getCode();
    }

    getCode() {
        return this._code;
    }

	toString() {
		return this.code + ': ' + this.message;
	}

	static from(_error) {
		if(_error === undefined || _error === null) {
			return UDPError.SOCKET_EXCEPTION;
		}
		return new UDPError(UDPError.SOCKET_EXCEPTION.getCode(), _error.message);
	}
}
/**
 * This is typically used in an error that is returned/thrown when the argument(s)
 * of a method/operation is/are invalid.
 * @type {module:dxp3-net-udp/UDPError~UDPError}
 * @static
 */
UDPError.ILLEGAL_ARGUMENT = new UDPError('ILLEGAL_ARGUMENT', 'Illegal argument');
/**
 * This is typically used in an error that is returned/thrown when a method/operation
 * is called during the wrong state of an UDP server or client.
 * One can for example not set the port when an UDP server is RUNNING.
 * @type {module:dxp3-net-udp/UDPError~UDPError}
 * @static
 */
UDPError.ILLEGAL_STATE = new UDPError('ILLEGAL_STATE', 'Illegal state');
/**
 * This is thrown when something goes wrong attempting to listen on/bind a socket.
 * @type {module:dxp3-net-udp/UDPError~UDPError}
 * @static
 */
UDPError.SOCKET_EXCEPTION = new UDPError('SOCKET_EXCEPTION', 'Socket exception');
// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
    util.Help.print(UDPError);
    return;
}
module.exports = UDPError;