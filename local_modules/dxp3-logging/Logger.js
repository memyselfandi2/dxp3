/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-logging
 *
 * NAME
 * Logger
 */
const packageName = 'dxp3-logging';
const moduleName = 'Logger';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * This module exports a Logger class.
 *
 * @module dxp3-logging/Logger
 */
const Level = require('./Level');
// We use the util.Help class to print out help information and
// we use the util.Assert utility to validate method inputs.
const util = require('dxp3-util');

const DEFAULT_LEVEL = Level.WARN;
/**
 * <p>An instance of a logger will perform the actual logging. Each logger has a name and a log level.</p>
 *
 * @example
 * // Get a reference to our logging module.
 * const logging = require('dxp3-logging');
 * // There are effectively 5 different log levels:
 * // Level.DEBUG, Level.INFO, Level.WARN, Level.ERROR, Level.FATAL
 * // There are also several convenient aliases in case you'd like to use different terms:
 * // Level.TRACE (same as DEBUG), Level.INFORMATION (same as INFO),
 * // Level.WARNING (same as WARN), Level.ERR (same as ERROR) and Level.EXCEPTION (same as ERROR).
 * // If you do not want any logging simply set the level to Level.OFF.
 * const Level = logging.Level;
 * // You can either use the Level class, a String or a integer to set the level.
 * logging.setLevel(Level.WARN);
 * // Loggers are identified by name.
 * const logger = logging.getLogger('MAIN LOGGER');
 * logger.debug('this is a debug test.');
 * logger.info('this is an info test.');
 * logger.warn('this is a warn test.');
 * logger.error('this is an error test.');
 * logger.fatal('this is a fatal test.');
 */
class Logger {
	/*********************************************
	 * CONSTRUCTOR
	 ********************************************/
	
	/**
	 * @param {String} _name
	 * @param {Level} _level
	 */
	constructor(_name, _level) {
		this.name = _name;
		this.setLevel(_level);
	}

	/*********************************************
	 * PUBLIC METHODS
	 ********************************************/
	
	/**
	 * @param {String} _message
	 */
	debug(_message) {
		this.log(Level.DEBUG, _message);
	}

	/**
	 * @param {String} _message
	 */
	err(_message) {
		this.log(Level.ERR, _message);
	}

	/**
	 * @param {String} _message
	 */
	error(_message) {
		this.log(Level.ERROR, _message);
	}

	/**
	 * Exception is an alias for error.
	 * @param {String} _message
	 */
	exception(_message) {
		this.log(Level.EXCEPTION, _message);
	}

	/**
	 * @param {String} _message
	 */
	fatal(_message) {
		this.log(Level.FATAL, _message);
	}

	/**
	 * @param {String} _message
	 */
	info(_message) {
		this.log(Level.INFO, _message);
	}

	/**
	 * Information is an alias for info.
	 * @param {String} _message
	 */
	information(_message) {
		this.log(Level.INFORMATION, _message);
	}

	/**
	 * @param {Level} level
	 * @param {String} _message
	 */
	log(_level, ...args) {
		if(this.level <= _level) {
			let dateString = new Date().toISOString();
			switch(_level) {
				case 0:
					console.log('[%s] %s %s', dateString, this.name, 'TRACE', '\x1b[35m', ...args, '\x1b[0m');
					break;
				case 1:
					console.log('[%s] %s %s', dateString, this.name, 'DEBUG', '\x1b[32m', ...args, '\x1b[0m');
					break;
				case 2:
					console.log('[%s] %s %s', dateString, this.name, 'INFO  ', ...args);
					break;
				case 3:
					console.log('[%s] %s %s', dateString, this.name, 'WARN ', '\x1b[33m', ...args, '\x1b[0m');
					break;
				case 4:
					console.log('[%s] %s %s', dateString, this.name, 'ERROR', '\x1b[31m', ...args, '\x1b[0m');
					break;
				case 5:
					console.log('[%s] %s %s', dateString, this.name, 'FATAL', '\x1b[41m', ...args, '\x1b[0m');
					break;
				default:
					break;
			}
		}
	}

	/**
	 * @param {String} _message
	 */
	trace(_message) {
		this.log(Level.TRACE, _message);
	}

	/**
	 * @param {String} _message
	 */
	warn(_message) {
		this.log(Level.WARN, _message);
	}

	/**
	 * Warning is an alias for warn.
	 * @param {String} _message
	 */
	warning(_message) {
		this.log(Level.WARNING, _message);
	}
	
	/*********************************************
	 * GETTERS
	 ********************************************/
	
	getLevel() {
		return this.level;
	}

	/*********************************************
	 * SETTERS
	 ********************************************/

	/**
	 * @param {Level} _level
	 */
	setLevel(_level) {
		// Defensive programming...check input...
		if(util.Assert.isUndefinedOrNull(_level)) {
			this.level = DEFAULT_LEVEL;
			return;
		}
		this.level = Level.parse(_level);
	}
}
// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
    util.Help.print(Logger);
    return;
}
module.exports = Logger;