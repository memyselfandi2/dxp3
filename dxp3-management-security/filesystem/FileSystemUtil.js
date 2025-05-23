const fs = require('fs');
const InMemoryMutex = require('dxp3-mutex-inmemory');
const path = require('path');
const SecurityError = require('../SecurityError');
const SecurityUtil = require('../SecurityUtil');
const UUID = require('dxp3-uuid');

const mutex = new InMemoryMutex();

class FileSystemUtil {

    static createEntity(entityFolder, entityIDFolder, parentUUIDs, entity, name, description, callback) {
        // Defensive programming...check input parameters...
        entityFolder = SecurityUtil.sanitizeStringParameter(entityFolder);
        entityIDFolder = SecurityUtil.sanitizeStringParameter(entityIDFolder);
        if(entityFolder.length <= 0) {
            // BAD REQUEST = 400
            return callback(SecurityError.BAD_REQUEST);
        }
        if(!entityFolder.endsWith(path.sep)) {
            entityFolder += path.sep;
        }
        if(entityIDFolder.length <= 0) {
            entityIDFolder = null;
        } else if(!entityIDFolder.endsWith(path.sep)) {
            entityIDFolder += path.sep;
        }
        parentUUIDs = SecurityUtil.sanitizeArrayParameter(parentUUIDs);
        if(entity === undefined || entity === null) {
            entity = {};
        }
        description = SecurityUtil.sanitizeStringParameter(description);
        name = SecurityUtil.sanitizeStringParameter(name);
        let entityUUID = UUID.create();
        let entityID = '';
        if(name.length > 0) {
            // If the entity has a name, but no entityIDFolder was supplied, we return an error
            if(entityIDFolder === null) {
                if(callback) {
                    // BAD REQUEST = 400
                    return callback(SecurityError.BAD_REQUEST);
                }
                return;
            }
            // replace whitespaces with -
            entityID = name.replace(/\s+/g, '-').toLowerCase();
            let filePathEntityID = entityIDFolder + entityID + path.sep;
            fs.mkdir(filePathEntityID, {recursive:false}, function(err) {
                // If we can not create the folder it highly likely means
                // another entity already exists with the same name/id.
                if((err != undefined) && (err != null)) {
                    FileSystemUtil.readEntityByID(entityFolder, entityIDFolder, entityID, 
                        function(err, definition) {
                            // If something went wrong with retrieval of the entity
                            // with the same name/id, we give up.
                            if((err != undefined) && (err != null)) {
                                if(callback) {
                                    // INTERNAL SERVER ERROR = 500
                                    return callback(SecurityError.INTERNAL_SERVER_ERROR);
                                }
                                return;
                            }
                            if(callback) {
                                return callback(SecurityError.CONFLICT, definition);
                            }
                            return;
                        }
                    );
                    return;
                }
                // Next create the UUID folder in the ID folder
                let filePathEntityIDUUID = filePathEntityID + entityUUID;
                fs.mkdir(filePathEntityIDUUID, {recursive:false}, function(err) {
                    if((err != undefined) && (err != null)) {
                        // This really should not have happened.
                        // Lets attempt to rollback the creation of the entity id
                        fs.remove(filePathEntityID);
                        if(callback) {
                            // INTERNAL SERVER ERROR = 500
                            return callback(SecurityError.INTERNAL_SERVER_ERROR);
                        }
                        return;
                    }
                    FileSystemUtil._createEntityDefinition(entityFolder, entity, entityUUID, entityID, parentUUIDs, name, description,
                        function(err, definition) {
                            if((err != undefined) && (err != null)) {
                                // This really should not have happened.
                                // Lets attempt to rollback the creation of the entity id
                                fs.remove(filePathEntityID);
                                if(callback) {
                                    // INTERNAL SERVER ERROR = 500
                                    return callback(SecurityError.INTERNAL_SERVER_ERROR);
                                }
                                return;
                            }
                            if(callback) {
                                return callback(null, definition);
                            }
                            return;
                        }
                    );
                    return;
                });
                return;
            });
        } else {
            FileSystemUtil._createEntityDefinition(entityFolder, entity, entityUUID, entityID, parentUUIDs, name, description, callback);
        }
    }

