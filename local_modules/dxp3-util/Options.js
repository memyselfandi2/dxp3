/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-util
 *
 * NAME
 * Options
 */
const packageName = 'dxp3-util';
const moduleName = 'Options';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * @module dxp3-util/Options
 */
const Assert = require('./Assert');
const Help = require('./Help');
/**
 * Represents a class that can hold various properties, with the added functionality
 * of defining aliases for these properties. This allows properties to be accessed
 * or set using different names.
 *
 * The class also provides static methods to create and populate instances from
 * a source object, performing some basic type coercion during the assignment.
 *
 * @example
 * class MyConfig extends Options {
 *   constructor() {
 *     super();
 *     this.port = 8080;
 *     this.addAlias('p, prt', 'port');
 *   }
 * }
 *
 * const configSource = { p: 3000, verbose: 'true' };
 * const myConfigInstance = MyConfig.assign(configSource);
 * console.log(myConfigInstance.port); // Output: 3000
 * console.log(myConfigInstance.p); // Output: 3000
 * // Assuming MyConfig has a 'verbose' property of type boolean
 * // console.log(myConfigInstance.verbose); // Output: true (as boolean)
 */
class Options {
	/**
	 * @description Initializes a new instance of the Options class.
	 * It sets up an internal map to store property aliases.
	 */
	constructor() {
		this._aliases = new Map();
	}
	/**
	 * @description Alias for {@link Options#addAlias}.
	 * @param {String|Array<String>} _aliases - A comma-separated string or an array of alias names.
	 * @param {String} _property - The name of the actual property to which the aliases should point.
	 */
	setAlias(_aliases, _property) {
		this.addAlias(_aliases, _property);
	}
	/**
	 * @description Alias for {@link Options#addAlias}.
	 * @param {String|Array<String>} _aliases - A comma-separated string or an array of alias names.
	 * @param {String} _property - The name of the actual property to which the aliases should point.
	 */
	setAliases(_aliases, _property) {
		this.addAlias(_aliases, _property);
	}
	/**
	 * @description Alias for {@link Options#addAlias}.
	 * @param {String|Array<String>} _aliases - A comma-separated string or an array of alias names.
	 * @param {String} _property - The name of the actual property to which the aliases should point.
	 */
	setAliasProperty(_aliases, _property) {
		this.addAlias(_aliases, _property);
	}
	/**
	 * @description Alias for {@link Options#addAlias}.
	 * @param {String|Array<String>} _aliases - A comma-separated string or an array of alias names.
	 * @param {String} _property - The name of the actual property to which the aliases should point.
	 */
	addAliases(_aliases, _property) {
		this.addAlias(_aliases, _property);
	}
	/**
	 * @description Alias for {@link Options#addAlias}.
	 * @param {String|Array<String>} _aliases - A comma-separated string or an array of alias names.
	 * @param {String} _property - The name of the actual property to which the aliases should point.
	 */
	addAliasProperty(_aliases, _property) {
		this.addAlias(_aliases, _property);
	}
	/**
	 * @description Adds one or more aliases for a specified property on this instance.
	 * When an alias is accessed or modified, it will effectively access or modify the original property.
	 *
	 * The alias strings are processed:
	 * - Trimmed of whitespace.
	 * - Converted to lowercase.
	 * - Special characters like underscores, hyphens, and spaces are removed.
	 *
	 * If an alias already exists (e.g., from a previous `addAlias` call or as an own property),
	 * it attempts to remove the existing property definition before defining the new alias
	 * using `Object.defineProperty`. This ensures the getter/setter mechanism for the alias works correctly.
	 *
	 * @param {String|Array<String>} _aliases - A comma-separated string or an array of alias names.
	 *                                        For example, "myAlias, anotherAlias" or ["myAlias", "anotherAlias"].
	 * @param {String} _property - The name of the actual property on this instance to which the aliases should point.
	 *                             This property should already exist or be planned to exist on the instance.
	 * @returns {void}
	 *
	 * @example
	 * this.username = "test";
	 * this.addAlias("user, usrName", "username");
	 * console.log(this.user); // "test"
	 * this.usrName = "newTest";
	 * console.log(this.username); // "newTest"
	 */
	addAlias(_aliases, _property) {
		// Defensive programming...check input...
		if(_aliases === undefined || _aliases === null) {
			return;
		}
		if(_property === undefined || _property === null) {
			return;
		}
		if(typeof _aliases === 'string') {
			_aliases = _aliases.trim().split(',');
		}
		if(!Array.isArray(_aliases)) {
			return;
		}
		for(let i=0;i < _aliases.length;i++) {
			let alias = _aliases[i];
			if(alias === undefined || alias === null) {
				continue;
			}
			alias = alias.trim();
			alias = alias.replace(/[_-\s]/g, '');
			if(alias.length <= 0) {
				continue;
			}
			alias = alias.toLowerCase();
			if(this._aliases.has(alias)) {
				// If an alias is being redefined, or if a property with the same name as the alias exists,
				// delete it to ensure Object.defineProperty can set up the getter/setter.
				delete Object[alias];
			}
			Object.defineProperty(this, alias, {
			    get: function() {
			        return this[_property];
			    },
			    set: function(value) {
			    	this[_property] = value;
			    },
			    configurable: true
			});
			this._aliases.set(alias, _property);
		}
	}
	/**
	 * @description Alias for {@link Options#hasAliasProperty}.
	 * @param {String} _alias - The alias name to check.
	 * @returns {Boolean} True if the alias is registered, false otherwise.
	 */
	hasAlias(_alias) {
		return this.hasAliasProperty(_alias);
	}
	/**
	 * @description Checks if a given alias string has been registered for any property.
	 * The input alias is normalized (trimmed, special characters removed, lowercased) before checking.
	 * @param {String} _alias - The alias name to check.
	 * @returns {Boolean} True if the alias is registered, false otherwise.
	 */
	hasAliasProperty(_alias) {
		if(_alias === undefined || _alias === null) {
			return false;
		}
		_alias = _alias.trim();
		_alias = _alias.replace(/[_-\s]/g, '');
		if(_alias.length <= 0) {
			return false;
		}
		_alias = _alias.toLowerCase();
		return this._aliases.has(_alias);
	}
	/**
	 * @description Retrieves the original property name for which a given alias was registered.
	 * The input alias is normalized (trimmed, special characters removed, lowercased) before lookup.
	 * @param {String} _alias - The alias name.
	 * @returns {String|null} The original property name, or null if the alias is not found or invalid.
	 */
	getAliasedProperty(_alias) {
		if(_alias === undefined || _alias === null) {
			return null;
		}
		_alias = _alias.trim();
		_alias = _alias.replace(/[_-\s]/g, '');
		if(_alias.length <= 0) {
			return null;
		}
		_alias = _alias.toLowerCase();
		return this._aliases.get(_alias);
	}
	/**
	 * @description Retrieves all registered alias names for a given original property name.
	 * @param {String} _property - The original property name.
	 * @returns {Array<String>} An array of alias names associated with the property.
	 *                          Returns an empty array if the property is not found or has no aliases.
	 */
	getPropertyAlias(_property) {
		let result = [];
		if(_property === undefined || _property === null) {
			return result;
		}
		for(let [alias, property] of this._aliases) {
			if(property === _property) {
				result.push(alias);
			}
		}
		return result;
	}
	/**
	 * @description Alias for {@link Options#getPropertyAlias}.
	 * @param {String} _property - The original property name.
	 * @returns {Array<String>} An array of alias names associated with the property.
	 */
	getPropertyAliases(_property) {
		return this.getPropertyAlias(_property);
	}
	/**
	 * @description Static factory method. Alias for {@link Options.assign}.
	 * Creates a new instance of the calling class (which should be `Options` or a subclass)
	 * and populates it with properties from the `_args` object.
	 * @static
	 * @param {Object} [_args] - The source object whose properties will be copied to the new instance.
	 * @returns {Options|null} A new, populated instance of the calling class, or null if instantiation fails.
	 */
	static new(_args) {
		return this.assign(_args);
	}
	/**
	 * @description Static factory method. Alias for {@link Options.assign}.
	 * Creates a new instance of the calling class (which should be `Options` or a subclass)
	 * and populates it with properties from the `_args` object.
	 * @static
	 * @param {Object} [_args] - The source object whose properties will be copied to the new instance.
	 * @returns {Options|null} A new, populated instance of the calling class, or null if instantiation fails.
	 */
	static create(_args) {
		return this.assign(_args);
	}
	/**
	 * @description Static factory method. Alias for {@link Options.assign}.
	 * Creates a new instance of the calling class (which should be `Options` or a subclass)
	 * and populates it with properties from the `_args` object.
	 * The name "concat" might be misleading here as it primarily assigns/merges properties.
	 * @static
	 * @param {Object} [_args] - The source object whose properties will be copied to the new instance.
	 * @returns {Options|null} A new, populated instance of the calling class, or null if instantiation fails.
	 */
	static concat(_args) {
		return this.assign(_args);
	}
	/**
	 * @description Static factory method. Alias for {@link Options.assign}.
	 * Creates a new instance of the calling class (which should be `Options` or a subclass)
	 * and populates it with properties from the `_args` object.
	 * @static
	 * @param {Object} [_args] - The source object whose properties will be copied to the new instance.
	 * @returns {Options|null} A new, populated instance of the calling class, or null if instantiation fails.
	 */
	static instance(_args) {
		return this.assign(_args);
	}
	/**
	 * @description Static factory method. Alias for {@link Options.assign}.
	 * Creates a new instance of the calling class (which should be `Options` or a subclass)
	 * and populates it with properties from the `_args` object.
	 * @static
	 * @param {Object} [_args] - The source object whose properties will be copied to the new instance.
	 * @returns {Options|null} A new, populated instance of the calling class, or null if instantiation fails.
	 */
	static merge(_args) {
		return this.assign(_args);
	}
	/**
	 * @description Static factory method. Alias for {@link Options.assign}.
	 * Creates a new instance of the calling class (which should be `Options` or a subclass)
	 * and populates it with properties from the `_args` object.
	 * @static
	 * @param {Object} [_args] - The source object whose properties will be copied to the new instance.
	 * @returns {Options|null} A new, populated instance of the calling class, or null if instantiation fails.
	 */
	static newInstance(_args) {
		return this.assign(_args);
	}
	/**
	 * @description Static factory method. Alias for {@link Options.assign}.
	 * Creates a new instance of the calling class (which should be `Options` or a subclass)
	 * and populates it with properties from the `_args` object.
	 * @static
	 * @param {Object} [_args] - The source object whose properties will be copied to the new instance.
	 * @returns {Options|null} A new, populated instance of the calling class, or null if instantiation fails.
	 */
	static parse(_args) {
		return this.assign(_args);
	}
	/**
	 * @description Creates a new instance of the calling class (which should be `Options` or a subclass of `Options`)
	 * and assigns properties to it from a given `_sourceInstance` object.
	 *
	 * This method iterates over the properties of `_sourceInstance`. For each property, it attempts to find
	 * a corresponding property (either by direct name match or by a registered alias) on the new `targetInstance`.
	 * If a match is found, it assigns the value, performing type coercion where applicable:
	 * - If types match (or both are arrays), assigns directly.
	 * - If target is an array and source is a string, splits the string by comma into an array.
	 * - If target is a number and source is a string, parses the string to an integer.
	 * - If target is a boolean and source is a string, converts "true", "on", "yes" (case-insensitive) to `true`, otherwise `false`.
	 * - If target is an object (and currently null) and source is a string or array, assigns directly.
	 *
	 * The internal `_aliases` property is ignored during this process.
	 *
	 * @static
	 * @param {Object} [_sourceInstance] - The object from which to copy properties. If undefined or null,
	 *                                   a new, unpopulated instance of the target class is returned.
	 * @returns {Options|null} A new instance of the calling class, populated with properties from `_sourceInstance`,
	 *                         or `null` if the calling class cannot be instantiated or is not an `Options` subclass.
	 *                         Returns an empty instance if `_sourceInstance` is not provided.
	 */
	static assign(_sourceInstance) {
		let targetClass = this.name;
		// Defensive programming...check input...
		if(targetClass === undefined || targetClass === null) {
			return null;
		}
		let targetInstance = new this();
		// Ensure the created instance is indeed an Options instance (or subclass)
		// This check is important if 'this' refers to a class that doesn't inherit from Options.
		if(!(targetInstance instanceof Options)) {
			return null;
		}
		if(_sourceInstance === undefined || _sourceInstance === null) {
			return targetInstance;
		}
		for (let property in _sourceInstance) {
			// ignore the aliases property...
			// This prevents trying to copy the internal _aliases map itself.
			if(property === '_aliases') {
				continue;
			}
			let foundProperty = targetInstance.hasOwnProperty(property);
			let originalTargetPropertyName = property; // Keep track of original name for assignment
			if(!foundProperty) {
				foundProperty = targetInstance.hasAliasProperty(property);
				// If the source property name is an alias on the target, get the real property name.
				if(!foundProperty) {
					continue;
				}
				property = targetInstance.getAliasedProperty(property);
			}
			let sourceInstancePropertyValue = _sourceInstance[property];
			let argumentType = typeof sourceInstancePropertyValue;
			let targetInstanceType = typeof targetInstance[originalTargetPropertyName];

			// Direct type match or both are arrays
			if(argumentType === targetInstanceType) {
				targetInstance[originalTargetPropertyName] = sourceInstancePropertyValue;
				continue;
			}
			let targetInstanceIsArray = Array.isArray(targetInstance[originalTargetPropertyName]);
			let argumentIsArray = Array.isArray(sourceInstancePropertyValue);

			if(targetInstanceIsArray && argumentIsArray) {
				targetInstance[originalTargetPropertyName] = sourceInstancePropertyValue;
				continue;
			} else if(targetInstanceIsArray && argumentType === 'string') {
				// Convert comma-separated string to array for target array properties
				targetInstance[originalTargetPropertyName] = sourceInstancePropertyValue.split(',');
				continue;
			} else if(targetInstanceType === 'object' && argumentIsArray) {
				// If target is an object (e.g. expecting a generic object) and source is an array
				let value = targetInstance[originalTargetPropertyName];
				if(value === null) {
					targetInstance[originalTargetPropertyName] = sourceInstancePropertyValue;
					continue;
				}
			}
			// String to Number conversion
			if(argumentType === 'string' && targetInstanceType === 'number') {
				let value = parseInt(sourceInstancePropertyValue);
				if(isNaN(value)) {
					continue;
				}
				targetInstance[originalTargetPropertyName] = value;
				continue;
			}
			// String to Boolean conversion
			if(argumentType === 'string' && targetInstanceType === 'boolean') {
				let value = sourceInstancePropertyValue;
				value = value.trim().toLowerCase();
				if(value === 'true' || value === 'on' || value === 'yes') {
					targetInstance[originalTargetPropertyName] = true;
				} else {
					targetInstance[originalTargetPropertyName] = false;
				}
				continue;
			}
			// String to Object (if target object is null)
			if(argumentType === 'string' && targetInstanceType === 'object') {
				let value = targetInstance[originalTargetPropertyName];
				if(value === null) {
					targetInstance[originalTargetPropertyName] = sourceInstancePropertyValue;
				}
				continue;
			}
		}
		return targetInstance;
	}
}
// Check if someone tried to run/execute this file.
if(Assert.isFileToExecute(canonicalName)) {
	Help.print(Options);
	return;
}
module.exports = Options;