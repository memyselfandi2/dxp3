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