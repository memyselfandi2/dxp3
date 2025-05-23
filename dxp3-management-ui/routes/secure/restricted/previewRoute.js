/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-management-ui/routes/secure/restricted
 *
 * NAME
 * previewRoute
 */
const path = require('path');
const packageName = 'dxp3-management-ui' + path.sep + 'routes' + path.sep + 'secure' + path.sep + 'restricted';
const moduleName = 'previewRoute';
const canonicalName = packageName + path.sep + moduleName;
// Best next thing: logging
const logging = require('dxp3-logging');
const logger = logging.getLogger(canonicalName);
const RouteUtil = require('../../RouteUtil');
const Preview = require('../../../Preview');

module.exports = function(webServer) {
    /**************************************************
     * READ
    **************************************************/
    webServer.get('/preview/:applicationUUID/feature/:featureUUID', function(req, res) {
        // First make sure we are authenticated
        RouteUtil.isAuthenticated(req, function(err, accountUUID, loggedInUserUUID) {
            if((err != undefined) && (err != null)) {
                logger.warn('Reached preview route without being authenticated.');
                // UNAUTHORIZED = 401
                return res.status(401).send('');
            }
            let applicationUUID = RouteUtil.sanitizeStringParameter(req.params.applicationUUID);
            if(applicationUUID.length <= 0) {
                // BAD REQUEST = 400
                return res.status(400).send('');
            }
            let featureUUID = RouteUtil.sanitizeStringParameter(req.params.featureUUID);
            if(featureUUID.length <= 0) {
                // BAD REQUEST = 400
                return res.status(400).send('');
            }
            let debug = RouteUtil.sanitizeBooleanParameter(req.query.debug);
            Preview.getFeaturePreview(accountUUID, loggedInUserUUID, applicationUUID, featureUUID, function(err, html) {
                if(err != undefined && err != null) {
                    return res.status(500).send('');
                }
                res.type('text/html').send(html);
            });
        });
    });
    webServer.get('/preview/:applicationUUID/page/:pageUUID', function(req, res) {
        console.log('get preview page');
        // First make sure we are authenticated
        RouteUtil.isAuthenticated(req, function(err, accountUUID, loggedInUserUUID) {
            if((err != undefined) && (err != null)) {
                logger.warn('Reached preview route without being authenticated.');
                // UNAUTHORIZED = 401
                return res.status(401).send('');
            }
            let applicationUUID = RouteUtil.sanitizeStringParameter(req.params.applicationUUID);
            if(applicationUUID.length <= 0) {
                // BAD REQUEST = 400
                return res.status(400).send('');
            }
            let pageUUID = RouteUtil.sanitizeStringParameter(req.params.pageUUID);
            if(pageUUID.length <= 0) {
                // BAD REQUEST = 400
                return res.status(400).send('');
            }
            let authentication = req.authentication;
            if(authentication === undefined || authentication === null) {
                return res.status(401).send('');
            }
            let authenticationToken = authentication.tokenUUID;
            let debug = RouteUtil.sanitizeBooleanParameter(req.query.debug);
            Preview.getPagePreview(accountUUID, loggedInUserUUID, applicationUUID, pageUUID, authenticationToken, function(err, html) {
                if(err != undefined && err != null) {
                    return res.status(500).send('');
                }
                console.log('sending result preview back');
                res.type('text/html').send(html);
            });
        });
    });
}