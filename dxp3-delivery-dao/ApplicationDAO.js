/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-delivery-dao
 *
 * NAME
 * ApplicationDAO
 */
const packageName = 'dxp3-delivery-dao';
const moduleName = 'ApplicationDAO';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * @module dxp3-delivery-dao/ApplicationDAO
 */
const cache = require('dxp3-microservice-cache');
const DAO = require('./DAO');
const DAOOptions = require('./DAOOptions');
const DAOError = require('./DAOError');
const logging = require('dxp3-logging');
const rest = require('dxp3-microservice-rest');
const util = require('dxp3-util');

const logger = logging.getLogger(canonicalName);

class ApplicationDAO extends DAO {

	constructor(_options) {
        super();
        let self = this;
        _options = DAOOptions.parse(_options);
        self.cacheClient = new cache.CacheClient({name: canonicalName, consumes: 'dxp3-cache'});
        let daoServerOptions = {
            name: canonicalName,
            port: _options.port,
            produces: 'dxp3-delivery-dao-ApplicationDAO',
            timeout: _options.timeout
        }
        self.daoServer = new rest.RestServer(daoServerOptions);
        let daoImplClass = require('./' + _options.implementation + '/ApplicationDAOImpl');
        self.daoImpl = new daoImplClass(_options.daoImplOptions);
        /**********************************
         * READ / GETTERS
         *********************************/
        self.daoServer.addMethod('get',
                                 'String applicationUUID',
                                 'Object',
                                 function(applicationUUID, response) {
            if(arguments.length != 2) {
                response = arguments[arguments.length - 1];
                return response.sendError(DAOError.ILLEGAL_ARGUMENT);
            }
            try {
                applicationUUID = self.parseRequiredStringArgument(applicationUUID);
            } catch(exception) {
                return response.sendError(DAOError.ILLEGAL_ARGUMENT);
            }
            self.daoImpl.get(applicationUUID, response);
        });
        self.daoServer.addMethod('String getController(String applicationUUID, [String locale])',
                                 function(applicationUUID, locale, response) {
            // As the method signature has an optional parameter, we make sure the 
            // last argument is identified as the response object.
            if(arguments.length != 3) {
                response = arguments[arguments.length - 1];
            }
            try {
                applicationUUID = self.parseRequiredStringArgument(applicationUUID);
                locale = self.parseOptionalStringArgument(locale);
            } catch(exception) {
                return response.sendError(DAOError.ILLEGAL_ARGUMENT);
            }
            let key = applicationUUID + '_controller_' + locale;
            self.cacheClient.get(key, function(err, cachedData) {
                if(err) {
                    return self.daoImpl.getController(applicationUUID, locale, response);
                }
                return response.send(null, cachedData);
            });


        });
        self.daoServer.addMethod('getImage',
                                 'String applicationUUID, String name, [String locale]',
                                 'File',
                                 function(applicationUUID, name, locale, response) {
            // As the method signature has an optional parameter, we make sure the 
            // last argument is identified as the response object.
            if(arguments.length != 4) {
                response = arguments[arguments.length - 1];
            }
            try {
                applicationUUID = self.parseRequiredStringArgument(applicationUUID);
                name = self.parseRequiredStringArgument(name);
                locale = self.parseOptionalStringArgument(locale);
            } catch(exception) {
                return response.sendError(DAOError.ILLEGAL_ARGUMENT);
            }
            self.daoImpl.getImage(applicationUUID, name, locale, response);
        });
        self.daoServer.addMethod('getStyle',
                                 'String applicationUUID, [String locale]',
                                 'String',
                                 function(applicationUUID, locale, response) {
            // As the method signature has an optional parameter, we make sure the 
            // last argument is identified as the response object.
            if(arguments.length != 3) {
                response = arguments[arguments.length - 1];
            }
            try {
                applicationUUID = self.parseRequiredStringArgument(applicationUUID);
                locale = self.parseOptionalStringArgument(locale);
            } catch(exception) {
                return response.sendError(DAOError.ILLEGAL_ARGUMENT);
            }
            self.daoImpl.getStyle(applicationUUID, locale, response);
        });
        self.daoServer.addMethod('File getStyleImage(String applicationUUID, String name, [String locale])',
                                 function(applicationUUID, name, locale, response) {
            // As the method signature has an optional parameter, we make sure the 
            // last argument is identified as the response object.
            if(arguments.length != 4) {
                response = arguments[arguments.length - 1];
            }
            try {
                applicationUUID = self.parseRequiredStringArgument(applicationUUID);
                name = self.parseRequiredStringArgument(name);
                locale = self.parseOptionalStringArgument(locale);
            } catch(exception) {
                return response.sendError(DAOError.ILLEGAL_ARGUMENT);
            }
            self.daoImpl.getStyleImage(applicationUUID, name, locale, response);
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
        let applicationDAO = new ApplicationDAO(daoOptions);
        applicationDAO.start();
    }
}
// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
    ApplicationDAO.main();
    return;
}

module.exports = ApplicationDAO;