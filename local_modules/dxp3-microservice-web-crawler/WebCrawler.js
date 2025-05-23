/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-microservice-web-crawler
 *
 * NAME
 * WebCrawler
 */
const packageName = 'dxp3-microservice-web-crawler';
const moduleName = 'WebCrawler';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * @module dxp3-microservice-web-crawler/WebCrawler
 */
const DownloadJob = require('./DownloadJob');
const http = require('dxp3-net-http');
const logging = require('dxp3-logging');
const rest = require('dxp3-microservice-rest');
// const Spider = require('./Spider');
// const SpiderEvent = require('./SpiderEvent');
// const SpiderJob = require('./SpiderJob');
// const SpiderRepository = require('./SpiderRepository');
const util = require('dxp3-util');
const WebCrawlerOptions = require('./WebCrawlerOptions');

const logger = logging.getLogger(canonicalName);

class WebCrawler extends rest.RestServer {

	constructor(args) {
		args = WebCrawlerOptions.parse(args);
		super(args);
		let self = this;
		self.addMethod('String crawl(Array<String> urls, [int rateLimit])', function(urls, rateLimit, response) {
			logger.debug('crawl(' + urls + ', ' + rateLimit + ')');
			self.crawl(urls, rateLimit, function(err, id) {
				response.send(err, id);
			});
		});
		self.addMethod('String queue(Array<String> urls, [int rateLimit])', function(urls, rateLimit, response) {
			logger.debug('queue(' + urls + ', ' + rateLimit + ')');
			self.queue(urls, rateLimit, function(err, id) {
				response.send(err, id);
			});
		});
		this.httpSpider = new http.HTTPSpider();
		this.httpSpider.on(http.HTTPSpiderEvent.ERROR, function() {
			// console.log('error');
		});
		this.httpSpider.on(http.HTTPSpiderEvent.PAUSED, function() {
			// console.log('spider has paused');
		});
		this.httpSpider.on(http.HTTPSpiderEvent.PAUSING, function() {
			// console.log('spider is pausing');
		});
		this.httpSpider.on(http.HTTPSpiderEvent.RUNNING, function() {
			// console.log('spider is running');
		});
		this.httpSpider.on(http.HTTPSpiderEvent.STARTING, function() {
			// console.log('spider is starting');
		});
		this.httpSpider.on(http.HTTPSpiderEvent.STOPPED, function() {
			// console.log('spider has stopped');
		});
		this.httpSpider.on(http.HTTPSpiderEvent.STOPPING, function() {
			// console.log('spider is stopping');
		});
		this.httpSpider.on(http.HTTPSpiderEvent.FINISHED, function(id, url) {
			console.log('Finished: ' + id + ': ' + url);
		});
		this.httpSpider.on(http.HTTPSpiderEvent.FOUND, function(source, destination, absoluteDestination, contentType) {
//			console.log('Found: ' + source + ' -> ' + destination + ' (' + absoluteDestination + ')');
		});
		this.httpSpider.on(http.HTTPSpiderEvent.VISITING, function(url) {
//			console.log('Visiting: ' + url);
		});
		this.httpSpider.on(http.HTTPSpiderEvent.VISITED, function(url, statusCode, contentType) {
			console.log('Visited: ' + statusCode + ': ' + contentType + ': ' + url);
		});
	}

	reset() {
		this.clear();
	}

	clear() {
//		this.httpSpiderRepository.clear();
	}

	list() {
//		return this.httpSpiderRepository.getToBeProcessed();
		return [];
	}

	crawl(_urls, _rateLimit, callback) {
		this.queue(_urls, _rateLimit, callback);
	}

