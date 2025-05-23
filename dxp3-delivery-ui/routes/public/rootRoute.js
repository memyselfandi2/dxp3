const path = require('path');
const packageName = 'dxp3-delivery-ui' + path.sep + 'routes' + path.sep + 'public';
const moduleName = 'rootRoute';
const canonicalName = packageName + path.sep + moduleName;
// Best next thing: logging
const logging = require('dxp3-logging');
const logger = logging.getLogger(canonicalName);
const BootManager = require('../../BootManager');
const RouteUtil = require('../RouteUtil');
// This route exposes the following url's:
// 1) / - Load our index / home page
// 2) /web/* - Load any asset located in our ../web/ folder. Mostly html and javascript.
// 3) /libraries/* - Load any library located in our ../libraries/ folder. Mostly javascript and css.
module.exports = function(webServer) {

	webServer.get('/', function(req, res) {
		// Typically there are two ways to run dxp3 delivery:
		// - one domain
		// - multiple domains
		// In the case of one domain the domain in the request will be an empty string.
		let domain = req.dxp.domain;
		// There are some query parameters which allow a visitor to override the defaults at boot time.
		// One of them is the locale.
		let locale = req.query.locale;
		if(locale === undefined) {
			locale = null;
		}
		if(locale != null) {
			locale = locale.trim().toLowerCase();
			if((locale.length <= 0) || (locale === 'undefined') || (locale === 'null')) {
				locale = null;
			}
		}
	console.log('BOOTMANAGER.BOOT: ' + domain + ', ' + locale);
		BootManager.boot(req, res, domain, locale);
		return;
	});
	webServer.get('/web/*', function(req, res) {
		let webFileName = RouteUtil.sanitizeStringParameter(req.params[0]);
        if(webFileName.length <= 0) {
        	webFileName = 'boot.html';
        }
        console.log('web file name: ' + webFileName);
 		res.sendFile(webFileName, {root: __dirname + path.sep + '..' + path.sep + '..' + path.sep + 'web' + path.sep},
            function(err) {
    			if(err) {
                    logger.warn('/web/* route. Something went wrong reading \'' + webFileName + '\': ' + err);
                    // FILE NOT FOUND = 404
    				res.status(404).send('');
    			}
            }
		);
	});
}