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
	/**
	 * @description TODO: Describe this method.
	 * @param {any} canonicalName - TODO: Describe parameter.
	 * @returns {boolean} TODO: Describe return value.
	 */
	static isFileToExecute(canonicalName) {
		let fileToExecute = process.argv[1];
		return (fileToExecute.endsWith(canonicalName) ||
   		   		fileToExecute.endsWith(canonicalName + '.js'));
	}

	/**
	 * @description TODO: Describe this method.
	 * @param {any} _value - TODO: Describe parameter.
	 * @returns {boolean} TODO: Describe return value.
	 */
	static isUndefinedOrNull(_value) {
		if(_value === undefined || _value === null) {
			return true;
		}
		return false;
	}

	/**
	 * @description TODO: Describe this method.
	 * @param {any} _array - TODO: Describe parameter.
	 * @returns {boolean} TODO: Describe return value.
	 */
	static isUndefinedOrNullOrEmptyArray(_array) {
		if(_array === undefined || _array === null) {
			return true;
		}
		if(_array.length <= 0) {
			return true;
		}
		return false;
	}

	/**
	 * @description TODO: Describe this method.
	 * @param {any} _string - TODO: Describe parameter.
	 * @returns {boolean} TODO: Describe return value.
	 */
	static isUndefinedOrNullOrEmptyString(_string) {
		if(_string === undefined || _string === null) {
			return true;
		}
		if(_string.length <= 0) {
			return true;
		}
		return false;
	}

	/**
	 * @description TODO: Describe this method.
	 * @param {any} _number - TODO: Describe parameter.
	 * @returns {boolean} TODO: Describe return value.
	 */
	static isUndefinedOrNullOrNotANumber(_number) {
		if(_number === undefined || _number === null) {
			return true;
		}
		if(typeof _number != 'number') {
			return true;
		}
		return false;
	}

	/**
	 * @description TODO: Describe this method.
	 * @param {any} _string - TODO: Describe parameter.
	 * @returns {boolean} TODO: Describe return value.
	 */
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