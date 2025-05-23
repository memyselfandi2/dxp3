/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-net-http
 *
 * NAME
 * HTTPResponse
 */
const packageName = 'dxp3-net-http';
const moduleName = 'HTTPResponse';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * @module dxp3-net-http/HTTPResponse
 */
const fs = require('fs');
const util = require('dxp3-util');
/**
 * This is a wrapper around a http.ServerResponse.
 *
 * @property {http.ServerResponse} response
 *
 * @property {Number} statusCode
 *
 * @property {String} contentType
 *
 * @property {Map} cookies
 * A collection of key and value pairs.
 */
class HTTPResponse {
	constructor(response) {
		this.response = response;
		this.statusCode = 200;
		this.contentType = null;
		this.cookies = new Map();
		this.headers = {};
	}

	setHeader(headerName, value) {
		this.headers[headerName] = value;
		return this;
	}

	end() {
		this.response.end();
	}

	cookie(name, value) {
		this.cookies.set(name, value);
	}

	json(body = {}) {
		this.send(body);
	}

	redirect(_url) {
		this.statusCode = 301;
		this.headers['Location'] = _url;
		this.writeHead();
		this.response.end();
	}

	status(code) {
		this.statusCode = code;
		return this;
	}

	type(_contentType) {
		this.contentType = _contentType;
		return this;
	}

	send(body = '') {
		if(typeof body === 'object') {
			this.contentType = 'application/json; charset=utf-8';
			this.writeHead();
			this.response.end(JSON.stringify(body));
		} else {
			if(this.contentType === null) {
				this.contentType = 'text/plain; charset=utf-8';
			}
			this.writeHead();
			this.response.end(body);
		}
	}

	sendFile(fileName = '', options = {}) {
		if(fileName.endsWith('.html') || fileName.endsWith('.htm')) {
			this.contentType = 'text/html; charset=utf-8';
		} else if(fileName.endsWith('.css')) {
			this.contentType = 'text/css; charset=utf-8';
		} else if(fileName.endsWith('.js')) {
			this.contentType = 'application/javascript; charset=utf-8';
		} else if(fileName.endsWith('.txt')) {
			this.contentType = 'text/plain; charset=utf-8';
		} else if(fileName.endsWith('.png')) {
			this.contentType = 'image/png';
		} else if(fileName.endsWith('.gif')) {
			this.contentType = 'image/gif';
		} else if(fileName.endsWith('.woff2')) {
			this.contentType = 'font/woff2';
		} else if(fileName.endsWith('.jpeg') || fileName.endsWith('.jpg')) {
			this.contentType = 'image/jpeg';
		}
		let root = '.';
		if(options.root) {
			root = path.normalize(options.root);
		}
		let filePath = path.join(root, fileName);
		// We need to ensure there is no traversal outside of the root.
		if(!filePath.startsWith(root)) {
			this.status(403);
			this.contentType = 'text/plain; charset=utf-8';
			this.writeHead();
			this.response.end('Forbidden');
			return;
		}
		let fileStream = fs.createReadStream(filePath, {flags: 'r'});
		fileStream.on('open', () => {
			this.status(200);
			this.writeHead();
		});
		fileStream.on('error', (_error) => {
			this.status(404);
			this.contentType = 'text/plain; charset=utf-8';
			this.writeHead();
			this.response.end('404 Not Found');
		});
		fileStream.pipe(this.response);
	}

	writeHead() {
		if(this.contentType != null) {
			this.headers["Content-Type"] = this.contentType;
		}
		if(this.cookies.size > 0) {
			let cookiesArray = [];
			this.cookies.forEach(function(value, name) {
				let cookieString = name + '=' + encodeURIComponent(value) + '; Path=/';
				cookiesArray.push(cookieString);
			});
			this.headers['Set-Cookie'] = cookiesArray;
		}
		this.response.writeHead(this.statusCode, this.headers);
	}
}
// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
    util.Help.print(HTTPResponse);
    return;
}
module.exports = HTTPResponse;