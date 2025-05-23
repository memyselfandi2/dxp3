/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-net-http
 *
 * NAME
 * HTTPSpiderJob
 */
const packageName = 'dxp3-net-http';
const moduleName = 'HTTPSpiderJob';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * @module dxp3-net-http/HTTPSpiderJob
 */
const css = require('dxp3-lang-css');
const EventEmitter = require('events');
const fs = require('fs');
const html = require('dxp3-lang-html');
const http = require('http');
const https = require('https');
// It's important to at least log warnings and errors.
const logging = require('dxp3-logging');
const HTTPDownloader = require('./HTTPDownloader');
const HTTPError = require('./HTTPError');
const HTTPSpiderEvent = require('./HTTPSpiderEvent');
const HTTPSpiderLink = require('./HTTPSpiderLink');
const HTTPSpiderRepository = require('./HTTPSpiderRepository');
const HTTPSpiderRule = require('./HTTPSpiderRule');
// We use the util.Help class to print out help information.
const util = require('dxp3-util');
const uuid = require('dxp3-uuid');

const logger = logging.getLogger(canonicalName);

class HTTPSpiderJob extends EventEmitter {

	constructor(_urlString, _followRedirects, _followHosts, _rateLimit, _timeout, _filterContentTypes, _filterStatusCodes, _filterPaths, _filterHosts, _downloadFolder, _useragent) {
		if(_urlString === undefined || _urlString === null) {
			throw HTTPError.ILLEGAL_ARGUMENT;
		}
		if(typeof _urlString != 'string') {
			throw HTTPError.ILLEGAL.ARGUMENT;
		}
		_urlString = _urlString.trim();
		if(_urlString.length <= 0) {
			throw HTTPError.ILLEGAL.ARGUMENT;
		}
		super();
		// Every job has an unique identifier.
		this._id = uuid.create();
		// Every job has a repository of to be processed, processing and processed lists.
		this._repository = new HTTPSpiderRepository();
		// Next we store our initial constructor arguments in an _args object.
		this._args = {};
		// The supplied URL is made absolute.
		let _urlStringLowerCase = _urlString.toLowerCase();
		if(!_urlStringLowerCase.startsWith('http')) {
			_urlString = 'http://' + _urlString;
		}
		this._args.urlString = _urlString;
		this._args.url = new URL(_urlString);
// console.log('job filter content types : ' + _filterContentTypes);
		let httpSpiderLink = new HTTPSpiderLink(null, this._args.url, 0);
		this._repository.addToBeProcessedConditional(httpSpiderLink);
		this._httpSpiderRule = new HTTPSpiderRule(this._args.url,
												  _followRedirects,
												  _followHosts,
												  _filterContentTypes,
												  _filterStatusCodes,
												  _filterPaths,
												  _filterHosts);
		this._args.rateLimit = -1;
		if(_rateLimit != undefined && _rateLimit != null) {
			this._args.rateLimit = _rateLimit;
		}
		this._args.timeout = 60000;
		if(_timeout != undefined && _timeout != null) {
			this._args.timeout = _timeout;
		}
		this._args.downloadFolder = null;
		if(_downloadFolder != undefined && _downloadFolder != null) {
			this._args.downloadFolder = _downloadFolder;
		}
		this._lastExecutionTime = null;
		this._args.useragent = _useragent;
		this._cookiesByDomain = new Map();
	}

	/**************************************
	 * GETTERS
	 *************************************/

	get downloadFolder() {
		return this.getDownloadFolder();
	}

	getDownloadFolder() {
		return this._args.downloadFolder;
	}

    get filterContentTypes() {
    	return this.getFilterContentTypes();
    }

	getFilterContentTypes() {
    	return this._httpSpiderRule.filterContentTypes;
	}

	get filterHosts() {
		return this.getFilterHosts();
	}

	getFilterHosts() {
		return this._httpSpiderRule.filterHosts;
	}

	get filterPaths() {
		return this.getFilterPaths();
	}

