/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-net-http
 *
 * NAME
 * HTTPClient
 */
const packageName = 'dxp3-net-http';
const moduleName = 'HTTPClient';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * @module dxp3-net-http/HTTPClient
 */
const http = require('http');
const HTTPClientError = require('./HTTPClientError');
const HTTPClientOptions = require('./HTTPClientOptions');
const HTTPCookie = require('./HTTPCookie');
const https = require('https');
// It's important to at least log warnings and errors.
const logging = require('dxp3-logging');
// We use the util.Help class to print out help information.
const util = require('dxp3-util');

const logger = logging.getLogger(canonicalName);

class HTTPClient {
    /*********************************************
     * CONSTRUCTOR
     ********************************************/

	 constructor(_options) {
		this._options = HTTPClientOptions.parse(_options);
		// A HTTPClient typically follows redirects.
		// This behavior can be turned off.
		logger.info('Follow redirects: ' + this._options.followRedirects);
		logger.info('Timeout         : ' + this._options.timeout);
		logger.info('Useragent       : ' + this._options.useragent);
		this._history = [];
		this._historyIndex = -1;
		this._url = null;
		this._cookiesByDomain = new Map();
	}

    /*********************************************
     * PUBLIC METHODS
     ********************************************/

	back(_callback) {
		logger.trace('back(...): start.');
		// We need at least a callback function.
		if(arguments.length <= 0) {
			// Missing arguments. This could be a programming error.
			logger.error('back(...): Missing arguments.')
			logger.trace('back(...): end.');
			throw HTTPClientError.ILLEGAL_ARGUMENT;
		}
		if(_callback === undefined || _callback === null) {
			logger.error('back(...): _callback is undefined or null.');
			logger.trace('back(...): end.');
			throw HTTPClientError.ILLEGAL_ARGUMENT;
		}
		if(typeof _callback != 'function') {
			logger.error('back(...): _callback is not a function.');
			logger.trace('back(...): end.');
			throw HTTPClientError.ILLEGAL_ARGUMENT;
		}
		// Check if there is something to go back to.
		if(this._history.length <= 0) {
			logger.trace('back(...): end.');
			return _callback(HTTPClientError.NO_HISTORY);
		}
		if(this._historyIndex <= 0) {
			logger.trace('back(...): end.');
			return _callback(HTTPClientError.AT_HISTORY_START);
		}
		this._historyIndex--;
		let url = this._history[this._historyIndex];
		logger.debug('back(...): Going back to \'' + url + '\'.');
		this._get(url, false, (_error, _resp, _url) => {
			logger.trace('back(...): end.');
			_callback(_error, _resp, _url);
		});
	}

	clearHistory() {
		logger.trace('clearHistory(...): start.');
		this._history = [];
		this._historyIndex = -1;
		logger.trace('clearHistory(...): end.');
	}

	clearCookies(_domain) {
		logger.trace('clearCookies(...): start.');
		if(_domain === undefined || _domain === null || _domain.length <= 0) {
			logger.debug('clearCookies(...): Clearing all cookies.');
			this._cookiesByDomain = new Map();
		} else {
			logger.debug('clearCookies(...): Clearing cookies for domain \'' + _domain + '\'.');
			this._cookiesByDomain.delete(_domain);
		}
		logger.trace('clearCookies(...): end.');
	}

