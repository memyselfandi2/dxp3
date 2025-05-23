/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-net-tcp
 *
 * NAME
 * TCPSocketPoolState
 */
const packageName = 'dxp3-net-tcp';
const moduleName = 'TCPSocketPoolState';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
// Check if someone tried to run/execute this file.
const util = require('dxp3-util');
if(util.Assert.isFileToExecute(canonicalName)) {
    util.Help.print();
    return;
}
/**
 * <p>A collection/enumeration of the different states an TCPSocketPool can be in.</p>
 *
 * @module dxp3-net-tcp/SocketPoolState
 */

// We throw a Error when we are unable to parse/tranform a String
// to a valid TCPSocketPoolState value.
const TCPError = require('./TCPError');

const TCPSocketPoolState = {
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
	/**
	 * @function parse
	 *
	 * @param {String} tcpSocketPoolStateAsString A String to be parsed/transformed to a TCPSocketPoolState value.
	 * @returns {String} A String representing an TCPSocketPoolState.
	 * @throws {module:dxp3-net-tcp/Error~Error}
	 * When the supplied parameter is undefined, null, not a string or empty or is not a valid TCPSocketPoolState value.
	 */
	parse: function(tcpSocketPoolStateAsString) {
		if(tcpSocketPoolStateAsString === undefined || tcpSocketPoolStateAsString === null) {
			throw TCPSocketError.ILLEGAL_ARGUMENT;
		}
		if(typeof tcpSocketPoolStateAsString != 'string') {
			throw TCPSocketError.ILLEGAL_ARGUMENT;
		}
		tcpSocketPoolStateAsString = tcpSocketPoolStateAsString.trim();
		if(tcpSocketPoolStateAsString.length <= 0) {
			throw TCPSocketError.ILLEGAL_ARGUMENT;
		}
		tcpSocketPoolStateAsString = tcpSocketPoolStateAsString.toLowerCase();
		switch(tcpSocketPoolStateAsString) {
			case 'closed':
				return TCPSocketPoolState.CLOSED;
			case 'closing':
				return TCPSocketPoolState.CLOSING;
			case 'connected':
				return TCPSocketPoolState.CONNECTED;
			case 'connecting':
				return TCPSocketPoolState.CONNECTING;
			case 'initialized':
				return TCPSocketPoolState.INITIALIZED;
			default:
				throw TCPSocketError.ILLEGAL_ARGUMENT;
		}
	}	
}

module.exports = TCPSocketPoolState;