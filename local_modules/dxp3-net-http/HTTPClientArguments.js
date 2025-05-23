/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-net-http
 *
 * NAME
 * HTTPClientArguments
 */
const packageName = 'dxp3-net-http';
const moduleName = 'HTTPClientArguments';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
// Check if someone tried to run/execute this file.
const util = require('dxp3-util');
if(process.argv[1].endsWith(canonicalName)) {
	util.Help.print();
	return;
}
/**
 * @module dxp3-net-http/HTTPClientArguments
 */
const logging = require('dxp3-logging');
const HTTPClientDefaults = require('./HTTPClientDefaults');

const logger = logging.getLogger(canonicalName);

class HTTPClientArguments extends util.ConstructorArguments {
	/**
	 * @constructor
	 */
	constructor() {
		super();
		this.url = null;
		super.addAlias('get', 'url');
		this.help = false;
		super.addAliases('faq,info,information', 'help');
		this.logLevel = [{regexp:"*",level:HTTPClientDefaults.DEFAULT_LOG_LEVEL}];
		super.addAlias('log,logger,logging', 'logLevel');
		this.followRedirects = HTTPClientDefaults.DEFAULT_FOLLOW_REDIRECTS;
		super.addAliases('redirect,redirects,redirection,redirections', 'followInternalLinks');
		this.timeout = HTTPClientDefaults.DEFAULT_TIMEOUT;
		super.addAliases('clienttimeout,connectiontimeout,httpservertimeout,servertimeout,sockettimeout', 'timeout');
		this.useragent = HTTPClientDefaults.DEFAULT_USERAGENT;
	}

	static parseCommandLine() {
		let result = new HTTPClientArguments();
		let commandLineOptions = new util.CommandLineOptions();
		let commandLineOption = commandLineOptions.createFlag('help',
														  'faq,info,information',
														  'help');
		commandLineOptions.add(commandLineOption);
		commandLineOption = commandLineOptions.createString('url',
															'get',
															'url');
		commandLineOptions.add(commandLineOption);
		commandLineOption = commandLineOptions.createBoolean('followredirects',
															'redirect,redirects,redirection,redirections',
															'followRedirects');
		commandLineOptions.add(commandLineOption);
		commandLineOption = commandLineOptions.createNumber('timeout',
															null,
															'timeout');
		commandLineOptions.add(commandLineOption);
		commandLineOption = commandLineOptions.createString('useragent',
															'',
															'useragent');
		commandLineOptions.add(commandLineOption);
		commandLineOption = commandLineOptions.createObjectArray('loglevel',
															'log,logger,logging',
															'logLevel');
		commandLineOption.addStringProperty('regexp');
		commandLineOption.addEnumerationProperty('level', logging.Level);
		commandLineOptions.add(commandLineOption);
		result = commandLineOptions.parse(result);
		return result;
	}
}

module.exports = HTTPClientArguments;