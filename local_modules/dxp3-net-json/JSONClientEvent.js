/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-net-json
 *
 * NAME
 * JSONClientEvent
 */
const packageName = 'dxp3-net-json';
const moduleName = 'JSONClientEvent';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
// Check if someone tried to run/execute this file.
const util = require('dxp3-util');
if(util.Assert.isFileToExecute(canonicalName)) {
	util.Help.print();
	return;
}
/**
 * <p>A collection/enumeration of events an JSONClient may emit.<br/>
 * Several of these are directly mapped to the different states (@see module:dxp3-net-json/JSONClientState)
 * of a JSONClient.</p>
 *
 * @module dxp3-net-json/JSONClientEvent
 */
const tcp = require('dxp3-net-tcp');
// We throw a JSONError when we are unable to parse/tranform a String
// to a valid JSONClientEvent value.
const JSONError = require('./JSONError');

const JSONClientEvent = {
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
	 * Emitted when an error is encountered by the JSONClient.
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
	 * @param {String} jsonClientEventAsString A String to be parsed/transformed to an JSONClientEvent value.
	 * @returns {String} A String representing a JSONClientEvent.
	 * @throws {module:dxp3-net-json/JSONError~JSONError}
	 * When the supplied parameter is undefined, null, not a string or empty or is not a valid JSONClientEvent value.
	 */
	parse: function(jsonClientEventAsString) {
		if(jsonClientEventAsString === undefined || jsonClientEventAsString === null) {
			throw JSONError.ILLEGAL_ARGUMENT;
		}
		if(typeof jsonClientEventAsString != 'string') {
			throw JSONError.ILLEGAL_ARGUMENT;
		}
		jsonClientEventAsString = jsonClientEventAsString.trim();
		if(jsonClientEventAsString.length <= 0) {
			throw JSONError.ILLEGAL_ARGUMENT;
		}
		jsonClientEventAsString = jsonClientEventAsString.toLowerCase();
		switch(jsonClientEventAsString) {
			case 'closed':
				return JSONClientEvent.CLOSED;
			case 'closing':
				return JSONClientEvent.CLOSING;
			case 'connected':
				return JSONClientEvent.CONNECTED;
			case 'connecting':
				return JSONClientEvent.CONNECTING;
			case 'error':
				return JSONClientEvent.ERROR;
			case 'queuing':
				return JSONClientEvent.QUEUING;
			case 'socketclosed':
			case 'socket-closed':
			case 'socket_closed':
			case 'socket closed':
				return JSONClientEvent.SOCKET_CLOSED;
			case 'socketconnected':
			case 'socket-connected':
			case 'socket_connected':
			case 'socket connected':
				return JSONClientEvent.SOCKET_CONNECTED;
			case 'socketpoolclosed':
			case 'socket-pool-closed':
			case 'socket_pool_closed':
			case 'socket pool closed':
				return JSONClientEvent.SOCKET_POOL_CLOSED;
			case 'socketpoolconnected':
			case 'socket-pool-connected':
			case 'socket_pool_connected':
			case 'socket pool connected':
				return JSONClientEvent.SOCKET_POOL_CONNECTED;
			case 'sockettimeout':
			case 'socket-timeout':
			case 'socket_timeout':
			case 'socket timeout':
				return JSONClientEvent.SOCKET_TIMEOUT;
			default:
				throw JSONError.ILLEGAL_ARGUMENT;
		}
	}	
}

module.exports = JSONClientEvent;