/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-microservice
 *
 * NAME
 * RestClient
 */
const packageName = 'dxp3-microservice-rest';
const moduleName = 'RestClient';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * A RestClient implements a typical request/response mechanism.
 * It sends requests and waits for a response.
 *
 * @example
 * let microservice = require('dxp3-microservice');
 * // A microservice needs a name and a subject.
 * // The Client will automagically connect to compatible microservice servers configured
 * // with the same subject.
 * let myClient = new microservice.RestClient('patient client', 'patients');
 * myClient.start();
 * myClient.send('list', (_error, response) => {
 *
 * });
 * myClient.send('create', {firstName:'Henk',lastName:'Smith'}, (_error, response) => {
 *			
 * });
 *
 * @module dxp3-microservice/RestClient
 */
const logging = require('dxp3-logging');
const microservice = require('dxp3-microservice');
const net = require('dxp3-net');
const RestClientOptions = require('./RestClientOptions');
const RestClientCLI = require('./RestClientCLI');
const RestClientEvent = require('./RestClientEvent');
const RestMethod = require('./RestMethod');
const RestMethodType = require('./RestMethodType');
const util = require('dxp3-util');

const JSONClient = net.JSONClient;
const JSONClientEvent = net.JSONClientEvent;
const logger = logging.getLogger(canonicalName);
const MicroServiceError = microservice.MicroServiceError;
const MicroServiceEvent = microservice.MicroServiceEvent;
const MicroServiceState = microservice.MicroServiceState;
const MicroServiceType = microservice.MicroServiceType;
/**
 * A RestClient
 */
class RestClient extends microservice.MicroService {
	/**
	 * @param {Object} _options
 	 * @throws {module:dxp3-microservice/MicroServiceError} MicroServiceError.ILLEGAL_ARGUMENT When _options is undefined or null.
 	 */
	constructor(_options) {
		// Defensive programming...check input...
		if(_options === undefined || _options === null) {
			logger.warn('Unable to construct a RestClient with undefined or null arguments.');
			throw MicroServiceError.ILLEGAL_ARGUMENT;
		}
		_options = RestClientOptions.create(_options);
		// Call our super class constructor.
		// RestClientOptions are a subclass of MicroServiceOptions. Therefor we do not have to
		// perform any transformation on the arguments.
		super(_options);
		let self = this;
		self._options = _options;
		self.jsonClient = new JSONClient();
		self.methods = new Map();
		self.microServiceToSocketMap = new Map();
		self.socketToMicroServiceMap = new Map();
		self.jsonClient.on(JSONClientEvent.SOCKET_POOL_CLOSED, (socketPoolID) => {
			let microServiceId = self.socketToMicroServiceMap.get(socketPoolID);
			self.socketToMicroServiceMap.delete(socketPoolID);
			// If the micro service is still available (deleteCompatibleMicroService has not been called),
			// we will attempt a reconnect.
			if(microServiceId === undefined || microServiceId === null) {
				return;
			}
			self.microServiceToSocketMap.delete(microServiceId);
			// Only retry if we are still running...
			if(self.state === MicroServiceState.RUNNING) {
				setTimeout(() => {
					let definition = self.compatibleProducers.get(microServiceId);
					if(definition === undefined || definition === null) {
						return;
					}
					let port = definition.port;
					let address = definition.address;
					logger.info('Retry lost connection to ' + address + ':' + port + '.');
					self.jsonClient.connect(address, port, (_error, _socketPoolID) => {
						self.microServiceToSocketMap.set(microServiceId, _socketPoolID);
						self.socketToMicroServiceMap.set(_socketPoolID, microServiceId);
					});
				}, self._options.reconnectWaitTime);
			}
		});
		self.jsonClient.on(JSONClientEvent.CONNECTED, () => {
			// console.log('json connected');
			// After we have connected, we ask the REST server for all the methods
			// its supports.
			self.execute('methods', (_error, data) => {
				if(_error) {
					logger.warn('Unable to retrieve the list of methods from the RestServer: ' + _error.message);
					return;
				}
				self.methods.clear();
				for(let i=0;i < data.length;i++) {
					let restMethod = RestMethod.parse(data[i]);
					self.methods.set(restMethod.name, restMethod);
				}
				self.emit(RestClientEvent.CONNECTED);
			});
		});
		self.jsonClient.on(JSONClientEvent.CONNECTING, () => {
			self.emit(RestClientEvent.CONNECTING);
		});
		self.jsonClient.on(JSONClientEvent.CLOSED, () => {
			self.emit(RestClientEvent.CLOSED);
		});
		self.jsonClient.on(JSONClientEvent.CLOSING, () => {
			self.emit(RestClientEvent.CLOSING);
		});
		self.jsonClient.on(JSONClientEvent.SOCKET_CONNECTED, (socketPoolID, socketID) => {
		});
		self.jsonClient.on(JSONClientEvent.QUEUING, () => {
			self.emit(RestClientEvent.QUEUING);
		});
	}

	isConnected() {
		return this.jsonClient.isConnected();
	}

	isClosed() {
		return this.jsonClient.isClosed();
	}

	isQueuing() {
		return this.jsonClient.isQueuing();
	}

	isStopped() {
		return (this.state === MicroServiceState.STOPPED);
	}

	isRunning() {
		return (this.state === MicroServiceState.RUNNING);
	}

	call(_command, ..._options) {
		this.send(_command, ..._options);
	}

	exec(_command, ..._options) {
		this.send(_command, ..._options);
	}

	execute(_command, ..._options) {
		this.send(_command, ..._options);
	}

