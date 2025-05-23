/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-logging
 *
 * NAME
 * FileLogger
 */
const packageName = 'dxp3-logging';
const moduleName = 'FileLogger';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * This module implements a logger that writes to a file.
 *
 * @module dxp3-logging/FileLogger
 */
const fs = require('fs');
const Level = require('./Level');
const Logger = require('./Logger');
// We use the util.Help class to print out help information and
// we use the Assert utility to validate method inputs.
const Assert = require('dxp3-util').Assert;
const util = require('util');

class FileLogger extends Logger {
	/*********************************************
	 * CONSTRUCTOR
	 ********************************************/

	/**
	 * @param {String} _name
	 * @param {Level} _level
	 */
	constructor(_name, _level, _filePath) {
		super(_name, _level);
		this._filePath = _filePath;
		this._logFile = fs.createWriteStream(this._filePath, {flags: 'a'});
	}

	/*********************************************
	 * PUBLIC METHODS
	 ********************************************/

	/**
	 * @param {Level} level
	 * @param {String} _message
	 */
	log(_level, ...args) {
		if(this.level <= _level) {
			let dateString = new Date().toISOString();
			switch(_level) {
				case 0:
					this._logFile.write(util.format('[%s] %s %s', dateString, this.name, 'TRACE', ...args, '\n'));
					break;
				case 1:
					this._logFile.write(util.format('[%s] %s %s', dateString, this.name, 'DEBUG', ...args, '\n'));
					break;
				case 2:
					this._logFile.write(util.format('[%s] %s %s', dateString, this.name, 'INFO', ...args, '\n'));
					break;
				case 3:
					this._logFile.write(util.format('[%s] %s %s', dateString, this.name, 'WARN', ...args, '\n'));
					break;
				case 4:
					this._logFile.write(util.format('[%s] %s %s', dateString, this.name, 'ERROR', ...args, '\n'));
					break;
				case 5:
					this._logFile.write(util.format('[%s] %s %s', dateString, this.name, 'FATAL', ...args, '\n'));
					break;
				default:
					break;
			}
		}
	}

	/*********************************************
	 * GETTERS
	 ********************************************/
	
	getFilePath() {
		return this._filePath;
	}

	/*********************************************
	 * SETTERS
	 ********************************************/

	/**
	 * @param {String} _filePath
	 */
	setFilePath(_filePath) {
		// Defensive programming...check input...
		if(Assert.isUndefinedOrNull(_filePath)) {
			return;
		}
		this._logFile.end();
		this._filePath = _filePath;
		this._logFile = fs.createWriteStream(this._filePath, {flags: 'a'});
	}
}
// Check if someone tried to run/execute this file.
if(Assert.isFileToExecute(canonicalName)) {
	let test = new FileLogger('henk', Level.DEBUG, 'C:\\temp\\blaat_log.txt');
	test.info('ja zeg dit is info.');
    // util.Help.print(FileLogger);
    // return;
}
module.exports = FileLogger;