/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-microservice
 *
 * NAME
 * RestServerOptions
 */
const packageName = 'dxp3-microservice-rest';
const moduleName = 'RestServerOptions';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
// Check if someone tried to run/execute this file.
const util = require('dxp3-util');
if(util.Assert.isFileToExecute(canonicalName)) {
	util.Help.print();
	return;
}
/**
 * @module dxp3-microservice/RestServerOptions
 */
const logging = require('dxp3-logging');
const microservice = require('dxp3-microservice');
const RestServerDefaults = require('./RestServerDefaults');
/**
 * A RestServerOptions class.
 */
class RestServerOptions extends microservice.MicroServiceOptions {
	/**
	 * Our constructor.
	 */
	constructor() {
		super();
		this.address = RestServerDefaults.DEFAULT_ADDRESS;
		super.addAlias('host', 'address');
		// Add an additional alias for the port property: restserverport.
		super.addAlias('restserverport', 'port');
		// Add an additional alias for the produces property: subject(s).
		super.addAliases('subject,subjects', 'produces');
		this.timeout = RestServerDefaults.DEFAULT_TIMEOUT;
		super.addAliases('connectiontimeout,servertimeout,sockettimeout,restservertimeout', 'timeout');
	}

	static parseCommandLine() {
		let result = new RestServerOptions();
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
															'listenon,serverport,restserverport',
															'port');
		commandLineOptions.add(commandLineOption);
		commandLineOption = commandLineOptions.createObjectArray('loglevel',
															'log,logger,logging',
															'logLevel');
		commandLineOption.addStringProperty('regexp');
		commandLineOption.addEnumerationProperty('level', logging.Level);
		commandLineOptions.add(commandLineOption);
		commandLineOption = commandLineOptions.createString('name',
									   						'restservername,restservicename,servername',
															'name');
		commandLineOptions.add(commandLineOption);
		commandLineOption = commandLineOptions.createStringArray('produces',
																 'serves,subject,subjects,production,productions,product,product',
																 'produces');
		commandLineOptions.add(commandLineOption);
		result = commandLineOptions.parse(result);
		return result;
	}
}

module.exports = RestServerOptions;