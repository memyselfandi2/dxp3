/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-net-tcp
 *
 * NAME
 * TCPServerCLI
 */
const packageName = 'dxp3-net-tcp';
const moduleName = 'TCPServerCLI';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * @module dxp3-net-tcp/TCPServerCLI
 */
const fs = require('fs');
// It's important to log errors and warnings.
const logging = require('dxp3-logging');
const readline = require('readline');
const TCPError = require('./TCPError');
const TCPServer = require('./TCPServer');
const TCPServerEvent = require('./TCPServerEvent');
const TCPServerOptions = require('./TCPServerOptions');
const util = require('dxp3-util');
/**
 * A TCPServer command line interface program.
 */
class TCPServerCLI {
    /*********************************************
     * CONSTRUCTOR
     ********************************************/

    /**
	 * @param {module:dxp3-net-tcp/TCPServer} _tcpServer
     */
	constructor(_tcpServer) {
		this._tcpServer = _tcpServer;
		this._socketConnectionHandlerName = './EchoSocketConnectionHandler';
		this._socketConnectionHandler = require(this._socketConnectionHandlerName);
		this._tcpServer.on(TCPServerEvent.SOCKET_CONNECTED, this._socketConnectionHandler);
	    this.originalPort = this._tcpServer.getPort();
	    this.originalAddress = this._tcpServer.getAddress();
	    this.originalHandler = this._socketConnectionHandlerName;
	    this.originalTimeout = this._tcpServer.getTimeout();
		this._hasUnsavedChanges = false;
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
			prompt: 'DXP3-TCP-SERVER>'
		});
		this._rl.on('close', () => {
			this._parseExit();
		});
		this._tcpServer.on(TCPServerEvent.RUNNING, (_address, _port) => {
			console.log('TCPServer running at ' + _address + ':' + _port);
			this._rl.prompt();
		});
		this._tcpServer.on(TCPServerEvent.STARTING, () => {
			console.log('TCPServer starting...');
			this._rl.prompt();
		});
		this._tcpServer.on(TCPServerEvent.STOPPED, () => {
			console.log('TCPServer stopped.');
			this._rl.prompt();
		});
		this._tcpServer.on(TCPServerEvent.STOPPING, () => {
			console.log('TCPServer stopping...');
			this._rl.prompt();
		});
		this._tcpServer.on(TCPServerEvent.ERROR, (_error) => {
			console.log('TCPServer error: ' + _error.toString());
			this._rl.prompt();
		});
		console.clear();
		console.log('');
		console.log('Use this interface to control a TCPServer.');
		console.log('The TCPServer has not yet been started, but it has been');
		console.log('initialized with default values.');
		console.log('Type help for a list of available commands.');
		this._parse();
	}

    /*********************************************
     * PRIVATE METHODS
     ********************************************/

	async exists(path) {
		try {
			await fs.promises.access(path, fs.constants.F_OK);
			return true;
		} catch(_error) {
			return false;
		}
	}

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
			case 'PARSE_LOAD':
				this._parseLoad(line);
				this._state = 'PARSE';
				break;
			case 'PARSE_LOGGING':
				this._parseLogging(line);
				this._state = 'PARSE';
				break;
			case 'PARSE_RESET':
				this._parseReset(line);
			    this._state = 'PARSE';
				break;
			case 'PARSE_SAVE':
				if(await this.exists(line)) {
					this.filePath = line;
					console.log('File exists. Do you want to overwrite (yes/no)?');
					this._state = 'PARSE_SAVE_CONFIRM';
				} else {
					this._parseSave(line);
					this._state = 'PARSE';
				}
				break;
			case 'PARSE_SAVE_CONFIRM':
				if(line === 'yes' || line === 'y' || line === 'true') {
					this._parseSave(this.filePath);
				} else {
					console.log('Cancelled.');
				}
				this._state = 'PARSE';
				break;
			case 'PARSE_SET_ADDRESS':
				this._parseSetAddress(line);
				this._state = 'PARSE';
				break;
			case 'PARSE_SET_HANDLER':
				this._parseSetHandler(line);
				this._state = 'PARSE';
				break;
			case 'PARSE_SET_PORT':
				this._parseSetPort(line);
				this._state = 'PARSE';
				break;
			case 'PARSE_SET_TIMEOUT':
				this._parseSetTimeout(line);
				this._state = 'PARSE';
				break;
			default:
				switch(command) {
					case 'address':
					case 'ipaddress':
					case 'tcpaddress':
						if(commandArguments.length > 0) {
							this._parseAddress(commandArguments);
						} else {
							console.log('What address should the TCPServer bind to?');
							console.log('Specifying an empty address (by hitting enter/return) will set');
							console.log('the address to 0.0.0.0. This address binds to all the ip addresses');
							console.log('of the host.');
							console.log('Type cancel, exit, quit or stop to cancel.');
							this._state = 'PARSE_SET_ADDRESS';
						}
						break;
					case 'clear':
						console.clear();
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
					case 'exit':
					case 'quit':
						this._parseExit();
						break;
					case 'handler':
						if(commandArguments.length > 0) {
							this._parseSetHandler(commandArguments);
						} else {
							console.log('Please give the location of the socket connection handler implementation.');
							console.log('Examples: ./EchoSocketConnectionHandler or ./FileSocketConnectionHandler.');
							console.log('Type cancel, exit, quit or stop to cancel.');
							this._state = 'PARSE_SET_HANDLER';
						}
						break;
					case 'help':
					case 'info':
					case 'information':
					case 'faq':
						this._parseHelp();
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
					case 'load':
					case 'import':
						if(commandArguments.length > 0) {
							this._parseLoad(commandArguments);
						} else {
							console.log('What is the filepath?');
							console.log('Type cancel, exit, quit or stop to cancel.');
							this._state = 'PARSE_LOAD';
						}
						break;
					case 'reset':
						if(this._hasUnsavedChanges) {
						    console.log('Are you sure (yes/no)?');
						    this._state = 'PARSE_RESET';
						} else {
							console.log('Nothing to reset.');
							console.log('Cancelled.');
						}
						break;
					case 'save':
					case 'export':
						if(commandArguments.length > 0) {
							if(await this.exists(commandArguments)) {
								this.filePath = commandArguments;
								console.log('File exists. Do you want to overwrite (yes/no)?');
								this._state = 'PARSE_SAVE_CONFIRM';
							} else {
								this._parseSave(commandArguments);
							}
						} else {
							console.log('What is the filepath?');
							console.log('Type cancel, exit, quit or stop to cancel.');
							this._state = 'PARSE_SAVE';
						}
						break;
					case 'port':
					case 'tcpport':
						if(commandArguments.length > 0) {
							this._parseSetPort(commandArguments);
						} else {
							console.log('Please specify the port.');
							console.log('Type cancel, exit, quit or stop to cancel.');
							this._state = 'PARSE_SET_PORT';
						}
						break;
					case 'set':
						switch(subCommand) {
							case 'address':
							case 'ipaddress':
							case 'tcpaddress':
								if(subCommandArguments.length > 0) {
									this._parseSetAddress(subCommandArguments);
								} else {
									console.log('What address should be bind to?');
									console.log('Use 0.0.0.0 to bind to all ip addresses of the host.');
									console.log('Type cancel, exit, quit or stop to cancel.');
									this._state = 'PARSE_SET_ADDRESS';
								}
								break;
							case 'handler':
								if(subCommandArguments.length > 0) {
									this._parseSetHandler(subCommandArguments);
								} else {
									console.log('Please give the location of the socket connection handler implementation.');
									console.log('Examples: ./EchoSocketConnectionHandler or ./FileSocketConnectionHandler.');
									console.log('Type cancel, exit, quit or stop to cancel.');
									this._state = 'PARSE_SET_HANDLER';
								}
								break;
							case 'log':
							case 'logger':
							case 'logging':
							case 'loglevel':
								if(subCommandArguments.length > 0) {
									this._parseLogging(subCommandArguments);
								} else {
									console.log('What should the log level be?');
									console.log('Type trace,debug,info,warning,error,fatal or off.');
									console.log('Type cancel, exit, quit or stop to cancel.');
									this._state = 'PARSE_LOGGING';
								}
								break;
							case 'port':
							case 'tcpport':
								if(subCommandArguments.length > 0) {
									this._parseSetPort(subCommandArguments);
								} else {
									console.log('Please specify the port.');
									console.log('Type cancel, exit, quit or stop to cancel.');
									this._state = 'PARSE_SET_PORT';
								}
								break;
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
					case 'start':
						this._parseStart();
						break;
					case 'stop':
						this._parseStop();
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
						console.log('Unknown command.');
						console.log('Type help for a list of available commands.');
						break;
				}
				break;
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
		console.log('CONFIGURATION / PREFERENCES: Commands to control the TCPServer.');
		console.log('');
		console.log('COMMAND -----------------------------+ ALIASES -------------+ DESCRIPTION -----------------------------------+');
		console.log('set address         <ip>             + address,             + Set the TCP address to bind to.                |');
		console.log('                                     | ipaddress,           | By default this is set to 0.0.0.0, which binds |');
		console.log('                                     | tcpaddress           | the TCPServer to all ip addresses of the host. |');
		console.log('set handler         <location>       + handler              + Set the socket connection handler function.    |');
		console.log('                                     |                      | As of this writing, there are two built-in:    |');
		console.log('                                     |                      | ./EchoSocketConnectionHandler, and             |');
		console.log('                                     |                      | ./FileSocketConnectionHandler                  |');
		console.log('set port            <number>         + port,                + Set the TCP port to bind to.                   |');
		console.log('                                     | tcpport              | The TCPServer must be stopped first before     |');
		console.log('                                     |                      | the port can be updated.                       |');
		console.log('set timeout         <number>         + timeout              + Set the connection timeout.                    |');
		console.log('status                               + config,              + Get the current state of the TCPServer.        |');
		console.log('                                     | configuration,       |                                                |');
		console.log('                                     | prefs, preferences,  |                                                |');
		console.log('                                     | settings, state      |                                                |');
		console.log('-------------------------------------+----------------------+------------------------------------------------+');
		console.log('');
		console.log('PERSISTENCE/STORAGE: Commands to export and/or import settings.');
		console.log('');
		console.log('COMMAND -----------------------------+ ALIASES -------------+ DESCRIPTION -----------------------------------+');
		console.log('load                <filepath>       + import               + Load a previously saved configuration.         |');
		console.log('reset                                +                      + Reset all the settings back to their defaults. |');
		console.log('save                <filepath>       + export               + Save the current configuration.                |')
		console.log('-------------------------------------+----------------------+------------------------------------------------+');
		console.log('');
		console.log('PROCESS FLOW: Commands to start and stop the TCPServer.');
		console.log('');
		console.log('COMMAND -----------------------------+ ALIASES -------------+ DESCRIPTION -----------------------------------+');
		console.log('start                                +                      + Start the TCPServer.                           |');
		console.log('stop                                 +                      + Stop the TCPServer.                            |');
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

	async _parseLoad(line) {
		let lineLowerCase = line.trim().toLowerCase();
		if(lineLowerCase === 'cancel'  || lineLowerCase === 'exit' ||
		   lineLowerCase === 'quit'    || lineLowerCase === 'stop' || lineLowerCase.length <= 0) {
		   	console.log('Cancelled.');
			this._rl.prompt();
			return;
		}
		if(!this._tcpServer.isInitialized() &&
		   !this._tcpServer.isStopped()) {
			console.log('Make sure the TCPServer is not running. Cancelled.');
			this._rl.prompt();
			return;
		}
		if(this._hasUnsavedChanges) {
			this._rl.question('DXP3-TCP> There are unsaved changes. Are you sure you want to continue loading?', (answer) => {
				if (answer.match(/^y(es)?$/i)) {
					this._load(line);
				} else {
					console.log('Cancelled.');
					this._rl.prompt();
				}
			});
		} else {
			this._load(line);
		}
	}

	async _load(line) {
		try {
			let persistAsString = await fs.promises.readFile(line, 'utf8');
			let persist = JSON.parse(persistAsString);
			this._tcpServer.setAddress(persist.address);
			this._tcpServer.setPort(persist.port);
			this._tcpServer.off(TCPServerEvent.SOCKET_CONNECTED, this._socketConnectionHandler);
			this._socketConnectionHandlerName = persist.handler;
			this._socketConnectionHandler = require(this._socketConnectionHandlerName);
			this._tcpServer.on(TCPServerEvent.SOCKET_CONNECTED, this._socketConnectionHandler);
			this._tcpServer.setTimeout(persist.timeout);
			console.log('Loading finished.');
		    this.originalAddress = this._tcpServer.getAddress();
		    this.originalPort = this._tcpServer.getPort();
		    this.originalHandler = this._socketConnectionHandlerName;
		    this.originalTimeout = this._tcpServer.getTimeout();
			this._hasUnsavedChanges = false;
			this._parseStatus();
		} catch(_error) {
			if(_error.code === 'ENOENT') {
    			console.log('File not found.');
				console.log('Cancelled.');
			} else {
				console.log('Something went wrong during load: ' + _error.toString());
				console.log('Cancelled.');
			}
		}
		this._rl.prompt();
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

	_parseReset(line) {
		line = line.toLowerCase();
	    if(line === 'yes' || line === 'y' || line === 'true') {
	    	try {
		    	this._tcpServer.setPort(this.originalPort);
		    	this._tcpServer.setAddress(this.originalAddress);
				this._tcpServer.off(TCPServerEvent.SOCKET_CONNECTED, this._socketConnectionHandler);
		    	this._socketConnectionHandlerName = this.originalHandler;
		    	this._socketConnectionHandler = require(this._socketConnectionHandlerName);
				this._tcpServer.on(TCPServerEvent.SOCKET_CONNECTED, this._socketConnectionHandler);
		    	this._tcpServer.setTimeout(this.originalTimeout);
				this._hasUnsavedChanges = false;
		    	console.log('Reset.');
		    } catch(_exception) {
				if(_exception.code === TCPError.ILLEGAL_STATE.code) {
					console.log('Unable to completely reset, because the TCPServer is running.')
					console.log('Make sure to first stop the TCPServer before attempting another reset.');
				} else {
					console.log('Error: ' + _exception.toString());
				}
		    }
			this._parseStatus();
	    } else {
	    	console.log('Cancelled.');
			this._rl.prompt();
	    }
	}

	async _parseSave(line) {
		let lineLowerCase = line.trim().toLowerCase();
		if(lineLowerCase === 'cancel'  || lineLowerCase === 'exit' ||
		   lineLowerCase === 'quit'    || lineLowerCase === 'stop' || lineLowerCase.length <= 0) {
		   	console.log('Cancelled.');
			this._rl.prompt();
			return;
		}
		let persist = {};
		persist.address = this._tcpServer.getAddress();
		persist.port = this._tcpServer.getPort();
		persist.handler = this._socketConnectionHandlerName;
		persist.timeout = this._tcpServer.getTimeout();
		try {
			let persistAsString = JSON.stringify(persist);
			await fs.promises.writeFile(line, persistAsString, 'utf8');
			console.log('Configuration saved to \'' + line + '\'.');
			this._hasUnsavedChanges = false;
		} catch(_error) {
			if(_error) {
				console.log('Something went wrong during save.');
			}
		}
		this._rl.prompt();
	}

	_parseSetAddress(line) {
		let lineLowerCase = line.toLowerCase();
		if(lineLowerCase === 'cancel'  || lineLowerCase === 'exit' ||
		   lineLowerCase === 'quit'    || lineLowerCase === 'stop') {
		   	console.log('Cancelled.');
			this._rl.prompt();
			return;
		}
		try {
			this._tcpServer.setAddress(line);
			console.log('Address set to ' + this._tcpServer.getAddress());
			this._hasUnsavedChanges = true;
		} catch(_exception) {
				if(_exception.code === TCPError.ILLEGAL_STATE.code) {
					console.log('Unable to update the address, because the TCPServer is running.')
					console.log('Make sure to first stop the TCPServer before updating the address.');
				} else {
					console.log('Error: ' + _exception.toString());
				}
		}
		this._rl.prompt();
	}

	_parseSetHandler(line) {
		let lineLowerCase = line.toLowerCase();
		if(lineLowerCase === 'cancel'  || lineLowerCase === 'exit' ||
		   lineLowerCase === 'quit'    || lineLowerCase === 'stop' || lineLowerCase.length <= 0) {
		   	console.log('Cancelled.');
			this._rl.prompt();
			return;
		}
		if(this._socketConnectionHandler != null) {
			this._tcpServer.removeListener(TCPServerEvent.SOCKET_CONNECTED, this._socketConnectionHandler);
		}
		this._socketConnectionHandlerName = line;
		this._socketConnectionHandler = require(this._socketConnectionHandlerName);
		this._tcpServer.on(TCPServerEvent.SOCKET_CONNECTED, this._socketConnectionHandler);
		this._hasUnsavedChanges = true;
	}

	_parseSetPort(line) {
		let lineLowerCase = line.toLowerCase();
		if(lineLowerCase === 'cancel'  || lineLowerCase === 'exit' ||
		   lineLowerCase === 'quit'    || lineLowerCase === 'stop') {
		   	console.log('Cancelled.');
			this._rl.prompt();
			return;
		}
		try {
			this._tcpServer.setPort(line);
			console.log('Port set to ' + this._tcpServer.getPort());
			this._hasUnsavedChanges = true;
		} catch(_exception) {
			if(_exception.code === TCPError.ILLEGAL_ARGUMENT.code) {
				console.log('The supplied port is not a number. Unable to update the TCP port.')
			} else if(_exception.code === TCPError.ILLEGAL_STATE.code) {
				console.log('Unable to update the port, because the TCPServer is running.')
				console.log('Make sure to first stop the TCPServer before updating the port.');
			} else {
				console.log('Error: ' + _exception.toString());
			}
		}
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
			this._tcpServer.setTimeout(line);
			console.log('Timeout set to ' + this._tcpServer.getTimeout());
			this._hasUnsavedChanges = true;
		} catch(_exception) {
			if(_exception.code === TCPError.ILLEGAL_ARGUMENT.code) {
				console.log('The supplied timeout is not a number. Unable to update the timeout.')
			} else {
				console.log('Error: ' + _exception.toString());
			}
		}
		this._rl.prompt();
	}

	_parseStart() {
		if(this._tcpServer.isRunning()) {
			console.log('The TCPServer is already running.');
			this._rl.prompt();
			return;
		}
		if(this._tcpServer.isStarting()) {
			console.log('The TCPServer is already starting.');
			this._rl.prompt();
			return;
		}
		try {
			this._tcpServer.start();
		} catch(_exception) {
			console.log(_exception);
		}
	}

	_parseStatus() {
		console.log('Address: ' + this._tcpServer.getAddress());
		console.log('Port   : ' + this._tcpServer.getPort());
		console.log('Timeout: ' + this._tcpServer.getTimeout());
		console.log('Handler: ' + this._socketConnectionHandlerName);
		console.log('State  : ' + this._tcpServer.getState());
		console.log('Logging: ' + logging.Level.toString(logging.getLevel()));
		this._rl.prompt();
	}

	_parseStop() {
		if(this._tcpServer.isStopped()) {
			console.log('The TCPServer is already stopped.');
			this._rl.prompt();
			return;
		}
		if(this._tcpServer.isStopping()) {
			console.log('The TCPServer is already stopping.');
			this._rl.prompt();
			return;
		}
		try {
			this._tcpServer.stop();
		} catch(_exception) {
			console.log(_exception);
		}
	}

	static main() {
		try {
			let tcpServerOptions = TCPServerOptions.parseCommandLine();
			logging.setLevel(tcpServerOptions.logLevel);
			if(tcpServerOptions.help) {
				util.Help.print(this);
				return;
			}
			let tcpServer = new TCPServer(tcpServerOptions);
			let tcpServerCLI = new TCPServerCLI(tcpServer);
			tcpServerCLI.start();
		} catch(_exception) {
			console.log('EXCEPTION:'  + _exception);
		}
	}
}
// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
	TCPServerCLI.main();
	return;
}

module.exports = TCPServerCLI;