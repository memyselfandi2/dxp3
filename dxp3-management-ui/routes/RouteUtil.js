class RouteUtil {
    static sanitizeStringParameter(parameter) {
        let result = '';
        if((parameter === undefined) || (parameter === null)) {
            return result;
        }
        parameter = parameter.trim();
        if(parameter.length <= 0) {
            return result;
        }
        let parameterLowerCase = parameter.toLowerCase();
        if((parameterLowerCase === 'undefined') || (parameterLowerCase === 'null')) {
            return result;
        }
        result = parameter.replace(/[^a-zA-Z0-9_\.\/\-]/g, "");
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