	forward(_callback) {
		logger.trace('forward(...): start.');
		// We need at least a callback function.
		if(arguments.length <= 0) {
			// Missing arguments. This could be a programming error.
			logger.error('forward(...): Missing arguments.')
			logger.trace('forward(...): end.');
			throw HTTPClientError.ILLEGAL_ARGUMENT;
		}
		if(_callback === undefined || _callback === null) {
			logger.error('forward(...): _callback is undefined or null.');
			logger.trace('forward(...): end.');
			throw HTTPClientError.ILLEGAL_ARGUMENT;
		}
		if(typeof _callback != 'function') {
			logger.error('forward(...): _callback is not a function.');
			logger.trace('forward(...): end.');
			throw HTTPClientError.ILLEGAL_ARGUMENT;
		}
		// Check if there is something to go forward to.
		if(this._history.length <= 0) {
			logger.trace('forward(...): end.');
			return _callback(HTTPClientError.NO_HISTORY);
		}
		if(this._historyIndex >= (this._history.length - 1)) {
			logger.trace('forward(...): end.');
			return _callback(HTTPClientError.AT_HISTORY_END);
		}
		this._historyIndex++;
		let url = this._history[this._historyIndex];
		logger.debug('forward(...): Going forward to \'' + url + '\'.');
		this._get(url, false, (_error, _resp, _url) => {
			logger.trace('forward(...): end.');
			_callback(_error, _resp, _url);
		});
	}

	// {String|URL} _url, {Function} _callback
	// {String|URL} _url, {String} _baseURL, {Function} _callback
	// {Object} _args, {Function} _callback
	get(_args, _callback) {
		logger.trace('get(...): start.');
		let _url = null;
		let _baseURL = null;
		// We need at least an URL and a callback function.
		if(arguments.length <= 1) {
			// Missing arguments. This could be a programming error.
			logger.error('get(...): Missing arguments.')
			logger.trace('get(...): end.');
			throw HTTPClientError.ILLEGAL_ARGUMENT;
		}
		// The first argument may be an object containing the
		// other arguments, except for the callback, or it is a 
		// string or URL representing the url to get.
		if(arguments.length === 2) {
			if(_args === undefined || _args === null) {
				logger.error('get(...): _args is undefined or null.')
				logger.trace('get(...): end.');
				throw HTTPClientError.ILLEGAL_ARGUMENT;
			}
			if(_args instanceof URL) {
				_url = _args;
			} else if(typeof _args === 'object') {
				_url = _args.url;
				_baseURL = _args.baseURL;
			} else if(typeof _args === 'string') {
				_url = _args;
			} else {
				logger.error('get(...): _args is not an URL, not an Object nor a String.')
				logger.trace('get(...): end.');
				throw HTTPClientError.ILLEGAL_ARGUMENT;				
			}
		} else if(arguments.length === 3) {
			_url = arguments[0];
			_baseURL = arguments[1];
			_callback = arguments[2];
		} else {
			logger.error('get(...): Too many arguments.')
			logger.trace('get(...): end.');
			throw HTTPClientError.ILLEGAL_ARGUMENT;
		}
		if(_callback === undefined || _callback === null) {
			logger.error('get(...): _callback is undefined or null.');
			logger.trace('get(...): end.');
			throw HTTPClientError.ILLEGAL_ARGUMENT;
		}
		if(typeof _callback != 'function') {
			logger.error('get(...): _callback is not a function.');
			logger.trace('get(...): end.');
			throw HTTPClientError.ILLEGAL_ARGUMENT;
		}
		if(_url === undefined || _url === null) {
			logger.error('get(...): _url is undefined or null.')
			logger.trace('get(...): end.');
			return _callback(HTTPClientError.ILLEGAL_ARGUMENT);
		}
		if(typeof _url === 'string') {
			_url = _url.trim();
			if(_url.length <= 0) {
				logger.error('get(...): _url is an empty string.')
				logger.trace('get(...): end.');
				return _callback(HTTPClientError.ILLEGAL_ARGUMENT);
			}
			// Sometimes an url will contain &amp;
			_url = _url.replace(/&amp;/g, '&');
			try {
				if(_baseURL === undefined || _baseURL === null) {
					if(!(_url.toLowerCase().startsWith('http'))) {
						_url = 'http://' + _url;
					}
					_url = new URL(_url);
				} else {
					_url = new URL(_url, _baseURL);
				}
			} catch(exception) {
				logger.error('get(...): ' + exception + '.');
				logger.trace('get(...): end.');
				return _callback(HTTPClientError.ILLEGAL_ARGUMENT);
			}
		}
		if(!(_url instanceof URL)) {
			logger.error('get(...): _url is not an instance of an URL.');
			logger.trace('get(...): end.');
			return _callback(HTTPClientError.ILLEGAL_ARGUMENT);
		}
		if((_url.protocol != 'http:') && (_url.protocol != 'https:')) {
			logger.error('get(...): _url protocol \'' + _url.protocol + '\' is not supported.');
			logger.trace('get(...): end.');
			return _callback(HTTPClientError.ILLEGAL_ARGUMENT);
		}
		this._get(_url, true, (_error, _response, _url) => {
			logger.trace('get(...): end.');
			_callback(_error, _response, _url);
		});
	}

