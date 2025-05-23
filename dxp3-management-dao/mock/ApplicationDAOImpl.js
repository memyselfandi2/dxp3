/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-management-dao/mock
 *
 * NAME
 * ApplicationDAOImpl
 */
const path = require('path');
const packageName = 'dxp3-management-dao' + path.sep + 'mock';
const moduleName = 'ApplicationDAOImpl';
const canonicalName = packageName + path.sep + moduleName;

const DAOError = require('../DAOError');
const EntityFactory = require('../EntityFactory');
const mutex = require('dxp3-mutex-inmemory');
const uuid = require('dxp3-uuid');

const applicationsByAccount = new Map();
const applicationNamesByAccount = new Map();

class ApplicationDAOImpl {

    constructor(args) {
        this._readWriteLock = new mutex.ReadWriteLock({timeout:5000});
    }
    /**********************************
     * CREATE / CONSTRUCTORS
     *********************************/
    async createBasic(accountUUID, loggedInUserUUID, applicationName, description, shortName, response) {
        let readLock = await this._readWriteLock.readLock('application names');
        let applications = applicationsByAccount.get(accountUUID);
        let applicationNames = applicationNamesByAccount.get(accountUUID);
        if(applications === undefined || applications === null) {
            applications = new Map();
            applicationsByAccount.set(accountUUID, applications);
            applicationNames = new Set();
            applicationNamesByAccount.set(accountUUID, applicationNames);
        }
        if(applicationNames.has(applicationName)) {
            readLock.release();
            return response.sendError(DAOError.CONFLICT.code);
        }
        let definition = EntityFactory.create(accountUUID, loggedInUserUUID, null, applicationName, description, null);
        if(shortName === undefined || shortName === null) {
            shortName = '';
        }
        definition['shortName'] = shortName;
        definition['type'] = 'Basic';

        applications.set(definition.uuid, definition);
        applicationNames.add(applicationName);
        readLock.release();
        return response.send(null, definition);
    }
    async createAdvanced(accountUUID, loggedInUserUUID, applicationName, description, parentUUIDs, shortName, isTemplate, response) {
        let readLock = await this._readWriteLock.readLock('application names');
        let applications = applicationsByAccount.get(accountUUID);
        let applicationNames = applicationNamesByAccount.get(accountUUID);
        if(applications === undefined || applications === null) {
            applications = new Map();
            applicationsByAccount.set(accountUUID, applications);
            applicationNames = new Set();
            applicationNamesByAccount.set(accountUUID, applicationNames);
        }
        if(applicationNames.has(applicationName)) {
            readLock.release();
            return response.sendError(DAOError.CONFLICT.code);
        }
        let definition = EntityFactory.create(accountUUID, loggedInUserUUID, null, applicationName, description, parentUUIDs);
        if(shortName === undefined || shortName === null) {
            shortName = '';
        }
        definition['shortName'] = shortName;
        if(isTemplate === undefined || isTemplate === null) {
            isTemplate = false;
        }
        definition['isTemplate'] = isTemplate;
        definition['type'] = 'Advanced';

        applications.set(definition.uuid, definition);
        applicationNames.add(applicationName);
        readLock.release();
        return response.send(null, definition);
    }
    /**********************************
     * READ / GETTERS
     *********************************/
    async get(accountUUID, loggedInUserUUID, applicationUUID, response) {
        let readLock = await this._readWriteLock.readLock(applicationUUID);
        let applications = applicationsByAccount.get(accountUUID);
        if(applications === undefined || applications === null) {
            readLock.release();
            return response.sendError(DAOError.FILE_NOT_FOUND.code);
        }
        let application = applications.get(applicationUUID);
        if(application === undefined || application === null) {
            readLock.release();
            return response.sendError(DAOError.FILE_NOT_FOUND.code);
        }
        let parentUUIDs = application.parentUUIDs;
        if((parentUUIDs === undefined) || (parentUUIDs === null)) {
            readLock.release();
            return response.send(null, application);
        }
        if(!Array.isArray(parentUUIDs)) {
            readLock.release();
            return response.send(null, application);
        }
        if(parentUUIDs.length <= 0) {
            readLock.release();
            return response.send(null, application);
        }
        application.parentNames = [];
        for(let i=0;i < parentUUIDs.length;i++) {
            let parentUUID = parentUUIDs[i];
            if(parentUUID === undefined || parentUUID === null) {
                continue;
            }
            parentUUID = parentUUID.trim();
            if(parentUUID.length <= 0) {
                continue;
            }
            let parent = applications.get(parentUUID);
            if(parent === undefined || parent === null) {
                continue;
            }
            application.parentNames.push(parent.name);
        }
        readLock.release();
        return response.send(null, application);
    }
    list(accountUUID, loggedInUserUUID, startIndex, maximumNumberOfResults, parentUUID, categorizedAs, filterBy, sortBy, response) {
        let applications = applicationsByAccount.get(accountUUID);
        EntityFactory.list(applications, startIndex, maximumNumberOfResults, categorizedAs, filterBy, sortBy, function(err, result) {
            response.send(null, result);
        });
    }
    /**********************************
     * UPDATE / SETTERS
     *********************************/
    setHomepage(accountUUID, loggedInUserUUID, applicationUUID, pageUUID, response) {
        let applications = applicationsByAccount.get(accountUUID);
        if(applications === undefined || applications === null) {
            return response.sendError(DAOError.FILE_NOT_FOUND.code);
        }
        let application = applications.get(applicationUUID);
        if(application === undefined || application === null) {
            return response.sendError(DAOError.FILE_NOT_FOUND.code);
        }
        application['homePageUUID'] = pageUUID;
        response.send(null, application);
    }

