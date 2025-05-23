/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-net-json
 *
 * NAME
 * JSONClientState
 */
const packageName = 'dxp3-net-json';
const moduleName = 'JSONClientState';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
// Check if someone tried to run/execute this file.
const util = require('dxp3-util');
if(util.Assert.isFileToExecute(canonicalName)) {
	util.Help.print();
	return;
}
/**
 * <p>A collection/enumeration of the different states an JSONClient can be in.</p>
 *
 * @module dxp3-net-json/JSONClientState
 */
const JSONError = require('./JSONError');
const tcp = require('dxp3-net-tcp');

const JSONClientState = {
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
	 * @param {String} clientStateAsString A String to be parsed/transformed to an JSONClientState value.
	 * @returns {String} A String representing an JSONClientState.
	 * @throws {module:dxp3-net-json/JSONError~JSONError}
	 * When the supplied parameter is undefined, null, not a string or empty or is not a valid JSONClientState value.
	 */
	parse: function(clientStateAsString) {
		try {
			return TCPClientState.parse(clientStateAsString);
		} catch(exception) {
			throw JSONError.ILLEGAL_ARGUMENT;
		}
	}	
}

module.exports = JSONClientState;