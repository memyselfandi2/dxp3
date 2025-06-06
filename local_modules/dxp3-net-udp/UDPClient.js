/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-net-udp
 *
 * NAME
 * UDPClient
 */
const packageName = 'dxp3-net-udp';
const moduleName = 'UDPClient';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * Use an UDPClient to send UDP messages over the network.
 * It does not listen for incoming messages. It simply fires and forgets.
 * Based on the addresses to send to it decides if these are broadcast,
 * multicast or unicast destinations.
 *
 * @example
 * const udp = require('dxp3-net-udp');
 * // Lets create an UDPClient. We trust the default options will suffice.
 * let udpClient = new udp.UDPClient();
 * udpClient.send('update', {id:1001, name: 'product one'});
 * // You can change the following settings
 *
 * @module dxp3-net-udp/UDPClient
 */
// We use the crypto module to allow users, if they are so inclined,
// to encrypt UDP messages.
const crypto = require('crypto');
// dgram is the core UDP module and provides everything
// we need to write UDP messages.
const dgram = require('dgram');
// We are an EventEmitter
const EventEmitter = require('events');
// It's important to log errors and warnings.
const logging = require('dxp3-logging');
// The os module provides operation system related utilities.
// We need it to get the host name of the machine we are running on.
// The host name will be added to all UDP messages we send.
const os = require('os');
const UDPAddress = require('./UDPAddress');
// Our Events and Errors are abstracted away in separate classes, so
// users can use them when listening for events.
const UDPClientEvent = require('./UDPClientEvent');
const UDPError = require('./UDPError');
// Our externally supplied arguments/environment variables will be read/parsed by
// our UDPClientOptions class
const UDPClientOptions = require('./UDPClientOptions');
const UDPMode = require('./UDPMode');
// We use the util.Help class to print out help information.
const util = require('dxp3-util');
// To uniquely identify messages going over the wire, we add
// an uuid to each message.
const uuid = require('dxp3-uuid');

const logger = logging.getLogger(canonicalName);
/**
 * Use an UDPClient to send UDP messages over the network.
 * It does not listen for incoming messages. It simply fires and forgets.
 * We explicitly call bind() to allow us to specify broadcast and/or multicast settings
 * in case we are using broadcast or multicast addresses.
 */
class UDPClient extends EventEmitter  {
    /*********************************************
     * CONSTRUCTOR
     ********************************************/

	/**
	 * @param {Object|module:dxp3-net-udp/UDPClientOptions~UDPClientOptions} args
	 */
	constructor(_args) {
		super();
		this._options = UDPClientOptions.parse(_args);
		logger.info("Port                : " + this._options.port);
		for(let i=0;i < this._options.destinations.length;i++) {
			let destination = this._options.destinations[i];
			if(i===0) {
		logger.info('Destinations        : ' + destination.address + ':' + destination.port);
			} else {
		logger.info('                      ' + destination.address + ':' + destination.port);
			}
		}
		logger.info("Encryption algorithm: " + this._options.encryptionAlgorithm);
		// Our unique identifier, our process identifier and the host name of the machine we are running on 
		// will be transmitted in our UDP messages.
		this._id = uuid.v4();
		this._processId = process.pid;
		this._hostName = os.hostname();
		logger.info("ID                  : " + this._id);
		logger.info("Process ID          : " + this._processId);
		logger.info("Host name           : " + this._hostName);
		// By default we assume no encryption.
		this._encryptionKey = null;
		// If an encryption key was supplied, we create the cipher and decipher
		if((this._options.encryptionKey != undefined) && (this._options.encryptionKey != null)) {
			this.setEncryption(this._options.encryptionKey);
			this._options.encryptionKey = null;
		}
		// Lets define our socket event handlers. We'll attach them
		// to the socket when it is created.
		this._socketCloseHandler = () => {
			logger.debug('socketCloseHandler(): Socket closed');
			// With the socket closed, we should remove our event handlers.
			this.socket.off('close', this._socketCloseHandler);
			this.socket.off('error', this._socketErrorHandler);
			// Set socket to null to allow it to be garbage collected.
			this.socket = null;
		}
		// If there was a socket error we close the socket.
		this._socketErrorHandler = (_error) => {
			logger.error('socketErrorHandler(): ' + _error);
			this.socket.close();
			this.emit(UDPClientEvent.ERROR, _error);
		}
		// The socket will be created when our send method is executed for the first time.
		this.socket = null;
		this._options.mode = null;
		this._checkMode();
		logger.info("Broadcast           : " + (this._options.mode != UDPMode.UNICAST));
	}