	queue(_urls, _rateLimit, callback) {
		if(_urls === undefined || _urls === null) {
			return;
		}
		let urls = [];
		if(typeof _urls === 'string') {
			_urls = _urls.trim();
			if(_urls.length <= 0) {
				return;
			}
			urls.push(_urls);
		} else if(Array.isArray(_urls)) {
			for(let i=0;i < _urls.length;i++) {
				let _url = _urls[i];
				if(_url === undefined || _url === null) {
					continue;
				}
				_url = _url.trim();
				if(_url.length <= 0) {
					continue;
				}
				urls.push(_url);

			}
		}
		if(urls.length <= 0) {
			return;
		}
		let rateLimit = -1;
		if(_rateLimit != undefined && _rateLimit != null) {
			if(typeof _rateLimit === 'string') {
				_rateLimit = parseInt(_rateLimit, 10);
			}
			if(Number.isInteger(_rateLimit)) {
				rateLimit = _rateLimit;
			}
		}
		this.httpSpider.queue({urls:urls,
							   rateLimit:rateLimit});
		if(callback) {
			callback(null, spiderJob.id);
		}
	}

	spider(_urls, _rateLimit, callback) {
		this.queue(_urls, _rateLimit, callback);
	}

	visit(_urls, _rateLimit, callback) {
		this.queue(_urls, _rateLimit, callback);
	}

	pausing(callback) {
		let self = this;
		// Defensive programming...check input...
		if(callback === undefined || callback === null) {
			return;
		}
		if(typeof callback != 'function') {
			return;
		}
		super.pausing(function() {
			if(self.httpSpider.isPaused()) {
				callback();
			} else {
				self.httpSpider.once(http.HTTPSpiderEvent.PAUSED, function() {
					callback();
				});
				self.httpSpider.pause();
			}
		});
	}

	/**
	 * @override
	 * @throws {MicroServiceError.ILLEGAL_ARGUMENT}
	 */
	starting(callback) {
		let self = this;
		// Defensive programming...check input...
		if(callback === undefined || callback === null) {
			return;
		}
		if(typeof callback != 'function') {
			return;
		}
		super.starting(function() {
			if(self.httpSpider.isRunning()) {
				callback();
			} else {
				self.httpSpider.once(http.HTTPSpiderEvent.RUNNING, function() {
					callback();
				});
				self.httpSpider.start();
			}
		});
	}

	/**
	 * @override
	 */
	stopping(callback) {
		let self = this;
		// Defensive programming...check input...
		if(callback === undefined || callback === null) {
			return;
		}
		if(typeof callback != 'function') {
			return;
		}
		super.stopping(function() {
			if(self.httpSpider.isStopped()) {
				callback();
			} else {
				self.httpSpider.once(http.HTTPSpiderEvent.STOPPED, function() {
					callback();
				});
				self.httpSpider.stop();
			}
		});
	}

	/**
	 * @override
	 */
	get type() {
		return rest.MicroServiceType.WEB_CRAWLER;
	}

	/**
	 * @override
	 */
	get compatibleTypes() {
		return [rest.MicroServiceType.WEB_CRAWLER_CLIENT];
	}

	static main() {
		try {
			let webCrawlerOptions = WebCrawlerOptions.parseCommandLine();
			logging.setLevel(webCrawlerOptions.logLevel);
			if(webCrawlerOptions.help) {
				util.Help.print(this);
				return;
			}
			// We need a name
			let webCrawlerName = webCrawlerOptions.name;
			if(webCrawlerName === undefined || webCrawlerName === null || webCrawlerName.length <= 0) {
				logger.fatal('Missing name. Please supply a name for this WebCrawler using the -name argument.');
				logger.info('Exiting due to fatal error.');
				process.exit();
			}
			let webCrawler = new WebCrawler(webCrawlerOptions);
			webCrawler.on(rest.MicroServiceEvent.ERROR, function(err) {
				logger.error(err.message);
			});
			webCrawler.on(rest.MicroServiceEvent.RUNNING, function() {
				console.log('To get help include the -help option:');
				console.log('node WebCrawler -help');
				console.log('');
				console.log('WebCrawler \'' + webCrawler.name + '\' running at port ' + webCrawler.port);
			});
			webCrawler.start();
		} catch(exception) {
			console.log('EXCEPTION: ' + exception.code + ': ' + exception.message);
		}
	}
}
// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
	WebCrawler.main();
	return;
}

module.exports = WebCrawler;