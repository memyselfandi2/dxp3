/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-net-tcp
 *
 * NAME
 * TCPSocketPool
 */
const packageName = 'dxp3-net-tcp';
const moduleName = 'TCPSocketPool';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * @module dxp3-net-tcp/TCPSocketPool
 */
const EventEmitter = require('events');
const logging = require('dxp3-logging');
const net = require('net');
const TCPError = require('./TCPError');
const TCPSocket = require('./TCPSocket');
const TCPSocketPoolOptions = require('./TCPSocketPoolOptions');
const TCPSocketPoolEvent = require('./TCPSocketPoolEvent');
const TCPSocketPoolState = require('./TCPSocketPoolState');
const util = require('dxp3-util');

const logger = logging.getLogger(canonicalName);

class TCPSocketPool extends EventEmitter {
    /*********************************************
     * CONSTRUCTOR
     ********************************************/

	/**
	 * @param {Object|module:dxp3-net-tcp/TCPSocketPoolOptions~TCPSocketPoolOptions} _args
	 */
	constructor(_args) {
		super();
		this._args = TCPSocketPoolOptions.parse(_args);
		logger.info('Address: ' + this._args.address);
		// Typically we should not run out of sockets unless there is a huge influx
		// of traffic. We may want to limit the number of sockets to keep 
		// the system from falling over.
        logger.info('Maximum number of sockets: ' + this._args.maximumNumberOfSockets);
		// Typically we do not need a minimum number of sockets, as we connect
		// as soon as required. However sometimes we may want a 
		// set of sockets sitting idle and ready to use.
        logger.info('Minimum number of sockets: ' + this._args.minimumNumberOfSockets);
		logger.info('Port: ' + this._args.port);
		// Our socket timeout.
        logger.info('Timeout: ' + this._args.timeout);
		// Every socket will get an 'unique' id.
		// It is only unique during this instance's lifetime.
		this._socketID = 0;
		// We use a map to store all our sockets. These will includes sockets
		// not yet connected. The key is the socket ID.
		this._allSockets = new Map();
		// We use a map to store all our connected sockets.
		// The key is the socket ID.
		this._allConnectedSockets = new Map();
		// We use a map to store all our idle sockets.
		// The key is the socket ID.
		this._allIdleSockets = new Map();
		// All done constructing our TCPSocketPool.
		// It is time to set our state to INITIALIZED.
		this._state = TCPSocketPoolState.INITIALIZED;
	}

	close() {
		// If we are already closed or closing there is nothing left to do.
		// Simply return.
		if((this._state === TCPSocketPoolState.CLOSED) ||
		   (this._state === TCPSocketPoolState.CLOSING)) {
			return;
		}
		this._state = TCPSocketPoolState.CLOSING;
		this.emit(TCPSocketPoolEvent.CLOSING);
		for(let [socketID, socket] of this._allSockets) {
			socket.destroy();
		}
	}