    async updateBasic(accountUUID, loggedInUserUUID, applicationUUID, applicationName, description, shortName, response) {
        let applications = applicationsByAccount.get(accountUUID);
        if(applications === undefined || applications === null) {
            return response.sendError(DAOError.FILE_NOT_FOUND.code);
        }
        let writeLock = await this._readWriteLock.writeLock(applicationUUID);
        let application = applications.get(applicationUUID);
        if(application === undefined || application === null) {
            writeLock.release();
            return response.sendError(DAOError.FILE_NOT_FOUND.code);
        }
        let currentName = application.name;
        if(currentName != applicationName) {
            let applicationNamesWriteLock = await this._readWriteLock.writeLock('application names');
            let applicationNames = applicationNamesByAccount.get(accountUUID);
            if(applicationNames.has(applicationName)) {
                applicationNamesWriteLock.release();
                writeLock.release();
                return response.sendError(DAOError.CONFLICT.code);
            }
            applicationNames.delete(currentName);
            applicationNames.add(applicationName);                    
            application = EntityFactory.update(accountUUID, loggedInUserUUID, application, applicationUUID, applicationName, description, null);
            if(shortName != undefined && shortName != null) {
                application['shortName'] = shortName;
            }
            applicationNamesWriteLock.release();
            writeLock.release();
            response.send(null, application);
        } else {
            application = EntityFactory.update(accountUUID, loggedInUserUUID, application, applicationUUID, applicationName, description, null);
            if(shortName != undefined && shortName != null) {
                application['shortName'] = shortName;
            }
            writeLock.release();
            response.send(null, application);
        }
    }

    async updateAdvanced(accountUUID, loggedInUserUUID, applicationUUID, applicationName, description, parentUUIDs, shortName, isTemplate, response) {
        let applications = applicationsByAccount.get(accountUUID);
        if(applications === undefined || applications === null) {
            return response.sendError(DAOError.FILE_NOT_FOUND.code);
        }
        let writeLock = await this._readWriteLock.writeLock(applicationUUID);
        let application = applications.get(applicationUUID);
        if(application === undefined || application === null) {
            writeLock.release();
            return response.sendError(DAOError.FILE_NOT_FOUND.code);
        }
        let currentName = application.name;
        if(currentName != applicationName) {
            let applicationNamesWriteLock = await this._readWriteLock.writeLock('application names');
            let applicationNames = applicationNamesByAccount.get(accountUUID);
            if(applicationNames.has(applicationName)) {
                applicationNamesWriteLock.release();
                writeLock.release();
                return response.sendError(DAOError.CONFLICT.code);
            }
            applicationNames.delete(currentName);
            applicationNames.add(applicationName);                    
            application = EntityFactory.update(accountUUID, loggedInUserUUID, application, applicationUUID, applicationName, description, parentUUIDs);
            if(shortName != undefined && shortName != null) {
                application['shortName'] = shortName;
            }
            if(isTemplate != undefined && isTemplate != null) {
                application['isTemplate'] = isTemplate;
            }
            applicationNamesWriteLock.release();
            writeLock.release();
            response.send(null, application);
        } else {
            application = EntityFactory.update(accountUUID, loggedInUserUUID, application, applicationUUID, applicationName, description, parentUUIDs);
            if(shortName != undefined && shortName != null) {
                application['shortName'] = shortName;
            }
            if(isTemplate != undefined && isTemplate != null) {
                application['isTemplate'] = isTemplate;
            }
            writeLock.release();
            response.send(null, application);
        }
    }
    /**********************************
     * DELETE
     *********************************/
    async delete(accountUUID, loggedInUserUUID, applicationUUID, response) {
        let applications = applicationsByAccount.get(accountUUID);
        if(applications === undefined || applications === null) {
            return response.sendError(DAOError.FILE_NOT_FOUND.code);
        }
        let applicationNames = applicationNamesByAccount.get(accountUUID);
        let writeLock = await this._readWriteLock.writeLock(applicationUUID);
        let application = applications.get(applicationUUID);
        if(application === undefined || application === null) {
            writeLock.release();
            return response.sendError(DAOError.FILE_NOT_FOUND.code);
        }
        let applicationNamesWriteLock = await this._readWriteLock.writeLock('application names');
        applications.delete(applicationUUID);
        applicationNames.delete(application.name);
        applicationNamesWriteLock.release();
        writeLock.release();
        response.send(null, application);
    }
}

module.exports = ApplicationDAOImpl;