	getFilterPaths() {
		return this._httpSpiderRule.filterPaths;
	}

	get filterStatusCodes() {
		return this.getFilterStatusCodes();
	}

	getFilterStatusCodes() {
		return this._httpSpiderRule.filterStatusCodes;
	}

	get followHosts() {
		return this.getFollowHosts();
	}

	getFollowHosts() {
		return this._httpSpiderRule.followHosts;
	}

	get followRedirects() {
		return this.getFollowRedirects();
	}

	getFollowRedirects() {
		return this._httpSpiderRule.followRedirects;
	}

	get id() {
		return this.getID();
	}

	getID() {
		return this._id;
	}

	get lastExecutionTime() {
		return this.getLastExecutionTime();
	}

	getLastExecutionTime() {
		return this._lastExecutionTime;
	}

	get rateLimit() {
		return this.getRateLimit();
	}

	getRateLimit() {
		return this._args.rateLimit;
	}

	get url() {
		return this.getURL();
	}

	getURL() {
		return this._args.urlString;
	}

	/**************************************
	 * SETTERS
	 *************************************/

	set downloadFolder(_downloadFolder) {
		this._args.downloadFolder = _downloadFolder;
		if(!this._args.downloadFolder.endsWith(path.sep)) {
			this._args.downloadFolder += path.sep;
		}		
	}

	setDownloadFolder(_downloadFolder) {
		this.downloadFolder = _downloadFolder;
	}

	set filterContentTypes(_filterContentTypes) {
		this._httpSpiderRule.filterContentTypes = _filterContentTypes;
	}

	setFilterContentTypes(_filterContentTypes) {
		this.filterContentTypes = _filterContentTypes;
	}

	set filterHosts(_filterHosts) {
		this._httpSpiderRule.filterHosts = _filterHosts;
	}

	setFilterHosts(_filterHosts) {
		this.filterHosts = _filterHosts;
	}

	set filterPaths(_filterPaths) {
		this._httpSpiderRule.filterPaths = _filterPaths;
	}

	setFilterPaths(_filterPaths) {
		this.filterPaths = _filterPaths;
	}

	set filterStatusCodes(_filterStatusCodes) {
		this._httpSpiderRule.filterStatusCodes = _filterStatusCodes;
	}

	setFilterStatusCodes(_filterStatusCodes) {
		this.filterStatusCodes = _filterStatusCodes;
	}

	set followHosts(_followHosts) {
		this._httpSpiderRule.followHosts = _followHosts;
	}

	setFollowHosts(_followHosts) {
		this.followHosts = _followHosts;
	}

	set followRedirects(_followRedirects) {
		this._httpSpiderRule.followRedirects = _followRedirects;
	}

	setFollowRedirects(_followRedirects) {
		this.followRedirects = _followRedirects;
	}

	set rateLimit(_rateLimit) {
		this.setRateLimit(_rateLimit);
	}

	setRateLimit(_rateLimit) {
		this._args.rateLimit = _rateLimit;
	}

	set timeout(_timeout) {
		this.setTimeout(_timeout);
	}

	setTimeout(_timeout) {
		this._args.timeout = _timeout;
	}

	set useragent(_useragent) {
		this.setUserAgent(_useragent);
	}

	setUserAgent(_useragent) {
		this._args.useragent = _useragent;
	}

	_foundA() {
	}

	_foundArea() {
	}

	_foundAudio() {
	}

	_foundEmbed() {
	}

	_foundIframe() {
	}

	_foundImg(sourceURL, baseURL, destinationURL, contentType) {
// console.log('found image! on ' + sourceURL + ' located at ' + destinationURL + ' and baseURL ' + baseURL);
	}

	_foundInput() {
	}

	_foundLink() {
	}

	_foundScript() {
	}

	_foundSource() {
	}

	_foundTrack() {
	}

	_foundVideo() {
	}

