/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-microservice-web
 *
 * NAME
 * WebServerOptions
 */
const packageName = 'dxp3-microservice-web';
const moduleName = 'WebServerOptions';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
// Check if someone tried to run/execute this file.
const util = require('dxp3-util');
if(util.Assert.isFileToExecute(canonicalName)) {
	util.Help.print();
	return;
}
/**
 * @module dxp3-microservice/WebServerOptions
 */
const logging = require('dxp3-logging');
const microservice = require('dxp3-microservice');
const WebServerDefaults = require('./WebServerDefaults');
/**
 * A WebServerOptions instance will attempt to parse and interpret the arguments supplied to
 * a WebServer constructor. Additionally it will provide defaults for missing arguments.
 *
 * @example
 * const web = require('dxp3-microservice-web');
 * let myWebServer = new web.WebServer({name: 'myWebServer', produces: 'main website', port: 80});
 * let mySecureWebServer = new web.WebServer({name: 'myWebServer', produces: 'main website', port: 443, secure: true});
 * myWebServer.start();
 * mySecureWebServer.start();
 *
 * @extends dxp3-microservice/MicroServiceOptions
 * @see module:dxp3-microservice/WebServerDefaults
 */
class WebServerOptions extends util.Options {
	/**
	 * @property {Array|String} domains
	 * An optional list of domains this web server serves.
	 * Each domain may or may not have a root directory (see roots property). 
	 * Alias properties: domain,url,urls.
	 *
	 * @property {String} address
	 * The ip address this web server listens on for incoming requests.
	 * Alias property: host.
	 *
	 * @property {Array|String} roots
	 * An optional directory/folder containing css,html,js and other files.
	 * Alias properties: dir,dirs,directory,directories,folder,folders,html,root,
	 * source,sources,sourceFolder,sourceFolders,static,web,www
	 *
	 * @property {Boolean} secure
	 * Alias properties: https,ishttps,issecure,tls
	 *
	 * @property {Number} timeout
	 * Alias properties: connectiontimeout,servertimeout,sockettimeout,webservertimeout
	 */
	constructor(defaults) {
		super();
		if(defaults === undefined || defaults === null) {
			defaults = WebServerDefaults;
		}
		this.address = defaults.DEFAULT_ADDRESS;
		super.addAlias('host', 'address');
		// A web server may serve 0 or more domains.
		this.domains = [];
		super.addAliases('domain,url,urls', 'domains');
		this.redirects = [];
		super.addAliases('redirect,redirection,redirections', 'redirects');
		this.logLevel = [{regexp:"*",level:defaults.DEFAULT_LOG_LEVEL}];
		super.addAlias('log,logger,logging', 'logLevel');
		this.name = null;
		super.addAliases('microservicename,servicename,webservername', 'name');
		this.port = -1;
		super.addAliases('listenon', 'port');
		super.addAliases('httpport,httpserverport,microserviceport,serverport,serviceport,webserverport', 'port');
		// A WebServer may serve 0 or more subjects.
		this.produces = [];
		super.addAliases('production,productions,product,products,serves,subject,subjects', 'produces');
		// A web server may serve content from 0 or more root/source folders.
		// Each domain will be associated with its own root/source folder.
		this.roots = [];
		super.addAliases('dir,dirs,directories,directory', 'roots');
		super.addAliases('folder,folders', 'roots');
		super.addAlias('html', 'roots');
		super.addAlias('root', 'roots');
		super.addAliases('source,sources,sourcefolder,sourcefolders', 'roots');
		super.addAlias('static', 'roots');
		super.addAlias('web', 'roots');
		super.addAlias('www', 'roots');
		this.secure = defaults.DEFAULT_SECURE;
		super.addAliases('https,ishttps,issecure,tls', 'secure');
		this.certificatesFolder = defaults.DEFAULT_SECURE_FOLDER;
		super.addAliases('certificatedir,certficatesdir,certificatedirectory,certificatesdirectory', 'certificatesFolder');
		super.addAliases('certificatefolder', 'certificatesFolder');
		super.addAliases('certificatelocation,certficateslocation', 'certificatesFolder');
		super.addAliases('securedir,securedirectory,securefolder,securelocation', 'certificatesFolder');
		this.timeout = defaults.DEFAULT_TIMEOUT;
		super.addAliases('clienttimeout,connectiontimeout,servertimeout,sockettimeout,webservertimeout', 'timeout');
	}

	static parse(sourceInstance, defaults) {
		if(defaults === undefined || defaults === null) {
			defaults = WebServerDefaults;
		}
		let result = super.parse(sourceInstance, defaults);
		if(result.port === -1) {
			if(result.secure) {
				result.port = defaults.DEFAULT_SECURE_PORT;
			} else {
				result.port = defaults.DEFAULT_UNSECURE_PORT;
			}
		}
		return result;		
	}

