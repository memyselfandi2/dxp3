/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-delivery-dao/filesystem
 *
 * NAME
 * PageDAOImpl
 */
const path = require('path');
const packageName = 'dxp3-delivery-dao' + path.sep + 'filesystem';
const moduleName = 'PageDAOImpl';
const canonicalName = packageName + path.sep + moduleName;
/**
 * @module dxp3-delivery-dao/filesystem/PageDAOImpl
 */
const DAOError = require('../DAOError');
const logging = require('dxp3-logging');
const logger = logging.getLogger(canonicalName);
const fs = require('fs');

class PageDAOImpl {

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
        this.sourceFolder = sourceFolder + 'pages' + path.sep;
        // Make sure the source folder exists.
        if(!fs.existsSync(this.sourceFolder)) {
            fs.mkdirSync(this.sourceFolder);
        }
        logger.info('Source folder: ' + this.sourceFolder);
    }

    get(pageUUID, response) {
        if(pageUUID === undefined || pageUUID === null) {
            if(response) {
                return response.sendError(DAOError.ILLEGAL_ARGUMENT);
            }
            return;
        }
        pageUUID = pageUUID.trim();
        if(pageUUID.length <= 0) {
            if(response) {
                return response.sendError(DAOError.ILLEGAL_ARGUMENT);
            }
            return;
        }
        let fileName = this.sourceFolder + pageUUID + path.sep + 'definition.json';
        fs.readFile(fileName, 'utf-8', function(err, data) {
            if(err) {
                return response.sendError(404);
            }
            let definition = null;
            try {
                definition = JSON.parse(data);
            } catch(_exception) {
                return response.sendError(500);
            }
            return response.send(null, definition);
        });
    }

    getController(pageUUID, locale, response) {
        // Defensive programming...check input...
        if(pageUUID === undefined || pageUUID === null) {
            if(response) {
                return response.sendError(DAOError.ILLEGAL_ARGUMENT);
            }
            return;
        }
        pageUUID = pageUUID.trim();
        if(pageUUID.length <= 0) {
            if(response) {
                return response.sendError(DAOError.ILLEGAL_ARGUMENT);
            }
            return;
        }
        if(locale === undefined || locale === null) {
            locale = '';
        }
        locale = locale.trim();
        let fileName = this.sourceFolder + pageUUID + path.sep + 'controllers' + path.sep + 'compiled.js';
        if(locale.length <= 0) {
            this.getFile(fileName, null, response);
        } else {
            let localeFileName = this.sourceFolder + pageUUID + path.sep + 'controllers' + path.sep + 'compiled_' + locale + '.js';
            this.getFile(fileName, localeFileName, response);
        }
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

    getImage(pageUUID, name, locale, response) {
        // Defensive programming...check input...
        if(pageUUID === undefined || pageUUID === null) {
            if(response) {
                return response.sendError(DAOError.ILLEGAL_ARGUMENT);
            }
            return;
        }
        pageUUID = pageUUID.trim();
        if(pageUUID.length <= 0) {
            if(response) {
                return response.sendError(DAOError.ILLEGAL_ARGUMENT);
            }
            return;
        }
        if(locale === undefined || locale === null) {
            locale = '';
        }
        locale = locale.trim();
        let fileName = this.sourceFolder + pageUUID + path.sep + 'images' + path.sep + name;
        response.sendFile(fileName);
        // let readStream = fs.createReadStream(fileName);
        // readStream.pipe(writeStream);
    }

	getLayout(pageUUID, locale, response) {
        // Defensive programming...check input...
        if(pageUUID === undefined || pageUUID === null) {
            if(response) {
                return response.sendError(DAOError.ILLEGAL_ARGUMENT);
            }
            return;
        }
        pageUUID = pageUUID.trim();
        if(pageUUID.length <= 0) {
            if(response) {
                return response.sendError(DAOError.ILLEGAL_ARGUMENT);
            }
            return;
        }
        if(locale === undefined || locale === null) {
            locale = '';
        }
        locale = locale.trim();
        let fileName = this.sourceFolder + pageUUID + path.sep + 'layouts' + path.sep + 'compiled.html';
        if(locale.length <= 0) {
            this.getFile(fileName, null, response);
        } else {
            let localeFileName = this.sourceFolder + pageUUID + path.sep + 'layouts' + path.sep + 'compiled_' + locale + '.html';
            this.getFile(fileName, localeFileName, response);
        }
	}

    getLocale(pageUUID, locale, response) {
        // Defensive programming...check input...
        if(pageUUID === undefined || pageUUID === null) {
            if(response) {
                return response.sendError(DAOError.ILLEGAL_ARGUMENT);
            }
            return;
        }
        pageUUID = pageUUID.trim();
        if(pageUUID.length <= 0) {
            if(response) {
                return response.sendError(DAOError.ILLEGAL_ARGUMENT);
            }
            return;
        }
        if(locale === undefined || locale === null) {
            locale = '';
        }
        locale = locale.trim();
        let fileName = this.sourceFolder + pageUUID + path.sep + 'locales' + path.sep + locale + '.json';
        this.getFile(fileName, null, response);
    }

    getStyle(pageUUID, locale, response) {
        // Defensive programming...check input...
        if(pageUUID === undefined || pageUUID === null) {
            if(response) {
                return response.sendError(DAOError.ILLEGAL_ARGUMENT);
            }
            return;
        }
        pageUUID = pageUUID.trim();
        if(pageUUID.length <= 0) {
            if(response) {
                return response.sendError(DAOError.ILLEGAL_ARGUMENT);
            }
            return;
        }
        if(locale === undefined || locale === null) {
            locale = '';
        }
        locale = locale.trim();
        let fileName = this.sourceFolder + pageUUID + path.sep + 'styles' + path.sep + 'compiled.css';
        if(locale.length <= 0) {
            this.getFile(fileName, null, response);
        } else {
            let localeFileName = this.sourceFolder + pageUUID + path.sep + 'styles' + path.sep + 'compiled_' + locale + '.css';
            this.getFile(fileName, localeFileName, response);
        }
    }

    getStyleImage(pageUUID, name, locale, response) {
        // Defensive programming...check input...
        if(pageUUID === undefined || pageUUID === null) {
            if(response) {
                return response.sendError(DAOError.ILLEGAL_ARGUMENT);
            }
            return;
        }
        pageUUID = pageUUID.trim();
        if(pageUUID.length <= 0) {
            if(response) {
                return response.sendError(DAOError.ILLEGAL_ARGUMENT);
            }
            return;
        }
        if(locale === undefined || locale === null) {
            locale = '';
        }
        locale = locale.trim();
        let fileName = this.sourceFolder + pageUUID + path.sep + 'styles' + path.sep + 'images' + path.sep + name;
        if(locale.length <= 0) {
            this.getFile(fileName, null, response);
        } else {
            let localeFileName = this.sourceFolder + pageUUID + path.sep + 'styles' + path.sep + 'images' + path.sep + locale + path.sep + name;
            this.getFile(fileName, localeFileName, response);
        }
    }
}

module.exports = PageDAOImpl;