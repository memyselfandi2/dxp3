/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-net-udp
 *
 * NAME
 * UDPClientOptions
 */
const packageName = 'dxp3-net-udp';
const moduleName = 'UDPClientOptions';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * <p>Use this module to parse the arguments/options supplied to an UDP client.<br/>
 * When certain options are omitted an attempt is made to use reasonable defaults.<br/>
 * These defaults are configured in {@link module:dxp3-net-udp/UDPClientDefaults}.</p>
 *
 * @module dxp3-net-udp/UDPClientOptions
 */
// It's important to log errors and warnings.
const logging = require('dxp3-logging');
const UDPClientDefaults = require('./UDPClientDefaults');
const UDPMode = require('./UDPMode');
// We use the util.Help class to print out help information.
const util = require('dxp3-util');

const Level = logging.Level;
/**
 * @see module:dxp3-net-udp/UDPClientDefaults
 */
class UDPClientOptions extends util.Options {
	/**
	 * @property {Array|String} destinations
	 * List of ip addresses we send udp messages to. Each destination has an address and
	 * an optional port. If the port is omitted we use the value of the port property.
	 *
	 * @property {String} encryptionAlgorithm
	 * The encryption algorithm to use.
	 *
	 * @property {String} encryptionKey
	 * Key to be used to encrypt/decrypt messages.
	 *
	 * @property {module:dxp3-logging/Level} logLevel
	 *
	 * @property {Number|String} port
	 * The port we are sending to.
	 */
	constructor() {
		super();
		this.destinations = [];
		this.addAliases('destination', 'destinations');
		this.encryptionAlgorithm = UDPClientDefaults.DEFAULT_ENCRYPTION_ALGORITHM;
		this.encryptionKey = UDPClientDefaults.DEFAULT_ENCRYPTION_KEY;
		super.addAliases('encrypt,encrypted,encryption,encryptionpassword,key,password,security,securitykey,securitypassword', 'encryptionKey');
		this.logLevel = [{regexp:"*",level:UDPClientDefaults.DEFAULT_LOG_LEVEL}];
		super.addAlias('log,logger,logging', 'logLevel');
		this.port = UDPClientDefaults.DEFAULT_PORT;
		super.addAlias('defaultport,destinationport,sendto,sendtoport,serverport,udpport,udpserverport', 'port');
	}

	static parse(sourceInstance) {
		let result = super.parse(sourceInstance);
		// If no destination is supplied, we use the default multicast address.
		// The directed broadcast address is too specific for the network we are running on and
		// the limited broadcast is highly likely not supported. Lets settle for 
		// a multicast address.
		if(result.destinations === undefined ||
		   result.destinations === null ||
		   (!Array.isArray(result.destinations)) ||
		   (result.destinations.length <= 0)) {
				result.destinations = [{address: UDPClientDefaults.DEFAULT_MULTICAST_ADDRESS,
										port: result.port}];
		} else {
			// If there are destinations defined, we need to ensure they have a 
			// proper port.
			let validDestinations = [];
			for(let i=0;i < result.destinations.length;i++) {
				let destination = result.destinations[i];
				if(destination === undefined || destination === null) {
					continue;
				}
				if(typeof destination === 'string') {
					destination = destination.trim();
					if(destination.length <= 0) {
						continue;
					}
					let indexOfColon = destination.indexOf(':');
					let address = null;
					let port = -1;
					if(indexOfColon < 0) {
						address = destination;
						port = result.port;
					} else {
						address = destination.substring(0, indexOfColon);
						port = destination.substring(indexOfColon + 1);
						try {
							port = parseInt(port);
						} catch(_exception) {
							continue;						
						}
					}
					destination = {
						address: address,
						port: port
					}
				} else if(destination.port === undefined ||
						  destination.port === null ||
						  destination.port <= 0) {
					destination.port = result.port;
				}
				validDestinations.push(destination);
			}
			result.destinations = validDestinations;
		}
		return result;
	}

	static parseCommandLine() {
		let result = new UDPClientOptions()
		let commandLineOptions = new util.CommandLineOptions();

		// -destinations
		let commandLineOption = commandLineOptions.createStringArray('destinations',
																	 'destination',
																	 'destinations');
		commandLineOptions.add(commandLineOption);

		// -encryption
		commandLineOption = commandLineOptions.createString('encryption',
															'encrypt,encrypted,encryptionpassword,key,password,security,securitykey,securitypassword',
															'encryptionKey');
		commandLineOptions.add(commandLineOption);
		
		// -event
		commandLineOption = commandLineOptions.createString('event',
											 			    'message,msg',
														    'event');
		commandLineOptions.add(commandLineOption);
		
		// -eventbody
		commandLineOption = commandLineOptions.createString('eventbody',
											 			    'body,data,eventdata,eventpayload,messagebody,messagedata,messagepayload,msgbody,msgdata,msgpayload,payload',
														    'eventBody');
		commandLineOptions.add(commandLineOption);

		// -help
		commandLineOption = commandLineOptions.createFlag('help',
														  'faq,info,information',
														  'help',
								   						  'Use this flag to get help using an UDPClient.');
		commandLineOptions.add(commandLineOption);

		// -loglevel
		commandLineOption = commandLineOptions.createObjectArray('loglevel',
																 'log,logger,logging',
																 'logLevel');
		commandLineOption.addStringProperty('regexp');
		commandLineOption.addEnumerationProperty('level', Level);
		commandLineOptions.add(commandLineOption);

		// -port
		commandLineOption = commandLineOptions.createNumber('port',
															'defaultport,destinationport,sendto,sendtoport,serverport,udpport,udpserverport',
															'port');
		commandLineOptions.add(commandLineOption);

		result = commandLineOptions.parse(result);
		return result;
	}
}
// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
    util.Help.print(UDPClientOptions);
    return;
}
module.exports = UDPClientOptions;