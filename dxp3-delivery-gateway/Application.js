/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-delivery-gateway
 *
 * NAME
 * Application
 */
const packageName = 'dxp3-delivery-gateway';
const moduleName = 'Application';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * @module dxp3-delivery-gateway/Application
 */
const ApplicationOptions = require('./ApplicationOptions');
const cleanup = require('dxp3-cleanup');
const fs = require('fs');
const logging = require('dxp3-logging');
const web = require('dxp3-microservice-web');
const util = require('dxp3-util');

const logger = logging.getLogger(canonicalName);
/**
 * An instance of this application will use a dxp3-microservice/WebGateway to forward
 * requests.
 */
class Application {
	/**
	 * @param {module:dxp3-delivery-gateway/ApplicationOptions} _options
	 */
	constructor(_options) {
		logger.trace('constructor(...): start.');
		_options = ApplicationOptions.parse(_options);
		logger.info('Address                   : ' + _options.address);
		logger.info('Port (may change on start): ' + _options.port);
		logger.info('Offline interval          : ' + _options.offlineInterval);
		logger.info('Domains                   : ' + _options.domains);
		logger.info('Timeout                   : ' + _options.timeout);
		logger.info('Secure                    : ' + _options.secure);
		if(_options.secure) {
			logger.info('Certificates folder       : ' + _options.certificatesFolder);
			// Ensure the certificates folder exists.
			// We perform the check synchronously, which is perfectly fine at startup.
			if(!fs.existsSync(_options.certificatesFolder)) {
				logger.fatal('Certificates folder does NOT exist. Exiting...');
				logger.trace('constructor(...): end.');
				process.exit(99);
			}
		} else {
			logger.warn('We are running in unsecure HTTP mode.');
		}
		let webGatewayOptions = {
			..._options,
			name: canonicalName,
			produces: 'dxp3-delivery-gateway',
			consumes: 'dxp3-delivery-ui,dxp3-delivery-api'
		}
		this.webGateway = new web.WebGateway(webGatewayOptions);
		this.webGateway.addRoute('/api/*', 'dxp3-delivery-api');
		this.webGateway.addRoute('*', 'dxp3-delivery-ui');
		logger.trace('constructor(...): end.');
	}

	start() {
		logger.trace('start(): start.');
		logger.info('Digital Experience Platform 3 - Delivery - Gateway is starting...');
		logger.info('*********************************');
		logger.info('* use -help for options         *');
		logger.info('*********************************');
		this.webGateway.start();
		logger.trace('start(): end.');
	}

	stop() {
		logger.info('Digital Experience Platform 3 - Delivery - Gateway is stopping...');
		this.webGateway.stop();
	}

	static main() {
		try {
	        let applicationOptions = ApplicationOptions.parseCommandLine();
	        logging.setLevel(applicationOptions.logLevel);
	        if(applicationOptions.help) {
	        	util.Help.print(this);
	        	return;
	        }
			let application = new Application(applicationOptions);
			// After we started running we print out some helpful information to the console.
			application.webGateway.on(web.WebGatewayEvent.RUNNING, function() {
				console.log('To get help include the -help option:');
				console.log('node ./Application -help');
				console.log('');
				console.log(canonicalName + ' running at port ' + application.webGateway.port);
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
			logger.error(exception);
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