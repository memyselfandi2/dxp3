/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-lang-html
 *
 * NAME
 * CSSTokenizerOptions
 */
const packageName = 'dxp3-lang-html';
const moduleName = 'CSSTokenizerOptions';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;

/**
 * @module dxp3-lang-html/CSSTokenizerOptions
 */
// It's important to at least log warnings and errors.
const logging = require('dxp3-logging');
// We use the util.Help class to print out help information.
const util = require('dxp3-util');

const logger = logging.getLogger(canonicalName);

class CSSTokenizerOptions extends util.Options {
    /*********************************************
     * CONSTRUCTOR
     ********************************************/

	constructor() {
		super();
		this.help = false;
		super.addAliases('faq,info,information', 'help');
		this.logLevel = [{regexp:"*",level:logging.Level.WARN}];
		super.addAlias('log,logger,logging', 'logLevel');
		this.text = null;
		super.addAlias('css,input', 'text');
		this.url = null;
	}

    /*********************************************
     * PUBLIC METHODS
     ********************************************/

	static parseCommandLineOptions() {
		let result = new CSSTokenizerOptions();
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
														    'css,input',
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
// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
	util.Help.print();
	return;
}
module.exports = CSSTokenizerOptions;