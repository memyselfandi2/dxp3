/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-gateway
 *
 * NAME
 * ApplicationOptions
 */
const packageName = 'dxp3-gateway';
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
 * @module dxp3-gateway/ApplicationOptions
 */
const web = require('dxp3-microservice-web');

class ApplicationOptions extends web.WebGatewayOptions {

	constructor() {
		super();
		super.setAliases('applicationport', 'port');
	}

	static parseCommandLine() {
		let result = super.parseCommandLine();
		let commandLineOptions = new util.CommandLineOptions();
		let commandLineOption = commandLineOptions.createNumber('port',
																'applicationport,gatewayport,listenon,serverport,serviceport',
																'port');
		commandLineOptions.addOption(commandLineOption);
		result = commandLineOptions.parse(result);		
		return result;
	}
}

module.exports = ApplicationOptions;