/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-net-file
 *
 * NAME
 * FileClientState
 */
const packageName = 'dxp3-net-file';
const moduleName = 'FileClientState';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
// Check if someone tried to run/execute this file.
const util = require('dxp3-util');
if(util.Assert.isFileToExecute(canonicalName)) {
	util.Help.print();
	return;
}
/**
 * <p>A collection/enumeration of the different states an FileClient can be in.</p>
 *
 * @module dxp3-net-file/FileClientState
 */
const FileError = require('./FileError');
const tcp = require('dxp3-net-tcp');

const FileClientState = {
	/** @member {String} CLOSED */
	CLOSED: tcp.TCPClientState.CLOSED,
	/** @member {String} CLOSING */
	CLOSING: tcp.TCPClientState.CLOSING,
	/** @member {String} CONNECTED */
	CONNECTED: tcp.TCPClientState.CONNECTED,
	/** @member {String} CONNECTING */
	CONNECTING: tcp.TCPClientState.CONNECTING,
	/** @member {String} INITIALIZED */
	INITIALIZED: tcp.TCPClientState.INITIALIZED,
	/** @member {String} QUEUING */
	QUEUING: tcp.TCPClientState.QUEUING,
	/**
	 * @function parse
	 *
	 * @param {String} clientStateAsString A String to be parsed/transformed to an FileClientState value.
	 * @returns {String} A String representing an FileClientState.
	 * @throws {module:dxp3-net-file/FileError~FileError}
	 * When the supplied parameter is undefined, null, not a string or empty or is not a valid FileClientState value.
	 */
	parse: function(clientStateAsString) {
		try {
			return TCPClientState.parse(clientStateAsString);
		} catch(exception) {
			throw FileError.ILLEGAL_ARGUMENT;
		}
	}	
}

module.exports = FileClientState;