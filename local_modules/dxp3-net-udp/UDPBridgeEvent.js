/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-net-udp
 *
 * NAME
 * UDPBridgeEvent
 */
const packageName = 'dxp3-net-udp';
const moduleName = 'UDPBridgeEvent';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * A collection/enumeration of events an UDPBridge may emit.
 * Several of these are directly mapped to the different states (@see module:dxp3-net-udp/UDPBridgeState)
 * of an UDPBridge.
 *
 * @module dxp3-net-udp/UDPBridgeEvent
 */
// We throw an UDPError when we are unable to parse/tranform a String
// to a valid UDPBridgeEvent value.
const UDPError = require('./UDPError');
// We use the util.Help class to print out help information.
const util = require('dxp3-util');

const UDPBridgeEvent = {
	/**
	 * @member {String} ERROR
	 * Emitted when an error is encountered by the UDPBridge.
	 */
	ERROR: 'Error',
	/**
	 * @member {String} RUNNING
	 * Emitted when the UDPBridge transitions to the RUNNING state.
	 * This event will be accompanied by the UDPBridge unicast address and port.
	 * Example: udpBridge.on(UDPBridgeEvent.RUNNING, (_address, _port) => {...});
	 */
	RUNNING: 'Running',
	/**
	 * @member {String} STARTING
	 * Emitted when the UDPBridge transitions to the STARTING state.
	 */
	STARTING: 'Starting',
	/**
	 * @member {String} STOPPED
	 * Emitted when the UDPBridge transitions to the STOPPED state.
	 */
	STOPPED: 'Stopped',
	/**
	 * @member {String} STOPPING
	 * Emitted when the UDPBridge transitions to the STOPPING state.
	 */
	STOPPING: 'Stopping',
	/**
	 * @function parse
	 *
	 * @param {String} _udpBridgeEventAsString A String to be parsed/transformed to an UDPBridgeEvent value.
	 * @returns {String} A String representing a UDPBridgeEvent.
	 * @throws {module:dxp3-net-udp/UDPError~UDPError}
	 * When the supplied parameter is undefined, null, not a string or empty or is not a valid UDPBridgeEvent value.
	 */
	parse: function(_udpBridgeEventAsString) {
		if(_udpBridgeEventAsString === undefined || _udpBridgeEventAsString === null) {
			throw UDPError.ILLEGAL_ARGUMENT;
		}
		if(typeof _udpBridgeEventAsString != 'string') {
			throw UDPError.ILLEGAL_ARGUMENT;
		}
		_udpBridgeEventAsString = _udpBridgeEventAsString.trim();
		if(_udpBridgeEventAsString.length <= 0) {
			throw UDPError.ILLEGAL_ARGUMENT;
		}
		_udpBridgeEventAsString = _udpBridgeEventAsString.toLowerCase();
		switch(_udpBridgeEventAsString) {
			case 'error':
				return UDPBridgeEvent.ERROR;
			case 'running':
				return UDPBridgeEvent.RUNNING;
			case 'starting':
				return UDPBridgeEvent.STARTING;
			case 'stopped':
				return UDPBridgeEvent.STOPPED;
			case 'stopping':
				return UDPBridgeEvent.STOPPING;
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
module.exports = UDPBridgeEvent;