    /*********************************************
     * PUBLIC METHODS
     ********************************************/

    close() {
		logger.trace('close(...): start.');
		if(this.socket != null) {
	    	this.socket.close();
	    }
		logger.trace('close(...): end.');
    }

    stop() {
    	this.close();
    }

	/**
	 * Send an UDP message.
	 * @param {String} _event
	 * @param {Object} _data
	 * @throws {module:dxp3-net/UDPError.ILLEGAL_ARGUMENT} When the event to be send is empty.
	 */
	send(_event = '', _data = {}, _callback) {
		logger.trace('send(...): start.');
		// Defensive programming...check input...
		if(_event === undefined || _event === null) {
			// Calling send(...) without any arguments could be
			// a programming error. Lets log a warning.
			logger.warn('send(...): Missing arguments.');
			logger.trace('send(...): end.');
			throw UDPError.ILLEGAL_ARGUMENT;
		}
		_event = _event.trim();
		if(_event.length <= 0) {
			// Calling send(...) without an event could be
			// a programming error. Lets log a warning.
			logger.warn('send(...): Empty arguments.');
			logger.trace('send(...): end.');
			throw UDPError.ILLEGAL_ARGUMENT;
		}
		logger.debug('send(...): send(' + _event + ',...).');
		if(this.socket === null) {
			logger.trace('send(...): Create new socket.');
			// Create our socket and add all the different event handlers.
			// These event handlers will be detached when the socket is closed.
			this.socket = dgram.createSocket({type: 'udp4',reuseAddr: true});
			this.socket.on('close', this._socketCloseHandler);
			this.socket.on('error', this._socketErrorHandler);
			if(this._options.port <= 0) {
				this._options.port = 0;
			}
			// The reasons we bind the socket are:
			// 1) because the user may have specified a port, and
			// 2) because we need to set the broadcast flag depending on the UDPMode based
			//    on the given destinations.
			this.socket.bind(this._options.port, () => {
				switch(this._options.mode) {
					case UDPMode.LIMITED_BROADCAST:
					case UDPMode.DIRECTED_BROADCAST:
						this.socket.setBroadcast(true);
						break;
					case UDPMode.MULTICAST:
						this.socket.setBroadcast(true);
			            this.socket.setMulticastTTL(8);
			            break;
			        case UDPMode.UNICAST:
			        	this.socket.setBroadcast(false);
			        	break;
			        default:
			        	this.socket.setBroadcast(false);
						break;			        	
		        }
				this._send(_event, _data, _callback);
			});
		} else {
			this._send(_event, _data, _callback);
		}
	}