    static deleteEntityByUUID(entityFolder, entityIDFolder, entityUUID, callback) {
        // Defensive programming...check input parameters...
        if(arguments.length < 3) {
            return;
        }
        if(arguments.length === 2) {
            entityFolder = arguments[0];
            entityIDFolder = null;
            entityUUID = arguments[1];
            callback = null;
        }
        if(arguments.length === 3) {
            entityFolder = arguments[0];
            entityIDFolder = null;
            entityUUID = arguments[1];
            callback = arguments[2];
        }
        entityFolder = SecurityUtil.sanitizeStringParameter(entityFolder);
        entityIDFolder = SecurityUtil.sanitizeStringParameter(entityIDFolder);
        entityUUID = SecurityUtil.sanitizeStringParameter(entityUUID);
        if(entityFolder.length <= 0) {
            // BAD REQUEST = 400
            if(callback) {
                return callback(SecurityError.BAD_REQUEST);
            }
            return;
        }
        if(!entityFolder.endsWith(path.sep)) {
            entityFolder += path.sep;
        }
        if(entityIDFolder.length <= 0) {
            entityIDFolder = null;
        } else if(!entityIDFolder.endsWith(path.sep)) {
            entityIDFolder += path.sep;
        }
        if(entityUUID.length <= 0) {
            // BAD REQUEST = 400
            if(callback) {
                return callback(SecurityError.BAD_REQUEST);
            }
            return;
        }
        FileSystemUtil.readEntityByUUID(entityFolder, entityUUID,
            function(err, entity) {
                if((err != undefined) && (err != null)) {
                    let filePathEntity = entityFolder + entityUUID + path.sep;
                    fs.remove(filePathEntity);
                    if(callback) {
                        return callback(err, entity);
                    }
                    return;
                }
                // remove us from any parent...
                let parentUUIDs = entity.parentUUIDs;
                if((parentUUIDs != undefined) && (parentUUIDs != null)) {
                    for(let i=0;i < parentUUIDs.length;i++) {
                        let parentUUID = parentUUIDs[i];
                        let childFolder = entityFolder + parentUUID + path.sep + 'children' + path.sep + entityUUID;
                        mutex.writeLock(parentUUID, function(release) {
                            fs.remove(childFolder, function(err) {
                                release();
                            });
                        });
                    }
                }
                // Remove us from any children
                let childrenFolder = entityFolder + entityUUID + path.sep + 'children' + path.sep;
                mutex.readLock(entityUUID, function(release) {
                    fs.readdir(childrenFolder, function(err, childUUIDs) {
                        release();
                        for(let index in childUUIDs) {
                            let childUUID = childUUIDs[index];
                            let childEntityFile = entityFolder + childUUID + path.sep + 'definition.json';
                            mutex.readLock(childUUID, function(release) {
                                fs.readFile(childEntityFile, "utf-8", function (err, data) {
                                    release();
                                    if((err != undefined) && (err != null)) {
                                        return;
                                    }
                                    let childEntity = JSON.parse(data);
                                    let parentUUIDs = childEntity.parentUUIDs;
                                    if(parentUUIDs === undefined || parentUUIDs === null) {
                                        return;
                                    }
                                    let parentUUIDIndex = parentUUIDs.indexOf(uuid);
                                    if(parentUUIDIndex >= 0) {
                                        childEntity.parentUUIDs.splice(parentUUIDIndex, 1);
                                        FileSystemUtil.saveEntity(entityFolder, childEntity,
                                            function(err, savedEntity) {
                                                if((err != undefined) && (err != null)) {
                                                    // This really should not have happened.
                                                    // Now we have inconsistencies in our data...
                                                    logger.warn('deleteEntity(...): Potential data inconsistency. Unable to remove parent \'' + uuid + '\' from child \'' + childUUID + '\'.');
                                                }
                                            }
                                        );
                                    }
                                });
                            });
                        }
                    });
                });
                let entityID = entity.id;
                if(entityID != undefined && entityID != null) {
                    let filePathEntityID = entityIDFolder + entityID + path.sep;

                    fs.rmdir(filePathEntityID, {recursive:true}, function(error) {

                    });
                }
                let filePathEntity = entityFolder + entityUUID + path.sep;
                mutex.writeLock(entityUUID, function(release) {
                    fs.rmdir(filePathEntity, {recursive:true}, function(error) {
                        release();
                    });
                });
                if(callback) {
                    return callback(null, entity);
                }
                return;
            }
        );
    }

