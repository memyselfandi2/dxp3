/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-util
 *
 * NAME
 * CommandLineFlagOption
 */
const packageName = 'dxp3-util';
const moduleName = 'CommandLineFlagOption';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * @module dxp3-util/CommandLineFlagOption
 */
const Assert = require('./Assert');
const CommandLineError = require('./CommandLineError');
const CommandLineOption = require('./CommandLineOption');
const Help = require('./Help');
/**
 * <p>A CommandLineFlagOption represents a -<option name> entry on the command line.</p>
 */
class CommandLineFlagOption extends CommandLineOption {
	/**
	 * Creates an instance of CommandLineFlagOption.
	 * A flag option does not take a value; its presence implies true.
	 * @param {Number} id - A unique identifier for the option.
	 * @param {String} name - The primary name of the option (e.g., '--help').
	 * @param {Array|String} aliases - A comma-separated string or an array of alternative names for the option (e.g., ['-h']).
	 * @param {String} propertyName - The name of the property to set to `true` on the result object if the flag is present.
	 * @param {String} description - A description of the option for help messages.
	 */
	constructor(id, name, aliases, propertyName, description) {
		super(id, name, aliases, propertyName, description);
	}

	/**
	 * Parses this flag option from the command line arguments.
	 * If a custom handler is defined, it delegates parsing to the handler.
	 * Otherwise, it sets the `propertyName` on the `_result` object to `true`.
	 * Flag options do not consume an additional argument for a value.
	 * @param {object} _result - The object to populate with the parsed option value.
	 * @param {number} _index - The current index in `process.argv` being parsed.
	 * @returns {number} The updated index in `process.argv` (which is the same as the input `_index` for flags).
	 * @throws {CommandLineError.ILLEGAL_ARGUMENT} If `_result` is undefined or null.
	 */
	parse(_result, _index) {
		if(_result === undefined || _result === null) {
			throw CommandLineError.ILLEGAL_ARGUMENT;
		}
		if(this.handler != undefined && this.handler != null) {
			return this.handler(_result,_index,this.propertyName);
		}
		_result[this.propertyName] = true;
		return _index;
	}
}
// Check if someone tried to run/execute this file.
if(Assert.isFileToExecute(canonicalName)) {
	Help.print(CommandLineFlagOption);
	return;
}
module.exports = CommandLineFlagOption;