/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-db
 *
 * NAME
 * DatabaseCLI
 */
const packageName = 'dxp3-db';
const moduleName = 'DatabaseCLI';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * @module dxp3-db/DatabaseCLI
 */
const BooleanColumn = require('./BooleanColumn');
const ColumnType = require('./ColumnType');
const Database = require('./Database');
const DatabaseAdmin = require('./DatabaseAdmin');
const DatabaseCLIOptions = require('./DatabaseCLIOptions');
const DatabaseError = require('./DatabaseError');
const DateColumn = require('./DateColumn');
const DoubleColumn = require('./DoubleColumn');
const FloatColumn = require('./FloatColumn');
const IntegerColumn = require('./IntegerColumn');
const StringColumn = require('./StringColumn');
const fs = require('fs');
const logging = require('dxp3-logging');
const readline = require('readline');
const sql = require('dxp3-lang-sql');
const util = require('dxp3-util');

class DatabaseCLI {
    /*********************************************
     * CONSTRUCTOR
     ********************************************/

	constructor(_args) {
		this._database = null;
		this._rl = null;
		this._state = 'INITIALIZED';
		this.sqlQueryParser = new sql.SQLQueryParser();
		this._sourceFolder = _args._sourceFolder;
		this._entityNames = [];
		this._columns = null;
	}

    /*********************************************
     * PUBLIC METHODS
     ********************************************/

