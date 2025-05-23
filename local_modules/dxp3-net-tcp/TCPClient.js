/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-net-tcp
 *
 * NAME
 * TCPClient
 */
const packageName = 'dxp3-net-tcp';
const moduleName = 'TCPClient';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * @module dxp3-net-tcp/TCPClient
 */
const EventEmitter = require('events');
const logging = require('dxp3-logging');
const net = require('net');
const TCPClientOptions = require('./TCPClientOptions');
const TCPClientCLI = require('./TCPClientCLI');
const TCPClientEvent = require('./TCPClientEvent');
const TCPClientState = require('./TCPClientState');
const TCPError = require('./TCPError');
const TCPSocket = require('./TCPSocket');
const TCPSocketPool = require('./TCPSocketPool');
const TCPSocketPoolEvent = require('./TCPSocketPoolEvent');
const TCPSocketPoolState = require('./TCPSocketPoolState');
const util = require('dxp3-util');
// Get a logger for this specific module.
const logger = logging.getLogger(canonicalName);
/**
 * A TCP Client with load distribution and queuing capabilities.
 * One can connect it to multiple tcp servers.
 */
class TCPClient extends EventEmitter {
    /*********************************************
     * CONSTRUCTOR
     ********************************************/

    /**
     * @param {module:dxp3-net-tcp/TCPClientOptions~TCPClientOptions} _args
     */
    constructor(_args) {
        super();
        this._args = TCPClientOptions.parse(_args);
        logger.info('Maximum number of sockets: ' + this._args.maximumNumberOfSockets);
        logger.info('Minimum number of sockets: ' + this._args.minimumNumberOfSockets);
        logger.info('Timeout: ' + this._args.timeout);
        // If we are not connected to any server, we queue
        // messages. Use an array as a 'first in, first out' mechanism.
        this._messageQueue = [];
        // A TCP client can connect to different servers each with their
        // own connection pool. We use a map to store each pool.
        this._socketPools = new Map();
        // As we will connect to servers in a round robin fashion,
        // we use an array to keep a sequential/ordered list of pool ID's.
        this._socketPoolIDs = [];
        // This index will allow us to keep track of which pool was used last.
        // When there are no connections it's value will be -1.
        this._socketPoolIDsIndex = -1;
        // All done constructing our TCPClient.
        // It is time to set our state to INITIALIZED.
        this._state = TCPClientState.INITIALIZED;
    }

    /*********************************************
     * PUBLIC METHODS
     ********************************************/

    close() {
        logger.trace('close(): start.');
        // If we are already closing or are already closed, we 
        // might as well return.
        if((this._state === TCPClientState.CLOSED) ||
           (this._state === TCPClientState.CLOSING)) {
            logger.debug('close(): Already closed or closing.');
            logger.trace('close(): end.');
            return;
        }
        // If we are not connected, we can go to closed immediately.
        if(this._socketPools.size <= 0) {
            logger.debug('close(): Number of socket pools is 0.');
            this._state = TCPClientState.CLOSED;
            logger.debug('close(): Closed.');
            this.emit(TCPClientEvent.CLOSED);
            logger.trace('close(): end.');
            return;
        }
        // If we arrive here it means we have connected sockets and
        // we are not yet closed nor in the process of closing.
        this._state = TCPClientState.CLOSING;
        logger.debug('close(): Closing.');
        this.emit(TCPClientEvent.CLOSING);
        for(let [socketPoolID, socketPool] of this._socketPools) {
            if(socketPool === undefined || socketPool === null) {
                continue;
            }
            socketPool.close();
        }
        logger.trace('close(): end.');
    }

    closeSocketPool(_socketPoolID) {
        logger.trace('closeSocketPool(...): start.');
        if(_socketPoolID === undefined || _socketPoolID === null) {
            // Calling closeSocketPool(...) without any arguments could be
            // a programming error. Lets log a warning.
            logger.warn('closeSocketPool(...): Missing arguments.');
            logger.trace('closeSocketPool(...): end.');
            throw TCPError.ILLEGAL_ARGUMENT;
        }
        let socketPool = this._socketPools.get(_socketPoolID);
        if(socketPool === undefined || socketPool === null) {
            logger.debug('closeSocketPool(...): No socket pool with ID \'' + _socketPoolID + '\' found.');
            logger.trace('closeSocketPool(...): end.');
            return;
        }
        logger.debug('closeSocketPool(...): Closing socket pool with ID \'' + _socketPoolID + '\'.');
        socketPool.close();
        logger.trace('closeSocketPool(...): end.');
    }

