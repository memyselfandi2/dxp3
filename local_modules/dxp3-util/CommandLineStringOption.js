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
	 * @description TODO: Describe this method.
	 * @param {number} id - TODO: Describe parameter.
	 * @param {string} name - TODO: Describe parameter.
	 * @param {Array|string} aliases - TODO: Describe parameter.
	 * @param {string} propertyName - TODO: Describe parameter.
	 * @param {string} description - TODO: Describe parameter.
	 */
	constructor(id, name, aliases, propertyName, description) {
		super(id,name,aliases,propertyName,description);
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