	start() {
		this._rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout,
			prompt: 'DXP3-DB> '
		});
		this._rl.on('close', () => {
			this._parseExit();
		});
		console.clear();
		console.log('');
		console.log('Use this interface to communicate with a database.');
		console.log('To connect to one you will first have to set the folder/directory where databases are stored.');
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
		line = line.trim();
		let parts = line.split(' ');
		command = parts[0].toLowerCase();
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
			case 'PARSE_CREATE':
				if(line.length <= 0) {
					console.log('Cancelled.');
					this._state = 'PARSE';
				} else if(line === 'a table' || line === 'table' || line === '1') {
					console.log('Please provide the name of the table to create (type enter to cancel).');
					this._state = 'PARSE_CREATE_TABLE';
				} else if(line === 'a sequence' || line === 'sequence' || line === '2') {
					console.log('Please provide the name of the sequence to create (type enter to cancel).');
					this._state = 'PARSE_CREATE_SEQUENCE';
				} else if(line === 'an index' || line === 'a index' || line === 'index' || line === '3') {
					console.log('Please provide the name of the index to create (type enter to cancel).');
					this._state = 'PARSE_CREATE_INDEX';
				} else {
					console.log('Unknown type. Is this 1) a table, 2) a sequence, or 3) an index (type enter to cancel)?');
				}
				break;
			case 'PARSE_CREATE_TABLE':
				if(line.length <= 0) {
					console.log('Cancelled.');
					this._state = 'PARSE';
				} else {
					this._columns = [];
					this._entityNames[0] = line;
					console.log('Please provide the name and type of a column. Note that columns are optional. Hit enter/return when done.');
					this._state = 'PARSE_CREATE_TABLE_COLUMNS';
				}
				break;
			case 'PARSE_CREATE_TABLE_COLUMNS':
				if(line.length <= 0) {
					this._parseCreateTable(this._entityNames[0], this._columns);
					this._state = 'PARSE';
				} else {
					try {
						let column = await this._parseCreateColumn(line);
						if(column != null) {
							this._columns.push(column);
						}
					} catch(_exception) {
						console.log('Something went wrong. Did you specify both the name and the type?');
					}
				}
				break;
			case 'PARSE_CREATE_INDEX':
				if(line.length <= 0) {
					console.log('Cancelled.');
					this._state = 'PARSE';
				} else {
					this._entityNames[0] = line;
					console.log('Please provide the name of the table to create the index for (type enter to cancel).');
					this._state = 'PARSE_CREATE_INDEX_TABLE';
				}
				break;
			case 'PARSE_CREATE_INDEX_TABLE':
				if(line.length <= 0) {
					console.log('Cancelled.');
					this._state = 'PARSE';
				} else {
					this._columns = [];
					this._entityNames[1] = line;
					console.log('Please provide the name of the column to create the index for (type enter to cancel).');
					this._state = 'PARSE_CREATE_INDEX_TABLE_COLUMN';
				}
				break;
			case 'PARSE_CREATE_INDEX_TABLE_COLUMN':
				if(line.length <= 0) {
					console.log('Cancelled.');
					this._state = 'PARSE';
				} else {
					this._columns.push(line);
					console.log('Please provide the type of index to create (hash or b+tree).');
					this._state = 'PARSE_CREATE_INDEX_TABLE_COLUMN_TYPE';
				}
				break;
			case 'PARSE_CREATE_INDEX_TABLE_COLUMN_TYPE':
				this._parseCreateIndex(this._entityNames[0], this._entityNames[1], this._columns[0], line);
				this._state = 'PARSE';
				break;
			case 'PARSE_CREATE_SEQUENCE':
				if(line.length <= 0) {
					console.log('Cancelled.');
					this._state = 'PARSE';
				} else {
					this._parseCreateSequence(line);
					this._state = 'PARSE';
				}
				break;
			case 'PARSE_CREATE_TYPE':
				if(line.length <= 0) {
					console.log('Cancelled.');
					this._state = 'PARSE';
				} else if(line === 'a table' || line === 'table' || line === 'tables' || line === '1') {
					this._columns = [];
					console.log('Please provide the name and type of a column. Note this is optional. Hit enter/return when done.');
					this._state = 'PARSE_CREATE_TABLE_COLUMNS';
				} else if(line === 'a sequence' || line === 'sequence' || line === 'sequences' || line === '2') {
					this._parseCreateSequence(this._entityNames[0]);
					this._state = 'PARSE';
				} else if(line === 'a index' || line === 'an index' || line === 'index' || line === 'indices' || line === '3') {
					console.log('Please provide the name of the table to create the index for (type enter to cancel).');
					this._state = 'PARSE_CREATE_INDEX_TABLE';
				} else {
					console.log('Unknown type. Is this 1) a table, 2) a sequence, or 3) an index (type enter to cancel)?');
				}
				break;
			case 'PARSE_DELETE':
				if(line.length <= 0) {
					console.log('Cancelled.');
					this._state = 'PARSE';
				} else if(line === 'a table' || line === 'table' || line === '1') {
					console.log('Please provide the name of the table to delete (type enter to cancel).');
					this._state = 'PARSE_DELETE_TABLE';
				} else if(line === 'a sequence' || line === 'sequence' || line === '2') {
					console.log('Please provide the name of the sequence to delete (type enter to cancel).');
					this._state = 'PARSE_DELETE_SEQUENCE';
				} else if(line === 'a index' || line === 'an index' || line === 'index' || line === '3') {
					console.log('Please provide the name of the index to delete (type enter to cancel).');
					this._state = 'PARSE_DELETE_INDEX';
				} else {
					console.log('Unknown type. Is this 1) a table, 2) a sequence, or 3) an index (type enter to cancel)?');
				}
				break;
			case 'PARSE_DELETE_TABLE':
				if(line.length <= 0) {
					console.log('Cancelled.');
					this._state = 'PARSE';
				} else {
					this._entityNames[0] = line;
					console.log('About to delete table \'' + this._entityNames[0] + '\'. Please type yes or y to confirm.');
					this._state = 'PARSE_DELETE_TABLE_CONFIRM';
				}
				break;
			case 'PARSE_DELETE_TABLE_CONFIRM':
				this._parseDeleteTableConfirm(this._entityNames[0], line);
				this._state = 'PARSE';
				break;
			case 'PARSE_DELETE_SEQUENCE':
				if(line.length <= 0) {
					console.log('Cancelled.');
					this._state = 'PARSE';
				} else {
					this._entityNames[0] = line;
					console.log('About to delete sequence \'' + this._entityNames[0] + '\'. Please type yes or y to confirm.');
					this._state = 'PARSE_DELETE_SEQUENCE_CONFIRM';
				}
				break;
			case 'PARSE_DELETE_SEQUENCE_CONFIRM':
				this._parseDeleteSequenceConfirm(this._entityNames[0], line);
				this._state = 'PARSE';
				break;
			case 'PARSE_DELETE_INDEX':
				if(line.length <= 0) {
					console.log('Cancelled.');
					this._state = 'PARSE';
				} else {
					this._entityNames[0] = line;
					console.log('Please provide the name of the table to delete the index from (type enter to cancel).');
					this._state = 'PARSE_DELETE_INDEX_TABLE';
				}
				break;
			case 'PARSE_DELETE_INDEX_TABLE':
				if(line.length <= 0) {
					console.log('Cancelled.');
					this._state = 'PARSE';
				} else {
					this._entityNames[1] = line;
					console.log('About to delete index \'' + this._entityNames[0] + '\' from table \'' + this._entityNames[1] + '\'. Please type yes or y to confirm.');
					this._state = 'PARSE_DELETE_INDEX_CONFIRM';
				}
				break;
			case 'PARSE_DELETE_INDEX_CONFIRM':
				this._parseDeleteIndexConfirm(this._entityNames[0], this._entityNames[1], line);
				this._state = 'PARSE';
				break;
			case 'PARSE_DELETE_TYPE':
				if(line.length <= 0) {
					console.log('Cancelled.');
					this._state = 'PARSE';
				} else if(line === 'a table' || line === 'table' || line === '1') {
					console.log('About to delete table \'' + this._entityNames[0] + '\'. Please type yes or y to confirm.');
					this._state = 'PARSE_DELETE_TABLE_CONFIRM';
				} else if(line === 'a sequence' || line === 'sequence' || line === '2') {
					console.log('About to delete sequence \'' + this._entityNames[0] + '\'. Please type yes or y to confirm.');
					this._state = 'PARSE_DELETE_SEQUENCE_CONFIRM';
				} else if(line === 'index' || line === 'a index' || line === 'an index' || line === '3') {
					console.log('Please provide the name of the table to delete the index from (type enter to cancel).');
					this._state = 'PARSE_DELETE_INDEX_TABLE';
				} else {
					console.log('Unknown type. Is this 1) a table, 2) a sequence, or 3) an index (type enter to cancel)?');
				}
				break;
			case 'PARSE_RUN':
				this._parseRun(line);
				this._state = 'PARSE';
				break;
			case 'PARSE_LOGGING':
				this._parseLogging(line);
				this._state = 'PARSE';
				break;
			case 'PARSE_LIST_TYPE':
				if(line.length <= 0) {
					console.log('Cancelled.');
					this._state = 'PARSE';
				} else if(line === 'tables' || line === 'table' || line === '1') {
					this._parseListTables();
					this._state = 'PARSE';
				} else if(line === 'sequences' || line === 'sequence' || line === '2' ) {
					this._parseListSequences();
					this._state = 'PARSE';
				} else if(line === 'indices' || line === 'index' || line === '3' ) {
					this._parseListIndices();
					this._state = 'PARSE';
				} else {
					console.log('Unknown type. Should we list 1) tables, 2) sequences, or 3) indices (type enter to cancel)?');
				}
				break;
			case 'PARSE_RENAME_TYPE':
				if(line.length <= 0) {
					console.log('Cancelled.');
					this._state = 'PARSE';
				} else if(line === 'a table' || line === 'table' || line === '1') {
					if(this._entityNames[0] === undefined || this._entityNames[0] === null) {
						console.log('Please provide the name of the table to rename.');
						this._state = 'PARSE_RENAME_TABLE_FROM';
					} else if(this._entityNames[1] === undefined || this._entityNames[1] === null) {
						console.log('Please provide the new table name.');
						this._state = 'PARSE_RENAME_TABLE_TO';
					} else {
						console.log('About to rename table \'' + this._entityNames[0] + '\' to \'' + this._entityNames[1] + '\'. Please type yes or y to confirm.');
						this._state = 'PARSE_RENAME_TABLE_CONFIRM';							
					}
				} else if(line === 'a sequence' || line === 'sequence' || line === '2') {
					if(this._entityNames[0] === undefined || this._entityNames[0] === null) {
						console.log('Please provide the name of the sequence to rename.');
						this._state = 'PARSE_RENAME_SEQUENCE_FROM';
					} else if(this._entityNames[1] === undefined || this._entityNames[1] === null) {
						console.log('Please provide the new sequence name.');
						this._state = 'PARSE_RENAME_SEQUENCE_TO';
					} else {
						console.log('About to rename sequence \'' + this._entityNames[0] + '\' to \'' + this._entityNames[1] + '\'. Please type yes or y to confirm.');
						this._state = 'PARSE_RENAME_SEQUENCE_CONFIRM';							
					}
				} else if(line === 'a index' || line === 'an index' || line === 'index' || line === '3') {
					if(this._entityNames[0] === undefined || this._entityNames[0] === null) {
						console.log('Please provide the name of the index to rename (type enter to cancel).');
						this._state = 'PARSE_RENAME_INDEX_FROM';
					} else if(this._entityNames[1] === undefined || this._entityNames[1] === null) {
						console.log('Please provide the new index name (type enter to cancel).');
						this._state = 'PARSE_RENAME_INDEX_TO';
					} else {
						console.log('Please provide the name of the table containing this index (type enter to cancel).');
						this._state = 'PARSE_RENAME_INDEX_TABLE';							
					}
				} else {
					console.log('Unknown type. Is this 1) a table, 2) a sequence, or 3) an index (type enter to cancel)?');
				}
				break;
			case 'PARSE_RENAME_SEQUENCE_FROM':
				if(line.length <= 0) {
					console.log('Cancelled.');
					this._state = 'PARSE';
				} else {
					this._entityNames[0] = line;
					console.log('Please provide the new sequence name.');
					this._state = 'PARSE_RENAME_SEQUENCE_TO';
				}
				break;
			case 'PARSE_RENAME_SEQUENCE_TO':
				if(line.length <= 0) {
					console.log('Cancelled.');
					this._state = 'PARSE';
				} else {
					this._entityNames[1] = line;
					console.log('About to rename sequence \'' + this._entityNames[0] + '\' to \'' + this._entityNames[1] + '\'. Please type yes or y to confirm.');
					this._state = 'PARSE_RENAME_SEQUENCE_CONFIRM';
				}
				break;
			case 'PARSE_RENAME_SEQUENCE_CONFIRM':
				this._parseRenameSequenceConfirm(this._entityNames[0], this._entityNames[1], line);
				this._state = 'PARSE';
				break;
			case 'PARSE_RENAME_INDEX_FROM':
				if(line.length <= 0) {
					console.log('Cancelled.');
					this._state = 'PARSE';
				} else {
					this._entityNames[0] = line;
					console.log('Please provide the new index name (type enter to cancel).');
					this._state = 'PARSE_RENAME_INDEX_TO';
				}
				break;
			case 'PARSE_RENAME_INDEX_TO':
				if(line.length <= 0) {
					console.log('Cancelled.');
					this._state = 'PARSE';
				} else {
					this._entityNames[1] = line;
					console.log('Please provide the name of the table containing this index (type enter to cancel).');
					this._state = 'PARSE_RENAME_INDEX_TABLE';
				}
				break;
			case 'PARSE_RENAME_INDEX_TABLE':
				if(line.length <= 0) {
					console.log('Cancelled.');
					this._state = 'PARSE';
				} else {
					this._entityNames[2] = line;
					console.log('About to rename index \'' + this._entityNames[0] + '\' to \'' + this._entityNames[1] + '\' for table \'' + this._entityNames[2] + '\'. Please type yes or y to confirm.');
					this._state = 'PARSE_RENAME_INDEX_CONFIRM';
				}
				break;
			case 'PARSE_RENAME_INDEX_CONFIRM':
				this._parseRenameIndexConfirm(this._entityNames[0], this._entityNames[1], this._entityNames[2], line);
				this._state = 'PARSE';
				break;
			case 'PARSE_RENAME_TABLE_FROM':
				if(line.length <= 0) {
					console.log('Cancelled.');
					this._state = 'PARSE';
				} else {
					this._entityNames[0] = line;
					console.log('Please provide the new table name.');
					this._state = 'PARSE_RENAME_TABLE_TO';
				}
				break;
			case 'PARSE_RENAME_TABLE_TO':
				if(line.length <= 0) {
					console.log('Cancelled.');
					this._state = 'PARSE';
				} else {
					this._entityNames[1] = line;
					console.log('About to rename table \'' + this._entityNames[0] + '\' to \'' + this._entityNames[1] + '\'. Please type yes or y to confirm.');
					this._state = 'PARSE_RENAME_TABLE_CONFIRM';
				}
				break;
			case 'PARSE_RENAME_TABLE_CONFIRM':
				this._parseRenameTableConfirm(this._entityNames[0], this._entityNames[1], line);
				this._state = 'PARSE';
				break;
			case 'PARSE_SOURCE_FOLDER':
				this._parseSourceFolder(line);
				this._state = 'PARSE';
				break;
			case 'PARSE_NEXT_VALUE':
				if(line.length <= 0) {
					console.log('Cancelled.');
					this._state = 'PARSE';
				} else {
					this._parseNextValue(line);
					this._state = 'PARSE';
				}
				break;
			default:
				switch(command) {
					// Check for sql commands.
					case 'alter':
					case 'desc':
					case 'drop':
					case 'insert':
					case 'modify':
					case 'select':
					case 'update':
						if(this._database === null) {
							console.log('Not connected to any database.');
						} else {
							this._parseQuery(line);
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
						if(this._sourceFolder === undefined || this._sourceFolder === null) {
							console.log('No database folder has yet been set. Unable to connect.');
						} else if(commandArguments.length > 0) {
							this._parseConnect(commandArguments);
						} else {
							console.log('Please provide the name of the database to connect to.');
							this._state = 'PARSE_CONNECT';
						}
						break;
					case 'create':
					case 'new':
						this._entityNames = [];
						if(this._database === null) {
							console.log('Not connected to any database.');
						} else if(commandArguments.length > 0) {
							if(parts[1] === 'table' || parts[1] === 'tables') {
								if(parts[2] != undefined) {
									this._entityNames[0] = parts[2];
									this._columns = [];
									console.log('Please provide the name and type of a column. Note this is optional. Hit enter/return when done.');
									this._state = 'PARSE_CREATE_TABLE_COLUMNS';
								} else {
									console.log('Please provide the name of the table to create (type enter to cancel).');
									this._state = 'PARSE_CREATE_TABLE';
								}
							} else if(parts[1] === 'sequence' || parts[1] === 'sequences') {
								if(parts[2] != undefined) {
									this._parseCreateSequence(parts[2])
								} else {
									console.log('Please provide the name of the sequence to create (type enter to cancel).');
									this._state = 'PARSE_CREATE_SEQUENCE';
								}
							} else if(parts[1] === 'index' || parts[1] === 'indices') {
								if(parts[2] != undefined) {
									this._entityNames[0] = parts[2];
									console.log('Please provide the name of the table to create the index for (type enter to cancel).');
									this._state = 'PARSE_CREATE_INDEX_TABLE';
								} else {
									console.log('Please provide the name of the index to create (type enter to cancel).');
									this._state = 'PARSE_CREATE_INDEX';
								}
							} else {
								this._entityNames[0] = parts[1];
								console.log('Is this 1) a table, 2) a sequence, or 3) an index (type enter to cancel)?');
								this._state = 'PARSE_CREATE_TYPE';
							}
						} else {
							console.log('Is this 1) a table, 2) a sequence, or 3) an index (type enter to cancel)?');
							this._state = 'PARSE_CREATE';
						}
						break;
					case 'delete':
						if(this._database === null) {
							console.log('Not connected to any database.');
							break;
						} else {
							if(parts[1] === 'from') {
								this._parseQuery(line);
								break;
							}
						}
					case 'del':
					case 'destroy':
					case 'remove':
					case 'rm':
						this._entityNames = [];
						if(this._database === null) {
							console.log('Not connected to any database.');
						} else if(commandArguments.length > 0) {
							if(parts[1].startsWith('table')) {
								if(parts[2] != undefined) {
									this._entityNames[0] = parts[2];
									console.log('About to delete table \'' + this._entityNames[0] + '\'. Please type yes or y to confirm.');
									this._state = 'PARSE_DELETE_TABLE_CONFIRM';
								} else {
									console.log('Please provide the name of the table to delete.');
									this._state = 'PARSE_DELETE_TABLE';
								}
							} else if(parts[1].startsWith('sequence')) {
								if(parts[2] != undefined) {
									this._entityNames[0] = parts[2];
									console.log('About to delete sequence \'' + this._entityNames[0] + '\'. Please type yes or y to confirm.');
									this._state = 'PARSE_DELETE_SEQUENCE_CONFIRM';
								} else {
									console.log('Please provide the name of the sequence to delete.');
									this._state = 'PARSE_DELETE_SEQUENCE';
								}
							} else if(parts[1].startsWith('index')) {
								if(parts[2] != undefined) {
									this._entityNames[0] = parts[2];
									console.log('Please provide the name of the table to delete the index from (type enter to cancel).');
									this._state = 'PARSE_DELETE_INDEX_TABLE';
								} else {
									console.log('Please provide the name of the index to delete (type enter to cancel).');
									this._state = 'PARSE_DELETE_INDEX';
								}
							} else {
								this._entityNames[0] = parts[1];
								console.log('Is this 1) a table, 2) a sequence, or 3) an index (type enter to cancel)?');
								this._state = 'PARSE_DELETE_TYPE';
							}
						} else {
							console.log('Is this 1) a table, 2) a sequence, or 3) an index (type enter to cancel)?');
							this._state = 'PARSE_DELETE';
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
					case 'exit':
					case 'quit':
						this._parseExit();
						break;
					case 'list':
						if(this._database === null) {
							console.log('Not connected to any database.');
						} else if(parts[1] != undefined) {
							if(parts[1] === 'tables' || parts[1] === 'table') {
								this._parseListTables();
							} else if(parts[1] === 'sequences' || parts[1] === 'sequence') {
								this._parseListSequences();
							} else if(parts[1] === 'indices' || parts[1] === 'index') {
								this._parseListIndices();
							} else {
								console.log('Unknown type.');
							}
						} else {
							console.log('Should we list 1) tables, 2) sequences, or 3) indices (type enter to cancel)?');
							this._state = 'PARSE_LIST_TYPE';
						}
						break;
					case 'move':
					case 'mv':
					case 'rename':
						this._entityNames = [];
						if(this._database === null) {
							console.log('Not connected to any database.');
						} else if(commandArguments.length > 0) {
							if(parts[1] === 'table' || parts[1] === 'tables') {
								if(parts[2] != undefined) {
									this._entityNames[0] = parts[2];
									this._entityNames[1] = parts[3];
									if(this._entityNames[1] === undefined || this._entityNames[1] === null) {
										console.log('Please provide the new table name.');
										this._state = 'PARSE_RENAME_TABLE_TO';					
									} else {
										console.log('About to rename table \'' + this._entityNames[0] + '\' to \'' + this._entityNames[1] + '\'. Please type yes or y to confirm.');
										this._state = 'PARSE_RENAME_TABLE_CONFIRM';
									}
								} else {
									console.log('Please provide the name of the table to rename.');
									this._state = 'PARSE_RENAME_TABLE_FROM';
								}
							} else if(parts[1] === 'sequence' || parts[1] === 'sequences') {
								if(parts[2] != undefined) {
									this._entityNames[0] = parts[2];
									this._entityNames[1] = parts[3];
									if(this._entityNames[1] === undefined) {
										console.log('Please provide the new sequence name.');
										this._state = 'PARSE_RENAME_SEQUENCE_TO';					
									} else {
										console.log('About to rename sequence \'' + this._entityNames[0] + '\' to \'' + this._entityNames[1] + '\'. Please type yes or y to confirm.');
										this._state = 'PARSE_RENAME_SEQUENCE_CONFIRM';
									}
								} else {
									console.log('Please provide the name of the sequence to rename.');
									this._state = 'PARSE_RENAME_SEQUENCE_FROM';
								}
							} else if(parts[1] === 'index' || parts[1] === 'indices') {
								if(parts[2] != undefined) {
									this._entityNames[0] = parts[2];
									this._entityNames[1] = parts[3];
									if(this._entityNames[1] === undefined) {
										console.log('Please provide the new index name (type enter to cancel).');
										this._state = 'PARSE_RENAME_INDEX_TO';					
									} else {
										console.log('Please provide the name of the table containing this index (type enter to cancel).');
										this._state = 'PARSE_RENAME_INDEX_TABLE';
									}
								} else {
									console.log('Please provide the name of the index to rename (type enter to cancel).');
									this._state = 'PARSE_RENAME_INDEX_FROM';
								}
							} else {
								this._entityNames[0] = parts[1];
								this._entityNames[1] = parts[2];
								console.log('Is this 1) a table, 2) a sequence, or 3) an index (type enter to cancel)?');
								this._state = 'PARSE_RENAME_TYPE';
							}
						} else {
							console.log('Is this 1) a table, 2) a sequence, or 3) an index (type enter to cancel)?');
							this._state = 'PARSE_RENAME_TYPE';
						}
						break;
					case 'run':
					case 'exec':
					case 'execute':
						if(this._database === null) {
							console.log('Not connected to any database.');
						} else if(commandArguments.length > 0) {
							this._parseRun(commandArguments);
						} else {
							console.log('What is the filepath?');
							console.log('Type cancel, exit, quit or stop to cancel.');
							this._state = 'PARSE_RUN';
						}
						break;
					case 'next':
					case 'nextval':
					case 'nextvalue':
						if(this._database === null) {
							console.log('Not connected to any database.');
						} else if(commandArguments.length > 0) {
							this._parseNextValue(commandArguments);
						} else {
							console.log('Please provide the name of the sequence to get the next value for (type enter to cancel).');
							this._state = 'PARSE_NEXT_VALUE';
						}
						break;
					case 'cd':
					case 'dir':
					case 'directory':
					case 'folder':
					case 'root':
					case 'source':
					case 'sourcefolder':
						if(commandArguments.length > 0) {
							this._parseSourceFolder(commandArguments);
						} else {
							console.log('Please specify the databases location.');
							this._state = 'PARSE_SOURCE_FOLDER';
						}
						break;
					case 'set':
						switch(subCommand) {
							case 'dir':
							case 'directory':
							case 'folder':
							case 'root':
							case 'source':
							case 'sourcefolder':
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
							default:
								console.log('Unknown command.');
								console.log('Type help for a list of available commands.');
								break;
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
					case 'faq':
					case 'help':
					case 'info':
					case 'information':
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

	async _parseConfig() {
		if(this._sourceFolder === undefined || this._sourceFolder === null) {
		console.log('Databases folder   : Not yet defined.');
		} else {
		console.log('Databases folder   : ' + this._sourceFolder);
		}
		if(this._database === undefined || this._database === null) {
		console.log('Connection status  : Disconnected.');
		} else {
		console.log('Connection status  : Connected to \'' + this._database.getName() + '\'.');
		}
		this._rl.prompt();
	}

	async _parseNextValue(line) {
		let lineLowerCase = line.toLowerCase();
		if(lineLowerCase === 'cancel'  || lineLowerCase === 'exit' ||
		   lineLowerCase === 'quit'    || lineLowerCase === 'stop') {
		   	console.log('Cancelled.');
			this._rl.prompt();
			return;
		}
		let sequenceName = line;
		try {
			let result = await this._database.nextValue(sequenceName);
			console.log('Next value: ' + result + '.');
		} catch(_exception) {
			console.log('Error when calling nextValue(): ' + _exception.toString());
		}
		this._rl.prompt();
	}

	async _parseQuery(line) {
		this.sqlQueryParser.parse(line);
		let sqlQuery = null;
		try {
			sqlQuery = await this.sqlQueryParser.nextSQLQuery();
			console.log(sqlQuery.toString());
		} catch(_exception) {
			console.log('Error while parsing the query: ' + _exception);
			this._rl.prompt();
			return;
		}
		try {
			let sqlResult = await this._database.execute(sqlQuery);
			if(typeof sqlResult === 'string') {
				console.log('Result: ' + sqlResult);
			} else if(sqlResult instanceof sql.SQLResultSet) {
				let rows = sqlResult.getRows();
				while(rows.length > 0) {
					console.log(JSON.stringify(rows));
					if(sqlResult.hasMorePages()) {
						await sqlResult.toNextPage();
						rows = sqlResult.getRows();
					} else {
						rows = [];
					}
				};
			console.log('woot');
			} else if(typeof sqlResult === 'object') {
				console.log('Result: ' + JSON.stringify(sqlResult));
			} 
		} catch(_exception) {
			console.log(_exception.toString());
			console.log('Reminder that column, sequence and table names are case sensitive.');
		}
		this._rl.prompt();
	}

	async _parseListTables() {
		if(this._database != null) {
			let result = await this._database.listTables();
			console.log(result);
		} else {
			console.log('Not connected to any database.');
		}
		this._rl.prompt();
	}

	async _parseListIndices() {
		try {
			if(this._database != null) {
				let result = await this._database.listIndices();
				console.log(result);
			} else {
				console.log('Not connected to any database.');
			}
		} catch(_exception) {
			console.log(_exception.toString());
		}
		this._rl.prompt();
	}

	async _parseListSequences() {
		if(this._database != null) {
			let result = await this._database.listSequences();
			console.log(result);
		} else {
			console.log('Not connected to any database.');
		}
		this._rl.prompt();
	}

	async _parseDisconnect() {
		if(this._database != null) {
			let databaseName = this._database.getName();
			this._database.close();
			console.log('Disconnected from \'' + databaseName + '\'.');
			this._database = null;
		} else {
			console.log('Currently not connected to any database.');
		   	console.log('Cancelled.');
		}
		this._rl.prompt();
	}

	async _parseSourceFolder(line) {
		line = line.trim();
		if(this._sourceFolder === line) {
			console.log('No change to the databases folder.');
		} else {
			if(this._database != null) {
				let databaseName = this._database.getName();
				this._database.close();
				console.log('Disconnected from \'' + databaseName + '\'.');
				this._database = null;
			}
			if(line.length <= 0) {
				this._sourceFolder = null;
				console.log('Databases folder cleared.');
			} else {
				await DatabaseAdmin.setSourceFolder(line);
				this._sourceFolder = DatabaseAdmin.getSourceFolder();
				console.log('Databases folder set to \'' + this._sourceFolder + '\'.');
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
			}
		}
		this._rl.prompt();
	}

	async _parseConnect(line) {
		let lineLowerCase = line.toLowerCase();
		if(lineLowerCase === 'cancel'  || lineLowerCase === 'exit' ||
		   lineLowerCase === 'quit'    || lineLowerCase === 'stop') {
		   	console.log('Cancelled.');
			this._rl.prompt();
			return;
		}
		// First we disconnect from any currently connected database.
		if(this._database != null) {
			let databaseName = this._database.getName();
			this._database.close();
			console.log('Disconnected from \'' + databaseName + '\'.');
			this._database = null;
		}
		let databaseName = line;
		let database = null;
		try {
			if(this._sourceFolder === undefined || this._sourceFolder === null) {
				console.log('No database folder has been set. Unable to connect.');
			} else {
				database = new Database(databaseName, this._sourceFolder);
				await database.init();
				console.log('Connected to \'' + databaseName + '\'.');
				this._database = database;
			}
		} catch(_exception) {
			console.log('Error while connecting to database \'' + databaseName + '\': ' + _exception.toString());
		}
		this._rl.prompt();
	}

	async _parseCreateSequence(_sequenceName) {
		_sequenceName = _sequenceName.replaceAll(';','');
		try {
			let result = await this._database.createSequence(_sequenceName);
			console.log('Created sequence \'' + _sequenceName + '\'.');
		} catch(_exception) {
			console.log('Error when creating the sequence: ' + _exception.toString());
		}
		this._rl.prompt();
	}

	async _parseCreateColumn(line) {
		let parts = line.split(' ');
		if(parts.length <= 1) {
			throw sql.SQLError.ILLEGAL_ARGUMENT;
		}
		let columnName = parts[0].trim();
		let columnTypeAsString = parts[1].trim();
		let result = {
			name: columnName,
			dataType: columnTypeAsString
		}
		if(parts.length >= 3) {
			result.length = parseInt(parts[2]);
		}
		return result;
	}

	async _parseCreateTable(_tableName, _columns) {
		_tableName = _tableName.replaceAll(';', '');
		this._state = 'PARSE';
		try {
			let result = await this._database.createTable(_tableName, _columns);
			console.log('Created table \'' + _tableName + '\'.');
		} catch(_exception) {
			console.log('Error when creating the table: ' + _exception.toString());
		}
		this._rl.prompt();
	}

	async _parseCreateIndex(_indexName, _tableName, _columnName, _indexType) {
		this._state = 'PARSE';
		try {
			let result = await this._database.createIndex(_indexName, _tableName, _columnName, _indexType);
			console.log('Created index \'' + _indexName + '\' for \'' + _tableName + '(' + _columnName + ')\'');
		} catch(_exception) {
			console.log('Error when creating the index: ' + _exception.toString());
		}
		this._rl.prompt();
	}

	async _parseDeleteIndexConfirm(_indexName, _tableName, confirmation) {
		confirmation = confirmation.toLowerCase();
		if(confirmation === 'yes' || confirmation === 'true' || confirmation === 'y') {
			try {
				await this._database.deleteIndex(_indexName, _tableName);
				console.log('Deleted \'' + _indexName + '\'.');
			} catch(_exception) {
				console.log('Error when deleting the index: ' + _exception.toString());
			}
		} else {
			console.log('Cancelled.');
		}
		this._rl.prompt();
	}

	async _parseDeleteSequenceConfirm(_sequenceName, confirmation) {
		confirmation = confirmation.toLowerCase();
		if(confirmation === 'yes' || confirmation === 'true' || confirmation === 'y') {
			try {
				await this._database.deleteSequence(_sequenceName);
				console.log('Deleted \'' + _sequenceName + '\'.');
			} catch(_exception) {
				console.log('Error when deleting the sequence: ' + _exception.toString());
			}
		} else {
			console.log('Cancelled.');
		}
		this._rl.prompt();
	}

	async _parseDeleteTableConfirm(_tableName, confirmation) {
		confirmation = confirmation.toLowerCase();
		if(confirmation === 'yes' || confirmation === 'true' || confirmation === 'y') {
			try {
				await this._database.deleteTable(_tableName);
				console.log('Deleted \'' + _tableName + '\'.');
			} catch(_exception) {
				console.log('Error when deleting the table: ' + _exception.toString());
			}
		} else {
			console.log('Cancelled.');
		}
		this._rl.prompt();
	}

	async _parseRenameTableConfirm(entityName, newEntityName, confirmation) {
		confirmation = confirmation.toLowerCase();
		if(confirmation === 'yes' || confirmation === 'true' || confirmation === 'y') {
			try {
				await this._database.renameTable(entityName, newEntityName);
				console.log('Renamed table \'' + entityName + '\' to \'' + newEntityName + '\'.');
			} catch(_exception) {
				console.log('Error while renaming the table: ' + _exception.toString());
			}
		} else {
			console.log('Cancelled.');
		}
		this._rl.prompt();
	}

	async _parseRenameSequenceConfirm(entityName, newEntityName, confirmation) {
		confirmation = confirmation.toLowerCase();
		if(confirmation === 'yes' || confirmation === 'true' || confirmation === 'y') {
			try {
				await this._database.renameSequence(entityName, newEntityName);
				console.log('Renamed sequence \'' + entityName + '\' to \'' + newEntityName + '\'.');
			} catch(_exception) {
				console.log('Error while renaming the sequence: ' + _exception.toString());
			}
		} else {
			console.log('Cancelled.');
		}
		this._rl.prompt();
	}

	async _parseRenameIndexConfirm(entityName, newEntityName, confirmation) {
		confirmation = confirmation.toLowerCase();
		if(confirmation === 'yes' || confirmation === 'true' || confirmation === 'y') {
			try {
				await this._database.renameIndex(entityName, newEntityName);
				console.log('Renamed index \'' + entityName + '\' to \'' + newEntityName + '\'.');
			} catch(_exception) {
				console.log('Error while renaming the index: ' + _exception.toString());
			}
		} else {
			console.log('Cancelled.');
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
		console.log('ACTIONS: core methods that allow us to interact with a database.');
		console.log('');
		console.log('COMMAND -----------------------------+ ALIASES -------------+ DESCRIPTION -----------------------------------+');
		console.log('connect             <name>           + open                 + Connect to a database.                         |');
		console.log('create table        <name>           +                      + Create a new table.                            |');
		console.log('create sequence     <name>           +                      + Create a new sequence.                         |');
		console.log('create index        <name>           +                      + Create a new index.                            |');
		console.log('destroy table       <name>           + delete table         + Delete a table.                                |');
		console.log('destroy sequence    <name>           + delete sequence      + Delete a sequence.                             |');
		console.log('destroy index       <name>           + delete index         + Delete an index.                               |');
		console.log('disconnect                           + close, logoff, logout+ Disconnect from a database.                    |');
		console.log('                                     | signoff,signout      |                                                |');
		console.log('list tables                          +                      + List all tables.                               |');
		console.log('list sequences                       +                      + List all sequences.                            |');
		console.log('list indices                         +                      + List all indices.                              |');
		console.log('rename table        <from> <to>      +                      + Rename a table.                                |');
		console.log('rename sequence     <from> <to>      +                      + Rename a sequence.                             |');
		console.log('rename index        <from> <to>      +                      + Rename an index.                               |');
		console.log('run                 <filepath>       + exec, execute        + Execute a SQL file.                            |');
		console.log('-------------------------------------+----------------------+------------------------------------------------+');
		console.log('');
		console.log('SQL COMMAND -------------------------+ ALIASES -------------+ DESCRIPTION -----------------------------------+');
		console.log('alter                                + modify               + Alter a table.                                 |');
		console.log('delete from                          +                      + Delete data.                                   |');
		console.log('desc                                 +                      + Describe a table or sequence.                  |');
		console.log('insert                               +                      + Insert new data.                               |');
		console.log('select                               +                      + Extract data.                                  |');
		console.log('update                               +                      + Update data.                                   |');
		console.log('next                <sequence>       + nextVal, nextValue   + Get the next value of the specified sequence.  |');
		console.log('------------------------------------------------------------+------------------------------------------------+');
		console.log('');
		console.log('CONFIGURATION / PREFERENCES: Commands to control a database.');
		console.log('');
		console.log('COMMAND -----------------------------+ ALIASES -------------+ DESCRIPTION -----------------------------------+');
		console.log('folder              <name>           + cd, dir, directory,  + Set the databases folder.                      |');
		console.log('                                     | root, source,        |                                                |');
		console.log('                                     | sourcefolder         |                                                |');
		console.log('status                               + config,              + Get the current state of the Database.         |');
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

	async _parseRun(line) {
		let lineLowerCase = line.trim().toLowerCase();
		if(lineLowerCase === 'cancel'  || lineLowerCase === 'exit' ||
		   lineLowerCase === 'quit'    || lineLowerCase === 'stop' || lineLowerCase.length <= 0) {
		   	console.log('Cancelled.');
			this._rl.prompt();
			return;
		}
		this._run(line);
	}

	async _run(line) {
		try {
			let sqlStatements = await fs.promises.readFile(line, 'utf8');
			this.sqlQueryParser.parse(sqlStatements);
			let	sqlQuery = await this.sqlQueryParser.nextSQLQuery();
			while(sqlQuery != null) {
				console.log(sqlQuery.toString());
				try {
					let sqlResult = await this._database.execute(sqlQuery);
					if(typeof sqlResult === 'string') {
						console.log('Result: ' + sqlResult);
					} else if(typeof sqlResult === 'object') {
						console.log('Result: ' + JSON.stringify(sqlResult));
					}
				} catch(_exception) {
					console.log(_exception.toString());
				}
				sqlQuery = await this.sqlQueryParser.nextSQLQuery();
			}
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

	static main() {
		try {
			let databaseCLIOptions = DatabaseCLIOptions.parseCommandLine();
			logging.setLevel(databaseCLIOptions.logLevel);
			if(databaseCLIOptions.help) {
				util.Help.print(this);
				return;
			}
			let databaseCLI = new DatabaseCLI(databaseCLIOptions);
			databaseCLI.start();
		} catch(exception) {
			console.log('EXCEPTION: ' + exception);
		}
	}
}
// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
	DatabaseCLI.main();
	return;
}
module.exports = DatabaseCLI;