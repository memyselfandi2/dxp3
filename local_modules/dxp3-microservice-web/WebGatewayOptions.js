/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-microservice-web
 *
 * NAME
 * WebGatewayOptions
 */
const packageName = 'dxp3-microservice-web';
const moduleName = 'WebGatewayOptions';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
// Check if someone tried to run/execute this file.
const util = require('dxp3-util');
if(util.Assert.isFileToExecute(canonicalName)) {
	util.Help.print();
	return;
}
/**
 * This class allows us to parse the different options a WebGateway accepts.
 * A WebGateway needs a:
 * <ul>
 * <li>Host address (when not specified this will default to 0.0.0.0)</li>
 * <li>Port (when not specified this will default to 80)</li>
 * <li>Offline interval (the amount of time before we retry a downstream server after it refused a connection)</li>
 * <li>Socket timeout (the amount of time of no traffic on the socket before it is closed. The default is 1 minute.)</li>
 * </ul>
 *
 * @module dxp3-net-http/WebGatewayOptions
 */
const logging = require('dxp3-logging');
const microservice = require('dxp3-microservice');
const net = require('dxp3-net');
const WebGatewayDefaults = require('./WebGatewayDefaults');

const HTTPReverseProxyOptions = net.http.HTTPReverseProxyOptions;
const logger = logging.getLogger(canonicalName);
/**
 * A WebGatewayOptions class.
 */
class WebGatewayOptions extends util.Options {
	/**
	 * @property {String} address
	 * @property {Number} port
	 * @property {Number} timeout
	 * @property {Number} offlineInterval
	 */
	constructor() {
		super();
		this.address = WebGatewayDefaults.DEFAULT_ADDRESS;
		super.addAlias('host', 'address');
		this.certificatesFolder = WebGatewayDefaults.DEFAULT_SECURE_FOLDER;
		super.addAliases('certificatedir,certficatesdir,certificatedirectory,certificatesdirectory', 'certificatesFolder');
		super.addAliases('certificatefolder', 'certificatesFolder');
		super.addAliases('certificatelocation,certficateslocation', 'certificatesFolder');
		super.addAliases('securedir,securedirectory,securefolder,securelocation', 'certificatesFolder');
		this.consumes = [];
		super.addAliases('client,clients,consumption,consumptions', 'consumes');
		super.addAliases('destination,destinations', 'consumes');
		super.addAliases('forward,forwards,forwardto,forwardsto', 'consumes');
		super.addAliases('proxy,proxies', 'consumes');
		super.addAliases('upstream,upstreams','consumes');
		// A web gateway may serve 0 or more domains.
		this.domains = [];
		super.addAliases('domain,url,urls', 'domains');
		this.logLevel = [{regexp:"*",level:WebGatewayDefaults.DEFAULT_LOG_LEVEL}];
		super.addAlias('log,logger,logging', 'logLevel');
		this.name = null;
		super.addAliases('gatewayname,microservicename,servicename,webservername', 'name');
		this.offlineInterval = WebGatewayDefaults.DEFAULT_OFFLINE_INTERVAL;
		this.port = -1;
		super.addAliases('listenon', 'port');
		super.addAliases('gatewayport,httpport,httpserverport,microserviceport,serverport,serviceport,webgatewayport,webserverport', 'port');
		this.produces = [];
		super.addAliases('production,productions,product,products,serves,subject,subjects', 'produces');
		this.secure = WebGatewayDefaults.DEFAULT_SECURE;
		super.addAliases('https,ishttps,issecure,tls', 'secure');
		this.timeout = WebGatewayDefaults.DEFAULT_TIMEOUT;
		super.addAliases('clienttimeout,connectiontimeout,gatewaytimeout,servertimeout,sockettimeout', 'timeout');
	}

	getDomain(domainName) {
		let result = null;
		for(let i=0;i < this.domains.length;i++) {
			if(this.domains[i].name === domainName) {
				result = this.domains[i];
				break;
			}
		}
		return result;
	}

