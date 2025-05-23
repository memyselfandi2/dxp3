/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-delivery-dao/filesystem
 *
 * NAME
 * FeatureDAOImpl
 */
const path = require('path');
const packageName = 'dxp3-delivery-dao' + path.sep + 'filesystem';
const moduleName = 'FeatureDAOImpl';
const canonicalName = packageName + path.sep + moduleName;
/**
 * @module dxp3-delivery-dao/filesystem/FeatureDAOImpl
 */
const DAOError = require('../DAOError');
const logging = require('dxp3-logging');
const logger = logging.getLogger(canonicalName);
const fs = require('fs');

class FeatureDAOImpl {

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
        this.sourceFolder = sourceFolder + 'features' + path.sep;
        // Make sure the source folder exists.
        if(!fs.existsSync(this.sourceFolder)) {
            fs.mkdirSync(this.sourceFolder);
        }
        logger.info('Source folder: ' + this.sourceFolder);
    }

	get(featureUUID, response) {
		response.sendError(501);
	}

	getController(featureUUID, instanceID, locale, response) {
		response.sendError(501);
	}

	getImage(featureUUID, name, locale, response) {
		response.sendError(501);
	}

	getLayout(featureUUID, instanceID, locale, response) {
		response.sendError(501);
	}

	getStyle(featureUUID, instanceID, locale, response) {
		response.sendError(501);
	}

	getStyleImage(featureUUID, name, locale, response) {
		response.sendError(501);
	}
}

module.exports = FeatureDAOImpl;