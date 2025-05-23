const FileClientDefaults = require('./FileClientDefaults');
const logging = require('dxp3-logging');
const Level = logging.Level;
const util = require('dxp3-util');

class FileClientOptions extends util.Options {
	constructor() {
		super();
		this.logLevel = [{regexp:"*",level:FileClientDefaults.DEFAULT_LOG_LEVEL}];
		super.addAlias('log,logger,logging', 'logLevel');
		this.minimumNumberOfSockets = FileClientDefaults.DEFAULT_MINIMUM_NUMBER_OF_SOCKETS;
		super.setAliases('min,minimum,minimumsize,minnumberofsockets,minsize', 'minimumNumberOfSockets');
		this.maximumNumberOfSockets = FileClientDefaults.DEFAULT_MAXIMUM_NUMBER_OF_SOCKETS;
		super.setAliases('max,maximum,maximumsize,maxnumberofsockets,maxsize', 'maximumNumberOfSockets');
		this.timeout = FileClientDefaults.DEFAULT_TIMEOUT;
		super.setAliases('clienttimeout,connectiontimeout,fileclienttimeout,filetimeout,sockettimeout,tcpclienttimeout,tcptimeout', 'timeout');
	}

	static parseCommandLine() {
		let result = new FileClientOptions();
		let commandLineOptions = new util.CommandLineOptions();
		let commandLineOption = commandLineOptions.createFlag('help',
															'faq,info,information',
															'help');
		commandLineOptions.add(commandLineOption);
		commandLineOption = commandLineOptions.createObjectArray('loglevel',
															'log,logger,logging',
															'logLevel');
		commandLineOption.addStringProperty('regexp');
		commandLineOption.addEnumerationProperty('level', Level);
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
															'clienttimeout,connectiontimeout,fileclienttimeout,filetimeout,sockettimeout,tcpclienttimeout,tcptimeout',
															'timeout');
		commandLineOptions.add(commandLineOption);
		result = commandLineOptions.parse(result);
		return result;
	}
}

module.exports = FileClientOptions;