const path = require('path');
const packageName = 'dxp3-management-dao' + path.sep + 'mock';
const moduleName = 'UserDAOImpl';
const canonicalName = packageName + path.sep + moduleName;
// Best next thing: logging
const logging = require('dxp3-logging');
const logger = logging.getLogger(canonicalName);

const users = new Map();

/**********************************
 * CREATE / CONSTRUCTORS
 *********************************/

// No creation allowed. You'll need to go through the security system.

/**********************************
 * READ / GETTERS
 *********************************/

exports.get = function(loggedInUserUuid, userUuid, callback) {
    let user = {};
    user.isActive = true;
    user.uuid = userUuid;
	callback(null, user);
}

exports.list = function(accountUuid, loggedInUserUuid, usergroupUuid, startIndex, maximumNumberOfResults, filterBy, sortBy, callback) {
}

/**********************************
 * UPDATE / SETTERS
 *********************************/

exports.addAccount = function(accountUuid, loggedInUserUuid, userUuid, toBeAddedAccountUuid, callback) {

}

/**********************************
 * DELETE
 *********************************/

exports.delete = function(accountUuid, loggedInUserUuid, userUuid, callback) {
}