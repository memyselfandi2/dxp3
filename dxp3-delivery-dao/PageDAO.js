/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-delivery-dao
 *
 * NAME
 * PageDAO
 */
const packageName = 'dxp3-delivery-dao';
const moduleName = 'PageDAO';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * @module dxp3-delivery-dao/PageDAO
 */
const logging = require('dxp3-logging');
const logger = logging.getLogger(canonicalName);
const rest = require('dxp3-microservice-rest');
const cache = require('dxp3-microservice-cache');
const DAOOptions = require('./DAOOptions');
const DAOError = require('./DAOError');
const util = require('dxp3-util');
/**
 * A PageDAO.
 */
class PageDAO {

	constructor(_options) {
		let self = this;
		_options = DAOOptions.parse(_options);
		self.daoServer = new rest.RestServer({name: canonicalName, produces: 'dxp3-delivery-dao-PageDAO'});
		self.cacheClient = new cache.CacheClient({name: canonicalName, consumes: 'dxp3-cache'});
		let daoImplClass = require('./' + _options.implementation + '/PageDAOImpl');
		self.daoImpl = new daoImplClass(_options.daoImplOptions);
		/**********************************
		* READ / GETTERS
		*********************************/
		self.daoServer.addMethod('Object get(String pageUUID)', function(pageUUID, response) {
			// All arguments are mandatory.
			if(arguments.length != 2) {
				// Last one will be the response
                let response = arguments[arguments.length - 1];
                return response.sendError(DAOError.ILLEGAL_ARGUMENT);
			}
			self.daoImpl.get(pageUUID, response);
		});
		self.daoServer.addMethod('String getController(String pageUUID, [String locale])', function(pageUUID, locale, response) {
			// All arguments are mandatory.
			if(arguments.length != 3) {
				// Last one will be the response
                let response = arguments[arguments.length - 1];
                return response.sendError(DAOError.ILLEGAL_ARGUMENT);
			}
			self.daoImpl.getController(pageUUID, locale, response);
		});
		self.daoServer.addMethod('File getImage(String pageUUID, String name, [String locale])', function(pageUUID, name, locale, writeStream) {
			// All arguments are mandatory.
			if(arguments.length != 4) {
				// Last one will be the response
                let response = arguments[arguments.length - 1];
                return response.sendError(DAOError.ILLEGAL_ARGUMENT);
			}
			self.daoImpl.getImage(pageUUID, name, locale, writeStream);
		});
		self.daoServer.addMethod('String getLayout(String pageUUID, [String locale])', function(pageUUID, locale, response) {
			if(arguments.length != 3) {
				// Last one will be the response
                let response = arguments[arguments.length - 1];
                return response.sendError(DAOError.ILLEGAL_ARGUMENT);
			}
			self.daoImpl.getLayout(pageUUID, locale, response);
		});
		self.daoServer.addMethod('String getLocale(String pageUUID, String name)', function(pageUUID, name, response) {
			if(arguments.length != 3) {
				// Last one will be the response
                let response = arguments[arguments.length - 1];
                return response.sendError(DAOError.ILLEGAL_ARGUMENT);
			}
			self.daoImpl.getLocale(pageUUID, name, response);
		});
		self.daoServer.addMethod('String getStyle(String pageUUID, [String locale])', function(pageUUID, locale, response) {
			if(arguments.length != 3) {
				// Last one will be the response
                let response = arguments[arguments.length - 1];
                return response.sendError(DAOError.ILLEGAL_ARGUMENT);
			}
			self.daoImpl.getStyle(pageUUID, locale, response);
		});
		self.daoServer.on('File getStyleImage(String pageUUID, String name, [String locale])', function(pageUUID, name, locale, response) {
			if(arguments.length != 4) {
				// Last one will be the response
                let response = arguments[arguments.length - 1];
                return response.sendError(DAOError.ILLEGAL_ARGUMENT);
			}
			self.daoImpl.getStyleImage(pageUUID, name, locale, response);
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
        let pageDAO = new PageDAO(daoOptions);
        pageDAO.start();
	}
}
// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
    PageDAO.main();
    return;
}

module.exports = PageDAO;