	_foundElement(sourceURL, baseURL, depth, elementNode) {
// console.log('foundElement: ' + sourceURL + ': ' + elementNode.toString());
		let self = this;
		let destinationURLs = [];
		let contentType = elementNode.getAttribute('type');
		let toBeHTTPSpidered = false;
		switch(elementNode.getNodeName()) {
			case 'a':
				destinationURLs.push(elementNode.getAttribute('href'));
				self._foundA(sourceURL, baseURL, destinationURLs[0], contentType);
				break;
			case 'area':
				destinationURLs.push(elementNode.getAttribute('href'));
				self._foundArea(sourceURL, baseURL, destinationURLs[0], contentType);
				if(contentType === null) {
					contentType = 'image';
				}
				break;
			case 'audio':
				destinationURLs.push(elementNode.getAttribute('src'));
				self._foundAudio(sourceURL, baseURL, destinationURLs[0], contentType);
				if(contentType === null) {
					contentType = 'audio';
				}
				break;
			case 'embed':
				destinationURLs.push(elementNode.getAttribute('src'));
				self._foundEmbed(sourceURL, baseURL, destinationURLs[0], contentType);
				break;
			case 'iframe':
				destinationURLs.push(elementNode.getAttribute('src'));
				self._foundIframe(sourceURL, baseURL, destinationURLs[0], contentType);
				if(contentType === null) {
					contentType = 'text/html';
				}
				break;
			case 'img':
				destinationURLs.push(elementNode.getAttribute('src'));
				let srcset = elementNode.getAttribute('srcset');
				if(srcset != undefined && srcset != null) {
					let entries = srcset.split(',');
					for(let i=0;i < entries.length;i++) {
						let entry = entries[i].trim().split(' ');
						destinationURLs.push(entry[0]);
					}
				}
				self._foundImg(sourceURL, baseURL, destinationURLs[0], contentType);
				if(contentType === null) {
					contentType = 'image';
				}
				break;
			case 'input':
				destinationURLs.push(elementNode.getAttribute('src'));
				self._foundInput(sourceURL, baseURL, destinationURLs[0], contentType);
				if(contentType === null) {
					contentType = 'image';
				}
				break;
			case 'link':
				destinationURLs.push(elementNode.getAttribute('href'));
				self._foundLink(sourceURL, baseURL, destinationURLs[0], contentType);
				break;
			case 'script':
				destinationURLs.push(elementNode.getAttribute('src'));
				self._foundScript(sourceURL, baseURL, destinationURLs[0], contentType);
				if(contentType === null) {
					contentType = 'text/javascript';
				}
				break;
			case 'source':
				destinationURLs.push(elementNode.getAttribute('src'));
				self._foundSource(sourceURL, baseURL, destinationURLs[0], contentType);
				break;
			case 'track':
				destinationURLs.push(elementNode.getAttribute('src'));
				self._foundTrack(sourceURL, baseURL, destinationURLs[0], contentType);
				if(contentType === null) {
					contentType = 'text/vtt';
				}
				break;
			case 'video':
				destinationURLs.push(elementNode.getAttribute('src'));
				self._foundVideo(sourceURL, baseURL, destinationURLs[0], contentType);
				if(contentType === null) {
					contentType = 'video';
				}
				break;
			default:
				break;
		}
		if(destinationURLs.length <= 0) {
			return;
		}
		for(let i=0;i < destinationURLs.length;i++) {
			let destinationURL = destinationURLs[i];
			if(destinationURL === undefined || destinationURL === null) {
				continue;
			}
			let httpSpiderLink = null;
			try {
				httpSpiderLink = new HTTPSpiderLink(sourceURL, destinationURL, depth, contentType);
			} catch(_exception) {
				logger.warn('Exception while creating HTTPSpider link for source \'' + sourceURL + '\' and destination \'' + destinationURL + '\': ' + _exception);
				self.emit(HTTPSpiderEvent.FOUND_INVALID_LINK,
										sourceURL,
										destinationURL);
				return;
			}
			self._foundURL(httpSpiderLink);
		}
	}

