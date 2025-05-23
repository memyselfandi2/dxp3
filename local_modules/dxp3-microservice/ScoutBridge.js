/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-microservice
 *
 * NAME
 * ScoutBridge
 */
const packageName = 'dxp3-microservice';
const moduleName = 'ScoutBridge';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * @module:dxp3-microservice/ScoutBridge
 */
const EventEmitter = require('events');
const logging = require('dxp3-logging');
const MicroServiceError = require('./MicroServiceError');
const MicroServiceType = require('./MicroServiceType');
const net = require('dxp3-net');
const ScoutBridgeEvent = require('./ScoutBridgeEvent');
const ScoutBridgeOptions = require('./ScoutBridgeOptions');
const ScoutBridgeState = require('./ScoutBridgeState');
const util = require('dxp3-util');

const logger = logging.getLogger(canonicalName);

class ScoutBridge extends EventEmitter {

	constructor(_options) {
		super();
		// Parse and validate our options and store a reference in this._options.
		this._options = ScoutBridgeOptions.parse(_options);
		logger.info('Say hello interval   : ' + this._options.sayHelloInterval);
		let udpBridgeOptions = {
			unicastAddress: this._options.unicastAddress,
			unicastPort: this._options.unicastPort,
			multicastAddress: this._options.multicastAddress,
			multicastPort: this._options.multicastPort,
		}
		this._udpBridge = new net.UDPBridge(udpBridgeOptions);
		this._udpBridge.on(net.UDPBridgeEvent.STOPPED, () => {
			logger.debug('UDPBridge has stopped.');
			// Set our state to STOPPED.
			this._state = ScoutBridgeState.STOPPED;
			// Let anyone who is interested know that we have stopped.
			logger.info('Stopped.');
			this.emit(ScoutBridgeEvent.STOPPED);
		});
		this._udpBridge.on(net.UDPBridgeEvent.RUNNING, (_address, _port) => {
			logger.debug('UDPBridge is running at \'' + _address + ':' + _port + '\'.');
			// This means we have started successfully. Set our state to RUNNING.
			this._state = ScoutBridgeState.RUNNING;
			// Let anyone who is interested know that we are up and running.
			logger.info('Running at \'' + _address + ':' + _port + '\'.');
			this.emit(ScoutBridgeEvent.RUNNING, _address, _port);
			// Now that we are running we start sending out hello messages to allow
			// other scouts to find us. We do not want to overwhelm the network, so we wait
			// a certain amount of time between sending hello messages.
			// We store a reference to the interval function in order for us
			// to clear it when we are stopped.
			this._sayHelloIntervalId = setInterval(() => {
				this._sayHello();
			}, this._options.sayHelloInterval);
		});
		// All done constructing our ScoutBridge. Time to set our state to INITIALIZED.
		this._state = ScoutBridgeState.INITIALIZED;
	}

	start() {
		logger.trace('start(): start.');
		// No point in starting if we are already running or
		// are starting.
		if((this._state === ScoutBridgeState.RUNNING) ||
		   (this._state === ScoutBridgeState.STARTING)) {
		   	// Initially we threw an illegal state exception, but we deem that to harsh.
			// There really is no problem with calling start again if we are already starting or running. 
			logger.debug('start(): Already running or starting.');
			logger.trace('start(): end.');
		   	return;
		}
		// If we are in the process of stopping, we'll have to wait until
		// we have completely stopped before we can start again.
		// Throw an ILLEGAL STATE error.
		if(this._state === ScoutBridgeState.STOPPING) {
			logger.trace('start(): end.');
			throw MicroServiceError.ILLEGAL_STATE;
		}
		// If we made it this far, it means we are either initialized or stopped.
		// Set our state to STARTING.
		this._state = ScoutBridgeState.STARTING;
		// Let anyone who is interested know that we are starting.
		logger.info('Starting.');
		this.emit(ScoutBridgeEvent.STARTING);
		try {
			this._udpBridge.start();
		} catch(_exception) {
			logger.error('start(): ' + _exception);
			logger.trace('start(): end.');
			throw MicroServiceError.SOCKET_EXCEPTION;
		}
		logger.trace('start(): end.');
	}

	stop() {
		logger.trace('stop(): start.');
		// No point in stopping if we have already stopped or
		// are in the process of stopping.
		if((this._state === ScoutBridgeState.STOPPED) ||
		   (this._state === ScoutBridgeState.STOPPING)) {
		   	// Initially we threw an illegal state exception, but we deem that to harsh.
			// There really is no problem with calling stop again if we are stopping or have already stopped. 
			logger.debug('stop(): Already stopped or stopping.');
			logger.trace('stop(): end.');
			return;
		}
		// If we are INITIALIZED, we can go directly to stopped.
		if(this._state === ScoutBridgeState.INITIALIZED) {
			// Set our state to STOPPED.
			this._state = ScoutBridgeState.STOPPED;
			// Let anyone who is interested know that we are stopped.
			logger.info('Stopped.');
			this.emit(ScoutBridgeEvent.STOPPED);
			logger.trace('stop(): end.');
			return;
		}
		// Set our state to STOPPING.
		this._state = ScoutBridgeState.STOPPING;
		// We use the references to the interval functions to clear them.
		clearInterval(this._sayHelloIntervalId);
		logger.info('Stopping.');
		this.emit(ScoutBridgeEvent.STOPPING);
		try {
			this._udpBridge.stop();
		} catch(_exception) {

		}
		logger.trace('stop(): end.');
	}

	getState() {
		return this._state;
	}

	_sayHello() {
		// We won't say hello if we are not running.
		if(this._state != ScoutBridgeState.RUNNING) {
			return;
		}
		let helloMessage = {};
		helloMessage.type = MicroServiceType.SCOUT_BRIDGE;
		helloMessage.port = this._udpBridge.getUnicastPort();
		logger.trace('Send hello: ' + JSON.stringify(helloMessage));
		this._udpBridge.send('hello', helloMessage);
	}

	static main() {
		try {
			let scoutBridgeOptions = ScoutBridgeOptions.parseCommandLine();
			logging.setLevel(scoutBridgeOptions.logLevel);
			if(scoutBridgeOptions.help) {
				util.Help.print(ScoutBridge);
				return;
			}
			let scoutBridge = new ScoutBridge(scoutBridgeOptions);
			scoutBridge.start();
		} catch(_exception) {
			console.log('EXCEPTION: ' + _exception.code + ': ' + _exception.message);
		}
	}
}
// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
	ScoutBridge.main();
	return;
}
module.exports = ScoutBridge;