/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-net-http
 *
 * NAME
 * HTTPSpiderEvent
 */
const packageName = 'dxp3-net-http';
const moduleName = 'HTTPSpiderEvent';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * A collection/enumeration of events a HTTPSpider may emit.
 * Several of these are directly mapped to the different states (@see module:dxp3-net-http/HTTPSpiderState)
 * of a HTTPSpider.
 *
 * @module dxp3-net-http/HTTPSpiderEvent
 */
// We throw a HTTPError when we are unable to parse/tranform a String
// to a valid HTTPSpiderEvent value.
const HTTPError = require('./HTTPError');
// We use the util.Help class to print out help information.
const util = require('dxp3-util');

const HTTPSpiderEvent = {
	/**
	 * @member {String} ERROR
	 * Emitted when an error is encountered by the HTTPSpider.
	 */
	ERROR: 'Error',
	FOUND_DEAD_LINK: 'Found dead link',
	FOUND_HOST: 'Found host',
	FOUND_INVALID_LINK: 'Found invalid link',
	FOUND_LINK: 'Found link',
	FOUND_REDIRECT: 'Found redirect',
	/**
	 * @member {String} JOB_FINISHED
	 * Emitted when the HTTPSpider has finished a queued job.
	 */
	JOB_FINISHED: 'Job finished',
	/**
	 * @member {String} JOB_QUEUED
	 * Emitted when the HTTPSpider has queued a new job.
	 */
	JOB_QUEUED: 'Job queued',
	/**
	 * @member {String} FOLLOWED_LINK
	 * Emitted when the HTTPSpider has finished analysing a link.
	 */
	FOLLOWED_LINK: 'Followed link',
	/**
	 * @member {String} FOLLOWING_LINK
	 * Emitted when the HTTPSpider is visiting a link to analyse.
	 */
	FOLLOWING_LINK: 'Following link',
	/**
	 * @member {String} LINK_TO_BE_FOLLOWED
	 * Emitted when the HTTPSpider finds a link that needs to be analysed.
	 */
	TO_BE_FOLLOWED_LINK: 'To be followed link',
	/**
	 * @member {String} IGNORED_LINK
	 * Emitted when the HTTPSpider finds a link that should not be followed.
	 */
	IGNORED_LINK: 'Ignoring link',
	/**
	 * @member {String} PAUSED
	 * Emitted when the HTTPSpider transitions to the PAUSED state.
	 */
	PAUSED: 'Paused',
	/**
	 * @member {String} PAUSING
	 * Emitted when the HTTPSpider transitions to the PAUSING state.
	 */
	PAUSING: 'Pausing',
	/**
	 * @member {String} RUNNING
	 * Emitted when the HTTPSpider transitions to the RUNNING state.
	 */
	RUNNING: 'Running',
	/**
	 * @member {String} STARTING
	 * Emitted when the HTTPSpider transitions to the STARTING state.
	 */
	STARTING: 'Starting',
	/**
	 * @member {String} STOPPED
	 * Emitted when the HTTPSpider transitions to the STOPPED state.
	 */
	STOPPED: 'Stopped',
	/**
	 * @member {String} STOPPING
	 * Emitted when the HTTPSpider transitions to the STOPPING state.
	 */
	STOPPING: 'Stopping',
	/**
	 * @function parse
	 *
	 * @param {String} httpSpiderEventAsString A String to be parsed/transformed to a HTTPSpiderEvent value.
	 * @returns {String} A String representing a HTTPSpiderEvent.
	 * @throws {module:dxp3-net-http/HTTPError~HTTPError}
	 * When the supplied parameter is undefined, null, not a string or empty or is not a valid HTTPSpiderEvent value.
	 */
	parse: function(httpSpiderEventAsString) {
		if(httpSpiderEventAsString === undefined || httpSpiderEventAsString === null) {
			throw HTTPError.ILLEGAL_ARGUMENT;
		}
		if(typeof httpSpiderEventAsString != 'string') {
			throw HTTPError.ILLEGAL_ARGUMENT;
		}
		httpSpiderEventAsString = httpSpiderEventAsString.trim();
		if(httpSpiderEventAsString.length <= 0) {
			throw HTTPError.ILLEGAL_ARGUMENT;
		}
		httpSpiderEventAsString = httpSpiderEventAsString.toLowerCase();
		switch(httpSpiderEventAsString) {
			case 'error':
				return HTTPSpiderEvent.ERROR;
			case 'jobfinished':
			case 'job finished':
			case 'job_finished':
			case 'job-finished':
				return HTTPSpiderEvent.JOB_FINISHED;
			case 'jobqueued':
			case 'job queued':
			case 'job_queued':
			case 'job-queued':
				return HTTPSpiderEvent.JOB_QUEUED;
			case 'followedlink':
				return HTTPSpiderEvent.FOLLOWED_LINK;
			case 'followinglink':
				return HTTPSpiderEvent.FOLLOWING_LINK;
			case 'tobefollowedlink':
				return HTTPSpiderEvent.TO_BE_FOLLOWED_LINK;
			case 'ignoredlink':
			case 'ignored link':
			case 'ignored_link':
			case 'ignored-link':
				return HTTPSpiderEvent.IGNORED_LINK;
			case 'paused':
				return HTTPSpiderEvent.PAUSED;
			case 'pausing':
				return HTTPSpiderEvent.PAUSING;
			case 'running':
				return HTTPSpiderEvent.RUNNING;
			case 'starting':
				return HTTPSpiderEvent.STARTING;
			case 'stopped':
				return HTTPSpiderEvent.STOPPED;
			case 'stopping':
				return HTTPSpiderEvent.STOPPING;
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
module.exports = HTTPSpiderEvent;