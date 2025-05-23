/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-net-http
 *
 * NAME
 * HTTPServer
 */
const packageName = 'dxp3-net-http';
const moduleName = 'HTTPServer';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * <p>A lightweight http server that can serve one or multiple domains.
 * Each domain can be configured with an optional static folder/directory to
 * serve static files (css, html, js, png, etc.).
 * Additionally each domain may have multiple redirects. This allows
 * for automatic redirection from http to https or for restructuring content
 * without impacting users.<br/>
 * There are listener methods for each of the different HTTP methods:<br/>
 * <ul><li>delete(...),</li><li>get(...),</li><li>post(...),</li><li>put(...)</li></ul>
 * To register a listener for all you can use the all(...) method.</p>
 *
 * @see module:dxp3-net-http/HTTPError
 * @see module:dxp3-net-http/HTTPServerEvent
 * @see module:dxp3-net-http/HTTPServerOptions
 * @see module:dxp3-net-http/HTTPServerState
 *
 * @example
 * const http = require('dxp3-net-http');
 * let httpServerOptions = {};
 * httpServerOptions.address = '127.0.0.1';
 * httpServerOptions.port = 8080;
 * httpServerOptions.secure = false;
 * httpServerOptions.timeout = 10000;
 * httpServerOptions.domains = 'www.example.com, something.domain.org';
 * httpServerOptions.roots = '/var/www/example.com, /var/www/domain.org';
 * httpServerOptions.redirects = [{domain:"example.com",regexp:"/images/:image",location:"https://{request.host}/galleries/{image}"}]
 * // Create a new HTTPServer
 * let httpServer = new http.HTTPServer(httpServerOptions);
 * httpServer.on(http.HTTPServerEvent.ADDED_CLIENT, () => {
 * });
 * httpServer.on(http.HTTPServerEvent.ERROR, () => {
 * });
 * httpServer.on(http.HTTPServerEvent.CLOSED_CLIENT, () => {
 * });
 * httpServer.on(http.HTTPServerEvent.RUNNING, (_address, _port) => {
 * });
 * httpServer.on(http.HTTPServerEvent.STARTING, () => {
 * });
 * httpServer.on(http.HTTPServerEvent.STOPPED, () => {
 * });
 * httpServer.on(http.HTTPServerEvent.STOPPING, () => {
 * });
 * httpServer.get('/heartbeat', (_request, _response) => {
 *    _response.send('Still alive');
 * });
 * // Start the server
 * httpServer.start();
 *
 * @module dxp3-net-http/HTTPServer
 */
const cleanup = require('dxp3-cleanup');
const EventEmitter = require('events');
const fs = require('fs');
const http = require('http');
const https = require('https');
const HTTPServerDomain = require('./HTTPServerDomain');
const HTTPResponse = require('./HTTPResponse');
const HTTPServerOptions = require('./HTTPServerOptions');
const HTTPError = require('./HTTPError');
const HTTPServerEvent = require('./HTTPServerEvent');
const HTTPServerState = require('./HTTPServerState');
// It's important to at least log warnings and errors.
const logging = require('dxp3-logging');
const tls = require('tls');
// We use the util.Help class to print out help information.
const util = require('dxp3-util');
// Lets get a reference to several utilities.
const Assert = util.Assert;
const Help = util.Help;
// Now that all modules have been defined and loaded,
// we create our logger.
const logger = logging.getLogger(canonicalName);

class HTTPServer extends EventEmitter {
    /*********************************************
     * CONSTRUCTOR
     ********************************************/

