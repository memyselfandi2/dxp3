/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-lang-html
 *
 * NAME
 * HTMLReaderOptions
 */
const packageName = 'dxp3-lang-html';
const moduleName = 'HTMLReaderOptions';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
// Check if someone tried to run/execute this file.
const util = require('dxp3-util');
if(util.Assert.isFileToExecute(canonicalName)) {
	util.Help.print();
	return;
}
/**
 * @module dxp3-lang-html/HTMLReaderOptions
 */
const HTMLReaderDefaults = require('./HTMLReaderDefaults');
const logging = require('dxp3-logging');

const Level = logging.Level;
/**
 * @see module:dxp3-lang-html/HTMLReaderDefaults
 */
class HTMLReaderOptions extends util.Options {

	constructor() {
		super();
		this.help = false;
		super.addAliases('faq,info,information', 'help');
		this.logLevel = [{regexp:"*",level:HTMLReaderDefaults.DEFAULT_LOG_LEVEL}];
		super.addAlias('log,logger,logging', 'logLevel');
		this.text = null;
		super.addAliases('data,html,htmlstring,htmltext,string', 'text');
		this.fileName = null;
		super.addAliases('filepath,filelocation,location,path', 'fileName');
		this.query = null;
		super.addAliases('select,selection,selector', 'query');
		this.url = null;
		this.followRedirects = HTMLReaderDefaults.DEFAULT_FOLLOW_REDIRECTS;
		super.addAliases('redirect,redirects,redirection,redirections', 'followInternalLinks');
		this.timeout = HTMLReaderDefaults.DEFAULT_TIMEOUT;
		super.addAliases('clienttimeout,connectiontimeout,httpservertimeout,servertimeout,sockettimeout', 'timeout');
		this.useragent = HTMLReaderDefaults.DEFAULT_USERAGENT;
	}

	static parseCommandLine() {
		let result = new HTMLReaderOptions();
		let commandLineOptions = new util.CommandLineOptions();
		let commandLineOption = commandLineOptions.createFlag('help',
														  'faq,info,information',
														  'help');
		commandLineOptions.add(commandLineOption);
		commandLineOption = commandLineOptions.createString('text',
															'data,html,htmlstring,htmltext,string',
															'text');
		commandLineOptions.add(commandLineOption);
		commandLineOption = commandLineOptions.createString('file',
															'filename,filepath,filelocation,location,path',
															'fileName');
		commandLineOptions.add(commandLineOption);
		commandLineOption = commandLineOptions.createString('query',
															'select,selection,selector',
															'query');
		commandLineOptions.add(commandLineOption);
		commandLineOption = commandLineOptions.createString('url',
															null,
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

module.exports = HTMLReaderOptions;