	_foundURL(httpSpiderLink) {
		// console.log('foundURL:' + httpSpiderLink.toString());
		if(!this._httpSpiderRule.follow(httpSpiderLink)) {
			// console.log('IGNORING: ' + httpSpiderLink.toString());
			this.emit(HTTPSpiderEvent.IGNORED_LINK,
	 				  httpSpiderLink.getSourceURLString(),
					  httpSpiderLink.getDestinationURLString(),
					  httpSpiderLink.getContentType());
			return;
		}
		// console.log('to be followed: ' + httpSpiderLink.toString());
		this.emit(HTTPSpiderEvent.TO_BE_FOLLOWED_LINK,
 				  httpSpiderLink.getSourceURLString(),
				  httpSpiderLink.getDestinationURLString(),
				  httpSpiderLink.getContentType());
		this._repository.addToBeProcessedConditional(httpSpiderLink);
		// if(this.spiderRule === undefined || this.spiderRule === null) {
		// 	self._repository.addToBeProcessedConditional(destinationAbsoluteURL);
		// } else if(this.spiderRule.match(url)) {
		// 	self._repository.addToBeProcessedConditional(destinationAbsoluteURL);
		// }
	}

	_processCSS(httpSpiderLink, resp, data, callback) {
		logger.trace('_processCSS(...)');
		let sourceURL = httpSpiderLink.getDestinationURLString();
		let cssReader = new css.CSSReader();
//		console.log('css data: ' + data);
		cssReader.parse(data, (err, cssStyleSheet) => {
			return callback(null, httpSpiderLink);
		});
	}

	_processHTML(httpSpiderLink, resp, data, callback) {
		let self = this;
		let sourceURL = httpSpiderLink.getDestinationURLString();
		let htmlReader = new html.HTMLReader();
		htmlReader.parse(data, (err, domDocument) => {
			let baseURL = sourceURL;
			// First we check if there is a base element
			domDocument.query('base', (err, baseElement) => {
				if(baseElement != undefined && baseElement != null) {
					baseURL = baseElement.getAttribute('href');
				}
				let query = 'a,area,audio,embed,iframe,img,input,link,script,source,track,video';
				domDocument.querySelectorAll(query, function(err, selection) {
					if(err) {
						return callback(null, httpSpiderLink);
					}
					if(selection === undefined || selection === null) {
						return callback(null, httpSpiderLink);
					}
					for(const elementNode of selection) {
						self._foundElement(sourceURL, baseURL, httpSpiderLink.getDepth() + 1, elementNode);
					}
					return callback(null, httpSpiderLink);
				});
			});
		});
	}

	_process(httpSpiderLink, resp, callback) {
		logger.trace('_process(...): start.');
		let self = this;
	  	let contentType = resp.headers['content-type'];
	  	let statusCode = resp.statusCode;
  		httpSpiderLink.setStatusCode(statusCode);
  		httpSpiderLink.setContentType(contentType);	
	  	if(statusCode === 301 || statusCode === 302 || statusCode === 303 || statusCode === 307 || statusCode === 308) {
		  	this._process30X(httpSpiderLink, resp, function(_error, _httpSpiderLink) {
  				logger.trace('_process(...): end.');
  				callback(_error, _httpSpiderLink);
		  	});
	  	} else if(statusCode === 200) {
		  	this._process200(httpSpiderLink, resp, function(_error, _httpSpiderLink) {
  				logger.trace('_process(...): end.');
				callback(_error, _httpSpiderLink);		  		
		  	});
	  	} else {
			logger.trace('_process(...): end.');
	  		callback(null, httpSpiderLink);
	  	}
	}

