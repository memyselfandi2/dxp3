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
	 * @param {module:dxp3-delivery-gateway/ApplicationOptions} args
	 */
	constructor(args) {
		let self = this;
		// Make sure we gracefully shutdown when asked to do so.
		// We can register our own clean up function with the cleanupManager (configured in the package.json)
		cleanup.Manager.init();
		cleanup.Manager.addKillListener(self.cleanup);
		args = ApplicationOptions.parse(args);
		logger.info('Address                   : ' + args.address);
		logger.info('Port (may change on start): ' + args.port);
		logger.info('Offline interval          : ' + args.offlineInterval);
		logger.info('Domains                   : ' + args.domains);
		logger.info('Timeout                   : ' + args.timeout);
		logger.info('Secure                    : ' + args.secure);
		if(args.secure) {
			logger.info('Certificates folder       : ' + args.certificatesFolder);
			// Ensure the certificates folder exists.
			// We perform the check synchronously, which is perfectly fine at startup.
			if(!fs.existsSync(args.certificatesFolder)) {
				logger.fatal('Certificates folder does NOT exist. Exiting...');
				process.exit(99);
			}
		} else {
			logger.warn('We are running in unsecure HTTP mode.');
		}
		let webGatewayArguments = {
			...args,
			name: canonicalName,
			produces: 'dxp3-delivery',
			consumes: 'dxp3-delivery-ui,dxp3-delivery-api'
		}
		self.webGateway = new web.WebGateway(webGatewayArguments);
		self.webGateway.addRoute('/api/*', 'dxp3-delivery-api');
		self.webGateway.addRoute('*', 'dxp3-delivery-ui');
	}

	cleanup() {
		// Currently no cleanup required.
		// If cleanup is required in the future do it here.
		logger.info('Cleanup finished.');
	}

	start() {
		let self = this;
		logger.info('Digital Experience Platform 3 - Delivery - Gateway is starting...');
		logger.info('*********************************');
		logger.info('* use -help for options         *');
		logger.info('*********************************');
		self.webGateway.start();
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