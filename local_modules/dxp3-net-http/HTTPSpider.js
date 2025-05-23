/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-net-http
 *
 * NAME
 * HTTPSpider
 */
const packageName = 'dxp3-net-http';
const moduleName = 'HTTPSpider';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * @module dxp3-net-http/HTTPSpider
 */
const EventEmitter = require('events');
const html = require('dxp3-lang-html');
const http = require('http');
const https = require('https');
const HTTPError = require('./HTTPError');
const HTTPSpiderOptions = require('./HTTPSpiderOptions');
const HTTPSpiderEvent = require('./HTTPSpiderEvent');
const HTTPSpiderJob = require('./HTTPSpiderJob');
const HTTPSpiderRepository = require('./HTTPSpiderRepository');
const HTTPSpiderState = require('./HTTPSpiderState');
const logging = require('dxp3-logging');
const util = require('dxp3-util');

const logger = logging.getLogger(canonicalName);

class HTTPSpider extends EventEmitter {
	/**************************************
	 * CONSTRUCTOR
	 *************************************/

	constructor(_options) {
		super();
		this._options = HTTPSpiderOptions.parse(_options);
		let filterContentTypes = this._options.filterContentTypes;
		if(filterContentTypes === undefined || filterContentTypes === null || filterContentTypes.length <= 0) {
		logger.info('Filter by content types: *');
		} else {
		logger.info('Filter by content types: ' + filterContentTypes);
		}
		let filterStatusCodes = this._options.filterStatusCodes;
		if(filterStatusCodes === undefined || filterStatusCodes === null || filterStatusCodes.length <= 0) {
		logger.info('Filter by status codes : *');
		} else {
		logger.info('Filter by status codes : ' + filterStatusCodes);
		}
		let filterPaths = this._options.filterPaths;
		if(filterPaths === undefined || filterPaths === null || filterPaths.length <= 0) {
		logger.info('Filter by paths        : *');
		} else {
		logger.info('Filter by paths        : ' + filterPaths);
		}
		logger.info('Filter by hosts        : ' + this._options.filterHosts);
		// A HTTPSpider will initially attempt to stay within one host.
		// If you want to spider other hosts you will ask the spider 
		// to do so by specifying a followHost.
		let hosts = new Map();
		// Typically a HTTPSpider will crawl multiple pages.
		// However if you only want to analyse one page,
		// you should set the followPath of the current host to '.'.
		// If you want to crawl all the pages of the current host you set
		// the followPath to '*'.
		for(let i=0;i < this._options.followHosts.length;i++) {
			let followHost = this._options.followHosts[i];
			if(i === 0) {
		logger.info('Follow hosts           : ' + followHost.hostName + ' -> ' + followHost.followPath);
			} else {
		logger.info('                         ' + followHost.hostName + ' -> ' + followHost.followPath);
			}
			hosts.set(followHost.hostName, followHost.followPath);
		}
		this._options.followHosts = hosts;
		// A HTTPSpider typically follows redirects.
		// This behavior can be turned off.
		logger.info('Follow redirects       : ' + this._options.followRedirects);
		logger.info('Rate limit             : ' + this._options.rateLimit);
		logger.info('Timeout                : ' + this._options.timeout);
		if(this._options.downloadFolder != undefined && this._options.downloadFolder != null) {
			if(!this._options.downloadFolder.endsWith(path.sep)) {
				this._options.downloadFolder += path.sep;
			}
		logger.info('Download folder        : ' + this._options.downloadFolder);
		}
		logger.info('Useragent              : ' + this._options.useragent);
		// We maintain a list of spider httpSpiderJobs.
		this._httpSpiderJobs = [];
		// We maintain an index to the last spiderjob we processed.
		// For now we simply use a round robin scheme to pick the httpSpiderJob
		// to work on.
		this._httpSpiderJobIndex = -1;
		// All done constructing our HTTPSpider.
		// It is time to set our state to INITIALIZED.
		this._state = HTTPSpiderState.INITIALIZED;
	}

	/**************************************
	 * PUBLIC METHODS
	 *************************************/

	crawl(_args) {
		this.queue(...arguments);
	}

