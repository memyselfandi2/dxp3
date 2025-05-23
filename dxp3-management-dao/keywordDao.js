/******************************************
* DXP3  Digital Experience Platform 3
*       Management
* DAO   Data Access Objects
*
* PACKAGE
* dxp3.management.dao
*
* NAME
* keywordDao
*
* VERSION
* v1.0.0
*
* DESCRIPTION
* This is the default keyword data access object.
* Use this to retrieve keywords from your persistency store.
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
*       var keywordDao = dao.get('keywordDao');
*   });
* });
*
******************************************/
const package = 'dxp3.management.dao';
const moduleName = 'keywordDao';
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
//                                       to a keyword data access object implemention to which we delegate everything to.
// callback                 - required - This function will be called when the keyword dao is initialized.
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
 * CREATE / CONSTRUCTORS
 *********************************/

// method name              : create
// parameters               :
// accountUuid              - required - the account uuid of the requesting user (used for authorization).
// loggedInUserUuid         - required - the user uuid of the requesting user (used for authorization and versioning).
// categoryUuid             - required - the category this keyword belongs to.
// name                     - required - the name of this new keyword.
// description              - optional - a small paragraph describing this keyword and its function.
// callback                 - required - This function will be called when the keyword is created.
//                                       The parameters of this callback function are: error, mimetype, json.
exports.create = function(accountUuid, loggedInUserUuid, categoryUuid, name, description, callback) {
    daoImpl.create(accountUuid, loggedInUserUuid, categoryUuid, name, description, callback);
};

/**********************************
 * READ / GETTERS
 *********************************/

// method name              : list
// parameters               :
// req                      - required - express http request object.
// req                      - required - express http response object.
// accountUuid              - required - the account uuid of the requesting user (used for authorization).
// loggedInUserUuid         - required - the user uuid of the requesting user (used for authorization).
// categoryUuid             - required - the category the keywords belong to.
// startIndex               - optional - the start index of the array of all the keywords which fullfill the other requirements.
// maximumNumberOfResults   - optional - the maximum number of results of all the keywords which fullfill the requirements starting from the start index.
// filterBy                 - optional - array of other properties and their respective values the keywords need to have.
// sortBy                   - optional - array of property names the result will have to be sorted by.
// callback                 - required - This function will be called when the data is retrieved.
//                                       The parameters of this callback function are: error, mimetype, json.
exports.list = function(accountUuid, loggedInUserUuid, categoryUuid, startIndex, maximumNumberOfResults, filterBy, sortBy, callback) {
    daoImpl.list(accountUuid, loggedInUserUuid, categoryUuid, startIndex, maximumNumberOfResults, filterBy, sortBy, callback);
};

// method name              : get
// parameters               :
// req                      - required - express http request object.
// req                      - required - express http response object.
// accountUuid              - required - the account uuid of the requesting user (used for authorization).
// loggedInUserUuid         - required - the user uuid of the requesting user (used for authorization).
// keywordUuid              - required - the uuid of the keyword to retrieve.
// callback                 - required - This function will be called when the data is retrieved.
//                                       The parameters of this callback function are: error, mimetype, json.
exports.get = function(accountUuid, loggedInUserUuid, keywordUuid, callback) {
    daoImpl.get(accountUuid, loggedInUserUuid, keywordUuid, callback);
}

/**********************************
 * UPDATE / SETTERS
 *********************************/

// method name              : update
// parameters               :
// req                      - required - express http request object.
// req                      - required - express http response object.
// accountUuid              - required - the account uuid of the requesting user (used for authorization).
// loggedInUserUuid         - required - the user uuid of the requesting user (used for authorization and versioning).
// keywordUuid              - required - the uuid of the keyword to update.
// categoryUuid             - required - the category the keyword currently belongs to or has to move to.
// name                     - required - the current or new name of the keyword.
// description              - optional - a small paragraph describing this page and its function.
// callback                 - required - This function will be called when the keyword is updated.
//                                       The parameters of this callback function are: error, mimetype, json.
exports.update = function(accountUuid, loggedInUserUuid, keywordUuid, categoryUuid, name, description, callback) {
    daoImpl.update(accountUuid, loggedInUserUuid, keywordUuid, categoryUuid, name, description, callback);
};

/**********************************
 * DELETE
 *********************************/

// method name              : delete
// parameters               :
// req                      - required - express http request object.
// req                      - required - express http response object.
// accountUuid              - required - the account uuid of the requesting user (used for authorization).
// loggedInUserUuid         - required - the user uuid of the requesting user (used for authorization and versioning).
// keywordUuid              - required - the uuid of the keyword to delete.
// callback                 - required - This function will be called when the keyword is deleted.
//                                       The parameters of this callback function are: error, mimetype, json.
exports.delete = function(accountUuid, loggedInUserUuid, keywordUuid, callback) {
	daoImpl.delete(accountUuid, loggedInUserUuid, keywordUuid, callback);
};
