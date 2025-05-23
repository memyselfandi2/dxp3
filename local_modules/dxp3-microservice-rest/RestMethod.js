const RestMethodParameter = require('./RestMethodParameter');
const RestMethodType = require('./RestMethodType');

class RestMethod {

	constructor(_name, _parameters, _returnType) {
		this.name = _name;
		this.parameters = [];
		this.hasFileParameter = false;
		if(_parameters === undefined || _parameters === null) {
			_parameters = [];
		} else if(typeof _parameters === 'string') {
			_parameters = _parameters.split(',');
		} else if(_parameters instanceof RestMethodParameter) {
			_parameters = [_parameters];			
		}
		if(Array.isArray(_parameters)) {
			for(let i=0;i < _parameters.length;i++) {
				let parameter = _parameters[i];
				if(typeof parameter === 'string') {
					parameter = parameter.trim();
					if(parameter.length <= 0) {
						continue;
					}
					parameter = RestMethodParameter.parse(parameter);
				}
				if(parameter === undefined || parameter === null) {
					continue;
				}
				this.parameters.push(parameter);
				if(parameter.type === RestMethodType.FILE) {
					this.hasFileParameter = true;
				}
			}
		}
		this.returnType = RestMethodType.parse(_returnType);
	}

	parseArguments(argumentsArray) {
		let result = [];
		for(let i=0;i < this.parameters.length;i++) {
			let parameter = this.parameters[i];
			let argument = argumentsArray[i];
			argument = parameter.parseArgument(argument);
			result.push(argument);
		}
		return result;
	}

	toString() {
		let result = this.returnType;
		result += ' ';
		result += this.name;
		result += '(';
		for(let i=0;i < this.parameters.length;i++) {
			result += this.parameters[i].toString();
			if(i < (this.parameters.length - 1)) {
				result += ',';
			}
		}
		result += ')';
		return result;
	}

	static parse(restMethod) {
		// Defensive programming...check input...
		if(restMethod === undefined || restMethod === null) {
			return null;
		}
		let name = null;
		let parameters = null;
		let returnType = null;
		if(typeof restMethod === 'object') {
			name = restMethod.name;
			returnType = restMethod.returntype;
			parameters = restMethod.parameters;
		} else if(typeof restMethod === 'string') {
			let restMethodAsString = restMethod.trim();
			if(restMethodAsString.length <= 0) {
				return null;
			}
			let indexOfFirstSpace = restMethodAsString.indexOf(' ');
			if(indexOfFirstSpace < 0) {
				// If there is no space, this is a method name only.
				name = restMethodAsString;
			// console.log('restmethod.parse 2: ' + name);
			} else {
				returnType = restMethodAsString.substring(0, indexOfFirstSpace);
				let indexOfOpen = restMethodAsString.indexOf('(');
				name = restMethodAsString.substring(indexOfFirstSpace + 1, indexOfOpen);
				parameters = restMethodAsString.substring(indexOfOpen + 1, restMethodAsString.length - 1);
			}
		} else {
			return null;
		}
		return new RestMethod(name, parameters, returnType);
	}
}

module.exports = RestMethod;