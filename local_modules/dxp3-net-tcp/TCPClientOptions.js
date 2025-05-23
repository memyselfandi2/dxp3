/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-net-tcp
 *
 * NAME
 * TCPClientOptions
 */
const packageName = 'dxp3-net-tcp';
const moduleName = 'TCPClientOptions';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
// Check if someone tried to run/execute this file.
const util = require('dxp3-util');
if(util.Assert.isFileToExecute(canonicalName)) {
    util.Help.print();
    return;
}
/**
 * Use this class to parse the arguments supplied to a TCPClient.
 * When certain arguments are omitted an attempt is made to set reasonable defaults.<br/>
 *
 * @module dxp3-net-tcp/TCPClientOptions
 */
const logging = require('dxp3-logging');
const TCPClientDefaults = require('./TCPClientDefaults');
/**
 * @see module:dxp3-net-tcp/TCPClientDefaults
 */
class TCPClientOptions extends util.Options {
	/**
	 * @property {String} address
	 * The server address to connect to.
	 *
	 * @property {String|module:dxp3-logging/Level} logLevel
	 *
	 * @property {Number|String} port
	 * The server port to connect to.
	 *
	 * @property {Number|String} timeout
	 *
	 */
	constructor() {
		super();
		this.logLevel = [{regexp:"*",level:TCPClientDefaults.DEFAULT_LOG_LEVEL}];
		super.addAlias('log,logger,logging', 'logLevel');
		this.maximumNumberOfSockets = TCPClientDefaults.DEFAULT_MAXIMUM_NUMBER_OF_SOCKETS;
		super.setAliases('max,maximum,maximumsize,maxnumberofsockets,maxsize', 'maximumNumberOfSockets');
		this.minimumNumberOfSockets = TCPClientDefaults.DEFAULT_MINIMUM_NUMBER_OF_SOCKETS;
		super.setAliases('min,minimum,minimumsize,minnumberofsockets,minsize', 'minimumNumberOfSockets');
		this.timeout = TCPClientDefaults.DEFAULT_TIMEOUT;
		super.setAliases('clienttimeout,sockettimeout,tcpclienttimeout,tcptimeout', 'timeout');
	}

	static parseCommandLine() {
		let result = new TCPClientOptions()
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
		commandLineOption = commandLineOptions.createNumber('minimumnumberofsockets',
															'min,minimum,minimumsize,minnumberofsockets,minsize,',
															'minimumNumberOfSockets');
		commandLineOptions.add(commandLineOption);
		commandLineOption = commandLineOptions.createNumber('maximumnumberofsockets',
															'max,maximum,maximumsize,maxnumberofsockets,maxsize',
															'maximumNumberOfSockets');
		commandLineOptions.add(commandLineOption);
		commandLineOption = commandLineOptions.createNumber('timeout',
															'clienttimeout,sockettimeout,tcpclienttimeout,tcptimeout',
															'timeout');
		commandLineOptions.add(commandLineOption);
		result = commandLineOptions.parse(result);
		return result;
	}
}

module.exports = TCPClientOptions;