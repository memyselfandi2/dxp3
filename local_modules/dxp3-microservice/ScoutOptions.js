/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-microservice
 *
 * NAME
 * ScoutOptions
 */
const packageName = 'dxp3-microservice';
const moduleName = 'ScoutOptions';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
// Check if someone tried to run/execute this file.
const util = require('dxp3-util');
if(util.Assert.isFileToExecute(canonicalName)) {
	util.Help.print();
	return;
}
/**
 * @module:dxp3-microservice/ScoutOptions
 */
const logging = require('dxp3-logging');
const ScoutDefaults = require('./ScoutDefaults');
const ScoutMode = require('./ScoutMode');

class ScoutOptions extends util.Options {
	/**
	 * @property {MicroService} microService 
	 * @property {Array|String} destinations           List of IP addresses			
	 * @property {String}       encryptionKey          
	 * @property {Boolean}      ignoreOurselves        
	 * @property {Boolean}      ignoreParentProcess    
	 * @property {Level}        logLevel               
	 * @property {String}       mode                   One of directed broadcast, limited broadcast, multicast or unicast
	 * @property {Number}       port                   The UDP port we listen and transmit on
	 * @property {Number}       reconcileInterval      In milliseconds
	 * @property {Number}       sayHelloInterval       In milliseconds
	 * @property {Number}       timeout                In milliseconds
	 */
	constructor() {
		super();
		this.microService = null;
		this.encryptionKey = process.env.SCOUT_ENCRYPTION_KEY || ScoutDefaults.DEFAULT_ENCRYPTION_KEY;
		super.addAliases('encrypt,encrypted,encryption,encryptionpassword,key,password,security,securitykey,securitypassword', 'encryptionKey');
		// Should we or should we not ignore UDP messages send by our parent process.
		this.ignoreParentProcess = ScoutDefaults.DEFAULT_IGNORE_PARENT_PROCESS;
		super.addAliases('ignoreparentprocess,ignoreparent', 'ignoreParentProcess');
		// Should we or should we not ignore UDP messages send by ourselves.
		this.ignoreOurselves = ScoutDefaults.DEFAULT_IGNORE_OURSELVES;
		super.addAliases('ignoreourselves', 'ignoreOurselves');
		this.logLevel = [{regexp:"*",level:ScoutDefaults.DEFAULT_LOG_LEVEL}];
		super.addAlias('log,logger,logging', 'logLevel');
		this.mode = ScoutMode.parse(process.env.SCOUT_MODE || ScoutDefaults.DEFAULT_SCOUT_MODE);
		super.setAlias('scoutmode,udpmode', 'mode');
		this.destinations = [];
		super.setAlias('destination', 'destinations');
		this.port = process.env.SCOUT_PORT || ScoutDefaults.DEFAULT_PORT;
		super.setAlias('scoutport,udpserverport,udpport', 'port');
		this.reconcileInterval = ScoutDefaults.DEFAULT_RECONCILE_INTERVAL;
		super.setAlias('reconcileinterval', 'reconcileInterval');
		this.sayHelloInterval = ScoutDefaults.DEFAULT_SAY_HELLO_INTERVAL;
		super.setAlias('hellointerval,sayhellointerval', 'sayHelloInterval');
		this.timeout = ScoutDefaults.DEFAULT_TIMEOUT;
		super.setAlias('scouttimeout', 'timeout');
	}

	static parse(sourceInstance) {
		let result = super.parse(sourceInstance);
		// If no destinations are set we initialize them based on Scout mode.
		if((result.destinations === undefined) ||
		   (result.destinations === null) ||
		   (!Array.isArray(result.destinations)) ||
		   (result.destinations.length <= 0)) {
		   	if(process.env.SCOUT_DESTINATIONS === undefined || process.env.SCOUT_DESTINATIONS === null) {
				switch(result.mode) {
					case ScoutMode.LIMITED_BROADCAST:
						result.destinations = [ScoutDefaults.DEFAULT_LIMITED_BROADCAST_ADDRESS];
						break;
					case ScoutMode.DIRECTED_BROADCAST:
						result.destinations = [ScoutDefaults.DEFAULT_DIRECTED_BROADCAST_ADDRESS];
						break;
					case ScoutMode.MULTICAST:
						result.destinations = [ScoutDefaults.DEFAULT_MULTICAST_ADDRESS];
						break;
					case ScoutMode.UNICAST:
						result.destinations = [ScoutDefaults.DEFAULT_UNICAST_ADDRESS];
						break;
					default:
						result.destinations = [];
						break;
				}
			} else {
				result.destinations = process.env.SCOUT_DESTINATIONS.split(',');
			}
		}
		return result;
	}

	static parseCommandLine() {
		let result = new ScoutOptions()
		let commandLineOptions = new util.CommandLineOptions();
		let commandLineOption = commandLineOptions.createStringArray('destinations',
																     'destination',
																     'destinations');
		commandLineOptions.add(commandLineOption);
		commandLineOption = commandLineOptions.createString('encryption',
															'encrypt,encrypted,encryptionpassword,key,password,security,securitykey,securitypassword',
															'encryptionKey');
		commandLineOptions.add(commandLineOption);

		// -help
		commandLineOption = commandLineOptions.createFlag('help',
														  'faq,info,information',
														  'help');
		commandLineOptions.add(commandLineOption);

		commandLineOption = commandLineOptions.createBoolean('ignoreparent',
															 'ignoreparentprocess',
															 'ignoreParentProcess');
		commandLineOptions.add(commandLineOption);
		commandLineOption = commandLineOptions.createBoolean('ignoreourselves',
															 null,
															 'ignoreOurselves');
		commandLineOptions.add(commandLineOption);
		commandLineOption = commandLineOptions.createObjectArray('loglevel',
	 															 'log,logger,logging',
																 'logLevel');
		commandLineOption.addStringProperty('regexp');
		commandLineOption.addEnumerationProperty('level', logging.Level);
		commandLineOptions.add(commandLineOption);
		commandLineOption = commandLineOptions.createEnumeration('mode',
															     'scoutmode,udpmode',
															     'mode',
															     ScoutMode);
		commandLineOptions.add(commandLineOption);
		commandLineOption = commandLineOptions.createNumber('port',
															'listenon,scoutport,serverport,udpport,udpserverport',
															'port');
		commandLineOptions.add(commandLineOption);
		commandLineOption = commandLineOptions.createNumber('reconcileinterval',
															null,
															'reconcileInterval');
		commandLineOptions.add(commandLineOption);
		commandLineOption = commandLineOptions.createNumber('sayhellointerval',
															'sayhello,hellointerval',
															'sayHelloInterval');
		commandLineOptions.add(commandLineOption);
		commandLineOption = commandLineOptions.createNumber('timeout',
															'scouttimeout',
															'timeout');
		commandLineOptions.add(commandLineOption);
		commandLineOption = commandLineOptions.createBoolean('reuseaddr',
															 'reuseaddress',
															 'reuseAddr');
		commandLineOptions.add(commandLineOption);
		result = commandLineOptions.parse(result);
		return result;
	}
}

module.exports = ScoutOptions;