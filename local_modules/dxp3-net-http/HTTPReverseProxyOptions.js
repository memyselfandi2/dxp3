/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-net-http
 *
 * NAME
 * HTTPReverseProxyOptions
 */
const packageName = 'dxp3-net-http';
const moduleName = 'HTTPReverseProxyOptions';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
// Check if someone tried to run/execute this file.
const util = require('dxp3-util');
if(util.Assert.isFileToExecute(canonicalName)) {
	util.Help.print();
	return;
}
/**
 * This class allows us to parse the different arguments/options an HTTPReverseProxy accepts.
 * A HTTPReverseProxy needs a:
 * <ul>
 * <li>Host address (when not specified this will default to 0.0.0.0)</li>
 * <li>Port (when not specified this will default to 80)</li>
 * <li>Offline interval (the amount of time before we retry a downstream server after it refused a connection)</li>
 * <li>Socket timeout (the amount of time of no traffic on the socket before it is closed. The default is 1 minute.)</li>
 * </ul>
 *
 * @module dxp3-net-http/HTTPReverseProxyOptions
 */
const HTTPReverseProxyDefaults = require('./HTTPReverseProxyDefaults');
const logging = require('dxp3-logging');
/**
 * @property {String} host
 * @property {Number} offlineInterval
 * @property {Number} port
 * @property {Number} timeout
 */
class HTTPReverseProxyOptions extends util.Options {
	/**
	 * Our constructor.
	 */
	constructor() {
		super();
		this.address = HTTPReverseProxyDefaults.DEFAULT_ADDRESS;
		super.setAlias('host','address');
		this.certificatesFolder = HTTPReverseProxyDefaults.DEFAULT_SECURE_FOLDER;
		super.addAliases('certdir,certsdir,certificatedir,certficatesdir', 'certificatesFolder');
		super.addAliases('certdirectory,certsdirectory,certificatedirectory,certificatesdirectory', 'certificatesFolder');
		super.addAliases('certfolder,certsfolder,certificatefolder', 'certificatesFolder');
		super.addAliases('certlocation,certslocation,certificatelocation,certficateslocation', 'certificatesFolder');
		super.addAliases('securedir,securedirectory,securefolder,securelocation', 'certificatesFolder');
		this.domains = [];
		this.help = false;
		super.addAliases('faq,info,information', 'help');
		this.logLevel = [{regexp:"*",level:HTTPReverseProxyDefaults.DEFAULT_LOG_LEVEL}];
		super.addAlias('log,logger,logging', 'logLevel');
		this.offlineInterval = HTTPReverseProxyDefaults.DEFAULT_OFFLINE_INTERVAL;
		this.port = -1;
		super.setAlias('httpproxyport,httpreverseproxyport,proxyport,reverseproxyport,serverport', 'port');
		this.secure = HTTPReverseProxyDefaults.DEFAULT_SECURE;
		super.addAliases('https,ishttps,issecure,tls', 'secure');
		this.timeout = HTTPReverseProxyDefaults.DEFAULT_TIMEOUT;
		super.addAliases('clienttimeout,connectiontimeout,httpproxytimeout,httpreverseproxytimeout,proxytimeout,reverseproxytimeout,servertimeout,sockettimeout', 'timeout');
	}

	addDomain(domainName) {
		if(domainName === undefined || domainName === null) {
			return;
		}
		domainName = domainName.trim();
		if(domainName.length <= 0) {
			return;
		}
		let domain = null;
		for(let i=0;i < this.domains.length;i++) {
			if(domainName === this.domains[i].name) {
				domain = this.domains[i];
				break;
			}
		}
		if(domain === null) {
			domain = {};
			domain.name = domainName;
			domain.destinations = new Map();
			domain.rules = [];
			this.domains.push(domain);
		}
		return domain;
	}

	addDestinations(domains, group, destinations) {
		if(destinations === undefined || destinations === null) {
			return;
		}
		if(group === undefined || group === null) {
			group = '';
		}
		group = group.trim().toLowerCase();
		if(group.length <= 0) {
			group = '*';
		}
		destinations = destinations.split(',');
		for(let i=0;i < destinations.length;i++) {
			let destination = destinations[i].trim();
			let secure = false;
			if(destination.length > 0) {
				if(destination.toLowerCase().startsWith('https://')) {
					destination = destination.substring(8);
					secure = true;
				} else if(destination.toLowerCase().startsWith('http://')) {
					destination = destination.substring(7);
				}
				let addressAndPort = destination.split(':');
				let address = addressAndPort[0];
				let port = addressAndPort[1];
				if(port === undefined || port === null) {
					port = HTTPReverseProxyDefaults.DEFAULT_PORT;
				}
				let domainDestination = {};
				domainDestination.address = address;
				domainDestination.port = port;
				domainDestination.secure = secure;
				for(let j=0;j < domains.length;j++) {
					let domain = domains[j];
					let groupDestinations = domain.destinations.get(group);
					if(groupDestinations === undefined || groupDestinations === null) {
						groupDestinations = [];
						domain.destinations.set(group, groupDestinations);
					}
					groupDestinations.push(domainDestination);
				}
			}
		}
	}