	acquire(_callback) {
		// First we check if there are idle connections we can use.
		if(this._allIdleSockets.size > 0) {
			// Simple get the first idle socket. We don't really care which
			// idle one is used.
			let socket = this._allIdleSockets.values().next().value;
			// Remove the selected idle socket from the list of idle sockets.
			this._allIdleSockets.delete(socket.ID);
			this.emit(TCPSocketPoolEvent.SOCKET_ACQUIRED, socket.ID, this._allSockets.size, this._allConnectedSockets.size, this._allIdleSockets.size);
			// And finally return it.
			return _callback(null, socket);
		}
		// Check if there is a limit to the number of connections to a server.
		// If there is no limit, maximumNumberOfSockets will be equal to -1.
		if(this._args.maximumNumberOfSockets > -1) {
			// We really don't want to hold back connections...
			// We'll warn the user the limits have been reached...
			if(this._allSockets.size >= this._args.maximumNumberOfSockets) {
				logger.warn('Maximum number of sockets has been reached. System may become unstable.');
			}
		}
		// Apparently we have not reached any maximum number of connections yet.
		// Lets create a new socket and give it an 'unique' identifier.
		let socket = new TCPSocket();
		socket.setTCPSocketPool(this);
		socket.setNoDelay(true);
		if(this._args.timeout > -1) {
			socket.setTimeout(this._args.timeout);
		}
		socket.ID = this._socketID++;
		socket.initialized = false;
		socket.once('connect', () => {
			this._allConnectedSockets.set(socket.ID, socket);
			this.emit(TCPSocketPoolEvent.SOCKET_ACQUIRED, socket.ID, this._allSockets.size, this._allConnectedSockets.size, this._allIdleSockets.size);
			// If this was the first connected socket, we are connected.
			if(this._state != TCPSocketPoolState.CONNECTED) {
//				console.log('pool just connected a new socket');
				this._state = TCPSocketPoolState.CONNECTED;
				this.emit(TCPSocketPoolEvent.CONNECTED, this.address, this.port, this._allSockets.size, this._allConnectedSockets.size, this._allIdleSockets.size);
			}
			socket.initialized = true;
			_callback(null, socket);
		});
		socket.on('close', () => {
			this._allSockets.delete(socket.ID);
			this._allConnectedSockets.delete(socket.ID);
			this._allIdleSockets.delete(socket.ID);
			this.emit(TCPSocketPoolEvent.SOCKET_CLOSED, socket.ID, this._allSockets.size, this._allConnectedSockets.size, this._allIdleSockets.size);
			// If this was the last socket, we are closed.
			if(this._allSockets.size <= 0) {
				if(this._state != TCPSocketPoolState.CLOSED) {
					this._state = TCPSocketPoolState.CLOSED;
					this.emit(TCPSocketPoolEvent.CLOSED);
				}
			}
		});
		socket.on('timeout', () => {
			this.emit(TCPSocketPoolEvent.SOCKET_TIMEOUT, socket.ID, this._allSockets.size, this._allConnectedSockets.size, this._allIdleSockets.size);
			socket.end();
		});
		socket.on('error', (_error) => {
			this.emit(TCPSocketPoolEvent.SOCKET_ERROR, socket.ID, _error, this._allSockets.size, this._allConnectedSockets.size, this._allIdleSockets.size);
			socket.destroy();
			if(!socket.initialized) {
				socket.initialized = true;
				_callback(_error);
			}
		});
		this._allSockets.set(socket.ID, socket);
		if((this._state != TCPSocketPoolState.CONNECTED) &&
		   (this._state != TCPSocketPoolState.CONNECTING)) {
			this._state = TCPSocketPoolState.CONNECTING;
			this.emit(TCPSocketPoolEvent.CONNECTING);
		}
		socket.connect({ host: this.address, port: this.port });
	}

	release(_socket) {
		// Defensive programming...check input...
		if(_socket === undefined || _socket === null) {
			// Calling release(...) without any arguments could be
			// a programming error. Lets log a warning.
			logger.warn('release(...): Missing arguments.');
			return;
		}
		if(!this._allConnectedSockets.has(_socket.ID)) {
			// If this was not one of our connected sockets it could
			// be a programming error. Lets log a warning.
			logger.warn('release(...): Release called for a socket that is not part of the socket pool.');
			return;
		}
		if(this._args.maximumNumberOfSockets > -1) {
			// If we already have a maximum number of sockets idling, we simply close this socket.
			if(this._args.maximumNumberOfSockets <= this._allIdleSockets.size) {
				_socket.end();
				return;
			}
		}
		this._allIdleSockets.set(_socket.ID, _socket);
		this.emit(TCPSocketPoolEvent.SOCKET_RELEASED, _socket.ID, this._allSockets.size, this._allConnectedSockets.size, this._allIdleSockets.size);
	}

    /*********************************************
     * GETTERS
     ********************************************/

    get address() {
    	return this.getAddress();
    }

    getAddress() {
    	return this._args.address;
    }

    get maximumNumberOfSockets() {
        return this.getMaximumNumberOfSockets();
    }

    getMaximumNumberOfSockets() {
        return this._args.maximumNumberOfSockets;
    }
    
    get minimumNumberOfSockets() {
        return this.getMinimumNumberOfSockets();
    }

    getMinimumNumberOfSockets() {
        return this._args.minimumNumberOfSockets;
    }
    
    get port() {
    	return this.getPort();
    }

