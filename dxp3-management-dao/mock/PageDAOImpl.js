const DAOError = require('../DAOError');
const uuid = require('dxp3-uuid');
const EntityFactory = require('../EntityFactory');
const pagesByAccount = new Map();
const pageNamesByApplicationByAccount = new Map();
const pagesByApplicationByAccount = new Map();

class PageDAOImpl {

    constructor(args) {
    }

    /**********************************
     * CREATE / CONSTRUCTORS
     *********************************/
    create(accountUUID, loggedInUserUUID, applicationUUID, pageName, description, parentUUIDs, isTemplate, title, url, response) {
        let accountPages = pagesByAccount.get(accountUUID);
        if(accountPages === undefined || accountPages === null) {
            accountPages = new Map();
            pagesByAccount.set(accountUUID, accountPages);
        }
        let pagesByApplication = pagesByApplicationByAccount.get(accountUUID);
        if(pagesByApplication === undefined || pagesByApplication === null) {
            pagesByApplication = new Map();
            pagesByApplicationByAccount.set(accountUUID, pagesByApplication);
        }
        let pageNamesByApplication = pageNamesByApplicationByAccount.get(accountUUID);
        if(pageNamesByApplication === undefined || pageNamesByApplication === null) {
            pageNamesByApplication = new Map();
            pageNamesByApplicationByAccount.set(accountUUID, pageNamesByApplication);
        }
        let applicationPages = pagesByApplication.get(applicationUUID);
        if(applicationPages === undefined || applicationPages === null) {
            applicationPages = new Map();
            pagesByApplication.set(applicationUUID, applicationPages);
        }
        let applicationPageNames = pageNamesByApplication.get(applicationUUID);
        if(applicationPageNames === undefined || applicationPageNames === null) {
            applicationPageNames = new Set();
            pageNamesByApplication.set(applicationUUID, applicationPageNames);
        }
        if(applicationPageNames.has(pageName)) {
            return response.sendError(DAOError.CONFLICT);
        }
        let definition = EntityFactory.create(accountUUID, loggedInUserUUID, applicationUUID, pageName, description, parentUUIDs);
        definition['isTemplate'] = isTemplate;
        definition['title'] = title;
        definition['url'] = url;

        accountPages.set(definition.uuid, definition);
        applicationPages.set(definition.uuid, definition);
        applicationPageNames.add(pageName);
        return response.send(null, definition);
    }
    /**********************************
     * READ / GETTERS
     *********************************/
    get(accountUUID, loggedInUserUUID, pageUUID, response) {
        let accountPages = pagesByAccount.get(accountUUID);
        if(accountPages === undefined || accountPages === null) {
            return response.sendError(DAOError.FILE_NOT_FOUND);
        }
        let page = accountPages.get(pageUUID);
        if(page === undefined || page === null) {
            return response.sendError(DAOError.FILE_NOT_FOUND);
        }
        let parentUUIDs = page.parentUUIDs;
        if((parentUUIDs === undefined) || (parentUUIDs === null)) {
            return response.send(null, page);
        }
        if(!Array.isArray(parentUUIDs)) {
            return response.send(null, page);
        }
        if(parentUUIDs.length <= 0) {
            return response.send(null, page);
        }
        page.parentNames = [];
        for(let i=0;i < parentUUIDs.length;i++) {
            let parentUUID = parentUUIDs[i];
            if(parentUUID === undefined || parentUUID === null) {
                continue;
            }
            parentUUID = parentUUID.trim();
            if(parentUUID.length <= 0) {
                continue;
            }
            let parent = accountPages.get(parentUUID);
            if(parent === undefined || parent === null) {
                continue;
            }
            page.parentNames.push(parent.name);
        }
        return response.send(null, page);
    }

    list(accountUUID, loggedInUserUUID, applicationUUID, parentUUID, startIndex, maximumNumberOfResults, categorizedAs, filterBy, sortBy, response) {
        let pagesByApplication = pagesByApplicationByAccount.get(accountUUID);
        if(pagesByApplication === undefined || pagesByApplication === null) {
            EntityFactory.list(null, startIndex, maximumNumberOfResults, categorizedAs, filterBy, sortBy, function(err, result) {
                response.send(null, result);
            });
        } else {
            let applicationPages = pagesByApplication.get(applicationUUID);
            EntityFactory.list(applicationPages, startIndex, maximumNumberOfResults, categorizedAs, filterBy, sortBy, function(err, result) {
                response.send(null, result);
            });
        }
    }