	static parse(sourceInstance) {
		let result = super.parse(sourceInstance);
		if(result.port === -1) {
			if(result.secure) {
				result.port = HTTPReverseProxyDefaults.DEFAULT_SECURE_PORT;
			} else {
				result.port = HTTPReverseProxyDefaults.DEFAULT_UNSECURE_PORT;
			}
		}
		return result;
	}

	static parseCommandLine() {
		let result = new HTTPReverseProxyOptions();
		result.currentDomains = [];
		let commandLineOptions = new util.CommandLineOptions();
		let commandLineOption = commandLineOptions.createFlag('help',
															  'faq,info,information',
															  'help');
		commandLineOptions.add(commandLineOption);
		commandLineOption = commandLineOptions.createObjectArray('loglevel',
																 'log,logger,logging',
																 'logLevel');
		commandLineOption.addStringProperty('regexp');
		commandLineOption.addEnumerationProperty('level', logging.Level);
		commandLineOptions.add(commandLineOption);
		commandLineOption = commandLineOptions.createNumber('port',
															'httpport,httpproxyport,httpreverseproxyport,listenon,proxyport,reverseproxyport,serverport',
															'port');
		commandLineOptions.add(commandLineOption);
		commandLineOption = commandLineOptions.createBoolean('secure',
														     'https,ishttps,issecure,tls',
														     'secure');
		commandLineOptions.add(commandLineOption);
		commandLineOption = commandLineOptions.createString('certificatesfolder',
															'certificatedir,certficatesdir,certificatedirectory,certificatesdirectory,certificatefolder,certificatelocation,certficateslocation,securedir,securedirectory,securefolder,securelocation',
															'certificatesFolder');
		commandLineOptions.add(commandLineOption);
		commandLineOption = commandLineOptions.createNumberOption('timeout',
																  'clienttimeout,connectiontimeout,httpproxytimeout,httpreverseproxytimeout,proxytimeout,reverseproxytimeout,servertimeout,sockettimeout',
																  'timeout');
		commandLineOptions.add(commandLineOption);
		commandLineOption = commandLineOptions.createObject('domain',
															'address,addresses,host,hosts,domains,domainname,domainnames',
															'domains');
		commandLineOption.addHandler(function(result,index,propertyName) {
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
		commandLineOptions.add(commandLineOption);
		commandLineOption = commandLineOptions.createStringArray('rule',
																 'regexp,regexps,route,routes,rules',
																 'rules');
		commandLineOption.addHandler(function(result,index,propertyName) {
			index++;
			if(index < process.argv.length) {
				let regexp = process.argv[index];
				index++;
				if(index < process.argv.length) {
					let group = process.argv[index];
					let rule = {};
					rule.regexp = regexp;
					rule.group = group;
					if(result.currentDomains.length <= 0) {
						let defaultDomain = result.addDomain('*');
						result.currentDomains.push(defaultDomain);
					}
					for(let j=0;j < result.currentDomains.length;j++) {
						result.currentDomains[j].rules.push(rule);
					}
				}
			}
			return index;
		});
		commandLineOptions.add(commandLineOption);

		commandLineOption = commandLineOptions.createStringArray('destination',
																 'destinations,forward,forwards,forwardsto,forwardto,server,servers,upstream,upstreams',
																 'destination');
		commandLineOption.addHandler(function(result,index,propertyName) {
			index++;
			if(index < process.argv.length) {
				let groupOrDestinations = process.argv[index];
				index++;
				if(result.currentDomains.length <= 0) {
					let defaultDomain = result.addDomain('*');
					result.currentDomains.push(defaultDomain);
				}
				if(index < process.argv.length) {
					let tmp = process.argv[index];
					let destinations = null;
					if(tmp.startsWith('-')) {
						index--;
						let destinations = groupOrDestinations;
						result.addDestinations(result.currentDomains,null,destinations);
					} else {
						let group = groupOrDestinations;
						let destinations = tmp;
						result.addDestinations(result.currentDomains,group,destinations);
					}
				} else {
					let destinations = groupOrDestinations;
					result.addDestinations(result.currentDomains, null, destinations);
				}
			}
			return index;
		});
		commandLineOptions.add(commandLineOption);
		result = commandLineOptions.parse(result);
		delete result.currentDomains;
		return result;
	}
}

module.exports = HTTPReverseProxyOptions;