    getPort() {
    	return this._args.port;
    }

    get timeout() {
        return this.getTimeout();
    }

    getTimeout() {
        return this._args.timeout;
    }

    /*********************************************
     * SETTERS
     ********************************************/

    set maximumNumberOfSockets(_maximumNumberOfSockets) {
        this.setMaximumNumberOfSockets(_maximumNumberOfSockets);
    }

    setMaximumNumberOfSockets(_maximumNumberOfSockets) {
        this._args.maximumNumberOfSockets = _maximumNumberOfSockets;
    }
 
    set minimumNumberOfSockets(_minimumNumberOfSockets) {
        this.setMinimumNumberOfSockets(_minimumNumberOfSockets);
    }

    setMinimumNumberOfSockets(_minimumNumberOfSockets) {
        this._args.minimumNumberOfSockets = _minimumNumberOfSockets;
    }
 
    set timeout(_timeout) {
        this.setTimeout(_timeout);
    }

    setTimeout(_timeout) {
        this._args.timeout = _timeout;
    }

	static main() {
		try {
			let tcpSocketPoolOptions = TCPSocketPoolOptions.parseCommandLine();
			logging.setLevel(tcpSocketPoolOptions.logLevel);
			if(tcpSocketPoolOptions.help) {
				util.Help.print(this);
				return;
			}
			let tcpSocketPool = new TCPSocketPool(tcpSocketPoolOptions);
			tcpSocketPool.on(TCPSocketPoolEvent.CLOSED, function() {
				console.log('Closed.');
			});
			tcpSocketPool.on(TCPSocketPoolEvent.CLOSING, function() {
				console.log('Closing.');
			});
			tcpSocketPool.on(TCPSocketPoolEvent.CONNECTED, function(address, port) {
				console.log('Connected to ' + address + ':' + port + '.');
			});
			tcpSocketPool.on(TCPSocketPoolEvent.CONNECTING, function() {
				console.log('Connecting.');
			});
			tcpSocketPool.on(TCPSocketPoolEvent.SOCKET_CLOSED, function(socketID) {
				console.log('Socket ' + socketID + ' closed.');
			});
			tcpSocketPool.on(TCPSocketPoolEvent.SOCKET_CONNECTED, function(socketID, remoteAddress, remotePort) {
				console.log('Socket ' + socketID + ' connected: ' + remoteAddress + ':' + remotePort + '.');
			});
			tcpSocketPool.on(TCPSocketPoolEvent.SOCKET_ERROR, function(socketID, error) {
				console.log('Socket ' + socketID + ' error: ' + error + '.');
			});
			tcpSocketPool.on(TCPSocketPoolEvent.SOCKET_RELEASED, function(socketID, remoteAddress, remotePort) {
				console.log('Socket ' + socketID + ' released: ' + remoteAddress + ':' + remotePort + '.');
			});
			tcpSocketPool.on(TCPSocketPoolEvent.SOCKET_TIMEOUT, function(socketID) {
				console.log('Socket ' + socketID + ' timeout.');
			});
			for(let i=0;i < 4;i++) {
				tcpSocketPool.acquire(function(err, socket) {
					console.log('I acquired socket with ID ' + socket.ID);
					let timeout = (i+1)*1000;
					console.log('I will release socket ' + socket.ID + ' in ' + timeout + ' second(s).');
					setTimeout(function() {
						tcpSocketPool.release(socket);
					},timeout);
				});
			}
			// Lets try to acquire some idle sockets
			for(let i=0;i < 4;i++) {
				setTimeout(function() {
					tcpSocketPool.acquire(function(err, socket) {
						console.log('I acquired socket with ID ' + socket.ID);
						let timeout = 500;
						console.log('I will release socket ' + socket.ID + ' in ' + timeout + ' millisecond(s).');
						setTimeout(function() {
							tcpSocketPool.release(socket);
						}, timeout);
					})
				}, 3000);
			}
			setTimeout(function() {
				tcpSocketPool.close();
			},6000);
		} catch(exception) {
			console.log('Exception: ' + exception);
		}
	}
}
// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
	TCPSocketPool.main();
	return;
}

module.exports = TCPSocketPool;