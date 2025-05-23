/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-management-security
 *
 * NAME
 * ApplicationOptions
 */
const packageName = 'dxp3-management-security';
const moduleName = 'ApplicationOptions';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
// Check if someone tried to run/execute this file.
const util = require('dxp3-util');
if(util.Assert.isFileToExecute(canonicalName)) {
	util.Help.print();
	return;
}
/**
 * @module dxp3-management-security/ApplicationOptions
 */
const ApplicationDefaults = require('./ApplicationDefaults');
const logging = require('dxp3-logging');

class ApplicationOptions extends util.Options {

	constructor() {
		super();
		this.help = false;
		super.addAliases('faq,info,information', 'help');
		this.implementation = ApplicationDefaults.DEFAULT_IMPLEMENTATION;
		this.logLevel = [{regexp:"*",level:ApplicationDefaults.DEFAULT_LOG_LEVEL}];
		super.addAlias('log,logger,logging', 'logLevel');
		this.securityImplOptions = null;
		super.addAliases('args,arguments', 'securityImplOptions');
		super.addAliases('options,securityOptions,securityImplementationOptions', 'securityImplOptions');
		super.addAliases('securityArgs,securityArguments,securityImplementationArgs,securityImplementationArguments', 'securityImplOptions');
		super.addAliases('implOptions,implementationOptions', 'securityImplOptions');
		super.addAliases('implArgs,implArguments,implementationArgs,implementationArguments','securityImplOptions');
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
		result = commandLineOptions.parse(result);
		let implementation = result.implementation;
		try {
	        let SecurityImplOptions = require('./' + result.implementation + '/SecurityImplOptions');
	        result.securityImplOptions = SecurityImplOptions.parseCommandLine();
	    } catch(exception) {
	    	if(exception.code === 'MODULE_NOT_FOUND') {
		    	// This may or may not be a problem.
		    	// Not every security implementation requires specific arguments.
		    } else {
		    }
	    }
		return result;
	}
}

module.exports = ApplicationOptions;