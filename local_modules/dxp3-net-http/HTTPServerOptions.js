/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-net-http
 *
 * NAME
 * HTTPServerOptions
 */
const packageName = 'dxp3-net-http';
const moduleName = 'HTTPServerOptions';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * @module dxp3-net-http/HTTPServerOptions
 */
const HTTPError = require('./HTTPError');
const HTTPServerDefaults = require('./HTTPServerDefaults');
// It's important to at least log warnings and errors.
const logging = require('dxp3-logging');
// Different operating systems have different folder structures.
// We need to know the os we are running on to be able to choose
// the correct default certicates folder.
const os = require('os');
// We use the util.Help class to print out help information.
const util = require('dxp3-util');

const logger = logging.getLogger(canonicalName);
/**
 * @alias HTTPServerOptions
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
class HTTPServerOptions extends util.Options {
    /*********************************************
     * CONSTRUCTOR
     ********************************************/

	constructor() {
		super();
		// Typically one wants to listen on all interface: 0.0.0.0.
		this.address = HTTPServerDefaults.DEFAULT_ADDRESS;
		super.addAlias('host', 'address');
		// We start out with no domains.
		this.domains = [];
		super.addAliases('domain,host,hosts,url,urls', 'domains');
		// We assume no redirects.
		this.redirects = [];
		super.addAliases('redirect,redirection,redirections', 'redirects');
		this.logLevel = [{regexp:"*",level:HTTPServerDefaults.DEFAULT_LOG_LEVEL}];
		super.addAlias('log,logger,logging', 'logLevel');
		// The default port will be set by our static parse method based on
		// if we are using http or https (secure).
		this.port = -1;
		super.addAliases('httpport,httpsport,httpserverport,httpsserverport,serverport', 'port');
		this.secure = HTTPServerDefaults.DEFAULT_SECURE;
		super.addAliases('https,ishttps,issecure,tls', 'secure');
		if(os.type().startsWith('Windows')) {
			this.certificatesFolder = HTTPServerDefaults.DEFAULT_SECURE_FOLDER_WINDOWS;
		} else {
			this.certificatesFolder = HTTPServerDefaults.DEFAULT_SECURE_FOLDER;
		}
		super.addAliases('certificatedir,certficatesdir,certificatedirectory,certificatesdirectory', 'certificatesFolder');
		super.addAliases('certificates,certificate,certificatefolder', 'certificatesFolder');
		super.addAliases('certificatelocation,certficateslocation', 'certificatesFolder');
		super.addAliases('securedir,securedirectory,securefolder,securelocation', 'certificatesFolder');
		this.roots = [];
		super.addAliases('dir,dirs,directories,directory', 'roots');
		super.addAliases('folder,folders', 'roots');
		super.addAlias('html', 'roots');
		super.addAlias('root', 'roots');
		super.addAliases('source,sources,sourcedir,sourcedirs,sourcefolder,sourcefolders', 'roots');
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

	static parseCommandLine() {
		// Ideally we have at least one parameter...
		// process.argv[0] will be 'node'.
		// process.argv[1] will be the path and filename of HTTPServer
		// process.argv[2] will be the first parameter.
		let result = new HTTPServerOptions();
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

		// -domain <Name,...>
		let commandLineOption = commandLineOptions.createStringArray('domain',
																	 'domains,host,hosts,url,urls',
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

		// -help
		commandLineOption = commandLineOptions.createFlag('help',
														  'faq,info,information',
														  'help');
		commandLineOptions.add(commandLineOption);

		// -address <String>
		commandLineOption = commandLineOptions.createString('address',
															'host',
															'address');
		commandLineOptions.add(commandLineOption);

		// -timeout <Number>
		commandLineOption = commandLineOptions.createNumber('timeout',
															'clienttimeout,connectiontimeout,httpservertimeout,servertimeout,sockettimeout',
															'timeout');
		commandLineOptions.add(commandLineOption);

		// -root <Path,...>
		commandLineOption = commandLineOptions.createStringArray('root',
																['dir','directory','directories','folder','folders','html','root','roots','source','sourcedir','sourcedirs','sources','sourcefolder','sourcefolders','static','web','www'],
																'roots');
		commandLineOptions.add(commandLineOption);

		// -port <Number>
		commandLineOption = commandLineOptions.createNumber('port',
															'httpserverport,listenon,serverport',
															'port');
		commandLineOptions.add(commandLineOption);

		// -secure <Boolean>
		commandLineOption = commandLineOptions.createBoolean('secure',
														     'https,ishttps,issecure,tls',
														     'secure');
		commandLineOptions.add(commandLineOption);

		// -certificatesfolder <Path>
		commandLineOption = commandLineOptions.createString('certificatesfolder',
															'certificate,certificates,certificatedir,certficatesdir,certificatedirectory,certificatesdirectory,certificatefolder,certificatelocation,certficateslocation,securedir,securedirectory,securefolder,securelocation',
															'certificatesFolder');
		commandLineOptions.add(commandLineOption);

		// -loglevel <Regexp> <Level>
		commandLineOption = commandLineOptions.createObjectArray('loglevel',
																 'log,logger,logging',
																 'logLevel');
		commandLineOption.addStringProperty('regexp');
		commandLineOption.addEnumerationProperty('level', logging.Level);
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
// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
    util.Help.print(HTTPServerOptions);
    return;
}
module.exports = HTTPServerOptions;