	_process30X(httpSpiderLink, resp, callback) {
		logger.trace('_process30X(...): start.');
  		let redirectURL = resp.headers['location'];
  		logger.trace('redirect URL: ' + redirectURL);
		if(redirectURL === undefined || redirectURL === null) {
			logger.trace('_process30X(...): end.');
			return callback(null, httpSpiderLink);
		}
		let redirectLink = new HTTPSpiderLink(httpSpiderLink.getDestinationURLString(), redirectURL, httpSpiderLink.getDepth(), null, httpSpiderLink.getStatusCode());
		// console.log('redirectLink: ' + redirectLink.getStatusCode());
		// this.emit(HTTPSpiderEvent.FOUND_LINK_REDIRECT,
		// redirectLink.getSourceURLString(),
		// redirectLink.getDestinationURLString(),
		// httpSpiderLink.getStatusCode());

		if(!this._httpSpiderRule.followRedirects) {
			logger.debug('_process30X(...): Ignoring redirect from \'' + redirectLink.getSourceURLString() + '\' to \'' + redirectLink.getDestinationURLString() + '\'.');
			this.emit(HTTPSpiderEvent.IGNORED_LINK,
	 				  redirectLink.getSourceURLString(),
					  redirectLink.getDestinationURLString(),
					  redirectLink.getContentType());
			logger.trace('_process30X(...): end.');
			return callback(null, redirectLink);
		}
		this._foundURL(redirectLink);
		logger.trace('_process30X(...): end.');
		return callback(null, redirectLink);
	}

	_process200(httpSpiderLink, resp, callback) {
		logger.trace('_process200(...)');
		let self = this;
		let contentType = httpSpiderLink.getContentType();
		let statusCode = httpSpiderLink.getStatusCode();
	  	if(this._args.downloadFolder === null) {
			if(contentType.startsWith('text/html')) {
				let data = '';
				resp.on('data', (chunk) => {
					data += chunk;
				});
				resp.on('end', () => {
					self._processHTML(httpSpiderLink, resp, data, callback);
				});
			} else if(contentType.startsWith('text/css')) {
				let data = '';
				resp.on('data', (chunk) => {
					data += chunk;
				});
				resp.on('end', () => {
					self._processCSS(httpSpiderLink, resp, data, callback);
				});
			} else {
				callback(null, httpSpiderLink);
			}
	  	} else {
	  		this._download(httpSpiderLink, resp, callback);
	  	}
  	}

  	_download(httpSpiderLink, resp, callback) {
		logger.trace('_download(...)');
		let self = this;
		let contentType = httpSpiderLink.getContentType();
		if(!self._httpSpiderRule.filter(httpSpiderLink)) {
			if(contentType.startsWith('text/html')) {
				let data = '';
				resp.on('data', (chunk) => {
					data += chunk;
				});

				resp.on('end', () => {
					self._processHTML(httpSpiderLink, resp, data, callback);
				});
			} else if(contentType.startsWith('text/css')) {
				let data = '';
				resp.on('data', (chunk) => {
					data += chunk;
				});

				resp.on('end', () => {
					self._processCSS(httpSpiderLink, resp, data, callback);
				});
			} else {
				callback(null, httpSpiderLink);
			}
		} else {
	  		let httpDownloader = new HTTPDownloader({downloadFolder: this._args.downloadFolder});
	  		let self = this;
	  		httpDownloader._download(httpSpiderLink.getDestinationURLString(), resp, contentType, function(_error, _data, _filePath) {
				if(contentType.startsWith('text/html')) {
					self._processHTML(httpSpiderLink, resp, _data, callback);
				} else if(contentType.startsWith('text/css')) {
					self._processCSS(httpSpiderLink, resp, _data, callback);
				} else {
					callback(null, httpSpiderLink);
				}
			});
	  	}
  	}

