/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-microservice-cache
 *
 * NAME
 * CacheServer
 */
const packageName = 'dxp3-microservice-cache';
const moduleName = 'CacheServer';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * @module dxp3-microservice/CacheServer
 */
const CacheServerOptions = require('./CacheServerOptions');
const logging = require('dxp3-logging');
const rest = require('dxp3-microservice-rest');
const util = require('dxp3-util');

const logger = logging.getLogger(canonicalName);

class CacheServer extends rest.RestServer {

	constructor(args) {
		super(args);
		let self = this;
		self.cache = new Map();
		self.addMethod('Number amount()', (response) => {
			logger.debug('amount()');
			self.size(response);
		});
		self.addMethod('Number count()', (response) => {
			logger.debug('count()');
			self.size(response);
		});
		self.addMethod('Number length()', (response) => {
			logger.debug('length()');
			self.size(response);
		});
		self.addMethod('Number size()', (response) => {
			logger.debug('size()');
			self.size(response);
		});
		self.addMethod('Object delete(String key)', (key, response) => {
			logger.debug('delete(' + key + ')');
			self.delete(key, response);
		});
		self.addMethod('Object destroy(String key)', (key, response) => {
			logger.debug('destroy(' + key + ')');
			self.delete(key, response);
		});
		self.addMethod('Object remove(String key)', (key, response) => {
			logger.debug('remove(' + key + ')');
			self.delete(key, response);
		});
		self.addMethod('Object get(String key)', (key, response) => {
			logger.debug('get(' + key + ')');
			self.get(key, response);
		});
		self.addMethod('Object read(String key)', (key, response) => {
			logger.debug('read(' + key + ')');
			self.get(key, response);
		});
		self.addMethod('Object retrieve(String key)', (key, response) => {
			logger.debug('retrieve(' + key + ')');
			self.get(key, response);
		});
		self.addMethod('void add(String key, Object value)', (key, value, response) => {
			logger.debug('add(' + key + ')');
			self.set(key, value, response);
		});
		self.addMethod('void insert(String key, Object value)', (key, value, response) => {
			logger.debug('insert(' + key + ')');
			self.set(key, value, response);
		});
		self.addMethod('void push(String key, Object value)', (key, value, response) => {
			logger.debug('push(' + key + ')');
			self.set(key, value, response);
		});
		self.addMethod('void set(String key, Object value)', (key, value, response) => {
			logger.debug('set(' + key + ')');
			self.set(key, value, response);
		});
		self.addMethod('void update(String key, Object value)', (key, value, response) => {
			logger.debug('update(' + key + ')');
			self.set(key, value, response);
		});
		self.addMethod('void write(String key, Object value)', (key, value, response) => {
			logger.debug('write(' + key + ')');
			self.set(key, value, response);
		});
	}

	delete(key, response) {
		let data = this.cache.get(key);
		if(data === undefined || data === null) {
			response.sendError('NOT FOUND');
		} else {
			this.cache.delete(key);
			response.send(null, data);
		}
	}

	get(key, response) {
		let data = this.cache.get(key);
		if(data === undefined || data === null) {
			response.sendError('NOT FOUND');
		} else {
			response.send(null, data);
		}
	}

	set(key, value, response) {
		this.cache.set(key, value);
		response.send(null);
	}

	size(response) {
		response.send(null, this.cache.size);
	}

	/**
	 * @override
	 */
	get type() {
		return rest.MicroServiceType.CACHE_SERVER;
	}

	/**
	 * @override
	 */
	get compatibleTypes() {
		return [rest.MicroServiceType.CACHE_CLIENT,rest.MicroServiceType.REST_CLIENT];
	}

	static main() {
		try {
			let cacheServerOptions = CacheServerOptions.parseCommandLine();
			logging.setLevel(cacheServerOptions.logLevel);
			if(cacheServerOptions.help) {
				util.Help.print(this);
				return;
			}
			// We need a name
			let cacheServerName = cacheServerOptions.name;
			if(cacheServerName === undefined || cacheServerName === null || cacheServerName.length <= 0) {
				logger.fatal('Missing name. Please supply a name for this CacheServer using the -name argument.');
				logger.info('Exiting due to fatal error.');
				process.exit();
			}
			let cacheServer = new CacheServer(cacheServerOptions);
			cacheServer.on(rest.MicroServiceEvent.ERROR, (_error) => {
				logger.error(_error.message);
			});
			cacheServer.on(rest.MicroServiceEvent.RUNNING, () => {
				console.log('To get help include the -help option:');
				console.log('node CacheServer -help');
				console.log('');
				console.log('CacheServer \'' + cacheServer.name + '\' running at port ' + cacheServer.port);
			});
			cacheServer.start();
		} catch(exception) {
			console.log('EXCEPTION: ' + exception.code + ': ' + exception.message);
		}
	}
}
// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
	CacheServer.main();
	return;
}
module.exports = CacheServer;