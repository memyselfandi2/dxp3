/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-net-http
 *
 * NAME
 * HTTPClientCLI
 */
const packageName = 'dxp3-net-http';
const moduleName = 'HTTPClientCLI';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * @module dxp3-net-http/HTTPClientCLI
 */
const fs = require('fs');
const html = require('dxp3-lang-html');
const HTTPClient = require('./HTTPClient');
const HTTPClientError = require('./HTTPClientError');
const HTTPClientOptions = require('./HTTPClientOptions');
const HTTPDownloader = require('./HTTPDownloader');
// It's important to at least log warnings and errors.
const logging = require('dxp3-logging');
const readline = require('readline');
// We use the util.Help class to print out help information.
const util = require('dxp3-util');
/**
 * A HTTPClient command line interface program.
 */
class HTTPClientCLI {
    /*********************************************
     * CONSTRUCTOR
     ********************************************/

	constructor(_httpClient) {
		this.htmlReader = new html.HTMLReader();
		this.httpClient = _httpClient;
		this.originalTimeout = this.httpClient.getTimeout();
		this.originalFollowRedirects = this.httpClient.getFollowRedirects();
		this.originalUserAgent = this.httpClient.getUserAgent();
		this._rl = null;
		this.domDocument = null;
		this.contentType = null;
		this.statusCode = null;
		this.filePath = null;
		this._state = 'PARSE';
		this.domain = null;
		this._hasUnsavedChanges = false;
	}