	static parseCommandLine() {
		let result = new WebServerOptions();
		result.currentDomains = [];
		let commandLineOptions = new util.CommandLineOptions();
		// The default handler will be called when a value is encountered without a - prefix that has not
		// been handled by any command line option.
		commandLineOptions.addDefaultHandler((_result, _index, _value) => {
			// Quick check...we have build in a shortcut to add a single root folder.
			// It will be the first parameter and it obviously should not start with a -.
			if(_index === 2) {
				_result.roots.push(_value);
				_result.domains.push('*');
			}
			return _index;
		});

		// -domain <name,...>
		let commandLineOption = commandLineOptions.createStringArray('domain',
																	 'domains,url,urls',
																	 'domains');
		commandLineOption.addHandler((_result, _index, _propertyName) => {
			_index++;
			_result.currentDomains = [];
			if(_index < process.argv.length) {
				_result.currentDomains = process.argv[_index].split(',');
				let currentArray = _result['domains'];
				if(currentArray === undefined || currentArray === null) {
					currentArray = [];
				}
				_result['domains'] = currentArray.concat(_result.currentDomains);
			}
			_index++;
			if(_index < process.argv.length) {
				let values = process.argv[_index];
				if(values.startsWith('-')) {
					_index--;
					return _index;
				}
				let currentArray = _result['roots'];
				if(currentArray === undefined || currentArray === null) {
					currentArray = [];
				}
				_result['roots'] = currentArray.concat(values.split(','));
			}
			return _index;
		});
		commandLineOptions.add(commandLineOption);

		// -redirect <regexp> <Location>
		commandLineOption = commandLineOptions.createObjectArray('redirect',
																 'redirects,redirection,redirections',
																 'redirects');
		commandLineOption.addHandler((_result, _index, _propertyName) => {
			_index++;
			if(_index < process.argv.length) {
				let regexp = process.argv[_index];
				_index++;
				if(_index < process.argv.length) {
					let location = process.argv[_index];
					if(_result.currentDomains.length <= 0) {
						let redirect = {};
						redirect.regexp = regexp;
						redirect.location = location;
						redirect.domain = '*';
						_result.redirects.push(redirect);						
					} else {
						for(let i=0;i < _result.currentDomains.length;i++) {
							let redirect = {};
							redirect.regexp = regexp;
							redirect.location = location;
							redirect.domain = _result.currentDomains[i];
							_result.redirects.push(redirect);						
						}
					}
				}
			}
			return _index;
		});
		commandLineOptions.add(commandLineOption);

		commandLineOption = commandLineOptions.createFlag('help',
												   		  'faq,info,information',
														  'help');
		commandLineOptions.add(commandLineOption);
		commandLineOption = commandLineOptions.createString('address',
															'host',
															'address');
		commandLineOptions.add(commandLineOption);
		commandLineOption = commandLineOptions.createNumber('timeout',
															'connectiontimeout,httptimeout,httpservertimeout,sockettimeout,webtimeout,webservertimeout',
															'timeout');
		commandLineOptions.add(commandLineOption);
		commandLineOption = commandLineOptions.createStringArray('roots',
																 'dir,directory,directories,folder,folders,html,root,source,sources,sourcefolder,sourcefolders,static,web,www',
																 'roots');
		commandLineOptions.add(commandLineOption);
		commandLineOption = commandLineOptions.createNumber('port',
															'listenon,httpserverport,serverport,serviceport,webserverport',
															'port');
		commandLineOptions.add(commandLineOption);
		commandLineOption = commandLineOptions.createBoolean('secure',
														     'https,ishttps,issecure,tls',
														     'secure');
		commandLineOptions.add(commandLineOption);
		commandLineOption = commandLineOptions.createString('certificatesfolder',
															'certdir,certsdir,certificatedir,certficatesdir,certdirectory,certsdirectory,certificatedirectory,certificatesdirectory,certfolder,certsfolder,certificatefolder,certlocation,certslocation,certificatelocation,certficateslocation,securedir,securedirectory,securefolder,securelocation',
															'certificatesFolder');
		commandLineOptions.add(commandLineOption);
		commandLineOption = commandLineOptions.createObjectArray('loglevel',
														 		 'log,logger,logging',
																 'logLevel');
		commandLineOption.addStringProperty('regexp');
		commandLineOption.addEnumerationProperty('level', logging.Level);
		commandLineOptions.add(commandLineOption);
		commandLineOption = commandLineOptions.createString('name',
									   						'httpservername,microservicename,servername,servicename,webservername',
															'name');
		commandLineOptions.add(commandLineOption);
		commandLineOption = commandLineOptions.createStringArray('produces',
																 'production,productions,product,product,serves,subject,subjects',
																 'produces');
		commandLineOptions.add(commandLineOption);
		result = commandLineOptions.parse(result);
		if(!result.help) {
			if(result.domains.length <= 0) {
				result.domains.push('*');
			}
		}
		return result;
	}
}

module.exports = WebServerOptions;