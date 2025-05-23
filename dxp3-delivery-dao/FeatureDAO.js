/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-delivery-dao
 *
 * NAME
 * FeatureDAO
 */
const packageName = 'dxp3-delivery-dao';
const moduleName = 'FeatureDAO';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * @module dxp3-delivery-dao/FeatureDAO
 */
const logging = require('dxp3-logging');
const logger = logging.getLogger(canonicalName);
const rest = require('dxp3-microservice-rest');
const cache = require('dxp3-microservice-cache');
const DAOOptions = require('./DAOOptions');
const DAOError = require('./DAOError');
const util = require('dxp3-util');
/**
 * A FeatureDAO.
 */
class FeatureDAO {

	constructor(_options) {
		let self = this;
		_options = DAOOptions.parse(_options);
		self.daoServer = new rest.RestServer({name: canonicalName, produces: 'dxp3-delivery-dao-FeatureDAO'});
		self.cacheClient = new cache.CacheClient({name: canonicalName, consumes: 'dxp3-cache'});
		let daoImplClass = require('./' + _options.implementation + '/FeatureDAOImpl');
		self.daoImpl = new daoImplClass(_options.daoImplOptions);
		/**********************************
		* READ / GETTERS
		*********************************/
		self.daoServer.addMethod('Object get(String featureUUID)', function(featureUUID, response) {
			// All arguments are mandatory.
			if(arguments.length != 2) {
				// Last one will be the response
                let response = arguments[arguments.length - 1];
                return response.sendError(DAOError.ILLEGAL_ARGUMENT);
			}
			self.daoImpl.get(featureUUID, response);
		});
		self.daoServer.addMethod('String getController(String featureUUID, String instanceID, [String locale])', function(featureUUID, instanceID, locale, response) {
			// All arguments are mandatory.
			if(arguments.length != 4) {
				// Last one will be the response
                let response = arguments[arguments.length - 1];
                return response.sendError(DAOError.ILLEGAL_ARGUMENT);
			}
			self.daoImpl.getController(featureUUID, instanceID, locale, response);
		});
		self.daoServer.addMethod('File getImage(String featureUUID, String name, [String locale])', function(featureUUID, name, locale, response) {
			// All arguments are mandatory.
			if(arguments.length != 4) {
				// Last one will be the response
                let response = arguments[arguments.length - 1];
                return response.sendError(DAOError.ILLEGAL_ARGUMENT);
			}
			self.daoImpl.getImage(featureUUID, name, locale, response);
		});
		self.daoServer.on('String getLayout(String featureUUID, String instanceID, [String locale])', function(featureUUID, instanceID, locale, response) {
			if(arguments.length != 4) {
				// Last one will be the response
                let response = arguments[arguments.length - 1];
                return response.sendError(DAOError.ILLEGAL_ARGUMENT);
			}
			self.daoImpl.getLayout(featureUUID, instanceID, locale, response);
		});
		self.daoServer.addMethod('String getLocale(String featureUUID, String name)', function(featureUUID, name, response) {
			if(arguments.length != 3) {
				// Last one will be the response
                let response = arguments[arguments.length - 1];
                return response.sendError(DAOError.ILLEGAL_ARGUMENT);
			}
			self.daoImpl.getLocale(featureUUID, name, response);
		});
		self.daoServer.on('String getStyle(String featureUUID, String instanceID, [String locale])', function(featureUUID, instanceID, locale, response) {
			if(arguments.length != 4) {
				// Last one will be the response
                let response = arguments[arguments.length - 1];
                return response.sendError(DAOError.ILLEGAL_ARGUMENT);
			}
			self.daoImpl.getStyle(featureUUID, instanceID, locale, response);
		});
		self.daoServer.on('File getStyleImage(String featureUUID, String name, [String locale])', function(featureUUID, name, locale, response) {
			if(arguments.length != 4) {
				// Last one will be the response
                let response = arguments[arguments.length - 1];
                return response.sendError(DAOError.ILLEGAL_ARGUMENT);
			}
			self.daoImpl.getStyleImage(featureUUID, name, locale, response);
		});
	}

    start() {
        this.cacheClient.start();
        this.daoServer.start();
    }

	static main() {
        let daoOptions = DAOOptions.parseCommandLine();
        logging.setLevel(daoOptions.logLevel);
        if(daoOptions.help) {
            util.Help.print();
            return;
        }
        let featureDAO = new FeatureDAO(daoOptions);
        featureDAO.start();
	}
}
// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
    FeatureDAO.main();
    return;
}

module.exports = FeatureDAO;