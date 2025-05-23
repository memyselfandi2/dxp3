 /*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-net-http
 *
 * NAME
 * HTTPSpiderCLI
 */
const packageName = 'dxp3-net-http';
const moduleName = 'HTTPSpiderCLI';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * @module dxp3-net-http/SpiderCLI
 */
const readline = require('readline');
const HTTPError = require('./HTTPError');
const HTTPSpider = require('./HTTPSpider');
const HTTPSpiderEvent = require('./HTTPSpiderEvent');
const HTTPSpiderOptions = require('./HTTPSpiderOptions');
const logging = require('dxp3-logging');
const util = require('dxp3-util');
/**
 * A HTTPSpider command line interface program.
 */
class HTTPSpiderCLI {

	constructor(_httpSpider) {
		this.httpSpider = _httpSpider;
		this.rl = null;
		this.originalDownloadFolder = this.httpSpider.getDownloadFolder();
		this.originalFilterContentTypes = this.httpSpider.getFilterContentTypes();
		this.originalFilterPaths = this.httpSpider.getFilterPaths();
		this.originalFilterStatusCodes = this.httpSpider.getFilterStatusCodes();
		this.originalFollowRedirects = this.httpSpider.getFollowRedirects();
		this.originalRatelimit = this.httpSpider.getRateLimit();
		this.originalTimeout = this.httpSpider.getTimeout();
		this.originalUserAgent = this.httpSpider.getUserAgent();
		this.state = 'PARSE';
		this.filterStatusCodes = null;
		this.filterContentTypes = null;
		this.filterPaths = null;
		this.followHost = null;
	}

