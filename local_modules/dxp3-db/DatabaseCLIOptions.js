/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-db
 *
 * NAME
 * DatabaseCLIOptions
 */
const packageName = 'dxp3-db';
const moduleName = 'DatabaseCLIOptions';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * @module dxp3-db/DatabaseCLIOptions
 */
const DatabaseDefaults = require('./DatabaseDefaults');
const logging = require('dxp3-logging');
const util = require('dxp3-util');

const logger = logging.getLogger(canonicalName);

class DatabaseCLIOptions extends util.Options {

	constructor() {
		super();
		this.help = false;
		super.addAliases('faq,info,information', 'help');
		this.logLevel = [{regexp:"*",level:DatabaseDefaults.DEFAULT_LOG_LEVEL}];
		super.addAlias('log,logger,logging', 'logLevel');
		this.sourceFolder = null;
		super.setAliases('dir,directory,folder,root,source', 'sourceFolder');
	}

	static parseCommandLine() {
		let result = new DatabaseCLIOptions();
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
		commandLineOption = commandLineOptions.createString('sourcefolder',
															'dir,directory,folder,root,source',
															'sourceFolder');
		commandLineOptions.add(commandLineOption);
		result = commandLineOptions.parse(result);
		return result;
	}
}
// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
   util.Help.print(DatabaseCLIOptions);
   return;
}
module.exports = DatabaseCLIOptions;