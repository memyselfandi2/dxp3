/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-microservice-database
 *
 * NAME
 * DatabaseServer
 */
const packageName = 'dxp3-microservice-database';
const moduleName = 'DatabaseServer';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * @module dxp3-microservice-database/DatabaseServer
 */
const db = require('dxp3-db');
const DatabaseServerOptions = require('./DatabaseServerOptions');
const logging = require('dxp3-logging');
const rest = require('dxp3-microservice-rest');
const util = require('dxp3-util');

const logger = logging.getLogger(canonicalName);

class DatabaseServer extends rest.RestServer {

	constructor(_options) {
		super(_options);
		this.addMethod('Object deleteFrom(String tableName, [String condition])', (tableName, condition, _response) => {
			logger.debug('deleteFrom(...)');
			this.deleteFrom(tableName, condition, _response);
		});
		this.addMethod('Object insertInto(String tableName, Object values)', (tableName, values, _response) => {
			logger.debug('insertInto(...)');
			this.insertInto(tableName, values, _response);
		});
		this.addMethod('Integer nextValue(String sequenceName)', (sequenceName, _response) => {
			logger.debug('nextValue(...)');
			this.nextValue(sequenceName, _response);
		});
		this.addMethod('Object query(String queryString)', (queryString, _response) => {
			logger.debug('query(...)');
			this.query(queryString, _response);
		});
		this.addMethod('Array<Object> select(String tableName, [String condition])', (tableName, condition, _response) => {
			logger.debug('select(...)');
			this.select(tableName, condition, _response);
		});
		this.addMethod('void update(String tableName, Object values, [String condition])', (tableName, values, condition, _response) => {
			logger.debug('update(...)');
			this.update(tableName, values, _response);
		});
		this._database = new db.Database(_options.databaseName, _options.sourceFolder);
	}

	deleteFrom(_tableName, _condition, _response) {
		this._database.delete(_tableName, _condition)
		.then((_result) => {
			_response.send(_result);
		})
		.catch((_exception) => {
			logger.error('Exception: ' + _exception);
			_response.sendError("Something went wrong.");
		});
	}

	starting(_callback) {
		this._database.init()
		.then(() => {
			super.starting(_callback);
		})
		.catch((_exception) => {
			logger.error('Exception: ' + _exception);
			// By calling the callback with the exception we will
			// interrupt the starting process and return to the
			// STOPPED state.
			_callback(_exception);
		});
	}

	query(_queryString, _response) {
		this._database.query(_queryString)
		.then((_result) => {
			_response.send(_result);
		})
		.catch((_exception) => {
			logger.error('Exception: ' + _exception);
			_response.sendError("Something went wrong.");
		});
	}

	insertInto(tableName, values, _response) {
		this._database.insert(tableName, values)
		.then((_result) => {
			_response.send(_result);
		})
		.catch((_exception) => {
			logger.error('Exception: ' + _exception);
			_response.sendError("Something went wrong.");
		});
	}

	nextValue(sequenceName, _response) {
		this._database.nextValue(sequenceName)
		.then((_result) => {
			_response.send(_result);
		})
		.catch((_exception) => {
			logger.error('Exception: ' + _exception);
			_response.sendError("Something went wrong.");
		});
	}

	select(_tableName, _condition, _response) {
		this._database.select(_tableName, _condition)
		.then((_result) => {
			_response.send(_result);
		})
		.catch((_exception) => {
			logger.error('Exception: ' + _exception);
			_response.sendError("Something went wrong.");
		});
	}

	update(_tableName, _columns, _values, _condition, _response) {
		this._database.update(_tableName, _columns, _values, _condition)
		.then((_result) => {
			_response.send(_result);
		})
		.catch((_exception) => {
			logger.error('Exception: ' + _exception);
			_response.sendError("Something went wrong.");
		});
	}

	/**
	 * @override
	 */
	get type() {
		return rest.MicroServiceType.DATABASE_SERVER;
	}

	/**
	 * @override
	 */
	get compatibleTypes() {
		return [rest.MicroServiceType.DATABASE_CLIENT,rest.MicroServiceType.REST_CLIENT];
	}

	static main() {
		try {
			let databaseServerOptions = DatabaseServerOptions.parseCommandLine();
			logging.setLevel(databaseServerOptions.logLevel);
			if(databaseServerOptions.help) {
				util.Help.print(DatabaseServer);
				return;
			}
			// We need a name
			let databaseServerName = databaseServerOptions.name;
			if(databaseServerName === undefined || databaseServerName === null || databaseServerName.length <= 0) {
				logger.fatal('Missing name. Please supply a name for this DatabaseServer using the -name argument.');
				logger.info('Exiting due to fatal error.');
				process.exit();
			}
			let databaseServer = new DatabaseServer(databaseServerOptions);
			databaseServer.on(rest.MicroServiceEvent.ERROR, (_error) => {
				logger.error(_error.message);
			});
			databaseServer.on(rest.MicroServiceEvent.RUNNING, () => {
				console.log('To get help include the -help option:');
				console.log('node DatabaseServer -help');
				console.log('');
				console.log('DatabaseServer \'' + databaseServer.name + '\' running at port ' + databaseServer.port);
			});
			databaseServer.start();
		} catch(exception) {
			console.log('EXCEPTION: ' + exception.code + ': ' + exception.message);
		}
	}
}
// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
	DatabaseServer.main();
	return;
}
module.exports = DatabaseServer;