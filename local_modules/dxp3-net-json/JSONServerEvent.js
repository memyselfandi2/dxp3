/*	
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-net-json
 *
 * NAME
 * JSONServerEvent
 */
const packageName = 'dxp3-net-json';
const moduleName = 'JSONServerEvent';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
// Check if someone tried to run/execute this file.
const util = require('dxp3-util');
if(util.Assert.isFileToExecute(canonicalName)) {
	util.Help.print();
	return;
}
/**
 * A collection/enumeration of events a JSONServer may emit.
 * Several of these are directly mapped to the different states (@see module:dxp3-net-json/JSONServerEvent)
 * of a JSONServer.
 *
 * @module dxp3-net-json/JSONServerEvent
 */

// We throw a JSONError.ILLEGAL_ARGUMENT when we are unable to parse/tranform a String
// to a valid JSONServerEvent value.
const JSONError = require('./JSONError');
const tcp = require('dxp3-net-tcp');

const JSONServerEvent = {
	/**
	 * @member {String} ERROR
	 * Emitted when an error is encountered by the server.
	 */
	ERROR: tcp.TCPServerEvent.ERROR,
	/**
	 * @member {String} REQUEST
	 * Emitted when a client/socket has send a request.
	 */
	REQUEST: 'Request',
	/**
	 * @member {String} RUNNING
	 * Emitted when the server transitions to the RUNNING state.
	 * This event will be accompanied by the server address and port.
	 * Example: server.on(JSONServerEvent.RUNNING, function(address, port) {...});
	 */
	RUNNING: tcp.TCPServerEvent.RUNNING,
	/**
	 * @member {String} SOCKET_CONNECTED
	 * Emitted when a new client/socket has connected to the server.
	 */
	SOCKET_CONNECTED: tcp.TCPServerEvent.SOCKET_CONNECTED,
	/**
	 * @member {String} SOCKET_CLOSED
	 * Emitted when a client/socket has disconnected from the server.
	 */
	SOCKET_CLOSED: tcp.TCPServerEvent.SOCKET_CLOSED,
	/**
	 * @member {String} STARTING
	 * Emitted when the server transitions to the STARTING state.
	 */
	STARTING: tcp.TCPServerEvent.STARTING,
	/**
	 * @member {String} STOPPED
	 * Emitted when the server transitions to the STOPPED state.
	 */
	STOPPED: tcp.TCPServerEvent.STOPPED,
	/**
	 * @member {String} STOPPING
	 * Emitted when the server transitions to the STOPPING state.
	 */
	STOPPING: tcp.TCPServerEvent.STOPPING,
	/**
	 * @function parse
	 *
	 * @param {String} serverEventAsString
	 * A String to be parsed/transformed to a JSONServerEvent value.
	 *
	 * @returns {String} A String representing a JSONServerEvent.
	 *
	 * @throws {module:dxp3-net-tcp/TCPError~TCPError}
	 * When the supplied parameter is undefined, null, not a string or
	 * empty or is not a valid JSONServerEvent value.
	 */
	parse: function(serverEventAsString) {
		if(serverEventAsString === undefined || serverEventAsString === null) {
			throw TCPError.ILLEGAL_ARGUMENT;
		}
		if(typeof serverEventAsString != 'string') {
			throw TCPError.ILLEGAL_ARGUMENT;
		}
		serverEventAsString = serverEventAsString.trim();
		if(serverEventAsString.length <= 0) {
			throw TCPError.ILLEGAL_ARGUMENT;
		}
		serverEventAsString = serverEventAsString.toLowerCase();
		switch(serverEventAsString) {
			case 'error':
				return JSONServerEvent.ERROR;
			case 'request':
				return JSONServerEvent.REQUEST;
			case 'running':
				return JSONServerEvent.RUNNING;
			case 'socketconnected':
			case 'socket connected':
			case 'socket-connected':
			case 'socket_connected':
				return JSONServerEvent.SOCKET_CONNECTED;
			case 'socketclosed':
			case 'socket closed':
			case 'socket-closed':
			case 'socket_closed':
				return JSONServerEvent.SOCKET_CLOSED;
			case 'starting':
				return JSONServerEvent.STARTING;
			case 'stopped':
				return JSONServerEvent.STOPPED;
			case 'stopping':
				return JSONServerEvent.STOPPING;
			default:
				throw JSONError.ILLEGAL_ARGUMENT;
		}
	}	
}

module.exports = JSONServerEvent;