/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-net-udp
 *
 * NAME
 * UDPBridge
 */
const packageName = 'dxp3-net-udp';
const moduleName = 'UDPBridge';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * @module dxp3-net-udp/UDPBridge
 */
// We are an EventEmitter
const EventEmitter = require('events');
// It's important to log errors and warnings.
const logging = require('dxp3-logging');
// The os module provides operation system related utilities.
// We need it to get the host name of the machine we are running on.
const os = require('os');
// Our Events, Modes and States are abstracted away in separate modules, so
// clients can use them when listening for events.
const UDPError = require('./UDPError');
const UDPMode = require('./UDPMode');
const UDPBridgeEvent = require('./UDPBridgeEvent');
const UDPBridgeState = require('./UDPBridgeState');
// Our externally supplied arguments/environment variables will be read/parsed by
// our UDPBridgeOptions class
const UDPBridgeOptions = require('./UDPBridgeOptions');
const UDPServer = require('./UDPServer');
const UDPServerEvent = require('./UDPServerEvent');
const UDPServerEventMode = require('./UDPServerEventMode');
// We use the util.Help class to print out help information.
const util = require('dxp3-util');
// To uniquely identify messages going over the wire, we add
// an uuid to each message.
const uuid = require('dxp3-uuid');
// Now that all modules are defined and loaded we create 
// our logger.
const logger = logging.getLogger(canonicalName);

class UDPBridge extends EventEmitter {
    /*********************************************
     * CONSTRUCTOR
     ********************************************/

    /**
	 * @param {module:dxp3-net-udp/UDPBridgeOptions} _options
     */
	constructor(_options) {
		logger.trace('constructor(...): start.');
		super();
		this._options = UDPBridgeOptions.parse(_options);
		let multicastUDPServerOptions = {
			mode: UDPMode.MULTICAST,
			port: this._options.multicastPort,
			destinations: this._options.multicastAddress,
			encryptionAlgorithm: this._options.encryptionAlgorithm,
			encryptionKey: this._options.encryptionKey,
			ignoreParentProcess: true,
			ignoreOurselves: true
		}
		this.multicastUDPServer = new UDPServer(multicastUDPServerOptions);
		let unicastUDPServerOptions = {
			mode:UDPMode.UNICAST,
			address: this._options.unicastAddress,
			port: this._options.unicastPort,
			encryptionAlgorithm: this._options.encryptionAlgorithm,
			encryptionKey: this._options.encryptionKey,
			ignoreParentProcess: true,
			ignoreOurselves: true,
			destinations: this._options.forwardTo
		}
		this.unicastUDPServer = new UDPServer(unicastUDPServerOptions);
		logger.info('Multicast address    : ' + this._options.multicastAddress);
		logger.info('Multicast port       : ' + this._options.multicastPort);
		logger.info('Unicast address      : ' + this._options.unicastAddress);
		logger.info('Unicast port         : ' + this._options.unicastPort);
		for(let i=0;i < this._options.forwardTo.length;i++) {
			let destination = this._options.forwardTo[i];
			if(i === 0) {
		logger.info('Forward to           : ' + destination.address + ':' + destination.port);
			} else {
		logger.info('                     : ' + destination.address + ':' + destination.port);
			}
		}
		// Our unique identifier, our process identifier and the host name of the machine we are running on 
		// will be transmitted in our UDP messages.
		this._id = uuid.v4();
		this._processId = process.pid;
		this._hostName = os.hostname();
		logger.debug('UDPBridge ID        : ' + this._id);
		logger.debug('Process ID          : ' + this._processId);
		logger.debug('Host name           : ' + this._hostName);
		// By default we assume no encryption.
		this._encryptionKey = null;
		if((this._options.encryptionKey != undefined) &&
		   (this._options.encryptionKey != null) &&
		   (this._options.encryptionKey.length > 0)) {
		logger.info('Encryption           : on');
		logger.info('Encryption algorithm : ' + this._options.encryptionAlgorithm);
		} else {
		logger.warn('Encryption           : off');
		}
		this.unicastUDPServer.on(UDPServerEvent.RUNNING, (_address, _port) => {
			if(this.multicastUDPServer.isRunning()) {
				this._state = UDPBridgeState.RUNNING;
				this.emit(UDPBridgeEvent.RUNNING, _address, _port);
			}
		});
		this.multicastUDPServer.on(UDPServerEvent.RUNNING, () => {
			if(this.unicastUDPServer.isRunning()) {
				this._state = UDPBridgeState.RUNNING;
				this.emit(UDPBridgeEvent.RUNNING, this.unicastUDPServer.getAddress(), this.unicastUDPServer.getPort());
			}
		});
		this.unicastUDPServer.on(UDPServerEvent.STARTING, () => {
			this._state = UDPBridgeState.STARTING;
			this.emit(UDPBridgeEvent.STARTING);
		});
		this.multicastUDPServer.on(UDPServerEvent.STARTING, () => {
			this._state = UDPBridgeState.STARTING;
			this.emit(UDPBridgeEvent.STARTING);
		});
		this.unicastUDPServer.on(UDPServerEvent.STOPPED, () => {
			if(this.multicastUDPServer.isStopped()) {
				this._state = UDPBridgeState.STOPPED;
				this.emit(UDPBridgeEvent.STOPPED);
			}
		});
		this.multicastUDPServer.on(UDPServerEvent.STOPPED, () => {
			if(this.unicastUDPServer.isStopped()) {
				this._state = UDPBridgeState.STOPPED;
				this.emit(UDPBridgeEvent.STOPPED);
			}
		});
		this.unicastUDPServer.on(UDPServerEvent.STOPPING, () => {
			this._state = UDPBridgeState.STOPPING;
			this.emit(UDPBridgeEvent.STOPPING);
		});
		this.multicastUDPServer.on(UDPServerEvent.STOPPING, () => {
			this._state = UDPBridgeState.STOPPING;
			this.emit(UDPBridgeEvent.STOPPING);
		});
		this.multicastUDPServer.setEventMode(UDPServerEventMode.MESSAGE);
		this.multicastUDPServer.on(UDPServerEvent.MESSAGE, (_payload) => {
			logger.debug('Forwarding outgoing message: ' + JSON.stringify(_payload));
			this.unicastUDPServer.send(_payload.event, _payload.data);
		});
		this.unicastUDPServer.setEventMode(UDPServerEventMode.MESSAGE);
		this.unicastUDPServer.on(UDPServerEvent.MESSAGE, (_payload) => {
			logger.debug('Forwarding incoming message: ' + JSON.stringify(_payload));
			this.multicastUDPServer.send(_payload.event, _payload.data);
		});
		// All done constructing our UDPBridge.
		// It is time to set our state to INITIALIZED.
		this._state = UDPBridgeState.INITIALIZED;
		logger.debug('constructor(...): Initialized.');
		logger.trace('constructor(...): end.');
	}

