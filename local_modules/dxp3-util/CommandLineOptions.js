/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-util
 *
 * NAME
 * CommandLineOptions
 */
const packageName = 'dxp3-util';
const moduleName = 'CommandLineOptions';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * @module dxp3-util/CommandLineOptions
 */
const Assert = require('./Assert');
const CommandLineOption = require('./CommandLineOption');
const CommandLineBooleanOption = require('./CommandLineBooleanOption');
const CommandLineBooleanArrayOption = require('./CommandLineBooleanArrayOption');
const CommandLineEnumerationOption = require('./CommandLineEnumerationOption');
const CommandLineFlagOption = require('./CommandLineFlagOption');
const CommandLineNumberOption = require('./CommandLineNumberOption');
const CommandLineNumberArrayOption = require('./CommandLineNumberArrayOption');
const CommandLineObjectOption = require('./CommandLineObjectOption');
const CommandLineObjectArrayOption = require('./CommandLineObjectArrayOption');
const CommandLineStringOption = require('./CommandLineStringOption');
const CommandLineStringArrayOption = require('./CommandLineStringArrayOption');
const Help = require('./Help');
/**
 * <p>CommandLineOptions</p>
 */
class CommandLineOptions {
	/**
	 * CommandLineOptions constructor
	 */
	constructor() {
		this.optionsByName = new Map();
		this.optionsById = new Map();
		this.id = 0;
	}

	/**
	 * @description TODO: Describe this method.
	 * @param {CommandLineOption} _commandLineOption - TODO: Describe parameter.
	 */
	add(_commandLineOption) {
		this.addCommandLineOption(_commandLineOption);
	}

	/**
	 * @description TODO: Describe this method.
	 * @param {CommandLineOption} _commandLineOption - TODO: Describe parameter.
	 */
	addOption(_commandLineOption) {
		this.addCommandLineOption(_commandLineOption);
	}

	/**
	 * @description TODO: Describe this method.
	 * @param {CommandLineOption} _commandLineOption - TODO: Describe parameter.
	 */
	addCommandLineOption(_commandLineOption) {
		// Defensive programming...check input...
		if(_commandLineOption === undefined || _commandLineOption === null) {
			return;
		}
		let optionName = _commandLineOption.name;
		if(optionName === undefined || optionName === null) {
			return;
		}
		this.optionsByName.set(optionName, _commandLineOption);
		let aliases = _commandLineOption.aliases;
		if(aliases === undefined || aliases === null) {
			return;
		}
		if(!Array.isArray(aliases)) {
			return;
		}
		for(let i=0;i < aliases.length;i++) {
			let alias = aliases[i];
			if(alias === undefined || alias === null) {
				continue;
			}
			alias = alias.trim();
			alias = alias.replace(/[_-\s]/g,'');
			if(alias.length <= 0) {
				continue;
			}
			alias = alias.toLowerCase();
			this.optionsByName.set(alias, _commandLineOption);
		}
	}

	/**
	 * @description TODO: Describe this method.
	 * @param {string} _optionName - TODO: Describe parameter.
	 * @param {Array|string} _aliases - TODO: Describe parameter.
	 * @param {string} _propertyName - TODO: Describe parameter.
	 * @param {string} _description - TODO: Describe parameter.
	 * @returns {CommandLineBooleanOption} TODO: Describe return value.
	 */
	createBool(_optionName, _aliases, _propertyName, _description) {
		return this.createBooleanOption(_optionName, _aliases, _propertyName, _description);
	}
	
	/**
	 * @description TODO: Describe this method.
	 * @param {string} _optionName - TODO: Describe parameter.
	 * @param {Array|string} _aliases - TODO: Describe parameter.
	 * @param {string} _propertyName - TODO: Describe parameter.
	 * @param {string} _description - TODO: Describe parameter.
	 * @returns {CommandLineBooleanOption} TODO: Describe return value.
	 */
	createBoolean(_optionName, _aliases, _propertyName, _description) {
		return this.createBooleanOption(_optionName, _aliases, _propertyName, _description);
	}
	
	/**
	 * @description TODO: Describe this method.
	 * @param {string} _optionName - TODO: Describe parameter.
	 * @param {Array|string} _aliases - TODO: Describe parameter.
	 * @param {string} _propertyName - TODO: Describe parameter.
	 * @param {string} _description - TODO: Describe parameter.
	 * @returns {CommandLineBooleanOption} TODO: Describe return value.
	 */
	createBooleanOption(_optionName, _aliases, _propertyName, _description) {
		this.id++;
		let option = new CommandLineBooleanOption(this.id, _optionName, _aliases, _propertyName, _description);
		this.optionsById.set(option.id, option);
		return option;
	}