	start() {
		this._rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout,
			prompt: 'DXP3-HTTP-CLIENT>'
		});
		this._rl.on('close', () => {
			this._parseExit();
		});
		console.clear();
		console.log('');
		console.log('Use this interface to visit url\'s.');
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
		switch(this._state) {
			case 'PARSE_LOGGING':
				this._parseLogging(line);
				this._state = 'PARSE';
				break;
			case 'PARSE_USERAGENT':
				this._parseSetUseragent(line);
				this._state = 'PARSE';
				break;
			case 'PARSE_FOLLOW_REDIRECTS':
				this._parseSetFollowRedirects(line);
				this._state = 'PARSE';
				break;
			case 'PARSE_TIMEOUT':
				this._parseSetTimeout(line);
				this._state = 'PARSE';
				break;
			case 'PARSE_RESET':
				this._parseReset(line);
			    this._state = 'PARSE';
				break;
			case 'PARSE_GET':
				this._parseGet(line);
				this._state = 'PARSE';
				break;
			case 'PARSE_COOKIES':
				this._parseCookies(line);
				this._state = 'PARSE';
				break;
			case 'PARSE_SET':
				switch(line) {
					case '1':
					case 'followredirects':
					case 'redirect':
					case 'redirects':
					case 'redirection':
					case 'redirections':
						console.log('Should we follow redirects (type cancel, exit, quit or stop to cancel)?');
						this._state = 'PARSE_FOLLOW_REDIRECTS';
						break;
					case '2':
					case 'timeout':
					    console.log('What should be the connection timeout (type cancel, exit, quit or stop to cancel)?');
						this._state = 'PARSE_TIMEOUT';
						break;
					case '3':
					case 'useragent':
					    console.log('Please specify the useragent (type cancel, exit, quit or stop to cancel).');
						this._state = 'PARSE_USERAGENT';
						break;
					default:
						console.log('Unknown command.');
						console.log('Type help for a list of available commands.');									
						this._state = 'PARSE';
						break;
				}
				break;
			case 'PARSE_LIST':
				switch(line) {
					case '1':
					case 'cookie':
					case 'cookies':
						let domainsWithCookies = this.httpClient.getDomainsWithCookies();
						if(domainsWithCookies === undefined || domainsWithCookies === null || domainsWithCookies.length <= 0) {
							console.log('There are no domains with cookies.');
							this._state = 'PARSE';
						} else if(domainsWithCookies.length === 1) {
							this._parseCookies(domainsWithCookies[0]);
							this._state = 'PARSE';
						} else {
							console.log('Domains with cookies:');
							for(let i=0;i < domainsWithCookies.length;i++) {
								console.log('- ' + domainsWithCookies[i]);
							}
							console.log('Please type one of these domains (type cancel, exit, quit or stop to cancel).');
							this._state = 'PARSE_COOKIES';
						}
						break;
					case '2':
					case 'history':
						this._parseHistory();
						this._state = 'PARSE';
						break;
					default:
						console.log('Unknown command.');
						console.log('Type help for a list of available commands.');
						this._state = 'PARSE';
						break;
				}
				break;
			case 'PARSE_CLEAR':
				switch(line) {
					case '1':
					case 'cookie':
					case 'cookies':
						if(commandArguments.length > 0) {
							this.domain = commandArguments;
						    console.log('This will clear all cookies for domain \'' + this.domain + '\'. Are you sure (yes/no)?');
						} else {
						    console.log('This will clear all cookies. Are you sure (yes/no)?');
							this.domain = null;
						}
					    this._state = 'PARSE_CLEAR_COOKIES';
						break;
					case '2':
					case 'history':
					    console.log('This will clear all history. Are you sure (yes/no)?');
					    this._state = 'PARSE_CLEAR_HISTORY';
						break;
					case '3':
					case 'screen':
					case 'window':
						console.clear();
						this._state = 'PARSE';
						break;
					default:
						console.log('Unknown command.');
						console.log('Type help for a list of available commands.');
						this._state = 'PARSE';
						break;
				}
				break;
			case 'PARSE_CLEAR_COOKIES':
				this._parseClearCookies(line, this.domain);
				this._state = 'PARSE';
				break;
			case 'PARSE_CLEAR_HISTORY':
				this._parseClearHistory(line);
				this._state = 'PARSE';
				break;
			case 'PARSE_QUERY':
				this._parseQuery(line);
				this._state = 'PARSE';
				break;
			case 'PARSE_QUERY_ALL':
				this._parseQueryAll(line);
				this._state = 'PARSE';
				break;
			default:
				switch(command) {
					case 'back':
					case 'goback':
						this._parseBack();
						break;
					case 'clear':
					case 'delete':
						switch(subCommand) {
							case 'cookie':
							case 'cookies':
								if(subCommandArguments.length > 0) {
									this.domain = subCommandArguments;
								    console.log('This will clear all cookies for domain \'' + this.domain + '\'. Are you sure (yes/no)?');
								} else {
								    console.log('This will clear all cookies. Are you sure (yes/no)?');
									this.domain = null;
								}
							    this._state = 'PARSE_CLEAR_COOKIES';
								break;
							case 'history':
							    console.log('This will clear all history. Are you sure (yes/no)?');
							    this._state = 'PARSE_CLEAR_HISTORY';
								break;
							case 'screen':
							case 'window':
								console.clear();
								break;
							case '':
								console.log('Do you want to clear your 1) cookies, 2) history or 3) screen ?')
							    this._state = 'PARSE_CLEAR';
								break;
							default:
								console.log('Unknown command.');
								console.log('Type help for a list of available commands.');
								break;
						}
						break;
					case 'cookie':
					case 'cookies':
						if(commandArguments.length > 0) {
							this._parseCookies(commandArguments);
						} else {
							let domainsWithCookies = this.httpClient.getDomainsWithCookies();
							if(domainsWithCookies === undefined || domainsWithCookies === null || domainsWithCookies.length <= 0) {
								console.log('There are no domains with cookies.');
							} else if(domainsWithCookies.length === 1) {
								this._parseCookies(domainsWithCookies[0]);
							} else {
								console.log('Domains with cookies:');
								for(let i=0;i < domainsWithCookies.length;i++) {
									console.log('- ' + domainsWithCookies[i]);
								}
								console.log('Please type one of these domains (type cancel, exit, quit or stop to cancel).');
								this._state = 'PARSE_COOKIES';
							}
						}
						break;
					case 'exit':
					case 'quit':
						this._parseExit();
						break;
					case 'followredirects':
						if(commandArguments.length > 0) {
							this._parseSetFollowRedirects(commandArguments);
						} else {
							console.log('Should we follow redirects (type cancel, exit, quit or stop to cancel)?');
							this._state = 'PARSE_FOLLOW_REDIRECTS';
						}
						break;
					case 'forward':
					case 'goforward':
						this._parseForward();
						break;
					case 'get':
					case 'load':
					case 'url':
					case 'visit':
						if(commandArguments.length > 0) {
							this._parseGet(commandArguments);
						} else {
							console.log('Please provide the url to visit (type cancel, exit, quit or stop to cancel).');
							this._state = 'PARSE_GET';
						}
						break;
					case 'help':
					case 'faq':
					case 'info':
					case 'information':
						this._parseHelp();
						break;
					case 'history':
						this._parseHistory();
						break;
					case 'list':
						switch(subCommand) {
							case 'cookie':
							case 'cookies':
								if(subCommandArguments.length > 0) {
									this._parseCookies(subCommandArguments);
								} else {
									let domainsWithCookies = this.httpClient.getDomainsWithCookies();
									if(domainsWithCookies === undefined || domainsWithCookies === null || domainsWithCookies.length <= 0) {
										console.log('There are no domains with cookies.');
									} else if(domainsWithCookies.length === 1) {
										this._parseCookies(domainsWithCookies[0]);
									} else {
										console.log('Domains with cookies:');
										for(let i=0;i < domainsWithCookies.length;i++) {
											console.log('- ' + domainsWithCookies[i]);
										}
										console.log('Please type one of these domains (type cancel, exit, quit or stop to cancel).');
										this._state = 'PARSE_COOKIES';
									}
								}
								break;
							case 'history':
								this._parseHistory();
								break;
							case '':
								console.log('Do you want to list 1) cookies or 2) history?')
							    this._state = 'PARSE_LIST';
								break;
							default:
								console.log('Unknown command.');
								console.log('Type help for a list of available commands.');									
								break;
						}
						break;						
					case 'print':							
						if(this.domDocument === null) {
							this._printNoHTMLYet();
						} else {
							console.log(this.domDocument.toString());
						}
						break;
					case 'query':
					case 'queryselect':
					case 'queryselector':
					case 'select':
						if(this.domDocument === null) {
							this._printNoHTMLYet();
						} else if(commandArguments.length > 0) {
							this._parseQuery(commandArguments);
						} else {
							console.log('Please provide the query.');
							this._state = 'PARSE_QUERY';
						}
						break;
					case 'queryall':
					case 'queryselectall':
					case 'queryselectorall':
					case 'selectall':
						if(this.domDocument === null) {
							this._printNoHTMLYet();
						} else if(commandArguments.length > 0) {
							this._parseQueryAll(commandArguments);
						} else {
							console.log('Please provide the query.');
							this._state = 'PARSE_QUERY_ALL';
						}
						break;
					case 'refresh':
					case 'reload':
						this._parseRefresh();
						break;
					case 'save':
					case 'export':
						if(commandArguments.length > 0) {
							this._parseSave(commandArguments);
						} else {
							this._parseSave();
						}
						break;
					case 'status':
					case 'config':
					case 'configuration':
					case 'prefs':
					case 'preferences':
					case 'settings':
					case 'state':
						this._parseStatus();
						break;
					case 'timeout':
						if(commandArguments.length > 0) {
							this._parseSetTimeout(commandArguments);
						} else {
						    console.log('What should be the connection timeout (type cancel, exit, quit or stop to cancel)?');
							this._state = 'PARSE_TIMEOUT';
						}
						break;
					case 'useragent':
						if(commandArguments.length > 0) {
							this._parseSetUseragent(commandArguments);
						} else {
						    console.log('Please specify the useragent (type cancel, exit, quit or stop to cancel).');
							this._state = 'PARSE_USERAGENT';
						}
						break;
					case 'redirect':
					case 'redirects':
					case 'redirection':
					case 'redirections':
						if(commandArguments.length > 0) {
							this._parseSetFollowRedirects(commandArguments);
						} else {
							console.log('Should we follow redirects (type cancel, exit, quit or stop to cancel)?');
							this._state = 'PARSE_FOLLOW_REDIRECTS';
						}
						break;
					case 'reset':
						if(this._hasUnsavedChanges) {
						    console.log('Are you sure (yes/no)?');
						    this._state = 'PARSE_RESET';
						} else {
							console.log('Nothing to reset. Cancelled.');
						}
						break;
					case 'set':
						switch(subCommand) {
							case 'followredirects':
							case 'redirect':
							case 'redirects':
							case 'redirection':
							case 'redirections':
								if(subCommandArguments.length > 0) {
									this._parseSetFollowRedirects(subCommandArguments);
								} else {
									console.log('Should we follow redirects (type cancel, exit, quit or stop to cancel)?');
									this._state = 'PARSE_FOLLOW_REDIRECTS';
								}
								break;
							case 'log':
							case 'logger':
							case 'logging':
							case 'loglevel':
								if(subCommandArguments.length > 0) {
									this._parseLogging(subCommandArguments);
								} else {
									console.log('Please specify the loglevel (type cancel, exit, quit or stop to cancel).');
									console.log('Allowed values are trace, debug, info, warning, error, fatal or off.');
									this._state = 'PARSE_LOGGING';
								}
								break;
							case 'timeout':
								if(subCommandArguments.length > 0) {
									this._parseSetTimeout(subCommandArguments);
								} else {
								    console.log('What should be the connection timeout (type cancel, exit, quit or stop to cancel)?');
									this._state = 'PARSE_TIMEOUT';
								}
								break;
							case 'useragent':
								if(subCommandArguments.length > 0) {
									this._parseSetUseragent(subCommandArguments);
								} else {
								    console.log('Please specify the useragent (type cancel, exit, quit or stop to cancel).');
									this._state = 'PARSE_USERAGENT';
								}
								break;
							case '':
								console.log('Do you want to set the 1) followredirects, 2) timeout or 3) useragent?')
								this._state = 'PARSE_SET';
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
							console.log('Please specify the loglevel (type cancel, exit, quit or stop to cancel).');
							console.log('Allowed values are trace, debug, info, warning, error, fatal or off.');
							this._state = 'PARSE_LOGGING';
						}
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

	_parseBack() {
		this.httpClient.back((_error, _response, _url) => {
			if(_error) {
				switch(_error.code) {
					case HTTPClientError.NO_HISTORY.code:
						console.log('There is no history yet.')
						break;
					case HTTPClientError.AT_HISTORY_START.code:
						console.log('Already at the start. Nothing to go back to.');
						break;
					default:
						console.log(_error.code);
						break;
				}
				this._rl.prompt();
				return;
			}
			this._parseIncomingMessage(_response, _url);
		});
	}

	_parseClearCookies(line, _domain) {
		line = line.toLowerCase();
	    if(line === 'yes' || line === 'y' || line === 'true') {
	    	if(_domain === undefined || _domain === null || _domain.length <= 0) {
	    		this.httpClient.clearCookies();
		    	console.log('Cookies cleared.');
	    	} else {
		    	this.httpClient.clearCookies(_domain);
		    	console.log('Cookies for domain \'' + _domain + '\' cleared.');
		    }
	    } else {
	    	console.log('Cancelled.');
	    }
		this._rl.prompt();
	}

	_parseClearHistory(line) {
		line = line.toLowerCase();
	    if(line === 'yes' || line === 'y' || line === 'true') {
	    	this.httpClient.clearHistory();
	    	console.log('History cleared.');
	    } else {
	    	console.log('Cancelled.');
	    }
		this._rl.prompt();
	}

	_parseCookies(line) {
		let lineLowerCase = line.toLowerCase();
		if(lineLowerCase === 'cancel'  || lineLowerCase === 'exit' ||
		   lineLowerCase === 'quit'    || lineLowerCase === 'stop' || lineLowerCase === '') {
		   	console.log('Cancelled.');
			this._rl.prompt();
			return;
		}
		let cookiesByPath = this.httpClient.getCookiesByDomain(line);
		if(cookiesByPath === undefined || cookiesByPath === null) {
			console.log('No cookies set for domain \'' + line + '\'.');
		} else if(cookiesByPath.size <= 0) {
			console.log('No cookies set for domain \'' + line + '\'.');
		} else {
			console.log('Cookies for domain \'' + line + '\':');
			for(let [cookiePath, cookieMap] of cookiesByPath) {
				if(cookieMap === undefined || cookieMap === null) {
					continue;
				}
				for(let [key, httpCookie] of cookieMap) {
					console.log(httpCookie.toString());
				}
			}
		}
	}

	_parseExit() {
		console.log('Goodbye.');
		process.exit(1);
	}

	_parseSetFollowRedirects(line) {
		line = line.toLowerCase();
		if(line === 'cancel'  || line === 'exit' ||
		   line === 'quit'    || line === 'stop' || line === '') {
		   	console.log('Cancelled.');
			this._rl.prompt();
			return;
		}
		if(line === 'y' || line === 'yes' || line === 'on' || line === 'true') {
			this.httpClient.setFollowRedirects(true);
		} else {
			this.httpClient.setFollowRedirects(false);
		}
		this._hasUnsavedChanges = true;
		console.log('Follow redirects is set to \'' + this.httpClient.getFollowRedirects() + '\'.');
		this._rl.prompt();
	}

	_parseForward() {
		this.httpClient.forward((_error, _response, _url) => {
			if(_error) {
				switch(_error.code) {
					case HTTPClientError.NO_HISTORY.code:
						console.log('There is no history yet.')
						break;
					case HTTPClientError.AT_HISTORY_END.code:
						console.log('Already at the present. Nothing to go forward to.');
						break;
					default:
						console.log(_error.code);
						break;
				}
				this._rl.prompt();
				return;
			}
			this._parseIncomingMessage(_response, _url);
		});
	}

	_parseGet(line) {
		let lineLowerCase = line.trim().toLowerCase();
		if(lineLowerCase === 'cancel'  || lineLowerCase === 'exit' ||
		   lineLowerCase === 'quit'    || lineLowerCase === 'stop' || line === '') {
		   	console.log('Cancelled.');
			this._rl.prompt();
			return;
		}
		console.log('Visiting ' + line + '.');
		this.domDocument = null;
		this.httpClient.get(line, (_error, _response, _url) => {
			if(_error) {
				console.log(_error.code);
				this._rl.prompt();
				return;
			}
			this._parseIncomingMessage(_response, _url);
		});
	}

	_parseHelp() {
		// Clear the scroll buffer.
		process.stdout.write('\u001b[3J\u001b[1J');
		// Clear the window.
		console.clear();
		console.log('');
		console.log('ACTIONS: core methods that provide our HTTPClient capabilities.');
		console.log('');
		console.log('COMMAND -----------------------------+ ALIASES -------------+ DESCRIPTION -----------------------------------+');
		console.log('back                                 + goback               + Go back in history (until the first URL).      |');
		console.log('clear cookies       [<domain>]       + clear cookie,        + Clear all cookies or clear the cookies of a    |');
		console.log('                                     | delete cookie,       | specific domain.                               |');
		console.log('                                     | delete cookies,      |                                                |');
		console.log('clear history                        + delete history       + Clear the url history.                         |');
		console.log('cookies             [<domain>]       + cookie,              + Show the cookies of a domain. If the domain is |');
		console.log('                                     | list cookie,         | is not specified, the user will be presented   |');
		console.log('                                     | list cookies         | with a list of domains with cookies.           |');
		console.log('forward                              + goforward            + Go forward in history (up until the present).  |');
		console.log('get                 <url>            + load, url, visit     + Get a http resource.                           |');
		console.log('history                              + list history         + Show the url history.                          |');
		console.log('print                                +                      + Print the current resource to the screen.      |');
		console.log('query               <string>         + querySelect,         + Query the current DOMDocument.                 |');
		console.log('                                     | querySelector,       |                                                |');
		console.log('                                     | select               |                                                |');
		console.log('queryAll            <string>         + querySelectAll,      + Query the current DOMDocument.                 |');
		console.log('                                     | querySelectorAll,    |                                                |');
		console.log('                                     | selectAll            |                                                |');
		console.log('refresh                              + reload               + Refresh the current URL.                       |');
		console.log('save                [<folder>]       + export               | Save the current resource.                     |');
		console.log('-------------------------------------+----------------------+------------------------------------------------+');
		console.log('');
		console.log('CONFIGURATION / PREFERENCES: Commands to control the HTTPClient.');
		console.log('');
		console.log('COMMAND -----------------------------+ ALIASES -------------+ DESCRIPTION -----------------------------------+');
		console.log('reset                                +                      + Reset all the settings back to their defaults. |');
		console.log('set followredirects <boolean>        + followredirects,     + Specify if a HTTPClient should or should not   |');
		console.log('                                     | redirects,           | follow redirects.                              |');
		console.log('                                     | redirections,        |                                                |');
		console.log('                                     | set redirects,       |                                                |');
		console.log('                                     | set redirections     |                                                |');
		console.log('set timeout         <number>         + timeout              + Set the connection timeout.                    |');
		console.log('set useragent       <string>         + useragent            + Set the useragent.                             |');							
		console.log('status                               + config,              + Get the current state of the HTTPClient.       |');
		console.log('                                     | configuration,       |                                                |');
		console.log('                                     | prefs, preferences,  |                                                |');
		console.log('                                     | settings, state      |                                                |');
		console.log('-------------------------------------+----------------------+------------------------------------------------+');
		console.log('');
		console.log('PROGRAM FLOW: Commands to control this command line interface program.');
		console.log('');
		console.log('COMMAND -----------------------------+ ALIASES -------------+ DESCRIPTION -----------------------------------+');
		console.log('clear screen                         + clear window         + Clear the console/screen.                      |')
		console.log('exit                                 + quit                 + Exit this program.                             |');
		console.log('help                                 + faq, info,           + Show this help screen.                         |');
		console.log('                                     | information          |                                                |');
		console.log('loglevel            <level>          + log, logger, logging + Set the log level.                             |');
		console.log('                                     |                      | One of trace, debug, info, warning, error,     |');
		console.log('                                     |                      | fatal or off.                                  |');
		console.log('-------------------------------------+----------------------+------------------------------------------------+');
		console.log('');
	}

	_parseHistory() {
		let history = this.httpClient.getHistory();
		if(history === undefined || history === null || history.length <= 0) {
			console.log('There is no history yet.');
		} else {
			for(let i=0;i < history.length;i++) {
				console.log(history[i].href);
			}
		}
		this._rl.prompt();
	}

	_parseIncomingMessage(_response, _url) {
		this.domDocument = null;
    	this.statusCode = _response.statusCode;
        this.contentType = _response.headers['content-type'];
        if(this.contentType === undefined || this.contentType === null) {
        	console.log(_url + ': ' + this.statusCode);
        	this._rl.prompt();
        	return;
        }
        console.log(_url + ': ' + this.statusCode + ': ' + this.contentType);
        if(this.contentType.startsWith('text/html')) {
			this.htmlReader.parseIncomingMessage(_response, (_error, _domDocument) => {
				if(_error) {
					console.log('Error: ' + _error.message);
				} else {
					console.log('HTML parsed.');
					this.domDocument = _domDocument;
				}
	        	this._rl.prompt();
			});
        } else {
        	this._rl.prompt();
        }
	}

	_parseLogging(line) {
		let lineLowerCase = line.trim().toLowerCase();
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

	_parseQuery(line) {
		this.domDocument.query(line, (_error, _result) => {
			if(_result === undefined || _result === null) {
				console.log('No element found.');
				this._rl.prompt();
				return;
			}
			console.log(_result.toString());
			this._rl.prompt();
		});
	}

	_parseQueryAll(line) {
		this.domDocument.querySelectorAll(line, (_error, _result) => {
			if(_result === undefined || _result === null || _result.length <= 0) {
				console.log('No elements found.');
				this._rl.prompt();
				return;
			}
			for(let node of _result) {
				console.log(node.toString());
			}
			this._rl.prompt();
		});
	}

	_parseRefresh() {
		let url = this.httpClient.url;
		if(url === undefined || url === null || url.length <= 0) {
			console.log('There is no URL to refresh.')
			this._rl.prompt();
			return;			
		}
		console.log('Refreshing ' + this.httpClient.url + '.');
		this.httpClient.refresh((_error, _response, _url) => {
			if(_error) {
				if(_error.code === HTTPClientError.NO_URL.code) {
					console.log('There is no URL to refresh.')
				} else {
					console.log(_error.code);
				}
				this._rl.prompt();
				return;
			}
			this._parseIncomingMessage(_response, url);
		});
	}

	_parseReset(line) {
		line = line.toLowerCase();
	    if(line === 'yes' || line === 'y' || line === 'true') {
	    	this.httpClient.setTimeout(this.originalTimeout);
	    	this.httpClient.setFollowRedirects(this.originalFollowRedirects);
	    	this.httpClient.setUserAgent(this.originalUserAgent);
	    	console.log('Reset.');
			this._hasUnsavedChanges = false;
			this._parseStatus();
	    } else {
	    	console.log('Cancelled.');
			this._rl.prompt();
	    }
	}

	async _parseSave(line) {
		let currentURL = this.httpClient.getURL();
		if(currentURL === undefined || currentURL === null || currentURL === '') {
			console.log('No resource (yet) loaded.');
		   	console.log('Use the \'get\' command to read a resource from a network location before calling \'save\'.');
			console.log('Cancelled.');
			this._rl.prompt();
			return;
		}
		let downloadFolder = null;
		if(line != undefined && line != null && line.length > 0) {
			downloadFolder = line;
		}
		let httpDownloaderOptions = {
			timeout:this.httpClient.getTimeout(),
			useragent:this.httpClient.getUserAgent(),
			downloadFolder: downloadFolder
		}
		let httpDownloader = new HTTPDownloader(httpDownloaderOptions);
		httpDownloader.downloadURL(currentURL, (_error, _filePath) => {
			if(_error) {
				console.log('Something went wrong during save.');
			} else {
				console.log('Resource saved at \'' + _filePath + '\'.');
			}
			this._rl.prompt();
		});
	}

	_parseStatus() {
		console.log('Useragent       : ' + this.httpClient.getUserAgent());
		console.log('Follow redirects: ' + this.httpClient.getFollowRedirects());
		console.log('Timeout         : ' + this.httpClient.getTimeout() + ' ms');
		console.log('Current URL     : ' + this.httpClient.getURL());
		this._rl.prompt();
	}

	_parseSetTimeout(line) {
		let lineLowerCase = line.toLowerCase();
		if(lineLowerCase === 'cancel'  || lineLowerCase === 'exit' ||
		   lineLowerCase === 'quit'    || lineLowerCase === 'stop' || lineLowerCase === '') {
		   	console.log('Cancelled.');
			this._rl.prompt();
			return;
		}
		let timeout = parseInt(line);
		if(isNaN(timeout)) {
			console.log('Timeout must be a number.');
			console.log('Cancelled.');
		} else {
			this.httpClient.setTimeout(timeout);
			this._hasUnsavedChanges = true;
			console.log('Timeout set to \'' + timeout + '\'.');
		}
		this._rl.prompt();
	}

	_parseSetUseragent(line) {
		let lineLowerCase = line.toLowerCase();
		if(lineLowerCase === 'cancel'  || lineLowerCase === 'exit' ||
		   lineLowerCase === 'quit'    || lineLowerCase === 'stop') {
		   	console.log('Cancelled.');
			this._rl.prompt();
			return;
		}
		this.httpClient.setUserAgent(line);
		this._hasUnsavedChanges = true;
		console.log('Useragent is set to \'' + this.httpClient.getUserAgent() + '\'.');
		this._rl.prompt();
	}

	_printNoHTMLYet() {
		if(this.contentType === undefined || this.contentType === null) {
			console.log('No HTML (yet) loaded.');
		} else {
			console.log('The current resource is not a HTML document.');
		}
	   	console.log('Use the \'get\' command to read HTML from a network location.');
	}

	async exists(path) {
		try {
			await fs.promises.access(path, fs.constants.F_OK);
			return true;
		} catch(_error) {
			return false;
		}
	}

	static main() {
		try {
			let httpClientOptions = HTTPClientOptions.parseCommandLine();
			logging.setLevel(httpClientOptions.logLevel);
			if(httpClientOptions.help) {
				util.Help.print(HTTPClientCLI);
				return;
			}
			let httpClient = new HTTPClient(httpClientOptions);
			let httpClientCLI = new HTTPClientCLI(httpClient);
			httpClientCLI.start();
		} catch(exception) {
			console.log('EXCEPTION:'  + exception);
		}
	}
}
// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
	HTTPClientCLI.main();
	return;
}
module.exports = HTTPClientCLI;