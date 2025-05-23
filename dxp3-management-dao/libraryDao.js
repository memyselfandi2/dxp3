/******************************************
* DXP3  Digital Experience Platform 3
*       Management
* DAO   Data Access Objects
*
* PACKAGE
* dxp3.management.dao
*
* NAME
* libraryDao
*
* VERSION
* v1.0.0
*
* DESCRIPTION
* This is the default library data access object.
* Use this to retrieve libraries from your persistency store.
*
* EXAMPLE
* // Initialize our data access objects layer
* var daoImplementationName = 'filesystem';
* var logLevel = 'error';
* var daoImplementation = require('dxp3-management-dao-' + daoImplementationName);
* daoImplementation.init(logLevel, redisClient, function(err) {
*   // Now that we are initialized, we need to register ourselves as
*   // the de facto DAO implementation.
*   var dao = require('dxp3-management-dao');
*   dao.init(logLevel, redisClient, daoImplementation, function() {
*       // Now that our dao layer is initialized we can start retrieving specific
*       // objects
*       var libraryDao = dao.get('libraryDao');
*   });
* });
*
******************************************/
const package = 'dxp3.management.dao';
const moduleName = 'libraryDao';
const canonicalName = package + '.' + moduleName;
// First things first...setup our logs...
const log4js = require('log4js');
const logger = log4js.getLogger(canonicalName);
// Any errors we encouter, we encapsulate in a dao error...
const error = require('./error');
// Just in case we'd like to create, read, update and/or delete
// other types of objects we need a reference to a dao factory. 
var daoFactory = null;
// This is a reference to the actual dao implementation we delegate everything to.
var daoImpl = null;

/**********************************
 * INITIALIZE
 *********************************/

// method name              : init
// parameters               :
// daoFactory               - required - A data access object factory implementation we use to get a reference
//                                       to a library data access object implemention to which we delegate everything to.
// callback                 - required - This function will be called when the library dao is initialized.
//                                       The parameters of this callback function are: error.
exports.init = function(_daoFactory, callback) {
    if((_daoFactory === undefined) || (_daoFactory === null)) {
        logger.error('init(...): The daoFactory is undefined or null.');
        if(callback) {
            // BAD REQUEST = 400
            return callback(error.BAD_REQUEST);
        }
        return;
    }
    daoFactory = _daoFactory;
    daoImpl = daoFactory.get(moduleName);
    if((daoImpl === undefined) || (daoImpl === null)) {
        logger.error('init(...): The dao factory was unable to return a \'' + moduleName + '\' implementation.');
        if(callback) {
            return callback(error.FILE_NOT_FOUND);
        }
        return;
    }
    logger.info('init(...): Initialized.');
    if(callback) {
        return callback();
    }
}

/**********************************
 * READ / GETTERS
 *********************************/

// method name              : list
// parameters               :
// accountUuid              - required - the account uuid of the requesting user (used for authorization).
// loggedInUserUuid         - required - the user uuid of the requesting user (used for authorization).
// startIndex               - optional - the start index of the array of all the libraries which fullfill the other requirements.
// maximumNumberOfResults   - optional - the maximum number of results of all the libraries which fullfill the requirements starting from the start index.
// categorizedAs            - optional - array of category uuid's the libraries need to be categorized as.
// filterBy                 - optional - array of other properties and their respective values the libraries need to have.
// sortBy                   - optional - array of property names the result will have to be sorted by.
// callback                 - required - This function will be called when the data is retrieved.
//                                       The parameters of this callback function are: error, mimetype, json.
exports.list = function(accountUuid, loggedInUserUuid, startIndex, maximumNumberOfResults, categorizedAs, filterBy, sortBy, callback) {
    daoImpl.list(accountUuid, loggedInUserUuid, startIndex, maximumNumberOfResults, categorizedAs, filterBy, sortBy, callback);
};

