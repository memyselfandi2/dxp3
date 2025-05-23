/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-logging
 *
 * NAME
 * Level
 */
const packageName = 'dxp3-logging';
const moduleName = 'Level';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * A Level is an enumeration of all the different log levels.
 *
 * @example
 * // Get a reference to our logging module.
 * const logging = require('dxp3-logging');
 * // There are effectively 6 different log levels:
 * // Level.TRACE, Level.DEBUG, Level.INFO, Level.WARN, Level.ERROR, Level.FATAL
 * // There are also several convenient aliases in case you'd like to use different terms:
 * // Level.INFORMATION (same as INFO), Level.WARNING (same as WARN),
 * // Level.ERR (same as ERROR) and Level.EXCEPTION (same as ERROR).
 * // If you do not want any logging simply set the level to Level.OFF.
 * const Level = logging.Level;
 * // You can either use the Level class, a String or an integer to set the level.
 * logging.setLevel(Level.WARN);
 * // Loggers are identified by name.
 * const logger = logging.getLogger('MAIN LOGGER');
 * logger.trace('this is a trace test.');
 * logger.debug('this is a debug test.');
 * logger.info('this is an info test.');
 * logger.warn('this is a warn test.');
 * logger.error('this is an error test.');
 * logger.fatal('this is a fatal test.')
 * // You can set the level of every logger by using the setLevel method
 * logging.setLevel(Level.INFO);
 * // You can also use wildcards to set the level of a subset of loggers.
 * // This is for example how to turn off low level udp logging:
 * logging.setLevel('*udp*', Level.OFF);
 *
 * @module dxp3-logging/Level
 */
// We use the util.Help class to print out help information and
// we use the util.Assert utility to validate method inputs.
const util = require('dxp3-util');

const Level = {
	/** @member {Number} TRACE */
	TRACE: 0,
	/** @member {Number} DEBUG */
	DEBUG: 1,
	/** @member {Number} INFO */
	INFO: 2,
	/** @member {Number} INFORMATION - Information is an alias for info. */
	INFORMATION: 2,
	/** @member {Number} WARN */
	WARN: 3,
	/** @member {Number} WARNING - Warning is an alias for warn. */
	WARNING: 3,
	/** @member {Number} ERR - Warning is an alias for error. */
	ERR: 4,
	/** @member {Number} ERROR */
	ERROR: 4,
	/** @member {Number} EXCEPTION - Exception is an alias for error. */
	EXCEPTION: 4,
	/** @member {Number} FATAL */
	FATAL: 5,
	/** @member {Number} OFF */
	OFF: 6,
	/** @member {Number} DISABLED - Disabled is an alias for off. */
	DISABLED: 6,
	/** @member {Number} FALSE - False is an alias for off. */
	FALSE: 6,
	/** @member {Number} NO - No is an alias for off. */
	NO: 6,
	/** @member {Number} NONE - None is an alias for off. */
	NONE: 6,
	/**
	 * @function
	 *
	 * @param {Number|String} _level
	 * The number or string to transform into one of the values of this Level enumeration.
	 *
	 * @returns {Level}
	 */
	parse: function(_level) {
		if(util.Assert.isUndefinedOrNull(_level)) {
			return Level.OFF;
		}
		if(typeof _level === 'string') {
			_level = _level.trim().toUpperCase();
			if(_level.length <= 0) {
				return Level.OFF;
			}
			switch(_level) {
				case 'TRACE':
				case '0':
					return Level.TRACE;
					return Level.TRACE;
				case 'DEBUG':
				case '1':
					return Level.DEBUG;
					return Level.DEBUG;
				case 'INFO':
				case '2':
					return Level.INFO;
				case 'INFORMATION':
					return Level.INFORMATION;
				case 'WARN':
				case '3':
					return Level.WARN;
				case 'WARNING':
					return Level.WARNING;
				case 'ERR':
					return Level.ERR;
				case 'ERROR':
				case '4':
					return Level.ERROR;
				case 'EXCEPTION':
					return Level.EXCEPTION;
				case 'FATAL':
				case '5':
					return Level.FATAL;
				case 'OFF':
				case '6':
					return Level.OFF;
				case 'DISABLED':
					return Level.DISABLED;
				case 'FALSE':
					return Level.FALSE;
				case 'NO':
					return Level.NO;
				case 'NONE':
					return Level.NONE;
				default:
					return Level.OFF;
			}
		}
		if(typeof _level === 'number') {
			if(_level > Level.FATAL) {
				return Level.OFF;
			}
			if(_level < Level.TRACE) {
				return Level.TRACE;
			}
			return _level;
		}
		return Level.OFF;
	},
	/**
	 * @function
	 *
	 * @param {Number|String} _level
	 * The number or string to transform into a string representation of one of the values of this Level enumeration.
	 *
	 * @returns {String}
	 */
	toString: function(_level) {
		if(util.Assert.isUndefinedOrNull(_level)) {
			return 'OFF';
		}
		if(typeof _level === 'string') {
			_level = _level.trim().toUpperCase();
			if(_level.length <= 0) {
				return 'OFF';
			}
			switch(_level) {
				case '0':
					_level = 'TRACE';
					break;
				case '1':
					_level = 'DEBUG';
					break;
				case '2':
					_level = 'INFO';
					break;
				case '3':
					_level = 'WARN';
					break;
				case '4':
					_level = 'ERROR';
					break;
				case '5':
					_level = 'FATAL';
					break;
				case '6':
					_level = 'OFF';
					break;
				case 'DEBUG':
				case 'DISABLED':
				case 'ERR':
				case 'ERROR':
				case 'EXCEPTION':
				case 'FALSE':
				case 'FATAL':
				case 'INFO':
				case 'INFORMATION':
				case 'NO':
				case 'NONE':
				case 'OFF':
				case 'TRACE':
				case 'WARN':
				case 'WARNING':
					break;
				default:
					_level = 'OFF';
					break;
			}
			return _level;
		}
		if(typeof _level === 'number') {
			switch(_level) {
				case Level.TRACE:
					return 'TRACE';
				case Level.DEBUG:
					return 'DEBUG';
				case Level.INFO:
					return 'INFO';
				case Level.WARN:
					return 'WARN';
				case Level.ERROR:
					return 'ERROR';
				case Level.FATAL:
					return 'FATAL';
				case Level.OFF:
					return 'OFF';
				default:
					if(_level < 0) {
						return 'TRACE';
					} else {
						return 'OFF';
					}
			}
		}
		return 'OFF';
	}
}
// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
    util.Help.print();
    return;
}
module.exports = Level;