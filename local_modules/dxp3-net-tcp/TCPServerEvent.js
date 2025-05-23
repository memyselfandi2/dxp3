/*	
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-net-tcp
 *
 * NAME
 * TCPServerEvent
 */
const packageName = 'dxp3-net-tcp';
const moduleName = 'TCPServerEvent';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
// Check if someone tried to run/execute this file.
const util = require('dxp3-util');
if(util.Assert.isFileToExecute(canonicalName)) {
    util.Help.print();
    return;
}
/**
 * A collection/enumeration of events a TCPServer may emit.
 * Several of these are directly mapped to the different states (@see module:dxp3-net-tcp/TCPServerEvent)
 * of a TCPServer.
 *
 * @module dxp3-net-tcp/TCPServerEvent
 */

// We throw a TCPError.ILLEGAL_ARGUMENT when we are unable to parse/tranform a String
// to a valid TCPServerEvent value.
const TCPError = require('./TCPError');

const TCPServerEvent = {
	/**
	 * @member {String} ERROR
	 * Emitted when an error is encountered by the server.
	 */
	ERROR: 'Error',
	/**
	 * @member {String} RUNNING
	 * Emitted when the server transitions to the RUNNING state.
	 * This event will be accompanied by the server address and port.
	 * Example: server.on(TCPServerEvent.RUNNING, function(address, port) {...});
	 */
	RUNNING: 'Running',
	/**
	 * @member {String} SOCKET_CONNECTED
	 * Emitted when a new client/socket has connected to the server.
	 */
	SOCKET_CONNECTED: 'Socket connected',
	/**
	 * @member {String} SOCKET_CLOSED
	 * Emitted when a client/socket has disconnected from the server.
	 */
	SOCKET_CLOSED: 'Socket closed',
	/**
	 * @member {String} STARTING
	 * Emitted when the server transitions to the STARTING state.
	 */
	STARTING: 'Starting',
	/**
	 * @member {String} STOPPED
	 * Emitted when the server transitions to the STOPPED state.
	 */
	STOPPED: 'Stopped',
	/**
	 * @member {String} STOPPING
	 * Emitted when the server transitions to the STOPPING state.
	 */
	STOPPING: 'Stopping',
	/**
	 * @function parse
	 *
	 * @param {String} serverEventAsString A String to be parsed/transformed to a TCPServerEvent value.
	 * @returns {String} A String representing a TCPServerEvent.
	 * @throws {module:dxp3-net-tcp/TCPError~TCPError}
	 * When the supplied parameter is undefined, null, not a string or empty or is not a valid TCPServerEvent value.
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
				return TCPServerEvent.ERROR;
			case 'running':
				return TCPServerEvent.RUNNING;
			case 'socketconnected':
			case 'socket connected':
			case 'socket-connected':
			case 'socket_connected':
				return TCPServerEvent.SOCKET_CONNECTED;
			case 'socketclosed':
			case 'socket closed':
			case 'socket-closed':
			case 'socket_closed':
				return TCPServerEvent.SOCKET_CLOSED;
			case 'starting':
				return TCPServerEvent.STARTING;
			case 'stopped':
				return TCPServerEvent.STOPPED;
			case 'stopping':
				return TCPServerEvent.STOPPING;
			default:
				throw TCPError.ILLEGAL_ARGUMENT;
		}
	}	
}

module.exports = TCPServerEvent;