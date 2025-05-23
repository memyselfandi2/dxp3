/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-net-json
 *
 * NAME
 * JSONClientCLI
 */
const packageName = 'dxp3-net-json';
const moduleName = 'JSONClientCLI';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * @module dxp3-net-json/JSONClientCLI
 */
const JSONClient = require('./JSONClient');
const JSONClientEvent = require('./JSONClientEvent'); 
const JSONClientOptions = require('./JSONClientOptions');
const logging = require('dxp3-logging');
const readline = require('readline');
const util = require('dxp3-util');

class JSONClientCLI {
    /*********************************************
     * CONSTRUCTOR
     ********************************************/

	constructor(_jsonClient) {
		this._jsonClient = _jsonClient;
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
			prompt: 'DXP3-JSON-CLIENT>'
		});
		this._rl.on('close', () => {
			this._parseExit();
		});
		this._jsonClient.on(JSONClientEvent.CLOSED, () => {
			console.log('JSONClient closed.');
			this._rl.prompt();
		});
		this._jsonClient.on(JSONClientEvent.CONNECTED, () => {
			console.log('JSONClient connected.');
			this._rl.prompt();
		});
		this._jsonClient.on(JSONClientEvent.CONNECTING, () => {
			console.log('JSONClient connecting.');
			this._rl.prompt();
		});
		this._jsonClient.on(JSONClientEvent.SOCKET_CONNECTED, (socketPoolID, socketID, remoteAddress, remotePort) => {
			console.log('Socket pool ' + socketPoolID + ' connected socket ' + socketID + ' to ' + remoteAddress + ':' + remotePort + '.');
			this._rl.prompt();
		});
		this._jsonClient.on(JSONClientEvent.SOCKET_POOL_CLOSED, (socketPoolID) => {
			console.log('Socket pool ' + socketPoolID + ' closed.');
			this._rl.prompt();
		});
		this._jsonClient.on(JSONClientEvent.SOCKET_POOL_CONNECTED, (socketPoolID, remoteAddress, remotePort) => {
			console.log('Socket pool ' + socketPoolID + ' connected to ' + remoteAddress + ':' + remotePort + '.');
			this._rl.prompt();
		});
		this._jsonClient.on(JSONClientEvent.SOCKET_TIMEOUT, (socketPoolID, socketID) => {
			console.log('Socket pool ' + socketPoolID + ' timed out socket ' + socketID + '.');
			this._rl.prompt();
		});
		this._jsonClient.on(JSONClientEvent.SOCKET_CLOSED, (socketPoolID, socketID) => {
			console.log('Socket pool ' + socketPoolID + ' closed socket ' + socketID + '.');
			this._rl.prompt();
		});
		this._jsonClient.on(JSONClientEvent.ERROR, (err) => {
			console.log('Connection error: ' + err);
			this._rl.prompt();
		});
		this._jsonClient.on(JSONClientEvent.QUEUING, () => {
			console.log('JSONClient queuing.');
			this._rl.prompt();
		});
		console.clear();
		console.log('');
		console.log('Use this interface to communicate with a JSONServer.');
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

	_parseConnect(line) {
		let self = this;
		let addressPort = line.split(':');
		let address = addressPort[0];
		let port = addressPort[1];
		this._jsonClient.connect(address, port, (_error, socketPoolID) => {
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
			this._jsonClient.disconnect(address, port);
			console.log('Disconnecting from ' + address + ':' + port + '.');
		} catch(_exception) {
			console.log('Error: ' + _exception);
		}
		this._rl.prompt();
	}

	_parseExit() {
		console.log('Goodbye.');
		process.exit();
	}

	async _parseLine(line) {
		let command = null;
		let commandArguments = null;
		let subCommand = null;
		let subCommandArguments = null;
		line = line.trim();
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
			case 'PARSE_STREAM':
				let streamCMD = line;
				this._jsonClient.stream(streamCMD, (error, socket) => {
					if(error) {
						console.log('Error: ' + error);
					} else {
						socket.readFile('C:\\temp\\henkie.jpg');
					}
					this._rl.prompt();
				});
				this._state = 'PARSE';
				break;
			case 'PARSE_SEND':
				this._parseSend(line);
				this._state = 'PARSE';
				break;
			case 'PARSE_CONNECT':
				let addressPort = line.split(':');
				let address = addressPort[0];
				let port = addressPort[1];
				if(port === undefined || port === null) {
					port = 0;
				}
				this._jsonClient.connect(address, port);
				this._state = 'PARSE';
				break;
			case 'PARSE_SET_TIMEOUT':
				this._parseSetTimeout(line);
				this._state = 'PARSE';
				break;
			default:
				switch(command) {
					case 'config':
					case 'configuration':
					case 'prefs':
					case 'preferences':
					case 'settings':
					case 'status':
					case 'state':
						this._parseStatus();
						break;
					case 'list':
						let connections = this._jsonClient.list();
						if(connections.length <= 0) {
							console.log('There are no connections.')
						} else {
							console.log('Available connections:');
							for(let i=0;i < connections.length;i++) {
								console.log(connections[i]);
							}
						}
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
							let connections = this._jsonClient.list();
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
					case 'close':
					case 'stop':
						this._jsonClient.close();
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
					case 'stream':
						console.log('Specify the message to (or json string) to initiate the stream.');
						this._state = 'PARSE_STREAM';
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
					default:
						console.log('Unknown command. Type help to get an overview of known commands.');
						break;
				}
				break;
		}
		this._rl.prompt();
	}

	_parseHelp() {
		// Clear the scroll buffer.
		process.stdout.write('\u001b[3J\u001b[1J');
		// Clear the window.
		console.clear();
		console.log('ACTIONS: core methods that provide our JSONClient capabilities.');
		console.log('');
		console.log('COMMAND -----------------------------+ ALIASES -------------+ DESCRIPTION -----------------------------------+');
		console.log('send                                 + message, msg, write  + Send a message to a JSONServer.                |');
		console.log('                                     |                      | You will be prompted for the message to send.  |');
		console.log('-------------------------------------+----------------------+------------------------------------------------+');
		console.log('');
		console.log('CONFIGURATION / PREFERENCES: Commands to control the JSONClient.');
		console.log('');
		console.log('COMMAND -----------------------------+ ALIASES -------------+ DESCRIPTION -----------------------------------+');
		console.log('status                               + config,              + Get the current state of the JSONClient.       |');
		console.log('                                     | configuration,       |                                                |');
		console.log('                                     | prefs, preferences,  |                                                |');
		console.log('                                     | settings, state      |                                                |');
		console.log('-------------------------------------+----------------------+------------------------------------------------+');
		console.log('');
		console.log('PROCESS FLOW: Commands to connect and disconnect the JSONClient.');
		console.log('');
		console.log('COMMAND -----------------------------+ ALIASES -------------+ DESCRIPTION -----------------------------------+');
		console.log('close                                + stop                 + Disconnect/destroy all connections.            |')
		console.log('connect             <address>:<port> + start                + Connect to a JSONServer at <address>:<port>.   |');
		console.log('disconnect          <address>:<port> + destroy              + Disconnect from a JSONServer at                |');
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
		let msg = line;
		if(msg.startsWith('{') && msg.endsWith('}')) {
			msg = JSON.parse(msg);
		}
		
		// for(let i=0;i < 100;i++) {
		// 	((i,line) => {
		// 	let msg = line + '_' + i;
		//  	setTimeout(() => {
		//  		console.log('request: ' + msg);
				this._jsonClient.write(msg, (err, reply) => {
					if(err) {
						console.log('Error: ' + err);
					} else {
						console.log('reply: ' + JSON.stringify(reply));
					}
					this._rl.prompt();
				});
		// 	}, i * Math.floor(Math.random() * 60));
		// 	Math.floor(Math.random() * 5000)
		// })(i,line);
		// }
		this._rl.prompt();
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
			this._jsonClient.setTimeout(line);
			console.log('Timeout set to ' + this._jsonClient.getTimeout());
		} catch(_exception) {
			if(_exception.code === JSONError.ILLEGAL_ARGUMENT.code) {
				console.log('The supplied timeout is not a number. Unable to update the timeout.')
			} else {
				console.log('Error: ' + _exception.toString());
			}
		}
		this._rl.prompt();
	}

	_parseStatus() {
        console.log('Maximum number of sockets: ' + this._jsonClient.maximumNumberOfSockets);
        console.log('Minimum number of sockets: ' + this._jsonClient.minimumNumberOfSockets);
		console.log('Timeout                  : ' + this._jsonClient.getTimeout() + 'ms');
		console.log('State                    : ' + this._jsonClient.getState());
		console.log('Logging                  : ' + logging.Level.toString(logging.getLevel()));
		this._rl.prompt();
	}

	static main() {
		try {
			let jsonClientOptions = JSONClientOptions.parseCommandLine();
			logging.setLevel(jsonClientOptions.logLevel);
			if(jsonClientOptions.help) {
				util.Help.print(JSONClientCLI);
				return;
			}
			let jsonClient = new JSONClient(jsonClientOptions);
			let jsonClientCLI = new JSONClientCLI(jsonClient);
			jsonClientCLI.start();
		} catch(exception) {
			console.log(exception.message);
		}
	}
}
// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
	JSONClientCLI.main();
	return;
}

module.exports = JSONClientCLI;