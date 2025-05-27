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
	 * Creates an instance of CommandLineObjectArrayOption.
	 * This option type expects a sequence of values on the command line that correspond
	 * to the properties defined for the object structure (via `addStringProperty`, etc.).
	 * Each invocation of this option adds a new object to an array.
	 * @param {number} id - A unique identifier for the option.
	 * @param {string} name - The primary name of the option (e.g., '--user').
	 * @param {Array|string} aliases - A comma-separated string or an array of alternative names for the option.
	 * @param {string} propertyName - The name of the property on the result object, which will hold an array of parsed objects.
	 * @param {string} description - A description of the option for help messages.
	 */
	constructor(id, name, aliases, propertyName, description) {
		super(id, name, aliases, propertyName, description);
	}

	/**
	 * Parses a set of subsequent command line arguments into an object and adds it to an array.
	 * If a custom handler is defined, it delegates parsing to the handler.
	 * Otherwise, it initializes or retrieves an array on the `_result` object using `propertyName`.
	 * It then calls `super.parseObject()` to parse the subsequent arguments into a new object,
	 * which is then pushed onto this array.
	 * @param {object} _result - The object to populate. The `propertyName` will hold an array of parsed objects.
	 * @param {number} _index - The current index in `process.argv` being parsed.
	 * @returns {number} The updated index in `process.argv` after parsing all values for this object.
	 * @throws {CommandLineError.ILLEGAL_ARGUMENT} If `_result` is undefined or null.
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