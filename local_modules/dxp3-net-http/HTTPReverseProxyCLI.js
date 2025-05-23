/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-net-http
 *
 * NAME
 * HTTPReverseProxyCLI
 */
const packageName = 'dxp3-net-http';
const moduleName = 'HTTPReverseProxyCLI';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * @module dxp3-net-http/HTTPReverseProxyCLI
 */
const fs = require('fs');
const logging = require('dxp3-logging');
const readline = require('readline');
const HTTPError = require('./HTTPError');
const HTTPReverseProxy = require('./HTTPReverseProxy');
const HTTPReverseProxyEvent = require('./HTTPReverseProxyEvent');
const HTTPReverseProxyOptions = require('./HTTPReverseProxyOptions');
const util = require('dxp3-util');
// Lets get a reference to several utilities.
const Help = util.Help;
/**
 * A HTTPReverseProxy command line interface program.
 */
class HTTPReverseProxyCLI {
    /*********************************************
     * CONSTRUCTOR
     ********************************************/

    /**
	 * @param {module:dxp3-net-http/HTTPReverseProxy} _httpReverseProxy
     */
	constructor(_httpReverseProxy) {
		this.httpReverseProxy = _httpReverseProxy;
		this._rl = null;
		this.state = 'PARSE';
		this._hasUnsavedChanges = false;
	}

    /*********************************************
     * PUBLIC METHODS
     ********************************************/

