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

	constructor() {
		this._aliases = new Map();
	}

	setAlias(_aliases, _property) {
		this.addAlias(_aliases, _property);
	}

	setAliases(_aliases, _property) {
		this.addAlias(_aliases, _property);
	}

	setAliasProperty(_aliases, _property) {
		this.addAlias(_aliases, _property);
	}

	addAliases(_aliases, _property) {
		this.addAlias(_aliases, _property);
	}

	addAliasProperty(_aliases, _property) {
		this.addAlias(_aliases, _property);
	}

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

	hasAlias(_alias) {
		return this.hasAliasProperty(_alias);
	}

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

	getPropertyAliases(_property) {
		return this.getPropertyAlias(_property);
	}

	static new(_args) {
		return this.assign(_args);
	}

	static create(_args) {
		return this.assign(_args);
	}

	static concat(_args) {
		return this.assign(_args);
	}

	static instance(_args) {
		return this.assign(_args);
	}

	static merge(_args) {
		return this.assign(_args);
	}

	static newInstance(_args) {
		return this.assign(_args);
	}

	static parse(_args) {
		return this.assign(_args);
	}

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
				value = value.trim.toLowerCase();
				if(value === 'true' || value === 'on' || value === 'yes') {
					targetInstance[property] = true;
				} else {
					targetInstance[proprty] = false;
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