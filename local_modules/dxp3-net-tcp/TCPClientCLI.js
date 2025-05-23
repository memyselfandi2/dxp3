/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-net-tcp
 *
 * NAME
 * TCPClientCLI
 */
const packageName = 'dxp3-net-tcp';
const moduleName = 'TCPClientCLI';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * @module dxp3-net-tcp/TCPClientCLI
 */
const logging = require('dxp3-logging');
const readline = require('readline');
const TCPClient = require('./TCPClient');
const TCPClientOptions = require('./TCPClientOptions');
const TCPClientEvent = require('./TCPClientEvent');
const util = require('dxp3-util');
/**
 * A TCPClient command line interface program.
 */
class TCPClientCLI {
    /*********************************************
     * CONSTRUCTOR
     ********************************************/

	/**
	 * @param {module:dxp3-net-tcp/TCPClient~TCPClient} _tcpClient
	 */
	constructor(_tcpClient) {
		this._tcpClient = _tcpClient;
		this._rl = null;
		this._state = 'PARSE';
	}

    /*********************************************
     * PUBLIC METHODS
     ********************************************/

	start() {
		this._rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout,
			prompt: 'DXP3-TCP-CLIENT>'
		});
		this._rl.on('close', () => {
			this._parseExit();
		});
		this._tcpClient.on(TCPClientEvent.CLOSED, () => {
			console.log('TCPClient closed.');
			this._rl.prompt();
		});
		this._tcpClient.on(TCPClientEvent.CLOSING, () => {
			console.log('TCPClient closing...');
			this._rl.prompt();
		});
		this._tcpClient.on(TCPClientEvent.CONNECTED, () => {
			console.log('TCPClient Connected.');
			this._rl.prompt();
		});
		this._tcpClient.on(TCPClientEvent.CONNECTING, () => {
			console.log('TCPClient connecting.');
			this._rl.prompt();
		});
		this._tcpClient.on(TCPClientEvent.SOCKET_CONNECTED, (socketPoolID, socketID, remoteAddress, remotePort) => {
			console.log('TCPSocketPool ' + socketPoolID + ' connected TCPSocket ' + socketID + ' to ' + remoteAddress + ':' + remotePort + '.');
			this._rl.prompt();
		});
		this._tcpClient.on(TCPClientEvent.SOCKET_CLOSED, (socketPoolID, socketID) => {
			console.log('TCPSocketPool ' + socketPoolID + ' closed TCPSocket ' + socketID + '.');
			this._rl.prompt();
		});
		this._tcpClient.on(TCPClientEvent.SOCKET_POOL_CLOSED, (socketPoolID) => {
			console.log('TCPSocketPool ' + socketPoolID + ' closed.');
			this._rl.prompt();
		});
		this._tcpClient.on(TCPClientEvent.SOCKET_POOL_CONNECTED, (socketPoolID, remoteAddress, remotePort) => {
			console.log('TCPSocketPool ' + socketPoolID + ' connected to ' + remoteAddress + ':' + remotePort + '.');
			this._rl.prompt();
		});
		this._tcpClient.on(TCPClientEvent.SOCKET_TIMEOUT, (socketPoolID, socketID) => {
			console.log('TCPSocketPool ' + socketPoolID + ' timed out TCPSocket ' + socketID + '.');
			this._rl.prompt();
		});
		this._tcpClient.on(TCPClientEvent.ERROR, (_error) => {
			console.log('TCPClient error: ' + _error + '.');
			this._rl.prompt();
		});
		this._tcpClient.on(TCPClientEvent.QUEUING, () => {
			console.log('TCPClient queuing...');
			this._rl.prompt();
		});
		console.clear();
		console.log('');
		console.log('Use this interface to control an TCPClient.');
		console.log('Type help for a list of available commands.');
		this._parse();
	}

    /*********************************************
     * PRIVATE METHODS
     ********************************************/

	_parse() {
		this._rl.prompt();
		this._rl.on('line', (line) => {
			this._parseLine(line);
		});
	}

	async _parseLine(line) {
		let command = null;
		let commandArguments = null;
		let subCommand = null;
		let subCommandArguments = null;
		let lineLowerCase = null;
		line = line.trim();
		lineLowerCase = line.toLowerCase();
		let parts = line.split(' ');
		command = parts[0];
		if(parts.length === 1) {
			commandArguments = '';
			subCommand = '';
			subCommandArguments = '';
		} else if(parts.length > 1) {
			commandArguments = '';
			for(let i=1;i < parts.length;i++) {
				commandArguments += parts[i] + ' ';
			}
			commandArguments = commandArguments.trim();
			subCommand = parts[1];
			subCommandArguments = '';
			if(parts.length > 2) {
				for(let i=2;i < parts.length;i++) {
					subCommandArguments += parts[i] + ' ';
				}
				subCommandArguments = subCommandArguments.trim();
			}
		}
		switch(this._state) {
			case 'PARSE_FILE':
				let filePath = line.trim();
				this._tcpClient.sendFile(filePath, (error, socket) => {
					if(error) {
						console.log(error.message);
						if(socket) {
							socket.destroy();
						}
					} else {
						socket.release();
					}
					this._rl.prompt();
				});
				this._state = 'PARSE_CMD';
				break;
			case 'PARSE_SEND':
				this._parseSend(line);
				this._state = 'PARSE_CMD';
				break;
			case 'PARSE_CONNECT':
				this._parseConnect(line);
				this._state = 'PARSE';
				break;
			case 'PARSE_DISCONNECT':
				this._parseDisconnect(line);
				this._state = 'PARSE';
				break;
			case 'PARSE_LOGGING':
				this._parseLogging(line);
				this._state = 'PARSE';
				break;
			case 'PARSE_SET_TIMEOUT':
				this._parseSetTimeout(line);
				this._state = 'PARSE';
				break;
			default:
				switch(command) {
					case 'close':
					case 'stop':
						this._parseClose();
						break;
					case 'clear':
						console.clear();
						break;
					case 'connect':
						if(commandArguments.length > 0) {
							this._parseConnect(commandArguments);
						} else {
							console.log('Specify the address and port separated by a :');
							this._state = 'PARSE_CONNECT';
						}
						break;
					case 'disconnect':
					case 'destroy':
						if(commandArguments.length > 0) {
							this._parseDisconnect(commandArguments);
						} else {
							let connections = this._tcpClient.list();
							if(connections.length <= 0) {
								console.log('There are no connections to disconnect from.')
							} else if(connections.length === 1) {
								this._parseDisconnect(connections[0]);
							} else {
								console.log('Available connections:');
								for(let i=0;i < connections.length;i++) {
									console.log(connections[i]);
								}
								console.log('Specify the address and port separated by a :');
								this._state = 'PARSE_DISCONNECT';
							}
						}
						break;
					case 'list':
						let connections = this._tcpClient.list();
						if(connections.length <= 0) {
							console.log('There are no connections.')
						} else {
							console.log('Available connections:');
							for(let i=0;i < connections.length;i++) {
								console.log(connections[i]);
							}
						}
						break;
					case 'send':
					case 'msg':
					case 'message':
					case 'write':
						if(commandArguments.length > 0) {
							this._parseSend(commandArguments);
						} else {
							console.log('Specify the message (or tcp string) to send.');
							this._state = 'PARSE_SEND';
						}
						break;
					case 'sendfile':
					case 'writefile':
					case 'file':
						console.log('Specify which file to send.');
						this._state = 'PARSE_FILE';
						break;
					case 'config':
					case 'configuration':
					case 'prefs':
					case 'preferences':
					case 'settings':
					case 'status':
					case 'state':
						this._parseStatus();
						break;
					case 'log':
					case 'logger':
					case 'logging':
					case 'loglevel':
						if(commandArguments.length > 0) {
							this._parseLogging(commandArguments);
						} else {
							console.log('What should the log level be?');
							console.log('Type trace,debug,info,warning,error,fatal or off.');
							console.log('Type cancel, exit, quit or stop to cancel.');
							this._state = 'PARSE_LOGGING';
						}
						break;
					case 'exit':
					case 'quit':
						this._parseExit();
						break;
					case 'faq':
					case 'help':
					case 'info':
					case 'information':
						this._parseHelp();
						break;
					case 'timeout':
						if(commandArguments.length > 0) {
							this._parseSetTimeout(commandArguments);
						} else {
							console.log('Please specify the timeout in milliseconds.');
							console.log('Type cancel, exit, quit or stop to cancel.');
							this._state = 'PARSE_SET_TIMEOUT';
						}
						break;
					case 'set':
						switch(subCommand) {
							case 'timeout':
								if(subCommandArguments.length > 0) {
									this._parseSetTimeout(subCommandArguments);
								} else {
									console.log('Please specify the timeout in milliseconds.');
									console.log('Type cancel, exit, quit or stop to cancel.');
									this._state = 'PARSE_SET_TIMEOUT';
								}
								break;
							default:
								console.log('Unknown command.');
								console.log('Type help for a list of available commands.');									
								break;
						}
						break;
					default:
						console.log('Unknown command. Type help to get an overview of known commands.');
						break;
				}
				break;
		}
		this._rl.prompt();
	}

	_parseClose() {
		if(this._tcpClient.isClosed()) {
			console.log('The TCPClient is already closed.');
			this._rl.prompt();
			return;
		}
		try {
			this._tcpClient.close();
		} catch(_exception) {
			console.log(_exception);
		}
	}

	_parseConnect(line) {
		let self = this;
		let addressPort = line.split(':');
		let address = addressPort[0];
		let port = addressPort[1];
		this._tcpClient.connect(address, port, (_error, socketPoolID) => {
			if(_error) {
				console.log('Unable to connect to \'' + address + ':' + port + '\'.');
				console.log('Error: ' + _error + '.');
			} else {
				console.log('Connected to socket pool \'' + socketPoolID + '\'.');
			}
			this._rl.prompt();
		});		
	}

	_parseDisconnect(line) {
		let addressPort = line.split(':');
		let address = addressPort[0];
		let port = addressPort[1];
		try {
			this._tcpClient.disconnect(address, port);
			console.log('Disconnecting from ' + address + ':' + port + '.');
		} catch(_exception) {
			console.log('Error: ' + _exception);
		}
		this._rl.prompt();
	}

	_parseExit() {
		console.log('Goodbye.');
		process.exit(1);
	}

	_parseHelp() {
		// Clear the scroll buffer.
		process.stdout.write('\u001b[3J\u001b[1J');
		// Clear the window.
		console.clear();
		console.log('');
		console.log('ACTIONS: core methods that provide our TCPClient capabilities.');
		console.log('');
		console.log('COMMAND -----------------------------+ ALIASES -------------+ DESCRIPTION -----------------------------------+');
		console.log('send                <data>           + message,msg,write    + Send a message.                                |');
		console.log('                                     |                      | This can either be a string or a JSON object.  |');
		console.log('sendfile            <path>           + file,writefile       + Send a file to a TCPServer.                    |');
		console.log('                                     |                      | The path must include the folder and filename. |');
		console.log('-------------------------------------+----------------------+------------------------------------------------+');
		console.log('');
		console.log('CONFIGURATION / PREFERENCES: Commands to control the TCPClient.');
		console.log('');
		console.log('COMMAND -----------------------------+ ALIASES -------------+ DESCRIPTION -----------------------------------+');
		console.log('set maximum         <number>         + maximum              + Maximum number of sockets per pool.            |');
		console.log('set minimum         <number>         + minimum              + Minimum number of sockets per pool.            |');
		console.log('set timeout         <number>         + timeout              + Connection timeout.                            |');
		console.log('status                               + config,              + Get the current state of the TCPClient.        |');
		console.log('                                     | configuration,       |                                                |');
		console.log('                                     | prefs, preferences,  |                                                |');
		console.log('                                     | settings, state      |                                                |');
		console.log('-------------------------------------+----------------------+------------------------------------------------+');
		console.log('');
		console.log('PROCESS FLOW: Commands to connect and disconnect the TCPClient.');
		console.log('');
		console.log('COMMAND -----------------------------+ ALIASES -------------+ DESCRIPTION -----------------------------------+');
		console.log('close                                + stop                 + Close the TCPClient.                           |');
		console.log('connect             <address>:<port> + start                + Connect to a TCPServer at <address>:<port>.    |');
		console.log('disconnect          <address>:<port> + destroy              + Disconnect from a TCPServer at                 |');
		console.log('                                     |                      | <address>:<port>.                              |');
		console.log('list                                 +                      + List each connection as <address>:<port>.      |');
		console.log('-------------------------------------+----------------------+------------------------------------------------+');
		console.log('');
		console.log('PROGRAM FLOW: Commands to control this command line interface program.');
		console.log('');
		console.log('COMMAND -----------------------------+ ALIASES -------------+ DESCRIPTION -----------------------------------+');
		console.log('clear                                +                      + Clear the console/screen.                      |')
		console.log('exit                                 + quit                 + Exit this program.                             |');
		console.log('help                                 + faq, info,           + Show this help screen.                         |');
		console.log('                                     + information          +                                                |');
		console.log('loglevel            <level>          + log, logger, logging + Set the log level.                             |');
		console.log('                                     |                      | One of trace, debug, info, warning, error,     |');
		console.log('                                     |                      | fatal or off.                                  |');
		console.log('-------------------------------------+----------------------+------------------------------------------------+');
		console.log('');
	}

	_parseLogging(line) {
		let lineLowerCase = line.toLowerCase();
		if(lineLowerCase === 'cancel'  || lineLowerCase === 'exit' ||
		   lineLowerCase === 'quit'    || lineLowerCase === 'stop') {
		   	console.log('Cancelled.');
			this._rl.prompt();
			return;
		}
		logging.setLevel(line);
		console.log('Logging set to \'' + logging.Level.toString(logging.getLevel()) + '\'.');
		this._rl.prompt();
	}

	_parseSend(line) {
		let msg = line.trim();
		if(msg.startsWith('{') && msg.endsWith('}')) {
			try {
				msg = JSON.parse(msg);
			} catch(exception) {
				console.log('Unfortunately this seems to be malformed JSON.')
				return;
			}
		}
		let self = this;
		this._tcpClient.send(msg, (_error, socket) => {
			if(_error) {
				console.log(_error.message);
				socket.destroy();
				this._rl.prompt();
				return;
			}
			if(typeof msg === 'object') {
				socket.readJSON().then(
					// Resolve
					(json) => {
						console.log('reply: ' + JSON.stringify(json));
						socket.release();
						this._rl.prompt();
					},
					(error) => {
						console.log('error: ' + error);
						socket.release();
						this._rl.prompt();
					}
				);
			} else {
				socket.readString().then(
					// Resolve
					(str) => {
						console.log('reply: ' + str);
						socket.release();
						this._rl.prompt();
					},
					(error) => {
						console.log('error: ' + error);
						socket.release();
						this._rl.prompt();
					}
				);
			}
		});
	}

	_parseSetTimeout(line) {
		let lineLowerCase = line.toLowerCase();
		if(lineLowerCase === 'cancel'  || lineLowerCase === 'exit' ||
		   lineLowerCase === 'quit'    || lineLowerCase === 'stop') {
		   	console.log('Cancelled.');
			this._rl.prompt();
			return;
		}
		try {
			this._tcpClient.setTimeout(line);
			console.log('Timeout set to ' + this._tcpClient.getTimeout());
		} catch(_exception) {
			if(_exception.code === TCPError.ILLEGAL_ARGUMENT.code) {
				console.log('The supplied timeout is not a number. Unable to update the timeout.')
			} else {
				console.log('Error: ' + _exception.toString());
			}
		}
		this._rl.prompt();
	}

	_parseStatus() {
        console.log('Maximum number of sockets: ' + this._tcpClient.maximumNumberOfSockets);
        console.log('Minimum number of sockets: ' + this._tcpClient.minimumNumberOfSockets);
		console.log('Timeout                  : ' + this._tcpClient.getTimeout() + 'ms');
		console.log('State                    : ' + this._tcpClient.getState());
		console.log('Logging                  : ' + logging.Level.toString(logging.getLevel()));
		this._rl.prompt();
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
			let tcpClientCLI = new TCPClientCLI(tcpClient);
			tcpClientCLI.start();
		} catch(exception) {
			console.log(exception.message);
		}
	}
}
// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
	TCPClientCLI.main();
	return;
}

module.exports = TCPClientCLI;