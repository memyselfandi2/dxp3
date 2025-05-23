/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-microservice-rest
 *
 * NAME
 * RestServer
 */
const packageName = 'dxp3-microservice-rest';
const moduleName = 'RestServer';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * A dxp3.microservice.RestServer implements a typical json request/response mechanism.
 * It listens on a provided (or, if not provided, a random) open port for incoming requests,
 * processes them and returns a response.
 *
 * @example
 * let microservice = require('dxp3-microservice');
 * let myJSONServer = new microservice.JSONServer();
 * myJSONServer.start();
 *
 * @module dxp3-microservice/RestServer
 */
const logging = require('dxp3-logging');
const microservice = require('dxp3-microservice');
const net = require('dxp3-net');
const RestMethod = require('./RestMethod');
const RestMethodParameter = require('./RestMethodParameter');
const RestMethodType = require('./RestMethodType');
const RestServerOptions = require('./RestServerOptions');
const util = require('dxp3-util');

const JSONServer = net.JSONServer;
const JSONServerEvent = net.JSONServerEvent;
const JSONServerState = net.JSONServerState;
const logger = logging.getLogger(canonicalName);
const MicroServiceError = microservice.MicroServiceError;
const MicroServiceEvent = microservice.MicroServiceEvent;
const MicroServiceState = microservice.MicroServiceState;
const MicroServiceType = microservice.MicroServiceType;
const TCPServerPort = net.TCPServerPort;

/**
 * A RestServer.
 */
