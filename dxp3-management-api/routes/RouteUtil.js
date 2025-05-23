const DAOErrors = require('../DAOErrors');

class RouteUtil {

    static sendDAOError(res, error) {
        if(DAOErrors.BAD_REQUEST === error) {
            res.status(400).send('');
        } else if(DAOErrors.CONFLICT === error) {
            res.status(409).send('');
        } else if(DAOErrors.FILE_NOT_FOUND === error) {
            res.status(404).send('');
        } else if(DAOErrors.NOT_IMPLEMENTED === error) {
            res.status(501).send('');
        } else if(DAOErrors.UNAUTHORIZED === error) {
            res.status(401).send('');
        } else {
            res.status(500).send('');
        }
    }

    static sanitizeStringParameter(parameter) {
        if(parameter === undefined || parameter === null) {
            parameter = '';
        }
        parameter = parameter.trim();
        let parameterLowerCase = parameter.toLowerCase();
        if(parameterLowerCase === 'undefined' || parameterLowerCase === 'null') {
            parameter = '';
        }
        return parameter;
    }

    static sanitizeArrayParameter(parameter) {
        let result = [];
        if(parameter === undefined || parameter === null) {
            return result;
        }
        if(typeof parameter === "string") {
            parameter = parameter.trim();
            parameter = parameter.split(',');
        }
        if(Array.isArray(parameter)) {
            for(let i=0;i < parameter.length;i++) {
                let value = parameter[i];
                value = value.trim();
                if(value.length <= 0) {
                    value = null;
                } else {
                    let valueLowerCase = value.toLowerCase();
                    if(valueLowerCase === 'undefined' || valueLowerCase === 'null') {
                        value = null;
                    }
                }
                result.push(value);
            }
        }
        return result;
    }

    static sanitizeBooleanParameter(parameter) {
        let result = false;
        if(parameter === undefined || parameter === null) {
            return result;
        }
        if(typeof parameter === 'boolean') {
            return parameter;
        }
        if(typeof parameter === 'string') {
            parameter = parameter.trim().toLowerCase();
            result = (parameter === 'true') || (parameter === 'yes') || (parameter === 'on');
        }
        return result;
    }

    static parseListParameters(req) {
        let result = {};
        let parentUUID = RouteUtil.sanitizeStringParameter(req.query.parentUUID);
        let startIndex = 0;
        let startIndexParameter = req.query.startIndex;
        if((startIndexParameter != undefined) && (startIndexParameter != null)) {
            startIndex = parseInt(startIndexParameter);
            if(isNaN(startIndex) || startIndex === undefined || startIndex === null) {
                startIndex = 0;
            } else if(startIndex < 0) {
                startIndex = 0;
            }
        }
        let maximumNumberOfResults = -1;
        let maximumNumberOfResultsParameter = req.query.maximumNumberOfResults;
        if((maximumNumberOfResultsParameter != undefined) && (maximumNumberOfResultsParameter != null)) {
            maximumNumberOfResults = parseInt(maximumNumberOfResultsParameter);
            if(isNaN(maximumNumberOfResults) || maximumNumberOfResults === undefined || maximumNumberOfResults === null) {
                maximumNumberOfResults = -1;
            } else if(maximumNumberOfResults < -1) {
                maximumNumberOfResults = -1;
            }
        }
        // Comma separated category uuid's
        let categorizedAs = RouteUtil.sanitizeArrayParameter(req.query.categorizedAs);
        // Array with key value pairs in the url
        // filterBy[key1]=value1&filterBy[key2]=value2
        let filterBy = {};
        let filterByParameter = req.query.filterBy;
        if((filterByParameter != undefined) && (filterByParameter != null)) {
            filterBy = filterByParameter;
        }
        // Comma separated property names
        let sortBy = {};
        let sortByProperties = RouteUtil.sanitizeArrayParameter(req.query.sortBy);
        for(let i=0;i < sortByProperties.length;i++) {
            let sortByProperty = sortByProperties[i];
            if(sortByProperty.startsWith('-')) {
                sortByProperty = sortByProperty.substring(1).trim();
                if(sortByProperty.length <= 0) {
                    continue;
                }
                sortBy[sortByProperty] = 'descending';
            } else {
                sortBy[sortByProperty] = 'ascending';
            }
        }
        result.parentUUID = parentUUID;
        result.startIndex = startIndex;
        result.maximumNumberOfResults = maximumNumberOfResults;
        result.categorizedAs = categorizedAs;
        result.filterBy = filterBy;
        result.sortBy = sortBy;
        return result;
    }

    static isAuthenticated(req, callback) {
        // Get the logged in user and associated account.
        // If they are not found on the request somehow we were not logged in.
        let authentication = req.authentication;
        if(authentication === undefined || authentication === null) {
            if(callback) {
                // UNAUTHORIZED = 401
                return callback(401);
            }
            return;
        }
        let tokenUUID = req.authentication.tokenUUID;
        if(tokenUUID === undefined || tokenUUID === null) {
            if(callback) {
                // UNAUTHORIZED = 401
                return callback(401);
            }
            return;
        }
        let accountUUID = req.authentication.accountUUID;
        if(accountUUID === undefined || accountUUID === null) {
            if(callback) {
                // UNAUTHORIZED = 401
                return callback(401);
            }
            return;
        }
        let userUUID = req.authentication.userUUID;
        if(userUUID === undefined || userUUID === null) {
            if(callback) {
                // UNAUTHORIZED = 401
                return callback(401);
            }
            return;
        }
        if(callback) {
            return callback(null, accountUUID, userUUID);
        }
        return;
    }
}

module.exports = RouteUtil;