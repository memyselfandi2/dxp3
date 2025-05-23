/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-delivery-ui
 *
 * NAME
 * Application
 */
const packageName = 'dxp3-delivery-ui';
const moduleName = 'Application';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * @module dxp3-delivery-ui/Application
 */
const ApplicationOptions = require('./ApplicationOptions');
const ApplicationKeys = require('./ApplicationKeys');
const BootManager = require('./BootManager');
const cleanup = require('dxp3-cleanup');
const configuration = require('dxp3-configuration');
const fs = require('fs');
const logging = require('dxp3-logging');
const web = require('dxp3-microservice-web');
const rest = require('dxp3-microservice-rest');
const routes = require('./routes/index');
const util = require('dxp3-util');

const logger = logging.getLogger(canonicalName);

class Application {

	constructor(_options) {
		logger.trace('constructor(...): start.');
		_options = ApplicationOptions.parse(_options);
		logger.info('Cache                     : ' + _options.cache);
		logger.info('Port (may change on start): ' + _options.port);
		logger.info('Secure                    : ' + _options.secure);
		if(_options.secure) {
		logger.info('Certificates folder       : ' + _options.certificatesFolder);
			// Ensure the certificates folder exists.
			// We perform the check synchronously, which is perfectly fine at startup.
			if(!fs.existsSync(_options.certificatesFolder)) {
				logger.fatal('Certificates folder does NOT exist. Exiting...');
				process.exit(99);
			}
		} else {
			logger.warn('We are running in unsecure HTTP mode.');
		}
		let webServerOptions = {
			..._options,
			name: canonicalName,
			produces: 'dxp3-delivery-ui'
		}
		this.webServer = new web.WebServer(webServerOptions);
		let domainDAOOptions = {
			name: canonicalName,
			consumes: 'dxp3-delivery-dao-domainDAO'
		}
 	    let domainDAO = new rest.RestClient(domainDAOOptions);
 		configuration.Manager.set(ApplicationKeys.DOMAIN_DAO, domainDAO);
 		BootManager.init();
		routes.init(this.webServer);
		logger.trace('constructor(...): end.');
	}

	start() {
		logger.trace('start(): start.');
		logger.info('Digital Experience Platform 3 - Delivery - UI is starting...');
		logger.info('*********************************');
		logger.info('* use -help for options         *');
		logger.info('*********************************');
		configuration.Manager.get(ApplicationKeys.DOMAIN_DAO).start();
		this.webServer.start();
		logger.trace('start(): end.');
	}

	stop() {
		logger.info('Digital Experience Platform 3 - Delivery - UI is stopping...');
		configuration.Manager.get(ApplicationKeys.DOMAIN_DAO).stop();
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
		} catch(exception) {
			console.log(exception.message);
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