    /*********************************************
     * PUBLIC METHODS
     ********************************************/

    send(_event, _data) {
    	this.multicastUDPServer.send(_event, _data);
    }

	/**
	 * Start the UDPBridge.
	 * @fires module:dxp3-net/UDPBridgeEvent.STARTING
	 * @throws {module:dxp3-net/UDPError.ILLEGAL_STATE} thrown when the server is in the process of stopping.
	 * @throws {module:dxp3-net/UDPError.SOCKET_EXCEPTION} thrown when something goes wrong binding to the UDP port.
	 */
	start() {
		logger.trace('start(): start.');
		// No point in starting if we are already running or
		// are starting.
		if((this._state === UDPBridgeState.RUNNING) ||
		   (this._state === UDPBridgeState.STARTING)) {
		   	// Initially we threw an illegal state exception, but we deem that to harsh.
			// There really is no problem with calling start again if we are already starting or running. 
			logger.debug('start(): Already running or starting.');
			logger.trace('start(): end.');
		   	return;
		}
		// If we are in the process of stopping, we'll have to wait until
		// we have completely stopped before we can start again.
		// Throw an ILLEGAL STATE error.
		if(this._state === UDPBridgeState.STOPPING) {
			logger.trace('start(): end.');
			throw UDPError.ILLEGAL_STATE;
		}
		// If we made it this far, it means we are either initialized or stopped.
		// Set our state to STARTING.
		this._state = UDPBridgeState.STARTING;
		// Let anyone who is interested know that we are starting.
		logger.info('Starting.');
		this.emit(UDPBridgeEvent.STARTING);
		try {
			this.multicastUDPServer.start();
			this.unicastUDPServer.start();
		} catch(_exception) {
			logger.error('start(): ' + _exception);
			logger.trace('start(): end.');
			throw UDPError.SOCKET_EXCEPTION;
		}
		logger.trace('start(): end.');
	}