class RestServer extends microservice.MicroService {
	/**
	 * @param {String} name 	- A (required) not undefined, not null, not empty name.
	 * @param {String} subject	- A (required) not undefined, not null, not empty subject
	 * 							  this responder serves.
	 * @param {Number} _port	- An optional port this server will try to listen on.
	 * 							  If omitted it will find an open port instead.
 	 * @throws {MicroServiceError.ILLEGAL_ARGUMENT} When the name or the subject is undefined,
 	 * 												 null, whitespace or empty.
 	 */
	constructor(args) {
		// Defensive programming...check input...
		if(args === undefined || args === null) {
			logger.warn('Unable to construct a RestServer with undefined or null arguments.');
			throw MicroServiceError.ILLEGAL_ARGUMENT;
		}
		args = RestServerOptions.create(args);
		// Call our super class constructor.
		// RestServerOptions are a subclass of MicroServiceOptions. Therefor we do not have to
		// perform any transformation on the arguments.
		super(args);
		logger.info('Address: ' + args.address);
		logger.info('Port: ' + args.port);
		logger.info('Timeout: ' + args.timeout);
		// We create the JSONServer here in order to attach event handlers.
		// Even though we supply the port here, we will use a different port if we find out it 
		// is already in use during our starting phase.
		let jsonServerOptions = {
			address: args.address,
			port: args.port,
			timeout: args.timeout
		}
		let self = this;
		this.methods = new Map();
		// We create the JSONServer here in order to attach event handlers.
		// We attempt to set the port when we are starting.
		this.jsonServer = new JSONServer(jsonServerOptions);
		this.jsonServer.on(JSONServerEvent.ERROR, function(err) {
//			console.log('json server error: ' + err);
		});
		this.jsonServer.on(JSONServerEvent.RUNNING, function(address, port) {
//			console.log('json server running at: ' + address + ':' + port);
		});
		this.jsonServer.on(JSONServerEvent.STOPPED, function() {
//			console.log('json server stopped.');
		});
		this.jsonServer.on(JSONServerEvent.STOPPING, function() {
//			console.log('json server stopping.');
		});
		this.jsonServer.on(JSONServerEvent.SOCKET_CONNECTED, function() {
//			console.log('json connection established');
		});
		this.jsonServer.on(JSONServerEvent.REQUEST, function(jsonRequest, jsonResponse) {
			let methodName = jsonRequest.command;
			let msgArguments = [];
			if(jsonRequest.arguments) {
				msgArguments = jsonRequest.arguments;
			}
			let method = self.methods.get(methodName);
			if(method === undefined || method === null) {
				jsonResponse.sendError('Unknown method: ' + methodName);
				return;
			}
			try {
				logger.info('msg args: ' + msgArguments);
				msgArguments = method.parseArguments(msgArguments);
				self.emit(methodName, ...msgArguments, jsonResponse);
			} catch(exception) {
				logger.warn('Exception for method \'' + methodName + '\': ' + exception);
				jsonResponse.sendError(exception.message);
			}
		});
		let	listMethods = function(jsonResponse) {
			if(arguments.length > 1) {
				jsonResponse = arguments[arguments.length - 1];
			}
			let result = [];
			for(let [methodName, methodDefinition] of this.methods) {
				result.push(methodDefinition.toString());
			}
			// let result = Array.from(this.methods.values());
			jsonResponse.send(result);
		}
		this.addMethod('actions', null, RestMethodType.ARRAY_STRING, listMethods);
		this.addMethod('commands', null, RestMethodType.ARRAY_STRING, listMethods);
		this.addMethod('functions', null, RestMethodType.ARRAY_STRING, listMethods);
		this.addMethod('methods', null, RestMethodType.ARRAY_STRING, listMethods);
	}
	addAction(actionName, parameterDefinitions, returnType, callback) {
		this.addMethod(...arguments);
	}
	addCommand(commandName, parameterDefinitions, returnType, callback) {
		this.addMethod(...arguments);
	}
	addFunction(functionName, parameterDefinitions, returnType, callback) {
		this.addMethod(...arguments);
	}
	addMethod(methodName, parameters, returnType, callback) {
		// Defensive programming...check input...
		// We need at least a method signature and a callback.
		if(arguments.length <= 1) {
			throw MicroServiceError.ILLEGAL_ARGUMENT;
		}
		let method = null;
		if(arguments.length === 2) {
			// Only a method signature and a callback.
			// The method signature can be a string or an object.
			// {name: "method name", parameters: "String array or CSV", returntype: "String"}
			let methodSignature = arguments[0];
			callback = arguments[1];
			method = RestMethod.parse(methodSignature);

// console.log('addMethod: ' + method.toString());
		} else if(arguments.length === 3) {
			// A method name, a return type and a callback. No parameters.
			methodName = arguments[0];
			parameters = [];
			returnType = arguments[1];
			callback = arguments[2];
			method = new RestMethod(methodName, null, returnType);
		} else {
			method = new RestMethod(methodName, parameters, returnType);
		}
		this.methods.set(method.name, method);
		this.on(method.name, callback);
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
	addCompatibleProducer(id, microServiceDefinition) {
	}
	/**
	 * @override
	 */
	deleteCompatibleConsumer(id, microServiceDefinition) {
	}
	/**
	 * @override
	 */
	deleteCompatibleProducer(id, microServiceDefinition) {
	}
	/**
	 * @override
	 * @throws {MicroServiceError.ILLEGAL_ARGUMENT}
	 */
	pausing(callback) {
		// Defensive programming...check input...
		if(callback === undefined || callback === null) {
			throw MicroServiceError.ILLEGAL_ARGUMENT;
		}
		let self = this;
		// If our json server is already stopped, all we have to do is 
		// call the callback.
		if(self.jsonServer.state === JSONServerState.STOPPED) {
			return callback();
		}
		// Our json server is not yet stopped. Lets add an event listener
		// for the stop event and stop.
		self.jsonServer.once(JSONServerEvent.STOPPED, function() {
			return callback();
		});
		self.jsonServer.stop();
	}

	/**
	 * @override
	 * @throws {MicroServiceError.ILLEGAL_ARGUMENT}
	 */
	starting(callback) {
	// console.log('restserver.starting: 1');
		// Defensive programming...check input...
		if(callback === undefined || callback === null) {
			throw MicroServiceError.ILLEGAL_ARGUMENT;
		}
		let self = this;
		// If our json server is already running, all we have to do is
		// call the callback.
		if(self.jsonServer.state === JSONServerState.RUNNING) {
			return callback();
		}
		// Our json server is not yet running. Lets add an event listener
		// for the running event and start.
	// console.log('restserver.starting: 2');
		self.jsonServer.once(JSONServerEvent.RUNNING, function(address, port) {
			// After the json server successfully started, we update our port.
	// console.log('restserver.starting: 5');
			self.port = port;
			return callback();
		});
	// console.log('restserver.starting: 3');
		// Lets find an available port
		TCPServerPort.getAvailablePort(self.port, null, function(err, port) {
			self.jsonServer.setPort(port);
			self.jsonServer.start();
	// console.log('restserver.starting: 4');
		});
	}

	/**
	 * @override
	 * @throws {MicroServiceError.ILLEGAL_ARGUMENT}
	 */
	stopping(callback) {
		// Defensive programming...check input...
		if(callback === undefined || callback === null) {
			throw MicroServiceError.ILLEGAL_ARGUMENT;
		}
		let self = this;
		// If our json server is already stopped, all we have to do is
		// call the callback.
		if(self.jsonServer.state === JSONServerState.STOPPED) {
			return callback();
		}
		// Our json server is not yet stopped. Lets add an event listener
		// for the stop event and stop.
		self.jsonServer.once(JSONServerEvent.STOPPED, function() {
			return callback();
		});
		self.jsonServer.stop();
	}

	/**
	 * @override
	 */
	get type() {
		return MicroServiceType.REST_SERVER;
	}

	/**
	 * @override
	 */
	get compatibleTypes() {
		return [MicroServiceType.REST_CLIENT];
	}

	static main() {
		try {
			let restServerOptions = RestServerOptions.parseCommandLine();
			logging.setLevel(restServerOptions.logLevel);
			if(restServerOptions.help) {
				util.Help.print(this);
				return;
			}
			// We need a name
			let restServerName = restServerOptions.name;
			if(restServerName === undefined || restServerName === null || restServerName.length <= 0) {
				logger.fatal('Missing name. Please supply a name for this RestServer using the -name argument.');
				logger.info('Exiting due to fatal error.');
				process.exit();
			}
			let restServer = new RestServer(restServerOptions);
			restServer.on(MicroServiceEvent.ERROR, function(err) {
				console.log('RestServer error: ' + err.message);
			});
			restServer.on(MicroServiceEvent.RUNNING, function() {
				console.log('To get help include the -help option:');
				console.log('node RestServer -help');
				console.log('');
				console.log('RestServer \'' + restServer.name + '\' running at port ' + restServer.port);
			});
			restServer.addMethod({name:"echo", parameters:"String message", returntype:"String"}, function(message, response) {
				console.log('received message: ' + message);
				response.send(message);
			});
			restServer.addMethod({name:"readNotFoundImage", returntype:"File"}, function(response) {
				response.sendFile('not found');
			});
			restServer.addMethod({name:"readImage", returntype:"File"}, function(response) {
				let imageFile = 'C:\\temp\\henk.jpg';
				response.sendFile(imageFile);
			});
			restServer.addMethod({name:"createImage", parameters:"String name, String description, File image", returntype:"Object"},
				function(name, description, imageStream, response) {
				let tmpImageFile = 'C:\\temp\\tmpImageFile.jpg';
				let result = {id: '123456', name: name, error: null};
				response.send(result);
			});

			restServer.start();
		} catch(exception) {
			console.log('EXCEPTION: ' + exception.code + ': ' + exception.message);
		}
	}
}
// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
	RestServer.main();
	return;
}

module.exports = RestServer;