    static readEntityByID(entityFolder, entityIDFolder, entityID, callback) {
        // Defensive programming...check input parameters...
        entityFolder = SecurityUtil.sanitizeStringParameter(entityFolder);
        entityIDFolder = SecurityUtil.sanitizeStringParameter(entityIDFolder);
        entityID = SecurityUtil.sanitizeStringParameter(entityID);
        if((entityFolder.length <= 0) ||
           (entityIDFolder.length <= 0) ||
           (entityID.length <= 0)) {
            if(callback) {
                // BAD REQUEST = 400
                return callback(SecurityError.BAD_REQUEST);
            }
            return;
        }
        if(!entityFolder.endsWith(path.sep)) {
            entityFolder += path.sep;
        }
        if(!entityIDFolder.endsWith(path.sep)) {
            entityIDFolder += path.sep;
        }
        FileSystemUtil._getEntityUUIDByID(entityIDFolder, entityID,
            function(err, entityUUID) {
                if((err != undefined) && (err != null)) {
                    if(callback) {
                        return callback(err);
                    }
                    return;
                }
                FileSystemUtil.readEntityByUUID(entityFolder, entityUUID,
                    function(err, entity) {
                        if((err != undefined) && (err != null)) {
                            if(callback) {
                                return callback(err);
                            }
                            return;
                        }
                        if(callback) {
                            return callback(null, entity);
                        }
                        return;
                    }
                );
            }
        );
    }

    static readEntityByUUID(entityFolder, entityUUID, callback) {
        // Defensive programming...check input parameters...
        entityFolder = SecurityUtil.sanitizeStringParameter(entityFolder);
        entityUUID = SecurityUtil.sanitizeStringParameter(entityUUID);
        if((entityFolder.length <= 0) ||
           (entityUUID.length <= 0)) {
            if(callback) {
                // BAD REQUEST = 400
                return callback(SecurityError.BAD_REQUEST);
            }
            return;
        }
        if(!entityFolder.endsWith(path.sep)) {
            entityFolder += path.sep;
        }
        let filePathEntity = entityFolder + entityUUID + path.sep + 'definition.json';
        mutex.readLock(entityUUID, function(release) {
            fs.readFile(filePathEntity, "utf-8", function (err, data) {
                release();
                if((err != undefined) && (err != null)) {
                    if(callback) {
                        // NOT FOUND = 404
                        return callback(SecurityError.FILE_NOT_FOUND);
                    }
                    return;
                }
                if(data === undefined || data === null) {
                    if(callback) {
                        // INTERNAL SERVER ERROR = 500
                        return callback(SecurityError.INTERNAL_SERVER_ERROR);
                    }
                    return;
                }
                if(callback) {
                    return callback(null, JSON.parse(data));
                }
                return;
            });
        });
    }

