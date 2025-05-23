/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-net-json
 *
 * NAME
 * JSONServer
 */
const packageName = 'dxp3-net-json';
const moduleName = 'JSONServer';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * @example
 * let net = require('dxp3-net');
 * // Set our address, port and timeout
 * let args = {};
 * args.address = '127.0.0.1';
 * args.port = 58761;
 * args.timeout = 10000;
 * // Create a new JSONServer
 * let myJSONServer = new net.JSONServer(args);
 * // Start the server
 * myJSONServer.start();
 *
 * @module dxp3-net-json/JSONServer
 */
const JSONServerOptions = require('./JSONServerOptions');
const JSONResponse = require('./JSONResponse');
const JSONServerEvent = require('./JSONServerEvent');
const JSONServerState = require('./JSONServerState');
const logging = require('dxp3-logging');
const tcp = require('dxp3-net-tcp');
const util = require('dxp3-util');

const logger = logging.getLogger(canonicalName);
/**
 * A JSON server.
 *
 * @example
 * let net = require('dxp3-net');
 * // Set our host, port and timeout
 * let args = {};
 * args.address = '127.0.0.1';
 * args.port = 58761;
 * args.timeout = 10000;
 * // Create a new JSONServer
 * let myJSONServer = new net.JSONServer(args);
 * // Start the server
 * myJSONServer.start();
 */
class JSONServer extends tcp.TCPServer {
	/**
	 * @param {module:dxp3-net-json/JSONServerOptions} _args
	 */
	constructor(_args) {
		_args = JSONServerOptions.parse(_args);
		// Our arguments are essentially the same as TCPServerOptions.
		// We can simply reuse them when constructing our TCPServer.
		super(_args);
		let self = this;
		self._args = _args;
		logger.info('Address: ' + self._args.address);
		logger.info('Port: ' + self._args.port);
		logger.info('Timeout: ' + self._args.timeout);
		super.on(tcp.TCPServerEvent.SOCKET_CONNECTED, (_tcpSocket) => {
			let requestHandler = function(_error) {
				if(_error) {
					_tcpSocket.destroy();
					return;
				}
				_tcpSocket.readJSON().then(
					(_jsonRequest) => {
						let jsonResponse = new JSONResponse(_jsonRequest, _tcpSocket, requestHandler);
						self.emit(JSONServerEvent.REQUEST, _jsonRequest, jsonResponse);
					},
					(_error) => {
						logger.error('tcpSocket.readJSON(): ' + _error);
						_tcpSocket.destroy();
					}
				);
			}
			requestHandler();
		});
		super.on(tcp.TCPServerEvent.SOCKET_CLOSED, (_jsonSocket) => {
			logger.trace('Socket closed.');
			// Cleanup any references. Allow the socket to be garbage collected.
			_jsonSocket.removeAllListeners();
		});
		super.on(tcp.TCPServerEvent.RUNNING, (_address, _port) => {
			logger.info('Listening on ' + _address + ':' + _port);
		});
		super.on(tcp.TCPServerEvent.STARTING, () => {
			logger.info('Starting.');
		});
		super.on(tcp.TCPServerEvent.STOPPED, () => {
			logger.info('Stopped.');
		});
		super.on(tcp.TCPServerEvent.STOPPING, () => {
			logger.info('Stopping.');
		});
		// All done constructing our JSONServer.
		// It is time to set our state to INITIALIZED.
		self._state = JSONServerState.INITIALIZED;
	}

	static main(argv) {
		try {
	        let jsonServerOptions = JSONServerOptions.parseCommandLine();
	        logging.setLevel(jsonServerOptions.logLevel);
	        if(jsonServerOptions.help) {
	        	util.Help.print(this);
	        	return;
	        }
			let jsonServer = new JSONServer(jsonServerOptions);
			// We simply return the received message.
			// let i = 1;
			jsonServer.on(JSONServerEvent.REQUEST, (_jsonRequest, _jsonResponse) => {
				logger.info('RECEIVED: ' + JSON.stringify(_jsonRequest));
				// i++;
				if(_jsonRequest.message === 'getImage') {
					_jsonResponse.sendFile(null, 'C:\\temp\\henk.jpg');
				} else {
				// setTimeout(function() {
					let reply = {};
					reply.msg = 'Server processed: ' + JSON.stringify(_jsonRequest);
					_jsonResponse.send(reply);
				// },i*Math.floor(Math.random() * 1000));
				}
			});
			jsonServer.on(JSONServerEvent.RUNNING, (_address, _port) => {
				console.log('To get help include the -help option:');
				console.log('node JSONServer -help');
				console.log('');
				console.log('JSONServer running at ' + _address + ':' + _port);
			});
			jsonServer.start();
		} catch(exception) {
			console.log(exception.message);
			process.exit(99);
		}
	}
}
// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
	JSONServer.main();
	return;
}

module.exports = JSONServer;