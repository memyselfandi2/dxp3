/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-lang-css
 *
 * NAME
 * SelectorTokenizerOptions
 */
const packageName = 'dxp3-lang-css';
const moduleName = 'SelectorTokenizerOptions';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * @module dxp3-lang-css/SelectorTokenizerOptions
 */
const logging = require('dxp3-logging');
const SelectorTokenizerDefaults = require('./SelectorTokenizerDefaults');
const util = require('dxp3-util');
/**
 * @see module:dxp3-lang-css/SelectorTokenizerDefaults
 */
class SelectorTokenizerOptions extends util.Options {
    /*********************************************
     * CONSTRUCTOR
     ********************************************/

	constructor() {
		super();
		this.logLevel = [{regexp:"*",level:SelectorTokenizerDefaults.DEFAULT_LOG_LEVEL}];
		super.addAlias('log,logger,logging', 'logLevel');
		this.text = null;
		super.addAliases('data,css,cssstring,csstext,string', 'text');
	}

    /*********************************************
     * PUBLIC METHODS
     ********************************************/

	static parseCommandLine() {
		let result = new SelectorTokenizerOptions();
		let commandLineOptions = new util.CommandLineOptions();
		let commandLineOption = commandLineOptions.createFlag('help','faq,info,information','help');
		commandLineOptions.add(commandLineOption);
		commandLineOption = commandLineOptions.createObjectArray('loglevel',
 																 'log,logger,logging',
																 'logLevel');
		commandLineOption.addStringProperty('regexp');
		commandLineOption.addEnumerationProperty('level', logging.Level);
		commandLineOptions.add(commandLineOption);
		commandLineOption = commandLineOptions.createString('text',
															'css,data,selector,string',
															'text');
		commandLineOptions.add(commandLineOption);
		result = commandLineOptions.parse(result);
		return result;
	}
}
// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
    util.Help.print(SelectorTokenizerOptions);
    return;
}
module.exports = SelectorTokenizerOptions;