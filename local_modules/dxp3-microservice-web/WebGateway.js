/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-microservice-web
 *
 * NAME
 * WebGateway
 */
const packageName = 'dxp3-microservice-web';
const moduleName = 'WebGateway';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * A WebGateway acts as a loadbalancer and gatekeeper for other WebServers.
 * It will forward http requests to the appropriate backend servers based on the subject each server is
 * subscribed to.
 * Different URL's may have to be forwarded to different WebServers. To accommodate that functionality
 * there are several methods to map URL's to a subject.
 *
 * @see {module:dxp3-microservice/WebServer}
 * @module dxp3-microservice/WebGateway
 */
const fs = require('fs');
const logging = require('dxp3-logging');
const microservice = require('dxp3-microservice');
const net = require('dxp3-net');
const util = require('dxp3-util');
const WebGatewayOptions = require('./WebGatewayOptions');

const HTTPReverseProxy = net.HTTPReverseProxy;
const HTTPReverseProxyEvent = net.HTTPReverseProxyEvent;
const HTTPReverseProxyState = net.HTTPReverseProxyState;
const logger = logging.getLogger(canonicalName);
const MicroServiceError = microservice.MicroServiceError;
const MicroServiceEvent = microservice.MicroServiceEvent;
const MicroServiceState = microservice.MicroServiceState;
const MicroServiceType = microservice.MicroServiceType;
const TCPServerPort = net.TCPServerPort;

/**
 * A WebGateway implements a MicroService.
 */
class WebGateway extends microservice.MicroService {
	/**
 	 * @param {module:dxp3-microservice/WebGatewayOptions|Object} _options
 	 *
	 * @param {String} _options.name
	 * A mandatory (not undefined, not null and not empty) name.
	 *
	 * @param {Array|String} _options.consumes
	 * A mandatory list of subjects this WebGateway forwards to.
	 * Compatible web servers will have to be configured with the same subject(s).
	 * This can be an array or a comma separated values string.
	 * If there is more than 1 subject we require routes to know which URL's to forward where.
	 * Use the addRoute or addRule methods to add such forwarding rules.
	 * The first subject will be the default subject (a catch all forwarding route).
	 * (any routes not specifically set will go to the default destination).
	 *
	 * @param {Array|String} _options.produces
	 * An optional list of subjects this WebGateway produces.
	 *
	 * @param {Number} _options.port
	 * An optional port this web gateway listens on.
	 * @throws {MicroServiceError.ILLEGAL_ARGUMENT} When name or subjects is/are undefined, null, whitespace or empty.
	 */
	constructor(_options) {
		// Defensive programming...check input...
		if(_options === undefined || _options === null) {
			logger.warn('Unable to construct a WebGateway with undefined or null arguments.');
			throw MicroServiceError.ILLEGAL_ARGUMENT;
		}
		_options = WebGatewayOptions.parse(_options);
		logger.info('Address                   : ' + _options.address);
		logger.info('Port (may change on start): ' + _options.port);
		logger.info('Offline interval          : ' + _options.offlineInterval);
		logger.info('Domains                   : ' + _options.domains);
		logger.info('Timeout                   : ' + _options.timeout);
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
		// Forward any required and optional argument properties (like consumes, name, port, produces, etc.).
		let microServiceOptions = {
			consumes: _options.consumes,
			name: _options.name,
			port: _options.port,
			settings: {
				secure: _options.secure
			},
			produces: _options.produces
		};
		super(microServiceOptions);
		let self = this;
		// We create the HTTPReverseProxy here in order to attach event handlers.
		// We attempt to set the port when we are starting.
		let httpReverseProxyOptions = {
			host: _options.address,
			offlineInterval: _options.offlineInterval,
			port: _options.port,
			secure: _options.secure,
			certificatesFolder: _options.certificatesFolder,
			timeout: _options.timeout
		};
		self.httpReverseProxy = new HTTPReverseProxy(httpReverseProxyOptions);
		// We maintain:
		// - a list of domains,
		// - a list of which subject goes to which domains,
		self.domains = new Map();
		self.subjectToDomains = new Map();
		// Next we add any domains supplied by our constructor options.
		for(let i=0;i < _options.domains.length;i++) {
			let domain = _options.domains[i];
			if(domain === undefined || domain === null) {
				continue;
			}
			self.addDomain(domain);
		}
	}

