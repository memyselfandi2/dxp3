/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-util
 *
 * NAME
 * Assert
 */
const packageName = 'dxp3-util';
const moduleName = 'Assert';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * @module dxp3-util/Assert
 */
class Assert {
	static isFileToExecute(canonicalName) {
		let fileToExecute = process.argv[1];
		return (fileToExecute.endsWith(canonicalName) ||
   		   		fileToExecute.endsWith(canonicalName + '.js'));
	}

	static isUndefinedOrNull(_value) {
		if(_value === undefined || _value === null) {
			return true;
		}
		return false;
	}

	static isUndefinedOrNullOrEmptyArray(_array) {
		if(_array === undefined || _array === null) {
			return true;
		}
		if(Array.isArray(_array) && _array.length <= 0) {
			return true;
		}
		return false;
	}

	static isUndefinedOrNullOrEmptyString(_string) {
		if(_string === undefined || _string === null) {
			return true;
		}
		if(_string.length <= 0) {
			return true;
		}
		return false;
	}

	static isUndefinedOrNullOrNotANumber(_number) {
		if(_number === undefined || _number === null) {
			return true;
		}
		if(typeof _number != 'number') {
			return true;
		}
		return false;
	}

	static isUndefinedOrNullOrNotAStringOrEmpty(_string) {
		if(_string === undefined || _string === null) {
			return true;
		}
		if(typeof _string != 'string') {
			return true;
		}
		_string = _string.trim();
		return _string.length <= 0;
	}
}
// Check if someone tried to run/execute this file.
if(Assert.isFileToExecute(canonicalName)) {
	console.log('Assert does not have a main(). Unable to execute.');
	return;
}

module.exports = Assert;