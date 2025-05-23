/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-db
 *
 * NAME
 * DatabaseAdminDefaults
 */
const packageName = 'dxp3-db';
const moduleName = 'DatabaseAdminDefaults';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * A constant representing all the default properties for our DatabaseAdmin implementation.
 *
 * @module dxp3-db/DatabaseAdminDefaults
 */
// It's important to at least log warnings and errors.
const logging = require('dxp3-logging');
// We use the util.Help class to print out help information.
const util = require('dxp3-util');

const DatabaseAdminDefaults = {
	/**
	 * @member {String} DEFAULT_LOG_LEVEL
	 * Default log level is dxp3-logging.Level.WARN.
	 * @see module:dxp3-logging/Level
	 */
	DEFAULT_LOG_LEVEL: logging.Level.WARN,
    /**
     * @member {String} DEFAULT_SOURCE_FOLDER
     * By default there is no databases folder.
     */
    DEFAULT_SOURCE_FOLDER: null
}
// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
    util.Help.print(DatabaseAdminDefaults);
    return;
}
module.exports = DatabaseAdminDefaults;