	start() {
		this._rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout,
			prompt: 'DXP3-HTTP-REVERSE-PROXY>'
		});
		this._rl.on('close', () => {
			this._parseExit();
		});
		this.httpReverseProxy.on(HTTPReverseProxyEvent.RUNNING, (_error) => {
			console.log('Running...');
			this._rl.prompt();
		});
		this.httpReverseProxy.on(HTTPReverseProxyEvent.STARTING, (_error) => {
			console.log('Starting...');
			this._rl.prompt();
		});
		this.httpReverseProxy.on(HTTPReverseProxyEvent.STOPPED, (_error) => {
			console.log('Stopped.');
			this._rl.prompt();
		});
		this.httpReverseProxy.on(HTTPReverseProxyEvent.STOPPING, (_error) => {
			console.log('Stopping...');
			this._rl.prompt();
		});
		this.httpReverseProxy.on(HTTPReverseProxyEvent.ERROR, (_error) => {
			console.log('Error: ' + _error.toString());
			this._rl.prompt();
		});
		console.clear();
		console.log('');
		console.log('Use this interface to control a HTTPReverseProxy.');
		console.log('The HTTPReverseProxy has not yet been started, but it has');
		console.log('been initialized with default values.')
		console.log('Type help for a list of available commands.');
		this._parse();
	}

    /*********************************************
     * PRIVATE METHODS
     ********************************************/

	_parse() {
		let self = this;
		this._rl.prompt();
		this._rl.on('line', (line) => {
			self._parseLine(line);
		});
	}

	async _parseLine(line) {
		let self = this;
		let domainName = null;
		let domainFolder = null;
		let command = null;
		let commandArguments = null;
		let subCommand = null;
		let subCommandArguments = null;
		line = line.trim();
		let parts = line.split(' ');
		command = parts[0];
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
		switch(this.state) {
			case 'PARSE_ADD_DESTINATION':
				self._parseAddDestination(line);
				this.state = 'PARSE';
				break;
			case 'PARSE_ADD_DOMAINS':
				self._parseAddDomains(line);
				this.state = 'PARSE';
				break;
			case 'PARSE_ADD_RULE':
				self._parseAddRule(line);
				this.state = 'PARSE';
				break;
			case 'PARSE_DELETE_DESTINATION':
				self._parseDeleteDestination(line);
				this.state = 'PARSE';
				break;
			case 'PARSE_DELETE_DOMAINS':
				self._parseDeleteDomains(line);
				this.state = 'PARSE';
				break;
			case 'PARSE_DELETE_RULE':
				self._parseDeleteRule(line);
				this.state = 'PARSE';
				break;
			case 'PARSE_ENABLE':
				switch(line) {
					case '1':
					case 'http':
						self._parseSetSecure('no');
						break;
					case '2':
					case 'https':
						self._parseSetSecure('yes');
						break;
					default:
						console.log('Unknown command.');
						console.log('Type help for a list of available commands.');									
						break;
				}
				this.state = 'PARSE';
				break;
			case 'PARSE_LIST':
				switch(line) {
					case '1':
					case 'domain':
					case 'domains':
						self._parseListDomains();
						break;
					case '2':
					case 'destination':
					case 'destinations':
						self._parseListDestinations();
						break;
					case '3':
					case 'rule':
					case 'rules':
					case 'regexp':
					case 'regexps':
					case 'route':
					case 'routes':
						self._parseListRules();
						break;
					default:
						console.log('Unknown command.');
						console.log('Type help for a list of available commands.');									
						break;
				}
				this.state = 'PARSE';
				break;
			case 'PARSE_LOGGING':
				self._parseLogging(line);
				this.state = 'PARSE';
				break;
			case 'PARSE_LOAD':
				self._parseLoad(line);
				this.state = 'PARSE';
				break;
			case 'PARSE_RESET':
				self._parseReset(line);
			    this.state = 'PARSE';
				break;
			case 'PARSE_SAVE':
				if(await this.exists(line)) {
					this.filePath = line;
					console.log('File exists. Do you want to overwrite (yes/no)?');
					this.state = 'PARSE_SAVE_CONFIRM';
				} else {
					self._parseSave(line);
					this.state = 'PARSE';
				}
				break;
			case 'PARSE_SAVE_CONFIRM':
				if(line === 'yes' || line === 'y' || line === 'true') {
					self._parseSave(this.filePath);
				} else {
					console.log('Cancelled.');
				}
				this.state = 'PARSE';
				break;
			case 'PARSE_SET_ADDRESS':
				self._parseSetAddress(line);
				this.state = 'PARSE';
				break;
			case 'PARSE_SET_CERTIFICATES_FOLDER':
				self._parseSetCertificatesFolder(line);
				this.state = 'PARSE';
				break;
			case 'PARSE_SET_OFFLINE_INTERVAL':
				self._parseSetOfflineInterval(line);
				this.state = 'PARSE';
				break;
			case 'PARSE_SET_PORT':
				self._parseSetPort(line);
				this.state = 'PARSE';
				break;
			case 'PARSE_SET_TIMEOUT':
				self._parseSetTimeout(line);
				this.state = 'PARSE';
				break;
			case 'PARSE_SET_SECURE':
				self._parseSetSecure(line);
				this.state = 'PARSE';
				break;
			default:
				switch(command) {
					case 'load':
					case 'import':
						if(commandArguments.length > 0) {
							self._parseLoad(commandArguments);
						} else {
							console.log('What is the filepath?');
							console.log('Type cancel, exit, quit or stop to cancel.');
							this.state = 'PARSE_LOAD';
						}
						break;
					case 'reset':
						if(self._hasUnsavedChanges) {
						    console.log('Are you sure (yes/no)?');
						    this.state = 'PARSE_RESET';
						} else {
							console.log('Nothing to reset. Cancelled.');
						}
						break;
					case 'save':
					case 'export':
						if(commandArguments.length > 0) {
							if(await this.exists(commandArguments)) {
								this.filePath = commandArguments;
								console.log('File exists. Do you want to overwrite (yes/no)?');
								this.state = 'PARSE_SAVE_CONFIRM';
							} else {
								self._parseSave(commandArguments);
							}
						} else {
							console.log('What is the filepath?');
							console.log('Type cancel, exit, quit or stop to cancel.');
							this.state = 'PARSE_SAVE';
						}
						break;
					case 'add':
						switch(subCommand) {
							case 'destination':
							case 'destinations':
							case 'server':
							case 'servers':
								if(subCommandArguments.length > 0) {
									self._parseAddDestination(subCommandArguments);
								} else {
									console.log('Please provide the destination (domain group address:port).');
									console.log('Type cancel, exit, quit or stop to cancel.');
									this.state = 'PARSE_ADD_DESTINATION';
								}
								break;
							case 'domain':
							case 'domains':
							case 'host':
							case 'hosts':
								if(subCommandArguments.length > 0) {
									self._parseAddDomains(subCommandArguments);
								} else {
									console.log('What is the domain name (use * for the default/catch-all domain)?');
									console.log('Type cancel, exit, quit or stop to cancel.');
									this.state = 'PARSE_ADD_DOMAINS';
								}
								break;
							case 'rule':
							case 'regexp':
							case 'route':
								if(subCommandArguments.length > 0) {
									self._parseAddRule(subCommandArguments);
								} else {
									console.log('What is the rule (domain regexp group)?');
									console.log('Type cancel, exit, quit or stop to cancel.');
									this.state = 'PARSE_ADD_RULE';
								}
								break;
							default:
								console.log('Unknown command.');
								console.log('Type help for a list of available commands.');									
								break;
						}
						break;
					case 'delete':
					case 'remove':
						switch(subCommand) {
							case 'destination':
							case 'destinations':
							case 'server':
							case 'servers':
								if(subCommandArguments.length > 0) {
									self._parseDeleteDestination(subCommandArguments);
								} else {
									console.log('Please provide the destination to delete (address:port).');
									console.log('Type cancel, exit, quit or stop to cancel.');
									this.state = 'PARSE_DELETE_DESTINATION';
								}
								break;
							case 'domain':
							case 'domains':
							case 'host':
							case 'hosts':
								if(subCommandArguments.length > 0) {
									self._parseDeleteDomains(subCommandArguments);
								} else {
									console.log('What is the domain name (use * for the default/catch-all domain)?');
									console.log('Type cancel, exit, quit or stop to cancel.');
									this.state = 'PARSE_DELETE_DOMAINS';
								}
								break;
							case 'rule':
							case 'regexp':
							case 'route':
								if(subCommandArguments.length > 0) {
									self._parseDeleteRule(subCommandArguments);
								} else {
									console.log('Please provide the rule to delete (domain regexp).');
									console.log('Type cancel, exit, quit or stop to cancel.');
									this.state = 'PARSE_DELETE_RULE';
								}
								break;
							default:
								console.log('Unknown command.');
								console.log('Type help for a list of available commands.');									
								break;
						}
						break;
					case 'enable':
						switch(subCommand) {
							case 'http':
								self._parseSetSecure('no');
								break;
							case 'https':
								self._parseSetSecure('yes');
								break;
							case '':
								console.log('Do you want to enable 1) http or 2) https?')
								this.state = 'PARSE_ENABLE';
								break;
							default:
								console.log('Unknown command.');
								console.log('Type help for a list of available commands.');									
								break;
						}
						break;
					case 'set':
						switch(subCommand) {
							case 'address':
							case 'ipaddress':
								if(subCommandArguments.length > 0) {
									self._parseSetAddress(subCommandArguments);
								} else {
									console.log('What address should be bind to?');
									console.log('Use 0.0.0.0 to bind to all ip addresses of the host.');
									console.log('Type cancel, exit, quit or stop to cancel.');
									this.state = 'PARSE_SET_ADDRESS';
								}
								break;
							case 'certificate':
							case 'certificatefolder':
							case 'certificates':
							case 'certificatesfolder':
								if(subCommandArguments.length > 0) {
									self._parseSetCertificatesFolder(subCommandArguments);
								} else {
									console.log('What is the certificates folder?');
									console.log('Type cancel, exit, quit or stop to cancel.');
									this.state = 'PARSE_SET_CERTIFICATES_FOLDER';
								}
								break;
							case 'destination':
							case 'destinations':
							case 'server':
							case 'servers':
								if(subCommandArguments.length > 0) {
									self._parseAddDestination(subCommandArguments);
								} else {
									console.log('Please provide the destination (domain group address:port).');
									console.log('Type cancel, exit, quit or stop to cancel.');
									this.state = 'PARSE_ADD_DESTINATION';
								}
								break;
							case 'domain':
							case 'domains':
							case 'host':
							case 'hosts':
								if(subCommandArguments.length > 0) {
									self._parseAddDomains(subCommandArguments);
								} else {
									console.log('What is the domain name (use * for the default/catch-all domain)?');
									console.log('Type cancel, exit, quit or stop to cancel.');
									this.state = 'PARSE_ADD_DOMAINS';
								}
								break;
							case 'http':
								self._parseSetSecure('no');
								break;
							case 'https':
								self._parseSetSecure('yes');
								break;
							case 'offlineinterval':
								if(subCommandArguments.length > 0) {
									self._parseSetOfflineInterval(subCommandArguments);
								} else {
									console.log('What should be the offline interval?');
									console.log('Type cancel, exit, quit or stop to cancel.');
									this.state = 'PARSE_SET_OFFLINE_INTERVAL';
								}								
								break;
							case 'port':
								if(subCommandArguments.length > 0) {
									self._parseSetPort(subCommandArguments);
								} else {
									console.log('Please specify the port.');
									console.log('Type cancel, exit, quit or stop to cancel.');
									this.state = 'PARSE_SET_PORT';
								}
								break;
							case 'secure':
							case 'encrypt':
							case 'encryption':
								if(subCommandArguments.length > 0) {
									self._parseSetSecure(subCommandArguments);
								} else {
									console.log('Type on or off to enable or disable https.');
									console.log('Type cancel, exit, quit or stop to cancel.');
									this.state = 'PARSE_SET_SECURE';
								}								
								break;
							case 'timeout':
								if(subCommandArguments.length > 0) {
									self._parseSetTimeout(subCommandArguments);
								} else {
									console.log('What should be the timeout?');
									console.log('Type cancel, exit, quit or stop to cancel.');
									this.state = 'PARSE_SET_TIMEOUT';
								}								
								break;
							default:
								console.log('Unknown command.');
								console.log('Type help for a list of available commands.');									
								break;
						}
						break;
					case 'certificate':
					case 'certificatefolder':
					case 'certificates':
					case 'certificatesfolder':
						if(commandArguments.length > 0) {
							self._parseSetCertificatesFolder(commandArguments);
						} else {
							console.log('What is the certificates folder?');
							console.log('Type cancel, exit, quit or stop to cancel.');
							this.state = 'PARSE_SET_CERTIFICATES_FOLDER';
						}
						break;
					case 'list':
						switch(subCommand) {
							case 'destination':
							case 'destinations':
							case 'server':
							case 'servers':
								self._parseListDestinations(subCommandArguments);
								break;
							case 'domain':
							case 'domains':
							case 'host':
							case 'hosts':
								self._parseListDomains();
								break;
							case '':
								console.log('Do you want to list 1) domains, 2) destinations or 3) rules?')
								this.state = 'PARSE_LIST';
								break;
							case 'rule':
							case 'rules':
							case 'regexp':
							case 'regexps':
							case 'route':
							case 'routes':
								self._parseListRules(subCommandArguments);
								break;
							default:
								console.log('Unknown command.');
								console.log('Type help for a list of available commands.');									
								break;
						}
						break;
					case 'destinations':
					case 'servers':
						self._parseListDestinations(commandArguments);
						break;
					case 'domains':
					case 'hosts':
						self._parseListDomains();
						break;
					case 'rules':
					case 'regexps':
					case 'routes':
						self._parseListRules(commandArguments);
						break;
					case 'port':
						if(commandArguments.length > 0) {
							self._parseSetPort(commandArguments);
						} else {
							console.log('Please specify the port.');
							console.log('Type cancel, exit, quit or stop to cancel.');
							this.state = 'PARSE_SET_PORT';
						}
						break;
					case 'start':
						self._parseStart();
						break;
					case 'stop':
						self._parseStop();
						break;
					case 'timeout':
						if(commandArguments.length > 0) {
							self._parseSetTimeout(commandArguments);
						} else {
							console.log('Please specify the timeout in milliseconds.');
							console.log('Type cancel, exit, quit or stop to cancel.');
							this.state = 'PARSE_SET_TIMEOUT';
						}
						break;
					case 'offlineinterval':
						if(commandArguments.length > 0) {
							self._parseOfflineInterval(commandArguments);
						} else {
							console.log('Please specify the offline interval in milliseconds.');
							console.log('Type cancel, exit, quit or stop to cancel.');
							this.state = 'PARSE_SET_OFFLINE_INTERVAL';
						}
						break;
					case 'http':
					case 'enablehttp':
					case 'sethttp':
						self._parseSetSecure('no');
						break;
					case 'https':
					case 'enablehttps':
					case 'sethttps':
						self._parseSetSecure('yes');
						break;
					case 'encrypt':
					case 'encryption':
					case 'secure':
					case 'security':
						if(commandArguments.length > 0) {
							self._parseSetSecure(commandArguments);
						} else {
							console.log('Type on or off to enable or disable https.');
							console.log('Type cancel, exit, quit or stop to cancel.');
							this.state = 'PARSE_SET_SECURE';
						}
						break;
					case 'config':
					case 'configuration':
					case 'prefs':
					case 'preferences':
					case 'settings':
					case 'status':
					case 'state':
						console.log('Address            : ' + this.httpReverseProxy.getAddress());
						console.log('Port               : ' + this.httpReverseProxy.getPort());
						console.log('Timeout            : ' + this.httpReverseProxy.getTimeout());
						console.log('Offline interval   : ' + this.httpReverseProxy.getOfflineInterval());
						console.log('Secure             : ' + this.httpReverseProxy.isSecure());
						if(this.httpReverseProxy.isSecure()) {
						console.log('Certificates folder: ' + this.httpReverseProxy.getCertificatesFolder());
						}
						console.log('State              : ' + this.httpReverseProxy.getState());
						let domains = this.httpReverseProxy.listDomains();
						for(let i=0;i < domains.length;i++) {
							let domain = domains[i];
							if(i === 0) {
						console.log('Domains (* default): ' + domain.name);
							} else {
						console.log('                     ' + domain.name);
							}
						}
						let destinations = this.httpReverseProxy.listDestinations();
						for(let i=0;i < destinations.length;i++) {
							let destination = destinations[i];
							if(i === 0) {
						console.log('Destinations       : ' + destination.domain + ' -> ' + destination.group + ' -> ' + destination.address + ':' + destination.port);									
							} else {
						console.log('                     ' + destination.domain + ' -> ' + destination.group + ' -> ' + destination.address + ':' + destination.port);									
							}
						}
						let rules = this.httpReverseProxy.listRules();
						for(let i=0;i < rules.length;i++) {
							let rule = rules[i];
							if(i === 0) {
						console.log('Rules              : ' + rule.domain + ' -> ' + rule.regexp + ' -> ' + rule.group);									
							} else {
						console.log('                     ' + rule.domain + ' -> ' + rule.regexp + ' -> ' + rule.group);									
							}
						}
						break;
					case 'exit':
					case 'quit':
						self._parseExit();
						break;
					case 'log':
					case 'logger':
					case 'logging':
					case 'loglevel':
						if(commandArguments.length > 0) {
							self._parseLogging(commandArguments);
						} else {
							console.log('What should the log level be?');
							console.log('Type trace,debug,info,warning,error,fatal or off.');
							console.log('Type cancel, exit, quit or stop to cancel.');
							this.state = 'PARSE_LOGGING';
						}
						break;
					case 'address':
					case 'ipaddress':
						if(commandArguments.length > 0) {
							self._parseSetAddress(commandArguments);
						} else {
							console.log('What address should be bind to?');
							console.log('Use 0.0.0.0 to bind to all ip addresses of the host.');
							console.log('Type cancel, exit, quit or stop to cancel.');
							this.state = 'PARSE_SET_ADDRESS';
						}
						break;
					case 'help':
					case 'info':
					case 'information':
					case 'faq':
						self._parseHelp();
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

	_parseSetAddress(line) {
		let lineLowerCase = line.toLowerCase();
		if(lineLowerCase === 'cancel'  || lineLowerCase === 'exit' ||
		   lineLowerCase === 'quit'    || lineLowerCase === 'stop') {
		   	console.log('Cancelled.');
			this._rl.prompt();
			return;
		}
		try {
			this.httpReverseProxy.setAddress(line);
			this._hasUnsavedChanges = true;
			console.log('Address set to \'' + this.httpReverseProxy.getAddress() + '\'.');
		} catch(_exception) {
				if(_exception.code === HTTPError.ILLEGAL_STATE.code) {
					console.log('Unable to update the address, because the HTTPReverseProxy is running.')
					console.log('Make sure to first stop the HTTPReverseProxy before updating the address.');
				} else {
					console.log('Error: ' + _exception.toString());
				}
		}
		this._rl.prompt();
	}

	_parseAddDestination(line) {
		let lineLowerCase = line.trim().toLowerCase();
		if(lineLowerCase.length <= 0) {
			console.log('Empty destination. Ignored.');
			this._rl.prompt();
			return;
		}
		if(lineLowerCase === 'cancel'  || lineLowerCase === 'exit' ||
		   lineLowerCase === 'quit'    || lineLowerCase === 'stop') {
		   	console.log('Cancelled.');
			this._rl.prompt();
			return;
		}
		// address:port
		// http://address:port
		// https://address:port
		// domain address:port
		// domain http://address:port
		// domain https://address:port
		// domain group address:port
		// domain group http://address:port
		// domain group https://address:port
		let secure = false;
		let indexOfHTTP = lineLowerCase.indexOf('http://');
		let indexOfHTTPS = lineLowerCase.indexOf('https://');
		if(indexOfHTTP >= 0) {
			secure = false;
			line = line.substring(0, indexOfHTTP) + line.substring(indexOfHTTP + 7);
		} else if(indexOfHTTPS >= 0) {
			secure = true;
			line = line.substring(0, indexOfHTTPS) + line.substring(indexOfHTTPS + 8);
		}
		let parts = line.split(' ');
		let domain = null;
		let group = null;
		let address = null;
		let port = null;
		let indexOfColon = line.indexOf(':');
		if(indexOfColon > 0) {
			if(parts.length >= 3) {
				domain = parts[0];
				group = parts[1];
				address = parts[2];
				parts = address.split(':');
				address = parts[0];
				port = parts[1];
			} else if(parts.length === 2) {
				domain = parts[0];
				group = '*';
				address = parts[1];
				parts = address.split(':');
				address = parts[0];
				port = parts[1];
			} else {
				domain = '*';
				group = '*';
				address = parts[0];
				parts = address.split(':');
				address = parts[0];
				port = parts[1];
			}
		} else {
			// address port
			// domain address port
			// domain group address port
			if(parts.length >= 4) {
				domain = parts[0];
				group = parts[1];
				address = parts[2];
				port = parts[3];
			} else if(parts.length === 3) {
				domain = parts[0];
				group = '*';
				address = parts[1];
				port = parts[2];
			} else if(parts.length === 2) {
				domain = '*';
				group = '*';
				address = parts[0];
				port = parts[1];
			}
		}
		port = parseInt(port, 10);
		if(isNaN(port)) {
			console.log('The supplied port is not a number. Ignored.');
			this._rl.prompt();
			return;
		}
		try {
			if(secure) {
				this.httpReverseProxy.addHTTPSServer(domain, group, address, port);
				console.log('Destination \'' + domain + ' (domain) -> ' + group + ' (group) -> https://' + address + ':' + port + ' (address:port)\' added.');
			} else {
				this.httpReverseProxy.addHTTPServer(domain, group, address, port);
				console.log('Destination \'' + domain + ' (domain) -> ' + group + ' (group) -> http://' + address + ':' + port + ' (address:port)\' added.');
			}
			if(group != '*') {
				console.log('Do NOT forget to add a rule/regexp/route to this group.');
			}
		} catch(_exception) {
			console.log(_exception.toString());
		}
		this._rl.prompt();
	}

	_parseAddDomains(domainNames) {
		let parts = domainNames.split(/[ ,]+/);
		for(let i=0;i < parts.length;i++) {
			let domainName = parts[i].trim();
			if(domainName.length <= 0) {
				continue;
			}
			try {
				this.httpReverseProxy.addHTTPReverseProxyDomain(domainName);
				console.log('Domain \'' + domainName + '\' added.');
			} catch(_exception) {
				if(_exception.code === HTTPError.CONFLICT.code) {
					console.log('Domain \'' + domainName + '\' already exists. Not added.');
				} else {
					console.log(_exception.toString());
				}
			}
		}
		this._rl.prompt();
	}

	_parseAddRule(line) {
		let parts = line.split(' ');
		let domain = null;
		let regexp = null;
		let group = null;
		if(parts.length >= 3) {
			domain = parts[0];
			regexp = parts[1];
			group = parts[2];
		} else if(parts.length === 2) {
			domain = '*';
			regexp = parts[0];
			group = parts[1];
		}
		try {
			this.httpReverseProxy.addRule(domain, regexp, group);
			console.log('Rule \'' + domain + ' -> ' + regexp + ' -> ' + group + '\' added.');
		} catch(_exception) {
			if(HTTPError.FILE_NOT_FOUND.equals(_exception)) {
				console.log('Unable to add rule to unknown domain \'' + domain + '\'.');
			} else {
				console.log(_exception.toString());
			}
		}
		this._rl.prompt();
	}

	_parseSetCertificatesFolder(line) {
		let lineLowerCase = line.toLowerCase();
		if(lineLowerCase === 'cancel'  || lineLowerCase === 'exit' ||
		   lineLowerCase === 'quit'    || lineLowerCase === 'stop') {
		   	console.log('Cancelled.');
			this._rl.prompt();
			return;
		}
		try {
			this.httpReverseProxy.setCertificatesFolder(line);
			this._hasUnsavedChanges = true;
			console.log('Certificates folder set to \'' + this.httpReverseProxy.getCertificatesFolder() + '\'.');
			this._rl.prompt();
		} catch(_exception) {
			if(_exception.code === HTTPError.ILLEGAL_STATE.code) {
				console.log('Unable to update the certificates folder, because the HTTPReverseProxy is running.')
				console.log('Make sure to first stop the HTTPReverseProxy before updating the certificates folder.');
			} else {
				console.log('Error: ' + _exception.toString());
			}
		}
	}

	_parseDeleteDestination(line) {
		let lineLowerCase = line.trim().toLowerCase();
		if(lineLowerCase.length <= 0) {
			console.log('Empty destination. Ignored.');
			this._rl.prompt();
			return;
		}
		if(lineLowerCase === 'cancel'  || lineLowerCase === 'exit' ||
		   lineLowerCase === 'quit'    || lineLowerCase === 'stop') {
		   	console.log('Cancelled.');
			this._rl.prompt();
			return;
		}
		let parts = line.split(' ');
		let domain = null;
		let group = null;
		let address = null;
		let port = null;
		let indexOfColon = line.indexOf(':');
		if(indexOfColon > 0) {
			// address:port
			// domain address:port
			// domain group address:port
			if(parts.length >= 3) {
				domain = parts[0];
				group = parts[1];
				address = parts[2];
				parts = address.split(':');
				address = parts[0];
				port = parts[1];
			} else if(parts.length === 2) {
				domain = parts[0];
				address = parts[1];
				parts = address.split(':');
				address = parts[0];
				port = parts[1];
			} else {
				address = parts[0];
				parts = address.split(':');
				address = parts[0];
				port = parts[1];
			}
		} else {
			// address port
			// domain address port
			// domain group address port
			if(parts.length >= 4) {
				domain = parts[0];
				group = parts[1];
				address = parts[2];
				port = parts[3];
			} else if(parts.length === 3) {
				domain = parts[0];
				address = parts[1];
				port = parts[2];
			} else if(parts.length === 2) {
				address = parts[0];
				port = parts[1];
			}
		}
		port = parseInt(port, 10);
		if(isNaN(port)) {
			console.log('The supplied port is not a number. Ignored.');
			this._rl.prompt();
			return;
		}
		let result = this.httpReverseProxy.deleteHTTPServer(domain, group, address, port);
		if(result) {
			console.log('Destination \'' + address + ':' + port + '\' deleted.');
		} else {
			console.log('Unable to delete unknown destination \'' + address + ':' + port + '\'.');
		}
		this._rl.prompt();
	}

	_parseDeleteDomains(line) {
		let lineLowerCase = line.toLowerCase();
		if(lineLowerCase === 'cancel'  || lineLowerCase === 'exit' ||
		   lineLowerCase === 'quit'    || lineLowerCase === 'stop') {
		   	console.log('Cancelled.');
			this._rl.prompt();
			return;
		}
		let parts = line.split(/[ ,]+/);
		for(let i=0;i < parts.length;i++) {
			let domainName = parts[i].trim();
			if(domainName.length <= 0) {
				continue;
			}
			let result = this.httpReverseProxy.deleteHTTPReverseProxyDomain(domainName);
			if(result) {
				console.log('Domain \'' + domainName + '\' deleted.');
			} else {
				console.log('Unable to delete unknown domain \'' + domainName + '\'.');
			}
		}
		this._rl.prompt();
	}

	_parseDeleteRule(line) {
		let lineLowerCase = line.trim().toLowerCase();
		if(lineLowerCase.length <= 0) {
			console.log('Empty rule. Ignored.');
			this._rl.prompt();
			return;
		}
		if(lineLowerCase === 'cancel'  || lineLowerCase === 'exit' ||
		   lineLowerCase === 'quit'    || lineLowerCase === 'stop') {
		   	console.log('Cancelled.');
			this._rl.prompt();
			return;
		}
		let parts = line.split(' ');
		let domain = null;
		let regexp = null;
		if(parts.length >= 2) {
			domain = parts[0];
			regexp = parts[1];
		} else if(parts.length === 1) {
			domain = '*';
			regexp = parts[0];
		}
		let result = this.httpReverseProxy.deleteRule(domain, regexp);
		if(result) {
			console.log('Rule \'' + domain + ' -> ' + regexp + '\' deleted.');
		} else {
			console.log('Unable to delete unknown rule \'' + domain + ' -> ' + regexp + '\'.');
		}
		this._rl.prompt();
	}

	_parseListDestinations(line) {
		let destinations = this.httpReverseProxy.listDestinations();
		if(destinations.length <= 0) {
			console.log('No destinations defined.');
			this._rl.prompt();
			return;
		}
		console.log('Current defined destinations:');
		for(let i=0;i < destinations.length;i++) {
			let destination = destinations[i];
			console.log(destination.domain + ' -> ' + destination.group + ' -> ' + destination.address + ':' + destination.port);
		}
		this._rl.prompt();
	}

	_parseListDomains(line) {
		let domains = this.httpReverseProxy.listDomains();
		if(domains.length <= 0) {
			console.log('No domains defined.');
			this._rl.prompt();
			return;
		}
		console.log('Current defined domains (* is the default/catch-all domain):');
		for(let i=0;i < domains.length;i++) {
			let domain = domains[i];
			console.log(domain.name);
		}
		this._rl.prompt();
	}

	_parseListRules(line) {
		let rules = this.httpReverseProxy.listRules();
		if(rules.length <= 0) {
			console.log('No rules defined.');
			this._rl.prompt();
			return;
		}
		console.log('Current defined rules:');
		for(let i=0;i < rules.length;i++) {
			let rule = rules[i];
			console.log(rule.domain + ' -> ' + rule.regexp + ' -> ' + rule.group);
		}
		this._rl.prompt();
	}

	_parseSetSecure(line) {
		let lineLowerCase = line.toLowerCase();
		if(lineLowerCase === 'cancel'  || lineLowerCase === 'exit' ||
		   lineLowerCase === 'quit'    || lineLowerCase === 'stop') {
		   	console.log('Cancelled.');
			this._rl.prompt();
			return;
		}
		try {
			this.httpReverseProxy.setSecure(line);
			this._hasUnsavedChanges = true;
			console.log('Secure is set to ' + this.httpReverseProxy.isSecure() + '.');
			if(this.httpReverseProxy.isSecure()) {
				console.log('The current certificates folder is \'' + this.httpReverseProxy.getCertificatesFolder() + '\'.');
			}
		} catch(_exception) {
			if(_exception.code === HTTPError.ILLEGAL_ARGUMENT.code) {
				console.log('Illegal argument.');
			} else if(_exception.code === HTTPError.ILLEGAL_STATE.code) {
				console.log('Unable to update the security setting, because the HTTPReverseProxy is running.')
				console.log('Make sure to first stop the HTTPReverseProxy before updating the security setting.');
			} else {
				console.log('Error: ' + _exception.toString());
			}
		}
		this._rl.prompt();
	}

	_parseExit() {
		if(this._hasUnsavedChanges) {
			this._rl.question('DXP3-HTTP> There are unsaved changes. Are you sure you want to exit?', (answer) => {
				if (answer.match(/^y(es)?$/i)) {
					this._exit();
					return;
				}
				console.log('Cancelled.');
				this._rl.prompt();
			});
		} else {
			this._exit();
		}
	}

	_exit() {
		this.httpReverseProxy.once(HTTPReverseProxyEvent.STOPPED, function(err) {
			console.log('Goodbye...');
			process.exit();
		});
		if(this.httpReverseProxy.isStopped()) {
			console.log('Goodbye...');
			process.exit();
		} else if(this.httpReverseProxy.isInitialized()) {
			console.log('Goodbye...');
			process.exit();
		} else {
			this.httpReverseProxy.stop();
		}
	}

	_parseHelp() {
		// Clear the scroll buffer.
		process.stdout.write('\u001b[3J\u001b[1J');
		// Clear the window.
		console.clear();
		console.log('');
		console.log('CONFIGURATION / PREFERENCES: Commands to control the HTTPReverseProxy.');
		console.log('');
		console.log('COMMAND ------------------------+ ALIASES -------------+ DESCRIPTION -----------------------------------+');
		console.log('add destination     [domain]    + add server,          + A HTTPReverseProxy forwards requests to        |');
		console.log('                    [group]     | set destination,     | different destinations based on the domain     |');
		console.log('                    <address>   | set server           | and if the request matches a predefined        |');
		console.log('                    <port>      |                      | rule/regular expression for a group of servers.|');
		console.log('                                |                      | The domain and group are optional. When        |');
		console.log('                                |                      | omitted the destination will be added to the   |');
		console.log('                                |                      | catch all * domain and catch all * group.      |');
		console.log('add domain          <name>      + add host,            + A HTTPReverseProxy may serve multiple          |');
		console.log('                                | set domain,          | domains. Each domain has its own destinations. |');
		console.log('                                | set host             | To specify a default/catch-all domain use * as |');
		console.log('                                |                      | the domain name.                               |');
		console.log('add rule            <domain>    + add regexp,          + When a destination has destination(s)          |');
		console.log('                    <regexp>    | add route,           | identified by a group, you need to define      |');
		console.log('                    <group>     | set regexp,          | a rule to route traffic to that group.         |');
		console.log('                                | set route,           | Example: add rule www.example.com /api/* apis  |');
		console.log('                                | set rule             |                                                |');
		console.log('delete destination  [domain]    + delete server,       + Delete a destination from a specific domain    |');
		console.log('                    [group]     | remove destination,  | or from all domains.                           |');
		console.log('                    <address>   | remove server        |                                                |');
		console.log('                    <port>      |                      |                                                |');
		console.log('delete domain       <name>      + delete host,         + Delete a domain.                               |');
		console.log('                                | remove domain,       | To remove the default/catch-all domain use *   |');
		console.log('                                | remove host          | as the domain name.                            |');
		console.log('delete rule         <domain>    + delete regexp,       + Delete a rule.                                 |');
		console.log('                    <group>     | delete route,        |                                                |');
		console.log('                    <regexp>    | remove rule,         |                                                |');
		console.log('                                | remove regexp,       |                                                |');
		console.log('                                | remove route         |                                                |');
		console.log('list destinations               + destinations,        + List all destinations.                         |');
		console.log('                                | servers              |                                                |');
		console.log('list domains                    + domains,             + List all domains.                              |');
		console.log('                                | hosts                |                                                |');
		console.log('list rules                      + regexps,             + List all rules.                                |');
		console.log('                                | routes,              |                                                |');
		console.log('                                | rules                |                                                |');
		console.log('set address         <ip>        + address,             + Set the HTTP address to bind to.               |');
		console.log('                                | ipaddress            | By default this is set to 0.0.0.0 to bind      |');
		console.log('                                |                      | to all ip addresses of the host.               |');
		console.log('                                |                      | The HTTPReverseProxy must be stopped first     |');
		console.log('                                |                      | before the address can be updated.             |');
		console.log('set certicates      <folder>    + certificate,         + Set the certificates folder.                   |');
		console.log('                                | certificatefolder,   | The HTTPReverseProxy must be stopped first     |');
		console.log('                                | certificates,        | before the certificates folder can be updated. |');
		console.log('                                | certificatesfolder   |                                                |');
		console.log('set http                        + enable http,         + Shortcut for -set secure false.                |');
		console.log('                                | http                 |                                                |');
		console.log('set https                       + enable https,        + Shortcut for -set secure true.                 |');
		console.log('                                | https                | Ensure the certificates folder is correct.     |');
		console.log('set offlineinterval <number>    | offlineinterval      |                                                |');
		console.log('set port            <number>    + port                 + Set the HTTP port to bind to.                  |');
		console.log('                                |                      | The HTTPReverseProxy must be stopped first     |');
		console.log('                                |                      | before the port can be updated.                |');
		console.log('set secure          <boolean>   + encrypt, encryption, + Turn https on or off.                          |');
		console.log('                                | secure,              | If secure is set to true you should ensure     |');
		console.log('                                | security,            | the certificates folder is correct.            |');
		console.log('                                | set encrypt,         | The HTTPReverseProxy must be stopped first     |');
		console.log('                                | set encryption       | before the security settings can be updated.   |');
		console.log('set timeout         <number>    + timeout              + Set the connection timeout.                    |');
		console.log('status                          + config,              + Get the current state of the HTTP Reverse      |');
		console.log('                                | configuration        | Proxy.                                         |');
		console.log('                                | prefs, preferences   |                                                |');
		console.log('                                | settings,state       |                                                |');
		console.log('--------------------------------+----------------------+------------------------------------------------+');
		console.log('');
		console.log('PROCESS FLOW: Commands to start and stop the HTTPReverseProxy.');
		console.log('');
		console.log('COMMAND ------------------------+ ALIASES -------------+ DESCRIPTION -----------------------------------+');
		console.log('start                           +                      + Start the HTTPReverseProxy.                    |');
		console.log('stop                            +                      + Stop the HTTPReverseProxy.                     |');
		console.log('--------------------------------+----------------------+------------------------------------------------+');
		console.log('');
		console.log('PROGRAM FLOW: Commands to control this command line interface program.');
		console.log('');
		console.log('COMMAND ------------------------+ ALIASES -------------+ DESCRIPTION -----------------------------------+');
		console.log('exit                            + quit                 + Exit this program.                             |');
		console.log('help                            + faq, info,           + Show this help screen.                         |');
		console.log('                                | information          |                                                |');
		console.log('loglevel            <level>     + log, logger, logging + Set the log level.                             |');
		console.log('                                |                      | One of trace, debug, info, warning, error,     |');
		console.log('                                |                      | fatal or off.                                  |');
		console.log('--------------------------------+----------------------+------------------------------------------------+');
		console.log('');
	}

	async _parseLoad(line) {
		console.log('parse load');
		let lineLowerCase = line.toLowerCase();
		if(lineLowerCase === 'cancel'  || lineLowerCase === 'exit' ||
		   lineLowerCase === 'quit'    || lineLowerCase === 'stop') {
		   	console.log('Cancelled.');
			this._rl.prompt();
			return;
		}
		if(!this.httpReverseProxy.isInitialized() &&
		   !this.httpReverseProxy.isStopped()) {
			console.log('Make sure the HTTPReverseProxy is not running. Cancelled.');
			this._rl.prompt();
			return;
		}
		if(this._hasUnsavedChanges) {
			this._rl.question('DXP3-HTTP> There are unsaved changes. Are you sure you want to overwrite?', (answer) => {
				if (answer.match(/^y(es)?$/i)) {
					this._load(line);
				} else {
					console.log('Cancelled.');
					this._rl.prompt();
				}
			});
		} else {
			this._load(line);
		}
	}

	async _load(line) {
		this.httpReverseProxy.clearHTTPReverseProxyDomains();
		try {
			let persistAsString = await fs.promises.readFile(line, 'utf8');
			let persist = JSON.parse(persistAsString);
			this.httpReverseProxy.setOfflineInterval(persist.offlineInterval);
			this.httpReverseProxy.setPort(persist.port);
			this.httpReverseProxy.setAddress(persist.address);
			this.httpReverseProxy.setSecure(persist.secure);
			this.httpReverseProxy.setCertificatesFolder(persist.certificatesFolder);
			for(let i=0;i < persist.domains.length;i++) {
				let domain = persist.domains[i];
				let domainName = domain.name;
				this.httpReverseProxy.addHTTPReverseProxyDomain(domainName);
			}
			for(let i=0;i < persist.destinations.length;i++) {
				let destination = persist.destinations[i];
				this.httpReverseProxy.addHTTPServer(destination.domain, destination.group, destination.address, destination.port, destination.secure);
			}
			for(let i=0;i < persist.rules.length;i++) {
				let rule = persist.rules[i];
				this.httpReverseProxy.addRule(rule.domain, rule.regexp, rule.group);
			}			
			this.originalAddress = this.httpReverseProxy.getAddress();
			this.originalPort = this.httpReverseProxy.getPort();
			this.originalSecure = this.httpReverseProxy.isSecure();
			this.originalCertificatesFolder = this.httpReverseProxy.getCertificatesFolder();
			this.originalDomains = this.httpReverseProxy.listDomains();
			this._hasUnsavedChanges = false;
		} catch(_error) {
			if(_error.code === 'ENOENT') {
    			console.log('File not found. Cancelled.');
			} else {
				console.log('Something went wrong during load. Cancelled.');
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

	async exists(path) {
		try {
			await fs.promises.access(path, fs.constants.F_OK);
			return true;
		} catch(_error) {
			return false;
		}
	}

	_parseReset(line) {
		line = line.toLowerCase();
	    if(line === 'yes' || line === 'y' || line === 'true') {
			this.httpReverseProxy.setPort(this.originalPort);
			this.httpReverseProxy.setAddress(this.originalAddress);
			this.httpReverseProxy.setSecure(this.originalSecure);
			this.httpReverseProxy.setCertificatesFolder(this.originalCertificatesFolder);
			this.httpReverseProxy.clearHTTPServerDomains();
			for(let i=0;i < this.originalDomains.length;i++) {
				let domain = this.originalDomains[i];
				let domainName = domain.name;
				let domainFolder = domain.root;
				this.httpReverseProxy.addHTTPServerDomain(domainName, domainFolder);
			}
	    	console.log('Reset.');
			this._hasUnsavedChanges = false;
			this._parseStatus();
	    } else {
	    	console.log('Cancelled.');
			this._rl.prompt();
	    }
	}

	_parseSetTimeout(line) {
		let lineLowerCase = line.toLowerCase();
		if(lineLowerCase === 'cancel'  || lineLowerCase === 'exit' ||
		   lineLowerCase === 'quit'    || lineLowerCase === 'stop') {
		   	console.log('Cancelled.');
			this._rl.prompt();
			return;
		}
		try {
			this.httpReverseProxy.setTimeout(line);
			console.log('Timeout set to ' + this.httpReverseProxy.getTimeout());
		} catch(_exception) {
			if(_exception.code === HTTPError.ILLEGAL_ARGUMENT.code) {
				console.log('The supplied timeout is not a number. Unable to update the HTTPReverseProxy timeout.')
			} else {
				console.log('Error: ' + _exception.toString());
			}
		}
		this._rl.prompt();
	}

	_parseSetOfflineInterval(line) {
		let lineLowerCase = line.toLowerCase();
		if(lineLowerCase === 'cancel'  || lineLowerCase === 'exit' ||
		   lineLowerCase === 'quit'    || lineLowerCase === 'stop') {
		   	console.log('Cancelled.');
			this._rl.prompt();
			return;
		}
		try {
			this.httpReverseProxy.setOfflineInterval(line);
			console.log('Offline interval set to ' + this.httpReverseProxy.getOfflineInterval());
		} catch(_exception) {
			if(_exception.code === HTTPError.ILLEGAL_ARGUMENT.code) {
				console.log('The supplied offline interval is not a number. Unable to update the HTTPReverseProxy offline interval.')
			} else {
				console.log('Error: ' + _exception.toString());
			}
		}
		this._rl.prompt();
	}

	async _parseSave(line) {
		let lineLowerCase = line.trim().toLowerCase();
		if(lineLowerCase === 'cancel'  || lineLowerCase === 'exit' ||
		   lineLowerCase === 'quit'    || lineLowerCase === 'stop' || lineLowerCase === '') {
		   	console.log('Cancelled.');
			this._rl.prompt();
			return;
		}
		let persist = {};
		persist.address = this.httpReverseProxy.getAddress();
		persist.offlineInterval = this.httpReverseProxy.getOfflineInterval();
		persist.port = this.httpReverseProxy.getPort();
		persist.secure = this.httpReverseProxy.isSecure();
		persist.certificatesFolder = this.httpReverseProxy.getCertificatesFolder();
		persist.domains = [];
		let domains = this.httpReverseProxy.listDomains();
		for(let i=0;i < domains.length;i++) {
			persist.domains.push(domains[i]);
		}
		persist.destinations = [];
		let destinations = this.httpReverseProxy.listDestinations();
		for(let i=0;i < destinations.length;i++) {
			persist.destinations.push(destinations[i]);
		}
		persist.rules = [];
		let rules = this.httpReverseProxy.listRules();
		for(let i=0;i < rules.length;i++) {
			let rule = rules[i];
			persist.rules.push(rule);
		}
		try {
			let persistAsString = JSON.stringify(persist);
			await fs.promises.writeFile(line, persistAsString, 'utf8');
			console.log('Configuration saved to \'' + line + '\'.');
			this._hasUnsavedChanges = false;
		} catch(_error) {
			if(_error) {
				console.log('Something went wrong during save:' + _error);
			}
		}
		this._rl.prompt();
	}

	_parseSetPort(line) {
		let lineLowerCase = line.toLowerCase();
		if(lineLowerCase === 'cancel'  || lineLowerCase === 'exit' ||
		   lineLowerCase === 'quit'    || lineLowerCase === 'stop') {
		   	console.log('Cancelled.');
			this._rl.prompt();
			return;
		}
		try {
			this.httpReverseProxy.setPort(line);
			this._hasUnsavedChanges = true;
			console.log('Port set to ' + this.httpReverseProxy.getPort());
		} catch(_exception) {
			if(_exception.code === HTTPError.ILLEGAL_ARGUMENT.code) {
				console.log('The supplied port is not a number. Unable to update the HTTP port.')
			} else if(_exception.code === HTTPError.ILLEGAL_STATE.code) {
				console.log('Unable to update the port, because the HTTPReverseProxy is running.')
				console.log('Make sure to first stop the HTTPReverseProxy before updating the port.');
			} else {
				console.log('Error: ' + _exception.toString());
			}
		}
		this._rl.prompt();
	}

	_parseStart() {
		if(this.httpReverseProxy.isRunning()) {
			console.log('The HTTPReverseProxy is already running.');
			this._rl.prompt();
			return;
		}
		if(this.httpReverseProxy.isStarting()) {
			console.log('The HTTPReverseProxy is already starting.');
			this._rl.prompt();
			return;
		}
		try {
			this.httpReverseProxy.start();
		} catch(_exception) {
			// Two types of exception:
			// 1) Illegal state: attempting to start a proxy that is in the middle of stopping
			// 2) File not found: if this is a secure proxy and the certificates folder is not found
			if(HTTPError.ILLEGAL_STATE.equals(_exception)) {
				console.log('Unable to start a HTTPReverseProxy that is in the middle of stopping.');
				console.log('Try again after the HTTPReverseProxy has stopped.');
			} else if(HTTPError.FILE_NOT_FOUND.equals(_exception)) {
				console.log('Secure is set to true, but the certificates folder \'' + this.httpReverseProxy.getCertificatesFolder() + '\' can not be found/read.');
				console.log('Either set secure to false or update the certificates folder.');
			} else {
				console.log(_exception);
			}
			console.log('HTTPReverseProxy has NOT been started.');
		}
		this._rl.prompt();
	}

	_parseStop() {
		if(this.httpReverseProxy.isStopped()) {
			console.log('The HTTPReverseProxy is already stopped.');
			this._rl.prompt();
			return;
		}
		if(this.httpReverseProxy.isStopping()) {
			console.log('The HTTPReverseProxy is already stopping.');
			this._rl.prompt();
			return;
		}
		try {
			this.httpReverseProxy.stop();
		} catch(_exception) {
			console.log(_exception);
		}
	}

	static main() {
		try {
			let httpReverseProxyOptions = HTTPReverseProxyOptions.parseCommandLine();
			logging.setLevel(httpReverseProxyOptions.logLevel);
			if(httpReverseProxyOptions.help) {
				Help.print(this);
				return;
			}
			let httpReverseProxy = new HTTPReverseProxy(httpReverseProxyOptions);
			let httpReverseProxyCLI = new HTTPReverseProxyCLI(httpReverseProxy);
			httpReverseProxyCLI.start();
		} catch(_exception) {
			console.log('EXCEPTION:'  + _exception);
		}
	}
}
// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
	HTTPReverseProxyCLI.main();
	return;
}

module.exports = HTTPReverseProxyCLI;