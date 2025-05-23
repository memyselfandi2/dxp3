/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-lang-csv
 *
 * NAME
 * CSVParserOptions
 */
const packageName = 'dxp3-lang-csv';
const moduleName = 'CSVParserOptions';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * @module dxp3-lang-csv/CSVParserOptions
 */
const CSVParserDefaults = require('./CSVParserDefaults');
const logging = require('dxp3-logging');
const util = require('dxp3-util');

const Level = logging.Level;

class CSVParserOptions extends util.Options {

	constructor() {
		super();
		this.delimiter = CSVParserDefaults.DEFAULT_DELIMITER;
		super.addAliases('separator', 'delimiter');
		this.help = false;
		super.addAliases('faq,info,information', 'help');
		this.logLevel = [{regexp:"*",level:CSVParserOptions.DEFAULT_LOG_LEVEL}];
		super.addAlias('log,logger,logging', 'logLevel');
		this.fileName = null;
		super.addAliases('file,filepath,filelocation,location,path', 'fileName');
		this.skipEmptyRows = CSVParserDefaults.DEFAULT_SKIP_EMPTY_ROWS;
		this.trimWhitespace = CSVParserDefaults.DEFAULT_TRIM_WHITESPACE;
		super.addAliases('trim,trimColumn,trimColumns,trimValue,trimValues', 'trimWhitespace');
		this.escapeCharacter = CSVParserDefaults.DEFAULT_ESCAPE_CHARACTER;
		super.addAliases('escape', 'escapeCharacter');
		this.highWaterMark = CSVParserDefaults.DEFAULT_HIGH_WATER_MARK;
		this.commentsPrefix = CSVParserDefaults.DEFAULT_COMMENTS_PREFIX;
		super.addAliases('commentcharacter,commentprefix,commentscharacter', 'commentsPrefix');
		this.hasComments = CSVParserDefaults.DEFAULT_HAS_COMMENTS;
		super.addAliases('allowcomment,allowcomments,commentallowed,commentsallowed', 'hasComments');
		super.addAliases('enablecomment,enablecomments,commentenabled,commentsenabled', 'hasComments');
		super.addAliases('comments', 'hasComments');
		super.addAliases('skipcomments', 'hasComments');
		this.hasHeaders = CSVParserDefaults.DEFAULT_HAS_HEADERS;
		super.addAliases('header,headers', 'hasHeaders');
		this.startAtLine = CSVParserDefaults.DEFAULT_START_AT_LINE;
		super.addAliases('start,startat,startatrow,startline,startrow', 'startAtLine');
	}

	static parseCommandLine() {
		let result = new CSVParserOptions();
		let commandLineOptions = new util.CommandLineOptions();
		let commandLineOption = commandLineOptions.createFlag('comments',
															  'allowcomment,allowcomments,commentallowed,commentsallowed,commentsenabled,enablecomment,enablecomments,hascomments,skipcomments',
															  'comments');
		commandLineOptions.add(commandLineOption);
		commandLineOption = commandLineOptions.createString('commentsprefix',
															'commentcharacter,commentprefix,commentscharacter,prefixcomment,prefixcomments',
															'commentsPrefix');
		commandLineOptions.add(commandLineOption);
		commandLineOption = commandLineOptions.createString('delimiter',
															'separator',
															'delimiter');
		commandLineOptions.add(commandLineOption);
		commandLineOption = commandLineOptions.createString('escape',
															'escapecharacter',
															'escapeCharacter');
		commandLineOptions.add(commandLineOption);
		commandLineOption = commandLineOptions.createString('file',
															'filename,filepath,filelocation,location,path',
															'fileName');
		commandLineOptions.add(commandLineOption);
		commandLineOption = commandLineOptions.createBoolean('headers',
															 'hasheader,hasheaders,header',
															 'hasHeaders');
		commandLineOptions.add(commandLineOption);
		commandLineOption = commandLineOptions.createFlag('help',
														  'faq,info,information',
														  'help');
		commandLineOptions.add(commandLineOption);
		commandLineOption = commandLineOptions.createObjectArray('loglevel',
																 'log,logger,logging',
																 'logLevel');
		commandLineOption.addStringProperty('regexp');
		commandLineOption.addEnumerationProperty('level', logging.Level);
		commandLineOptions.add(commandLineOption);
		commandLineOption = commandLineOptions.createFlag('skipemptyrows',
														  'skipempty,skipemptyrow,skipemptyline',
														  'skipEmptyRows');
		commandLineOptions.add(commandLineOption);
		commandLineOption = commandLineOptions.createNumber('start',
															'startat,startatrow,startline,startrow',
															'startAtLine');
		commandLineOptions.add(commandLineOption);
		commandLineOption = commandLineOptions.createFlag('trim',
														  'trimcolumn,trimcolumns,trimvalue,trimvalues,trimwhitespace',
														  'trimWhitespace');
		commandLineOptions.add(commandLineOption);
		result = commandLineOptions.parse(result);
		return result;
	}
}
// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
	util.Help.print(CSVParserOptions);
	return;
}
module.exports = CSVParserOptions;