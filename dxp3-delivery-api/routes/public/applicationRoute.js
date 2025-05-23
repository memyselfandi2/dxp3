const path = require('path');
const packageName = 'dxp3-delivery-api' + path.sep + 'routes' + path.sep + 'public';
const moduleName = 'applicationRoute';
const canonicalName = packageName + path.sep + moduleName;
// Best next thing: logging
const logging = require('dxp3-logging');
const logger = logging.getLogger(canonicalName);
const configuration = require('dxp3-configuration');
const ApplicationKeys = require('../../ApplicationKeys');
const RouteUtil = require('../RouteUtil');

module.exports = function(webServer) {
    let applicationDAO = configuration.Manager.get(ApplicationKeys.APPLICATION_DAO);

    webServer.get('/api/application/:applicationUUID/controller/', function(req, res) {
        let applicationUUID = RouteUtil.sanitizeStringParameter(req.params.applicationUUID);
        if(applicationUUID.length <= 0) {
            // BAD REQUEST = 400
            return res.status(400).send('');
        }
        let locale = null;
        applicationDAO.execute('getController', applicationUUID, locale, function(err, controller) {
            if((err != undefined) && (err != null)) {
                return RouteUtil.sendDAOError(res, err);
            }
            // We know this is javascript code.
            res.type('application/javascript; charset=utf-8').send(controller);
        });
    });

    webServer.get('/api/application/:applicationUUID/style/', function(req, res) {
        let applicationUUID = RouteUtil.sanitizeStringParameter(req.params.applicationUUID);
        if(applicationUUID.length <= 0) {
            // BAD REQUEST = 400
            return res.status(400).send('');
        }
        let locale = null;
        applicationDAO.execute('getStyle', applicationUUID, locale, function(err, style) {
            if((err != undefined) && (err != null)) {
                return RouteUtil.sendDAOError(res, err);
            }
            // We know this is a stylesheet.
            res.type('text/css; charset=utf-8').send(style);
        });
    });

    webServer.get('/api/application/:applicationUUID/image/:imageName', function(req, res) {
        let applicationUUID = RouteUtil.sanitizeStringParameter(req.params.applicationUUID);
        if(applicationUUID.length <= 0) {
            // BAD REQUEST = 400
            return res.status(400).send('');
        }
        let imageName = RouteUtil.sanitizeStringParameter(req.params.imageName);
        if(imageName.length <= 0) {
            // BAD REQUEST = 400
            return res.status(400).send('');
        }
        let locale = null;
        applicationDAO.execute('getImage', applicationUUID, imageName, locale, function(err, imageStream) {
            if((err != undefined) && (err != null)) {
                return RouteUtil.sendDAOError(res, err);
            }
            // We need to retrieve some additional info before we can send on the binary stream.
            // What type of image is this?
            imageStream.readFileHeader().then(
                (imageInformation) => {
                    if(imageInformation.error) {
                        return res.status(404).send('');
                    }
                    imageStream.pipe(res.response).then(
                        (numberOfBytesWritten) => {
                            res.end();
                        },
                        (pipeError) => {
                            return res.status(500).send('');
                        }
                    );
                },
                (readFileHeaderError) => {
                    return res.status(500).send('');
                }
            );
        });
    });

    webServer.get('/api/application/:applicationUUID/style/image/:imageName', function(req, res) {
        let applicationUUID = RouteUtil.sanitizeStringParameter(req.params.applicationUUID);
        if(applicationUUID.length <= 0) {
            // BAD REQUEST = 400
            return res.status(400).send('');
        }
        let imageName = RouteUtil.sanitizeStringParameter(req.params.imageName);
        if(imageName.length <= 0) {
            // BAD REQUEST = 400
            return res.status(400).send('');
        }
        let locale = null;
        applicationDAO.execute('getStyleImage', applicationUUID, imageName, locale, function(err, imageStream) {
            if((err != undefined) && (err != null)) {
                return RouteUtil.sendDAOError(res, err);
            }
            // We need to retrieve some additional info before we can send on the binary stream.
            // What type of image is this?
            imageStream.readFileHeader().then(
                (imageInformation) => {
                    if(imageInformation.error) {
                        return res.status(404).send('');
                    }
                    imageStream.pipe(res.response).then(
                        (numberOfBytesWritten) => {
                            res.end();
                        },
                        (pipeError) => {
                            return res.status(500).send('');
                        }
                    );
                },
                (readFileHeaderError) => {
                    return res.status(500).send('');
                }
            );
        });
    });
}