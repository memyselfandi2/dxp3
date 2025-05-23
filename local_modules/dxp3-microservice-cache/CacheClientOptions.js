/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-microservice-cache
 *
 * NAME
 * CacheClientOptions
 */
const packageName = 'dxp3-microservice-cache';
const moduleName = 'CacheClientOptions';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
// Check if someone tried to run/execute this file.
const util = require('dxp3-util');
if(util.Assert.isFileToExecute(canonicalName)) {
	util.Help.print();
	return;
}
/**
 * @module dxp3-microservice/CacheClientOptions
 */
const CacheClientDefaults = require('./CacheClientDefaults');
const logging = require('dxp3-logging');
const rest = require('dxp3-microservice-rest');

const Level = logging.Level;
/**
 * A CacheClientOptions class.
 */
class CacheClientOptions extends rest.MicroServiceOptions {
	/**
	 * Our constructor.
	 */
	constructor() {
		super();
		super.addAliases('cachename,cachingname,clientname,restclientname', 'name');
		this.reconnectWaitTime = CacheClientDefaults.DEFAULT_RECONNECT_WAIT_TIME
		super.addAliases('reconnecttime,reconnectwaittime,waittime', 'reconnectWaitTime');
	}

	static parseCommandLine() {
		let result = new CacheClientOptions();
		let commandLineOptions = new util.CommandLineOptions();

		let commandLineOption = commandLineOptions.createFlag('help',
												   		  'faq,info,information',
														  'help');
		commandLineOptions.add(commandLineOption);
		commandLineOption = commandLineOptions.createObjectArray('loglevel',
															'log,logger,logging',
															'logLevel');
		commandLineOption.addStringProperty('regexp');
		commandLineOption.addEnumerationProperty('level', Level);
		commandLineOptions.add(commandLineOption);
		commandLineOption = commandLineOptions.createString('name',
									   						'cachename,cacheclientname,cachingname,clientname,microservicename,restclientname,servicename',
															'name');
		commandLineOptions.add(commandLineOption);
		commandLineOption = commandLineOptions.createStringArray('consumes',
																 'caches,caching,connect,connectsto,connectto,consumption,consumptions,subject,subjects',
																 'consumes');
		commandLineOptions.add(commandLineOption);
		commandLineOption = commandLineOptions.createNumber('reconnectwaittime',
															'reconnecttime,reconnectwait,waittime',
															'reconnectWaitTime');
		commandLineOptions.add(commandLineOption);
		result = commandLineOptions.parse(result);
		return result;
	}
}

module.exports = CacheClientOptions;