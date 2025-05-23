const packageName = 'dxp3-management-dao';
const moduleName = 'DestinationDAO';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
// Best next thing: logging
const logging = require('dxp3-logging');
const logger = logging.getLogger(canonicalName);
const microservice = require('dxp3-microservice');

let daoImpl = require('./mock/DestinationDAOImpl');
let daoSubject = packageName + '-' + moduleName;
let daoServer = new microservice.RestServer(moduleName, daoSubject);

/**********************************
 * CREATE / CONSTRUCTORS
 *********************************/

daoServer.on('create', function(accountUUID, loggedInUserUUID, destinationName, description, domainUUID, serverUUID, callback) {
    daoImpl.create(accountUUID, loggedInUserUUID, destinationName, description, domainUUID, serverUUID, callback);
});

/**********************************
 * READ / GETTERS
 *********************************/

daoServer.on('get', function(accountUUID, loggedInUserUUID, destinationUUID, callback) {
    daoImpl.get(accountUUID, loggedInUserUUID, destinationUUID, callback);
});

daoServer.on('list', function(accountUUID, loggedInUserUUID, startIndex, maximumNumberOfResults, categorizedAs, filterBy, sortBy, callback) {
    daoImpl.list(accountUUID, loggedInUserUUID, startIndex, maximumNumberOfResults, categorizedAs, filterBy, sortBy, callback);
});

/**********************************
 * UPDATE / SETTERS
 *********************************/

daoServer.on('categorize', function(accountUUID, loggedInUserUUID, destinationUUID, categoryUUID, callback) {
    daoImpl.categorize(accountUUID, loggedInUserUUID, destinationUUID, categoryUUID, callback);
});

daoServer.on('decategorize', function(accountUUID, loggedInUserUUID, destinationUUID, categoryUUID, callback) {
    daoImpl.decategorize(accountUUID, loggedInUserUUID, destinationUUID, categoryUUID, callback);
});

daoServer.on('update', function(accountUUID, loggedInUserUUID, destinationUUID, destinationName, description, domainUUID, serverUUID, callback) {
    daoImpl.update(accountUUID, loggedInUserUUID, destinationUUID, destinationName, description, domainUUID, serverUUID, callback);
});

/**********************************
 * DELETE
 *********************************/

daoServer.on('delete', function(accountUUID, loggedInUserUUID, destinationUUID, callback) {
    daoImpl.delete(accountUUID, loggedInUserUUID, destinationUUID, callback);
});

daoServer.start();