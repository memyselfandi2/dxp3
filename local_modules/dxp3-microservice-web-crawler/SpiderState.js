/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-microservice-web-crawler
 *
 * NAME
 * SpiderState
 */
const packageName = 'dxp3-microservice-web-crawler';
const moduleName = 'SpiderState';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
// Check if someone tried to run/execute this file.
const util = require('dxp3-util');
if(util.Assert.isFileToExecute(canonicalName)) {
	util.Help.print();
	return;
}
/**
 * A collection/enumeration of the different states an Spider can be in.
 *
 * @module dxp3-microservice-web-crawler/SpiderState
 */

// We throw an SpiderError when we are unable to parse/tranform a String
// to a valid SpiderState value.
const SpiderError = require('./SpiderError');

// The actual enumeration object
const SpiderState = {
	/** @member {String} INITIALIZED */
	INITIALIZED: 'Initialized',
	/** @member {String} PAUSING */
	PAUSING: 'Pausing',
	/** @member {String} PAUSED */
	PAUSED: 'Paused',
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
	 * @param {String} spiderStateAsString A String to be parsed/transformed to an SpiderState value.
	 * @returns {String} A String representing an SpiderState.
	 * @throws {module:dxp3-microservice-web-crawler/SpiderError~SpiderError}
	 * When the supplied parameter is undefined, null, not a string or empty or is not a valid SpiderState value.
	 */
	parse: function(spiderStateAsString) {
		if(spiderStateAsString === undefined || spiderStateAsString === null) {
			throw SpiderError.ILLEGAL_ARGUMENT;
		}
		if(typeof spiderStateAsString != 'string') {
			throw SpiderError.ILLEGAL_ARGUMENT;
		}
		spiderStateAsString = spiderStateAsString.trim();
		if(spiderStateAsString.length <= 0) {
			throw SpiderError.ILLEGAL_ARGUMENT;
		}
		spiderStateAsString = spiderStateAsString.toLowerCase();
		switch(spiderStateAsString) {
			case 'initialized':
				return SpiderState.INITIALIZED;
			case 'paused':
				return SpiderState.PAUSED;
			case 'pausing':
				return SpiderState.PAUSING;
			case 'running':
				return SpiderState.RUNNING;
			case 'starting':
				return SpiderState.STARTING;
			case 'stopped':
				return SpiderState.STOPPED;
			case 'stopping':
				return SpiderState.STOPPING;
			default:
				throw SpiderError.ILLEGAL_ARGUMENT;
		}
	}	
}

module.exports = SpiderState;