	/**
	 * @throws {MicroServiceError.ILLEGAL_ARGUMENT} When _command is undefined, null, not a string or empty.
	 */
	send(_command, ..._options) {
		let self = this;
		// Defensive programming...check input...
		if(_command === undefined || _command === null) {
			throw MicroServiceError.ILLEGAL_ARGUMENT;
		}
		if(typeof _command != 'string') {
			throw MicroServiceError.ILLEGAL_ARGUMENT;
		}
		_command = _command.trim();
		if(_command.length <= 0) {
			throw MicroServiceError.ILLEGAL_ARGUMENT;
		}
		// If we have a list of known methods, we make sure the
		// method to execute is in that list.
		let methodReturnType = RestMethodType.VOID;
		let methodHasFileParameter = false;
		if(self.methods.size > 0) {
			let method = self.methods.get(_command);
			if(method === undefined || method === null) {
				throw MicroServiceError.NOT_FOUND;
			}
			methodReturnType = method.returnType;
			methodHasFileParameter = method.hasFileParameter;
		}
		let message = {};
		message.command = _command;
		let callback = null;
		if(_options.length > 0) {
			let messageArguments = [];
			for(let i=0;i < _options.length;i++) {
				let argument = _options[i];
				// The last argument could be a callback function
				if(i === (_options.length - 1)) {
					if(typeof argument === 'function') {
						callback = argument;
					} else {
						messageArguments.push(argument);
					}
				} else {
					messageArguments.push(argument);
				}
			}
			if(messageArguments.length > 0) {
				message.arguments = messageArguments;
			}
		}
		// Check our state
		if(self.state != MicroServiceState.RUNNING) {
			if(callback) {
				return callback(MicroServiceError.ILLEGAL_STATE, null);
			}
			return;
		}
 // console.log('rest client sending: ' + JSON.stringify(message));
		if(callback === null) {
			self.jsonClient.send(message);
		} else if(methodHasFileParameter) {
			self.jsonClient.sendFile(message, callback);
		} else if(methodReturnType === RestMethodType.FILE) {
			self.jsonClient.receiveFile(message, callback);
		} else {
			self.jsonClient.send(message, callback);
		}
	}
	/**
	 * @override
	 * @throws {MicroServiceError.ILLEGAL_ARGUMENT}
	 */
	addCompatibleConsumer(id, microServiceDefinition) {
	}
	/**
	 * @override
	 */
	addCompatibleProducer(microServiceId, microServiceDefinition) {
		let port = microServiceDefinition.port;
		let address = microServiceDefinition.address;
		this.jsonClient.connect(address, port, (_error, _socketPoolID) => {
			this.microServiceToSocketMap.set(microServiceId, _socketPoolID);
			this.socketToMicroServiceMap.set(_socketPoolID, microServiceId);
		});
	}
	/**
	 * @override
	 */
	deleteCompatibleConsumer(id, microServiceDefinition) {
	}
	/**
	 * @override
	 */
	deleteCompatibleProducer(microServiceId, microServiceDefinition) {
		// Defensive programming...check input...
		if(microServiceId === undefined || microServiceId === null) {
			return;
		}
		// The microservice has left...lets cleanup any lingering connection...
		let socketPoolID = this.microServiceToSocketMap.get(microServiceId);
		this.microServiceToSocketMap.delete(microServiceId);
		if(socketPoolID === undefined || socketPoolID === null) {
			return;
		}
		this.socketToMicroServiceMap.delete(socketPoolID);
		this.jsonClient.closeSocketPool(socketPoolID);
	}
	/**
	 * @override
	 * @throws {MicroServiceError.ILLEGAL_ARGUMENT}
	 */
	pausing(callback) {
		// Defensive programming...check input...
		if(callback === undefined || callback === null) {
			return;
		}
		if(typeof callback != 'function') {
			return;
		}
		return callback();
	}

	/**
	 * @override
	 * @throws {MicroServiceError.ILLEGAL_ARGUMENT}
	 */
	starting(callback) {
		// Defensive programming...check input...
		if(callback === undefined || callback === null) {
			return;
		}
		if(typeof callback != 'function') {
			return;
		}
		return callback();
	}

	/**
	 * @override
	 */
	stopping(callback) {
		// Defensive programming...check input...
		if(callback === undefined || callback === null) {
			return;
		}
		if(typeof callback != 'function') {
			return;
		}
		if(this.jsonClient.isClosed()) {
			return callback();
		} else {
			this.jsonClient.once(JSONClientEvent.CLOSED, () => {
				return callback();
			});
			this.jsonClient.close();
		}
	}

	/**
	 * @override
	 */
	get type() {
		return MicroServiceType.REST_CLIENT;
	}

	/**
	 * @override
	 */
	get compatibleTypes() {
		return [MicroServiceType.REST_SERVER,MicroServiceType.DATABASE_SERVER,MicroServiceType.CACHE_SERVER];
	}

	static main() {
		try {
			let restClientOptions = RestClientOptions.parseCommandLine();
			logging.setLevel(restClientOptions.logLevel);
			if(restClientOptions.help) {
				util.Help.print(this);
				return;
			}
			// We need a name
			let restClientName = restClientOptions.name;
			if(restClientName === undefined || restClientName === null || restClientName.length <= 0) {
				logger.fatal('Missing name. Please supply a name for this RestClient using the -name argument.');
				logger.info('Exiting due to fatal error.');
				process.exit();
			}
			let restClient = new RestClient(restClientOptions);
			let restClientCLI = new RestClientCLI(restClient);
			restClientCLI.start();
		} catch(exception) {
			console.log('EXCEPTION: ' + exception);
		}
	}
}
// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
	RestClient.main();
	return;
}

module.exports = RestClient;