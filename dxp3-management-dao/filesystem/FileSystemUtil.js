const path = require('path');
const packageName = 'dxp3-management-dao' + path.sep + 'filesystem';
const moduleName = 'FileSystemUtil';
const canonicalName = packageName + path.sep + moduleName;

const DAOUtil = require('../DAOUtil');
const UUID = require('dxp3-uuid');
const fs = require('fs');
const DAOError = require('../DAOError');
const ReadWriteLock = require('dxp3-mutex-inmemory');
const mutex = new ReadWriteLock();
const util = require('dxp3-util');

class FileSystemUtil {
    /*
     * To create an entity we need one or more of the following:
     * - An entity folder (required). This is where the actual json will be stored using an unique UUID.
     * - An entity ID folder (optional). This is where you want to track the name of each entity. This ensures names are unique.
     * - A prefilled entity which its own set of properties. The name may be supplied as a property of this entity object.
     * - A name (optional) to be used as identifier. If a name is supplied, we also require an entity ID folder.
     * - A description (optional). Just because.
     * - An array of parent entity UUID's (optional). This allows for a family tree/hierarchy.
     *
     * OVERLOADING:
     * -   createEntity(args);
     * -   createEntity(entityFolder);
     * -   createEntity(entityFolder, callback);
     * -   createEntity(entityFolder, entity, callback);
     * -   createEntity(entityFolder, entityIDFolder, entity, callback);
     * -   createEntity(entityFolder, entityIDFolder, entity, name, callback);
     * -   createEntity(entityFolder, entityIDFolder, entity, name, description, callback);
     */
    static createEntity(entityFolder, entityIDFolder, entity, name, description, parentUUIDs, callback) {
console.log('FileSystemUtil.createEntity(...);' + arguments.length);
console.log('FileSystemUtil.createEntity(...);name=' + name);
        // Defensive programming...check input parameters...
        if(arguments.length <= 0) {
        	// We need at least one argument.
            return;
        }
        if(arguments.length === 1) {
            let args = arguments[0];
            if(args === undefined || args === null) {
	        	// If there is one argument this must either be an object or a string.
                return;
            }
            if(typeof args === 'string') {
	            entityFolder = args;
	            entityIDFolder = null;
	            entity = null;
	            name = null;
	            description = null;
	            parentUUIDs = null;
	            callback = null;
            } else if(typeof args === 'object') {
	            entityFolder = args.entityFolder;
	            entityIDFolder = args.entityIDFolder;
	            entity = args.entity;
	            name = args.name;
	            description = args.description;
	            parentUUIDs = args.parentUUIDs;
	            callback = args.callback;
	        } else {
	        	return;
	        }
        } else if(arguments.length === 2) {
            entityFolder = arguments[0];
            entityIDFolder = null;
            entity = null;
            name = null;
            description = null;
            parentUUIDs = null;
            callback = arguments[1];
        } else if(arguments.length === 3) {
            entityFolder = arguments[0];
            entityIDFolder = null;
            entity = arguments[1];
            name = null;
            description = null;
            parentUUIDs = null;
            callback = arguments[2];
        } else if(arguments.length === 4) {
            entityFolder = arguments[0];
            entityIDFolder = arguments[1];
            entity = arguments[2];
            name = null;
            description = null;
            parentUUIDs = null;
            callback = arguments[3];
        } else if(arguments.length === 5) {
            entityFolder = arguments[0];
            entityIDFolder = arguments[1];
            entity = arguments[2];
            name = arguments[3];
            description = null;
            parentUUIDs = null;
            callback = arguments[4];
        } else if(arguments.length === 6) {
            entityFolder = arguments[0];
            entityIDFolder = arguments[1];
            entity = arguments[2];
            name = arguments[3];
            description = arguments[4];
            parentUUIDs = null;
            callback = arguments[5];
        } else {
            entityFolder = arguments[0];
            entityIDFolder = arguments[1];
            entity = arguments[2];
            name = arguments[3];
            description = arguments[4];
            parentUUIDs = arguments[5];
            callback = arguments[(arguments.length - 1)];
        }
console.log('1');
        entityFolder = DAOUtil.sanitizeStringParameter(entityFolder);
        if(entityFolder.length <= 0) {
            if(callback) {
                return callback(DAOError.BAD_REQUEST);
            }
            return;
        }
        if(!entityFolder.endsWith(path.sep)) {
            entityFolder += path.sep;
        }
console.log('2');
        entityIDFolder = DAOUtil.sanitizeStringParameter(entityIDFolder);
        if(entityIDFolder.length <= 0) {
            entityIDFolder = null;
        } else if(!entityIDFolder.endsWith(path.sep)) {
            entityIDFolder += path.sep;
        }
        if(entity === undefined || entity === null) {
            entity = {};
        } else {
            // If we don't have a name we check if it is a property of the entity object.
            if(name === undefined || name === null) {
                name = entity.name;
            }
        }
console.log('3 : ' + name);
        name = DAOUtil.sanitizeStringParameter(name);
console.log('4');
        description = DAOUtil.sanitizeStringParameter(description);
console.log('5');
        parentUUIDs = DAOUtil.sanitizeArrayParameter(parentUUIDs);
console.log('6');
        if(name.length > 0) {
            if(entityIDFolder === null) {
                // The entity has a name, but no entityIDFolder was supplied. Lets give up.
                if(callback) {
                    return callback(DAOError.BAD_REQUEST);
                }
                return;
            }
            FileSystemUtil._createNamedEntity(entityFolder, entityIDFolder, entity, name, description, parentUUIDs, callback);
        } else {
            FileSystemUtil._createUnnamedEntity(entityFolder, entity, description, parentUUIDs, callback);
        }
    }

