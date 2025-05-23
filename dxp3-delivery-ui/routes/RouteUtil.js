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
}

module.exports = RouteUtil;