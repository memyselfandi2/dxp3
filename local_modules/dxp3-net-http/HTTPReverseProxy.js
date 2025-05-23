/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-net-http
 *
 * NAME
 * HTTPReverseProxy
 */
const packageName = 'dxp3-net-http';
const moduleName = 'HTTPReverseProxy';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * An HTTPReverseProxy load balances requests between multiple http servers and/or
 * other load balancers/proxies.
 *
 * @example
 * const http = require('dxp3-net-http');
 * let myHTTPReverseProxy = new http.HTTPReverseProxy({port:8080});
 * myHTTPReverseProxy.on(net.HTTPReverseProxyEvent.ERROR, function(_error) {
 *		if(_error === net.HTTPError.SERVICE_UNAVAILABLE) {
 * 			console.log('Received a request while there are no downstream servers available.');
 * 			console.log('This should be a panic condition.');
 * 		}
 * });
 * myHTTPReverseProxy.on(net.HTTPReverseProxyEvent.RUNNING, function(_address, _port) {
 * 		console.log('HTTPReverseProxy running at ' + _address + ':' + _port + '.');
 * });
 * myHTTPReverseProxy.on(net.HTTPReverseProxyEvent.STARTING, function() {
 * 		console.log('HTTPReverseProxy is starting.');
 * });
 * myHTTPReverseProxy.on(net.HTTPReverseProxyEvent.STOPPED, function() {
 * 		console.log('HTTPReverseProxy has stopped.');
 * });
 * myHTTPReverseProxy.on(net.HTTPReverseProxyEvent.STOPPING, function() {
 * 		console.log('HTTPReverseProxy is stopping.');
 * });
 * myHTTPReverseProxy.start();
 *
 * @module dxp3-net-http/HTTPReverseProxy
 */
const logging = require('dxp3-logging');
// We emit events.
const EventEmitter = require('events');
const fs = require('fs');
const http = require('http');
const https = require('https');
const HTTPReverseProxyOptions = require('./HTTPReverseProxyOptions');
const HTTPReverseProxyDomain = require('./HTTPReverseProxyDomain');
const HTTPReverseProxyDomainMap = require('./HTTPReverseProxyDomainMap');
const HTTPError = require('./HTTPError');
const HTTPReverseProxyEvent = require('./HTTPReverseProxyEvent');
const HTTPReverseProxyState = require('./HTTPReverseProxyState');
const tls = require('tls');
const util = require('dxp3-util');

const Assert = util.Assert;
const logger = logging.getLogger(canonicalName);
/**
 * An HTTPReverseProxy load balances requests between multiple http servers and/or
 * other load balancers/proxies.
 */
