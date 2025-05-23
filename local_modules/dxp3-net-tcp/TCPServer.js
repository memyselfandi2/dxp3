/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-net-tcp
 *
 * NAME
 * TCPServer
 */
const packageName = 'dxp3-net-tcp';
const moduleName = 'TCPServer';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * @module dxp3-net-tcp/TCPServer
 */
const EventEmitter = require('events');
const logging = require('dxp3-logging');
const net = require('net');
const TCPError = require('./TCPError');
const TCPServerOptions = require('./TCPServerOptions');
const TCPServerEvent = require('./TCPServerEvent');
const TCPServerState = require('./TCPServerState');
const TCPSocket = require('./TCPSocket');
const util = require('dxp3-util');
// Get a logger for this specific module.
const logger = logging.getLogger(canonicalName);
/**
 * A TCP server.
 *
 * @example
 * let tcp = require('dxp3-net-tcp');
 * // Set our host, port and timeout
 * let args = {};
 * args.address = '127.0.0.1';
 * args.port = 58761;
 * args.timeout = 10000;
 * // Create a new TCPServer
 * let myTCPServer = new tcp.TCPServer(args);
 * // Start the server
 * myTCPServer.start();
 */
class TCPServer extends EventEmitter {
	/**
	 * @param {module:dxp3-net-tcp/TCPServerOptions|Object} _args
	 */
	constructor(_args) {
		super();
		let self = this;
		self._args = TCPServerOptions.parse(_args);
		logger.info('Address: ' + self._args.address);
		logger.info('Port: ' + self._args.port);
		logger.info('Timeout: ' + self._args.timeout);
		// Lets define our socket event handlers. We'll attach them
		// to the socket when it is created in our start method.
		self.socketCloseHandler = function() {
			// With the socket closed, we should remove our event handlers.
			self.socket.off('close', self.socketCloseHandler);
			self.socket.off('connection', self.socketConnectionHandler);
			self.socket.off('error', self.socketErrorHandler);
			self.socket.off('listening', self.socketListeningHandler);
			// Set socket to null to allow it to be garbage collected.
			self.socket = null;
			// Set our state to STOPPED.
			self._state = TCPServerState.STOPPED;
			// Let anyone who is interested know that we have stopped.
			logger.info('Stopped.');
			self.emit(TCPServerEvent.STOPPED);
		}
		self.socketErrorHandler = function(_error) {
			logger.error(_error.toString());
			// Let anyone who is interested know that there was an error.
			self.emit(TCPServerEvent.ERROR, _error);
			self.socket.close();
		}
		self.socketListeningHandler = function() {
			// When we bind the socket, it will start listening for connections.
			// That means we have started successfully. Set our state to RUNNING.
			self._state = TCPServerState.RUNNING;
			// Let anyone who is interested know that we are up and running.
			let listeningOn = self.socket.address();
			logger.info('Listening on ' + listeningOn.address + ':' + listeningOn.port);
			self.emit(TCPServerEvent.RUNNING, listeningOn.address, listeningOn.port);
		}
		self.socketConnectionHandler = function(_clientSocket) {
			let clientSocket = self.getClientSocket(_clientSocket);
			// To keep things stable we may want to set a timeout for clients.
			// If no data is received for a while we perform a cleanup.
			if((self._args.timeout != undefined) && 
			   (self._args.timeout != null) &&
			   (self._args.timeout > 0)) {
				clientSocket.setTimeout(self._args.timeout);
			}
			clientSocket.on('close', function() {
				logger.debug('Socket closed.');
			    self.socketCloseClientHandler(clientSocket);
  			});
			clientSocket.on('end', function() {
				logger.debug('Socket end.');
  			});
			clientSocket.on('error', function(error) {
				logger.debug('Socket error: ' + error + '.');
				clientSocket.destroy();
			});
			clientSocket.on('timeout', function() {
				logger.debug('Socket timeout.');
				clientSocket.end();
			});
			logger.debug('Socket connected.');
			self.emit(TCPServerEvent.SOCKET_CONNECTED, clientSocket);
		};
		self.socketCloseClientHandler = function(clientSocket) {
			self.emit(TCPServerEvent.SOCKET_CLOSED, clientSocket);
		};
		// All done constructing our TCPServer.
		// It is time to set our state to INITIALIZED.
		self._state = TCPServerState.INITIALIZED;
	}
	// Override
	getClientSocket(_clientSocket) {
		return new TCPSocket(_clientSocket);
	}

