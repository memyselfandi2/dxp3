const packageName = 'dxp3-management-dao';
const moduleName = 'PublishRequestDAO';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
// Best next thing: logging
const logging = require('dxp3-logging');
const logger = logging.getLogger(canonicalName);
const microservice = require('dxp3-microservice');

let daoImpl = require('./mock/PublishRequestDAOImpl');
let daoSubject = packageName + '-' + moduleName;
let daoServer = new microservice.RestServer(moduleName, daoSubject);

/**********************************
 * CREATE / CONSTRUCTORS
 *********************************/

daoServer.on('create', function(accountUUID, loggedInUserUUID, entityType, entityUUID, destinationUUID, callback) {
    daoImpl.create(accountUUID, loggedInUserUUID, entityType, entityUUID, destinationUUID, callback);
});

/**********************************
 * READ / GETTERS
 *********************************/

daoServer.on('get', function(accountUUID, loggedInUserUUID, publishRequestUUID, callback) {
    daoImpl.get(accountUUID, loggedInUserUUID, publishRequestUUID, callback);
});

daoServer.on('list', function(accountUUID, loggedInUserUUID, startIndex, maximumNumberOfResults, filterBy, sortBy, callback) {
    daoImpl.list(accountUUID, loggedInUserUUID, startIndex, maximumNumberOfResults, filterBy, sortBy, callback);
});

/**********************************
 * UPDATE / SETTERS
 *********************************/

// Once a publish request is created it can not be updated

/**********************************
 * DELETE
 *********************************/

daoServer.on('delete', function(accountUUID, loggedInUserUUID, publishRequestUUID, callback) {
    daoImpl.delete(accountUUID, loggedInUserUUID, publishRequestUUID, callback);
});