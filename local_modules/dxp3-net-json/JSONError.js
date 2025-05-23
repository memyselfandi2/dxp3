/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-net-json
 *
 * NAME
 * JSONError
 */
const packageName = 'dxp3-net-json';
const moduleName = 'JSONError';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
// Check if someone tried to run/execute this file.
const util = require('dxp3-util');
if(util.Assert.isFileToExecute(canonicalName)) {
  util.Help.print();
  return;
}
/**
 * A collection of error codes a JSONServer or JSONClient may return/throw.
 *
 * @module dxp3-net-json/JSONError
 */

/**
 * @property {String} message
 * @property {String} code
 * @extends Error
 */
class JSONError extends Error {
	constructor(message, _code) {
		super(message);
		this.code = _code;
	}
}
/**
 * This is typically used in an error returned/thrown when the argument(s)
 * of a method/operation is/are invalid.
 * @type {module:dxp3-net-json/JSONError~JSONError}
 * @static
 */
JSONError.ILLEGAL_ARGUMENT = new JSONError('Illegal argument', 'ILLEGAL_ARGUMENT');
/**
 * This is typically used in an error returned/thrown when a method/operation
 * is called during the wrong state of a JSONServer.
 * One can for example not set the port when a JSONServer is RUNNING.
 * @type {module:dxp3-net-json/JSONError~JSONError}
 * @static
 */
JSONError.ILLEGAL_STATE = new JSONError('Illegal state', 'ILLEGAL_STATE');
/**
 * This is thrown when something goes wrong attempting to listen on/bind a socket.
 * @type {module:dxp3-net-json/JSONError~JSONError}
 * @static
 */
JSONError.SOCKET_EXCEPTION = new JSONError('Socket exception', 'SOCKET_EXCEPTION');
/**
 * This is thrown when we have reached the maximum number of allowed connections.
 */
JSONError.MAXIMUM_SOCKET_POOL_SIZE_REACHED = new JSONError('Maximum number of connections reached', 'MAXIMUM_SOCKET_POOL_SIZE_REACHED');

module.exports = JSONError;