	/**
	 * Start the TCPServer.
	 * @fires TCPServer#starting
	 * @throws {TCPError.ILLEGAL_STATE} thrown when the server is in the middle of stopping.
	 * @throws {TCPError.SOCKET_EXCEPTION} thrown when something goes wrong listening on the specified host/port.
	 */
	start() {
		logger.trace('start(): start.');
		// No point in starting if we are already running or are starting.
		if((this._state === TCPServerState.RUNNING) ||
		   (this._state === TCPServerState.STARTING)) {
		   	// Initially we threw an illegal state exception, but we deem that to harsh.
			// There really is no problem with calling start again if we are already starting or running. 
			logger.debug('start(): Already running or starting.');
			logger.trace('start(): end.');
		   	return;
		}
		// If we are in the process of stopping, we'll have to wait until
		// we have completely stopped before we can start again.
		// Throw an ILLEGAL STATE error.
		if(this._state === TCPServerState.STOPPING) {
			logger.trace('start(): end.');
		   	throw TCPError.ILLEGAL_STATE;
		}
		// If we made it this far, it means we are either initialized or stopped.
		// Set our state to STARTING.
		this._state = TCPServerState.STARTING;
		// Let anyone who is interested know that we are starting.
		logger.info('Starting');
		this.emit(TCPServerEvent.STARTING);
		try {
			this.socket = net.createServer({allowHalfOpen:false});
			this.socket.on('connection', this.socketConnectionHandler);
			this.socket.on('close', this.socketCloseHandler);
			this.socket.on('error', this.socketErrorHandler);
			this.socket.on('listening', this.socketListeningHandler);
			if(this._args.address === undefined || this._args.address === null) {
				logger.debug('start(): Attempt to listen on 0.0.0.0:' + this._args.port);
				this.socket.listen(this._args.port, "0.0.0.0");
			} else {
				logger.debug('start(): Attempt to listen on ' + this._args.address + ':' + this._args.port);
				this.socket.listen(this._args.port, this._args.address);
			}
		} catch(_exception) {
			logger.error('start(): ' + _exception);
			logger.trace('start(): end.');
			throw TCPError.SOCKET_EXCEPTION;
		}
		logger.trace('start(): end.');
	}

	/**
	 * Stop the TCPServer.
	 *
	 * @fires module:dxp3-net-tcp/TCPServerEvent.STOPPED
	 * @fires module:dxp3-net-tcp/TCPServerEvent.STOPPING
	 */
	stop() {
		logger.trace('stop(): start.');
		// No point in stopping if we have already stopped or
		// are in the process of stopping.
		if((this._state === TCPServerState.STOPPED) ||
		   (this._state === TCPServerState.STOPPING)) {
		   	// Initially we threw an illegal state exception, but we deem that to harsh.
			// There really is no problem with calling stop again if we are stopping or have already stopped. 
			logger.debug('stop(): Already stopped or stopping.');
			logger.trace('stop(): end.');
			return;
		}
		// If we are INITIALIZED, we can go directly to stopped.
		if(this._state === TCPServerState.INITIALIZED) {
			// Set our state to STOPPED.
			this._state = TCPServerState.STOPPED;
			// Let anyone who is interested know that we are stopped.
			logger.info('Stopped');
			this.emit(TCPServerEvent.STOPPED);
			logger.trace('stop(): end.');
			return;
		}
		// Set our state to STOPPING.
		this._state = TCPServerState.STOPPING;
		logger.info('Stopping');
		this.emit(TCPServerEvent.STOPPING);
		this.socket.close(function() {
		});
		logger.trace('stop(): end.');
	}

	/*******************************************
	 * GETTERS                                 *
	 ******************************************/

