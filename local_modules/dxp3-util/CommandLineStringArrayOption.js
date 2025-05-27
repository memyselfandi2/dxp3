/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-util
 *
 * NAME
 * CommandLineStringArrayOption
 */
const packageName = 'dxp3-util';
const moduleName = 'CommandLineStringArrayOption';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * @module dxp3-util/CommandLineStringArrayOption
 */
const Assert = require('./Assert');
const CommandLineError = require('./CommandLineError');
const CommandLineOption = require('./CommandLineOption');
const Help = require('./Help');

class CommandLineStringArrayOption extends CommandLineOption {
	/**
	 * Creates an instance of CommandLineStringArrayOption.
	 * Expects a comma-separated string of values on the command line.
	 * @param {number} id - A unique identifier for the option.
	 * @param {string} name - The primary name of the option (e.g., '--files').
	 * @param {Array|string} aliases - A comma-separated string or an array of alternative names for the option (e.g., ['-f']).
	 * @param {string} propertyName - The name of the property to set on the result object (will be an array of strings).
	 * @param {string} description - A description of the option for help messages.
	 */
	constructor(id, name, aliases, propertyName, description) {
		super(id, name, aliases, propertyName, description);
	}

	/**
	 * Parses a comma-separated string of values for this option from the command line arguments.
	 * If a custom handler is defined, it delegates parsing to the handler.
	 * Otherwise, it takes the next argument from `process.argv`, splits it by commas,
	 * and concatenates the resulting array with any existing array on the `propertyName`
	 * of the `_result` object. If no array exists, a new one is created.
	 * @param {object} _result - The object to populate with the parsed option values.
	 * @param {number} _index - The current index in `process.argv` being parsed.
	 * @returns {number} The updated index in `process.argv` after parsing this option.
	 * @throws {CommandLineError.ILLEGAL_ARGUMENT} If `_result` is undefined or null.
	 */
	parse(_result, _index) {
		if(_result === undefined || _result === null) {
			throw CommandLineError.ILLEGAL_ARGUMENT;
		}
		if(this.handler != undefined && this.handler != null) {
			return this.handler(_result,_index,this.propertyName);
		}
		_index++;
		if(_index < process.argv.length) {
			let values = process.argv[_index];
			let currentArray = _result[this.propertyName];
			if(currentArray === undefined || currentArray === null) {
				currentArray = [];
			}
			_result[this.propertyName] = currentArray.concat(values.trim().split(','));
		}
		return _index;
	}
}
// Check if someone tried to run/execute this file.
if(Assert.isFileToExecute(canonicalName)) {
	Help.print(CommandLineStringArrayOption);
	return;
}
module.exports = CommandLineStringArrayOption;