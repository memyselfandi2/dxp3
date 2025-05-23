/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-net-json
 *
 * NAME
 * JSONServerCLI
 */
const packageName = 'dxp3-net-json';
const moduleName = 'JSONServerCLI';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * @module dxp3-net-tcp/JSONServerCLI
 */
const fs = require('fs');
// It's important to log errors and warnings.
const logging = require('dxp3-logging');
const readline = require('readline');
const JSONError = require('./JSONError');
const JSONServer = require('./JSONServer');
const JSONServerEvent = require('./JSONServerEvent');
const JSONServerOptions = require('./JSONServerOptions');
const util = require('dxp3-util');
/**
 * A JSONServer command line interface program.
 */
class JSONServerCLI {
    /*********************************************
     * CONSTRUCTOR
     ********************************************/

    /**
	 * @param {module:dxp3-net-tcp/JSONServer} _jsonServer
     */
	constructor(_jsonServer) {
		this._jsonServer = _jsonServer;
	    this._originalAddress = this._jsonServer.getAddress();
	    this._originalPort = this._jsonServer.getPort();
	    this._originalTimeout = this._jsonServer.getTimeout();
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
			prompt: 'DXP3-JSON-SERVER>'
		});
		this._rl.on('close', () => {
			this._parseExit();
		});
		this._jsonServer.on(JSONServerEvent.RUNNING, (_address, _port) => {
			console.log('JSONServer running at ' + _address + ':' + _port);
			this._rl.prompt();
		});
		this._jsonServer.on(JSONServerEvent.STARTING, () => {
			console.log('JSONServer starting...');
			this._rl.prompt();
		});
		this._jsonServer.on(JSONServerEvent.STOPPED, () => {
			console.log('JSONServer stopped.');
			this._rl.prompt();
		});
		this._jsonServer.on(JSONServerEvent.STOPPING, () => {
			console.log('JSONServer stopping...');
			this._rl.prompt();
		});
		this._jsonServer.on(JSONServerEvent.ERROR, (_error) => {
			console.log('JSONServer error: ' + _error.toString());
			this._rl.prompt();
		});
		this._jsonServer.on(JSONServerEvent.REQUEST, (jsonRequest, jsonResponse) => {
			console.log('JSON request: ' + JSON.stringify(jsonRequest));
			jsonResponse.reply(null, 'received');
			this._rl.prompt();
		});
		console.clear();
		console.log('');
		console.log('Use this interface to control a JSONServer.');
		console.log('The JSONServer has not yet been started, but it has been');
		console.log('initialized with default values.');
		console.log('Type help for a list of available commands.');
		this._parse();
	}

    /*********************************************
     * PRIVATE METHODS
     ********************************************/

	async _exists(path) {
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
				if(await this._exists(line)) {
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
							console.log('What address should the JSONServer bind to?');
							console.log('Specifying an empty address (by hitting enter/return) will set.');
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
					case 'help':
					case 'info':
					case 'information':
					case 'faq':
						this._parseHelp();
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
							if(await this._exists(commandArguments)) {
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
		console.log('CONFIGURATION / PREFERENCES: Commands to control the JSONServer.');
		console.log('');
		console.log('COMMAND -----------------------------+ ALIASES -------------+ DESCRIPTION -----------------------------------+');
		console.log('set address         <ip>             + address,             + Set the TCP address to bind to.                |');
		console.log('                                     | ipaddress,           | By default this is set to 0.0.0.0, which binds |');
		console.log('                                     | tcpaddress           | the server to all ip addresses of the host.    |');
		console.log('set port            <number>         + port,                + Set the TCP port to bind to.                   |');
		console.log('                                     | tcpport              | The JSONServer must be stopped first before    |');
		console.log('                                     |                      | the port can be updated.                       |');
		console.log('set timeout         <number>         + timeout              + Set the connection timeout.                    |');
		console.log('status                               + config,              + Get the current state of the JSONServer.      |');
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
		console.log('PROCESS FLOW: Commands to start and stop the JSONServer.');
		console.log('');
		console.log('COMMAND -----------------------------+ ALIASES -------------+ DESCRIPTION -----------------------------------+');
		console.log('start                                +                      + Start the JSONServer.                          |');
		console.log('stop                                 +                      + Stop the JSONServer.                           |');
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
		if(!this._jsonServer.isInitialized() &&
		   !this._jsonServer.isStopped()) {
			console.log('Make sure the JSONServer is not running. Cancelled.');
			this._rl.prompt();
			return;
		}
		if(this._hasUnsavedChanges) {
			this._rl.question('DXP3-JSON> There are unsaved changes. Are you sure you want to continue loading?', (answer) => {
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
			this._jsonServer.setAddress(persist.address);
			this._jsonServer.setPort(persist.port);
			console.log('Loading finished.');
		    this._originalAddress = this._jsonServer.getAddress();
		    this._originalPort = this._jsonServer.getPort();
		    this._originalTimeout = this._jsonServer.getTimeout();
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
		    	this._jsonServer.setTimeout(this._originalTimeout);
		    	this._jsonServer.setAddress(this._originalAddress);
		    	this._jsonServer.setPort(this._originalPort);
				this._hasUnsavedChanges = false;
		    	console.log('Reset.');
		    } catch(_exception) {
				if(_exception.code === JSONError.ILLEGAL_STATE.code) {
					console.log('Unable to completely reset, because the JSONServer is running.')
					console.log('Make sure to first stop the JSONServer before attempting another reset.');
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
		persist.address = this._jsonServer.getAddress();
		persist.port = this._jsonServer.getPort();
		persist.timeout = this._jsonServer.getTimeout();
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
			this._jsonServer.setAddress(line);
			this._hasUnsavedChanges = true;
			console.log('Address set to ' + this._jsonServer.getAddress());
		} catch(_exception) {
				if(_exception.code === JSONError.ILLEGAL_STATE.code) {
					console.log('Unable to update the address, because the JSONServer is running.')
					console.log('Make sure to first stop the JSONServer before updating the address.');
				} else {
					console.log('Error: ' + _exception.toString());
				}
		}
		this._rl.prompt();
	}

	_parseSetPort(line) {
		let lineLowerCase = line.toLowerCase();
		if(lineLowerCase === 'cancel'  || lineLowerCase === 'exit' ||
		   lineLowerCase === 'quit'    || lineLowerCase === 'stop' || (lineLowerCase.length <= 0)) {
		   	console.log('Cancelled.');
			this._rl.prompt();
			return;
		}
		try {
			this._jsonServer.setPort(line);
			this._hasUnsavedChanges = true;
			console.log('Port set to ' + this._jsonServer.getPort());
		} catch(_exception) {
			if(_exception.code === JSONError.ILLEGAL_ARGUMENT.code) {
				console.log('The supplied port is not a number. Unable to update the JSON port.')
			} else if(_exception.code === JSONError.ILLEGAL_STATE.code) {
				console.log('Unable to update the port, because the JSONServer is running.')
				console.log('Make sure to first stop the JSONServer before updating the port.');
			} else {
				console.log('Error: ' + _exception.toString());
			}
		}
		this._rl.prompt();
	}

	_parseStart() {
		if(this._jsonServer.isRunning()) {
			console.log('The JSONServer is already running.');
			this._rl.prompt();
			return;
		}
		if(this._jsonServer.isStarting()) {
			console.log('The JSONServer is already starting.');
			this._rl.prompt();
			return;
		}
		try {
			this._jsonServer.start();
		} catch(_exception) {
			console.log(_exception);
		}
	}

	_parseStatus() {
		console.log('Address: ' + this._jsonServer.getAddress());
		console.log('Port   : ' + this._jsonServer.getPort());
		console.log('Timeout: ' + this._jsonServer.getTimeout());
		console.log('State  : ' + this._jsonServer.getState());
		console.log('Logging: ' + logging.Level.toString(logging.getLevel()));
		this._rl.prompt();
	}

	_parseStop() {
		if(this._jsonServer.isStopped()) {
			console.log('The JSONServer is already stopped.');
			this._rl.prompt();
			return;
		}
		if(this._jsonServer.isStopping()) {
			console.log('The JSONServer is already stopping.');
			this._rl.prompt();
			return;
		}
		try {
			this._jsonServer.stop();
		} catch(_exception) {
			console.log(_exception);
		}
	}

	_parseSetTimeout(line) {
		let lineLowerCase = line.toLowerCase();
		if(lineLowerCase === 'cancel'  || lineLowerCase === 'exit' ||
		   lineLowerCase === 'quit'    || lineLowerCase === 'stop' || (lineLowerCase.length <= 0)) {
		   	console.log('Cancelled.');
			this._rl.prompt();
			return;
		}
		try {
			this._jsonServer.setTimeout(line);
			this._hasUnsavedChanges = true;
			console.log('Timeout set to ' + this._jsonServer.getTimeout());
		} catch(_exception) {
			if(_exception.code === JSONError.ILLEGAL_ARGUMENT.code) {
				console.log('The supplied timeout is not a number. Unable to update the timeout.')
			} else {
				console.log('Error: ' + _exception.toString());
			}
		}
		this._rl.prompt();
	}

	static main() {
		try {
			let jsonServerOptions = JSONServerOptions.parseCommandLine();
			logging.setLevel(jsonServerOptions.logLevel);
			if(jsonServerOptions.help) {
				util.Help.print(this);
				return;
			}
			let jsonServer = new JSONServer(jsonServerOptions);
			let jsonServerCLI = new JSONServerCLI(jsonServer);
			jsonServerCLI.start();
		} catch(_exception) {
			console.log('EXCEPTION:'  + _exception);
		}
	}
}
// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
	JSONServerCLI.main();
	return;
}

module.exports = JSONServerCLI;