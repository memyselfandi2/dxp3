/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-management-security
 *
 * NAME
 * ApplicationDefaults
 */
const packageName = 'dxp3-management-security';
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
 * A constant representing all the default properties for our security implementation.
 *
 * @module dxp3-management-security/ApplicationDefaults
 */
const logging = require('dxp3-logging');

const ApplicationDefaults = {
	/**
	 * Use this as the default implementation. Likely one of filesystem, mock or mongodb.
	 */
	DEFAULT_IMPLEMENTATION: 'filesystem',
	/**
	 * @member {String} DEFAULT_LOG_LEVEL
	 * Default log level is dxp3-logging.Level.WARN.
	 * @see module:dxp3-logging/Level
	 */
	DEFAULT_LOG_LEVEL: logging.Level.WARN,
}

module.exports = ApplicationDefaults;