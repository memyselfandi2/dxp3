/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-net-tcp
 *
 * NAME
 * TCPServerOptions
 */
const packageName = 'dxp3-net-tcp';
const moduleName = 'TCPServerOptions';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
// Check if someone tried to run/execute this file.
const util = require('dxp3-util');
if(util.Assert.isFileToExecute(canonicalName)) {
    util.Help.print();
    return;
}
/**
 * Use this class to parse the arguments supplied to an TCPServer.
 * When certain arguments are omitted an attempt is made to set reasonable defaults.<br/>
 * <ul>
 * <li>address</li>
 * <li>port</li>
 * <li>timeout</li>
 * </ul>
 *
 * @module dxp3-net-tcp/TCPServerOptions
 */
const logging = require('dxp3-logging');
const TCPServerDefaults = require('./TCPServerDefaults');
/**
 * @see module:dxp3-net-tcp/TCPServerDefaults
 */
class TCPServerOptions extends util.Options {
	/**
	 * @property {String} address
	 * The address we are listening on (default: 0.0.0.0).
	 *
	 * @property {Number|String} port
	 * The port we are listening on.
	 *
	 * @property {Number|String} timeout
	 *
	 * @property {String|module:dxp3-logging/Level} logLevel
	 */
	constructor() {
		super();
		this.address = TCPServerDefaults.DEFAULT_ADDRESS;
		super.setAlias('host','address');
		this.port = TCPServerDefaults.DEFAULT_PORT;
		super.setAlias('serverport,tcpport,tcpserverport', 'port');
		this.timeout = TCPServerDefaults.DEFAULT_TIMEOUT;
		super.setAliases('servertimeout,sockettimeout,tcptimeout,tcpservertimeout', 'timeout');
		this.logLevel = [{regexp:"*",level:TCPServerDefaults.DEFAULT_LOG_LEVEL}];
		super.addAlias('log,logger,logging', 'logLevel');
		this.uploadDir = null;
		super.addAlias('dir,directory', 'uploadDir');
		super.addAlias('folder', 'uploadDir');
		super.addAlias('tempdir,tempdirectory,tempfolder', 'uploadDir');
		super.addAlias('tmpdir,tmpdirectory,tmpfolder', 'uploadDir');
		super.addAlias('uploaddirectory', 'uploadDir');
		super.addAlias('uploadfolder', 'uploadDir');
	}

	static parseCommandLine() {
		let result = new TCPServerOptions()
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
		commandLineOption = commandLineOptions.createString('address',
															'host',
															'address');
		commandLineOptions.add(commandLineOption);
		commandLineOption = commandLineOptions.createNumber('port',
															'listenon,serverport,tcpport,tcpserverport',
															'port');
		commandLineOptions.add(commandLineOption);
		commandLineOption = commandLineOptions.createNumber('timeout',
															'servertimeout,sockettimeout,tcptimeout,tcpservertimeout',
															'timeout');
		commandLineOptions.add(commandLineOption);
		commandLineOption = commandLineOptions.createString('uploaddir',
															'dir,directory,folder,tempdir,tempdirectory,tempfolder,tmpdir,tmpdirectory,tmpfolder,upload,uploaddirectory,uploadfolder',
															'uploadDir');
		commandLineOptions.add(commandLineOption);
		result = commandLineOptions.parse(result);
		return result;
	}
}

module.exports = TCPServerOptions;