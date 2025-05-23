/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-db
 *
 * NAME
 * DatabaseAdminCLI
 */
const packageName = 'dxp3-db';
const moduleName = 'DatabaseAdminCLI';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * @module dxp3-db/DatabaseAdminCLI
 */
const DatabaseAdmin = require('./DatabaseAdmin');
const DatabaseAdminOptions = require('./DatabaseAdminOptions');
const DatabaseError = require('./DatabaseError');
const logging = require('dxp3-logging');
const readline = require('readline');
const util = require('dxp3-util');

class DatabaseAdminCLI {
    /*********************************************
     * CONSTRUCTOR
     ********************************************/

	constructor() {
		this._database = null;
		this._databaseName = null;
		this._newDatabaseName = null;
		this._sourceFolder = null;
		this._rl = null;
		this._state = 'INITIALIZED';
	}

	start() {
		this._rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout,
			prompt: 'DXP3-DB-ADMIN> '
		});
		this._rl.on('close', () => {
			this._parseExit();
		});
		console.clear();
		console.log('');
		console.log('Use this interface to create, delete, rename and list databases.');
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
		let commandArguments = '';
		let subCommand = '';
		let subCommandArguments = '';
		line = line.trim();
		let parts = line.split(' ');
		command = parts[0].toLowerCase();
		if(parts.length > 1) {
			for(let i=1;i < parts.length;i++) {
				commandArguments += parts[i] + ' ';
			}
			commandArguments = commandArguments.trim();
			subCommand = parts[1].toLowerCase();
			if(parts.length > 2) {
				for(let i=2;i < parts.length;i++) {
					subCommandArguments += parts[i] + ' ';
				}
				subCommandArguments = subCommandArguments.trim();
			}
		}
		switch(this._state) {
			case 'PARSE_CREATE':
				this._parseCreate(line);
				this._state = 'PARSE';
				break;
			case 'PARSE_DELETE':
				if(line.length <= 0) {
					console.log('Cancelled.');
					this._state = 'PARSE';
				} else {
					this._databaseName = line;
					console.log('About to delete database \'' + this._databaseName + '\'. Please type yes or y to confirm.');
					this._state = 'PARSE_DELETE_CONFIRM';
				}
				break;
			case 'PARSE_DELETE_CONFIRM':
				this._parseDeleteConfirm(this._databaseName, line);
				this._state = 'PARSE';
				break;
			case 'PARSE_EXISTS':
				if(line.length <= 0) {
					console.log('Cancelled.');
					this._state = 'PARSE';
				} else {
					this._parseExists(line);
					this._state = 'PARSE';
				}
				break;
			case 'PARSE_LOGGING':
				this._parseLogging(line);
				this._state = 'PARSE';
				break;
			case 'PARSE_RENAME_FROM':
				if(line.length <= 0) {
					console.log('Cancelled.');
					this._state = 'PARSE';
				} else {
					this._databaseName = line;
					console.log('Please provide the new database name (type enter to cancel).');
					this._state = 'PARSE_RENAME_TO';
				}
				break;
			case 'PARSE_RENAME_TO':
				if(line.length <= 0) {
					console.log('Cancelled.');
					this._state = 'PARSE';
				} else {
					this._newDatabaseName = line;
					console.log('About to rename database \'' + this._databaseName + '\' to \'' + this._newDatabaseName + '\'. Please type yes or y to confirm.');
					this._state = 'PARSE_RENAME_CONFIRM';
				}
				break;
			case 'PARSE_RENAME_CONFIRM':
				this._parseRenameConfirm(this._databaseName, this._newDatabaseName, line);
				this._state = 'PARSE';
				break;
			case 'PARSE_SOURCE_FOLDER':
				if(line.length <= 0) {
					this._sourceFolder = line;
					this._parseSourceFolder(this._sourceFolder, false);
					this._state = 'PARSE';
				} else {
					try {
						if(await DatabaseAdmin.sourceFolderExists(line)) {
							this._sourceFolder = line;
							this._parseSourceFolder(this._sourceFolder, false);
							this._state = 'PARSE';
						} else {
							this._sourceFolder = line;
							console.log('That folder does not exist. Do you want to create it? Please type yes or y to confirm.')
							this._state = 'PARSE_SOURCE_FOLDER_EXISTS';
						}
					} catch(_exception) {
						console.log('Something went wrong: ' + _exception);
						this._state = 'PARSE';
					}
				}
				break;
			case 'PARSE_SOURCE_FOLDER_EXISTS':
				line = line.toLowerCase();
				if(line.length <= 0) {
					console.log('Cancelled.');
				} else if(line === 'yes' || line === 'y') {
					this._parseSourceFolder(this._sourceFolder, true);
				} else {
					console.log('Cancelled.');					
				}
				this._state = 'PARSE';
				break;
			case 'PARSE_CONNECT':
				this._parseConnect(line);
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
						if(commandArguments.length > 0) {
							try {
								if(await DatabaseAdmin.sourceFolderExists(commandArguments)) {
									this._sourceFolder = commandArguments;
									this._parseSourceFolder(this._sourceFolder, false);
								} else {
									this._sourceFolder = line;
									console.log('That folder does not exist. Do you want to create it? Please type yes or y to confirm.')
									this._state = 'PARSE_SOURCE_FOLDER_EXISTS';
								}
							} catch(_exception) {
								console.log('Something went wrong: ' + _exception);
							}
						} else {
							console.log('Please specify the databases folder (type enter to clear).');
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
					case 'connect':
					case 'open':
						if(commandArguments.length > 0) {
							this._parseConnect(commandArguments);
						} else {
							let dbs = await DatabaseAdmin.list();
							if(dbs === undefined || dbs === null || (dbs.length <= 0)) {
								console.log('There are currently no databases available.');
							} else {
								await this._parseList();
								console.log('Please provide the name of the database to connect to (type enter to cancel).');
								this._state = 'PARSE_CONNECT';
							}
						}
						break;
					case 'create':
					case 'new':
						if(commandArguments.length > 0) {
							this._parseCreate(commandArguments);
						} else {
							if(DatabaseAdmin.getSourceFolder() === null) {
								console.log('Please note this will create an in-memory database.');
								console.log('If you prefer to create a filesystem backed database instead,');
								console.log('cancel this request by typing enter.')
								console.log('Next use the \'folder\' command to specify a databases folder to');
								console.log('be able to create a filesystem backed database.');
							}
							console.log('Please provide the name of the database to create (type enter to cancel).');
							this._state = 'PARSE_CREATE';
						}
						break;
					case 'del':
					case 'delete':
					case 'destroy':
					case 'drop':
					case 'remove':
					case 'rm':
						this._databaseName = '';
						if(commandArguments.length > 0) {
							if(subCommand === 'database') {
								this._databaseName = subCommandArguments;
							} else {
								this._databaseName = commandArguments;
							}
						}
						if(this._databaseName.length > 0) {
							console.log('About to delete database \'' + this._databaseName + '\'. Please type yes or y to confirm.');
							this._state = 'PARSE_DELETE_CONFIRM';
						} else {
							let dbs = await DatabaseAdmin.list();
							if(dbs === undefined || dbs === null || (dbs.length <= 0)) {
								console.log('There are currently no databases available.');
							} else {
								await this._parseList();
								console.log('Please provide the name of the database to delete (type enter to cancel).');
								this._state = 'PARSE_DELETE';
							}
						}
						break;
					case 'disconnect':
					case 'close':
					case 'logoff':
					case 'logout':
					case 'signoff':
					case 'signout':
						this._parseDisconnect();
						break;
					case 'exists':
					case 'has':
						if(commandArguments.length > 0) {
							this._parseExists(commandArguments);
						} else {
							console.log('Please provide the name of the database (type enter to cancel).');
							this._state = 'PARSE_EXISTS';
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
					case 'list':
					case 'ls':
					case 'dbs':
						await this._parseList();
						break;
					case 'log':
					case 'logger':
					case 'logging':
					case 'loglevel':
						if(commandArguments.length > 0) {
							this._parseLogging(commandArguments);
						} else {
							console.log('Please specify the loglevel (type cancel, exit, quit or stop to cancel).');
							console.log('Allowed values are trace, debug, info, warning, error, fatal or off.');
							this._state = 'PARSE_LOGGING';
						}
						break;
					case 'move':
					case 'mv':
					case 'rename':
						if(commandArguments.length > 0) {
							this._databaseName = parts[1];
							this._newDatabaseName = parts[2];
							if(this._newDatabaseName === undefined || this._newDatabaseName === null) {
								console.log('Please provide the new database name (type enter to cancel).');
								this._state = 'PARSE_RENAME_TO';								
							} else {
								console.log('About to rename database \'' + this._databaseName + '\' to \'' + this._newDatabaseName + '\'. Please type yes or y to confirm.');
								this._state = 'PARSE_RENAME_CONFIRM';
							}
						} else {
							let dbs = await DatabaseAdmin.list();
							if(dbs === undefined || dbs === null || (dbs.length <= 0)) {
								console.log('There are currently no databases available.');
							} else {
								console.log('Please provide the current name of the database (type enter to cancel).');
								this._state = 'PARSE_RENAME_FROM';
							}
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

	async _parseConnect(line) {
		line = line.trim();
		if(line.length <= 0) {
		   	console.log('Cancelled.');
			this._rl.prompt();
			return;
		}
		// Next we disconnect from any currently connected database.
		if(this._database != null) {
			let databaseName = this._database.getName();
			this._database.close();
			console.log('Disconnected from \'' + databaseName + '\'.');
			this._database = null;
		}
		let databaseName = line;
		try {
			this._database = await DatabaseAdmin.connect(databaseName);
			console.log('Connected to \'' + databaseName + '\'.');
		} catch(_exception) {
			console.log('Error when connecting to database: ' + _exception.toString());
		}
		this._rl.prompt();
	}

	async _parseCreate(line) {
		line = line.trim();
		if(line.length <= 0) {
		   	console.log('Cancelled.');
			this._rl.prompt();
			return;
		}
		let databaseName = line;
		try {
			let database = await DatabaseAdmin.create(databaseName);
			if(DatabaseAdmin.getSourceFolder() === null) {
				console.log('Created \'' + databaseName + '\' (In-Memory).');
			} else {
				console.log('Created \'' + databaseName + '\' (Filesystem).');				
			}
		} catch(_exception) {
			console.log('Error when creating the database \'' + databaseName + '\': ' + _exception.toString());
		}
		this._rl.prompt();
	}

	async _parseDeleteConfirm(_databaseName, _confirmation) {
		let confirmation = _confirmation.toLowerCase();
		if(confirmation === 'yes' || confirmation === 'true' || confirmation === 'y') {
			// Lets disconnect if we are connected to the to be deleted database.
			if(this._database != null) {
				let databaseName = this._database.getName();
				if(databaseName === _databaseName) {
					this._database.close();
					console.log('Disconnected from \'' + databaseName + '\'.');
					this._database = null;
				}
			}
			try {
				await DatabaseAdmin.delete(_databaseName);
				console.log('Deleted \'' + _databaseName + '\'.');
			} catch(_exception) {
				console.log('Error when attempting to delete database \'' + _databaseName + '\': ' + _exception.toString());
			}
		} else {
			console.log('Cancelled.');
		}
		this._rl.prompt();
	}

	async _parseDisconnect() {
		if(this._database != null) {
			let databaseName = this._database.getName();
			console.log('Disconnected from \'' + databaseName + '\'.');
			this._database = null;
		} else {
			console.log('Currently not connected to any database.');
		   	console.log('Cancelled.');
		}
		this._rl.prompt();
	}

	async _parseExists(line) {
		let databaseName = line;
		try {
			let result = await DatabaseAdmin.exists(databaseName);
			if(result) {
				console.log(databaseName + ' exists.');
			} else {
				console.log(databaseName + ' does not exist.');
			}
		} catch(_exception) {
			console.log('Error when checking if \'' + databaseName + '\' exists: ' + _exception.toString());
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
		console.clear();
		console.log('');
		console.log('ACTIONS: core methods that provide our DatabaseAdmin capabilities.');
		console.log('');
		console.log('COMMAND -----------------------------+ ALIASES -------------+ DESCRIPTION -----------------------------------+');
		console.log('connect             <name>           + open                 + Connect to a database.                         |');
		console.log('                                     |                      | Use this to test if a connection can be        |');
		console.log('                                     |                      | established. To truly interact with the        |');
		console.log('                                     |                      | database a DatabaseCLI should be used.         |');
		console.log('create              <name>           + new                  + Create a new database. This will create an     |');
		console.log('                                     |                      | in-memory database if no databases folder has  |');
		console.log('                                     |                      | yet been set.                                  |');
		console.log('destroy [database]  <name>           + del, delete, drop,   + Delete a database.                             |');
		console.log('                                     | remove, rm           |                                                |');
		console.log('disconnect                           + close, logoff, logout+ Disconnect from a database.                    |');
		console.log('                                     | signoff,signout      |                                                |');
		console.log('exists              <name>           + has                  + Check for the existence of a database.         |');
		console.log('list                                 + dbs, ls              + List all known databases.                      |');
		console.log('rename              <from> <to>      + move, mv             + Rename a database.                             |');
		console.log('-------------------------------------+----------------------+------------------------------------------------+');
		console.log('');
		console.log('CONFIGURATION / PREFERENCES: Commands to control the DatabaseAdmin.');
		console.log('');
		console.log('COMMAND -----------------------------+ ALIASES -------------+ DESCRIPTION -----------------------------------+');
		console.log('folder              <name>           + cd, dir, directory,  + Set the databases folder.                      |');
		console.log('                                     | root, source,        | If this is not set or if this is empty         |');
		console.log('                                     | sourcefolder         | all the databases will be in-memory.           |');
		console.log('status                               + config,              + Get the current state of the DatabaseAdmin.    |');
		console.log('                                     | configuration,       |                                                |');
		console.log('                                     | prefs, preferences   |                                                |');
		console.log('                                     | settings, state      |                                                |');
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

	async _parseConfig() {
		let sourceFolder = DatabaseAdmin.getSourceFolder();
		if(sourceFolder === undefined || sourceFolder === null) {
		console.log('Implementation     : In-memory')
		} else {
		console.log('Implementation     : Filesystem')
		console.log('Databases folder   : ' + sourceFolder);
		}
		if(this._database === undefined || this._database === null) {
		console.log('Connection status  : Disconnected.');
		} else {
		console.log('Connection status  : Connected to \'' + this._database.getName() + '\'.');
		}
		this._rl.prompt();
	}

	async _parseSourceFolder(line, _createIfNotExists) {
		line = line.trim();
		// When we change the source folder we disconnect from any potential currently connected database.
		if(this._database != null) {
			let databaseName = this._database.getName();
			await this._database.close();
			console.log('Disconnected from \'' + databaseName + '\'.');
			this._database = null;
		}
		if(line.length <= 0) {
			try {
				await DatabaseAdmin.setSourceFolder(null);
				console.log('Databases folder cleared.');
			} catch(_exception) {
				console.log('Something went wrong: ' + _exception.toString());			
			}
		} else {
			try {
				await DatabaseAdmin.setSourceFolder(line, _createIfNotExists);
				console.log('Databases folder set to \'' + DatabaseAdmin.getSourceFolder() + '\'.');
				await this._parseList();
			} catch(_exception) {
				console.log('Something went wrong: ' + _exception.toString());			
			}
		}
		this._rl.prompt();
	}

	async _parseList() {
		let dbs = await DatabaseAdmin.list();
		if(dbs === undefined || dbs === null || (dbs.length <= 0)) {
			console.log('No databases found.');
		} else {
			if(dbs.length === 1) {
				console.log('There is 1 database:');
			} else {
				console.log('There are ' + dbs.length + ' databases:');
			}
			dbs = await DatabaseAdmin.listInMemoryDatabases();
			if(dbs) {
				for(let i=0;i < dbs.length;i++) {
					console.log(dbs[i] + ' (In-Memory)');
				}
			}
			dbs = await DatabaseAdmin.listFileSystemDatabases();
			if(dbs) {
				for(let i=0;i < dbs.length;i++) {
					console.log(dbs[i] + ' (Filesystem)');
				}
			}
		}
		this._rl.prompt();
	}

	_parseLogging(line) {
		let lineLowerCase = line.trim().toLowerCase();
		if(lineLowerCase === 'cancel'  || lineLowerCase === 'exit' ||
		   lineLowerCase === 'quit'    || lineLowerCase === 'stop' || lineLowerCase === '') {
		   	console.log('Cancelled.');
			this._rl.prompt();
			return;
		}
		logging.setLevel(line);
		console.log('Logging set to \'' + logging.Level.toString(logging.getLevel()) + '\'.');
		this._rl.prompt();
	}

	async _parseRenameConfirm(databaseName, newDatabaseName, confirmation) {
		confirmation = confirmation.trim().toLowerCase();
		if(confirmation === 'yes' || confirmation === 'true' || confirmation === 'y') {
			try {
				await DatabaseAdmin.rename(databaseName, newDatabaseName);
				console.log('Renamed \'' + databaseName + '\' to \'' + newDatabaseName + '\'.');
			} catch(_exception) {
				console.log('Error when renaming the database: ' + _exception.toString());
			}
		} else {
			console.log('Cancelled.');
		}
		this._rl.prompt();
	}

	static main() {
		let exec = async function() {
			try {
				let databaseAdminOptions = DatabaseAdminOptions.parseCommandLine();
				logging.setLevel(databaseAdminOptions.logLevel);
				if(databaseAdminOptions.help) {
					util.Help.print(DatabaseAdminCLI);
					return;
				}
				await DatabaseAdmin.setSourceFolder(databaseAdminOptions.sourceFolder);
				let databaseAdminCLI = new DatabaseAdminCLI();
				databaseAdminCLI.start();
			} catch(exception) {
				console.log('EXCEPTION: ' + exception);
			}
		}
		exec();
	}
}
// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
	DatabaseAdminCLI.main();
	return;
}
module.exports = DatabaseAdminCLI;