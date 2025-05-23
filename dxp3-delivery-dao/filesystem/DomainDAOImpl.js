/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-delivery-dao/filesystem
 *
 * NAME
 * DomainDAOImpl
 */
const path = require('path');
const packageName = 'dxp3-delivery-dao' + path.sep + 'filesystem';
const moduleName = 'DomainDAOImpl';
const canonicalName = packageName + path.sep + moduleName;
/**
 * @module dxp3-delivery-dao/filesystem/DomainDAOImpl
 */
const DAOError = require('../DAOError');
const logging = require('dxp3-logging');
const logger = logging.getLogger(canonicalName);
const fs = require('fs');

class DomainDAOImpl {
	constructor(_options) {
		if(_options === undefined || _options === null) {
			throw DAOError.ILLEGAL_ARGUMENT;
		}
        let sourceFolder = _options.sourceFolder;
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
        this.sourceFolder = sourceFolder + 'domains' + path.sep;
        // Make sure the source folder exists.
        if(!fs.existsSync(this.sourceFolder)) {
            fs.mkdirSync(this.sourceFolder);
        }
        logger.info('Source folder: ' + this.sourceFolder);
	}

	get(domain, response) {
        let fileName = this.sourceFolder + domain + path.sep + 'definition.json';
        fs.readFile(fileName, 'utf-8', function(err, data) {
            if(err) {
                return response.sendError(404);
            }
            response.send(null, JSON.parse(data));
        });
	}
}

module.exports = DomainDAOImpl;