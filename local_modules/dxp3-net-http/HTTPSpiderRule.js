/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-net-http
 *
 * NAME
 * HTTPSpiderRule
 */
const packageName = 'dxp3-net-http';
const moduleName = 'HTTPSpiderRule';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * This module defines both the rules a HTTP spider uses to follow URL's and the rules
 * to identify / filter the results.
 * For example one can specify if the spider should or should not follow redirects.
 * Additionally you can supply specific hosts the spider is allowed to visit.
 * The results can be filtered by content type, status code and path regular expression.
 * Each to be followed host can be further limited by supplying a specific
 * path regular expression.
 * To be able to apply these follow and filter rules this module requires a root URL aka
 * start URL.
 *
 * @module dxp3-net-http/HTTPSpiderRule
 */
const HTTPError = require('./HTTPError');
// It's important to at least log warnings and errors.
const logging = require('dxp3-logging');
// We use the util.Help class to print out help information.
const util = require('dxp3-util');

const logger = logging.getLogger(canonicalName);

class HTTPSpiderRule {
    /*********************************************
     * CONSTRUCTOR
     ********************************************/

	constructor(_rootURL, _followRedirects, _followHosts, _filterContentTypes, _filterStatusCodes, _filterPaths) {
		if(_rootURL === undefined || _rootURL === null) {
			throw HTTPError.ILLEGAL_ARGUMENT;
		}
		this._args = {};
		// The supplied root URL must either be a string or a URL already.
		if(typeof _rootURL === 'string') {
			_rootURL = _rootURL.trim();
			if(_rootURL.length <= 0) {
				throw HTTPError.ILLEGAL_ARGUMENT;
			}
			this._args.rootURL = new URL(_rootURL);
		} else if(_rootURL instanceof URL) {
			this._args.rootURL = _rootURL;
		} else {
			throw HTTPError.ILLEGAL_ARGUMENT;
		}
		this._args.rootHostName = this._args.rootURL.hostname;
		this._args.rootPathName = this._args.rootURL.pathname;
		this.setFollowRedirects(_followRedirects);
		this.setFollowHosts(_followHosts);
		this._args.followHostDefault = this._args.followHosts.get('*');	
		this.setFilterContentTypes(_filterContentTypes);
		this.setFilterStatusCodes(_filterStatusCodes);
		this.setFilterPaths(_filterPaths);
	}

	follow(_httpSpiderLink) {
		logger.trace('follow(...)');
		let destinationHostName = _httpSpiderLink.getDestinationHostName();
		let depth = _httpSpiderLink.getDepth();
		let followPath = null;
		for(const [key, value] of this._args.followHosts) {
			if(destinationHostName === key) {
				followPath = value;
				break;
			}
			// Check for a partial hit
			if(destinationHostName.endsWith(key)) {
				followPath = value;
			}
		}
		if(followPath === null) {
			return false;
		}
		let destinationURL = _httpSpiderLink.getDestinationURL();
		let destinationPathName = destinationURL.pathname;
// console.log('yes follow host: ' + destinationHostName);
		if(!destinationPathName.match(followPath)) {
// console.log('no do not follow: ' + destinationPathName + ' it is not equal to: ' + followPath);
			return false;
		} else {
// console.log('follow: ' + destinationPathName + ' matches: ' + followPath);
		}

		return true;
		// if(destinationHostName.startsWith(this._args.rootHostName)) {
		// 	return this._args.followInternalLinks;
		// } else if(!this._args.followExternalLinks) {
		// 	return false;
		// } else if(this._args.hosts === null) {
		// 	return true;
		// } else {
		// 	let found = false;
		// 	for(let i=0;i < this._args.hosts;i++) {
		// 		if(destinationHostName.startsWith(this._args.hosts[i])) {
		// 			return true;
		// 		}
		// 	}
		// 	return false;
		// }
	}

