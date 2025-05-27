/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-util
 *
 * NAME
 * CommandLineStringOption
 */
const packageName = 'dxp3-util';
const moduleName = 'CommandLineStringOption';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * @module dxp3-util/CommandLineStringOption
 */
const Assert = require('./Assert');
const CommandLineError = require('./CommandLineError');
const CommandLineOption = require('./CommandLineOption');
const Help = require('./Help');

class CommandLineStringOption extends CommandLineOption {
	/**
	 * Creates an instance of CommandLineStringOption.
	 * @param {number} id - A unique identifier for the option.
	 * @param {string} name - The primary name of the option (e.g., '--output').
	 * @param {Array|string} aliases - A comma-separated string or an array of alternative names for the option (e.g., ['-o']).
	 * @param {string} propertyName - The name of the property to set on the result object.
	 * @param {string} description - A description of the option for help messages.
	 */
	constructor(id, name, aliases, propertyName, description) {
		super(id,name,aliases,propertyName,description);
	}

	/**
	 * Parses the string value for this option from the command line arguments.
	 * If a custom handler is defined, it delegates parsing to the handler.
	 * Otherwise, it takes the next argument from `process.argv` as the string value
	 * and assigns it to the `propertyName` on the `_result` object.
	 * @param {object} _result - The object to populate with the parsed option value.
	 * @param {number} _index - The current index in `process.argv` being parsed.
	 * @returns {number} The updated index in `process.argv` after parsing this option.
	 * @throws {CommandLineError.ILLEGAL_ARGUMENT} If `_result` is undefined or null.
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
			_result[this.propertyName] = process.argv[_index];
		}
		return _index;
	}
}
// Check if someone tried to run/execute this file.
if(Assert.isFileToExecute(canonicalName)) {
	Help.print(CommandLineStringOption);
	return;
}
module.exports = CommandLineStringOption;