	download(_args) {
		this.queue(...arguments);
	}

	queue(_urls,
		  _followRedirects,
		  _followHosts,
		  _filterContentTypes,
		  _filterStatusCodes,
		  _filterPaths,
		  _filterHosts,
		  _rateLimit,
		  _timeout,
		  _downloadFolder,
		  _useragent) {
		logger.trace('queue(...): start.');
		// Defensive programming...check input...
		if(arguments.length <= 0) {
			logger.trace('queue(...): end.');
			return;
		}
		_urls = arguments[0];
		if(_urls === undefined || _urls === null) {
			logger.trace('queue(...): end.');
			return;
		}
		// There are three options:
		// 1) the first argument is a string
		// 2) the first argument is an array of strings
		// 3) the first argument is an options object
		let urls = null;
		if(typeof _urls === 'string') {
			_urls = _urls.trim();
			if(_urls.length <= 0) {
				logger.trace('queue(...): end.');
				return;
			}
			urls = [_urls];
		} else if(Array.isArray(_urls)) {
			if(_urls.length <= 0) {
				logger.trace('queue(...): end.');
				return;
			}
			urls = _urls;
		} else if(typeof _urls === 'object') {
			logger.debug('queue(...): _urls argument is an object.');
			logger.trace('queue(...): ' + JSON.stringify(_urls));
			let args = _urls;
			args = HTTPSpiderOptions.parse(args);
			if(typeof args.urls === 'string') {
				args.urls = args.urls.trim();
				if(args.urls.length <= 0) {
					logger.trace('queue(...): end.');
					return;
				}
				urls = [args.urls];
			} else {
				urls = args.urls;
			}
			console.log('urls: ' + JSON.stringify(urls));
			if(_followRedirects === undefined || _followRedirects === null) {
				_followRedirects = args.followRedirects;
			}
			if(_followHosts === undefined || _followHosts === null) {
				_followHosts = args.followHosts;
			}
			if(_rateLimit === undefined || _rateLimit === null) {
				_rateLimit = args.rateLimit;
			}
			if(_timeout === undefined || _timeout === null) {
				_timeout = args.timeout;
			}
			if(_filterContentTypes === undefined || _filterContentTypes === null) {
				_filterContentTypes = args.filterContentTypes;
			}
			if(_filterStatusCodes === undefined || _filterStatusCodes === null) {
				_filterStatusCodes = args.filterStatusCodes;
			}
			if(_filterHosts === undefined || _filterHosts === null) {
				_filterHosts = args.filterHosts;
			}
			if(_filterPaths === undefined || _filterPaths === null) {
				_filterPaths = args.filterPaths;
			}
			if(_downloadFolder === undefined || _downloadFolder === null) {
				_downloadFolder = args.downloadFolder;
			}
			if(_useragent === undefined || _useragent === null) {
				_useragent = args.useragent;
			}
		}
		if(urls === null) {
			// The given args is not a string, not an array nor an object.
			// We can't do anything with this args parameter.
			// Might as well return.
			logger.trace('queue(...): end.');
			return;
		}
		// If any specific setting is missing, we default to our generic setting.
		if(_followRedirects === undefined || _followRedirects === null) {
			_followRedirects = this._options.followRedirects;
		}
		if(_followHosts === undefined || _followHosts === null) {
			_followHosts = this._options.followHosts;
		}
		if(Array.isArray(_followHosts)) {
			let followHostsMap = new Map();
			for(let i=0;i < _followHosts.length;i++) {
				let followHost = _followHosts[i];
				followHostsMap.set(followHost.hostName, followHost.followPath);
			}
			_followHosts = followHostsMap;
		}
		if(_rateLimit === undefined || _rateLimit === null) {
			_rateLimit = this._options.rateLimit;
		}
		if(_timeout === undefined || _timeout === null) {
			_timeout = this._options.timeout;
		}
		if(_filterContentTypes === undefined || _filterContentTypes === null) {
			_filterContentTypes = this._options.filterContentTypes;
		}
		if(_filterStatusCodes === undefined || _filterStatusCodes === null) {
			_filterStatusCodes = this._options.filterStatusCodes;
		}
		if(_filterHosts === undefined || _filterHosts === null) {
			_filterHosts = this._options.filterHosts;
		}
		if(_filterPaths === undefined || _filterPaths === null) {
			_filterPaths = this._options.filterPaths;
		}
		if(_downloadFolder === undefined || _downloadFolder === null) {
			_downloadFolder = this._options.downloadFolder;
		}
		if(_useragent === undefined || _useragent === null) {
			_useragent = this._options.useragent;
		}
		// We create a HTTPSpiderJob for each starting point URL.
		let self = this;
		for(let i=0;i < urls.length;i++) {
			let url = urls[i];
			logger.debug('queue(...): URL \'' + url + '\'.');
			let httpSpiderJob = new HTTPSpiderJob(url, _followRedirects, _followHosts, _rateLimit, _timeout, _filterContentTypes, _filterStatusCodes, _filterPaths, _filterHosts, _downloadFolder, _useragent);
			httpSpiderJob.on(HTTPSpiderEvent.TO_BE_FOLLOWED_LINK, (sourceURL, destinationURL, contentType) => {
				self.emit(HTTPSpiderEvent.TO_BE_FOLLOWED_LINK, sourceURL, destinationURL, contentType);
			});
			httpSpiderJob.on(HTTPSpiderEvent.FOLLOWING_LINK, (sourceURL, destinationURL) => {
				self.emit(HTTPSpiderEvent.FOLLOWING_LINK, sourceURL, destinationURL);
			});
			httpSpiderJob.on(HTTPSpiderEvent.FOLLOWED_LINK, (sourceURL, destinationURL, contentType, statusCode) => {
				self.emit(HTTPSpiderEvent.FOLLOWED_LINK, sourceURL, destinationURL, contentType, statusCode);
			});
			httpSpiderJob.on(HTTPSpiderEvent.FOUND_INVALID_LINK, (sourceURL, destinationURL) => {
				self.emit(HTTPSpiderEvent.FOUND_INVALID_LINK, sourceURL, destinationURL);
			});
			httpSpiderJob.on(HTTPSpiderEvent.FOUND_LINK, (sourceURL, destinationURL, contentType, statusCode) => {
				self.emit(HTTPSpiderEvent.FOUND_LINK, sourceURL, destinationURL, contentType, statusCode);
			});
			httpSpiderJob.on(HTTPSpiderEvent.FOUND_DEAD_LINK, (sourceURL, destinationURL) => {
				self.emit(HTTPSpiderEvent.FOUND_DEAD_LINK, sourceURL, destinationURL);
			});
			httpSpiderJob.on(HTTPSpiderEvent.FOUND_REDIRECT, (sourceURL, destinationURL, location, statusCode) => {
				self.emit(HTTPSpiderEvent.FOUND_REDIRECT, sourceURL, destinationURL, location, statusCode);
			});
			httpSpiderJob.on(HTTPSpiderEvent.IGNORED_LINK, (sourceURL, destinationURL, contentType) => {
				self.emit(HTTPSpiderEvent.IGNORED_LINK, sourceURL, destinationURL, contentType);
			});
			httpSpiderJob.on(HTTPSpiderEvent.JOB_FINISHED, (httpSpiderJobID) => {
				let foundAt = -1;
				let httpSpiderJob = null;
				for(let i=0;i < self._httpSpiderJobs.length;i++) {
					httpSpiderJob = self._httpSpiderJobs[i];
					if(httpSpiderJob.id === httpSpiderJobID) {
						foundAt = i;
						break;
					}
				}
				if(foundAt > -1) {
					self._httpSpiderJobs.splice(foundAt, 1);
					self.emit(HTTPSpiderEvent.JOB_FINISHED, httpSpiderJob.id, httpSpiderJob.url);
				}
			});
			this._httpSpiderJobs.push(httpSpiderJob);
			this.emit(HTTPSpiderEvent.JOB_QUEUED, httpSpiderJob.id, httpSpiderJob.url);
		}
		logger.trace('queue(...): end.');
	}

