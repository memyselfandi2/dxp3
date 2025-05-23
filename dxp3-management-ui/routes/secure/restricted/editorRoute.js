const path = require('path');
const packageName = 'dxp3-management-ui' + path.sep + 'routes' + path.sep + 'secure' + path.sep + 'restricted';
const moduleName = 'editorRoute';
const canonicalName = packageName + path.sep + moduleName;
// Best next thing: logging
const logging = require('dxp3-logging');
const logger = logging.getLogger(canonicalName);
const fileSystem = require('fs');

module.exports = function(webServer) {

    webServer.get('/editor/', function(req, res) {
        res.sendFile('editor.html', {root: __dirname + path.sep + '..' + path.sep + '..' + path.sep + '..' + path.sep + 'web' + path.sep}, function(err) {
            if(err) {
                logger.error(err);
                res.status(404).send('');
            }
        });
    });
}