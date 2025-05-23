/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-delivery-dao
 *
 * NAME
 * DAOOptions
 */
const packageName = 'dxp3-delivery-dao';
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
/**
 * @property {Boolean} help
 * @property {String} logLevel One of all, trace, debug, info, warn, error, fatal, mark, off.
 * @property {String} implementation
 */
class DAOOptions extends util.Options {
	/**
	 * @constructor
	 */
	constructor() {
		super();
		this.help = false;
		super.addAliases('faq,info,information', 'help');
		this.implementation = DAODefaults.DEFAULT_IMPLEMENTATION;
		this.logLevel = [];
		super.addAlias('log,logger,logging', 'logLevel');
		this.timeout = DAODefaults.DEFAULT_TIMEOUT;
		super.addAliases('connectiontimeout,daotimeout,servertimeout,sockettimeout,restservertimeout', 'timeout');
		this.daoImplOptions = null;
		super.addAliases('args,arguments', 'daoImplOptions');
		super.addAliases('options,daoOptions,daoImplementationOptions', 'daoImplOptions');
		super.addAliases('daoArgs,daoArguments,daoImplementationArgs,daoImplementationArguments', 'daoImplOptions');
		super.addAliases('implOptions,implementationOptions','daoImplOptions');
		super.addAliases('implArgs,implArguments,implementationArgs,implementationArguments','daoImplOptions');
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
	    }
		return result;
	}
}

module.exports = DAOOptions;