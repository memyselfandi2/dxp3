const packageName = 'dxp3-management-dao';
const moduleName = 'CategoryDAO';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
// Best next thing: logging
const logging = require('dxp3-logging');
const logger = logging.getLogger(canonicalName);
const microservice = require('dxp3-microservice');

let daoImpl = require('./mock/CategoryDAOImpl');
let daoSubject = packageName + '-' + moduleName;
let daoServer = new microservice.RestServer(moduleName, daoSubject);

/**********************************
 * CREATE / CONSTRUCTORS
 *********************************/

daoServer.on('create', function(accountUUID, loggedInUserUUID, applicationUUID, categoryName, description, parentUUIDs, entityTypes, callback) {
    daoImpl.create(accountUUID, loggedInUserUUID, applicationUUID, categoryName, description, parentUUIDs, entityTypes, callback);
});

/**********************************
 * READ / GETTERS
 *********************************/

daoServer.on('get', function(accountUUID, loggedInUserUUID, categoryUUID, callback) {
    daoImpl.get(accountUUID, loggedInUserUUID, categoryUUID, callback);
});

daoServer.on('list', function(accountUUID, loggedInUserUUID, applicationUUID, startIndex, maximumNumberOfResults, categorizedAs, filterBy, sortBy, callback) {
    daoImpl.list(accountUUID, loggedInUserUUID, applicationUUID, startIndex, maximumNumberOfResults, categorizedAs, filterBy, sortBy, callback);
});

/**********************************
 * UPDATE / SETTERS
 *********************************/

daoServer.on('categorize', function(accountUUID, loggedInUserUUID, categoryUUID, categorizeAsUUID, callback) {
    daoImpl.categorize(accountUUID, loggedInUserUUID, categoryUUID, categorizeAsUUID, callback);
});

daoServer.on('decategorize', function(accountUUID, loggedInUserUUID, categoryUUID, decategorizeAsUUID, callback) {
    daoImpl.decategorize(accountUUID, loggedInUserUUID, categoryUUID, decategorizeAsUUID, callback);
});

daoServer.on('update', function(accountUUID, loggedInUserUUID, categoryUUID, applicationUUID, categoryName, description, parentUUIDs, entityTypes, callback) {
    daoImpl.update(accountUUID, loggedInUserUUID, categoryUUID, applicationUUID, categoryName, description, parentUUIDs, entityTypes, callback);
});

/**********************************
 * DELETE
 *********************************/

daoServer.on('delete', function(accountUUID, loggedInUserUUID, categoryUUID, callback) {
    daoImpl.delete(accountUUID, loggedInUserUUID, categoryUUID, callback);
});

daoServer.start();