/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-microservice
 *
 * NAME
 * Scout
 */
const packageName = 'dxp3-microservice';
const moduleName = 'Scout';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * @module:dxp3-microservice/Scout
 */
const EventEmitter = require('events');
const logging = require('dxp3-logging');
const MicroServiceError = require('./MicroServiceError');
const net = require('dxp3-net');
const ScoutOptions = require('./ScoutOptions');
const ScoutEvent = require('./ScoutEvent');
const ScoutMode = require('./ScoutMode');
const ScoutState = require('./ScoutState');
const util = require('dxp3-util');

const logger = logging.getLogger(canonicalName);
const UDPMode = net.UDPMode;
const UDPServer = net.UDPServer;
const UDPServerEvent = net.UDPServerEvent;
/**
 * A Scout performs its duties on behalf of a microservice.
 * It announces the existence of the microservice and transmits the microservice definition
 * to other scouts.
 *
 * @example
 * const microservice = require('dxp3-microservice');
 * let scout = new microservice.Scout();
 * scout.start();
 */
class Scout extends EventEmitter {
	/**
	 * @param {module:dxp3-microservice/ScoutOptions|Object} _options
	 *
	 * @param {module:dxp3-microservice/MicroService} _options.microService
	 * A microservice. We need it's definition to transmit.
	 * It typically contains an address, a name, a port, a list of production and/or consumption subjects and a type.
	 * Ports are only used by servers and publishers.
	 * At the time of writing the known micro service types are:
	 * PUBLISHER, REST CLIENT, REST SERVER, SUBSCRIBER, WEB CLIENT, WEB GATEWAY, and WEB SERVER.
	 *
	 * @throws {module:dxp3-microservice/MicroServiceError.ILLEGAL_ARGUMENT} when the _options parameter is undefined or null.
	 */
	constructor(_options) {
		super();
		// Parse and validate our arguments and store a reference in this._options.
		this._options = ScoutOptions.parse(_options);
		logger.info('Port                 : ' + this._options.port);
		logger.info('Mode                 : ' + this._options.mode);
		logger.info('Destinations         : ' + this._options.destinations);
		logger.info('Ignore parent process: ' + this._options.ignoreParentProcess);
		logger.info('Ignore ourselves     : ' + this._options.ignoreOurselves);
		logger.info('Reconcile interval   : ' + this._options.reconcileInterval);
		logger.info('Say hello interval   : ' + this._options.sayHelloInterval);
		logger.info('Timeout              : ' + this._options.timeout);
    	// When we meet a new scout we store their contact information.
		this.otherScouts = new Map();
		// We use an UDP server to greet other scouts.
		// An UDP server can be set to one of four modes:
		// 1) LIMITED BROADCAST  - send to every node on the network using the standard
		//				           broadcast address (255.255.255.255).
		// 2) DIRECTED BROADCAST
		// 3) MULTICAST          - send to groups of nodes each of which is subscribed
		// 				           to the same multicast address.
		// 4) UNICAST 	         - send directly to a list of nodes each of which has
		//				           an unique IP address.
    	let udpServerOptions = {};
    	switch(this._options.mode) {
			case ScoutMode.DIRECTED_BROADCAST:
	    		udpServerOptions.mode = UDPMode.DIRECTED_BROADCAST;
	    		break;
    		case ScoutMode.LIMITED_BROADCAST:
	    		udpServerOptions.mode = UDPMode.LIMITED_BROADCAST;
	    		break;
    		case ScoutMode.MULTICAST:
	    		udpServerOptions.mode = UDPMode.MULTICAST;
	    		udpServerOptions.multicastAddresses = this._options.destinations;
	    		break;
    		case ScoutMode.UNICAST:
	    		udpServerOptions.mode = UDPMode.UNICAST;
	    		break;
    		default:
	    		udpServerOptions.mode = UDPMode.MULTICAST;
	    		break;
    	}
    	udpServerOptions.port = this._options.port;
    	// The destinations are a list of multicast or unicast addresses.
    	// This may be an string array or a comma separated string.
    	// If the UDP server is set to limited broadcast the destinations are ignored.
    	udpServerOptions.destinations = this._options.destinations;
    	// To increase security somewhat, communication can be encrypted by supplying
    	// an encryption key.
    	udpServerOptions.encryptionKey = this._options.encryptionKey;
    	// One process may create multiple scouts. We may want to ignore those scouts.
    	// If not explicitly supplied our ScoutOptions will have set the default.
    	udpServerOptions.ignoreParentProcess = this._options.ignoreParentProcess;
    	// We probably want to ignore our own greetings.
    	// If not explicitely supplied our ScoutOptions will have set the default.
    	udpServerOptions.ignoreOurselves = this._options.ignoreOurselves;
		this.udpServer = new UDPServer(udpServerOptions);
		this.udpServer.on(UDPServerEvent.ERROR, (_error) => {
			logger.error(_error.code + ': ' + _error.message);
		});
		this.udpServer.on(UDPServerEvent.RUNNING, (_address, _port) => {
			if(this._options.microService != undefined) {
				logger.info('Running on behalf of \'' + this._options.microService.definition.name + '\' at ' + _address + ':' + _port);
			}
			// This means we have started successfully. Set our state to RUNNING.
			this.state = ScoutState.RUNNING;
			// Let anyone who is interested know that we are up and running.
			logger.info('Running.');
			this.emit(ScoutEvent.RUNNING, _address, _port);
			if(this._options.microService != undefined) {
				// Now that we are running we start sending out hello messages to allow
				// other scouts to find us. We do not want to overwhelm the network, so we wait
				// a certain amount of time between sending hello messages.
				// We store a reference to the interval function in order for us
				// to clear it when we are stopped.
				this.sayHelloIntervalId = setInterval(() => {
					this.sayHello();
				}, this._options.sayHelloInterval);
			}
			this.reconcileIntervalId = setInterval(() => {
				this.reconcile();
			}, this._options.reconcileInterval);
		});
		this.udpServer.on(UDPServerEvent.STARTING, () => {
			logger.debug('UDP server is starting.');
		});
		this.udpServer.on(UDPServerEvent.STOPPING, () => {
			logger.debug('UDP server is stopping.');
		});
		this.udpServer.on(UDPServerEvent.STOPPED, () => {
			logger.debug('UDP server has stopped.');
			// Set our state to STOPPED.
			this.state = ScoutState.STOPPED;
			// Clear our map of other scouts
			this.otherScouts.clear();
			// Let anyone who is interested know that we have stopped.
			logger.info('Stopped.');
			this.emit(ScoutEvent.STOPPED);
		});
		this.udpServer.on('hello', (_data, _remoteAddressInformation) => {
			this.hearHello(_data, _remoteAddressInformation);
		});
		// All done constructing our Scout. Time to set our state to INITIALIZED.
		this.state = ScoutState.INITIALIZED;
	}