	/**
	 * Retrieve the current address of the TCPServer.
	 * @returns {String}
	 */
	get address() {
		return this.getAddress();
	}
	/**
	 * Retrieve the current address of the TCPServer.
	 * @returns {String}
	 */
	getAddress() {
		if(this._args.address === undefined || this._args.address === null) {
			return '0.0.0.0';
		}
		return this._args.address;
	}

	isInitialized() {
		return this._state === TCPServerState.INITIALIZED;
	}

	isRunning() {
		return this._state === TCPServerState.RUNNING;
	}

	isStarting() {
		return this._state === TCPServerState.STARTING;
	}

	isStopped() {
		return this._state === TCPServerState.STOPPED;
	}

	isStopping() {
		return this._state === TCPServerState.STOPPING;
	}

	/**
	 * Retrieve the current port of the TCPServer.
	 * @returns {Number}
	 */
	get port() {
		return this.getPort();
	}
	/**
	 * Retrieve the current port of the TCPServer.
	 * @returns {Number}
	 */
	getPort() {
		if(this._args.port === undefined || this._args.port === null || this._args.port <= 0) {
			if(this.socket === undefined || this.socket === null) {
				return 0;
			}
			let listeningOn = this.socket.address();
			if(listeningOn === undefined || listeningOn === null) {
				return 0;
			}
			return listeningOn.port;
		}
		return this._args.port;
	}
	/**
	 * Retrieve the current state of the TCPServer.
	 * @returns {module:dxp3-net-tcp/TCPServerState}
	 */
	get state() {
		return this.getState();		
	}
	/**
	 * Retrieve the current state of the TCPServer.
	 * @returns {module:dxp3-net-tcp/TCPServerState}
	 */
	getState() {
		return this._state;
	}
	/**
	 * Retrieve the current timeout of the TCPServer.
	 * @returns {Number}
	 */
	get timeout() {
		return this.getTimeout();
	}
	/**
	 * Retrieve the current timeout of the TCPServer.
	 * @returns {Number}
	 */
	getTimeout() {
		return this._args.timeout;
	}

	/*******************************************
	 * SETTERS                                 *
	 ******************************************/

	set address(_address) {
		this.setAddress(_address);
	}

	setAddress(_address) {
		logger.trace('setAddress(...): start.');
		// We are only able to change our address if we are stopped or initialized.
		if((this._state != TCPServerState.INITIALIZED) &&
		   (this._state != TCPServerState.STOPPED)) {
			// Calling setAddress(...) without checking our state could be
			// a programming error. Lets log a warning.
			logger.warn('setAddress(...): Illegal state \'' + this._state + '\'.');
			logger.trace('setAddress(...): end.');
			throw TCPError.ILLEGAL_STATE;
		}
		if(_address === undefined || _address === null) {
			// Calling setAddress(...) without any arguments will
			// reset the address to 0.0.0.0.
			this._args.address = null;
			logger.debug('setAddress(...): Address set to \'0.0.0.0\'.');
			logger.trace('setAddress(...): end.');
			return;
		}
		_address = _address.trim();
		if(_address.length <= 0) {
			// Calling setAddress(...) with an empty address will
			// reset the address to 0.0.0.0.
			this._args.address = null;
			logger.debug('setAddress(...): Address set to \'0.0.0.0\'.');
			logger.trace('setAddress(...): end.');
			return;
		}
		this._args.address = _address;
		logger.debug('setAddress(...): ' + this._args.address);
		logger.trace('setAddress(...): end.');
	}

