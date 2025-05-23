/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-lang-csv
 *
 * NAME
 * CSVParserDefaults
 */
const packageName = 'dxp3-lang-csv';
const moduleName = 'CSVParserDefaults';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * A constant representing all the default properties for a CSVParser.
 *
 * @module dxp3-lang-csv/CSVParserDefaults
 */
const logging = require('dxp3-logging');
const util = require('dxp3-util');

const CSVParserDefaults = {
	/**
	 * @member {String} DEFAULT_COMMENTS_PREFIX
	 * Default comment prefix is a hash.
	 * However we typically do not expect comments in 
	 * a csv file, because they are not part of
	 * the specification. See DEFAULT_HAS_COMMENTS.
	 */
	DEFAULT_COMMENTS_PREFIX: '#',
	/**
	 * @member {String} DEFAULT_DELIMITER
	 * Default delimiter is a comma.
	 */
	DEFAULT_DELIMITER: ',',
	/**
	 * @member {String} DEFAULT_ESCAPE_CHARACTER
	 * Default escape character is a double quote.
	 */
	DEFAULT_ESCAPE_CHARACTER: '"',
	/**
	 * @member {String} DEFAULT_HAS_COMMENTS
	 * By default comments are turned off.
	 * Please note that comments are not part of the specification.
	 */
	DEFAULT_HAS_COMMENTS: false,
	/**
	 * @member {Boolean} DEFAULT_HAS_HEADERS
	 * By default we assume a CSV file has headers
	 * on the first row.
	 */
	DEFAULT_HAS_HEADERS: true,
	/**
	 * @member {Number} DEFAULT_HIGH_WATER_MARK
	 * Default high water mark for streaming is set to 16.
	 */
	DEFAULT_HIGH_WATER_MARK: 16,
	/**
	 * @member {String} DEFAULT_LOG_LEVEL
	 * Default log level is dxp3-logging.Level.WARN.
	 * @see module:dxp3-logging/Level
	 */
	DEFAULT_LOG_LEVEL: logging.Level.WARN,
	/**
	 * @member {Boolean} DEFAULT_SKIP_EMPTY_ROWS
	 * By default we do NOT skip empty rows.
	 */
	DEFAULT_SKIP_EMPTY_ROWS: false,
	/**
	 * @member {Boolean} DEFAULT_START_AT_LINE
	 * By default we start at the beginning.
	 */
	DEFAULT_START_AT_LINE: 0,
	/**
	 * @member {Boolean} DEFAULT_TRIM_WHITESPACE
	 * By default we do NOT trim whitespace.
	 */
	DEFAULT_TRIM_WHITESPACE: false,
}
// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
	util.Help.print(CSVParserDefaults);
	return;
}
module.exports = CSVParserDefaults;