	spider(args) {
		logger.trace('spider(...)');
		this.queue(...arguments);
	}

	visit(args) {
		logger.trace('visit(...)');
		this.queue(...arguments);
	}

	clear() {
		logger.trace('clear()');
		this._httpSpiderJobs.splice(0, this._httpSpiderJobs.length);
	}

	reset() {
		logger.trace('reset()');
		this.clear();
	}
    /**
     * Pause the Spider.
	 * @fires module:dxp3-microservice-web-crawler/HTTPSpiderEvent.PAUSING
	 * @throws {module:dxp3-microservice-web-crawler/HTTPError.ILLEGAL_STATE} thrown when the spider is not running.
     */
	pause() {
		logger.trace('pause()');
		// No point in pausing if we are already paused or if we are in the process of pausing.
		if((this._state === HTTPSpiderState.PAUSED) ||
		   (this._state === HTTPSpiderState.PAUSING)) {
		   	// Initially we threw an illegal state exception, but we deem that to harsh.
			// There really is no problem with calling pause again if we are already paused or
			// are in the process of pausing. 
		   	return;
		}
		// No point in pausing if we are not running or in the middle of starting.
		if((this._state != HTTPSpiderState.RUNNING) &&
		   (this._state != HTTPSpiderState.STARTING)) {
			logger.warn('Not allowed to pause if the HTTPSpider is not running or starting.');
			throw HTTPError.ILLEGAL_STATE;
		}
		// Set our state to PAUSING.
		this._state = HTTPSpiderState.PAUSING;
		// Let anyone who is interested know that we are pausing.
		logger.info('Pausing.');
		this.emit(HTTPSpiderEvent.PAUSING);
	}

