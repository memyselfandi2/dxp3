/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-net-tcp
 *
 * NAME
 * TCPServerState
 */
const packageName = 'dxp3-net-tcp';
const moduleName = 'TCPServerState';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
// Check if someone tried to run/execute this file.
const util = require('dxp3-util');
if(util.Assert.isFileToExecute(canonicalName)) {
    util.Help.print();
    return;
}
/**
 * A collection/enumeration of the different states a TCPServer can be in.
 *
 * @module dxp3-net-tcp/TCPServerState
 */

// We throw a TCPError.ILLEGAL_ARGUMENT when we are unable to parse/tranform a String
// to a valid TCPServerState value.
const TCPError = require('./TCPError');

// The actual enumeration object
const TCPServerState = {
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
	 * @param {String} tcpServerStateAsString A String to be parsed/transformed to an TCPServerState value.
	 * @returns {String} A String representing an TCPServerState.
	 * @throws {module:dxp3-net-tcp/TCPError~TCPError}
	 * When the supplied parameter is undefined, null, not a string or empty or is not a valid TCPServerState value.
	 */
	parse: function(tcpServerStateAsString) {
		if(tcpServerStateAsString === undefined || tcpServerStateAsString === null) {
			throw TCPError.ILLEGAL_ARGUMENT;
		}
		if(typeof tcpServerStateAsString != 'string') {
			throw TCPError.ILLEGAL_ARGUMENT;
		}
		tcpServerStateAsString = tcpServerStateAsString.trim();
		if(tcpServerStateAsString.length <= 0) {
			throw TCPError.ILLEGAL_ARGUMENT;
		}
		tcpServerStateAsString = tcpServerStateAsString.toLowerCase();
		switch(tcpServerStateAsString) {
			case 'initialized':
				return TCPServerState.INITIALIZED;
			case 'running':
				return TCPServerState.RUNNING;
			case 'starting':
				return TCPServerState.STARTING;
			case 'stopped':
				return TCPServerState.STOPPED;
			case 'stopping':
				return TCPServerState.STOPPING;
			default:
				throw TCPError.ILLEGAL_ARGUMENT;
		}
	}
}

module.exports = TCPServerState;