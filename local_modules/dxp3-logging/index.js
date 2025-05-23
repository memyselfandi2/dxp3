/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-logging
 *
 * NAME
 * index
 */
const packageName = 'dxp3-logging';
const moduleName = 'index';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * <p>The dxp3-logging module allows objects to log trace, debug, info, warning, error and
 * fatal messages. It is to be used as a library as it does not contain any executable class.
 * Make sure this local module is defined as a dependency in your package.json.
 * Typically the dependency is defined by a file reference using a relative path.
 * Obviously that relative path may be different for different modules.<br/>
 * Here is an example of such a dependency in a package.json:<br/>
 * "dependencies": {<br/>
 *     "dxp3-logging": "file:../../../local_modules/dxp3-logging"<br/>
 * }<br/>
 * </p>
 *
 * This module exports a Logging class.
 *
 * @example
 * // Get a reference to our logging module.
 * const logging = require('dxp3-logging');
 * // There are effectively 6 different log levels:
 * // Level.TRACE, Level.DEBUG, Level.INFO, Level.WARN, Level.ERROR, Level.FATAL
 * // There are also several convenient aliases in case you'd like to use different terms:
 * // Level.INFORMATION (same as INFO), Level.WARNING (same as WARN) and
 * // Level.EXCEPTION (same as ERROR).
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
 * logger.fatal('this is a fatal test.');
 * // You can set the level of every logger by using the setLevel method
 * logging.setLevel(Level.INFO);
 * // You can also use wildcards to set the level of a subset of loggers.
 * // This is for example how to turn off low level udp logging:
 * logging.setLevel('*udp*', Level.OFF);
 *
 * @module dxp3-logging
 */
const Level = require('./Level');
const Logger = require('./Logger');
// We use the util.Help class to print out help information and
// we use the util.Assert utility to validate method inputs.
const util = require('dxp3-util');

const DEFAULT_LEVEL = Level.WARN;
/**
 * @property {module:dxp3-logging/Level} Level 	- A reference to the Level class.
 *
 * @example
 * const logging = require('dxp3-logging');
 * let loggerAPI = logging.getLogger('logger API');
 * let loggerUI = logging.getLogger('logger UI')
 * // Set the level for the loggerAPI
 * loggerAPI.setLevel(logging.Level.INFO);
 * // Alternatively you can use the logging class to accomplish the same task:
 * logging.setLevel('logger API', logging.Level.INFO);
 * // Set the level for the loggerUI
 * loggerUI.setLevel(logging.Level.WARN);
 * // Alternatively we could have set all loggers to a certain level. Like so:
 * // logging.setLevel(logging.Level.DEBUG);
 * // Or we can use wildcards. Like so:
 * // logging.setLevel('*API,*UI', [Level.INFO, Level.WARN]);
 * // Or alternatively:
 * // logging.setLevel('*API,*UI', 'info,warn');
 * loggerAPI.info('Started');
 * loggerUI.warn('Unable to read configuration. Using defaults.');
 */
class Logging {
    /*********************************************
     * CONSTRUCTOR
     ********************************************/

	/**
	 * A Logging constructor.
	 * Not really necessary as all our methods are static.
	 */
	 constructor() {
	 }

    /*********************************************
     * PUBLIC METHODS
     ********************************************/

	/**
	 * @param {String} [name]	- The name of the logger to retrieve. May be null or undefined.
	 * @returns {Logger}
	 */
	static getLogger(_name) {
		// Defensive programming...check input...
		if(util.Assert.isUndefinedOrNull(_name)) {
			_name = '';
		}
		_name = _name.trim();
		let logger = Logging.loggers.get(_name);
		if(logger === undefined || logger === null) {
			// If we arrive here, it means this is the first time
			// this method is called for a logger with this name.
			// Lets create a new Logger and for now assume
			// it has the default log level.
			let level = Logging.defaultLevel;
			// Check if a log level has been set for a regular
			// expression matching the supplied name.
			for(let i=0;i < Logging.loggerLevels.length;i++) {
				let loggerLevel = Logging.loggerLevels[i];
				if(_name.match(loggerLevel.regexp)) {
					// If we arrive here, it means a specific
					// log level was set overriding the default one.
					level = loggerLevel.level;
				}
			}
			logger = new Logger(_name, level);
			Logging.loggers.set(_name, logger);
		}
		return logger;
	}


