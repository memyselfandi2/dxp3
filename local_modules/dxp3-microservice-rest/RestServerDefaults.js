/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-microservice
 *
 * NAME
 * RestServerDefaults
 */
const packageName = 'dxp3-microservice-rest';
const moduleName = 'RestServerDefaults';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
// Check if someone tried to run/execute this file.
const util = require('dxp3-util');
if(util.Assert.isFileToExecute(canonicalName)) {
	util.Help.print();
	return;
}
/**
 * A constant representing all the default properties for a RestServer.
 *
 * @module dxp3-microservice/RestServerDefaults
 */

const RestServerDefaults = {
	/**
	 * @member {String} DEFAULT_ADDRESS
	 * In the context of servers 0.0.0.0 can mean "all IPv4 addresses on the local machine".
	 * If a host has two IP addresses, 192.168.1.1 and 10.1.2.1, and a server running on
	 * the host is configured to listen on 0.0.0.0, it will be reachable at both of those IP addresses.
	 * @static
	 */
	DEFAULT_ADDRESS: '0.0.0.0',
	/**
	 * @member {Number} DEFAULT_PORT
	 * If port is omitted or is 0, the operating system will assign an arbitrary unused port.
	 * Typically a web server listens on the standard http port: 80.
	 */
	 DEFAULT_PORT: 80,
	/**
	 * @member {Number} DEFAULT_TIMEOUT
	 * The default socket connection timeout in milliseconds.
	 * Currently set to 60000 milliseconds (1 minute).
	 * @static
	 */
	DEFAULT_TIMEOUT: 60000
}

module.exports = RestServerDefaults;