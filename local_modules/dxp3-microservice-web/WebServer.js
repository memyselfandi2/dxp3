/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-microservice-web
 *
 * NAME
 * WebServer
 */
const packageName = 'dxp3-microservice-web';
const moduleName = 'WebServer';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * A WebServer is the microservice version of a HTTP server.
 *
 * @module dxp3-microservice-web/WebServer
 */
const fs = require('fs');
const logging = require('dxp3-logging');
const microservice = require('dxp3-microservice');
const net = require('dxp3-net');
const util = require('dxp3-util');
const WebServerOptions = require('./WebServerOptions');

const HTTPServer = net.HTTPServer;
const HTTPServerEvent = net.HTTPServerEvent;
const HTTPServerState = net.HTTPServerState;
const logger = logging.getLogger(canonicalName);
const MicroServiceError = microservice.MicroServiceError;
const MicroServiceEvent = microservice.MicroServiceEvent;
const MicroServiceState = microservice.MicroServiceState;
const MicroServiceType = microservice.MicroServiceType;
const TCPServerPort = net.TCPServerPort;
/**
 * A WebServer implements a typical http request/response mechanism.
 * It listens on a provided (or, if not provided, a random) open port for incoming requests,
 * processes them and returns a response.
 *
 * @example
 * let web = require('dxp3-microservice-web');
 * let myWebServer = new web.WebServer();
 * myWebServer.start();
 */
class WebServer extends microservice.MicroService {
    /*********************************************
     * CONSTRUCTOR
     ********************************************/

	/**
 	 * @param {Object} _options
 	 *
	 * @param {String} _options.name
	 * A (required) not undefined, not null, not empty name.
	 *
	 * @param {Number} _options.port
	 * An optional port this server will try to listen on.
	 * If omitted (or already in use) it will find an open port instead.
	 *
	 * @param {String} _options.produces
	 * A (required) not undefined, not null, not empty list of subjects this web server serves.
	 *
 	 * @throws {MicroServiceError.ILLEGAL_ARGUMENT} When the name or the subject is undefined,
 	 * null, whitespace or empty.
 	 */
	constructor(_options) {
		// Defensive programming...check input...
		if(_options === undefined || _options === null) {
			logger.warn('Unable to construct a WebServer with undefined or null arguments.');
			throw MicroServiceError.ILLEGAL_ARGUMENT;
		}
		// Next we parse the supplied arguments. This will fill in any missing properties with
		// their respective default value.
		_options = WebServerOptions.parse(_options);
		logger.info('Address                   : ' + _options.address);
		logger.info('Port (may change on start): ' + _options.port);
		logger.info('Domains                   : ' + _options.domains);
		logger.info('Roots                     : ' + _options.roots);
		logger.info('Secure                    : ' + _options.secure);
		if(_options.secure) {
			logger.info('Certificates folder       : ' + _options.certificatesFolder);
			// Ensure the certificates folder exists.
			// We perform the check synchronously, which is perfectly fine at startup.
			if(!fs.existsSync(_options.certificatesFolder)) {
				logger.fatal('Certificates folder does NOT exist. Exiting...');
				process.exit(99);
			}
		} else {
			logger.warn('We are running in unsecure HTTP mode.');
		}
		// Now we are ready to call our MicroService super constructor.
		// Forward any required and optional argument properties (like name, port, produces, etc.).
		let microServiceOptions = {
			name: _options.name,
			port: _options.port,
			settings: {
				secure: _options.secure
			},
			produces: _options.produces
		};
		super(microServiceOptions);
		// We create the HTTPServer here in order to attach event handlers.
		// Even though we supply the port, we might end up using a different port if we find out, during
		// startup, that this port is already in use.
		let httpServerOptions = {
			address: _options.address,
			domains: _options.domains,
			port: _options.port,
			roots: _options.roots,
			redirects: _options.redirects,
			secure: _options.secure,
			certificatesFolder: _options.certificatesFolder,
			timeout: _options.timeout
		}
		this.httpServer = new HTTPServer(httpServerOptions);
		let httpServerAddedClientHandler = function() {
			logger.trace('Added client.');
		}
		let httpServerDataHandler = function() {
		}
		let httpServerErrorHandler = function(error) {
			logger.error(error);
		}
		let httpServerClosedClientHandler = function() {
			logger.trace('Closed client.');
		}
		let httpServerStartingHandler = function() {
			logger.debug('Our HTTP Server is starting.');
		}
		let httpServerStoppedHandler = function() {
			logger.debug('Our HTTP Server has stopped.');
		}
		let httpServerStoppingHandler = function() {
			logger.debug('Our HTTP Server is stopping.');
		}
		this.httpServer.on(HTTPServerEvent.ADDED_CLIENT, httpServerAddedClientHandler);
		this.httpServer.on(HTTPServerEvent.DATA, httpServerDataHandler);
		this.httpServer.on(HTTPServerEvent.ERROR, httpServerErrorHandler);
		this.httpServer.on(HTTPServerEvent.CLOSED_CLIENT, httpServerClosedClientHandler);
		this.httpServer.on(HTTPServerEvent.RUNNING, (_address, _port) => {
			logger.debug('Our HTTP Server is running at ' + _address + ':' + _port + '.');
		});
		this.httpServer.on(HTTPServerEvent.STARTING, httpServerStartingHandler);
		this.httpServer.on(HTTPServerEvent.STOPPED, httpServerStoppedHandler);
		this.httpServer.on(HTTPServerEvent.STOPPING, httpServerStoppingHandler);
	}