	start() {
		this.rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout,
			prompt: 'DXP3-HTTP> '
		});
		console.log('');
		console.log('Use this interface to crawl url\'s.');
		console.log('Type help for a list of available commands.');
		this.rl.prompt();
		this.httpSpider.on(HTTPSpiderEvent.JOB_FINISHED, (id, url) => {
			console.log('Job finished: ' + id + ': ' + url);
			this.rl.prompt();
		});
		this.httpSpider.on(HTTPSpiderEvent.JOB_QUEUED, (id, url) => {
			console.log('Job queued: ' + id + ': ' + url);
			this.rl.prompt();
		});
		this.httpSpider.on(HTTPSpiderEvent.PAUSED, (err) => {
			console.log('Paused.');
			this.rl.prompt();
		});
		this.httpSpider.on(HTTPSpiderEvent.PAUSING, (err) => {
			console.log('Pausing...');
			this.rl.prompt();
		});
		this.httpSpider.on(HTTPSpiderEvent.RUNNING, (err) => {
			console.log('Running...');
			this.rl.prompt();
		});
		this.httpSpider.on(HTTPSpiderEvent.STARTING, (err) => {
			console.log('Starting...');
			this.rl.prompt();
		});
		this.httpSpider.on(HTTPSpiderEvent.STOPPED, (err) => {
			console.log('Stopped.');
			this.rl.prompt();
		});
		this.httpSpider.on(HTTPSpiderEvent.STOPPING, (err) => {
			console.log('Stopping...');
			this.rl.prompt();
		});
		this.httpSpider.on(HTTPSpiderEvent.FOUND_INVALID_LINK, (source, destination) => {
			console.log('Found invalid link: ' + source + ' -> ' + destination);
			this.rl.prompt();
		});
		this.httpSpider.on(HTTPSpiderEvent.FOUND_LINK, (source, destination, contentType, statusCode) => {
			console.log('Found link: ' + statusCode + ': ' + contentType + ': ' + source + ' -> ' + destination);
			this.rl.prompt();
		});
		this.httpSpider.on(HTTPSpiderEvent.FOUND_REDIRECT, (source, destination, location, statusCode) => {
			console.log('Found redirect: ' + statusCode + ': ' + source + ' -> ' + destination + ' -> ' + location);
			this.rl.prompt();
		});
		this.httpSpider.on(HTTPSpiderEvent.FOUND_DEAD_LINK, (source, destination) => {
			console.log('Found dead link: 404: ' + source + ' -> ' + destination);
			this.rl.prompt();
		});
		this.httpSpider.on(HTTPSpiderEvent.TO_BE_FOLLOWED_LINK, (source, destination, contentType) => {
//			console.log('To be followed: ' + source + ' -> ' + destination);
			this.rl.prompt();
		});
		this.httpSpider.on(HTTPSpiderEvent.FOLLOWING_LINK, (sourceURLString, destinationURLString) => {
//			console.log('Following: ' + sourceURLString + ' -> ' + destinationURLString);
			this.rl.prompt();
		});
		this.httpSpider.on(HTTPSpiderEvent.FOLLOWED_LINK, (source, destination, contentType, statusCode) => {
//			console.log('Followed : ' + statusCode + ': ' + contentType + ': ' + source + ' -> ' + destination);
			this.rl.prompt();
		});
		this.httpSpider.on(HTTPSpiderEvent.IGNORED_LINK, (sourceURLString, destinationURLString, contentType) => {
//			console.log('Ignored: ' + sourceURLString + ' -> ' + destinationURLString);
			this.rl.prompt();
		});
		this._parse();
	}

    /*********************************************
     * PRIVATE METHODS
     ********************************************/

	_parse() {
		this.rl.prompt();
		this.rl.on('line', (line) => {
			this._parseLine(line);
		});
	}

	async _parseLine(line) {
		let command = null;
		let commandArguments = null;
		let subCommand = null;
		let subCommandArguments = null;
		let lineLowerCase = null;
		line = line.trim();
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
			case 'PARSE_CLEAR':
				this._parseClear(line);
			    this.state = 'PARSE';
			    break;
			case 'PARSE_FILTER':
				switch(line) {
					case '1':
					case 'code':
					case 'codes':
					case 'status':
					case 'statuscode':
					case 'statuscodes':
						console.log('What http status codes would you like to include (enter or * for all)?');
						this.state = 'PARSE_FILTER_STATUS_CODES';
						break;
					case '2':
					case 'contenttype':
					case 'contenttypes':
					case 'content':
					case 'type':
					case 'types':
						console.log('What content types would you like to include (enter or * for all)?');
						this.state = 'PARSE_FILTER_CONTENT_TYPES';
						break;
					case '3':
					case 'path':
					case 'paths':
					case 'route':
					case 'routes':
					case 'url':
					case 'urls':
						console.log('What paths would you like to include (enter or * for all)?');
						this.state = 'PARSE_FILTER_PATHS';
						break;
					default:
						console.log('Unknown command.');
						console.log('Type help for a list of available commands.');
						this.state = 'PARSE';
						break;
				}
				break;
			case 'PARSE_FILTER_CONTENT_TYPES':
				this._parseFilterContentTypes(line);
				this.state = 'PARSE';
				break;
			case 'PARSE_FILTER_PATHS':
				this._parseFilterPaths(line);
				this.state = 'PARSE';
				break;
			case 'PARSE_FILTER_STATUS_CODES':
				this._parseFilterStatusCodes(line);
				this.state = 'PARSE';
				break;
			case 'PARSE_FOLLOW':
				switch(line) {
					case '1':
					case 'host':
					case 'domain':
						console.log('What domain should we follow (Use . for the start domain)?');
						this.state = 'PARSE_FOLLOW_HOSTS';
						break;
					case '2':
						case 'redirect':
						case 'redirects':
						case 'redirection':
						case 'redirections':
						console.log('Should we follow redirects (type cancel, exit, quit or stop to cancel)?');
						this.state = 'PARSE_FOLLOW_REDIRECTS';
						break;
					default:
						console.log('Unknown command.');
						console.log('Type help for a list of available commands.');
						this.state = 'PARSE';
						break;
				}
				break;
			case 'PARSE_FOLLOW_HOSTS':
				this.followHost = line;
				console.log('What paths should we follow?');
				this.state = 'PARSE_FOLLOW_HOSTS_PATHS';
				break;
			case 'PARSE_FOLLOW_HOSTS_PATHS':
				this._parseFollowHost(this.followHost, line);
				this.state = 'PARSE';
				break;
			case 'PARSE_FOLLOW_REDIRECTS':
				this._parseFollowRedirects(line);
				this.state = 'PARSE';
				break;
			case 'PARSE_LOGGING':
				this._parseLogging(line);
				this.state = 'PARSE';
				break;
			case 'PARSE_QUEUE':
				this._parseQueue(line);
				this.state = 'PARSE';
				break;
			case 'PARSE_RATE_LIMIT':
				this._parseRateLimit(line);
				this.state = 'PARSE';
				break;
			case 'PARSE_RESET':
				this._parseReset(line);
				this.state = 'PARSE';
				break;
			case 'PARSE_TIMEOUT':
				this._parseTimeout(line);
				this.state = 'PARSE';
				break;
			case 'PARSE_USERAGENT':
				this._parseUseragent(line);
				this.state = 'PARSE';
				break;
			case 'PARSE_DOWNLOAD_FOLDER':
				this._parseDir(line);
				this.state = 'PARSE';
				break;
			default:
				switch(command) {
					case 'clear':
					    console.log('Are you sure (yes/no)?');
					    this.state = 'PARSE_CLEAR';
					    break;
					case 'config':
					case 'configuration':
					case 'prefs':
					case 'preferences':
					case 'settings':
					case 'state':
					case 'status':
						this._parseConfig();
						break;
					case 'faq':
					case 'help':
					case 'info':
					case 'information':
						this._parseHelp();
						break;
					case 'list':
						this._parseList();
						break;
					case 'filter':
						switch(subCommand) {
							case 'code':
							case 'codes':
							case 'status':
							case 'statuscode':
							case 'statuscodes':
								if(subCommandArguments.length > 0) {
									this._parseFilterStatusCodes(subCommandArguments);
								} else {
									console.log('What http status codes would you like to include (enter or * for all)?');
									this.state = 'PARSE_FILTER_STATUS_CODES';
								}
								break;
							case 'contenttype':
							case 'contenttypes':
							case 'content':
							case 'type':
							case 'types':
								if(subCommandArguments.length > 0) {
									this._parseFilterContentTypes(subCommandArguments);
								} else {
									console.log('What content types would you like to include (enter or * for all)?');
									this.state = 'PARSE_FILTER_CONTENT_TYPES';
								}
								break;
							case 'path':
							case 'paths':
							case 'route':
							case 'routes':
							case 'url':
							case 'urls':
								if(subCommandArguments.length > 0) {
									this._parseFilterPaths(subCommandArguments);
								} else {
									console.log('What paths would you like to include (enter or * for all)?');
									this.state = 'PARSE_FILTER_PATHS'
								}
								break;
							case '':
								console.log('Do you want to filter by 1) statuscodes, 2) contenttypes or 3) paths?');
								this.state = 'PARSE_FILTER';
								break;
							default:
								console.log('Unknown command.');
								console.log('Type help for a list of available commands.');									
								break;

						}
						break;
					case 'pause':
						this._parsePause();
						break;
					case 'queue':
					case 'crawl':
					case 'spider':
					case 'visit':
						if(commandArguments.length > 0) {
							this._parseQueue(commandArguments);
						} else {
							console.log('Please provide the url to crawl (type cancel or stop to cancel).');
							this.state = 'PARSE_QUEUE';
						}
						break;
					case 'rate':
					case 'ratelimit':
					case 'throttle':
					case 'wait':
						if(commandArguments.length > 0) {
							this._parseRateLimit(commandArguments);
						} else {
						    console.log('What should be the wait time between requests (type cancel or stop to cancel)?');
							this.state = 'PARSE_RATE_LIMIT';
						}
						break;
					case 'redirect':
					case 'redirects':
					case 'redirection':
					case 'redirections':
						if(commandArguments.length > 0) {
							this._parseFollowRedirects(commandArguments);
						} else {
							console.log('Should we follow redirects (type cancel, exit, quit or stop to cancel)?');
							this.state = 'PARSE_FOLLOW_REDIRECTS';
						}
						break;
					case 'start':
						this._parseStart();
						break;
					case 'stop':
						this._parseStop();
						break;
					case 'timeout':
						if(commandArguments.length > 0) {
							this._parseTimeout(commandArguments);
						} else {
						    console.log('What should be the connection timeout (type cancel, exit, quit or stop to cancel)?');
							this.state = 'PARSE_TIMEOUT';
						}
						break;
					case 'useragent':
						if(commandArguments.length > 0) {
							this._parseUseragent(commandArguments);
						} else {
						    console.log('Please specify the useragent (type cancel, exit, quit or stop to cancel).');
							this.state = 'PARSE_USERAGENT';
						}
						break;
					case 'add':
						switch(subCommand) {
							case 'host':
							case 'domain':
								if(parts.length >= 4) {
									this._parseFollowHost(parts[2], parts[3]);
								} else if(parts.length === 3) {
									this._parseFollowHost(parts[2], '.');
								} else {
									console.log('What domain should we follow (Use . for the start domain)?');
									this.state = 'PARSE_FOLLOW_HOSTS';
								}
								break;
							default:
								console.log('Unknown command.');
								console.log('Type help for a list of available commands.');									
								break;

						}
						break;
					case 'follow':
						switch(subCommand) {
							case 'host':
							case 'domain':
								if(parts.length >= 4) {
									this._parseFollowHost(parts[2], parts[3]);
								} else if(parts.length === 3) {
									this._parseFollowHost(parts[2], '.');
								} else {
									console.log('What domain should we follow (Use . for the start domain)?');
									this.state = 'PARSE_FOLLOW_HOSTS';
								}
								break;
							case 'redirect':
							case 'redirects':
							case 'redirection':
							case 'redirections':
								if(subCommandArguments.length > 0) {
									this._parseFollowRedirects(subCommandArguments);
								} else {
									console.log('Should we follow redirects (type cancel, exit, quit or stop to cancel)?');
									this.state = 'PARSE_FOLLOW_REDIRECTS';
								}
								break;
							case '':
								console.log('Do you want to follow 1) hosts, or 2) redirects (type cancel, exit, quit or stop to cancel)?');
								this.state = 'PARSE_FOLLOW';
								break;
							default:
								console.log('Unknown command.');
								console.log('Type help for a list of available commands.');									
								break;

						}
						break;
					case 'dir':
					case 'directory':
					case 'download':
					case 'downloadfolder':
					case 'folder':
						if(commandArguments.length > 0) {
							this._parseDir(commandArguments);
						} else {
							console.log('Where do you want to download to?');
							this.state = 'PARSE_DOWNLOAD_FOLDER';
						}
						break;
					case 'exit':
					case 'quit':
						this._parseExit();
						break;
					case 'reset':
					    console.log('Are you sure (yes/no)?');
					    this.state = 'PARSE_RESET';
						break;
					case 'set':
						switch(subCommand) {
							case 'dir':
							case 'directory':
							case 'download':
							case 'downloadfolder':
							case 'folder':
								if(subCommandArguments.length > 0) {
									this._parseDir(subCommandArguments);
								} else {
									console.log('Where do you want to download to?');
									this.state = 'PARSE_DOWNLOAD_FOLDER';
								}
								break;
							case 'filtercode':
							case 'filtercodes':
							case 'filterstatus':
							case 'filterstatuscode':
							case 'filterstatuscodes':
								if(subCommandArguments.length > 0) {
									this._parseFilterStatusCodes(subCommandArguments);
								} else {
									console.log('What http status codes would you like to include (enter or * for all)?');
									this.state = 'PARSE_FILTER_STATUS_CODES';
								}
								break;
							case 'filtercontenttype':
							case 'filtercontenttypes':
							case 'filtercontent':
							case 'filtertype':
							case 'filtertypes':
								if(subCommandArguments.length > 0) {
									this._parseFilterContentTypes(subCommandArguments);
								} else {
									console.log('What content types would you like to include (enter or * for all)?');
									this.state = 'PARSE_FILTER_CONTENT_TYPES';
								}
								break;
							case 'filterpath':
							case 'filterpaths':
							case 'filterroute':
							case 'filterroutes':
							case 'filterurl':
							case 'filterurls':
								if(subCommandArguments.length > 0) {
									this._parseFilterPaths(subCommandArguments);
								} else {
									console.log('What paths would you like to include (enter or * for all)?');
									this.state = 'PARSE_FILTER_PATHS'
								}
								break;
							case 'followredirects':
							case 'redirect':
							case 'redirects':
							case 'redirection':
							case 'redirections':
								if(subCommandArguments.length > 0) {
									this._parseFollowRedirects(subCommandArguments);
								} else {
									console.log('Should we follow redirects (type cancel, exit, quit or stop to cancel)?');
									this.state = 'PARSE_FOLLOW_REDIRECTS';
								}
								break;
							case 'rate':
							case 'ratelimit':
							case 'throttle':
							case 'wait':
								if(subCommandArguments.length > 0) {
									this._parseRateLimit(subCommandArguments);
								} else {
								    console.log('What should be the wait time between requests (type cancel or stop to cancel)?');
									this.state = 'PARSE_RATE_LIMIT';
								}
								break;
							case 'timeout':
								if(subCommandArguments.length > 0) {
									this._parseTimeout(subCommandArguments);
								} else {
								    console.log('What should be the connection timeout (type cancel, exit, quit or stop to cancel)?');
									this.state = 'PARSE_TIMEOUT';
								}
								break;
							case 'useragent':
								if(subCommandArguments.length > 0) {
									this._parseUseragent(subCommandArguments);
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
							this._parseLogging(commandArguments);
						} else {
							console.log('What should the log level be?');
							console.log('One of trace, debug, info, warning, error, fatal or off.');
							console.log('Type cancel, exit, quit or stop to cancel.');
							this.state = 'PARSE_LOGGING';
						}
						break;
					default:
						console.log('Unknown command. Type help to get an overview of known commands.');
						break;
				}
				break;
		}
		this.rl.prompt();
	}

	_parseClear(line) {
		let lineLowerCase = line.toLowerCase();
	    if(lineLowerCase === 'yes' || lineLowerCase === 'y' || lineLowerCase === 'true') {
	    	this.httpSpider.clear();
	    	console.log('Cleared.');
	    } else {
		   	console.log('Cancelled.');
		}
		this.rl.prompt();
	}

	_parseConfig() {
		console.log('Download folder        : ' + this.httpSpider.getDownloadFolder());
		let contentTypes = this.httpSpider.getFilterContentTypes();
		if(contentTypes === undefined || contentTypes === null) {
			contentTypes = '*';
		} else if(Array.isArray(contentTypes)) {
			if(contentTypes.length <= 0) {
				contentTypes = '*';
			}
		}
		console.log('Filter by content types: ' + contentTypes);
		let statusCodes = this.httpSpider.getFilterStatusCodes();
		if(statusCodes === undefined || statusCodes === null) {
			statusCodes = '*';
		} else if(Array.isArray(statusCodes)) {
			if(statusCodes.length <= 0) {
				statusCodes = '*';
			}
		}
		console.log('Filter by status codes : ' + statusCodes);
		let paths = this.httpSpider.getFilterPaths();
		if(paths === undefined || paths === null) {
			paths = '*';
		} else if(Array.isArray(paths)) {
			if(paths.length <= 0) {
				paths = '*';
			}
		}
		console.log('Filter by paths        : ' + paths);
		let followHosts = this.httpSpider.getFollowHosts();
		if(followHosts === undefined || followHosts === null) {
		console.log('Follow hosts           : ');
		} else {
			let i=0;
			for(const [key, value] of followHosts) {
				let followHost = followHosts[i];
				if(i === 0) {
		console.log('Follow hosts           : ' + key + ' -> ' + value);
				} else {
		console.log('                         ' + key + ' -> ' + value);
				}
				i++;
			}
		}
		console.log('Follow redirects       : ' + this.httpSpider.getFollowRedirects());
		console.log('Ratelimit              : ' + this.httpSpider.getRateLimit() + ' ms');
		console.log('State                  : ' + this.httpSpider.getState());
		console.log('Timeout                : ' + this.httpSpider.getTimeout() + ' ms');
		console.log('Useragent              : ' + this.httpSpider.getUserAgent());
		this.rl.prompt();
	}

	_parseDir(line) {
		let lineLowerCase = line.toLowerCase();
		if(lineLowerCase === 'cancel'  || lineLowerCase === 'exit' ||
		   lineLowerCase === 'quit'    || lineLowerCase === 'stop' || lineLowerCase === '') {
		   	console.log('Cancelled.');
			this.rl.prompt();
			return;
		}
		this.httpSpider.setDownloadFolder(line);
		console.log('Download folder set to \'' + this.httpSpider.getDownloadFolder() + '\'.');
	}

	_parseExit() {
		console.log('Goodbye.');
		process.exit(1);
	}

	_parseFilterContentTypes(line) {
		line = line.toLowerCase();
		if(line === 'cancel'  || line === 'exit' ||
		   line === 'quit'    || line === 'stop') {
		   	console.log('Cancelled.');
			this.rl.prompt();
			return;
		}
		if(line.length <= 0 || line === '*') {
			this.httpSpider.setFilterContentTypes(null);
			console.log('Filter content types set to \'*\'.');
			this.rl.prompt();
			return;			
		}
		this.filterContentTypes = line.split(',');
		this.httpSpider.setFilterContentTypes(this.filterContentTypes);
		console.log('Filter content types set to \'' + this.httpSpider.getFilterContentTypes() + '\'.');
		this.rl.prompt();
	}

	_parseFilterStatusCodes(line) {
		line = line.toLowerCase();
		if(line === 'cancel'  || line === 'exit' ||
		   line === 'quit'    || line === 'stop') {
		   	console.log('Cancelled.');
			this.rl.prompt();
			return;
		}
		if(line.length <= 0 || line === '*') {
			this.httpSpider.setFilterStatusCodes(null);
			console.log('Filter status codes set to \'*\'.');
			this.rl.prompt();
			return;			
		}
		this.filterStatusCodes = line.split(',');
		this.httpSpider.setFilterStatusCodes(this.filterStatusCodes);
		console.log('Filter status codes set to \'' + this.httpSpider.getFilterStatusCodes() + '\'.');
		this.rl.prompt();
	}

	_parseFilterPaths(line) {
		line = line.toLowerCase();
		if(line === 'cancel'  || line === 'exit' ||
		   line === 'quit'    || line === 'stop') {
		   	console.log('Cancelled.');
			this.rl.prompt();
			return;
		}
		if(line.length <= 0 || line === '*') {
			this.httpSpider.setFilterPaths(null);
			console.log('Filter paths set to \'*\'.');
			this.rl.prompt();
			return;			
		}
		this.filterPaths = line.split(',');
		this.httpSpider.setFilterPaths(this.filterPaths);
		console.log('Filter paths set to \'' + this.httpSpider.getFilterPaths() + '\'.');
		this.rl.prompt();
	}

	_parseFollowRedirects(line) {
		line = line.toLowerCase();
		if(line === 'cancel'  || line === 'exit' ||
		   line === 'quit'    || line === 'stop' || line === '') {
		   	console.log('Cancelled.');
			this.rl.prompt();
			return;
		}
		if(line === 'y' || line === 'yes' || line === 'on' || line === 'true') {
			this.httpSpider.setFollowRedirects(true);
		} else {
			this.httpSpider.setFollowRedirects(false);
		}
		console.log('Follow redirects is set to \'' + this.httpSpider.getFollowRedirects() + '\'.');
		this.rl.prompt();
	}

	_parseFollowHost(hostName, path) {
		this.httpSpider.addFollowHost(hostName,path);
	}

	_parseList() {

	}

	_parseHelp() {
		// Clear the scroll buffer.
		process.stdout.write('\u001b[3J\u001b[1J');
		// Clear the window.
		console.clear();
		console.log('HTTPSpider:');
		console.log('Use this command line interface to crawl websites.');
		console.log('A spider uses two main settings:1) what to follow, 2) what to filter.');
		console.log('The follow settings define what sites and what pages will be visited.');
		console.log('The filter settings define what the spider will report out: 404 links, images, etc.');
		console.log('');
		console.log('ACTIONS: core methods that provide our HTTPSpider capabilities.');
		console.log('');
		console.log('COMMAND -----------------------------+ ALIASES -------------+ DESCRIPTION -----------------------------------+');
		console.log('queue                                + crawl, spider, visit + Crawl an URL.                                  |');
		console.log('clear                                +                      + Clear the queue of links.                      |');
		console.log('list                                 +                      + List the to be processed url\'s.                |');
		console.log('-------------------------------------+----------------------+------------------------------------------------+');
		console.log('');
		console.log('CONFIGURATION / PREFERENCES: Commands to control the HTTPSpider.');
		console.log('');
		console.log('COMMAND -----------------------------+ ALIASES -------------+ DESCRIPTION -----------------------------------+');
		console.log('filter statuscodes  <code>           + filter codes,        + Filter the results by status code.             |');
		console.log('                                     | filter status        | For example: 200, 300, 404, etc.               |');
		console.log('                                     |                      | Common wildcard notation using xx is also      |');
		console.log('                                     |                      | supported. For example: 4xx, 5xx, etc.         |');
		console.log('filter contenttypes <type>           + filter types         + Filter the results by content type.            |');
		console.log('                                     |                      | For example: image/*, text/javascript, etc.    |');
		console.log('filter paths        <regex>          + filter routes,       + Filter the results by path (comma separated).  |');
		console.log('                                     | filter urls          | For example: /images/*, *.pdf, etc.            |');
		console.log('follow host        <domain> <path>   + add host,            + Add to the list of hosts/domains allowed to be |');
		console.log('                                     | add domain, domain   | visited. Each host requires a path as well.    |');
		console.log('reset                                +                      + Reset all the settings back to their           |');
		console.log('                                     |                      | defaults.                                      |');
		console.log('set downloadfolder  <path>           + dir, directory,      + Set the download directory.                    |');
		console.log('                                     | downloadfolder,      |                                                |');
		console.log('                                     | folder,              |                                                |');
		console.log('                                     | set dir,             |                                                |');
		console.log('                                     | set directory,       |                                                |');
		console.log('                                     | set folder,          |                                                |');
		console.log('set ratelimit       <number>         + rate,throttle,       + Set the ratelimit in milliseconds.             |');
		console.log('                                     | wait                 | This is the wait time between requests.        |');
		console.log('set followredirects <boolean>        + follow redirects,    + Specify if a HTTPSpider should or should not   |');
		console.log('                                     | redirects,           | follow redirects.                              |');							
		console.log('                                     | redirections,        |                                                |');							
		console.log('                                     | set redirects,       |                                                |');							
		console.log('                                     | set redirections     |                                                |');							
		console.log('set timeout         <number>         + timeout              + Set the connection timeout.                    |');
		console.log('set useragent       <string>         + useragent            + Set the useragent.                             |');							
		console.log('status                               + config,              + Get the current state of the HTTPSpider.       |');
		console.log('                                     | configuration,       |                                                |');
		console.log('                                     | prefs, preferences   |                                                |');
		console.log('                                     | settings, state      |                                                |');
		console.log('-------------------------------------+----------------------+------------------------------------------------+');
		console.log('');
		console.log('PROCESS FLOW: Commands to start and stop the HTTPSpider.');
		console.log('');
		console.log('COMMAND -----------------------------+ ALIASES -------------+ DESCRIPTION -----------------------------------+');
		console.log('start                                +                      + Start the HTTPSpider.                          |');
		console.log('pause                                +                      + Pause the HTTPSpider.                          |');
		console.log('stop                                 +                      + Stop the HTTPSpider.                           |');
		console.log('-------------------------------------+----------------------+------------------------------------------------+');
		console.log('');
		console.log('PROGRAM FLOW: Commands to control this command line interface program.');
		console.log('');
		console.log('COMMAND -----------------------------+ ALIASES -------------+ DESCRIPTION -----------------------------------+');
		console.log('exit                                 + quit                 + Exit this program.                             |');
		console.log('help                                 + faq, info,           + Show this help screen.                         |');
		console.log('                                     | information          |                                                |');
		console.log('loglevel            <level>          + log, logger, logging + Set the log level.                             |');
		console.log('                                     |                      | One of trace, debug, info, warning, error,     |');
		console.log('                                     |                      | fatal or off.                                  |');
		console.log('-------------------------------------+----------------------+------------------------------------------------+');
		console.log('');
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

	_parsePause() {
		if(this.httpSpider.isPaused()) {
			console.log('The HTTPSpider is already paused.');
			this.rl.prompt();
			return;
		}
		if(this.httpSpider.isPausing()) {
			console.log('The HTTPSpider is already pausing.');
			this.rl.prompt();
			return;
		}
		try {
			this.httpSpider.pause();
		} catch(_exception) {
			if(HTTPError.ILLEGAL_STATE.equals(_exception)) {
				console.log('Unable to pause the spider in the current \'' + this.httpSpider.getState() + '\' state.');
			} else {
				console.log(_exception);
			}
			this.rl.prompt();
		}
	}

	_parseQueue(line) {
		let lineLowerCase = line.toLowerCase();
		if(lineLowerCase === 'cancel'  || lineLowerCase === 'exit' ||
		   lineLowerCase === 'quit'    || lineLowerCase === 'stop' || lineLowerCase === '') {
		   	console.log('Cancelled.');
			this.rl.prompt();
			return;
		}
		this.httpSpider.crawl(line);
		this.rl.prompt();
	}

	_parseRateLimit(line) {		
		let lineLowerCase = line.toLowerCase();
		if(lineLowerCase === 'cancel'  || lineLowerCase === 'exit' ||
		   lineLowerCase === 'quit'    || lineLowerCase === 'stop' || lineLowerCase === '') {
		   	console.log('Cancelled.');
			this.rl.prompt();
			return;
		}
		let rateLimit = parseInt(line);
		if(isNaN(rateLimit)) {
			console.log('Ratelimit must be a number.');
			console.log('Cancelled.');
		} else {
			this.httpSpider.setRateLimit(rateLimit);
				console.log('Ratelimit set to \'' + rateLimit + ' ms\'.');
		}
		this.rl.prompt();
	}

	_parseReset(line) {
		line = line.toLowerCase();
	    if(line != 'yes' && line != 'y' && line != 'true') {
	    	console.log('Cancelled.');
	    	this.rl.prompt();
	    	return;
	    }
    	this.httpSpider.setDownloadFolder(this.originalDownloadFolder);
    	this.httpSpider.setFilterContentTypes(this.originalFilterContentTypes);
    	this.httpSpider.setFilterPaths(this.originalFilterPaths);
    	this.httpSpider.setFilterStatusCodes(this.originalFilterStatusCodes);
    	this.httpSpider.setFollowRedirects(this.originalFollowRedirects);
    	this.httpSpider.setRateLimit(this.originalRatelimit);
    	this.httpSpider.setTimeout(this.originalTimeout);
    	this.httpSpider.setUserAgent(this.originalUserAgent);
    	console.log('Reset.');
    	this._parseConfig();
	}

	_parseStart() {
		if(this.httpSpider.isRunning()) {
			console.log('The HTTPSpider is already running.');
			this.rl.prompt();
			return;
		}
		if(this.httpSpider.isStarting()) {
			console.log('The HTTPSpider is already starting.');
			this.rl.prompt();
			return;
		}
		try {
			this.httpSpider.start();
		} catch(_exception) {
			console.log(_exception);
			this.rl.prompt();
		}
	}

	_parseStop() {
		if(this.httpSpider.isStopped()) {
			console.log('The HTTPSpider is already stopped.');
			this.rl.prompt();
			return;
		}
		if(this.httpSpider.isStopping()) {
			console.log('The HTTPSpider is already stopping.');
			this.rl.prompt();
			return;
		}
		try {
			this.httpSpider.stop();
		} catch(_exception) {
			console.log(_exception);
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
			this.httpSpider.setTimeout(timeout);
			console.log('Timeout set to \'' + timeout + ' ms\'.');
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
		this.httpSpider.setUserAgent(line);
		console.log('Useragent is set to \'' + this.httpSpider.getUserAgent() + '\'.');
		this.rl.prompt();
	}

	static main() {
		try {
			let httpSpiderOptions = HTTPSpiderOptions.parseCommandLineOptions();
			logging.setLevel(httpSpiderOptions.logLevel);
			if(httpSpiderOptions.help) {
				util.Help.print(HTTPSpiderCLI);
				return;
			}
			let httpSpider = new HTTPSpider(httpSpiderOptions);
			let httpSpiderCLI = new HTTPSpiderCLI(httpSpider);
			httpSpiderCLI.start();
		} catch(exception) {
			console.log('EXCEPTION:'  + exception);
		}
	}
}
// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
	HTTPSpiderCLI.main();
	return;
}
module.exports = HTTPSpiderCLI;