	addDomain(domainName) {
		if(domainName === undefined || domainName === null) {
			return;
		}
		domainName = domainName.trim();
		if(domainName.length <= 0) {
			return;
		}
		let domain = this.getDomain(domainName);
		if(domain === null) {
			domain = {};
			domain.rules = [];
			domain.name = domainName;
			domain.subjects = [];
			this.domains.push(domain);
		}
		return domain;
	}

	addSubject(domainName, subject) {
		if(subject === undefined || subject === null) {
			return;
		}
		subject = subject.trim();
		if(subject.length <= 0) {
			return;
		}
		let domain = this.getDomain(domainName);
		if(domain === null) {
			return;
		}
		domain.subjects.push(subject);
		this.consumes.push(subject);
	}

	addRule(domainName, regexp, subject) {
		if(regexp === undefined || regexp === null) {
			return;
		}
		regexp = regexp.trim();
		if(regexp.length <= 0) {
			return;
		}
		if(subject === undefined || subject === null) {
			return;
		}
		subject = subject.trim();
		if(subject.length <= 0) {
			return;
		}
		let rule = {};
		rule.regexp = regexp;
		rule.subject = subject;
		let domain = this.getDomain(domainName);
		if(domain === null) {
			return;
		}
		domain.rules.push(rule);
	}

	static parse(sourceInstance) {
		let result = super.parse(sourceInstance);
		if(result.port === -1) {
			if(result.secure) {
				result.port = WebGatewayDefaults.DEFAULT_SECURE_PORT;
			} else {
				result.port = WebGatewayDefaults.DEFAULT_UNSECURE_PORT;
			}
		}
		// Loop through each domain and perform some sanity checks.
		for(let i=0;i < result.domains.length;i++) {
			let domain = result.domains[i];
			let subjects = domain.subjects;
			let rules = domain.rules;
			// The subject of each rule must be in the list of subjects of the domain.
			for(let j=0;j < rules.length;j++) {
				let rule = rules[j];
				let subject = rule.subject;
				let index = subjects.indexOf(subject);
				if(index < 0) {
					subjects.push(subject);
				}
			}
			if(subjects.length <= 0) {
				// If there are no subjects, requests for the domain can not be proxied.
				// We need to warn the user.
				logger.warn('No subject defined for domain \'' + domain.name + '\'.');
			} else if(subjects.length === 1) {
				// If one subject is defined for the domain and there are no rules specified,
				// we need to explicitly add a catch-all rule.
				if(rules.length <= 0) {
					let rule = {};
					rule.regexp = '*';
					rule.subject = subjects[0];
					domain.rules.push(rule);
				}
			} else if(subjects.length > 1) {
				// If there is more than one subject/forward/destination,
				// we need to ensure there are rules defined for each.
				if(rules.length <= 0) {
					logger.warn('No rules defined even though there are multiple forwarding destinations.');
				}
			}
			// The subject of each domain must be in our 'consumes' property.
			for(let j=0;j < subjects.length;j++) {
				let subject = subjects[j];
				let index = result.consumes.indexOf(subject);
				if(index < 0) {
					result.consumes.push(subject);
				}
			}
		}
		return result;
	}

