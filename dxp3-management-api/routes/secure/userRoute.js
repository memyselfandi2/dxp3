const path = require('path');
const packageName = 'dxp3-management-api' + path.sep + 'routes' + path.sep + 'secure';
const moduleName = 'userRoute';
const canonicalName = packageName + path.sep + moduleName;
const RouteUtil = require('../RouteUtil');
const configuration = require('dxp3-configuration');
const ApplicationKeys = require('../../ApplicationKeys');
const logging = require('dxp3-logging');
const logger = logging.getLogger(canonicalName);

module.exports = function(webServer, securityClient) {
    webServer.get('/user/:uuid', function(req, res) {
        let uuid = RouteUtil.sanitizeStringParameter(req.params.uuid);
        if(uuid.length <= 0) {
            // BAD REQUEST = 400
            res.status(400).send('');
            return;
        }
        // Get the logged in user.
        // If they are not found on the request somehow we were not logged in.
        // We should NOT have reached this far in!!! 
        // Log this occurrence and respond with a not authorized status.
        let authentication = req.authentication;
        if(authentication === undefined || authentication === null) {
            logger.warn('Reached get user route without authentication.');
            // UNAUTHORIZED = 401
            res.status(401).send('');
            return;    
        }
        let userUUID = req.authentication.userUUID;
        if(userUUID === undefined || userUUID === null) {
            logger.warn('Reached get user route without an authenticated user.');
            // UNAUTHORIZED = 401
            res.status(401).send('');
            return;    
        }
        if(userUUID != uuid) {
            logger.warn('The authenticated user is different from the requested user.');
            // UNAUTHORIZED = 401
            res.status(401).send('');
            return;    
        }
        let tokenUUID = req.authentication.tokenUUID;
        securityClient.execute('getUser', tokenUUID, userUUID, function(err, user) {
            if((err != undefined) && (err != null)) {
                RouteUtil.sendDAOError(res, err);
                return;
            }
            // remove all the versioning and any dates
            delete user.versions;
            delete user.currentVersion;
            delete user.creationDate;
            delete user.lastUpdateDate;
            // retrieve the user profile
            securityClient.execute('getUserProfile', tokenUUID, userUUID, function(err, userProfile) {
                if((err != undefined) && (err != null)) {
                    RouteUtil.sendDAOError(res, err);
                    return;
                }
                delete userProfile.versions;
                delete userProfile.currentVersion;
                delete userProfile.creationDate;
                delete userProfile.lastUpdateDate;
                user.profile = userProfile;
                // retrieve account names
                let accountUUIDs = user.accounts;
                if((accountUUIDs != undefined) && (accountUUIDs != null)) {
                    let accounts = [];
                    let numberOfAccountsToProcess = accountUUIDs.length;
                    let numberOfProcessedAccounts = 0;
                    for(let i=0;i < accountUUIDs.length;i++) {
                        let accountUUID = accountUUIDs[i];
                        securityClient.execute('getAccount', tokenUUID, userUUID, accountUUID, function(err, account) {
                            numberOfProcessedAccounts++;
                            if((err != undefined) && (err != null)) {
                                logger.warn('Something went wrong retrieving an account for user \'' + userUUID + '\'.');
                            } else {
                                let trimmedAccount = {};
                                trimmedAccount.uuid = account.uuid;
                                trimmedAccount.name = account.name;
                                accounts.push(trimmedAccount);
                            }
                            if(numberOfProcessedAccounts >= numberOfAccountsToProcess) {
                                user.accounts = accounts;
                                res.send(user);
                            }
                        });
                    }
                } else {
                    res.send(user);
                }
            });
        });
    });

    webServer.put('/user/:uuid/profile/', function(req, res) {
        let uuid = RouteUtil.sanitizeStringParameter(req.params.uuid);
        if(uuid.length <= 0) {
            // BAD REQUEST = 400
            res.status(400).send('');
            return;
        }
        // Get the logged in user.
        // If they are not found on the request somehow we were not logged in.
        // We should NOT have reached this far in!!! 
        // Log this occurrence and respond with a not authorized status.
        let authentication = req.authentication;
        if(authentication === undefined || authentication === null) {
            logger.warn('Reached update user route without authentication.');
            // UNAUTHORIZED = 401
            res.status(401).send('');
            return;    
        }
        let tokenUUID = req.authentication.tokenUUID;
        let userUUID = req.authentication.userUUID;
        if(userUUID === undefined || userUUID === null) {
            logger.warn('Reached update user route without an authenticated user.');
            // UNAUTHORIZED = 401
            res.status(401).send('');
            return;    
        }
        if(userUUID != uuid) {
            logger.warn('The authenticated user is different from the requested user.');
            // UNAUTHORIZED = 401
            res.status(401).send('');
            return;    
        }
        let firstName = RouteUtil.sanitizeStringParameter(req.body.firstName);
        let lastName = RouteUtil.sanitizeStringParameter(req.body.lastName);
        let description = RouteUtil.sanitizeStringParameter(req.body.description);
        securityClient.execute('updateUserProfile', tokenUUID, userUUID, firstName, lastName, description,
            function(err, userProfile) {
                if((err != undefined) && (err != null)) {
                    // INTERNAL SERVER ERROR = 500
                    res.status(500).send('');
                    return;
                }
                res.send(userProfile);
            }
        );
    });

    webServer.delete('/user/:uuid/interrupt/', function(req, res) {
        let uuid = RouteUtil.sanitizeStringParameter(req.params.uuid);
        if(uuid.length <= 0) {
            // BAD REQUEST = 400
            res.status(400).send('');
            return;
        }
        // Get the logged in user.
        // If they are not found on the request somehow we were not logged in.
        // We should NOT have reached this far in!!! 
        // Log this occurrence and respond with a not authorized status.
        let authentication = req.authentication;
        if(authentication === undefined || authentication === null) {
            logger.warn('Reached update user route without authentication.');
            // UNAUTHORIZED = 401
            res.status(401).send('');
            return;    
        }
        let tokenUUID = req.authentication.tokenUUID;
        let userUUID = req.authentication.userUUID;
        if(userUUID === undefined || userUUID === null) {
            logger.warn('Reached update user route without an authenticated user.');
            // UNAUTHORIZED = 401
            res.status(401).send('');
            return;    
        }
        if(userUUID != uuid) {
            logger.warn('The authenticated user is different from the requested user.');
            // UNAUTHORIZED = 401
            res.status(401).send('');
            return;    
        }
        securityClient.execute('clearInterrupt', tokenUUID, userUUID, function(err) {
            if((err != undefined) && (err != null)) {
                // INTERNAL SERVER ERROR = 500
                res.status(500).send('');
                return;
            }
            // SUCCESS = 200
            res.status(200).send('');
        });
    });

    webServer.put('/user/:uuid/password', function(req, res) {
        let uuid = RouteUtil.sanitizeStringParameter(req.params.uuid);
        if(uuid.length <= 0) {
            // BAD REQUEST = 400
            res.status(400).send('');
            return;
        }
        // Get the logged in user.
        // If they are not found on the request somehow we were not logged in.
        // We should NOT have reached this far in!!! 
        // Log this occurrence and respond with a not authorized status.
        let authentication = req.authentication;
        if(authentication === undefined || authentication === null) {
            logger.warn('Reached update user route without authentication.');
            // UNAUTHORIZED = 401
            res.status(401).send('');
            return;    
        }
        let tokenUUID = req.authentication.tokenUUID;
        let userUUID = req.authentication.userUUID;
        if(userUUID === undefined || userUUID === null) {
            logger.warn('Reached update user route without an authenticated user.');
            // UNAUTHORIZED = 401
            res.status(401).send('');
            return;    
        }
        if(userUUID != uuid) {
            logger.warn('The authenticated user is different from the requested user.');
            // UNAUTHORIZED = 401
            res.status(401).send('');
            return;    
        }
        let password = req.body.password;
        if(password === undefined || password === null) {
            // BAD REQUEST = 400
            res.status(400).send('');
            return;
        }
        password = password.trim();
        if(password.length <= 0) {
            // BAD REQUEST = 400
            res.status(400).send('');
            return;
        }
        securityClient.execute('updatePassword', tokenUUID, userUUID, password, function(err) {
            if((err != undefined) && (err != null)) {
                // INTERNAL SERVER ERROR = 500
                res.status(500).send('');
                return;
            }
            // SUCCESS = 200
            res.status(200).send('');
        });
    });
}