/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-net-http
 *
 * NAME
 * HTTPRequest
 */
const packageName = 'dxp3-net-http';
const moduleName = 'HTTPRequest';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
// Check if someone tried to run/execute this file.
const util = require('dxp3-util');
if(util.Assert.isFileToExecute(canonicalName)) {
    util.Help.print();
    return;
}
/**
 * A collection of different HTTP request methods.
 * POST and PUT requests may have content in their payload.
 * That content may need to be parsed when the time is right.
 * Use the init(...) method to read the content body.
 *
 * @module dxp3-net-http/HTTPRequest
 */
const HTTPRequestQuery = require('./HTTPRequestQuery');
const HTTPRequestMethod = require('./HTTPRequestMethod');
const querystring = require('querystring');
const url = require('url');
/**
 * This is a wrapper around a http.IncomingMessage.
 *
 * @property {Object} body
 *
 * @property {Object} cookies
 *
 * @property {String} host
 *
 * @property {Object} query
 * A collection of key and value pairs.
 *
 * @property {http.IncomingMessage} request
 *
 * @property {URL} URL
 */
class HTTPRequest {

	constructor(request) {
		let self = this;
		self.body = {};
		self.host = request.headers.host;
		self.headers = request.headers;
		self.contentType = request.headers['content-type'];
		self.request = request;
		self.URL = url.parse(request.url);
	    self.pathname = decodeURI(self.URL.pathname);
		self.hostname = self.host.split(':')[0];
		self.query = HTTPRequestQuery.parse(self.URL.search);
		// Cookies
		self.cookies = {};
		if(request.headers.cookie) {
			let cookiesArray = request.headers.cookie.split(';');
			for(let i=0;i < cookiesArray.length;i++) {
				let keyValue = cookiesArray[i].split('=');
				if(keyValue.length != 2) {
					continue;
				}
				let key = keyValue[0].trim();
				let value = keyValue[1].trim();
				self.cookies[key] = value;
			}
		}
	}

	init(callback) {
		let self = this;
		if((self.request.method === HTTPRequestMethod.POST) ||
		   (self.request.method === HTTPRequestMethod.PUT)) {
		   	let contentType = self.request.headers['content-type'];
			if(contentType === 'application/json') {
				const chunks = [];
				self.request.on('data', chunk => chunks.push(chunk));
				self.request.on('end', () => {
					const buffer = Buffer.concat(chunks);
					try {
						self.body = JSON.parse(buffer.toString());
					} catch(_exception) {
						console.log('JSON.parse exception. HTTPRequest.' + self.request.method + ' content-type: ' + self.request.headers['content-type']);
					}
					callback();
				});
			} else {
		console.log('HTTPRequest.' + self.request.method + ' content-type: ' + self.request.headers['content-type']);
				callback();				
			}
		} else {
			callback();
		}
	}

}

module.exports = HTTPRequest;