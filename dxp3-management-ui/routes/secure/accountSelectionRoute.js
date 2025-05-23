const path = require('path');
const packageName = 'dxp3-management-ui' + path.sep + 'routes' + path.sep + 'secure';
const moduleName = 'accountSelectionRoute';
const canonicalName = packageName + path.sep + moduleName;
// Best next thing: logging
const logging = require('dxp3-logging');
const logger = logging.getLogger(canonicalName);
// Other libraries
const RouteUtil = require('../RouteUtil');

module.exports = function(webServer, securityClient) {
    
    /**************************************************
    * OVERVIEW
    *
    * method                : POST
    * url                   : /accountselection/
    *
    * BODY PARAMETERS
    *
    * NAME                    REQUIRED    TYPE        DESCRIPTION
    * uuid	     			: required 	: string	: The uuid of the account to select.
    *
    * RETURN
    *
    * STATUS                  NAME                    DESCRIPTION
    * 400                   : BAD REQUEST           : When missing required parameters.
    * 200                   : OK                    : Json representation of a security token.
    *
    * DESCRIPTION
    *
    * Login. This is a carbon copy of /sigin/ and /authenticate/.
    * This is a POST as we consider this the creation of a security token.
    *
    **************************************************/
	webServer.post('/accountselection/', function(req, res) {
        // Defensive programming...check input parameters...
        let accountUUID = RouteUtil.sanitizeStringParameter(req.body.uuid);
        if(accountUUID.length <= 0) {
            res.status(400).send('');
            return;
        }
        // Get the logged in user.
        // If they are not found on the request somehow we were not logged in.
        // We should NOT have reached this far in!!! 
        // Log this occurrence and respond with a not authorized status.
        let authentication = req.authentication;
        if(authentication === undefined || authentication === null) {
            logger.warn('Reached account selection route without authentication.');
            // UNAUTHORIZED = 401
            res.status(401).send('');
            return;    
        }
        let tokenUUID = req.authentication.tokenUUID;
        if(tokenUUID === undefined || tokenUUID === null) {
            logger.warn('Reached account selection route without a token.');
            // UNAUTHORIZED = 401
            res.status(401).send('');
            return;
        }
        let userUUID = req.authentication.userUUID;
        if(userUUID === undefined || userUUID === null) {
            logger.warn('Reached account selection route without an authenticated user.');
            // UNAUTHORIZED = 401
            res.status(401).send('');
            return;    
        }
        securityClient.send('accountSelection', tokenUUID, userUUID, accountUUID, function(err, token) {
            if(err) {
                logger.warn('Error during account selection tokenUUID: \'' + tokenUUID + '\', userUUID: \'' + userUUID + '\', accountUUID \'' + accountUUID + '\'. Error code: \'' + err + '\'.');
                // UNAUTHORIZED = 401
                res.status(401).send('');
                return;
            }
            if((token === undefined) || (token === null)) {
                // No error, but no token either. This is weird. Lets log its occurrence.
                logger.warn('No error, but no token either after account selection with tokenUUID: \'' + tokenUUID + '\', userUUID: \'' + userUUID + '\', accountUUID \'' + accountUUID + '\'.');
                // UNAUTHORIZED = 401
                res.status(401).send('');
                return;
            }
            res.cookie('account', accountUUID);
            res.json(token);
        });
    });
}