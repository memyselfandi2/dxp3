const path = require('path');
const packageName = 'dxp3-management-api' + path.sep + 'routes' + path.sep + 'secure';
const moduleName = 'accountRoute';
const canonicalName = packageName + path.sep + moduleName;
// Best next thing: logging
const logging = require('dxp3-logging');
const logger = logging.getLogger(canonicalName);
const RouteUtil = require('../RouteUtil');
const configuration = require('dxp3-configuration');
const ApplicationKeys = require('../../ApplicationKeys');

module.exports = function(webServer, securityClient) {
    /**************************************************
     * CREATE / CONSTRUCTORS
    **************************************************/
    webServer.post('/account/', function(req, res) {
        let accountName = RouteUtil.sanitizeStringParameter(req.body.accountname);
        if(accountName.length <= 0) {
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
            logger.warn('Reached create account route without authentication.');
            // UNAUTHORIZED = 401
            res.status(401).send('');
            return;    
        }
        let userUUID = req.authentication.userUUID;
        if(userUUID === undefined || userUUID === null) {
            logger.warn('Reached create account route without an authenticated user.');
            // UNAUTHORIZED = 401
            res.status(401).send('');
            return;    
        }
        securityClient.execute('createAccount', userUUID, accountName, null, function(err, account) {
            if(err) {
                RouteUtil.sendDAOError(res, err);
                return;
            }
            res.send(account);
        });
    });
    /**************************************************
     * READ
    **************************************************/
    webServer.get('/account/', function(req, res) {
        let startIndexParameter = req.query.startIndex;
        let startIndex = parseInt(startIndexParameter);
        if(isNaN(startIndex) || startIndex === undefined || startIndex === null) {
            startIndex = 0;
        }
        let maximumNumberOfResultsParameter = req.query.maximumNumberOfResults;
        let maximumNumberOfResults = parseInt(maximumNumberOfResultsParameter);
        if(isNaN(maximumNumberOfResults) || maximumNumberOfResults === undefined || maximumNumberOfResults === null) {
            maximumNumberOfResults = -1;
        }
        // Array with key value pairs in the url
        // filterBy[key1]=value1&filterBy[key2]=value2
        let filterBy = {};
        let filterByParameter = req.query.filterBy;
        if((filterByParameter != undefined) && (filterByParameter != null)) {
            filterBy = filterByParameter;
        }
        // Comma separated property names
        let sortBy = [];
        let sortByParameter = req.query.sortBy;
        if((sortByParameter != undefined) && (sortByParameter != null)) {
            sortByParameter = sortByParameter.trim();
            if(sortByParameter != '') {
                sortBy = sortByParameter.split(',');
            }
        }
        // Get the logged in user and associated account.
        // If they are not found on the request somehow we were not logged in.
        // We should NOT have reached this far in!!! 
        // Log this occurrence and respond with a not authorized status.
        let authentication = req.authentication;
        if(authentication === undefined || authentication === null) {
            logger.warn('Reached list applications route without authentication.');
            res.status(401).send('');
            return;    
        }
        let userUUID = req.authentication.userUUID;
        if(userUUID === undefined || userUUID === null) {
            logger.warn('Reached list applications route without an authenticated user.');
            res.status(401).send('');
            return;    
        }
        accountDao.list(userUUID, startIndex, maximumNumberOfResults, filterBy, sortBy, function(err, list) {
            if(err) {
                RouteUtil.sendDAOError(res, err);
                return;
            }
            res.send(list);
        });
    });

    webServer.get('/account/:uuid/', function(req, res) {
        let uuid = req.params.uuid;
        if(uuid === undefined || uuid === null) {
            // BAD REQUEST = 400
            res.status(400).send('');
            return;
        }
        uuid = uuid.trim();
        if(uuid.length <= 0) {
            // BAD REQUEST = 400
            res.status(400).send('');
            return;
        }
        // Get the logged in user and associated account.
        // If they are not found on the request somehow we were not logged in.
        // We should NOT have reached this far in!!! 
        // Log this occurrence and respond with a not authorized status.
        let authentication = req.authentication;
        if(authentication === undefined || authentication === null) {
            logger.warn('Reached get application route without authentication.');
            res.status(401).send('');
            return;    
        }
        let accountUUID = req.authentication.accountUUID;
        if(accountUUID === undefined || accountUUID === null) {
            logger.warn('Reached get application route without an authenticated account.');
            res.status(401).send('');
            return;    
        }
        let userUUID = req.authentication.userUUID;
        if(userUUID === undefined || userUUID === null) {
            logger.warn('Reached get application route without an authenticated user.');
            res.status(401).send('');
            return;    
        }
        accountDao.get(req, res, accountUUID, userUUID, uuid);
    });
    /**************************************************
     * UPDATE
    **************************************************/
    webServer.put('/account/:uuid/', function(req, res) {
        let uuid = req.params.uuid;
        if(uuid === undefined || uuid === null) {
            // BAD REQUEST = 400
            res.status(400).send('');
            return;
        }
        uuid = uuid.trim();
        if(uuid.length <= 0) {
            // BAD REQUEST = 400
            res.status(400).send('');
            return;
        }
        let name = req.body.name;
        if(name === undefined || name === null) {
            // BAD REQUEST = 400
            res.status(400).send('');
            return;
        }
        name = name.trim();
        if(name.length <= 0) {
            // BAD REQUEST = 400
            res.status(400).send('');
            return;
        }
        let description = req.body.description;
        if(description === undefined || description === null) {
            description = '';
        }
        description = description.trim();
        // Get the logged in user and associated account.
        // If they are not found on the request somehow we were not logged in.
        // We should NOT have reached this far in!!! 
        // Log this occurrence and respond with a not authorized status.
        let authentication = req.authentication;
        if(authentication === undefined || authentication === null) {
            logger.warn('Reached update application route without authentication.');
            res.status(401).send('');
            return;    
        }
        let accountUUID = req.authentication.accountUUID;
        if(accountUUID === undefined || accountUUID === null) {
            logger.warn('Reached update application route without an authenticated account.');
            res.status(401).send('');
            return;    
        }
        let userUUID = req.authentication.userUUID;
        if(userUUID === undefined || userUUID === null) {
            logger.warn('Reached update application route without an authenticated user.');
            res.status(401).send('');
            return;    
        }
        accountDao.update(req, res, accountUUID, userUUID, uuid, name, description);
    });
    /**************************************************
     * DELETE
    **************************************************/
    webServer.delete('/account/:uuid/', function(req, res) {
        let uuid = req.params.uuid;
        if(uuid === undefined || uuid === null) {
            // BAD REQUEST = 400
            res.status(400).send('');
            return;
        }
        uuid = uuid.trim();
        if(uuid.length <= 0) {
            // BAD REQUEST = 400
            res.status(400).send('');
            return;
        }
        // Get the logged in user and associated account.
        // If they are not found on the request somehow we were not logged in.
        // We should NOT have reached this far in!!! 
        // Log this occurrence and respond with a not authorized status.
        let authentication = req.authentication;
        if(authentication === undefined || authentication === null) {
            logger.warn('Reached delete application route without authentication.');
            res.status(401).send('');
            return;    
        }
        let accountUUID = req.authentication.accountUUID;
        if(accountUUID === undefined || accountUUID === null) {
            logger.warn('Reached delete application route without an authenticated account.');
            res.status(401).send('');
            return;    
        }
        let userUUID = req.authentication.userUUID;
        if(userUUID === undefined || userUUID === null) {
            logger.warn('Reached delete application route without an authenticated user.');
            res.status(401).send('');
            return;    
        }
        accountDao.delete(req, res, accountUUID, userUUID, uuid);
    });
}