/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-management-compiler
 *
 * NAME
 * ApplicationOptions
 */
const packageName = 'dxp3-management-compiler';
const moduleName = 'ApplicationOptions';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
// Check if someone tried to run/execute this file.
const util = require('dxp3-util');
if(util.Assert.isFileToExecute(canonicalName)) {
	util.Help.print();
	return;
}
const ApplicationDefaults = require('./ApplicationDefaults');
const logging = require('dxp3-logging');
/**
 * @property {Boolean} help
 * @property {String} logLevel One of all, trace, debug, info, warn, error, fatal, mark, off.
 * @property {String} implementation
 */
class ApplicationOptions extends util.Options {
	/**
	 * @constructor
	 */
	constructor() {
		super();
		this.help = false;
		super.addAliases('faq,info,information', 'help');
		this.implementation = ApplicationDefaults.DEFAULT_IMPLEMENTATION;
		this.logLevel = [];
		super.addAlias('log,logger,logging', 'logLevel');
		this.timeout = ApplicationDefaults.DEFAULT_TIMEOUT;
		super.addAliases('connectiontimeout,compilertimeout,servertimeout,sockettimeout,restservertimeout', 'timeout');
		this.compilerImplOptions = null;
		super.addAliases('args,arguments', 'compilerImplOptions');
		super.addAliases('options,compilerOptions,compilerImplementationOptions', 'compilerImplOptions');
		super.addAliases('compilerArgs,compilerArguments,compilerImplementationArgs,compilerImplementationArguments', 'compilerImplOptions');
		super.addAliases('implOptions,implementationOptions', 'compilerImplOptions');
		super.addAliases('implArgs,implArguments,implementationArgs,implementationArguments','compilerImplOptions');
	}

	static parseCommandLine() {
		let result = new ApplicationOptions();
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
															'connectiontimeout,compilertimeout,resttimeout,restservertimeout,sockettimeout',
															'timeout');
		commandLineOptions.add(commandLineOption);
		result = commandLineOptions.parse(result);
		let implementation = result.implementation;
		try {
	        let CompilerImplOptions = require('./' + result.implementation + '/CompilerImplOptions');
	        result.compilerImplOptions = CompilerImplOptions.parseCommandLine();
	    } catch(exception) {
	    }
		return result;
	}
}

module.exports = ApplicationOptions;