	getCookiesByURL(_url) {
		logger.trace('getCookiesByURL(...): start.');
		logger.debug('getCookiesByURL(...): URL \'' + _url + '\'.');
		let domain = _url.hostname;
		let domainParts = domain.split('.');
		let numberOfParts = domainParts.length;
		let tmpDomain = domainParts[numberOfParts - 1];
		let result = [];
		let i=numberOfParts - 2;
		do {
			tmpDomain = domainParts[i] + '.' + tmpDomain;
			logger.debug('getCookiesByURL(...): Domain \'' + tmpDomain + '\'.');
			let cookiesByPath = this._cookiesByDomain.get(tmpDomain);
			if(cookiesByPath != undefined && cookiesByPath != null) {
				let pathname = _url.pathname;
				logger.debug('getCookiesByURL(...): Path \'' + pathname + '\'.');
				for(let [cookiePath, cookieMap] of cookiesByPath) {
					if(pathname.startsWith(cookiePath)) {
						result = result.concat([...cookieMap.values()]);
					}
				}
			} else {
				logger.debug('getCookiesByURL(...): No cookies set for \'' + tmpDomain + '\'.');
			}
			i--;
		} while(i >= 0);
		logger.trace('getCookiesByURL(...): end.');
		return result;
	}

	getDomainsWithCookies() {
		return Array.from(this._cookiesByDomain.keys());
	}

	getCookiesByHost(_host) {
		return this.getCookiesByDomain(_host);
	}

	getCookiesByHostName(_hostName) {
		return this.getCookiesByDomain(_hostName);
	}

	getCookiesByDomain(_domain) {
		if(_domain === undefined || _domain === null) {
			return null;
		}
		let cookiesByPath = this._cookiesByDomain.get(_domain);
		if(cookiesByPath === undefined || cookiesByPath === null) {
			return null;
		}
		return cookiesByPath;
	}

	goBack(_callback) {
		return this.back(_callback);
	}

	goForward(_callback) {
		this.forward(_callback);
	}

	refresh(_callback) {
		logger.trace('refresh(...): start.');
		// We need at least a callback function.
		if(arguments.length <= 0) {
			// Missing arguments. This could be a programming error.
			logger.error('refresh(...): Missing arguments.')
			logger.trace('refresh(...): end.');
			throw HTTPClientError.ILLEGAL_ARGUMENT;
		}
		if(_callback === undefined || _callback === null) {
			logger.error('refresh(...): _callback is undefined or null.');
			logger.trace('refresh(...): end.');
			throw HTTPClientError.ILLEGAL_ARGUMENT;
		}
		if(typeof _callback != 'function') {
			logger.error('refresh(...): _callback is not a function.');
			logger.trace('refresh(...): end.');
			throw HTTPClientError.ILLEGAL_ARGUMENT;
		}
		// Check if there is something to refresh.
		if(this._url === undefined || this._url === null) {
			logger.trace('refresh(...): end.');
			return _callback(HTTPClientError.NO_URL);
		}
		this._get(this._url, false, (_error, _resp, _url) => {
			logger.trace('refresh(...): end.');
			if(_error) {
				return _callback(_error);
			}
			// If the history was cleared before this refresh we add
			// this url to the history as the first entry.
			if(this._historyIndex < 0) {
				this._addToHistory(_url);
			}
			_callback(_error, _resp, _url);
		});
	}

	reload(_callback) {
		this.refresh(_callback);
	}

    /*********************************************
     * GETTERS
     ********************************************/

