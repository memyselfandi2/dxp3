/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-net-http
 *
 * NAME
 * HTTPSpiderArguments
 */
const packageName = 'dxp3-net-http';
const moduleName = 'HTTPSpiderArguments';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
// Check if someone tried to run/execute this file.
const util = require('dxp3-util');
if(process.argv[1].indexOf(canonicalName) >= 0) {
	util.Help.print();
	return;
}
/**
 * @module dxp3-net-http/HTTPSpiderArguments
 */
const logging = require('dxp3-logging');
const HTTPError = require('./HTTPError');
const HTTPSpiderDefaults = require('./HTTPSpiderDefaults');

const logger = logging.getLogger(canonicalName);

class HTTPSpiderArguments extends util.ConstructorArguments {

	constructor() {
		super();
		this.help = false;
		super.addAliases('faq,info,information', 'help');
		this.logLevel = [{regexp:"*",level:HTTPSpiderDefaults.DEFAULT_LOG_LEVEL}];
		super.addAlias('log,logger,logging', 'logLevel');
		this.rateLimit = HTTPSpiderDefaults.DEFAULT_RATE_LIMIT;
		super.addAliases('pause,pausetime,throttle,throttletime,wait,waittime', 'rateLimit');
		this.timeout = HTTPSpiderDefaults.DEFAULT_TIMEOUT;
		super.addAliases('connectiontimeout,httpservertimeout,servertimeout,sockettimeout,spidertimeout', 'timeout');
		this.urls = null;
		super.addAliases('address,crawl,download,queue,spider,url,visit', 'urls');
		this.followExternalLinks = HTTPSpiderDefaults.DEFAULT_FOLLOW_EXTERNAL_LINKS;
		super.addAliases('external,followexternal,followhosts,spiderexternal,spiderhosts,visitexternal,visithosts', 'followExternalLinks');
		this.followInternalLinks = HTTPSpiderDefaults.DEFAULT_FOLLOW_INTERNAL_LINKS;
		super.addAliases('internal,followinternal,spiderinternal,visitinternal', 'followInternalLinks');
		this.followRedirects = HTTPSpiderDefaults.DEFAULT_FOLLOW_REDIRECTS;
		super.addAliases('redirect,redirects,redirection,redirections', 'followInternalLinks');
		this.filterStatusCodes = [];
		this.addAliases('code,codes,filtercode,filterstatuscode', 'filterStatusCodes');
		this.addAliases('httpcode,httpcodes,httpstatus,httpstatuscode,httpstatuscodes,status,statuscode', 'filterStatusCodes');
		this.filterContentTypes = [];
		this.addAliases('content,contenttype,contenttypes,filtercontent,filtercontenttype,type,types', 'filterContentTypes');
		this.filterPath = [];
		this.downloadFolder = null;
		this.addAliases('dir,directory,downloaddir,downloaddirectory','downloadFolder');
		this.addAliases('folder','downloadFolder');
		this.addAliases('folder,root,rootdir,rootdirectory,rootfolder','downloadFolder');
		this.addAliases('source,sourcedir,sourcedirectorysourcefolder','downloadFolder');
		this.followHosts = [{hostName:'.',followPath:'*'}];
		this.addAliases('domains,externalhosts,hosts,hostnames', 'followHosts');
	}

	static parseCommandLineOptions() {
		let result = new HTTPSpiderArguments();
		let commandLineOptions = new util.CommandLineOptions();
		let commandLineOption = commandLineOptions.createFlag('help',
														  'faq,info,information',
														  'help');
		commandLineOptions.add(commandLineOption);
		commandLineOption = commandLineOptions.createBoolean('followredirects',
															'redirect,redirects,redirection,redirections',
															'followRedirects');
		commandLineOptions.add(commandLineOption);
		commandLineOption = commandLineOptions.createObjectArray('followhost',
																 'domain,externalhost,host,hostname',
																 'followHosts');
		commandLineOption.addStringProperty('hostName');
		commandLineOption.addStringProperty('followPath');
		commandLineOptions.add(commandLineOption);
		commandLineOption = commandLineOptions.createNumber('ratelimit',
															'pause,pausetime,throttle,throttletime,wait,waittime',
															'rateLimit');
		commandLineOptions.add(commandLineOption);
		commandLineOption = commandLineOptions.createNumber('timeout',
															'connectiontimeout,httpservertimeout,servertimeout,sockettimeout,spidertimeout',
															'timeout');
		commandLineOptions.add(commandLineOption);
		commandLineOption = commandLineOptions.createString('url',
															'address,crawl,download,queue,spider,visit,webcrawl',
															'urls');
		commandLineOptions.add(commandLineOption);
		commandLineOption = commandLineOptions.createString('downloadfolder',
															'dir,directory,downloaddir,downloaddirectory,folder,root,rootdir,rootdirectory,rootfolder,source,sourcedir,sourcefolder',
															'downloadFolder');
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
															'path',
															'filterPath');
		commandLineOptions.add(commandLineOption);
		commandLineOption = commandLineOptions.createString('filterhosts',
															'',
															'filterHosts');
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

module.exports = HTTPSpiderArguments;