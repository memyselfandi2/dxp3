/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-microservice-pubsub
 *
 * NAME
 * Publisher
 */
const packageName = 'dxp3-microservice-pubsub';
const moduleName = 'Publisher';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;

const logging = require('dxp3-logging');
const microservice = require('dxp3-microservice');
const net = require('dxp3-net');
const TCPClient = net.TCPClient;
const TCPClientEvents = net.TCPClientEvents;

class Publisher extends microservice.MicroService {
	constructor(name = '', subject = '') {
		super(name, subject);
		let self = this;
		// We keep a list of microservices we are compatible with.
		self.compatibleMicroServicesMap = new Map();
		self.tcpClient = new TCPClient();
		self.microServiceToSocketMap = new Map();
		self.socketToMicroServiceMap = new Map();
		self.tcpClient.on(TCPClientEvents.CLOSED, function(socketId) {
//			console.log('TCPClient is closed');
		});
		self.tcpClient.on(TCPClientEvents.CLOSED_SOCKET, function(socketId) {
//			console.log('TCPClient closed a socket with id:' + socketId);
			let microServiceId = self.socketToMicroServiceMap.get(socketId);
			self.socketToMicroServiceMap.delete(socketId);
			// If the micro service is still available (deleteCompatibleMicroService has not been called),
			// we will attempt a reconnect.
			if(microServiceId === undefined || microServiceId === null) {
				return;
			}
			self.microServiceToSocketMap.delete(microServiceId);
			setTimeout(function() {
				let definition = self.compatibleMicroServicesMap.get(microServiceId);
				if(definition === undefined || definition === null) {
					return;
				}
				let port = definition.port;
				let address = definition.address;
				self.tcpClient.connect(port, address, function(_error, _socketId) {
					self.microServiceToSocketMap.set(microServiceId, _socketId);
					self.socketToMicroServiceMap.set(_socketId, microServiceId);
				});
			}, DEFAULT_RECONNECT_WAIT_TIME);
		});
		self.tcpClient.on(TCPClientEvents.CONNECTED, function() {
//			console.log('TCPClient is connected');
		});
		self.tcpClient.on(TCPClientEvents.CONNECTED_SOCKET, function(socketId) {
//			console.log('TCPClient connected a socket with id:' + socketId);
		});
		self.tcpClient.on(TCPClientEvents.QUEUING, function() {
//			console.log('TCPClient is queuing');
		});
	}

	publish(topic, data) {

	}

	/**
	 * @override
	 */
	addCompatibleMicroService(microServiceId, definition) {
		let self = this;
		self.compatibleMicroServicesMap.set(microServiceId, definition);
		let port = definition.port;
		let address = definition.address;
		self.tcpClient.connect(port, address, function(_error, _socketId) {
			self.microServiceToSocketMap.set(microServiceId, _socketId);
			self.socketToMicroServiceMap.set(_socketId, microServiceId);
		});
	}

	/**
	 * @override
	 */
	deleteCompatibleMicroService(microServiceId) {
		// Defensive programming...check input...
		if(microServiceId === undefined || microServiceId === null) {
			return;
		}
		let self = this;
		// The microservice has left...lets cleanup any lingering connection...
		self.compatibleMicroServicesMap.delete(microServiceId);
		let socketId = self.microServiceToSocketMap.get(microServiceId);
		self.microServiceToSocketMap.delete(microServiceId);
		if(socketId === undefined || socketId === null) {
			return;
		}
		self.socketToMicroServiceMap.delete(socketId);
		self.tcpClient.closeSocket(socketId);
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
		return callback();
	}

	/**
	 * @override
	 */
	get type() {
		return microservice.MicroServiceType.PUBLISHER;
	}

	/**
	 * @override
	 */
	get compatibleType() {
		return microservice.MicroServiceType.SUBSCRIBER;
	}
}