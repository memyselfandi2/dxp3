const path = require('path');
const packageName = 'dxp3-delivery-api' + path.sep + 'routes' + path.sep + 'public';
const moduleName = 'pageRoute';
const canonicalName = packageName + path.sep + moduleName;
// Best next thing: logging
const logging = require('dxp3-logging');
const logger = logging.getLogger(canonicalName);
const configuration = require('dxp3-configuration');
const ApplicationKeys = require('../../ApplicationKeys');
const RouteUtil = require('../RouteUtil');

module.exports = function(webServer) {
    let pageDAO = configuration.Manager.get(ApplicationKeys.PAGE_DAO);

    webServer.get('/api/page/:pageUUID/', function(req, res) {
        let pageUUID = RouteUtil.sanitizeStringParameter(req.params.pageUUID);
        if(pageUUID.length <= 0) {
            // BAD REQUEST = 400
            return res.status(400).send('');
        }
        pageDAO.execute('get', pageUUID, function(err, definition) {
            if((err != undefined) && (err != null)) {
                return RouteUtil.sendDAOError(res, err);
            }
            res.send(definition);
        });
    });

    webServer.get('/api/page/:pageUUID/controller/', function(req, res) {
        let pageUUID = RouteUtil.sanitizeStringParameter(req.params.pageUUID);
        if(pageUUID.length <= 0) {
            // BAD REQUEST = 400
            return res.status(400).send('');
        }
        let locale = null;
        pageDAO.execute('getController', pageUUID, locale, function(err, controller) {
            if((err != undefined) && (err != null)) {
                return RouteUtil.sendDAOError(res, err);
            }
            res.type('application/javascript; charset=utf-8').send(controller);
        });
    });

    webServer.get('/api/page/:pageUUID/image/:imageName', function(req, res) {
        let pageUUID = RouteUtil.sanitizeStringParameter(req.params.pageUUID);
        if(pageUUID.length <= 0) {
            // BAD REQUEST = 400
            return res.status(400).send('');
        }
        let imageName = RouteUtil.sanitizeStringParameter(req.params.imageName);
        if(imageName.length <= 0) {
            // BAD REQUEST = 400
            return res.status(400).send('');
        }
        let locale = null;
        pageDAO.execute('getImage', pageUUID, imageName, locale, function(err, image) {
            if((err != undefined) && (err != null)) {
                return RouteUtil.sendDAOError(res, err);
            }
            res.send(image);
        });
    });


    webServer.get('/api/page/:pageUUID/layout/', function(req, res) {
        let pageUUID = RouteUtil.sanitizeStringParameter(req.params.pageUUID);
        if(pageUUID.length <= 0) {
            // BAD REQUEST = 400
            return res.status(400).send('');
        }
        let locale = null;
        pageDAO.execute('getLayout', pageUUID, locale, function(err, layout) {
            if((err != undefined) && (err != null)) {
                return RouteUtil.sendDAOError(res, err);
            }
            res.type('text/html; charset=utf-8').send(layout);
        });
    });

    webServer.get('/api/page/:pageUUID/style/', function(req, res) {
        let pageUUID = RouteUtil.sanitizeStringParameter(req.params.pageUUID);
        if(pageUUID.length <= 0) {
            // BAD REQUEST = 400
            return res.status(400).send('');
        }
        let locale = null;
        pageDAO.execute('getStyle', pageUUID, locale, function(err, style) {
            if((err != undefined) && (err != null)) {
                return RouteUtil.sendDAOError(res, err);
            }
            res.type('text/css; charset=utf-8').send(style);
        });
    });
}