	filter(_httpSpiderLink) {
  		let contentType = _httpSpiderLink.getContentType();
  		let statusCode = _httpSpiderLink.getStatusCode();
		if(this._args.filterContentTypes != null) {
			let found = false;
			if(contentType != undefined && contentType != null) {
				for(let i=0;i < this._args.filterContentTypes.length;i++) {
					let tmpContentType = this._args.filterContentTypes[i];
					if(contentType.indexOf(tmpContentType) >= 0) {
						found = true;
						break;
					}
				}
			}
			if(!found) {
				return false;
			}
		}
		if(this._args.filterStatusCodes != null) {
			if(!this._args.filterStatusCodes.includes(statusCode)) {
				return false;
			}
		}
		if(this._args.filterPaths != null) {
			let destinationURL = _httpSpiderLink.getDestinationURL();
			let destinationPathName = destinationURL.pathname.toLowerCase();
			if(!destinationPathName.match(this._args.filterPaths)) {
				return false;
			}
		}
		return true;
	}

	/**************************************
	 * GETTERS
	 *************************************/

    get filterContentTypes() {
    	return this.getFilterContentTypes();
    }

	getFilterContentTypes() {
    	return this._args.filterContentTypes;
	}

	get followRedirects() {
		return this.getFollowRedirects();
	}

	getFollowRedirects() {
		return this._args.followRedirects;
	}

	get followHosts() {
		return this.getFollowHosts();
	}

	getFollowHosts() {
		return this._args.followHosts;
	}

	get filterStatusCodes() {
		return this.getFilterStatusCodes();
	}

	getFilterStatusCodes() {
		return this._args.filterStatusCodes;
	}

	get filterHosts() {
		return this.getFilterHosts();
	}

	getFilterHosts() {
		return this._args.filterHosts;
	}

	get filterPaths() {
		return this.getFilterPaths();
	}

	getFilterPaths() {
		return this._args.filterPaths;
	}

	/**************************************
	 * SETTERS
	 *************************************/

	set filterContentTypes(_filterContentTypes) {
		this.setFilterContentTypes(_filterContentTypes);
	}

	setFilterContentTypes(_filterContentTypes) {
		if(_filterContentTypes === undefined || _filterContentTypes === null) {
			this._args.filterContentTypes = null;
		} else if(typeof _filterContentTypes === 'string') {
			_filterContentTypes = _filterContentTypes.trim();
			if(_filterContentTypes.length <= 0) {
				this._args.filterContentTypes = null;
			} else {
				this._args.filterContentTypes = _filterContentTypes.split(',');
			}
		} else if(Array.isArray(_filterContentTypes)) {
			if(_filterContentTypes.length > 0) {
				this._args.filterContentTypes = _filterContentTypes;
			} else {
				this._args.filterContentTypes = null;
			}
		} else {
			this._args.filterContentTypes = null;
		}
	}

	addFollowHost(_hostName, _path) {
		if(_hostName === undefined || _hostName === null) {
			return;
		}
		_hostName = _hostName.trim();
		if(_hostName === '.') {
			_hostName = this._args.rootHostName;
		}
		while(_hostName.startsWith('*.')) {
			_hostName = hostName.substring(2);
		}
		if(typeof _path === 'string') {
			if(!_path.endsWith('*')) {
				_path += '&';
			}
			_path = _path.replaceAll("*",".*");
			_path = new RegExp('^' + _path);
		}
		this._args.followHosts.set(_hostName, _path);
	}

	set followHosts(_followHosts) {
		this.setFollowHosts(_followHosts)
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
		this._args.followHosts = new Map();
		for(let [hostName, followPath] of _followHosts) {
			if(hostName === '.') {
				hostName = this._args.rootHostName;
			}
			while(hostName.startsWith('*.')) {
				hostName = hostName.substring(2);
			}
			if(typeof followPath === 'string') {
				if(!followPath.endsWith('*')) {
					followPath += '&';
				}
				followPath = followPath.replaceAll("*",".*");
				followPath = new RegExp('^' + followPath);
			}
			this._args.followHosts.set(hostName, followPath);
		}
		// We need to at least follow the current page of the current host.
		let	rootHostFollowPath = this._args.followHosts.get(this._args.rootHostName);
		if(rootHostFollowPath === undefined || rootHostFollowPath === null) {
			this._args.followHosts.set(this._args.rootHostName, new RegExp('^' + this._args.rootPathName + '.*'));
		}
	}