	addDomain(_domain) {
		// Defensive programming...check input...
		if(_domain === undefined || _domain === null) {
			throw MicroServiceError.ILLEGAL_ARGUMENT;
		}
		let domain = {};
		domain.rules = [];
		domain.subjects = [];
		if(typeof _domain === 'string') {
			// If the supplied argument is a string, we simply add
			// a domain without any rules or subjects.
			domain.name = _domain;
			this.domains.set(domain.name, domain);
			this.httpReverseProxy.addDomain(domain.name);
			return;
		}
		// If we reach here we need to assume the domain argument is an object.
		// A domain name is mandatory.
		if(_domain.name === undefined || _domain.name === null) {
			throw MicroServiceError.ILLEGAL_ARGUMENT;
		}
		domain.name = _domain.name;
		// Lets add the domain to our list of known domains.
		this.domains.set(domain.name, domain);
		this.httpReverseProxy.addDomain(domain.name);
		// Next we'll attempt to add any predefined rules.
		let rules = _domain.rules;
		if((rules != undefined) && (rules != null)) {
			if(Array.isArray(rules)) {
				for(let i=0;i < rules.length;i++) {
					let rule = rules[i];
					if(rule === undefined || rule === null) {
						continue;
					}
					let regexp = rule.regexp;
					if(regexp === undefined || regexp === null) {
						continue;
					}
					let subject = rule.subject;
					if(subject === undefined || subject === null) {
						continue;
					}
					this.addRule(domain.name, regexp, subject.toLowerCase());
				}
			}
		}
		let subjects = _domain.subjects;
		if((subjects != undefined) && (subjects != null)) {
			if(Array.isArray(subjects)) {
				for(let i=0;i < subjects.length;i++) {
					let subject = subjects[i];
					if(subject === undefined || subject === null) {
						continue;
					}
					subject = subject.toLowerCase();
					domain.subjects.push(subject);
					let domainsWithSubject = this.subjectToDomains.get(subject);
					if(domainsWithSubject === undefined || domainsWithSubject === null) {
						domainsWithSubject = [];
						this.subjectToDomains.set(subject,domainsWithSubject);
					}
					domainsWithSubject.push(domain);
				}
			}
		}
	}
	/**
	 * Alias for addRule(...)
	 * @param {String} domainName
	 * @param {String} regexp
	 * @param {String} subject
	 */
	addRoute(...args) {
		this.addRule(...args);
	}
	/**
	 * Alias for addRule(...)
	 * @param {String} domainName
	 * @param {String} regexp
	 * @param {String} subject
	 */
	addRegexp(...args) {
		this.addRule(...args);
	}
	/**
	 * @param {String} domainName
	 * @param {String} regexp
	 * @param {String} subject
	 */
	addRule(...args) {
		// Defensive programming...check input...
		let domainName = '*';
		let regexp = null;
		let subject = null;
		if(args.length < 2) {
			throw MicroService.ILLEGAL_ARGUMENT;
		}
		if(args.length === 2) {
			regexp = args[0];
			subject = args[1];
		}
		if(args.length >= 3) {
			domainName = args[0];
			regexp = args[1];
			subject = args[2];
		}
		subject = subject.toLowerCase();
		// Check if the domain has already been added.
		let domain = this.domains.get(domainName);
		if(domain === undefined || domain === null) {
			this.addDomain(domainName);
			// Now that the domain was added, lets try again...
			this.addRule(domainName, regexp, subject);
			return;
		}
		// Add the subject to the domain if not yet present.
		let indexOfSubject = domain.subjects.indexOf(subject);
		if(indexOfSubject < 0) {
			domain.subjects.push(subject);
			let domainsWithSubject = this.subjectToDomains.get(subject);
			if(domainsWithSubject === undefined || domainsWithSubject === null) {
				domainsWithSubject = [];
				this.subjectToDomains.set(subject,domainsWithSubject);
			}
			domainsWithSubject.push(domain);
		}
		// Only add the rule when not yet added.
		let ruleFound = false;
		for(let i=0;i < domain.rules.length;i++) {
			let rule = domain.rules[i];
			if((rule.regexp === regexp) && (rule.subject === subject)) {
				ruleFound = true;
				break;
			}
		}
		if(!ruleFound) {
			domain.rules.push({regexp: regexp, subject: subject});
			logger.info('Domain \'' + domainName + '\' and regexp \'' + regexp + '\' forwards to \'' + subject + '\'.');
			this.httpReverseProxy.addRule(domainName, regexp, subject);
		}
	}
	/**
	 * @override
	 */
	addCompatibleConsumer(microServiceId, microServiceDefinition) {
	}
	/**
	 * @override
	 */
	addCompatibleProducer(microServiceId, microServiceDefinition) {
		let self = this;
		for(let i=0;i < microServiceDefinition.produces.length;i++) {
			let subject = microServiceDefinition.produces[i];
			if(subject === undefined || subject === null) {
				continue;
			}
			subject = subject.toLowerCase();
			let index = self.definition.consumes.indexOf(subject);
			if(index >= 0) {
				let domains = self.subjectToDomains.get(subject);
				for(let i=0;i < domains.length;i++) {
					let domain = domains[i];
					index = domain.subjects.indexOf(subject);
					if(index >= 0) {
						console.log("zooi: " + JSON.stringify(microServiceDefinition));
						if((microServiceDefinition.settings != undefined) && (microServiceDefinition.settings != null) && (microServiceDefinition.settings.secure === true)) {
							console.log('add HTTPS !!!!!!!!!!!!!!!!!!!!');
							self.httpReverseProxy.addHTTPSServer(domain.name, subject, microServiceDefinition.address, microServiceDefinition.port);
						} else {
							console.log('add HTTP !!!!!!!!!!!!!!!!!!!!!');
							self.httpReverseProxy.addHTTPServer(domain.name, subject, microServiceDefinition.address, microServiceDefinition.port);
						}
					}
				}
			}
		}
	}
	/**
	 * @override
	 */
	deleteCompatibleConsumer(microServiceId, microServiceDefinition) {
	}
	/**
	 * @override
	 */
	deleteCompatibleProducer(microServiceId, microServiceDefinition) {
		// Defensive programming...check input...
		if(microServiceId === undefined || microServiceId === null) {
			return;
		}
		if(microServiceDefinition === undefined || microServiceDefinition === null) {
			return;
		}
		// Only remove the http server if there is no other microservice with the same address and port.
		// This may happen when a microservice has restarted. Sometimes the
		// lost and found events come out of order.
		for(let [id, definition] of this.compatibleProducers) {
			if(id === microServiceId) {
				continue;
			}
			if(definition.address === microServiceDefinition.address) {
				if(definition.port === microServiceDefinition.port) {
					return;
				}
			}
		}
		this.httpReverseProxy.deleteHTTPServer(microServiceDefinition.address, microServiceDefinition.port);
	}
	/**
	 * @override
	 * @throws {MicroServiceError.ILLEGAL_ARGUMENT}
	 */
	pausing(callback) {
		// Defensive programming...check input...
		if(callback === undefined || callback === null) {
			throw MicroServiceError.ILLEGAL_ARGUMENT;
		}
		let self = this;
		// If our http reverse proxy is already stopped, all we have to do is 
		// call the callback.
		if(self.httpReverseProxy.getState() === HTTPReverseProxyState.STOPPED) {
			return callback();
		}
		// Our http reverse proxy is not yet stopped. Lets add an event listener
		// for the stop event and stop.
		self.httpReverseProxy.once(HTTPReverseProxyEvent.STOPPED, function() {
			return callback();
		});
		self.httpReverseProxy.stop();
	}

