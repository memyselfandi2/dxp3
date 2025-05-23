/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-lang-html
 *
 * NAME
 * HTMLReaderCLI
 */
const packageName = 'dxp3-lang-html';
const moduleName = 'HTMLReaderCLI';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * @module dxp3-lang-html/HTMLReaderCLI
 */
const HTMLReader = require('./HTMLReader');
const HTMLReaderOptions = require('./HTMLReaderOptions');
const logging = require('dxp3-logging');
const readline = require('readline');
const util = require('dxp3-util');
/**
 * A html reader command line interface program.
 */
class HTMLReaderCLI {

	constructor(_htmlReader) {
		this.htmlReader = _htmlReader;
		this.domDocument = null;
		this.originalTimeout = this.htmlReader.getTimeout();
		this.originalFollowRedirects = this.htmlReader.getFollowRedirects();
		this.originalUserAgent = this.htmlReader.getUserAgent();
		this._rl = null;
		this._state = 'PARSE';
	}

	start() {
		this._rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout,
			prompt: 'DXP3-HTML> '
		});
		this._rl.on('close', () => {
			this._parseExit();
		});
		console.clear();
		console.log('');
		console.log('Use this interface to read and query html.');
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

	_parseExit() {
		console.log('Goodbye.');
		process.exit(1);
	}

	async _parseLine(line) {
		let command = null;
		let commandArguments = null;
		let subCommand = null;
		let subCommandArguments = null;
		line = line.trim();
		let parts = line.split(' ');
		command = parts[0].toLowerCase();
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
			case 'PARSE_URL':
				this._parseURL(line);
				this._state = 'PARSE';
				break;
			case 'PARSE_FILE':
				this._parseFile(line);
				this._state = 'PARSE';
				break;
			case 'PARSE_HTML':
				this._parseHTML(line);
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
			case 'PARSE_LOGGING':
				this._parseLogging(line);
				this._state = 'PARSE';
				break;
			case 'PARSE_USERAGENT':
				this._parseUseragent(line);
				this._state = 'PARSE';
				break;
			case 'PARSE_FOLLOW_REDIRECTS':
				this._parseFollowRedirects(line);
				this._state = 'PARSE';
				break;
			case 'PARSE_TIMEOUT':
				this._parseTimeout(line);
				this._state = 'PARSE';
				break;
			case 'PARSE_RESET':
				this._parseReset(line);
			    this._state = 'PARSE';
				break;
			default:
				switch(command) {
					case 'file':
					case 'filename':
					case 'source':
					case 'location':
					case 'path':
						if(commandArguments.length > 0) {
							this._parseFile(commandArguments)
						} else {
							console.log('Please provide the file to read (type cancel, exit, quit or stop to cancel).');
							this._state = 'PARSE_FILE';
						}
						break;
					case 'url':
					case 'get':
					case 'visit':
						if(commandArguments.length > 0) {
							this._parseURL(commandArguments);
						} else {
							console.log('Please provide the URL to visit (type cancel, exit, quit or stop to cancel).');
							this._state = 'PARSE_URL';
						}
						break;
					case 'html':
					case 'string':
					case 'text':
						if(commandArguments.length > 0) {
							this._parseHTML(commandArguments);
						} else {
							console.log('Please provide the HTML.');
							this._state = 'PARSE_HTML';
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
					case 'print':
						if(this.domDocument === null) {
							this._printNoHTMLYet();
						} else {
							console.log(this.domDocument.toString());
						}
						break;
					case 'config':
					case 'configuration':
					case 'prefs':
					case 'preferences':
					case 'settings':
					case 'status':
					case 'state':
						console.log('Useragent       : ' + this.htmlReader.getUserAgent());
						console.log('Follow redirects: ' + this.htmlReader.getFollowRedirects());
						console.log('Timeout         : ' + this.htmlReader.getTimeout() + ' ms');
						break;
					case 'useragent':
						if(commandArguments.length > 0) {
							this._parseUseragent(commandArguments);
						} else {
						    console.log('Please specify the useragent (type cancel, exit, quit or stop to cancel).');
							this._state = 'PARSE_USERAGENT';
						}
						break;
					case 'timeout':
						if(commandArguments.length > 0) {
							this._parseTimeout(commandArguments);
						} else {
						    console.log('What should be the connection timeout (type cancel, exit, quit or stop to cancel)?');
							this._state = 'PARSE_TIMEOUT';
						}
						break;
					case 'follow':
					case 'followredirect':
					case 'followredirects':
					case 'redirect':
					case 'redirects':
					case 'redirection':
					case 'redirections':
						if(commandArguments.length > 0) {
							this._parseFollowRedirects(commandArguments);
						} else {
							console.log('Should we follow redirects (type cancel, exit, quit or stop to cancel)?');
							this._state = 'PARSE_FOLLOW_REDIRECTS';
						}
						break;
					case 'reset':
					    console.log('Are you sure (yes/no)?');
					    this._state = 'PARSE_RESET';
						break;							
					case 'exit':
					case 'quit':
						console.log('Goodbye.');
						process.exit(1);
						break;
					case 'log':
					case 'logger':
					case 'logging':
					case 'loglevel':
						if(commandArguments.length > 0) {
							this._parseLogging(commandArguments);
						} else {
							console.log('What should the log level be?');
							console.log('Type trace,debug,info,warning,error,fatal or off.');
							console.log('Type cancel, exit, quit or stop to cancel.');
							this._state = 'PARSE_LOGGING';
						}
						break;
					case 'faq':
					case 'help':
					case 'info':
					case 'information':
						this._parseHelp();
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

	_parseQuery(line) {
		let self = this;
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
		let self = this;
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

	_parseURL(line) {
		let lineLowerCase = line.toLowerCase();
		if(lineLowerCase === 'cancel'  || lineLowerCase === 'exit' ||
		   lineLowerCase === 'quit'    || lineLowerCase === 'stop') {
		   	console.log('Cancelled.');
			this._rl.prompt();
			return;
		}
		// We need to clear our current domDocument.
		this.domDocument = null;		
		let self = this;
		this.htmlReader.parseURL(line, (_error, _domDocument) => {
			if(_error) {
				console.log('Error: ' + _error.message);
			} else {
				console.log('URL read.');
				this.domDocument = _domDocument;
			}
			this._rl.prompt();
		});
	}

	_parseFile(line) {
		let lineLowerCase = line.toLowerCase();
		if(lineLowerCase === 'cancel'  || lineLowerCase === 'exit' ||
		   lineLowerCase === 'quit'    || lineLowerCase === 'stop') {
		   	console.log('Cancelled.');
			this._rl.prompt();
			return;
		}
		// We need to clear our current domDocument.
		this.domDocument = null;		
		let self = this;
		this.htmlReader.parseFile(line, (_error, _domDocument) => {
			if(_error) {
				console.log('Error: ' + _error.message);
			} else {
				console.log('File read.');
				this.domDocument = _domDocument;
			}
			this._rl.prompt();
		});
	}

	_parseHTML(line) {
		// We need to clear our current domDocument.
		this.domDocument = null;		
		let self = this;
		this.htmlReader.parse(line, (_error, _domDocument) => {
			if(_error) {
				console.log(_error);
			} else {
				console.log('HTML parsed.');
				this.domDocument = _domDocument;
			}
			this._rl.prompt();
		});
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

	_parseFollowRedirects(line) {
		line = line.toLowerCase();
		if(line === 'cancel'  || line === 'exit' ||
		   line === 'quit'    || line === 'stop') {
		   	console.log('Cancelled.');
			this._rl.prompt();
			return;
		}
		if(line === 'y' || line === 'yes' || line === 'on' || line === 'true') {
			this.htmlReader.setFollowRedirects(true);
		} else {
			this.htmlReader.setFollowRedirects(false);
		}
		console.log('Follow redirects is set to ' + this.htmlReader.getFollowRedirects() + '.');
		this._rl.prompt();
	}

	_parseTimeout(line) {
		let lineLowerCase = line.toLowerCase();
		if(lineLowerCase === 'cancel'  || lineLowerCase === 'exit' ||
		   lineLowerCase === 'quit'    || lineLowerCase === 'stop') {
		   	console.log('Cancelled.');
			this._rl.prompt();
			return;
		}
		let timeout = parseInt(line);
		if(isNaN(timeout)) {
			console.log('Timeout must be a number.');
			console.log('Cancelled.');
		} else {
			this.htmlReader.setTimeout(timeout);
			console.log('Timeout set to ' + timeout);
		}
		this._rl.prompt();
	}

	_parseUseragent(line) {
		let lineLowerCase = line.toLowerCase();
		if(lineLowerCase === 'cancel'  || lineLowerCase === 'exit' ||
		   lineLowerCase === 'quit'    || lineLowerCase === 'stop') {
		   	console.log('Cancelled.');
			this._rl.prompt();
			return;
		}
		this.htmlReader.setUserAgent(line);
		console.log('Useragent is set to ' + this.htmlReader.getUserAgent() + '.');
		this._rl.prompt();
	}

	_printNoHTMLYet() {
	   	console.log('No HTML read yet.');
	   	console.log('Use the \'file\' command to read HTML from a file.');
	   	console.log('Use the \'html\' command to type HTML on the command line.');
	   	console.log('Use the \'url\' command to read HTML from a network location.');
	}

	_parseReset(line) {
		line = line.toLowerCase();
	    if(line === 'yes' || line === 'y' || line === 'true') {
	    	this.htmlReader.setTimeout(this.originalTimeout);
	    	this.htmlReader.setFollowRedirects(this.originalFollowRedirects);
	    	this.htmlReader.setUserAgent(this.originalUserAgent);
	    	console.log('Reset.');
			console.log('Useragent       : ' + this.htmlReader.getUserAgent());
			console.log('Follow redirects: ' + this.htmlReader.getFollowRedirects());
			console.log('Timeout         : ' + this.htmlReader.getTimeout() + ' ms');
	    } else {
	    	console.log('Cancelled.');
	    }
	}

	_parseHelp() {
		// Clear the scroll buffer.
		process.stdout.write('\u001b[3J\u001b[1J');
		// Clear the window.
		console.clear();
		console.log('HTMLReader:');
		console.log('');
		console.log('ACTIONS: core methods that provide our HTMLReader capabilities.');
		console.log('');
		console.log('COMMAND ------------------------+ ALIASES -------------+ DESCRIPTION -----------------------------------+');
		console.log('file             <name>         + filename,source,     + Read a HTML file.                              |');
		console.log('                                | location,path        |                                                |');
		console.log('html             <snippet>      + string,text          + Parse a HTML snippet.                          |');
		console.log('print                           +                      + Print the current DOMDocument to the screen.   |');
		console.log('query            <string>       + querySelect,         + Query the current DOMDocument.                 |');
		console.log('                                | querySelector,       |                                                |');
		console.log('                                | select               |                                                |');
		console.log('queryAll         <string>       + querySelectAll,      + Query the current DOMDocument.                 |');
		console.log('                                | querySelectorAll,    |                                                |');
		console.log('                                | selectAll            |                                                |');
		console.log('url              <address>      + get,visit            + Read HTML from an URL.                         |');
		console.log('--------------------------------+----------------------+------------------------------------------------+');
		console.log('');
		console.log('CONFIGURATION / PREFERENCES: Commands to control the HTMLReader.');
		console.log('');
		console.log('COMMAND ------------------------+ ALIASES -------------+ DESCRIPTION -----------------------------------+');
		console.log('redirect         <boolean>      + follow,              + Specify if a HTMLReader should or should not   |');
		console.log('                                | followredirects      | follow redirects.                              |');
		console.log('reset                           +                      + Reset all the settings back to their defaults. |');
		console.log('status                          + config,              + Get the current state of the HTMLReader.       |');
		console.log('                                | configuration,       |                                                |');
		console.log('                                | prefs, preferences,  |                                                |');
		console.log('                                | settings, state      |                                                |');
		console.log('timeout          <number>       +                      + Set the connection timeout.                    |');
		console.log('useragent        <string>       +                      + Set the useragent.                             |');
		console.log('--------------------------------+----------------------+------------------------------------------------+');
		console.log('');
		console.log('PROGRAM FLOW: Commands to control this command line interface program.');
		console.log('');
		console.log('COMMAND ------------------------+ ALIASES -------------+ DESCRIPTION -----------------------------------+');
		console.log('exit                            + quit                 + Exit this program.                             |');
		console.log('help                            + faq, info,           + Show this help screen.                         |');
		console.log('                                + information          +                                                |');
		console.log('loglevel         <level>        + log, logger, logging + Set the log level.                             |');
		console.log('                                |                      | One of trace, debug, info, warning, error,     |');
		console.log('                                |                      | fatal or off.                                  |');
		console.log('--------------------------------+----------------------+------------------------------------------------+');
		console.log('');
	}

	static main() {
		try {
			let htmlReaderOptions = HTMLReaderOptions.parseCommandLine();
			logging.setLevel(htmlReaderOptions.logLevel);
			if(htmlReaderOptions.help) {
				util.Help.print(this);
				return;
			}
			let htmlReader = new HTMLReader();
			let htmlReaderCLI = new HTMLReaderCLI(htmlReader);
			htmlReaderCLI.start();
		} catch(exception) {
			console.log('EXCEPTION:'  + exception);
		}
	}
}
// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
	HTMLReaderCLI.main();
	return;
}

module.exports = HTMLReaderCLI;