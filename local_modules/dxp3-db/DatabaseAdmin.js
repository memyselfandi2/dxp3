/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-db
 *
 * NAME
 * DatabaseAdmin
 */
const packageName = 'dxp3-db';
const moduleName = 'DatabaseAdmin';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * The main purpose of the DatabaseAdmin class is to create, rename, delete and 
 * retrieve a list of available databases. It maintains a collection of in-memory and
 * file system backed databases. Each database must have an unique name.
 *
 * @module dxp3-db/DatabaseAdmin
 */
const Database = require('./Database');
const DatabaseAdminOptions = require('./DatabaseAdminOptions');
const DatabaseError = require('./DatabaseError');
const fs = require('fs').promises;
const logging = require('dxp3-logging');
const util = require('dxp3-util');
const UUID = require('dxp3-uuid');

const logger = logging.getLogger(canonicalName);

class DatabaseAdmin {

	static get sourceFolder() {
		return DatabaseAdmin.getSourceFolder();
	}

	static getSourceFolder() {
		return DatabaseAdmin._sourceFolder;
	}

	static set sourceFolder(_sourceFolder) {
		DatabaseAdmin.setSourceFolder(_sourceFolder, false);
	}

	static async sourceFolderExists(_sourceFolder) {
		logger.trace('sourceFolderExists(...): start.');
        if(_sourceFolder === undefined || _sourceFolder === null) {
			logger.trace('sourceFolderExists(...): end.');
			throw DatabaseError.ILLEGAL_ARGUMENT;
        }
        _sourceFolder = _sourceFolder.trim();
        if(_sourceFolder.length <= 0) {
			logger.trace('sourceFolderExists(...): end.');
			throw DatabaseError.ILLEGAL_ARGUMENT;
        }
		if(!_sourceFolder.endsWith(path.sep)) {
        	_sourceFolder += path.sep;
    	}
		try {
			let stats = await fs.stat(_sourceFolder);
		} catch(_exception) {
			if(_exception.code === 'ENOENT') {
				return false;
			}
			throw _exception;
		}
		return true;
	}

	static async setSourceFolder(_sourceFolder, _createIfNotExists) {
		logger.trace('setSourceFolder(...): start.');
        // Disconnect from any previously connected database
        for(let [databaseName, database] of DatabaseAdmin._fileSystemDatabases) {
        	await database.close();
        }
        if(_sourceFolder === undefined || _sourceFolder === null) {
            DatabaseAdmin._sourceFolder = null;
	        DatabaseAdmin._fileSystemDatabases = new Map();
			logger.trace('setSourceFolder(...): end.');
            return;
        }
        _sourceFolder = _sourceFolder.trim();
        if(_sourceFolder.length <= 0) {
            DatabaseAdmin._sourceFolder = null;
	        DatabaseAdmin._fileSystemDatabases = new Map();
			logger.trace('setSourceFolder(...): end.');
            return;
        }
		if(!_sourceFolder.endsWith(path.sep)) {
        	_sourceFolder += path.sep;
    	}
        DatabaseAdmin._sourceFolder = _sourceFolder;
        DatabaseAdmin._fileSystemDatabases = new Map();
        // Make sure the source folder exists.
		try {
			let stats = await fs.stat(DatabaseAdmin._sourceFolder);
		} catch(_exception) {
			if(_exception.code === 'ENOENT') {
				if(_createIfNotExists === true) {
			        logger.info('Source folder does NOT exist and will be created: ' + DatabaseAdmin._sourceFolder);
			        logger.info('Creating source folder: ' + DatabaseAdmin._sourceFolder);
		            await fs.mkdir(DatabaseAdmin._sourceFolder);
		        } else {
			        logger.warn('setSourceFolder(...): Source folder does NOT exist: ' + DatabaseAdmin._sourceFolder);
		        }
	        } else {
		        logger.error('setSourceFolder(...): ' + _exception);
	        }
			logger.trace('setSourceFolder(...): end.');
	        return;
		}
    	// Load the current databases
    	try {
			let files = await fs.readdir(DatabaseAdmin._sourceFolder);
			for(let i=0;i < files.length;i++) {
				let file = files[i];
				if(file.endsWith('.db')) {
					let databaseName = file.substring(0, file.length - 3);
					if(DatabaseAdmin._inMemoryDatabases.has(databaseName)) {
				        logger.warn('setSourceFolder(...): An in-memory database \'' + databaseName + '\' already exists.');
				        logger.warn('setSourceFolder(...): Unable to load the file system database \'' + databaseName + '\' .');
						continue;
					}
					let database = new Database(databaseName, DatabaseAdmin._sourceFolder);
					await database.init();
					DatabaseAdmin._fileSystemDatabases.set(databaseName, database);
				}
			}
		} catch(_exception) {
			logger.error('list(...): ' + _exception);
		}
		logger.trace('setSourceFolder(...): end.');
	}

