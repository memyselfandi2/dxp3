/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-delivery-api
 *
 * NAME
 * Application
 */
const packageName = 'dxp3-delivery-api';
const moduleName = 'Application';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * @module dxp3-delivery-api/Application
 */
const ApplicationOptions = require('./ApplicationOptions');
const ApplicationKeys = require('./ApplicationKeys');
const cleanup = require('dxp3-cleanup');
const configuration = require('dxp3-configuration');
const logging = require('dxp3-logging');
const rest = require('dxp3-microservice-rest');
const web = require('dxp3-microservice-web');
const routes = require('./routes/index');
const util = require('dxp3-util');

const logger = logging.getLogger(canonicalName);
/**
 * This is the entry point to get the application programming interface up and running.
 * It reads options from the command line and/or from the environment.
 *
 * @example
 * const Application = require('dxp3-delivery-api/Application')
 * let application = new Application({cache:false,port:5000,protocol:'http'});
 * application.start();
 */
class Application {
	/**
	 * @param {Object|module:dxp3-delivery-api/ApplicationOptions} _options
	 */
	constructor(_options) {
		_options = ApplicationOptions.parse(_options);
		logger.info('Cache   : ' + _options.cache);
		logger.info('Protocol: ' + _options.protocol);
		logger.info('Port    : ' + _options.port);
		let isSecure = false;
		if(_options.protocol === 'https') {
			isSecure = true;
		}
		let webServerOptions = {
			domain: '*',
			name: canonicalName,
			produces: 'dxp3-delivery-api',
			secure: isSecure,
			port: _options.port
		}
		this.webServer = new web.WebServer(webServerOptions);
		let applicationDAOOptions = {
			name: canonicalName,
			consumes: 'dxp3-delivery-dao-applicationDAO'
		}
 	    let applicationDAO = new rest.RestClient(applicationDAOOptions);
 		configuration.Manager.set(ApplicationKeys.APPLICATION_DAO, applicationDAO);
		let pageDAOOptions = {
			name: canonicalName,
			consumes: 'dxp3-delivery-dao-pageDAO'
		}
 	    let pageDAO = new rest.RestClient(pageDAOOptions);
		configuration.Manager.set(ApplicationKeys.PAGE_DAO, pageDAO);
		routes.init(this.webServer);
	}

	start() {
		logger.info('Digital Experience Platform 3 - Delivery - API is starting...');
		logger.info('*********************************');
		logger.info('* use -help for options         *');
		logger.info('*********************************');
		configuration.Manager.get(ApplicationKeys.APPLICATION_DAO).start();
		configuration.Manager.get(ApplicationKeys.PAGE_DAO).start();
		this.webServer.start();
	}

	stop() {
		logger.info('Digital Experience Platform 3 - Delivery - API is stopping...');
		configuration.Manager.get(ApplicationKeys.APPLICATION_DAO).stop();
		configuration.Manager.get(ApplicationKeys.PAGE_DAO).stop();
		this.webServer.stop();
	}

	static main() {
		try {
	        let applicationOptions = ApplicationOptions.parseCommandLine();
	        logging.setLevel(applicationOptions.logLevel);
	        if(applicationOptions.help) {
	        	util.Help.print(Application);
	        	return;
	        }
			let application = new Application(applicationOptions);
			application.webServer.on(web.WebServerEvent.RUNNING, function() {
				console.log('To get help include the -help option:');
				console.log('node ./Application -help');
				console.log('');
				console.log(canonicalName + ' running at port ' + application.webServer.port);
			});
			// Make sure we gracefully shutdown when asked to do so.
			// We can register our own interrupt listener with the cleanup.Manager.
			cleanup.Manager.init();
			cleanup.Manager.addInterruptListener(() => {
				logger.debug('main(): Process interrupt received. Will attempt to stop.');
				application.stop();
			});
			// If the process is killed we have no time to gracefully shutdown.
			// We will at least attempt to log a warning.
			cleanup.Manager.addKillListener((_killCode) => {
				logger.warn('main(): Application killed.');
			});
			application.start();
		} catch(_exception) {
			logger.error(_exception);
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