const path = require('path');
const packageName = 'dxp3-management-dao' + path.sep + 'mock';
const moduleName = 'DestinationDAOImpl';
const canonicalName = packageName + path.sep + moduleName;
// Best next thing: logging
const logging = require('dxp3-logging');
const logger = logging.getLogger(canonicalName);

/**********************************
 * CREATE / CONSTRUCTORS
 *********************************/

exports.create = function(accountUuid, loggedInUserUuid, name, description, domain, serverUuid, callback) {
}

/**********************************
 * READ / GETTERS
 *********************************/

exports.get = function(accountUuid, loggedInUserUuid, destinationUuid, callback) {
}

exports.list = function(accountUuid, loggedInUserUuid, startIndex, maximumNumberOfResults, categorizedAs, filterBy, sortBy, callback) {
}

/**********************************
 * UPDATE / SETTERS
 *********************************/

exports.categorize = function(accountUuid, loggedInUserUuid, destinationUuid, categoryUuid, callback) {
}

exports.decategorize = function(accountUuid, loggedInUserUuid, destinationUuid, categoryUuid, callback) {
}

exports.update = function(accountUuid, loggedInUserUuid, destinationUuid, name, description, domain, serverUuid, callback) {
}

/**********************************
 * DELETE
 *********************************/

exports.delete = function(accountUuid, loggedInUserUuid, destinationUuid, callback) {
}