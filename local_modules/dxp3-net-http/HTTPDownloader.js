/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-net-http
 *
 * NAME
 * HTTPDownloader
 */
const packageName = 'dxp3-net-http';
const moduleName = 'HTTPDownloader';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * @module dxp3-net-http/HTTPDownloader
 */
const EventEmitter = require('events');
const fs = require('fs');
const http = require('http');
const HTTPDownloaderOptions = require('./httpDownloaderOptions');
const HTTPError = require('./HTTPError');
const https = require('https');
const logging = require('dxp3-logging');
const os = require('os');
const util = require('dxp3-util');

const logger = logging.getLogger(canonicalName);

class HTTPDownloader extends EventEmitter {
    /*********************************************
     * CONSTRUCTOR
     ********************************************/

	constructor(_options) {
		super();
		this._options = HTTPDownloaderOptions.parse(_options);
		if(!this._options.downloadFolder.endsWith(path.sep)) {
			this._options.downloadFolder += path.sep;
		}
		logger.info('Download folder : ' + this._options.downloadFolder);
		logger.info('Timeout         : ' + this._options.timeout);
		logger.info('Useragent       : ' + this._options.useragent);
	}

    /*********************************************
     * PUBLIC METHODS
     ********************************************/

	download(_url, ..._args) {
		this.downloadURL(_url, ..._args);
	}

	// {String|URL} _url, {Function} _callback
	// {String|URL} _url, {String} _baseURL, {Function} _callback
	// {Object} _args, {Function} _callback
	downloadURL(_url, ..._args) {
		logger.trace('downloadURL(...): start.');
		let _baseURL = null;
		let _callback = null;
		// We need at least an URL.
		if(_url === undefined || _url === null) {
			logger.error('downloadURL(...): _url is undefined or null.')
			logger.trace('downloadURL(...): end.');
			throw HTTPError.ILLEGAL_ARGUMENT;
		}
		if(typeof _url === 'object') {
			_baseURL = _url.baseURL;
			_url = _url.url;
		}
		if(_args.length === 1) {
			if(typeof _args[0] === 'function') {
				_callback = _args[0];
			} else {
				_baseURL = _args[0];
				_callback = null;
			}
		} else if(_args.length === 2) {
			_baseURL = _args[0];
			_callback = _args[1];
		} else {
			logger.error('downloadURL(...): Too many arguments.')
			logger.trace('downloadURL(...): end.');
			throw HTTPError.ILLEGAL_ARGUMENT;
		}
		if(typeof _url === 'string') {
			_url = _url.trim();
			if(_url.length <= 0) {
				logger.error('downloadURL(...): _url is an empty string.')
				logger.trace('downloadURL(...): end.');
				return _callback(HTTPError.ILLEGAL_ARGUMENT);
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
				logger.error('downloadURL(...): ' + exception + '.');
				logger.trace('downloadURL(...): end.');
				return _callback(HTTPError.ILLEGAL_ARGUMENT);
			}
		}
		if(!(_url instanceof URL)) {
			logger.error('downloadURL(...): _url is not an instance of an URL.');
			logger.trace('downloadURL(...): end.');
			return _callback(HTTPError.ILLEGAL_ARGUMENT);
		}
		if((_url.protocol != 'http:') && (_url.protocol != 'https:')) {
			logger.error('downloadURL(...): _url protocol \'' + _url.protocol + '\' is not supported.');
			logger.trace('downloadURL(...): end.');
			return _callback(HTTPError.ILLEGAL_ARGUMENT);
		}
        let options = {};
        if(this._options.timeout > 0) {
        	options.timeout = this._options.timeout;
        }
        options.headers = {};
        options.headers["User-Agent"] = this._options.useragent;
        if(_url.protocol === 'http:') {
			http.get(_url, options, (resp) => {
			  	let contentType = resp.headers['content-type'];
			  	let statusCode = resp.statusCode;
			  	if(statusCode === 301 || statusCode === 302 || statusCode === 303 || statusCode === 307 || statusCode === 308) {
				  	this._process30X(_url, resp, _callback);
				} else if(statusCode === 200) {
			  		this._download(_url, resp, contentType, function(_error, _data, _filePath) {
			  			_callback(_error, _filePath);
			  		});
			  	} else {
			  		if(_callback) {
			  			_callback(null);
			  		}
			  	}
			}).on("error", (_error) => {
		  		if(_callback) {
					_callback(_error);
				}
			});
        } else if(_url.protocol === 'https:') {
			https.get(_url, options, (resp) => {
			  	let contentType = resp.headers['content-type'];
			  	let statusCode = resp.statusCode;
			  	if(statusCode === 301 || statusCode === 302 || statusCode === 303 || statusCode === 307 || statusCode === 308) {
				  	this._process30X(_url, resp, _callback);
			  	} else if(statusCode === 200) {
				  	this._download(_url, resp, contentType, function(_error, _data, _filePath) {
				  		_callback(_error, _filePath);
				  	});
			  	} else {
			  		if(_callback) {
			  			_callback(null);
			  		}
			  	}
			}).on("error", (_error) => {
		  		if(_callback) {
					_callback(_error);
				}
			});
		} else {
	  		if(_callback) {
				_callback(new Error('Unhandled protocol'));
			}
		}
	}

