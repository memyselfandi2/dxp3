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