    static _createUnnamedEntity(entityFolder, entity, description, parentUUIDs, callback) {
        // When we arrive here, all necessary validations have already been performed.
        entity.uuid = UUID.create();
        entity.id = null;
        entity.name = null;
        entity.description = description;
        FileSystemUtil._createEntityDefinition(entityFolder, entity,
            function(err, entityDefinition) {
                if(err) {
                    if(callback) {
                        return callback(DAOError.INTERNAL_SERVER_ERROR);
                    }
                    return;
                }
                FileSystemUtil._createEntityVersions(entityFolder, entity.uuid,
                	function(err, entityVersion) {
                		if(err) {
                			if(callback) {
                				return callback(DAOError.INTERNAL_SERVER_ERROR);
                			}
                			return;
                		}
		                if(parentUUIDs.length > 0) {
			                FileSystemUtil._createEntityFamilyTree(entityFolder, entity.uuid, parentUUIDs, 
			                    function(err, entityFamilyTree) {
			                        if(err) {
			                            if(callback) {
			                                return callback(DAOError.INTERNAL_SERVER_ERROR);
			                            }
			                            return;
			                        }
			                        if(callback) {
			                            return callback(null, entityDefinition);
			                        }
			                    }
			                );
			            } else {
			            	if(callback) {
		                        return callback(null, entityDefinition);
			            	}
			            }
                	}
            	);
            }
        );
    }

    static _createNamedEntity(entityFolder, entityIDFolder, entity, name, description, parentUUIDs, callback) {
console.log('FileSystemUtil.createNamedEntity(...);');
        // When we arrive here, all necessary validations have already been performed.
        entity.uuid = UUID.create();
        entity.id = name.replace(/\s+/g, '-').toLowerCase();
        entity.name = name;
        entity.description = description;
        let filePathEntityID = entityIDFolder + entity.id + path.sep;
        mutex.writeLock(entityIDFolder, function(releaseFolder) {
            fs.mkdir(filePathEntityID, {recursive:false}, function(err) {
                releaseFolder();
                if(err) {
                    // We were unable to create the folder. This highly likely means
                    // another entity already exists with the same name/id.
                    if(callback) {
                        // If a callback function was supplied, we retrieve the entity with the 
                        // same name/id and return it.
                        FileSystemUtil.readEntityByID(entityFolder, entityIDFolder, entity.id, 
                            function(err, entity) {
                                if(err) {
                                    // Something went wrong with retrieval of the entity
                                    // with the same name/id. Lets give up.
                                    return callback(DAOError.INTERNAL_SERVER_ERROR);
                                }
                                return callback(DAOError.CONFLICT, entity);
                            }
                        );
                    }
                    return;
                }
                // Next create the UUID folder in the ID folder
                let filePathEntityIDUUID = filePathEntityID + entity.uuid;
                fs.mkdir(filePathEntityIDUUID, {recursive:false}, function(err) {
                    if(err) {
                        // This really should not have happened.
                        // Lets attempt to rollback the creation of the entity id
                        fs.rmdir(filePathEntityID, {recursive:true}, function(err) {
                            if(callback) {
                                return callback(DAOError.INTERNAL_SERVER_ERROR);
                            }
                        });
                        return;
                    }
                    FileSystemUtil._createEntityDefinition(entityFolder, entity,
                        function(err, entityDefinition) {
                            if(err) {
                                // This really should not have happened.
                                // Lets attempt to rollback the creation of the entity id
                                fs.rmdir(filePathEntityID, {recursive:true}, function(err) {});
                                if(callback) {
                                    return callback(DAOError.INTERNAL_SERVER_ERROR);
                                }
                                return;
                            }
			                FileSystemUtil._createEntityVersions(entityFolder, entity.uuid,
			                	function(err, entityVersion) {
			                		if(err) {
		                                // This really should not have happened.
		                                // Lets attempt to rollback the creation of the entity id
		                                fs.rmdir(filePathEntityID, {recursive:true}, function(err) {});
			                			if(callback) {
			                				return callback(DAOError.INTERNAL_SERVER_ERROR);
			                			}
			                			return;
			                		}
					                if(parentUUIDs.length > 0) {
			                            FileSystemUtil._createEntityFamilyTree(entityFolder, entity.uuid, parentUUIDs, 
			                                function(err, entityFamilyTree) {
			                                    if(err) {
			                                        // This really should not have happened.
			                                        // Lets attempt to rollback the creation of the entity id
			                                        fs.rmdir(filePathEntityID, {recursive:true}, function(err) {});
			                                        if(callback) {
			                                            return callback(DAOError.INTERNAL_SERVER_ERROR);
			                                        }
			                                        return;
			                                    }
			                                    if(callback) {
			                                        return callback(null, entityDefinition);
			                                    }
			                                }
			                            );
						            } else {
						            	if(callback) {
					                        return callback(null, entityDefinition);
						            	}
			                        }
			                    }
		                    );
                        }
                    );
                    return;
                });
                return;
            });
        });
    }

