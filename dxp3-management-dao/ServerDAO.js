const packageName = 'dxp3-management-dao';
const moduleName = 'ServerDAO';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
// Best next thing: logging
const logging = require('dxp3-logging');
const logger = logging.getLogger(canonicalName);
const microservice = require('dxp3-microservice');

let daoImpl = require('./mock/ServerDAOImpl');
let daoSubject = packageName + '-' + moduleName;
let daoServer = new microservice.RestServer(moduleName, daoSubject);

/**********************************
 * CREATE / CONSTRUCTORS
 *********************************/

daoServer.on('createFTPServer', function(accountUUID, loggedInUserUUID, serverName, description, address, port, userName, password, callback) {
    daoImpl.createFTPServer(accountUUID, loggedInUserUUID, serverName, description, address, port, userName, password, callback);
});

daoServer.on('createLocalServer', function(accountUUID, loggedInUserUUID, serverName, description, folder, callback) {
    daoImpl.createLocalServer(accountUUID, loggedInUserUUID, serverName, description, folder, callback);
});

/**********************************
 * READ / GETTERS
 *********************************/

daoServer.on('get', function(accountUUID, loggedInUserUUID, serverUUID, callback) {
    daoImpl.get(accountUUID, loggedInUserUUID, serverUUID, callback);
});

daoServer.on('list', function(accountUUID, loggedInUserUUID, startIndex, maximumNumberOfResults, categorizedAs, filterBy, sortBy, callback) {
    daoImpl.list(accountUUID, loggedInUserUUID, startIndex, maximumNumberOfResults, categorizedAs, filterBy, sortBy, callback);
});

/**********************************
 * UPDATE / SETTERS
 *********************************/

daoServer.on('categorize', function(accountUUID, loggedInUserUUID, serverUUID, categoryUUID, callback) {
    daoImpl.categorize(req,res, accountUUID, loggedInUserUUID, serverUUID, categoryUUID, callback);
});

daoServer.on('decategorize', function(accountUUID, loggedInUserUUID, serverUUID, categoryUUID, callback) {
    daoImpl.decategorize(accountUUID, loggedInUserUUID, serverUUID, categoryUUID, callback);
});

daoServer.on('updateFTPServer', function(accountUUID, loggedInUserUUID, serverUUID, serverName, description, address, port, userName, password, callback) {
    daoImpl.update(accountUUID, loggedInUserUUID, serverUUID, serverName, description, callback);
});

daoServer.on('updateLocalServer', function(accountUUID, loggedInUserUUID, serverUUID, serverName, description, folder, callback) {
    daoImpl.update(accountUUID, loggedInUserUUID, serverUUID, serverName, description, callback);
});

/**********************************
 * DELETE
 *********************************/

daoServer.on('delete', function(accountUUID, loggedInUserUUID, serverUUID, callback) {
    daoImpl.delete(accountUUID, loggedInUserUUID, serverUUID, callback);
});