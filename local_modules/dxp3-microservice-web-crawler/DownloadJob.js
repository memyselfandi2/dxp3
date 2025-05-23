const fs = require('fs');
const path = require('path');
const SpiderJob = require('./SpiderJob');

class DownloadJob extends SpiderJob {
	constructor(_urlString, _location) {
		super(_urlString);
		this.setLocation(_location);
	}

	_save(_urlString, contentType, data) {
console.log('save: ' + _urlString);
		let url = new URL(_urlString);
		let pathname = url.pathname;
		let fileName = null;
		// The file extension either comes from the content type or from the URL directly.
		// We'll precalculate the file extension based on the content type.
		let fileExtension = null;
		if(contentType.startsWith('text/html')) {
			fileExtension = 'html';
		} else if(contentType.startsWith('text/css')) {
			fileExtension = 'css';
		} else if(contentType.startsWith('text/javascript')) {
			fileExtension = 'js';
		}
		// If the URL ends with a slash we'll set the default file name as index
		if(pathname.endsWith('/')) {
			fileName = 'index';
			pathname = pathname.replace('/', path.sep);
		} else {
			let lastIndexOfPeriod = pathname.lastIndexOf('.');
			let lastIndexOfSlash = pathname.lastIndexOf('/');
			if(lastIndexOfPeriod > lastIndexOfSlash) {
				fileName = pathname.substring(lastIndexOfSlash + 1, lastIndexOfPeriod);
				fileExtension = pathname.substring(lastIndexOfPeriod + 1);
			} else {
				fileName = pathname.substring(lastIndexOfSlash + 1);
			}
			pathname = pathname.substring(0, lastIndexOfSlash + 1);
			pathname = pathname.replace('/', path.sep);
		}
		let filePath = this.location + pathname;
		let filePathAndName = filePath + fileName + '.' + fileExtension;

console.log('url            : ' + _urlString);
console.log('url.pathname   : ' + url.pathname);
console.log('pathname       : ' + pathname);
console.log('filePath       : ' + filePath);
console.log('filePathAndName: ' + filePathAndName);
console.log('fileName       : ' + fileName);
console.log('extension      : ' + fileExtension);

        fs.mkdir(filePath, {recursive:true}, function(err) {
			let fileWriteStream = fs.createWriteStream(filePathAndName, {flags: 'w'});
			fileWriteStream.end(data);
		});
	}

	_foundImg(sourceURL, baseURL, destinationURL, contentType) {
		this._save(urlString, contentType, data);
	}

	process(urlString, data, resp, callback) {
	  	let contentType = resp.headers['content-type'];
	  	let statusCode = resp.statusCode;
	  	if(statusCode === 200) {
			this._save(urlString, contentType, data);
		}
		super.process(urlString,data,resp,callback);
	}

	setDestination(_destination) {
		this.setLocation(_destination);
	}

	setDirectory(_directory) {
		this.setLocation(_directory);
	}

	setFolder(_folder) {
		this.setLocation(_folder);
	}

	setLocation(_location) {
		this.location = _location;
		if(this.location.endsWith(path.sep)) {
			this.location = this.location.substring(0, this.location.length - 1);
		}
	}
}

module.exports = DownloadJob;