	_send(_event, _data, _callback) {
		let payload = {};
		payload.event = _event;
		payload.processId = this.processId;
		payload.id = this.id;
		payload.hostName = this.hostName;
		payload.data = _data;
		// Encode the payload and send it over the wire.
		this._encode(payload, (_error, _encodedPayload) => {
			// If something went wrong with the encoding we log and return.
	        if(_error) {
				logger.error('send(...): ' + _error);
				logger.trace('send(...): end.');
				if(_callback) {
					return _callback(_error);
				}
	            return;
	        }
	        if(_encodedPayload === undefined || _encodedPayload === null) {
				logger.warn('send(...): The encoded payload is undefined or null.');
				logger.trace('send(...): end.');
				if(_callback) {
					return _callback();
				}
	        	return;
	        }
	        let message = Buffer.from(_encodedPayload);
	        let numberOfDestinations = this._options.destinations.length;
	        let numberOfSendMessages = 0;
	        for(let i=0;i < numberOfDestinations;i++) {
	        	let destination = this._options.destinations[i];
 				logger.debug('send(...): Sending to ' + destination.address + ':' + destination.port);
				// From nodejs dgram documentation:
				// If the socket has not been previously bound with a call to bind,
				// the socket is assigned a random port number and is bound to the
				// "all interfaces" address ('0.0.0.0' for udp4 sockets, '::0' for udp6 sockets.)
 				this.socket.send(message, 0, message.length, destination.port, destination.address, (_error) => {
 					if(_error) {
 						logger.error(_error);
 					}
 					numberOfSendMessages++;
 					if(numberOfSendMessages >= numberOfDestinations) {
 						if(_callback) {
	 						_callback();
	 					}
 					}
 				});
 			}
			logger.trace('send(...): end.');
 		});
	}

    /*********************************************
     * GETTERS
     ********************************************/

	get destinations() {
		return this.getDestinations();
	}

	getDestinations() {
		return [...this._options.destinations];
	}

	listDestinations() {
		return this.getDestinations();
	}

	get encryptionAlgorithm() {
		return this.getEncryptionAlgorithm();
	}

	getEncryptionAlgorithm() {
		return this._options.encryptionAlgorithm;
	}

	get hostName() {
		return this.getHostName();
	}

	getHostName() {
		return this._hostName;
	}

	get id() {
		return this.getId();
	}

	getId() {
		return this._id;
	}

	isEncrypted() {
		return (this._encryptionKey != null);
	}

	get port() {
		return this.getPort();		
	}

	getPort() {
		return this._options.port;
	}

	get processId() {
		return this.getProcessId();
	}

	getProcessId() {
		return this._processId;
	}

    /*********************************************
     * SETTERS
     ********************************************/

    addDestinations(_destinations) {
		logger.trace('addDestinations(...): start.');
		// Defensive programming...check input...
		if(_destinations === undefined || _destinations === null) {
			// No point in adding nothing.
			logger.trace('addDestinations(...): end.');
			return;
		}
		if(typeof _destinations === 'string') {
			_destinations = _destinations.trim();
			_destinations = _destinations.split(',');
		}
		if(!Array.isArray(_destinations)) {
			// Calling addDestinations(...) with an argument that is 
			// not a string nor an array could be a programming error.
			// Lets log a warning.
			logger.warn('addDestinations(...): Illegal argument.');
			logger.trace('addDestinations(...): end.');
			throw UDPError.ILLEGAL_ARGUMENT;
		}
		let validDestinations = [];
		for(let i=0;i < _destinations.length;i++) {
			let destination = _destinations[i];
			if(destination === undefined || destination === null) {
				// No point in adding nothing. Continue with the rest.
				continue;
			}
			if(typeof destination === 'string') {
				destination = destination.trim();
				if(destination.length <= 0) {
					// No point in adding nothing. Continue with the rest.
					continue;
				}
				let indexOfColon = destination.indexOf(':');
				let address = null;
				let port = -1;
				if(indexOfColon < 0) {
					address = destination;
					// If the port is omitted, we use our own port instead.
					port = this._options.port;
				} else {
					address = destination.substring(0, indexOfColon);
					port = destination.substring(indexOfColon + 1);
					try {
						port = parseInt(port);
					} catch(_exception) {
						logger.warn('addDestinations(...): Error while parsing the port: ' + _exception);
						logger.trace('addDestinations(...): end.');
						throw UDPError.ILLEGAL_ARGUMENT;
					}
				}
				destination = {
					address: address,
					port: port
				}
			}
			if(destination.port <= 0) {
				continue;
			}
			validDestinations.push(destination);
		}
		for(let i=0;i < validDestinations.length;i++) {
			let destination = validDestinations[i];
			let found = false;
			for(let j=0;j < this._options.destinations.length;j++) {
				let tmpDestination = this._options.destinations[j];
				if((tmpDestination.address === destination.address) && (tmpDestination.port === destination.port)) {
					found = true;
					break;
				}
			}
			if(!found) {
				this._options.destinations.push(destination);
				logger.debug('addDestinations(...): Destination \'' + destination.address + ':' + destination.port + '\' added.');
			}
		}
		this._checkMode();
		logger.trace('addDestinations(...): end.');
    }

