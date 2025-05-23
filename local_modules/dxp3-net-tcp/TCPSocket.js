const EventEmitter = require('events');
const fs = require('fs');
const net = require('net');

class TCPSocket extends EventEmitter {

	constructor(_socket) {
		super();
		if(_socket === undefined || _socket === null) {
			_socket = new net.Socket();
		}
		this._socket = _socket;
        this._encoding = 'utf-8';
        this._noDelay = false;
        this._timeout = -1;
		this.maxPackageSize = 16777211;
		this.bufferSize = 8192;
		this._socket.on('connect', () => {
			this.emit('connect');
		});
		this._socket.on('close', () => {
			this.emit('close');
		});
		this._socket.on('end', () => {
			this.emit('end');
		});
		this._socket.on('error', (_error) => {
			this.emit('error', _error);
		});
		this._socket.on('timeout', () => {
			this.emit('timeout');
		});
        this._readingStream = false;
	}

	connect(args) {
		this._socket.connect(args);
	}
    /**
     * Alias of destroy().
     */
    remove() {
        this.destroy();
    }
    /**
     * Alias of destroy().
     */
    delete() {
        this.destroy();
    }

	destroy() {
		this._socket.destroy();
	}

	end() {
		this._socket.end();
	}
    /**
     * A TCPSocket can be part of a TCPSocketPool.
     * When the user of the TCPSocket is done, it should release it back to the pool.
     */
	release() {
		if(this._tcpSocketPool === undefined || this._tcpSocketPool === null) {
			return;
		}
		this._tcpSocketPool.release(this);
	}

	read() {
        // console.log('TCPSOCKET.read');
		let self = this;
        return new Promise((resolve, reject) => {
            let callback = TCPSocket._createCallbackToPromise(resolve, reject);
            try {
                // The first 4 bytes hold the data/package length.
                TCPSocket._readSocket(self._socket, 4).then(
                	(header) => {
                        // We transform the read buffer to an integer/number.
                        let dataLength = header.readUInt32LE(0);
                        // console.log('READ HEADER length: ' + dataLength);
                        if (dataLength <= self.maxPackageSize) {
                            if (dataLength <= 0) {
                                // If the package length is 0 (or less), we return
                                // an empty buffer.
                                callback(null, Buffer.alloc(0));
                            } else {
                                // Now that we know the data/package length, we'll attempt
                                // to read it.
                                TCPSocket._readSocket(self._socket, dataLength).then(
                                    (data) => {
    		                            callback(null, data);
                                    },
                                    (error) => {
                                        // Something went wrong. Lets return the error.
                                        callback(error);
                                    });
                            }
                        } else {
                            // The data/package length exceeds the maximum allowed.
                            let error = new Error('Maximum package size exceeded.');
                            callback(error);
                        }
            		},
            		(error) => {
                        // Something went wrong. Lets return the error.
            			callback(error);
            		}
        		);
            } catch(exception) {
                callback(exception);
            }
    	});
	}

    /**
     * Read a file from the socket and save it to local storage.
     * Internally it uses our readStream function to read the bytes.
     */
    readFile(filePath) {
        let self = this;
        return new Promise((resolve, reject) => {
            let callback = TCPSocket._createCallbackToPromise(resolve, reject);
            try {
                fs.open(filePath, 'w', (error, fdTarget) => {
                    if (error === undefined || error === null) {
                        // We successfully opened the file for writing.
                        // Lets define a function that will close the file upon completion or
                        // upon error.
                        let closeFile = (readStreamError, numberOfBytesWritten) => {
                            fs.close(fdTarget, (closeError) => {
                                if (closeError) {
                                    callback(closeError, numberOfBytesWritten);
                                } else {
                                    callback(readStreamError, numberOfBytesWritten);
                                }
                            });
                        };
                        self.readStream(fdTarget).then(
                            (numberOfBytesWritten) => {
                                closeFile(null, numberOfBytesWritten);
                            },
                            (readStreamError) => {
                                closeFile(readStreamError);
                            }
                        );
                    } else {
                        return callback(error);
                    }
                });
            } catch(exception) {
                // Something went wrong reading the file and/or
                // writing to local storage.
                // Lets return the exception as an error.
                callback(exception);
            }
        });
    }

