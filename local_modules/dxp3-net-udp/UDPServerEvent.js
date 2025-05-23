/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-net-udp
 *
 * NAME
 * UDPServerEvent
 */
const packageName = 'dxp3-net-udp';
const moduleName = 'UDPServerEvent';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * A collection/enumeration of events an UDPServer may emit.
 * Several of these are directly mapped to the different states (@see module:dxp3-net-udp/UDPServerState)
 * of an UDPServer.
 *
 * @module dxp3-net-udp/UDPServerEvent
 */
// We throw an UDPError when we are unable to parse/tranform a String
// to a valid UDPServerEvent value.
const UDPError = require('./UDPError');
// We use the util.Help class to print out help information.
const util = require('dxp3-util');

const UDPServerEvent = {
	/**
	 * @member {String} ERROR
	 * Emitted when an error is encountered by the UDPServer.
	 */
	ERROR: 'Error',
	/**
	 * @member {String} MESSAGE
	 */
	MESSAGE: 'Message',
	/**
	 * @member {String} RAW
	 */
	RAW: 'Raw',
	/**
	 * @member {String} RUNNING
	 * Emitted when the UDPServer transitions to the RUNNING state.
	 * This event will be accompanied by the UDP server address and port.
	 * Example: udpServer.on(UDPServerEvent.RUNNING, function(address, port) {...});
	 */
	RUNNING: 'Running',
	/**
	 * @member {String} STARTING
	 * Emitted when the UDPServer transitions to the STARTING state.
	 */
	STARTING: 'Starting',
	/**
	 * @member {String} STOPPED
	 * Emitted when the UDPServer transitions to the STOPPED state.
	 */
	STOPPED: 'Stopped',
	/**
	 * @member {String} STOPPING
	 * Emitted when the UDPServer transitions to the STOPPING state.
	 */
	STOPPING: 'Stopping',
	/**
	 * @function parse
	 *
	 * @param {String} _udpServerEventAsString A String to be parsed/transformed to an UDPServerEvent value.
	 * @returns {String} A String representing a UDPServerEvent.
	 * @throws {module:dxp3-net-udp/UDPError~UDPError}
	 * When the supplied parameter is undefined, null, not a string or empty or is not a valid UDPServerEvent value.
	 */
	parse: function(_udpServerEventAsString) {
		if(_udpServerEventAsString === undefined || _udpServerEventAsString === null) {
			throw UDPError.ILLEGAL_ARGUMENT;
		}
		if(typeof _udpServerEventAsString != 'string') {
			throw UDPError.ILLEGAL_ARGUMENT;
		}
		_udpServerEventAsString = _udpServerEventAsString.trim();
		if(_udpServerEventAsString.length <= 0) {
			throw UDPError.ILLEGAL_ARGUMENT;
		}
		_udpServerEventAsString = _udpServerEventAsString.toLowerCase();
		switch(_udpServerEventAsString) {
			case 'error':
				return UDPServerEvent.ERROR;
			case 'running':
				return UDPServerEvent.RUNNING;
			case 'starting':
				return UDPServerEvent.STARTING;
			case 'stopped':
				return UDPServerEvent.STOPPED;
			case 'stopping':
				return UDPServerEvent.STOPPING;
			default:
				throw UDPError.ILLEGAL_ARGUMENT;
		}
	}
}
// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
    util.Help.print();
    return;
}
module.exports = UDPServerEvent;