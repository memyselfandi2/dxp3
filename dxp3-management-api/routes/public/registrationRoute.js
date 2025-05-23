const path = require('path');
const packageName = 'dxp3-management-api' + path.sep + 'routes' + path.sep + 'public';
const moduleName = 'registrationRoute';
const canonicalName = packageName + path.sep + moduleName;
// Best next thing: logging
const logging = require('dxp3-logging');
const logger = logging.getLogger(canonicalName);
const RouteUtil = require('../RouteUtil');
const SecurityError = require('../../SecurityError');

module.exports = function(webServer, securityClient) {

    webServer.post('/registration/', function(req, res) {
        let emailAddress = RouteUtil.sanitizeStringParameter(req.body.emailaddress);
        if(emailAddress.length <= 0) {
            // BAD REQUEST
            res.status(400).send('');
            return;
        }
        // This email may already have been registered.
        // That is ok though. In either case we create a new registration code and email it to the user.
        // That way he or she can login.
        securityClient.execute('generateCode', 6, function(err, code) {
            securityClient.execute('registration', emailAddress, code, function(err, registration) {
                if(err) {
                    logger.warn('Error \'' + err + '\' while creating a registration for email address \'' + emailAddress + '\'.');
                    if(err === SecurityError.BAD_REQUEST) {
                        res.status(400).send('');
                    } else {
                        res.status(500).send('');
                    }
                    return;
                }
                res.status(200).type('text/plain').send(registration.uuid);
            });
        });
    });
}