    readFileHeader() {
        return this.readStreamHeader();
    }

	readJSON() {
        // console.log('TCPSOCKET.readJSON');
		let self = this;
        return new Promise((resolve, reject) => {
            let callback = TCPSocket._createCallbackToPromise(resolve, reject);
            // Read a JSON string and convert it to an object.
            self.readString().then(
            	(jsonString) => {
                    // console.log('readstring returned : ' + jsonString);
                    try {
                    	let json = null;
                    	if(jsonString != null) {
                    		json = JSON.parse(jsonString);
                    	}
                    	callback(null, json);
                    } catch(exception) {
                        callback(exception);
                    }
	            },
	            (error) => {
                    // console.log('readstring something went wrong: ' + error);
                    // Something went wrong. Lets return the error.
                    callback(error);
	            }
            );
        });
	}
    /**
     * Alias of readJSON.
     */
    readObject() {
        return this.readJSON();
    }

    readStream(fdTarget) {
        let self = this;
        return new Promise((resolve, reject) => {
            let callback = TCPSocket._createCallbackToPromise(resolve, reject);
            try {
                let numberOfBytesWritten = 0;
                let nextChunk;
                let sendAnswer = (err) => {
                    let errorMessage = '';
                    if(err != undefined && err != null) {
                        errorMessage = err.message.trim();
                    }
                    self.write(errorMessage).then(
                        () => {
                            if (errorMessage.length > 0) {
                                callback(errorMessage);
                            } else {
                                nextChunk();
                            }
                        },
                        (err) => {
                            callback(err);
                        }
                    );
                };
                nextChunk = () => {
                    self.read().then(
                        (chunkBlock) => {
                            let chunkLength = chunkBlock.readUInt32LE(0);
                            if (chunkLength < 1) {
                                self.emit('stream.end', null, numberOfBytesWritten);
                                callback(null, numberOfBytesWritten);
                            } else if (chunkLength > self.maxPackageSize) {
                                sendAnswer(new Error('Chunk is too big!'));
                            } else {
                                let chunk = Buffer.alloc(chunkLength);
                                chunkBlock.copy(chunk, 0, 4);
                                fs.write(fdTarget, chunk, (err, written) => {
                                    if (!err) {
                                        if (written > 0) {
                                            numberOfBytesWritten += written;
                                        }
                                    }
                                    sendAnswer(err);
                                });
                            }
                        },
                        (readError) => {
                            sendAnswer(readError);
                        }
                    );
                };
                if(self._readingStream === false) {
                    self.readFileHeader().then(
                        () => {
                            nextChunk();
                        },
                        (err) => {
                            callback(err);
                        }
                    );
                } else {
                    self._readingStream = false;
                    nextChunk();
                }
            } catch(exception) {
                callback(exception);
            }
        });
    }

    readStreamHeader() {
        let self = this;
        return new Promise((resolve, reject) => {
            let callback = TCPSocket._createCallbackToPromise(resolve, reject);
            self.readJSON().then(
                (json) => {
                    if(!json.error) {
                        self._readingStream = true;
                    }
                    callback(null, json);
                },
                (error) => {
                    callback(error);
                }
            );
        });            
    }

	readString() {
        // console.log('TCPSOCKET.readString');
		let self = this;
        return new Promise((resolve, reject) => {
            let callback = TCPSocket._createCallbackToPromise(resolve, reject);
            self.read().then(
            	(data) => {
                    if(data === undefined || data === null) {
                        callback(null, null);
                    } else {
                    	let string = data.toString(self._encoding);
                        callback(null, string);
                    }
                },
                (error) => {
                	callback(error);
            	}
        	);
        });
    }

