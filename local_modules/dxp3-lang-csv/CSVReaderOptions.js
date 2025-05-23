/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-lang-csv
 *
 * NAME
 * CSVReaderOptions
 */
const packageName = 'dxp3-lang-csv';
const moduleName = 'CSVReaderOptions';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * @module dxp3-lang-csv/CSVReaderOptions
 */
const CSVReaderDefaults = require('./CSVReaderDefaults');
const logging = require('dxp3-logging');
const util = require('dxp3-util');

const Level = logging.Level;

class CSVReaderOptions extends util.Options {

	constructor() {
		super();
		this.delimiter = CSVReaderDefaults.DEFAULT_DELIMITER;
		this.help = false;
		super.addAliases('faq,info,information', 'help');
		this.logLevel = [{regexp:"*",level:CSVReaderOptions.DEFAULT_LOG_LEVEL}];
		super.addAlias('log,logger,logging', 'logLevel');
		this.text = null;
		super.addAliases('data,csv,csvstring,csvtext,string', 'text');
		this.fileName = null;
		super.addAliases('filepath,filelocation,location,path', 'fileName');
		this.skipEmptyRows = CSVReaderDefaults.DEFAULT_SKIP_EMPTY_ROWS;
		this.trimColumns = CSVReaderDefaults.DEFAULT_TRIM_COLUMNS;
	}

	static parseCommandLine() {
		let result = new CSVReaderOptions();
		let commandLineOptions = new util.CommandLineOptions();
		let commandLineOption = commandLineOptions.createFlag('help',
														  'faq,info,information',
														  'help');
		commandLineOptions.add(commandLineOption);
		commandLineOption = commandLineOptions.createString('delimiter',
															null,
															'delimiter');
		commandLineOptions.add(commandLineOption);
		commandLineOption = commandLineOptions.createString('text',
															'data,csv,csvstring,csvtext,string',
															'text');
		commandLineOptions.add(commandLineOption);
		commandLineOption = commandLineOptions.createString('file',
															'filename,filepath,filelocation,location,path',
															'fileName');
		commandLineOptions.add(commandLineOption);
		commandLineOption = commandLineOptions.createBoolean('skipemptyrows',
															'skipempty',
															'skipEmptyRows');
		commandLineOptions.add(commandLineOption);
		commandLineOption = commandLineOptions.createBoolean('trimColumns',
															'trim,trimwhitespace',
															'trimColumns');
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
// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
	util.Help.print(CSVReaderOptions);
	return;
}
module.exports = CSVReaderOptions;