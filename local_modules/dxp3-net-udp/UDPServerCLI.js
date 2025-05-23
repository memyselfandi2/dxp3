/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-net-udp
 *
 * NAME
 * UDPServerCLI
 */
const packageName = 'dxp3-net-udp';
const moduleName = 'UDPServerCLI';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * @module dxp3-net-udp/UDPServerCLI
 */
const fs = require('fs');
// It's important to log errors and warnings.
const logging = require('dxp3-logging');
const readline = require('readline');
const UDPError = require('./UDPError');
const UDPServer = require('./UDPServer');
const UDPServerEvent = require('./UDPServerEvent');
const UDPServerEventMode = require('./UDPServerEventMode');
const UDPServerOptions = require('./UDPServerOptions');
// We use the util.Help class to print out help information.
const util = require('dxp3-util');
/**
 * A UDPServer command line interface program.
 */
class UDPServerCLI {
    /*********************************************
     * CONSTRUCTOR
     ********************************************/

    /**
	 * @param {module:dxp3-net-udp/UDPServer} _udpServer
     */
	constructor(_udpServer) {
		this._udpServer = _udpServer;
	    this.originalMode =	this._udpServer.getMode();
	    this.originalEventMode =	this._udpServer.getEventMode();
	    this.originalPort = this._udpServer.getPort();
	    this.originalAddress = this._udpServer.getAddress();
	    this.originalIsEncrypted = this._udpServer.isEncrypted();
	    this.originalIgnoreOurselves = this._udpServer.getIgnoreOurselves();
	    this.originalIgnoreParentProcess = this._udpServer.getIgnoreParentProcess();
	    this.originalDestinations = this._udpServer.getDestinations();
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
			prompt: 'DXP3-UDP-SERVER>'
		});
		this._rl.on('close', () => {
			this._parseExit();
		});
		this._udpServer.on(UDPServerEvent.RUNNING, (_address, _port) => {
			console.log('Running at ' + _address + ':' + _port + '...');
			this._rl.prompt();
		});
		this._udpServer.on(UDPServerEvent.STARTING, () => {
			console.log('Starting...');
			this._rl.prompt();
		});
		this._udpServer.on(UDPServerEvent.STOPPED, () => {
			console.log('Stopped.');
			this._rl.prompt();
		});
		this._udpServer.on(UDPServerEvent.STOPPING, () => {
			console.log('Stopping...');
			this._rl.prompt();
		});
		this._udpServer.on(UDPServerEvent.ERROR, (_error) => {
			console.log('Error: ' + _error.toString());
			this._rl.prompt();
		});
		this._udpServer.on(UDPServerEvent.MESSAGE, (_message, _remoteAddressInformation) => {
			console.log('Message: ' + JSON.stringify(_message));
			this._rl.prompt();
		});
		this._udpServer.on(UDPServerEvent.RAW, (_message, _remoteAddressInformation) => {
			console.log('Raw message: ' + _message);
			this._rl.prompt();
		});
		console.clear();
		console.log('');
		console.log('Use this interface to control an UDPServer.');
		console.log('The UDPServer has not yet been started, but it has');
		console.log('been initialized with default values.')
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
			case 'PARSE_ADD_DESTINATIONS':
				this._parseAddDestinations(line);
				this._state = 'PARSE';
				break;
			case 'PARSE_DELETE_DESTINATIONS':
				if(lineLowerCase === 'cancel'  || lineLowerCase === 'exit' ||
				   lineLowerCase === 'quit'    || lineLowerCase === 'stop') {
				   	this.destinations = null;
				   	console.log('Cancelled.');
					this._rl.prompt();						
					this._state = 'PARSE';
				} else {
					this.destinations = line;
					if(this.destinations.length <= 0) {
						console.log('About to delete all destinations. Are you sure (yes/no)?');
					} else {
						console.log('About to delete \'' + this.destinations + '\'. Are you sure (yes/no)?');
					}
					this._state = 'PARSE_DELETE_DESTINATIONS_CONFIRM';
				}
				break;
			case 'PARSE_DELETE_DESTINATIONS_CONFIRM':
				if(line === 'yes' || line === 'y' || line === 'true') {
					this._parseDeleteDestinations(this.destinations);
				} else {
					console.log('Cancelled.');
				}
				this._state = 'PARSE';
				break;''
			case 'PARSE_IGNORE_OURSELVES':
				if(this._parseIgnoreOurselves(line)) {
					console.log('Should we ignore message send by our parent process (yes/no)?');
					this._state = 'PARSE_IGNORE_PARENT_PROCESS';
				} else {
					this._state = 'PARSE';
				}
				break;
			case 'PARSE_IGNORE_PARENT_PROCESS':
				this._parseIgnoreParentProcess(line);
				this._state = 'PARSE';
				break;
			case 'PARSE_LOAD':
				this._parseLoad(line);
				this._state = 'PARSE';
				break;
			case 'PARSE_LOGGING':
				this._parseLogging(line);
				this._state = 'PARSE';
				break;
			case 'PARSE_OFF':
				this._parseOff(line);
				this._state = 'PARSE';
				break;
			case 'PARSE_ON':
				this._parseOn(line);
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
			case 'PARSE_SET_ENCRYPTION':
				this._parseSetEncryption(line);
				this._state = 'PARSE';
				break;
			case 'PARSE_SET_EVENT_MODE':
				this._parseSetEventMode(line);
				this._state = 'PARSE';
				break;
			case 'PARSE_SET_MODE':
				this._parseSetMode(line);
				this._state = 'PARSE';
				break;
			case 'PARSE_SET_PORT':
				this._parseSetPort(line);
				this._state = 'PARSE';
				break;
			case 'PARSE_SEND':
				this._parseSend(line);
				this._state = 'PARSE';
				break;
			default:
				switch(command) {
					case 'add':
						switch(subCommand) {
							case '':
							case 'destination':
							case 'destinations':
								if(subCommandArguments.length > 0) {
									this._parseAddDestinations(subCommandArguments);
								} else if(this._udpServer.isRunning()) {
									console.log('Unable to add destinations, because the UDPServer is running.')
									console.log('Make sure to first stop the UDPSerer before adding destinations.');
								   	console.log('Cancelled.');
								} else {
									console.log('Please specify all the destinations comma separated.');
									console.log('Type cancel, exit, quit or stop to cancel.');
									this._state = 'PARSE_ADD_DESTINATIONS';
								}
								break;
							default:
								console.log('Unknown command.');
								console.log('Type help for a list of available commands.');									
								break;
						}
						break;
					case 'delete':
					case 'remove':
						switch(subCommand) {
							case '':
							case 'destination':
							case 'destinations':
								if(subCommandArguments.length > 0) {
									this.destinations = subCommandArguments;
									console.log('About to delete \'' + this.destinations + '\'. Are you sure (yes/no)?');
									this._state = 'PARSE_DELETE_DESTINATIONS_CONFIRM';
								} else if(this._udpServer.isRunning()) {
									console.log('Unable to delete destinations, because the UDPServer is running.')
									console.log('Make sure to first stop the UDPServer before deleting destinations.');
								   	console.log('Cancelled.');
								} else {
									console.log('Which destinations should be removed?');
									console.log('Type enter/return to delete ALL destinations.')
									console.log('Type cancel, exit, quit or stop to cancel.');
									this._state = 'PARSE_DELETE_DESTINATIONS';
								}
								break;
							default:
								console.log('Unknown command.');
								console.log('Type help for a list of available commands.');									
								break;
						}
						break;
					case 'list':
						switch(subCommand) {
							case '':
							case 'destination':
							case 'destinations':
								this._parseListDestinations();
								break;
							default:
								console.log('Unknown command.');
								console.log('Type help for a list of available commands.');									
								break;
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
					case 'off':
						if(commandArguments.length > 0) {
							this._parseOff(commandArguments);
						} else {
							console.log('What event should we stop listening for?');
							this._state = 'PARSE_OFF';
						}
						break;
					case 'on':
						if(commandArguments.length > 0) {
							this._parseOn(commandArguments);
						} else {
							console.log('What event should we listen for?');
							this._state = 'PARSE_ON';
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
					case 'set':
						switch(subCommand) {
							case 'eventmode':
								if(subCommandArguments.length > 0) {
									this._parseSetEventMode(subCommandArguments);
								} else {
									console.log('What eventmode should be used (event, message, raw)?');
									this._state = 'PARSE_SET_EVENT_MODE';
								}
								break;
							case 'address':
							case 'ipaddress':
							case 'udpaddress':
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
							case 'udpport':
								if(subCommandArguments.length > 0) {
									this._parseSetPort(subCommandArguments);
								} else {
									console.log('Please specify the port.');
									console.log('Type cancel, exit, quit or stop to cancel.');
									this._state = 'PARSE_SET_PORT';
								}
								break;
							case 'encrypt':
							case 'encryption':
							case 'key':
							case 'password':
							case 'security':
								if(subCommandArguments.length > 0) {
									this._parseSetEncryption(subCommandArguments);
								} else {
									console.log('Please specify the encryption key.');
									console.log('Specifying an empty key (by hitting enter/return) will remove any encryption in place.')
									console.log('Type cancel, exit, quit or stop to cancel.');
									this._state = 'PARSE_SET_ENCRYPTION';
								}								
								break;
							case 'mode':
							case 'udpmode':
								if(subCommandArguments.length > 0) {
									this._parseSetMode(subCommandArguments);
								} else {
									console.log('Please specify the mode.');
									console.log('Available modes are: directed, limited, multicast and unicast.');
									console.log('Type cancel, exit, quit or stop to cancel.');
									this._state = 'PARSE_SET_MODE';
								}
								break;
							case 'destination':
							case 'destinations':
								if(subCommandArguments.length > 0) {
									this._parseAddDestinations(subCommandArguments);
								} else {
									console.log('Please specify all the destinations comma separated.');
									console.log('Type cancel, exit, quit or stop to cancel.');
									this._state = 'PARSE_ADD_DESTINATIONS';
								}
								break;
							case 'ignore':
								console.log('Should we ignore message send by ourselves (yes/no)?');
								console.log('Type cancel, exit, quit or stop to cancel.');
								this._state = 'PARSE_IGNORE_OURSELVES';
								break;
							default:
								console.log('Unknown command.');
								console.log('Type help for a list of available commands.');									
								break;
						}
						break;
					case 'destination':
					case 'destinations':
						this._parseListDestinations();
						break;
					case 'start':
					case 'listen':
					case 'run':
						this._parseStart();
						break;
					case 'stop':
						this._parseStop();
						break;
					case 'emit':
					case 'event':
					case 'message':
					case 'msg':
					case 'send':
					case 'write':
						if(commandArguments.length > 0) {
							this._parseSend(commandArguments);
						} else if(!this._udpServer.isRunning()) {
							console.log('The UDPServer is not running. Start the UDPServer first before sending messages.');
						} else {
							console.log('What message would you like to send?');
							this._state = 'PARSE_SEND';
						}
						break;
					case 'port':
					case 'udpport':
						if(commandArguments.length > 0) {
							this._parseSetPort(commandArguments);
						} else {
							console.log('Please specify the port.');
							console.log('Type cancel, exit, quit or stop to cancel.');
							this._state = 'PARSE_SET_PORT';
						}
						break;
					case 'encrypt':
					case 'encryption':
					case 'key':
					case 'password':
					case 'security':
						if(commandArguments.length > 0) {
							this._parseSetEncryption(commandArguments);
						} else {
							console.log('Please specify the encryption key.');
							console.log('Specifying an empty key (by hitting enter/return) will remove any encryption in place.')
							console.log('Type cancel, exit, quit or stop to cancel.');
							this._state = 'PARSE_SET_ENCRYPTION';
						}
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
					case 'clear':
						console.clear();
						break;
					case 'exit':
					case 'quit':
						this._parseExit();
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
					case 'ignore':
						console.log('Should we ignore message send by ourselves (yes/no)?');
						console.log('Type cancel, exit, quit or stop to cancel.');
						this._state = 'PARSE_IGNORE_OURSELVES';
						break;
					case 'mode':
					case 'udpmode':
						if(commandArguments.length > 0) {
							this._parseSetMode(commandArguments);
						} else {
							console.log('Please specify the mode.');
							console.log('Available modes are: directed, limited, multicast and unicast.');
							console.log('Type cancel, exit, quit or stop to cancel.');
							this._state = 'PARSE_SET_MODE';
						}
						break;
					case 'address':
					case 'ipaddress':
					case 'udpaddress':
						if(commandArguments.length > 0) {
							this._parseSetAddress(commandArguments);
						} else {
							console.log('What address should be bind to?');
							console.log('Use 0.0.0.0 to bind to all ip addresses of the host.');
							console.log('Type cancel, exit, quit or stop to cancel.');
							this._state = 'PARSE_SET_ADDRESS';
						}
						break;
					case 'help':
					case 'info':
					case 'information':
					case 'faq':
						this._parseHelp();
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

	async exists(path) {
		try {
			await fs.promises.access(path, fs.constants.F_OK);
			return true;
		} catch(_error) {
			return false;
		}
	}

	_parseListDestinations(line) {
		let destinations = this._udpServer.getDestinations();
		if(destinations.length <= 0) {
			console.log('No destinations defined.');
			this._rl.prompt();
			return;
		}
		console.log('Currently defined destinations:');
		for(let i=0;i < destinations.length;i++) {
			let destination = destinations[i];
			console.log(destination.address + ':' + destination.port);
		}
		this._rl.prompt();
	}

	_parseReset(line) {
		line = line.toLowerCase();
	    if(line === 'yes' || line === 'y' || line === 'true') {
	    	try {
		    	this._udpServer.setIgnoreOurselves(this.originalIgnoreOurselves);
		    	this._udpServer.setIgnoreParentProcess(this.originalIgnoreParentProcess);
		    	this._udpServer.setMode(this.originalMode);
		    	this._udpServer.setEventMode(this.originalEventMode);
		    	this._udpServer.setPort(this.originalPort);
		    	this._udpServer.setAddress(this.originalAddress);
		    	if(this.originalIsEncrypted) {
		    		console.log('The UDPServer was encrypted. As we do not know the key we can not reenable the encryption.')
		    	} else {
			    	this._udpServer.setEncryption(null);
			    }
		    	this._udpServer.deleteDestinations();
		    	this._udpServer.addDestinations(this.originalDestinations);
				this._hasUnsavedChanges = false;
		    	console.log('Reset.');
		    } catch(_exception) {
				if(_exception.code === UDPError.ILLEGAL_STATE.code) {
					console.log('Unable to completely reset, because the UDPServer is running.')
					console.log('Make sure to first stop the UDPServer before attempting another reset.');
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
		persist.address = this._udpServer.getAddress();
		persist.port = this._udpServer.getPort();
		persist.mode = this._udpServer.getMode();
		persist.destinations = [];
		let destinations = this._udpServer.getDestinations();
		for(let i=0;i < destinations.length;i++) {
			let destination = destinations[i];
			persist.destinations.push(destination);
		}
		persist.encryptionAlgorithm = this._udpServer.getEncryptionAlgorithm();
		persist.isEncrypted = this._udpServer.isEncrypted();
		if(this._udpServer.isEncrypted()) {
			console.log('Please note that the encryption key will not be saved.');
			console.log('It will have to be reentered after importing this exported configuration.')
		}
		persist.ignoreOurselves = this._udpServer.getIgnoreOurselves();
		persist.ignoreParentProcess = this._udpServer.getIgnoreParentProcess();
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
		let lineLowerCase = line.trim().toLowerCase();
		if(lineLowerCase === 'cancel'  || lineLowerCase === 'exit' ||
		   lineLowerCase === 'quit'    || lineLowerCase === 'stop' || lineLowerCase === '') {
		   	console.log('Cancelled.');
			this._rl.prompt();
			return;
		}
		try {
			this._udpServer.setAddress(line);
			console.log('Address set to \'' + this._udpServer.getAddress() + '\'.');
			this._hasUnsavedChanges = true;
		} catch(_exception) {
				if(_exception.code === UDPError.ILLEGAL_STATE.code) {
					console.log('Unable to update the address, because the UDPServer is running.')
					console.log('Make sure to first stop the UDPServer before updating the address.');
				   	console.log('Cancelled.');
				} else {
					console.log('Error: ' + _exception.toString());
				}
		}
		this._rl.prompt();
	}

	_parseSetEncryption(line) {
		let lineLowerCase = line.toLowerCase();
		if(lineLowerCase === 'cancel'  || lineLowerCase === 'exit' ||
		   lineLowerCase === 'quit'    || lineLowerCase === 'stop') {
		   	console.log('Cancelled.');
			this._rl.prompt();
			return;
		}
		let isCurrentlyEncrypted = this._udpServer.isEncrypted();
		this._udpServer.setEncryption(line);
		let isEncrypted = this._udpServer.isEncrypted();
		if(isCurrentlyEncrypted) {
			if(isEncrypted) {
				console.log('Encryption key is updated.');
			} else {
				console.log('Encryption is now off.');
			}
		} else {
			if(isEncrypted) {
				console.log('Encryption is now on.');
				console.log('If the eventmode is set to RAW you will see the encrypted message.');
				console.log('To see the decrypted message make sure to set the eventmode to MESSAGE.');
			} else {
				console.log('Encryption remains off.');
			}
		}
		this._hasUnsavedChanges = true;
		this._rl.prompt();
	}

	_parseSetEventMode(line) {
		let lineLowerCase = line.toLowerCase();
		if(lineLowerCase === 'cancel'  || lineLowerCase === 'exit' ||
		   lineLowerCase === 'quit'    || lineLowerCase === 'stop' || lineLowerCase.length <= 0) {
		   	console.log('Cancelled.');
			this._rl.prompt();
			return;
		}
		try {
			this._udpServer.setEventMode(UDPServerEventMode.parse(line));
			console.log('Event mode set to \'' + this._udpServer.getEventMode() + '\'.');
			this._hasUnsavedChanges = true;
		} catch(_exception) {
			if(_exception.code === UDPError.ILLEGAL_ARGUMENT.code) {
				console.log('Unknown eventmode.')
				console.log('Available modes are event, message and raw.');
			   	console.log('Cancelled.');
			} else {
				console.log('Error: ' + _exception.toString());
			}			
		}
		this._rl.prompt();
	}

	_parseSetMode(line) {
		let lineLowerCase = line.toLowerCase();
		if(lineLowerCase === 'cancel'  || lineLowerCase === 'exit' ||
		   lineLowerCase === 'quit'    || lineLowerCase === 'stop' || lineLowerCase === '') {
		   	console.log('Cancelled.');
			this._rl.prompt();
			return;
		}
		try {
			this._udpServer.setMode(line);
			console.log('Mode set to \'' + this._udpServer.getMode() + '\'. You may need to update the destinations, because those get cleared on mode updates.');
			this._hasUnsavedChanges = true;
		} catch(_exception) {
			if(_exception.code === UDPError.ILLEGAL_ARGUMENT.code) {
				console.log('Unknown UDP mode.')
				console.log('Available modes are directed, limited, multicast and unicast.');
			   	console.log('Cancelled.');
			} else if(_exception.code === UDPError.ILLEGAL_STATE.code) {
				console.log('Unable to update the mode, because the UDPServer is running.')
				console.log('Make sure to first stop the UDPServer before updating the mode.');
			   	console.log('Cancelled.');
			} else {
				console.log('Error: ' + _exception.toString());
			}			
		}
		this._rl.prompt();
	}

	_parseSetPort(line) {
		let lineLowerCase = line.toLowerCase();
		if(lineLowerCase === 'cancel'  || lineLowerCase === 'exit' ||
		   lineLowerCase === 'quit'    || lineLowerCase === 'stop' || lineLowerCase === '') {
		   	console.log('Cancelled.');
			this._rl.prompt();
			return;
		}
		try {
			this._udpServer.setPort(line);
			console.log('Port set to \'' + this._udpServer.getPort() + '\'.');
			this._hasUnsavedChanges = true;
		} catch(_exception) {
			if(_exception.code === UDPError.ILLEGAL_ARGUMENT.code) {
				console.log('The supplied port is not a number. Unable to update the UDP port.')
			   	console.log('Cancelled.');
			} else if(_exception.code === UDPError.ILLEGAL_STATE.code) {
				console.log('Unable to update the port, because the UDPServer is running.')
				console.log('Make sure to first stop the UDPServer before updating the port.');
			   	console.log('Cancelled.');
			} else {
				console.log('Error: ' + _exception.toString());
			}
		}
		this._rl.prompt();
	}

	_parseAddDestinations(line) {
		let lineLowerCase = line.trim().toLowerCase();
		if(lineLowerCase === 'cancel'  || lineLowerCase === 'exit' ||
		   lineLowerCase === 'quit'    || lineLowerCase === 'stop' || lineLowerCase.length <= 0) {
		   	console.log('Cancelled.');
			this._rl.prompt();
			return;
		}
		try {
			this._udpServer.addDestinations(line);
			console.log('Destinations added.');
			this._hasUnsavedChanges = true;
		} catch(_exception) {
			if(_exception.code === UDPError.ILLEGAL_STATE.code) {
				console.log('Unable to add destinations, because the UDPServer is running.')
				console.log('Make sure to first stop the UDPServer before adding destinations.');
				   	console.log('Cancelled.');
			} else {
				console.log('Error: ' + _exception.toString());
			}
		}
		this._rl.prompt();
	}

	_parseDeleteDestinations(line) {
		let lineLowerCase = line.trim().toLowerCase();
		if(lineLowerCase === 'cancel'  || lineLowerCase === 'exit' ||
		   lineLowerCase === 'quit'    || lineLowerCase === 'stop') {
		   	console.log('Cancelled.');
			this._rl.prompt();
			return;
		}
		if(line.length <= 0) {
			line = null;
		}
		try {
			this._udpServer.deleteDestinations(line);
			if(line === null) {
				console.log('All destinations deleted.');
			} else {
				console.log('Destinations \'' + line + '\' deleted.');
			}
			this._hasUnsavedChanges = true;
		} catch(_exception) {
			if(_exception.code === UDPError.ILLEGAL_STATE.code) {
				console.log('Unable to delete destinations, because the UDPServer is running.')
				console.log('Make sure to first stop the UDPServer before deleting destinations.');
			   	console.log('Cancelled.');
			} else {
				console.log('Error: ' + _exception.toString());
			}			
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
		console.log('INFORMATION:')
		console.log('A broadcast address is a network address at which all devices connected to');
		console.log('a multiple-access communications network are enabled to receive datagrams.');
		console.log('A message sent to a broadcast address may be received by all network-attached hosts.');
		console.log('In contrast, a multicast address is used to address a specific group of devices and');
		console.log('a unicast address is used to address a single device.');
		console.log('Setting all the bits of an IP address to one, or 255.255.255.255, forms the limited broadcast address.');
		console.log('Sending a UDP datagram to this address delivers the message to any host on the local network segment.');
		console.log('Because routers never forward messages sent to this address, only hosts on the network segment');
		console.log('receive the broadcast message.');
		console.log('Broadcasts can be directed to specific portions of a network by setting all bits of the host identifier.');
		console.log('For example, to send a broadcast to all hosts on the network identified by IP addresses starting');
		console.log('with 192.168.1, use the address 192.168.1.255.');
		console.log('');
		console.log('ACTIONS: core methods that provide our UDPServer capabilities.');
		console.log('');
		console.log('COMMAND -----------------------------+ ALIASES -------------+ DESCRIPTION -----------------------------------+');
		console.log('send                <event> <data>   + emit, event,         + Send a message. The optional data argument     |');
		console.log('                                     | message, msg, write  | must be a string or use JSON notation.         |');
		console.log('                                     |                      | The UDPServer must be running before a message |');
		console.log('                                     |                      | can be send.                                   |');
		console.log('                                     |                      | Example: send greeting {"firstName":"Henk"}    |');
		console.log('-------------------------------------+----------------------+------------------------------------------------+');
		console.log('');
		console.log('CONFIGURATION / PREFERENCES: Commands to control the UDPServer.');
		console.log('');
		console.log('COMMAND -----------------------------+ ALIASES -------------+ DESCRIPTION -----------------------------------+');
		console.log('add destination     <address:port>   + add destinations,    + An UPDServer may send UDP messages to multiple |');
		console.log('                                     | set destination,     | addresses. Add 1 or more destinations.         |');
		console.log('                                     | set destinations     | Each destination needs to be separated by a    |');
		console.log('                                     |                      | comma.                                         |');
		console.log('delete destination  <address:port>   + delete destinations, + Delete 1 or more destinations.                 |');
		console.log('                                     | remove destination,  | Each destination needs to be separated by a    |');
		console.log('                                     | remove destinations  | comma.                                         |');
		console.log('ignore                               +                      + Indicate if the UDPServer should ignore        |');
		console.log('                                     |                      | messages from itself and/or from its parent    |');
		console.log('                                     |                      | process. Typically both of these are true.     |');
		console.log('list destinations                    + destinations         + List all destination.                          |');
		console.log('off                 <event>          +                      + Stop listening for a specific event.           |');
		console.log('on                  <event>          +                      + Listen for specific events. This will          |');
		console.log('                                     |                      | set the eventmode to EVENT.                    |');
		console.log('set address         <ip>             + address,             + Set the UDP address to bind to.                |');
		console.log('                                     | ipaddress,           | By default this is set to 0.0.0.0 to bind      |');
		console.log('                                     | udpaddress           | to all ip addresses of the host.               |');
		console.log('set encryption      <key>            + encrypt, encryption  + Set the encryption key. Turn the encryption    |');
		console.log('                                     | key, password,       | off by specifying an empty key.                |');
		console.log('                                     | security,            |                                                |');
		console.log('set eventmode       <type>           |                      | Three available options:                       |');
		console.log('                                     |                      | - event (listen for and interpret events)      |');
		console.log('                                     |                      |   To be used in combination with the on        |');
		console.log('                                     |                      |   command to listen for specific events.       |');
		console.log('                                     |                      | - message (decodes the message)                |');
		console.log('                                     |                      | - raw (does not decrypt the received message)  |');
		console.log('set mode            <type>           + mode,                + Set the UDP mode. Possible modes are:          |');
		console.log('                                     | udpmode              | directed, limited, multicast and unicast.      |');
		console.log('                                     |                      | Explanation:                                   |');		
		console.log('                                     |                      | - subset of nodes (directed broadcast)         |');
		console.log('                                     |                      | - everyone on a network (limited broadcast)    |');
		console.log('                                     |                      | - nodes subscribed to a group (multicast)      |');
		console.log('                                     |                      | - specific set of nodes (unicast)              |');
		console.log('set port            <number>         + port,                + Set the UDP port to bind to.                   |');
		console.log('                                     | udpport              | The UDPServer must be stopped first before     |');
		console.log('                                     |                      | the port can be updated.                       |');
		console.log('status                               + config,              + Get the current state of the UDPServer.        |');
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
		console.log('PROCESS FLOW: Commands to start and stop the UDPServer.');
		console.log('');
		console.log('COMMAND -----------------------------+ ALIASES -------------+ DESCRIPTION -----------------------------------+');
		console.log('start                                + listen, run          + Start the UDPServer.                           |');
		console.log('stop                                 +                      + Stop the UDPServer.                            |');
		console.log('-------------------------------------+----------------------+------------------------------------------------+');
		console.log('');
		console.log('PROGRAM FLOW: Commands to control this command line interface program.');
		console.log('');
		console.log('COMMAND -----------------------------+ ALIASES -------------+ DESCRIPTION -----------------------------------+');
		console.log('clear                                +                      + Clear the console/screen.                      |')
		console.log('exit                                 + quit                 + Exit this program.                             |');
		console.log('help                                 + faq, info,           + Show this help screen.                         |');
		console.log('                                     | information          |                                                |');
		console.log('loglevel            <level>          + log, logger, logging + Set the log level.                             |');
		console.log('                                     |                      | One of trace, debug, info, warning, error,     |');
		console.log('                                     |                      | fatal or off.                                  |');
		console.log('-------------------------------------+----------------------+------------------------------------------------+');
		console.log('');
	}

	_parseIgnoreOurselves(line) {
		let lineLowerCase = line.toLowerCase();
		if(lineLowerCase === 'cancel'  || lineLowerCase === 'exit' ||
		   lineLowerCase === 'quit'    || lineLowerCase === 'stop' || lineLowerCase === '') {
		   	console.log('Cancelled.');
			this._rl.prompt();
			return false;
		}
		this._udpServer.setIgnoreOurselves(line);
		if(this._udpServer.getIgnoreOurselves()) {
			console.log('The UDPServer will ignore its own messages.');
		} else {
			console.log('The UDPServer will handle its own messages.');
		}
		this._rl.prompt();
		return true;
	}

	_parseIgnoreParentProcess(line) {
		let lineLowerCase = line.toLowerCase();
		if(lineLowerCase === 'cancel'  || lineLowerCase === 'exit' ||
		   lineLowerCase === 'quit'    || lineLowerCase === 'stop' || lineLowerCase === '') {
		   	console.log('Cancelled.');
			this._rl.prompt();
			return;
		}
		this._udpServer.setIgnoreParentProcess(line);
		if(this._udpServer.getIgnoreParentProcess()) {
			console.log('The UDPServer will ignore messages from its parent process.');
		} else {
			console.log('The UDPServer will handle messages from its parent process.');
		}
		this._rl.prompt();
	}

	async _parseLoad(line) {
		let lineLowerCase = line.trim().toLowerCase();
		if(lineLowerCase === 'cancel'  || lineLowerCase === 'exit' ||
		   lineLowerCase === 'quit'    || lineLowerCase === 'stop' || lineLowerCase.length <= 0) {
		   	console.log('Cancelled.');
			this._rl.prompt();
			return;
		}
		if(!this._udpServer.isInitialized() &&
		   !this._udpServer.isStopped()) {
			console.log('Make sure the UDPServer is not running. Cancelled.');
			this._rl.prompt();
			return;
		}
		if(this._hasUnsavedChanges) {
			this._rl.question('DXP3-UDP> There are unsaved changes. Are you sure you want to continue loading?', (answer) => {
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
		this._udpServer.deleteDestinations();
		try {
			let persistAsString = await fs.promises.readFile(line, 'utf8');
			let persist = JSON.parse(persistAsString);
			this._udpServer.setAddress(persist.address);
			this._udpServer.setMode(persist.mode);
			this._udpServer.setPort(persist.port);
			this._udpServer.addDestinations(persist.destinations);
			this._udpServer.setIgnoreOurselves(persist.ignoreOurselves);
			this._udpServer.setIgnoreParentProcess(persist.ignoreParentProcess);
			if(persist.isEncrypted) {
				console.log('Please note that the encryption key was not saved and will have to be reentered.')
				this._udpServer.setEncryptionAlgorithm(persist.encryptionAlgorithm);
			}
			this._udpServer.setEncryption();
			console.log('Loading finished.');
		    this.originalAddress = this._udpServer.getAddress();
		    this.originalMode =	this._udpServer.getMode();
		    this.originalEventMode =	this._udpServer.getEventMode();
		    this.originalPort = this._udpServer.getPort();
		    this.originalIsEncrypted = this._udpServer.isEncrypted();
		    this.originalIgnoreOurselves = this._udpServer.getIgnoreOurselves();
		    this.originalIgnoreParentProcess = this._udpServer.getIgnoreParentProcess();
		    this.originalDestinations = this._udpServer.getDestinations();
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

	_parseOff(line) {
		if(line === undefined || line === null || line.length <= 0) {
			this._rl.prompt();
			return;
		}
		this._udpServer.removeAllListeners([line]);
		console.log('Stopped listening for \'' + line + '\' events.');
		this._rl.prompt();
	}

	_parseOn(line) {
		if(line === undefined || line === null || line.length <= 0) {
			this._rl.prompt();
			return;
		}
		// Just in case the eventmode has not yet been set to listen for events,
		// lets call it explicitly.
		this._udpServer.setEventMode(UDPServerEventMode.EVENT);
		if(this._udpServer.listeners(line).length > 0) {
			console.log('Already listening for \'' + line + '\' events.');
			this._rl.prompt();
			return;
		}
		let	listener = (data) => {
			if(data === undefined || data === null) {
				console.log('Received ' + line);
			} else {
				console.log('Received ' + line + ': ' + JSON.stringify(data));
			}
			this._rl.prompt();
		}
		this._udpServer.on(line, listener);
		console.log('Listening for \'' + line + '\' events.');
		this._rl.prompt();
	}

	_parseSend(line) {
		if(!this._udpServer.isRunning()) {
			console.log('The UDPServer is not running. Start the UDPServer first before sending messages.');
			this._rl.prompt();
			return;
		}
		line = line.trim();
		let indexOfSpace = line.indexOf(' ');
		let event = '';
		let data = null;
		if(indexOfSpace < 0) {
			event = line;
		} else {
			event = line.substring(0, indexOfSpace);
			let eventData = line.substring(indexOfSpace);
			eventData = eventData.trim();
			if(eventData.startsWith('{') && eventData.endsWith('}')) {
				try {
					data = JSON.parse(eventData);
				} catch(_exception) {
					console.log('Error: ' + _exception.toString());
					this._rl.prompt();
					return;
				}
			} else {
				data = {
					"message": eventData
				};
			}
		}
		try {
			this._udpServer.send(event, data);
		} catch(_exception) {
			console.log('Error: ' + _exception.toString());
		}
		this._rl.prompt();
	}

	_parseStart() {
		if(this._udpServer.isRunning()) {
			console.log('The UDPServer is already running.');
			this._rl.prompt();
			return;
		}
		if(this._udpServer.isStarting()) {
			console.log('The UDPServer is already starting.');
			this._rl.prompt();
			return;
		}
		try {
			this._udpServer.start();
		} catch(_exception) {
			console.log(_exception);
		}
	}

	_parseStatus() {
		console.log('ID                     : ' + this._udpServer.getId());
		console.log('Process ID             : ' + this._udpServer.getProcessId());
		console.log('Host name              : ' + this._udpServer.getHostName());
		console.log('Address                : ' + this._udpServer.getAddress());
		console.log('Port                   : ' + this._udpServer.getPort());
		console.log('Event mode             : ' + this._udpServer.getEventMode());
		console.log('Mode                   : ' + this._udpServer.getMode());
		let destinations = this._udpServer.getDestinations();
		for(let i=0;i < destinations.length;i++) {
			let destination = destinations[i];
			if(i===0) {
		console.log('Destinations           : ' + destination.address + ':' + destination.port);
			} else {
		console.log('                       : ' + destination.address + ':' + destination.port);
			}
		}
		console.log('Encryption             : ' +(this._udpServer.isEncrypted()?'on':'off'));
		if(this._udpServer.isEncrypted()) {
		console.log('Encryption algorithm   : ' + this._udpServer.getEncryptionAlgorithm());
		}
		console.log('Ignore own messages    : ' + this._udpServer.getIgnoreOurselves());
		console.log('Ignore parent process  : ' + this._udpServer.getIgnoreParentProcess());
		console.log('State                  : ' + this._udpServer.getState());
		console.log('Logging                : ' + logging.Level.toString(logging.getLevel()));
		this._rl.prompt();
	}

	_parseStop() {
		if(this._udpServer.isStopped()) {
			console.log('The UDPServer is already stopped.');
			this._rl.prompt();
			return;
		}
		if(this._udpServer.isStopping()) {
			console.log('The UDPServer is already stopping.');
			this._rl.prompt();
			return;
		}
		try {
			this._udpServer.stop();
		} catch(_exception) {
			console.log(_exception);
		}
	}

	static main() {
		try {
			let udpServerOptions = UDPServerOptions.parseCommandLine();
			logging.setLevel(udpServerOptions.logLevel);
			if(udpServerOptions.help) {
				util.Help.print(UDPServerCLI);
				return;
			}
			let udpServer = new UDPServer(udpServerOptions);
			let udpServerCLI = new UDPServerCLI(udpServer);
			udpServerCLI.start();
		} catch(_exception) {
			console.log('EXCEPTION:'  + _exception);
		}
	}
}
// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
	UDPServerCLI.main();
	return;
}

module.exports = UDPServerCLI;