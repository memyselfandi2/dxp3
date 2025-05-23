/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-management-ui
 *
 * NAME
 * ApplicationDefaults
 */
const packageName = 'dxp3-management-ui';
const moduleName = 'ApplicationDefaults';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
// Check if someone tried to run/execute this file.
const util = require('dxp3-util');
if(util.Assert.isFileToExecute(canonicalName)) {
    util.Help.print();
    return;
}
/**
 * A constant representing all the default properties for a this application.
 *
 * @module dxp3-management-ui/ApplicationDefaults
 */
const web = require('dxp3-microservice-web');

const WebServerDefaults = web.WebServerDefaults;

const ApplicationDefaults = {
	...WebServerDefaults,
	/**
	 * @member {Boolean} DEFAULT_CACHE
	 * By default we use a cache. We need to explicitly turn this off, as this will introduce
	 * performance issues in production.
	 */
	DEFAULT_CACHE: true,
	/**
	 * @member {Number} DEFAULT_SECURE_PORT
	 * If the port is omitted or is 0, the operating system will assign an arbitrary unused port.
	 * Typically a HTTPS server listens on the standard https port: 443.
	 * However, as there will highly likely be a WebGateway in front of us,
	 * we should probably settle for something more esoteric like port 9443.
	 */
	 DEFAULT_SECURE_PORT: 1443,
	/**
	 * @member {Number} DEFAULT_UNSECURE_PORT
	 * Use this to specify which port the application listens on.
	 * As this is a web server we may want to use port 80 by default.
	 * However, as there will highly likely be a WebGateway in front of us,
	 * we should probably settle for something more esoteric like port 8090.
	 */
	DEFAULT_UNSECURE_PORT: 8091
}

module.exports = ApplicationDefaults;