	/**
	 * @description TODO: Describe this method.
	 * @param {string} _optionName - TODO: Describe parameter.
	 * @param {Array|string} _aliases - TODO: Describe parameter.
	 * @param {string} _propertyName - TODO: Describe parameter.
	 * @param {string} _description - TODO: Describe parameter.
	 * @returns {CommandLineBooleanArrayOption} TODO: Describe return value.
	 */
	createBoolArray(_optionName, _aliases, _propertyName, _description) {
		return this.createBooleanArrayOption(_optionName, _aliases, _propertyName, _description);
	}

	/**
	 * @description TODO: Describe this method.
	 * @param {string} _optionName - TODO: Describe parameter.
	 * @param {Array|string} _aliases - TODO: Describe parameter.
	 * @param {string} _propertyName - TODO: Describe parameter.
	 * @param {string} _description - TODO: Describe parameter.
	 * @returns {CommandLineBooleanArrayOption} TODO: Describe return value.
	 */
	createBooleanArray(_optionName, _aliases, _propertyName, _description) {
		return this.createBooleanArrayOption(_optionName, _aliases, _propertyName, _description);
	}

	/**
	 * @description TODO: Describe this method.
	 * @param {string} _optionName - TODO: Describe parameter.
	 * @param {Array|string} _aliases - TODO: Describe parameter.
	 * @param {string} _propertyName - TODO: Describe parameter.
	 * @param {string} _description - TODO: Describe parameter.
	 * @returns {CommandLineBooleanArrayOption} TODO: Describe return value.
	 */
	createBooleanArrayOption(_optionName, _aliases, _propertyName, _description) {
		this.id++;
		let option = new CommandLineBooleanArrayOption(this.id, _optionName, _aliases, _propertyName, _description);
		this.optionsById.set(option.id, option);
		return option;
	}

	/**
	 * @description TODO: Describe this method.
	 * @param {string} _optionName - TODO: Describe parameter.
	 * @param {Array|string} _aliases - TODO: Describe parameter.
	 * @param {string} _propertyName - TODO: Describe parameter.
	 * @param {any} enumerationClass - TODO: Describe parameter.
	 * @param {string} _description - TODO: Describe parameter.
	 * @returns {CommandLineEnumerationOption} TODO: Describe return value.
	 */
	createEnum(_optionName, _aliases, _propertyName, enumerationClass, _description) {
		return this.createEnumerationOption(_optionName, _aliases, _propertyName, enumerationClass, _description);
	}

	/**
	 * @description TODO: Describe this method.
	 * @param {string} _optionName - TODO: Describe parameter.
	 * @param {Array|string} _aliases - TODO: Describe parameter.
	 * @param {string} _propertyName - TODO: Describe parameter.
	 * @param {any} enumerationClass - TODO: Describe parameter.
	 * @param {string} _description - TODO: Describe parameter.
	 * @returns {CommandLineEnumerationOption} TODO: Describe return value.
	 */
	createEnumOption(_optionName, _aliases, _propertyName, enumerationClass, _description) {
		return this.createEnumerationOption(_optionName, _aliases, _propertyName, enumerationClass, _description);
	}

	/**
	 * @description TODO: Describe this method.
	 * @param {string} _optionName - TODO: Describe parameter.
	 * @param {Array|string} _aliases - TODO: Describe parameter.
	 * @param {string} _propertyName - TODO: Describe parameter.
	 * @param {any} enumerationClass - TODO: Describe parameter.
	 * @param {string} _description - TODO: Describe parameter.
	 * @returns {CommandLineEnumerationOption} TODO: Describe return value.
	 */
	createEnumeration(_optionName, _aliases, _propertyName, enumerationClass, _description) {
		return this.createEnumerationOption(_optionName, _aliases, _propertyName, enumerationClass, _description);
	}

	/**
	 * @description TODO: Describe this method.
	 * @param {string} _optionName - TODO: Describe parameter.
	 * @param {Array|string} _aliases - TODO: Describe parameter.
	 * @param {string} _propertyName - TODO: Describe parameter.
	 * @param {any} enumerationClass - TODO: Describe parameter.
	 * @param {string} _description - TODO: Describe parameter.
	 * @returns {CommandLineEnumerationOption} TODO: Describe return value.
	 */
	createEnumerationOption(_optionName, _aliases, _propertyName, enumerationClass, _description) {
		this.id++;
		let option = new CommandLineEnumerationOption(this.id, _optionName, _aliases, _propertyName, enumerationClass, _description);
		this.optionsById.set(option.id, option);
		return option;
	}

