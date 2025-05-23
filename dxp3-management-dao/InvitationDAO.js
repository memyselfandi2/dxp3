/******************************************
* DXP3  Digital Experience Platform 3
*       Management
* DAO   Data Access Objects
*
* PACKAGE
* dxp3.management.dao
*
* NAME
* invitationDao
*
* VERSION
* v1.0.0
*
* DESCRIPTION
* This is the default invitation data access object.
* Use this to create, read, update and delete invitations.
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
*       var invitationDao = dao.get('invitationDao');
*   });
* });
*
******************************************/
const package = 'dxp3.management.dao';
const moduleName = 'invitationDao';
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
//                                       to a invitation data access object implemention to which we delegate everything to.
// callback                 - required - This function will be called when the invitation dao is initialized.
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
// usergroupUuids           - optional - a list of uuid's of usergroups we'd like to add the user to.
// emailAddress             - required - the email address of the user we'd like to invite.
// firstName                - optional - the first name of the user we'd like to invite.
// lastName                 - optional - the last name of the user we'd like to invite.
// callback                 - required - This function will be called when the invitation is created.
//                                       The parameters of this callback function are: error, json.
exports.create = function(accountUuid, loggedInUserUuid, usergroupUuids, emailAddress, firstName, lastName, callback) {
    daoImpl.create(accountUuid, loggedInUserUuid, usergroupUuids, emailAddress, firstName, lastName, callback);
};

/**********************************
 * READ / GETTERS
 *********************************/

// method name              : list
// parameters               :
// accountUuid              - required - the account uuid of the requesting user (used for authorization).
// loggedInUserUuid         - required - the user uuid of the requesting user (used for authorization).
// startIndex               - optional - the start index of the array of all the invitations which fullfill the other requirements.
// maximumNumberOfResults   - optional - the maximum number of results of all the invitations which fullfill the requirements starting from the start index.
// categorizedAs            - optional - array of category uuid's the invitations need to be categorized as.
// filterBy                 - optional - array of other properties and their respective values the invitations need to have.
// sortBy                   - optional - array of property names the result will have to be sorted by.
// callback                 - required - This function will be called when the data is retrieved.
//                                       The parameters of this callback function are: error, json.
exports.list = function(accountUuid, loggedInUserUuid, startIndex, maximumNumberOfResults, categorizedAs, filterBy, sortBy, callback) {
    daoImpl.list(accountUuid, loggedInUserUuid, startIndex, maximumNumberOfResults, categorizedAs, filterBy, sortBy, callback);
};

// method name              : get
// parameters               :
// accountUuid              - required - the account uuid of the requesting user (used for authorization).
// loggedInUserUuid         - required - the user uuid of the requesting user (used for authorization).
// invitationUuid           - required - the uuid of the invitation to retrieve.
// callback                 - required - This function will be called when the data is retrieved.
//                                       The parameters of this callback function are: error, json.
exports.get = function(accountUuid, loggedInUserUuid, invitationUuid, callback) {
    daoImpl.get(accountUuid, loggedInUserUuid, invitationUuid, callback);
}

/**********************************
 * UPDATE / SETTERS
 *********************************/

// method name              : update
// parameters               :
// accountUuid              - required - the account uuid of the requesting user (used for authorization).
// loggedInUserUuid         - required - the user uuid of the requesting user (used for authorization and versioning).
// invitationUuid           - required - the uuid of the invitation to update.
// usergroupUuids           - optional - a list of uuid's of usergroups we'd like to add the user to.
// emailAddress             - required - the email address of the user we'd like to invite.
// firstName                - optional - the first name of the user we'd like to invite.
// lastName                 - optional - the last name of the user we'd like to invite.
// callback                 - required - This function will be called when the invitation is updated.
//                                       The parameters of this callback function are: error, json.
exports.update = function(accountUuid, loggedInUserUuid, invitationUuid, usergroupUuids, emailAddress, firstName, lastName, callback) {
    daoImpl.update(accountUuid, loggedInUserUuid, invitationUuid, usergroupUuids, emailAddress, firstName, lastName, callback);
};

// method name              : categorize
// parameters               :
// accountUuid              - required - the account uuid of the requesting user (used for authorization).
// loggedInUserUuid         - required - the user uuid of the requesting user (used for authorization and versioning).
// invitationUuid           - required - the uuid of the invitation to categorize.
// categoryUuid             - required - the uuid of the category to categorize the invitation with.
// callback                 - required - This function will be called when the invitation is updated.
//                                       The parameters of this callback function are: error, json.
exports.categorize = function(accountUuid, loggedInUserUuid, invitationUuid, categoryUuid, callback) {
    daoImpl.categorize(accountUuid, loggedInUserUuid, invitationUuid, categoryUuid, callback);
}

/**********************************
 * DELETE
 *********************************/

// method name              : decategorize
// parameters               :
// accountUuid              - required - the account uuid of the requesting user (used for authorization).
// loggedInUserUuid         - required - the user uuid of the requesting user (used for authorization and versioning).
// invitationUuid           - required - the uuid of the invitation to decategorize.
// categoryUuid             - required - the uuid of the category to remove from the invitation.
// callback                 - required - This function will be called when the invitation is updated.
//                                       The parameters of this callback function are: error, json.
exports.decategorize = function(accountUuid, loggedInUserUuid, invitationUuid, categoryUuid, callback) {
    daoImpl.decategorize(accountUuid, loggedInUserUuid, invitationUuid, categoryUuid, callback);
}

// method name              : delete
// parameters               :
// accountUuid              - required - the account uuid of the requesting user (used for authorization).
// loggedInUserUuid         - required - the user uuid of the requesting user (used for authorization and versioning).
// invitationUuid           - required - the uuid of the invitation to delete.
// callback                 - required - This function will be called when the invitation is deleted.
//                                       The parameters of this callback function are: error, json.
exports.delete = function(accountUuid, loggedInUserUuid, invitationUuid, callback) {
    daoImpl.delete(accountUuid, loggedInUserUuid, invitationUuid, callback);
};