	get followRedirects() {
		return this.getFollowRedirects();
	}

	getFollowRedirects() {
		return this._options.followRedirects;
	}

	get timeout() {
		return this.getTimeout();
	}

	getTimeout() {
		return this._options.timeout;
	}

	get history() {
		return this.getHistory();
	}

	getHistory() {
		return Array.from(this._history);
	}

	get useragent() {
		return this.getUserAgent();
	}

	getUserAgent() {
		return this._options.useragent;
	}

	get url() {
		return this.getURL();
	}

	getURL() {
		if(this._url === undefined || this._url === null) {
			return '';
		}
		return this._url.href;
	}

    /*********************************************
     * SETTERS
     ********************************************/

	set followRedirects(_followRedirects) {
		this.setFollowRedirects(_followRedirects);
	}

	setFollowRedirects(_followRedirects) {
		this._options.followRedirects = _followRedirects;
	}

	set timeout(_timeout) {
		this.setTimeout(_timeout);
	}

	setTimeout(_timeout) {
		this._options.timeout = _timeout;
	}

	set useragent(_useragent) {
		this.setUserAgent(_useragent);
	}

	setUserAgent(_useragent) {
		this._options.useragent = _useragent;
	}

    /*********************************************
     * PRIVATE METHODS
     ********************************************/

	_get(_url, _addToHistory, _callback) {
		logger.trace('_get(...): start.');
		logger.debug('_get(...): URL: ' + _url);
        let options = {};
        if(this._options.timeout > 0) {
        	options.timeout = this._options.timeout;
        }
        options.headers = {};
        options.headers["User-Agent"] = this._options.useragent;
		let cookiesArray = this.getCookiesByURL(_url);
		if(cookiesArray != null) {
	        let cookie = '';
    	    for(let i=0;i < cookiesArray.length;i++) {
    	    	let httpCookie = cookiesArray[i];
        	    cookie += httpCookie.key + '=' + httpCookie.value + ';'
        	}
	        options.headers["Cookie"] = [cookie];
			logger.debug('Cookie: ' + cookie);
	    }
        if(_url.protocol === 'http:') {
        	this._url = _url;
            http.get(this._url, options, (resp) => {
                this._processResponse(this._url, _addToHistory, resp, (_error, _resp, _url) => {
					logger.trace('_get(...): end.');
                	_callback(_error, _resp, _url);
                });
            }).on('error', (_error) => {
				logger.error('_get(...): \'' + this._url + '\': ' + _error);
  				_callback(_error);
			});
        } else if(_url.protocol === 'https:') {
        	this._url = _url;
            https.get(this._url, options, (resp) => {
                this._processResponse(this._url, _addToHistory, resp, (_error, _resp, _url) => {
					logger.trace('_get(...): end.');
                	_callback(_error, _resp, _url);
                });
            }).on('error', (_error) => {
				logger.error('_get(...): _url \'' + this._url + '\': ' + _error);
  				_callback(_error);
			});
        } else {
			logger.error('_get(...): _url protocol \'' + _url.protocol + '\' is not supported.');
			logger.trace('_get(...): end.');
			_callback(HTTPClientError.ILLEGAL_ARGUMENT);
        }
	}

	_setCookies(_url, _resp) {
		logger.trace('_setCookies(...): start.');
		let httpCookieArray = HTTPCookie.parse(_url, _resp);
		if(httpCookieArray.length <= 0) {
			logger.debug('_setCookies(...): No Set-Cookie for \'' + _url.href + '\'.');
			logger.trace('_setCookies(...): end.');
			return;
		}
		for(let i=0;i < httpCookieArray.length;i++) {
			let httpCookie = httpCookieArray[i];
			logger.debug('Set-Cookie: ' + httpCookie.toString());
			let httpCookieDomain = httpCookie.domain;
			let httpCookiePath = httpCookie.path;
			if(httpCookiePath === undefined || httpCookiePath === null) {
				httpCookiePath = '/';
			}
			let cookiesByPath = this._cookiesByDomain.get(httpCookieDomain);
			if(cookiesByPath === undefined || cookiesByPath === null) {
				cookiesByPath = new Map();
				this._cookiesByDomain.set(httpCookieDomain, cookiesByPath);
			}
			let cookies = cookiesByPath.get(httpCookiePath);
			if(cookies === undefined || cookies === null) {
				cookies = new Map();
				cookiesByPath.set(httpCookiePath, cookies);
			}
			cookies.set(httpCookie.key, httpCookie);
        }
		logger.trace('_setCookies(...): end.');
	}