	/**
	 * Stop the UDPBridge.
	 * @fires module:dxp3-net/UDPBridgeEvent.STOPPED
	 * @fires module:dxp3-net/UDPBridgeEvent.STOPPING
	 */
	stop() {
		logger.trace('stop(): start.');
		// No point in stopping if we have already stopped or
		// are in the process of stopping.
		if((this._state === UDPBridgeState.STOPPED) ||
		   (this._state === UDPBridgeState.STOPPING)) {
		   	// Initially we threw an illegal state exception, but we deem that to harsh.
			// There really is no problem with calling stop again if we are stopping or have already stopped. 
			logger.debug('stop(): Already stopped or stopping.');
			logger.trace('stop(): end.');
			return;
		}
		// If we are INITIALIZED, we can go directly to stopped.
		if(this._state === UDPBridgeState.INITIALIZED) {
			// Set our state to STOPPED.
			this._state = UDPBridgeState.STOPPED;
			// Let anyone who is interested know that we are stopped.
			logger.info('Stopped.');
			this.emit(UDPBridgeEvent.STOPPED);
			logger.trace('stop(): end.');
			return;
		}
		// Set our state to STOPPING.
		this._state = UDPBridgeState.STOPPING;
		logger.info('Stopping.');
		this.emit(UDPBridgeEvent.STOPPING);
		this.multicastUDPServer.stop();
		this.unicastUDPServer.stop();
		logger.trace('stop(): end.');
	}

    /*********************************************
     * GETTERS
     ********************************************/

	get destinations() {
		return this.getDestinations();
	}

