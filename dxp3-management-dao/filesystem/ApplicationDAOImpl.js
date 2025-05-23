/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-management-dao/filesystem
 *
 * NAME
 * ApplicationDAOImpl
 */
const path = require('path');
const packageName = 'dxp3-management-dao' + path.sep + 'filesystem';
const moduleName = 'ApplicationDAOImpl';
const canonicalName = packageName + path.sep + moduleName;

const DAOError = require('../DAOError');
const FileSystemUtil = require('./FileSystemUtil');
const fs = require('fs');
const logging = require('dxp3-logging');

const logger = logging.getLogger(canonicalName);

class ApplicationDAOImpl {

    constructor(args) {
        if(args === undefined || args === null) {
            throw DAOError.ILLEGAL_ARGUMENT;
        }
        let sourceFolder = args.sourceFolder;
        if(sourceFolder === undefined || sourceFolder === null) {
            logger.error('sourcefolder is undefined or null.');
            throw DAOError.ILLEGAL_ARGUMENT;
        }
        sourceFolder = sourceFolder.trim();
        if(sourceFolder.length <= 0) {
            logger.error('sourcefolder is empty.');
            throw DAOError.ILLEGAL_ARGUMENT;
        }
        if(!sourceFolder.endsWith(path.sep)) {
            sourceFolder += path.sep;
        }
        this.sourceFolder = sourceFolder;
        // Make sure the source folder exists.
        if(!fs.existsSync(this.sourceFolder)) {
            fs.mkdirSync(this.sourceFolder);
        }
        logger.info('Source folder: ' + this.sourceFolder);
    }
    /**********************************
     * CREATE / CONSTRUCTORS
     *********************************/
    createBasic(accountUUID, loggedInUserUUID, applicationName, description, shortName, response) {
	    let accountFolder = this.sourceFolder + 'accounts' + path.sep + 'uuids' + path.sep + accountUUID + path.sep;
	    let applicationsFolder = accountFolder + 'applications' + path.sep + 'uuids' + path.sep;
	    let applicationsIDsFolder = accountFolder + 'applications' + path.sep + 'ids' + path.sep;
	    let application = {};
        application['type'] = 'Basic';
        if(shortName === undefined || shortName === null) {
            shortName = '';
        }
	    application['shortName'] = shortName;
	    FileSystemUtil.createEntity(applicationsFolder, applicationsIDsFolder, application, applicationName, description, null,
    	    function(err, application) {
                if(err) {
                    return response.sendError(err.code);
                }
    	    	response.send(application);
    	    }
	    );
	}
    createAdvanced(accountUUID, loggedInUserUUID, applicationName, description, parentUUIDs, shortName, isTemplate, response) {
        let accountFolder = this.sourceFolder + 'accounts' + path.sep + 'uuids' + path.sep + accountUUID + path.sep;
        let applicationsFolder = accountFolder + 'applications' + path.sep + 'uuids' + path.sep;
        let applicationsIDsFolder = accountFolder + 'applications' + path.sep + 'ids' + path.sep;
        let application = {};
        application['type'] = 'Advanced';
        if(shortName === undefined || shortName === null) {
            shortName = '';
        }
        application['shortName'] = shortName;
        if(isTemplate === undefined || isTemplate === null) {
            isTemplate = false;
        }
        application['isTemplate'] = isTemplate;
console.log('createAdvanced in Implementation 3: ' + applicationName);
        FileSystemUtil.createEntity(applicationsFolder, applicationsIDsFolder, application, applicationName, description, parentUUIDs,
            function(err, application) {
console.log('createAdvanced in Implementation 4');
                if(err) {
                    return response.sendError(err.code);
                }
                // Create categories folder
                fs.mkdir(applicationsFolder + application.uuid + path.sep + 'categories' + path.sep + 'ids' + path.sep, {recursive:true}, function(err) {});
                fs.mkdir(applicationsFolder + application.uuid + path.sep + 'categories' + path.sep + 'uuids' + path.sep, {recursive:true}, function(err) {});
                // Create content folder
                fs.mkdir(applicationsFolder + application.uuid + path.sep + 'content' + path.sep + 'ids' + path.sep, {recursive:true}, function(err) {});
                fs.mkdir(applicationsFolder + application.uuid + path.sep + 'content' + path.sep + 'uuids' + path.sep, {recursive:true}, function(err) {});
                // Create content folder
                fs.mkdir(applicationsFolder + application.uuid + path.sep + 'content_types' + path.sep + 'ids' + path.sep, {recursive:true}, function(err) {});
                fs.mkdir(applicationsFolder + application.uuid + path.sep + 'content_types' + path.sep + 'uuids' + path.sep, {recursive:true}, function(err) {});
                // Create controllers folder
                fs.mkdir(applicationsFolder + application.uuid + path.sep + 'controllers' + path.sep + 'ids' + path.sep, {recursive:true}, function(err) {});
                fs.mkdir(applicationsFolder + application.uuid + path.sep + 'controllers' + path.sep + 'uuids' + path.sep, {recursive:true}, function(err) {});
                // Create fonts folder
                fs.mkdir(applicationsFolder + application.uuid + path.sep + 'fonts' + path.sep + 'ids' + path.sep, {recursive:true}, function(err) {});
                fs.mkdir(applicationsFolder + application.uuid + path.sep + 'fonts' + path.sep + 'uuids' + path.sep, {recursive:true}, function(err) {});
                // Create images folder
                fs.mkdir(applicationsFolder + application.uuid + path.sep + 'images' + path.sep + 'ids' + path.sep, {recursive:true}, function(err) {});
                fs.mkdir(applicationsFolder + application.uuid + path.sep + 'images' + path.sep + 'uuids' + path.sep, {recursive:true}, function(err) {});
                // Create features folder
                fs.mkdir(applicationsFolder + application.uuid + path.sep + 'features' + path.sep + 'ids' + path.sep, {recursive:true}, function(err) {});
                fs.mkdir(applicationsFolder + application.uuid + path.sep + 'features' + path.sep + 'uuids' + path.sep, {recursive:true}, function(err) {});
                // Create layouts folder
                fs.mkdir(applicationsFolder + application.uuid + path.sep + 'layouts' + path.sep + 'ids' + path.sep, {recursive:true}, function(err) {});
                fs.mkdir(applicationsFolder + application.uuid + path.sep + 'layouts' + path.sep + 'uuids' + path.sep, {recursive:true}, function(err) {});
                // Create pages folder
                fs.mkdir(applicationsFolder + application.uuid + path.sep + 'pages' + path.sep + 'ids' + path.sep, {recursive:true}, function(err) {});
                fs.mkdir(applicationsFolder + application.uuid + path.sep + 'pages' + path.sep + 'uuids' + path.sep, {recursive:true}, function(err) {});
                // Create styles folder
                fs.mkdir(applicationsFolder + application.uuid + path.sep + 'styles' + path.sep + 'ids' + path.sep, {recursive:true}, function(err) {});
                fs.mkdir(applicationsFolder + application.uuid + path.sep + 'styles' + path.sep + 'uuids' + path.sep, {recursive:true}, function(err) {});
                // Create usergroups folder
                fs.mkdir(applicationsFolder + application.uuid + path.sep + 'usergroups' + path.sep + 'ids' + path.sep, {recursive:true}, function(err) {});
                fs.mkdir(applicationsFolder + application.uuid + path.sep + 'usergroups' + path.sep + 'uuids' + path.sep, {recursive:true}, function(err) {});
                response.send(application);
            }
        );
	}
	/**********************************
	* READ / GETTERS
	*********************************/
	get(accountUUID, loggedInUserUUID, applicationUUID, response) {
        let self = this;
        let accountFolder = this.sourceFolder + 'accounts' + path.sep + 'uuids' + path.sep + accountUUID + path.sep;
        let applicationsFolder = accountFolder + 'applications' + path.sep + 'uuids' + path.sep;
        FileSystemUtil.readEntityByUUID(applicationsFolder, applicationUUID,
            function(err, application) {
                if(err) {
                    return response.sendError(err.code);
                }
                self._decorateWithParentsfunction(accountUUID, loggedInUserUUID, application, function(err, application) {
                    response.send(application);
                });
            }
        );
    }

