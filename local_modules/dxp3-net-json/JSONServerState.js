/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-net-json
 *
 * NAME
 * JSONServerState
 */
const packageName = 'dxp3-net-json';
const moduleName = 'JSONServerState';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
// Check if someone tried to run/execute this file.
const util = require('dxp3-util');
if(util.Assert.isFileToExecute(canonicalName)) {
  util.Help.print();
  return;
}
/**
 * A collection/enumeration of the different states a JSONServer can be in.
 *
 * @module dxp3-net-json/JSONServerState
 */
const tcp = require('dxp3-net-tcp');
const TCPServerState = tcp.TCPServerState;

// We throw a JSONError.ILLEGAL_ARGUMENT when we are unable to parse/tranform a String
// to a valid JSONServerState value.
const JSONError = require('./JSONError');

// The actual enumeration object
const JSONServerState = {
	/** @member {String} INITIALIZED */
	INITIALIZED: TCPServerState.INITIALIZED,
	/** @member {String} RUNNING */
	RUNNING: TCPServerState.RUNNING,
	/** @member {String} STARTING */
	STARTING: TCPServerState.STARTING,
	/** @member {String} STOPPED */
	STOPPED: TCPServerState.STOPPED,
	/** @member {String} STOPPING */
	STOPPING: TCPServerState.STOPPING,
	parse: function(jsonServerStateAsString) {
		try {
			return TCPServerState.parse(jsonServerStateAsString);
		} catch(exception) {
			throw JSONError.ILLEGAL_ARGUMENT;
		}
	}
}

module.exports = JSONServerState;