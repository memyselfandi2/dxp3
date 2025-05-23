/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-net-udp
 *
 * NAME
 * UDPBridgeState
 */
const packageName = 'dxp3-net-udp';
const moduleName = 'UDPBridgeState';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * A collection/enumeration of the different states an UDPBridge can be in.
 *
 * @module dxp3-net-udp/UDPBridgeState
 */
// We throw an UDPError when we are unable to parse/tranform a String
// to a valid UDPBridgeState value.
const UDPError = require('./UDPError');
// We use the util.Help class to print out help information.
const util = require('dxp3-util');

// The actual enumeration object
const UDPBridgeState = {
	/** @member {String} INITIALIZED */
	INITIALIZED: 'Initialized',
	/** @member {String} RUNNING */
	RUNNING: 'Running',
	/** @member {String} STARTING */
	STARTING: 'Starting',
	/** @member {String} STOPPED */
	STOPPED: 'Stopped',
	/** @member {String} STOPPING */
	STOPPING: 'Stopping',
	/**
	 * @function parse
	 *
	 * @param {String} _udpBridgeStateAsString A String to be parsed/transformed to an UDPBridgeState value.
	 * @returns {String} A String representing an UDPBridgeState.
	 * @throws {module:dxp3-net-udp/UDPError~UDPError}
	 * When the supplied parameter is undefined, null, not a string or empty or is not a valid UDPBridgeState value.
	 */
	parse: function(_udpBridgeStateAsString) {
		if(_udpBridgeStateAsString === undefined || _udpBridgeStateAsString === null) {
			throw UDPError.ILLEGAL_ARGUMENT;
		}
		if(typeof _udpBridgeStateAsString != 'string') {
			throw UDPError.ILLEGAL_ARGUMENT;
		}
		_udpBridgeStateAsString = _udpBridgeStateAsString.trim();
		if(_udpBridgeStateAsString.length <= 0) {
			throw UDPError.ILLEGAL_ARGUMENT;
		}
		_udpBridgeStateAsString = _udpBridgeStateAsString.toLowerCase();
		switch(_udpBridgeStateAsString) {
			case 'initialized':
				return UDPBridgeState.INITIALIZED;
			case 'running':
				return UDPBridgeState.RUNNING;
			case 'starting':
				return UDPBridgeState.STARTING;
			case 'stopped':
				return UDPBridgeState.STOPPED;
			case 'stopping':
				return UDPBridgeState.STOPPING;
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
module.exports = UDPBridgeState;