	/**
	 * An alias of setLevel(_args)
	 */
	static setLogLevels(_args) {
		if(arguments.length <= 0) {
			Logging.setLevel();
		} else {
			Logging.setLevel(...arguments);
		}
	}

	/**
	 * An alias of setLevel(_args)
	 */
	static setLogLevel(_args) {
		if(arguments.length <= 0) {
			Logging.setLevel();
		} else {
			Logging.setLevel(...arguments);
		}
	}

	/**
	 * An alias of setLevel(_args)
	 */
	static setLevels(_args) {
		if(arguments.length <= 0) {
			Logging.setLevel();
		} else {
			Logging.setLevel(...arguments);
		}
	}

	/**
	 * Set the log level for all or a subset of loggers.
	 * If no arguments are supplied, the current default log level
	 * is applied to all known loggers.
	 */
	static setLevel(_args) {
		let regexps = [];
		let levels = [];
		if(arguments.length <= 0) {
			// If there are no arguments, we reset every known logger to the
			// current defined default level.
			// First we remove any previous defined levels.
			Logging.loggerLevels = [];
			let level = DEFAULT_LEVEL;
			levels.push(level);
			// The regular expression needs to match every logger.
			regexps.push(new RegExp('.*'));
			Logging.defaultLevel = level;
		} else if(arguments.length === 1) {
			// If there is one argument and the argument is an array,
			// we assume these are regular expression and level combination objects.
			if(Array.isArray(arguments[0])) {
				for(let i=0;i < arguments[0].length;i++) {
					let loggerLevel = arguments[0][i];
					regexps.push(loggerLevel.regexp);
					levels.push(loggerLevel.level);
				}
			} else {
				// Set the level for every logger.
				// Remove any previous levels.
				Logging.loggerLevels = [];
				let level = Level.parse(arguments[0]);
				levels.push(level);
				// The regular expression needs to match every logger.
				regexps.push(new RegExp('.*'));
				Logging.defaultLevel = level;
			}
		} else {
			regexps = arguments[0];
			if(!Array.isArray(regexps)) {
				if(typeof regexps === 'string') {
					regexps = regexps.split(',');
				} else {
					regexps = [regexps];
				}
			}
			levels = arguments[1];
			if(!Array.isArray(levels)) {
				if(typeof levels === 'string') {
					levels = levels.split(',');	
				} else {
					levels = [levels];
				}
			}
		}
		// The user wants to set the level of specific loggers (highly likely using a wildcard).
		// In this case we add this rule to any previous defined rules.
		for(let i=0;i < levels.length;i++) {
			let level = levels[i];
			levels[i] = Level.parse(level);
		}
		for(let i=0;i < regexps.length;i++) {
			let regexp = regexps[i];
			if(typeof regexp === 'string') {
				regexp = regexp.replace(/\*/g, '.*');
				regexp = '^' + regexp + '$';
				regexp = new RegExp(regexp);
				regexps[i] = regexp;
			}
			let loggerLevel = {
				regexp: regexp,
				level: levels[i]
			}
			Logging.loggerLevels.push(loggerLevel);
		}
		// Lets update any known loggers.
		for(let [name, logger] of Logging.loggers) {
			let foundMatch = false;
			for(let i=0;i < Logging.loggerLevels.length;i++) {
				let loggerLevel = Logging.loggerLevels[i];
				if(name.match(loggerLevel.regexp)) {
					logger.setLevel(loggerLevel.level);
					foundMatch = true;
				}
			}
			if(!foundMatch) {
				logger.setLevel(Logging.defaultLevel);
			}
		}
	}

	/**
	 * @returns {Level}
	 */
	static getLevel(_name) {
		let level = Logging.defaultLevel;
		if(util.Assert.isUndefinedOrNull(_name)) {
			return level;
		}
		for(let i=0;i < Logging.loggerLevels.length;i++) {
			let loggerLevel = Logging.loggerLevels[i];
			if(_name.match(loggerLevel.regexp)) {
				level = loggerLevel.level;
			}
		}
		return level;
	}
};
// Static properties
Logging.Level = Level;
Logging.loggerLevels = [];
Logging.defaultLevel = DEFAULT_LEVEL;
Logging.loggers = new Map();
// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
    util.Help.print();
    return;
}
module.exports = Logging;