	/**
	 * Start the Spider.
	 * @fires module:dxp3-microservice-web-crawler/HTTPSpiderEvent.STARTING
	 * @throws {module:dxp3-microservice-web-crawler/HTTPError.ILLEGAL_STATE} thrown when the spider is in the process of stopping.
	 */
	start() {
		logger.trace('start()');
		// No point in starting if we are already running or starting.
		if((this._state === HTTPSpiderState.RUNNING) ||
		   (this._state === HTTPSpiderState.STARTING)) {
		   	// Initially we threw an illegal state exception, but we deem that to harsh.
			// There really is no problem with calling start again if we are already starting or running.
		   	return;
		}
		// If we are in the process of stopping, we'll have to wait until
		// we have completely stopped before we can start again.
		// Throw an ILLEGAL STATE error.
		if(this._state === HTTPSpiderState.STOPPING) {
			throw HTTPError.ILLEGAL_STATE;
		}
		// If we made it this far, it means we are either initialized or stopped.
		// Set our state to STARTING.
		this._state = HTTPSpiderState.STARTING;
		// Let anyone who is interested know that we are starting.
		logger.info('Starting.');
		this.emit(HTTPSpiderEvent.STARTING);
		// Lets wait at least a second to set our state to RUNNING.
		// Give our clients some time to get prepared.
		setTimeout(() => {
			// In the last second we may have been asked to stop or pause.
			if((this._state === HTTPSpiderState.STOPPING) || 
			   (this._state === HTTPSpiderState.PAUSING)) {
				this._execute();
			} else {
				// Set our state to RUNNING.
				this._state = HTTPSpiderState.RUNNING;
				// Let anyone who is interested know that we are running.
				logger.info('Running.');
				this.emit(HTTPSpiderEvent.RUNNING);
				this._execute();
			}
		}, 1000);
	}

	/**
	 * Stop the Spider.
	 * @fires module:dxp3-microservice-web-crawler/HTTPSpiderEvent.STOPPED
	 * @fires module:dxp3-microservice-web-crawler/HTTPSpiderEvent.STOPPING
	 */
	stop() {
		logger.trace('stop()');
		// No point in stopping if we have already stopped or are in the process of stopping.
		if((this._state === HTTPSpiderState.STOPPED) ||
		   (this._state === HTTPSpiderState.STOPPING)) {
		   	// Initially we threw an illegal state exception, but we deem that to harsh.
			// There really is no problem with calling stop again if we are stopping or have already stopped. 
			return;
		}
		// If we are INITIALIZED or PAUSED, we can go directly to stopped.
		if((this._state === HTTPSpiderState.INITIALIZED) ||
		   (this._state === HTTPSpiderState.PAUSED)) {
			// Set our state to STOPPED.
			this._state = HTTPSpiderState.STOPPED;
			// Let anyone who is interested know that we are stopped.
			logger.info('Stopped.');
			this.emit(HTTPSpiderEvent.STOPPED);
			return;
		}
		// Set our state to STOPPING.
		this._state = HTTPSpiderState.STOPPING;
		logger.info('Stopping.');
		this.emit(HTTPSpiderEvent.STOPPING);
	}