    static _createEntityDefinition(entityFolder, entity, callback) {
        let currentTime = Date.now();
        entity['creationDate'] = currentTime;
        let filePathEntity = entityFolder + entity.uuid + path.sep;
        fs.mkdir(filePathEntity, {recursive:true}, function(err) {
            if(err) {
                if(callback) {
                    return callback(DAOError.INTERNAL_SERVER_ERROR, null);
                }
                return;
            }
            FileSystemUtil._updateEntityDefinition(entityFolder, entity,
                function(err, savedEntity) {
                    if(err) {
                        // This really should not have happened.
                        // Lets attempt to rollback the creation of the entity.
                        fs.rmdir(filePathEntity, {recursive: true}, function(err) {
                            if(callback) {
                                return callback(DAOError.INTERNAL_SERVER_ERROR, null);
                            }
                        });
                        return;
                    }
                    if(callback) {
                        return callback(null, savedEntity);
                    }
                }
            );
        });
    }

    static _createEntityFamilyTree(entityFolder, entityUUID, parentUUIDs, callback) {
    	if(parentUUIDs === undefined || parentUUIDs === null) {
    		parentUUIDs = [];
    	} else {
	        // Lets clean up the parents
	        let tmpArray = [];
	        for(let i=0;i < parentUUIDs.length;i++) {
	            let parentUUID = parentUUIDs[i];
	            if(parentUUID === undefined || parentUUID === null) {
	                continue;
	            }
	            if(typeof parentUUID != 'string') {
	                continue;
	            }
	            parentUUID = parentUUID.trim();
	            if(parentUUID.length <= 0) {
	                continue;
	            }
	            let lowerCaseParentUUID = parentUUID.toLowerCase();
	            if(lowerCaseParentUUID === 'null' || 'lowerCaseParentUUID' === 'undefined') {
	                continue;
	            }
	            tmpArray.push(parentUUID);
	        }
	        parentUUIDs = tmpArray;
	    }
        let entityFamilyTree = {};
        entityFamilyTree['uuid'] = entityUUID;
        entityFamilyTree['parentUUIDs'] = parentUUIDs;
        entityFamilyTree['childrenUUIDs'] = null;
        let currentTime = Date.now();
        entityFamilyTree['creationDate'] = currentTime;
        FileSystemUtil._updateEntityFamilyTree(entityFolder, entityFamilyTree,
            function(err, entityFamilyTree) {
                if(err) {
                    if(callback) {
                        return callback(DAOError.INTERNAL_SERVER_ERROR, null);
                    }
                    return;
                }
                let todo = parentUUIDs.length;
                let parentsWithErrors = [];
                if(parentUUIDs.length > 0) {
                    for(let i=0;i < parentUUIDs.length;i++) {
                        let parentUUID = parentUUIDs[i];
				        mutex.writeLock(parentUUID, function(release) {
                	        FileSystemUtil._addEntityChild(entityFolder, parentUUID, entityUUID, function(err, parentFamilyTree) {
                            	release();
	                            if(err) {
	                                parentsWithErrors.push(parentUUID);
	                            }
	                            todo--;
	                            if(todo <= 0) {
	                                if(parentsWithErrors.length > 0) {
	                                    for(let j=0;j < parentsWithErrors.length;j++) {
	                                        let index = entityFamilyTree.parentUUIDs.indexOf(parentsWithErrors[j]);
	                                        entityFamilyTree.parentUUIDs.splice(index,1);
	                                    }
	                                    FileSystemUtil._updateEntityFamilyTree(entityFolder, entityFamilyTree, 
	                                        function(err, entityFamilyTree) {
	                                            if(callback) {
	                                                return callback(null, entityFamilyTree);
	                                            }
	                                        });
	                                } else {
	                                    if(callback) {
	                                        return callback(null, entityFamilyTree);
	                                    }
	                                }
	                            }
	                        });
                	    });
                    }
                } else {
                    if(callback) {
                        return callback(null, savedFamilyTree);
                    }
                }
            }
        );
    }

