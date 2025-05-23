/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-microservice-platform
 *
 * NAME
 * Application
 */
const packageName = 'dxp3-microservice-platform';
const moduleName = 'Application';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * @module dxp3-microservice-platform/Application
 */
const ApplicationOptions = require('./ApplicationOptions');
const cleanup = require('dxp3-cleanup');
const { exec, spawn } = require('child_process');
const fs = require('fs');
const logging = require('dxp3-logging');
const microservice = require('dxp3-microservice');
const os = require('os');
const util = require('dxp3-util');

const fsPromises = fs.promises;
const logger = logging.getLogger(canonicalName);
/**
 * This is the entry point to get the full suite of microservices up and running.
 * It reads options from the command line and/or from the environment.
 *
 * @example
 * const Application = require('dxp3-microservice-application/Application')
 * let application = new Application({cache:false,port:5000,protocol:'http'});
 * application.start();
 */
class Application {

	constructor(_options) {
		logger.trace('constructor(): start.');
		// The _options.environment property is used to read specific configuration for an
		// environment. Examples are: development.json, qa.json, production.json.
		// The _options.folder property is used to specify the directory containing
		// the environment configuration file.
		this._options = ApplicationOptions.parse(_options);
		if(!this._options.folder.endsWith(path.sep)) {
			this._options.folder = this._options.folder + path.sep;
		}
		// The services are defined in and read from the environment configuration
		// file and subsequently organized into our _services property Map. 
		this._services = new Map();
		// Finally after we've read our services we need a scout
		// to go out and find the required services.
		this._scout = new microservice.Scout();
		logger.trace('constructor(): end.');
	}

    /*********************************************
     * PUBLIC METHODS
     ********************************************/

	stop() {
		logger.info('Digital Experience Platform 3 - Application is stopping...');
		this._scout.stop();
	}

	async start() {
		logger.trace('start(): start.');
		logger.info('Digital Experience Platform 3 - Application is starting...');
		logger.info('*********************************');
		logger.info('* use -help for options         *');
		logger.info('*********************************');
		
		try {
			let configuration = await this._readEnvironmentFile();
            let services = configuration.services;
            for(let i=0;i < services.length;i++) {
            	let service = services[i];
            	service.name = service.name.toLowerCase();
            	service.numberFound = 0;
				if(service.replicas === undefined || service.replicas === null) {
					service.replicas = 1;
				}
            	this._services.set(service.name, service);
            }
            this._scoutServices();
            setTimeout(() => {this._startServices()}, 10000);
		} catch(_exception) {
			logger.error('start(): Something went wrong reading our configuration file.');
			logger.error('start(): ' + _exception);
		}
		logger.trace('start(): end.');
	}

    /*********************************************
     * PRIVATE METHODS
     ********************************************/

	_scoutServices() {
		logger.trace('_scoutServices(): start.');
		this._scout.on(microservice.ScoutEvent.FOUND_SCOUT, (_scout) => {
			for(let i=0;i < _scout.produces.length;i++) {
				let product = _scout.produces[i];
				let service = this._services.get(product);
				if(service === undefined || service === null) {
					continue;
				}
            	service.numberFound++;
            	if(service.numberFound === 1) {
					console.log("Found one. Currently " + service.numberFound + " producer of: " + product);
            	} else {
					console.log("Found one. Currently " + service.numberFound + " producers of: " + product);
				}
			}
		});
		this._scout.on(microservice.ScoutEvent.LOST_SCOUT, (_scout) => {
			for(let i=0;i < _scout.produces.length;i++) {
				let product = _scout.produces[i];
				let service = this._services.get(product);
				if(service === undefined || service === null) {
					continue;
				}
            	service.numberFound--;
            	if(service.numberFound === 1) {
					console.log("Lost one. Currently " + service.numberFound + " producer of: " + product);
            	} else {
					console.log("Lost one. Currently " + service.numberFound + " producers of: " + product);
				}
			}
		});
		this._scout.start();
		logger.trace('_scoutServices(): end.');
	}

