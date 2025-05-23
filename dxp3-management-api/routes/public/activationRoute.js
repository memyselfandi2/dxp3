const path = require('path');
const packageName = 'dxp3-management-api' + path.sep + 'routes' + path.sep + 'public';
const moduleName = 'activationRoute';
const canonicalName = packageName + path.sep + moduleName;
// Best next thing: logging
const logging = require('dxp3-logging');
const logger = logging.getLogger(canonicalName);
const RouteUtil = require('../RouteUtil');
const SecurityError = require('../../SecurityError');

module.exports = function(webServer, securityClient) {

    webServer.post('/activation/', function(req, res) {
        let uuid = RouteUtil.sanitizeStringParameter(req.body.uuid);
        if(uuid.length <= 0) {
            // BAD REQUEST
            res.status(400).send('');
            return;
        }
        let code = RouteUtil.sanitizeStringParameter(req.body.code);
        if(code.length <= 0) {
            // BAD REQUEST
            res.status(400).send('');
            return;
        }
        // When an user activates their registration they are automagically signed in.
        // Therefor the security system returns a security token on activation.
        securityClient.send('activation', uuid, code, function(err, token) {
            if((err != undefined) && (err != null)) {
                logger.warn('Error \'' + err + '\' while activating the registration with UUID \'' + uuid + '\'.');
                if(SecurityError.BAD_REQUEST === err) {
                    res.status(401).send('');
                } else if(SecurityError.FILE_NOT_FOUND === err) {
                    res.status(401).send('');
                } else if(SecurityError.NOT_IMPLEMENTED === err) {
                    res.status(401).send('');
                } else if(SecurityError.UNAUTHORIZED === err) {
                    res.status(401).send('');
                } else {
                    res.status(500).send('');
                }
                return;
            }
            if(token === undefined || token === null) {
                // No error, but no token either...
                // This is very strange...
                logger.warn('Unable to retrieve a token while activating the registration with UUID \'' + uuid + '\'.');
                res.status(401).send('');
                return;
            }
            res.cookie('token', token.uuid);
            res.cookie('user', token.userUUID);
            let sanitizedToken = {};
            sanitizedToken.uuid = token.uuid;
            sanitizedToken.userUUID = token.userUUID;
            res.send(sanitizedToken);
        });
    });
}