const RestMethodType = require('./RestMethodType');

class RestMethodParameter {

	constructor(_type, _name, _isOptional) {
		this.type = RestMethodType.parse(_type);
		this.name = _name;
		this.isOptional = _isOptional;
	}

	parseArgument(argument) {
		if(this.isOptional) {
			if(argument === undefined || argument === null) {
				return null;
			}
		} else if(argument === undefined) {
			throw new Error('Undefined mandatory argument');
		} else if(argument === null) {
			return null;
		}
		switch(this.type) {
			case RestMethodType.ARRAY_BOOLEAN:
				if(typeof argument === 'string') {
					argument = argument.split(',');
				}
				if(!Array.isArray(argument)) {
					throw new Error('Not an array<boolean>');
				}
				for(let i=0;i < argument.length;i++) {
					let item = argument[i];
					if(item === undefined || item === null) {
						throw new Error('Undefined or null in array<boolean>')
					}
					if(typeof item === 'string') {
						item = item.trim().toLowerCase();
						if(item === 'true' || item === 'yes' || item === 'on') {
							item = true;
						} else if(item === 'false' || item === 'no' || item === 'off') {
							item = false;
						} else {
							throw new Error('Not a boolean in array<boolean>');
						}
					}
					if(typeof item != 'boolean') {
						throw new Error('Not a boolean in array<boolean>');
					}
					argument[i] = item;
				}
				break;
			case RestMethodType.ARRAY_NUMBER:
				if(typeof argument === 'string') {
					argument = argument.split(',');
				}
				if(!Array.isArray(argument)) {
					throw new Error('Not an array<number>');
				}
				for(let i=0;i < argument.length;i++) {
					let item = argument[i];
					if(item === undefined || item === null) {
						throw new Error('Undefined or null in array<number>')
					}
					if(typeof item === 'string') {
						item = parseInt(item);
					}
					if(isNaN(item)) {
						throw new Error('Not a number in array<number>')
					}
					argument[i] = item;
				}
				break;
			case RestMethodType.ARRAY_OBJECT:
				if(typeof argument === 'string') {
					argument = argument.split(',');
				}
				if(!Array.isArray(argument)) {
					throw new Error('Not an array<object>');
				}
				for(let i=0;i < argument.length;i++) {
					let item = argument[i];
					if(item === undefined) {
						item = null;
					}
					if(typeof item === 'string') {
						try {
							item = JSON.parse(item);
						} catch(exception) {
							throw new Error('Not an object in array<object>')
						}
					}
					if(typeof item != object) {
						throw new Error('Not an object in array<object>')
					}
					argument[i] = item;
				}
				break;
			case RestMethodType.ARRAY_STRING:
				if(typeof argument === 'string') {
					argument = argument.split(',');
				}
				if(!Array.isArray(argument)) {
					throw new Error('Not an array<string>');
				}
				for(let i=0;i < argument.length;i++) {
					let item = argument[i];
					if(item === undefined) {
						item = null;
					}
					if(item != null) {
						if(typeof item != 'string') {
							throw new Error('Not a string in array<string>')
						}
					}
					argument[i] = item;
				}
				break;
			case RestMethodType.BOOLEAN:
				if(typeof argument === 'string') {
					argument = argument.trim().toLowerCase();
					if(argument === 'true' || argument === 'yes' || argument === 'on') {
						argument = true;
					} else if(argument === 'false' || argument === 'no' || argument === 'off') {
						argument = false;
					} else if(argument.length <= 0) {
						argument = false;
					} else {
						throw new Error('Not a boolean');
					}
				}
				if(typeof argument != 'boolean') {
					throw new Error('Not a boolean');					
				}
				break;
			case RestMethodType.FILE:
				break;
			case RestMethodType.NUMBER:
				if(typeof argument === 'string') {
					argument = parseInt(argument);
				}
				if(isNaN(argument)) {
					throw new Error('Not a number');
				}
				break;
			case RestMethodType.OBJECT:
				if(typeof argument === 'string') {
					argument = argument.trim();
					if(argument.length <= 0) {
						return null;
					}
					try {
						argument = JSON.parse(argument);
					} catch(exception) {
						throw new Error('Not an object');
					}
				}
				if(typeof argument != 'object') {
					throw new Error('Not an object');
				}
				break;
			case RestMethodType.STRING:
				if(typeof argument != 'string') {
					throw new Error('Not a string, but a ' + (typeof argument) + ': ' + argument);
				}
				break;
		}
		return argument;
	}

	toString() {
		if(this.isOptional) {
			return '[' + this.type + ' ' + this.name + ']';
		}
		return this.type + ' ' + this.name;
	}

	static parse(parameterAsString) {
		let isOptional = false;
		parameterAsString = parameterAsString.trim();
		if(parameterAsString.startsWith('[')) {
			isOptional = true;
			parameterAsString = parameterAsString.substring(1, parameterAsString.length - 1);
		}
		// console.log('parsing: ' + parameterAsString);
		let parts = parameterAsString.split(' ');
		let type = parts[0].trim();
		let name = parts[1].trim();
		let result = new RestMethodParameter(type, name, isOptional);
		return result;
	}
}

module.exports = RestMethodParameter;