/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-delivery-api
 *
 * NAME
 * ApplicationOptions
 */
const packageName = 'dxp3-delivery-api';
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
 * @module dxp3-delivery-api/ApplicationOptions
 */
const ApplicationDefaults = require('./ApplicationDefaults');
const web = require('dxp3-microservice-web');

class ApplicationOptions extends web.WebServerOptions {

	constructor() {
		super();
		this.cache = ApplicationDefaults.DEFAULT_CACHE;
		super.addAliases('caching,hascache,usecache', 'cache');
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
																'apiport,applicationport',
																'port');
		commandLineOptions.addOption(commandLineOption);
		commandLineOption = commandLineOptions.createBoolean('cache',
															 'caching,hascache,usecache',
															 'cache');
		commandLineOptions.add(commandLineOption);
		result = commandLineOptions.parse(result);
		return result;
	}
}

module.exports = ApplicationOptions;