		  // 	if(this.downloadFolder != null) {
				// let filename = 'index.html';
				// if(!urlpath.endsWith('/')) {
				// 	let lastIndexOfSlash = urlpath.lastIndexOf('/');
				// 	filename = urlpath.substring(lastIndexOfSlash);
				// 	if(!filename.endsWith('.html') && !filename.endsWith('.htm')) {
				// 		filename += '.html';
				// 	}
				// }
		  // 	} else {
		  // 	}
	// _processValidResponse(sourceURL, contentType, ) {
	// 	if(contentType.startsWith('text/html')) {
	// 		let data = '';
	// 		let url = new URL(sourceURL);
	// 		let urlpath = url.pathname;
	// 		let filename = 'index.html';
	// 		if(!urlpath.endsWith('/')) {
	// 			let lastIndexOfSlash = urlpath.lastIndexOf('/');
	// 			filename = urlpath.substring(lastIndexOfSlash);
	// 			if(!filename.endsWith('.html') && !filename.endsWith('.htm')) {
	// 				filename += '.html';
	// 			}
	// 		}
	// 		urlpath = urlpath.replace('/', path.sep);
	// 		fs.mkdir(this.downloadFolder + urlpath, { recursive: true }, (err) => {
	// 			let filePath = this.downloadFolder + urlpath + filename;
	// 			let file = fs.createWriteStream(filePath);
	// 			// console.log('HTML file: ' + filePath);

	// 			resp.on('data', (chunk) => {
	// 				file.write(chunk);
	// 				data += chunk;
	// 			});

	// 			resp.on('end', () => {
	// 				file.end();
	// 				this._processHTML(sourceURL, resp, data, statusCode, contentType, callback);
	// 			});
	// 		});
	// 	} else if(contentType.startsWith('image')) {
	// 		if(this.downloadFolder != null) {
	// 			let fileName = sourceURL.substring(sourceURL.lastIndexOf('/'));
	// 			let filePath = this.downloadFolder + fileName;
	// 			let file = fs.createWriteStream(filePath);

	// 			resp.pipe(file);
	// 		}
	// 		return callback(null, statusCode, contentType);
	// 	}
	// }

	// _download(callback) {
	// 	if(contentType.startsWith('text/html')) {
	// 		let data = '';
	// 		let url = new URL(sourceURL);
	// 		let urlpath = url.pathname;
	// 		let filename = 'index.html';
	// 		if(!urlpath.endsWith('/')) {
	// 			let lastIndexOfSlash = urlpath.lastIndexOf('/');
	// 			filename = urlpath.substring(lastIndexOfSlash);
	// 			if(!filename.endsWith('.html') && !filename.endsWith('.htm')) {
	// 				filename += '.html';
	// 			}
	// 		}
	// 		urlpath = urlpath.replace('/', path.sep);
	// 		fs.mkdir(this.downloadFolder + urlpath, { recursive: true }, (err) => {
	// 			let filePath = this.downloadFolder + urlpath + filename;
	// 			let file = fs.createWriteStream(filePath);
	// 			console.log('HTML file: ' + filePath);

	// 			resp.on('data', (chunk) => {
	// 				file.write(chunk);
	// 				data += chunk;
	// 			});

	// 			resp.on('end', () => {
	// 				file.end();
	// 				this._processHTML(sourceURL, resp, data, statusCode, contentType, callback);
	// 			});
	// 		});
	// 	} else if(contentType.startsWith('image')) {
	// 		if(this.downloadFolder != null) {
	// 			let fileName = sourceURL.substring(sourceURL.lastIndexOf('/'));
	// 			let filePath = this.downloadFolder + fileName;
	// 			console.log(filePath);
	// 			let file = fs.createWriteStream(filePath);

	// 			resp.pipe(file);
	// 		}
	// 		return callback(null, statusCode, contentType);
	// 	}
	// }

