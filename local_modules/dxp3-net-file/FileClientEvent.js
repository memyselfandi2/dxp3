/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-net-file
 *
 * NAME
 * FileClientEvent
 */
const packageName = 'dxp3-net-file';
const moduleName = 'FileClientEvent';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
// Check if someone tried to run/execute this file.
const util = require('dxp3-util');
if(util.Assert.isFileToExecute(canonicalName)) {
	util.Help.print();
	return;
}
/**
 * <p>A collection/enumeration of events an FileClient may emit.<br/>
 * Several of these are directly mapped to the different states (@see module:dxp3-net-file/FileClientState)
 * of a FileClient.</p>
 *
 * @module dxp3-net-file/FileClientEvent
 */
const tcp = require('dxp3-net-tcp');
// We throw a FileError when we are unable to parse/tranform a String
// to a valid FileClientEvent value.
const FileError = require('./FileError');

const FileClientEvent = {
	/**
	 * @member {String} CLOSED
	 */
	CLOSED: tcp.TCPClientEvent.CLOSED,
	/**
	 * @member {String} CLOSING
	 */
	CLOSING: tcp.TCPClientEvent.CLOSING,
	/**
	 * @member {String} CONNECTED
	 */
	CONNECTED: tcp.TCPClientEvent.CONNECTED,
	/**
	 * @member {String} CONNECTING
	 */
	CONNECTING: tcp.TCPClientEvent.CONNECTING,
	/**
	 * @member {String} ERROR
	 * Emitted when an error is encountered by the FileClient.
	 */
	ERROR: tcp.TCPClientEvent.ERROR,
	/**
	 * @member {String} QUEUING
	 */
	QUEUING: tcp.TCPClientEvent.QUEUING,
	/**
	 * @member {String} SOCKET_CLOSED
	 */
	SOCKET_CLOSED: tcp.TCPClientEvent.SOCKET_CLOSED,
	/**
	 * @member {String} SOCKET_CONNECTED
	 */
	SOCKET_CONNECTED: tcp.TCPClientEvent.SOCKET_CONNECTED,
	/**
	 * @member {String} SOCKET_CLOSED
	 */
	SOCKET_POOL_CLOSED: tcp.TCPClientEvent.SOCKET_POOL_CLOSED,	
	/**
	 * @member {String} SOCKET_CONNECTED
	 */
	SOCKET_POOL_CONNECTED: tcp.TCPClientEvent.SOCKET_POOL_CONNECTED,
	/**
	 * @member {String} SOCKET_TIMEOUT
	 */
	SOCKET_TIMEOUT: tcp.TCPClientEvent.SOCKET_TIMEOUT,
	/**
	 * @function parse
	 *
	 * @param {String} clientEventAsString A String to be parsed/transformed to an FileClientEvent value.
	 * @returns {String} A String representing a FileClientEvent.
	 * @throws {module:dxp3-net-file/FileError~FileError}
	 * When the supplied parameter is undefined, null, not a string or empty or is not a valid FileClientEvent value.
	 */
	parse: function(clientEventAsString) {
		try {
			return TCPClientEvent.parse(clientEventAsString);
		} catch(exception) {
			throw FileError.ILLEGAL_ARGUMENT;
		}
	}	
}

module.exports = FileClientEvent;