	_processResponse(_url, _addToHistory, _resp, _callback) {
		logger.trace('_processResponse(...): start.');
		this._setCookies(_url, _resp);
        if((_resp.statusCode >= 300) && (_resp.statusCode < 400)) {
            let redirectURL = _resp.headers.location;
        	if(!this._options.followRedirects) {
				if(_addToHistory) {
					this._addToHistory(_url);
				}
				if(redirectURL != undefined && redirectURL != null) {
					logger.debug('_processResponse(...): Ignoring redirect \'' + redirectURL + '\'.');
				}
				logger.trace('_processResponse(...): end.');
	        	return _callback(null, _resp, _url);
        	}
            if(redirectURL === undefined || redirectURL === null) {
				logger.trace('_processResponse(...): end.');
            	return _callback(null, _resp);
            }
            if(!(redirectURL.toLowerCase().startsWith('http'))) {
                redirectURL = new URL(redirectURL, _url);
            } else {
	            redirectURL = new URL(redirectURL);
	        }
			logger.debug('_processResponse(...): Redirect \'' + _url + '\' to \'' + redirectURL.href + '\'.');
            this._get(redirectURL, _addToHistory, (_error, _resp, _url) => {
				logger.trace('_processResponse(...): end.');
            	_callback(_error, _resp, _url);
            });
        } else {
			if(_addToHistory) {
				this._addToHistory(_url);
			}
			logger.trace('_processResponse(...): end.');
        	_callback(null, _resp, _url);
        }
	}

	_addToHistory(_url) {
		logger.trace('_addToHistory(...): start.');
		if(this._historyIndex >= (this._history.length - 1)) {
			logger.debug('_addToHistory(...): Add url \'' + _url.href + '\'.');
			this._history.push(_url);
		} else {
			logger.debug('_addToHistory(...): Add url at index ' + this._historyIndex + ' \'' + _url.href + '\'.');
			this._history.splice(this._historyIndex + 1);
			this._history.push(_url);
		}
		this._historyIndex = this._history.length - 1;
		logger.trace('_addToHistory(...): end.');
	}

	static main() {
		try {
			let httpClientOptions = HTTPClientOptions.parseCommandLine();
			logging.setLevel(httpClientOptions.logLevel);
			if(httpClientOptions.help) {
				// This will print out the HTTPClient.txt contents or if that file is missing
				// it will print out the contents of the README.txt file.
	        	util.Help.print(HTTPClient);
	        	return;
	        }
			// The -url option is command line only.
			let url = httpClientOptions.url;
			if(url === undefined || url === null || url.length <= 0) {
				console.log('Missing URL. Please use the -url option to specify the URL to retrieve.')
				return;
			}
			let httpClient = new HTTPClient(httpClientOptions);
			httpClient.get(url, (_error, _response, _url) => {
				if(_error) {
					console.log('ERROR: ' + _error.message);
					return;
				}
            	let statusCode = _response.statusCode;
	            let contentType = _response.headers['content-type'];
	            if(contentType === undefined || contentType === null) {
		            console.log(url + ' -> ' + _url + ': ' + statusCode + ': ' + contentType);
	            } else {
	            	console.log(url + ' -> ' + _url + ': ' + statusCode + ': ' + contentType);
	        	}
			});
		} catch(_exception) {
			console.log('EXCEPTION:' + _exception.message);
			process.exit(666);
		}
	}
}
// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
    HTTPClient.main();
    return;
}
module.exports = HTTPClient;