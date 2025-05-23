/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-net-http
 *
 * NAME
 * HTTPDownloaderArguments
 */
const packageName = 'dxp3-net-http';
const moduleName = 'HTTPDownloaderArguments';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
// Check if someone tried to run/execute this file.
const util = require('dxp3-util');
if(process.argv[1].indexOf(canonicalName) >= 0) {
	util.Help.print();
	return;
}
/**
 * @module dxp3-net-http/HTTPDownloaderArguments
 */
const logging = require('dxp3-logging');
const HTTPError = require('./HTTPError');
const HTTPDownloaderDefaults = require('./HTTPDownloaderDefaults');
const HTTPSpiderArguments = require('./HTTPSpiderArguments');

const logger = logging.getLogger(canonicalName);

class HTTPDownloaderArguments extends HTTPSpiderArguments {

	constructor() {
		super();
		this.downloadFolder = null;
	}

	static parseCommandLineOptions() {
		let result = new HTTPDownloaderArguments();
		let commandLineOptions = new util.CommandLineOptions();
		let commandLineOption = commandLineOptions.createFlag('help',
														  'faq,info,information',
														  'help');
		commandLineOptions.add(commandLineOption);
		commandLineOption = commandLineOptions.createBoolean('followlinks',
															'followexternallinks,followhosts,visitexternallinks,visithosts',
															'followLinks');
		commandLineOptions.add(commandLineOption);
		commandLineOption = commandLineOptions.createNumber('ratelimit',
															'pause,pausetime,throttle,throttletime,wait,waittime',
															'rateLimit');
		commandLineOptions.add(commandLineOption);
		commandLineOption = commandLineOptions.createNumber('timeout',
															'connectiontimeout,downloadtimeout,httpservertimeout,servertimeout,sockettimeout,spidertimeout',
															'timeout');
		commandLineOptions.add(commandLineOption);
		commandLineOption = commandLineOptions.createStringArray('urls',
															'address,download,queue,spider,url,visit',
															'urls');
		commandLineOptions.add(commandLineOption);
		commandLineOption = commandLineOptions.createString('downloadfolder',
															'dir,directory,downloaddir,downloaddirectory,folder,root,rootdir,rootdirectory,rootfolder,source,sourcedir,sourcefolder',
															'downloadFolder');
		commandLineOptions.add(commandLineOption);		
		commandLineOption = commandLineOptions.createStringArray('contenttype',
															'contenttypes,type,types',
															'contentTypes');
		commandLineOptions.add(commandLineOption);
		commandLineOption = commandLineOptions.createObjectArray('loglevel',
															'log,logger,logging',
															'logLevel');
		commandLineOption.addStringProperty('regexp');
		commandLineOption.addEnumerationProperty('level', logging.Level);
		commandLineOptions.add(commandLineOption);
		result = commandLineOptions.parse(result);
		console.log('result downloadfolder: ' + result.downloadFolder);
		return result;
	}
}

module.exports = HTTPDownloaderArguments;