	/**
	 * @constructor
	 * @param {module:dxp3-net-http/HTTPServerOptions} _options
	 */
	constructor(_options) {
		logger.trace('constructor(): start.');
		super();
		this._options = HTTPServerOptions.parse(_options);
		// We keep track of all our clients using a Map.
		this._clients = new Map();
		// Each client will get an 'unique' ID that is reused after a sufficiently large
		// number has been reached.
		this._clientID = 0;
		this._socketCheckContinueHandler = () => {
		}
		this._socketCheckExpectationHandler = () => {
		}
		this._socketClientErrorHandler = (_error, _socket) => {
			if(_error.code === 'ECONNRESET' || !_socket.writable) {
				return;
			}
			_socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
  		}
		this._socketCloseHandler = () => {
			logger.trace('socketCloseHandler(): start.');
			// With the socket closed, we should remove our event handlers.
			this._socket.off('checkContinue', this._socketCheckContinueHandler);
			this._socket.off('checkExpectation', this._socketCheckExpectationHandler);
			this._socket.off('clientError', this._socketClientErrorHandler);
			this._socket.off('close', this._socketCloseHandler);
			this._socket.off('connect', this._socketConnectHandler);
			this._socket.off('connection', this._socketConnectionHandler);
			this._socket.off('error', this._socketErrorHandler);
			this._socket.off('listening', this._socketListeningHandler);
			this._socket.off('request', this._socketDomainRequestHandler);
			this._socket.off('upgrade', this._socketUpgradeHandler);
			// Set socket to null to allow it to be garbage collected.
			this._socket = null;
			// Set our state to STOPPED.
			this._state = HTTPServerState.STOPPED;
			// Let anyone who is interested know that we have stopped.
			logger.info('Stopped.');
			this.emit(HTTPServerEvent.STOPPED);
			logger.trace('socketCloseHandler(): end.');
		}
		this._socketConnectHandler = (_request, _socket, _head) => {
		}
		this._socketConnectionHandler = (_socket) => {
			logger.trace('socketConnectionHandler(): start.');
			this._clientID = (this._clientID > 1000000) ? 1 : this._clientID + 1;
			_socket.clientID = this._clientID;
			this._clients.set(this._clientID, _socket);
			_socket.on('close', () => {
				this._clients.delete(_socket.clientID);
				// Allow for garbage collection.
				_socket.removeAllListeners();
				logger.debug('Closed client.');
				this.emit(HTTPServerEvent.CLOSED_CLIENT);
			})
			logger.debug('Added client.');
			this.emit(HTTPServerEvent.ADDED_CLIENT);
			logger.trace('socketConnectionHandler(): end.');
		}
		this._socketErrorHandler = (_error) => {
			if(_error.code === 'EADDRINUSE') {
				logger.fatal('Port ' + this._options.port + ' is already in use.');
				this.emit(HTTPServerEvent.ERROR, HTTPError.EADDRINUSE);
			} else if(_error.code === 'EACCES') {
				logger.fatal('Permission denied.');
				this.emit(HTTPServerEvent.ERROR, HTTPError.EACCES);
			} else {
				logger.warn(_error.code);
				this.emit(HTTPServerEvent.ERROR, HTTPError.UNKNOWN);
			}
			this.stop();
		}
		this._socketListeningHandler = () => {
			logger.trace('socketListeningHandler(): start.');
			// When we bind the socket, it will start listening for connections.
			// That means we have started successfully. Set our state to RUNNING.
			this._state = HTTPServerState.RUNNING;
			// Let anyone who is interested know that we are up and running.
			let listeningOn = this._socket.address();
			logger.info('Listening on ' + listeningOn.address + ':' + listeningOn.port);
			this.emit(HTTPServerEvent.RUNNING, listeningOn.address, listeningOn.port);
			logger.trace('socketListeningHandler(): end.');
		}
		this._socketDomainRequestHandler = (_request, _response) => {
			let host = _request.headers['x-forwarded-host'];
			if(Assert.isUndefinedOrNull(host)) {
				host = _request.headers['host'];
				if(Assert.isUndefinedOrNull(host)) {
					let httpResponse = new HTTPResponse(_response);
					httpResponse.status(400).send('400 Bad Request');
					return;
				}
			}
			host = host.split(':')[0];
			let httpServerDomain = this._httpServerDomains.get(host);
			if(Assert.isUndefinedOrNull(httpServerDomain)) {
				// Check if there is a catch-all domain defined.
				httpServerDomain = this._httpServerDomains.get('*');
				if(Assert.isUndefinedOrNull(httpServerDomain)) {
					logger.warn('Unable to serve a request for the unconfigured domain \'' + host + '\'.');
					let httpResponse = new HTTPResponse(_response);
					httpResponse.status(404).send('404 Not Found');
					return;
				}
				this._httpServerDomains.set(host, httpServerDomain);
			}
			httpServerDomain.handle(_request, _response);
		}
		this._socketUpgradeHandler = () => {
		}
		this._socketTimeoutHandler = (_socket) => {
		}
		this._httpServerDomains = new Map();
		// An HTTPServer is able to serve multiple domains.
		// These domains and their root folders can be supplied as an constructor argument.
		if(this._options.domains.length > 0) {
			for(let i=0;i < this._options.domains.length;i++) {
				let domainName = this._options.domains[i];
				let root = this._options.roots[i];
				this.addHTTPServerDomain(domainName, root);
			}
		}
		if(this._options.redirects.length > 0) {
			for(let i=0;i < this._options.redirects.length;i++) {
				let redirect = this._options.redirects[i];
				this.redirect(redirect.regexp, redirect.domain, redirect.location);
			}
		}
		// All done constructing our HTTPServer.
		// It is time to set our state to INITIALIZED.
		this._state = HTTPServerState.INITIALIZED;
		// Now that we are initialized we can set our certificates folder
		// if we are running in secure mode.
		if(this._options.secure) {
			try {
				this.setCertificatesFolder(this._options.certificatesFolder);
			} catch(_exception) {
				// Something went wrong setting the certificates folder.
				// Because we are supposed to run in secure mode, we sound the alarm.
				// This is highly likely a fatal error, but we'll defer to our
				// start method.
				logger.error('Unable to set the certificates folder: ' + _exception.toString());
			}
		}
		logger.info('Address                             : ' + this._options.address);
		logger.info('Port                                : ' + this._options.port);
		logger.info('Secure (https enabled or not)       : ' + this._options.secure);
		if(this._options.secure) {
		logger.info('Certificates folder                 : ' + this._options.certificatesFolder);
		}
		let i = 0;
		for(let [domainName,httpServerDomain] of this._httpServerDomains) {
			if(i === 0) {
				if(httpServerDomain.root === null) {
		logger.info('Domains (* default)                 : ' + domainName);
				} else {
		logger.info('Domains (* default)                 : ' + domainName + ' -> ' + httpServerDomain.root);
				}
			} else {
				if(httpServerDomain.root === null) {
		logger.info('                                      ' + domainName);
				} else {
		logger.info('                                      ' + domainName + ' -> ' + httpServerDomain.root);
				}
			}
			i++;
		}
		i = 0;
		for(let [domainName,httpServerDomain] of this._httpServerDomains) {
			let redirects = httpServerDomain.redirects;
			if(redirects.length <= 0) {
				continue;
			}
			for(let j=0;j < redirects.length;j++) {
				let redirect = redirects[j];
				if(i === 0) {
		logger.info('Redirects (domain->regexp->location): ' + domainName + ' -> ' + redirect.regexp + ' -> ' + redirect.location);
				} else {
		logger.info('                                      ' + domainName + ' -> ' + redirect.regexp + ' -> ' + redirect.location);
				}
				i++;
			}
		}
		logger.debug('constructor(...): Initialized.');
		logger.trace('constructor(): end.');
	}
	/**
	 * Alias for addHTTPServerDomain(...).
	 * @throws {module:dxp3-net/HTTPError.ILLEGAL_ARGUMENT} when no arguments are supplied.
	 */
	addDomain(..._args) {
		this.addHTTPServerDomain(_args)
	}
	/**
	 * Alias for addHTTPServerDomain(...).
	 * @throws {module:dxp3-net/HTTPError.ILLEGAL_ARGUMENT} when no arguments are supplied.
	 */
	addServerDomain(..._args) {
		this.addHTTPServerDomain(_args);
	}
	/**
	 * Add a new HTTPServerDomain to this HTTPServer.
	 * @throws {module:dxp3-net/HTTPError.ILLEGAL_ARGUMENT} when no arguments are supplied.
	 */
	addHTTPServerDomain(..._args) {
		logger.trace('addHTTPServerDomain(): start.');
		if(Assert.isUndefinedOrNullOrEmptyArray(_args)) {
			// Calling addHTTPServerDomain(...) without any arguments could be
			// a programming error. Lets log a warning.
			logger.warn('addHTTPServerDomain(...): Missing arguments.');
			logger.trace('addHTTPServerDomain(): end.');
			throw HTTPError.ILLEGAL_ARGUMENT;
		}
		let domainName = null;
		let root = null;
		let httpServerDomain = null;
		if(_args.length === 1) {
			httpServerDomain = _args[0];
			if(httpServerDomain === undefined || httpServerDomain === null) {
				logger.warn('addHTTPServerDomain(...): Missing HTTPServerDomain object.');
				logger.trace('addHTTPServerDomain(): end.');
				throw HTTPError.ILLEGAL_ARGUMENT;
			}
			domainName = httpServerDomain.domain;
			if(Assert.isUndefinedOrNullOrNotAStringOrEmpty(domainName)) {
				logger.warn('addHTTPServerDomain(...): Missing or empty domain name.');
				logger.trace('addHTTPServerDomain(): end.');
				throw HTTPError.ILLEGAL_ARGUMENT;
			}
			domainName = domainName.trim();
			root = httpServerDomain.root;
		} else if(_args.length === 2) {
			domainName = _args[0];
			if(Assert.isUndefinedOrNullOrNotAStringOrEmpty(domainName)) {
				logger.warn('addHTTPServerDomain(...): Missing or empty domain name.');
				logger.trace('addHTTPServerDomain(): end.');
				throw HTTPError.ILLEGAL_ARGUMENT;
			}
			domainName = domainName.trim();
			root = _args[1];
			if(Assert.isUndefinedOrNull(root)) {
				root = '';
			}
			root = root.trim();
			httpServerDomain = new HTTPServerDomain(domainName, root);
		}
		if(this._httpServerDomains.has(domainName)) {
			logger.info('Update domain \'' + domainName + '\'.');
			this._httpServerDomains.set(domainName, httpServerDomain);
			// Updating the default/catch-all domain requires additional checks.
			// When a domain that is not defined is added it will create an entry to the
			// catch all definition.
			if(domainName === '*') {
				let defaultDomain = httpServerDomain;
				for(let [domainName,httpServerDomain] of this._httpServerDomains) {
					if(httpServerDomain.domain === '*' && domainName != '*') {
						this._httpServerDomains.set(domainName, defaultDomain);
					}
				}
			}
		} else {
			if(Assert.isUndefinedOrNullOrEmptyString(root)) {
				logger.info('Add domain \'' + domainName + '\'.');
			} else {
				logger.info('Add domain \'' + domainName + '\' with root \'' + root + '\'.');
			}
			this._httpServerDomains.set(domainName, httpServerDomain);
		}
		logger.trace('addHTTPServerDomain(): end.');
	}

