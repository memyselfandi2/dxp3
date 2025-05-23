/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-microservice-cache
 *
 * NAME
 * CacheClientCLI
 */
const packageName = 'dxp3-microservice-cache';
const moduleName = 'CacheClientCLI';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * @module dxp3-microservice/CacheClientCLI
 */
const CacheClient = require('./CacheClient');
const CacheClientEvent = require('./CacheClientEvent');
const CacheClientOptions = require('./CacheClientOptions');
const logging = require('dxp3-logging');
const readline = require('readline');
const rest = require('dxp3-microservice-rest');
const util = require('dxp3-util');
/**
 * A Cache client command line interface program.
 */
class CacheClientCLI {
	/**
	 * @param {module:dxp3-microservice/CacheClient~CacheClient} _cacheClient
	 */
	constructor(_cacheClient) {
		this.cacheClient = _cacheClient;
		this.commands = [];
	}

	start() {
		let self = this;
		const rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout,
			prompt: 'DXP3-CACHE> '
		});
		console.log('');
		console.log('Use this interface to set and get cached data.');
		this.cacheClient.on(CacheClientEvent.CONNECTED, () => {
			console.log('Connected...');
			for(let [methodName, method] of self.cacheClient.methods) {
				console.log('Available command: ' + method.toString());
			}
			rl.prompt();
		});
		this.cacheClient.on(CacheClientEvent.CLOSED, (_error) => {
			console.log('Closed...');
			rl.prompt();
		});
		this.cacheClient.on(rest.MicroServiceEvent.STOPPED, (_error) => {
			console.log('Stopped...');
			rl.prompt();
		});
		this.cacheClient.on(rest.MicroServiceEvent.STOPPING, (_error) => {
			console.log('Stopping...');
			rl.prompt();
		});
		this.cacheClient.on(rest.MicroServiceEvent.STARTING, (_error) => {
			console.log('Starting...');
			rl.prompt();
		});
		this.cacheClient.on(rest.MicroServiceEvent.RUNNING, (_error) => {
			console.log('Running...');
			rl.prompt();
		});
		this.cacheClient.start();
		this.parse(rl);
	}

	parse(rl) {
		let state = 'PARSE';
		let key = null;
		let data = null;
		rl.prompt();
		rl.on('line', (line) => {
			line = line.trim();
			switch(state) {
				case 'PARSE_SET_DATA':
					data = {data:line};
					this.cacheClient.set(key, data, (_error) => {
						if(_error) {
							console.log('error: ' + _error);
							rl.prompt();
						}
					});
					state = 'PARSE';
					break;
				case 'PARSE_GET':
					key = line;
					if(key != 'stop') {
						this.cacheClient.get(key, (_error, cachedData) => {
							if(_error) {
								console.log('error: ' + _error);
							} else {
								console.log('cached data: ' + JSON.stringify(cachedData));
							}
							rl.prompt();
						});
					}
					state = 'PARSE';
					break;
				case 'PARSE_DELETE':
					key = line;
					if(key != 'stop') {
						this.cacheClient.delete(key, (_error, cachedData) => {
							if(_error) {
								console.log('error: ' + _error);
							} else {
								console.log('deleted data: ' + cachedData);
							}
							rl.prompt();
						});
					}
					state = 'PARSE';
					break;
				case 'PARSE_SET':
					key = line;
					if(key != 'stop') {
						console.log('Please provide the data to cache.');
						state = 'PARSE_SET_DATA';
					} else {
						state = 'PARSE';
					}
					break;
				default:
					key = null;
					data = null;
					switch(line) {
						case 'actions':
						case 'commands':
						case 'functions':
						case 'list':
						case 'methods':
							for(let [methodName, method] of this.cacheClient.methods) {
								console.log(method.toString());
							}
							break;
						case 'get':
						case 'read':
						case 'retrieve':
							console.log('Please provide the key (type stop to stop).');
							state = 'PARSE_GET';
							break;
						case 'add':
						case 'insert':
						case 'set':
						case 'update':
						case 'write':
							console.log('Please provide the key (type stop to stop).');
							state = 'PARSE_SET';
							break;
						case 'delete':
						case 'destroy':
						case 'remove':
							console.log('Please provide the key to delete (type stop to stop).');
							state = 'PARSE_DELETE';
							break;
						case 'amount':
						case 'count':
						case 'length':
						case 'size':
							this.cacheClient.size((_error, size) => {
								if(_error) {
									console.log('error: ' + _error);
								} else {
									console.log('Number of cached items: ' + size);
								}
								rl.prompt();
							});
							break;
						case 'status':
						case 'state':
							if(this.cacheClient.isConnected()) {
								console.log(this.cacheClient.state + ' and connected.');
							} else if(this.cacheClient.isQueuing()) {
								console.log(this.cacheClient.state + ' and not connected with messages in the queue.');
							} else if(this.cacheClient.isClosed()) {
								console.log(this.cacheClient.state + ' and not connected.');
							} else {
								console.log(this.cacheClient.state);
							}
							break;
						case 'start':
							this.cacheClient.start();
							break;
						case 'stop':
							this.cacheClient.stop();
							break;
						case 'exit':
						case 'quit':
							console.log('Goodbye');
							process.exit(1);
							break;
						case 'faq':
						case 'help':
						case 'info':
						case 'information':
							console.log('');
							console.log('COMMAND --- ALIASES --------------- DESCRIPTION --------------------------------');
							console.log('delete      destroy,remove          Delete an entry from the cache.');
							console.log('exit        quit                    Exit this program.');
							console.log('functions   actions,commands,       List all available CacheServer methods.');
							console.log('            methods')
							console.log('get         read, retrieve          Retrieve a cached value.');
							console.log('help        faq,info,information    Show this help screen.');
							console.log('set         add,insert,update,write Cache a value using a key.');
							console.log('size        amount,count,length     Retrieve the number of items in the cache.');
							console.log('start                               Start the CacheClient.');
							console.log('status      state                   Get the current state of the CacheClient.');
							console.log('stop                                Stop the CacheClient.');
							console.log('--------------------------------------------------------------------------------');
							console.log('');
							break;
						default:
							break;
					}
					break;
			}
			rl.prompt();
		});
		rl.on('close', () => {
			console.log('Goodbye');
			process.exit(1);
		});
	}

	static main() {
		try {
			let cacheClientOptions = CacheClientOptions.parseCommandLine();
			logging.setLevel(cacheClientOptions.logLevel);
			if(cacheClientOptions.help) {
				util.Help.print(this);
				return;
			}
			let cacheClient = new CacheClient(cacheClientOptions);
			let cacheClientCLI = new CacheClientCLI(cacheClient);
			cacheClientCLI.start();
		} catch(exception) {
			console.log('EXCEPTION:'  + exception);
		}
	}
}
// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
	CacheClientCLI.main();
	return;
}

module.exports = CacheClientCLI;