/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-management-api
 *
 * NAME
 * Application
 */
const packageName = 'dxp3-management-api';
const moduleName = 'Application';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * @module dxp3-management-api/Application
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
 * It reads arguments from the command line and/or from the environment.
 *
 * @example
 * const Application = require('dxp3-management-api/Application')
 * let application = new Application({cache:false,port:5000,protocol:'http'});
 * application.start();
 */
class Application {

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
			name: canonicalName,
			produces: 'dxp3-management-api',
			secure: isSecure,
			port: _options.port,
			domains: '*'
		}
		this.webServer = new web.WebServer(webServerOptions);
 	    let securityClient = new rest.RestClient({name: canonicalName, consumes: 'dxp3-management-security'});
		configuration.Manager.set(ApplicationKeys.SECURITY_CLIENT, securityClient);
	    let applicationDAO = new rest.RestClient({name: canonicalName, consumes: 'dxp3-management-dao-applicationDAO'});
		configuration.Manager.set(ApplicationKeys.APPLICATION_DAO, applicationDAO);
		let compilerClient = new rest.RestClient({name: canonicalName, consumes: 'dxp3-management-compiler'});
		configuration.Manager.set(ApplicationKeys.COMPILER_CLIENT, compilerClient);
	    let controllerDAO = new rest.RestClient({name: canonicalName, consumes: 'dxp3-management-dao-controllerDAO'});
		configuration.Manager.set(ApplicationKeys.CONTROLLER_DAO, controllerDAO);
	    let imageDAO = new rest.RestClient({name: canonicalName, consumes: 'dxp3-management-dao-imageDAO'});
		configuration.Manager.set(ApplicationKeys.IMAGE_DAO, imageDAO);
	    let layoutDAO = new rest.RestClient({name: canonicalName, consumes: 'dxp3-management-dao-layoutDAO'});
		configuration.Manager.set(ApplicationKeys.LAYOUT_DAO, layoutDAO);
	    let pageDAO = new rest.RestClient({name: canonicalName, consumes: 'dxp3-management-dao-pageDAO'});
		configuration.Manager.set(ApplicationKeys.PAGE_DAO, pageDAO);
	    let styleDAO = new rest.RestClient({name: canonicalName, consumes: 'dxp3-management-dao-styleDAO'});
		configuration.Manager.set(ApplicationKeys.STYLE_DAO, styleDAO);
		routes.init(this.webServer, securityClient);
	}

    /*********************************************
     * PUBLIC METHODS
     ********************************************/

	start() {
		logger.info('Digital Experience Platform 3 - Management - API is starting...');
		logger.info('*********************************');
		logger.info('* use -help for options         *');
		logger.info('*********************************');
		this.webServer.start();
		configuration.Manager.get(ApplicationKeys.APPLICATION_DAO).start();
		configuration.Manager.get(ApplicationKeys.COMPILER_CLIENT).start();
		configuration.Manager.get(ApplicationKeys.CONTROLLER_DAO).start();
		configuration.Manager.get(ApplicationKeys.IMAGE_DAO).start();
		configuration.Manager.get(ApplicationKeys.LAYOUT_DAO).start();
		configuration.Manager.get(ApplicationKeys.PAGE_DAO).start();
		configuration.Manager.get(ApplicationKeys.SECURITY_CLIENT).start();
		configuration.Manager.get(ApplicationKeys.STYLE_DAO).start();
	}

	stop() {
		logger.info('Digital Experience Platform 3 - Management - API is stopping...');
		this.webServer.stop();
		configuration.Manager.get(ApplicationKeys.APPLICATION_DAO).stop();
		configuration.Manager.get(ApplicationKeys.COMPILER_CLIENT).stop();
		configuration.Manager.get(ApplicationKeys.CONTROLLER_DAO).stop();
		configuration.Manager.get(ApplicationKeys.IMAGE_DAO).stop();
		configuration.Manager.get(ApplicationKeys.LAYOUT_DAO).stop();
		configuration.Manager.get(ApplicationKeys.PAGE_DAO).stop();
		configuration.Manager.get(ApplicationKeys.SECURITY_CLIENT).stop();
		configuration.Manager.get(ApplicationKeys.STYLE_DAO).stop();
	}

    /*********************************************
     * STATIC METHODS
     ********************************************/

	static main() {
		try {
	        let applicationOptions = ApplicationOptions.parseCommandLine();
	        logging.setLevel(applicationOptions.logLevel);
	        if(applicationOptions.help) {
	        	util.Help.print(this);
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
			logger.fatal(_exception);
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