    pipe(socket) {
        let self = this;
        return new Promise((resolve, reject) => {
            let callback = TCPSocket._createCallbackToPromise(resolve, reject);
            try {
                let numberOfBytesWritten = 0;
                let nextChunk;
                let sendAnswer = (err) => {
                    let errorMessage = '';
                    if(err != undefined && err != null) {
                        errorMessage = err.message.trim();
                    }
                    self.write(errorMessage).then(
                        () => {
                            if (errorMessage.length > 0) {
                                callback(errorMessage);
                            } else {
                                nextChunk();
                            }
                        },
                        (err) => {
                            callback(err);
                        }
                    );
                };
                nextChunk = () => {
                    self.read().then(
                        (chunkBlock) => {
                            let chunkLength = chunkBlock.readUInt32LE(0);
                            if (chunkLength < 1) {
                                self.emit('stream.end', null, numberOfBytesWritten);
                                callback(null, numberOfBytesWritten);
                            } else if (chunkLength > self.maxPackageSize) {
                                sendAnswer(new Error('Chunk is too big!'));
                            } else {
                                let chunk = Buffer.alloc(chunkLength);
                                chunkBlock.copy(chunk, 0, 4);
                                socket.write(chunk);
                                numberOfBytesWritten += chunkLength;
                                sendAnswer(null);
                            }
                        },
                        (readError) => {
                            sendAnswer(readError);
                        }
                    );
                };
                if(self._readingStream === false) {
                    self.readFileHeader().then(
                        () => {
                            nextChunk();
                        },
                        (err) => {
                            callback(err);
                        }
                    );
                } else {
                    self._readingStream = false;
                    nextChunk();
                }
            } catch(exception) {
                callback(exception);
            }
        });
    }

	write(data) {
        // console.log('TCPSocket.write');
		let self = this;
        return new Promise((resolve, reject) => {
            let callback = TCPSocket._createCallbackToPromise(resolve, reject);
            try {
                // A package of data will be prefixed with its length.
                let dataLength = Buffer.alloc(4);
                // We transform the data length to a buffer of bytes.
                dataLength.writeUInt32LE(data.length, 0);
                // We send/write the length of data first.
        // console.log('TCPSocket._socket.write header: ' + data.length);
                self._socket.write(dataLength, (error) => {
                    if((error === undefined) || (error === null)) {
                        // There was NO error writing the header.
                        // Lets write the data next.
        // console.log('TCPSocket._socket.write data');
                        self._socket.write(data, (error) => {
                            if(error === undefined || error === null) {
        // console.log('TCPSocket._socket.write success');
                                // There was NO error writing the data.
                                // Lets return.
                                callback(null, null);
                            } else {
        // console.log('TCPSocket._socket.write error: ' + error);
                                // Something went wrong writing the data.
                                // Lets return the error.
                                callback(error);
                            }
                        });
                    } else {
        // console.log('TCPSocket._socket.write header error: ' + error);
                        // Something went wrong writing the header.
                        // Lets return the error.
                    	callback(error);
                    }
                });
            } catch(exception) {
                // Something went wrong writing to the underlying socket.
                // Lets return the exception as an error.
                callback(exception);
            }
        });
	}

    writeJSON(json) {
        // console.log('TCPSocket.writeJSON: ' + JSON.stringify(json));
        let self = this;
        return new Promise((resolve, reject) => {
            let callback = TCPSocket._createCallbackToPromise(resolve, reject);
            // There could be an exception thrown in the code below
            // (most notably by the JSON.stringify(...) function).
            // We'll catch it and transform it to an error to be returned
            // in our Promise reject function.
            try {
                let jsonString = null;
                if((json != undefined) && (json != null)) {
                    jsonString = JSON.stringify(json);
                }
                self.write(jsonString).then(
                    () => {
                        callback(null);
                    },
                    (error) => {
                        callback(error);
                    }
                );
            } catch(exception) {
                // Something went wrong writing the json object.
                // Lets return the exception as an error.
                callback(exception);
            }
        });
    }
    /**
     * Alias of writeJSON.
     */
    writeObject(object) {
        return this.writeJSON(object);
    }