	async _readEnvironmentFile() {
		logger.trace('_readEnvironmentFile(): start.');
		let result = null;
		let folder = this._options.folder;
        let fileName = this._options.environment + '.json';
        let filePath = folder + fileName;
		let fileData = null;
        try {
			logger.debug('_readEnvironmentFile(): Attempt to read file \'' + filePath + '\'.');
        	fileData = await fsPromises.readFile(filePath, 'utf-8');
        } catch(_exception) {
			logger.error('_readEnvironmentFile(): Something went wrong reading our environment file \'' + filePath + '\'.');
			logger.error('_readEnvironmentFile(): ' + _exception);
			logger.trace('_readEnvironmentFile(): end.');
        	throw _exception;
        }
        try {
            result = JSON.parse(fileData);
        } catch(_exception) {
			logger.error('_readEnvironmentFile(): Something went wrong parsing our environment configuration.');
			logger.error('_readEnvironmentFile(): ' + _exception);
			logger.trace('_readEnvironmentFile(): end.');
        	throw _exception;
        }
		logger.trace('_readEnvironmentFile(): end.');
        return result;
	}

	_startServices() {
		logger.trace('_startServices(): start.');
		for(let [product, service] of this._services) {
			if(service.numberFound >= service.replicas) {
				continue;
			}
        	let executablePath = this._options.folder + service.path;
        	let executable = service.executable;
        	let loglevel = service.loglevel;
        	let port = service.port;
        	let options = service.options;
        	let implementation = service.implementation;
        	let command = null;
        	let spawnArgs = [];
        	if(os.type().startsWith('Windows')) {
	        	// command = 'start cmd.exe /k "cd ';
	        	// command += executablePath;
	        	// command += ' & node ./';
	        	// command += executable;
	        	// if(loglevel != undefined) {
		        // 	command += ' -loglevel * ' + loglevel;
		        // }
	        	// if(port != undefined) {
		        // 	command += ' -port ' + port;
		        // }
		        // for(const optionName in options) {
		        // 	command += ' -' + optionName + ' ' + options[optionName];
		        // }
	        	// command += '"';
	        	let blaat = './' + executablePath;
	        	blaat += executable;
	        	blaat = blaat.replaceAll('/', path.sep);
	        	spawnArgs.push(blaat)
	        	if(loglevel != undefined) {
		        	spawnArgs.push('-loglevel');
		        	spawnArgs.push('"*"');
		        	spawnArgs.push(loglevel);
		        }
	        	if(port != undefined) {
		        	spawnArgs.push('-port');
		        	spawnArgs.push('' + port);
		        }
		        for(const optionName in options) {
		        	spawnArgs.push('-' + optionName);
		        	spawnArgs.push(options[optionName]);
		        }
	        } else {
	        	command = 'node ./';
	        	command += executablePath;
	        	command += executable;
	        	if(loglevel != undefined) {
		        	command += ' -loglevel "*" ' + loglevel;
		        }
	        	if(port != undefined) {
		        	command += ' -port ' + port;
		        }
		        for(const optionName in options) {
		        	command += ' -' + optionName + ' ' + options[optionName];
		        }
		        command += ' &';
		        console.log('command is: ' + command);
	        }
			for(let i=service.numberFound;i < service.replicas;i++) {
				// let subprocess = exec(command);
// console.log('spawn: ' + command);
				let subprocess = spawn('node', spawnArgs, {detached: true, stdio: 'ignore'});
				subprocess.unref();
			}
        }
		logger.trace('_startServices(): end.');
	}

    /*********************************************
     * STATIC METHODS
     ********************************************/

	static main() {
		try {
	        let applicationOptions = ApplicationOptions.parseCommandLine();
	        logging.setLevel(applicationOptions.logLevel);
	        if(applicationOptions.help) {
	        	util.Help.print(Application);
	        	return;
	        }
			let application = new Application(applicationOptions);
			// Make sure we gracefully shutdown when asked to do so.
			// We can register our own interrupt listener with the cleanup.Manager.
			cleanup.Manager.init();
			cleanup.Manager.addInterruptListener(() => {
				logger.info('Process interrupt received. Will attempt to stop.');
				application.stop();
			});
			// If the process is killed we have no time to gracefully shutdown.
			// We will at least attempt to log a warning.
			cleanup.Manager.addKillListener((_killCode) => {
				logger.warn('main(): Application killed.');
			});
			application.start();
		} catch(exception) {
			logger.fatal('main(): ' + exception.message);
			process.exit(99);
		}
	}
}
// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
	Application.main();
	return;
}
module.exports = Application;