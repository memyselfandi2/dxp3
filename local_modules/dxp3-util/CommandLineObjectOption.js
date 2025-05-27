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
	 * @description TODO: Describe this method.
	 * @param {number} id - TODO: Describe parameter.
	 * @param {string} name - TODO: Describe parameter.
	 * @param {Array|string} aliases - TODO: Describe parameter.
	 * @param {string} propertyName - TODO: Describe parameter.
	 * @param {string} description - TODO: Describe parameter.
	 */
	constructor(id, name, aliases, propertyName, description) {
		super(id, name, aliases, propertyName, description);
		this.properties = [];
	}

	/**
	 * @description TODO: Describe this method.
	 * @param {string} _name - TODO: Describe parameter.
	 */
	addNumberProperty(_name) {
		let property = {
			name: _name,
			type: 'number'
		}
		this.properties.push(property);
	}

	/**
	 * @description TODO: Describe this method.
	 * @param {string} _name - TODO: Describe parameter.
	 */
	addStringProperty(_name) {
		let property = {
			name: _name,
			type: 'string'
		}
		this.properties.push(property);
	}

	/**
	 * @description TODO: Describe this method.
	 * @param {string} _name - TODO: Describe parameter.
	 * @param {any} EnumerationClass - TODO: Describe parameter.
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
	 * @description TODO: Describe this method.
	 * @param {object} _result - TODO: Describe parameter.
	 * @param {number} _index - TODO: Describe parameter.
	 * @returns {object} TODO: Describe return value.
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