/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-net-udp
 *
 * NAME
 * UDPServerOptions
 */
const packageName = 'dxp3-net-udp';
const moduleName = 'UDPServerOptions';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * Use this module to parse the arguments/options supplied to an UDPServer.
 * When certain options are omitted an attempt is made to set reasonable defaults.<br/>
 * <ul>
 * <li>address</li>
 * <li>destinations</li>
 * <li>encryptionAlgorithm</li>
 * <li>encryptionKey</li>
 * <li>ignoreParentProcess</li>
 * <li>ignoreOurselves</li>
 * <li>mode</li>
 * <li>multicastAddresses</li>
 * <li>port</li>
 * <li>reuseAddr</li>
 * </ul>
 *
 * @module dxp3-net-udp/UDPServerOptions
 */
// It's important to log errors and warnings.
const logging = require('dxp3-logging');
const UDPAddress = require('./UDPAddress');
const UDPMode = require('./UDPMode');
const UDPServerDefaults = require('./UDPServerDefaults');
const UDPServerEventMode = require('./UDPServerEventMode');
// We use the util.Help class to print out help information.
const util = require('dxp3-util');

const Level = logging.Level;
/**
 * @see module:dxp3-net-udp/UDPServerDefaults
 */
class UDPServerOptions extends util.Options {
	/**
	 * @property {String} address
	 * The address we are listening on (default: 0.0.0.0).
	 *
	 * @property {Array|String} destinations
	 * List of ip addresses we send udp messages to.
	 * These can be broadcast, multicast or unicast addresses.
	 *
	 * @property {String} encryptionAlgorithm
	 * The encryption algorithm to use.
	 *
	 * @property {String} encryptionKey
	 * Key to be used to encrypt/decrypt messages.
	 *
	 * @property {module:dxp3-net/UDPServerEventMode} eventMode
	 * One of event, message or raw.
	 * This determines if the UDPServer will listen for and emit specific
	 * events, or emit the decrypted message, or emit
	 * the, potentially encrypted, raw message.
	 * 
	 * @property {Boolean|String} ignoreParentProcess
	 * True if we should ignore messages send by our parent process. This includes us.
	 *
	 * @property {Boolean|String} ignoreOurselves
	 * True if we should ignore messages send by ourselves.
	 *
	 * @property {module:dxp3-net/UDPMode} mode
	 * One of directed broadcast, limited broadcast, multicast or unicast.
	 * The first three will enable the socket to receive broadcast messages.
	 *
	 * @property {Array|String} multicastAddresses
	 * List of ip addresses we send udp messages to.
	 * These are by default also set as destinations unless one specifically
	 * opts out. Additionally this will set the mode to multicast.
	 *
	 * @property {Number|String} port
	 * The port we are listening on. If any of the destinations does not have a port,
	 * this port will be used instead.
	 *
	 * @property {Boolean|String} reuseAddr
	 * Indicates if we should reuse the address. Setting this to true will allow
	 * other processes/instances to run on the same machine while still receiving
	 * UDP messages.
	 */
	constructor() {
		super();
		// The address/interface we listen on for incoming messages.
		// To listen on all interfaces one should use 0.0.0.0.
		this.address = UDPServerDefaults.DEFAULT_ADDRESS;
		super.setAlias('host','address');
		// Unless specified an UDPServer only listens for UDPMessages.
		// The exception is when the mode is multicast. In that case
		// the multicast addresses are automatically added to the destinations list.
		this.destinations = [];
		super.setAlias('clients,udpclients', 'destinations');
		this.encryptionAlgorithm = UDPServerDefaults.DEFAULT_ENCRYPTION_ALGORITHM;
		this.encryptionKey = UDPServerDefaults.DEFAULT_ENCRYPTION_KEY;
		super.addAliases('encrypt,encrypted,encryption,encryptionpassword,key,password,security,securitykey,securitypassword', 'encryptionKey');
		// Should we or should we not ignore UDP messages send by our parent process.
		this.ignoreParentProcess = UDPServerDefaults.DEFAULT_IGNORE_PARENT_PROCESS;
		// Should we or should we not ignore UDP messages send by ourselves.
		this.ignoreOurselves = UDPServerDefaults.DEFAULT_IGNORE_OURSELVES;
		this.logLevel = [{regexp:"*",level:UDPServerDefaults.DEFAULT_LOG_LEVEL}];
		super.addAlias('log,logger,logging', 'logLevel');
		this.mode = UDPServerDefaults.DEFAULT_UDP_MODE;
		super.setAlias('udpmode', 'mode');
		// If the mode is set to multicast the array of multicast addresses will be
		// initialized by calling the static parse method.
		this.multicastAddresses = [];
		this.port = UDPServerDefaults.DEFAULT_PORT;
		super.setAlias('serverport,udpport,udpserverport', 'port');
		this.reuseAddr = UDPServerDefaults.DEFAULT_REUSE_ADDR;
		super.addAlias('reuseaddress,reuseport', 'reuseAddr');
		// The eventMode is a UDPServerEventMode value.
		// It is one of 'event', 'message', or 'raw'.
		this.eventMode = null;
		super.addAlias('servereventmode,udpservereventmode', 'eventMode');
	}

