/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-microservice-cache
 *
 * NAME
 * CacheServerOptions
 */
const packageName = 'dxp3-microservice-cache';
const moduleName = 'CacheServerOptions';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
// Check if someone tried to run/execute this file.
const util = require('dxp3-util');
if(util.Assert.isFileToExecute(canonicalName)) {
	util.Help.print();
	return;
}
/**
 * @module dxp3-microservice/CacheServerOptions
 */
const CacheServerDefaults = require('./CacheServerDefaults');
const logging = require('dxp3-logging');
const rest = require('dxp3-microservice-rest');

const Level = logging.Level;
/**
 * A CacheServerOptions class.
 */
class CacheServerOptions extends rest.MicroServiceOptions {

	constructor() {
		super();
		this.address = CacheServerDefaults.DEFAULT_ADDRESS;
		super.addAlias('host', 'address');
		// Add additional aliases for the port property.
		super.addAlias('cacheport,cacheserverport,restserverport', 'port');
		// Add additional aliases for the produces property.
		super.addAliases('caches,caching,subject,subjects', 'produces');
		this.timeout = CacheServerDefaults.DEFAULT_TIMEOUT;
		super.addAliases('cachetimeout,connectiontimeout,servertimeout,sockettimeout,restservertimeout', 'timeout');
	}

	static parseCommandLine() {
		let result = new CacheServerOptions();
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
															'cacheport,cachingport,cacheserverport,listenon,serverport,restserverport',
															'port');
		commandLineOptions.add(commandLineOption);
		commandLineOption = commandLineOptions.createObjectArray('loglevel',
															'log,logger,logging',
															'logLevel');
		commandLineOption.addStringProperty('regexp');
		commandLineOption.addEnumerationProperty('level', Level);
		commandLineOptions.add(commandLineOption);
		commandLineOption = commandLineOptions.createString('name',
									   						'cachename,cachingname,servicename,restservername,servername',
															'name');
		commandLineOptions.add(commandLineOption);
		commandLineOption = commandLineOptions.createStringArray('produces',
																 'caches,caching,serves,subject,subjects,production,productions,product,product',
																 'produces');
		commandLineOptions.add(commandLineOption);
		result = commandLineOptions.parse(result);
		return result;
	}
}

module.exports = CacheServerOptions;