    static _createEntityVersions(entityFolder, entityUUID, callback) {
        let entityVersions = {};
        entityVersions['uuid'] = entityUUID;
        let currentTime = Date.now();
        let version = {};
        version['versionCreationDate'] = currentTime;
        version['version'] = 1;
        let versionList = [];
        versionList.push(version);
        entityVersions['versions'] = versionList;
        entityVersions['currentVersion'] = 1;
        FileSystemUtil._updateEntityVersions(entityFolder, entityVersions,
            function(err, entityVersions) {
            	if(err) {
                    if(callback) {
                        return callback(DAOError.INTERNAL_SERVER_ERROR, null);
                    }
                    return;
            	}
            	if(callback) {
            		return callback(null, entityVersions);
            	}
			}
		);
    }

    static readEntityByID(entityFolder, entityIDFolder, entityID, callback) {
        // Defensive programming...check input parameters...
        entityFolder = DAOUtil.sanitizeStringParameter(entityFolder);
        entityIDFolder = DAOUtil.sanitizeStringParameter(entityIDFolder);
        entityID = DAOUtil.sanitizeStringParameter(entityID);
        if((entityFolder.length <= 0) ||
           (entityIDFolder.length <= 0) ||
           (entityID.length <= 0)) {
            if(callback) {
                // BAD REQUEST = 400
                return callback(DAOError.BAD_REQUEST);
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
        entityFolder = DAOUtil.sanitizeStringParameter(entityFolder);
        entityUUID = DAOUtil.sanitizeStringParameter(entityUUID);
        if((entityFolder.length <= 0) ||
           (entityUUID.length <= 0)) {
            if(callback) {
                // BAD REQUEST = 400
                return callback(DAOError.BAD_REQUEST);
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
                if(callback) {
                    if(err) {
                        // NOT FOUND = 404
                        return callback(DAOError.FILE_NOT_FOUND, null);
                    }
                    if(data === undefined || data === null) {
                        // INTERNAL SERVER ERROR = 500
                        return callback(DAOError.INTERNAL_SERVER_ERROR, null);
                    }
                    let entity = JSON.parse(data);
                    return callback(null, entity);
                }
            });
        });
    }

    static _getEntityUUIDByID(entityIDFolder, entityID, callback) {
        // Defensive programming...check input parameters...
        entityIDFolder = DAOUtil.sanitizeStringParameter(entityIDFolder);
        entityID = DAOUtil.sanitizeStringParameter(entityID);
        if((entityIDFolder.length <= 0) ||
           (entityID.length <= 0)) {
            if(callback) {
                // BAD REQUEST = 400
                return callback(DAOError.BAD_REQUEST);
            }
            return;
        }
        if(!entityIDFolder.endsWith(path.sep)) {
            entityIDFolder += path.sep;
        }
        let filePathEntityID = entityIDFolder + entityID + path.sep;
        fs.readdir(filePathEntityID, function(err, files) {
            if(err) {
                if(callback) {
                    // NOT FOUND = 404
                    return callback(DAOError.FILE_NOT_FOUND);
                }
                return;
            }
            if(files === undefined || files === null) {
                if(callback) {
                    // NOT FOUND = 404
                    return callback(DAOError.FILE_NOT_FOUND);
                }
                return;
            }
            if(files.length <= 0) {
                if(callback) {
                    // NOT FOUND = 404
                    return callback(DAOError.FILE_NOT_FOUND);
                }
                return;
            }
            let entityUUID = files[0];
            if(entityUUID === undefined || entityUUID === null) {
                if(callback) {
                    // NOT FOUND = 404
                    return callback(DAOError.FILE_NOT_FOUND);
                }
                return;
            }
            entityUUID = entityUUID.trim();
            if(entityUUID.length <= 0) {
                if(callback) {
                    // NOT FOUND = 404
                    return callback(DAOError.FILE_NOT_FOUND);
                }
                return;
            }
            callback(null, entityUUID);
        });
    }

