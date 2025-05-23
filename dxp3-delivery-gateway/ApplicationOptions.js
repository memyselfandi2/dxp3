/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-delivery-gateway
 *
 * NAME
 * ApplicationOptions
 */
const packageName = 'dxp3-delivery-gateway';
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
 * @module dxp3-delivery-gateway/ApplicationOptions
 */
const web = require('dxp3-microservice-web');
/**
 * @property {String} logLevel One of all, trace, debug, info, warn, error, fatal, mark, off.
 * @property {String} protocol One of http or https.
 * @property {Number} port
 */
class ApplicationOptions extends web.WebGatewayOptions {

	constructor() {
		super();
		super.setAliases('applicationport', 'port');
	}

	static parseCommandLine() {
		let result = super.parseCommandLine();
		let commandLineOptions = new util.CommandLineOptions();
		let commandLineOption = commandLineOptions.createNumber('port',
																'applicationport,gatewayport,listenon,serverport',
																'port');
		commandLineOptions.addOption(commandLineOption);
		result = commandLineOptions.parse(result);		
		return result;
	}
}

module.exports = ApplicationOptions;