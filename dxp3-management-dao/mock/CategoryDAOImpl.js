const path = require('path');
const packageName = 'dxp3-management-dao' + path.sep + 'mock';
const moduleName = 'CategoryDAOImpl';
const canonicalName = packageName + path.sep + moduleName;
// Best next thing: logging
const logging = require('dxp3-logging');
const logger = logging.getLogger(canonicalName);
const DAOError = require('../DAOError');

const EntityFactory = require('../EntityFactory');
const allCategories = new Map();
const globalCategories = new Map();
const categoriesByApplications = new Map();

class CategoryDAOImpl {
	/**********************************
	 * CREATE / CONSTRUCTORS
	 *********************************/
	static create(accountUUID, loggedInUserUUID, applicationUUID, categoryName, description, parentUUIDs, entityTypes, callback) {
		let category = EntityFactory.create(accountUUID, loggedInUserUUID, applicationUUID, categoryName, description, parentUUIDs);
		if(entityTypes === undefined || entityTypes === null) {
			entityTypes = [];
		}
		category[entityTypes] = entityTypes;
		allCategories.set(category.uuid, category);
		if(category.applicationUUID.length > 0) {
			let applicationCategories = categoriesByApplications.get(category.applicationUUID);
			if(applicationCategories === undefined || applicationCategories === null) {
				applicationCategories = new Map();
				categoriesByApplications.set(category.applicationUUID, applicationCategories);
			}
			applicationCategories.set(category.uuid, category);
		} else {
			globalCategories.set(category.uuid, category);
		}
		callback(null, category);
	}

	/**********************************
	 * READ / GETTERS
	 *********************************/
	static get(accountUUID, loggedInUserUUID, categoryUUID, callback) {
		let category = allCategories.get(categoryUUID);
		if(category === undefined || category === null) {
			return callback(DAOError.FILE_NOT_FOUND);
		}
		callback(null, category);
	}

	static list(accountUUID, loggedInUserUUID, applicationUUID, startIndex, maximumNumberOfResults, categorizedAs, filterBy, sortBy, callback) {
		if(applicationUUID === undefined || applicationUUID === null) {
			applicationUUID = '';
		}
		applicationUUID = applicationUUID.trim();
		let categories = globalCategories;
		if(applicationUUID.length > 0) {
			let applicationCategories = categoriesByApplications.get(applicationUUID);
			if(applicationCategories === undefined || applicationCategories === null) {
				return callback(DAOError.FILE_NOT_FOUND);
			}
			categories = applicationCategories;
		}
		let result = [];
		result = categories.values();
		callback(null, result);
	}

	/**********************************
	 * UPDATE / SETTERS
	 *********************************/
	static categorize(accountUUID, loggedInUserUUID, categoryUUID, categorizeAsUUID, callback) {
		CategoryDAOImpl.get(accountUUID, loggedInUserUUID, categoryUUID, function(err, category) {
			category.
		});
	}

	static decategorize(accountUUID, loggedInUserUUID, categoryUUID, decategorizeAsUUID, callback) {
	}

	static update(accountUUID, loggedInUserUUID, categoryUUID, applicationUUID, categoryName, description, parentUUIDs, entityTypes, callback) {
		CategoryDAOImpl.get(accountUUID, loggedInUserUUID, categoryUUID, function(err, category) {
			category[entityTypes] = entityTypes;
			category = EntityFactory.update(accountUUID, loggedInUserUUID, category, applicationUUID, categoryName, description, parentUUIDs);
						
		});
	}

	/**********************************
	 * DELETE
	 *********************************/
	static delete(accountUUID, loggedInUserUUID, categoryUUID, callback) {
		let category = allCategories.get(categoryUUID);
		if(category === undefined || category === null) {
			return callback(DAOError.FILE_NOT_FOUND);
		}
		let applicationUUID = category.applicationUUID;
		if(applicationUUID === undefined || applicationUUID === null) {
			applicationUUID = '';
		}
		applicationUUID = applicationUUID.trim();
		if(applicationUUID.length <= 0) {
			globalCategories.delete(categoryUUID);
		} else {
			let applicationCategories = categoriesByApplications.get(applicationUUID);
			if(applicationCategories != undefined && applicationCategories != null) {
				applicationCategories.delete(categoryUUID);
			}
		}
		allCategories.delete(categoryUUID);
		callback(null, category);
	}
}

module.exports = CategoryDAOImpl;