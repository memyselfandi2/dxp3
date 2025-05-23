/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-microservice-web-crawler
 *
 * NAME
 * WebCrawlerOptions
 */
const packageName = 'dxp3-microservice-web-crawler';
const moduleName = 'WebCrawlerOptions';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
// Check if someone tried to run/execute this file.
const util = require('dxp3-util');
if(util.Assert.isFileToExecute(canonicalName)) {
	util.Help.print();
	return;
}
/**
 * @module dxp3-microservice-web-crawler/WebCrawlerOptions
 */
const logging = require('dxp3-logging');
const Level = logging.Level;
const rest = require('dxp3-microservice-rest');
const WebCrawlerDefaults = require('./WebCrawlerDefaults');
/**
 * A WebCrawlerOptions class.
 */
class WebCrawlerOptions extends rest.MicroServiceOptions {
	/**
	 * Our constructor.
	 */
	constructor() {
		super();
		this.address = WebCrawlerDefaults.DEFAULT_ADDRESS;
		super.addAlias('host', 'address');
		this.port = WebCrawlerDefaults.DEFAULT_PORT;
		// Add additional aliases for the port property.
		super.addAlias('webcrawlerport,webcrawlerserverport,restserverport', 'port');
		// Add additional aliases for the produces property.
		super.addAliases('crawls,serves,spiders,subject,subjects,visits,webcrawls,webcrawlers', 'produces');
		this.timeout = WebCrawlerDefaults.DEFAULT_TIMEOUT;
		super.addAliases('webcrawlertimeout,connectiontimeout,servertimeout,sockettimeout,restservertimeout', 'timeout');
	}

	static parseCommandLine() {
		let result = new WebCrawlerOptions();
		let commandLineOptions = new util.CommandLineOptions();

		let commandLineOption = commandLineOptions.createFlag('help',
												   		  'faq,info,information',
														  'help');
		commandLineOptions.add(commandLineOption);
		commandLineOption = commandLineOptions.createString('address',
															'host',
															'address');
		commandLineOptions.add(commandLineOption);
		commandLineOption = commandLineOptions.createNumber('timeout',
															'connectiontimeout,resttimeout,restservertimeout,sockettimeout',
															'timeout');
		commandLineOptions.add(commandLineOption);
		commandLineOption = commandLineOptions.createNumber('port',
															'webcrawlerport,cachingport,webcrawlerserverport,listenon,serverport,restserverport',
															'port');
		commandLineOptions.add(commandLineOption);
		commandLineOption = commandLineOptions.createObjectArray('loglevel',
															'log,logger,logging',
															'logLevel');
		commandLineOption.addStringProperty('regexp');
		commandLineOption.addEnumerationProperty('level', Level);
		commandLineOptions.add(commandLineOption);
		commandLineOption = commandLineOptions.createString('name',
									   						'webcrawlername,servicename,restservername,servername',
															'name');
		commandLineOptions.add(commandLineOption);
		commandLineOption = commandLineOptions.createStringArray('produces',
																 'crawls,production,productions,product,product,serves,spiders,subject,subjects,visits,webcrawlers',
																 'produces');
		commandLineOptions.add(commandLineOption);
		result = commandLineOptions.parse(result);
		return result;
	}
}

module.exports = WebCrawlerOptions;