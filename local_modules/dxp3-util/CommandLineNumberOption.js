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
	 * Creates an instance of CommandLineNumberOption.
	 * @param {Number} id - A unique identifier for the option.
	 * @param {String} name - The primary name of the option (e.g., '--port').
	 * @param {Array|String} aliases - A comma-separated string or an array of alternative names for the option (e.g., ['-p']).
	 * @param {String} propertyName - The name of the property to set on the result object.
	 * @param {String} description - A description of the option for help messages.
	 */
	constructor(id, name, aliases, propertyName, description) {
		super(id, name, aliases, propertyName, description);
	}

	/**
	 * Parses the numeric value for this option from the command line arguments.
	 * If a custom handler is defined, it delegates parsing to the handler.
	 * Otherwise, it takes the next argument from `process.argv`, attempts to parse it as an integer,
	 * and assigns it to the `propertyName` on the `_result` object.
	 * If parsing fails and the value looks like another option (starts with '-'),
	 * the index is decremented to allow that option to be processed.
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