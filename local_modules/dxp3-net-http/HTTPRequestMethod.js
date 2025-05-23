/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-net-http
 *
 * NAME
 * HTTPRequestMethod
 */
const packageName = 'dxp3-net-http';
const moduleName = 'HTTPRequestMethod';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
// Check if someone tried to run/execute this file.
const util = require('dxp3-util');
if(util.Assert.isFileToExecute(canonicalName)) {
    util.Help.print();
    return;
}
/**
 * A collection of different HTTP request methods.
 *
 * @module dxp3-net-http/HTTPRequestMethods
 */

// We throw a HTTPError when we are unable to parse/tranform a String
// to a valid HTTPRequestMethod value.
const HTTPError = require('./HTTPError');

// The actual enumeration object
const HTTPRequestMethod = {
	/** @member {String} CONNECT */
	CONNECT: 'CONNECT',
	/** @member {String} DELETE */
	DELETE: 'DELETE',
	/** @member {String} GET */
	GET: 'GET',
	/** @member {String} HEAD */
	HEAD: 'HEAD',
	/** @member {String} OPTIONS */
	OPTIONS: 'OPTIONS',
	/** @member {String} PATCH */
	PATCH: 'PATCH',
	/** @member {String} POST */
	POST: 'POST',
	/** @member {String} PUT */
	PUT: 'PUT',
	/** @member {String} TRACE */
	TRACE: 'TRACE',
	/**
	 * @function parse
	 *
	 * @param {String} httpRequestMethodAsString A String to be parsed/transformed to a HTTPRequestMethod value.
	 * @returns {String} A String representing a HTTPRequestMethod.
	 * @throws {module:dxp3-net-http/HTTPError~HTTPError}
	 * When the supplied parameter is undefined, null, not a string or empty or is not a valid HTTPRequestMethod value.
	 */
	parse: function(httpRequestMethodAsString) {
		if(httpRequestMethodAsString === undefined || httpRequestMethodAsString === null) {
			throw HTTPError.ILLEGAL_ARGUMENT;
		}
		if(typeof httpRequestMethodAsString != 'string') {
			throw HTTPError.ILLEGAL_ARGUMENT;
		}
		httpRequestMethodAsString = httpRequestMethodAsString.trim();
		if(httpRequestMethodAsString.length <= 0) {
			throw HTTPError.ILLEGAL_ARGUMENT;
		}
		httpRequestMethodAsString = httpRequestMethodAsString.toLowerCase();
		switch(httpRequestMethodAsString) {
			case 'connect':
				return HTTPRequestMethod.CONNECT;
			case 'delete':
				return HTTPRequestMethod.DELETE;
			case 'get':
				return HTTPRequestMethod.GET;
			case 'head':
				return HTTPRequestMethod.HEAD;
			case 'options':
				return HTTPRequestMethod.OPTIONS;
			case 'patch':
				return HTTPRequestMethod.PATCH;
			case 'post':
				return HTTPRequestMethod.POST;
			case 'put':
				return HTTPRequestMethod.PUT;
			case 'trace':
				return HTTPRequestMethod.TRACE;
			default:
				throw HTTPError.ILLEGAL_ARGUMENT;
		}
	}	
}

module.exports = HTTPRequestMethod;