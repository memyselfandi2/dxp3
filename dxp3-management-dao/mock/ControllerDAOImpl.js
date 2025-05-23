const path = require('path');
const packageName = 'dxp3-management-dao' + path.sep + 'mock';
const moduleName = 'ControllerDAOImpl';
const canonicalName = packageName + path.sep + moduleName;
// Best next thing: logging
const logging = require('dxp3-logging');
const logger = logging.getLogger(canonicalName);
const DAOError = require('../DAOError');
const controllersByAccount = new Map();
const EntityFactory = require('../EntityFactory');

class ControllerDAOImpl {

    constructor(args) {
    }
    
	/**********************************
	 * CREATE / CONSTRUCTORS
	 *********************************/
	create(accountUUID, loggedInUserUUID, ownerUUID, controllerName, description, code, response) {
		let controllersByOwner = controllersByAccount.get(accountUUID);
        if(controllersByOwner === undefined || controllersByOwner === null) {
            controllersByOwner = new Map();
            controllersByAccount.set(accountUUID, controllersByOwner);
        }
        let controllers = controllersByOwner.get(ownerUUID);
        if(controllers === undefined || controllers === null) {
        	controllers = new Map();
        	controllersByOwner.set(ownerUUID, controllers);
        }
        let sequence = controllers.size;
        let definition = EntityFactory.create(accountUUID, loggedInUserUUID, null, controllerName, description, null);
        definition['code'] = code;
        definition['ownerUUID'] = ownerUUID;
        definition['sequence'] = sequence;
        controllers.set(definition.uuid, definition);
        return response.send(null, definition);
	}
	/**********************************
	 * READ / GETTERS
	 *********************************/
    get(accountUUID, loggedInUserUUID, ownerUUID, controllerUUID, response) {
        let controllersByOwner = controllersByAccount.get(accountUUID);
        if(controllersByOwner === undefined || controllersByOwner === null) {
            return response.sendError(DAOError.FILE_NOT_FOUND);
        }
        let controllers = controllersByOwner.get(ownerUUID);
        if(controllers === undefined || controllers === null) {
        	return response.sendError(DAOError.FILE_NOT_FOUND);
        }
        let controller = controllers.get(controllerUUID);
        if(controller === undefined || controller === null) {
            return response.sendError(DAOError.FILE_NOT_FOUND);
        }
        return response.send(null, controller);
    }
    list(accountUUID, loggedInUserUUID, ownerUUID, startIndex, maximumNumberOfResults, categorizedAs, filterBy, sortBy, response) {
        let controllersByOwner = controllersByAccount.get(accountUUID);
        if(controllersByOwner === undefined || controllersByOwner === null) {
            controllersByOwner = new Map();
        }
        let controllers = controllersByOwner.get(ownerUUID);
        if(controllers === undefined || controllers === null) {
        	controllers = new Map();
        }
        if(sortBy === undefined || sortBy === null || (Object.keys(sortBy).length <= 0)) {
            sortBy = {sequence:'ascending'};
        }
        console.log('sortby: ' + JSON.stringify(sortBy));
        EntityFactory.list(controllers, startIndex, maximumNumberOfResults, categorizedAs, filterBy, sortBy, function(err, result) {
            response.send(null, result);
        });
    }
	/**********************************
	 * UPDATE / SETTERS
	 *********************************/
    categorize(accountUUID, loggedInUserUUID, controllerUUID, categoryUUID, response) {
    	return response.sendError(DAOError.NOT_IMPLEMENTED);
    }
    decategorize(accountUUID, loggedInUserUUID, controllerUUID, categoryUUID, response) {
    	return response.sendError(DAOError.NOT_IMPLEMENTED);
    }
    update(accountUUID, loggedInUserUUID, ownerUUID, controllerUUID, controllerName, description, code, response) {
        let controllersByOwner = controllersByAccount.get(accountUUID);
        if(controllersByOwner === undefined || controllersByOwner === null) {
            return response.sendError(DAOError.FILE_NOT_FOUND);
        }
        let controllers = controllersByOwner.get(ownerUUID);
        if(controllers === undefined || controllers === null) {
            return response.sendError(DAOError.FILE_NOT_FOUND);
        }
        let controller = controllers.get(controllerUUID);
        if(controller === undefined || controller === null) {
            return response.sendError(DAOError.FILE_NOT_FOUND);
        }
        controller = EntityFactory.update(accountUUID, loggedInUserUUID, controller, null, controllerName, description, null);
        if(code != undefined && code != null) {
            controller.code = code;
        }
        return response.send(null, controller);
    }
    reorder(accountUUID, loggedInUserUUID, ownerUUID, controllerUUIDs, response) {
        let controllersByOwner = controllersByAccount.get(accountUUID);
        if(controllersByOwner === undefined || controllersByOwner === null) {
            return response.sendError(DAOError.FILE_NOT_FOUND);
        }
        let controllers = controllersByOwner.get(ownerUUID);
        if(controllers === undefined || controllers === null) {
            return response.sendError(DAOError.FILE_NOT_FOUND);
        }
        console.log('reorder: ' + controllerUUIDs);
        for(let i=0;i < controllerUUIDs.length;i++) {
            let controllerUUID = controllerUUIDs[i];
            let controller = controllers.get(controllerUUID);
            controller.sequence = i;
    console.log('controller: ' + controller.uuid + ' sequence: ' + i);
        }
        return response.send(null, controllerUUIDs);
    }
	/**********************************
	 * DELETE
	 *********************************/
    delete(accountUUID, loggedInUserUUID, ownerUUID, controllerUUID, response) {
        let controllersByOwner = controllersByAccount.get(accountUUID);
        if(controllersByOwner === undefined || controllersByOwner === null) {
            return response.sendError(DAOError.FILE_NOT_FOUND);
        }
        let controllers = controllersByOwner.get(ownerUUID);
        if(controllers === undefined || controllers === null) {
            return response.sendError(DAOError.FILE_NOT_FOUND);
        }
        let controller = controllers.get(controllerUUID);
        if(controller === undefined || controller === null) {
            return response.sendError(DAOError.FILE_NOT_FOUND);
        }
        controllers.delete(controller.uuid);
        return response.send(null, controller);
    }
}

module.exports = ControllerDAOImpl;