    static updateEntity(entityFolder, entityIDFolder, entity, parentUUIDs, name, description, callback) {
        // Defensive programming...check input parameters...
        let updateParents = false;
        let updateDescription = false;
        if(arguments.length === 2) {
            entityFolder = arguments[0];
            entityIDFolder = null;
            entity = arguments[1];
            parentUUIDs = null;
            name = null;
            description = null;
            callback = null;
        } else if(arguments.length === 3) {
            entityFolder = arguments[0];
            entityIDFolder = null;
            entity = arguments[1];
            parentUUIDs = null;
            name = null;
            description = null;
            callback = arguments[2];
        } else if(arguments.length === 4) {
            entityFolder = arguments[0];
            entityIDFolder = arguments[1];
            entity = arguments[2];
            parentUUIDs = null;
            name = null;
            description = null;
            callback = arguments[3];
        } else {
            updateParents = true;
            updateDescription = true;
        }
        entityFolder = SecurityUtil.sanitizeStringParameter(entityFolder);
        entityIDFolder = SecurityUtil.sanitizeStringParameter(entityIDFolder);
        if(entityFolder.length <= 0) {
            // BAD REQUEST = 400
            if(callback) {
                return callback(SecurityError.BAD_REQUEST);
            }
            return;
        }
        if(!entityFolder.endsWith(path.sep)) {
            entityFolder += path.sep;
        }
        if(entityIDFolder.length <= 0) {
            entityIDFolder = null;
        } else if(!entityIDFolder.endsWith(path.sep)) {
            entityIDFolder += path.sep;
        }
        if(entity === undefined || entity === null) {
            // BAD REQUEST = 400
            if(callback) {
                return callback(SecurityError.BAD_REQUEST);
            }
            return;
        }
        if(name === undefined || name === null) {
            name = '';
        }
        name = name.trim();
        // If the entity has a name, but no entityIDFolder was supplied, we return an error
        if((name.length > 0) && (entityIDFolder === null)) {
            if(callback) {
                return callback(SecurityError.BAD_REQUEST);
            }
            return;
        }
        if(parentUUIDs === undefined || parentUUIDs === null) {
            parentUUIDs = [];
        }
        FileSystemUtil.readEntityByUUID(entityFolder, entity.uuid,
            function(err, definition) {
                if(err) {
                    if(callback) {
                        return callback(SecurityError.FILE_NOT_FOUND);
                    }
                    return;
                }
                if(updateParents) {
                    // compare its parents with the supplied parents.
                    let currentParentUUIDs = definition.parentUUIDs;
                    if((currentParentUUIDs != undefined) && (currentParentUUIDs != null)) {
                        for(let i=0;i < currentParentUUIDs.length;i++) {
                            // Remove references from unused parents
                            if(parentUUIDs.indexOf(currentParentUUIDs[i]) < 0) {
                                let childFolder = entityFolder + currentParentUUIDs[i] + path.sep + 'children' + path.sep + definition.uuid + path.sep;
                                fs.remove(childFolder, function(err) {
                                });
                            }
                        }
                    }
                    let createFolder = function(uuid, parentUUID) {
                        fs.mkdir(entityFolder + parentUUID + path.sep + 'children' + path.sep + uuid);
                    };
                    for(let i=0;i < parentUUIDs.length;i++) {
                        createFolder(entity.uuid, parentUUIDs[i]);
                    }
                } else {
                    parentUUIDs = definition.parentUUIDs;
                }
                let currentEntityID = definition['id'];
                let newEntityID = null;
                if(name.length <= 0) {
                    newEntityID = currentEntityID;
                    name = definition.name;
                } else {
                    newEntityID = name.replace(/\s+/g, '-').toLowerCase();
                }
                entity['id'] = newEntityID;
                entity['parentUUIDs'] = parentUUIDs;
                entity['name'] = name;
                entity['description'] = description;
                let currentVersion = definition['currentVersion'];
                let newVersion = parseInt(currentVersion) + 1;
                let versionPath = entityFolder + entity.uuid + path.sep + 'versions' + path.sep + currentVersion + path.sep;
                fs.mkdir(versionPath, {recursive:true}, function() {
                    mutex.readLock(entity.uuid, function(release) {
                        fs.copyFile(entityFolder + entity.uuid + path.sep + 'definition.json', versionPath + 'definition.json',
                            function() {
                                release();
                                let currentTime = Date.now();
                                entity['lastUpdateDate'] = currentTime;
                                let version = {};
                                version['versionCreationDate'] = currentTime;
                                version['version'] = newVersion;
                                let versionList = definition['versions'];
                                if(versionList === undefined || versionList === null) {
                                    versionList = [];
                                }
                                versionList.push(version);
                                entity['versions'] = versionList;
                                entity['currentVersion'] = newVersion;
                                if((currentEntityID != newEntityID) && (entityIDFolder != null)) {
                                    // check if new entity id already exists
                                    let filePathEntityID = entityIDFolder + newEntityID + path.sep;
                                    fs.mkdir(filePathEntityID, function(err) {
                                        if(err) {
                                            if(callback) {
                                                return callback(error.CONFLICT);
                                            }
                                            return;
                                        }
                                        filePathEntityID = filePathEntityID + entity.uuid;
                                        fs.mkdirs(filePathEntityID);
                                        FileSystemUtil._saveEntity(entityFolder, entity,
                                            function(err, savedEntity) {
                                                if(callback) {
                                                    if(err) {
                                                        return callback(error.CONFLICT);
                                                    }
                                                    return callback(null, savedEntity);
                                                }
                                                return;
                                            }
                                        );
                                        filePathEntityID = entityIDFolder + currentEntityID + path.sep;
                                        fs.remove(filePathEntityID, function(err) {});                    
                                    });
                                } else {
                                    FileSystemUtil._saveEntity(entityFolder, entity,
                                        function(err, savedEntity) {
                                            if(callback) {
                                                if(err) {
                                                    return callback(error.CONFLICT);
                                                }
                                                return callback(null, savedEntity);
                                            }
                                        }
                                    );
                                }
                            }
                        );
                    });
                });
            }
        );
    }

