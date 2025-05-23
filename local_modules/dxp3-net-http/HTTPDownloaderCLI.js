/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-net-http
 *
 * NAME
 * HTTPDownloaderCLI
 */
const packageName = 'dxp3-net-http';
const moduleName = 'HTTPDownloaderCLI';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * @module dxp3-net-http/HTTPDownloaderCLI
 */
const fs = require('fs');
const HTTPDownloader = require('./HTTPDownloader');
const HTTPDownloaderOptions = require('./HTTPDownloaderOptions');
const HTTPError = require('./HTTPError');
// It's important to at least log warnings and errors.
const logging = require('dxp3-logging');
const readline = require('readline');
// We use the util.Help class to print out help information.
const util = require('dxp3-util');
/**
 * A HTTPDownloader command line interface program.
 */
class HTTPDownloaderCLI {

	constructor(_httpDownloader) {
		this.httpDownloader = _httpDownloader;
		this.originalTimeout = this.httpDownloader.getTimeout();
		this.originalUserAgent = this.httpDownloader.getUserAgent();
		this.originalDownloadFolder = this.httpDownloader.getDownloadFolder();
		this.rl = null;
		this.state = 'PARSE';
	}

	start() {
		this.rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout,
			prompt: 'DXP3-DOWNLOADER>'
		});
		this.rl.on('close', () => {
			self._parseExit();
		});
		console.log('');
		console.log('Use this interface to download resources.');
		console.log('Type help for a list of available commands.');
		this._parse();
	}

	_parseDownloadFolder(line) {
		let lineLowerCase = line.toLowerCase();
		if(lineLowerCase === 'cancel'  || lineLowerCase === 'exit' ||
		   lineLowerCase === 'quit'    || lineLowerCase === 'stop' || lineLowerCase === '') {
		   	console.log('Cancelled.');
			this.rl.prompt();
			return;
		}
		this.httpDownloader.setDownloadFolder(line);
		console.log('Download folder set to \'' + this.httpDownloader.getDownloadFolder() + '\'.');
		this.rl.prompt();
	}

	_parseLogging(line) {
		let lineLowerCase = line.toLowerCase();
		if(lineLowerCase === 'cancel'  || lineLowerCase === 'exit' ||
		   lineLowerCase === 'quit'    || lineLowerCase === 'stop' || lineLowerCase === '') {
		   	console.log('Cancelled.');
			this.rl.prompt();
			return;
		}
		logging.setLevel(line);
		console.log('Logging set to \'' + logging.Level.toString(logging.getLevel()) + '\'.');
		this.rl.prompt();
	}

	_parseReset(line) {
		line = line.toLowerCase();
	    if(line === 'yes' || line === 'y' || line === 'true') {
	    	this.httpDownloader.setTimeout(this.originalTimeout);
	    	this.httpDownloader.setUserAgent(this.originalUserAgent);
	    	console.log('Reset.');
			console.log('Download folder : ' + this.httpDownloader.getDownloadFolder());
			console.log('Timeout         : ' + this.httpDownloader.getTimeout() + ' ms');
			console.log('Useragent       : ' + this.httpDownloader.getUserAgent());
	    } else {
	    	console.log('Cancelled.');
	    }
	}

	_parseTimeout(line) {
		let lineLowerCase = line.toLowerCase();
		if(lineLowerCase === 'cancel'  || lineLowerCase === 'exit' ||
		   lineLowerCase === 'quit'    || lineLowerCase === 'stop' || lineLowerCase === '') {
		   	console.log('Cancelled.');
			this.rl.prompt();
			return;
		}
		let timeout = parseInt(line);
		if(isNaN(timeout)) {
			console.log('Timeout must be a number.');
			console.log('Cancelled.');
		} else {
			this.httpDownloader.setTimeout(timeout);
			console.log('Timeout set to ' + timeout);
		}
		this.rl.prompt();
	}

	_parseUseragent(line) {
		let lineLowerCase = line.toLowerCase();
		if(lineLowerCase === 'cancel'  || lineLowerCase === 'exit' ||
		   lineLowerCase === 'quit'    || lineLowerCase === 'stop') {
		   	console.log('Cancelled.');
			this.rl.prompt();
			return;
		}
		this.httpDownloader.setUserAgent(line);
		console.log('Useragent is set to ' + this.httpDownloader.getUserAgent() + '.');
		this.rl.prompt();
	}

	_parseGet(line) {
		let lineLowerCase = line.toLowerCase();
		if(lineLowerCase === 'cancel'  || lineLowerCase === 'exit' ||
		   lineLowerCase === 'quit'    || lineLowerCase === 'stop' || line === '') {
		   	console.log('Cancelled.');
			this.rl.prompt();
			return;
		}
		console.log('Downloading ' + line + '.');
		let self = this;
		this.httpDownloader.get(line, function(_error, _filePath) {
			if(_error) {
				console.log('Something went wrong during save.');
				console.log(_error);
			} else {
				console.log('Resource saved at \'' + _filePath + '\'.');
			}
			self.rl.prompt();
		});
	}

    /*********************************************
     * PRIVATE METHODS
     ********************************************/

	_parse() {
		let self = this;
		this.rl.prompt();
		this.rl.on('line', (line) => {
			self._parseLine(line);
		});
	}

	async _parseLine(line) {
		let self = this;
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
			case 'PARSE_LOGGING':
				self._parseLogging(line);
				this.state = 'PARSE';
				break;
			case 'PARSE_USERAGENT':
				self._parseUseragent(line);
				this.state = 'PARSE';
				break;
			case 'PARSE_DOWNLOAD_FOLDER':
				self._parseDownloadFolder(line);
				this.state = 'PARSE';
				break;
			case 'PARSE_TIMEOUT':
				self._parseTimeout(line);
				this.state = 'PARSE';
				break;
			case 'PARSE_RESET':
				self._parseReset(line);
			    this.state = 'PARSE';
				break;
			case 'PARSE_GET':
				self._parseGet(line);
				this.state = 'PARSE';
				break;
			default:
				switch(command) {
					case 'exit':
					case 'quit':
						self._parseExit();
						break;
					case 'downloadfolder':
					case 'dir':
					case 'directory':
					case 'folder':
						if(commandArguments.length > 0) {
							self._parseDownloadFolder(commandArguments);
						} else {
						    console.log('What is the download folder (type cancel, exit, quit or stop to cancel)?');
							this.state = 'PARSE_DOWNLOAD_FOLDER';
						}
						break;
					case 'get':
					case 'download':
					case 'load':
					case 'url':
					case 'visit':
						if(commandArguments.length > 0) {
							self._parseGet(commandArguments);
						} else {
							console.log('Please provide the url to download (type cancel, exit, quit or stop to cancel).');
							this.state = 'PARSE_GET';
						}
						break;
					case 'help':
					case 'faq':
					case 'info':
					case 'information':
						self._parseHelp();
						break;
					case 'status':
					case 'config':
					case 'configuration':
					case 'prefs':
					case 'preferences':
					case 'settings':
					case 'state':
						console.log('Download folder : ' + this.httpDownloader.getDownloadFolder());
						console.log('Timeout         : ' + this.httpDownloader.getTimeout() + ' ms');
						console.log('Useragent       : ' + this.httpDownloader.getUserAgent());
						break;
					case 'timeout':
						if(commandArguments.length > 0) {
							self._parseTimeout(commandArguments);
						} else {
						    console.log('What should be the connection timeout (type cancel, exit, quit or stop to cancel)?');
							this.state = 'PARSE_TIMEOUT';
						}
						break;
					case 'useragent':
						if(commandArguments.length > 0) {
							self._parseUseragent(commandArguments);
						} else {
						    console.log('Please specify the useragent (type cancel, exit, quit or stop to cancel).');
							this.state = 'PARSE_USERAGENT';
						}
						break;
					case 'reset':
					    console.log('Are you sure (yes/no)?');
					    this.state = 'PARSE_RESET';
						break;
					case 'set':
						switch(subCommand) {
							case 'downloadfolder':
							case 'dir':
							case 'directory':
							case 'folder':
								if(subCommandArguments.length > 0) {
									self._parseDownloadFolder(subCommandArguments);
								} else {
								    console.log('What is the download folder (type cancel, exit, quit or stop to cancel)?');
									this.state = 'PARSE_DOWNLOAD_FOLDER';
								}
								break;
							case 'timeout':
								if(subCommandArguments.length > 0) {
									self._parseTimeout(subCommandArguments);
								} else {
								    console.log('What should be the connection timeout (type cancel, exit, quit or stop to cancel)?');
									this.state = 'PARSE_TIMEOUT';
								}
								break;
							case 'useragent':
								if(subCommandArguments.length > 0) {
									self._parseUseragent(subCommandArguments);
								} else {
								    console.log('Please specify the useragent (type cancel, exit, quit or stop to cancel).');
									this.state = 'PARSE_USERAGENT';
								}
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
							self._parseLogging(commandArguments);
						} else {
							console.log('What should the log level be?');
							console.log('Type trace, debug, info, warning, error, fatal or off.');
							console.log('Type cancel, exit, quit or stop to cancel.');
							this.state = 'PARSE_LOGGING';
						}
						break;
					default:
						console.log('Unknown command.');
						console.log('Type help for a list of available commands.');
						break;
				}
				break;
		}
		this.rl.prompt();
	}

	_parseExit() {
		console.log('Goodbye.');
		process.exit(1);
	}

	_parseHelp() {
		console.log('');
		console.log('ACTIONS: core methods that provide our HTTPDownloader capabilities.');
		console.log('');
		console.log('COMMAND ------------------------+ ALIASES -------------+ DESCRIPTION -----------------------------------+');
		console.log('get              <url>          + load, url, visit     + Get and download a http resource.              |');
		console.log('--------------------------------+----------------------+------------------------------------------------+');
		console.log('');
		console.log('CONFIGURATION / PREFERENCES: Commands to control the HTTPDownloader.');
		console.log('');
		console.log('COMMAND ------------------------+ ALIASES -------------+ DESCRIPTION -----------------------------------+');
		console.log('reset                           +                      + Reset all the settings back to their defaults. |');
		console.log('set folder       <directory>    + dir, directory,      + Set the download folder.                       |');
		console.log('                                | folder               |                                                |');
		console.log('set timeout      <number>       + timeout              + Set the connection timeout.                    |');
		console.log('set useragent    <string>       + useragent            + Set the useragent.                             |');							
		console.log('status                          + config,              + Get the current state of the HTTPDownloader.   |');
		console.log('                                | configuration,       |                                                |');
		console.log('                                | prefs, preferences   |                                                |');
		console.log('                                | settings, state      |                                                |');
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

	async _parseSave(line) {
		let self = this;
		let currentURL = this.httpDownloader.getURL();
		if(currentURL === undefined || currentURL === null || currentURL === '') {
			console.log('No resource (yet) loaded.');
		   	console.log('Use the \'get\' command to read a resource from a network location before calling \'save\'.');
			console.log('Cancelled.');
			self.rl.prompt();
			return;
		}
		let downloadFolder = null;
		if(line != undefined && line != null && line.length > 0) {
			downloadFolder = line;
		}
		let httpDownloaderOptions = {
			timeout:this.httpDownloader.getTimeout(),
			useragent:this.httpDownloader.getUserAgent(),
			downloadFolder: downloadFolder
		}
		let httpDownloader = new HTTPDownloader(httpDownloaderOptions);
		httpDownloader.downloadURL(currentURL, function(_error, _filePath) {
			if(_error) {
				console.log('Something went wrong during save.');
			} else {
				console.log('Resource saved at \'' + _filePath + '\'.');
			}
			self.rl.prompt();
		});
		// let lineLowerCase = line.toLowerCase();
		// if(lineLowerCase === 'cancel'  || lineLowerCase === 'exit' ||
		//    lineLowerCase === 'quit'    || lineLowerCase === 'stop') {
		//    	console.log('Cancelled.');
		// 	this.rl.prompt();
		// 	return;
		// }
		// try {
		// 	let persistAsString = this.domDocument.toString();
		// 	await fs.promises.writeFile(line, persistAsString, 'utf8');
		// 	console.log('File saved.');
		// } catch(_error) {
		// 	if(_error) {
		// 		console.log('Something went wrong during save.');
		// 	}
		// }
		// this.rl.prompt();
	}

	download(sourceURL, resp, contentType, callback) {
// console.log('download: ' + sourceURL);
		// First we create a path and filename based on the response and content type.
		let filePath = this._createFilePath(sourceURL, contentType);
		let fileName = this._createFileName(sourceURL, contentType);
		let fileExtension = this._createFileExtension(sourceURL, contentType);
		let url = new URL(sourceURL);
		let hostname = url.host;
// console.log('sourceURL    : ' + sourceURL);
// console.log('contentType  : ' + contentType);
// console.log('filePath     : ' + filePath);
// console.log('fileName     : ' + fileName);
// console.log('fileExtension: ' + fileExtension);

		fs.mkdir(filePath, { recursive: true }, (err) => {
			let filePathNameExtension = filePath + fileName + '.' + fileExtension;
			// console.log('attempt to save: ' + filePathNameExtension);
			let file = fs.createWriteStream(filePathNameExtension);
			let data = '';

			resp.on('error', () => {
				console.log('error');
			});

			resp.on('data', (chunk) => {
				if(contentType.startsWith('text/html')) {
					data += chunk;
				} else {
					file.write(chunk);
				}
			});

			resp.on('end', () => {
				if(contentType.startsWith('text/html')) {
					console.log('attempting to replace: ' + url.origin);
					let replacer = new RegExp(url.origin, 'g');
					data = data.replace(replacer, '');
					file.end(data);
					if(callback) {
						callback(data);
					}
				} else {
					file.end();
					if(callback) {
						callback(null);
					}
				}
			});
		});
	}

	static main() {
		try {
			let httpDownloaderOptions = HTTPDownloaderOptions.parseCommandLine();
			logging.setLevel(httpDownloaderOptions.logLevel);
			if(httpDownloaderOptions.help) {
				util.Help.print(this);
				return;
			}
			let httpDownloader = new HTTPDownloader(httpDownloaderOptions);
			let httpDownloaderCLI = new HTTPDownloaderCLI(httpDownloader);
			httpDownloaderCLI.start();
		} catch(exception) {
			console.log('EXCEPTION:'  + exception);
		}
	}
}
// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
	HTTPDownloaderCLI.main();
	return;
}

module.exports = HTTPDownloaderCLI;