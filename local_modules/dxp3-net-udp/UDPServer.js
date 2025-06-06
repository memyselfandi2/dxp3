/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-net-udp
 *
 * NAME
 * UDPServer
 */
const packageName = 'dxp3-net-udp';
const moduleName = 'UDPServer';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * @module dxp3-net-udp/UDPServer
 */
// We use the crypto module to allow users, if they are so inclined,
// to encrypt and decrypt UDP messages.
const crypto = require('crypto');
// dgram is the core UDP module and provides everything
// we need to read and write UDP messages.
const dgram = require('dgram');
// We are an EventEmitter
const EventEmitter = require('events');
// It's important to log errors and warnings.
const logging = require('dxp3-logging');
// The os module provides operation system related utilities.
// We need it to get the host name of the machine we are running on.
const os = require('os');
// Our Events, Modes and States are abstracted away in separate modules, so
// clients can use them when listening for events.
const UDPAddress = require('./UDPAddress');
const UDPError = require('./UDPError');
const UDPMode = require('./UDPMode');
const UDPServerEvent = require('./UDPServerEvent');
const UDPServerEventMode = require('./UDPServerEventMode');
const UDPServerState = require('./UDPServerState');
// Our externally supplied arguments/environment variables will be read/parsed by
// our UDPServerOptions class
const UDPServerDefaults = require('./UDPServerDefaults');
const UDPServerOptions = require('./UDPServerOptions');
// We use the util.Help class to print out help information.
const util = require('dxp3-util');
// To uniquely identify messages going over the wire, we add
// an uuid to each message.
const uuid = require('dxp3-uuid');
// Now that all modules are defined and loaded we create 
// our logger.
const logger = logging.getLogger(canonicalName);
/**
 * <p>A broadcast address is a network address at which all devices connected to
 * a multiple-access communications network are enabled to receive datagrams.
 * A message sent to a broadcast address may be received by all network-attached hosts.
 * In contrast, a multicast address is used to address a specific group of devices and
 * a unicast address is used to address a single device.</p>
 * <p>Setting all the bits of an IP address to one, or 255.255.255.255, forms the limited broadcast address.
 * Sending a UDP datagram to this address delivers the message to any host on the local network segment.
 * Because routers never forward messages sent to this address, only hosts on the network segment
 * receive the broadcast message.</p>
 * <p>Broadcasts can be directed to specific portions of a network by setting all bits of the host identifier.
 * For example, to send a broadcast to all hosts on the network identified by IP addresses starting
 * with 192.168.1, use the address 192.168.1.255.</p>
 * 
 * @example
 * const udp = require('dxp3-net-udp');
 * let udpServer = new udp.UDPServer();
 * udpServer.on('test', function(_data, _remoteAddressInformation) {
 * });
 * udpServer.start();
 *
 * let udpServer2 = new udp.UDPServer();
 * udpServer2.setEventMode(udp.UDPServerEventMode.RAW);
 * udpServer2.on(udp.UDPServerEventMode.RAW, function(_rawMessage, _remoteAddressInformation) {
 *     console.log('Message: ' + JSON.stringify(_rawMessage));
 * });
 * udpServer2.start();
 *
 * let udpServer3 = new udp.UDPServer();
 * udpServer3.setEncryption('longencryptionkey')
 * udpServer3.setEventMode(udp.UDPServerEventMode.MESSAGE);
 * udpServer3.on(udp.UDPServerEventMode.MESSAGE, function(_decryptedMessage, _remoteAddressInformation) {
 *     console.log('Message: ' + JSON.stringify(_decryptedMessage));
 * });
 * udpServer3.start();
 */
class UDPServer extends EventEmitter {
    /*********************************************
     * CONSTRUCTOR
     ********************************************/