	get(_url, ..._args) {
		this.downloadURL(_url, ..._args);
	}

	/*******************************************
	 * GETTERS                                 *
	 ******************************************/

	get downloadFolder() {
		return this.getDownloadFolder();
	}

	getDownloadFolder() {
		return this._options.downloadFolder;
	}

	get timeout() {
		return this.getTimeout();
	}

	getTimeout() {
		return this._options.timeout;
	}

	get useragent() {
		return this.getUserAgent();
	}

	getUserAgent() {
		return this._options.useragent;
	}

	/*******************************************
	 * SETTERS                                 *
	 ******************************************/

	set downloadFolder(_downloadFolder) {
		this.setDownloadFolder(_downloadFolder);
	}

	setDownloadFolder(_downloadFolder) {
		this._options.downloadFolder = _downloadFolder;
		if(!this._options.downloadFolder.endsWith(path.sep)) {
			this._options.downloadFolder += path.sep;
		}		
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

	_createFileExtension(_urlString, _contentType) {
		let url = new URL(_urlString);
		let urlpath = url.pathname;
		let fileExtension = null;
		if((!urlpath.endsWith('/')) && (!urlpath.endsWith('.'))) {
			let lastIndexOfSlash = urlpath.lastIndexOf('/');
			let lastIndexOfPeriod = urlpath.lastIndexOf('.');
			if(lastIndexOfPeriod > lastIndexOfSlash) {
				fileExtension = urlpath.substring(lastIndexOfPeriod + 1);
				return fileExtension;
			}
		}
		let firstIndexOfSemicolon = _contentType.indexOf(';');
		if(firstIndexOfSemicolon >= 0) {
			_contentType = _contentType.substring(0, firstIndexOfSemicolon);
		}
		switch(_contentType) {
			// case 'application/x-executable':
			// 	break;
			case 'application/graphql':
				fileExtension = 'graphql';
				break;
			case 'application/javascript':
				fileExtension = 'js';
				break;
			case 'application/json':
				fileExtension = 'json';
				break;
			case 'application/ld+json':
				fileExtension = 'json';
				break;
			case 'application/msword (.doc)':
				fileExtension = 'doc';
				break;
			case 'application/pdf':
				fileExtension = 'pdf';
				break;
			case 'application/rss+xml':
				fileExtension = 'rss';
				break;
			case 'application/sql':
				fileExtension = 'sql';
				break;
			case 'application/vnd.api+json':
				break;
			case 'application/vnd.ms-excel (.xls)':
				fileExtension = 'xls';
				break;
			case 'application/vnd.ms-powerpoint (.ppt)':
				fileExtension = 'ppt';
				break;
			case 'application/vnd.oasis.opendocument.text (.odt)':
				fileExtension = 'odt';
				break;
			case 'application/vnd.openxmlformats-officedocument.presentationml.presentation (.pptx)':
				fileExtension = 'pptx';
				break;
			case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet (.xlsx)':
				fileExtension = 'xlsx';
				break;
			case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document (.docx)':
				fileExtension = 'docx';
				break;
			// case 'application/x-www-form-urlencoded':
			// 	break;
			case 'application/xml':
				fileExtension = 'xml';
				break;
			case 'application/zip':
				fileExtension = 'zip';
				break;
			case 'application/zstd (.zst)':
				fileExtension = 'zst';
				break;
			case 'audio/mpeg':
				fileExtension = 'mpeg';
				break;
			case 'audio/ogg':
				fileExtension = 'ogg';
				break;
			case 'image/gif':
				fileExtension = 'gif';
				break;
			case 'image/apng':
				fileExtension = 'apng';
				break;
			case 'image/flif':
				fileExtension = 'flif';
				break;
			case 'image/webp':
				fileExtension = 'webp';
				break;
			case 'image/x-mng':
				fileExtension = 'mng';
				break;
			case 'image/jpeg':
				fileExtension = 'jpg';
				break;
			case 'image/png':
				fileExtension = 'png';
				break;
			// case 'multipart/form-data':
			// 	break;
			case 'text/css':
				fileExtension = 'css';
				break;
			case 'text/csv':
				fileExtension = 'csv';
				break;
			case 'text/html':
				fileExtension = 'html';
				break;
			case 'text/php':
				fileExtension = 'php';
				break;
			case 'text/plain':
				fileExtension = 'txt';
				break;
			case 'text/xml':
				fileExtension = 'xml';
				break;
			default:
				fileExtension = 'unknown';
		}
		return fileExtension;
	}

	_createFileName(_urlString, _contentType) {
		let url = new URL(_urlString);
		let urlpath = url.pathname;
		let fileName = null;
		if(urlpath.endsWith('/')) {
			return 'index';
		}
		let lastIndexOfSlash = urlpath.lastIndexOf('/');
		let lastIndexOfPeriod = urlpath.lastIndexOf('.');
		if(lastIndexOfPeriod < lastIndexOfSlash) {
			return 'index';
		}
		fileName = urlpath.substring(lastIndexOfSlash + 1, lastIndexOfPeriod);
		return fileName;
	}

	_createFilePath(_urlString, contentType) {
		let url = new URL(_urlString);
		let urlpath = url.pathname;
		if(!urlpath.endsWith('/')) {
			let lastIndexOfSlash = urlpath.lastIndexOf('/');
			let lastIndexOfPeriod = urlpath.lastIndexOf('.');
			if(lastIndexOfPeriod > lastIndexOfSlash) {
				urlpath = urlpath.substring(0, lastIndexOfSlash + 1);
			} else {
				urlpath = urlpath + '/';
			}
		}
		let filePath = urlpath.replace(/\//g, path.sep);
		if(filePath.startsWith(path.sep)) {
			filePath = filePath.substring(1);
		}
		filePath = this._options.downloadFolder + url.hostname + path.sep + filePath;
		return filePath;
	}

	_process30X(_sourceURL, resp, _callback) {
  		let redirectURL = resp.headers['location'];
		if(redirectURL === undefined || redirectURL === null) {
			_callback(null);
		} else {
			this.downloadURL(redirectURL, _callback);
		}
	}

	_download(_sourceURL, resp, contentType, _callback) {
		// First we create a path and filename based on the response and content type.
		let filePath = this._createFilePath(_sourceURL, contentType);
		let fileName = this._createFileName(_sourceURL, contentType);
		let fileExtension = this._createFileExtension(_sourceURL, contentType);
		let url = new URL(_sourceURL);
		let hostname = url.host;

		fs.mkdir(filePath, { recursive: true }, (err) => {
			let filePathNameExtension = filePath + fileName + '.' + fileExtension;
			logger.debug('_download(...): Downloading to \'' + filePathNameExtension + '\'.');
			let file = fs.createWriteStream(filePathNameExtension);
			let data = '';

			resp.on('error', () => {
				console.log('error');
			});

			resp.on('data', (chunk) => {
				if(contentType.startsWith('text/html')) {
					data += chunk;
				} else if(contentType.startsWith('text/css')) {
					data += chunk;
				} else {
					file.write(chunk);
				}
			});

			resp.on('end', () => {
				if(contentType.startsWith('text/html')) {
					let replacer = new RegExp(url.origin, 'g');
					data = data.replace(replacer, '');
					file.end(data);
					if(_callback) {
						_callback(null, data, filePathNameExtension);
					}
				} else if(contentType.startsWith('text/css')) {
					file.end(data);
					if(_callback) {
						_callback(null, data, filePathNameExtension);
					}
				} else {
					file.end();
					if(_callback) {
						_callback(null, null, filePathNameExtension);
					}
				}
			});
		});
	}

	static main() {
		try {
			let httpDownloaderOptions = HTTPDownloaderOptions.parseCommandLine();
			logging.setLevel(httpDownloaderOptions.logLevel);
			if(httpDownloaderOptions.help) {
	        	util.Help.print(HTTPDownloader);
	        	return;
	        }
			let httpDownloader = new HTTPDownloader(httpDownloaderOptions);
			let url = httpDownloaderOptions.url;
			if(url === undefined || url === null) {
				return;
			}
			httpDownloader.get(url, function(_error, _filePath) {
				if(_error) {
					console.log('Something went wrong during save.');
					console.log(_error);
				} else {
					console.log('Resource saved at \'' + _filePath + '\'.');
				}
			});
		} catch(exception) {
			console.log('EXCEPTION:' + exception.message);
			process.exit(99);
		}
	}
}
// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
	HTTPDownloader.main();
	return;
}
module.exports = HTTPDownloader;