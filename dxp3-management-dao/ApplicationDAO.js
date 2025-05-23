/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-management-dao
 *
 * NAME
 * ApplicationDAO
 */
const packageName = 'dxp3-management-dao';
const moduleName = 'ApplicationDAO';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * @module dxp3-management-api/DAODefaults
 */
const DAOOptions = require('./DAOOptions');
const DAOError = require('./DAOError');
const DAOUtil = require('./DAOUtil');
const logging = require('dxp3-logging');
const rest = require('dxp3-microservice-rest');
const util = require('dxp3-util');

const logger = logging.getLogger(canonicalName);

class ApplicationDAO {

    constructor(_options) {
        let self = this;
        _options = DAOOptions.parse(_options);
        let daoServerOptions = {
            name: canonicalName,
            port: _options.port,
            produces: 'dxp3-management-dao-ApplicationDAO',
            timeout: _options.timeout
        }
        self.daoServer = new rest.RestServer(daoServerOptions);
        let daoImplClass = null;
        let daoImplClassLocation = './' + _options.implementation + '/ApplicationDAOImpl';
        self.daoImpl = null;
        try {
            daoImplClass = require(daoImplClassLocation);
            self.daoImpl = new daoImplClass(_options.daoImplOptions);
        } catch(exception) {
            logger.fatal('Unable to instantiate an ApplicationDAOImpl class of ' + _options.implementation + '.');
            if(exception.code === 'MODULE_NOT_FOUND') {
                logger.fatal('DAO implementation not found: ' + daoImplClassLocation);
            } else {
                logger.fatal(exception.message);
            }
            // This is serious enough to exit.
            process.exit(99);
        }
        /**********************************
         * CREATE / CONSTRUCTORS
         *********************************/
         // A basic application is a simple website containing HTML, javascript, images and stylesheet files.
        self.daoServer.addMethod('Object createBasic(String accountUUID, String loggedInUserUUID, String applicationName, [String description], [String shortName])',
                                 function(accountUUID, loggedInUserUUID, applicationName, description, shortName, response) {
            // Defensive programming...check input...
            accountUUID = DAOUtil.sanitizeStringParameter(accountUUID);
            if(accountUUID.length <= 0) {
                logger.warn('createBasic(...): Missing accountUUID.');
                return response.sendError(DAOError.BAD_REQUEST.code);
            }
            loggedInUserUUID = DAOUtil.sanitizeStringParameter(loggedInUserUUID);
            if(loggedInUserUUID.length <= 0) {
                logger.warn('createBasic(...): Missing loggedInUserUUID.');
                return response.sendError(DAOError.BAD_REQUEST.code);
            }
            applicationName = DAOUtil.sanitizeStringParameter(applicationName);
            if(applicationName.length <= 0) {
                logger.warn('createBasic(...): Missing applicationName.');
                return response.sendError(DAOError.BAD_REQUEST.code);
            }
            self.daoImpl.createBasic(accountUUID, loggedInUserUUID, applicationName, description, shortName, response);
        });
        // An advanced application consists of inheritance rules, pages, features, controllers, images and styles.
        self.daoServer.addMethod('Object createAdvanced(String accountUUID, String loggedInUserUUID, String applicationName, [String description], [Array<String> parentUUIDs], [String shortName], [Boolean isTemplate])',
                                 function(accountUUID, loggedInUserUUID, applicationName, description, parentUUIDs, shortName, isTemplate, response) {

console.log('here we are in createAdvanced');
            // Defensive programming...check input...
            accountUUID = DAOUtil.sanitizeStringParameter(accountUUID);
            if(accountUUID.length <= 0) {
                logger.warn('createAdvanced(...): Missing accountUUID.');
                return response.sendError(DAOError.BAD_REQUEST.code);
            }
            loggedInUserUUID = DAOUtil.sanitizeStringParameter(loggedInUserUUID);
            if(loggedInUserUUID.length <= 0) {
                logger.warn('createAdvanced(...): Missing loggedInUserUUID.');
                return response.sendError(DAOError.BAD_REQUEST.code);
            }
            applicationName = DAOUtil.sanitizeStringParameter(applicationName);
            if(applicationName.length <= 0) {
                logger.warn('createAdvanced(...): Missing applicationName.');
                return response.sendError(DAOError.BAD_REQUEST.code);
            }
console.log('here we are in createAdvanced 2: ' + applicationName);
            self.daoImpl.createAdvanced(accountUUID, loggedInUserUUID, applicationName, description, parentUUIDs, shortName, isTemplate, response);
        });
        /**********************************
         * READ / GETTERS
         *********************************/
        self.daoServer.addMethod('Object get(String accountUUID, String loggedInUserUUID, String applicationUUID)',
                                 function(accountUUID, loggedInUserUUID, applicationUUID, response) {
            // Defensive programming...check input...
            accountUUID = DAOUtil.sanitizeStringParameter(accountUUID);
            if(accountUUID.length <= 0) {
                logger.warn('get(...): Missing accountUUID.');
                return response.sendError(DAOError.BAD_REQUEST.code);
            }
            loggedInUserUUID = DAOUtil.sanitizeStringParameter(loggedInUserUUID);
            if(loggedInUserUUID.length <= 0) {
                logger.warn('get(...): Missing loggedInUserUUID.');
                return response.sendError(DAOError.BAD_REQUEST.code);
            }
            applicationUUID = DAOUtil.sanitizeStringParameter(applicationUUID);
            if(applicationUUID.length <= 0) {
                logger.warn('get(...): Missing applicationUUID.');
                return response.sendError(DAOError.BAD_REQUEST.code);
            }
            self.daoImpl.get(accountUUID, loggedInUserUUID, applicationUUID, response);
        });
        self.daoServer.addMethod('Object list(String accountUUID, String loggedInUserUUID, Number startIndex, Number maximumNumberOfResults, [String parentUUID], [Array<String> categorizedAs], [Object filterBy], [Object sortBy])',
                                 function(accountUUID, loggedInUserUUID, startIndex, maximumNumberOfResults, parentUUID, categorizedAs, filterBy, sortBy, response) {
            // Defensive programming...check input...
            accountUUID = DAOUtil.sanitizeStringParameter(accountUUID);
            if(accountUUID.length <= 0) {
                logger.warn('list(...): Missing accountUUID.');
                return response.sendError(DAOError.BAD_REQUEST.code);
            }
            loggedInUserUUID = DAOUtil.sanitizeStringParameter(loggedInUserUUID);
            if(loggedInUserUUID.length <= 0) {
                logger.warn('list(...): Missing loggedInUserUUID.');
                return response.sendError(DAOError.BAD_REQUEST.code);
            }
            self.daoImpl.list(accountUUID, loggedInUserUUID, startIndex, maximumNumberOfResults, parentUUID, categorizedAs, filterBy, sortBy, response);
        });
        /**********************************
         * UPDATE / SETTERS
         *********************************/
        self.daoServer.addMethod('Object updateBasic(String accountUUID, String loggedInUserUUID, String applicationUUID, String applicationName, [String description], [String shortName])',
                                 function(accountUUID, loggedInUserUUID, applicationUUID, applicationName, description, shortName, response) {
            // Defensive programming...check input...
            accountUUID = DAOUtil.sanitizeStringParameter(accountUUID);
            if(accountUUID.length <= 0) {
                logger.warn('updateBasic(...): Missing accountUUID.');
                return response.sendError(DAOError.BAD_REQUEST.code);
            }
            loggedInUserUUID = DAOUtil.sanitizeStringParameter(loggedInUserUUID);
            if(loggedInUserUUID.length <= 0) {
                logger.warn('updateBasic(...): Missing loggedInUserUUID.');
                return response.sendError(DAOError.BAD_REQUEST.code);
            }
            applicationUUID = DAOUtil.sanitizeStringParameter(applicationUUID);
            if(applicationUUID.length <= 0) {
                logger.warn('updateBasic(...): Missing applicationUUID.');
                return response.sendError(DAOError.BAD_REQUEST.code);
            }
            applicationName = DAOUtil.sanitizeStringParameter(applicationName);
            if(applicationName.length <= 0) {
                logger.warn('updateBasic(...): Missing applicationName.');
                return response.sendError(DAOError.BAD_REQUEST.code);
            }
            self.daoImpl.updateBasic(accountUUID, loggedInUserUUID, applicationUUID, applicationName, description, shortName, response);
        });
        self.daoServer.addMethod('Object updateAdvanced(String accountUUID, String loggedInUserUUID, String applicationUUID, String applicationName, [String description], [Array<String> parentUUIDs], [String shortName], [Boolean isTemplate])',
                                 function(accountUUID, loggedInUserUUID, applicationUUID, applicationName, description, parentUUIDs, shortName, isTemplate, response) {
            // Defensive programming...check input...
            accountUUID = DAOUtil.sanitizeStringParameter(accountUUID);
            if(accountUUID.length <= 0) {
                logger.warn('updateAdvanced(...): Missing accountUUID.');
                return response.sendError(DAOError.BAD_REQUEST.code);
            }
            loggedInUserUUID = DAOUtil.sanitizeStringParameter(loggedInUserUUID);
            if(loggedInUserUUID.length <= 0) {
                logger.warn('updateAdvanced(...): Missing loggedInUserUUID.');
                return response.sendError(DAOError.BAD_REQUEST.code);
            }
            applicationUUID = DAOUtil.sanitizeStringParameter(applicationUUID);
            if(applicationUUID.length <= 0) {
                logger.warn('updateAdvanced(...): Missing applicationUUID.');
                return response.sendError(DAOError.BAD_REQUEST.code);
            }
            applicationName = DAOUtil.sanitizeStringParameter(applicationName);
            if(applicationName.length <= 0) {
                logger.warn('updateAdvanced(...): Missing applicationName.');
                return response.sendError(DAOError.BAD_REQUEST.code);
            }
            self.daoImpl.updateAdvanced(accountUUID, loggedInUserUUID, applicationUUID, applicationName, description, parentUUIDs, shortName, isTemplate, response);
        });
        self.daoServer.addMethod('Object setHomePage(String accountUUID, String loggedInUserUUID, String applicationUUID, String pageUUID)',
                                 function(accountUUID, loggedInUserUUID, applicationUUID, pageUUID, response) {
            // Defensive programming...check input...
            accountUUID = DAOUtil.sanitizeStringParameter(accountUUID);
            if(accountUUID.length <= 0) {
                logger.warn('setHomePage(...): Missing accountUUID.');
                return response.sendError(DAOError.BAD_REQUEST.code);
            }
            loggedInUserUUID = DAOUtil.sanitizeStringParameter(loggedInUserUUID);
            if(loggedInUserUUID.length <= 0) {
                logger.warn('setHomePage(...): Missing loggedInUserUUID.');
                return response.sendError(DAOError.BAD_REQUEST.code);
            }
            applicationUUID = DAOUtil.sanitizeStringParameter(applicationUUID);
            if(applicationUUID.length <= 0) {
                logger.warn('setHomePage(...): Missing applicationUUID.');
                return response.sendError(DAOError.BAD_REQUEST.code);
            }
            self.daoImpl.setHomePage(accountUUID, loggedInUserUUID, applicationUUID, pageUUID, response);
        });
        /**********************************
         * DELETE
         *********************************/
        self.daoServer.addMethod('Object delete(String accountUUID, String loggedInUserUUID, String applicationUUID)',
                                 function(accountUUID, loggedInUserUUID, applicationUUID, response) {
            // Defensive programming...check input...
            accountUUID = DAOUtil.sanitizeStringParameter(accountUUID);
            if(accountUUID.length <= 0) {
                logger.warn('delete(...): Missing accountUUID.');
                return response.sendError(DAOError.BAD_REQUEST.code);
            }
            loggedInUserUUID = DAOUtil.sanitizeStringParameter(loggedInUserUUID);
            if(loggedInUserUUID.length <= 0) {
                logger.warn('delete(...): Missing loggedInUserUUID.');
                return response.sendError(DAOError.BAD_REQUEST.code);
            }
            applicationUUID = DAOUtil.sanitizeStringParameter(applicationUUID);
            if(applicationUUID.length <= 0) {
                logger.warn('delete(...): Missing applicationUUID.');
                return response.sendError(DAOError.BAD_REQUEST.code);
            }
            self.daoImpl.delete(accountUUID, loggedInUserUUID, applicationUUID, response);
        });
    }

    start() {
        let self = this;
        self.daoServer.start();
    }

    static main() {
        let daoOptions = DAOOptions.parseCommandLine();
        logging.setLevel(daoOptions.logLevel);
        if(daoOptions.help) {
            util.Help.print(this);
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