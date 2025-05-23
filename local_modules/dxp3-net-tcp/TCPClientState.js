/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-net-tcp
 *
 * NAME
 * TCPClientState
 */
const packageName = 'dxp3-net-tcp';
const moduleName = 'TCPClientState';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
// Check if someone tried to run/execute this file.
const util = require('dxp3-util');
if(util.Assert.isFileToExecute(canonicalName)) {
    util.Help.print();
    return;
}
/**
 * <p>A collection/enumeration of the different states an TCPClient can be in.</p>
 *
 * @module dxp3-net-tcp/TCPClientState
 */

// We throw a TCPError when we are unable to parse/tranform a String
// to a valid TCPClientState value.
const TCPError = require('./TCPError');

const TCPClientState = {
	/** @member {String} CLOSED */
	CLOSED: 'Closed',
	/** @member {String} CLOSING */
	CLOSING: 'Closing',
	/** @member {String} CONNECTED */
	CONNECTED: 'Connected',
	/** @member {String} CONNECTING */
	CONNECTING: 'Connecting',
	/** @member {String} INITIALIZED */
	INITIALIZED: 'Initialized',
	/** @member {String} QUEUING */
	QUEUING:'Queuing',
	/**
	 * @function parse
	 *
	 * @param {String} clientStateAsString A String to be parsed/transformed to an TCPClientState value.
	 * @returns {String} A String representing an TCPClientState.
	 * @throws {module:dxp3-net-tcp/TCPError~TCPError}
	 * When the supplied parameter is undefined, null, not a string or empty or is not a valid TCPClientState value.
	 */
	parse: function(clientStateAsString) {
		if(clientStateAsString === undefined || clientStateAsString === null) {
			throw TCPError.ILLEGAL_ARGUMENT;
		}
		if(typeof clientStateAsString != 'string') {
			throw TCPError.ILLEGAL_ARGUMENT;
		}
		clientStateAsString = clientStateAsString.trim();
		if(clientStateAsString.length <= 0) {
			throw TCPError.ILLEGAL_ARGUMENT;
		}
		clientStateAsString = clientStateAsString.toLowerCase();
		switch(clientStateAsString) {
			case 'closed':
				return TCPClientState.CLOSED;
			case 'closing':
				return TCPClientState.CLOSING;
			case 'connected':
				return TCPClientState.CONNECTED;
			case 'connecting':
				return TCPClientState.CONNECTING;
			case 'initialized':
				return TCPClientState.INITIALIZED;
			case 'queuing':
				return TCPClientState.QUEUING;
			default:
				throw TCPError.ILLEGAL_ARGUMENT;
		}
	}
}

module.exports = TCPClientState;