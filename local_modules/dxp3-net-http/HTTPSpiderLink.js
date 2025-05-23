/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-net-http
 *
 * NAME
 * HTTPSpiderLink
 */
const packageName = 'dxp3-net-http';
const moduleName = 'HTTPSpiderLink';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * @module dxp3-net-http/HTTPSpiderLink
 */
const HTTPError = require('./HTTPError');
// We use the util.Help class to print out help information.
const util = require('dxp3-util');

class HTTPSpiderLink {

	constructor(_sourceURL, _destinationURL, _depth, _contentType, _statusCode) {
		if(_sourceURL === undefined || _sourceURL === null) {
			this.sourceURLString = null;
			this.sourceURL = null;
		} else if(typeof _sourceURL === 'string') {
			_sourceURL = _sourceURL.trim();
			if(_sourceURL.length <= 0) {
				this.sourceURLString = null;
				this.sourceURL = null;
			} else {
				this.sourceURLString = _sourceURL;
				this.sourceURL = new URL(_sourceURL);
			}
		} else if(_sourceURL instanceof URL) {
			this.sourceURL = _sourceURL;
			this.sourceURLString = this.sourceURL.toString();
		} else {
			throw HTTPError.ILLEGAL_ARGUMENT;
		}
		if(_destinationURL === undefined || _destinationURL === null) {
			throw HTTPError.ILLEGAL_ARGUMENT;
		} else if(typeof _destinationURL === 'string') {
			this.destinationURL = new URL(_destinationURL, _sourceURL);
			this.destinationURLString = this.destinationURL.toString();
		} else if(_destinationURL instanceof URL) {
			this.destinationURL = _destinationURL;
			this.destinationURLString = this.destinationURL.toString();
		} else {
			throw HTTPError.ILLEGAL_ARGUMENT;
		}
		this.depth = _depth;
		this.contentType = _contentType;
		this.statusCode = _statusCode;
	}

	getDepth() {
		return this.depth;
	}

	getSourceHostName() {
		return this.sourceURL.hostname;
	}

	getSourceURL() {
		return this.sourceURL;
	}

	getSourceURLString() {
		return this.sourceURLString;
	}

	getDestinationHostName() {
		return this.destinationURL.hostname;
	}

	getDestinationURL() {
		return this.destinationURL;
	}

	getDestinationURLString() {
		return this.destinationURLString;
	}

	getContentType() {
		return this.contentType;
	}

	getStatusCode() {
		return this.statusCode;
	}

	setContentType(_contentType) {
		this.contentType = _contentType;
	}

	setStatusCode(_statusCode) {
		this.statusCode = _statusCode;
	}

	equals(otherHTTPSpiderLink) {
		let otherDestinationURLString = otherHTTPSpiderLink.getDestinationURLString();
		return otherDestinationURLString === this.destinationURLString;
	}

	toString() {
		return this.sourceURLString + ' -> ' + this.destinationURLString;		
	}
}
// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
    util.Help.print(HTTPSpiderLink);
    return;
}
module.exports = HTTPSpiderLink;