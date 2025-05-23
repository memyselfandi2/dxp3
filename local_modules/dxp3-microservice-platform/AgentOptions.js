/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-microservice-platform
 *
 * NAME
 * AgentOptions
 */
const packageName = 'dxp3-microservice-platform';
const moduleName = 'AgentOptions';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * @module dxp3-microservice-platform/AgentOptions
 */
const logging = require('dxp3-logging');
const os = require('os');
const util = require('dxp3-util');

class AgentOptions extends util.Options {

	constructor() {
		super();
		this.name = os.hostname();
		console.log('NAAMEE:' + this.name);
	}

	static parseCommandLine() {
		let result = new AgentOptions();
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

		// -name
		commandLineOption = commandLineOptions.createString('name',
														    'agent,agentname,host,hostname',
														    'name');
		commandLineOptions.add(commandLineOption);

		result = commandLineOptions.parse(result);
		return result;
	}
}
// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
	util.Help.print(AgentOptions);
	return;
}
module.exports = AgentOptions;