/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-lang-html
 *
 * NAME
 * HTMLTokenizerOptions
 */
const packageName = 'dxp3-lang-html';
const moduleName = 'HTMLTokenizerOptions';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
// Check if someone tried to run/execute this file.
const util = require('dxp3-util');
if(util.Assert.isFileToExecute(canonicalName)) {
	util.Help.print();
	return;
}
/**
 * @module dxp3-lang-html/HTMLTokenizerOptions
 */
const logging = require('dxp3-logging');

const logger = logging.getLogger(canonicalName);

class HTMLTokenizerOptions extends util.Options {
	/**
	 * @constructor
	 */
	constructor() {
		super();
		this.help = false;
		super.addAliases('faq,info,information', 'help');
		this.logLevel = [{regexp:"*",level:logging.Level.WARN}];
		super.addAlias('log,logger,logging', 'logLevel');
		this.text = null;
		super.addAlias('html,input', 'text');
		this.url = null;
	}

	static parseCommandLineOptions() {
		let result = new HTMLTokenizerOptions();
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
		commandLineOption = commandLineOptions.createString('text',
														    'html,input',
															'text');
		commandLineOptions.add(commandLineOption);
		commandLineOption = commandLineOptions.createString('url',
															null,
															'url');
		commandLineOptions.add(commandLineOption);
		result = commandLineOptions.parse(result);
		return result;
	}
}

module.exports = HTMLTokenizerOptions;