	clearDomains() {
		this.clearHTTPServerDomains();
	}

	clearServerDomains() {
		this.clearHTTPServerDomains();
	}

	clearHTTPServerDomains() {
		logger.trace('clearHTTPServerDomains(): start.');
		this._httpServerDomains.clear();
		logger.trace('clearHTTPServerDomains(): end.');
	}

	deleteDomain(_domainName) {
		this.deleteHTTPServerDomain(_domainName);
	}

	deleteServerDomain(_domainName) {
		this.deleteHTTPServerDomain(_domainName);
	}

	deleteHTTPServerDomain(_domainName) {
		logger.trace('deleteHTTPServerDomain(): start.');
		if(Assert.isUndefinedOrNullOrNotAStringOrEmpty(_domainName)) {
			// Calling deleteHTTPServerDomain(...) without any arguments could be
			// a programming error. Lets log a warning.
			logger.warn('deleteHTTPServerDomain(...): Missing or empty domain name.');
			logger.trace('deleteHTTPServerDomain(): end.');
			throw HTTPError.ILLEGAL_ARGUMENT;
		}
		_domainName = _domainName.trim();
		// Deleting the default/catch-all domain requires additional checks.
		// When a domain that is not defined is added it will create an entry with 
		// a reference to the catch all definition.
		if(_domainName === '*') {
			for(let [domainName,httpServerDomain] of this._httpServerDomains) {
				if(httpServerDomain.domain === '*') {
					this._httpServerDomains.delete(domainName);
				}
			}
		} else {
			this._httpServerDomains.delete(_domainName);
		}
		logger.trace('deleteHTTPServerDomain(): end.');
	}

