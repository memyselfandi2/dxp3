/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-net-http
 *
 * NAME
 * HTTPRequestQuery
 */
const packageName = 'dxp3-net-http';
const moduleName = 'HTTPRequestQuery';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
const util = require('dxp3-util');
/**
 * @module dxp3-net-http/HTTPRequestQuery
 */

/**
 * An HTTPRequestQuery parses and transforms a query string into an object.
 */
class HTTPRequestQuery {
	/**
	 * @function parse
	 *
	 * @param {String} queryAsString A String to be parsed/transformed to an object containing all the query values.
	 * @returns {Object} An object with all the different query parameters and their respective values.
	 */
	static parse(queryAsString) {
		let result = {};
		if(queryAsString === undefined || queryAsString === null) {
			queryAsString = '';
		}
		let state = HTTPRequestQuery.INITIALIZED;
		let arrayName = '';
		let propertyName = '';
		let property = null;
		let value = '';
		let read = '';
		let index = 0;
		let numberOfCharacters = queryAsString.length;
		while(index < numberOfCharacters) {
			let character = queryAsString.charAt(index);
			switch(state) {
				case HTTPRequestQuery.INITIALIZED:
					if(character === ' ') {
						break;
					}
					if(character === '?') {
						state = HTTPRequestQuery.PARSING_PARAMETER;
						propertyName = '';
						break;
					}
					state = HTTPRequestQuery.PARSING_PARAMETER;
					propertyName += character;
					break;
				case HTTPRequestQuery.PARSING_PARAMETER:
					if(character === '=') {
						state = HTTPRequestQuery.PARSING_VALUE;
						break;
					}
					if(character === '&') {
						result[propertyName] = true;
						propertyName = '';
						state = HTTPRequestQuery.PARSING_PARAMETER;
						break;
					}
					if(character === '[') {
						arrayName = propertyName;
						if(result[arrayName] === undefined || result[arrayName] === null) {
							result[arrayName] = {}
						}
						propertyName = '';
						state = HTTPRequestQuery.PARSING_ARRAY;
						break;
					}
					propertyName += character;
					break;
				case HTTPRequestQuery.PARSING_ARRAY:
					if(character === ']') {
						state = HTTPRequestQuery.PARSING_ARRAY_ASSIGNMENT;
						break;
					}
					propertyName += character;
					break;
				case HTTPRequestQuery.PARSING_ARRAY_ASSIGNMENT:
					if(character === ' ') {
						break;
					}
					if(character === '=') {
						state = HTTPRequestQuery.PARSING_ARRAY_VALUE;
						break;
					}
					if(character === '&') {
						result[arrayName][propertyName] = true;
						state = HTTPRequestQuery.PARSING_PARAMETER;
						break;
					}
					break;
				case HTTPRequestQuery.PARSING_ARRAY_VALUE:
					if(character === '&') {
						result[arrayName][propertyName] = value;
						arrayName = '';
						propertyName = '';
						value = '';
						state = HTTPRequestQuery.PARSING_PARAMETER;
						break;
					}
					value += character;
					break;
				case HTTPRequestQuery.PARSING_VALUE:
					if(character === '&') {
						result[propertyName] = value;
						propertyName = '';
						value = '';
						state = HTTPRequestQuery.PARSING_PARAMETER;
						break;
					}
					value += character;
					break;
			}
			index++;
		}
		switch(state) {
			case HTTPRequestQuery.PARSING_PARAMETER:
				result[propertyName] = true;
				break;
			case HTTPRequestQuery.PARSING_VALUE:
				result[propertyName] = value;
				break;			
		}
		return result;
	}

	static main() {
		let result = {};
		let commandLineOptions = new util.CommandLineOptions();
		commandLineOptions.addDefaultHandler(function(result, index, value) {
			if(index === 2) {
				result.query = value;
			}
			return index;
		});
		let commandLineOption = commandLineOptions.createFlag('help','info,information','help');
		commandLineOptions.add(commandLineOption);
		commandLineOption = commandLineOptions.createString('query',
															'url',
															'query');
		commandLineOptions.add(commandLineOption);
		result = commandLineOptions.parse(result);
        if(result.help) {
        	util.Help.print(this);
        	return;
        }
        let queryString = result.query;
		let query = HTTPRequestQuery.parse(queryString);
		console.log('Original query:' + queryString);
		console.log('Parsed query:');
		console.log(JSON.stringify(query));
	}
}
HTTPRequestQuery.INITIALIZED = 1;
HTTPRequestQuery.PARSING_PARAMETER = 2;
HTTPRequestQuery.PARSING_ARRAY = 3;
HTTPRequestQuery.PARSING_ARRAY_ASSIGNMENT = 4;
HTTPRequestQuery.PARSING_ARRAY_VALUE = 5;
HTTPRequestQuery.PARSING_VALUE = 6;

// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
	HTTPRequestQuery.main();
	return;
}

module.exports = HTTPRequestQuery;