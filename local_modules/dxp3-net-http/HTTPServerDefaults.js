/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-net-http
 *
 * NAME
 * HTTPServerDefaults
 */
const packageName = 'dxp3-net-HTTP';
const moduleName = 'HTTPServerDefaults';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
// Check if someone tried to run/execute this file.
const util = require('dxp3-util');
if(util.Assert.isFileToExecute(canonicalName)) {
    util.Help.print();
    return;
}
/**
 * A constant representing all the default properties for a HTTPServer.
 *
 * @module dxp3-net-http/HTTPServerDefaults
 */
const logging = require('dxp3-logging');

const HTTPServerDefaults = {
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
	 * @member {Boolean} DEFAULT_SECURE
	 * By default we turn the HTTP server into a HTTPS server.
	 * One needs to explicitly turn it off when developing. This will make human errors less likely
	 * when deploying to production.
	 */
	DEFAULT_SECURE: true,
	/**
	 * @member {Number} DEFAULT_SECURE_PORT
	 * If the port is omitted or is 0, the operating system will assign an arbitrary unused port.
	 * Typically a HTTPS server listens on the standard https port: 443.
	 */
	 DEFAULT_SECURE_PORT: 443,
	/**
	 * @member {Boolean} DEFAULT_SECURE_FOLDER
	 * By default the certificates are stored in a folder.
	 */
	DEFAULT_SECURE_FOLDER: '/etc/letsencrypt/live/',
	DEFAULT_SECURE_FOLDER_WINDOWS: 'C:\\etc\\letsencrypt\\live\\',
	/**
	 * @member {String} DEFAULT_TIMEOUT
	 * Default timeout is 60 seconds.
	 */
	DEFAULT_TIMEOUT: 60000,
	/**
	 * @member {Number} DEFAULT_UNSECURE_PORT
	 * If port is omitted or is 0, the operating system will assign an arbitrary unused port.
	 * Typically a HTTP server listens on the standard http port: 80.
	 */
	 DEFAULT_UNSECURE_PORT: 80
}

module.exports = HTTPServerDefaults;