/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-lang-css
 *
 * NAME
 * CSSReaderOptions
 */
const packageName = 'dxp3-lang-css';
const moduleName = 'CSSReaderOptions';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * @module dxp3-lang-css/CSSReaderOptions
 */
const CSSReaderDefaults = require('./CSSReaderDefaults');
const logging = require('dxp3-logging');
const util = require('dxp3-util');

const Level = logging.Level;
/**
 * @see module:dxp3-lang-css/CSSReaderDefaults
 */
class CSSReaderOptions extends util.Options {
    /*********************************************
     * CONSTRUCTOR
     ********************************************/

	constructor() {
		super();
		this.help = false;
		super.addAliases('faq,info,information', 'help');
		this.logLevel = [{regexp:"*",level:CSSReaderDefaults.DEFAULT_LOG_LEVEL}];
		super.addAlias('log,logger,logging', 'logLevel');
		this.text = null;
		super.addAliases('data,css,cssstring,csstext,string', 'text');
		this.fileName = null;
		super.addAliases('cssfile,filepath,filelocation,location,path,stylesheet', 'fileName');
		this.query = null;
		super.addAliases('select,selection,selector', 'query');
		this.url = null;
		this.followRedirects = CSSReaderDefaults.DEFAULT_FOLLOW_REDIRECTS;
		super.addAliases('redirect,redirects,redirection,redirections', 'followInternalLinks');
		this.timeout = CSSReaderDefaults.DEFAULT_TIMEOUT;
		super.addAliases('clienttimeout,connectiontimeout,httpservertimeout,servertimeout,sockettimeout', 'timeout');
		this.useragent = CSSReaderDefaults.DEFAULT_USERAGENT;
	}

    /*********************************************
     * PUBLIC METHODS
     ********************************************/

	static parseCommandLine() {
		let result = new CSSReaderOptions();
		let commandLineOptions = new util.CommandLineOptions();
		let commandLineOption = commandLineOptions.createFlag('help',
														  'faq,info,information',
														  'help');
		commandLineOptions.add(commandLineOption);
		commandLineOption = commandLineOptions.createString('text',
															'data,css,cssstring,csstext,string',
															'text');
		commandLineOptions.add(commandLineOption);
		commandLineOption = commandLineOptions.createString('file',
															'cssfile,filename,filepath,filelocation,location,path,stylesheet',
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
															null,
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
// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
	util.Help.print(CSSReaderOptions);
	return;
}
module.exports = CSSReaderOptions;