	/**************************************
	 * GETTERS
	 *************************************/

	get downloadFolder() {
		return this.getDownloadFolder();
	}

	getDownloadFolder() {
		return this._options.downloadFolder;
	}

	get filterContentTypes() {
		return this.getFilterContentTypes();
	}

	getFilterContentTypes() {
		return this._options.filterContentTypes;
	}

	get filterHosts() {
		return this.getFilterHosts();
	}

	getFilterHosts() {
		return this._options.filterHosts;
	}

	get filterPaths() {
		return this.getFilterPaths();
	}

	getFilterPaths() {
		return this._options.filterPaths;
	}

	get filterStatusCodes() {
		return this.getFilterStatusCodes();
	}

	getFilterStatusCodes() {
		return this._options.filterStatusCodes;
	}

	get followHosts() {
		return this.getFollowHosts();
	}

	getFollowHosts() {
		return this._options.followHosts;
	}

	get followRedirects() {
		return this.getFollowRedirects();
	}

	getFollowRedirects() {
		return this._options.followRedirects;
	}

	isInitialized() {
		return this._state === HTTPSpiderState.INITIALIZED;
	}

	isPaused() {
		return this._state === HTTPSpiderState.PAUSED;
	}

	isPausing() {
		return this._state === HTTPSpiderState.PAUSING;
	}

	isRunning() {
		return this._state === HTTPSpiderState.RUNNING;
	}

	isStarting() {
		return this._state === HTTPSpiderState.STARTING;
	}

	isStopped() {
		return this._state === HTTPSpiderState.STOPPED;
	}

	isStopping() {
		return this._state === HTTPSpiderState.STOPPING;
	}

	get rateLimit() {
		return this.getRateLimit();
	}

	getRateLimit() {
		return this._options.rateLimit;
	}

	get state() {
		return this.getState();
	}

	getState() {
		return this._state;
	}

	get timeout() {
		return this.getTimeout();
	}

	getTimeout() {
		return this._options.timeout;
	}

	get useragent() {
		return this.getUserAgent();
	}

	getUserAgent() {
		return this._options.useragent;
	}

	/**************************************
	 * SETTERS
	 *************************************/

	addFollowHost(_hostName, _path) {
		if(_hostName === undefined || _hostName === null) {
			return;
		}
		_hostName = _hostName.trim();
		this._options.followHosts.set(_hostName, _path);
		for(let i=0;i < this._httpSpiderJobs.length;i++) {
			let httpSpiderJob = this._httpSpiderJobs[i];
			httpSpiderJob.setFollowHosts(this._options.followHosts);
		}
	}

	set downloadFolder(_downloadFolder) {
		this.setDownloadFolder(_downloadFolder);
	}

	setDownloadFolder(_downloadFolder) {
		if(_downloadFolder === undefined || _downloadFolder === null) {
			this._options.downloadFolder = null;
		} else if(typeof _downloadFolder === 'string') {
			this._options.downloadFolder = _downloadFolder.trim();
			if(!this._options.downloadFolder.endsWith(path.sep)) {
				this._options.downloadFolder += path.sep;
			}
		} else {
			this._options.downloadFolder = null;
		}
		for(let i=0;i < this._httpSpiderJobs.length;i++) {
			let httpSpiderJob = this._httpSpiderJobs[i];
			httpSpiderJob.setDownloadFolder(this._options.downloadFolder);
		}
	}

	set filterContentTypes(_filterContentTypes) {
		this.setFilterContentTypes(_filterContentTypes);
	}

