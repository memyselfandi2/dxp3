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

class Options {

	/**
	 * @description TODO: Describe this method.
	 */
	constructor() {
		this._aliases = new Map();
	}

	/**
	 * @description TODO: Describe this method.
	 * @param {Array|string} _aliases - TODO: Describe parameter.
	 * @param {string} _property - TODO: Describe parameter.
	 */
	setAlias(_aliases, _property) {
		this.addAlias(_aliases, _property);
	}

	/**
	 * @description TODO: Describe this method.
	 * @param {Array|string} _aliases - TODO: Describe parameter.
	 * @param {string} _property - TODO: Describe parameter.
	 */
	setAliases(_aliases, _property) {
		this.addAlias(_aliases, _property);
	}

	/**
	 * @description TODO: Describe this method.
	 * @param {Array|string} _aliases - TODO: Describe parameter.
	 * @param {string} _property - TODO: Describe parameter.
	 */
	setAliasProperty(_aliases, _property) {
		this.addAlias(_aliases, _property);
	}

	/**
	 * @description TODO: Describe this method.
	 * @param {Array|string} _aliases - TODO: Describe parameter.
	 * @param {string} _property - TODO: Describe parameter.
	 */
	addAliases(_aliases, _property) {
		this.addAlias(_aliases, _property);
	}

	/**
	 * @description TODO: Describe this method.
	 * @param {Array|string} _aliases - TODO: Describe parameter.
	 * @param {string} _property - TODO: Describe parameter.
	 */
	addAliasProperty(_aliases, _property) {
		this.addAlias(_aliases, _property);
	}

	/**
	 * @description TODO: Describe this method.
	 * @param {Array|string} _aliases - TODO: Describe parameter.
	 * @param {string} _property - TODO: Describe parameter.
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
	 * @description TODO: Describe this method.
	 * @param {string} _alias - TODO: Describe parameter.
	 * @returns {boolean} TODO: Describe return value.
	 */
	hasAlias(_alias) {
		return this.hasAliasProperty(_alias);
	}

	/**
	 * @description TODO: Describe this method.
	 * @param {string} _alias - TODO: Describe parameter.
	 * @returns {boolean} TODO: Describe return value.
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
	 * @description TODO: Describe this method.
	 * @param {string} _alias - TODO: Describe parameter.
	 * @returns {any} TODO: Describe return value.
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
	 * @description TODO: Describe this method.
	 * @param {string} _property - TODO: Describe parameter.
	 * @returns {Array} TODO: Describe return value.
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
	 * @description TODO: Describe this method.
	 * @param {string} _property - TODO: Describe parameter.
	 * @returns {Array} TODO: Describe return value.
	 */
	getPropertyAliases(_property) {
		return this.getPropertyAlias(_property);
	}

	/**
	 * @description TODO: Describe this method.
	 * @param {object} _args - TODO: Describe parameter.
	 * @returns {any} TODO: Describe return value.
	 */
	static new(_args) {
		return this.assign(_args);
	}

	/**
	 * @description TODO: Describe this method.
	 * @param {object} _args - TODO: Describe parameter.
	 * @returns {any} TODO: Describe return value.
	 */
	static create(_args) {
		return this.assign(_args);
	}

	/**
	 * @description TODO: Describe this method.
	 * @param {object} _args - TODO: Describe parameter.
	 * @returns {any} TODO: Describe return value.
	 */
	static concat(_args) {
		return this.assign(_args);
	}

	/**
	 * @description TODO: Describe this method.
	 * @param {object} _args - TODO: Describe parameter.
	 * @returns {any} TODO: Describe return value.
	 */
	static instance(_args) {
		return this.assign(_args);
	}

	/**
	 * @description TODO: Describe this method.
	 * @param {object} _args - TODO: Describe parameter.
	 * @returns {any} TODO: Describe return value.
	 */
	static merge(_args) {
		return this.assign(_args);
	}

	/**
	 * @description TODO: Describe this method.
	 * @param {object} _args - TODO: Describe parameter.
	 * @returns {any} TODO: Describe return value.
	 */
	static newInstance(_args) {
		return this.assign(_args);
	}

	/**
	 * @description TODO: Describe this method.
	 * @param {object} _args - TODO: Describe parameter.
	 * @returns {any} TODO: Describe return value.
	 */
	static parse(_args) {
		return this.assign(_args);
	}

	/**
	 * @description TODO: Describe this method.
	 * @param {object} _sourceInstance - TODO: Describe parameter.
	 * @returns {any} TODO: Describe return value.
	 */
	static assign(_sourceInstance) {
		let targetClass = this.name;
		// Defensive programming...check input...
		if(targetClass === undefined || targetClass === null) {
			return null;
		}
		let targetInstance = new this();
		if(!(targetInstance instanceof Options)) {
			return null;
		}
		if(_sourceInstance === undefined || _sourceInstance === null) {
			return targetInstance;
		}
		for (let property in _sourceInstance) {
			// ignore the aliases property...
			if(property === '_aliases') {
				continue;
			}
			let foundProperty = targetInstance.hasOwnProperty(property);
			if(!foundProperty) {
				foundProperty = targetInstance.hasAliasProperty(property);
				if(!foundProperty) {
					continue;
				}
				property = targetInstance.getAliasedProperty(property);
			}
			let sourceInstancePropertyValue = _sourceInstance[property];
			let argumentType = typeof sourceInstancePropertyValue;
			let targetInstanceType = typeof targetInstance[property];
			if(argumentType === targetInstanceType) {
				targetInstance[property] = sourceInstancePropertyValue;
				continue;
			}
			let targetInstanceIsArray = Array.isArray(targetInstance[property]);
			let argumentIsArray = Array.isArray(sourceInstancePropertyValue);
			if(targetInstanceIsArray && argumentIsArray) {
				targetInstance[property] = sourceInstancePropertyValue;
				continue;
			} else if(targetInstanceIsArray && argumentType === 'string') {
				targetInstance[property] = sourceInstancePropertyValue.split(',');
				continue;
			} else if(targetInstanceType === 'object' && argumentIsArray) {
				let value = targetInstance[property];
				if(value === null) {
					targetInstance[property] = sourceInstancePropertyValue;
					continue;
				}
			}
			if(argumentType === 'string' && targetInstanceType === 'number') {
				let value = parseInt(sourceInstancePropertyValue);
				if(isNaN(value)) {
					continue;
				}
				targetInstance[property] = value;
				continue;
			}
			if(argumentType === 'string' && targetInstanceType === 'boolean') {
				let value = sourceInstancePropertyValue;
				value = value.trim().toLowerCase(); // Corrected: .toLowerCase()
				if(value === 'true' || value === 'on' || value === 'yes') {
					targetInstance[property] = true;
				} else {
					targetInstance[property] = false; // Corrected: targetInstance[property]
				}
				continue;
			}
			if(argumentType === 'string' && targetInstanceType === 'object') {
				let value = targetInstance[property];
				if(value === null) {
					targetInstance[property] = sourceInstancePropertyValue;
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