    static _createEntityDefinition(entityFolder, entity, entityUUID, entityID, parentUUIDs, name, description, callback) {
        let definition = entity;
        definition['uuid'] = entityUUID;
        definition['id'] = entityID;
        definition['parentUUIDs'] = parentUUIDs;
        definition['name'] = name;
        definition['description'] = description;
        let currentTime = Date.now();
        definition['creationDate'] = currentTime;
        let version = {};
        version['versionCreationDate'] = currentTime;
        version['version'] = 1;
        let versionList = [];
        versionList.push(version);
        definition['versions'] = versionList;
        definition['currentVersion'] = 1;
        let filePathEntity = entityFolder + entityUUID + path.sep;
        fs.mkdir(filePathEntity, {recursive:true}, function(err) {
            if((err != undefined) && (err != null)) {
                if(callback) {
                    // INTERNAL SERVER ERROR = 500
                    return callback(SecurityError.INTERNAL_SERVER_ERROR, null);
                }
                return;
            }
            FileSystemUtil._saveEntity(entityFolder, definition,
                function(err, savedEntity) {
                    if((err != undefined) && (err != null)) {
                        // This really should not have happened.
                        // Lets attempt to rollback the creation of the entity.
                        fs.remove(filePathEntity);
                        if(callback) {
                            // INTERNAL SERVER ERROR = 500
                            return callback(SecurityError.INTERNAL_SERVER_ERROR, null);
                        }
                        return;
                    }
                    if(parentUUIDs === undefined || parentUUIDs === null) {
                        if(callback) {
                            return callback(null, savedEntity);
                        }
                        return;
                    }
                    if(parentUUIDs.length <= 0) {
                        if(callback) {
                            return callback(null, savedEntity);
                        }
                        return;
                    }
                    let createFolder = function(uuid, parentUUID, callback) {
                        fs.stat(entityFolder + parentUUID + path.sep + 'definition.json', function(err, stats) {
                            if((err != undefined) && (err != null)) {
                                return callback(err);
                            }
                            fs.mkdir(entityFolder + parentUUID + path.sep + 'children' + path.sep + uuid, {recursive:true});
                            return callback();
                        })
                    };
                    let todo = parentUUIDs.length;
                    let parentsWithErrors = [];
                    for(let i=0;i < parentUUIDs.length;i++) {
                        let parentUUID = parentUUIDs[i];
                        if(parentUUID === undefined || parentUUID === null) {
                            continue;
                        }
                        parentUUID = parentUUID.trim();
                        if(parentUUID.length <= 0) {
                            continue;
                        }
                        createFolder(definition.uuid, parentUUIDs[i], function(err) {
                            if((err != undefined) && (err != null)) {
                                parentsWithErrors.push(parentUUIDs[i]);
                            }
                            todo--;
                            if(todo <= 0) {
                                for(let j=0;j < parentsWithErrors.length;j++) {
                                    let index = savedEntity.parentUUIDs.indexOf(parentsWithErrors[j]);
                                    savedEntity.parentUUIDs.splice(index,1);
                                }
                                FileSystemUtil._saveEntity(entityFolder, savedEntity);                 
                            }
                        });
                    }
                    return callback(null, savedEntity);
                }
            );
        });
    }

