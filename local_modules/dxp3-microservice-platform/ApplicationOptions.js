/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-microservice-platform
 *
 * NAME
 * ApplicationOptions
 */
const packageName = 'dxp3-microservice-platform';
const moduleName = 'ApplicationOptions';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * @module dxp3-microservice-platform/ApplicationOptions
 */
const ApplicationDefaults = require('./ApplicationDefaults');
const logging = require('dxp3-logging');
const util = require('dxp3-util');

class ApplicationOptions extends util.Options {

	constructor() {
		super();
		this.environment = process.env.NODE_ENV || ApplicationDefaults.DEFAULT_ENVIRONMENT;
		super.addAliases('env,context,ctx', 'environment');
		this.help = false;
		super.addAliases('faq,info,information', 'help');
		this.logLevel = [{regexp:"*",level:ApplicationDefaults.DEFAULT_LOG_LEVEL}];
		super.addAlias('log,logger,logging', 'logLevel');
		this.folder = ApplicationDefaults.DEFAULT_FOLDER;
		this.addAliases('dir,directory','folder');
		this.addAliases('root,rootdir,rootdirectory,rootfolder','folder');
		this.addAliases('source,sourcedir,sourcedirectory,sourcefolder','folder');
	}

	static parseCommandLine() {
		let result = new ApplicationOptions();
		let commandLineOptions = new util.CommandLineOptions();
		// HELP
		let commandLineOption = commandLineOptions.createFlag('help',
															'faq,info,information',
															'help');
		commandLineOptions.add(commandLineOption);
		// LOG LEVEL
		commandLineOption = commandLineOptions.createObjectArray('loglevel',
															'log,logger,logging',
															'logLevel');
		commandLineOption.addStringProperty('regexp');
		commandLineOption.addEnumerationProperty('level', logging.Level);
		commandLineOptions.add(commandLineOption);
		// ENVIRONMENT
		commandLineOption = commandLineOptions.createString('environment',
															'env,context,ctx',
															'environment');
		commandLineOptions.add(commandLineOption);
		// FOLDER
		commandLineOption = commandLineOptions.createString('folder',
															'dir,directory,folder,root,rootdir,rootdirectory,rootfolder,source,sourcedir,sourcefolder',
															'folder');
		commandLineOptions.add(commandLineOption);		

		result = commandLineOptions.parse(result);
		return result;
	}
}
// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
	util.Help.print(ApplicationOptions);
	return;
}
module.exports = ApplicationOptions;