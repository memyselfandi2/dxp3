/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-util
 *
 * NAME
 * CommandLineOption
 */
const packageName = 'dxp3-util';
const moduleName = 'CommandLineOption';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * @module dxp3-util/CommandLineOption
 */
const Assert = require('./Assert');
const Help = require('./Help');
/**
 * <p>A CommandLineOption represents a -<option name> [value] entry on the command line.</p>
 *
 * @property {Number} id
 * @property {String} name
 * @property {Array} aliases
 * @property {String} propertyName
 * @property {String} description
 */
class CommandLineOption {
	/**
	 * @param {Number} _id
	 * @param {String} _name
	 * @param {Array|String} _aliases
	 * @param {String} _propertyName
	 * @param {String} _description
	 */
	constructor(_id, _name, _aliases, _propertyName, _description) {
		this.id = _id;
		this.name = _name;
		if(_aliases === undefined || _aliases === null) {
			_aliases = [];
		} else if(typeof _aliases === 'string') {
			_aliases = _aliases.trim().split(',');
		}
		if(Array.isArray(_aliases)) {
			this.aliases = _aliases;
		} else {
			this.aliases = [];
		}
		this.propertyName = _propertyName;
		this.description = _description;
	}

	match(_optionName) {
		if(_optionName === undefined || _optionName === null) {
			return false;
		}
		if(typeof _optionName != 'string') {
			return false;
		}
		_optionName = _optionName.replace(/[_-\s]/g,'');
		_optionName = _optionName.toLowerCase();
		return ((this.name === _optionName) || (this.aliases.includes(_optionName)));
	}

	/**
	 * Add a handler function.
	 * <Number> handler(<Object> result, <Number> index, <String> propertyName)
	 * It must return the next index.
	 */
	addHandler(_handler) {
		this.handler = _handler;
	}

	parse(_result, _index) {
		if(this.handler != undefined && this.handler != null) {
			return this.handler(_result, _index, this.propertyName);
		}
		throw new Error("NOT IMPLEMENTED");
	}
}
// Check if someone tried to run/execute this file.
if(Assert.isFileToExecute(canonicalName)) {
	Help.print(CommandLineOption);
	return;
}
module.exports = CommandLineOption;