	/**
	 * @param {String} regexString 
	 * @param {String} domainName optional domain name is only useful when we serve more than one domain.
	 * @param {String} location to redirect to
	 * @throws {module:dxp3-net/HTTPError.ILLEGAL_ARGUMENT} when the supplied regexString or location are invalid.
	 */
	redirect(regexString, ..._args) {
		// Defensive programming...check input...
		if(regexString === undefined || regexString === null) {
			throw HTTPError.ILLEGAL_ARGUMENT;
		}
		// We need at least a redirect URL.
		if(_args.length <= 0) {
			throw HTTPError.ILLEGAL_ARGUMENT;
		}
		let domainName = '';
		let location = null;
		if(_args.length === 1) {
			location = _args[0];
		}
		if(_args.length >= 2) {
			domainName = _args[0];
			if(domainName === undefined || domainName === null) {
				domainName = '';
			}
			domainName = domainName.trim();
			location = _args[1];
		}
		if(location === undefined || location === null) {
			throw HTTPError.ILLEGAL_ARGUMENT;
		}
		if(domainName.length <= 0) {
			domainName = '*';
		}
		let domain = this._httpServerDomains.get(domainName);
		if(domain === undefined || domain === null) {
			logger.warn('redirect(...): Unconfigured domain \'' + domainName + '\'.');
			throw HTTPError.FILE_NOT_FOUND
		}
		domain.redirect(regexString, location);
	}

	/**
	 * @param {String} regexString 
	 * @param {String} domainName optional domain name is only useful when we serve more than one domain.
	 * @param {Function} callback Signature function(request, response)
	 * @throws {module:dxp3-net/HTTPError.ILLEGAL_ARGUMENT} when the supplied regexString or callback are invalid.
	 */
	all(regexString, ..._args) {
		// Defensive programming...check input...
		if(regexString === undefined || regexString === null) {
			throw HTTPError.ILLEGAL_ARGUMENT;
		}
		// We need at least a callback function.
		if(_args.length <= 0) {
			throw HTTPError.ILLEGAL_ARGUMENT;
		}
		let domainName = '';
		let callback = null;
		if(_args.length === 1) {
			callback = _args[0];
		}
		if(_args.length >= 2) {
			domainName = _args[0];
			if(domainName === undefined || domainName === null) {
				domainName = '';
			}
			domainName = domainName.trim();
			callback = _args[1];
		}
		if(callback === undefined || callback === null) {
			throw HTTPError.ILLEGAL_ARGUMENT;
		}
		if(typeof callback != 'function') {
			throw HTTPError.ILLEGAL_ARGUMENT;
		}
		if(domainName.length <= 0) {
			domainName = '*';
		}
		let domain = this._httpServerDomains.get(domainName);
		if(domain === undefined || domain === null) {
			logger.warn('all(...): Unconfigured domain \'' + domainName + '\'.');
			throw HTTPError.FILE_NOT_FOUND;
		}
		domain.all(regexString, callback);
	}

	/**
	 * @param {String} regexString
	 * @param {String} domainName optional domain name only useful when we serve more than one domain.
	 * @param {Function} callback Signature function(request, response)
	 * @throws {module:dxp3-net/HTTPError.ILLEGAL_ARGUMENT} when the supplied regexString or callback are invalid.
	 */
	delete(regexString, ..._args) {
		// Defensive programming...check input...
		if(regexString === undefined || regexString === null) {
			throw HTTPError.ILLEGAL_ARGUMENT;
		}
		// We need at least a callback function.
		if(_args.length <= 0) {
			throw HTTPError.ILLEGAL_ARGUMENT;
		}
		let domainName = '';
		let callback = null;
		if(_args.length === 1) {
			callback = _args[0];
		}
		if(_args.length >= 2) {
			domainName = _args[0];
			if(domainName === undefined || domainName === null) {
				domainName = '';
			}
			domainName = domainName.trim();
			callback = _args[1];
		}
		if(callback === undefined || callback === null) {
			throw HTTPError.ILLEGAL_ARGUMENT;
		}
		if(typeof callback != 'function') {
			throw HTTPError.ILLEGAL_ARGUMENT;
		}
		if(domainName.length <= 0) {
			domainName = '*';
		}
		let domain = this._httpServerDomains.get(domainName);
		if(domain === undefined || domain === null) {
			logger.warn('delete(...): Unconfigured domain \'' + domainName + '\'.');
			throw HTTPError.FILE_NOT_FOUND;
		}
		domain.delete(regexString, callback);
	}

	/**
	 * @param {String} regexString
	 * @param {String} domainName optional domain name only useful when we serve more than one domain.
	 * @param {Function} callback Signature function(request, response)
	 * @throws {module:dxp3-net/HTTPError.ILLEGAL_ARGUMENT} when the supplied regexString or callback are invalid.
	 */
	get(regexString, ..._args) {
		// Defensive programming...check input...
		if(regexString === undefined || regexString === null) {
			throw HTTPError.ILLEGAL_ARGUMENT;
		}
		// We need at least a callback function.
		if(_args.length <= 0) {
			throw HTTPError.ILLEGAL_ARGUMENT;
		}
		let domainName = '';
		let callback = null;
		if(_args.length === 1) {
			callback = _args[0];
		}
		if(_args.length >= 2) {
			domainName = _args[0];
			if(domainName === undefined || domainName === null) {
				domainName = '';
			}
			domainName = domainName.trim();
			callback = _args[1];
		}
		if(callback === undefined || callback === null) {
			throw HTTPError.ILLEGAL_ARGUMENT;
		}
		if(typeof callback != 'function') {
			throw HTTPError.ILLEGAL_ARGUMENT;
		}
		if(domainName.length <= 0) {
			domainName = '*';
		}
		let domain = this._httpServerDomains.get(domainName);
		if(domain === undefined || domain === null) {
			logger.warn('get(...): Unconfigured domain \'' + domainName + '\'.');
			throw HTTPError.FILE_NOT_FOUND;
		}
		domain.get(regexString, callback);
	}

