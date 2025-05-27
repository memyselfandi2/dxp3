/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-util
 *
 * NAME
 * CommandLineObjectOption
 */
const packageName = 'dxp3-util';
const moduleName = 'CommandLineObjectOption';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * @module dxp3-util/CommandLineObjectOption
 */
const Assert = require('./Assert');
const CommandLineError = require('./CommandLineError');
const CommandLineOption = require('./CommandLineOption');
const Help = require('./Help');

class CommandLineObjectOption extends CommandLineOption {
	/**
	 * Creates an instance of CommandLineObjectOption.
	 * This option type expects a sequence of values on the command line that correspond
	 * to the properties defined for the object structure (via `addStringProperty`, etc.).
	 * @param {number} id - A unique identifier for the option.
	 * @param {string} name - The primary name of the option (e.g., '--config').
	 * @param {Array|string} aliases - A comma-separated string or an array of alternative names for the option.
	 * @param {string} propertyName - The name of the property to set on the result object, which will hold the parsed object.
	 * @param {string} description - A description of the option for help messages.
	 */
	constructor(id, name, aliases, propertyName, description) {
		super(id, name, aliases, propertyName, description);
		this.properties = [];
	}

	/**
	 * Adds a definition for a number property expected for this object option.
	 * @param {string} _name - The name of the property.
	 */
	addNumberProperty(_name) {
		let property = {
			name: _name,
			type: 'number'
		}
		this.properties.push(property);
	}

	/**
	 * Adds a definition for a string property expected for this object option.
	 * @param {string} _name - The name of the property.
	 */
	addStringProperty(_name) {
		let property = {
			name: _name,
			type: 'string'
		}
		this.properties.push(property);
	}

	/**
	 * Adds a definition for an enumeration property expected for this object option.
	 * @param {string} _name - The name of the property.
	 * @param {Class} EnumerationClass - The class used to parse the enumeration value. It must have a static `parse` method.
	 */
	addEnumerationProperty(_name, EnumerationClass) {
		let property = {
			name: _name,
			type: 'enumeration',
			EnumerationClass: EnumerationClass
		}
		this.properties.push(property);
	}

	/**
	 * Parses subsequent command line arguments into an object based on defined properties.
	 * For each defined property (string, number, enumeration), it consumes the next argument
	 * from `process.argv`, parses it accordingly, and adds it to the `parsedObject`.
	 * @param {object} _result - The main result object (not directly modified by this method but passed for context, potentially by handlers).
	 * @param {number} _index - The current index in `process.argv` from which to start parsing values for the object's properties.
	 * @returns {object} An object containing the parsed properties and an `_index` property indicating the new `process.argv` index.
	 * @throws {CommandLineError} If an enumeration value cannot be parsed.
	 */
	parseObject(_result, _index) {
		let parsedObject = {};
		for(let i=0;i < this.properties.length;i++) {
			let property = this.properties[i];
			_index++;
			if(_index < process.argv.length) {
				let value = process.argv[_index];
				if(property.type === 'string') {
					parsedObject[property.name] = value;
				} else if(property.type === 'enumeration') {
					try {
						let enumerationValue = property.EnumerationClass.parse(value);
						parsedObject[property.name] = enumerationValue;
					} catch(exception) {
						throw new CommandLineError('Unable to parse enumeration value: ' + value)
					}
				} else if(property.type === 'number') {
					let parsedValue = parseInt(value);
					parsedObject[property.name] = parsedValue;
				}
			}
		}
		parsedObject._index = _index;
		return parsedObject;
	}

	/**
	 * Parses a sequence of command line arguments into an object and assigns it to `propertyName` on `_result`.
	 * If a custom handler is defined, it delegates parsing to the handler.
	 * Otherwise, it calls `this.parseObject()` to consume and parse the required number
	 * of arguments from `process.argv` based on the defined object properties.
	 * @param {object} _result - The object to populate with the parsed object.
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
		let parsedObject = this.parseObject(_result, _index); // Corrected: called this.parseObject
		_index = parsedObject._index;
		delete parsedObject._index;
		_result[this.propertyName] = parsedObject;
		return _index;
	}
}
// Check if someone tried to run/execute this file.
if(Assert.isFileToExecute(canonicalName)) {
	Help.print(CommandLineObjectOption);
	return;
}
module.exports = CommandLineObjectOption;