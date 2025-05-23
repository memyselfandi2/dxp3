/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-net-udp
 *
 * NAME
 * UDPServerState
 */
const packageName = 'dxp3-net-udp';
const moduleName = 'UDPServerState';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * A collection/enumeration of the different states an UDPServer can be in.
 *
 * @module dxp3-net-udp/UDPServerState
 */
// We throw an UDPError when we are unable to parse/tranform a String
// to a valid UDPServerState value.
const UDPError = require('./UDPError');
// We use the util.Help class to print out help information.
const util = require('dxp3-util');

// The actual enumeration object
const UDPServerState = {
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
	 * @param {String} _udpServerStateAsString A String to be parsed/transformed to an UDPServerState value.
	 * @returns {String} A String representing an UDPServerState.
	 * @throws {module:dxp3-net-udp/UDPError~UDPError}
	 * When the supplied parameter is undefined, null, not a string or empty or is not a valid UDPServerState value.
	 */
	parse: function(_udpServerStateAsString) {
		if(_udpServerStateAsString === undefined || _udpServerStateAsString === null) {
			throw UDPError.ILLEGAL_ARGUMENT;
		}
		if(typeof _udpServerStateAsString != 'string') {
			throw UDPError.ILLEGAL_ARGUMENT;
		}
		_udpServerStateAsString = _udpServerStateAsString.trim();
		if(_udpServerStateAsString.length <= 0) {
			throw UDPError.ILLEGAL_ARGUMENT;
		}
		_udpServerStateAsString = _udpServerStateAsString.toLowerCase();
		switch(_udpServerStateAsString) {
			case 'initialized':
				return UDPServerState.INITIALIZED;
			case 'running':
				return UDPServerState.RUNNING;
			case 'starting':
				return UDPServerState.STARTING;
			case 'stopped':
				return UDPServerState.STOPPED;
			case 'stopping':
				return UDPServerState.STOPPING;
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
module.exports = UDPServerState;