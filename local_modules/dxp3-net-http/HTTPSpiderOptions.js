/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-net-http
 *
 * NAME
 * HTTPSpiderOptions
 */
const packageName = 'dxp3-net-http';
const moduleName = 'HTTPSpiderOptions';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * @module dxp3-net-http/HTTPSpiderOptions
 */
const HTTPError = require('./HTTPError');
const HTTPSpiderDefaults = require('./HTTPSpiderDefaults');
// It's important to at least log warnings and errors.
const logging = require('dxp3-logging');
// We use the util.Help class to print out help information.
const util = require('dxp3-util');

const logger = logging.getLogger(canonicalName);

class HTTPSpiderOptions extends util.Options {

	constructor() {
		super();
		this.logLevel = [{regexp:"*",level:HTTPSpiderDefaults.DEFAULT_LOG_LEVEL}];
		super.addAlias('log,logger,logging', 'logLevel');
		this.rateLimit = HTTPSpiderDefaults.DEFAULT_RATE_LIMIT;
		super.addAliases('pause,pausetime,throttle,throttletime,wait,waittime', 'rateLimit');
		this.timeout = HTTPSpiderDefaults.DEFAULT_TIMEOUT;
		super.addAliases('connectiontimeout,httpservertimeout,servertimeout,sockettimeout,spidertimeout', 'timeout');
		this.followRedirects = HTTPSpiderDefaults.DEFAULT_FOLLOW_REDIRECTS;
		super.addAliases('redirect,redirects,redirection,redirections', 'followInternalLinks');
		this.filterStatusCodes = [];
		this.addAliases('code,codes,filtercode,filterstatuscode', 'filterStatusCodes');
		this.addAliases('httpcode,httpcodes,httpstatus,httpstatuscode,httpstatuscodes,status,statuscode', 'filterStatusCodes');
		this.filterContentTypes = [];
		this.addAliases('content,contenttype,contenttypes,filtercontent,filtercontenttype,type,types', 'filterContentTypes');
		this.filterHosts = [];
		this.addAliases('filterhost', 'filterHosts');
		this.filterPaths = [];
		this.addAliases('filterpath,path,paths', 'filterPaths');
		this.downloadFolder = HTTPSpiderDefaults.DEFAULT_DOWNLOAD_FOLDER;;
		this.addAliases('dir,directory,downloaddir,downloaddirectory','downloadFolder');
		this.addAliases('folder','downloadFolder');
		this.addAliases('root,rootdir,rootdirectory,rootfolder','downloadFolder');
		this.addAliases('source,sourcedir,sourcedirectory,sourcefolder','downloadFolder');
		this.followHosts = [{hostName:'.',followPath:'*'}];
		this.addAliases('domains,externalhosts,hosts,hostnames', 'followHosts');
		this.useragent = HTTPSpiderDefaults.DEFAULT_USERAGENT;
		this.urls = [];
	}

	static parseCommandLineOptions() {
		let result = new HTTPSpiderOptions();
		let commandLineOptions = new util.CommandLineOptions();

		// -downloadfolder
		let commandLineOption = commandLineOptions.createString('downloadfolder',
																'dir,directory,downloaddir,downloaddirectory,folder,root,rootdir,rootdirectory,rootfolder,source,sourcedir,sourcefolder',
																'downloadFolder');
		commandLineOptions.add(commandLineOption);

		// -followhost
		commandLineOption = commandLineOptions.createObjectArray('followhost',
																 'domain,follow,followhosts,host,hostname,path,paths,route,routes',
																 'followHosts');
		commandLineOption.addStringProperty('hostName');
		commandLineOption.addStringProperty('followPath');
		commandLineOptions.add(commandLineOption);

		// -followredirects
		commandLineOption = commandLineOptions.createBoolean('followredirects',
															'redirect,redirects,redirection,redirections',
															'followRedirects');
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

		// -ratelimit
		commandLineOption = commandLineOptions.createNumber('ratelimit',
															'pause,pausetime,throttle,throttletime,wait,waittime',
															'rateLimit');
		commandLineOptions.add(commandLineOption);

		// -timeout
		commandLineOption = commandLineOptions.createNumber('timeout',
															'connectiontimeout,httpservertimeout,servertimeout,sockettimeout,spidertimeout',
															'timeout');
		commandLineOptions.add(commandLineOption);

		// -url
		commandLineOption = commandLineOptions.createStringArray('url',
																 'address,crawl,download,load,queue,spider,start,starturl,visit,urls,webcrawl',
																 'urls');
		commandLineOptions.add(commandLineOption);

		// -useragent
		commandLineOption = commandLineOptions.createString('useragent',
															'',
															'useragent');
		commandLineOptions.add(commandLineOption);

		commandLineOption = commandLineOptions.createStringArray('filtercontenttypes',
																 'content,contenttype,contenttypes,filtercontent,filtercontenttype,type,types',
																 'filterContentTypes');
		commandLineOptions.add(commandLineOption);
		commandLineOption = commandLineOptions.createNumberArray('filterstatuscodes',
																 'code,codes,filtercode,filterstatuscode,httpcode,httpcodes,httpstatus,httpstatuscode,httpstatuscodes,status,statuscodes',
																 'filterStatusCodes');
		commandLineOptions.add(commandLineOption);
		commandLineOption = commandLineOptions.createString('filterpath',
															'filterpaths,path,paths',
															'filterPaths');
		commandLineOptions.add(commandLineOption);
		commandLineOption = commandLineOptions.createString('filterhost',
															'filterhosts',
															'filterHosts');
		commandLineOptions.add(commandLineOption);
		result = commandLineOptions.parse(result);
		return result;
	}
}
// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
    util.Help.print(HTTPSpiderOptions);
    return;
}
module.exports = HTTPSpiderOptions;