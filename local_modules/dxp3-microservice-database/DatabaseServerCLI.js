/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-microservice-database
 *
 * NAME
 * DatabaseServerCLI
 */
const packageName = 'dxp3-microservice-database';
const moduleName = 'DatabaseServerCLI';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * @module dxp3-microservice-database/DatabaseServerCLI
 */
const DatabaseServer = require('./DatabaseServer');
const DatabaseServerOptions = require('./DatabaseServerOptions');
const db = require('dxp3-db');
const logging = require('dxp3-logging');
const readline = require('readline');
const rest = require('dxp3-microservice-rest');
const util = require('dxp3-util');

class DatabaseServerCLI {
    /*********************************************
     * CONSTRUCTOR
     ********************************************/

	constructor(_databaseServerOptions) {
		this._databaseServerOptions = _databaseServerOptions;
		this._sourceFolder = this._databaseServerOptions.sourceFolder;
		if(this._sourceFolder != undefined || this._sourceFolder != null) {
			db.DatabaseAdmin.setSourceFolder(this._sourceFolder);
		}
		this._databaseName = this._databaseServerOptions.databaseName;
		this._produces = this._databaseServerOptions.produces;
		this._rl = null;
		this._serverName = this._databaseServerOptions.name;
		this._state = 'INITIALIZED';
	}

    /*********************************************
     * PUBLIC METHODS
     ********************************************/

