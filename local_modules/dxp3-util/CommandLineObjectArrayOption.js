/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-util
 *
 * NAME
 * CommandLineObjectArrayOption
 */
const packageName = 'dxp3-util';
const moduleName = 'CommandLineObjectArrayOption';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * @module dxp3-util/CommandLineObjectArrayOption
 */
const Assert = require('./Assert');
const CommandLineError = require('./CommandLineError');
const CommandLineOption = require('./CommandLineOption');
const CommandLineObjectOption = require('./CommandLineObjectOption');
const Help = require('./Help');

class CommandLineObjectArrayOption extends CommandLineObjectOption {
	/**
	 * @description TODO: Describe this method.
	 * @param {number} id - TODO: Describe parameter.
	 * @param {string} name - TODO: Describe parameter.
	 * @param {Array|string} aliases - TODO: Describe parameter.
	 * @param {string} propertyName - TODO: Describe parameter.
	 * @param {string} description - TODO: Describe parameter.
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
		let currentArray = _result[this.propertyName];
		if(currentArray === undefined || currentArray === null) {
			currentArray = [];
			_result[this.propertyName] = currentArray;
		}
		let parsedObject = super.parseObject(_result, _index);
		_index = parsedObject._index;
		delete parsedObject._index;
		currentArray.push(parsedObject)
		return _index;
	}
}
// Check if someone tried to run/execute this file.
if(Assert.isFileToExecute(canonicalName)) {
	Help.print(CommandLineObjectArrayOption);
	return;
}
module.exports = CommandLineObjectArrayOption;