const DAOError = require('./DAOError');

class DAO {

	constructor() {
	}

    parseOptionalStringArgument(arg) {
        if(arg === undefined || arg === null) {
            return '';
        }
        if(typeof arg != 'string') {
            return '';
        }
        arg = arg.trim();
        if(arg.length <= 0) {
            return '';
        }
        let lowerCaseArg = arg.toLowerCase();
        if(lowerCaseArg === 'undefined' || lowerCaseArg === 'null') {
            return '';
        }
        return arg;
    }

    parseRequiredStringArgument(arg) {
        if(arg === undefined || arg === null) {
            throw DAOError.ILLEGAL_ARGUMENT;
        }
        if(typeof arg != 'string') {
            throw DAOError.ILLEGAL_ARGUMENT;
        }
        arg = arg.trim();
        if(arg.length <= 0) {
            throw DAOError.ILLEGAL_ARGUMENT;
        }
        let lowerCaseArg = arg.toLowerCase();
        if(lowerCaseArg === 'undefined' || lowerCaseArg === 'null') {
            throw DAOError.ILLEGAL_ARGUMENT;
        }
        return arg;
    }
}

module.exports = DAO;