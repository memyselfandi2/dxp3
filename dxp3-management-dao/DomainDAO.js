const packageName = 'dxp3-management-dao';
const moduleName = 'DomainDAO';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
// Best next thing: logging
const logging = require('dxp3-logging');
const logger = logging.getLogger(canonicalName);
const microservice = require('dxp3-microservice');

let daoImpl = require('./mock/DomainDAOImpl');
let daoSubject = packageName + '-' + moduleName;
let daoServer = new microservice.RestServer(moduleName, daoSubject);

/**********************************
 * CREATE / CONSTRUCTORS
 *********************************/

daoServer.on('create', function(accountUUID, loggedInUserUUID, domainName, description, callback) {
    daoImpl.create(accountUUID, loggedInUserUUID, domainName, description, callback);
});

/**********************************
 * READ / GETTERS
 *********************************/

daoServer.on('get', function(accountUUID, loggedInUserUUID, domainUUID, callback) {
    daoImpl.get(accountUUID, loggedInUserUUID, domainUUID, callback);
});

daoServer.on('list', function(accountUUID, loggedInUserUUID, startIndex, maximumNumberOfResults, categorizedAs, filterBy, sortBy, callback) {
    daoImpl.list(accountUUID, loggedInUserUUID, applicationUUID, startIndex, maximumNumberOfResults, categorizedAs, filterBy, sortBy, callback);
});

/**********************************
 * UPDATE / SETTERS
 *********************************/

daoServer.on('categorize', function(accountUUID, loggedInUserUUID, domainUUID, categoryUUID, callback) {
    daoImpl.categorize(accountUUID, loggedInUserUUID, domainUUID, categoryUUID, callback);
});

daoServer.on('decategorize', function(accountUUID, loggedInUserUUID, domainUUID, categoryUUID, callback) {
    daoImpl.decategorize(accountUUID, loggedInUserUUID, domainUUID, categoryUUID, callback);
});

daoServer.on('update', function(accountUUID, loggedInUserUUID, domainUUID, domainName, description, callback) {
    daoImpl.update(accountUUID, loggedInUserUUID, domainUUID, domainName, description, callback);
});

/**********************************
 * DELETE
 *********************************/

daoServer.on('delete', function(accountUUID, loggedInUserUUID, domainUUID, callback) {
    daoImpl.delete(accountUUID, loggedInUserUUID, domainUUID, callback);
});

daoServer.start();