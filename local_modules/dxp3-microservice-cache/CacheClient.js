/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-microservice-cache
 *
 * NAME
 * CacheClient
 */
const packageName = 'dxp3-microservice-cache';
const moduleName = 'CacheClient';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
// Check if someone tried to run/execute this file.
const util = require('dxp3-util');
if(util.Assert.isFileToExecute(canonicalName)) {
	util.Help.print();
	return;
}
/**
 * @module dxp3-microservice/CacheClient
 */
const CacheClientOptions = require('./CacheClientOptions');
const logging = require('dxp3-logging');
const rest = require('dxp3-microservice-rest');

const logger = logging.getLogger(canonicalName);

class CacheClient extends rest.RestClient {
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
			console.log('error: ' + err);
			_callback(_error, _data);
		});
	}

	amount(_callback) {
		// Fail fast. If we are not connected, there is no point in queuing the request.
		// Simply return.
		if(this.isClosed()) {
			return _callback('NOT CONNECTED');
		}
		this.execute('amount', (_error, _data) => {
			_callback(_error, _data);
		});
	}

	count(_callback) {
		// Fail fast. If we are not connected, there is no point in queuing the request.
		// Simply return.
		if(this.isClosed()) {
			return _callback('NOT CONNECTED');
		}
		this.execute('count', (_error, _data) => {
			_callback(_error, _data);
		});
	}

	length(_callback) {
		// Fail fast. If we are not connected, there is no point in queuing the request.
		// Simply return.
		if(this.isClosed()) {
			return _callback('NOT CONNECTED');
		}
		this.execute('length', (_error, _data) => {
			_callback(_error, _data);
		});
	}

	size(_callback) {
		// Fail fast. If we are not connected, there is no point in queuing the request.
		// Simply return.
		if(this.isClosed()) {
			return _callback('NOT CONNECTED');
		}
		this.execute('size', (_error, _data) => {
			_callback(_error, _data);
		});
	}

	delete(_key, _callback) {
		// Fail fast. If we are not connected, there is no point in queuing the request.
		// Simply return.
		if(this.isClosed()) {
			return _callback('NOT CONNECTED');
		}
		this.execute('delete', _key, (_error, _data) => {
			_callback(_error, _data);
		});
	}

	remove(_key, _callback) {
		// Fail fast. If we are not connected, there is no point in queuing the request.
		// Simply return.
		if(this.isClosed()) {
			return _callback('NOT CONNECTED');
		}
		this.execute('remove', _key, (_error, _data) => {
			_callback(_error, _data);
		});
	}

	get(_key, _callback) {
		// Fail fast. If we are not connected, there is no point in queuing the request.
		// Simply return.
		if(this.isClosed()) {
			return _callback('NOT CONNECTED');
		}
		this.execute('get', _key, (_error, _data) => {
			_callback(_error, _data);
		});
	}

	read(_key, _callback) {
		// Fail fast. If we are not connected, there is no point in queuing the request.
		// Simply return.
		if(this.isClosed()) {
			return _callback('NOT CONNECTED');
		}
		this.execute('read', _key, (_error, _data) => {
			_callback(_error, _data);
		});
	}

	retrieve(_key, _callback) {
		// Fail fast. If we are not connected, there is no point in queuing the request.
		// Simply return.
		if(this.isClosed()) {
			return _callback('NOT CONNECTED');
		}
		this.execute('retrieve', _key, (_error, _data) => {
			_callback(_error, _data);
		});
	}

	add(_key, _value, _callback) {
		// Fail fast. If we are not connected, there is no point in queuing the request.
		// Simply return.
		if(this.isClosed()) {
			if(_callback) {
				return _callback('NOT CONNECTED');
			}
			return;
		}
		this.execute('add', _key, _value, (_error) => {
			if(_callback) {
				_callback(_error);
			}
			return;
		});
	}
	set(_key, _value, _callback) {
		// Fail fast. If we are not connected, there is no point in queuing the request.
		// Simply return.
		if(this.isClosed()) {
			if(_callback) {
				return _callback('NOT CONNECTED');
			}
			return;
		}
		this.execute('set', _key, _value, (_error) => {
			if(_callback) {
				_callback(_error);
			}
			return;
		});
	}
	update(_key, _value, _callback) {
		// Fail fast. If we are not connected, there is no point in queuing the request.
		// Simply return.
		if(this.isClosed()) {
			if(_callback) {
				return _callback('NOT CONNECTED');
			}
			return;
		}
		this.execute('update', _key, _value, (_error) => {
			if(_callback) {
				_callback(_error);
			}
			return;
		});
	}
	write(_key, _value, _callback) {
		// Fail fast. If we are not connected, there is no point in queuing the request.
		// Simply return.
		if(this.isClosed()) {
			if(_callback) {
				return _callback('NOT CONNECTED');
			}
			return;
		}
		this.execute('write', _key, _value, (_error) => {
			if(_callback) {
				_callback(_error);
			}
			return;
		});
	}

	/**
	 * @override
	 */
	get type() {
		return rest.MicroServiceType.CACHE_CLIENT;
	}

	/**
	 * @override
	 */
	get compatibleTypes() {
		return [rest.MicroServiceType.CACHE_SERVER];
	}
}
// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
	util.Help.print(CacheClient);
	return;
}
module.exports = CacheClient;