	set followRedirects(_followRedirects) {
		this.setFollowRedirects(_followRedirects);
	}

	setFollowRedirects(_followRedirects) {
		if(_followRedirects === undefined || _followRedirects === null) {
			this._args.followRedirects = true;
		} else if(typeof _followRedirects === 'boolean') {
			this._args.followRedirects = _followRedirects;
		} else if(typeof _followRedirects === 'string') {
			_followRedirects = _followRedirects.trim().toLowerCase();
			if(_followRedirects === 'false' ||
			   _followRedirects === 'off' ||
		   	   _followRedirects === 'no') {
				this._args.followRedirects = false;
			} else {
				this._args.followRedirects = true;
			}
		} else if(_followRedirects instanceof Boolean) {
			this._args.followRedirects = _followRedirects.prototype.valueOf()
		} else {
			this._args.followRedirects = true;
		}
	}

	set filterHosts(_filterHosts) {
		this.setFilterHosts(_filterHosts);
	}

	setFilterHosts(_filterHosts) {
		this._args.filterHosts = _filterHosts;
	}

	set filterPaths(_filterPaths) {
		this.setFilterPaths(_filterPaths);
	}

	setFilterPaths(_filterPaths) {
		if(_filterPaths === undefined || _filterPaths === null) {
			this._args.filterPaths = null;
			return;
		}
		if(typeof _filterPaths === 'string') {
			_filterPaths = _filterPaths.trim();
			if(_filterPaths.length <= 0) {
				this._args.filterPaths = null;
				return;
			}
			_filterPaths = _filterPaths.split(',');
		}
		if(Array.isArray(_filterPaths)) {
			let filterPaths = '';
			for(let i=0;i < _filterPaths.length;i++) {
				let filterPath = _filterPaths[i];
				if(typeof filterPath === 'string') {
					filterPath = filterPath.trim().replaceAll("*",".*");
					if(filterPaths.length <= 0) {
						filterPaths = filterPath;
					} else {
						filterPaths += '|' + filterPath;
					}
				} else if(filterPath instanceof RegExp) {
					if(filterPaths.length <= 0) {
						filterPaths = filterPath.toString();
					} else {
						filterPaths += '|' + filterPath.toString();
					}
				} else {
					// ignore unknown filterPath type...
				}
			}
			if(filterPaths.length <= 0) {
				this._args.filterPaths = null;
				return;
			} 
			this._args.filterPaths = new RegExp(filterPaths.toLowerCase());
		} else {
			this._args.filterPaths = null;
		}
	}

