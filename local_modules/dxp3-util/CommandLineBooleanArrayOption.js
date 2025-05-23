/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-util
 *
 * NAME
 * CommandLineBooleanArrayOption
 */
const packageName = 'dxp3-util';
const moduleName = 'CommandLineBooleanArrayOption';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * @module dxp3-util/CommandLineBooleanArrayOption
 */
const Assert = require('./Assert');
const CommandLineError = require('./CommandLineError');
const CommandLineOption = require('./CommandLineOption');
const Help = require('./Help');
/**
 * <p>A CommandLineBooleanArrayOption represents a -<option name> comma separated booleans on the command line.</p>
 */
class CommandLineBooleanArrayOption extends CommandLineOption {
	constructor(id, name, aliases, propertyName, description) {
		super(id, name, aliases, propertyName, description);
	}
	/**
	 * @override
	 */
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
				switch(value) {
					case 'yes':
					case 'true':
					case 'on':
						currentArray.push(true);
						break;
					default:
						currentArray.push(false);
				}
			}
			_result[this.propertyName] = currentArray;
		}
		return _index;
	}
}
// Check if someone tried to run/execute this file.
if(Assert.isFileToExecute(canonicalName)) {
	Help.print(CommandLineBooleanArrayOption);
	return;
}
module.exports = CommandLineBooleanArrayOption;