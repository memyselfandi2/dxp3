const path = require('path');
const packageName = 'dxp3-management-dao' + path.sep + 'mock';
const moduleName = 'StyleDAOImpl';
const canonicalName = packageName + path.sep + moduleName;
// Best next thing: logging
const logging = require('dxp3-logging');
const logger = logging.getLogger(canonicalName);
const DAOError = require('../DAOError');
const stylesByAccount = new Map();
const EntityFactory = require('../EntityFactory');
/**
 * @class
 */
class StyleDAOImpl {

    constructor(args) {
    }

	/**********************************
	 * CREATE / CONSTRUCTORS
	 *********************************/
	create(accountUUID, loggedInUserUUID, ownerUUID, styleName, description, code, response) {
		let stylesByOwner = stylesByAccount.get(accountUUID);
        if(stylesByOwner === undefined || stylesByOwner === null) {
            stylesByOwner = new Map();
            stylesByAccount.set(accountUUID, stylesByOwner);
        }
        let styles = stylesByOwner.get(ownerUUID);
        if(styles === undefined || styles === null) {
        	styles = new Map();
        	stylesByOwner.set(ownerUUID, styles);
        }
        let definition = EntityFactory.create(accountUUID, loggedInUserUUID, null, styleName, description, null);
        definition['code'] = code;
        definition['ownerUUID'] = ownerUUID;
        styles.set(definition.uuid, definition);
        return response.send(null, definition);
	}
	/**********************************
	 * READ / GETTERS
	 *********************************/
    get(accountUUID, loggedInUserUUID, ownerUUID, styleUUID, response) {
        let stylesByOwner = stylesByAccount.get(accountUUID);
        if(stylesByOwner === undefined || stylesByOwner === null) {
            return response.sendError(DAOError.FILE_NOT_FOUND);
        }
        let styles = stylesByOwner.get(ownerUUID);
        if(styles === undefined || styles === null) {
        	return response.sendError(DAOError.FILE_NOT_FOUND);
        }
        let style = styles.get(styleUUID);
        if(style === undefined || style === null) {
            return response.sendError(DAOError.FILE_NOT_FOUND);
        }
        return response.send(null, style);
    }
    list(accountUUID, loggedInUserUUID, ownerUUID, startIndex, maximumNumberOfResults, categorizedAs, filterBy, sortBy, response) {
        let stylesByOwner = stylesByAccount.get(accountUUID);
        if(stylesByOwner === undefined || stylesByOwner === null) {
            stylesByOwner = new Map();
        }
        let styles = stylesByOwner.get(ownerUUID);
        if(styles === undefined || styles === null) {
            styles = new Map();
        }
        EntityFactory.list(styles, startIndex, maximumNumberOfResults, categorizedAs, filterBy, sortBy, function(err, result) {
            response.send(null, result);
        });
    }
	/**********************************
	 * UPDATE / SETTERS
	 *********************************/
    categorize(accountUUID, loggedInUserUUID, styleUUID, categoryUUID, response) {
    	return response.sendError(DAOError.NOT_IMPLEMENTED);
    }
    decategorize(accountUUID, loggedInUserUUID, styleUUID, categoryUUID, response) {
    	return response.sendError(DAOError.NOT_IMPLEMENTED);
    }
    update(accountUUID, loggedInUserUUID, ownerUUID, styleUUID, styleName, description, code, response) {
        let stylesByOwner = stylesByAccount.get(accountUUID);
        if(stylesByOwner === undefined || stylesByOwner === null) {
            return response.sendError(DAOError.FILE_NOT_FOUND);
        }
        let styles = stylesByOwner.get(ownerUUID);
        if(styles === undefined || styles === null) {
            return response.sendError(DAOError.FILE_NOT_FOUND);
        }
        let style = styles.get(styleUUID);
        if(style === undefined || style === null) {
            return response.sendError(DAOError.FILE_NOT_FOUND);
        }
        style = EntityFactory.update(accountUUID, loggedInUserUUID, style, null, styleName, description, null);
        if(code != undefined && code != null) {
            style.code = code;
        }
        return response.send(null, style);
    }
	/**********************************
	 * DELETE
	 *********************************/
    delete(accountUUID, loggedInUserUUID, ownerUUID, styleUUID, response) {
        let stylesByOwner = stylesByAccount.get(accountUUID);
        if(stylesByOwner === undefined || stylesByOwner === null) {
            return response.sendError(DAOError.FILE_NOT_FOUND);
        }
        let styles = stylesByOwner.get(ownerUUID);
        if(styles === undefined || styles === null) {
            return response.sendError(DAOError.FILE_NOT_FOUND);
        }
        let style = styles.get(styleUUID);
        if(style === undefined || style === null) {
            return response.sendError(DAOError.FILE_NOT_FOUND);
        }
        styles.delete(style.uuid);
        return response.send(null, style);
    }
}

module.exports = StyleDAOImpl;