/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-microservice-database
 *
 * NAME
 * DatabaseClient
 */
const packageName = 'dxp3-microservice-database';
const moduleName = 'DatabaseClient';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * @module dxp3-microservice-database/DatabaseClient
 */
const rest = require('dxp3-microservice-rest');
const util = require('dxp3-util');

class DatabaseClient extends rest.RestClient {
	constructor(_options) {
		super(_options);
	}

	commands(_callback) {
		// Fail fast. If we are not connected, there is no point in queuing the request.
		// Simply return.
		if(this.isClosed()) {
			return _callback('NOT CONNECTED');
		}
		this.execute('commands', (_error, _data) => {
			_callback(_error, _data);
		});
	}

	deleteFrom(tableName, condition, response) {
		this.execute('deleteFrom', tableName, condition, (_error, _data) => {
			_callback(_error, _data);
		});
	}

	insertInto(tableName, values, _callback) {
		this.execute('insertInto', tableName, values, (_error, _data) => {
			_callback(_error, _data);
		});
	}

	nextValue(sequenceName, _callback) {
		this.execute('nextValue', sequenceName, (_error, _data) => {
			_callback(_error, _data);
		});
	}

	query(queryString, _callback) {
		this.execute('query', queryString, (_error, _data) => {
			_callback(_error, _data);
		});
	}

	select(tableName, condition, response) {
		this.execute('select', tableName, condition, (_error, _data) => {
			_callback(_error, _data);
		});
	}

	update(tableName, values, response) {
		this.execute('update', tableName, values, (_error, _data) => {
			_callback(_error, _data);
		});
	}

	/**
	 * @override
	 */
	get type() {
		return rest.MicroServiceType.DATABASE_CLIENT;
	}

	/**
	 * @override
	 */
	get compatibleTypes() {
		return [rest.MicroServiceType.DATABASE_SERVER];
	}
}
// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
	util.Help.print(DatabaseClient);
	return;
}
module.exports = DatabaseClient;