	setFilterContentTypes(_filterContentTypes) {
		if(_filterContentTypes === undefined || _filterContentTypes === null) {
			this._options.filterContentTypes = null;
		} else {
			if(typeof _filterContentTypes === 'string') {
				_filterContentTypes = _filterContentTypes.trim().split(',');
			}
			if(!Array.isArray(_filterContentTypes)) {
				this._options.filterContentTypes = null;
			} else {
				this._options.filterContentTypes = [];
				for(let i=0;i < _filterContentTypes.length;i++) {
					let filterContentType = _filterContentTypes[i];
					if(typeof filterContentType === 'string') {
						filterContentType = filterContentType.trim();
						if(filterContentType.length <= 0) {
							continue;
						}
						this._options.filterContentTypes.push(filterContentType);
					}
				}
				if(this._options.filterContentTypes.length <= 0) {
					this._options.filterContentTypes = null;
				}				
			}
		}
		for(let i=0;i < this._httpSpiderJobs.length;i++) {
			let httpSpiderJob = this._httpSpiderJobs[i];
			httpSpiderJob.setFilterContentTypes(this._options.filterContentTypes);
		}
	}

	set filterHosts(_filterHosts) {
		this.setFilterHosts(_filterHosts);
	}

	setFilterHosts(_filterHosts) {
		this._options.filterHosts = _filterHosts;
		for(let i=0;i < this._httpSpiderJobs.length;i++) {
			let httpSpiderJob = this._httpSpiderJobs[i];
			httpSpiderJob.setFilterHosts(this._options.filterHosts);
		}
	}

	set filterPaths(_filterPaths) {
		this.setFilterPaths(_filterPaths);
	}

	setFilterPaths(_filterPaths) {
		this._options.filterPaths = _filterPaths;
		for(let i=0;i < this._httpSpiderJobs.length;i++) {
			let httpSpiderJob = this._httpSpiderJobs[i];
			httpSpiderJob.setFilterPaths(this._options.filterPaths);
		}
	}

	set filterStatusCodes(_filterStatusCodes) {
		this.setFilterStatusCodes(_filterStatusCodes);
	}

	setFilterStatusCodes(_filterStatusCodes) {
		if(_filterStatusCodes === undefined || _filterStatusCodes === null) {
			this._options.filterStatusCodes = null;
		} else {
			if(typeof _filterStatusCodes === 'string') {
				_filterStatusCodes = _filterStatusCodes.trim().split(',');
			} else if(typeof _filterStatusCodes === 'number') {
				_filterStatusCodes = [_filterStatusCodes];
			}
			if(!Array.isArray(_filterStatusCodes)) {
				this._options.filterStatusCodes = null;
			} else {
				this._options.filterStatusCodes = [];
				for(let i=0;i < _filterStatusCodes.length;i++) {
					let filterStatusCode = _filterStatusCodes[i];
					if(typeof filterStatusCode === 'string') {
						filterStatusCode = filterStatusCode.trim();
						if(filterStatusCode.length <= 0) {
							continue;
						}
						this._options.filterStatusCodes.push(filterStatusCode);
					} else if(typeof filterStatusCode === 'number') {
						this._options.filterStatusCodes.push(filterStatusCode);
					}
				}
				if(this._options.filterStatusCodes.length <= 0) {
					this._options.filterStatusCodes = null;
				}
			}
		}
		for(let i=0;i < this._httpSpiderJobs.length;i++) {
			let httpSpiderJob = this._httpSpiderJobs[i];
			httpSpiderJob.setFilterStatusCodes(this._options.filterStatusCodes);
		}
	}

	set followHosts(_followHosts) {
		this.setFollowHosts(_followHosts);
	}