    _decorateWithParentsfunction(accountUUID, loggedInUserUUID, application, callback) {
        let parentUUIDs = application.parentUUIDs;
        if((parentUUIDs === undefined) || (parentUUIDs === null)) {
            return callback(null, application);
        }
        if(!Array.isArray(parentUUIDs)) {
            return callback(null, application);
        }
        if(parentUUIDs.length <= 0) {
            return callback(null, application);
        }
        let accountFolder = this.sourceFolder + 'accounts' + path.sep + 'uuids' + path.sep + accountUUID + path.sep;
        let applicationsFolder = accountFolder + 'applications' + path.sep + 'uuids' + path.sep;
        let numberOfParents = parentUUIDs.length;
        let numberOfParentsRetrieved = 0;
        application.parentNames = [];
        let parentUUIDIndices = {};
        for(let i=0;i < parentUUIDs.length;i++) {
            let parentUUID = parentUUIDs[i];
            if(parentUUID === undefined || parentUUID === null) {
                continue;
            }
            parentUUID = parentUUID.trim();
            if(parentUUID.length <= 0) {
                continue;
            }
            parentUUIDIndices[parentUUID] = i;
            FileSystemUtil.readEntityByUUID(applicationsFolder, parentUUID, function(err, parent) {
                if(err) {
                    application.parentNames[parentUUIDIndices[parentUUID]] = '';
                } else {
                    application.parentNames[parentUUIDIndices[parent.uuid]] = parent.name;
                }
                numberOfParentsRetrieved++;
                if(numberOfParentsRetrieved >= numberOfParents) {
                    return callback(null, application);
                }
            });
        }
    }
        // let applicationFolder = applicationsFolder + applicationUUID + path.sep;
        // let definitionFilePath = applicationFolder + 'definition.json';
        // var decorateWithPage = function(applicationDefinition, callback) {
        // var pageUUID = applicationDefinition.pageUUID;
        // pageDao.get(accountUUID, loggedInUserUUID, pageUUID,
        //     function(err, page) {
        //         if(page != undefined && page != null) {
        //             applicationDefinition.pageName = page.name;
        //         }
        //         callback(applicationDefinition);
        //     }
        // );
        // }
        // var decorateWithParents = function(applicationDefinition, callback) {
        // let parentUUIDs = applicationDefinition.parentUUIDs;
        // if((parentUUIDs === undefined) || (parentUUIDs === null)) {
        //     return callback(applicationDefinition);
        // }
        // if(!Array.isArray(parentUUIDs)) {
        //     return callback(applicationDefinition);
        // }
        // if(parentUUIDs.length <= 0) {
        //     return callback(applicationDefinition);
        // }
        // let numberOfParents = parentUUIDs.length;
        // let numberOfParentsRetrieved = 0;
        // applicationDefinition.parentNames = [];
        // let parentUUIDIndices = {};
        // for(let i=0;i < parentUUIDs.length;i++) {
        //     let parentUUID = parentUUIDs[i];
        //     parentUUID = parentUUID.trim();
        //     if(parentUUID.length <= 0) {
        //         continue;
        //     }
        //     parentUUIDIndices[parentUUID] = i;
        //     exports.get(accountUUID, loggedInUserUUID, parentUUID, function(err, parent) {
        //         if((err != undefined) && (err != null)) {
        //             applicationDefinition.parentNames[parentUUIDIndices[parentUUID]] = '';
        //         } else {
        //             applicationDefinition.parentNames[parentUUIDIndices[parent.uuid]] = parent.name;
        //         }
        //         numberOfParentsRetrieved++;
        //         if(numberOfParentsRetrieved >= numberOfParents) {
        //             return callback(applicationDefinition);
        //         }
        //     });
        // }
        // }
        // fileSystem.readFile(definitionFilePath, "utf-8", function (err, data) {
        // if((err != undefined) && (err != null)) {
        //     if(callback) {
        //         return callback(error.FILE_NOT_FOUND);
        //     }
        //     return;
        // }
        // let application = JSON.parse(data);
        // decorateWithPage(application,
        //     function(application) {
        //         decorateWithParents(application,
        //             function(application) {
        //                 if(callback) {
        //                     return callback(null, application);
        //                 }
        //                 return;
        //             }
        //         );
        //     }
        // );
        // });
	
