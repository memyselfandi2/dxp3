const path = require('path');
const packageName = 'dxp3-management-ui' + path.sep + 'routes' + path.sep + 'public';
const moduleName = 'rootRoute';
const canonicalName = packageName + path.sep + moduleName;
// Best next thing: logging
const logging = require('dxp3-logging');
const logger = logging.getLogger(canonicalName);
const fileSystem = require('fs');
const RouteUtil = require('../RouteUtil');
// This route exposes the following url's:
// 1) / - Load our index / home page
// 2) /web/* - Load any asset located in our ../web/ folder. Mostly html and javascript.
// 3) /libraries/* - Load any library located in our ../libraries/ folder. Mostly javascript and css.
module.exports = function(webServer) {

	webServer.get('/', function(req, res) {
		res.sendFile('index.html', {root: __dirname + path.sep + '..' + path.sep + '..' + path.sep + 'web' + path.sep},
            function(err) {
    			if(err) {
                    // This is a proper error. Our index.html should always load. This is a major problem.
                    logger.error('/ route. Something went wrong reading index.html.');
                    logger.error(err);
                    // FILE NOT FOUND = 404
    				res.status(404).send('');
    			}
            }
		);
	});

	webServer.get('/web/*', function(req, res) {
		let webFileName = RouteUtil.sanitizeStringParameter(req.params[0]);
        if(webFileName.length <= 0) {
            logger.warn('/web/* route. Someone is calling /web/ with an empty file path and name.');
            // FILE NOT FOUND = 404
            res.status(404).send('');
            return;
        }
 		res.sendFile(webFileName, {root: __dirname + path.sep + '..' + path.sep + '..' + path.sep + 'web' + path.sep},
            function(err) {
    			if(err) {
                    logger.warn('/web/* route. Something went wrong reading \'' + webFileName + '\'.');
                    // FILE NOT FOUND = 404
    				res.status(404).send('');
    			}
            }
		);
	});

	webServer.get('/libraries/*', function(req, res) {
        let libraryFileName = RouteUtil.sanitizeStringParameter(req.params[0]);
        if(libraryFileName.length <= 0) {
            logger.warn('/libraries/* route. Someone is calling /libraries/ with an empty file path and name.');
            // FILE NOT FOUND = 404
            res.status(404).send('');
            return;
        }
		res.sendFile(libraryFileName, {root: __dirname + path.sep + '..' + path.sep + '..' + path.sep + 'libraries' + path.sep},
            function(err) {
    			if(err) {
                    logger.warn('/libraries/* route. Something went wrong reading \'' + libraryFileName + '\'.');
                    // FILE NOT FOUND = 404
    				res.status(404).send('');
                    return;
    			}
            }
		);
	});
}