	/**
	 * @override
	 * @throws {MicroServiceError.ILLEGAL_ARGUMENT}
	 */
	starting(callback) {
		// Defensive programming...check input...
		if(callback === undefined || callback === null) {
			throw MicroServiceError.ILLEGAL_ARGUMENT;
		}
		let self = this;
		// If our http reverse proxy is already running, all we have to do is
		// call the callback.
		if(self.httpReverseProxy.getState() === HTTPReverseProxyState.RUNNING) {
			return callback();
		}
		// Our http reverse proxy is not yet running. Lets add an event listener
		// for the running event and start.
		self.httpReverseProxy.once(HTTPReverseProxyEvent.RUNNING, function(address, _port) {
			// After the http reverse proxy has successfully started, we update our port.
			self.port = _port;
			return callback();
		});
		TCPServerPort.getAvailablePort(self.port, null, function(err, port) {
			self.httpReverseProxy.setPort(port);
			self.httpReverseProxy.start();
		});
	}

	/**
	 * @override
	 * @throws {MicroServiceError.ILLEGAL_ARGUMENT}
	 */
	stopping(callback) {
		// Defensive programming...check input...
		if(callback === undefined || callback === null) {
			throw MicroServiceError.ILLEGAL_ARGUMENT;
		}
		let self = this;
		// If our htt server is already stopped, all we have to do is
		// call the callback.
		if(self.httpReverseProxy.state === HTTPReverseProxyState.STOPPED) {
			return callback();
		}
		// Our http reverse proxy is not yet stopped. Lets add an event listener
		// for the stop event and stop.
		self.httpReverseProxy.once(HTTPReverseProxyEvent.STOPPED, function() {
			return callback();
		});
		self.httpReverseProxy.stop();
	}

