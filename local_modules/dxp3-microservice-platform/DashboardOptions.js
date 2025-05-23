/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-microservice-platform
 *
 * NAME
 * DashboardOptions
 */
const packageName = 'dxp3-microservice-platform';
const moduleName = 'DashboardOptions';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * @module dxp3-microservice-platform/DashboardOptions
 */
const logging = require('dxp3-logging');
const util = require('dxp3-util');

class DashboardOptions extends util.Options {

	constructor() {
		super();
	}

	static parseCommandLine() {
		let result = new DashboardOptions();
		let commandLineOptions = new util.CommandLineOptions();

		// -help
		let commandLineOption = commandLineOptions.createFlag('help',
															  'faq,info,information',
															  'help');
		commandLineOptions.add(commandLineOption);

		// -loglevel
		commandLineOption = commandLineOptions.createObjectArray('loglevel',
																 'log,logger,logging',
																 'logLevel');
		commandLineOption.addStringProperty('regexp');
		commandLineOption.addEnumerationProperty('level', logging.Level);
		commandLineOptions.add(commandLineOption);

		result = commandLineOptions.parse(result);
		return result;
	}
}
// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
	util.Help.print(DashboardOptions);
	return;
}
module.exports = DashboardOptions;