    static _getEntityUUIDByID(entityIDFolder, entityID, callback) {
        // Defensive programming...check input parameters...
        entityIDFolder = SecurityUtil.sanitizeStringParameter(entityIDFolder);
        entityID = SecurityUtil.sanitizeStringParameter(entityID);
        if((entityIDFolder.length <= 0) ||
           (entityID.length <= 0)) {
            if(callback) {
                // BAD REQUEST = 400
                return callback(SecurityError.BAD_REQUEST);
            }
            return;
        }
        if(!entityIDFolder.endsWith(path.sep)) {
            entityIDFolder += path.sep;
        }
        let filePathEntityID = entityIDFolder + entityID + path.sep;
        fs.readdir(filePathEntityID, function(err, files) {
            if((err != undefined) && (err != null)) {
                if(callback) {
                    // NOT FOUND = 404
                    return callback(SecurityError.FILE_NOT_FOUND);
                }
                return;
            }
            if(files === undefined || files === null) {
                if(callback) {
                    // NOT FOUND = 404
                    return callback(SecurityError.FILE_NOT_FOUND);
                }
                return;
            }
            if(files.length <= 0) {
                if(callback) {
                    // NOT FOUND = 404
                    return callback(SecurityError.FILE_NOT_FOUND);
                }
                return;
            }
            let entityUUID = files[0];
            if(entityUUID === undefined || entityUUID === null) {
                if(callback) {
                    // NOT FOUND = 404
                    return callback(SecurityError.FILE_NOT_FOUND);
                }
                return;
            }
            entityUUID = entityUUID.trim();
            if(entityUUID.length <= 0) {
                if(callback) {
                    // NOT FOUND = 404
                    return callback(SecurityError.FILE_NOT_FOUND);
                }
                return;
            }
            callback(null, entityUUID);
        });
    }

    static _saveEntity(entityFolder, entity, callback) {
        // Defensive programming...check input parameters...
        entityFolder = SecurityUtil.sanitizeStringParameter(entityFolder);
        if(entityFolder.length <= 0) {
            if(callback) {
                // BAD REQUEST = 400
                return callback(SecurityError.BAD_REQUEST, null);
            }
            return;
        }
        if(entity === undefined || entity === null) {
            if(callback) {
                // BAD REQUEST = 400
                return callback(SecurityError.BAD_REQUEST, null);
            }
            return;
        }
        let entityUUID = entity.uuid;
        if(entityUUID === undefined || entityUUID === null) {
            if(callback) {
                // BAD REQUEST = 400
                return callback(SecurityError.BAD_REQUEST, null);
            }
            return;
        }
        if(!entityFolder.endsWith(path.sep)) {
            entityFolder += path.sep;
        }
        let definitionFile = entityFolder + entityUUID + path.sep + 'definition.json';
        mutex.writeLock(entityUUID, function(release) {
            var wstream = fs.createWriteStream(definitionFile);
            wstream.write(JSON.stringify(entity, null, 2));
            wstream.end(function() {
                release();
                if(callback) {
                    return callback(null, entity);
                }
                return;
            });
            wstream.on('error', function(err) {
                release();
                logger.error(err);
                logger.error('saveEntity(...): error saving entity with UUID \'' + uuid + '\'.');
                if(callback) {
                    return callback(SecurityError.INTERNAL_SERVER_ERROR);
                }
                return;
            });
        });
    }
}

module.exports = FileSystemUtil;