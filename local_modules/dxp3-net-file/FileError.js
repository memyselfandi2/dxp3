/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-net-file
 *
 * NAME
 * FileError
 */
const packageName = 'dxp3-net-file';
const moduleName = 'FileError';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
// Check if someone tried to run/execute this file.
const util = require('dxp3-util');
if(util.Assert.isFileToExecute(canonicalName)) {
  util.Help.print();
  return;
}
/**
 * A collection of error codes a FileServer or FileClient may return/throw.
 *
 * @module dxp3-net-file/FileError
 */

/**
 * @property {String} message
 * @property {String} code
 * @extends Error
 */
class FileError extends Error {
	constructor(_code, message) {
		super(message);
		this.code = _code;
	}
}
/**
 * This is typically used in an error returned/thrown when the argument(s)
 * of a method/operation is/are invalid.
 * @type {module:dxp3-net-file/FileError~FileError}
 * @static
 */
FileError.ILLEGAL_ARGUMENT = new FileError('ILLEGAL_ARGUMENT', 'Illegal argument');
/**
 * This is typically used in an error returned/thrown when a method/operation
 * is called during the wrong state of a FileServer.
 * One can for example not set the port when a FileServer is RUNNING.
 * @type {module:dxp3-net-file/FileError~FileError}
 * @static
 */
FileError.ILLEGAL_STATE = new FileError('ILLEGAL_STATE', 'Illegal state');
/**
 * This is thrown when something goes wrong attempting to listen on/bind a socket.
 * @type {module:dxp3-net-file/FileError~FileError}
 * @static
 */
FileError.SOCKET_EXCEPTION = new FileError('SOCKET_EXCEPTION', 'Socket exception');
/**
 * This is thrown when we have reached the maximum number of allowed connections.
 */
FileError.MAXIMUM_SOCKET_POOL_SIZE_REACHED = new FileError('MAXIMUM_SOCKET_POOL_SIZE_REACHED', 'Maximum number of connections reached');

module.exports = FileError;