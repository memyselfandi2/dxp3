const path = require('path');
const packageName = 'dxp3-management-api' + path.sep + 'routes';
const moduleName = 'index';
const canonicalName = packageName + path.sep + moduleName;
// Best next thing: logging
const logging = require('dxp3-logging');
const logger = logging.getLogger(canonicalName);
const fileSystem = require('fs');

exports.init = function(webServer, securityClient) {
    /**************************************************
    * Load our public routes first before we configure authentication on all the following routes.
    * This will allow users to register and activate new accounts.
    * Note that we read every file in the public directory synchronously.
    * This is o.k. as we are only called at startup.
    **************************************************/

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
        require('./public/' + fileNameWithoutExtension)(webServer, securityClient);
    });

    webServer.all('*', function(req, res, route) {
        // Defensive programming...check input parameters...
        let tokenUUID = req.cookies['token'];
        if(tokenUUID === undefined || tokenUUID === null) {
            tokenUUID = req.body.token;
            if(tokenUUID === undefined || tokenUUID === null) {
                tokenUUID = req.query.token;
                if(tokenUUID === undefined || tokenUUID === null) {
                    logger.info('Can not find tokenUUID in the request. Return 401 Unauthorized.');
                    // UNAUTHORIZED = 401
                    res.status(401).send('');
                    return;
                }
            }
        }
        tokenUUID = tokenUUID.trim();
        if(tokenUUID.length <= 0) {
            logger.info('The tokenUUID is empty in the request. Return 401 Unauthorized.');
            // UNAUTHORIZED = 401
            res.status(401).send('');
            return;
        }
        let userUUID = req.cookies['user'];
        if(userUUID === undefined || userUUID === null) {
            userUUID = req.body.user;
            if(userUUID === undefined || userUUID === null) {
                userUUID = req.query.user;
                if(userUUID === undefined || userUUID === null) {
                    logger.info('Can not find userUUID in the request. Return 401 Unauthorized.');
                    res.status(401).send('');
                    return;
                }
            }
        }
        userUUID = userUUID.trim();
        if(userUUID.length <= 0) {
            logger.info('The userUUID is empty in the request. Return 401 Unauthorized.');
            // UNAUTHORIZED = 401
            res.status(401).send('');
            return;
        }
        securityClient.send('isAuthenticated', tokenUUID, userUUID, function(err, token) {
            if(err) {
                logger.info('securityClient.isAuthenticated(...) returned error \'' + err + '\'. Return 401 Unauthorized.');
                // UNAUTHORIZED = 401
                res.status(401).send('');
                return;
            }
            if(token === undefined || token === null) {
                logger.info('securityClient.isAuthenticated(...) returned no token. Return 401 Unauthorized.');
                // UNAUTHORIZED = 401
                res.status(401).send('');
                return;
            }
            // Nothing requiring authentication is allowed to be cached.
            res.setHeader('Surrogate-Control', 'no-store');
            res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Expires', '0');
            req.authentication = {};
            req.authentication.tokenUUID = token.uuid;
            req.authentication.userUUID = token.userUUID;
            route.next();
        });
    });

    /**************************************************
    * Load our secure routes next. These routes require an user to be logged in.
    * They do NOT require an account to be selected. Routes, which require an user to be logged in
    * to a specific account are both secure and restricted. Those routes we will load next.
    * Note we read every file in the secure directory synchronously,
    * which is o.k. as we are only called at startup.
    **************************************************/
    fileSystem.readdirSync(__dirname + path.sep + 'secure' + path.sep).forEach(function(fileNameWithExtension) {
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
        logger.info('Adding secure route \'' + __dirname + path.sep + fileNameWithoutExtension + '\'.');
        require('./secure/' + fileNameWithoutExtension)(webServer, securityClient);
    });

    webServer.all('*', function(req, res, route) {
        let tokenUUID = req.authentication.tokenUUID;
        let userUUID = req.authentication.userUUID;
        let accountUUID = req.cookies['account'];
        if(accountUUID === undefined || accountUUID === null) {
            accountUUID = req.body.account;
            if(accountUUID === undefined || accountUUID === null) {
                accountUUID = req.query.account;
                if(accountUUID === undefined || accountUUID === null) {
                    logger.info('Can not find accountUUID in the request. Return 401 Unauthorized.');
                    // UNAUTHORIZED = 401
                    res.status(401).send('');
                    return;
                }
            }
        }
        accountUUID = accountUUID.trim();
        if(accountUUID.length <= 0) {
            logger.info('The accountUUID is empty in the request. Return 401 Unauthorized.');
            // UNAUTHORIZED = 401
            res.status(401).send('');
            return;
        }
        securityClient.send('isAuthorized', tokenUUID, userUUID, accountUUID, function(err, access) {
            if(err) {
                logger.info('securityClient.isAuthorized(...) returned error \'' + err + '\'. Return 401 Unauthorized.');
                // UNAUTHORIZED = 401
                res.status(401).send('');
                return;
            }
            if(access === undefined || access === null) {
                logger.info('securityClient.isAuthenticated(...) returned no access. Return 401 Unauthorized.');
                // UNAUTHORIZED = 401
                res.status(401).send('');
                return;
            }
            req.authentication.accountUUID = accountUUID;
            route.next();
        });
    });

    fileSystem.readdirSync(__dirname + path.sep + 'secure' + path.sep + 'restricted').forEach(function(fileNameWithExtension) {
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
        logger.info('Adding secure and restricted route \'' + __dirname + path.sep + fileNameWithoutExtension + '\'.');
        require('./secure/restricted/' + fileNameWithoutExtension)(webServer, securityClient);
    });
}