    static _readEntityFamilyTree(entityFolder, entityUUID, callback) {
        let entityFamilyTreeFile = entityFolder + entityUUID + path.sep + 'familytree.json';
        fs.readFile(entityFamilyTreeFile, "utf-8", function (err, data) {
            if(err) {
            	if(callback) {
                    return callback(DAOError.FILE_NOT_FOUND, null);
            	}
                return;
            }
            if(data === undefined || data === null) {
                return callback(DAOError.INTERNAL_SERVER_ERROR, null);
            }
            let entityFamilyTree = JSON.parse(data);
            if(callback) {
            	return callback(null, entityFamilyTree);
            }
        });
    }

    static _updateEntityFamilyTree(entityFolder, entityFamilyTree, callback) {
        let entityUUID = entityFamilyTree.uuid;
        let entityFamilyTreeFile = entityFolder + entityUUID + path.sep + 'familytree.json';
        let wstream = fs.createWriteStream(entityFamilyTreeFile);
        wstream.on('open', function(err) {
            wstream.write(JSON.stringify(entityFamilyTree, null, 2));
            wstream.end(function() {
                if(callback) {
                    return callback(null, entityFamilyTree);
                }
                return;
            });
        });
        wstream.on('error', function(err) {
            console.log('error while writing: ' + entityFamilyTreeFile);
            if(callback) {
                return callback(DAOError.INTERNAL_SERVER_ERROR);
            }
            return;
        });
    }

    static _updateEntityDefinition(entityFolder, entityDefinition, callback) {
        let entityUUID = entityDefinition.uuid;
        let entityDefinitionFile = entityFolder + entityUUID + path.sep + 'definition.json';
        let wstream = fs.createWriteStream(entityDefinitionFile);
        wstream.write(JSON.stringify(entityDefinition, null, 2));
        wstream.end(function() {
            if(callback) {
                return callback(null, entityDefinition);
            }
            return;
        });
        wstream.on('error', function(err) {
            logger.error(err);
            logger.error('saveEntity(...): error saving entity with UUID \'' + entityUUID + '\'.');
            if(callback) {
                return callback(DAOError.INTERNAL_SERVER_ERROR);
            }
            return;
        });
    }

    static _updateEntityVersions(entityFolder, entityVersions, callback) {
        let entityUUID = entityVersions.uuid;
        let entityVersionsFile = entityFolder + entityUUID + path.sep + 'versions.json';
        let wstream = fs.createWriteStream(entityVersionsFile);
        wstream.on('open', function(err) {
            wstream.write(JSON.stringify(entityVersions, null, 2));
            wstream.end(function() {
                if(callback) {
                    return callback(null, entityVersions);
                }
                return;
            });
        });
        wstream.on('error', function(err) {
            if(callback) {
                return callback(DAOError.INTERNAL_SERVER_ERROR);
            }
            return;
        });
    }