    connect(_address, _port, _callback) {
        logger.trace('connect(...): start.');
        if(_address === undefined || _address === null ||
           _port === undefined || _port === null) {
            // Calling connect(...) without an address and port
            // could be a programming error. Lets log a warning.
            logger.warn('connect(...): Missing arguments.');
            if(_callback) {
                logger.trace('connect(...): end.');
                return _callback(TCPError.ILLEGAL_ARGUMENT);
            }
            logger.trace('connect(...): end.');
            throw TCPError.ILLEGAL_ARGUMENT;
        }
        let self = this;
        // Our server connections are managed by a pool.
        // We may already have a pool available for this particular address:port.
        // Lets check.
        let socketPoolKey = _address + ':' + _port;
        if(this._socketPools.has(socketPoolKey)) {
            logger.debug('connect(...): Existing socket pool \'' + socketPoolKey + '\'.');
            if(_callback) {
                logger.trace('connect(...): end.');
                return _callback(null, socketPoolKey);
            }
            logger.trace('connect(...): end.');
            return;
        }
        // Apparently this is the first time we are attempting to connect to
        // this address:port. Lets create a new pool.
        let socketPoolOptions = {
            address:_address,
            port:_port,
            max: self._args.maximumNumberOfSockets,
            min:self._args.minimumNumberOfSockets,
            timeout: self._args.timeout
        };
        let socketPool = new TCPSocketPool(socketPoolOptions);
        socketPool.ID = socketPoolKey;
        // When the pool is closed we remove it from our list of pools.
        socketPool.on(TCPSocketPoolEvent.CLOSED, () => {
            let index = self._socketPoolIDs.indexOf(socketPool.ID);
            if(index >= 0) {
                self._socketPoolIDs.splice(index, 1)
            }
            self._socketPools.delete(socketPool.ID);
            self.emit(TCPClientEvent.SOCKET_POOL_CLOSED, socketPool.ID);
            // If this was the last connection pool, we are closed.
            if(self._socketPools.size <= 0) {
                if(self._state != TCPClientState.CLOSED) {
                    self._state = TCPClientState.CLOSED;
                    logger.debug('Closed.');
                    self.emit(TCPClientEvent.CLOSED);
                }
            }
        });
        // When at least one pool is connected it means we are connected.
        socketPool.on(TCPSocketPoolEvent.CONNECTED, (address, port, numberOfSockets, numberOfConnectedSockets, numberOfIdleSockets) => {
            logger.debug('Socket pool ' + socketPool.ID + ' connected with ' + address + ':' + port + '.');
            logger.debug('All/connected/idle sockets:' + numberOfSockets + '/' + numberOfConnectedSockets + '/' + numberOfIdleSockets);
            self.emit(TCPClientEvent.SOCKET_POOL_CONNECTED, socketPool.ID, address, port);
            // If we were not yet connected, we are now.
            if(self._state != TCPClientState.CONNECTED) {
              self._state = TCPClientState.CONNECTED;
              self.emit(TCPClientEvent.CONNECTED);
            }
        });
        socketPool.on(TCPSocketPoolEvent.SOCKET_CLOSED, (socketID, numberOfSockets, numberOfConnectedSockets, numberOfIdleSockets) => {
            logger.debug('Socket pool ' + socketPool.ID + ' closed socket ' + socketID + '.');
            logger.debug('All/connected/idle sockets:' + numberOfSockets + '/' + numberOfConnectedSockets + '/' + numberOfIdleSockets);
            self.emit(TCPClientEvent.SOCKET_CLOSED, socketPool.ID, socketID);
        });
        socketPool.on(TCPSocketPoolEvent.SOCKET_ACQUIRED, (socketID, numberOfSockets, numberOfConnectedSockets, numberOfIdleSockets) => {
            logger.debug('Socket pool ' + socketPool.ID + ' acquired socket ' + socketID + '.');
            logger.debug('All/connected/idle sockets:' + numberOfSockets + '/' + numberOfConnectedSockets + '/' + numberOfIdleSockets);
            self.emit(TCPClientEvent.SOCKET_CONNECTED, socketPool.ID, socketID, socketPool.address, socketPool.port);
        });
        socketPool.on(TCPSocketPoolEvent.SOCKET_TIMEOUT, (socketID, numberOfSockets, numberOfConnectedSockets, numberOfIdleSockets) => {
            logger.debug('Socket pool ' + socketPool.ID + ' timed out socket ' + socketID + '.');
            logger.debug('All/connected/idle sockets:' + numberOfSockets + '/' + numberOfConnectedSockets + '/' + numberOfIdleSockets);
            self.emit(TCPClientEvent.SOCKET_TIMEOUT, socketPool.ID, socketID);
        });
        socketPool.on(TCPSocketPoolEvent.SOCKET_RELEASED, (socketID, numberOfSockets, numberOfConnectedSockets, numberOfIdleSockets) => {
            logger.debug('Socket pool ' + socketPool.ID + ' released socket ' + socketID + '.');
            logger.debug('All/connected/idle sockets:' + numberOfSockets + '/' + numberOfConnectedSockets + '/' + numberOfIdleSockets);
        });
        logger.debug('connect(...): New socket pool \'' + socketPool.ID + '\'.');
        self._socketPools.set(socketPool.ID, socketPool);
        self._socketPoolIDs.push(socketPool.ID);
        if((self._state != TCPClientState.CONNECTED) &&
           (self._state != TCPClientState.CONNECTING)) {
            self._state = TCPClientState.CONNECTING;
            logger.debug('connect(...): Connecting.');
            self.emit(TCPClientEvent.CONNECTING);
        }
        socketPool.on(TCPSocketPoolEvent.SOCKET_ERROR, (socketID, error, numberOfSockets, numberOfConnectedSockets, numberOfIdleSockets) => {
          logger.error('Socket pool ' + socketPool.ID + ' socket ' + socketID + ': ' + error.message);
        });
        // Lets acquire at least one connection and release it.
        socketPool.acquire(function(_error, socket) {
            if(_error) {
                if(_callback) {
                    logger.trace('connect(...): end.');
                    return _callback(_error);
                }
                logger.trace('connect(...): end.');
                return;
            }
            let processQueue = function() {
                if(self._messageQueue.length <= 0) {
                    return;
                }
                let command = self._messageQueue.shift();
                let replyHandler = command._args[1];
                // console.log('sending queue message: ' + message);
                // console.log('queue callback: ' + callback);
                if(command.type === 'sendFile') {
                    self._sendFileToConnectionPool(command._args[0], socketPool, (error, socket) => {
                        // console.log('returned from sending message: ' + message);
                        if(replyHandler === undefined || replyHandler === null) {
                            socket.release();
                        } else {
                            replyHandler(error, socket);
                        }
                        processQueue();
                    });
                } else {
                    self._sendToConnectionPool(command._args[0], socketPool, (_error, socket) => {
                        // console.log('returned from sending message: ' + message);
                        if(replyHandler === undefined || replyHandler === null) {
                            socket.release();
                        } else {
                            replyHandler(_error, socket);
                        }
                        processQueue();
                    });
                }
            }
            socketPool.release(socket);
            // Use this brand new connection to send our queued messages.
            processQueue();
            if(_callback) {
                logger.trace('connect(...): end.');
                return _callback(null, socketPoolKey);
            }
            logger.trace('connect(...): end.');
        });
    }

