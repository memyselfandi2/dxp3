/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-lang-css
 *
 * NAME
 * SelectorTokenizerDefaults
 */
const packageName = 'dxp3-lang-css';
const moduleName = 'SelectorTokenizerDefaults';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
// Check if someone tried to run/execute this file.
const util = require('dxp3-util');
if(util.Assert.isFileToExecute(canonicalName)) {
    util.Help.print();
    return;
}
/**
 * A constant representing all the default properties for a SelectorTokenizer.
 *
 * @module dxp3-lang-css/SelectorTokenizerDefaults
 */
const logging = require('dxp3-logging');
const Level = logging.Level;

const SelectorTokenizerDefaults = {
	/**
	 * @member {String} DEFAULT_LOG_LEVEL
	 * Default log level is dxp3-logging.Level.WARN.
	 * @see module:dxp3-logging/Level
	 */
	DEFAULT_LOG_LEVEL: Level.WARN
}

module.exports = SelectorTokenizerDefaults;