	setFollowHosts(_followHosts) {
		if(_followHosts === undefined || _followHosts === null) {
			_followHosts = new Map();
		} else if(Array.isArray(_followHosts)) {
			let tmpFollowHosts = new Map();
			for(let i=0;i < _followHosts.length;i++) {
				let followHost = _followHosts[i];
				let hostName = followHost.hostName;
				let followPath = followHost.followPath;
				tmpFollowHosts.set(hostName, followPath);
			}
			_followHosts = tmpFollowHosts;
		}
		if(!(_followHosts instanceof Map)) {
			throw HTTPError.ILLEGAL_ARGUMENT;
		}
		this._options.followHosts = _followHosts;
		for(let i=0;i < this._httpSpiderJobs.length;i++) {
			let httpSpiderJob = this._httpSpiderJobs[i];
			httpSpiderJob.setFollowHosts(this._options.followHosts);
		}
	}

	set followRedirects(_followRedirects) {
		this.setFollowRedirects(_followRedirects);
	}

	setFollowRedirects(_followRedirects) {
		this._options.followRedirects = _followRedirects;
		for(let i=0;i < this._httpSpiderJobs.length;i++) {
			let httpSpiderJob = this._httpSpiderJobs[i];
			httpSpiderJob.setFollowRedirects(this._options.followRedirects);
		}
	}

	set rateLimit(_rateLimit) {
		this.setRateLimit(_rateLimit);
	}

	setRateLimit(_rateLimit) {
		this._options.rateLimit = _rateLimit;
		for(let i=0;i < this._httpSpiderJobs.length;i++) {
			let httpSpiderJob = this._httpSpiderJobs[i];
			httpSpiderJob.setRateLimit(this._options.rateLimit);
		}
	}

	set timeout(_timeout) {
		this.setTimeout(_timeout);
	}

	setTimeout(_timeout) {
		this._options.timeout = _timeout;
		for(let i=0;i < this._httpSpiderJobs.length;i++) {
			let httpSpiderJob = this._httpSpiderJobs[i];
			httpSpiderJob.setTimeout(this._options.timeout);
		}
	}

	set useragent(_useragent) {
		this.setUserAgent(_useragent);
	}

	setUserAgent(_useragent) {
		this._options.useragent = _useragent;
		for(let i=0;i < this._httpSpiderJobs.length;i++) {
			let httpSpiderJob = this._httpSpiderJobs[i];
			httpSpiderJob.setUserAgent(this._options.useragent);
		}
	}

	/**************************************
	 * PRIVATE METHODS
	 *************************************/

	_execute() {
		if(this._state === HTTPSpiderState.STOPPED) {
			return;
		}
		if(this._state === HTTPSpiderState.STOPPING) {
			// Set our state to STOPPED.
			this._state = HTTPSpiderState.STOPPED;
			logger.info('Stopped.');
			this.emit(HTTPSpiderEvent.STOPPED);
			return;
		}
		if(this._state === HTTPSpiderState.PAUSING) {
			// Set our state to PAUSED.
			this._state = HTTPSpiderState.PAUSED;
			logger.info('Paused.');
			this.emit(HTTPSpiderEvent.PAUSED);
			return;
		}
		// Check if there is something to do...
		if(this._httpSpiderJobs.length <= 0) {
			setTimeout(()=>{this._execute()}, 2000);
			return;
		}
		this._httpSpiderJobIndex++;
		if(this._httpSpiderJobIndex >= this._httpSpiderJobs.length) {
			this._httpSpiderJobIndex = 0;
		}
		let httpSpiderJob = this._httpSpiderJobs[this._httpSpiderJobIndex];
		let rateLimit = httpSpiderJob.rateLimit;
		if(rateLimit <= 0) {
			rateLimit = this._options.rateLimit;
		}
		if(rateLimit > 0) {
			let previousTime = httpSpiderJob.getLastExecutionTime();
			// If there is no execution time yet for this httpSpiderJob,
			// it means it has never been executed.
			if(previousTime != null) {
				// This httpSpiderJob has been executed before.
				// Lets ensure we have waited long enough before 
				// we can execute it again.
				// In other words the elapsed time should be more than
				// the rate limit.
				let currentTime = Date.now();
				let elapsedTime = currentTime - previousTime;
				if(elapsedTime < rateLimit) {
					// if the elapsed time is less than the rate limit,
					// we will not yet execute this httpSpiderJob.
					// Lets go get the next httpSpiderJob by calling ourselves after
					// a short nap.
					let sleepTime = 100;
					// If this is the one and only httpSpiderJob we might as well
					// sleep for as long as the rate limit allows.
					if(this._httpSpiderJobs.length <= 1) {
						sleepTime = rateLimit - elapsedTime;
					}
					setTimeout(()=>{this._execute()}, sleepTime);
					return;
				}
			}
		}
		let self = this;
		httpSpiderJob.execute(function() {
			self._execute();
		});
	}