	execute(callback) {
		let httpSpiderLink = this._repository.getNextToBeProcessed();
		if(httpSpiderLink === undefined || httpSpiderLink === null) {
			this.emit(HTTPSpiderEvent.JOB_FINISHED, this.id);
			return callback();
		}
		let self = this;
		this._visit(httpSpiderLink, function(_error, result) {
			if(_error != null) {
				console.log('error visiting: ' + _error);
				callback();
				return;
			}
			self._lastExecutionTime = Date.now();
	  		self._repository.processed(httpSpiderLink);
	  		let contentType = result.getContentType();
			let statusCode = result.getStatusCode();
			self.emit(HTTPSpiderEvent.FOLLOWED_LINK, 
									httpSpiderLink.getSourceURLString(),
									httpSpiderLink.getDestinationURLString(),
									contentType,
									statusCode);
			if(self._httpSpiderRule.filter(result)) {
				if(statusCode >= 300 && statusCode < 400) {
					self.emit(HTTPSpiderEvent.FOUND_REDIRECT, 
											httpSpiderLink.getSourceURLString(),
											httpSpiderLink.getDestinationURLString(),
											result.getDestinationURLString(),
											statusCode);
				} else if(statusCode === 404) {
					self.emit(HTTPSpiderEvent.FOUND_DEAD_LINK,
											httpSpiderLink.getSourceURLString(),
											httpSpiderLink.getDestinationURLString());
				} else {
					self.emit(HTTPSpiderEvent.FOUND_LINK,
											httpSpiderLink.getSourceURLString(),
											httpSpiderLink.getDestinationURLString(),
											contentType,
											statusCode);
				}
			}
			callback();
		});
	}

	_visit(httpSpiderLink, callback) {
		let self = this;

		let urlString = httpSpiderLink.getDestinationURLString();
		self.emit(HTTPSpiderEvent.FOLLOWING_LINK, httpSpiderLink.getSourceURLString(), httpSpiderLink.getDestinationURLString());
        let options = {};
        if(this._args.timeout > 0) {
        	options.timeout = this._args.timeout;
        }
        options.headers = {};
        options.headers["User-Agent"] = this._args.useragent;
console.log('urlString: ' + urlString);
		let cookiesArray = this.getCookiesByURL(urlString);
		if(cookiesArray != null) {
	        let cookie = '';
    	    for(let i=0;i < cookiesArray.length;i++) {
    	    	let httpCookie = cookiesArray[i];
        	    cookie += httpCookie.key + '=' + httpCookie.value + ';'
        	}
	        options.headers["Cookie"] = [cookie];
	    }
		if(urlString.startsWith('http:')) {
			http.get(urlString, options, (resp) => {
			  	self._process(httpSpiderLink, resp, callback);
			}).on("error", (err) => {
			  callback(err);
			});
		} else if(urlString.startsWith('https:')) {
			https.get(urlString, options, (resp) => {
				self._process(httpSpiderLink, resp, callback);
			}).on("error", (err) => {
			  callback(err);
			});
		} else {
			callback(new Error('Unhandled protocol'));
		}
	}

	getCookiesByURL(_url) {
		if(typeof _url === 'string') {
			_url = new URL(_url);
		}
		let domain = _url.hostname;
		let domainParts = domain.split('.');
		let numberOfParts = domainParts.length;
		let tmpDomain = domainParts[numberOfParts - 1];
		let result = [];
		let i=numberOfParts - 2;
		do {
			tmpDomain = domainParts[i] + '.' + tmpDomain;
			let cookiesByPath = this._cookiesByDomain.get(tmpDomain);
			if(cookiesByPath != undefined && cookiesByPath != null) {
				let pathname = _url.pathname;
				for(let [cookiePath, cookieMap] of cookiesByPath) {
					if(pathname.startsWith(cookiePath)) {
						result = result.concat([...cookieMap.values()]);
					}
				}
			}
			i--;
		} while(i >= 0);
		return result;
	}

	hasToBeProcessed() {
		return this._repository.hasToBeProcessed();
	}

	getToBeProcessed() {
		let result = [];
		for(const httpSpiderLink of this._repository.getToBeProcessed()) {
			// console.log('task: ' + JSON.stringify(task));
			// console.log('task destinationAbsolute: ' + task.destinationAbsolute);
			result.push(httpSpiderLink.getDestinationURLString());
		}
		return result;
	}
}
// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
    util.Help.print(HTTPSpiderJob);
    return;
}
module.exports = HTTPSpiderJob;