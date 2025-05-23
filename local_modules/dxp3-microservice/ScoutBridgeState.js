/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-microservice
 *
 * NAME
 * ScoutBridgeState
 */
const packageName = 'dxp3-net-udp';
const moduleName = 'ScoutBridgeState';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * A collection/enumeration of the different states an ScoutBridge can be in.
 *
 * @module dxp3-microservice/ScoutBridgeState
 */
// We throw a MicroServiceError when we are unable to parse/tranform a String
// to a valid ScoutBridgeState value.
const MicroServiceError = require('./MicroServiceError');
// We use the util.Help class to print out help information.
const util = require('dxp3-util');

// The actual enumeration object
const ScoutBridgeState = {
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
	 * @param {String} _scoutBridgeStateAsString A String to be parsed/transformed to an ScoutBridgeState value.
	 * @returns {String} A String representing an ScoutBridgeState.
	 * @throws {module:dxp3-net-udp/UDPError~UDPError}
	 * When the supplied parameter is undefined, null, not a string or empty or is not a valid ScoutBridgeState value.
	 */
	parse: function(_scoutBridgeStateAsString) {
		if(_scoutBridgeStateAsString === undefined || _scoutBridgeStateAsString === null) {
			throw UDPError.ILLEGAL_ARGUMENT;
		}
		if(typeof _scoutBridgeStateAsString != 'string') {
			throw UDPError.ILLEGAL_ARGUMENT;
		}
		_scoutBridgeStateAsString = _scoutBridgeStateAsString.trim();
		if(_scoutBridgeStateAsString.length <= 0) {
			throw UDPError.ILLEGAL_ARGUMENT;
		}
		_scoutBridgeStateAsString = _scoutBridgeStateAsString.toLowerCase();
		switch(_scoutBridgeStateAsString) {
			case 'initialized':
				return ScoutBridgeState.INITIALIZED;
			case 'running':
				return ScoutBridgeState.RUNNING;
			case 'starting':
				return ScoutBridgeState.STARTING;
			case 'stopped':
				return ScoutBridgeState.STOPPED;
			case 'stopping':
				return ScoutBridgeState.STOPPING;
			default:
				throw MicroServiceError.ILLEGAL_ARGUMENT;
		}
	}	
}
// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
    util.Help.print();
    return;
}
module.exports = ScoutBridgeState;