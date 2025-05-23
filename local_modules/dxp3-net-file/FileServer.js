/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-net-file
 *
 * NAME
 * FileServer
 */
const packageName = 'dxp3-net-file';
const moduleName = 'FileServer';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * @example
 * let net = require('dxp3-net');
 * // Set our address, port and timeout
 * let options = {};
 * options.address = '127.0.0.1';
 * options.port = 58761;
 * options.timeout = 10000;
 * // Create a new FileServer
 * let myFileServer = new net.FileServer(options);
 * // Start the server
 * myFileServer.start();
 *
 * @module dxp3-net-file/FileServer
 */
const FileServerOptions = require('./FileServerOptions');
const FileResponse = require('./FileResponse');
const FileServerEvent = require('./FileServerEvent');
const FileServerState = require('./FileServerState');
const logging = require('dxp3-logging');
const tcp = require('dxp3-net-tcp');
const util = require('dxp3-util');

const logger = logging.getLogger(canonicalName);
/**
 * A File server.
 */
class FileServer extends tcp.TCPServer {
	/**
	 * @param {module:dxp3-net-file/FileServerOptions} _options
	 */
	constructor(_options) {
		_options = FileServerOptions.parse(_options);
		// Our options are essentially the same as TCPServerOptions.
		// We can simply reuse them when constructing our TCPServer.
		super(_options);
		let self = this;
		self._options = _options;
		logger.info('Address: ' + self._options.address);
		logger.info('Port: ' + self._options.port);
		logger.info('Timeout: ' + self._options.timeout);
		super.on(tcp.TCPServerEvent.SOCKET_CONNECTED, function(tcpSocket) {
			logger.debug('Socket connected.');
			let nextRequest = function(error) {
				if(error) {
					// If something went wrong there really is no way we can recover.
					logger.warn('nextRequest(): ' + error.message);
					// Lets destroy this socket.
					tcpSocket.destroy();
					return;
				}
				// Each request should come in as JSON.
				tcpSocket.readJSON().then(
					(request) => {
						logger.debug('nextRequest(): ' + JSON.stringify(request));
						let response = new FileResponse(request, tcpSocket, nextRequest);
						self.emit(FileServerEvent.REQUEST, request, response);
					},
					(error) => {
						// If something went wrong there really is no way we can recover.
						logger.warn('tcpSocket.readJSON(): ' + error.message);
						// Lets destroy this socket.
						tcpSocket.destroy();
					}
				);
			}
			nextRequest();
		});
		super.on(FileServerEvent.REQUEST, (_fileRequest, _fileResponse) => {
			logger.debug('RECEIVED: ' + JSON.stringify(_fileRequest));
			let fileName = _fileRequest.message;
			_fileResponse.sendFile(null, fileName);
		});
		super.on(tcp.TCPServerEvent.SOCKET_CLOSED, function(tcpSocket) {
			logger.debug('Socket closed.');
			// Cleanup any references. Allow the socket to be garbage collected.
			tcpSocket.removeAllListeners();
		});
		super.on(tcp.TCPServerEvent.RUNNING, function(address, port) {
			logger.info('Listening on ' + address + ':' + port);
		});
		super.on(tcp.TCPServerEvent.STARTING, function() {
			logger.info('Starting.');
		});
		super.on(tcp.TCPServerEvent.STOPPED, function() {
			logger.info('Stopped.');
		});
		super.on(tcp.TCPServerEvent.STOPPING, function() {
			logger.info('Stopping.');
		});
		// All done constructing our FileServer.
		// It is time to set our state to INITIALIZED.
		self._state = FileServerState.INITIALIZED;
	}

	setFolder(_folder) {
		this._folder = _folder;
	}

	setDir(_dir) {
		this.setFolder(_dir);
	}

	setDirectory(_directory) {
		this.setFolder(_directory);
	}

	static main(argv) {
		try {
	        let fileServerOptions = FileServerOptions.parseCommandLine();
	        logging.setLevel(fileServerOptions.logLevel);
	        if(fileServerOptions.help) {
	        	util.Help.print(this);
	        	return;
	        }
			let fileServer = new FileServer(fileServerOptions);
			// fileServer.on(FileServerEvent.REQUEST, function(fileRequest, fileResponse) {
			// 	logger.info('RECEIVED: ' + JSON.stringify(fileRequest));
			// 	fileResponse.sendFile(null, 'C:\\temp\\henkie.jpg');
			// });
			fileServer.on(FileServerEvent.RUNNING, function(address, port) {
				console.log('To get help include the -help option:');
				console.log('node FileServer -help');
				console.log('');
				console.log('FileServer running at ' + address + ':' + port);
			});
			fileServer.start();
		} catch(exception) {
			console.log(exception.message);
			process.exit(99);
		}
	}
}
// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
	FileServer.main();
	return;
}

module.exports = FileServer;