	set port(_port) {
		this.setPort(_port);
	}
	/**
	 * Set the port of this server.
	 * @param {Number} port
	 * @throws {TCPError.ILLEGAL_ARGUMENT} when the supplied port parameter is not a number.
	 * @throws {TCPError.ILLEGAL_STATE} when the server is not initialized and not stopped.
	 */
	setPort(_port) {
		logger.trace('setPort(...): start.');
		// Defensive programming...check input...
		if(_port === undefined || _port === null) {
			// Calling setPort(...) without any arguments could be
			// a programming error. Lets log a warning.
			logger.warn('setPort(...): Missing arguments.')
			logger.trace('setPort(...): end.');
			throw TCPError.ILLEGAL_ARGUMENT;
		}
		if(typeof _port === 'string') {
			_port = _port.trim();
			if(_port.length <= 0) {
				// Calling setPort(...) with an empty argument could be
				// a programming error. Lets log a warning.
				logger.warn('setPort(...): Port is an empty string.')
				logger.trace('setPort(...): end.');
				throw TCPError.ILLEGAL_ARGUMENT;
			}
			_port = parseInt(_port, 10);
		}
		if(isNaN(_port)) {
			// Port must be a number. This could be a programming error.
			logger.warn('setPort(...): Port is not a number.');
			logger.trace('setPort(...): end.');
			throw TCPError.ILLEGAL_ARGUMENT;
		}
		if(_port < 0) {
			logger.warn('setPort(...): Port is smaller than 0.');
			logger.trace('setPort(...): end.');
			throw TCPError.ILLEGAL_ARGUMENT;
		}
		// If the port is the same we ignore the request.
		if(this._args.port === _port) {
			logger.debug('setPort(...): Port is already set to \'' + this._args.port + '\'.');
			logger.trace('setPort(...): end.');
			return;
		}
		// We are only able to change our port if we are stopped or initialized.
		if((this._state != TCPServerState.INITIALIZED) &&
		   (this._state != TCPServerState.STOPPED)) {
			// Calling setPort(...) without checking our state could be
			// a programming error. Lets log a warning.
			logger.warn('setPort(...): Illegal state \'' + this._state + '\'.');
			logger.trace('setPort(...): end.');
			throw TCPError.ILLEGAL_STATE;
		}
		this._args.port = _port;
		logger.debug('setPort(...): Port set to \'' + this._args.port + '\'.');
		logger.trace('setPort(...): end.');
	}

    set timeout(_timeout) {
        this.setTimeout(_timeout);
    }

    setTimeout(_timeout) {
		logger.trace('setTimeout(...): start.');
		// Defensive programming...check input...
		if(_timeout === undefined || _timeout === null) {
			// Calling setTimeout(...) without any arguments could be
			// a programming error. Lets log a warning.
			logger.warn('setTimeout(...): Missing arguments.')
			logger.trace('setTimeout(...): end.');
			throw TCPError.ILLEGAL_ARGUMENT;
		}
		if(typeof _timeout === 'string') {
			_timeout = _timeout.trim();
			if(_timeout.length <= 0) {
				// Calling setTimeout(...) with an empty argument could be
				// a programming error. Lets log a warning.
				logger.warn('setTimeout(...): Timeout is an empty string.')
				logger.trace('setTimeout(...): end.');
				throw TCPError.ILLEGAL_ARGUMENT;
			}
			_timeout = parseInt(_timeout, 10);
		}
		if(isNaN(_timeout)) {
			// Timeout must be a number. This could be a programming error.
			logger.warn('setTimeout(...): Timeout is not a number.');
			logger.trace('setTimeout(...): end.');
			throw TCPError.ILLEGAL_ARGUMENT;
		}
		this._args.timeout = _timeout;
		logger.debug('setTimeout(...): Timeout set to \'' + this._args.timeout + '\'.');
		logger.trace('setTimeout(...): end.');
    }

	static main(argv) {
		try {
	        let tcpServerOptions = TCPServerOptions.parseCommandLine();
	        logging.setLevel(tcpServerOptions.logLevel);
	        if(tcpServerOptions.help) {
	        	util.Help.print(this);
	        	return;
	        }
			let tcpServer = new TCPServer(tcpServerOptions);
			let echoSocketConnectionHandler = require('./EchoSocketConnectionHandler');
			tcpServer.on(TCPServerEvent.SOCKET_CONNECTED, echoSocketConnectionHandler);
			tcpServer.on(TCPServerEvent.RUNNING, function(address, port) {
				console.log('To get help include the -help option:');
				console.log('node TCPServer -help');
				console.log('');
				console.log('TCPServer running at ' + address + ':' + port);
			});
			tcpServer.start();
		} catch(exception) {
			console.log(exception.message);
			process.exit(99);
		}
	}
}
// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
	TCPServer.main();
	return;
}

module.exports = TCPServer;