    /**
	 * @param {module:dxp3-net-udp/UDPServerOptions~UDPServerOptions} _options
     */
	constructor(_options) {
		logger.trace('constructor(...): start.');
		super();
		this._options = UDPServerOptions.parse(_options);
		// Our socket will be created when our start method is called.
		// For now set it to null.
		this.socket = null;
		// Lets define our socket event handlers. We'll attach them
		// to the socket when it is created in our start method.
		this.socketCloseHandler = () => {
			logger.trace('socketCloseHandler(): start.');
			// With the socket closed, we should remove our event handlers.
			this.socket.off('close', this.socketCloseHandler);
			this.socket.off('error', this.socketErrorHandler);
			this.socket.off('listening', this.socketListeningHandler);
			this.socket.off('message', this.socketMessageHandler);
			this.socket.off('message', this.socketEventHandler);
			this.socket.off('message', this.socketRawHandler);
			// Set socket to null to allow it to be garbage collected.
			this.socket = null;
			// Set our state to STOPPED.
			this._state = UDPServerState.STOPPED;
			// Let anyone who is interested know that we have stopped.
			logger.info('Stopped.');
			this.emit(UDPServerEvent.STOPPED);
			logger.trace('socketCloseHandler(): end.');
		}
		this.socketErrorHandler = (_error) => {
			logger.error(_error);
			// Let anyone who is interested know that there was an error.
			this.emit(UDPServerEvent.ERROR, UDPError.from(_error));
			this.socket.close();
		}
		this.socketListeningHandler = () => {
			logger.trace('socketListeningHandler(): start.');
    		logger.debug('socketListeningHandler(): Mode is \'' + this._options.mode + '\'.');
    		switch(this._options.mode) {
    			case UDPMode.LIMITED_BROADCAST:
	        	case UDPMode.DIRECTED_BROADCAST:
	        		logger.debug('socketListeningHandler(): Set broadcast to true.');
		        	this.socket.setBroadcast(true);
		        	break;
		        case UDPMode.MULTICAST:
	        		logger.debug('socketListeningHandler(): Set broadcast to true.');
		        	this.socket.setBroadcast(true);
		            try {
		            	for(let i=0;i < this._options.multicastAddresses.length;i++) {
		            		let multicastAddress = this._options.multicastAddresses[i];
		            		logger.info('Adding membership to ' + multicastAddress);
			                this.socket.addMembership(multicastAddress);
		            	}
		            } catch (_exception) {
		            	logger.error('socketListeningHandler(): UDPServer unable to add membership: ' + _exception);
		            }
		            this.socket.setMulticastTTL(8);
		            break;
		        default:
		        	this.socket.setBroadcast(false);
	        }
	        // When we bind the socket, it will start listening for UDP messages.
			// That means we have started successfully. Set our state to RUNNING.
			this._state = UDPServerState.RUNNING;
    		logger.debug('socketListeningHandler(): Running.');
			// Let anyone who is interested know that we are up and running.
			let listeningOn = this.socket.address();
			logger.info('Listening at ' + listeningOn.address + ':' + listeningOn.port);
			this.emit(UDPServerEvent.RUNNING, listeningOn.address, listeningOn.port);
			logger.trace('socketListeningHandler(): end.');
		}
		this.socketEventHandler = (_encodedPayload, _remoteAddressInformation) => {
	     	this._decode(_encodedPayload, (_error, _payload) => {
	            if(_error) {
	            	logger.debug('socketEventHandler(): Decoding error. Highly likely a message encrypted with a different encryption key.');
	            	// If there was an error, we ignore this message.
	                return;
	            }
	            // Check if this message was sent by our parent process.
				if(_payload.processId === this._processId) {
		            // We may have been told to ignore these messages.
					if(this._options.ignoreParentProcess) {
		            	logger.trace('socketEventHandler(): Ignoring message received from our parent process.');
						return;
					}
				}
	            // Check if this message was sent by ourselves.
				if(_payload.id === this._id) {
		            // We may have been told to ignore these messages.
		            if(this._options.ignoreOurselves) {
		            	logger.trace('socketEventHandler(): Ignoring message received by ourselves.');
						return;
					}
				}
				_remoteAddressInformation.processId = _payload.processId;
				_remoteAddressInformation.id = _payload.id;
				_remoteAddressInformation.hostname = _payload.hostname;
				logger.debug('Event received: ' + _payload.event + ', ' + JSON.stringify(_payload.data));
				this.emit(_payload.event, _payload.data, _remoteAddressInformation);
	        });
	    }
		this.socketMessageHandler = (_encodedPayload, _remoteAddressInformation) => {
	     	this._decode(_encodedPayload, (_error, _payload) => {
	            if(_error) {
	            	logger.debug('socketMessageHandler(): Decoding error. Highly likely a message encrypted with a different encryption key.');
	            	// If there was an error, we ignore this message.
	                return;
	            }
	            // Check if this message was sent by our parent process.
				if(_payload.processId === this._processId) {
		            // We may have been told to ignore these messages.
					if(this._options.ignoreParentProcess) {
		            	logger.trace('socketMessageHandler(): Ignoring message received from our parent process.');
						return;
					}
				}
	            // Check if this message was sent by ourselves.
				if(_payload.id === this._id) {
		            // We may have been told to ignore these messages.
		            if(this._options.ignoreOurselves) {
		            	logger.trace('socketMessageHandler(): Ignoring message received by ourselves.');
						return;
					}
				}
				_remoteAddressInformation.processId = _payload.processId;
				_remoteAddressInformation.id = _payload.id;
				_remoteAddressInformation.hostname = _payload.hostname;
				logger.debug('Message received: ' + JSON.stringify(_payload));
				this.emit(UDPServerEvent.MESSAGE, _payload, _remoteAddressInformation);
	        });
	    }
	    this.socketRawHandler = (_payload, _remoteAddressInformation) => {
			logger.debug('Raw message received: ' + _payload);
	    	this.emit(UDPServerEvent.RAW, _payload, _remoteAddressInformation);
	    }
	    // If the eventmode is not specified we set it to UDPServerEventMode.EVENT.
	    // That way we don't emit raw nor decrypted messages.
	    this._options.eventMode = this._options.eventMode || UDPServerEventMode.EVENT;
		logger.info('Address              : ' + this._options.address);
		logger.info('Port                 : ' + this._options.port);
		logger.info('Event mode           : ' + this._options.eventMode);
		if(this._options.multicastAddresses.length > 0) {
			for(let i=0;i < this._options.multicastAddresses.length;i++) {
				let multicastAddress = this._options.multicastAddresses[i];
				if(i===0) {
			logger.info('Multicastaddresses   : ' + multicastAddress);
				} else {
			logger.info('                       ' + multicastAddress);
				}
			}
			this.addDestinations(this._options.multicastAddresses);
		}
		logger.info('Mode                 : ' + this._options.mode);
		for(let i=0;i < this._options.destinations.length;i++) {
			let destination = this._options.destinations[i];
			if(i===0) {
		logger.info('Destinations         : ' + destination.address + ':' + destination.port);
			} else {
		logger.info('                       ' + destination.address + ':' + destination.port);
			}
		}
		logger.info('Ignore parent process: ' + this._options.ignoreParentProcess);
		logger.info('Ignore ourselves     : ' + this._options.ignoreOurselves);
		logger.info('Reuse address        : ' + this._options.reuseAddr);
		// By default we assume no encryption.
		this._encryptionKey = null;
		// If an encryption password was supplied, we create the cipher and decipher
		if((this._options.encryptionKey != undefined) &&
		   (this._options.encryptionKey != null) &&
		   (this._options.encryptionKey.length > 0)) {
		   	this.setEncryption(this._options.encryptionKey);
		logger.info('Encryption           : on');
		logger.info('Encryption algorithm : ' + this._options.encryptionAlgorithm);
		} else {
		logger.warn('Encryption           : off');
		}
		// Our unique identifier, our process identifier and the host name of the machine we are running on 
		// will be transmitted in our UDP messages.
		this._id = uuid.v4();
		this._processId = process.pid;
		this._hostName = os.hostname();
		logger.debug('UDPServer ID         : ' + this._id);
		logger.debug('Process ID           : ' + this._processId);
		logger.debug('Host name            : ' + this._hostName);
		// All done constructing our UDPServer.
		// It is time to set our state to INITIALIZED.
		this._state = UDPServerState.INITIALIZED;
		logger.debug('constructor(...): Initialized.');
		logger.trace('constructor(...): end.');
	}

