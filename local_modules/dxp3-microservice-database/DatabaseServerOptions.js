/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-microservice-database
 *
 * NAME
 * DatabaseServerOptions
 */
const packageName = 'dxp3-microservice-database';
const moduleName = 'DatabaseServerOptions';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
// Check if someone tried to run/execute this file.
const util = require('dxp3-util');
if(util.Assert.isFileToExecute(canonicalName)) {
	util.Help.print();
	return;
}
/**
 * @module dxp3-microservice-database/DatabaseServerOptions
 */
const DatabaseServerDefaults = require('./DatabaseServerDefaults');
const logging = require('dxp3-logging');
// Different operating systems have different folder structures.
// We need to know the os we are running on to be able to choose
// the correct default database folder.
const os = require('os');
const rest = require('dxp3-microservice-rest');

const Level = logging.Level;

class DatabaseServerOptions extends rest.RestServerOptions {

	constructor() {
		super();
		this.address = DatabaseServerDefaults.DEFAULT_ADDRESS;
		// Add additional aliases for the port property.
		this.port = DatabaseServerDefaults.DEFAULT_PORT;
		super.addAlias('databaseport,databaseserverport', 'port');
		// Add additional aliases for the produces property.
		super.addAliases('stores,subject,subjects', 'produces');
		this.sourceFolder = null;
		if(os.type().startsWith('Windows')) {
			this.sourceFolder = DatabaseServerDefaults.DEFAULT_SOURCE_FOLDER_WINDOWS;
		} else {
			this.sourceFolder = DatabaseServerDefaults.DEFAULT_SOURCE_FOLDER;
		}
		super.setAliases('dir,directory,folder,root,source', 'sourceFolder');
		this.timeout = DatabaseServerDefaults.DEFAULT_TIMEOUT;
		super.addAliases('databasetimeout', 'timeout');
		this.databaseName = DatabaseServerDefaults.DEFAULT_DATABASE_NAME;
		super.setAliases('database,db,dbname', 'databaseName');
	}

	static parseCommandLine() {
		let result = new DatabaseServerOptions();
		let commandLineOptions = new util.CommandLineOptions();

		let commandLineOption = commandLineOptions.createFlag('help',
													   		  'faq,info,information',
															  'help');
		commandLineOptions.add(commandLineOption);
		commandLineOption = commandLineOptions.createString('address',
															'host',
															'address');
		commandLineOptions.add(commandLineOption);
		commandLineOption = commandLineOptions.createNumber('timeout',
															'connectiontimeout,databasetimeout,resttimeout,restservertimeout,sockettimeout',
															'timeout');
		commandLineOptions.add(commandLineOption);
		commandLineOption = commandLineOptions.createNumber('port',
															'databaseport,databaseserverport,listenon,serverport,restserverport',
															'port');
		commandLineOptions.add(commandLineOption);
		commandLineOption = commandLineOptions.createObjectArray('loglevel',
															'log,logger,logging',
															'logLevel');
		commandLineOption.addStringProperty('regexp');
		commandLineOption.addEnumerationProperty('level', Level);
		commandLineOptions.add(commandLineOption);

		commandLineOption = commandLineOptions.createString('databasename',
									   						'database,db,dbname',
															'databaseName');
		commandLineOptions.add(commandLineOption);

		commandLineOption = commandLineOptions.createString('name',
									   						'restservername,servername,servicename',
															'name');
		commandLineOptions.add(commandLineOption);

		commandLineOptions.add(commandLineOption);
		commandLineOption = commandLineOptions.createStringArray('produces',
																 'serves,stores,subject,subjects,production,productions,product,products',
																 'produces');
		commandLineOptions.add(commandLineOption);
		commandLineOption = commandLineOptions.createString('sourcefolder',
															'dir,directory,folder,root,rootdir,rootdirectory,rootfolder,source',
															'sourceFolder');
		commandLineOptions.add(commandLineOption);
		result = commandLineOptions.parse(result);
		return result;
	}
}

module.exports = DatabaseServerOptions;