/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-net-http
 *
 * NAME
 * HTTPServerCLI
 */
const packageName = 'dxp3-net-http';
const moduleName = 'HTTPServerCLI';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * @module dxp3-net-http/HTTPServerCLI
 */
const cleanup = require('dxp3-cleanup');
const fs = require('fs');
const HTTPError = require('./HTTPError');
const HTTPServer = require('./HTTPServer');
const HTTPServerEvent = require('./HTTPServerEvent');
const HTTPServerOptions = require('./HTTPServerOptions');
const logging = require('dxp3-logging');
const readline = require('readline');
const util = require('dxp3-util');
/**
 * A HTTPServer command line interface program.
 */
class HTTPServerCLI {
    /*********************************************
     * CONSTRUCTOR
     ********************************************/

    /**
	 * @param {module:dxp3-net-http/HTTPServer} _httpServer
     */
	constructor(_httpServer) {
		this.httpServer = _httpServer;
		this._rl = null;
		this.state = 'PARSE';
		this.filePath = null;
		this.domainName = null;
		this.domainFolder = null;
		this._hasUnsavedChanges = false;

		this.originalAddress = this.httpServer.getAddress();
		this.originalPort = this.httpServer.getPort();
		this.originalSecure = this.httpServer.isSecure();
		this.originalCertificatesFolder = this.httpServer.getCertificatesFolder();
		this.originalDomains = this.httpServer.listDomains();
		this.originalDomains = this.httpServer.listDomains();
	}

    /*********************************************
     * PUBLIC METHODS
     ********************************************/