	/**
	 * @param {String} regexString 
	 * @param {String} domainName optional domain name is only useful when we serve more than one domain.
	 * @param {String} location to redirect to
	 * @throws {module:dxp3-net/HTTPError.ILLEGAL_ARGUMENT} when the supplied regexString or location are invalid.
	 */
	redirect(regexString, ..._args) {
		this.httpServer.redirect(regexString, ..._args);
	}

	/**
	 * @param {String} regexString 
	 * @param {String} domainName optional domain name is only useful when we serve more than one domain.
	 * @param {Function} callback Signature function(request, response)
	 * @throws {module:dxp3-net/HTTPServerError.ILLEGAL_ARGUMENT} when the supplied regexString or callback are invalid.
	 */
	all(regexString, ..._args) {
		this.httpServer.all(regexString, ..._args);
	}

	/**
	 * @param {String} regexString 
	 * @param {String} domainName optional domain name is only useful when we serve more than one domain.
	 * @param {Function} callback Signature function(request, response)
	 * @throws {module:dxp3-net/HTTPServerError.ILLEGAL_ARGUMENT} when the supplied regexString or callback are invalid.
	 */
	delete(regexString, ..._args) {
		this.httpServer.delete(regexString, ..._args);
	}

	/**
	 * @param {String} regexString 
	 * @param {String} domainName optional domain name is only useful when we serve more than one domain.
	 * @param {Function} callback Signature function(request, response)
	 * @throws {module:dxp3-net/HTTPServerError.ILLEGAL_ARGUMENT} when the supplied regexString or callback are invalid.
	 */
	get(regexString, ..._args) {
		this.httpServer.get(regexString, ..._args);
	}

	/**
	 * @param {String} regexString 
	 * @param {String} domainName optional domain name is only useful when we serve more than one domain.
	 * @param {Function} callback Signature function(request, response)
	 * @throws {module:dxp3-net/HTTPServerError.ILLEGAL_ARGUMENT} when the supplied regexString or callback are invalid.
	 */
	post(regexString, ..._args) {
		this.httpServer.post(regexString, ..._args);
	}

	/**
	 * @param {String} regexString 
	 * @param {String} domainName optional domain name is only useful when we serve more than one domain.
	 * @param {Function} callback Signature function(request, response)
	 * @throws {module:dxp3-net/HTTPServerError.ILLEGAL_ARGUMENT} when the supplied regexString or callback are invalid.
	 */
	put(regexString, ..._args) {
		this.httpServer.put(regexString, ..._args);
	}

	/**
	 * @override
	 * @throws {MicroServiceError.ILLEGAL_ARGUMENT}
	 */
	addCompatibleConsumer(id, microServiceDefinition) {
	}

	/**
	 * @override
	 */
	addCompatibleProducer(id, microServiceDefinition) {
	}

	/**
	 * @override
	 */
	deleteCompatibleConsumer(id, microServiceDefinition) {
	}

	/**
	 * @override
	 */
	deleteCompatibleProducer(id, microServiceDefinition) {
	}