	getDestinations() {
		return this._options.destinations;
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

	get multicastAddress() {
		return this.getMulticastAddress();
	}

	getMulticastAddress() {
		return this._options.multicastAddress;
	}

	get unicastAddress() {
		return this.getUnicastAddress();
	}

	getUnicastAddress() {
		return this._options.unicastAddress;
	}

	get unicastPort() {
		return this.getUnicastPort();
	}

	getUnicastPort() {
		return this._options.unicastPort;
	}

	isEncrypted() {
		return (this._encryptionKey != null);
	}

	isInitialized() {
		return this._state === UDPBridgeState.INITIALIZED;
	}

	isRunning() {
		return this._state === UDPBridgeState.RUNNING;
	}

	isStarting() {
		return this._state === UDPBridgeState.STARTING;
	}

	isStopped() {
		return this._state === UDPBridgeState.STOPPED;
	}

	isStopping() {
		return this._state === UDPBridgeState.STOPPING;
	}

	isSecure() {
		return this.isEncrypted();
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

	set multicastAddress(_multicastAddress) {
		this.setMulticastAddress(_multicastAddress);
	}

	setMulticastAddress(_multicastAddress) {
		logger.trace('setMulticastAddress(...): start.');
		// Defensive programming...check input...
		if(_multicastAddress === undefined || _multicastAddress === null) {
			// Calling setMulticastAddress(...) without any arguments could be
			// a programming error. Lets log a warning.
			logger.warn('setMulticastAddress(...): Missing arguments.');
			logger.trace('setMulticastAddress(...): end.');
			throw UDPError.ILLEGAL_ARGUMENT;
		}
		// We are only able to change our multicast address if we are stopped or initialized.
		if((this._state != UDPBridgeState.INITIALIZED) && (this._state != UDPBridgeState.STOPPED)) {
			// Calling setMulticastAddress(...) without checking our state could be
			// a programming error. Lets log a warning.
			logger.warn('setMulticastAddress(...): Illegal state \'' + this._state + '\'.');
			logger.trace('setMulticastAddress(...): end.');
			throw UDPError.ILLEGAL_STATE;
		}
		try {
			this.multicastUDPServer.setAddress(_multicastAddress);
			this._options.multicastAddress = _multicastAddress;
			logger.debug('setMulticastAddress(...): Set to \'' + this._options.multicastAddress + '\'.');
			logger.trace('setMulticastAddress(...): end.');
		} catch(_exception) {
			logger.warn('setMulticastAddress(...): ' + _exception.toString());
			logger.trace('setMulticastAddress(...): end.');
			throw _exception;
		}
	}

	set unicastAddress(_unicastAddress) {
		this.setUnicastAddress(_unicastAddress);
	}

	setUnicastAddress(_unicastAddress) {
		logger.trace('setUnicastAddress(...): start.');
		// Defensive programming...check input...
		if(_unicastAddress === undefined || _unicastAddress === null) {
			// Calling setUnicastAddress(...) without any arguments could be
			// a programming error. Lets log a warning.
			logger.warn('setUnicastAddress(...): Missing arguments.');
			logger.trace('setUnicastAddress(...): end.');
			throw UDPError.ILLEGAL_ARGUMENT;
		}
		// We are only able to change our unicast address if we are stopped or initialized.
		if((this._state != UDPBridgeState.INITIALIZED) && (this._state != UDPBridgeState.STOPPED)) {
			// Calling setUnicastAddress(...) without checking our state could be
			// a programming error. Lets log a warning.
			logger.warn('setUnicastAddress(...): Illegal state \'' + this._state + '\'.');
			logger.trace('setUnicastAddress(...): end.');
			throw UDPError.ILLEGAL_STATE;
		}
		try {
			this.unicastUDPServer.setAddress(_unicastAddress);
			this._options.unicastAddress = _unicastAddress;
			logger.debug('setUnicastAddress(...): Set to \'' + this._options.unicastAddress + '\'.');
			logger.trace('setUnicastAddress(...): end.');
		} catch(_exception) {
			logger.warn('setUnicastAddress(...): ' + _exception.toString());
			logger.trace('setUnicastAddress(...): end.');
			throw _exception;
		}
	}

    set destinations(_destinations) {
    	this.setDestinations(_destinations);
    }

    setDestinations(_destinations) {
		logger.trace('setDestinations(...): start.');
		// Defensive programming...check input...
		if(_destinations === undefined || _destinations === null) {
			this._options.destinations = [];
		} else if(typeof _destinations === 'string') {
			_destinations = _destinations.trim();
			_destinations = _destinations.split(',');
		}
		if(!Array.isArray(_destinations)) {
			// Calling setDestinations(...) with an argument that is 
			// not a string nor an array could be a programming error.
			// Lets log a warning.
			logger.warn('setDestinations(...): Illegal argument.');
			logger.trace('setDestinations(...): end.');
			throw UDPError.ILLEGAL_ARGUMENT;
		}
		this._options.destinations = [];
		for(let i=0;i < _destinations.length;i++) {
			let destination = _destinations[i];
			if(destination === undefined || destination === null) {
				continue;
			}
			destination = destination.trim();
			if(destination.length <= 0) {
				continue;
			}
			this._options.destinations.push(destination);
		}
		logger.debug('setDestinations(...): Destinations set to \'' + this._options.destinations + '\'.');
		logger.trace('setDestinations(...): end.');
    }

	set encryption(_encryption) {
		this.setEncryption(_encryption);
	}

	setEncryption(_encryption) {
		logger.trace('setEncryption(...): start.');
		this.unicastUDPServer.setEncryption(_encryption);
		this.multicastUDPServer.setEncryption(_encryption);
		logger.trace('setEncryption(...): end.');
	}

	set multicastPort(_multicastPort) {
		this.setMulticastPort(_multicastPort);
	}

	setMulticastPort(_multicastPort) {
		logger.trace('setMulticastPort(...): start.');
		// Defensive programming...check input...
		if(_multicastPort === undefined || _multicastPort === null) {
			// Calling setMulticastPort(...) without any arguments could be
			// a programming error. Lets log a warning.
			logger.warn('setMulticastPort(...): Missing arguments.')
			logger.trace('setMulticastPort(...): end.');
			throw UDPError.ILLEGAL_ARGUMENT;
		}
		if(typeof _multicastPort === 'string') {
			_multicastPort = _multicastPort.trim();
			if(_multicastPort.length <= 0) {
				// Calling setMulticastPort(...) with an empty argument could be
				// a programming error. Lets log a warning.
				logger.warn('setMulticastPort(...): Port is an empty string.')
				logger.trace('setMulticastPort(...): end.');
				throw UDPError.ILLEGAL_ARGUMENT;
			}
			_multicastPort = parseInt(_multicastPort, 10);
		}
		if(isNaN(_multicastPort)) {
			// Port must be a number. This could be a programming error.
			logger.warn('setMulticastPort(...): Port is not a number.');
			logger.trace('setMulticastPort(...): end.');
			throw UDPError.ILLEGAL_ARGUMENT;
		}
		if(_multicastPort <= 0) {
			logger.warn('setMulticastPort(...): Port is smaller or equal to 0.');
			logger.trace('setMulticastPort(...): end.');
			throw UDPError.ILLEGAL_ARGUMENT;
		}
		// If the multicastPort is the same we ignore the request.
		if(this._options.multicastPort === _multicastPort) {
			logger.debug('setMulticastPort(...): Port is already set to \'' + this._options.multicastPort + '\'.');
			logger.trace('setMulticastPort(...): end.');
			return;
		}
		// We are only able to change our multicastPort if we are stopped or initialized.
		if((this._state != UDPBridgeState.INITIALIZED) &&
		   (this._state != UDPBridgeState.STOPPED)) {
			// Calling setMulticastPort(...) without checking our state could be
			// a programming error. Lets log a warning.
			logger.warn('setMulticastPort(...): Illegal state \'' + this._state + '\'.');
			logger.trace('setMulticastPort(...): end.');
			throw UDPError.ILLEGAL_STATE;
		}
		try {
			this.multicastUDPServer.setPort(_multicastPort);
			this._options.multicastPort = _multicastPort;
			logger.debug('setMulticastPort(...): Port set to \'' + this._options.multicastPort + '\'.');
			logger.trace('setMulticastPort(...): end.');
		} catch(_exception) {
			logger.warn('setMulticastPort(...): ' + _exception.toString());
			logger.trace('setMulticastPort(...): end.');
			throw _exception;
		}
	}

	set unicastPort(_unicastPort) {
		this.setUnicastPort(_unicastPort);
	}

	setUnicastPort(_unicastPort) {
		logger.trace('setUnicastPort(...): start.');
		// Defensive programming...check input...
		if(_unicastPort === undefined || _unicastPort === null) {
			// Calling setUnicastPort(...) without any arguments could be
			// a programming error. Lets log a warning.
			logger.warn('setUnicastPort(...): Missing arguments.')
			logger.trace('setUnicastPort(...): end.');
			throw UDPError.ILLEGAL_ARGUMENT;
		}
		if(typeof _unicastPort === 'string') {
			_unicastPort = _unicastPort.trim();
			if(_unicastPort.length <= 0) {
				// Calling setUnicastPort(...) with an empty argument could be
				// a programming error. Lets log a warning.
				logger.warn('setUnicastPort(...): Port is an empty string.')
				logger.trace('setUnicastPort(...): end.');
				throw UDPError.ILLEGAL_ARGUMENT;
			}
			_unicastPort = parseInt(_unicastPort, 10);
		}
		if(isNaN(_unicastPort)) {
			// Port must be a number. This could be a programming error.
			logger.warn('setUnicastPort(...): Port is not a number.');
			logger.trace('setUnicastPort(...): end.');
			throw UDPError.ILLEGAL_ARGUMENT;
		}
		if(_unicastPort <= 0) {
			logger.warn('setUnicastPort(...): Port is smaller or equal to 0.');
			logger.trace('setUnicastPort(...): end.');
			throw UDPError.ILLEGAL_ARGUMENT;
		}
		// If the unicastPort is the same we ignore the request.
		if(this._options.unicastPort === _unicastPort) {
			logger.debug('setUnicastPort(...): Port is already set to \'' + this._options.unicastPort + '\'.');
			logger.trace('setUnicastPort(...): end.');
			return;
		}
		// We are only able to change our unicastPort if we are stopped or initialized.
		if((this._state != UDPBridgeState.INITIALIZED) &&
		   (this._state != UDPBridgeState.STOPPED)) {
			// Calling setUnicastPort(...) without checking our state could be
			// a programming error. Lets log a warning.
			logger.warn('setUnicastPort(...): Illegal state \'' + this._state + '\'.');
			logger.trace('setUnicastPort(...): end.');
			throw UDPError.ILLEGAL_STATE;
		}
		try {
			this.unicastUDPServer.setPort(_unicastPort);
			this._options.unicastPort = _unicastPort;
			logger.debug('setUnicastPort(...): Port set to \'' + this._options.unicastPort + '\'.');
			logger.trace('setUnicastPort(...): end.');
		} catch(_exception) {
			logger.warn('setUnicastPort(...): ' + _exception.toString());
			logger.trace('setUnicastPort(...): end.');
			throw _exception;
		}
	}

    /*********************************************
     * PRIVATE METHODS
     ********************************************/

	static main() {
		try {
	        let udpBridgeOptions = UDPBridgeOptions.parseCommandLine();
	        logging.setLevel(udpBridgeOptions.logLevel);
	        if(udpBridgeOptions.help) {
	        	util.Help.print(UDPBridge);
	        	return;
	        }
			let udpBridge = new UDPBridge(udpBridgeOptions);
			udpBridge.on(UDPBridgeEvent.ERROR, (_error) => {
				console.log('UDPBridge error: ' + _error.message);
			});
			udpBridge.on(UDPBridgeEvent.RUNNING, (_address, _port) => {
				console.log('To get help include the -help option:');
				console.log('node UDPBridge -help');
				console.log('');
				console.log('UDPBridge running at ' + _address + ':' + _port);
			});
			udpBridge.start();
		} catch(_exception) {
			console.log(_exception.message);
			process.exit(99);
		}
	}
}
// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
	UDPBridge.main();
	return;
}
module.exports = UDPBridge;