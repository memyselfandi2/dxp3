/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-net-http
 *
 * NAME
 * HTTPSpiderState
 */
const packageName = 'dxp3-net-http';
const moduleName = 'HTTPSpiderState';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * A collection/enumeration of the different states an HTTPSpider can be in.
 *
 * @module dxp3-net-http/HTTPSpiderState
 */
// We throw an HTTPError when we are unable to parse/tranform a String
// to a valid HTTPSpiderState value.
const HTTPError = require('./HTTPError');
// We use the util.Help class to print out help information.
const util = require('dxp3-util');

// The actual enumeration object
const HTTPSpiderState = {
	/** @member {String} INITIALIZED */
	INITIALIZED: 'Initialized',
	/** @member {String} PAUSED */
	PAUSED: 'Paused',
	/** @member {String} PAUSING */
	PAUSING: 'Pausing',
	/** @member {String} RUNNING */
	RUNNING: 'Running',
	/** @member {String} STARTING */
	STARTING: 'Starting',
	/** @member {String} STOPPED */
	STOPPED: 'Stopped',
	/** @member {String} STOPPING */
	STOPPING: 'Stopping',
	/**
	 * @function parse
	 *
	 * @param {String} _httpSpiderStateAsString A String to be parsed/transformed to an HTTPSpiderState value.
	 * @returns {String} A String representing an HTTPSpiderState.
	 * @throws {module:dxp3-net-http/HTTPError~HTTPError}
	 * When the supplied parameter is undefined, null, not a string or empty or is not a valid HTTPSpiderState value.
	 */
	parse: function(_httpSpiderStateAsString) {
		if(_httpSpiderStateAsString === undefined || _httpSpiderStateAsString === null) {
			throw HTTPError.ILLEGAL_ARGUMENT;
		}
		if(typeof _httpSpiderStateAsString != 'string') {
			throw HTTPError.ILLEGAL_ARGUMENT;
		}
		_httpSpiderStateAsString = _httpSpiderStateAsString.trim();
		if(_httpSpiderStateAsString.length <= 0) {
			throw HTTPError.ILLEGAL_ARGUMENT;
		}
		_httpSpiderStateAsString = _httpSpiderStateAsString.toLowerCase();
		switch(_httpSpiderStateAsString) {
			case 'initialized':
				return HTTPSpiderState.INITIALIZED;
			case 'paused':
				return HTTPSpiderState.PAUSED;
			case 'pausing':
				return HTTPSpiderState.PAUSING;
			case 'running':
				return HTTPSpiderState.RUNNING;
			case 'starting':
				return HTTPSpiderState.STARTING;
			case 'stopped':
				return HTTPSpiderState.STOPPED;
			case 'stopping':
				return HTTPSpiderState.STOPPING;
			default:
				throw HTTPError.ILLEGAL_ARGUMENT;
		}
	}	
}
// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
    util.Help.print();
    return;
}
module.exports = HTTPSpiderState;