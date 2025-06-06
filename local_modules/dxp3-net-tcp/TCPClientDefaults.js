/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-net-tcp
 *
 * NAME
 * TCPClientDefaults
 */
const packageName = 'dxp3-net-tcp';
const moduleName = 'TCPClientDefaults';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
// Check if someone tried to run/execute this file.
const util = require('dxp3-util');
if(util.Assert.isFileToExecute(canonicalName)) {
    util.Help.print();
    return;
}
/**
 * A constant representing all the default properties for an TCPClient.
 *
 * @module dxp3-net-tcp/TCPClientDefaults
 */
const logging = require('dxp3-logging');

const TCPClientDefaults = {
	/**
	 * @member {String} DEFAULT_LOG_LEVEL
	 * Default log level is dxp3-logging.Level.WARN.
	 * @see module:dxp3-logging/Level
	 */
	DEFAULT_LOG_LEVEL: logging.Level.WARN,
	/**
	 * @member {Number} DEFAULT_MAX_NUMBER_OF_SOCKETS
	 * The maximum number of concurrent connections to a given server.
	 */
	DEFAULT_MAXIMUM_NUMBER_OF_SOCKETS: -1,
	/**
	 * @member {Number} DEFAULT_MINIMUM_NUMBER_OF_SOCKETS
	 * The minimum number of connections to a given server.
	 */
	DEFAULT_MINIMUM_NUMBER_OF_SOCKETS: 0,
	/**
	 * @member {Number} DEFAULT_TIMEOUT
	 */
	DEFAULT_TIMEOUT: 60000
}

module.exports = TCPClientDefaults;