	static main() {
		try {
			let httpSpiderOptions = HTTPSpiderOptions.parseCommandLineOptions();
			logging.setLevel(httpSpiderOptions.logLevel);
			if(httpSpiderOptions.help) {
				util.Help.print(HTTPSpider);
				return;
			}
			// The -url option is command line only.
			let urls = httpSpiderOptions.urls;
			if(urls === undefined || urls === null || urls.length <= 0) {
				console.log('Missing URL. Please use the -url option to specify the start URL.')
				return;
			}
			let httpSpider = new HTTPSpider(httpSpiderOptions);
			httpSpider.on(HTTPSpiderEvent.ERROR, (_error) => {
				logger.warn('Error: ' + _error);
			});
			httpSpider.on(HTTPSpiderEvent.JOB_FINISHED, (_id, _url) => {
				console.log('Job finished: ' + _id + ': ' + _url);
				process.exit();
			});
			httpSpider.on(HTTPSpiderEvent.JOB_QUEUED, (_id, _url) => {
				console.log('Job queued: ' + _id + ': ' + _url);
			});
			httpSpider.on(HTTPSpiderEvent.FOUND_LINK, (source, destination, contentType, statusCode) => {
				console.log('Found link: ' + statusCode + ': ' + contentType + ': ' + source + ' -> ' + destination);
			});
			httpSpider.on(HTTPSpiderEvent.FOUND_REDIRECT, (source, destination, location, statusCode) => {
				console.log('Found redirect: ' + statusCode + ': ' + source + ' -> ' + destination + ' -> ' + location);
			});
			httpSpider.on(HTTPSpiderEvent.FOUND_DEAD_LINK, (source, destination) => {
				console.log('Found dead link: 404: ' + source + ' -> ' + destination);
			});
			httpSpider.on(HTTPSpiderEvent.FOUND_HOST, (source, host) => {
				console.log('Found host: ' + source + ' -> ' + host);
			});
			httpSpider.on(HTTPSpiderEvent.FOLLOWING_LINK, (source, destination) => {
				logger.debug('Following link: ' + source + ' -> ' + destination);
			});
			httpSpider.on(HTTPSpiderEvent.FOLLOWED_LINK, (source, destination, contentType, statusCode) => {
				logger.info('Followed link: ' + statusCode + ': ' + contentType + ': ' + source + ' -> ' + destination);
			});
			httpSpider.on(HTTPSpiderEvent.TO_BE_FOLLOWED_LINK, (source, destination, contentType) => {
				logger.debug('To be followed link: ' + source + ' -> ' + destination);
			});
			httpSpider.on(HTTPSpiderEvent.IGNORED_LINK, (source, destination, contentType) => {
				logger.debug('Ignored link: ' + source + ' -> ' + destination);
			});
			httpSpider.on(HTTPSpiderEvent.PAUSED, () => {
				console.log('Paused.');
			});
			httpSpider.on(HTTPSpiderEvent.PAUSING, () => {
				console.log('Pausing...');
			});
			httpSpider.on(HTTPSpiderEvent.RUNNING, () => {
				console.log('Running...');
			});
			httpSpider.on(HTTPSpiderEvent.STARTING, () => {
				console.log('Starting...');
			});
			httpSpider.on(HTTPSpiderEvent.STOPPED, () => {
				console.log('Stopped.');
			});
			httpSpider.on(HTTPSpiderEvent.STOPPING, () => {
				console.log('Stopping...');
			});
			httpSpider.queue(urls);
			httpSpider.start();
		} catch(exception) {
			console.log('');
			console.log('EXCEPTION:' + exception.message);
			process.exit();
		}
	}
}
// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
	HTTPSpider.main();
	return;
}
module.exports = HTTPSpider;