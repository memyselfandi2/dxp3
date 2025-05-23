/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-email
 *
 * NAME
 * ApplicationOptions
 */
const packageName = 'dxp3-email';
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
 * @module dxp3-email/ApplicationOptions
 */
const logging = require('dxp3-logging');
const ApplicationDefaults = require('./ApplicationDefaults');

const logger = logging.getLogger(canonicalName);

class ApplicationOptions extends util.Options {

	constructor() {
		super();
		this.smtpHost = ApplicationDefaults.DEFAULT_SMTP_HOST;
		super.addAlias('address', 'smtpHost');
		this.help = false;
		super.addAliases('faq,info,information', 'help');
		this.logLevel = [{regexp:"*",level:ApplicationDefaults.DEFAULT_LOG_LEVEL}];
		super.addAlias('log,logger,logging', 'logLevel');
		this.smtpPort = ApplicationDefaults.DEFAULT_SMTP_PORT;
		super.addAliases('smtpsport,smtpserverport,smtpsserverport', 'smtpPort');
		this.username = null;
		this.password = null;

		console.log('constructor. host: ' + this.smtpHost + ' port: ' + this.smtpPort);
	}

	static parseCommandLine() {
		let result = new ApplicationOptions();
		let commandLineOptions = new util.CommandLineOptions();
		let commandLineOption = commandLineOptions.createFlag('help',
														  'faq,info,information',
														  'help');
		commandLineOptions.add(commandLineOption);
		commandLineOption = commandLineOptions.createString('smtphost',
															'address,host',
															'smtpHost');
		commandLineOptions.add(commandLineOption);
		commandLineOption = commandLineOptions.createNumber('smtpport',
															'smtpserverport',
															'smtpPort');
		commandLineOptions.add(commandLineOption);
		commandLineOption = commandLineOptions.createObjectArray('loglevel',
															'log,logger,logging',
															'logLevel');
		commandLineOption.addStringProperty('regexp');
		commandLineOption.addEnumerationProperty('level', logging.Level);
		commandLineOptions.add(commandLineOption);
		result = commandLineOptions.parse(result);
		return result;
	}
}

module.exports = ApplicationOptions;