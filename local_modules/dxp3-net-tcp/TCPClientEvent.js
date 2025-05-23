/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-net-tcp
 *
 * NAME
 * TCPClientEvent
 */
const packageName = 'dxp3-net-tcp';
const moduleName = 'TCPClientEvent';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
// Check if someone tried to run/execute this file.
const util = require('dxp3-util');
if(util.Assert.isFileToExecute(canonicalName)) {
    util.Help.print();
    return;
}
/**
 * <p>A collection/enumeration of events an TCPClient may emit.<br/>
 * Several of these are directly mapped to the different states (@see module:dxp3-net-tcp/TCPClientState)
 * of a TCPClient.</p>
 *
 * @module dxp3-net-tcp/TCPClientEvent
 */

// We throw a TCPError when we are unable to parse/tranform a String
// to a valid TCPClientEvent value.
const TCPError = require('./TCPError');

const TCPClientEvent = {
	/**
	 * @member {String} CLOSED
	 */
	CLOSED: 'Closed',
	/**
	 * @member {String} CLOSING
	 */
	CLOSING: 'Closing',
	/**
	 * @member {String} CONNECTED
	 */
	CONNECTED: 'Connected',
	/**
	 * @member {String} CONNECTING
	 */
	CONNECTING: 'Connecting',
	/**
	 * @member {String} ERROR
	 * Emitted when an error is encountered by the TCPClient.
	 */
	ERROR: 'Error',
	/**
	 * @member {String} QUEUING
	 */
	QUEUING: 'Queuing',
	/**
	 * @member {String} SOCKET_CLOSED
	 */
	SOCKET_CLOSED: 'Socket closed',
	/**
	 * @member {String} SOCKET_CONNECTED
	 */
	SOCKET_CONNECTED: 'Socket connected',
	/**
	 * @member {String} SOCKET_CLOSED
	 */
	SOCKET_POOL_CLOSED: 'Socket pool closed',	
	/**
	 * @member {String} SOCKET_CONNECTED
	 */
	SOCKET_POOL_CONNECTED: 'Socket pool connected',
	/**
	 * @member {String} SOCKET_TIMEOUT
	 */
	SOCKET_TIMEOUT: 'Socket timeout',
	/**
	 * @function parse
	 *
	 * @param {String} _tcpClientEventAsString A String to be parsed/transformed to an TCPClientEvent value.
	 * @returns {String} A String representing a TCPClientEvent.
	 * @throws {module:dxp3-net-tcp/TCPError~TCPError}
	 * When the supplied parameter is undefined, null, not a string or empty or is not a valid TCPClientEvent value.
	 */
	parse: function(_tcpClientEventAsString) {
		if(_tcpClientEventAsString === undefined || _tcpClientEventAsString === null) {
			throw TCPError.ILLEGAL_ARGUMENT;
		}
		if(typeof _tcpClientEventAsString != 'string') {
			throw TCPError.ILLEGAL_ARGUMENT;
		}
		_tcpClientEventAsString = _tcpClientEventAsString.trim();
		if(_tcpClientEventAsString.length <= 0) {
			throw TCPError.ILLEGAL_ARGUMENT;
		}
		_tcpClientEventAsString = _tcpClientEventAsString.toLowerCase();
		switch(_tcpClientEventAsString) {
			case 'closed':
				return TCPClientEvent.CLOSED;
			case 'closing':
				return TCPClientEvent.CLOSING;
			case 'connected':
				return TCPClientEvent.CONNECTED;
			case 'connecting':
				return TCPClientEvent.CONNECTING;
			case 'error':
				return TCPClientEvent.ERROR;
			case 'queuing':
				return TCPClientEvent.QUEUING;
			case 'socketclosed':
			case 'socket-closed':
			case 'socket_closed':
			case 'socket closed':
				return TCPClientEvent.SOCKET_CLOSED;
			case 'socketconnected':
			case 'socket-connected':
			case 'socket_connected':
			case 'socket connected':
				return TCPClientEvent.SOCKET_CONNECTED;
			case 'socketpoolclosed':
			case 'socket-pool-closed':
			case 'socket_pool_closed':
			case 'socket pool closed':
				return TCPClientEvent.SOCKET_POOL_CLOSED;
			case 'socketpoolconnected':
			case 'socket-pool-connected':
			case 'socket_pool_connected':
			case 'socket pool connected':
				return TCPClientEvent.SOCKET_POOL_CONNECTED;
			case 'sockettimeout':
			case 'socket-timeout':
			case 'socket_timeout':
			case 'socket timeout':
				return TCPClientEvent.SOCKET_TIMEOUT;
			default:
				throw TCPError.ILLEGAL_ARGUMENT;
		}
	}	
}

module.exports = TCPClientEvent;