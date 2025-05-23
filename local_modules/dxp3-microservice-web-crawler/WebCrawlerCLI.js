/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-microservice-web-crawler
 *
 * NAME
 * WebCrawlerCLI
 */
const packageName = 'dxp3-microservice-web-crawler';
const moduleName = 'WebCrawlerCLI';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * @module dxp3-microservice-web-crawler/WebCrawlerCLI
 */
const rest = require('dxp3-microservice-rest');
const readline = require('readline');
const WebCrawler = require('./WebCrawler');
const WebCrawlerOptions = require('./WebCrawlerOptions');
const logging = require('dxp3-logging');
const util = require('dxp3-util');
/**
 * A web crawler command line interface program.
 */
class WebCrawlerCLI {

	constructor(_webCrawler) {
		this.webCrawler = _webCrawler;
	}

	start() {
		let self = this;
		const rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout,
			prompt: 'DXP3> '
		});
		console.log('');
		console.log('Use this interface to crawl url\'s.');
		this.webCrawler.on(rest.MicroServiceEvent.PAUSED, function(err) {
			console.log('Paused...');
			rl.prompt();
		});
		this.webCrawler.on(rest.MicroServiceEvent.PAUSING, function(err) {
			console.log('Pausing...');
			rl.prompt();
		});
		this.webCrawler.on(rest.MicroServiceEvent.RUNNING, function(err) {
			console.log('Running...');
			rl.prompt();
		});
		this.webCrawler.on(rest.MicroServiceEvent.STARTING, function(err) {
			console.log('Starting...');
			rl.prompt();
		});
		this.webCrawler.on(rest.MicroServiceEvent.STOPPED, function(err) {
			console.log('Stopped...');
			rl.prompt();
		});
		this.webCrawler.on(rest.MicroServiceEvent.STOPPING, function(err) {
			console.log('Stopping...');
			rl.prompt();
		});
		this.webCrawler.start();
		this.parse(rl);
	}

	parse(rl) {
		let state = 'PARSE';
		let url = null;
		let toBeProcessed = null;
		let downloadFolder = null;
		rl.prompt();
		rl.on('line', (line) => {
			line = line.trim();
			switch(state) {
				case 'PARSE_CLEAR':
				    line = line.toLowerCase();
				    if(line === 'yes' || line === 'y' || line === 'true') {
				    	this.webCrawler.clear();
				    }
				    state = 'PARSE';
				    break;
				case 'PARSE_CRAWL':
					url = line;
					if(url != 'cancel' && url != 'stop') {
						let jobID = this.webCrawler.crawl(url);
						rl.prompt();
					}
					state = 'PARSE';
					break;
				case 'PARSE_HOST':
					if(line != 'cancel' && line != 'stop') {
						let hosts = line.split(',');
						for(let i=0;i < hosts.length;i++) {
							this.webCrawler.addHost(hosts[i]);
						}
					}
					state = 'PARSE';
					break;
				case 'PARSE_DOWNLOAD_URL':
					if(line != 'cancel' || line != 'stop') {
						let jobID = this.webCrawler.download(line, downloadFolder);
					}
					state = 'PARSE';
					break;
				case 'PARSE_DOWNLOAD':
					if(line === 'cancel' || line === 'stop') {
						state = 'PARSE';
					} else {
						downloadFolder = line;
						console.log('Please provide the url to download (type cancel or stop to cancel).');
						state = 'PARSE_DOWNLOAD_URL';
					}
					break;
				default:
					let parts = line.split(' ');
					let input = parts[0];
					let inputArgs = parts[1];
					switch(input) {
						case 'crawl':
						case 'queue':
						case 'spider':
						case 'visit':
							if(inputArgs != undefined || inputArgs != null) {
								let jobID = this.webCrawler.crawl(inputArgs);
								rl.prompt();
							} else {
								console.log('Please provide the url to crawl (type cancel or stop to cancel).');
								state = 'PARSE_CRAWL';
							}
							break;
						case 'host':
						case 'hostname':
						case 'hostnames':
						case 'hosts':
						case 'domain':
						case 'domains':
							console.log('Please provide a comma separated list of hosts to limit the crawling to (type cancel or stop to cancel).');
							let hosts = this.webCrawler.getHosts();
							if(hosts.length > 0) {
								console.log('Current hosts: ' )
								for(let i=0;i < hosts.length;i++) {
									console.log(hosts[i]);
								}
							}
							state = 'PARSE_HOST';
							break;
						case 'status':
						case 'state':
							console.log(this.webCrawler.state);
							break;
						case 'pause':
							try {
								this.webCrawler.pause();
							} catch(exception) {
								console.log(exception);
							}
							break;
						case 'start':
							try {
								this.webCrawler.start();
							} catch(exception) {
								console.log(exception);
							}
							break;
						case 'stop':
							try {
								this.webCrawler.stop();
							} catch(exception) {
								console.log(exception);
							}
							break;
						case 'clear':
						    console.log('Are you sure (yes/no)?');
						    state = 'PARSE_CLEAR';
						    break;
						case 'list':
							toBeProcessed = this.webCrawler.list();
							if(toBeProcessed.length <= 0) {
								console.log('There are no URL\'s to be processed.');
							} else {
								for(let i=0;i < toBeProcessed.length;i++) {
									console.log(toBeProcessed[i]);
								}
							}
							break;
						case 'download':
							console.log('Where would you like to download to (type cancel or stop to cancel)?');
							state = 'PARSE_DOWNLOAD';
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
							console.log('clear       reset                   Clear the queue of links.');
							console.log('crawl       queue,spider,visit      Crawl an URL.');
							console.log('download                            Download content.');
							console.log('exit        quit                    Exit this program.');
							console.log('help        faq,info,information    Show this help screen.');
							console.log('host        domain                  Specify the hosts to crawl.');
							console.log('list                                Print the to be processing list.');
							console.log('pause                               Pause the crawler.');
							console.log('start                               Start the WebCrawler.');
							console.log('status      state                   Get the current state of the WebCrawler.');
							console.log('stop                                Stop the WebCrawler.');
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
			let webCrawlerOptions = WebCrawlerOptions.parseCommandLine();
			logging.setLevel(webCrawlerOptions.logLevel);
			if(webCrawlerOptions.help) {
				util.Help.print(this);
				return;
			}
			let webCrawler = new WebCrawler(webCrawlerOptions);
			let webCrawlerCLI = new WebCrawlerCLI(webCrawler);
			webCrawlerCLI.start();
		} catch(exception) {
			console.log('EXCEPTION:'  + exception);
		}
	}
}
// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
	WebCrawlerCLI.main();
	return;
}

module.exports = WebCrawlerCLI;