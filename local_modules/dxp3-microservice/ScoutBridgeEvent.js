/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-microservice
 *
 * NAME
 * ScoutBridgeEvent
 */
const packageName = 'dxp3-microservice';
const moduleName = 'ScoutBridgeEvent';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * A collection/enumeration of events an ScoutBridge may emit.
 * Several of these are directly mapped to the different states (@see module:dxp3-microservice/ScoutBridgeState)
 * of a ScoutBridge.
 *
 * @module dxp3-microservice/ScoutBridgeEvent
 */
// We throw a MicroServiceError when we are unable to parse/tranform a String
// to a valid ScoutBridgeEvent value.
const MicroServiceError = require('./MicroServiceError');
// We use the util.Help class to print out help information.
const util = require('dxp3-util');

const ScoutBridgeEvent = {
	/**
	 * @member {String} ERROR
	 * Emitted when an error is encountered by the ScoutBridge.
	 */
	ERROR: 'Error',
	/**
	 * @member {String} RUNNING
	 * Emitted when the ScoutBridge transitions to the RUNNING state.
	 * This event will be accompanied by the ScoutBridge unicast address and port.
	 * Example: scoutBridge.on(ScoutBridgeEvent.RUNNING, (_address, _port) => {...});
	 */
	RUNNING: 'Running',
	/**
	 * @member {String} STARTING
	 * Emitted when the ScoutBridge transitions to the STARTING state.
	 */
	STARTING: 'Starting',
	/**
	 * @member {String} STOPPED
	 * Emitted when the ScoutBridge transitions to the STOPPED state.
	 */
	STOPPED: 'Stopped',
	/**
	 * @member {String} STOPPING
	 * Emitted when the ScoutBridge transitions to the STOPPING state.
	 */
	STOPPING: 'Stopping',
	/**
	 * @function parse
	 *
	 * @param {String} _scoutBridgeEventAsString A String to be parsed/transformed to an ScoutBridgeEvent value.
	 * @returns {String} A String representing a ScoutBridgeEvent.
	 * @throws {module:dxp3-net-udp/UDPError~UDPError}
	 * When the supplied parameter is undefined, null, not a string or empty or is not a valid ScoutBridgeEvent value.
	 */
	parse: function(_scoutBridgeEventAsString) {
		if(_scoutBridgeEventAsString === undefined || _scoutBridgeEventAsString === null) {
			throw UDPError.ILLEGAL_ARGUMENT;
		}
		if(typeof _scoutBridgeEventAsString != 'string') {
			throw UDPError.ILLEGAL_ARGUMENT;
		}
		_scoutBridgeEventAsString = _scoutBridgeEventAsString.trim();
		if(_scoutBridgeEventAsString.length <= 0) {
			throw UDPError.ILLEGAL_ARGUMENT;
		}
		_scoutBridgeEventAsString = _scoutBridgeEventAsString.toLowerCase();
		switch(_scoutBridgeEventAsString) {
			case 'error':
				return ScoutBridgeEvent.ERROR;
			case 'running':
				return ScoutBridgeEvent.RUNNING;
			case 'starting':
				return ScoutBridgeEvent.STARTING;
			case 'stopped':
				return ScoutBridgeEvent.STOPPED;
			case 'stopping':
				return ScoutBridgeEvent.STOPPING;
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
module.exports = ScoutBridgeEvent;