	/**
	 * @param {String} regexString
	 * @param {String} domainName optional domain name only useful when we serve more than one domain.
	 * @param {Function} callback Signature function(request, response)
	 * @throws {module:dxp3-net/HTTPError.ILLEGAL_ARGUMENT} when the supplied regexString or callback are invalid.
	 */
	post(regexString, ..._args) {
		// Defensive programming...check input...
		if(regexString === undefined || regexString === null) {
			throw HTTPError.ILLEGAL_ARGUMENT;
		}
		// We need at least a callback function.
		if(_args.length <= 0) {
			throw HTTPError.ILLEGAL_ARGUMENT;
		}
		let domainName = '';
		let callback = null;
		if(_args.length === 1) {
			callback = _args[0];
		}
		if(_args.length >= 2) {
			domainName = _args[0];
			if(domainName === undefined || domainName === null) {
				domainName = '';
			}
			domainName = domainName.trim();
			callback = _args[1];
		}
		if(callback === undefined || callback === null) {
			throw HTTPError.ILLEGAL_ARGUMENT;
		}
		if(typeof callback != 'function') {
			throw HTTPError.ILLEGAL_ARGUMENT;
		}
		if(domainName.length <= 0) {
			domainName = '*';
		}
		let domain = this._httpServerDomains.get(domainName);
		if(domain === undefined || domain === null) {
			logger.warn('post(...): Unconfigured domain \'' + domainName + '\'.');
			throw HTTPError.FILE_NOT_FOUND;
		}
		domain.post(regexString, callback);
	}

	/**
	 * @param {String} regexString
	 * @param {String} domainName optional domain name only useful when we serve more than one domain.
	 * @param {Function} callback Signature function(request, response)
	 * @throws {module:dxp3-net/HTTPError.ILLEGAL_ARGUMENT} when the supplied regexString or callback are invalid.
	 */
	put(regexString, ..._args) {
		// Defensive programming...check input...
		if(regexString === undefined || regexString === null) {
			throw HTTPError.ILLEGAL_ARGUMENT;
		}
		// We need at least a callback function.
		if(_args.length <= 0) {
			throw HTTPError.ILLEGAL_ARGUMENT;
		}
		let domainName = '';
		let callback = null;
		if(_args.length === 1) {
			callback = _args[0];
		}
		if(_args.length >= 2) {
			domainName = _args[0];
			if(domainName === undefined || domainName === null) {
				domainName = '';
			}
			domainName = domainName.trim();
			callback = _args[1];
		}
		if(callback === undefined || callback === null) {
			throw HTTPError.ILLEGAL_ARGUMENT;
		}
		if(typeof callback != 'function') {
			throw HTTPError.ILLEGAL_ARGUMENT;
		}
		if(domainName.length <= 0) {
			domainName = '*';
		}
		let domain = this._httpServerDomains.get(domainName);
		if(domain === undefined || domain === null) {
			logger.warn('put(...): Unconfigured domain \'' + domainName + '\'.');
			throw HTTPError.FILE_NOT_FOUND;
		}
		domain.put(regexString, callback);
	}

