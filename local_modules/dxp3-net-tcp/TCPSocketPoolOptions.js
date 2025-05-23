const TCPSocketPoolDefaults = require('./TCPSocketPoolDefaults');
const logging = require('dxp3-logging');
const util = require('dxp3-util');

class TCPSocketPoolOptions extends util.Options {
	constructor() {
		super();
		this.address = null;
		super.addAliases('host,serveraddress,serverhost', 'address');
		this.port = -1;
		this.logLevel = [{regexp:"*",level:TCPSocketPoolDefaults.DEFAULT_LOG_LEVEL}];
		super.addAlias('log,logger,logging', 'logLevel');
		this.maximumNumberOfSockets = TCPSocketPoolDefaults.DEFAULT_MAXIMUM_NUMBER_OF_SOCKETS;
		super.setAliases('max,maximum,maximumsize,maxnumberofsockets,maxsize', 'maximumNumberOfSockets');
		this.minimumNumberOfSockets = TCPSocketPoolDefaults.DEFAULT_MINIMUM_NUMBER_OF_SOCKETS;
		super.setAliases('min,minimum,minimumsize,minnumberofsockets,minsize', 'minimumNumberOfSockets');
		this.timeout = TCPSocketPoolDefaults.DEFAULT_TIMEOUT;
		super.setAliases('connectiontimeout,pooltimeout,socketpooltimeout,sockettimeout,tcptimeout', 'timeout');
	}

	static parseCommandLine() {
		let result = new TCPSocketPoolOptions();
		let commandLineOptions = new util.CommandLineOptions();
		let commandLineOption = commandLineOptions.createFlag('help',
															'faq,info,information',
															'help');
		commandLineOptions.add(commandLineOption);
		commandLineOption = commandLineOptions.createString('address',
															'host,serveraddress,serverhost',
															'address');
		commandLineOptions.add(commandLineOption);
		commandLineOption = commandLineOptions.createNumber('port',
															'serverport',
															'port');
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
															'connectiontimeout,pooltimeout,socketpooltimeout,sockettimeout,tcptimeout',
															'timeout');
		commandLineOptions.add(commandLineOption);
		result = commandLineOptions.parse(result);
		return result;
	}
}

module.exports = TCPSocketPoolOptions;