/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-db
 *
 * NAME
 * DatabaseDefaults
 */
const packageName = 'dxp3-db';
const moduleName = 'DatabaseDefaults';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * A constant representing all the default properties for a Database.
 *
 * @module dxp3-db/DatabaseDefaults
 */
const logging = require('dxp3-logging');
const util = require('dxp3-util');

const DatabaseDefaults = {
	/**
	 * @member {String} DEFAULT_LOG_LEVEL
	 * Default log level is dxp3-logging.Level.WARN.
	 * @see module:dxp3-logging/Level
	 */
	DEFAULT_LOG_LEVEL: logging.Level.WARN,
}
// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
   util.Help.print(DatabaseDefaults);
   return;
}
module.exports = DatabaseDefaults;