	deleteDestinations(_destinations) {
		logger.trace('deleteDestinations(...): start.');
		if(_destinations === undefined || _destinations === null) {
			this._options.destinations = [];
			logger.trace('deleteDestinations(...): end.');
			return;
		}
		if(typeof _destinations === 'string') {
			_destinations = _destinations.trim();
			_destinations = _destinations.split(',');
		}
		if(!Array.isArray(_destinations)) {
			// Calling deleteDestinations(...) with an argument that is 
			// not a string nor an array could be a programming error.
			// Lets log a warning.
			logger.warn('deleteDestinations(...): Illegal argument.');
			logger.trace('deleteDestinations(...): end.');
			throw UDPError.ILLEGAL_ARGUMENT;
		}
		for(let i=0;i < _destinations.length;i++) {
			let destination = _destinations[i];
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
					port = this._options.port;
				} else {
					address = destination.substring(0, indexOfColon);
					port = destination.substring(indexOfColon + 1);
					port = parseInt(port);
				}
				destination = {
					address: address,
					port: port
				}
			}
			let tmpDestinations = [];
			for(let j=0;j < this._options.destinations.length;j++) {
				let tmpDestination = this._options.destinations[j];
				if(tmpDestination.address != destination.address) {
					tmpDestinations.push(tmpDestination);
				} else if(tmpDestination.port != destination.port) {
					tmpDestinations.push(tmpDestination);
				} else {
					logger.debug('deleteDestinations(...): Destination \'' + tmpDestination.address + ':' + tmpDestination.port + '\' deleted.');
				}
			}
			this._options.destinations = tmpDestinations;
		}
		this._checkMode();
		logger.trace('deleteDestinations(...): end.');
	}

	set encryption(_encryption) {
		this.setEncryption(_encryption);
	}

	setEncryption(_encryption) {
		logger.trace('setEncryption(...): start.');
		if(_encryption === undefined || _encryption === null || (_encryption.length <= 0)) {
			this._encryptionKey = null;
			logger.trace('setEncryption(...): end.');
			return;
		}
		this._encryptionKey = crypto.createHash('sha256').update(_encryption).digest();
		logger.trace('setEncryption(...): end.');
	}

	_checkMode() {
		logger.trace('_checkMode(...): start.');
		let newMode = UDPMode.UNICAST;
		for(let i=0;i < this._options.destinations.length;i++) {
			let destination = this._options.destinations[i];
			if(UDPAddress.isLimitedBroadcastAddress(destination.address)) {
				// Upgrade unicast to limited broadcast if one of the destinations
				// is 255.255.255.255
				if(newMode === UDPMode.UNICAST) {
					newMode = UDPMode.LIMITED_BROADCAST;
				}
			} else if(UDPAddress.isDirectedBroadcastAddress(destination.address)) {
				// Upgrade unicast and limited broadcast to directed broadcast if one
				// of the destinations ends with .255
				if(newMode === UDPMode.UNICAST || newMode === UDPMode.LIMITED_BROADCAST) {
					newMode = UDPMode.DIRECTED_BROADCAST;
				}
			} else if(UDPAddress.isMulticastAddress(destination.address)) {
				// If one of the destinations is a multicast address we 
				// set our mode and exit the loop. No point in checking for other destinations,
				// because multicast is as advanced as it can get.
				newMode = UDPMode.MULTICAST;
				break;
			}
		}
		try {
			if(newMode === this._options.mode) {
				logger.debug('_checkMode(...): The current mode is the same as the new mode.');
				logger.trace('_checkMode(...): end.');
				return;
			}
			this._options.mode = newMode;
			logger.debug('_checkMode(...): Set mode to \'' + this._options.mode + '\'.');
			if(this.socket != null) {
				switch(this._options.mode) {
					case UDPMode.LIMITED_BROADCAST:
					case UDPMode.DIRECTED_BROADCAST:
						this.socket.setBroadcast(true);
						break;
					case UDPMode.MULTICAST:
						this.socket.setBroadcast(true);
			            this.socket.setMulticastTTL(8);
			            break;
			        case UDPMode.UNICAST:
			        	this.socket.setBroadcast(false);
			        	break;
			        default:
			        	this.socket.setBroadcast(false);
						break;			        	
		        }
			}
		} catch(_exception) {
			logger.warn('_checkMode(...): ' + _exception.toString());
		}
		logger.trace('_checkMode(...): end.');
	}

	set port(_port) {
		this.setPort(_port);
	}

	setPort(_port) {
		logger.trace('setPort(...): start.');
		// Defensive programming...check input...
		if(_port === undefined || _port === null) {
			// Calling setPort(...) without any arguments could be
			// a programming error. Lets log a warning.
			logger.warn('setPort(...): Missing arguments.')
			logger.trace('setPort(...): end.');
			throw UDPError.ILLEGAL_ARGUMENT;
		}
		if(typeof _port === 'string') {
			_port = parseInt(_port);
		}
		if(isNaN(_port)) {
			// Port must be a number. This could be a programming error.
			logger.warn('setPort(...): Port is not a number.');
			logger.trace('setPort(...): end.');
			throw UDPError.ILLEGAL_ARGUMENT;
		}
		this._options.port = _port;
		logger.debug('setPort(...): Port set to \'' + this._options.port + '\'.');
		logger.trace('setPort(...): end.');
	}

    /*********************************************
     * PRIVATE METHODS
     ********************************************/

	_encode(_data = {}, _callback) {
		let self = this;
		let result = null;
		try {
			if(this._encryptionKey != null) {
				let dataString = JSON.stringify(_data);
				let dataBuffer = Buffer.from(dataString);
				// Every request should have an unique initialization vector.
				let initializationVector = crypto.randomBytes(16);
				// We encrypt the data and we add the initialization vector to the end of the message.
				let cipher = crypto.createCipheriv(this._options.encryptionAlgorithm, this._encryptionKey, initializationVector);
				result = '';
				result += cipher.update(dataBuffer, 'utf8', 'base64');
				result += cipher.final('base64');
				result += initializationVector.toString('base64');
			} else {
				result = JSON.stringify(_data);
			}
		} catch(exception) {
		    return _callback(exception);
		}
		return _callback(null, result);
	}

	static main() {
		try {
	        let udpClientOptions = UDPClientOptions.parseCommandLine();
	        logging.setLevel(udpClientOptions.logLevel);
	        if(udpClientOptions.help) {
	            util.Help.print(UDPClient);
	            return;
	        }
			let udpClient = new UDPClient(udpClientOptions);
			let event = udpClientOptions.event;
			let eventBody = udpClientOptions.eventBody;
			if(event === undefined || event === null) {
				event = 'test';
				if(eventBody === undefined || eventBody === null) {
					eventBody = {name:"test"};
				} else {
					eventBody = eventBody.trim();
					if(eventBody.length <= 0) {
						eventBody = {name:"test"};
					} else {
						eventBody = JSON.parse(eventBody);
					}
				}
			} else if(eventBody === undefined || eventBody === null) {
				eventBody = {};
			} else {
				eventBody = eventBody.trim();
				if(eventBody.length <= 0) {
					eventBody = {};
				} else {
					eventBody = JSON.parse(eventBody);
				}
			}
			// After sending we close the client.
			udpClient.send(event, eventBody, () => {
				udpClient.close();
			});
		} catch(exception) {
			console.log(exception.message);
		}
	}
}
// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
	UDPClient.main();
	return;
}
module.exports = UDPClient;