	static async connect(_databaseName) {
		logger.trace('connect(...): start.');
		if(_databaseName === undefined || _databaseName === null) {
			// Calling connect(...) without any arguments could be
			// a programming error. Lets log a warning.
			logger.warn('connect(...): Missing arguments.');
			logger.trace('connect(...): end.');
			throw DatabaseError.ILLEGAL_ARGUMENT;
		}
		_databaseName = _databaseName.trim().toLowerCase();
		if(_databaseName.length <= 0) {
			// Calling connect(...) with an empty database name could be
			// a programming error. Lets log this as a warning.
			logger.warn('connect(...): Empty database name.');
			logger.trace('connect(...): end.');
			throw DatabaseError.ILLEGAL_ARGUMENT;
		}
		let database = DatabaseAdmin._inMemoryDatabases.get(_databaseName);
		if(database === undefined || database === null) {
			database = DatabaseAdmin._fileSystemDatabases.get(_databaseName);
			if(database === undefined || database === null) {
				logger.debug('connect(...): Database \'' + _databaseName + '\' not found.');
				logger.trace('connect(...): end.');
				throw DatabaseError.FILE_NOT_FOUND;
			}
		}
		logger.trace('connect(...): end.');
		return database;
	}

	static async create(_databaseName) {
		logger.trace('create(...): start.');
		if(_databaseName === undefined || _databaseName === null) {
			// Calling create(...) without any arguments could be
			// a programming error. Lets log a warning.
			logger.warn('create(...): Missing arguments.');
			logger.trace('create(...): end.');
			throw DatabaseError.ILLEGAL_ARGUMENT;
		}
		_databaseName = _databaseName.trim().toLowerCase();
		if(_databaseName.length <= 0) {
			// Calling create(...) with an empty database name could be
			// a programming error. Lets log this as informative.
			logger.info('create(...): Empty database name.');
			logger.trace('create(...): end.');
			throw DatabaseError.ILLEGAL_ARGUMENT;
		}
		if(DatabaseAdmin._inMemoryDatabases.has(_databaseName) ||
		   DatabaseAdmin._fileSystemDatabases.has(_databaseName)) {
			logger.info('Unable to create database \'' + _databaseName + '\'.');
			logger.info('A database with that name already exists.');
			logger.trace('create(...): end.');
			throw DatabaseError.CONFLICT;
		}
		let database = null;
		if(DatabaseAdmin._sourceFolder === null) {
			// In-Memory database
			database = new Database(_databaseName);
			await database.init();
			DatabaseAdmin._inMemoryDatabases.set(_databaseName, database);
		} else {
	        let definitionFile = DatabaseAdmin._sourceFolder + _databaseName + '.db';
	        let fileHandle = null;
			try {
				fileHandle = await fs.open(definitionFile, 'r');
				let stats = await fileHandle.stat();
			} catch(_exception) {
				if(_exception.code === 'ENOENT') {
					let definition = {};
					definition.uuid = UUID.newInstance();
					definition.name = _databaseName;
					fileHandle = await fs.open(definitionFile, 'w')
					await fileHandle.writeFile(JSON.stringify(definition), 'utf-8');
					database = new Database(_databaseName, DatabaseAdmin._sourceFolder);
					await database.init();
					DatabaseAdmin._fileSystemDatabases.set(_databaseName, database);
				}
			} finally {
				if(fileHandle != null) {
					await fileHandle.close();
				}
			}
		}
		logger.trace('create(...): end.');
		return database;
	}

	static async createDB(_databaseName, _sourceFolder) {
		return await DatabaseAdmin.create(_databaseName, _sourceFolder);
	}

	static async createDatabase(_databaseName, _sourceFolder) {
		return await DatabaseAdmin.create(_databaseName, _sourceFolder);
	}

	static async del(_databaseName) {
		return await DatabaseAdmin.delete(_databaseName);
	}

	static async delDatabase(_databaseName) {
		return await DatabaseAdmin.delete(_databaseName);
	}

	static async delDB(_databaseName) {
		return await DatabaseAdmin.delete(_databaseName);
	}

