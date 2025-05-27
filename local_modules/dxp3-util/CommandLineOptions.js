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
 * @description Manages and parses command-line options for an application.
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
 * Manages a collection of command-line options and provides functionality to parse them
 * from `process.argv`.
 * @class CommandLineOptions
 */
class CommandLineOptions {
	/**
	 * Creates an instance of CommandLineOptions.
	 * Initializes internal maps for storing options by name and ID.
	 * @constructor
	 */
	constructor() {
		this.optionsByName = new Map();
		this.optionsById = new Map();
		this.id = 0;
	}

	/**
	 * @description Adds a command-line option to the collection.
	 * Alias for {@link CommandLineOptions#addCommandLineOption}.
	 * @param {CommandLineOption} _commandLineOption - The command line option to add.
	 */
	add(_commandLineOption) {
		this.addCommandLineOption(_commandLineOption);
	}

	/**
	 * @description Adds a command-line option to the collection.
	 * Alias for {@link CommandLineOptions#addCommandLineOption}.
	 * @param {CommandLineOption} _commandLineOption - The command line option to add.
	 */
	addOption(_commandLineOption) {
		this.addCommandLineOption(_commandLineOption);
	}

	/**
	 * @description Adds a command-line option to the collection.
	 * The option and its aliases are stored for later parsing.
	 * Aliases are normalized (trimmed, special characters removed, lowercased).
	 * @param {CommandLineOption} _commandLineOption - The command line option instance to add.
	 */
	addCommandLineOption(_commandLineOption) {
		// Defensive programming...check input...
		if(Assert.isUndefinedOrNull(_commandLineOption)) {
			return;
		}
		let optionName = _commandLineOption.name;
		if(Assert.isUndefinedOrNullOrNotAStringOrEmpty(optionName)) {
			return;
		}
		this.optionsByName.set(optionName, _commandLineOption);
		let aliases = _commandLineOption.aliases;
		if(Assert.isUndefinedOrNullOrEmptyArray(aliases)) {
			// If no aliases, we are done with this part.
			// Still need to add to optionsById if it was created through a create* method.
			// However, this method is generic, so we assume the option might not have an ID yet
			// if it wasn't created by a `create*` method of this class.
			return;
		}
		if(!Array.isArray(aliases)) {
			// Should not happen if CommandLineOption constructor validates, but good for defense.
			return;
		}
		for(let i=0;i < aliases.length;i++) {
			let alias = aliases[i];
			if(Assert.isUndefinedOrNullOrNotAStringOrEmpty(alias)) {
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
	 * @description Creates and adds a boolean command-line option.
	 * Alias for {@link CommandLineOptions#createBooleanOption}.
	 * @param {string} _optionName - The primary name of the option (e.g., '--verbose').
	 * @param {string[]} _aliases - An array of alternative names for the option (e.g., ['-v']).
	 * @param {string} _propertyName - The name of the property to set on the result object.
	 * @param {string} _description - A description of the option for help messages.
	 * @returns {CommandLineBooleanOption} The created boolean option.
	 */
	createBool(_optionName, _aliases, _propertyName, _description) {
		return this.createBooleanOption(_optionName, _aliases, _propertyName, _description);
	}
	
	/**
	 * @description Creates and adds a boolean command-line option.
	 * Alias for {@link CommandLineOptions#createBooleanOption}.
	 * @param {string} _optionName - The primary name of the option (e.g., '--verbose').
	 * @param {string[]} _aliases - An array of alternative names for the option (e.g., ['-v']).
	 * @param {string} _propertyName - The name of the property to set on the result object.
	 * @param {string} _description - A description of the option for help messages.
	 * @returns {CommandLineBooleanOption} The created boolean option.
	 */
	createBoolean(_optionName, _aliases, _propertyName, _description) {
		return this.createBooleanOption(_optionName, _aliases, _propertyName, _description);
	}
	
	/**
	 * @description Creates and adds a boolean command-line option.
	 * @param {string} _optionName - The primary name of the option (e.g., '--verbose').
	 * @param {string[]} _aliases - An array of alternative names for the option (e.g., ['-v']).
	 * @param {string} _propertyName - The name of the property to set on the result object.
	 * @param {string} _description - A description of the option for help messages.
	 * @returns {CommandLineBooleanOption} The created boolean option.
	 */
	createBooleanOption(_optionName, _aliases, _propertyName, _description) {
		this.id++;
		let option = new CommandLineBooleanOption(this.id, _optionName, _aliases, _propertyName, _description);
		this.optionsById.set(option.id, option);
		this.addCommandLineOption(option); // Also add to name/alias map
		return option;
	}

	/**
	 * @description Creates and adds a boolean array command-line option.
	 * Alias for {@link CommandLineOptions#createBooleanArrayOption}.
	 * @param {string} _optionName - The primary name of the option.
	 * @param {string[]} _aliases - An array of alternative names for the option.
	 * @param {string} _propertyName - The name of the property to set on the result object.
	 * @param {string} _description - A description of the option.
	 * @returns {CommandLineBooleanArrayOption} The created boolean array option.
	 */
	createBoolArray(_optionName, _aliases, _propertyName, _description) {
		return this.createBooleanArrayOption(_optionName, _aliases, _propertyName, _description);
	}

	/**
	 * @description Creates and adds a boolean array command-line option.
	 * Alias for {@link CommandLineOptions#createBooleanArrayOption}.
	 * @param {string} _optionName - The primary name of the option.
	 * @param {string[]} _aliases - An array of alternative names for the option.
	 * @param {string} _propertyName - The name of the property to set on the result object.
	 * @param {string} _description - A description of the option.
	 * @returns {CommandLineBooleanArrayOption} The created boolean array option.
	 */
	createBooleanArray(_optionName, _aliases, _propertyName, _description) {
		return this.createBooleanArrayOption(_optionName, _aliases, _propertyName, _description);
	}

	/**
	 * @description Creates and adds a boolean array command-line option.
	 * @param {string} _optionName - The primary name of the option.
	 * @param {string[]} _aliases - An array of alternative names for the option.
	 * @param {string} _propertyName - The name of the property to set on the result object.
	 * @param {string} _description - A description of the option.
	 * @returns {CommandLineBooleanArrayOption} The created boolean array option.
	 */
	createBooleanArrayOption(_optionName, _aliases, _propertyName, _description) {
		this.id++;
		let option = new CommandLineBooleanArrayOption(this.id, _optionName, _aliases, _propertyName, _description);
		this.optionsById.set(option.id, option);
		this.addCommandLineOption(option);
		return option;
	}

	/**
	 * @description Creates and adds an enumeration command-line option.
	 * Alias for {@link CommandLineOptions#createEnumerationOption}.
	 * @param {string} _optionName - The primary name of the option.
	 * @param {string[]} _aliases - An array of alternative names for the option.
	 * @param {string} _propertyName - The name of the property to set on the result object.
	 * @param {Class} enumerationClass - The class representing the enumeration.
	 * @param {string} _description - A description of the option.
	 * @returns {CommandLineEnumerationOption} The created enumeration option.
	 */
	createEnum(_optionName, _aliases, _propertyName, enumerationClass, _description) {
		return this.createEnumerationOption(_optionName, _aliases, _propertyName, enumerationClass, _description);
	}

	/**
	 * @description Creates and adds an enumeration command-line option.
	 * Alias for {@link CommandLineOptions#createEnumerationOption}.
	 * @param {string} _optionName - The primary name of the option.
	 * @param {string[]} _aliases - An array of alternative names for the option.
	 * @param {string} _propertyName - The name of the property to set on the result object.
	 * @param {Class} enumerationClass - The class representing the enumeration.
	 * @param {string} _description - A description of the option.
	 * @returns {CommandLineEnumerationOption} The created enumeration option.
	 */
	createEnumOption(_optionName, _aliases, _propertyName, enumerationClass, _description) {
		return this.createEnumerationOption(_optionName, _aliases, _propertyName, enumerationClass, _description);
	}

	/**
	 * @description Creates and adds an enumeration command-line option.
	 * Alias for {@link CommandLineOptions#createEnumerationOption}.
	 * @param {string} _optionName - The primary name of the option.
	 * @param {string[]} _aliases - An array of alternative names for the option.
	 * @param {string} _propertyName - The name of the property to set on the result object.
	 * @param {Class} enumerationClass - The class representing the enumeration.
	 * @param {string} _description - A description of the option.
	 * @returns {CommandLineEnumerationOption} The created enumeration option.
	 */
	createEnumeration(_optionName, _aliases, _propertyName, enumerationClass, _description) {
		return this.createEnumerationOption(_optionName, _aliases, _propertyName, enumerationClass, _description);
	}

	/**
	 * @description Creates and adds an enumeration command-line option.
	 * @param {string} _optionName - The primary name of the option.
	 * @param {string[]} _aliases - An array of alternative names for the option.
	 * @param {string} _propertyName - The name of the property to set on the result object.
	 * @param {Class} enumerationClass - The class representing the enumeration (should have static methods for validation/parsing).
	 * @param {string} _description - A description of the option.
	 * @returns {CommandLineEnumerationOption} The created enumeration option.
	 */
	createEnumerationOption(_optionName, _aliases, _propertyName, enumerationClass, _description) {
		this.id++;
		let option = new CommandLineEnumerationOption(this.id, _optionName, _aliases, _propertyName, enumerationClass, _description);
		this.optionsById.set(option.id, option);
		this.addCommandLineOption(option);
		return option;
	}

	/**
	 * @description Creates and adds a flag command-line option (an option that does not take a value).
	 * Alias for {@link CommandLineOptions#createFlagOption}.
	 * @param {string} _optionName - The primary name of the option.
	 * @param {string[]} _aliases - An array of alternative names for the option.
	 * @param {string} _propertyName - The name of the property to set on the result object (will be set to true if flag is present).
	 * @param {string} _description - A description of the option.
	 * @returns {CommandLineFlagOption} The created flag option.
	 */
	createFlag(_optionName, _aliases, _propertyName, _description) {
		return this.createFlagOption(_optionName, _aliases, _propertyName, _description);
	}

	/**
	 * @description Creates and adds a flag command-line option.
	 * @param {string} _optionName - The primary name of the option.
	 * @param {string[]} _aliases - An array of alternative names for the option.
	 * @param {string} _propertyName - The name of the property to set on the result object (will be set to true if flag is present).
	 * @param {string} _description - A description of the option.
	 * @returns {CommandLineFlagOption} The created flag option.
	 */
	createFlagOption(_optionName, _aliases, _propertyName, _description) {
		this.id++;
		let option = new CommandLineFlagOption(this.id, _optionName, _aliases, _propertyName, _description);
		this.optionsById.set(option.id, option);
		this.addCommandLineOption(option);
		return option;
	}

	/**
	 * @description Creates and adds a number command-line option.
	 * Alias for {@link CommandLineOptions#createNumberOption}.
	 * @param {string} _optionName - The primary name of the option.
	 * @param {string[]} _aliases - An array of alternative names for the option.
	 * @param {string} _propertyName - The name of the property to set on the result object.
	 * @param {string} _description - A description of the option.
	 * @returns {CommandLineNumberOption} The created number option.
	 */
	createNumber(_optionName, _aliases, _propertyName, _description) {
		return this.createNumberOption(_optionName, _aliases, _propertyName, _description);
	}

	/**
	 * @description Creates and adds a number command-line option.
	 * @param {string} _optionName - The primary name of the option.
	 * @param {string[]} _aliases - An array of alternative names for the option.
	 * @param {string} _propertyName - The name of the property to set on the result object.
	 * @param {string} _description - A description of the option.
	 * @returns {CommandLineNumberOption} The created number option.
	 */
	createNumberOption(_optionName, _aliases, _propertyName, _description) {
		this.id++;
		let option = new CommandLineNumberOption(this.id, _optionName, _aliases, _propertyName, _description);
		this.optionsById.set(option.id, option);
		this.addCommandLineOption(option);
		return option;
	}

	/**
	 * @description Creates and adds a number array command-line option.
	 * Alias for {@link CommandLineOptions#createNumberArrayOption}.
	 * @param {string} _optionName - The primary name of the option.
	 * @param {string[]} _aliases - An array of alternative names for the option.
	 * @param {string} _propertyName - The name of the property to set on the result object.
	 * @param {string} _description - A description of the option.
	 * @returns {CommandLineNumberArrayOption} The created number array option.
	 */
	createNumberArray(_optionName, _aliases, _propertyName, _description) {
		return this.createNumberArrayOption(_optionName, _aliases, _propertyName, _description);
	}

	/**
	 * @description Creates and adds a number array command-line option.
	 * @param {string} _optionName - The primary name of the option.
	 * @param {string[]} _aliases - An array of alternative names for the option.
	 * @param {string} _propertyName - The name of the property to set on the result object.
	 * @param {string} _description - A description of the option.
	 * @returns {CommandLineNumberArrayOption} The created number array option.
	 */
	createNumberArrayOption(_optionName, _aliases, _propertyName, _description) {
		this.id++;
		let option = new CommandLineNumberArrayOption(this.id, _optionName, _aliases, _propertyName, _description);
		this.optionsById.set(option.id, option);
		this.addCommandLineOption(option);
		return option;
	}

	/**
	 * @description Creates and adds an object command-line option (expects JSON string).
	 * Alias for {@link CommandLineOptions#createObjectOption}.
	 * @param {string} _optionName - The primary name of the option.
	 * @param {string[]} _aliases - An array of alternative names for the option.
	 * @param {string} _propertyName - The name of the property to set on the result object.
	 * @param {string} _description - A description of the option.
	 * @returns {CommandLineObjectOption} The created object option.
	 */
	createObject(_optionName, _aliases, _propertyName, _description) {
		return this.createObjectOption(_optionName, _aliases, _propertyName, _description);
	}

	/**
	 * @description Creates and adds an object command-line option (expects JSON string).
	 * @param {string} _optionName - The primary name of the option.
	 * @param {string[]} _aliases - An array of alternative names for the option.
	 * @param {string} _propertyName - The name of the property to set on the result object.
	 * @param {string} _description - A description of the option.
	 * @returns {CommandLineObjectOption} The created object option.
	 */
	createObjectOption(_optionName, _aliases, _propertyName, _description) {
		this.id++;
		let option = new CommandLineObjectOption(this.id, _optionName, _aliases, _propertyName, _description);
		this.optionsById.set(option.id, option);
		this.addCommandLineOption(option);
		return option;
	}

	/**
	 * @description Creates and adds an object array command-line option (expects array of JSON strings or multiple invocations).
	 * Alias for {@link CommandLineOptions#createObjectArrayOption}.
	 * @param {string} _optionName - The primary name of the option.
	 * @param {string[]} _aliases - An array of alternative names for the option.
	 * @param {string} _propertyName - The name of the property to set on the result object.
	 * @param {string} _description - A description of the option.
	 * @returns {CommandLineObjectArrayOption} The created object array option.
	 */
	createObjectArray(_optionName, _aliases, _propertyName, _description) {
		return this.createObjectArrayOption(_optionName, _aliases, _propertyName, _description);
	}

	/**
	 * @description Creates and adds an object array command-line option.
	 * @param {string} _optionName - The primary name of the option.
	 * @param {string[]} _aliases - An array of alternative names for the option.
	 * @param {string} _propertyName - The name of the property to set on the result object.
	 * @param {string} _description - A description of the option.
	 * @returns {CommandLineObjectArrayOption} The created object array option.
	 */
	createObjectArrayOption(_optionName, _aliases, _propertyName, _description) {
		this.id++;
		let option = new CommandLineObjectArrayOption(this.id, _optionName, _aliases, _propertyName, _description);
		this.optionsById.set(option.id, option);
		this.addCommandLineOption(option);
		return option;
	}

	/**
	 * @description Creates and adds a string command-line option.
	 * Alias for {@link CommandLineOptions#createStringOption}.
	 * @param {string} _optionName - The primary name of the option.
	 * @param {string[]} _aliases - An array of alternative names for the option.
	 * @param {string} _propertyName - The name of the property to set on the result object.
	 * @param {string} _description - A description of the option.
	 * @returns {CommandLineStringOption} The created string option.
	 */
	createString(_optionName, _aliases, _propertyName, _description) {
		return this.createStringOption(_optionName, _aliases, _propertyName, _description);
	}

	/**
	 * @description Creates and adds a string command-line option.
	 * @param {string} _optionName - The primary name of the option.
	 * @param {string[]} _aliases - An array of alternative names for the option.
	 * @param {string} _propertyName - The name of the property to set on the result object.
	 * @param {string} _description - A description of the option.
	 * @returns {CommandLineStringOption} The created string option.
	 */
	createStringOption(_optionName, _aliases, _propertyName, _description) {
		this.id++;
		let option = new CommandLineStringOption(this.id, _optionName, _aliases, _propertyName, _description);
		this.optionsById.set(option.id, option);
		this.addCommandLineOption(option);
		return option;
	}

	/**
	 * @description Creates and adds a string array command-line option.
	 * Alias for {@link CommandLineOptions#createStringArrayOption}.
	 * @param {string} _optionName - The primary name of the option.
	 * @param {string[]} _aliases - An array of alternative names for the option.
	 * @param {string} _propertyName - The name of the property to set on the result object.
	 * @param {string} _description - A description of the option.
	 * @returns {CommandLineStringArrayOption} The created string array option.
	 */
	createStringArray(_optionName, _aliases, _propertyName, _description) {
		return this.createStringArrayOption(_optionName, _aliases, _propertyName, _description);
	}

	/**
	 * @description Creates and adds a string array command-line option.
	 * @param {string} _optionName - The primary name of the option.
	 * @param {string[]} _aliases - An array of alternative names for the option.
	 * @param {string} _propertyName - The name of the property to set on the result object.
	 * @param {string} _description - A description of the option.
	 * @returns {CommandLineStringArrayOption} The created string array option.
	 */
	createStringArrayOption(_optionName, _aliases, _propertyName, _description) {
		this.id++;
		let option = new CommandLineStringArrayOption(this.id, _optionName, _aliases, _propertyName, _description);
		this.optionsById.set(option.id, option);
		this.addCommandLineOption(option);
		return option;
	}

	/**
	 * @description Parses the command-line arguments from `process.argv` based on the configured options.
	 * Populates an object with the parsed values.
	 * @param {object} [_result={}] - An optional object to populate with parsed options. If not provided, a new object is created.
	 * @returns {object} The object populated with parsed command-line option values.
	 */
	parse(_result) {
		if(Assert.isUndefinedOrNull(_result)) {
			_result = {};
		}
		// The first two items in the process.argv array are
		// the word node and the name of the application.
		// The 'real' arguments start at index 2.
		for(let index = 2;index < process.argv.length;index++) {
			let value = process.argv[index];
			if(value.startsWith('-')) {
				let normalizedValue = value.replace(/[_-\s]/g,'');
				normalizedValue = normalizedValue.toLowerCase();
				let option = this.optionsByName.get(normalizedValue);
				if(Assert.isUndefinedOrNull(option)) {
					// Unknown option, potentially pass to default handler or log warning
					if(this.defaultHandler) {
						index = this.defaultHandler(_result, index, value);
					} else {
						// console.warn(`Unknown option: ${value}`);
					}
					continue;
				}
				index = option.parse(_result, index);
			} else if(this.defaultHandler) {
				index = this.defaultHandler(_result, index, value);
			}
		}
		return _result;
	}

	/**
	 * @description Adds a handler for arguments that are not recognized as options (i.e., do not start with '-').
	 * @param {function(object, number, string): number} _handler - A function that will be called for each non-option argument.
	 * It receives the result object, the current argument index, and the argument value.
	 * It should return the updated argument index (e.g., if it consumed multiple arguments).
	 */
	addDefaultHandler(_handler) {
		this.defaultHandler = _handler;
	}
}
// Check if someone tried to run/execute this file.
if(Assert.isFileToExecute(canonicalName)) {
	Help.print(CommandLineOptions); // Assuming Help.print can take a class or metadata
	return;
}
module.exports = CommandLineOptions;
