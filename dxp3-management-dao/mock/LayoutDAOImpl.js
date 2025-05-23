const path = require('path');
const packageName = 'dxp3-management-dao' + path.sep + 'mock';
const moduleName = 'LayoutDAOImpl';
const canonicalName = packageName + path.sep + moduleName;
// Best next thing: logging
const logging = require('dxp3-logging');
const logger = logging.getLogger(canonicalName);
const DAOError = require('../DAOError');
const layoutsByAccount = new Map();
const EntityFactory = require('../EntityFactory');
/**
 * @class
 */
class LayoutDAOImpl {

    constructor(args) {
    }

	/**********************************
	 * CREATE / CONSTRUCTORS
	 *********************************/
	create(accountUUID, loggedInUserUUID, ownerUUID, layoutName, description, code, response) {
		let layoutsByOwner = layoutsByAccount.get(accountUUID);
        if(layoutsByOwner === undefined || layoutsByOwner === null) {
            layoutsByOwner = new Map();
            layoutsByAccount.set(accountUUID, layoutsByOwner);
        }
        let layouts = layoutsByOwner.get(ownerUUID);
        if(layouts === undefined || layouts === null) {
        	layouts = new Map();
        	layoutsByOwner.set(ownerUUID, layouts);
        }
        let definition = EntityFactory.create(accountUUID, loggedInUserUUID, null, layoutName, description, null);
        definition['code'] = code;
        definition['ownerUUID'] = ownerUUID;
        layouts.set(definition.uuid, definition);
        return response.send(null, definition);
	}
	/**********************************
	 * READ / GETTERS
	 *********************************/
    get(accountUUID, loggedInUserUUID, ownerUUID, layoutUUID, response) {
        let layoutsByOwner = layoutsByAccount.get(accountUUID);
        if(layoutsByOwner === undefined || layoutsByOwner === null) {
            return response.sendError(DAOError.FILE_NOT_FOUND);
        }
        let layouts = layoutsByOwner.get(ownerUUID);
        if(layouts === undefined || layouts === null) {
        	return response.sendError(DAOError.FILE_NOT_FOUND);
        }
        let layout = layouts.get(layoutUUID);
        if(layout === undefined || layout === null) {
            return response.sendError(DAOError.FILE_NOT_FOUND);
        }
        return response.send(null, layout);
    }
    list(accountUUID, loggedInUserUUID, ownerUUID, startIndex, maximumNumberOfResults, categorizedAs, filterBy, sortBy, response) {
        let layoutsByOwner = layoutsByAccount.get(accountUUID);
        if(layoutsByOwner === undefined || layoutsByOwner === null) {
            layoutsByOwner = new Map();
        }
        let layouts = layoutsByOwner.get(ownerUUID);
        if(layouts === undefined || layouts === null) {
            layouts = new Map();
        }
        EntityFactory.list(layouts, startIndex, maximumNumberOfResults, categorizedAs, filterBy, sortBy, function(err, result) {
            response.send(err, result);
        });
    }
	/**********************************
	 * UPDATE / SETTERS
	 *********************************/
    categorize(accountUUID, loggedInUserUUID, layoutUUID, categoryUUID, response) {
    	return response.sendError(DAOError.NOT_IMPLEMENTED);
    }
    decategorize(accountUUID, loggedInUserUUID, layoutUUID, categoryUUID, response) {
    	return response.sendError(DAOError.NOT_IMPLEMENTED);
    }
    update(accountUUID, loggedInUserUUID, ownerUUID, layoutUUID, layoutName, description, code, response) {
        let layoutsByOwner = layoutsByAccount.get(accountUUID);
        if(layoutsByOwner === undefined || layoutsByOwner === null) {
            return response.sendError(DAOError.FILE_NOT_FOUND);
        }
        let layouts = layoutsByOwner.get(ownerUUID);
        if(layouts === undefined || layouts === null) {
            return response.sendError(DAOError.FILE_NOT_FOUND);
        }
        let layout = layouts.get(layoutUUID);
        if(layout === undefined || layout === null) {
            return response.sendError(DAOError.FILE_NOT_FOUND);
        }
        layout = EntityFactory.update(accountUUID, loggedInUserUUID, layout, null, layoutName, description, null);
        if(code != undefined && code != null) {
            layout.code = code;
        }
        return response.send(null, layout);
    }
	/**********************************
	 * DELETE
	 *********************************/
    delete(accountUUID, loggedInUserUUID, ownerUUID, layoutUUID, response) {
        let layoutsByOwner = layoutsByAccount.get(accountUUID);
        if(layoutsByOwner === undefined || layoutsByOwner === null) {
            return response.sendError(DAOError.FILE_NOT_FOUND);
        }
        let layouts = layoutsByOwner.get(ownerUUID);
        if(layouts === undefined || layouts === null) {
            return response.sendError(DAOError.FILE_NOT_FOUND);
        }
        let layout = layouts.get(layoutUUID);
        if(layout === undefined || layout === null) {
            return response.sendError(DAOError.FILE_NOT_FOUND);
        }
        layouts.delete(layout.uuid);
        return response.send(null, layout);
    }
}

module.exports = LayoutDAOImpl;