	static async delete(_databaseName) {
		logger.trace('delete(...): start.');
		if(_databaseName === undefined || _databaseName === null) {
			// Calling delete(...) without any arguments could be
			// a programming error. Lets log a warning.
			logger.warn('delete(...): Missing arguments.');
			logger.trace('delete(...): end.');
			throw DatabaseError.ILLEGAL_ARGUMENT;
		}
		_databaseName = _databaseName.trim().toLowerCase();
		if(_databaseName.length <= 0) {
			// Calling delete(...) with an empty database name could be
			// a programming error. Lets log this a warning.
			logger.warn('delete(...): Empty database name.');
			logger.trace('delete(...): end.');
			throw DatabaseError.ILLEGAL_ARGUMENT;
		}
		let database = DatabaseAdmin._inMemoryDatabases.get(_databaseName);
		if(database === undefined || database === null) {
			database = DatabaseAdmin._fileSystemDatabases.get(_databaseName);
			if(database === undefined || database === null) {
				throw DatabaseError.FILE_NOT_FOUND;
			}
			try {
		        let definitionFile = DatabaseAdmin._sourceFolder + _databaseName + '.db';
				await fs.unlink(definitionFile);
				DatabaseAdmin._fileSystemDatabases.delete(_databaseName);
			} catch(_exception) {
				logger.error('delete(...): ' + _exception);
				logger.trace('delete(...): end.');
				throw DatabaseError.INTERNAL_SERVER_ERROR;
			}
		} else {
			DatabaseAdmin._inMemoryDatabases.delete(_databaseName);
		}
		logger.trace('delete(...): end.');
		return true;
	}

	static async deleteDatabase(_databaseName) {
		return await DatabaseAdmin.delete(_databaseName);
	}

	static async deleteDB(_databaseName) {
		return await DatabaseAdmin.delete(_databaseName);
	}

	static async destroy(_databaseName) {
		return await DatabaseAdmin.delete(_databaseName);
	}

	static async destroyDatabase(_databaseName) {
		return await DatabaseAdmin.delete(_databaseName);
	}

	static async destroyDB(_databaseName) {
		return await DatabaseAdmin.delete(_databaseName);
	}

	static async exists(_databaseName) {		
		logger.trace('exists(...): start.');
        // Defensive programming...check input...
		if(_databaseName === undefined || _databaseName === null) {
			// Calling exists(...) without any arguments could be
			// a programming error. Lets log a warning.
			logger.warn('exists(...): Missing arguments.');
			logger.trace('exists(...): end.');
			throw DatabaseError.ILLEGAL_ARGUMENT;
		}
		_databaseName = _databaseName.trim().toLowerCase();
		if(_databaseName.length <= 0) {
			// Calling exists(...) with an empty database name could be
			// a programming error. Lets log this as informative.
			logger.info('exists(...): Empty database name.');
			logger.trace('exists(...): end.');
			throw DatabaseError.ILLEGAL_ARGUMENT;
		}
		let result = DatabaseAdmin._inMemoryDatabases.has(_databaseName);
		if(!result) {
			result = DatabaseAdmin._fileSystemDatabases.has(_databaseName);
		}
		logger.trace('exists(...): end.');
		return result;
	}

	static async has(_databaseName) {
		return await DatabaseAdmin.exists(_databaseName);
	}

	static async list() {
		logger.trace('list(): start.');
		let inMemoryDatabaseNames = Array.from(DatabaseAdmin._inMemoryDatabases.keys());
		let fileSystemDatabaseNames = Array.from(DatabaseAdmin._fileSystemDatabases.keys());
		let databaseNames = inMemoryDatabaseNames.concat(fileSystemDatabaseNames);
		logger.trace('list(): end.');
		return databaseNames;
	}

	static async listDatabases(_callback) {
		return await DatabaseAdmin.list(_callback);
	}

	static async listDBs(_callback) {
		return await DatabaseAdmin.list(_callback);
	}

	static async listFileSystem() {
		logger.trace('listFileSystem(): start.');
		let databaseNames = Array.from(DatabaseAdmin._fileSystemDatabases.keys());
		logger.trace('listFileSystem(): end.');
		return databaseNames;
	}

	static async listFileSystemDatabases(_callback) {
		return await DatabaseAdmin.listFileSystem(_callback);
	}

	static async listFileSystemDBs(_callback) {
		return await DatabaseAdmin.listFileSystem(_callback);
	}

	static async listInMemory() {
		logger.trace('listInMemory(): start.');
		let databaseNames = Array.from(DatabaseAdmin._inMemoryDatabases.keys());
		logger.trace('listInMemory(): end.');
		return databaseNames;
	}

	static async listInMemoryDatabases(_callback) {
		return await DatabaseAdmin.listInMemory(_callback);
	}

	static async listInMemoryDBs(_callback) {
		return await DatabaseAdmin.listInMemory(_callback);
	}

	static async move(_from, _to) {
		return await DatabaseAdmin.rename(_from, _to);
	}

	static async moveDatabse(_from, _to) {
		return await DatabaseAdmin.rename(_from, _to);
	}

	static async moveDB(_from, _to) {
		return await DatabaseAdmin.rename(_from, _to);
	}

	static async mv(_from, _to) {
		return await DatabaseAdmin.rename(_from, _to);
	}