	/**
	 * Start the HTTPServer.
	 * @fires module:dxp3-net/HTTPServerEvent#STARTING
	 * @throws {module:dxp3-net/HTTPError.ILLEGAL_STATE} thrown when the server is in the process of stopping.
	 * @throws {module:dxp3-net/HTTPError.SOCKET_EXCEPTION} thrown when something goes wrong listening on the specified host/port.
	 */
	start() {
		logger.trace('start(): start.');
		// No point in starting if we are already running or
		// are starting.
		if((this._state === HTTPServerState.RUNNING) ||
		   (this._state === HTTPServerState.STARTING)) {
		   	// Initially we threw an illegal state exception, but we deem that to harsh.
			// There really is no problem with calling start again if we are already starting or running. 
			logger.debug('start(): Already running or starting.');
			logger.trace('start(): end.');
		   	return;
		}
		// If we are in the process of stopping, we'll have to wait until
		// we have completely stopped before we can start again.
		// Throw an ILLEGAL STATE error.
		if(this._state === HTTPServerState.STOPPING) {
			logger.trace('start(): end.');
		   	throw HTTPError.ILLEGAL_STATE;
		}
		// If we made it this far, it means we are either initialized or stopped.
		if(this._options.secure) {
			// We perform the check synchronously, which is perfectly fine, because 
			// the HTTP Server is stopped.
			if(!fs.existsSync(this._options.certificatesFolder)) {
				logger.warn('start(): Certificates folder \'' + this._options.certificatesFolder + '\' does NOT exist.');
				logger.trace('start(): end.');
				throw HTTPError.FILE_NOT_FOUND;
			}
			let defaultKeyPath = this._options.certificatesFolder + 'privkey.pem';
			try {
				this._options.defaultKey = fs.readFileSync(defaultKeyPath);
			} catch(exception) {
				logger.warn('Unable to read default key file located at \'' + defaultKeyPath + '\'.');
				logger.info('Each domain will require its own key file located at: \'' + this._options.certificatesFolder + '<domain name>' + path.sep + 'privkey.pem\'.');
			}
			let defaultCertPath = this._options.certificatesFolder + 'fullchain.pem';
			try {
				this._options.defaultCert = fs.readFileSync(defaultCertPath);
			} catch(exception) {
				logger.warn('Unable to read default certificate file located at \'' + defaultCertPath + '\'.');	
				logger.info('Each domain will require its own certificate file located at: \'' + this._options.certificatesFolder + '<domain name>' + path.sep + 'fullchain.pem\'.');
			}
		} else {
			logger.warn('We are running in unsecure HTTP mode.');
		}
		// Check if there are any domains defined.
		if(this._httpServerDomains.size <= 0) {
			logger.warn('There are no domains configured. We can not serve any requests.');
		}
		// Set our state to STARTING.
		this._state = HTTPServerState.STARTING;
		// Let anyone who is interested know that we are starting.
		logger.info('Starting.');
		this.emit(HTTPServerEvent.STARTING);
		try {
			if(this._options.secure) {
				let certificatesFolder = this._options.certificatesFolder;
				let getSecureContext = (_domain) => {
					let secureContext = null;
					let key = null;
					let cert = null;
					try {
						key = fs.readFileSync(certificatesFolder + _domain + path.sep + 'privkey.pem');
						cert = fs.readFileSync(certificatesFolder + _domain + path.sep + 'fullchain.pem');
						secureContext = tls.createSecureContext({
							key: key,
							cert: cert
						});
					} catch(exception) {
						secureContext = tls.createSecureContext({
							key: this._options.defaultKey,
							cert: this._options.defaultCert
						});
					}
					return secureContext;
				}
				let options = {
					SNICallback: function(domain, callback) {
						let secureContext = getSecureContext(domain);
						callback(null, secureContext);
					},
					key: this._options.defaultKey,
					cert: this._options.defaultCert
					// ca: fs.readFileSync('/etc/letsencrypt/live/codecoat.com/chain.pem')
				}
				this._socket = https.createServer(options);
			} else {
				this._socket = http.createServer();
			}
			this._socket.on('checkContinue', this._socketCheckContinueHandler);
			this._socket.on('checkExpectation', this._socketCheckExpectationHandler);
			this._socket.on('clientError', this._socketClientErrorHandler);
			this._socket.on('close', this._socketCloseHandler);
			this._socket.on('connect', this._socketConnectHandler);
			this._socket.on('connection', this._socketConnectionHandler);
			this._socket.on('error', this._socketErrorHandler);
			this._socket.on('listening', this._socketListeningHandler);
			this._socket.on('request', this._socketDomainRequestHandler);
			this._socket.on('upgrade', this._socketUpgradeHandler);
			if(this._options.address === null) {
				logger.debug('start(): Attempt to listen on 0.0.0.0:' + this._options.port);
				this._socket.listen(this._options.port, "0.0.0.0");
			} else {
				logger.debug('start(): Attempt to listen on ' + this._options.address + ':' + this._options.port);
				this._socket.listen(this._options.port, this._options.address);
			}
		} catch(_exception) {
			logger.error('start(): ' + _exception);
			logger.trace('start(): end.');
			throw HTTPError.SOCKET_EXCEPTION;
		}
		logger.trace('start(): end.');
	}

	/**
	 * Stop the HTTPServer.
	 * @fires module:dxp3-net/HTTPServerEvent#STOPPED
	 * @fires module:dxp3-net/HTTPServerEvent#STOPPING
	 */
	stop() {
		logger.trace('stop(): start.');
		// No point in stopping if we have already stopped or
		// are in the process of stopping.
		if((this._state === HTTPServerState.STOPPED) ||
		   (this._state === HTTPServerState.STOPPING)) {
		   	// Initially we threw an illegal state exception, but we deem that to harsh.
			// There really is no problem with calling stop again if we are stopping or have already stopped. 
			logger.debug('stop(): Already stopped or stopping.');
			logger.trace('stop(): end.');
		   	return;
		}
		// If we are INITIALIZED, we can go directly to stopped.
		if(this._state === HTTPServerState.INITIALIZED) {
			// Set our state to STOPPED.
			this._state = HTTPServerState.STOPPED;
			// Let anyone who is interested know that we are stopped.
			logger.info('Stopped.');
			this.emit(HTTPServerEvent.STOPPED);
			logger.trace('stop(): end.');
			return;
		}
		// Set our state to STOPPING.
		this._state = HTTPServerState.STOPPING;
		logger.info('Stopping.');
		this.emit(HTTPServerEvent.STOPPING);
		// We attempt to close the server socket.
		// This should emit a close event, which we handle (socket.on('close',....)).
		// In that function we will set our state to HTTPServerState.STOPPED.
		this._socket.close();
		logger.trace('stop(): end.');
	}

	/*******************************************
	 * GETTERS                                 *
	 ******************************************/

	/**
	 * Retrieve the current address of the HTTPServer.
	 * @returns {String}
	 */
	get address() {
		return this.getAddress();
	}

	/**
	 * Retrieve the current address of the HTTPServer.
	 * @returns {String}
	 */
	getAddress() {
		return this._options.address;
	}

	get certificatesFolder() {
		return this.getCertificatesFolder();
	}

	getCertificatesFolder() {
		return this._options.certificatesFolder;
	}

