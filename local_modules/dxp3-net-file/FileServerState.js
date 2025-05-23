/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-net-file
 *
 * NAME
 * FileServerState
 */
const packageName = 'dxp3-net-file';
const moduleName = 'FileServerState';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
// Check if someone tried to run/execute this file.
const util = require('dxp3-util');
if(util.Assert.isFileToExecute(canonicalName)) {
  util.Help.print();
  return;
}
/**
 * A collection/enumeration of the different states a FileServer can be in.
 *
 * @module dxp3-net-file/FileServerState
 */
const tcp = require('dxp3-net-tcp');
const TCPServerState = tcp.TCPServerState;

// We throw a FileError.ILLEGAL_ARGUMENT when we are unable to parse/tranform a String
// to a valid FileServerState value.
const FileError = require('./FileError');

// The actual enumeration object
const FileServerState = {
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
	parse: function(fileServerStateAsString) {
		try {
			return TCPServerState.parse(fileServerStateAsString);
		} catch(exception) {
			throw FileError.ILLEGAL_ARGUMENT;
		}
	}
}

module.exports = FileServerState;