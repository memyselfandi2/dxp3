/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-net-http
 *
 * NAME
 * HTTPServerArguments
 */
const packageName = 'dxp3-net-http';
const moduleName = 'HTTPServerArguments';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
// Check if someone tried to run/execute this file.
const util = require('dxp3-util');
if(process.argv[1].indexOf(canonicalName) >= 0) {
	util.Help.print();
	return;
}
/**
 * @module dxp3-net-http/HTTPServerArguments
 */
const logging = require('dxp3-logging');
const HTTPError = require('./HTTPError');
const HTTPServerDefaults = require('./HTTPServerDefaults');

const logger = logging.getLogger(canonicalName);
/**
 * @alias HTTPServerArguments
 * @property {Array|String} domains	An optional list of domains this HTTPServer serves.
 *									Alias properties: domain,url,urls.
 *									Each domain may or may not have a root directory (see roots property). 
 * @property {Boolean|String} help	Alias properties: info,information.
 * @property {String} host	The host this HTTPServer listens on for incoming requests.
 *							Alias property: address.
 * @property {Level} logLevel	Alias properties: log,logging.
 * @property {Number} port	Alias property: serverPort.
 * @property {Array|String} roots	An optional directory/folder containing css,html,js and other files.
 *									Alias properties: dir,dirs,directory,directories,folder,folders,html,root,
 *													  source,sources,sourceFolder,sourceFolders,static,web,www
 * @property {Number} timeout
 */
class HTTPServerArguments extends util.ConstructorArguments {
	/**
	 * @constructor
	 */
	constructor() {
		super();
		this.address = HTTPServerDefaults.DEFAULT_ADDRESS;
		super.addAlias('host', 'address');
		this.domains = [];
		super.addAliases('domain,url,urls', 'domains');
		this.help = false;
		super.addAliases('faq,info,information', 'help');
		this.logLevel = [{regexp:"*",level:HTTPServerDefaults.DEFAULT_LOG_LEVEL}];
		super.addAlias('log,logger,logging', 'logLevel');
		this.port = -1;
		super.addAliases('httpport,httpsport,httpserverport,httpsserverport,serverport', 'port');
		this.secure = HTTPServerDefaults.DEFAULT_SECURE;
		super.addAliases('https,ishttps,issecure,tls', 'secure');
		this.certificatesFolder = HTTPServerDefaults.DEFAULT_SECURE_FOLDER;
		super.addAliases('certificatedir,certficatesdir,certificatedirectory,certificatesdirectory', 'certificatesFolder');
		super.addAliases('certificates,certificate,certificatefolder', 'certificatesFolder');
		super.addAliases('certificatelocation,certficateslocation', 'certificatesFolder');
		super.addAliases('securedir,securedirectory,securefolder,securelocation', 'certificatesFolder');
		this.roots = [];
		super.addAliases('dir,dirs,directories,directory', 'roots');
		super.addAliases('folder,folders', 'roots');
		super.addAlias('html', 'roots');
		super.addAlias('root', 'roots');
		super.addAliases('source,sources,sourcefolder,sourcefolders', 'roots');
		super.addAlias('static', 'roots');
		super.addAlias('web', 'roots');
		super.addAlias('www', 'roots');
		this.timeout = HTTPServerDefaults.DEFAULT_TIMEOUT;
		super.addAliases('clienttimeout,connectiontimeout,httpservertimeout,servertimeout,sockettimeout', 'timeout');
	}

	static parse(sourceInstance) {
		let result = super.parse(sourceInstance);
		if(result.port === -1) {
			if(result.secure) {
				result.port = HTTPServerDefaults.DEFAULT_SECURE_PORT;
			} else {
				result.port = HTTPServerDefaults.DEFAULT_UNSECURE_PORT;
			}
		}
		return result;		
	}

	static parseCommandLineOptions() {
		// Quick exit...lets make sure we have at least one parameter...
		// process.argv[0] will be 'node'.
		// process.argv[1] will be the path and filename of HTTPServer
		// process.argv[2] will be the first parameter.
		if(process.argv.length <= 2) {
			throw new HTTPError('You need to specify at least one root/source folder.','ILLEGAL_ARGUMENT');
		}
		let result = new HTTPServerArguments();
		let commandLineOptions = new util.CommandLineOptions();
		commandLineOptions.addDefaultHandler(function(index, value) {
			// Quick check...we have build in a shortcut to add a single root folder.
			// It will be the first parameter and it obviously should not start with a -.
			if(index === 2) {
				let roots = value.split(/[,]/);;
				for(let i=0;i < roots.length;i++) {
					let root = roots[i].trim();
					if(root.length > 0) {
						result.roots.push(root);
					}
				}
			}
			return index;
		});
		let commandLineOption = commandLineOptions.createStringArray('domain',
																	 'domains,url,urls',
																	 'domains');
		commandLineOption.addHandler(function(result, index, propertyName) {
			index++;
			if(index < process.argv.length) {
				let values = process.argv[index];
				let currentArray = result['domains'];
				if(currentArray === undefined || currentArray === null) {
					currentArray = [];
				}
				result['domains'] = currentArray.concat(values.trim().split(','));
			}
			index++;
			if(index < process.argv.length) {
				let values = process.argv[index];
				if(values.startsWith('-')) {
					index--;
					return index;
				}
				let currentArray = result['roots'];
				if(currentArray === undefined || currentArray === null) {
					currentArray = [];
				}
				result['roots'] = currentArray.concat(values.trim().split(','));
			}
			return index;
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
															null,
															'timeout');
		commandLineOptions.add(commandLineOption);
		commandLineOption = commandLineOptions.createStringArray('roots',
															['dir','directory','directories','folder','folders','html','root','roots','source','sources','sourcefolder','sourcefolders','static','web','www'],
															'roots',
															'');
		commandLineOptions.add(commandLineOption);
		commandLineOption = commandLineOptions.createNumber('port',
															'httpserverport,listenon,serverport',
															'port');
		commandLineOptions.add(commandLineOption);
		commandLineOption = commandLineOptions.createBoolean('secure',
														     'https,ishttps,issecure,tls',
														     'secure');
		commandLineOptions.add(commandLineOption);
		commandLineOption = commandLineOptions.createString('certificatesfolder',
															'certificate,certificates,certificatedir,certficatesdir,certificatedirectory,certificatesdirectory,certificatefolder,certificatelocation,certficateslocation,securedir,securedirectory,securefolder,securelocation',
															'certificatesFolder');
		commandLineOptions.add(commandLineOption);
		commandLineOption = commandLineOptions.createObjectArray('loglevel',
															'log,logger,logging',
															'logLevel');
		commandLineOption.addStringProperty('regexp');
		commandLineOption.addEnumerationProperty('level', logging.Level);
		commandLineOptions.add(commandLineOption);
		result = commandLineOptions.parse(result);

		if(!result.help) {
			if(result.roots.length <= 0) {
				throw new HTTPError('You need to specify at least one root/source folder.','ILLEGAL_ARGUMENT');
			}
			// We need the same number of domains as roots...
			if(result.roots.length > 1) {
				if(result.domains.length != result.roots.length) {
					throw new HTTPError('Each root/source folder must be tied to a domain.','ILLEGAL_ARGUMENT');
				}
			}
			if(result.domains.length > 1) {
				if(result.domains.length != result.roots.length) {
					throw new HTTPError('Each domain MUST have a root/source folder.','ILLEGAL_ARGUMENT');
				}
			}
		}
		return result;
	}
}

module.exports = HTTPServerArguments;