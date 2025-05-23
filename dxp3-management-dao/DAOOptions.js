/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-management-dao
 *
 * NAME
 * DAOOptions
 */
const packageName = 'dxp3-management-dao';
const moduleName = 'DAOOptions';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
// Check if someone tried to run/execute this file.
const util = require('dxp3-util');
if(util.Assert.isFileToExecute(canonicalName)) {
	util.Help.print();
	return;
}
const DAODefaults = require('./DAODefaults');
const logging = require('dxp3-logging');
const rest = require('dxp3-microservice-rest');

const logger = logging.getLogger(canonicalName);

class DAOOptions extends rest.RestServerOptions {

	constructor() {
		super();
		this.implementation = DAODefaults.DEFAULT_IMPLEMENTATION;
		super.addAlias('impl', 'implementation');
		super.addAliases('daotimeout', 'timeout');
		this.daoImplOptions = null;
		super.addAliases('args,arguments', 'daoImplOptions');
		super.addAliases('options,daoOptions,daoImplementationOptions', 'daoImplOptions');
		super.addAliases('daoArgs,daoArguments,daoImplementationArgs,daoImplementationArguments', 'daoImplOptions');
		super.addAliases('implArgs,implArguments,implementationArgs,implementationArguments','daoImplOptions');
		super.addAliases('implOptions,implementationOptions', 'daoImplOptions');
	}

	static parseCommandLine() {
		let result = new DAOOptions();
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
		commandLineOption = commandLineOptions.createString('implementation',
															'impl',
															'implementation');
		commandLineOptions.add(commandLineOption);
		commandLineOption = commandLineOptions.createNumber('port',
															'listenon,serverport,restserverport',
															'port');
		commandLineOptions.add(commandLineOption);
		commandLineOption = commandLineOptions.createNumber('timeout',
															'connectiontimeout,daotimeout,resttimeout,restservertimeout,sockettimeout',
															'timeout');
		commandLineOptions.add(commandLineOption);
		result = commandLineOptions.parse(result);
		let implementation = result.implementation;
		try {
	        let DAOImplOptions = require('./' + result.implementation + '/DAOImplOptions');
	        result.daoImplOptions = DAOImplOptions.parseCommandLine();
	    } catch(exception) {
	    	if(exception.code === 'MODULE_NOT_FOUND') {
		    	// This may or may not be a problem.
		    	// Not every DAO implementation requires specific arguments.
		    } else {
		    }
	    }
		return result;
	}
}

module.exports = DAOOptions;