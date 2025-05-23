/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-microservice-web
 *
 * NAME
 * WebServerDefaults
 */
const packageName = 'dxp3-microservice-web';
const moduleName = 'WebServerDefaults';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
// Check if someone tried to run/execute this file.
const util = require('dxp3-util');
if(util.Assert.isFileToExecute(canonicalName)) {
	util.Help.print();
	return;
}
/**
 * A constant representing all the default properties for a WebServer.
 *
 * @module dxp3-microservice-web/WebServerDefaults
 */
const logging = require('dxp3-logging');
const net = require('dxp3-net');

const HTTPServerDefaults = net.http.HTTPServerDefaults;

const WebServerDefaults = {
	/**
	 * @member {String} DEFAULT_ADDRESS
	 * In the context of servers 0.0.0.0 can mean "all IPv4 addresses on the local machine".
	 * If a host has two IP addresses, 192.168.1.1 and 10.1.2.1, and a server running on
	 * the host is configured to listen on 0.0.0.0, it will be reachable at both of those IP addresses.
	 */
	DEFAULT_ADDRESS: HTTPServerDefaults.DEFAULT_ADDRESS,
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
	DEFAULT_SECURE: HTTPServerDefaults.DEFAULT_SECURE,
	/**
	 * @member {Number} DEFAULT_SECURE_PORT
	 * If the port is omitted or is 0, the operating system will assign an arbitrary unused port.
	 * Typically a HTTPS server listens on the standard https port: 443.
	 */
	 DEFAULT_SECURE_PORT: HTTPServerDefaults.DEFAULT_SECURE_PORT,
	/**
	 * @member {Boolean} DEFAULT_SECURE_FOLDER
	 * By default the certificates are stored in a folder.
	 */
	DEFAULT_SECURE_FOLDER: HTTPServerDefaults.DEFAULT_SECURE_FOLDER,
	/**
	 * @member {String} DEFAULT_TIMEOUT
	 * Default timeout is 60 seconds.
	 */
	DEFAULT_TIMEOUT: HTTPServerDefaults.DEFAULT_TIMEOUT,
	/**
	 * @member {Number} DEFAULT_UNSECURE_PORT
	 * If port is omitted or is 0, the operating system will assign an arbitrary unused port.
	 * Typically a HTTP server listens on the standard http port: 80.
	 */
	 DEFAULT_UNSECURE_PORT: HTTPServerDefaults.DEFAULT_UNSECURE_PORT
}

module.exports = WebServerDefaults;