    /*********************************************
     * PUBLIC METHODS
     ********************************************/

	/**
	 * Start the UDPServer.
	 * @fires module:dxp3-net/UDPServerEvent.STARTING
	 * @throws {module:dxp3-net/UDPError.ILLEGAL_STATE} thrown when the server is in the process of stopping.
	 * @throws {module:dxp3-net/UDPError.SOCKET_EXCEPTION} thrown when something goes wrong binding to the UDP port.
	 */
	start() {
		logger.trace('start(): start.');
		// No point in starting if we are already running or
		// are starting.
		if((this._state === UDPServerState.RUNNING) ||
		   (this._state === UDPServerState.STARTING)) {
		   	// Initially we threw an illegal state exception, but we deem that to harsh.
			// There really is no problem with calling start again if we are already starting or running. 
			logger.debug('start(): Already running or starting.');
			logger.trace('start(): end.');
		   	return;
		}
		// If we are in the process of stopping, we'll have to wait until
		// we have completely stopped before we can start again.
		// Throw an ILLEGAL STATE error.
		if(this._state === UDPServerState.STOPPING) {
			logger.trace('start(): end.');
			throw UDPError.ILLEGAL_STATE;
		}
		// If we made it this far, it means we are either initialized or stopped.
		// Set our state to STARTING.
		this._state = UDPServerState.STARTING;
		// Let anyone who is interested know that we are starting.
		logger.info('Starting.');
		this.emit(UDPServerEvent.STARTING);
		// Create our socket and add all the different event handlers.
		// These event handlers will be detached when the socket is closed.
		try {
	    	this.socket = dgram.createSocket({type: 'udp4', reuseAddr: this._options.reuseAddr });
			this.socket.on('close', this.socketCloseHandler);
			this.socket.on('error', this.socketErrorHandler);
			this.socket.on('listening', this.socketListeningHandler);
			switch(this._options.eventMode) {
				case UDPServerEventMode.EVENT:
					this.socket.on('message', this.socketEventHandler);
					break;
				case UDPServerEventMode.MESSAGE:
					this.socket.on('message', this.socketMessageHandler);
					break;
				case UDPServerEventMode.RAW:
					this.socket.on('message', this.socketRawHandler);
					break;
				default:
					this._options.eventMode = UDPServerEventMode.EVENT;
					this.socket.on('message', this.socketEventHandler);
					break;
			}
			this.socket.bind(this._options.port, this._options.address);
		} catch(_exception) {
			logger.error('start(): ' + _exception);
			logger.trace('start(): end.');
			throw UDPError.SOCKET_EXCEPTION;
		}
		logger.trace('start(): end.');
	}