    list(accountUUID, loggedInUserUUID, startIndex, maximumNumberOfResults, parentUUID, categorizedAs, filterBy, sortBy, response) {
        if(startIndex === undefined || startIndex === null) {
            startIndex = 0;
        }
        if(startIndex < 0) {
            startIndex = 0;
        }
        if(maximumNumberOfResults === undefined || maximumNumberOfResults === null) {
            maximumNumberOfResults = -1;
        }
        if(categorizedAs === undefined || categorizedAs === null) {
            categorizedAs = [];
        }
        if(filterBy === undefined || filterBy === null) {
            filterBy = {};
        }
        if(sortBy === undefined || sortBy === null) {
            sortBy = {};
        }
        let accountFolder = this.sourceFolder + 'accounts' + path.sep + 'uuids' + path.sep + accountUUID + path.sep;
        let applicationsFolder = accountFolder + 'applications' + path.sep + 'uuids' + path.sep;
        FileSystemUtil.getEntities(applicationsFolder, parentUUID, startIndex, maximumNumberOfResults, categorizedAs, filterBy, sortBy,
            function(err, result) {
                if((err != undefined) && (err != null)) {
                    return response.sendError(err.code);
                }
                return response.send(result);
            }
        );
	}
    /**********************************
     * UPDATE / SETTERS
     *********************************/
    updateBasic(accountUUID, loggedInUserUUID, applicationUUID, applicationName, description, shortName, response) {
        let accountFolder = this.sourceFolder + 'accounts' + path.sep + 'uuids' + path.sep + accountUUID + path.sep;
        let applicationsFolder = accountFolder + 'applications' + path.sep + 'uuids' + path.sep;
        let applicationsIDsFolder = accountFolder + 'applications' + path.sep + 'ids' + path.sep;
        let application = {};
        application['uuid'] = applicationUUID;
        application['shortName'] = shortName;
        FileSystemUtil.updateEntity(applicationsFolder, applicationsIDsFolder, application, null, applicationName, description,
            function(err, application) {
                if((err != undefined) && (err != null)) {
                    if(err.code === DAOError.CONFLICT.code) {
                        return response.sendError(DAOError.CONFLICT.code);
                    }
                    return response.sendError(DAOError.INTERNAL_SERVER_ERROR.code);
                }
                response.send(application);
            }
        );
    }
    updateAdvanced(accountUUID, loggedInUserUUID, applicationUUID, applicationName, description, parentUUIDs, shortName, isTemplate, response) {
        let accountFolder = this.sourceFolder + 'accounts' + path.sep + 'uuids' + path.sep + accountUUID + path.sep;
        let applicationsFolder = accountFolder + 'applications' + path.sep + 'uuids' + path.sep;
        let applicationsIDsFolder = accountFolder + 'applications' + path.sep + 'ids' + path.sep;
        let application = {};
        application['uuid'] = applicationUUID;
        application['shortName'] = shortName;
        if(isTemplate === undefined || isTemplate === null) {
            isTemplate = false;
        }
        application['isTemplate'] = isTemplate;
        FileSystemUtil.updateEntity(applicationsFolder, applicationsIDsFolder, application, parentUUIDs, applicationName, description,
            function(err, application) {
                if((err != undefined) && (err != null)) {
                    if(err.code === DAOError.CONFLICT.code) {
                        return response.sendError(DAOError.CONFLICT.code);
                    }
                    return response.sendError(DAOError.INTERNAL_SERVER_ERROR.code);
                }
                response.send(application);
            }
        );
    }
    setHomePage(accountUUID, loggedInUserUUID, applicationUUID, pageUUID, response) {
        let accountFolder = this.sourceFolder + 'accounts' + path.sep + 'uuids' + path.sep + accountUUID + path.sep;
        let applicationsFolder = accountFolder + 'applications' + path.sep + 'uuids' + path.sep;
        let application = {};
        application['uuid'] = applicationUUID;
        application['homePageUUID'] = pageUUID;
        FileSystemUtil.updateEntity(applicationsFolder, application,
            function(err, application) {
                if((err != undefined) && (err != null)) {
                    return response.sendError(DAOError.INTERNAL_SERVER_ERROR.code);
                }
                response.send(application);
            }
        );
    }
    /**********************************
     * DELETE
     *********************************/
    delete(accountUUID, loggedInUserUUID, applicationUUID, response) {
        let accountFolder = this.sourceFolder + 'accounts' + path.sep + 'uuids' + path.sep + accountUUID + path.sep;
        let applicationsFolder = accountFolder + 'applications' + path.sep + 'uuids' + path.sep;
        let applicationsIDsFolder = accountFolder + 'applications' + path.sep + 'ids' + path.sep;
        FileSystemUtil.deleteEntityByUUID(applicationsFolder, applicationsIDsFolder, applicationUUID,
            function(err, application) {
                if((err != undefined) && (err != null)) {
                    return response.sendError(err.code);
                }
                response.send(application);
            }
        );
    }
}

module.exports = ApplicationDAOImpl;