/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-net-json
 *
 * NAME
 * JSONServerDefaults
 */
const packageName = 'dxp3-net-json';
const moduleName = 'JSONServerDefaults';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
// Check if someone tried to run/execute this file.
const util = require('dxp3-util');
if(util.Assert.isFileToExecute(canonicalName)) {
	util.Help.print();
	return;
}
/**
 * A constant representing all the default properties for a JSONServer.
 *
 * @module dxp3-net-json/JSONServerDefaults
 */
const logging = require('dxp3-logging');

const JSONServerDefaults = {
	/**
	 * @member {String} DEFAULT_ADDRESS
	 * In the context of servers 0.0.0.0 can mean "all IPv4 addresses on the local machine".
	 * If a host has two IP addresses, 192.168.1.1 and 10.1.2.1, and a server running on
	 * the host is configured to listen on 0.0.0.0, it will be reachable at both of those IP addresses.
	 */
	DEFAULT_ADDRESS: '0.0.0.0',
	/**
	 * @member {String} DEFAULT_LOG_LEVEL
	 * Default log level is dxp3-logging.Level.WARN.
	 * @see module:dxp3-logging/Level
	 */
	DEFAULT_LOG_LEVEL: logging.Level.WARN,
	/**
	 * @member {Number} DEFAULT_PORT
	 * If port is omitted or is 0, the operating system will assign an arbitrary unused port.
	 */
	DEFAULT_PORT: 0,
	/**
	 * @member {Number} DEFAULT_TIMEOUT
	 */
	DEFAULT_TIMEOUT: 60000
}

module.exports = JSONServerDefaults;