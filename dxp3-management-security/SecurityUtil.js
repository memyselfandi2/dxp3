class SecurityUtil {

    static sanitizeNumberParameter(parameter) {
        if(parameter === undefined || parameter === null) {
            parameter = null;
        } else if(typeof parameter != 'number') {
            if(typeof parameter === 'string') {
                parameter = parameter.trim();
                try {
                    parameter = parseInt(parameter);
                } catch(exception) {
                    parameter = null;
                }
            } else {
                parameter = null;
            }
        }
        return parameter;
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
        if(Array.isArray(parameter)) {
            return parameter;
        }
        if(typeof parameter === "string") {
            parameter = parameter.trim();
            let tmpArray = parameter.split(',');
            for(let i=0;i < tmpArray.length;i++) {
                let value = tmpArray[i];
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
        if(typeof isTemplateParameter === 'boolean') {
            return parameter;
        }
        if(typeof parameter === "string") {
            parameter = parameter.trim().toLowerCase();
            result = (parameter === 'true') || (parameter === 'yes') || (parameter === 'on');
        }
        return result;
    }
}

module.exports = SecurityUtil;