class HTTPReverseProxy extends EventEmitter {
	/**
	 * @param {module:dxp3-net-http/HTTPReverseProxyOptions} args
	 */
	 constructor(_options) {
	 	super();
		this._options = HTTPReverseProxyOptions.parse(_options);
		this._socketCloseHandler = () => {
			// With the socket closed, we should remove our event handlers.
			this._socket.off('close', this._socketCloseHandler);
			this._socket.off('error', this._socketErrorHandler);
			this._socket.off('listening', this._socketListeningHandler);
			this._socket.off('request', this._socketRequestHandler);
			// Set socket to null to allow it to be garbage collected.
			this._socket = null;
			// Set our state to STOPPED.
			this._state = HTTPReverseProxyState.STOPPED;
			logger.info('Stopped.');
			// Let anyone who is interested know that we have stopped.
			this.emit(HTTPReverseProxyEvent.STOPPED);
		}
		this._socketErrorHandler = (error) => {
			if(error.code === 'EADDRINUSE') {
				logger.warn('Port ' + this._options.port + ' is already in use.');
				this.emit(HTTPReverseProxyEvent.ERROR, HTTPError.EADDRINUSE);
			} else {
				logger.warn(error.code + ': ' + error.message);
				this.emit(HTTPReverseProxyEvent.ERROR, HTTPError.SOCKET_EXCEPTION);
			}
			this.stop();
		}
		this._socketListeningHandler = () => {
			// When we bind the socket, it will start listening for connections.
			// That means we have started successfully. Set our state to RUNNING.
			this._state = HTTPReverseProxyState.RUNNING;
			// Let anyone who is interested know that we are up and running.
			let listeningOn = this._socket.address();
			logger.info('Running at ' + listeningOn.address + ' on port ' + listeningOn.port + '.');
			this.emit(HTTPReverseProxyEvent.RUNNING, listeningOn.address, listeningOn.port);
		}
		this._socketRequestHandler = (request, response) => {
			let hostname = request.headers['host'].split(':')[0];
			let httpReverseProxyDomain = this.httpReverseProxyDomainMap.get(hostname);
			if(httpReverseProxyDomain === undefined || httpReverseProxyDomain === null) {
				// Apparently this reverse proxy is not configured to handle the domain of this request.
				// Lets log this occurence and return a 404 file not found status code.
				logger.warn('Unable to serve a request for an unconfigured domain \'' + hostname + '\'.');
				response.writeHead(404, {"Content-Type": "text/plain; charset=utf-8"});
				response.write("404 Not Found\n");
				response.end();
				return;
			}
			httpReverseProxyDomain.handle(request, response);
  		}
		// We maintain a map of supported domains.
		// This potentially includes a default/catch-all domain defined as *.
		this.httpReverseProxyDomainMap = new HTTPReverseProxyDomainMap();
		for(let i=0;i < this._options.domains.length;i++) {
			let domain = this._options.domains[i];
			this.addHTTPReverseProxyDomain(domain);
		}
		// All done constructing our HTTPReverseProxy.
		// It is time to set our state to INITIALIZED.
		this._state = HTTPReverseProxyState.INITIALIZED;
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
		} else {
			logger.warn('We are running in unsecure HTTP mode.');
		}
		logger.info('Address                       : ' + this._options.address);
		logger.info('Port (may change before start): ' + this._options.port);
		logger.info('Offline interval              : ' + this._options.offlineInterval);
		logger.info('Timeout                       : ' + this._options.timeout);
		logger.info('Secure                        : ' + this._options.secure);
	}

	/**
	 * Alias for addHTTPReverseProxyDomain(...).
	 * @throws {module:dxp3-net/HTTPError.ILLEGAL_ARGUMENT} when no arguments are supplied.
	 */
	addDomain(domain) {
		this.addHTTPReverseProxyDomain(domain)
	}

	/**
	 * Add a new HTTPReverseProxyDomain to this HTTPReverseProxy.
	 * @throws {module:dxp3-net/HTTPError.ILLEGAL_ARGUMENT} when no arguments are supplied.
	 */
	addHTTPReverseProxyDomain(domain) {
		logger.trace('addHTTPReverseProxyDomain(...): start.');
		// Defensive programming...check input...
		if(domain === undefined || domain === null) {
			logger.trace('addHTTPReverseProxyDomain(...): end.');
			throw HTTPError.ILLEGAL_ARGUMENT;
		}
		let domainName = null;
		if(typeof domain === 'string') {
			domainName = domain.trim();
			domain = {};
		} else {
			domainName = domain.name;
			if(domainName === undefined || domainName === null) {
				logger.trace('addHTTPReverseProxyDomain(...): end.');
				throw HTTPError.ILLEGAL_ARGUMENT;
			}
			domainName = domainName.trim();
		}
		if(domainName.length <= 0) {
			logger.trace('addHTTPReverseProxyDomain(...): end.');
			throw HTTPError.ILLEGAL_ARGUMENT;
		}
		domainName = domainName.toLowerCase();
		let httpReverseProxyDomain = new HTTPReverseProxyDomain(domainName);
		httpReverseProxyDomain.setOfflineInterval(this._options.offlineInterval);
		httpReverseProxyDomain.setTimeout(this._options.timeout);
		logger.info('Add domain: ' + domainName + '.');
		this.httpReverseProxyDomainMap.set(domainName, httpReverseProxyDomain);
		let rules = domain.rules;
		if(rules != undefined && rules != null) {
			if(Array.isArray(rules)) {
				for(let i=0;i < rules.length;i++) {
					let rule = rules[i];
					this.addRule(domainName, rule.regexp, rule.group);
				}
			}
		}
		let destinations = domain.destinations;
		if(destinations != undefined && destinations != null) {
			// Each domain (including the catch-all domain) has a map of destinations.
			// Destinations are grouped together using a group name.
			// This potentially includes a default/catch-all group defined as *.
			for(let [groupName, groupDestinations] of destinations) {
				this.addHTTPServerGroup(domainName, groupName);
				for(let i=0;i < groupDestinations.length;i++) {
					let destination = groupDestinations[i];
					if(destination.secure) {
						this.addHTTPSServer(domainName, groupName, destination.address, destination.port);
					} else {
						this.addHTTPServer(domainName, groupName, destination.address, destination.port);
					}
				}
			}
		}
		logger.trace('addHTTPReverseProxyDomain(...): end.');
	}

	/**
	 * Alias for addHTTPReverseProxyDomain(...).
	 * @throws {module:dxp3-net/HTTPError.ILLEGAL_ARGUMENT} when no arguments are supplied.
	 */
	addReverseProxyDomain(domain) {
		this.addHTTPReverseProxyDomain(domain);
	}

	/**
	 * Alias for addRule(...)
	 * @param {String} domainName
	 * @param {String} regexp
	 * @param {String} group
	 */
	addRoute(...args) {
		this.addRule(...args);
	}

	/**
	 * Alias for addRule(...)
	 * @param {String} domainName
	 * @param {String} regexp
	 * @param {String} group
	 */
	addRegexp(...args) {
		this.addRule(...args);
	}

	/**
	 * @param {String} domainName
	 * @param {String} regexp
	 * @param {String} group
	 */
	addRule(...args) {
		logger.trace('addRule(...): start.');
		// Defensive programming...check input...
		let domainName = '*';
		let regexp = null;
		let group = '*';
		if(args.length < 2) {
			logger.trace('addRule(...): end.');
			throw HTTPError.ILLEGAL_ARGUMENT;
		}
		if(args.length === 2) {
			regexp = args[0];
			group = args[1];
		}
		if(args.length >= 3) {
			domainName = args[0];
			regexp = args[1];
			group = args[2];
		}
		if(domainName === undefined || domainName === null) {
			domainName = '*';
		}
		domainName = domainName.trim();
		if(domainName.length <= 0) {
			domainName = '*';
		}
		domainName = domainName.toLowerCase();
		let domain = this.httpReverseProxyDomainMap.get(domainName);
		if(domain === undefined || domain === null) {
			logger.debug('addRule(...): Domain \'' + domainName + '\' not found. Unable to add rule.');
			logger.trace('addRule(...): end.');
			throw HTTPError.FILE_NOT_FOUND;
		}
		domain.addRule(regexp, group);
		logger.info('Add rule: \'' + domainName + '\' -> ' + regexp + ' -> ' + group + '.');
		logger.trace('addRule(...): end.');
	}

	/**
	 * @param {String} domainName
     * @param {String} group
	 */
	addHTTPServerGroup(...args) {
		// Defensive programming...check input...
		let domainName = '*';
		let group = '*';
		if(args.length < 1) {
			throw HTTPError.ILLEGAL_ARGUMENT;
		}
		if(args.length === 1) {
			group = arguments[0];
		}
		if(args.length >= 2) {
			domainName = arguments[0];
			group = arguments[1];
		}
		// Defensive programming...check input...
		if(domainName === undefined || domainName === null) {
			domainName = '*';
		}
		domainName = domainName.trim();
		if(domainName.length <= 0) {
			domainName = '*';
		}
		domainName = domainName.toLowerCase();
		let domain = this.httpReverseProxyDomainMap.get(domainName);
		if(domain === undefined || domain === null) {
			throw HTTPError.ILLEGAL_ARGUMENT;
		}
		if(group === undefined || group === null) {
			group = '*';
		}
		group = group.trim();
		if(group.length <= 0) {
			group = '*';
		}
		group = group.toLowerCase();
		domain.addHTTPServerGroup(group);
		logger.info('Add group: ' + domainName + ' -> ' + group + '.');
	}
	/**
	 * Alias for addHTTPServer(...)
	 * @param {String} domainName
     * @param {String} group
     * @param {String} address
     * @param {Number} port
     * @param {boolean} secure
	 */
	addDestination(...args) {
		this.addHTTPServer(...args);
	}

	addHTTPSServer(...args) {
		this.addHTTPServer(...args, true);
	}

	/**
	 * @param {String} domainName
     * @param {String} group
     * @param {String} address
     * @param {Number} port
     * @param {Boolean} secure
	 */
	addHTTPServer(...args) {
		// Defensive programming...check input...
		let domainName = '*';
		let group = '*';
		let address = null;
		let port = -1;
		let secure = false;
		if(args.length < 2) {
			throw HTTPError.ILLEGAL_ARGUMENT;
		}
		if(args.length === 2) {
			address = arguments[0];
			port = arguments[1];
		} else if(args.length === 3) {
			if(typeof arguments[2] === 'boolean') {
				address = arguments[0];
				port = arguments[1];
				secure = arguments[2];
			} else {
				group = arguments[0];
				address = arguments[1];
				port = arguments[2];
			}
		} else if(args.length === 4) {
			if(typeof arguments[3] === 'boolean') {
				group = arguments[0];
				address = arguments[1];
				port = arguments[2];
				secure = arguments[3];
			} else {
				domainName = arguments[0];
				group = arguments[1];
				address = arguments[2];
				port = arguments[3];
			}
		} else if(args.length > 4) {
			domainName = arguments[0];
			group = arguments[1];
			address = arguments[2];
			port = arguments[3];
			secure = arguments[4];
		}
		if(domainName === undefined || domainName === null) {
			domainName = '*';
		}
		domainName = domainName.trim();
		if(domainName.length <= 0) {
			domainName = '*';
		}
		domainName = domainName.toLowerCase();
		let httpReverseProxyDomain = this.httpReverseProxyDomainMap.get(domainName);
		if(httpReverseProxyDomain === undefined || httpReverseProxyDomain === null) {
			httpReverseProxyDomain = new HTTPReverseProxyDomain(domainName);
			httpReverseProxyDomain.setOfflineInterval(this._options.offlineInterval);
			httpReverseProxyDomain.setTimeout(this._options.timeout);
			logger.info('Add domain: ' + domainName + '.');
			this.httpReverseProxyDomainMap.set(domainName, httpReverseProxyDomain);
		}
		if(group === undefined || group === null) {
			group = '*';
		}
		group = group.trim();
		if(group.length <= 0) {
			group = '*';
		}
		group = group.toLowerCase();
		httpReverseProxyDomain.addHTTPServer(group, address, port, secure);
		if(secure) {
			logger.info('Add destination ' + domainName + ' -> ' + group + ' -> https://' + address + ':' + port + '.');
		} else {
			logger.info('Add destination ' + domainName + ' -> ' + group + ' -> http://' + address + ':' + port + '.');
		}
	}

	/**
	 * Alias for addHTTPServer(...)
	 * @param {String} domainName
     * @param {String} group
     * @param {String} address
     * @param {Number} port
     * @param {boolean} secure
	 */
	addServer(...args) {
		this.addHTTPServer(...args);
	}

	clearDomains() {
		this.clearHTTPReverseProxyDomains();
	}

	clearHTTPReverseProxyDomains() {
		logger.trace('clearHTTPReverseProxyDomains(): start.');
		this.httpReverseProxyDomainMap.clear();
		logger.trace('clearHTTPReverseProxyDomains(): end.');
	}

	/**
	 * Alias for deleteHTTPServer(...).
	 * @throws {module:dxp3-net/HTTPError.ILLEGAL_ARGUMENT} when no arguments are supplied.
	 */
	deleteDestination(...args) {
		this.deleteHTTPServer(...args);
	}

	/**
	 * Alias for deleteHTTPReverseProxyDomain(...).
	 * @throws {module:dxp3-net/HTTPError.ILLEGAL_ARGUMENT} when no arguments are supplied.
	 */
	deleteDomain(_domain) {
		this.deleteHTTPReverseProxyDomain(_domain)
	}

	/**
	 * Delete a HTTPReverseProxyDomain from this HTTPReverseProxy.
	 * @throws {module:dxp3-net/HTTPError.ILLEGAL_ARGUMENT} when no arguments are supplied.
	 */
	deleteHTTPReverseProxyDomain(domain) {
		logger.trace('deleteHTTPReverseProxyDomain(...): start.');
		// Defensive programming...check input...
		if(domain === undefined || domain === null) {
			logger.trace('deleteHTTPReverseProxyDomain(...): end.');
			throw HTTPError.ILLEGAL_ARGUMENT;
		}
		let domainName = null;
		if(typeof domain === 'string') {
			domainName = domain.trim();
		} else {
			domainName = domain.name;
			if(domainName === undefined || domainName === null) {
				logger.trace('deleteHTTPReverseProxyDomain(...): end.');
				throw HTTPError.ILLEGAL_ARGUMENT;
			}
			domainName = domainName.trim();
		}
		if(domainName.length <= 0) {
			logger.trace('deleteHTTPReverseProxyDomain(...): end.');
			throw HTTPError.ILLEGAL_ARGUMENT;
		}
		domainName = domainName.toLowerCase();
		let result = this.httpReverseProxyDomainMap.delete(domainName);
		logger.trace('deleteHTTPReverseProxyDomain(...): end.');
		return result;
	}

	deleteHTTPServer(...args) {
		// Defensive programming...check input...
		let domainName = null;
		let group = null;
		let address = null;
		let port = -1;
		if(args.length < 2) {
			throw HTTPError.ILLEGAL_ARGUMENT;
		}
		if(args.length === 2) {
			address = arguments[0];
			port = arguments[1];
		}
		if(args.length === 3) {
			domainName = arguments[0];
			address = arguments[1];
			port = arguments[2];
		}
		if(args.length >= 4) {
			domainName = arguments[0];
			group = arguments[1];
			address = arguments[2];
			port = arguments[3];
		}
		if(typeof domainName === 'string') {
			domainName = domainName.trim().toLowerCase();
			if(domainName.length <= 0) {
				domainName = null;
			}
		}
		let foundtAtLeastOne = false;
		if(domainName === undefined || domainName === null) {
			for(let [domainName, domain] of this.httpReverseProxyDomainMap.toMap()) {
				if(domain.deleteHTTPServer(group, address, port)) {
					foundtAtLeastOne = true;
				}
			}
		} else {
			let domain = this.httpReverseProxyDomainMap.get(domainName);
			if(domain != undefined && domain != null) {
				if(domain.deleteHTTPServer(group, address, port)) {
					foundtAtLeastOne = true;
				}
			}
		}
		return foundtAtLeastOne;
	}

	/**
	 * Alias for deleteHTTPReverseProxyDomain(...).
	 * @throws {module:dxp3-net/HTTPError.ILLEGAL_ARGUMENT} when no arguments are supplied.
	 */
	deleteReverseProxyDomain(_domain) {
		this.deleteHTTPReverseProxyDomain(_domain);
	}

	/**
	 * Alias for deleteRule(...)
	 * @param {String} domainName
	 * @param {String} regexp
	 */
	deleteRoute(...args) {
		this.deleteRule(...args);
	}

	/**
	 * Alias for deleteRule(...)
	 * @param {String} domainName
	 * @param {String} regexp
	 */
	deleteRegexp(...args) {
		this.deleteRule(...args);
	}

	/**
	 * @param {String} domainName
	 * @param {String} regexp
	 */
	deleteRule(...args) {
		logger.trace('deleteRule(...): start.');
		// Defensive programming...check input...
		let domainName = '*';
		let regexp = null;
		if(args.length < 1) {
			logger.trace('deleteRule(...): end.');
			throw HTTPError.ILLEGAL_ARGUMENT;
		}
		if(args.length === 1) {
			regexp = args[0];
		}
		if(args.length >= 2) {
			domainName = args[0];
			regexp = args[1];
		}
		if(domainName === undefined || domainName === null) {
			domainName = '*';
		}
		domainName = domainName.trim();
		if(domainName.length <= 0) {
			domainName = '*';
		}
		domainName = domainName.toLowerCase();
		let domain = this.httpReverseProxyDomainMap.get(domainName);
		if(domain === undefined || domain === null) {
			logger.trace('deleteRule(...): end.');
			throw HTTPError.ILLEGAL_ARGUMENT;
		}
		let result = domain.deleteRule(regexp);
		logger.trace('deleteRule(...): end.');
		return result;
	}

	/**
	 * Alias for deleteHTTPServer(...).
	 * @throws {module:dxp3-net/HTTPError.ILLEGAL_ARGUMENT} when no arguments are supplied.
	 */
	deleteServer(...args) {
		this.deleteHTTPServer(...args);
	}

	/**
	 * Alias for deleteHTTPServer(...).
	 * @throws {module:dxp3-net/HTTPError.ILLEGAL_ARGUMENT} when no arguments are supplied.
	 */
	removeDestination(...args) {
		this.deleteHTTPServer(...args);
	}

	/**
	 * Alias for deleteHTTPReverseProxyDomain(...).
	 * @throws {module:dxp3-net/HTTPError.ILLEGAL_ARGUMENT} when no arguments are supplied.
	 */
	removeDomain(_domain) {
		this.deleteHTTPReverseProxyDomain(_domain)
	}

	/**
	 * Alias for deleteHTTPReverseProxyDomain(...).
	 * @throws {module:dxp3-net/HTTPError.ILLEGAL_ARGUMENT} when no arguments are supplied.
	 */
	removeHTTPReverseProxyDomain(_domain) {
		this.deleteHTTPReverseProxyDomain(_domain);
	}

	/**
	 * Alias for deleteHTTPServer(...).
	 * @throws {module:dxp3-net/HTTPError.ILLEGAL_ARGUMENT} when no arguments are supplied.
	 */
	removeHTTPServer(...args) {
		this.deleteHTTPServer(...args);
	}

	/**
	 * Alias for deleteHTTPReverseProxyDomain(...).
	 * @throws {module:dxp3-net/HTTPError.ILLEGAL_ARGUMENT} when no arguments are supplied.
	 */
	removeReverseProxyDomain(_domain) {
		this.deleteHTTPReverseProxyDomain(_domain);
	}

	/**
	 * Alias for deleteHTTPServer(...).
	 * @throws {module:dxp3-net/HTTPError.ILLEGAL_ARGUMENT} when no arguments are supplied.
	 */
	removeServer(...args) {
		this.deleteHTTPServer(...args);
	}

	/**
	 * Start the HTTPReverseProxy.
	 * @fires module:dxp3-net/HTTPReverseProxyEvent#STARTING
	 * @throws {module:dxp3-net/HTTPError.ILLEGAL_STATE} thrown when the reverse proxy is in the process of stopping.
	 * @throws {module:dxp3-net/HTTPError.SOCKET_EXCEPTION} thrown when something goes wrong listening on the specified host/port.
	 */
	start() {
		logger.trace('start(): start.');
		// No point in starting if we are already running or
		// are starting.
		if((this._state === HTTPReverseProxyState.RUNNING) ||
		   (this._state === HTTPReverseProxyState.STARTING)) {
		   	// Initially we threw an illegal state exception, but we deem that to harsh.
			// There really is no problem with calling start again if we are already starting or running.
			logger.debug('start(): Already running or starting.');
			logger.trace('start(): end.');
		   	return;
		}
		// If we are in the process of stopping, we'll have to wait until
		// we have completely stopped before we can start again.
		// Throw an ILLEGAL STATE error.
		if(this._state === HTTPReverseProxyState.STOPPING) {
			logger.warn('start(): Unable to start a HTTP Reverse Proxy that is in the middle of stopping.');
			logger.trace('start(): end.');
		   	throw HTTPError.ILLEGAL_STATE;
		}
		// If we made it this far, it means we are either initialized or stopped.
		if(this._options.secure) {
			// We perform the check synchronously, which is perfectly fine, because 
			// the HTTP Reverse Proxy is stopped.
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
			} catch(_exception) {
				logger.warn('Unable to read default certificate file located at \'' + defaultCertPath + '\'.');	
				logger.info('Each domain will require its own certificate file located at: \'' + this._options.certificatesFolder + '<domain name>' + path.sep + 'fullchain.pem\'.');
			}
		}
		// Set our state to STARTING.
		this._state = HTTPReverseProxyState.STARTING;
		logger.info('Starting.');
		// Let anyone who is interested know that we are starting.
		this.emit(HTTPReverseProxyEvent.STARTING);
		try {
			if(this._options.secure) {
				let certificatesFolder = this._options.certificatesFolder;
				let getSecureContext = (domain) => {
					let secureContext = null;
					let key = null;
					let cert = null;
					try {
						key = fs.readFileSync(certificatesFolder + domain + path.sep + 'privkey.pem');
						cert = fs.readFileSync(certificatesFolder + domain + path.sep + 'fullchain.pem');
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
					// key: fs.readFileSync('/etc/letsencrypt/live/codecoat.com/privkey.pem'),
					// cert: fs.readFileSync('/etc/letsencrypt/live/codecoat.com/cert.pem'),
					// ca: fs.readFileSync('/etc/letsencrypt/live/codecoat.com/chain.pem')
				}
				this._socket = https.createServer(options);
			} else {
				this._socket = http.createServer();
			}
			this._socket.on('close', this._socketCloseHandler);
			this._socket.on('error', this._socketErrorHandler);
			this._socket.on('listening', this._socketListeningHandler);
			this._socket.on('request', this._socketRequestHandler);
			if(this._options.address === null) {
				this._socket.listen(this._options.port, "0.0.0.0");
			} else {
				this._socket.listen(this._options.port, this._options.address);
			}
		} catch(exception) {
			logger.error(exception);
			throw HTTPError.SOCKET_EXCEPTION;
		}
	}

	/**
	 * Stop the HTTPReverseProxy.
	 * @fires module:dxp3-net/HTTPReverseProxyEvent#STOPPED
	 * @fires module:dxp3-net/HTTPReverseProxyEvent#STOPPING
	 */
	stop() {
		logger.trace('stop(): start.');
		// No point in stopping if we have already stopped or
		// are in the process of stopping.
		if((this._state === HTTPReverseProxyState.STOPPED) ||
		   (this._state === HTTPReverseProxyState.STOPPING)) {
		   	// Initially we threw an illegal state exception, but we deem that to harsh.
			// There really is no problem with calling stop again if we are stopping or have already stopped. 
			logger.trace('stop(): end.');
		   	return;
		}
		// If we are INITIALIZED, we can go directly to stopped.
		if(this._state === HTTPReverseProxyState.INITIALIZED) {
			// Set our state to STOPPED.
			this._state = HTTPReverseProxyState.STOPPED;
			// Let anyone who is interested know that we are stopped.
			this.emit(HTTPReverseProxyEvent.STOPPED);
			logger.trace('stop(): end.');
			return;
		}
		// Set our state to STOPPING.
		this._state = HTTPReverseProxyState.STOPPING;
		logger.info('Stopping.');
		this.emit(HTTPReverseProxyEvent.STOPPING);
		this._socket.close();
		logger.trace('stop(): end.');
	}

	/*******************************************
	 * GETTERS                                 *
	 ******************************************/

	/**
	 * Retrieve the current address of the HTTPReverseProxy.
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
	 * Alias for getHTTPServers(...).
	 * @returns {Array}
	 */
	get destinations() {
		return this.getHTTPServers();
	}

	/**
	 * Alias for getHTTPServers(...).
	 * @returns {Array}
	 */
	getDestinations() {
		return this.getHTTPServers();
	}

	/**
	 * Retrieve the list of destinations.
	 * @returns {Array}
	 */
	getHTTPServers() {
		let result = [];
		for(let [domain,httpReverseProxyDomain] of this.httpReverseProxyDomainMap.toMap()) {
			if(domain != httpReverseProxyDomain.domain) {
				continue;
			}
			let httpServers = httpReverseProxyDomain.getHTTPServers();
			for(let i=0;i < httpServers.length;i++) {
				let httpServer = httpServers[i];
				let clone = {
					domain: domain,
					...httpServer
				}
				result.push(clone);
			}
		}
		return result;
	}

	/**
	 * Retrieve the list of domains.
	 * @returns {Array}
	 */
	get domains() {
		return this.getHTTPReverseProxyDomains();
	}

	/**
	 * Alias for getHTTPReverseProxyDomains(...).
	 * @returns {Array}
	 */
	getDomains() {
		return this.getHTTPReverseProxyDomains();
	}

	/**
	 * Retrieve the list of domains.
	 * @returns {Array}
	 */
	getHTTPReverseProxyDomains() {
		let result = [];
		let tmp = new Set();
		for(let [key,value] of this.httpReverseProxyDomainMap.toMap()) {
			let domainName = value.domain;
			let domain = {
				name: domainName
			};
			if(tmp.has(domainName)) {
				continue;
			}
			result.push(domain);
			tmp.add(domainName);
		}
		return result;
	}

	/**
	 * Alias for getHTTPReverseProxyDomains(...).
	 * @returns {Array}
	 */
	getReverseProxyDomains() {
		return this.getHTTPReverseProxyDomains();
	}

	get offlineInterval() {
		return this.getOfflineInterval();
	}

	getOfflineInterval() {
		return this._options.offlineInterval;
	}

	get port() {
		return this.getPort();
	}

	/**
	 * Retrieve the current port of the HTTPReverseProxy.
	 * @returns {Number}
	 */
	getPort() {
		return this._options.port;
	}

	/**
	 * Alias for getRules().
	 * @returns {Array}
	 */
	get regexps() {
		return this.getRules();
	}

	/**
	 * Alias for getRules().
	 * @returns {Array}
	 */
	getRegexps() {
		return this.getRules();
	}

	/**
	 * Alias for getRules().
	 * @returns {Array}
	 */
	get routes() {
		return this.getRules();
	}

	/**
	 * Alias for getRules().
	 * @returns {Array}
	 */
	getRoutes() {
		return this.getRules();
	}

	/**
	 * Alias for getRules().
	 * @returns {Array}
	 */
	get rules() {
		return this.getRules();
	}

	/**
	 * Retrieve the list of rules for every domain.
	 * @returns {Array}
	 */
	getRules() {
		let result = [];
		for(let [domain,httpReverseProxyDomain] of this.httpReverseProxyDomainMap.toMap()) {
			if(domain != httpReverseProxyDomain.domain) {
				continue;
			}
			let rules = httpReverseProxyDomain.getRules();
			for(let i=0;i < rules.length;i++) {
				let rule = rules[i];
				let clone = {
					domain: domain,
					...rule
				}
				result.push(clone);
			}
		}
		return result;
	}

	get state() {
		return this.getState();
	}

	/**
	 * Retrieve the current state of the HTTPReverseProxy.
	 * @returns {module:dxp3-net/HTTPReverseProxyState}
	 */
	getState() {
		return this._state;
	}

	get timeout() {
		return this.getTimeout();
	}

	getTimeout() {
		return this._options.timeout;
	}

	isEncrypted() {
		return (this._options.secure);
	}

	isInitialized() {
		return this._state === HTTPReverseProxyState.INITIALIZED;
	}

	isRunning() {
		return this._state === HTTPReverseProxyState.RUNNING;
	}

	isStarting() {
		return this._state === HTTPReverseProxyState.STARTING;
	}

	isStopped() {
		return this._state === HTTPReverseProxyState.STOPPED;
	}

	isStopping() {
		return this._state === HTTPReverseProxyState.STOPPING;
	}

	isSecure() {
		return this._options.secure;
	}

	/**
	 * Alias for getHTTPServers(...).
	 * @returns {Array}
	 */
	listDestinations() {
		return this.getHTTPServers();
	}

	/**
	 * Alias for getHTTPReverseProxyDomains().
	 * @returns {Array}
	 */
	listDomains() {
		return this.getHTTPReverseProxyDomains();
	}

	/**
	 * Alias for getHTTPReverseProxyDomains().
	 * @returns {Array}
	 */
	listHTTPReverseProxyDomains() {
		return this.getHTTPReverseProxyDomains();
	}

	/**
	 * Alias for getHTTPServers(...).
	 * @returns {Array}
	 */
	listHTTPServers() {
		return this.getHTTPServers();
	}

	/**
	 * Alias for getHTTPReverseProxyDomains().
	 * @returns {Array}
	 */
	listReverseProxyDomains() {
		return this.getHTTPReverseProxyDomains();
	}

	/**
	 * Alias for getRules().
	 * @returns {Array}
	 */
	listRegexps() {
		return this.getRules();
	}

	/**
	 * Alias for getRules().
	 * @returns {Array}
	 */
	listRoutes() {
		return this.getRules();
	}

	/**
	 * Alias for getRules().
	 * @returns {Array}
	 */
	listRules() {
		return this.getRules();
	}

	/**
	 * Alias for getHTTPServers(...).
	 * @returns {Array}
	 */
	listServers() {
		return this.getHTTPServers();
	}

	/*******************************************
	 * SETTERS                                 *
	 ******************************************/

	set certificatesFolder(_certificatesFolder) {
		this.setCertificatesFolder(_certificatesFolder);
	}

	setCertificatesFolder(_certificatesFolder) {
		logger.trace('setCertificatesFolder(...): start.');
		// We are only able to change our certificates folder if we are stopped or initialized.
		if((this._state != HTTPReverseProxyState.INITIALIZED) && (this._state != HTTPReverseProxyState.STOPPED)) {
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

	set address(_address) {
		this.setAddress(_address);
	}

	setAddress(_address) {
		if(Assert.isUndefinedOrNullOrNotAStringOrEmpty(_address)) {
			throw HTTPError.ILLEGAL_ARGUMENT;
		}
		// We can only set the host if we are INITIALIZED or STOPPED.
		if((this._state != HTTPReverseProxyState.INITIALIZED) &&
		   (this._state != HTTPReverseProxyState.STOPPED)) {
		   	throw HTTPError.ILLEGAL_STATE;
		}
		_address = _address.trim();
		if(this._options.address === _address) {
			return;
		}
		this._options.address = _address;
		logger.info('Set address: ' + this._options.address);
	}

	set offlineInterval(_offlineInterval) {
		this.setOfflineInterval(_offlineInterval);
	}

	setOfflineInterval(_offlineInterval) {
		logger.trace('setOfflineInterval(...): start.');
		if(Assert.isUndefinedOrNull(_offlineInterval)) {
			logger.trace('setOfflineInterval(...): end.');
			throw HTTPError.ILLEGAL_ARGUMENT;
		}
		if(typeof _offlineInterval === 'string') {
			_offlineInterval = _offlineInterval.trim();
			if(_offlineInterval.length <= 0) {
				logger.trace('setOfflineInterval(...): end.');
				throw HTTPError.ILLEGAL_ARGUMENT;
			}
			_offlineInterval = parseInt(_offlineInterval, 10);
			if(isNaN(_offlineInterval)) {
				logger.trace('setOfflineInterval(...): end.');
				throw HTTPError.ILLEGAL_ARGUMENT;
			}
		}
		if(typeof _offlineInterval != 'number') {
			logger.trace('setOfflineInterval(...): end.');
			throw HTTPError.ILLEGAL_ARGUMENT;
		}
		if(this._options.offlineInterval === _offlineInterval) {
			logger.trace('setOfflineInterval(...): end.');
			return;
		}
		this._options.offlineInterval = _offlineInterval;
		for(let [host, httpReverseProxyDomain] of this.httpReverseProxyDomainMap.toMap()) {
			httpReverseProxyDomain.setOfflineInterval(this._options.offlineInterval);
		}
		logger.info('Set offline interval: ' + this._options.offlineInterval);
		logger.trace('setOfflineInterval(...): end.');
	}

	set port(_port) {
		this.setPort(_port);
	}

	/**
	 * Set the port of this server. Note that in order to set the port the http reverse proxy
	 * must not yet have been started (it's state is HTTPReverseProxyState.INITIALIZED) or
	 * must currently be stopped (it's state is HTTPReverseProxyState.STOPPED).
	 * You may want to check the state first by calling getState().
	 * @param {Number|String} port
	 * @throws {module:dxp3-net/HTTPError.ILLEGAL_ARGUMENT} when the supplied port parameter is not a valid number.
	 * @throws {module:dxp3-net/HTTPError.ILLEGAL_STATE} when the server is not initialized and not stopped.
	 */
	setPort(_port) {
		// Defensive programming...check input...
		if(_port === undefined || _port === null) {
			throw HTTPError.ILLEGAL_ARGUMENT;
		}
		if(typeof _port === 'string') {
			_port = _port.trim();
			if(_port.length <= 0) {
				throw HTTPError.ILLEGAL_ARGUMENT;
			}
			_port = parseInt(_port, 10);
			if(isNaN(_port)) {
				throw HTTPError.ILLEGAL_ARGUMENT;
			}
		}
		if(typeof _port != 'number') {
			throw HTTPError.ILLEGAL_ARGUMENT;
		}
		if(_port <= 0) {
			throw HTTPError.ILLEGAL_ARGUMENT;
		}
		if(_port === this._options.port) {
			return;
		}
		// We can only set the port if we are INITIALIZED or STOPPED.
		if((this._state != HTTPReverseProxyState.INITIALIZED) &&
		   (this._state != HTTPReverseProxyState.STOPPED)) {
		   	throw HTTPError.ILLEGAL_STATE;
		}
		this._options.port = _port;
		logger.info('Set port: ' + this._options.port);
	}

	set timeout(_timeout) {
		this.setTimeout(_timeout);
	}

	setTimeout(_timeout) {
		if(Assert.isUndefinedOrNull(_timeout)) {
			throw HTTPError.ILLEGAL_ARGUMENT;
		}
		if(typeof _timeout === 'string') {
			_timeout = _timeout.trim();
			if(_timeout.length <= 0) {
				throw HTTPError.ILLEGAL_ARGUMENT;
			}
			_timeout = parseInt(_timeout, 10);
			if(isNaN(_timeout)) {
				throw HTTPError.ILLEGAL_ARGUMENT;
			}
		}
		if(typeof _timeout != 'number') {
			throw HTTPError.ILLEGAL_ARGUMENT;
		}
		if(this._options.timeout === _timeout) {
			return;
		}
		this._options.timeout = _timeout;
		for(let [host, httpReverseProxyDomain] of this.httpReverseProxyDomainMap.toMap()) {
			httpReverseProxyDomain.setTimeout(this._options.timeout);
		}
		logger.info('Set timeout: ' + this._options.timeout);
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
		if((this._state != HTTPReverseProxyState.INITIALIZED) && (this._state != HTTPReverseProxyState.STOPPED)) {
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
			let httpReverseProxyOptions = HTTPReverseProxyOptions.parseCommandLine();
			logging.setLevel(httpReverseProxyOptions.logLevel);
			if(httpReverseProxyOptions.help) {
	        	util.Help.print(this);
	        	return;
	        }
			let httpReverseProxy = new HTTPReverseProxy(httpReverseProxyOptions);
			httpReverseProxy.on(HTTPReverseProxyEvent.ERROR, function(_error) {
				console.log('HTTPReverseProxy error: ' + _error.message);
			});
			httpReverseProxy.on(HTTPReverseProxyEvent.RUNNING, function(_address, _port) {
				console.log('To get help include the -help option:');
				console.log('node HTTPReverseProxy -help');
				console.log('');
				console.log('HTTPReverseProxy running at ' + _address + ':' + _port);
			});
			httpReverseProxy.start();
		} catch(exception) {
			console.log('Exception: ' + exception.message);
			process.exit(99);
		}
	}
}
// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
	HTTPReverseProxy.main();
	return;
}

module.exports = HTTPReverseProxy;