/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-lang-csv
 *
 * NAME
 * CSVReaderDefaults
 */
const packageName = 'dxp3-lang-csv';
const moduleName = 'CSVReaderDefaults';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * A constant representing all the default properties for a HTMLReader.
 *
 * @module dxp3-lang-csv/CSVReaderDefaults
 */
const logging = require('dxp3-logging');
const util = require('dxp3-util');

const CSVReaderDefaults = {
	/**
	 * @member {String} DEFAULT_DELIMITER
	 * Default delimiter is a comma
	 */
	DEFAULT_DELIMITER: ',',
	/**
	 * @member {String} DEFAULT_LOG_LEVEL
	 * Default log level is dxp3-logging.Level.WARN.
	 * @see module:dxp3-logging/Level
	 */
	DEFAULT_LOG_LEVEL: logging.Level.WARN,
	/**
	 * @member {String} DEFAULT_SKIP_EMPTY_ROWS
	 * By default we do NOT skip empty rows.
	 */
	DEFAULT_SKIP_EMPTY_ROWS: false,
	/**
	 * @member {String} DEFAULT_TRIM_COLUMNS
	 * By default we do NOT trim columns.
	 */
	DEFAULT_TRIM_COLUMNS: false,
}
// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
	util.Help.print(CSVReaderDefaults);
	return;
}
module.exports = CSVReaderDefaults;