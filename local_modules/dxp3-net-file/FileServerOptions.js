/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-net-file
 *
 * NAME
 * FileServerOptions
 */
const packageName = 'dxp3-net-file';
const moduleName = 'FileServerOptions';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
// Check if someone tried to run/execute this file.
const util = require('dxp3-util');
if(util.Assert.isFileToExecute(canonicalName)) {
	util.Help.print();
	return;
}
/**
 * Use this class to parse the arguments supplied to a FileServer.
 * When certain arguments are omitted an attempt is made to set reasonable defaults.<br/>
 * <ul>
 * <li>address</li>
 * <li>port</li>
 * <li>timeout</li>
 * </ul>
 *
 * @module dxp3-net-file/FileServerOptions
 */
const FileServerDefaults = require('./FileServerDefaults');
const logging = require('dxp3-logging');
const Level = logging.Level;
/**
 * @see module:dxp3-net-file/FileServerDefaults
 */
class FileServerOptions extends util.Options {
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
		this.address = FileServerDefaults.DEFAULT_ADDRESS;
		super.setAlias('host','address');
		this.logLevel = [{regexp:"*",level:FileServerDefaults.DEFAULT_LOG_LEVEL}];
		super.addAlias('log,logger,logging', 'logLevel');
		this.port = FileServerDefaults.DEFAULT_PORT;
		super.setAlias('fileport,fileserverport,serverport,tcpport,tcpserverport', 'port');
		this.timeout = FileServerDefaults.DEFAULT_TIMEOUT;
		super.setAliases('connectiontimeout,filetimeout,fileservertimeout,servertimeout,sockettimeout,tcptimeout,tcpservertimeout', 'timeout');
	}

	static parseCommandLine() {
		let result = new FileServerOptions()
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
															'fileport,fileserverport,listenon,serverport,tcpport,tcpserverport',
															'port');
		commandLineOptions.add(commandLineOption);
		commandLineOption = commandLineOptions.createNumber('timeout',
															'connectiontimeout,filetimeout,fileservertimeout,servertimeout,sockettimeout,tcptimeout,tcpservertimeout',
															'timeout');
		commandLineOptions.add(commandLineOption);
		result = commandLineOptions.parse(result);
		return result;
	}
}

module.exports = FileServerOptions;