    writeString(string) {
        return this.write(string);
    }

    _getStreamHeader(errorCode, errorMessage, metaInformation) {
        let header = {};
        if(errorCode === undefined || errorCode === null) {
            errorCode = -1;
        }
        if(errorMessage === undefined || errorMessage === null) {
            errorMessage = '';
        }
        errorMessage = errorMessage.trim();
        if(metaInformation != undefined && metaInformation != null) {
            header.metaInformation = metaInformation;
        }
        if((errorCode === -1) && (errorMessage.length <= 0)) {
            return header;
        }
        header.error = {
                code: errorCode,
                message: errorMessage
        }
        return header;
    }

	writeFile(filePath, metaInformation) {
        // console.log('TCPSocket attempting to write file: ' + filePath);
		let self = this;
        return new Promise((resolve, reject) => {
            let callback = TCPSocket._createCallbackToPromise(resolve, reject);
            try {
                // First we try to open the file.
                fs.open(filePath, 'r', (openError, fd) => {
                    if (openError) {
                        // let streamHeader = self._getStreamHeader(404, 'File not found');
                        // self.writeJSON(streamHeader);
                        callback(openError);
                        return;
                    }
                    // No matter what, we must always close the file.
                    let closeFile = (err, numberOfBytesSend) => {
                        fs.close(fd, (closeError) => {
                            if(closeError) {
                                callback(closeError, numberOfBytesSend);
                            } else {
                                callback(err, numberOfBytesSend);
                            }
                        });
                    };
                    // When we arrive here, we were able to open the file.
                    // Now we can commence streaming its meta information and its contents.
                    self.writeStream(fd, metaInformation).then(
                    	(numberOfBytesSend) => {
                            // On success close the file.
                        	closeFile(null, numberOfBytesSend);
                    	},
                    	(writeStreamError) => {
                            // On error close the file.
                        	closeFile(writeStreamError);
                    	}
                	);
                });
            } catch (exception) {
                callback(exception);
            }
        });
    }

	writeStream(fdSrc, metaInformation) {
		let self = this;
        return new Promise((resolve, reject) => {
            let callback = TCPSocket._createCallbackToPromise(resolve, reject);
            try {
                let remainingBytes = NaN;
                let bytesCount = 0;
                let nextChunk;
                let sendChunk = (chunk) => {
                    if (!chunk) {
                        chunk = Buffer.alloc(0);
                    }
                    // chunk size
                    let chunkLength = Buffer.alloc(4);
                    chunkLength.writeUInt32LE(chunk.length, 0);
                    // send to remote
                    self.write(Buffer.concat([chunkLength, chunk])).then(
                    	() => {
                            if (chunk.length > 0) {
                                self.readString().then(
                                	(errorMessage) => {
	                                    if(errorMessage === undefined || errorMessage === null || errorMessage.length <= 0) {
	                                        nextChunk();
	                                    } else {
	                                        callback(new Error(errorMessage));
	                                    }
                                	},
                                	(err) => {
                                    	callback(err);
	                                }
                                );
                        	} else {
                            	callback(null, bytesCount);
                        	}
                    	},
                    	(err) => {
                        	callback(err);
                        }
                    );
                };
                nextChunk = () => {
                    let buffer = Buffer.alloc(self.bufferSize);
                    let bytesToRead = 0;
                    if (isNaN(remainingBytes)) {
                        bytesToRead = buffer.length;
                    } else {
                        if (remainingBytes < 1) {
                            remainingBytes = 0;
                        }
                        bytesToRead = remainingBytes;
                        bytesToRead = Math.min(bytesToRead, buffer.length);
                    }
                    if (bytesToRead > 0) {
                        fs.read(fdSrc, buffer, 0, bytesToRead, null, (err, numberOfBytesRead) => {
                            let chunkToSend;
                            if (numberOfBytesRead > 0) {
                                chunkToSend = Buffer.alloc(numberOfBytesRead);
                                buffer.copy(chunkToSend, 0, 0, numberOfBytesRead);
                            } else {
                                chunkToSend = Buffer.alloc(0);
                            }
                            bytesCount += chunkToSend.length;
                            remainingBytes -= chunkToSend.length;
                            sendChunk(chunkToSend);
                        });
                    } else {
                        sendChunk();
                    }
                };
                let streamHeader = self._getStreamHeader(null, null, metaInformation);
                self.writeJSON(streamHeader).then(
                    () => {
                        nextChunk();
                    },
                    (writeJSONError) => {
                        callback(writeJSONError);
                    }
                );
            } catch(exception) {
                callback(exception);
            }
        });
    }