	/**
	 * Retrieve the list of domains.
	 * @returns {Array}
	 */
	get domains() {
		return this.getDomains();
	}

	/**
	 * Retrieve the list of domains.
	 * @returns {Array}
	 */
	getDomains() {
		let result = [];
		let domainNames = new Set();
		for(let [key,value] of this._httpServerDomains) {
			if(domainNames.has(value.domain)) {
				continue;
			}
			domainNames.add(value.domain);
			let domain = {
				name: value.domain,
				root: value.root
			};
			result.push(domain);
		}
		return result;
	}

	/**
	 * Retrieve the list of domains.
	 * @returns {Array}
	 */
	listDomains() {
		return this.getDomains();
	}

	/**
	 * Retrieve the list of domains.
	 * @returns {Array}
	 */
	listServerDomains() {
		return this.getDomains();
	}

	/**
	 * Retrieve the list of domains.
	 * @returns {Array}
	 */
	listHTTPServerDomains() {
		return this.getDomains();
	}

	isEncrypted() {
		return (this._options.secure);
	}

	isInitialized() {
		return this._state === HTTPServerState.INITIALIZED;
	}

	isRunning() {
		return this._state === HTTPServerState.RUNNING;
	}

	isStarting() {
		return this._state === HTTPServerState.STARTING;
	}

	isStopped() {
		return this._state === HTTPServerState.STOPPED;
	}

	isStopping() {
		return this._state === HTTPServerState.STOPPING;
	}

	isSecure() {
		return this._options.secure;
	}

	/**
	 * Retrieve the current port of the HTTPServer.
	 * @returns {Number}
	 */
	get port() {
		return this.getPort();
	}

	/**
	 * Retrieve the current port of the HTTPServer.
	 * @returns {Number}
	 */
	getPort() {
		return this._options.port;
	}

	/**
	 * Retrieve the current state of the HTTPServer.
	 * @returns {module:dxp3-net-http/HTTPServerState}
	 */
	get state() {
		return this.getState();
	}

	/**
	 * Retrieve the current state of the HTTPServer.
	 * @returns {module:dxp3-net-http/HTTPServerState}
	 */
	getState() {
		return this._state;
	}

	/*******************************************
	 * SETTERS                                 *
	 ******************************************/

	set address(_address) {
		this.setAddress(_address);
	}

	setAddress(_address) {
		logger.trace('setAddress(...): start.');
		// Defensive programming...check input...
		if(_address === undefined || _address === null) {
			// Calling setAddress(...) without any arguments could be
			// a programming error. Lets log a warning.
			logger.warn('setAddress(...): Missing arguments.');
			logger.trace('setAddress(...): end.');
			throw HTTPError.ILLEGAL_ARGUMENT;
		}
		// We are only able to change our address if we are stopped or initialized.
		if((this._state != HTTPServerState.INITIALIZED) && (this._state != HTTPServerState.STOPPED)) {
			// Calling setAddress(...) without checking our state could be
			// a programming error. Lets log a warning.
			logger.warn('setAddress(...): Illegal state \'' + this._state + '\'.');
			logger.trace('setAddress(...): end.');
			throw HTTPError.ILLEGAL_STATE;
		}
		this._options.address = _address;
		logger.debug('setAddress(...): ' + this._options.address);
		logger.trace('setAddress(...): end.');
	}

	set certificatesFolder(_certificatesFolder) {
		this.setCertificatesFolder(_certificatesFolder);
	}

	setCertificatesFolder(_certificatesFolder) {
		logger.trace('setCertificatesFolder(...): start.');
		// We are only able to change our certificates folder if we are stopped or initialized.
		if((this._state != HTTPServerState.INITIALIZED) && (this._state != HTTPServerState.STOPPED)) {
			// Calling setCertificatesFolder(...) without checking our state could be
			// a programming error. Lets log a warning.
			logger.warn('setCertificatesFolder(...): Illegal state \'' + this._state + '\'.');
			logger.trace('setCertificatesFolder(...): end.');
			throw HTTPError.ILLEGAL_STATE;
		}
		if(_certificatesFolder === undefined || _certificatesFolder === null) {
			this._options.certificatesFolder = '';
		} else {
			this._options.certificatesFolder = _certificatesFolder;
		}
		if(!this._options.certificatesFolder.endsWith(path.sep)) {
			this._options.certificatesFolder += path.sep;
		}
		logger.debug('setCertificatesFolder(...): Certificates folder set to \'' + this._options.certificatesFolder + '\'.');
		logger.trace('setCertificatesFolder(...): end.');
	}

	set port(_port) {
		this.setPort(_port);
	}

