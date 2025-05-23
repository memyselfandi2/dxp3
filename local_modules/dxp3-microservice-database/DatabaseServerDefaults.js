/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-microservice-database
 *
 * NAME
 * DatabaseServerDefaults
 */
const packageName = 'dxp3-microservice-database';
const moduleName = 'DatabaseServerDefaults';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * A constant representing all the default properties for a DatabaseServer.
 *
 * @module dxp3-microservice-database/DatabaseServerDefaults
 */
const util = require('dxp3-util');

const DatabaseServerDefaults = {
	/**
	 * @member {String} DEFAULT_ADDRESS
	 * In the context of servers 0.0.0.0 can mean "all IPv4 addresses on the local machine".
	 * If a host has two IP addresses, 192.168.1.1 and 10.1.2.1, and a server running on
	 * the host is configured to listen on 0.0.0.0, it will be reachable at both of those IP addresses.
	 * @static
	 */
	DEFAULT_ADDRESS: '0.0.0.0',
	/**
	 * @member {String} DEFAULT_DATABASE_NAME
	 * Typically the database name is provided at startup, but to get things up and running
	 * quickly for development and testing we provide a default database name.
	 */
	 DEFAULT_DATABASE_NAME: 'DatabaseOne',	
	/**
	 * @member {Number} DEFAULT_PORT
	 * If port is omitted or is 0, the operating system will assign an arbitrary unused port.
	 */
	 DEFAULT_PORT: 9000,
	/**
	 * @member {Boolean} DEFAULT_SOURCE_FOLDER
	 * The default folder databases are stored.
	 */
	DEFAULT_SOURCE_FOLDER: '/var/lib/',
	DEFAULT_SOURCE_FOLDER_WINDOWS: 'C:\\temp\\',
	/**
	 * @member {Number} DEFAULT_TIMEOUT
	 * The default socket connection timeout in milliseconds.
	 * Currently set to 60000 milliseconds (1 minute).
	 * @static
	 */
	DEFAULT_TIMEOUT: 60000
}
// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
	util.Help.print();
	return;
}
module.exports = DatabaseServerDefaults;