	/**
	 * @description TODO: Describe this method.
	 * @param {string} _optionName - TODO: Describe parameter.
	 * @param {Array|string} _aliases - TODO: Describe parameter.
	 * @param {string} _propertyName - TODO: Describe parameter.
	 * @param {string} _description - TODO: Describe parameter.
	 * @returns {CommandLineFlagOption} TODO: Describe return value.
	 */
	createFlag(_optionName, _aliases, _propertyName, _description) {
		return this.createFlagOption(_optionName, _aliases, _propertyName, _description);
	}

	/**
	 * @description TODO: Describe this method.
	 * @param {string} _optionName - TODO: Describe parameter.
	 * @param {Array|string} _aliases - TODO: Describe parameter.
	 * @param {string} _propertyName - TODO: Describe parameter.
	 * @param {string} _description - TODO: Describe parameter.
	 * @returns {CommandLineFlagOption} TODO: Describe return value.
	 */
	createFlagOption(_optionName, _aliases, _propertyName, _description) {
		this.id++;
		let option = new CommandLineFlagOption(this.id, _optionName, _aliases, _propertyName, _description);
		this.optionsById.set(option.id, option);
		return option;
	}

	/**
	 * @description TODO: Describe this method.
	 * @param {string} _optionName - TODO: Describe parameter.
	 * @param {Array|string} _aliases - TODO: Describe parameter.
	 * @param {string} _propertyName - TODO: Describe parameter.
	 * @param {string} _description - TODO: Describe parameter.
	 * @returns {CommandLineNumberOption} TODO: Describe return value.
	 */
	createNumber(_optionName, _aliases, _propertyName, _description) {
		return this.createNumberOption(_optionName, _aliases, _propertyName, _description);
	}

	/**
	 * @description TODO: Describe this method.
	 * @param {string} _optionName - TODO: Describe parameter.
	 * @param {Array|string} _aliases - TODO: Describe parameter.
	 * @param {string} _propertyName - TODO: Describe parameter.
	 * @param {string} _description - TODO: Describe parameter.
	 * @returns {CommandLineNumberOption} TODO: Describe return value.
	 */
	createNumberOption(_optionName, _aliases, _propertyName, _description) {
		this.id++;
		let option = new CommandLineNumberOption(this.id, _optionName, _aliases, _propertyName, _description);
		this.optionsById.set(option.id, option);
		return option;
	}

	/**
	 * @description TODO: Describe this method.
	 * @param {string} _optionName - TODO: Describe parameter.
	 * @param {Array|string} _aliases - TODO: Describe parameter.
	 * @param {string} _propertyName - TODO: Describe parameter.
	 * @param {string} _description - TODO: Describe parameter.
	 * @returns {CommandLineNumberArrayOption} TODO: Describe return value.
	 */
	createNumberArray(_optionName, _aliases, _propertyName, _description) {
		return this.createNumberArrayOption(_optionName, _aliases, _propertyName, _description);
	}

	/**
	 * @description TODO: Describe this method.
	 * @param {string} _optionName - TODO: Describe parameter.
	 * @param {Array|string} _aliases - TODO: Describe parameter.
	 * @param {string} _propertyName - TODO: Describe parameter.
	 * @param {string} _description - TODO: Describe parameter.
	 * @returns {CommandLineNumberArrayOption} TODO: Describe return value.
	 */
	createNumberArrayOption(_optionName, _aliases, _propertyName, _description) {
		this.id++;
		let option = new CommandLineNumberArrayOption(this.id, _optionName, _aliases, _propertyName, _description);
		this.optionsById.set(option.id, option);
		return option;
	}

	/**
	 * @description TODO: Describe this method.
	 * @param {string} _optionName - TODO: Describe parameter.
	 * @param {Array|string} _aliases - TODO: Describe parameter.
	 * @param {string} _propertyName - TODO: Describe parameter.
	 * @param {string} _description - TODO: Describe parameter.
	 * @returns {CommandLineObjectOption} TODO: Describe return value.
	 */
	createObject(_optionName, _aliases, _propertyName, _description) {
		return this.createObjectOption(_optionName, _aliases, _propertyName, _description);
	}

	/**
	 * @description TODO: Describe this method.
	 * @param {string} _optionName - TODO: Describe parameter.
	 * @param {Array|string} _aliases - TODO: Describe parameter.
	 * @param {string} _propertyName - TODO: Describe parameter.
	 * @param {string} _description - TODO: Describe parameter.
	 * @returns {CommandLineObjectOption} TODO: Describe return value.
	 */
	createObjectOption(_optionName, _aliases, _propertyName, _description) {
		this.id++;
		let option = new CommandLineObjectOption(this.id, _optionName, _aliases, _propertyName, _description);
		this.optionsById.set(option.id, option);
		return option;
	}

