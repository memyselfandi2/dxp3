const path = require('path');
const packageName = 'dxp3-delivery-api' + path.sep + 'routes';
const moduleName = 'index';
const canonicalName = packageName + path.sep + moduleName;
// Best next thing: logging
const logging = require('dxp3-logging');
const logger = logging.getLogger(canonicalName);
const fileSystem = require('fs');

exports.init = function(webServer) {

    fileSystem.readdirSync(__dirname + path.sep + 'public' + path.sep).forEach(function(fileNameWithExtension) {
        let lastIndexOfPeriod = fileNameWithExtension.lastIndexOf('.');
        // Ignore files without an extension
        if(lastIndexOfPeriod <= 0) {
            return;
        }
        let extension = fileNameWithExtension.substr(lastIndexOfPeriod + 1);
        // Ignore non javascript files
        if(extension.toLowerCase() != 'js') {
            return;
        }
        let fileNameWithoutExtension = fileNameWithExtension.substr(0, lastIndexOfPeriod);
        logger.info('Adding public route \'' + __dirname + path.sep + fileNameWithoutExtension + '\'.');
        require('./public/' + fileNameWithoutExtension)(webServer);
    });
}