const path = require('path');
const packageName = 'dxp3-management-dao' + path.sep + 'mock';
const moduleName = 'UsergroupDAOImpl';
const canonicalName = packageName + path.sep + moduleName;
// Best next thing: logging
const logging = require('dxp3-logging');
const logger = logging.getLogger(canonicalName);
const EntityFactory = require('../EntityFactory');
const DAOError = require('../DAOError');
const usergroups = new Map();

/**********************************
 * CREATE / CONSTRUCTORS
 *********************************/

exports.create = function(accountUUID, loggedInUserUUID, applicationUUID, parentUUIDs, name, description, callback) {
	let usergroup = EntityFactory.create(accountUUID, loggedInUserUUID, applicationUUID, parentUUIDs, name, description);
	usergroups.set(usergroup.uuid, usergroup);
	console.log('returning usergrup');
	callback(null, usergroup);
}

/**********************************
 * READ / GETTERS
 *********************************/
exports.get = function(accountUUID, loggedInUserUUID, usergroupUUID, callback) {
	let usergroup = usergroups.get(usergroupUUID);
	if(usergroup === undefined || usergroup === null) {
		callback(DAOError.FILE_NOT_FOUND);
		return;
	}
	callback(null, usergroup);
}

exports.list = function(accountUUID, loggedInUserUUID, parentUUID, startIndex, maximumNumberOfResults, filterBy, sortBy, callback) {
}

exports.listUsers = function (accountUUID, loggedInUserUUID, usergroupUUID, startIndex, maximumNumberOfResults, categorizedAs, filterBy, sortBy, callback) {
}

/**********************************
 * UPDATE / SETTERS
 *********************************/
exports.addUser = function(accountUUID, loggedInUserUUID, usergroupUUID, userUUID, callback) {
}

exports.categorize = function(accountUUID, loggedInUserUUID, usergroupUUID, categoryUUID, callback) {
}

exports.update = function(accountUUID, loggedInUserUUID, usergroupUUID, parentUUIDs, name, description, callback) {
}

/**********************************
 * DELETE
 *********************************/

exports.decategorize = function(accountUUID, loggedInUserUUID, usergroupUUID, categoryUUID, callback) {
}

exports.delete = function(accountUUID, loggedInUserUUID, usergroupUUID, callback) {
}

exports.deleteUser = function(accountUUID, loggedInUserUUID, usergroupUUID, userUUID, callback) {
}