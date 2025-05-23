const packageName = 'dxp3-delivery-api';
const moduleName = 'DAOError';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;

const DAOError = {
	BAD_REQUEST: 400,
	CONFLICT: 409,
	FILE_NOT_FOUND: 404,
	FORBIDDEN: 403,
	INTERNAL_SERVER_ERROR: 500,
	NOT_IMPLEMENTED: 501,
	UNAUTHORIZED: 401
}

module.exports = DAOError;