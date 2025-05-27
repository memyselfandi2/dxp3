/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-util
 *
 * NAME
 * CommandLineNumberArrayOption
 */
const packageName = 'dxp3-util';
const moduleName = 'CommandLineNumberArrayOption';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * @module dxp3-util/CommandLineNumberArrayOption
 */
const Assert = require('./Assert');
const CommandLineError = require('./CommandLineError');
const CommandLineOption = require('./CommandLineOption');
const Help = require('./Help');

class CommandLineNumberArrayOption extends CommandLineOption {
	/**
	 * Creates an instance of CommandLineNumberArrayOption.
	 * Expects a comma-separated string of numeric values on the command line.
	 * @param {number} id - A unique identifier for the option.
	 * @param {string} name - The primary name of the option (e.g., '--ports').
	 * @param {Array|string} aliases - A comma-separated string or an array of alternative names for the option (e.g., ['-p']).
	 * @param {string} propertyName - The name of the property to set on the result object (will be an array of numbers).
	 * @param {string} description - A description of the option for help messages.
	 */
	constructor(id, name, aliases, propertyName, description) {
		super(id, name, aliases, propertyName, description);
	}

	/**
	 * Parses a comma-separated string of numeric values for this option from the command line arguments.
	 * If a custom handler is defined, it delegates parsing to the handler.
	 * Otherwise, it takes the next argument from `process.argv`, splits it by commas,
	 * attempts to parse each part as an integer, and concatenates valid numbers
	 * with any existing array on the `propertyName` of the `_result` object.
	 * If no array exists, a new one is created. Invalid numbers are skipped.
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
			values = values.trim().split(',');
			for(let i=0;i < values.length;i++) {
				let value = values[i];
				value = value.trim().toLowerCase();
				value = parseInt(value);
				if(isNaN(value)) {
					continue;
				}
				currentArray.push(value);
			}
			_result[this.propertyName] = currentArray;
		}
		return _index;
	}
}
// Check if someone tried to run/execute this file.
if(Assert.isFileToExecute(canonicalName)) {
	Help.print(CommandLineNumberArrayOption);
	return;
}
module.exports = CommandLineNumberArrayOption;