/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-management-ui
 *
 * NAME
 * ApplicationOptions
 */
const packageName = 'dxp3-management-ui';
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
 * @module dxp3-management-ui/ApplicationOptions
 */
const ApplicationDefaults = require('./ApplicationDefaults');
const web = require('dxp3-microservice-web');

class ApplicationOptions extends web.WebServerOptions {

	constructor() {
		super(ApplicationDefaults);
		this.cache = ApplicationDefaults.DEFAULT_CACHE;
		super.setAlias('applicationport', 'port');
	}

	static parse(sourceInstance) {
		let result = super.parse(sourceInstance, ApplicationDefaults);
		return result;		
	}

	static parseCommandLine() {
		let webServerOptions = super.parseCommandLine();
		let result = new ApplicationOptions();
		Object.assign(result, webServerOptions);
		let commandLineOptions = new util.CommandLineOptions();
		let commandLineOption = commandLineOptions.createNumber('port',
																'applicationport,listenon,serverport,serviceport,uiport',
																'port');
		commandLineOptions.addOption(commandLineOption);
		commandLineOption = commandLineOptions.createBoolean('cache',
															null,
															'cache');
		commandLineOptions.add(commandLineOption);
		result = commandLineOptions.parse(result);
		return result;
	}
}

module.exports = ApplicationOptions;