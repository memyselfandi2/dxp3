/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-microservice
 *
 * NAME
 * RestClientOptions
 */
const packageName = 'dxp3-microservice-rest';
const moduleName = 'RestClientOptions';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
// Check if someone tried to run/execute this file.
const util = require('dxp3-util');
if(util.Assert.isFileToExecute(canonicalName)) {
	util.Help.print();
	return;
}
/**
 * @module dxp3-microservice/RestClientOptions
 */
const logging = require('dxp3-logging');
const microservice = require('dxp3-microservice');
const RestClientDefaults = require('./RestClientDefaults');
/**
 * A RestClientOptions class.
 */
class RestClientOptions extends microservice.MicroServiceOptions {
	/**
	 * Our constructor.
	 */
	constructor() {
		super();
		super.addAliases('clientname,restclientname', 'name');
		this.reconnectWaitTime = RestClientDefaults.DEFAULT_RECONNECT_WAIT_TIME;
		super.addAliases('reconnecttime,reconnectwaittime,waittime', 'reconnectWaitTime');
	}

	static parseCommandLine() {
		let result = new RestClientOptions();
		let commandLineOptions = new util.CommandLineOptions();

		let commandLineOption = commandLineOptions.createFlag('help',
												   		  'faq,info,information',
														  'help');
		commandLineOptions.add(commandLineOption);
		commandLineOption = commandLineOptions.createObjectArray('loglevel',
															'log,logger,logging',
															'logLevel');
		commandLineOption.addStringProperty('regexp');
		commandLineOption.addEnumerationProperty('level', logging.Level);
		commandLineOptions.add(commandLineOption);
		commandLineOption = commandLineOptions.createString('name',
									   						'clientname,microservicename,restclientname,servicename',
															'name');
		commandLineOptions.add(commandLineOption);
		commandLineOption = commandLineOptions.createStringArray('consumes',
																 'consume,connect,connectsto,connectto,consumption,consumptions,subject,subjects',
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

module.exports = RestClientOptions;