	static parseCommandLine() {
		let result = new WebGatewayOptions();
		result.currentDomains = [];
		let commandLineOptions = new util.CommandLineOptions();

		// -help
		let commandLineOption = commandLineOptions.createFlag('help',
															  'faq,info,information',
															  'help');
		commandLineOptions.add(commandLineOption);

		// -name
		commandLineOption = commandLineOptions.createString('name',
															'gatewayname,servername,servicename',
															'name');
		commandLineOptions.addOption(commandLineOption);

		// -loglevel
		commandLineOption = commandLineOptions.createObjectArray('loglevel',
																 'log,logger,logging',
																 'logLevel');
		commandLineOption.addStringProperty('regexp');
		commandLineOption.addEnumerationProperty('level', logging.Level);
		commandLineOptions.add(commandLineOption);

		// -port
		commandLineOption = commandLineOptions.createNumber('port',
															'gatewayport,listenon,serverport',
															'port');
		commandLineOptions.addOption(commandLineOption);

		// -secure
		commandLineOption = commandLineOptions.createBoolean('secure',
														     'https,ishttps,issecure,tls',
														     'secure');
		commandLineOptions.add(commandLineOption);

		// -certificatesfolder
		commandLineOption = commandLineOptions.createString('certificatesfolder',
															'certdir,certsdir,certificatedir,certficatesdir,certdirectory,certsdirectory,certificatedirectory,certificatesdirectory,certfolder,certsfolder,certificatefolder,certlocation,certslocation,certificatelocation,certficateslocation,securedir,securedirectory,securefolder,securelocation',
															'certificatesFolder');
		commandLineOptions.add(commandLineOption);

		// -timeout
		commandLineOption = commandLineOptions.createNumber('timeout',
														 	'clienttimeout,connectiontimeout,gatewaytimeout,servertimeout,sockettimeout',
															'timeout');
		commandLineOptions.addOption(commandLineOption);

		// -produces
		commandLineOption = commandLineOptions.createStringArray('produces',
															     'gateway,serve,serves,production,productions,product,products',
															     'produces');
		commandLineOptions.addOption(commandLineOption);

		// -consumes
		commandLineOption = commandLineOptions.createStringArray('consumes',
															     'client,clients,consumption,consumptions,destination,destinations,forward,forwards,forwardto,forwardsto,proxy,proxies,service,services,subject,subjects,upstream',
															     'consumes');
		commandLineOption.addHandler(function(result, index, propertyName) {
			index++;
			if(result.currentDomains.length <= 0) {
				let defaultDomain = result.addDomain('*');
				result.currentDomains.push(defaultDomain);
			}
			let subjects = process.argv[index];
			subjects = subjects.split(',');
			for(let i=0;i < subjects.length;i++) {
				let subject = subjects[i];
				for(let j=0;j < result.currentDomains.length;j++) {
					let domain = result.currentDomains[j];
					result.addSubject(domain.name, subject);
				}
			}
			return index;
		});
		commandLineOptions.addOption(commandLineOption);
		commandLineOption = commandLineOptions.createObjectOption('domain',
															  	  'domains,domainname,domain-name,domain_name,domainnames,domain-names,domain_names',
															      'domains');
		commandLineOption.addHandler(function(result, index, propertyName) {
			index++;
			result.currentDomains = [];
			if(index < process.argv.length) {
				let domains = process.argv[index].split(',');
				for(let i=0;i < domains.length;i++) {
					let domainName = domains[i].trim();
					let domain = result.addDomain(domainName);
					result.currentDomains.push(domain);
				}
			}
			return index;
		});
		commandLineOptions.addOption(commandLineOption);

		commandLineOption = commandLineOptions.createObjectOption('regexp',
																  'regexps,route,routes,rule,rules',
																  'rules');
		commandLineOption.addHandler(function(result, index, propertyName) {
			index++;
			if(index < process.argv.length) {
				let regexp = process.argv[index];
				index++;
				if(index < process.argv.length) {
					let subject = process.argv[index];
					if(result.currentDomains.length <= 0) {
						let defaultDomain = result.addDomain('*');
						result.currentDomains.push(defaultDomain);
					}
					for(let j=0;j < result.currentDomains.length;j++) {
						let domain = result.currentDomains[j];
						result.addRule(domain.name, regexp, subject);
					}
				}
			}
			return index;
		});
		commandLineOptions.addOption(commandLineOption);
		result = commandLineOptions.parse(result);
		delete result.currentDomains;
		// Sanity check...
		return result;
	}
}

module.exports = WebGatewayOptions;