/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-microservice-web-crawler
 *
 * NAME
 * Spider
 */
const packageName = 'dxp3-microservice-web-crawler';
const moduleName = 'Spider';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * @module dxp3-microservice-web-crawler/Spider
 */
const EventEmitter = require('events');
const html = require('dxp3-lang-html');
const http = require('http');
const https = require('https');
const logging = require('dxp3-logging');
const SpiderError = require('./SpiderError');
const SpiderEvent = require('./SpiderEvent');
const SpiderState = require('./SpiderState');

const logger = logging.getLogger(canonicalName);

class Spider extends EventEmitter {

	constructor() {
		super();
		// We maintain a list of spider jobs.
		this._jobs = [];
		// We maintain an index to the last spiderjob we processed.
		// For now we simply use a round robin scheme to pick the job
		// to work on.
		this._jobIndex = -1;
		// All done constructing our Spider.
		// It is time to set our state to INITIALIZED.
		this._state = SpiderState.INITIALIZED;
	}

    /**
     * Pause the Spider.
	 * @fires module:dxp3-microservice-web-crawler/SpiderEvent.PAUSING
	 * @throws {module:dxp3-microservice-web-crawler/SpiderError.ILLEGAL_STATE} thrown when the spider is not running.
     */
	pause() {
		logger.trace('pause()');
		// No point in pausing if we are already paused or if we are in the process of pausing.
		if((this._state === SpiderState.PAUSED) ||
		   (this._state === SpiderState.PAUSING)) {
		   	// Initially we threw an illegal state exception, but we deem that to harsh.
			// There really is no problem with calling pause again if we are already paused or
			// are in the process of pausing. 
		   	return;
		}
		// No point in pausing if we are not running or in the middle of starting.
		if((this._state != SpiderState.RUNNING) &&
		   (this._state != SpiderState.STARTING)) {
			throw SpiderError.ILLEGAL_STATE;
		}
		// Set our state to PAUSING.
		this._state = SpiderState.PAUSING;
		// Let anyone who is interested know that we are pausing.
		logger.info('Pausing.');
		this.emit(SpiderEvent.PAUSING);
	}

	/**
	 * Start the Spider.
	 * @fires module:dxp3-microservice-web-crawler/SpiderEvent.STARTING
	 * @throws {module:dxp3-microservice-web-crawler/SpiderError.ILLEGAL_STATE} thrown when the spider is in the process of stopping.
	 */
	start() {
		logger.trace('start()');
		// No point in starting if we are already running or starting.
		if((this._state === SpiderState.RUNNING) ||
		   (this._state === SpiderState.STARTING)) {
		   	// Initially we threw an illegal state exception, but we deem that to harsh.
			// There really is no problem with calling start again if we are already starting or running.
		   	return;
		}
		// If we are in the process of stopping, we'll have to wait until
		// we have completely stopped before we can start again.
		// Throw an ILLEGAL STATE error.
		if(this._state === SpiderState.STOPPING) {
			throw SpiderError.ILLEGAL_STATE;
		}
		// If we made it this far, it means we are either initialized or stopped.
		// Set our state to STARTING.
		this._state = SpiderState.STARTING;
		// Let anyone who is interested know that we are starting.
		logger.info('Starting.');
		this.emit(SpiderEvent.STARTING);
		// Lets wait at least a second to set our state to RUNNING.
		// Give our clients some time to get prepared.
		setTimeout(() => {
			// In the last second we may have been asked to stop or pause.
			if((this._state === SpiderState.STOPPING) || 
			   (this._state === SpiderState.PAUSING)) {
				this._checkForWork();
			} else {
				// Set our state to RUNNING.
				this._state = SpiderState.RUNNING;
				// Let anyone who is interested know that we are running.
				logger.info('Running.');
				this.emit(SpiderEvent.RUNNING);
				this._execute();
			}
		}, 1000);
	}

	/**
	 * Stop the Spider.
	 * @fires module:dxp3-microservice-web-crawler/SpiderEvent.STOPPED
	 * @fires module:dxp3-microservice-web-crawler/SpiderEvent.STOPPING
	 */
	stop() {
		logger.trace('stop()');
		// No point in stopping if we have already stopped or are in the process of stopping.
		if((this._state === SpiderState.STOPPED) ||
		   (this._state === SpiderState.STOPPING)) {
		   	// Initially we threw an illegal state exception, but we deem that to harsh.
			// There really is no problem with calling stop again if we are stopping or have already stopped. 
			return;
		}
		// If we are INITIALIZED or PAUSED, we can go directly to stopped.
		if((this._state === SpiderState.INITIALIZED) ||
		   (this._state === SpiderState.PAUSED)) {
			// Set our state to STOPPED.
			this._state = SpiderState.STOPPED;
			// Let anyone who is interested know that we are stopped.
			logger.info('Stopped.');
			this.emit(SpiderEvent.STOPPED);
			return;
		}
		// Set our state to STOPPING.
		this._state = SpiderState.STOPPING;
		logger.info('Stopping.');
		this.emit(SpiderEvent.STOPPING);
	}

	isInitialized() {
		return this._state === SpiderState.INITIALIZED;
	}

	isPaused() {
		return this._state === SpiderState.PAUSED;
	}

	isRunning() {
		return this._state === SpiderState.RUNNING;
	}

	isStopped() {
		return this._state === SpiderState.STOPPED || this._state === SpiderState.INITIALIZED;
	}

	get state() {
		return this._state;
	}

	getState() {
		return this._state;
	}

	_execute() {
		if(this._state === SpiderState.STOPPED) {
			return;
		}
		if(this._state === SpiderState.STOPPING) {
			// Set our state to STOPPED.
			this._state = SpiderState.STOPPED;
			logger.info('Stopped.');
			this.emit(SpiderEvent.STOPPED);
			return;
		}
		if(this._state === SpiderState.PAUSING) {
			// Set our state to PAUSED.
			this._state = SpiderState.PAUSED;
			logger.info('Paused.');
			this.emit(SpiderEvent.PAUSED);
			return;
		}
		if(this._jobs.length <= 0) {
			setTimeout(()=>{this._execute()}, 2000);
			return;
		}
		this._jobIndex++;
		if(this._jobIndex >= this._jobs.length) {
			this._jobIndex = 0;
		}
// console.log('number of jobs: ' + this._jobs.length);
// console.log('job index: ' + this._jobIndex);
		let spiderJob = this._jobs[this._jobIndex];
		let rateLimit = spiderJob.getRateLimit();
		if(rateLimit > 0) {
			let previousTime = spiderJob.getLastExecutionTime();
			if(previousTime != null) {
				let currentTime = Date.now();
				let elapsedTime = currentTime - previousTime;
				if(elapsedTime < rateLimit) {
					let sleepTime = 100;
					if(this.jobs.length <= 1) {
						sleepTime = rateLimit - elapsedTime;
					}
					setTimeout(()=>{this.execute()}, sleepTime);
				}
			}
		}
		let self = this;
		spiderJob.execute(function(err, urlString, statusCode, contentType) {
			if(urlString != null) {
				self.emit(SpiderEvent.VISITED, urlString, statusCode, contentType);
			}
			self._execute();
		});
	}

	crawl(_job) {
		this.queue(_job);
	}

	queue(_job) {
		this._jobs.push(_job); 
	}

	spider(_job) {
		this.queue(_job);
	}

	visit(_job) {
		this.queue(_job);
	}
}

module.exports = Spider;