	set filterStatusCodes(_filterStatusCodes) {
		if(_filterStatusCodes === undefined || _filterStatusCodes === null) {
			this._args.filterStatusCodes = null;
			return;
		}
		if(typeof _filterStatusCodes === 'string') {
			_filterStatusCodes = _filterStatusCodes.trim();
			if(_filterStatusCodes.length <= 0) {
				this._args.filterStatusCodes = null;
				return;
			}
			_filterStatusCodes = _filterStatusCodes.split(',');
		} else if(typeof _filterStatusCodes === 'number') {
			_filterStatusCodes = [_filterStatusCodes];
		}
		if(!Array.isArray(_filterStatusCodes)) {
			this._args.filterStatusCodes = null;
			return;
		}
		if(_filterStatusCodes.length <= 0) {
			this._args.filterStatusCodes = null;
			return;
		}
		let tmpArray = [];
		for(let i=0;i < _filterStatusCodes.length;i++) {
			let filterStatusCode = _filterStatusCodes[i];
			if(typeof filterStatusCode === 'number') {
				tpmArray.push(filterStatusCode);
				continue;
			}
			if(typeof filterStatusCode === 'string') {
				let filterStatusCodeAsString = filterStatusCode.toLowerCase();
				// Someone may have specified a range by using 4xx or 5xx.
				// Not uncommon...
				let indexOfXX = filterStatusCodeAsString.indexOf('xx');
				if(indexOfXX > 0) {
					if(filterStatusCodeAsString.startsWith('1')) {
						tmpArray.push(100); // Continue
						tmpArray.push(101); // Switching protocols
						tmpArray.push(102); // Processing
						tmpArray.push(103); // Early hints
					} else if(filterStatusCodeAsString.startsWith('2')) {
						tmpArray.push(200); // OK
						tmpArray.push(201); // Created
						tmpArray.push(202); // Accepted
						tmpArray.push(203); // Nonauthoritative information
						tmpArray.push(204); // No content
						tmpArray.push(205); // Reset content
						tmpArray.push(206); // Partial content
						tmpArray.push(207); // Multi-status
						tmpArray.push(208); // Already reported
						tmpArray.push(226); // IM used
					} else if(filterStatusCodeAsString.startsWith('3')) {
						tmpArray.push(300); // Multiple choices
						tmpArray.push(301); // Moved permanently
						tmpArray.push(302); // Found
						tmpArray.push(303); // See other
						tmpArray.push(304); // Not modified
						tmpArray.push(307); // Temporary redirect
						tmpArray.push(308); // Permanente redirect
					} else if(filterStatusCodeAsString.startsWith('4')) {
						tmpArray.push(400); // Bad request
						tmpArray.push(401); // Access denied
						tmpArray.push(402); // Payment required
						tmpArray.push(403); // Forbidden
						tmpArray.push(404); // Not found
						tmpArray.push(405); // Method not allowed
						tmpArray.push(406); // Client browser doesn't accept the MIME type of the requested page
						tmpArray.push(407); // Proxy Authentication Required
						tmpArray.push(408); // Request timed out
						tmpArray.push(409); // Conflict
						tmpArray.push(410); // Gone
						tmpArray.push(411); // Length required
						tmpArray.push(412); // Precondition failed
						tmpArray.push(413); // Payload too large
						tmpArray.push(414); // URI too long
						tmpArray.push(415); // Unsupported media type
						tmpArray.push(416); // Range not satisfiable
						tmpArray.push(417); // Expectation failed
						tmpArray.push(418); // I'm a teapot
						tmpArray.push(421); // Misdirected request
						tmpArray.push(422); // Unprocessable content
						tmpArray.push(423); // Locked
						tmpArray.push(424); // Failed dependency
						tmpArray.push(425); // Too early
						tmpArray.push(426); // Upgrade required
						tmpArray.push(428); // Precondition required
						tmpArray.push(429); // Too many requests
						tmpArray.push(431); // Request header fields too large
						tmpArray.push(451); // Unavailable for legal reasons
					} else if(filterStatusCodeAsString.startsWith('5')) {
						tmpArray.push(500); // Internal server error
						tmpArray.push(501); // Not implemented
						tmpArray.push(502); // Bad gateway
						tmpArray.push(503); // Service unavailable
						tmpArray.push(504); // Gateway timeout
						tmpArray.push(505); // HTTP version not supported
						tmpArray.push(506); // Variant also negotiates
						tmpArray.push(507); // Insufficient storage
						tmpArray.push(508); // Loop detected
						tmpArray.push(510); // Not extended
						tmpArray.push(511); // Network authentication required
					} else {
						continue;
					}
				} else {
					let filterStatusCode = parseInt(filterStatusCodeAsString, 10);
					if(isNaN(filterStatusCode)) {
						continue;
					}
					tmpArray.push(filterStatusCode);
				}
			}
		}
		if(tmpArray.length <= 0) {
			this._args.filterStatusCodes = null;
			return;
		}
		this._args.filterStatusCodes = tmpArray;
		console.log('filter codes: ' + this._args.filterStatusCodes);
	}

	setFilterStatusCodes(_filterStatusCodes) {
		this.filterStatusCodes = _filterStatusCodes;
	}
}
// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
    util.Help.print(HTTPSpiderRule);
    return;
}
module.exports = HTTPSpiderRule;