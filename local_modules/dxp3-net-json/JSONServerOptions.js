/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-net-json
 *
 * NAME
 * JSONServerOptions
 */
const packageName = 'dxp3-net-json';
const moduleName = 'JSONServerOptions';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
// Check if someone tried to run/execute this file.
const util = require('dxp3-util');
if(util.Assert.isFileToExecute(canonicalName)) {
	util.Help.print();
	return;
}
/**
 * Use this class to parse the arguments supplied to a JSONServer.
 * When certain arguments are omitted an attempt is made to set reasonable defaults.<br/>
 * <ul>
 * <li>address</li>
 * <li>port</li>
 * <li>timeout</li>
 * </ul>
 *
 * @module dxp3-net-json/JSONServerOptions
 */
const JSONServerDefaults = require('./JSONServerDefaults');
const logging = require('dxp3-logging');
const Level = logging.Level;
/**
 * @see module:dxp3-net-json/JSONServerDefaults
 */
class JSONServerOptions extends util.Options {
	/**
	 * @property {String} address
	 * The address we are listening on (default: 0.0.0.0).
	 *
	 * @property {String|module:dxp3-logging/Level} logLevel
	 *
	 * @property {Number|String} port
	 * The port we are listening on.
	 *
	 * @property {Number|String} timeout
	 */
	constructor() {
		super();
		this.address = JSONServerDefaults.DEFAULT_ADDRESS;
		super.setAlias('host','address');
		this.logLevel = [{regexp:"*",level:JSONServerDefaults.DEFAULT_LOG_LEVEL}];
		super.addAlias('log,logger,logging', 'logLevel');
		this.port = JSONServerDefaults.DEFAULT_PORT;
		super.setAlias('jsonport,jsonserverport,serverport,tcpport,tcpserverport', 'port');
		this.timeout = JSONServerDefaults.DEFAULT_TIMEOUT;
		super.setAliases('connectiontimeout,jsontimeout,jsonservertimeout,servertimeout,sockettimeout,tcptimeout,tcpservertimeout', 'timeout');
	}

	static parseCommandLine() {
		let result = new JSONServerOptions()
		let commandLineOptions = new util.CommandLineOptions();
		let commandLineOption = commandLineOptions.createString('address',
															    'host',
															    'address');
		commandLineOptions.add(commandLineOption);
		commandLineOption = commandLineOptions.createFlag('help',
														  'faq,info,information',
														  'help');
		commandLineOptions.add(commandLineOption);
		commandLineOption = commandLineOptions.createObjectArray('loglevel',
															     'log,logger,logging',
															     'logLevel');
		commandLineOption.addStringProperty('regexp');
		commandLineOption.addEnumerationProperty('level', Level);
		commandLineOptions.add(commandLineOption);
		commandLineOption = commandLineOptions.createNumber('port',
															'jsonport,jsonserverport,listenon,serverport,tcpport,tcpserverport',
															'port');
		commandLineOptions.add(commandLineOption);
		commandLineOption = commandLineOptions.createNumber('timeout',
															'connectiontimeout,jsontimeout,jsonservertimeout,servertimeout,sockettimeout,tcptimeout,tcpservertimeout',
															'timeout');
		commandLineOptions.add(commandLineOption);
		result = commandLineOptions.parse(result);
		return result;
	}
}

module.exports = JSONServerOptions;