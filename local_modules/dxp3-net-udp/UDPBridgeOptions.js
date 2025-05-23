/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-net-udp
 *
 * NAME
 * UDPBridgeOptions
 */
const packageName = 'dxp3-net-udp';
const moduleName = 'UDPBridgeOptions';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * Use this module to parse the arguments/options supplied to an UDPBridge.
 * When certain options are omitted an attempt is made to set reasonable defaults.<br/>
 * <ul>
 * <li>multicastAddress</li>
 * <li>multicastPort</li>
 * <li>unicastAddress</li>
 * <li>unicastPort</li>
 * <li>forwardTo</li>
 * </ul>
 *
 * @module dxp3-net-udp/UDPBridgeOptions
 */
// It's important to log errors and warnings.
const logging = require('dxp3-logging');
const UDPMode = require('./UDPMode');
const UDPBridgeDefaults = require('./UDPBridgeDefaults');
// We use the util.Help class to print out help information.
const util = require('dxp3-util');

const Level = logging.Level;
/**
 * @see module:dxp3-net-udp/UDPBridgeDefaults
 */
class UDPBridgeOptions extends util.Options {
	/**
	 * @property {String} multicastAddress
	 * The UDP multicast address we listen on for messages to 'bridge' to the forwardTo addresses.

	 * @property {Number|String} multicastPort
	 * The UDP multicast port we listen on for messages to 'bridge' to the forwardTo addresses.
	 *
	 * @property {String} unicastAddress
	 * The UDP unicast address we listen on for messages to 'bridge' to the multicastAddress:multicastPort members.

	 * @property {Number|String} unicastPort
	 * The UDP unicast port we listen on for messages to 'bridge' to the multicastAddress:multicastPort members.
	 *
	 * @property {Array|String} forwardTo
	 * The unicast addresses of other UDPBridge instances.
	 *
	 * @property {String} encryptionAlgorithm
	 * The encryption algorithm to use.
	 *
	 * @property {String} encryptionKey
	 * Key to be used to encrypt/decrypt messages.
	 */
	constructor() {
		super();
		// The array of multicast addresses will be
		// initialized by calling the static parse method.
		this.multicastAddresses = [];
		this.multicastPort = UDPBridgeDefaults.DEFAULT_MULTICAST_PORT;
		this.unicastAddress = UDPBridgeDefaults.DEFAULT_UNICAST_ADDRESS;
		this.unicastPort = UDPBridgeDefaults.DEFAULT_UNICAST_PORT;
		this.forwardTo = [];
		this.encryptionAlgorithm = UDPBridgeDefaults.DEFAULT_ENCRYPTION_ALGORITHM;
		this.encryptionKey = UDPBridgeDefaults.DEFAULT_ENCRYPTION_KEY;
		super.addAliases('encrypt,encrypted,encryption,encryptionpassword,key,password,security,securitykey,securitypassword', 'encryptionKey');
		this.logLevel = [{regexp:"*",level:UDPBridgeDefaults.DEFAULT_LOG_LEVEL}];
		super.addAlias('log,logger,logging', 'logLevel');
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
		if(result.multicastAddresses.length <= 0) {
			result.multicastAddresses = [UDPBridgeDefaults.DEFAULT_MULTICAST_ADDRESS];
		}
		let validDestinations = [];
		for(let i=0;i < result.forwardTo.length;i++) {
			let destination = result.forwardTo[i];
			if(destination === undefined || destination === null) {
				// No point in adding an empty destination.
				continue;
			}
			if(typeof destination === 'string') {
				destination = destination.trim();
				if(destination.length <= 0) {
					// No point in adding an empty destination.
					continue;
				} 
				// A destination should be <address> or <address>:<port>
				let indexOfColon = destination.indexOf(':');
				let address = null;
				let port = -1;
				if(indexOfColon < 0) {
					// Missing port. Use ours instead.
					address = destination;
					port = result.unicastPort;
				} else {
					address = destination.substring(0, indexOfColon);
					port = destination.substring(indexOfColon + 1);
					try {
						port = parseInt(port);
					} catch(_exception) {
						// No point in adding a destination with an
						// invalid port.
						continue;
					}
				}
				destination = {
					address: address,
					port: port
				}
			} else if(destination.port === undefined || destination.port === null || destination.port <= 0) {
				// Missing port. Use ours instead.
				destination.port = result.unicastPort;
			}
			validDestinations.push(destination);
		}
		result.forwardTo = validDestinations;
		return result;
	}

	static parseCommandLine() {
		let result = new UDPBridgeOptions();
		let commandLineOptions = new util.CommandLineOptions();

		// -encryption
		let commandLineOption = commandLineOptions.createString('encryption',
															    'encrypt,encrypted,encryptionpassword,key,password,security,securitykey,securitypassword',
															    'encryptionKey');
		commandLineOptions.add(commandLineOption);

		// -forwardto
		commandLineOption = commandLineOptions.createStringArray('forwardto',
																 'bridge,destination,destinations,forward,send,sendto',
																 'forwardTo');
		commandLineOptions.add(commandLineOption);

		// -help
		commandLineOption = commandLineOptions.createFlag('help',
														  'faq,info,information',
														  'help');
		commandLineOptions.add(commandLineOption);

		// -loglevel
		commandLineOption = commandLineOptions.createObjectArray('loglevel',
																 'log,logger,logging',
																 'logLevel');
		commandLineOption.addStringProperty('regexp');
		commandLineOption.addEnumerationProperty('level', Level);
		commandLineOptions.add(commandLineOption);

		// -multicastaddress
		commandLineOption = commandLineOptions.createStringArray('multicastaddresses',
																 'from,multicastaddress,listenon,membership,memberships,membershipaddress,membershipaddresses,source,sources',
																 'multicastAddresses');
		commandLineOptions.add(commandLineOption);

		// -multicastport
		commandLineOption = commandLineOptions.createNumber('multicastport',
															'fromport,sourceport,membershipport',
															'multicastPort');
		commandLineOptions.add(commandLineOption);

		// -unicastaddress
		commandLineOption = commandLineOptions.createString('unicastaddress',
															'bridgeaddress,localaddress,serveraddress',
															'unicastAddress');
		commandLineOptions.add(commandLineOption);

		// -unicastport
		commandLineOption = commandLineOptions.createNumber('unicastport',
															'bridgeport,localport,serverport',
															'unicastPort');
		commandLineOptions.add(commandLineOption);

		result = commandLineOptions.parse(result);
		return result;
	}
}
// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
    util.Help.print(UDPBridgeOptions);
    return;
}
module.exports = UDPBridgeOptions;