    static updateEntity(entityFolder, entityIDFolder, entity, parentUUIDs, name, description, callback) {
        // Defensive programming...check input parameters...
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
        } else if(arguments.length === 5) {
            entityFolder = arguments[0];
            entityIDFolder = arguments[1];
            entity = arguments[2];
            parentUUIDs = arguments[3];
            name = null;
            description = null;
            callback = arguments[4];
        } else if(arguments.length === 6) {
            entityFolder = arguments[0];
            entityIDFolder = arguments[1];
            entity = arguments[2];
            parentUUIDs = arguments[3];
            name = arguments[4];
            description = null;
            callback = arguments[5];
        }
        entityFolder = DAOUtil.sanitizeStringParameter(entityFolder);
        entityIDFolder = DAOUtil.sanitizeStringParameter(entityIDFolder);
        if(entityFolder.length <= 0) {
            // BAD REQUEST = 400
            if(callback) {
                return callback(DAOError.BAD_REQUEST);
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
                return callback(DAOError.BAD_REQUEST);
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
                return callback(DAOError.BAD_REQUEST);
            }
            return;
        }
        if(parentUUIDs === undefined) {
            parentUUIDs = null;
        }
        FileSystemUtil.readEntityByUUID(entityFolder, entity.uuid,
            function(err, definition) {
                if(err) {
                    if(callback) {
                        return callback(DAOError.FILE_NOT_FOUND);
                    }
                    return;
                }
                if(parentUUIDs != null) {
                    if(typeof parentUUIDs === 'string') {
                        parentUUIDs = parentUUIDs.split(',');
                    }
                    // compare its parents with the supplied parents.
                    let currentParentUUIDs = definition.parentUUIDs;
                    if((currentParentUUIDs != undefined) && (currentParentUUIDs != null)) {
                        for(let i=0;i < currentParentUUIDs.length;i++) {
                            // Remove references from unused parents
                            if(parentUUIDs.indexOf(currentParentUUIDs[i]) < 0) {
                                let childFolder = entityFolder + currentParentUUIDs[i] + path.sep + 'children' + path.sep + definition.uuid + path.sep;
                                fs.rmdir(childFolder, {recursive: true}, function(err) {
                                });
                            }
                        }
                    }
                    let createFolder = function(uuid, parentUUID) {
                        fs.mkdir(entityFolder + parentUUID + path.sep + 'children' + path.sep + uuid, {recursive: true}, function(err) {});
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
                if(description != null) {
                    entity['description'] = description;
                }
                entity = {...definition, ...entity};
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
                                                return callback(DAOError.CONFLICT);
                                            }
                                            return;
                                        }
                                        filePathEntityID = filePathEntityID + entity.uuid;
                                        fs.mkdir(filePathEntityID, {recursive:true}, function(err) {

                                        });
                                        FileSystemUtil._updateEntityDefinition(entityFolder, entity,
                                            function(err, savedEntity) {
                                                if(callback) {
                                                    if(err) {
                                                        return callback(DAOError.CONFLICT);
                                                    }
                                                    return callback(null, savedEntity);
                                                }
                                                return;
                                            }
                                        );
                                        filePathEntityID = entityIDFolder + currentEntityID + path.sep;
                                        fs.rmdir(filePathEntityID, {recursive: true}, function(err) {});                    
                                    });
                                } else {
                                    FileSystemUtil._updateEntityDefinition(entityFolder, entity,
                                        function(err, savedEntity) {
                                            if(callback) {
                                                if(err) {
                                                    return callback(DAOError.CONFLICT);
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

    static getEntities(entityFolder, parentEntityUUID, startIndex, maximumNumberOfResults, categorizedAs, filterBy, sortBy, callback) {
        // Defensive programming...check input parameters...
        entityFolder = DAOUtil.sanitizeStringParameter(entityFolder);
        parentEntityUUID = DAOUtil.sanitizeStringParameter(parentEntityUUID);
        categorizedAs = DAOUtil.sanitizeArrayParameter(categorizedAs);
        if(entityFolder.length <= 0) {
            if(callback) {
                // BAD REQUEST = 400
                return callback(DAOError.BAD_REQUEST);
            }
            return;
        }
        if(!entityFolder.endsWith(path.sep)) {
            entityFolder += path.sep;
        }
        if(startIndex === undefined || startIndex === null) {
            startIndex = 0;
        }
        if(startIndex < 0) {
            startIndex = 0;
        }
        if(maximumNumberOfResults === undefined || maximumNumberOfResults === null) {
            maximumNumberOfResults = -1;
        }
        if(filterBy === undefined || filterBy === null) {
            filterBy = {};
        }
        if(sortBy === undefined || sortBy === null) {
            sortBy = {};
        }
        var doIt = function(rootFolder, startIndex, maximumNumberOfResults, categorizedAs, filterBy, sortBy, callback) {
            var result = {};
            var resultArray = [];
            var uuidName = {};
            fs.readdir(rootFolder, function(err, entityDirectories) {
                if((err != undefined) && (err != null)) {
                    return callback(DAOError.INTERNAL_SERVER_ERROR);
                }
                var definitionFiles = [];
                for(var index in entityDirectories) {
                    var definitionFile = rootFolder + entityDirectories[index] + path.sep + 'definition.json';
                    definitionFiles.push(definitionFile);
                }
                FileSystemUtil._readFiles(definitionFiles, function(errors, definitionFilesContent) {
                    definitionFilesContent.forEach(function(contentString) {
                        var content = JSON.parse(contentString);
                        uuidName[content.uuid] = content.name;
                        var toBeIncluded = true;
                        for(var filterName in filterBy) {
                            var value = filterBy[filterName];
                            var contentValue = content[filterName];
                            if(typeof(contentValue) === 'boolean') {
                                contentValue = contentValue.toString();
                            }
                            if(contentValue === undefined) {
                                toBeIncluded = false;
                                break;
                            } else if(contentValue === null) {
                                toBeIncluded = false;
                                break;
                            } else if(contentValue.toLowerCase().indexOf(value.toLowerCase()) < 0) {
                                toBeIncluded = false;
                                break;
                            }
                        }
                        if(toBeIncluded) {
                            resultArray.push(content);
                        }
                    });
                    resultArray.forEach(function(content) {
                        var parentUUIDs = content.parentUUIDs;
                        if(parentUUIDs != null && (parentUUIDs != null)) {
                            var parentNames = [];
                            parentUUIDs.forEach(function(parentUUID) {
                                var parentName = uuidName[parentUUID];
                                parentNames.push(parentName);
                            });
                            content.parentNames = parentNames;
                        }

                    });
                    resultArray.sort(function(a, b) {
                        for(var sortByProperty in sortBy) {
                            var propertyA = a[sortByProperty];
                            var propertyB = b[sortByProperty];
                            if(typeof(propertyA) === 'string') {
                                propertyA = propertyA.toLowerCase();
                                propertyB = propertyB.toLowerCase();
                            }
                            var order = sortBy[sortByProperty];
                            if(order === 'ascending') {
                                if(propertyA < propertyB) {
                                    return -1;
                                }
                                if(propertyA > propertyB) {
                                    return 1;
                                }
                            } else {
                                if(propertyA < propertyB) {
                                    return 1;
                                }
                                if(propertyA > propertyB) {
                                    return -1;
                                }
                            }
                        }
                        return 0;
                    });
                    result.totalNumberOfResults = resultArray.length;
                    // Only return the asked for subsection
                    if(startIndex > 0) {
                        resultArray.splice(0, startIndex);
                    }
                    if(maximumNumberOfResults >= 0) {
                        if(maximumNumberOfResults < resultArray.length) {
                            resultArray.splice(maximumNumberOfResults, resultArray.length - maximumNumberOfResults);
                        }
                    }
                    result.numberOfResults = resultArray.length;
                    result.list = resultArray;
                    return callback(null, result);
                });
            });
        }
        if(parentEntityUUID.length <= 0) {
            doIt(entityFolder, startIndex, maximumNumberOfResults, categorizedAs, filterBy, sortBy, callback);
        } else {
            var childrenFolder = entityFolder + parentEntityUUID + path.sep + 'children';
            doIt(childrenFolder, startIndex, maximumNumberOfResults, categorizedAs, filterBy, sortBy, callback);
        }
    }

    static deleteEntityByUUID(entityFolder, entityIDFolder, entityUUID, callback) {
        // Defensive programming...check input parameters...
        if(arguments.length < 2) {
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
        entityFolder = DAOUtil.sanitizeStringParameter(entityFolder);
        entityIDFolder = DAOUtil.sanitizeStringParameter(entityIDFolder);
        entityUUID = DAOUtil.sanitizeStringParameter(entityUUID);
        if(entityFolder.length <= 0) {
            // BAD REQUEST = 400
            if(callback) {
                return callback(DAOError.BAD_REQUEST);
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
                return callback(DAOError.BAD_REQUEST);
            }
            return;
        }
        FileSystemUtil.readEntityByUUID(entityFolder, entityUUID, function(err, entity) {
            mutex.writeLock(entityUUID, function(releaseEntity) {
                if(err) {
                    let filePathEntity = entityFolder + entityUUID + path.sep;
                    fs.rmdir(filePathEntity, {recursive: true}, function(err) {
                        releaseEntity();
                        if(callback) {
                            return callback(err, entity);
                        }
                    });
                    return;
                }
                // remove us from any parent...
                let parentUUIDs = entity.parentUUIDs;
                if((parentUUIDs != undefined) && (parentUUIDs != null)) {
                    for(let i=0;i < parentUUIDs.length;i++) {
                        let parentUUID = parentUUIDs[i];
                        let childFolder = entityFolder + parentUUID + path.sep + 'children' + path.sep + entityUUID;
                        mutex.writeLock(parentUUID, function(releaseFolder) {
                            fs.rmdir(childFolder, {recursive:true}, function(err) {
                                releaseFolder();
                            });
                        });
                    }
                }
                // Remove us from any children
                let childrenFolder = entityFolder + entityUUID + path.sep + 'children' + path.sep;
                fs.readdir(childrenFolder, function(err, childUUIDs) {
                    for(let index in childUUIDs) {
                        let childUUID = childUUIDs[index];
                        let childEntityFile = entityFolder + childUUID + path.sep + 'definition.json';
                        mutex.writeLock(childUUID, function(releaseChild) {
                            fs.readFile(childEntityFile, "utf-8", function (err, data) {
                                if((err != undefined) && (err != null)) {
                                    return;
                                }
                                let childEntity = JSON.parse(data);
                                let parentUUIDs = childEntity.parentUUIDs;
                                if(parentUUIDs === undefined || parentUUIDs === null) {
                                    releaseChild();
                                    return;
                                }
                                let parentUUIDIndex = parentUUIDs.indexOf(entityUUID);
                                if(parentUUIDIndex >= 0) {
                                    childEntity.parentUUIDs.splice(parentUUIDIndex, 1);
                                    FileSystemUtil._saveEntityDefinition(entityFolder, childEntity,
                                        function(err, savedEntity) {
                                            if(err) {
                                                // This really should not have happened.
                                                // Now we have inconsistencies in our data...
                                                logger.warn('deleteEntity(...): Potential data inconsistency. Unable to remove parent \'' + uuid + '\' from child \'' + childUUID + '\'.');
                                            }
                                            releaseChild();
                                        }
                                    );
                                }
                            });
                        });
                    }
                });
                let entityID = entity.id;
                if(entityID != undefined && entityID != null && entityIDFolder != null) {
                    let filePathEntityID = entityIDFolder + entityID + path.sep;
                    fs.rmdir(filePathEntityID, {recursive:true}, function(error) {
                    });
                }
                let filePathEntity = entityFolder + entityUUID + path.sep;
                fs.rmdir(filePathEntity, {recursive: true}, function(err) {
                    releaseEntity();
                    if(callback) {
                        return callback(null, entity);
                    }
                });
                return;
            });
        });
    }

    static _addEntityChild(entityFolder, parentUUID, childUUID, callback) {
        FileSystemUtil._readEntityFamilyTree(entityFolder, parentUUID,
            function(err, entityFamilyTree) {
                if(err) {
                    if(callback) {
                        return callback(err);
                    }
                    return;
                }
                let childrenUUIDs = entityFamilyTree['childrenUUIDs'];
                if(childrenUUIDs === undefined || childrenUUIDs === null) {
                    childrenUUIDs = [];
                    entityFamilyTree['childrenUUIDs'] = childrenUUIDs;
                }
                let index = childrenUUIDs.indexOf(childUUID);
                if(index >= 0) {
                    if(callback) {
                        return callback();
                    }
                    return;
                }
                childrenUUIDs.push(childUUID);
                FileSystemUtil._updateEntityFamilyTree(entityFolder, entityFamilyTree,
                    function(err, entityFamilyTree) {
                        if(err) {
                            if(callback) {
                                return callback(err);
                            }
                            return;
                        }
                        if(callback) {
                            return callback();
                        }
                    }
                );
            }
        );
    }

    static _readFiles(paths, callback) {
        let result = [], errors = [], numberOfFiles = paths.length;
        if(numberOfFiles <= 0) {
            callback(null, result);
        } else {
            paths.forEach(function (path, k) {
                fs.readFile(path, "utf-8", function (err, data) {
                    --numberOfFiles;
                    err && (errors[k] = err);
                    !err && (result[k] = data);
                    !numberOfFiles && callback(errors.length ? errors : null, result);
                });
            });
        }
    }
}
// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
    for(let i=0;i < 10;i++) {
        // FileSystemUtil.createEntity('C:\\temp\\test\\', function(err, entity) {
        //     console.log('created entity: ' + entity.uuid);
        // });
        let entityName = 'henk_' + i;
        let entity = {
            name: entityName
        };
        FileSystemUtil.createEntity('C:\\temp\\test\\', 'C:\\temp\\test\\', entity, 'another_' + i, null, ['3c278320-3a1d-4823-a204-3fef106121fe'], function(err, entity) {
            if(err) {
                console.log('Error: ' + err);
                return;
            }
            console.log('created entity: ' + entity.id);
        });
        // FileSystemUtil.createEntity('C:\\temp\\test\\', null, null, null, null, ['0b0d9389-dc7f-4e3c-9372-9f0eed127fa1'], function(err, entity) {
        //     if(err) {
        //         console.log('Error: ' + err);
        //         return;
        //     }
        //     console.log('created entity with parents: ' + entity.uuid);
        // });
        // FileSystemUtil.createEntity('C:\\temp\\test\\', function(err, entity) {
        // 	console.log('created entity: ' + entity.uuid);
        // });

    }
    return;
}

module.exports = FileSystemUtil;