	start() {
		this._rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout,
			prompt: 'DXP3-DB-SERVER> '
		});
		this._rl.on('close', () => {
			this._parseExit();
		});
		console.clear();
		console.log('');
		console.log('Use this interface to start and stop a database server.');
		console.log('One should first specify:');
		console.log('- the folder/directory where databases are stored,');
		console.log('- the name of the database,');
		console.log('- the name of this server, and');
		console.log('- what this database \'produces\' (what it stores).');
		console.log('Type help for a list of available commands.');
		this._parse();
	}

	 _parse() {
		this._rl.prompt();
		this._rl.on('line', (line) => {
			this._parseLine(line);
		});
	}

	_parseConfig() {
		if(this._serverName === undefined || this._serverName === null) {
		console.log('Server name        : Not yet defined.');
		} else {
		console.log('Server name        : ' + this._serverName);
		}
		if(this._sourceFolder === undefined || this._sourceFolder === null) {
		console.log('Databases folder   : Not yet defined.');
		} else {
		console.log('Databases folder   : ' + this._sourceFolder);
		}
		if(this._databaseName === undefined || this._databaseName === null) {
		console.log('Database name      : Not yet defined.');
		} else {
		console.log('Database name      : ' + this._databaseName);
		}
		if(this._produces === undefined || this._produces === null) {
		console.log('Database produces  : Not yet defined.');
		} else {
		console.log('Database produces  : ' + this._produces);
		}
		if(this._databaseServer != undefined && this._databaseServer != null) {
		console.log('DatabaseServer is  : ' + this._databaseServer.getState());
		} else {
		console.log('DatabaseServer is  : Not yet started.');
		}
		this._rl.prompt();
	}

	async _parseDatabaseName(line) {
		line = line.trim();
		if(this._databaseName === line) {
			console.log('No change to the database.');
		} else if(line.length <= 0) {
			this._databaseName = null;
			console.log('Database cleared.');
		} else {
			this._databaseName = line;
			console.log('Database set to \'' + this._databaseName + '\'.');
 		}
		if(this._databaseName != undefined && this._databaseName != null) {
			let databaseExists = await db.DatabaseAdmin.exists(this._databaseName);
			if(databaseExists) {
				console.log('Database \'' + this._databaseName + '\' found.');
			} else {
				console.log('Database \'' + this._databaseName + '\' not found.');
			}
		}
		this._rl.prompt();
	}

	_parseProduces(line) {
		line = line.trim();
		if(this._produces === line) {
			console.log('No change to what the database produces.');
		} else if(line.length <= 0) {
			this._produces = null;
			console.log('Database production cleared.');
		} else {
			this._produces = line;
			console.log('Database production set to \'' + this._produces + '\'.');
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
		console.log('CONFIGURATION / PREFERENCES: Commands to control a DatabaseServer.');
		console.log('');
		console.log('COMMAND -----------------------------+ ALIASES -------------+ DESCRIPTION -----------------------------------+');
		console.log('database            <name>           + databasename, db,    + Set the database name.                         |');
		console.log('                                     | dbname               | This database needs to be present in the       |');
		console.log('                                     |                      | databases folder.                              |');
		console.log('folder              <name>           + cd, dir, directory,  + Set the databases folder.                      |');
		console.log('                                     | root, source,        |                                                |');
		console.log('                                     | sourcefolder         |                                                |');
		console.log('name                <name>           + server, servername,  + Set the name of this DatabaseServer.           |');
		console.log('                                     | service, servicename |                                                |');
		console.log('produces            <name>           + production, products + Specify what this DatabaseServer produces.     |');
		console.log('                                     | serves, stores       | This can be generic like storage or specific   |');
		console.log('                                     |                      | like cat-videos-db.                            |');
		console.log('status                               + config,              + Get the current state of the DatabaseServer.   |');
		console.log('                                     | configuration,       |                                                |');
		console.log('                                     | prefs, preferences   |                                                |');
		console.log('                                     | settings, state      |                                                |');
		console.log('-------------------------------------+----------------------+------------------------------------------------+');
		console.log('');
		console.log('PROCESS FLOW: Commands to start and stop the DatabaseServer.');
		console.log('');
		console.log('COMMAND -----------------------------+ ALIASES -------------+ DESCRIPTION -----------------------------------+');
		console.log('start                                +                      + Start the DatabaseServer.                      |');
		console.log('stop                                 +                      + Stop the DatabaseServer.                       |');
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
			case 'PARSE_DATABASE_NAME':
				this._parseDatabaseName(line);
				this._state = 'PARSE';
				break;
			case 'PARSE_PRODUCES':
				this._parseProduces(line);
				this._state = 'PARSE';
				break;
			case 'PARSE_SERVER_NAME':
				this._parseServerName(line);
				this._state = 'PARSE';
				break;
			case 'PARSE_SOURCE_FOLDER':
				this._parseSourceFolder(line);
				this._state = 'PARSE';
				break;
			case 'PARSE_LOGGING':
				this._parseLogging(line);
				this._state = 'PARSE';
				break;
			default:
				switch(command) {
					case 'cd':
					case 'dir':
					case 'directory':
					case 'folder':
					case 'root':
					case 'source':
					case 'sourcefolder':
						if(this._databaseServer != undefined && this._databaseServer != null && (!this._databaseServer.isStopped())) {
							console.log('The DatabaseServer has not (yet been) stopped. Cancelled.');
							break;
						}
						if(commandArguments.length > 0) {
							this._parseSourceFolder(commandArguments);
						} else {
							console.log('Please specify the databases location.');
							this._state = 'PARSE_SOURCE_FOLDER';
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
					case 'database':
					case 'databasename':
					case 'db':
					case 'dbname':
						if(this._databaseServer != undefined && this._databaseServer != null && (!this._databaseServer.isStopped())) {
							console.log('The DatabaseServer has not (yet been) stopped. Cancelled.');
							break;
						}
						if(commandArguments.length > 0) {
							this._parseDatabaseName(commandArguments);
						} else {
							console.log('Please specify the name of the database.');
							this._state = 'PARSE_DATABASE_NAME';
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
					case 'server':
					case 'servername':
					case 'service':
					case 'servicename':
						if(this._databaseServer != undefined && this._databaseServer != null && (!this._databaseServer.isStopped())) {
							console.log('The DatabaseServer has not (yet been) stopped. Cancelled.');
							break;
						}
						if(commandArguments.length > 0) {
							this._parseServerName(commandArguments);
						} else {
							console.log('Please specify the name of this server.');
							this._state = 'PARSE_SERVER_NAME';
						}
						break;
					case 'produces':
					case 'serves':
					case 'stores':
					case 'subject':
					case 'subjects':
					case 'production':
					case 'productions':
					case 'product':
					case 'products':
						if(this._databaseServer != undefined && this._databaseServer != null && (!this._databaseServer.isStopped())) {
							console.log('The DatabaseServer has not (yet been) stopped. Cancelled.');
							break;
						}
						if(commandArguments.length > 0) {
							this._parseProduces(commandArguments);
						} else {
							console.log('Please specify what this database \'produces\'.');
							console.log('What is its function? What does it store and/or serve?');
							this._state = 'PARSE_PRODUCES';
						}
						break;
					case 'set':
						switch(subCommand) {
							case 'database':
							case 'databasename':
							case 'db':
							case 'dbname':
								if(this._databaseServer != undefined && this._databaseServer != null && (!this._databaseServer.isStopped())) {
									console.log('The DatabaseServer has not (yet been) stopped. Cancelled.');
									break;
								}
								if(subCommandArguments.length > 0) {
									this._parseDatabaseName(subCommandArguments);
								} else {
									console.log('Please specify the name of the database.');
									this._state = 'PARSE_DATABASE_NAME';
								}
								break;
							case 'dir':
							case 'directory':
							case 'folder':
							case 'root':
							case 'source':
							case 'sourcefolder':
								if(this._databaseServer != undefined && this._databaseServer != null && (!this._databaseServer.isStopped())) {
									console.log('The DatabaseServer has not (yet been) stopped. Cancelled.');
									break;
								}
								if(subCommandArguments.length > 0) {
									this._parseSourceFolder(subCommandArguments);
								} else {
									console.log('Please specify the databases location.');
									this._state = 'PARSE_SOURCE_FOLDER';
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
							case 'name':
							case 'server':
							case 'servername':
							case 'service':
							case 'servicename':
								if(this._databaseServer != undefined && this._databaseServer != null && (!this._databaseServer.isStopped())) {
									console.log('The DatabaseServer has not (yet been) stopped. Cancelled.');
									break;
								}
								if(subCommandArguments.length > 0) {
									this._parseServerName(subCommandArguments);
								} else {
									console.log('Please specify the name of this server.');
									this._state = 'PARSE_SERVER_NAME';
								}
								break;
							case 'produces':
							case 'serves':
							case 'stores':
							case 'subject':
							case 'subjects':
							case 'production':
							case 'productions':
							case 'product':
							case 'products':
								if(this._databaseServer != undefined && this._databaseServer != null && (!this._databaseServer.isStopped())) {
									console.log('The DatabaseServer has not (yet been) stopped. Cancelled.');
									break;
								}
								if(subCommandArguments.length > 0) {
									this._parseProduces(subCommandArguments);
								} else {
									console.log('Please specify what this database \'produces\'.');
									console.log('What is its function? What does it store and/or serve?');
									this._state = 'PARSE_PRODUCES';
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

	_parseServerName(line) {
		line = line.trim();
		if(this._serverName === line) {
			console.log('No change to the server name.');
		} else if(line.length <= 0) {
			this._serverName = null;
			console.log('Server name cleared.');
		} else {
			this._serverName = line;
			console.log('Server name set to \'' + this._serverName + '\'.');
 		}
		this._rl.prompt();
	}

	async _parseSourceFolder(line) {
		line = line.trim();
		if(this._sourceFolder === line) {
			console.log('No change to the databases folder.');
		} else if(line.length <= 0) {
			await db.DatabaseAdmin.setSourceFolder(null);
			this._sourceFolder = null;
			console.log('Databases folder cleared.');
		} else {
			await db.DatabaseAdmin.setSourceFolder(line);
			this._sourceFolder = db.DatabaseAdmin.getSourceFolder();
			console.log('Databases folder set to \'' + this._sourceFolder + '\'.');
			let dbs = await db.DatabaseAdmin.listFileSystemDatabases();
			if(dbs === undefined || dbs === null || (dbs.length <= 0)) {
				console.log('No databases found.');
			} else {
				if(dbs.length === 1) {
					console.log('There is 1 database:');
				} else {
					console.log('There are ' + dbs.length + ' databases:');
				}
				for(let i=0;i < dbs.length;i++) {
					console.log(dbs[i] + ' (Filesystem)');
				}
			}
 		}
		if(this._databaseName != undefined && this._databaseName != null) {
			let databaseExists = await db.DatabaseAdmin.exists(this._databaseName);
			if(databaseExists) {
				console.log('Database \'' + this._databaseName + '\' found.');
			} else {
				console.log('Database \'' + this._databaseName + '\' not found.');
			}
		}
		this._rl.prompt();
	}

	_parseStart() {
		if(this._databaseServer != undefined && this._databaseServer != null) {
			if(this._databaseServer.isRunning()) {
				console.log('The DatabaseServer is already running. Cancelled.');
				this._rl.prompt();
				return;
			}
			if(!this._databaseServer.isStopped()) {
				console.log('The DatabaseServer has not (yet been) stopped. Cancelled.');
				this._rl.prompt();
				return;
			}
			// Garbage collection...
			this._databaseServer = null;
		}
		try {
			this._databaseServerOptions.name = this._serverName;
			this._databaseServerOptions.sourceFolder = this._sourceFolder;
			this._databaseServerOptions.databaseName = this._databaseName;
			this._databaseServerOptions.produces = this._produces;
			this._databaseServer = new DatabaseServer(this._databaseServerOptions);
			this._databaseServer.on(rest.MicroServiceEvent.ERROR, (_error) => {
				logger.error(_error.message);
			});
			this._databaseServer.on(rest.MicroServiceEvent.RUNNING, () => {
				console.log('DatabaseServer \'' + this._databaseServer.name + '\' running at port \'' + this._databaseServer.port + '\'.');
				this._rl.prompt();
			});
			this._databaseServer.on(rest.MicroServiceEvent.STOPPING, () => {
				console.log('DatabaseServer \'' + this._databaseServer.name + '\' running at port \'' + this._databaseServer.port + '\' is stopping.');
				this._rl.prompt();
			});
			this._databaseServer.on(rest.MicroServiceEvent.STOPPED, () => {
				console.log('DatabaseServer \'' + this._databaseServer.name + '\' running at port \'' + this._databaseServer.port + '\' has stopped.');
				this._rl.prompt();
			});
			this._databaseServer.start();
		} catch(_exception) {
			console.log('Something went wrong: ' + _exception);
		}
		this._rl.prompt();
	}

	_parseStop() {
		if(this._databaseServer === undefined || this._databaseServer === null) {
			console.log('The DatabaseServer is not running. Cancelled.');
		} else if(this._databaseServer.isStopped()) {
			console.log('The DatabaseServer is already stopped. Cancelled.');
		} else {
			this._databaseServer.stop();
		}
		this._rl.prompt();
	}

	static main() {
		try {
			let databaseServerOptions = DatabaseServerOptions.parseCommandLine();
			logging.setLevel(databaseServerOptions.logLevel);
			if(databaseServerOptions.help) {
				util.Help.print(this);
				return;
			}
			let databaseServerCLI = new DatabaseServerCLI(databaseServerOptions);
			databaseServerCLI.start();
		} catch(exception) {
			console.log('EXCEPTION: ' + exception);
		}
	}
}
// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
	DatabaseServerCLI.main();
	return;
}

module.exports = DatabaseServerCLI;