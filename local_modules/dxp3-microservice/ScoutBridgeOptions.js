/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-microservice
 *
 * NAME
 * ScoutBridgeOptions
 */
const packageName = 'dxp3-microservice';
const moduleName = 'ScoutBridgeOptions';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * Use this module to parse the arguments/options supplied to an ScoutBridge.
 * When certain options are omitted an attempt is made to set reasonable defaults.<br/>
 * <ul>
 * <li>multicastAddress</li>
 * <li>multicastPort</li>
 * <li>unicastAddress</li>
 * <li>unicastPort</li>
 * <li>forwardTo</li>
 * </ul>
 *
 * @module dxp3-net-udp/ScoutBridgeOptions
 */
// It's important to log errors and warnings.
const logging = require('dxp3-logging');
const net = require('dxp3-net');
const ScoutBridgeDefaults = require('./ScoutBridgeDefaults');
// We use the util.Help class to print out help information.
const util = require('dxp3-util');

const Level = logging.Level;
/**
 * @see module:dxp3-net-udp/ScoutBridgeDefaults
 */
class ScoutBridgeOptions extends util.Options {

	constructor() {
		super();
		this.multicastAddress = ScoutBridgeDefaults.DEFAULT_MULTICAST_ADDRESS;
		this.multicastPort = ScoutBridgeDefaults.DEFAULT_MULTICAST_PORT;
		this.unicastAddress = ScoutBridgeDefaults.DEFAULT_UNICAST_ADDRESS;
		this.unicastPort = ScoutBridgeDefaults.DEFAULT_UNICAST_PORT;
		this.forwardTo = [];
		this.encryptionAlgorithm = ScoutBridgeDefaults.DEFAULT_ENCRYPTION_ALGORITHM;
		this.encryptionKey = ScoutBridgeDefaults.DEFAULT_ENCRYPTION_KEY;
		super.addAliases('encrypt,encrypted,encryption,encryptionpassword,key,password,security,securitykey,securitypassword', 'encryptionKey');
		this.logLevel = [{regexp:"*",level:ScoutBridgeDefaults.DEFAULT_LOG_LEVEL}];
		super.addAlias('log,logger,logging', 'logLevel');
		this.sayHelloInterval = ScoutBridgeDefaults.DEFAULT_SAY_HELLO_INTERVAL;
		super.setAlias('hellointerval,sayhellointerval', 'sayHelloInterval');
	}

	static parse(_sourceInstance) {
		let result = super.parse(_sourceInstance);
		if(result.forwardTo === undefined ||
		   result.forwardTo === null) {
			return result;
		}
		if(!Array.isArray(result.forwardTo)) {
			return result;
		}
		if(result.forwardTo.length <= 0) {
			return result;
		}
		for(let i=0;i < result.forwardTo.length;i++) {
			let destination = result.forwardTo[i];
			if(typeof destination === 'object') {
				continue;
			}
			let indexOfColon = destination.indexOf(':');
			let address = null;
			let port = -1;
			if(indexOfColon < 0) {
				address = destination;
				port = ScoutBridgeDefaults.DEFAULT_UNICAST_PORT;
			} else {
				address = destination.substring(0, indexOfColon);
				port = destination.substring(indexOfColon + 1);
				port = parseInt(port);
			}
			destination = {
				address: address,
				port: parseInt(port)
			}
			result.forwardTo[i] = destination;
		}
		return result;
	}

	static parseCommandLine() {
		let result = new ScoutBridgeOptions();
		let commandLineOptions = new util.CommandLineOptions();

		// -help
		let commandLineOption = commandLineOptions.createFlag('help',
															  'faq,info,information',
															  'help');
		commandLineOptions.add(commandLineOption);

		// -multicastaddress
		commandLineOption = commandLineOptions.createString('multicastaddress',
															'from,membershipaddress,source',
															'multicastAddress');
		commandLineOptions.add(commandLineOption);

		// -multicastport
		commandLineOption = commandLineOptions.createNumber('multicastport',
															'fromport,sourceport,membershipport',
															'multicastPort');
		commandLineOptions.add(commandLineOption);

		// -unicastaddress
		commandLineOption = commandLineOptions.createString('unicastaddress',
															'address,bridgeaddress',
															'unicastAddress');
		commandLineOptions.add(commandLineOption);

		// -unicastport
		commandLineOption = commandLineOptions.createNumber('unicastport',
															'bridgeport,port',
															'unicastPort');
		commandLineOptions.add(commandLineOption);

		// -destination
		commandLineOption = commandLineOptions.createStringArray('forwardto',
																 'bridge,destination,destinations,forward,send,sendto',
																 'forwardTo');
		commandLineOptions.add(commandLineOption);

		// -encryption
		commandLineOption = commandLineOptions.createString('encryption',
															'encrypt,encrypted,encryptionpassword,key,password,security,securitykey,securitypassword',
															'encryptionKey');
		commandLineOptions.add(commandLineOption);

		// -sayhellointerval
		commandLineOption = commandLineOptions.createNumber('sayhellointerval',
															'sayhello,hellointerval',
															'sayHelloInterval');
		commandLineOptions.add(commandLineOption);

		// -loglevel
		commandLineOption = commandLineOptions.createObjectArray('loglevel',
																 'log,logger,logging',
																 'logLevel');
		commandLineOption.addStringProperty('regexp');
		commandLineOption.addEnumerationProperty('level', Level);
		commandLineOptions.add(commandLineOption);

		result = commandLineOptions.parse(result);
		return result;
	}
}
// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
    util.Help.print(ScoutBridgeOptions);
    return;
}
module.exports = ScoutBridgeOptions;