	/**
	 * Stop the UDPServer.
	 * @fires module:dxp3-net/UDPServerEvent.STOPPED
	 * @fires module:dxp3-net/UDPServerEvent.STOPPING
	 */
	stop() {
		logger.trace('stop(): start.');
		// No point in stopping if we have already stopped or
		// are in the process of stopping.
		if((this._state === UDPServerState.STOPPED) ||
		   (this._state === UDPServerState.STOPPING)) {
		   	// Initially we threw an illegal state exception, but we deem that to harsh.
			// There really is no problem with calling stop again if we are stopping or have already stopped. 
			logger.debug('stop(): Already stopped or stopping.');
			logger.trace('stop(): end.');
			return;
		}
		// If we are INITIALIZED, we can go directly to stopped.
		if(this._state === UDPServerState.INITIALIZED) {
			// Set our state to STOPPED.
			this._state = UDPServerState.STOPPED;
			// Let anyone who is interested know that we are stopped.
			logger.info('Stopped.');
			this.emit(UDPServerEvent.STOPPED);
			logger.trace('stop(): end.');
			return;
		}
		// Set our state to STOPPING.
		this._state = UDPServerState.STOPPING;
		logger.info('Stopping.');
		this.emit(UDPServerEvent.STOPPING);
		// We attempt to close the server socket.
		// This should emit a close event, which we handle (socket.on('close',....)).
		// In that function we will set our state to UDPServerState.STOPPED.
		this.socket.close();
		logger.trace('stop(): end.');
	}

	/**
	 * Send an UDP message.
	 * @param {String} event
	 * @param {Object} data
	 * @throws {module:dxp3-net/UDPError.ILLEGAL_ARGUMENT} When the event to be send is empty.
	 * @throws {module:dxp3-net/UDPError.ILLEGAL_STATE} When the UDP server is not RUNNING.
	 */
	send(event = '', data = {}) {
		logger.trace('send(...): start.');
		// Lets first check if we are even running.
		// If we are not running we won't send anything.
		if(this._state != UDPServerState.RUNNING) {
			logger.trace('send(...): end.');
			throw UDPError.ILLEGAL_STATE;
		}
		// Next lets do some defensive programming...check input...
		event = event.trim();
		if(event.length <= 0) {
			logger.trace('send(...): end.');
			throw UDPError.ILLEGAL_ARGUMENT;
		}
		let payload = {};
		payload.event = event;
		payload.processId = this._processId;
		payload.id = this._id;
		payload.hostName = this._hostName;
		payload.data = data;
		this.sendPayload(payload);
	}

	sendPayload(payload) {
		// Encode the payload and send it over the wire.
		this._encode(payload, (_error, _encodedPayload) => {
			// If something went wrong with the encoding we silently return.
	        if (_error) {
				logger.trace('send(...): end.');
	            return false;
	        }
	        if(_encodedPayload === undefined || _encodedPayload === null) {
				logger.trace('send(...): end.');
	        	return false;
	        }
	        let message = Buffer.from(_encodedPayload);
	        for(let i=0;i < this._options.destinations.length;i++) {
	        	let destination = this._options.destinations[i];
	        	this.socket.send(message, 0, message.length, destination.port, destination.address);
	        }
			logger.trace('send(...): end.');
 		});
	}

    /*********************************************
     * GETTERS
     ********************************************/

	get address() {
		return this.getAddress();
	}

	getAddress() {
		return this._options.address;
	}

	get destinations() {
		return this.getDestinations();
	}

	getDestinations() {
		return [...this._options.destinations];
	}

	listDestinations() {
		return this.getDestinations();
	}

	get multicastAddresses() {
		return getMulticastAddresses();
	}

	getMulticastAddresses() {
		return [...this._options.multicastAddresses];
	}