    /***********************************
     * GETTERS
     **********************************/
    get remoteAddress() {
        return this.getRemoteAddress();
    }

    getRemoteAddress() {
        return this._socket.remoteAddress;
    }

    get remotePort() {
        return this.getRemotePort();
    }

    getRemotePort() {
        return this._socket.remotePort;
    }

    get noDelay() {
        return this.getNoDelay();
    }

    getNoDelay() {
        return this._noDelay;
    }

    get timeout() {
        return this.getTimeout();
    }

    getTimeout() {
        return this._timeout;
    }

    /***********************************
     * SETTERS
     **********************************/
    set noDelay(_noDelay) {
        this.setNoDelay(_noDelay);
    }

    setNoDelay(noDelay) {
        this._noDelay = noDelay;
        this._socket.setNoDelay(noDelay);
    }

    set tcpSocketPool(tcpSocketPool) {
        this.setTCPSocketPool(tcpSocketPool);
    }

    setTCPSocketPool(tcpSocketPool) {
        this._tcpSocketPool = tcpSocketPool;
    }
    
    set timeout(_timeout) {
        this.setTimeout(_timeout);
    }

    setTimeout(timeout) {
        this._timeout = timeout;
        if(this._timeout <= 0) {
            this._timeout = -1;
            this._socket.setTimeout(0);
        } else {
            this._socket.setTimeout(timeout);
        }
    }

	static _readSocket(socket, numberOfBytes) {
        // console.log('TCPSOCKET._readSocket');
		return new Promise((resolve, reject) => {
			let callback = TCPSocket._createCallbackToPromise(resolve, reject);
	        try {
                // Attempt to read the asked for number of bytes.
	            let buffer = socket.read(numberOfBytes);
        // console.log('TCPSOCKET._readSocket buffer: ' + buffer);
	            if(buffer === null) {
        // console.log('TCPSOCKET._readSocket listen for readable');
                    // Unfortunately the returned buffer is null.
                    // We need to retry until more bytes arrive.
	                socket.once('readable', function () {
        // console.log('TCPSOCKET._readSocket readable!!!!!');
                        // When the readable event is fired it means there are more bytes
                        // to be read. Lets see if there are enough of them.
	                    TCPSocket._readSocket(socket, numberOfBytes).then(
	                    	(b) => {
                                // There were no errors. Lets return the read buffer.
	                        	callback(null, b);
	                    	},
	                    	(error) => {
                                // Something went wrong. Lets return the error.
	                        	callback(error);
	                    	}
                    	);
	                });
	            } else {
                    // We successfully read the asked for number of bytes.
                    // There were no errors. Lets return the read buffer.
                	callback(null, buffer);
	            }
	        } catch(exception) {
        // console.log('TCPSOCKET._readSocket exception: ' + exception);
	            callback(exception);
	        }
	    });
	}

	static _createCallbackToPromise(resolve, reject) {
	    return (error, result) => {
	        if (error === undefined || error === null) {
                if (resolve) {
                    resolve(result);
                }
            } else {
	            if (reject) {
	                reject(error);
	            }
	        }
	    };
	}
}

module.exports = TCPSocket;