	/**
	 * @override
	 * @throws {MicroServiceError.ILLEGAL_ARGUMENT}
	 */
	pausing(_callback) {
		// Defensive programming...check input...
		if(_callback === undefined || _callback === null) {
			throw MicroServiceError.ILLEGAL_ARGUMENT;
		}
		// If our http server is already stopped, all we have to do is 
		// call the callback.
		if(this.httpServer.getState() === HTTPServerState.STOPPED) {
			return _callback();
		}
		// Our http server is not yet stopped. Lets add an event listener
		// for the stop event and stop.
		this.httpServer.once(HTTPServerEvent.STOPPED, () => {
			return _callback();
		});
		this.httpServer.stop();
	}

	/**
	 * @override
	 * @throws {MicroServiceError.ILLEGAL_ARGUMENT}
	 */
	starting(_callback) {
		// Defensive programming...check input...
		if(_callback === undefined || _callback === null) {
			throw MicroServiceError.ILLEGAL_ARGUMENT;
		}
		// If our http server is already running, all we have to do is
		// call the callback.
		if(this.httpServer.getState() === HTTPServerState.RUNNING) {
			return _callback();
		}
		// Our http server is not yet running. Lets add an event listener
		// for the running event and start.
		this.httpServer.once(HTTPServerEvent.RUNNING, (_address, _port) => {
			// After the http server has successfully started, we update our port and address.
			this.address = _address;
			this.port = _port;
			return _callback();
		});
		TCPServerPort.getAvailablePort(this.port, null, (_error, _port) => {
			this.httpServer.setPort(_port);
			this.httpServer.start();
		});
	}

	/**
	 * @override
	 * @throws {MicroServiceError.ILLEGAL_ARGUMENT}
	 */
	stopping(_callback) {
		// Defensive programming...check input...
		if(_callback === undefined || _callback === null) {
			throw MicroServiceError.ILLEGAL_ARGUMENT;
		}
		// If our http server is already stopped, all we have to do is
		// call the callback.
		if(this.httpServer.state === HTTPServerState.STOPPED) {
			return _callback();
		}
		// Our http server is not yet stopped. Lets add an event listener
		// for the stop event and stop.
		this.httpServer.once(HTTPServerEvent.STOPPED, () => {
			return _callback();
		});
		this.httpServer.stop();
	}

	/*******************************************
	 * GETTERS                                 *
	 ******************************************/

	getTimeout() {
		return this.httpServer.timeout;
	}

	/**
	 * @override
	 */
	get type() {
		return MicroServiceType.WEB_SERVER;
	}

	/**
	 * @override
	 */
	get compatibleTypes() {
		return [MicroServiceType.WEB_CLIENT,MicroServiceType.WEB_GATEWAY];
	}

	/*******************************************
	 * SETTERS                                 *
	 ******************************************/

	setTimeout(timeout) {
		this.httpServer.setTimeout(timeout);
	}

	static main() {
		try {
			let webServerOptions = WebServerOptions.parseCommandLine();
			logging.setLevel(webServerOptions.logLevel);
			if(webServerOptions.help) {
				util.Help.print(WebServer);
				return;
			}
			// We need a name
			let webServerName = webServerOptions.name;
			if(webServerName === undefined || webServerName === null || webServerName.length <= 0) {
				logger.fatal('Missing name. Please supply a name for this WebServer using the -name argument.');
				logger.info('Exiting due to fatal error.');
				process.exit();
			}
			if(webServerOptions.roots.length <= 0) {
				logger.warn('No root folder(s) defined. The web server will be unable to serve any content.');
				logger.warn('Use the -root parameter to supply a content folder.');
			}
			let webServer = new WebServer(webServerOptions);
			webServer.on(MicroServiceEvent.ERROR, (_error) => {
				console.log('WebServer error: ' + _error.message);
			});
			webServer.on(MicroServiceEvent.RUNNING, () => {
				console.log('To get help include the -help option:');
				console.log('node WebServer -help');
				console.log('');
				console.log('WebServer \'' + webServer.name + '\' running at port ' + webServer.port);
			});
			webServer.start();
		} catch(_exception) {
			console.log('EXCEPTION: ' + _exception.code + ': ' + _exception.message);
		}
	}
}
// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
	WebServer.main();
	return;
}
module.exports = WebServer;