const packageName = 'dxp3-management-dao';
const moduleName = 'DAOError';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;

class DAOError extends Error {
	constructor(_code, message) {
		super(message);
		this.code = _code;
	}
}
DAOError.BAD_REQUEST = new DAOError(400,'BAD REQUEST');
DAOError.CONFLICT = new DAOError(409, 'CONFLICT');
DAOError.FILE_NOT_FOUND = new DAOError(404, 'FILE NOT FOUND');
DAOError.FORBIDDEN = new DAOError(403, 'FORBIDDEN');
	// Alias of BAD_REQUEST
DAOError.ILLEGAL_ARGUMENT = new DAOError(400, 'ILLEGAL ARGUMENT');
DAOError.INTERNAL_SERVER_ERROR = new DAOError(500, 'INTERNAL SERVER ERROR');
DAOError.NOT_IMPLEMENTED = new DAOError(501, 'NOT IMPLEMENTED');
DAOError.UNAUTHORIZED = new DAOError(401, 'UNAUTHORIZED');

module.exports = DAOError;