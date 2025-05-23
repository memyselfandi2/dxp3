const packageName = 'dxp3-management-dao';
const moduleName = 'ContentDAO';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
// Best next thing: logging
const logging = require('dxp3-logging');
const logger = logging.getLogger(canonicalName);
const microservice = require('dxp3-microservice');

let daoImpl = require('./mock/ContentDAOImpl');
let daoSubject = packageName + '-' + moduleName;
let daoServer = new microservice.RestServer(moduleName, daoSubject);

/**********************************
 * CREATE / CONSTRUCTORS
 *********************************/

daoServer.on('create', function(accountUUID, loggedInUserUUID, applicationUUID, contentName, description, parentUUIDs, contentTypeUUID, callback) {
    daoImpl.create(accountUUID, loggedInUserUUID, applicationUUID, contentName, description, parentUUIDs, contentTypeUUID, callback);
});

/**********************************
 * READ / GETTERS
 *********************************/

daoServer.on('get', function(accountUUID, loggedInUserUUID, contentUUID, callback) {
    daoImpl.get(accountUUID, loggedInUserUUID, contentUUID, callback);
});

daoServer.on('list', function(accountUUID, loggedInUserUUID, applicationUUID, startIndex, maximumNumberOfResults, categorizedAs, filterBy, sortBy, callback) {
    daoImpl.list(accountUUID, loggedInUserUUID, applicationUUID, startIndex, maximumNumberOfResults, categorizedAs, filterBy, sortBy, callback);
});

/**********************************
 * UPDATE / SETTERS
 *********************************/

daoServer.on('categorize', function(accountUUID, loggedInUserUUID, contentUUID, categoryUUID, callback) {
    daoImpl.categorize(accountUUID, loggedInUserUUID, contentUUID, categoryUUID, callback);
});

daoServer.on('decategorize', function(accountUUID, loggedInUserUUID, contentUUID, categoryUUID, callback) {
    daoImpl.decategorize(accountUUID, loggedInUserUUID, contentUUID, categoryUUID, callback);
});

daoServer.on('update', function(accountUUID, loggedInUserUUID, contentUUID, applicationUUID, contentName, description, parentUUIDs, contentTypeUUID, callback) {
    daoImpl.update(accountUUID, loggedInUserUUID, categoryUUID, applicationUUID, contentName, description, parentUUIDs, contentTypeUUID, callback);
});

/**********************************
 * DELETE
 *********************************/

daoServer.on('delete', function(accountUUID, loggedInUserUUID, contentUUID, callback) {
    daoImpl.delete(accountUUID, loggedInUserUUID, contentUUID, callback);
});

daoServer.start();