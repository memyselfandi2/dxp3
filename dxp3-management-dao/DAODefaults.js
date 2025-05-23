/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-management-dao
 *
 * NAME
 * DAODefaults
 */
const packageName = 'dxp3-management-dao';
const moduleName = 'DAODefaults';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
// Check if someone tried to run/execute this file.
const util = require('dxp3-util');
if(util.Assert.isFileToExecute(canonicalName)) {
	util.Help.print();
	return;
}
/**
 * A constant representing all the default properties for a DAO.
 *
 * @module dxp3-management-api/DAODefaults
 */
const logging = require('dxp3-logging');

const DAODefaults = {
	/**
	 * @member {String} DEFAULT_IMPLEMENTATION
	 * @static
	 * Use this as the default implementation. Likely one of filesystem, mock or mongodb.
	 */
	DEFAULT_IMPLEMENTATION: 'filesystem',
	/**
	 * @member {String} DEFAULT_LOG_LEVEL
	 * @static
	 * Default log level is dxp3-logging.Level.WARN.
	 * @see module:dxp3-logging/Level
	 */
	DEFAULT_LOG_LEVEL: logging.Level.WARN,
	/**
	 * @member {Number} DEFAULT_TIMEOUT
	 * @static
	 * The default socket connection timeout in milliseconds.
	 * Currently set to 60000 milliseconds (1 minute).
	 */
	DEFAULT_TIMEOUT: 60000
}

module.exports = DAODefaults;