    /**
     * Pausing is immediate. When a scout is paused it will still listen for other scouts, but
     * it will not send any messages itself.
     *
     * @throws {MicroServiceError.ILLEGAL_STATE} When this scout is already paused or not even running.
     */
	pause() {
		let self = this;
		// No point in pausing if we are already paused.
		if(self.state === ScoutState.PAUSED) {
		   	// Initially we threw an illegal state exception, but we deem that to harsh.
			// There really is no problem with calling pause again if we are already paused. 
		   	return;
		}
		// No point in pausing if we are not running.
		if(self.state != ScoutState.RUNNING) {
			throw MicroServiceError.ILLEGAL_STATE;
		}
		// Set our state to PAUSED.
		self.state = ScoutState.PAUSED;
		// Let anyone who is interested know that we are paused.
		logger.info('Paused.');
		self.emit(ScoutEvent.PAUSED);
	}

	start() {
		let self = this;
		// No point in starting if we are already running or
		// are starting.
		if((self.state === ScoutState.RUNNING) ||
		   (self.state === ScoutState.STARTING)) {
		   	// Initially we threw an illegal state exception, but we deem that to harsh.
			// There really is no problem with calling start again if we are already starting or running. 
		   	return;
		}
		// If we are in the process of stopping, we'll have to wait until
		// we have completely stopped before we can start again.
		if(self.state === ScoutState.STOPPING) {
			throw MicroServiceError.ILLEGAL_STATE;
		}
		// If we made it this far, it means we are either initialized,
		// paused or stopped.
		// If we were paused we simply set our state back to running.
		if(self.state === ScoutState.PAUSED) {
			self.state = ScoutState.RUNNING;
			// Let anyone who is interested know that we are up and running.
			logger.info('Running.');
			self.emit(ScoutEvent.RUNNING, self.udpServer.getAddress(), self.udpServer.getPort());
			return;			
		}
		//Set our state to STARTING.
		self.state = ScoutState.STARTING;
		// Let anyone who is interested know that we are starting.
		logger.info('Starting.');
		self.emit(ScoutEvent.STARTING);
		// Start our udp server.
		try {
			self.udpServer.start();
		} catch(err) {
		}
	}

