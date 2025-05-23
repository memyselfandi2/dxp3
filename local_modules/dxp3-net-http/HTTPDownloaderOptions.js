/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-net-http
 *
 * NAME
 * HTTPDownloaderOptions
 */
const packageName = 'dxp3-net-http';
const moduleName = 'HTTPDownloaderOptions';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * @module dxp3-net-http/HTTPDownloaderOptions
 */
const logging = require('dxp3-logging');
const HTTPError = require('./HTTPError');
const HTTPDownloaderDefaults = require('./HTTPDownloaderDefaults');
const HTTPSpiderOptions = require('./HTTPSpiderOptions');
const util = require('dxp3-util');

const logger = logging.getLogger(canonicalName);

class HTTPDownloaderOptions extends HTTPSpiderOptions {

	constructor() {
		super();
		this.downloadFolder = HTTPDownloaderDefaults.DEFAULT_DOWNLOAD_FOLDER;
		this.addAliases('destination,destinationdir,destinationdirectory,destinationfolder','downloadFolder');
		this.addAliases('dir,directory,downloaddir,downloaddirectory','downloadFolder');
		this.addAliases('folder','downloadFolder');
		this.addAliases('root,rootdir,rootdirectory,rootfolder','downloadFolder');
		this.addAliases('source,sourcedir,sourcedirectory,sourcefolder','downloadFolder');
		this.logLevel = [{regexp:"*",level:HTTPDownloaderDefaults.DEFAULT_LOG_LEVEL}];
		super.addAlias('log,logger,logging', 'logLevel');
		this.timeout = HTTPDownloaderDefaults.DEFAULT_TIMEOUT;
		super.addAliases('clienttimeout,connectiontimeout,downloadtimeout,httpclienttimeout,httpservertimeout,servertimeout,sockettimeout,spidertimeout', 'timeout');
		this.useragent = HTTPDownloaderDefaults.DEFAULT_USERAGENT;
	}

	static parseCommandLine() {
		let result = new HTTPDownloaderOptions();
		let commandLineOptions = new util.CommandLineOptions();

		// -downloadfolder
		let  commandLineOption = commandLineOptions.createString('downloadfolder',
																 'destination,destinationdir,destinationdirectory,destinationfolder,dir,directory,downloaddir,downloaddirectory,folder,root,rootdir,rootdirectory,rootfolder,source,sourcedir,sourcedirectory,sourcefolder',
																 'downloadFolder');
		commandLineOptions.add(commandLineOption);		

		// -help
		commandLineOption = commandLineOptions.createFlag('help',
														  'faq,info,information',
														  'help');
		commandLineOptions.add(commandLineOption);

		// -loglevel
		commandLineOption = commandLineOptions.createObjectArray('loglevel',
																 'log,logger,logging',
																 'logLevel');
		commandLineOption.addStringProperty('regexp');
		commandLineOption.addEnumerationProperty('level', logging.Level);
		commandLineOptions.add(commandLineOption);

		// -timeout
		commandLineOption = commandLineOptions.createNumber('timeout',
															'clienttimeout,connectiontimeout,downloadtimeout,httpclienttimeout,httpservertimeout,servertimeout,sockettimeout,spidertimeout',
															'timeout');
		commandLineOptions.add(commandLineOption);

		// -url
		commandLineOption = commandLineOptions.createString('url',
															'address,download,get,load,queue,spider,url,visit',
															'url');
		commandLineOptions.add(commandLineOption);

		// -useragent
		commandLineOption = commandLineOptions.createString('useragent',
															'',
															'useragent');
		commandLineOptions.add(commandLineOption);

		result = commandLineOptions.parse(result);
		return result;
	}
}
// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
    util.Help.print(HTTPDownloaderOptions);
    return;
}
module.exports = HTTPDownloaderOptions;