	static async mvDatabase(_from, _to) {
		return await DatabaseAdmin.rename(_from, _to);
	}

	static async mvDB(_from, _to) {
		return await DatabaseAdmin.rename(_from, _to);
	}

	static async newDatabase(_databaseName, _sourceFolder) {
		return await DatabaseAdmin.create(_databaseName, _sourceFolder);
	}

	static async newDB(_databaseName, _sourceFolder) {
		return await DatabaseAdmin.create(_databaseName, _sourceFolder);
	}

	static async remove(_databaseName) {
		return await DatabaseAdmin.delete(_databaseName);
	}

	static async removeDatabase(_databaseName) {
		return await DatabaseAdmin.delete(_databaseName);
	}

	static async removeDB(_databaseName) {
		return await DatabaseAdmin.delete(_databaseName);
	}

	static async rename(_from, _to) {
		logger.trace('rename(...): start.');
		if(_from === undefined || _from === null ||
		   _to   === undefined || _to   === null) {
			// Calling rename(...) without any arguments could be
			// a programming error. Lets log a warning.
			logger.warn('rename(...): Missing arguments.');
			logger.trace('rename(...): end.');
			throw DatabaseError.ILLEGAL_ARGUMENT;
		}
		_from = _from.trim().toLowerCase();
		_to = _to.trim().toLowerCase();
		if(_from.length <= 0 ||
		   _to.length   <= 0) {
			// Calling rename(...) with an empty from or to name could be
			// a programming error. Lets log this as informative.
			logger.info('exists(...): Empty database name.');
			logger.trace('rename(...): end.');
			throw DatabaseError.ILLEGAL_ARGUMENT;
		}
		if(_from === _to) {
			logger.debug('rename(...): The name is unchanged.');
			logger.trace('rename(...): end.');
			return true;
		}
		logger.info('rename(...): Attempting to rename database from \'' + _from + '\' to \'' + _to + '\'.');
		if(DatabaseAdmin._inMemoryDatabases.has(_to) ||
		   DatabaseAdmin._fileSystemDatabases.has(_to)) {
			logger.info('rename(...): Unable to rename database from \'' + _from + '\' to \'' + _to + '\'.');
			logger.info('rename(...): A database with that name already exists.');
			throw DatabaseError.CONFLICT;
		}
		let database = DatabaseAdmin._inMemoryDatabases.get(_from);
		if(database === undefined || database === null) {
			database = DatabaseAdmin._fileSystemDatabases.get(_from);
			if(database === undefined || database === null) {
				logger.info('rename(...): Unable to rename database from \'' + _from + '\' to \'' + _to + '\'.');
				logger.info('rename(...): Database \'' + _from + '\' not found.');
				throw DatabaseError.FILE_NOT_FOUND;
			}
			DatabaseAdmin._fileSystemDatabases.set(_to, database);
			DatabaseAdmin._fileSystemDatabases.delete(_from);
		} else {
			DatabaseAdmin._inMemoryDatabases.set(_to, database);
			DatabaseAdmin._inMemoryDatabases.delete(_from);
		}
		await database.setName(_to);
		logger.trace('rename(...): end.');
		return true;
	}

	static async renameDatabase(_from, _to) {
		return await DatabaseAdmin.rename(_from, _to);
	}

	static async renameDB(_from, _to, _callback) {
		return await DatabaseAdmin.rename(_from, _to);
	}

	static async rm(_databaseName) {
		return await DatabaseAdmin.delete(_databaseName);
	}

	static async rmDatabase(_databaseName) {
		return await DatabaseAdmin.delete(_databaseName);
	}

	static async rmDB(_databaseName) {
		return await DatabaseAdmin.delete(_databaseName);
	}

	static main() {
		let exec = async function() {
			try {
				let databaseAdminOptions = DatabaseAdminOptions.parseCommandLine();
				logging.setLevel(databaseAdminOptions.logLevel);
				if(databaseAdminOptions.help) {
					util.Help.print(DatabaseAdmin);
					return;
				}
				// If the source folder does not exist we'll have the DatabaseAdmin create it.
				await DatabaseAdmin.setSourceFolder(databaseAdminOptions.sourceFolder, true);
				let result = await DatabaseAdmin.list();
				if(result.length <= 0) {
					console.log('No databases found.');
					return;
				}
				for(let i=0;i < result.length;i++) {
					console.log(result[i]);
				}
			} catch(exception) {
				console.log('EXCEPTION: ' + exception);
			}
		}
		exec();
	}
}
DatabaseAdmin._sourceFolder = null;
DatabaseAdmin._inMemoryDatabases = new Map();
DatabaseAdmin._fileSystemDatabases = new Map();
// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
	DatabaseAdmin.main();
	return;
}
module.exports = DatabaseAdmin;