	/*******************************************
	 * GETTERS                                 *
	 ******************************************/

	/**
	 * Retrieve the current host of the WebGateway.
	 * @returns {String}
	 */
	getHost() {
		return this.httpReverseProxy.host;
	}

	getOfflineInterval() {
		return this.httpReverseProxy.offlineInterval;
	}

	/**
	 * Retrieve the current port of the WebGateway.
	 * @returns {Number}
	 */
	getPort() {
		return this.port;
	}

	get port() {
		return super.port;
	}

	getTimeout() {
		return this.httpReverseProxy.timeout;
	}

	/**
	 * @override
	 */
	get type() {
		return MicroServiceType.WEB_GATEWAY;
	}

	/**
	 * @override
	 */
	get compatibleTypes() {
		return [MicroServiceType.WEB_GATEWAY, MicroServiceType.WEB_SERVER];
	}

	/*******************************************
	 * SETTERS                                 *
	 ******************************************/

	setHost(host) {
		this.httpReverseProxy.setHost(host);
	}

	setOfflineInterval(offlineInterval) {
		this.httpReverseProxy.setOfflineInterval(offlineInterval);
		logger.info('Set offline interval: ' + offlineInterval);
	}

	setPort(_port) {
		this.port = _port;
	}

	set port(_port) {
		if(super.port === _port) {
			return;
		}
		super.port = _port;
		this.httpReverseProxy.setPort(_port);
		logger.info('Set port: ' + _port);
	}

	setTimeout(timeout) {
		this.httpReverseProxy.setTimeout(timeout);
		logger.info('Set timeout: ' + timeout);
	}

	static main() {
		try {
			let webGatewayOptions = WebGatewayOptions.parseCommandLine();
			logging.setLevel(webGatewayOptions.logLevel);
			if(webGatewayOptions.help) {
				util.Help.print(this);
				return;
			}
			// We need a name
			let name = webGatewayOptions.name;
			if(name === undefined || name === null || name.length <= 0) {
				logger.fatal('Missing name. Please supply a name for this WebGateway using the -name argument.');
				logger.info('Exiting due to fatal error.');
				process.exit();
			}
			let webGateway = new WebGateway(webGatewayOptions);
			webGateway.on(MicroServiceEvent.ERROR, (_error) => {
				console.log('WebGateway error: ' + _error.message);
			});
			webGateway.on(MicroServiceEvent.RUNNING, () => {
				console.log('To get help include the -help option:');
				console.log('node WebServer -help');
				console.log('');
				console.log('WebGateway running at ' + webGateway.port);
			});
			webGateway.start();
		} catch(exception) {
			logger.error(exception);
			process.exit(99);
		}
	}
}
// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
	WebGateway.main();
	return;
}

module.exports = WebGateway;