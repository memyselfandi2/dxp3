/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-util
 *
 * NAME
 * CommandLineNumberArrayOption
 */
const packageName = 'dxp3-util';
const moduleName = 'CommandLineNumberArrayOption';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * @module dxp3-util/CommandLineNumberArrayOption
 */
const Assert = require('./Assert');
const CommandLineError = require('./CommandLineError');
const CommandLineOption = require('./CommandLineOption');
const Help = require('./Help');

class CommandLineNumberArrayOption extends CommandLineOption {
	constructor(id, name, aliases, propertyName, description) {
		super(id, name, aliases, propertyName, description);
	}

	parse(_result, _index) {
		if(_result === undefined || _result === null) {
			throw CommandLineError.ILLEGAL_ARGUMENT;
		}
		if(this.handler != undefined && this.handler != null) {
			return this.handler(_result,_index,this.propertyName);
		}
		_index++;
		if(_index < process.argv.length) {
			let values = process.argv[_index];
			let currentArray = _result[this.propertyName];
			if(currentArray === undefined || currentArray === null) {
				currentArray = [];
			}
			values = values.trim().split(',');
			for(let i=0;i < values.length;i++) {
				let value = values[i];
				value = value.trim().toLowerCase();
				value = parseInt(value);
				if(isNaN(value)) {
					continue;
				}
				currentArray.push(value);
			}
			_result[this.propertyName] = currentArray;
		}
		return _index;
	}
}
// Check if someone tried to run/execute this file.
if(Assert.isFileToExecute(canonicalName)) {
	Help.print(CommandLineNumberArrayOption);
	return;
}
module.exports = CommandLineNumberArrayOption;