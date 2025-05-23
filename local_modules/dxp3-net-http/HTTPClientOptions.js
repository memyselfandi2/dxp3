/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-net-http
 *
 * NAME
 * HTTPClientOptions
 */
const packageName = 'dxp3-net-http';
const moduleName = 'HTTPClientOptions';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * @module dxp3-net-http/HTTPClientOptions
 */
const HTTPClientDefaults = require('./HTTPClientDefaults');
const logging = require('dxp3-logging');
const util = require('dxp3-util');

const logger = logging.getLogger(canonicalName);

class HTTPClientOptions extends util.Options {

	constructor() {
		super();
		this.logLevel = [{regexp:"*",level:HTTPClientDefaults.DEFAULT_LOG_LEVEL}];
		super.addAlias('log,logger,logging', 'logLevel');
		this.followRedirects = HTTPClientDefaults.DEFAULT_FOLLOW_REDIRECTS;
		super.addAliases('redirect,redirects,redirection,redirections', 'followRedirects');
		this.timeout = HTTPClientDefaults.DEFAULT_TIMEOUT;
		super.addAliases('clienttimeout,connectiontimeout,httpclienttimeout,sockettimeout', 'timeout');
		this.useragent = HTTPClientDefaults.DEFAULT_USERAGENT;
	}

	static parseCommandLine() {
		// Ideally we have at least one parameter...
		// process.argv[0] will be 'node'.
		// process.argv[1] will be the path and filename of HTTPClient
		// process.argv[2] will be the first parameter.
		let result = new HTTPClientOptions();
		let commandLineOptions = new util.CommandLineOptions();
		// The default handler will be called when a value is encountered without a - prefix that has not
		// been handled by any command line option.
		commandLineOptions.addDefaultHandler((_result, _index, _value) => {
			// Quick check...we have build in a shortcut to specify the resource (URL) to get.
			// It will be the first parameter and it obviously should not start with a -.
			// Example: node HTTPClient google.com
			if(_index === 2) {
				_result.url = _value;
			}
			return _index;
		});

		// -followredirects <Boolean>
		let commandLineOption = commandLineOptions.createBoolean('followredirects',
															 	 'followredirect,followredirection,followredirections,redirect,redirects,redirection,redirections',
															     'followRedirects');
		commandLineOptions.add(commandLineOption);

		// -help
		commandLineOption = commandLineOptions.createFlag('help',
														  'faq,info,information',
														  'help');
		commandLineOptions.add(commandLineOption);

		// -loglevel <Regexp> <Level>
		commandLineOption = commandLineOptions.createObjectArray('loglevel',
																 'log,logger,logging',
																 'logLevel');
		commandLineOption.addStringProperty('regexp');
		commandLineOption.addEnumerationProperty('level', logging.Level);
		commandLineOptions.add(commandLineOption);

		// -timeout <Number>
		commandLineOption = commandLineOptions.createNumber('timeout',
															'clienttimeout,connectiontimeout,httpclienttimeout,sockettimeout',
															'timeout');
		commandLineOptions.add(commandLineOption);

		// -url <URL>
		commandLineOption = commandLineOptions.createString('url',
															'address,addresses,get,link,links,urls',
															'url');
		commandLineOptions.add(commandLineOption);

		// -useragent <String>
		commandLineOption = commandLineOptions.createString('useragent',
															'useragents',
															'useragent');
		commandLineOptions.add(commandLineOption);

		result = commandLineOptions.parse(result);
		return result;
	}
}
// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
	util.Help.print(HTTPClientOptions);
	return;
}
module.exports = HTTPClientOptions;