const path = require('path');
const packageName = 'dxp3-management-dao' + path.sep + 'mock';
const moduleName = 'ImageDAOImpl';
const canonicalName = packageName + path.sep + moduleName;
// Best next thing: logging
const logging = require('dxp3-logging');
const logger = logging.getLogger(canonicalName);
const DAOError = require('../DAOError');
const imagesByAccount = new Map();
const EntityFactory = require('../EntityFactory');


class ImageDAOImpl {

    constructor(args) {
    }

    /**********************************
     * CREATE / CONSTRUCTORS
     *********************************/
    create(accountUUID, loggedInUserUUID, ownerUUID, imageName, fileName, description, imageStream, response) {
        let imagesByOwner = imagesByAccount.get(accountUUID);
        if(imagesByOwner === undefined || imagesByOwner === null) {
            imagesByOwner = new Map();
            imagesByAccount.set(accountUUID, imagesByOwner);
        }
        let images = imagesByOwner.get(ownerUUID);
        if(images === undefined || images === null) {
            images = new Map();
            imagesByOwner.set(ownerUUID, images);
        }
        let definition = EntityFactory.create(accountUUID, loggedInUserUUID, null, imageName, description, null);
        definition['fileName'] = fileName;
        definition['ownerUUID'] = ownerUUID;
        
        images.set(definition.uuid, definition);
        return response.send(null, definition);
    }

    /**********************************
     * READ / GETTERS
     *********************************/
    get(accountUUID, loggedInUserUUID, ownerUUID, imageUUID, response) {
        response.sendError(DAOError.NOT_IMPLEMENTED);
    }
    list(accountUUID, loggedInUserUUID, ownerUUID, startIndex, maximumNumberOfResults, categorizedAs, filterBy, sortBy, response) {
        let imagesByOwner = imagesByAccount.get(accountUUID);
        if(imagesByOwner === undefined || imagesByOwner === null) {
            imagesByOwner = new Map();
        }
        let images = imagesByOwner.get(ownerUUID);
        if(images === undefined || images === null) {
            images = new Map();
        }
console.log('get image list !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!1');
        EntityFactory.list(images, startIndex, maximumNumberOfResults, categorizedAs, filterBy, sortBy, function(err, result) {
console.log('return from entity factory');
            response.send(null, result);
        });
    }

    /**********************************
     * UPDATE / SETTERS
     *********************************/
    categorize(accountUUID, loggedInUserUUID, imageUUID, categoryUUID, response) {
        response.sendError(DAOError.NOT_IMPLEMENTED);
    }

    decategorize(accountUUID, loggedInUserUUID, imageUUID, categoryUUID, response) {
        response.sendError(DAOError.NOT_IMPLEMENTED);
    }

    update(accountUUID, loggedInUserUUID, ownerUUID, imageUUID, imageName, description, imageStream, response) {
        response.sendError(DAOError.NOT_IMPLEMENTED);
    }

    /**********************************
     * DELETE
     *********************************/
    delete(accountUUID, loggedInUserUUID, ownerUUID, imageUUID, response) {
        let imagesByOwner = imagesByAccount.get(accountUUID);
        if(imagesByOwner === undefined || imagesByOwner === null) {
            return response.sendError(DAOError.FILE_NOT_FOUND);
        }
        let images = imagesByOwner.get(ownerUUID);
        if(images === undefined || images === null) {
            return response.sendError(DAOError.FILE_NOT_FOUND);
        }
        let image = images.get(imageUUID);
        if(image === undefined || image === null) {
            return response.sendError(DAOError.FILE_NOT_FOUND);
        }
        images.delete(image.uuid);
        return response.send(null, image);
    }
}

module.exports = ImageDAOImpl;