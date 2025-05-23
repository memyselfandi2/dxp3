/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-util
 *
 * NAME
 * CommandLineEnumerationOption
 */
const packageName = 'dxp3-util';
const moduleName = 'CommandLineEnumerationOption';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * @module dxp3-util/CommandLineEnumerationOption
 */
const Assert = require('./Assert');
const CommandLineError = require('./CommandLineError');
const CommandLineOption = require('./CommandLineOption');
const Help = require('./Help');
/**
 * <p>A CommandLineOption represents a -<option name> value entry on the command line.</p>
 *
 * @property {Number} id
 * @property {String} name
 * @property {Array} aliases
 * @property {String} propertyName
 * @property {Class} EnumerationClass
 * @property {String} description
 * @extends CommandLineOption
 */
class CommandLineEnumerationOption extends CommandLineOption {
	/**
	 * @param {Number} id
	 * @param {String} name
	 * @param {Array|String} aliases
	 * @param {String} propertyName
	 * @param {Class} _EnumerationClass
	 * @param {String} description
	 */
	constructor(id, name, aliases, propertyName, _EnumerationClass, description) {
		super(id, name, aliases, propertyName, description);
		this.EnumerationClass = _EnumerationClass;
	}
	/**
	 * @override
	 */
	parse(_result, _index) {
		if(_result === undefined || _result === null) {
			throw CommandLineError.ILLEGAL_ARGUMENT;
		}
		if(this.handler != undefined && this.handler != null) {
			return this.handler(_result, _index, this.propertyName);
		}
		_index++;
		if(_index < process.argv.length) {
			let value = process.argv[_index];
			try {
				let enumerationValue = this.EnumerationClass.parse(value);
				_result[this.propertyName] = enumerationValue;
			} catch(exception) {
				throw new CommandLineError('Unable to parse enumeration value: ' + value)
			}
		}
		return _index;
	}
}
// Check if someone tried to run/execute this file.
if(Assert.isFileToExecute(canonicalName)) {
	Help.print(CommandLineEnumerationOption);
	return;
}
module.exports = CommandLineEnumerationOption;