	static parse(_sourceInstance) {
		let result = super.parse(_sourceInstance);
		if(result.mode === UDPMode.MULTICAST) {
			if(result.multicastAddresses.length <= 0) {
				result.multicastAddresses = [UDPServerDefaults.DEFAULT_MULTICAST_ADDRESS];
			}
		}
		// We are going to perform some validations on the multicast addresses.
		let validMulticastAddresses = [];
		for(let i=0;i < result.multicastAddresses.length;i++) {
			let multicastAddress = result.multicastAddresses[i];
			if(multicastAddress === undefined || multicastAddress === null) {
				continue;
			}
			multicastAddress = multicastAddress.trim();
			if(multicastAddress.length <= 0) {
				continue;
			}
			if(!UDPAddress.isMulticastAddress(multicastAddress)) {
				continue;
			}
			validMulticastAddresses.push(multicastAddress);
		}
		if(validMulticastAddresses.length > 0) {
			result.mode = UDPMode.MULTICAST;
		}
		result.multicastAddresses = validMulticastAddresses;
		// We are going to perform some validations on the destinations.
		// If they have no port we will use our own port.
		let validDestinations = [];
		for(let i=0;i < result.destinations.length;i++) {
			let destination = result.destinations[i];
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
					port = result.port;
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
				destination.port = result.port;
			}
			validDestinations.push(destination);
		}
		result.destinations = validDestinations;
		return result;
	}

	static parseCommandLine() {
		let result = new UDPServerOptions();
		let commandLineOptions = new util.CommandLineOptions();
		
		// -address
		let commandLineOption = commandLineOptions.createString('address',
														   	    'host',
																'address');
		commandLineOptions.add(commandLineOption);

		// -destination
		commandLineOption = commandLineOptions.createStringArray('destinations',
																 'destination',
																 'destinations');
		commandLineOptions.add(commandLineOption);

		// -encryption
		commandLineOption = commandLineOptions.createString('encryption',
															'encrypt,encrypted,encryptionpassword,key,password,security,securitykey,securitypassword',
															'encryptionKey');
		commandLineOptions.add(commandLineOption);

		// -eventmode
		commandLineOption = commandLineOptions.createEnumeration('eventmode',
																 'servereventmode,updservereventmode',
																 'eventMode',
																 UDPServerEventMode);
		commandLineOptions.add(commandLineOption);

		// -help
		commandLineOption = commandLineOptions.createFlag('help',
														  'faq,info,information',
														  'help');
		commandLineOptions.add(commandLineOption);

		// -ignoreparent
		commandLineOption = commandLineOptions.createBoolean('ignoreparent',
															 'ignoreparentprocess',
															 'ignoreParentProcess');
		commandLineOptions.add(commandLineOption);

		// -ignoreourselves
		commandLineOption = commandLineOptions.createBoolean('ignoreourselves',
															 null,
															 'ignoreOurselves');
		commandLineOptions.add(commandLineOption);

		// -loglevel
		commandLineOption = commandLineOptions.createObjectArray('loglevel',
																 'log,logger,logging',
																 'logLevel');
		commandLineOption.addStringProperty('regexp');
		commandLineOption.addEnumerationProperty('level', Level);
		commandLineOptions.add(commandLineOption);

		// -mode
		commandLineOption = commandLineOptions.createEnumeration('mode',
																 'udpmode',
																 'mode',
																 UDPMode);
		commandLineOptions.add(commandLineOption);

		// -multicastaddress
		commandLineOption = commandLineOptions.createStringArray('multicastaddresses',
																 'multicastaddress,listenon,source,sources',
																 'multicastAddresses');
		commandLineOptions.add(commandLineOption);

		// -port
		commandLineOption = commandLineOptions.createNumber('port',
															'listenon,serverport,udpport,udpserverport',
															'port');
		commandLineOptions.add(commandLineOption);

		// -reuseaddr
		commandLineOption = commandLineOptions.createBoolean('reuseaddr',
															 'reuseaddress',
															 'reuseAddr');
		commandLineOptions.add(commandLineOption);
		result = commandLineOptions.parse(result);
		if(result.eventMode === null) {
			if(result.encryptionKey === undefined || result.encryptionKey === null || result.encryptionKey.length <= 0) {
				result.eventMode = UDPServerEventMode.RAW;
			} else {
				result.eventMode = UDPServerEventMode.MESSAGE;
			}
		}
		return result;
	}
}
// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
    util.Help.print(UDPServerOptions);
    return;
}
module.exports = UDPServerOptions;