	stop() {
		let self = this;
		// No point in stopping if we have already stopped or
		// are in the process of stopping.
		if((self.state === ScoutState.STOPPED) ||
		   (self.state === ScoutState.STOPPING)) {
		   	// Initially we threw an illegal state exception, but we deem that to harsh.
			// There really is no problem with calling stop again if we are stopping or have already stopped. 
			return;
		}
		// If we are INITIALIZED, we can go directly to stopped.
		if(self.state === ScoutState.INITIALIZED) {
			// Set our state to STOPPED.
			self.state = ScoutState.STOPPED;
			// Let anyone who is interested know that we are stopped.
			self.emit(ScoutEvent.STOPPED);
			return;
		}
		// Set our state to STOPPING.
		self.state = ScoutState.STOPPING;
		logger.info('Stopping.');
		self.emit(ScoutEvent.STOPPING);
		// We use the references to the interval functions to clear them.
		clearInterval(self.sayHelloIntervalId);
		clearInterval(self.reconcileIntervalId);
		// Stop our udp server
		try {
			self.udpServer.stop();
		} catch(err) {
		}
	}

	getState() {
		return this.state;
	}

	reconcile() {
		let self = this;
		let now = new Date();
		for(let [scoutId, scout] of self.otherScouts) {
			let timePassed = now - scout.lastSeen;
			if(timePassed >= self._options.timeout) {
				self.otherScouts.delete(scoutId);
				logger.info('Lost scout after ' + timePassed + ' ms: ' + JSON.stringify(scout));
				self.emit(ScoutEvent.LOST_SCOUT, scout);
			}
		}
	}

	sayHello() {
		// We won't say hello if we are not running.
		if(this.state != ScoutState.RUNNING) {
			return;
		}
		let microService = this._options.microService;
		let microServiceDefinition = microService.definition;
		let helloMessage = {};
		helloMessage.name = microServiceDefinition.name;
		helloMessage.port = microServiceDefinition.port;
		helloMessage.type = microServiceDefinition.type;
		// The settings property is optional.
		helloMessage.settings = microServiceDefinition.settings;
		helloMessage.produces = microServiceDefinition.produces;
		if(microServiceDefinition.produces.length > 0) {
			helloMessage.numberOfConsumers = microService.compatibleConsumers.size;
		}
		helloMessage.consumes = microServiceDefinition.consumes;
		if(microServiceDefinition.consumes.length > 0) {
			helloMessage.numberOfProducers = microService.compatibleProducers.size;
		}
		// Use an UDP server to send hello messages.
		logger.trace('Send hello: ' + JSON.stringify(helloMessage));
		this.udpServer.send('hello', helloMessage);
	}

	hearHello(data, remoteAddressInformation) {
		// We only listen to hello message if we are running or if we are paused.
		// Paused means we will not send hello messages, but we will listen for other scouts.
		if((this.state != ScoutState.RUNNING) && (this.state != ScoutState.PAUSED)) {
			return;
		}
		let otherScout = this.otherScouts.get(remoteAddressInformation.id);
		if(otherScout === undefined || otherScout === null) {
			otherScout = {};
			otherScout.lastSeen = +new Date();
			otherScout.id = remoteAddressInformation.id;
			otherScout.address = remoteAddressInformation.address;
			otherScout.hostname = remoteAddressInformation.hostname;
			otherScout.port = data.port;
			otherScout.name = data.name;
			otherScout.type = data.type;
			// The settings property is optional.
			otherScout.settings = data.settings;
			otherScout.produces = data.produces;
			otherScout.consumes = data.consumes;
			this.otherScouts.set(remoteAddressInformation.id, otherScout);
			logger.info('Found scout: ' + JSON.stringify(otherScout));
			this.emit(ScoutEvent.FOUND_SCOUT, otherScout);
		} else {
			logger.trace('Heard hello from existing Scout: ' + JSON.stringify(otherScout));
			otherScout.lastSeen = +new Date();
		}
	}

	static main() {
		try {
			let scoutOptions = ScoutOptions.parseCommandLine();
			logging.setLevel(scoutOptions.logLevel);
			if(scoutOptions.help) {
				util.Help.print(Scout);
				return;
			}
			let scout = new Scout(scoutOptions);
			scout.start();
		} catch(_exception) {
			console.log('EXCEPTION: ' + _exception.code + ': ' + _exception.message);
		}
	}
}
// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
	Scout.main();
	return;
}
module.exports = Scout;