	listMulticastAddresses() {
		return this.getMulticastAddresses();
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

	get ignoreOurselves() {
		return this.getIgnoreOurselves();
	}

	getIgnoreOurselves() {
		return this._options.ignoreOurselves;
	}

	get ignoreParentProcess() {
		return this.getIgnoreParentProcess();
	}

	getIgnoreParentProcess() {
		return this._options.ignoreParentProcess;
	}

	isEncrypted() {
		return (this._encryptionKey != null);
	}

	isInitialized() {
		return this._state === UDPServerState.INITIALIZED;
	}

	isRunning() {
		return this._state === UDPServerState.RUNNING;
	}

	isStarting() {
		return this._state === UDPServerState.STARTING;
	}

	isStopped() {
		return this._state === UDPServerState.STOPPED;
	}

	isStopping() {
		return this._state === UDPServerState.STOPPING;
	}

	isSecure() {
		return this.isEncrypted();
	}

	get eventMode() {
		return this.getEventMode();
	}

	getEventMode() {
		return this._options.eventMode;
	}

	get mode() {
		return this.getMode();
	}

	getMode() {
		return this._options.mode;
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

	get state() {
		return this.getState();
	}

	getState() {
		return this._state;
	}

    /*********************************************
     * SETTERS
     ********************************************/

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
		logger.trace('deleteDestinations(...): end.');
	}

	deleteMulticastAddresses(_multicastAddresses) {
		logger.trace('deleteMulticastAddresses(...): start.');
		if(_multicastAddresses === undefined || _multicastAddresses === null) {
			if(this.socket != null) {
				for(let i=0;i < this._options.multicastAddresses.length;i++) {
					let multicastAddress = this._options.multicastAddresses[i];
					this.socket.dropMembership(multicastAddress);
				}
			}
			this._options.multicastAddresses = [];
			logger.trace('deleteMulticastAddresses(...): end.');
			return;
		}
		if(typeof _multicastAddresses === 'string') {
			_multicastAddresses = _multicastAddresses.trim().split(',');
		}
		if(!Array.isArray(_multicastAddresses)) {
			// Calling deleteDestinations(...) with an argument that is 
			// not a string nor an array could be a programming error.
			// Lets log a warning.
			logger.warn('deleteMulticastAddresses(...): Illegal argument.');
			logger.trace('deleteMulticastAddresses(...): end.');
			throw UDPError.ILLEGAL_ARGUMENT;
		}
		for(let i=0;i < _multicastAddresses.length;i++) {
			let multicastAddress = _multicastAddresses[i];
			let indexOf = this._options.multicastAddresses.indexOf(multicastAddress);
			if(indexOf < 0) {
				continue;
			}
			if(this.socket != null) {
				this.socket.dropMembership(multicastAddress);
			}
			this._options.multicastAddresses.splice(indexOf, 1);
		}
		logger.trace('deleteMulticastAddresses(...): end.');
	}

	set address(_address) {
		this.setAddress(_address);
	}

	setAddress(_address) {
		logger.trace('setAddress(...): start.');
		// Defensive programming...check input...
		if(_address === undefined || _address === null) {
			// Calling setAddress(...) without any arguments could be
			// a programming error. Lets log a warning.
			logger.warn('setAddress(...): Missing arguments.');
			logger.trace('setAddress(...): end.');
			throw UDPError.ILLEGAL_ARGUMENT;
		}
		// We are only able to change our address if we are stopped or initialized.
		if((this._state != UDPServerState.INITIALIZED) && (this._state != UDPServerState.STOPPED)) {
			// Calling setAddress(...) without checking our state could be
			// a programming error. Lets log a warning.
			logger.warn('setAddress(...): Illegal state \'' + this._state + '\'.');
			logger.trace('setAddress(...): end.');
			throw UDPError.ILLEGAL_STATE;
		}
		this._options.address = _address;
		logger.debug('setAddress(...): ' + this._options.address);
		logger.trace('setAddress(...): end.');
	}

	addMulticastAddresses(_multicastAddresses) {
		logger.trace('addMulticastAddresses(...): start.');
		// Defensive programming...check input...
		if(_multicastAddresses === undefined || _multicastAddresses === null) {
			return;
		}
		if(typeof _multicastAddresses === 'string') {
			_multicastAddresses = _multicastAddresses.trim().split(',');
		}
		if(!Array.isArray(_multicastAddresses)) {
			// Calling addMulticastAddresses(...) with an argument that is 
			// not a string nor an array could be a programming error.
			// Lets log a warning.
			logger.warn('addMulticastAddresses(...): Illegal argument.');
			logger.trace('addMulticastAddresses(...): end.');
			throw UDPError.ILLEGAL_ARGUMENT;
		}
		let validMulticastAddresses = [];
		for(let i=0;i < _multicastAddresses.length;i++) {
			let multicastAddress = _multicastAddresses[i];
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
			let indexOf = this._options.multicastAddresses.indexOf(multicastAddress);
			if(indexOf >= 0) {
				continue;
			}
			validMulticastAddresses.push(multicastAddress);
		}
		if(validMulticastAddresses.length <= 0) {
			logger.trace('addMulticastAddresses(...): end.');
			return;
		}
		this.setMode(UDPMode.MULTICAST);
		for(let i=0;i < validMulticastAddresses.length;i++) {
			let multicastAddress = validMulticastAddresses[i];
			this._options.multicastAddresses.push(multicastAddress);
			if(this.socket != null) {
				this.socket.addMembership(multicastAddress);
			}
		}
		addDestinations(validMulticastAddresses);
		logger.trace('addMulticastAddresses(...): end.');
	}

    addDestinations(_destinations) {
		logger.trace('addDestinations(...): start.');
		// Defensive programming...check input...
		if(_destinations === undefined || _destinations === null) {
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
			}
			if(destination.port === undefined || destination.port === null || destination.port <= 0) {
				destination.port = this._options.port;
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
		logger.trace('addDestinations(...): end.');
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

	set encryptionAlgorithm(_encryptionAlgorithm) {
		this.setEncryptionAlgorithm(_encryptionAlgorithm);
	}

	setEncryptionAlgorithm(_encryptionAlgorithm) {
		logger.trace('setEncryptionAlgorithm(...): start.');
		if(_encryptionAlgorithm === undefined || _encryptionAlgorithm === null || (_encryptionAlgorithm.length <= 0)) {
			logger.trace('setEncryptionAlgorithm(...): end.');
			return;
		}
		this._options.encryptionAlgorithm = _encryptionAlgorithm;
		logger.trace('setEncryptionAlgorithm(...): end.');
	}

	set ignoreOurselves(_ignoreOurselves) {
		this.setIgnoreOurselves(_ignoreOurselves);
	}

	setIgnoreOurselves(_ignoreOurselves) {
		logger.trace('setIgnoreOurselves(...): start.');
		// Defensive programming...check input...
		if(_ignoreOurselves === undefined || _ignoreOurselves === null) {
			// Calling setIgnoreOurselves(...) without any arguments could be
			// a programming error. Lets log a warning.
			logger.warn('setIgnoreOurselves(...): Missing arguments.');
			logger.trace('setIgnoreOurselves(...): end.');
			throw UDPError.ILLEGAL_ARGUMENT;
		}
		if(typeof _ignoreOurselves === 'string') {
			_ignoreOurselves = _ignoreOurselves.trim().toLowerCase();
			if(_ignoreOurselves === 'on'   ||
			   _ignoreOurselves === 'true' ||
			   _ignoreOurselves === 'y'	   ||
			   _ignoreOurselves === 'yes') {
				_ignoreOurselves = true;
			} else {
				_ignoreOurselves = false;
			}
		}
		if(typeof _ignoreOurselves != 'boolean') {
			// Calling setIgnoreOurselves(...) without a non boolean argument
			// could be a programming error. Lets log a warning.
			logger.warn('setIgnoreOurselves(...): Argument is not a string nor a boolean type.');
			logger.trace('setIgnoreOurselves(...): end.');
			throw UDPError.ILLEGAL_ARGUMENT;
		}
		this._options.ignoreOurselves = _ignoreOurselves;
		logger.debug('setIgnoreOurselves(...): Set to \'' + _ignoreOurselves + '\'.');
		logger.trace('setIgnoreOurselves(...): end.');
	}

	set ignoreParentProcess(_ignoreParentProcess) {
		this.setIgnoreParentProcess(_ignoreParentProcess);
	}

	setIgnoreParentProcess(_ignoreParentProcess) {
		logger.trace('setIgnoreParentProcess(...): start.');
		// Defensive programming...check input...
		if(_ignoreParentProcess === undefined || _ignoreParentProcess === null) {
			// Calling setIgnoreParentProcess(...) without any arguments could be
			// a programming error. Lets log a warning.
			logger.warn('setIgnoreParentProcess(...): Missing arguments.');
			logger.trace('setIgnoreParentProcess(...): end.');
			throw UDPError.ILLEGAL_ARGUMENT;
		}
		if(typeof _ignoreParentProcess === 'string') {
			_ignoreParentProcess = _ignoreParentProcess.trim().toLowerCase();
			if(_ignoreParentProcess === 'on'   ||
			   _ignoreParentProcess === 'true' ||
			   _ignoreParentProcess === 'y'	   ||
			   _ignoreParentProcess === 'yes') {
				_ignoreParentProcess = true;
			} else {
				_ignoreParentProcess = false;
			}
		}
		if(typeof _ignoreParentProcess != 'boolean') {
			// Calling setIgnoreParentProcess(...) without a non boolean argument
			// could be a programming error. Lets log a warning.
			logger.warn('setIgnoreParentProcess(...): Argument is not a string nor a boolean type.');
			logger.trace('setIgnoreParentProcess(...): end.');
			throw UDPError.ILLEGAL_ARGUMENT;
		}
		this._options.ignoreParentProcess = _ignoreParentProcess;
		logger.debug('setIgnoreParentProcess(...): Set to \'' + _ignoreParentProcess + '\'.');
		logger.trace('setIgnoreParentProcess(...): end.');
	}

	set eventMode(_eventMode) {
		this.setEventMode(_eventMode);
	}

	setEventMode(_eventMode) {
		logger.trace('setEventMode(...): start.');
		if(_eventMode === undefined || _eventMode === null || _eventMode.length <= 0) {
			_eventMode = UDPServerEventMode.EVENT;
		} else {
			try {
				_eventMode = UDPServerEventMode.parse(_eventMode);
			} catch(_exception) {
				_eventMode = UDPServerEventMode.EVENT;
			}
		}
		if(this._options.eventMode === _eventMode) {
			logger.debug('setEventMode(...): Current eventmode is already set to \'' + _eventMode + '\'. Ignoring update.');
			logger.trace('setEventMode(...): end.');
			return;
		}
		this._options.eventMode = _eventMode;
		if(this.socket === undefined || this.socket === null) {
			logger.trace('setEventMode(...): end.');
			return;
		}
		switch(this._options.eventMode) {
			case UDPServerEventMode.EVENT:
				this.socket.on('message', this.socketEventHandler);
				this.socket.off('message', this.socketMessageHandler);
				this.socket.off('message', this.socketRawHandler);
				break;
			case UDPServerEventMode.MESSAGE:
				this.socket.on('message', this.socketMessageHandler);
				this.socket.off('message', this.socketEventHandler);
				this.socket.off('message', this.socketRawHandler);
				break;
			case UDPServerEventMode.RAW:
				this.socket.on('message', this.socketRawHandler);
				this.socket.off('message', this.socketEventHandler);
				this.socket.off('message', this.socketMessageHandler);
				break;
			default:
				this._options.eventMode = UDPServerEventMode.EVENT;
				this.socket.on('message', this.socketEventHandler);
				this.socket.off('message', this.socketMessageHandler);
				this.socket.off('message', this.socketRawHandler);
		}
		logger.trace('setEventMode(...): end.');
	}

	set mode(_udpMode) {
		this.setMode(_udpMode);
	}

	setMode(_udpMode) {
		logger.trace('setMode(...): start.');
		// Defensive programming...check input...
		if(_udpMode === undefined || _udpMode === null) {
			// Calling setMode(...) without any arguments could be
			// a programming error. Lets log a warning.
			logger.warn('setMode(...): Missing arguments.');
			logger.trace('setMode(...): end.');
			throw UDPError.ILLEGAL_ARGUMENT;
		}
		try {
			let desiredMode = UDPMode.parse(_udpMode);
			// Check if the desired mode is different from the current mode.
			if(desiredMode === this._options.mode) {
				logger.debug('setMode(...): The current mode \'' + this._options.mode + '\' is the same as the new mode.');
				logger.trace('setMode(...): end.');
				return;
			}
			this._options.mode = UDPMode.parse(_udpMode);
			if(this.socket != null) {
	    		switch(this._options.mode) {
	    			case UDPMode.LIMITED_BROADCAST:
		        	case UDPMode.DIRECTED_BROADCAST:
		        		logger.debug('socketListeningHandler(): Set broadcast to true.');
			        	this.socket.setBroadcast(true);
			        	break;
			        case UDPMode.MULTICAST:
		        		logger.debug('socketListeningHandler(): Set broadcast to true.');
			        	this.socket.setBroadcast(true);
			            try {
			            	for(let i=0;i < this._options.multicastAddresses.length;i++) {
			            		let multicastAddress = this._options.multicastAddresses[i];
			            		logger.info('Adding membership to ' + multicastAddress);
				                this.socket.addMembership(multicastAddress);
			            	}
			            } catch (_exception) {
			            	logger.error('socketListeningHandler(): UDPServer unable to add membership: ' + _exception);
			            }
			            this.socket.setMulticastTTL(8);
			            break;
			        default:
			        	this.socket.setBroadcast(false);
		        }
			}
			logger.debug('setMode(...): Set mode to \'' + this._options.mode + '\'.');
		} catch(_exception) {
			logger.warn('setMode(...): ' + _exception.toString());
			throw _exception;
		}
		logger.trace('setMode(...): end.');
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
			_port = _port.trim();
			if(_port.length <= 0) {
				// Calling setPort(...) with an empty argument could be
				// a programming error. Lets log a warning.
				logger.warn('setPort(...): Port is an empty string.')
				logger.trace('setPort(...): end.');
				throw UDPError.ILLEGAL_ARGUMENT;
			}
			_port = parseInt(_port, 10);
		}
		if(isNaN(_port)) {
			// Port must be a number. This could be a programming error.
			logger.warn('setPort(...): Port is not a number.');
			logger.trace('setPort(...): end.');
			throw UDPError.ILLEGAL_ARGUMENT;
		}
		if(_port <= 0) {
			logger.warn('setPort(...): Port is smaller or equal to 0.');
			logger.trace('setPort(...): end.');
			throw UDPError.ILLEGAL_ARGUMENT;
		}
		// If the port is the same we ignore the request.
		if(this._options.port === _port) {
			logger.debug('setPort(...): Port is already set to \'' + this._options.port + '\'.');
			logger.trace('setPort(...): end.');
			return;
		}
		// We are only able to change our port if we are stopped or initialized.
		if((this._state != UDPServerState.INITIALIZED) &&
		   (this._state != UDPServerState.STOPPED)) {
			// Calling setPort(...) without checking our state could be
			// a programming error. Lets log a warning.
			logger.warn('setPort(...): Illegal state \'' + this._state + '\'.');
			logger.trace('setPort(...): end.');
			throw UDPError.ILLEGAL_STATE;
		}
		this._options.port = _port;
		if(this._options.mode === UDPMode.MULTICAST) {
			for(let i=0;i < this._options.destinations.length;i++) {
				this._options.destinations[i].port = this._options.port;
			}
		}
		logger.debug('setPort(...): Port set to \'' + this._options.port + '\'.');
		logger.trace('setPort(...): end.');
	}

    /*********************************************
     * PRIVATE METHODS
     ********************************************/

	_decode(encodedData, callback) {
		logger.trace('_decode(...): start.');
		let result = null;
		try {
			if(this._encryptionKey != null) {
				encodedData = encodedData.toString();
				let initializationVector = encodedData.slice(-24);
				initializationVector = Buffer.from(initializationVector, 'base64');
				encodedData = encodedData.slice(0, encodedData.length-24);
				let encodedDataBuffer = Buffer.from(encodedData, 'base64');
				let decipher = crypto.createDecipheriv(this._options.encryptionAlgorithm, this._encryptionKey, initializationVector);
				let dataString = '';
				dataString += decipher.update(encodedDataBuffer, 'base64', 'utf8');
				dataString += decipher.final('utf8');
		    	result = JSON.parse(dataString);
		    } else {
		        result = JSON.parse(encodedData);
		    }
		} catch(_exception) {
			logger.error('_decode(...): ' + _exception);
		    return callback(_exception, null);
		}
		logger.trace('_decode(...): end.');
		return callback(null, result);
	}

	_encode(data = {}, callback) {
		logger.trace('_encode(...): start.');
		let result = null;
		try {
			if(this._encryptionKey != null) {
				let dataString = JSON.stringify(data);
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
				result = JSON.stringify(data);
			}
		} catch(_exception) {
			logger.error('_encode(...): ' + _exception);
			logger.trace('_encode(...): end.');
		    return callback(_exception, null);
		}
		logger.trace('_encode(...): end.');
		return callback(null, result);
	}

	static main() {
		try {
	        let udpServerOptions = UDPServerOptions.parseCommandLine();
	        logging.setLevel(udpServerOptions.logLevel);
	        if(udpServerOptions.help) {
	        	util.Help.print(UDPServer);
	        	return;
	        }
			let udpServer = new UDPServer(udpServerOptions);
			udpServer.on(UDPServerEvent.MESSAGE, (_message, _remoteAddressInformation) => {
				console.log('Message: ' + JSON.stringify(_message));
			});
			udpServer.on(UDPServerEvent.RAW, (_message, _remoteAddressInformation) => {
				console.log('Raw message: ' + _message);
			});
			udpServer.on(UDPServerEvent.ERROR, (_error) => {
				console.log('UDPServer error: ' + _error.message);
			});
			udpServer.on(UDPServerEvent.RUNNING, (_address, _port) => {
				console.log('To get help include the -help option:');
				console.log('node UDPServer -help');
				console.log('');
				console.log('UDPServer running at ' + _address + ':' + _port);
			});
			udpServer.start();
		} catch(_exception) {
			console.log(_exception.message);
			process.exit(99);
		}
	}
}
// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
	UDPServer.main();
	return;
}
module.exports = UDPServer;