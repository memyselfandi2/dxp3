/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-net-http
 *
 * NAME
 * HTTPServerDomain
 */
const packageName = 'dxp3-net-http';
const moduleName = 'HTTPServerDomain';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * @module dxp3-net-http/HTTPServerDomain
 */
const HTTPError = require('./HTTPError');
const HTTPRedirect = require('./HTTPRedirect');
const HTTPRequest = require('./HTTPRequest');
const HTTPRequestMethod = require('./HTTPRequestMethod');
const HTTPResponse = require('./HTTPResponse');
const HTTPRouteRegexp = require('./HTTPRouteRegexp');
// It's important to at least log warnings and errors.
const logging = require('dxp3-logging');
// We use the util.Help class to print out help information.
const util = require('dxp3-util');

const logger = logging.getLogger(canonicalName);

class HTTPServerDomain {
    /*********************************************
     * CONSTRUCTOR
     ********************************************/

	/**
	 * @constructor
	 * @param {String} _domain
	 * @param {String} _root
	 */
	constructor(_domain, _root) {
		if(_domain === undefined || _domain === null) {
			_domain = '';
		}
		this.domain = _domain.trim();
		if(_root === undefined || _root === null) {
			_root = '';
		}
		_root = _root.trim();
		if(_root.length <= 0) {
			_root = null;
		}
		this.root = _root;
		this.redirects = [];
		this.deleteHTTPRouteRegexp = null;
		this.getHTTPRouteRegexp = null;
		this.postHTTPRouteRegexp = null;
		this.putHTTPRouteRegexp = null;
		if(this.root != null) {
			// Apparently a static root directory was supplied in the constructor call.
			// Lets create a GET route.
			this.get('*', (httpRequest, httpResponse, httpRoute) => {
				let fileName = httpRequest.params[0];
		        if(fileName.length <= 0) {
		        	httpRoute.next();
		            return;
		        }
		        if(fileName.endsWith('/')) {
		        	fileName += 'index.html';
		        } else {
					let lastIndexOfSlash = fileName.lastIndexOf('/');
					let lastIndexOfPeriod = fileName.lastIndexOf('.');
					if(lastIndexOfPeriod < lastIndexOfSlash) {
						fileName += '/index.html';
					}
				}
		 		httpResponse.sendFile(fileName, {root: this.root});
			});
		}
	}

	/**
	 * @param {String} regexString 
	 * @param {String} location to redirect to
	 * @throws {module:dxp3-net/HTTPError.ILLEGAL_ARGUMENT} when the supplied regexString or location are invalid.
	 */
	redirect(regexString, location) {
		// Defensive programming...check input...
		if(regexString === undefined || regexString === null) {
			throw HTTPError.ILLEGAL_ARGUMENT;
		}
		if(location === undefined || location === null) {
			throw HTTPError.ILLEGAL_ARGUMENT;
		}
		let httpRedirect = new HTTPRedirect(regexString, location);
		this.redirects.push(httpRedirect);
		this.all(regexString, (_request, _response) => {
			httpRedirect.handle(_request, _response);
		}, true);
	}

	/**
	 * @param {String} regexString 
	 * @param {Function} callback Signature function(request, response)
	 * @throws {module:dxp3-net/HTTPError.ILLEGAL_ARGUMENT} when the supplied regexString or callback are invalid.
	 */
	all(regexString, callback, first) {
		// Defensive programming...check input...
		if(regexString === undefined || regexString === null) {
			throw HTTPError.ILLEGAL_ARGUMENT;
		}
		if(callback === undefined || callback === null) {
			throw HTTPError.ILLEGAL_ARGUMENT;
		}
		if(typeof callback != 'function') {
			throw HTTPError.ILLEGAL_ARGUMENT;
		}
		this.delete(regexString, callback, first);
		this.get(regexString, callback, first);
		this.post(regexString, callback, first);
		this.put(regexString, callback, first);
	}

	/**
	 * @param {String} regexString 
	 * @param {Function} callback Signature function(request, response)
	 * @throws {module:dxp3-net/HTTPError.ILLEGAL_ARGUMENT} when the supplied regexString or callback are invalid.
	 */
	delete(regexString, callback, first) {
		// Defensive programming...check input...
		if(regexString === undefined || regexString === null) {
			throw HTTPError.ILLEGAL_ARGUMENT;
		}
		if(callback === undefined || callback === null) {
			throw HTTPError.ILLEGAL_ARGUMENT;
		}
		if(typeof callback != 'function') {
			throw HTTPError.ILLEGAL_ARGUMENT;
		}
		if(this.deleteHTTPRouteRegexp === null) {
			this.deleteHTTPRouteRegexp = new HTTPRouteRegexp(HTTPRequestMethod.DELETE, regexString, callback);
		} else {
			let httpRouteRegexp = new HTTPRouteRegexp(HTTPRequestMethod.DELETE, regexString, callback);
			if(first) {
				httpRouteRegexp.addHTTPRouteRegexp(this.deleteHTTPRouteRegexp);
				this.deleteHTTPRouteRegexp = httpRouteRegexp;
			} else {
				this.deleteHTTPRouteRegexp.addHTTPRouteRegexp(httpRouteRegexp);
			}
		}
	}

