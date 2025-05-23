/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-microservice
 *
 * NAME
 * RestClientCLI
 */
const packageName = 'dxp3-microservice-rest';
const moduleName = 'RestClientCLI';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
// Check if someone tried to run/execute this file.
const util = require('dxp3-util');
if(util.Assert.isFileToExecute(canonicalName)) {
	util.Help.print();
	return;
}
/**
 * @module dxp3-microservice/RestClientCLI
 */
const microservice = require('dxp3-microservice');
const readline = require('readline');
const RestClientEvent = require('./RestClientEvent');
const RestMethod = require('./RestMethod');
const RestMethodType = require('./RestMethodType');

const MicroServiceError = microservice.MicroServiceError;
const MicroServiceEvent = microservice.MicroServiceEvent;
/**
 * A Rest client command line interface program.
 */
class RestClientCLI {
	/**
	 * @param {module:dxp3-microservice/RestClient~RestClient} _restClient
	 */
	constructor(_restClient) {
		this.restClient = _restClient;
		this.state = 'INITIALIZED';
		this.socket = null;
	}

	start() {
		let self = this;
		const rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout,
			prompt: 'DXP3-REST> '
		});
		console.log('');
		console.log('Use this interface to communicate with a rest server.');
		this.restClient.on(RestClientEvent.CONNECTING, function() {
			console.log('Connecting.');
			rl.prompt();
		});
		this.restClient.on(RestClientEvent.CONNECTED, function() {
			console.log('Connected.');
			for(let [methodName, method] of self.restClient.methods) {
				console.log('Available command: ' + method.toString());
			}
			rl.prompt();
		});
		this.restClient.on(RestClientEvent.CLOSED, function(err) {
			console.log('Closed.');
			rl.prompt();
		});
		this.restClient.on(RestClientEvent.CLOSING, function(err) {
			console.log('Closing.');
			rl.prompt();
		});
		this.restClient.on(MicroServiceEvent.STOPPED, function(err) {
			console.log('Stopped.');
			rl.prompt();
		});
		this.restClient.on(MicroServiceEvent.STOPPING, function(err) {
			console.log('Stopping.');
			rl.prompt();
		});
		this.restClient.on(MicroServiceEvent.STARTING, function(err) {
			console.log('Starting...');
			rl.prompt();
		});
		this.restClient.on(MicroServiceEvent.RUNNING, function(err) {
			console.log('Running...');
			rl.prompt();
		});
		this.restClient.start();
		this.parse(rl);
	}

	execute(rl, cmd, args) {
		let self = this;
		try {
			this.restClient.execute(cmd, ...args, function(error, response) {
				if(error) {
					console.log('error: ' + error);
					self.state = 'PARSING';
				} else {
					let restMethod = self.restClient.methods.get(cmd);
					switch(restMethod.returnType) {
						case RestMethodType.ARRAY_NUMBER:
							console.log('array<number>: ' + response);
							self.state = 'PARSING';
							break;
						case RestMethodType.ARRAY_OBJECT:
							console.log('array<object>: ' + JSON.stringify(response));
							self.state = 'PARSING';
							break;
						case RestMethodType.ARRAY_STRING:
							console.log('array<string>: ' + JSON.stringify(response));
							self.state = 'PARSING';
							break;
						case RestMethodType.BOOLEAN:
							console.log('boolean: ' + response);
							self.state = 'PARSING';
							break;
						case RestMethodType.FILE:
							console.log('Where would you like to save the file to?');
							self.socket = response;
							self.state = 'PARSE_FILE';
							break;
						case RestMethodType.NUMBER:
							console.log('number: ' + response);
							self.state = 'PARSING';
							break;
						case RestMethodType.OBJECT:
							console.log('object: ' + JSON.stringify(response));
							self.state = 'PARSING';
							break;
						case RestMethodType.STRING:
							console.log('string: ' + response);
							self.state = 'PARSING';
							break;
						case RestMethodType.VOID:
							console.log('void');
							self.state = 'PARSING';
							break;
						default:
							console.log('unknown: ' + data);
							self.state = 'PARSING';
							break;
					}
				}
				rl.prompt();
			});
		} catch(exception) {
			console.log(exception.message);
			self.state = 'PARSING';
			rl.prompt();
		}
	}
	parse(rl) {
		let self = this;
		let cmd = null;
		let args = [];
		let restMethod = null;
		let parameter = null;
		let parameterIndex = 0;
		rl.prompt();
		rl.on('line', (line) => {
			line = line.trim();
			switch(this.state) {
				case 'PARSE_FILE':
					self.state = 'EXECUTING';
					self.socket.readFileHeader().then(
						(fileHeader) => {
							if(fileHeader.error) {
								console.log(fileHeader.error.message);
								self.state = 'PARSING';
								rl.prompt();
								return;
							}
							self.socket.readFile(line).then(
								(bytesWritten) => {
									console.log('' + bytesWritten + ' bytes written.');
									self.state = 'PARSING';
									rl.prompt();
								},
								(error) => {
									console.log('Error while writing to file: ' + error);
									self.state = 'PARSING';
									rl.prompt();
								}
							);
						},
						(err) => {
							console.log(err.message);
						}
					);
					break;
				case 'PARSE_CMD':
					cmd = line;
					parameter = null;
					parameterIndex = 0;
					args = [];
					restMethod = self.restClient.methods.get(cmd);
					if(restMethod === undefined || restMethod === null) {
						self.execute(rl, cmd, args);
					} else if(restMethod.parameters.length <= 0) {
						self.execute(rl, cmd, args);
					} else {
						parameter = restMethod.parameters[parameterIndex++];
						if(parameter.type === RestMethodType.FILE) {
							console.log('Where would you like to read the file from?');
						}
						if(parameter.isOptional) {
							console.log(parameter.name + ' (an optional ' + parameter.type + '):');
						} else {
							console.log(parameter.name + ' (of type ' + parameter.type + '):');
						}
						this.state = 'PARSE_ARGS';
					}
					break;
				case 'EXECUTING':
					console.log('Please wait...executing...');
					break;
				case 'PARSE_ARGS':
					let arg = line;
					if(parameter.type === RestMethodType.NUMBER) {
						arg = parseInt(arg);
					}
					if(parameter.type === RestMethodType.OBJECT) {
						arg = JSON.parse(arg);
					}
					args.push(arg);
					if(parameterIndex >= restMethod.parameters.length) {
						self.state = 'EXECUTING';
						self.execute(rl, cmd, args);
					} else {
						let parameter = restMethod.parameters[parameterIndex++];
						if(parameter.type === RestMethodType.FILE) {
							console.log('Where would you like to read the file from?');
						}
						if(parameter.isOptional) {
							console.log(parameter.name + ' (an optional ' + parameter.type + '):');
						} else {
							console.log(parameter.name + ' (of type ' + parameter.type + '):');
						}
					}
					break;
				default:
					cmd = null;
					let parts = line.split(' ');
					let input = parts[0];
					let inputArgs = parts[1];
					switch(input) {
						case 'actions':
						case 'commands':
						case 'functions':
						case 'methods':
							if(!this.restClient.isConnected()) {
								console.log('Awaiting connection to \'' + this.restClient.consumes + '\'...');
							} else {
								for(let [methodName, method] of self.restClient.methods) {
									console.log('Available command: ' + method.toString());
								}
							}
							break;
						case 'action':
						case 'call':
						case 'cmd':
						case 'command':
						case 'exec':
						case 'execute':
						case 'method':
							if(inputArgs != undefined || inputArgs != null) {
								cmd = inputArgs;
								parameterIndex = 0;
								args = [];
								restMethod = self.restClient.methods.get(cmd);
								if(restMethod === undefined || restMethod === null) {
									self.execute(rl, cmd, args);
								} else if(restMethod.parameters.length <= 0) {
									self.execute(rl, cmd, args);
								} else {
									parameter = restMethod.parameters[parameterIndex++];
									if(parameter.isOptional) {
										console.log(parameter.name + ' (optional):');
									} else {
										console.log(parameter.name + ':');
									}
									this.state = 'PARSE_ARGS';
								}
								break;
							}
							console.log('Please provide the action/command name to execute.');
							this.state = 'PARSE_CMD';
							break;
						case 'status':
						case 'state':
							if(this.restClient.isConnected()) {
								console.log(this.restClient.state + ' and connected.');
							} else if(this.restClient.isQueuing()) {
								console.log(this.restClient.state + ' and not connected with messages in the queue.');
							} else if(this.restClient.isClosed()) {
								console.log(this.restClient.state + ' and not connected.');
							} else {
								console.log(this.restClient.state);
							}
							break;
						case 'exit':
						case 'quit':
							console.log('Goodbye');
							process.exit(1);
							break;
						case 'start':
							this.restClient.start();
							break;
						case 'stop':
							this.restClient.stop();
							break;
						case 'faq':
						case 'help':
						case 'info':
						case 'information':
							console.log('Possible methods:');
							console.log('');
							console.log('COMMAND --- ALIASES --------------- DESCRIPTION --------------------------------');
							console.log('execute     action,call,cmd,        Send a command with optional arguments.');
							console.log('            command,exec,method');
							console.log('exit        quit                    Exit this program.');
							console.log('functions   actions,commands,       List all available RestServer methods.');
							console.log('            methods')
							console.log('help        faq,info,information    Show this help screen.');
							console.log('status      state                   Show the RestClient\'s status.');
							console.log('start                               Start the RestClient.');
							console.log('stop                                Stop the RestClient.');
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
}

module.exports = RestClientCLI;