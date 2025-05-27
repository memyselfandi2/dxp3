/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-util
 *
 * NAME
 * CommandLineNumberOption
 */
const packageName = 'dxp3-util';
const moduleName = 'CommandLineNumberOption';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * @module dxp3-util/CommandLineNumberOption
 */
const Assert = require('./Assert');
const CommandLineError = require('./CommandLineError');
const CommandLineOption = require('./CommandLineOption');
const Help = require('./Help');
/**
 * <p>A CommandLineNumberOption represents a -<option name> number entry on the command line.</p>
 */
class CommandLineNumberOption extends CommandLineOption {
	/**
	 * @param {Number} id
	 * @param {String} name
	 * @param {Array|String} aliases
	 * @param {String} propertyName
	 * @param {String} description
	 */
	constructor(id, name, aliases, propertyName, description) {
		super(id, name, aliases, propertyName, description);
	}

	/**
	 * @description TODO: Describe this method.
	 * @param {object} _result - TODO: Describe parameter.
	 * @param {number} _index - TODO: Describe parameter.
	 * @returns {number} TODO: Describe return value.
	 */
	parse(_result, _index) {
		if(_result === undefined || _result === null) {
			throw CommandLineError.ILLEGAL_ARGUMENT;
		}
		if(this.handler != undefined && this.handler != null) {
			return this.handler(_result, _index, this.propertyName);
		}
		_index++;
		if(_index < process.argv.length) {
			let value = process.argv[_index];
			let parsedValue = parseInt(value);
			if(isNaN(parsedValue)) {
				if(value.startsWith('-')) {
					_index--;
				}
				return _index;
			}
			_result[this.propertyName] = parsedValue;
		}
		return _index;
	}
}
// Check if someone tried to run/execute this file.
if(Assert.isFileToExecute(canonicalName)) {
	Help.print(CommandLineNumberOption);
	return;
}
module.exports = CommandLineNumberOption;