	/**
	 * @param {String} regexString 
	 * @param {Function} callback Signature function(request, response)
	 * @throws {module:dxp3-net/HTTPError.ILLEGAL_ARGUMENT} when the supplied regexString or callback are invalid.
	 */
	get(regexString, callback, first) {
//		console.log('HTTPServerDomain add get regexp:'  + regexString);
		// Defensive programming...check input...
		if(regexString === undefined || regexString === null) {
			throw HTTPError.ILLEGAL_ARGUMENT;
		}
		if(callback === undefined || callback === null) {
			throw HTTPError.ILLEGAL_ARGUMENT;
		}
		if(typeof callback != 'function') {
			throw HTTPError.ILLEGAL_ARGUMENT;
		}
		if(this.getHTTPRouteRegexp === null) {
			this.getHTTPRouteRegexp = new HTTPRouteRegexp(HTTPRequestMethod.GET, regexString, callback);
		} else {
			let httpRouteRegexp = new HTTPRouteRegexp(HTTPRequestMethod.GET, regexString, callback);
			if(first) {
				httpRouteRegexp.addHTTPRouteRegexp(this.getHTTPRouteRegexp);
				this.getHTTPRouteRegexp = httpRouteRegexp;
			} else {
				this.getHTTPRouteRegexp.addHTTPRouteRegexp(httpRouteRegexp);
			}
		}
	}

	/**
	 * @param {String} regexString 
	 * @param {Function} callback Signature function(request, response)
	 * @throws {module:dxp3-net/HTTPError.ILLEGAL_ARGUMENT} when the supplied regexString or callback are invalid.
	 */
	post(regexString, callback, first) {
		// Defensive programming...check input...
		if(regexString === undefined || regexString === null) {
			throw HTTPError.ILLEGAL_ARGUMENT;
		}
		if(callback === undefined || callback === null) {
			throw HTTPError.ILLEGAL_ARGUMENT;
		}
		if(typeof callback != 'function') {
			throw HTTPError.ILLEGAL_ARGUMENT;
		}
		if(this.postHTTPRouteRegexp === null) {
			this.postHTTPRouteRegexp = new HTTPRouteRegexp(HTTPRequestMethod.POST, regexString, callback);
		} else {
			let httpRouteRegexp = new HTTPRouteRegexp(HTTPRequestMethod.POST, regexString, callback);
			if(first) {
				httpRouteRegexp.addHTTPRouteRegexp(this.postHTTPRouteRegexp);
				this.postHTTPRouteRegexp = httpRouteRegexp;
			} else {
				this.postHTTPRouteRegexp.addHTTPRouteRegexp(httpRouteRegexp);
			}
		}
	}

	/**
	 * @param {String} regexString 
	 * @param {Function} callback Signature function(request, response)
	 * @throws {module:dxp3-net/HTTPError.ILLEGAL_ARGUMENT} when the supplied regexString or callback are invalid.
	 */
	put(regexString, callback, first) {
		// Defensive programming...check input...
		if(regexString === undefined || regexString === null) {
			throw HTTPError.ILLEGAL_ARGUMENT;
		}
		if(callback === undefined || callback === null) {
			throw HTTPError.ILLEGAL_ARGUMENT;
		}
		if(typeof callback != 'function') {
			throw HTTPError.ILLEGAL_ARGUMENT;
		}
		if(this.putHTTPRouteRegexp === null) {
			this.putHTTPRouteRegexp = new HTTPRouteRegexp(HTTPRequestMethod.PUT, regexString, callback);
		} else {
			let httpRouteRegexp = new HTTPRouteRegexp(HTTPRequestMethod.PUT, regexString, callback);
			if(first) {
				httpRouteRegexp.addHTTPRouteRegexp(this.putHTTPRouteRegexp);
				this.putHTTPRouteRegexp = httpRouteRegexp;
			} else {
				this.putHTTPRouteRegexp.addHTTPRouteRegexp(httpRouteRegexp);
			}
		}
	}

	handle(request, response) {
		logger.trace('handle(...): ' + request.method + ' -> ' + this.domain + ' -> ' + request.url);
		let httpRouteRegexp = null;
		if(request.method === HTTPRequestMethod.DELETE) {
			httpRouteRegexp = this.deleteHTTPRouteRegexp;
		} else if(request.method === HTTPRequestMethod.GET) {
			httpRouteRegexp = this.getHTTPRouteRegexp;
		} else if(request.method === HTTPRequestMethod.POST) {
			httpRouteRegexp = this.postHTTPRouteRegexp;
		} else if(request.method === HTTPRequestMethod.PUT) {
			httpRouteRegexp = this.putHTTPRouteRegexp;
		}
		let httpResponse = new HTTPResponse(response);
		if(httpRouteRegexp != null) {
			let httpRequest = new HTTPRequest(request);
			httpRequest.init(function() {
				httpRouteRegexp.handle(httpRequest, httpResponse);
			});
		} else {
			logger.debug('404: ' + request.url);
			httpResponse.status(404).send('404 Not Found');
		}
	}
}
// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
    util.Help.print(HTTPServerDomain);
    return;
}
module.exports = HTTPServerDomain;