    /**********************************
     * UPDATE / SETTERS
     *********************************/

    categorize(accountUUID, loggedInUserUUID, pageUUID, categoryUUID, response) {
        response.sendError(DAOError.NOT_IMPLEMENTED);
    }

    decategorize(accountUUID, loggedInUserUUID, pageUUID, categoryUUID, response) {
        response.sendError(DAOError.NOT_IMPLEMENTED);
    }

    update(accountUUID, loggedInUserUUID, pageUUID, pageName, description, parentUUIDs, isTemplate, title, url, response) {
        let accountPages = pagesByAccount.get(accountUUID);
        if(accountPages === undefined || accountPages === null) {
            return response.sendError(DAOError.FILE_NOT_FOUND);
        }
        let page = accountPages.get(pageUUID);
        if(page === undefined || page === null) {
            return response.sendError(DAOError.FILE_NOT_FOUND);
        }
        let pageNamesByApplication = pageNamesByApplicationByAccount.get(accountUUID);
        let pageNames = pageNamesByApplication.get(page.applicationUUID);
        let rename = false;
        let currentName = page.name;
        if(page.name != pageName) {
            if(pageNames.has(pageName)) {
                return response.sendError(DAOError.CONFLICT);
            }
            rename = true;
        }
        page = EntityFactory.update(accountUUID, loggedInUserUUID, page, pageUUID, pageName, description, parentUUIDs);
        if(rename) {
            pageNames.delete(currentName);
            pageNames.add(pageName);
        }
        if(title != undefined && title != null) {
            page['title'] = title;
        }
        if(isTemplate != undefined && isTemplate != null) {
            page['isTemplate'] = isTemplate;
        }
        if(url != undefined && url != null) {
            page['url'] = url;
        }
        response.send(null, page);
    }

    uploadFavIcon(accountUUID, loggedInUserUUID, pageUUID, imagePath, imageFileName, response) {
        response.sendError(DAOError.NOT_IMPLEMENTED);
    }

    uploadFont(accountUUID, loggedInUserUUID, pageUUID, name, source, description, response) {
        response.sendError(DAOError.NOT_IMPLEMENTED);
    }

    uploadImage(accountUUID, loggedInUserUUID, pageUUID, imagePath, imageFileName, response) {
        response.sendError(DAOError.NOT_IMPLEMENTED);
    }

    updateStyle(accountUUID, loggedInUserUUID, pageUUID, name, code, response) {
        response.sendError(DAOError.NOT_IMPLEMENTED);
    }

    uploadStyleImage(accountUUID, loggedInUserUUID, pageUUID, imagePath, imageFileName, response) {
        response.sendError(DAOError.NOT_IMPLEMENTED);
    }

    /**********************************
     * DELETE
     *********************************/

    delete(accountUUID, loggedInUserUUID, pageUUID, response) {
        let accountPages = pagesByAccount.get(accountUUID);
        if(accountPages === undefined || accountPages === null) {
            return response.sendError(DAOError.FILE_NOT_FOUND);
        }
        let page = accountPages.get(pageUUID);
        if(page === undefined || page === null) {
            return response.sendError(DAOError.FILE_NOT_FOUND);
        }
        let pagesByApplication = pagesByApplicationByAccount.get(accountUUID);
        let applicationPages = pagesByApplication.get(page.applicationUUID);
        let pageNamesByApplication = pageNamesByApplicationByAccount.get(accountUUID);
        let pageNames = pageNamesByApplication.get(page.applicationUUID);
        accountPages.delete(pageUUID);
        applicationPages.delete(pageUUID);
        pageNames.delete(page.name);
        response.send(null, page);
    }

    deleteFavIcon(accountUUID, loggedInUserUUID, pageUUID, response) {
        response.sendError(DAOError.NOT_IMPLEMENTED);
    }

    deleteFont(accountUUID, loggedInUserUUID, pageUUID, name, response) {
        response.sendError(DAOError.NOT_IMPLEMENTED);
    }

    deleteImage(accountUUID, loggedInUserUUID, pageUUID, name, response) {
        response.sendError(DAOError.NOT_IMPLEMENTED);
    }

    deleteStyle(accountUUID, loggedInUserUUID, pageUUID, name, response) {
        response.sendError(DAOError.NOT_IMPLEMENTED);
    }

    deleteStyleImage(accountUUID, loggedInUserUUID, pageUUID, name, response) {
        response.sendError(DAOError.NOT_IMPLEMENTED);
    }
}

module.exports = PageDAOImpl;