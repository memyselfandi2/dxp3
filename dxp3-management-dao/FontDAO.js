const packageName = 'dxp3-management-dao';
const moduleName = 'FontDAO';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
// Best next thing: logging
const logging = require('dxp3-logging');
const logger = logging.getLogger(canonicalName);
const microservice = require('dxp3-microservice');

let daoImpl = require('./mock/FontDAOImpl');
let daoSubject = packageName + '-' + moduleName;
let daoServer = new microservice.RestServer(moduleName, daoSubject);

/**********************************
 * CREATE / CONSTRUCTORS
 *********************************/

daoServer.on('create', function(accountUUID, loggedInUserUUID, fontName, description, callback) {
    daoImpl.create(accountUUID, loggedInUserUUID, fontName, description, domain, serverUUID, callback);
});

/**********************************
 * READ / GETTERS
 *********************************/

daoServer.on('get', function(accountUUID, loggedInUserUUID, fontUUID, callback) {
    daoImpl.get(accountUUID, loggedInUserUUID, fontUUID, callback);
});

daoServer.on('list', function(accountUUID, loggedInUserUUID, startIndex, maximumNumberOfResults, categorizedAs, filterBy, sortBy, callback) {
    daoImpl.list(accountUUID, loggedInUserUUID, startIndex, maximumNumberOfResults, categorizedAs, filterBy, sortBy, callback);
});

/**********************************
 * UPDATE / SETTERS
 *********************************/

daoServer.on('categorize', function(accountUUID, loggedInUserUUID, fontUUID, categoryUUID, callback) {
    daoImpl.categorize(accountUUID, loggedInUserUUID, fontUUID, categoryUUID, callback);
});

daoServer.on('decategorize', function(accountUUID, loggedInUserUUID, fontUUID, categoryUUID, callback) {
    daoImpl.decategorize(accountUUID, loggedInUserUUID, fontUUID, categoryUUID, callback);
});

daoServer.on('update', function(accountUUID, loggedInUserUUID, fontUUID, fontName, description, callback) {
    daoImpl.update(accountUUID, loggedInUserUUID, fontUUID, fontName, description, callback);
});

/**********************************
 * DELETE
 *********************************/

daoServer.on('delete', function(accountUUID, loggedInUserUUID, fontUUID, callback) {
    daoImpl.delete(accountUUID, loggedInUserUUID, fontUUID, callback);
});