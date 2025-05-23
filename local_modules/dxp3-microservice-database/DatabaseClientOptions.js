/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-microservice-database
 *
 * NAME
 * DatabaseClientOptions
 */
const packageName = 'dxp3-microservice-database';
const moduleName = 'DatabaseClientOptions';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
// Check if someone tried to run/execute this file.
const util = require('dxp3-util');
if(util.Assert.isFileToExecute(canonicalName)) {
	util.Help.print();
	return;
}
/**
 * @module dxp3-microservice-database/DatabaseClientOptions
 */
const logging = require('dxp3-logging');
const Level = logging.Level;
const rest = require('dxp3-microservice-rest');
const DatabaseClientDefaults = require('./DatabaseClientDefaults');

class DatabaseClientOptions extends rest.MicroServiceOptions {

	constructor() {
		super();
		super.addAliases('clientname,databasename,databaseclientname,restclientname', 'name');
		this.reconnectWaitTime = DatabaseClientDefaults.DEFAULT_RECONNECT_WAIT_TIME;
		super.addAliases('reconnecttime,reconnectwaittime,waittime', 'reconnectWaitTime');
	}

	static parseCommandLine() {
		let result = new DatabaseClientOptions();
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
									   						'clientname,databasename,databaseclientname,microservicename,restclientname,servicename',
															'name');
		commandLineOptions.add(commandLineOption);
		commandLineOption = commandLineOptions.createStringArray('consumes',
																 'connect,connectto,connectsto,connectwith,connectswith,consumption,consumptions,db,database,subject,subjects',
																 'consumes');
		commandLineOptions.add(commandLineOption);
		commandLineOption = commandLineOptions.createNumber('reconnectwaittime',
															'reconnectafter,reconnecttime,reconnectwait,waittime',
															'reconnectWaitTime');
		commandLineOptions.add(commandLineOption);
		result = commandLineOptions.parse(result);
		return result;
	}
}

module.exports = DatabaseClientOptions;