/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-util
 *
 * NAME
 * CommandLineBooleanOption
 */
const packageName = 'dxp3-util';
const moduleName = 'CommandLineBooleanOption';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * @module dxp3-util/CommandLineBooleanOption
 */
const Assert = require('./Assert');
const CommandLineError = require('./CommandLineError');
const CommandLineOption = require('./CommandLineOption');
const Help = require('./Help');
/**
 * <p>A CommandLineBooleanOption represents a -<option name> boolean entry on the command line.</p>
 */
class CommandLineBooleanOption extends CommandLineOption {
	/**
	 * Creates an instance of CommandLineBooleanOption.
	 * @param {Number} id - A unique identifier for the option.
	 * @param {String} name - The primary name of the option (e.g., '--verbose').
	 * @param {Array|String} aliases - A comma-separated string or an array of alternative names for the option (e.g., ['-v']).
	 * @param {String} propertyName - The name of the property to set on the result object.
	 * @param {String} description - A description of the option for help messages.
	 */
	constructor(id, name, aliases, propertyName, description) {
		super(id, name, aliases, propertyName, description);
	}

	/**
	 * Parses the boolean value for this option from the command line arguments.
	 * If a custom handler is defined, it delegates parsing to the handler.
	 * Otherwise, it takes the next argument from `process.argv`, converts it to a boolean,
	 * and assigns it to the `propertyName` on the `_result` object.
	 * Recognized true values (case-insensitive): 'yes', 'true', 'on'. Other values result in false.
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
			value = value.trim().toLowerCase();
			switch(value) {
				case 'yes':
				case 'true':
				case 'on':
					_result[this.propertyName] = true;
					break;
				default:
					_result[this.propertyName] = false;
			}
		}
		return _index;
	}
}
// Check if someone tried to run/execute this file.
if(Assert.isFileToExecute(canonicalName)) {
	Help.print(CommandLineBooleanOption);
	return;
}
module.exports = CommandLineBooleanOption;