	start() {
		this._rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout,
			prompt: 'DXP3-HTTP-SERVER>'
		});
		this._rl.on('SIGINT', () => {
			this._parseExit();
		});
		this.httpServer.on(HTTPServerEvent.RUNNING, (_error) => {
			console.log('Running...');
			this._rl.prompt();
		});
		this.httpServer.on(HTTPServerEvent.STARTING, (_error) => {
			console.log('Starting...');
			this._rl.prompt();
		});
		this.httpServer.on(HTTPServerEvent.STOPPED, (_error) => {
			console.log('Stopped.');
			this._rl.prompt();
		});
		this.httpServer.on(HTTPServerEvent.STOPPING, (_error) => {
			console.log('Stopping...');
			this._rl.prompt();
		});
		this.httpServer.on(HTTPServerEvent.ERROR, (_error) => {
			console.log('Error: ' + _error.toString());
			this._rl.prompt();
		});
		console.clear();
		console.log('');
		console.log('Use this interface to control a HTTPServer.');
		console.log('The HTTPServer has not yet been started, but it has been');
		console.log('initialized with default values. Note though that one');
		console.log('still needs to set the root folder of the default (*) and/or');
		console.log('other domains.');
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
		let command = null;
		let commandArguments = null;
		let subCommand = null;
		let subCommandArguments = null;
		let lineLowerCase = null;
		line = line.trim();
		if(line.length <= 0) {
			this._rl.prompt();
			return;
		}
		lineLowerCase = line.toLowerCase();
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
			case 'PARSE_DELETE_DOMAIN':
				if(lineLowerCase === 'cancel'  || lineLowerCase === 'exit' ||
				   lineLowerCase === 'quit'    || lineLowerCase === 'stop') {
				   	this.domainName = null;
				   	console.log('Cancelled.');
					this._rl.prompt();						
					this.state = 'PARSE';
				} else {
					this.domainName = line;
					console.log('About to delete domain \'' + this.domainName + '\'. Are you sure (yes/no)?');
					this.state = 'PARSE_DELETE_DOMAIN_CONFIRM';
				}
				break;
			case 'PARSE_DELETE_DOMAIN_CONFIRM':
				if(line === 'yes' || line === 'y' || line === 'true') {
					self._parseDeleteDomain(this.domainName);
				} else {
					console.log('Cancelled.');
				}
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
			case 'PARSE_SET_PORT':
				self._parseSetPort(line);
				this.state = 'PARSE';
				break;
			case 'PARSE_SET_SECURE':
				self._parseSetSecure(line);
				this.state = 'PARSE';
				break;
			case 'PARSE_DOMAIN_NAME':
				if(lineLowerCase === 'cancel'  || lineLowerCase === 'exit' ||
				   lineLowerCase === 'quit'    || lineLowerCase === 'stop') {
				   	this.domainName = null;
				    this.domainFolder = null;
				   	console.log('Cancelled.');
					this._rl.prompt();						
					this.state = 'PARSE';
				} else {
					this.domainName = line;
					console.log('What is the root folder of this domain?');
					console.log('Type cancel, exit, quit or stop to cancel.');
					this.state = 'PARSE_DOMAIN_FOLDER';
				}
				break;
			case 'PARSE_DOMAIN_FOLDER':
				if(lineLowerCase === 'cancel'  || lineLowerCase === 'exit' ||
				   lineLowerCase === 'quit'    || lineLowerCase === 'stop') {
				   	this.domainName = null;
				    this.domainFolder = null;
				   	console.log('Cancelled.');
					this._rl.prompt();						
				} else {
					this.domainFolder = line;
					self._parseAddDomain(this.domainName, this.domainFolder);
				}
				this.state = 'PARSE';
				break;
			default:
				switch(command) {
					case 'add':
						switch(subCommand) {
							case 'domain':
							case 'folder':
							case 'directory':
							case 'dir':
							case 'root':
							case 'host':
								if(subCommandArguments.length > 0) {
									self._parseAddDomain(parts[2],parts[3]);
								} else {
									console.log('What is the domain name (use * for the default/catch-all domain)?');
									console.log('Type cancel, exit, quit or stop to cancel.');
									this.state = 'PARSE_DOMAIN_NAME';
								}
								break;
							default:
								console.log('Unknown command.');
								console.log('Type help for a list of available commands.');									
								break;
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
					case 'clear':
						console.clear();
						break;
					case 'delete':
					case 'remove':
						switch(subCommand) {
							case 'domain':
							case 'host':
								if(subCommandArguments.length > 0) {
									this.domainName = subCommandArguments;
									console.log('About to delete domain \'' + this.domainName + '\'. Are you sure (yes/no)?');
									this.state = 'PARSE_DELETE_DOMAIN_CONFIRM';
								} else {
									console.log('What is the domain name (use * for the default/catch-all domain)?');
									console.log('Type cancel, exit, quit or stop to cancel.');
									this.state = 'PARSE_DELETE_DOMAIN';
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
					case 'list':
					case 'domains':
					case 'hosts':
						self._parseListDomains(commandArguments);
						break;
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
							case 'domain':
							case 'folder':
							case 'directory':
							case 'dir':
							case 'root':
							case 'host':
								if(subCommandArguments.length > 0) {
									self._parseAddDomain(parts[2],parts[3]);
								} else {
									console.log('What is the domain name (use * for the default/catch-all domain)?');
									console.log('Type cancel, exit, quit or stop to cancel.');
									this.state = 'PARSE_DOMAIN_NAME';
								}
								break;
							case 'http':
							case 'insecure':
								self._parseSetSecure('no');
								break;
							case 'https':
								self._parseSetSecure('yes');
								break;
							case 'log':
							case 'logger':
							case 'logging':
							case 'loglevel':
								if(subCommandArguments.length > 0) {
									self._parseLogging(subCommandArguments);
								} else {
									console.log('What should the log level be?');
									console.log('One of trace, debug, info, warning, error, fatal or off.');
									console.log('Type cancel, exit, quit or stop to cancel.');
									this.state = 'PARSE_LOGGING';
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
							default:
								console.log('Unknown command.');
								console.log('Type help for a list of available commands.');									
								break;
						}
						break;
					case 'certificate':
					case 'certificates':
					case 'certificatefolder':
					case 'certificatesfolder':
						if(commandArguments.length > 0) {
							self._parseSetCertificatesFolder(commandArguments);
						} else {
							console.log('What is the certificates folder?');
							console.log('Type cancel, exit, quit or stop to cancel.');
							this.state = 'PARSE_CERTIFICATES_FOLDER';
						}
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
					case 'http':
						self._parseSetSecure('no');
						break;
					case 'https':
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
						self._parseStatus();
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
							console.log('One of trace, debug, info, warning, error, fatal or off.');
							console.log('Type cancel, exit, quit or stop to cancel.');
							this.state = 'PARSE_LOGGING';
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
			this.httpServer.setAddress(line);
			this._hasUnsavedChanges = true;
			console.log('Address set to \'' + this.httpServer.getAddress() + '\'.');
		} catch(_exception) {
				if(_exception.code === HTTPError.ILLEGAL_STATE.code) {
					console.log('Unable to update the address, because the HTTPServer is running.')
					console.log('Make sure to first stop the HTTPServer before updating the address.');
				} else {
					console.log('Error: ' + _exception.toString());
				}
		}
		this._rl.prompt();
	}

	_parseAddDomain(domainName, domainFolder) {
		try {
			this.httpServer.addHTTPServerDomain(domainName, domainFolder);
			console.log('Domain \'' + domainName + '\' added.');
		} catch(_exception) {
			console.log(_exception.toString());
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
			this.httpServer.setCertificatesFolder(line);
			this._hasUnsavedChanges = true;
			console.log('Certificates folder set to \'' + this.httpServer.getCertificatesFolder() + '\'.');
		} catch(_exception) {
			if(_exception.code === HTTPError.ILLEGAL_STATE.code) {
				console.log('Unable to update the certificates folder, because the HTTPServer is running.')
				console.log('Make sure to first stop the HTTPServer before updating the certificates folder.');
			} else {
				console.log('Error: ' + _exception.toString());
			}
		}
		this._rl.prompt();
	}

	_parseDeleteDomain(line) {
		let lineLowerCase = line.toLowerCase();
		if(lineLowerCase === 'cancel'  || lineLowerCase === 'exit' ||
		   lineLowerCase === 'quit'    || lineLowerCase === 'stop') {
		   	console.log('Cancelled.');
			this._rl.prompt();
			return;
		}
		this.httpServer.deleteHTTPServerDomain(line);
		console.log('Domain \'' + line + '\' deleted.');
		this._rl.prompt();
	}

	_parseListDomains(line) {
		let domains = this.httpServer.listDomains();
		if(domains.length <= 0) {
			console.log('No domains defined.');
			this._rl.prompt();
			return;
		}
		console.log('Currently defined domains (* is the default/catch-all domain) and');
		console.log('their optional static content folder:');
		for(let i=0;i < domains.length;i++) {
			let domain = domains[i];
			let root = domain.root;
			if(root) {
				console.log(domain.name + ' -> ' + domain.root);
			} else {
				console.log(domain.name + ' -> N/A');
			}
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
			this.httpServer.setSecure(line);
			this._hasUnsavedChanges = true;
			console.log('Secure is set to \'' + this.httpServer.isSecure() + '\'.');
			if(this.httpServer.isSecure()) {
				console.log('The current certificates folder is \'' + this.httpServer.getCertificatesFolder() + '\'.');
			}
		} catch(_exception) {
			if(_exception.code === HTTPError.ILLEGAL_ARGUMENT.code) {
				console.log('Illegal argument.');
			} else if(_exception.code === HTTPError.ILLEGAL_STATE.code) {
				console.log('Unable to update the security setting, because the HTTPServer is running.')
				console.log('Make sure to first stop the HTTPServer before updating the security setting.');
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
		this.httpServer.once(HTTPServerEvent.STOPPED, function(err) {
			console.log('Goodbye...');
			process.exit();
		});
		if(this.httpServer.isStopped()) {
			console.log('Goodbye...');
			process.exit();
		} else if(this.httpServer.isInitialized()) {
			console.log('Goodbye...');
			process.exit();
		} else {
			this.httpServer.stop();
		}
	}

	_parseHelp() {
		// Clear the scroll buffer.
		process.stdout.write('\u001b[3J\u001b[1J');
		// Clear the window.
		console.clear();
		console.log('');
		console.log('CONFIGURATION / PREFERENCES: Commands to control the HTTPServer.');
		console.log('');
		console.log('COMMAND -----------------------------+ ALIASES -------------+ DESCRIPTION -----------------------------------+');
		console.log('add domain       <name> <folder>     + add host,            + A HTTPServer may serve multiple domains.       |');
		console.log('                                     | set domain,          | Each domain has its own root folder.           |');
		console.log('                                     | set host             | To specify a default/catch-all domain use * as |');
		console.log('                                     |                      | the domain name.                               |');
		console.log('delete domain    <name>              + delete host,         + Delete a domain.                               |');
		console.log('                                     | remove domain,       | To remove the default/catch-all domain use *   |');
		console.log('                                     | remove host          | as the domain name.                            |');
		console.log('list domains                         + domains,             + List all domains.                              |');
		console.log('                                     | hosts,               |                                                |');
		console.log('                                     | list hosts           |                                                |');
		console.log('load             <filepath>          + import               + Load a previously saved configuration.         |');
		console.log('reset                                +                      + Reset all the settings back to their defaults. |');
		console.log('save             <filepath>          + export               + Save the current configuration.                |')
		console.log('set address      <ip>                + address,             + Set the HTTP address to bind to.               |');
		console.log('                                     | ipaddress            | By default this is set to 0.0.0.0 to bind      |');
		console.log('                                     |                      | to all ip addresses of the host.               |');
		console.log('                                     |                      | The HTTPServer must be stopped first before    |');
		console.log('                                     |                      | before the address can be updated.             |');
		console.log('set certicates   <folder>            + certificate,         + Set the certificates folder.                   |');
		console.log('                                     | certificatefolder,   | This is only used https is enabled.            |');
		console.log('                                     | certificates,        | The HTTPServer must be stopped first before    |');
		console.log('                                     | certificatesfolder   | the certificates folder can be updated.        |');
		console.log('                                     |                      | To create localhost/development certificates   |');
		console.log('                                     |                      | one could use the following command:           |');
		console.log('                                     |                      | sudo openssl req -x509 -sha256 -nodes          |');
		console.log('                                     |                      | -newkey rsa:2048 -days 365                     |');
		console.log('                                     |                      | -subj "/C=US/ST=CA/L=C/O=T/OU=Org/CN=localhost"|');
		console.log('                                     |                      | -keyout ./privkey.pem -out ./fullchain.pem     |');
		console.log('                                     |                      |                                                |');
		console.log('                                     |                      | Make sure to move the privkey.pem and          |');
		console.log('                                     |                      | fullchain.pem files to the certificates folder.|');
		console.log('                                     |                      |                                                |');
		console.log('set http                             + enable http,         + Shortcut for -set secure false.                |');
		console.log('                                     | http                 |                                                |');
		console.log('set https                            + enable https,        + Shortcut for -set secure true.                 |');
		console.log('                                     | https                | Ensure the certificates folder is correct.     |');
		console.log('set port         <number>            + port                 + Set the HTTP port to bind to.                  |');
		console.log('                                     |                      | The HTTPServer must be stopped first before    |');
		console.log('                                     |                      | the port can be updated.                       |');
		console.log('set secure       <boolean>           + encrypt,encryption,  + Turn https on or off.                          |');
		console.log('                                     | secure,              | If secure is set to true you should ensure     |');
		console.log('                                     | security,            | the certificates folder is correct.            |');
		console.log('                                     | set encrypt,         | The HTTPServer must be stopped first before    |');
		console.log('                                     | set encryption       | the security settings can be updated.          |');
		console.log('status                               + config,configuration + Get the current state of the HTTPServer.       |');
		console.log('                                     | prefs,preferences    |                                                |');
		console.log('                                     | settings,state       |                                                |');
		console.log('-------------------------------------+----------------------+------------------------------------------------+');
		console.log('');
		console.log('PROCESS FLOW: Commands to start and stop the HTTPServer.');
		console.log('');
		console.log('COMMAND -----------------------------+ ALIASES -------------+ DESCRIPTION -----------------------------------+');
		console.log('start                                +                      + Start the HTTPServer.                          |');
		console.log('stop                                 +                      + Stop the HTTPServer.                           |');
		console.log('-------------------------------------+----------------------+------------------------------------------------+');
		console.log('');
		console.log('PROGRAM FLOW: Commands to control this command line interface program.');
		console.log('');
		console.log('COMMAND -----------------------------+ ALIASES -------------+ DESCRIPTION -----------------------------------+');
		console.log('clear                                +                      + Clear the console/screen.                      |')
		console.log('exit                                 + quit                 + Exit this program.                             |');
		console.log('help                                 + faq, info,           + Show this help screen.                         |');
		console.log('                                     | information          |                                                |');
		console.log('loglevel         <level>             + log, logger, logging + Set the log level.                             |');
		console.log('                                     |                      | One of trace, debug, info, warning, error,     |');
		console.log('                                     |                      | fatal or off.                                  |');
		console.log('-------------------------------------+----------------------+------------------------------------------------+');
		console.log('');
	}

	async _parseLoad(line) {
		let lineLowerCase = line.toLowerCase();
		if(lineLowerCase === 'cancel'  || lineLowerCase === 'exit' ||
		   lineLowerCase === 'quit'    || lineLowerCase === 'stop') {
		   	console.log('Cancelled.');
			this._rl.prompt();
			return;
		}
		if(!this.httpServer.isInitialized() &&
		   !this.httpServer.isStopped()) {
			console.log('Make sure the HTTPServer is not running. Cancelled.');
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
		this.httpServer.clearHTTPServerDomains();
		try {
			let persistAsString = await fs.promises.readFile(line, 'utf8');
			let persist = JSON.parse(persistAsString);
			this.httpServer.setPort(persist.port);
			this.httpServer.setAddress(persist.address);
			this.httpServer.setSecure(persist.secure);
			this.httpServer.setCertificatesFolder(persist.certificatesFolder);
			for(let i=0;i < persist.domains.length;i++) {
				let domain = persist.domains[i];
				let domainName = domain.name;
				let domainFolder = domain.root;
				this.httpServer.addHTTPServerDomain(domainName, domainFolder);
			}
			this.originalAddress = this.httpServer.getAddress();
			this.originalPort = this.httpServer.getPort();
			this.originalSecure = this.httpServer.isSecure();
			this.originalCertificatesFolder = this.httpServer.getCertificatesFolder();
			this.originalDomains = this.httpServer.listDomains();
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
		   lineLowerCase === 'quit'    || lineLowerCase === 'stop' || lineLowerCase === '') {
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
			this.httpServer.setPort(this.originalPort);
			this.httpServer.setAddress(this.originalAddress);
			this.httpServer.setSecure(this.originalSecure);
			this.httpServer.setCertificatesFolder(this.originalCertificatesFolder);
			this.httpServer.clearHTTPServerDomains();
			for(let i=0;i < this.originalDomains.length;i++) {
				let domain = this.originalDomains[i];
				let domainName = domain.name;
				let domainFolder = domain.root;
				this.httpServer.addHTTPServerDomain(domainName, domainFolder);
			}
	    	console.log('Reset.');
			this._hasUnsavedChanges = false;
			this._parseStatus();
	    } else {
	    	console.log('Cancelled.');
			this._rl.prompt();
	    }
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
		persist.address = this.httpServer.getAddress();
		persist.port = this.httpServer.getPort();
		persist.secure = this.httpServer.isSecure();
		persist.certificatesFolder = this.httpServer.getCertificatesFolder();
		persist.domains = [];
		let domains = this.httpServer.listDomains();
		for(let i=0;i < domains.length;i++) {
			persist.domains.push(domains[i]);
		}
		try {
			let persistAsString = JSON.stringify(persist);
			await fs.promises.writeFile(line, persistAsString, 'utf8');
			console.log('Configuration saved to \'' + line + '\'.');
			this._hasUnsavedChanges = false;
		} catch(_error) {
			if(_error) {
				console.log('Something went wrong during save.');
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
			this.httpServer.setPort(line);
			this._hasUnsavedChanges = true;
			console.log('Port set to \'' + this.httpServer.getPort() + '\'.');
		} catch(_exception) {
			if(_exception.code === HTTPError.ILLEGAL_ARGUMENT.code) {
				console.log('The supplied port is not a number. Unable to update the HTTP port.')
			} else if(_exception.code === HTTPError.ILLEGAL_STATE.code) {
				console.log('Unable to update the port, because the HTTPServer is running.')
				console.log('Make sure to first stop the HTTPServer before updating the port.');
			} else {
				console.log('Error: ' + _exception.toString());
			}
		}
		this._rl.prompt();
	}

	_parseStart() {
		if(this.httpServer.isRunning()) {
			console.log('The HTTPServer is already running.');
			this._rl.prompt();
			return;
		}
		if(this.httpServer.isStarting()) {
			console.log('The HTTPServer is already starting.');
			this._rl.prompt();
			return;
		}
		try {
			this.httpServer.start();
		} catch(_exception) {
			if(HTTPError.FILE_NOT_FOUND.equals(_exception)) {
				console.log('The HTTPServer is set to secure, but the certificates folder can not be found.');
				console.log('Current certificates folder: \'' + this.httpServer.getCertificatesFolder() + '\'.');
			} else {
				console.log(_exception);
			}
			this._rl.prompt();
		}
	}

	_parseStatus() {
		console.log('Address            : ' + this.httpServer.getAddress());
		console.log('Port               : ' + this.httpServer.getPort());
		console.log('Secure             : ' + this.httpServer.isSecure());
		console.log('Certificates folder: ' + this.httpServer.getCertificatesFolder());
		console.log('State              : ' + this.httpServer.getState());
		let domains = this.httpServer.listDomains();
		for(let i=0;i < domains.length;i++) {
			let domain = domains[i];
			let root = domain.root;
			if(i === 0) {
				if(root) {
		console.log('Domains (* default): ' + domain.name + ' -> ' + domain.root);
				} else {
		console.log('Domains (* default): ' + domain.name + ' -> N/A');
				}
			} else {
				if(root) {
		console.log('                     ' + domain.name + ' -> ' + domain.root);
				} else {
		console.log('                     ' + domain.name + ' -> N/A');
				}
			}
		}
		this._rl.prompt();
	}

	_parseStop() {
		if(this.httpServer.isStopped()) {
			console.log('The HTTPServer is already stopped.');
			this._rl.prompt();
			return;
		}
		if(this.httpServer.isStopping()) {
			console.log('The HTTPServer is already stopping.');
			this._rl.prompt();
			return;
		}
		try {
			this.httpServer.stop();
		} catch(_exception) {
			console.log(_exception);
		}
	}

	static main() {
		try {
			let httpServerOptions = HTTPServerOptions.parseCommandLine();
			logging.setLevel(httpServerOptions.logLevel);
			if(httpServerOptions.help) {
				util.Help.print(this);
				return;
			}
			let httpServer = new HTTPServer(httpServerOptions);
			let httpServerCLI = new HTTPServerCLI(httpServer);
			httpServerCLI.start();
		} catch(_exception) {
			console.log('EXCEPTION:'  + _exception);
		}
	}
}
// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
	HTTPServerCLI.main();
	return;
}

module.exports = HTTPServerCLI;