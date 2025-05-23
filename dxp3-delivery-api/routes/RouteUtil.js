const DAOError = require('../DAOError');

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

    static sendDAOError(res, error) {
        if(DAOError.BAD_REQUEST === error) {
            res.status(400).send('');
        } else if(DAOError.CONFLICT === error) {
            res.status(409).send('');
        } else if(DAOError.FILE_NOT_FOUND === error) {
            res.status(404).send('');
        } else if(DAOError.NOT_IMPLEMENTED === error) {
            res.status(501).send('');
        } else if(DAOError.UNAUTHORIZED === error) {
            res.status(401).send('');
        } else {
            res.status(500).send('');
        }
    }
}

module.exports = RouteUtil;