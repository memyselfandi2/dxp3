const path = require('path');
const packageName = 'dxp3-management-ui' + path.sep + 'routes' + path.sep + 'secure';
const moduleName = 'profileRoute';
const canonicalName = packageName + path.sep + moduleName;
// Best next thing: logging
const logging = require('dxp3-logging');
const logger = logging.getLogger(canonicalName);

module.exports = function(webServer) {

    /**************************************************
    * OVERVIEW
    *
    * method                : GET
    * url                   : /profile/
    *
    * PARAMETERS
    *
    * NAME                    REQUIRED    TYPE        DESCRIPTION
    * file path and name    : required  : string    : The file path and name of the file to retrieve.
    *
    * DESCRIPTION
    *
    * Get any file located in /routes/../web/
    *
    **************************************************/
    webServer.get('/profile/', function(req, res) {
        res.sendFile('profile.html', {root: __dirname + path.sep + '..' + path.sep + '..' + path.sep + 'web' + path.sep}, function(err) {
            if(err) {
                logger.error(err);
                res.status(404).send('');
            }
        });
    });
}