    disconnect(_address, _port) {
        logger.trace('disconnect(...): start.');
        if(_address === undefined || _address === null ||
           _port === undefined || _port === null) {
            // Calling closeSocketPool(...) without an address and port
            // could be a programming error. Lets log a warning.
            logger.warn('disconnect(...): Missing arguments.');
            logger.trace('disconnect(...): end.');
            throw TCPError.ILLEGAL_ARGUMENT;
        }
        // Our server connections are managed by a pool.
        // If there is no pool available for this particular address:port,
        // we simply return.
        let socketPoolKey = _address + ':' + _port;
        this.closeSocketPool(socketPoolKey);
        logger.trace('disconnect(...): end.');
    }

    list() {
        return Array.from(this._socketPools.keys());
    }

    send(_message, _callback) {
        // Defensive programming...check input...
        if(_message === undefined || _message === null) {
            // Calling send(...) without any arguments could be
            // a programming error. Lets log a warning.
            logger.warn('send(...): Missing arguments.')
            throw TCPError.ILLEGAL_ARGUMENT;
        }
        // Before we can send anything, we need to ensure we are actually connected to
        // 1 or more servers. If we are not connected, we will queue the message and
        // its optional associated callback.
        // As soon as a new connection comes online, we'll process the queue.
        if(this._socketPools.size <= 0) {
          if(this._state != TCPClientState.QUEUING) {
            this._state = TCPClientState.QUEUING;
            logger.debug('send(...): Queuing.');
            this.emit(TCPClientEvent.QUEUING);
          }
          let command = {
            type:'send',
            _args: arguments
          }
          this._messageQueue.push(command);
          return;
        }
        // Now that we know that there is an actual message to be send and
        // we know that we are connected to 1 or more servers,
        // we have to decide which connection pool to use.
        // Lets use a straightforward round robin algorithm.
        this._socketPoolIDsIndex++;
        if(this._socketPoolIDsIndex >= this._socketPoolIDs.length) {
          this._socketPoolIDsIndex = 0;
        }
        let socketPoolID = this._socketPoolIDs[this._socketPoolIDsIndex];
        let socketPool = this._socketPools.get(socketPoolID);
        this._sendToConnectionPool(_message, socketPool, _callback);
    }

