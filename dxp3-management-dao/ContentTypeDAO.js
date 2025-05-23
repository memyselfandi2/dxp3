const packageName = 'dxp3-management-dao';
const moduleName = 'ContentTypeDAO';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
// Best next thing: logging
const logging = require('dxp3-logging');
const logger = logging.getLogger(canonicalName);
const microservice = require('dxp3-microservice');

let daoImpl = require('./mock/ContentTypeDAOImpl');
let daoSubject = packageName + '-' + moduleName;
let daoServer = new microservice.RestServer(moduleName, daoSubject);

/**********************************
 * CREATE / CONSTRUCTORS
 *********************************/

daoServer.on('create', function(accountUUID, loggedInUserUUID, applicationUUID, contentTypeName, description, parentUUIDs, callback) {
    daoImpl.create(accountUUID, loggedInUserUUID, applicationUUID, contentTypeName, description, parentUUIDs, callback);
});

/**********************************
 * READ / GETTERS
 *********************************/

daoServer.on('get', function(accountUUID, loggedInUserUUID, contentTypeUUID, callback) {
    daoImpl.get(accountUUID, loggedInUserUUID, contentTypeUUID, callback);
});

daoServer.on('list', function(accountUUID, loggedInUserUUID, applicationUUID, startIndex, maximumNumberOfResults, categorizedAs, filterBy, sortBy, callback) {
    daoImpl.list(accountUUID, loggedInUserUUID, applicationUUID, startIndex, maximumNumberOfResults, categorizedAs, filterBy, sortBy, callback);
});

/**********************************
 * UPDATE / SETTERS
 *********************************/

daoServer.on('categorize', function(accountUUID, loggedInUserUUID, contentTypeUUID, categoryUUID, callback) {
    daoImpl.categorize(accountUUID, loggedInUserUUID, contentTypeUUID, categoryUUID, callback);
});

daoServer.on('decategorize', function(accountUUID, loggedInUserUUID, contentTypeUUID, categoryUUID, callback) {
    daoImpl.decategorize(accountUUID, loggedInUserUUID, contentTypeUUID, categoryUUID, callback);
});

daoServer.on('update', function(accountUUID, loggedInUserUUID, contentTypeUUID, applicationUUID, contentTypeName, description, parentUUIDs, callback) {
    daoImpl.update(accountUUID, loggedInUserUUID, categoryUUID, applicationUUID, contentTypeName, description, parentUUIDs, callback);
});

/**********************************
 * DELETE
 *********************************/

daoServer.on('delete', function(accountUUID, loggedInUserUUID, contentTypeUUID, callback) {
    daoImpl.delete(accountUUID, loggedInUserUUID, contentTypeUUID, callback);
});

daoServer.start();