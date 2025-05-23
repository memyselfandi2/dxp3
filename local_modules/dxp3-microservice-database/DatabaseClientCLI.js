/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-microservice-database
 *
 * NAME
 * DatabaseClientCLI
 */
const packageName = 'dxp3-microservice-database';
const moduleName = 'DatabaseClientCLI';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * @module dxp3-microservice-database/DatabaseClientCLI
 */
const DatabaseClientOptions = require('./DatabaseClientOptions');
const DatabaseClient = require('./DatabaseClient');
const DatabaseClientEvent = require('./DatabaseClientEvent');
const logging = require('dxp3-logging');
const readline = require('readline');
const util = require('dxp3-util');

class DatabaseClientCLI {

	constructor(_databaseClientOptions) {
		this._databaseClientOptions = _databaseClientOptions;
		this._clientName = this._databaseClientOptions.name;
		this._consumes = this._databaseClientOptions.consumes;
		this._firstConnection = true;
		this._rl = null;
		this._state = 'INITIALIZED';
	}

    /*********************************************
     * PUBLIC METHODS
     ********************************************/

	start() {
		this._rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout,
			prompt: 'DXP3-DB-CLIENT> '
		});
		this._rl.on('close', () => {
			this._parseExit();
		});
		console.clear();
		console.log('');
		console.log('Use this interface to communicate with a database server.');
		console.log('One should first specify:');
		console.log('- the name of this client, and');
		console.log('- what type of database it \'consumes\' (what type of content).');
		console.log('Type help for a list of available commands.');
		this._parse();
	}

	 _parse() {
		this._rl.prompt();
		this._rl.on('line', (line) => {
			this._parseLine(line);
		});
	}

	_parseClientName(line) {
		line = line.trim();
		if(this._clientName === line) {
			console.log('No change to the client name.');
		}
		if(line.length <= 0) {
			this._clientName = null;
			console.log('Client name cleared.');
		} else {
			this._clientName = line;
			console.log('Client name set to \'' + this._clientName + '\'.');
 		}
		this._rl.prompt();
	}

	_parseConfig() {
		if(this._clientName === undefined || this._clientName === null) {
		console.log('Client name        : Not yet defined.');
		} else {
		console.log('Client name        : ' + this._clientName);
		}
		if(this._consumes === undefined || this._consumes === null || this._consumes.length <= 0) {
		console.log('Client consumes    : Not yet defined.');
		} else {
		console.log('Client consumes    : ' + this._consumes);
		}
		if(this._databaseClient != undefined && this._databaseClient != null) {
			if(this._databaseClient.isConnected()) {
		console.log('Client is          : Connected.');
			} else if(this._databaseClient.isQueuing()) {
		console.log('Client is          : Queuing.');
			} else if(this._databaseClient.isClosed()) {
				if(this._databaseClient.isRunning()) {
		console.log('Client is          : Running, but not (yet) connected.');
				} else {
		console.log('Client is          : Closed.');
				}
			} else {
		console.log('Client is          : ' + this._databaseClient.getState() + '.');
			}
		} else {
		console.log('Client is          : Not (yet) started.');			
		}
		this._rl.prompt();
	}

	_parseConsumes(line) {
		line = line.trim();
		if(this._consumes === line) {
			console.log('No change to what the client consumes/type of database it connects to.');
		}
		if(line.length <= 0) {
			this._consumes = null;
			console.log('Client consumption cleared.');
		} else {
			this._consumes = line;
			console.log('Client connects with a database server that produces \'' + this._consumes + '\'.');
 		}
		this._rl.prompt();
	}

	_parseExit() {
		console.log('Goodbye.');
		process.exit();

	}

	_parseHelp() {
		// Clear the scroll buffer.
		process.stdout.write('\u001b[3J\u001b[1J');
		// Clear the window.
		console.clear();
		console.log('');
		console.log('SQL ACTIONS: core methods that allow us to interact with a database.');
		console.log('');
		console.log('SQL COMMAND -------------------------+ ALIASES -------------+ DESCRIPTION -----------------------------------+');
		console.log('delete from                          +                      + Delete data.                                   |');
		console.log('desc                                 +                      + Describe a table or sequence.                  |');
		console.log('insert                               +                      + Insert new data.                               |');
		console.log('select                               +                      + Extract data.                                  |');
		console.log('update                               +                      + Update data.                                   |');
		console.log('next                <sequence>       + nextVal, nextValue   + Get the next value of the specified sequence.  |');
		console.log('------------------------------------------------------------+------------------------------------------------+');
		console.log('');
		console.log('CONFIGURATION / PREFERENCES: Commands to control a DatabaseClient.');
		console.log('');
		console.log('COMMAND -----------------------------+ ALIASES -------------+ DESCRIPTION -----------------------------------+');
		console.log('name                <name>           + client, clientname,  + Set the name of this DatabaseClient.           |');
		console.log('                                     | service, servicename |                                                |');
		console.log('consumes            <name>           + consumption,         + Specify what this DatabaseClient consumes.     |');
		console.log('                                     | database, db         | This can be generic like storage or specific   |');
		console.log('                                     |                      | like cat-videos-db.                            |');
		console.log('status                               + config,              + Get the current state of the DatabaseClient.   |');
		console.log('                                     | configuration,       |                                                |');
		console.log('                                     | prefs, preferences   |                                                |');
		console.log('                                     | settings, state      |                                                |');
		console.log('-------------------------------------+----------------------+------------------------------------------------+');
		console.log('');
		console.log('PROCESS FLOW: Commands to start and stop the DatabaseClient.');
		console.log('');
		console.log('COMMAND -----------------------------+ ALIASES -------------+ DESCRIPTION -----------------------------------+');
		console.log('start                                +                      + Start the DatabaseClient.                      |');
		console.log('stop                                 +                      + Stop the DatabaseClient.                       |');
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

	_parseLine(line) {
		line = line.trim();
		let parts = line.split(' ');
		let command = parts[0].toLowerCase();
		let commandArguments = '';
		let subCommand = '';
		let subCommandArguments = '';
		if(parts.length > 1) {
			for(let i=1;i < parts.length;i++) {
				commandArguments += parts[i] + ' ';
			}
			commandArguments = commandArguments.trim();
			subCommand = parts[1];
			if(parts.length > 2) {
				for(let i=2;i < parts.length;i++) {
					subCommandArguments += parts[i] + ' ';
				}
				subCommandArguments = subCommandArguments.trim();
			}
		}
		switch(this._state) {
			case 'PARSE_CONSUMES':
				this._parseConsumes(line);
				this._state = 'PARSE';
				break;
			case 'PARSE_CLIENT_NAME':
				this._parseClientName(line);
				this._state = 'PARSE';
				break;
			case 'PARSE_LOGGING':
				this._parseLogging(line);
				this._state = 'PARSE';
				break;
			case 'PARSE_NEXT_VALUE':
				this._parseNextValue(line);
				this._state = 'PARSE';
				break;
			case 'PARSE_QUERY':
				this._parseQuery(line);
				this._state = 'PARSE';
				break;
			default:
				switch(command) {
					case 'actions':
					case 'functions':
					case 'commands':
					case 'methods':
						if(this._databaseClient === undefined || this._databaseClient === null) {
							console.log('Not (yet) started. Cancelled.');
						} else if(!this._databaseClient.isConnected()) {
							console.log('Awaiting connection to \'' + this._databaseClient.consumes + '\'...');
						} else {
							for(let [methodName, method] of this._databaseClient.methods) {
								console.log('Available command: ' + method.toString());
							}
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
					case 'state':
					case 'status':
						this._parseConfig();
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
					case 'name':
					case 'client':
					case 'clientname':
					case 'service':
					case 'servicename':
						if(this._databaseClient != undefined && this._databaseClient != null && (!this._databaseClient.isStopped())) {
							console.log('The client has not (yet been) stopped. Cancelled.');
							break;
						}
						if(commandArguments.length > 0) {
							this._parseClientName(commandArguments);
						} else {
							console.log('Please specify the name of this client.');
							this._state = 'PARSE_CLIENT_NAME';
						}
						break;
					case 'consumes':
					case 'consumption':
					case 'connect':
					case 'connects':
					case 'connectto':
					case 'connectwith':
					case 'database':
					case 'db':
					case 'subject':
					case 'subjects':
						if(this._databaseClient != undefined && this._databaseClient != null && (!this._databaseClient.isStopped())) {
							console.log('The client has not (yet been) stopped. Cancelled.');
							break;
						}
						if(commandArguments.length > 0) {
							this._parseConsumes(commandArguments);
						} else {
							console.log('Please specify what this client \'consumes\'.');
							console.log('What type of database does it connect with?');
							this._state = 'PARSE_CONSUMES';
						}
						break;
					case 'set':
						switch(subCommand) {
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
							case 'name':
							case 'client':
							case 'clientname':
							case 'service':
							case 'servicename':
								if(this._databaseClient != undefined && this._databaseClient != null && (!this._databaseClient.isStopped())) {
									console.log('The client has not (yet been) stopped. Cancelled.');
									break;
								}
								if(subCommandArguments.length > 0) {
									this._parseClientName(subCommandArguments);
								} else {
									console.log('Please specify the name of this client.');
									this._state = 'PARSE_CLIENT_NAME';
								}
								break;
							case 'consumes':
							case 'consumption':
							case 'connect':
							case 'connects':
							case 'connectto':
							case 'connectwith':
							case 'database':
							case 'db':
							case 'subject':
							case 'subjects':
								if(this._databaseClient != undefined && this._databaseClient != null && (!this._databaseClient.isStopped())) {
									console.log('The client has not (yet been) stopped. Cancelled.');
									break;
								}
								if(subCommandArguments.length > 0) {
									this._parseConsumes(subCommandArguments);
								} else {
									console.log('Please specify what this client \'consumes\'.');
									console.log('What type of database does it connect with?');
									this._state = 'PARSE_CONSUMES';
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
					case 'next':
					case 'nextval':
					case 'nextvalue':
						if(commandArguments.length > 0) {
							this._parseNextValue(commandArguments);
						} else {
							console.log('Please provide the name of the sequence to get the next value for.');
							this._state = 'PARSE_NEXT_VALUE';
						}
						break;
					case 'desc':
					case 'insert':
					case 'select':
					case 'delete':
					case 'update':
						this._parseQuery(line);
						break;
					case '':
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

	_parseStart() {
		if(this._databaseClient != undefined && this._databaseClient != null) {
			if(this._databaseClient.isRunning()) {
				console.log('The client is already running. Cancelled.');
				this._rl.prompt();
				return;
			}
			if(!this._databaseClient.isStopped()) {
				console.log('The client has not (yet been) stopped. Cancelled.');
				this._rl.prompt();
				return;
			}
			// Garbage collection...
			this._databaseClient = null;
		}
		try {
			this._firstConnection = true;
			this._databaseClientOptions.name = this._clientName;
			this._databaseClientOptions.consumes = this._consumes;
			this._databaseClient = new DatabaseClient(this._databaseClientOptions);
			this._databaseClient.on(DatabaseClientEvent.CONNECTED, () => {
				if(this._firstConnection) {
					console.log('Connected.');
					for(let [methodName, method] of this._databaseClient.methods) {
						console.log('Available command: ' + method.toString());
					}
					this._firstConnection = false;
					this._rl.prompt();
				}
			});
			this._databaseClient.on(DatabaseClientEvent.CLOSED, (_error) => {
				// We do not write to the console, because when the client is not used
				// it goes in a timeout, close, connect cycle.
				// That clutters the UI for no good reason.
			});
			this._databaseClient.on(DatabaseClientEvent.STOPPED, (_error) => {
				console.log('Stopped...');
				this._rl.prompt();
			});
			this._databaseClient.on(DatabaseClientEvent.STOPPING, (_error) => {
				console.log('Stopping...');
				this._rl.prompt();
			});
			this._databaseClient.on(DatabaseClientEvent.STARTING, (_error) => {
				console.log('Starting...');
				this._rl.prompt();
			});
			this._databaseClient.on(DatabaseClientEvent.RUNNING, (_error) => {
				console.log('Running...');
				this._rl.prompt();
			});
			this._databaseClient.start();
		} catch(_exception) {
			console.log('Something went wrong: ' + _exception);
		}
		this._rl.prompt();
	}

	_parseStop() {
		if(this._databaseClient === undefined || this._databaseClient === null) {
			console.log('The client is not running. Cancelled.');
		} else if(this._databaseClient.isStopped()) {
			console.log('The client has already stopped. Cancelled.');
		} else {
			this._databaseClient.stop();
		}
		this._rl.prompt();
	}

	_parseNextValue(line) {
		let lineLowerCase = line.toLowerCase();
		if(lineLowerCase === 'cancel'  || lineLowerCase === 'exit' ||
		   lineLowerCase === 'quit'    || lineLowerCase === 'stop') {
		   	console.log('Cancelled.');
			this._rl.prompt();
			return;
		}
		let self = this;
		let sequenceName = line;
		if(this._databaseClient === undefined || this._databaseClient === null) {
			console.log('Not (yet) started. Cancelled.');
			this._rl.prompt();
			return;
		}
		this._databaseClient.nextValue(sequenceName, (_error, _result) => {
			if(_error) {
				console.log('error: ' + _error);
			} else {
				console.log('Result: ' + JSON.stringify(_result));
			}
			this._rl.prompt();
		});
	}

	_parseQuery(line) {
		let self = this;
		if(this._databaseClient === undefined || this._databaseClient === null) {
			console.log('Not (yet) started. Cancelled.');
			this._rl.prompt();
			return;
		}
		this._databaseClient.query(line, (_error, _result) => {
			if(_error) {
				console.log('error: ' + _error);
			} else {
				console.log('Result: ' + JSON.stringify(_result));
			}
			this._rl.prompt();
		});
	}

	static main() {
		try {
			let databaseClientOptions = DatabaseClientOptions.parseCommandLine();
			logging.setLevel(databaseClientOptions.logLevel);
			if(databaseClientOptions.help) {
				util.Help.print(this);
				return;
			}
			let databaseClientCLI = new DatabaseClientCLI(databaseClientOptions);
			databaseClientCLI.start();
		} catch(exception) {
			console.log('EXCEPTION:'  + exception);
		}
	}
}
// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
	DatabaseClientCLI.main();
	return;
}

module.exports = DatabaseClientCLI;