    sendFile(_fileName, _callback) {
        // Defensive programming...check input...
        if(arguments.length <= 0) {
            // Calling sendFile(...) without any arguments could be
            // a programming error. Lets log a warning.
            logger.warn('sendFile(...): Missing arguments.')
            throw TCPError.ILLEGAL_ARGUMENT;
        }
        if(arguments.length === 1) {
            _fileName = arguments[0];
            _callback = null;
        } else {
            _fileName = arguments[0];
            _callback = arguments[1];
        }
        if(_fileName === undefined || _fileName === null) {
            // Calling sendFile(...) without a file could be
            // a programming error. Lets log a warning.
            logger.warn('sendFile(...): Missing filename.')
            throw TCPError.ILLEGAL_ARGUMENT;
        }
        if(typeof _fileName != 'string') {
            // Calling sendFile(...) with an non-String argument
            // could be a programming error. Lets log a warning.
            logger.warn('sendFile(...): Filename must be a string.')
            throw TCPError.ILLEGAL_ARGUMENT;
        }
        // Before we can send anything, we need to ensure we are actually connected to
        // 1 or more servers. If we are not connected, we will queue the message and
        // its optional associated callback.
        // As soon as a new connection comes online, we'll process the queue.
        if(this._socketPools.size <= 0) {
          if(this._state != TCPClientState.QUEUING) {
            this._state = TCPClientState.QUEUING;
            this.emit(TCPClientEvent.QUEUING);
          }
          let command = {
            type:'sendFile',
            _args: arguments
          }
          this._messageQueue.push(command);
          return;
        }
        // Now that we know that there is an actual file to be send and
        // we know that we are connected to 1 or more servers,
        // we have to decide which connection pool to use.
        // Lets use a straightforward round robin algorithm.
        this._socketPoolIDsIndex++;
        if(this._socketPoolIDsIndex >= this._socketPoolIDs.length) {
          this._socketPoolIDsIndex = 0;
        }
        let socketPoolID = this._socketPoolIDs[this._socketPoolIDsIndex];
        let socketPool = this._socketPools.get(socketPoolID);
        this._sendFileToConnectionPool(_fileName, socketPool, _callback);
    }

    /**
     * Alias for close(...)
     */
    stop() {
        this.close();
    }

    /**
     * Alias for send(...).
     */
    write(_message, _callback) {
        this.send(_message, _callback);
    }

    /**
     * Alias for sendFile(...).
     */
    writeFile(_fileName, _callback) {
        this.sendFile(_fileName, _callback);
    }

    /*********************************************
     * GETTERS
     ********************************************/

    isConnected() {
        return (this._state === TCPClientState.CONNECTED);
    }

    isClosed() {
        return (this._state != TCPClientState.CONNECTED);
    }

    isQueuing() {
        return (this._state === TCPClientState.QUEUING);
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
    
    get state() {
        return this.getState();
    }

    getState() {
        return this._state;
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
        for(let [socketPoolID, socketPool] of this._socketPools) {
            if(socketPool === undefined || socketPool === null) {
                continue;
            }
            socketPool.setTimeout(this._args.timeout);
        }
        logger.trace('setTimeout(...): end.');
    }

    /*********************************************
     * PRIVATE METHODS
     ********************************************/

    _sendFileToConnectionPool(_fileName, _socketPool, _callback) {
        _socketPool.acquire(function(_error, _socket) {
            if(_error) {
                if(_callback) {
                    return _callback(_error);
                }
                return;
            }
            let resolve = () => {
                if(_callback) {
                    _callback(null, _socket);
                } else {
                    _socketPool.release(_socket);
                }
            }
            let reject = (_error) => {
                _socket.destroy();
                if(_callback) {
                    _callback(_error);
                }
            }
            _socket.writeFile(_fileName).then(resolve, reject);
        });
    }

    _sendToConnectionPool(_message, _socketPool, _callback) {
        _socketPool.acquire(function(_error, _socket) {
            if(_error) {
                if(_callback) {
                    return _callback(_error);
                }
                return;
            }
            let resolve = () => {
                if(_callback) {
                    _callback(null, _socket);
                } else {
                    _socketPool.release(_socket);
                }
            }
            let reject = (_error) => {
                _socket.destroy();
                if(_callback) {
                    _callback(_error);
                }
            }
            if(typeof _message === 'object') {
                _socket.writeJSON(_message).then(resolve, reject);
            } else {
                _socket.write(_message).then(resolve, reject);
            }
        });
    }

    static main() {
        try {
            let tcpClientOptions = TCPClientOptions.parseCommandLine();
            logging.setLevel(tcpClientOptions.logLevel);
            if(tcpClientOptions.help) {
                util.Help.print(this);
                return;
            }
            let tcpClient = new TCPClient(tcpClientOptions);
        } catch(exception) {
            console.log(exception.code + ': '+ exception.message);
            process.exit(99);
        }
    }
}
// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
    TCPClient.main();
    return;
}

module.exports = TCPClient;