	/**
	 * Set the port of this server. Note that in order to set the port the http server must not yet have been
	 * started (it's state is HTTPServerState.INITIALIZED) or is stopped (it's state is HTTPServerState.STOPPED).
	 * You may want to check the state first by calling getState().
	 * @param {Number} port
	 * @throws {module:dxp3-net/HTTPError.ILLEGAL_ARGUMENT} when the supplied port parameter is not a valid number.
	 * @throws {module:dxp3-net/HTTPError.ILLEGAL_STATE} when the server is not initialized and not stopped.
	 */
	setPort(_port) {
		logger.trace('setPort(...): start.');
		// Defensive programming...check input...
		if(_port === undefined || _port === null) {
			// Calling setPort(...) without any arguments could be
			// a programming error. Lets log a warning.
			logger.warn('setPort(...): Missing arguments.')
			logger.trace('setPort(...): end.');
			throw HTTPError.ILLEGAL_ARGUMENT;
		}
		if(typeof _port === 'string') {
			_port = _port.trim();
			if(_port.length <= 0) {
				// Calling setPort(...) with an empty argument could be
				// a programming error. Lets log a warning.
				logger.warn('setPort(...): Port is an empty string.')
				logger.trace('setPort(...): end.');
				throw HTTPError.ILLEGAL_ARGUMENT;
			}
			_port = parseInt(_port, 10);
		}
		if(isNaN(_port)) {
			// Port must be a number. This could be a programming error.
			logger.warn('setPort(...): Port is not a number.');
			logger.trace('setPort(...): end.');
			throw HTTPError.ILLEGAL_ARGUMENT;
		}
		if(_port <= 0) {
			logger.warn('setPort(...): Port is smaller or equal to 0.');
			logger.trace('setPort(...): end.');
			throw HTTPError.ILLEGAL_ARGUMENT;
		}
		// If the port is the same we ignore the request.
		if(this._options.port === _port) {
			logger.debug('setPort(...): Port is already set to \'' + this._options.port + '\'.');
			logger.trace('setPort(...): end.');
			return;
		}
		// We are only able to change our port if we are stopped or initialized.
		if((this._state != HTTPServerState.INITIALIZED) &&
		   (this._state != HTTPServerState.STOPPED)) {
			// Calling setPort(...) without checking our state could be
			// a programming error. Lets log a warning.
			logger.warn('setPort(...): Illegal state \'' + this._state + '\'.');
			logger.trace('setPort(...): end.');
			throw HTTPError.ILLEGAL_STATE;
		}
		this._options.port = _port;
		logger.debug('setPort(...): Port set to \'' + this._options.port + '\'.');
		logger.trace('setPort(...): end.');
	}

	set secure(_secure) {
		this.setSecure(_secure);
	}

	setSecure(_secure) {
		logger.trace('setSecure(...): start.');
		// Defensive programming...check input...
		if(_secure === undefined || _secure === null) {
			// Calling setSecure(...) without any arguments could be
			// a programming error. Lets log a warning.
			logger.warn('setSecure(...): Missing arguments.');
			logger.trace('setSecure(...): end.');
			throw HTTPError.ILLEGAL_ARGUMENT;
		}
		if(typeof _secure === 'string') {
			_secure = _secure.trim().toLowerCase();
			if(_secure === 'on'   ||
			   _secure === 'true' ||
			   _secure === 'y'	   ||
			   _secure === 'yes') {
				_secure = true;
			} else {
				_secure = false;
			}
		}
		if(typeof _secure != 'boolean') {
			// Calling setSecure(...) without a non boolean argument
			// could be a programming error. Lets log a warning.
			logger.warn('setSecure(...): Argument is not a string nor a boolean type.');
			logger.trace('setSecure(...): end.');
			throw HTTPError.ILLEGAL_ARGUMENT;
		}
		// If the current security setting is the same we ignore the request.
		if(this._options.secure === _secure) {
			logger.debug('setSecure(...): Security is already set to \'' + this._options.secure + '\'.');
			logger.trace('setSecure(...): end.');
			return;
		}
		// We are only able to change our security if we are stopped or initialized.
		if((this._state != HTTPServerState.INITIALIZED) && (this._state != HTTPServerState.STOPPED)) {
			// Calling setSecure(...) without checking our state could be
			// a programming error. Lets log a warning.
			logger.warn('setSecure(...): Illegal state \'' + this._state + '\'.');
			logger.trace('setSecure(...): end.');
			throw HTTPError.ILLEGAL_STATE;
		}
		this._options.secure = _secure;
		logger.debug('setSecure(...): Set to \'' + this._options.secure + '\'.');
		logger.trace('setSecure(...): end.');		
	}

	static main() {
		try {
			let httpServerOptions = HTTPServerOptions.parseCommandLine();
			logging.setLevel(httpServerOptions.logLevel);
			if(httpServerOptions.help) {
				Help.print(this);
				return;
			}
			// Just to be extra careful, lets ensure the root folders actually exist.
			const fs = require('fs');
			for(let i=0;i < httpServerOptions.roots.length;i++) {
				if(!fs.existsSync(httpServerOptions.roots[i])) {
					logger.fatal('Folder \'' + httpServerOptions.roots[i] + '\' does NOT exist.');
					logger.info('Exiting due to fatal error.');
					process.exit();
				}
			}
			let httpServer = new HTTPServer(httpServerOptions);
			httpServer.on(HTTPServerEvent.ERROR, (_error) => {
				logger.error(_error.code + ':' + _error.message);
			});
			httpServer.on(HTTPServerEvent.RUNNING, (_address, _port) => {
				console.log('To get help include the -help option:');
				console.log('node ./HTTPServer -help');
				console.log('');
				console.log('HTTPServer running at ' + _address + ':' + _port);
			});
			// If the process is interrupted we stop the HTTPServer and shutdown gracefully.
			cleanup.Manager.addInterruptListener(() => {
				logger.debug('main(): Process interrupt received. Will attempt to stop.');
				httpServer.stop();
			});
			// If the process is killed we have no time to gracefully shutdown.
			// We will at least attempt to log a warning.
			cleanup.Manager.addKillListener((_killCode) => {
				logger.warn('main(): HTTPServer killed.');
			});
			httpServer.start();
		} catch(exception) {
			console.log('');
			console.log('EXCEPTION:' + exception.message);
			process.exit(666);
		}
	}
}
// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
	HTTPServer.main();
	return;
}
module.exports = HTTPServer;