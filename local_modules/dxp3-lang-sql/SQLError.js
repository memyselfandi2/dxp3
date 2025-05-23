const packageName = 'dxp3-lang-sql';
const moduleName = 'SQLError';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;

class SQLError extends Error {
	constructor(_code, _message) {
		super(_message);
		this.code = _code;
	}

	toString() {
		return this.code + ': ' + this.message;
	}

	static from(_error) {
		if(_error === undefined || _error === null) {
			return SQLError.INTERNAL_SERVER_ERROR;
		}
		return new SQLError(500, _error.message);
	}
}
SQLError.BAD_REQUEST = new SQLError(400,'BAD REQUEST');
SQLError.CONFLICT = new SQLError(409, 'CONFLICT');
SQLError.FILE_NOT_FOUND = new SQLError(404, 'FILE NOT FOUND');
SQLError.FORBIDDEN = new SQLError(403, 'FORBIDDEN');
	// Alias of BAD_REQUEST
SQLError.ILLEGAL_ARGUMENT = new SQLError(400, 'ILLEGAL ARGUMENT');
SQLError.INTERNAL_SERVER_ERROR = new SQLError(500, 'INTERNAL SERVER ERROR');
SQLError.NOT_IMPLEMENTED = new SQLError(501, 'NOT IMPLEMENTED');
SQLError.UNAUTHORIZED = new SQLError(401, 'UNAUTHORIZED');

module.exports = SQLError;