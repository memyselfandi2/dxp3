/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-delivery-dao/filesystem
 *
 * NAME
 * ApplicationDAOImpl
 */
const path = require('path');
const packageName = 'dxp3-delivery-dao' + path.sep + 'filesystem';
const moduleName = 'ApplicationDAOImpl';
const canonicalName = packageName + path.sep + moduleName;
/**
 * @module dxp3-delivery-dao/filesystem/ApplicationDAOImpl
 */
const DAOError = require('../DAOError');
const logging = require('dxp3-logging');
const logger = logging.getLogger(canonicalName);
const fs = require('fs');

class ApplicationDAOImpl {

    constructor(args) {
        if(args === undefined || args === null) {
            throw DAOError.ILLEGAL_ARGUMENT;
        }
        let sourceFolder = args.sourceFolder;
        if(sourceFolder === undefined || sourceFolder === null) {
            logger.error('sourcefolder is undefined or empty.');
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
        this.sourceFolder = sourceFolder + 'applications' + path.sep;
        // Make sure the source folder exists.
        if(!fs.existsSync(this.sourceFolder)) {
            fs.mkdirSync(this.sourceFolder);
        }
        logger.info('Source folder: ' + this.sourceFolder);
    }

    get(applicationUUID, response) {
        if(applicationUUID === undefined || applicationUUID === null) {
            if(response) {
                return response.sendError(DAOError.ILLEGAL_ARGUMENT);
            }
            return;
        }
        applicationUUID = applicationUUID.trim();
        if(applicationUUID.length <= 0) {
            if(response) {
                return response.sendError(DAOError.ILLEGAL_ARGUMENT);
            }
            return;
        }
        let fileName = this.sourceFolder + applicationUUID + path.sep + 'definition.json';
        // console.log('applicaitondaoimpl read file: ' + fileName);
        fs.readFile(fileName, 'utf-8', function(err, data) {
            if(err) {
                return response.sendError(404);
            }
            response.send(null, JSON.parse(data));
        });
	}

    getFile(fileName, localeFileName, response) {
        if(localeFileName === null) {
            fs.readFile(fileName, 'utf-8', function(err, data) {
                if(err) {
                    return response.sendError(404);
                }
                response.send(null, data);
            });
            return;            
        }
        fs.readFile(localeFileName, 'utf-8', function(err, data) {
            if(err) {
                fs.readFile(fileName, 'utf-8', function(err, data) {
                    if(err) {
                        return response.sendError(404);
                    }
                    response.send(null, data);
                });
                return;
            }
            response.send(null, data);
        });
    }

    getController(applicationUUID, locale, response) {
        console.log('applicationdaoimpl.getCotnroller. applicationUUid : ' + applicationUUID);
        console.log('applicationdaoimpl.getCotnroller. locale: ' + locale);
        console.log('applicationdaoimpl.getCotnroller. jsonResponse: ' + response);
        // Defensive programming...check input...
        if(applicationUUID === undefined || applicationUUID === null) {
            if(response) {
                return response.sendError(DAOError.ILLEGAL_ARGUMENT);
            }
            return;
        }
        applicationUUID = applicationUUID.trim();
        if(applicationUUID.length <= 0) {
            if(response) {
                return response.sendError(DAOError.ILLEGAL_ARGUMENT);
            }
            return;
        }
        if(locale === undefined || locale === null) {
            locale = '';
        }
        locale = locale.trim();
        let fileName = this.sourceFolder + applicationUUID + path.sep + 'controllers' + path.sep + 'compiled.js';
        if(locale.length <= 0) {
            this.getFile(fileName, null, response);
        } else {
            let localeFileName = this.sourceFolder + applicationUUID + path.sep + 'controllers' + path.sep + 'compiled_' + locale + '.js';
            this.getFile(fileName, localeFileName, response);
        }
    }

    getImage(applicationUUID, name, locale, response) {
        // Defensive programming...check input...
        if(applicationUUID === undefined || applicationUUID === null) {
            if(response) {
                return response.sendError(DAOError.ILLEGAL_ARGUMENT);
            }
            return;
        }
        applicationUUID = applicationUUID.trim();
        if(applicationUUID.length <= 0) {
            if(response) {
                return response.sendError(DAOError.ILLEGAL_ARGUMENT);
            }
            return;
        }
        if(locale === undefined || locale === null) {
            locale = '';
        }
        locale = locale.trim();
        let fileName = null;
        if(locale.length <= 0) {
            fileName = this.sourceFolder + applicationUUID + path.sep + 'images' + path.sep + name;
        } else {
            fileName = this.sourceFolder + applicationUUID + path.sep + 'images' + path.sep + locale + path.sep + name;
        }
        response.sendFile(fileName);
        // fs.readFile(fileName, 'utf-8', function(err, data) {
        //     if(err) {
        //         return response.sendError(404);
        //     }
        //     response.send(null, data);
        // });
    }

    getStyle(applicationUUID, locale, response) {
        // Defensive programming...check input...
        if(applicationUUID === undefined || applicationUUID === null) {
            if(response) {
                return response.sendError(DAOError.ILLEGAL_ARGUMENT);
            }
            return;
        }
        applicationUUID = applicationUUID.trim();
        if(applicationUUID.length <= 0) {
            if(response) {
                return response.sendError(DAOError.ILLEGAL_ARGUMENT);
            }
            return;
        }
        if(locale === undefined || locale === null) {
            locale = '';
        }
        locale = locale.trim();
        let fileName = this.sourceFolder + applicationUUID + path.sep + 'styles' + path.sep + 'compiled.css';
        if(locale.length <= 0) {
            this.getFile(fileName, null, response);
        } else {
            let localeFileName = this.sourceFolder + applicationUUID + path.sep + 'styles' + path.sep + 'compiled_' + locale + '.css';
            this.getFile(fileName, localeFileName, response);
        }

    }

    getStyleImage(applicationUUID, name, locale, response) {
        // Defensive programming...check input...
        if(applicationUUID === undefined || applicationUUID === null) {
            if(response) {
                return response.sendError(DAOError.ILLEGAL_ARGUMENT);
            }
            return;
        }
        applicationUUID = applicationUUID.trim();
        if(applicationUUID.length <= 0) {
            if(response) {
                return response.sendError(DAOError.ILLEGAL_ARGUMENT);
            }
            return;
        }
        if(locale === undefined || locale === null) {
            locale = '';
        }
        locale = locale.trim();
        let fileName = null;
        if(locale.length <= 0) {
            fileName = this.sourceFolder + applicationUUID + path.sep + 'styles' + path.sep + 'images' + path.sep + name;
        } else {
            fileName = this.sourceFolder + applicationUUID + path.sep + 'styles' + path.sep + 'images' + path.sep + locale + path.sep + name;
        }
        response.sendFile(fileName);
    }
}

module.exports = ApplicationDAOImpl;