	/**
	 * @description TODO: Describe this method.
	 * @param {string} _optionName - TODO: Describe parameter.
	 * @param {Array|string} _aliases - TODO: Describe parameter.
	 * @param {string} _propertyName - TODO: Describe parameter.
	 * @param {string} _description - TODO: Describe parameter.
	 * @returns {CommandLineObjectArrayOption} TODO: Describe return value.
	 */
	createObjectArray(_optionName, _aliases, _propertyName, _description) {
		return this.createObjectArrayOption(_optionName, _aliases, _propertyName, _description);
	}

	/**
	 * @description TODO: Describe this method.
	 * @param {string} _optionName - TODO: Describe parameter.
	 * @param {Array|string} _aliases - TODO: Describe parameter.
	 * @param {string} _propertyName - TODO: Describe parameter.
	 * @param {string} _description - TODO: Describe parameter.
	 * @returns {CommandLineObjectArrayOption} TODO: Describe return value.
	 */
	createObjectArrayOption(_optionName, _aliases, _propertyName, _description) {
		this.id++;
		let option = new CommandLineObjectArrayOption(this.id, _optionName, _aliases, _propertyName, _description);
		this.optionsById.set(option.id, option);
		return option;
	}

	/**
	 * @description TODO: Describe this method.
	 * @param {string} _optionName - TODO: Describe parameter.
	 * @param {Array|string} _aliases - TODO: Describe parameter.
	 * @param {string} _propertyName - TODO: Describe parameter.
	 * @param {string} _description - TODO: Describe parameter.
	 * @returns {CommandLineStringOption} TODO: Describe return value.
	 */
	createString(_optionName, _aliases, _propertyName, _description) {
		return this.createStringOption(_optionName, _aliases, _propertyName, _description);
	}

	/**
	 * @description TODO: Describe this method.
	 * @param {string} _optionName - TODO: Describe parameter.
	 * @param {Array|string} _aliases - TODO: Describe parameter.
	 * @param {string} _propertyName - TODO: Describe parameter.
	 * @param {string} _description - TODO: Describe parameter.
	 * @returns {CommandLineStringOption} TODO: Describe return value.
	 */
	createStringOption(_optionName, _aliases, _propertyName, _description) {
		this.id++;
		let option = new CommandLineStringOption(this.id, _optionName, _aliases, _propertyName, _description);
		this.optionsById.set(option.id, option);
		return option;
	}

	/**
	 * @description TODO: Describe this method.
	 * @param {string} _optionName - TODO: Describe parameter.
	 * @param {Array|string} _aliases - TODO: Describe parameter.
	 * @param {string} _propertyName - TODO: Describe parameter.
	 * @param {string} _description - TODO: Describe parameter.
	 * @returns {CommandLineStringArrayOption} TODO: Describe return value.
	 */
	createStringArray(_optionName, _aliases, _propertyName, _description) {
		return this.createStringArrayOption(_optionName, _aliases, _propertyName, _description);
	}

	/**
	 * @description TODO: Describe this method.
	 * @param {string} _optionName - TODO: Describe parameter.
	 * @param {Array|string} _aliases - TODO: Describe parameter.
	 * @param {string} _propertyName - TODO: Describe parameter.
	 * @param {string} _description - TODO: Describe parameter.
	 * @returns {CommandLineStringArrayOption} TODO: Describe return value.
	 */
	createStringArrayOption(_optionName, _aliases, _propertyName, _description) {
		this.id++;
		let option = new CommandLineStringArrayOption(this.id, _optionName, _aliases, _propertyName, _description);
		this.optionsById.set(option.id, option);
		return option;
	}

	/**
	 * @description TODO: Describe this method.
	 * @param {object} _result - TODO: Describe parameter.
	 * @returns {object} TODO: Describe return value.
	 */
	parse(_result) {
		if(_result === undefined || _result === null) {
			_result = {};
		}
		// The first two items in the process.argv array are
		// the word node and the name of the application.
		// The 'real' arguments start at index 2.
		for(let index = 2;index < process.argv.length;index++) {
			let value = process.argv[index];
			if(value.startsWith('-')) {
				value = value.replace(/[_-\s]/g,'');
				value = value.toLowerCase();
				let option = this.optionsByName.get(value);
				if(option === undefined || option === null) {
					continue;
				}
				index = option.parse(_result, index);
			} else if(this.defaultHandler != undefined && this.defaultHandler != null) {
				index = this.defaultHandler(_result, index, value);
			}
		}
		return _result;
	}

	/**
	 * @description TODO: Describe this method.
	 * @param {function} _handler - TODO: Describe parameter.
	 */
	addDefaultHandler(_handler) {
		this.defaultHandler = _handler;
	}
}
// Check if someone tried to run/execute this file.
if(Assert.isFileToExecute(canonicalName)) {
	Help.print(CommandLineOptions);
	return;
}
module.exports = CommandLineOptions;