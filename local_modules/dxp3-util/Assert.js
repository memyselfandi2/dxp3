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
 * @description Provides assertion utility methods.
 */
class Assert {
	/**
	 * Checks if the current script being executed is this Assert module itself.
	 * @static
	 * @param {string} canonicalName - The canonical name of the module (e.g., 'packageName/moduleName').
	 * @returns {boolean} True if the script being executed is this module, false otherwise.
	 */
	static isFileToExecute(canonicalName) {
		let fileToExecute = process.argv[1];
		return (fileToExecute.endsWith(canonicalName) ||
   		   		fileToExecute.endsWith(canonicalName + '.js'));
	}

	/**
	 * Checks if a value is undefined or null.
	 * @static
	 * @param {*} _value - The value to check.
	 * @returns {boolean} True if the value is undefined or null, false otherwise.
	 */
	static isUndefinedOrNull(_value) {
		if(_value === undefined || _value === null) {
			return true;
		}
		return false;
	}

	/**
	 * Checks if an array is undefined, null, or empty.
	 * @static
	 * @param {Array<*>} _array - The array to check.
	 * @returns {boolean} True if the array is undefined, null, or empty, false otherwise.
	 */
	static isUndefinedOrNullOrEmptyArray(_array) {
		if(_array === undefined || _array === null) {
			return true;
		}
		if(Array.isArray(_array) && _array.length <= 0) {
			return true;
		}
		return false;
	}

	/**
	 * Checks if a string is undefined, null, or empty.
	 * @static
	 * @param {string} _string - The string to check.
	 * @returns {boolean} True if the string is undefined, null, or empty, false otherwise.
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
	 * Checks if a value is undefined, null, or not a number.
	 * @static
	 * @param {*} _number - The value to check.
	 * @returns {boolean} True if the value is undefined, null, or not a number, false otherwise.
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
	 * Checks if a string is undefined, null, not a string, or an empty string (after trimming).
	 * @static
	 * @param {*} _string - The value to check.
	 * @returns {boolean} True if the value is undefined, null, not a string, or an empty string (after trimming), false otherwise.
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