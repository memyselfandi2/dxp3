/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-management-security
 *
 * NAME
 * SecurityError
 */
const packageName = 'dxp3-management-security';
const moduleName = 'SecurityError';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
// Check if someone tried to run/execute this file.
const util = require('dxp3-util');
if(util.Assert.isFileToExecute(canonicalName)) {
    util.Help.print();
    return;
}

class SecurityError extends Error {
	constructor(_code, message) {
		super(message);
		this.code = _code;
	}
}
SecurityError.BAD_REQUEST = new SecurityError(400, "BAD REQUEST");
SecurityError.CONFLICT = new SecurityError(409, "CONFLICT");
SecurityError.FILE_NOT_FOUND = new SecurityError(404, "FILE NOT FOUND");
SecurityError.INTERNAL_SERVER_ERROR = new SecurityError(500, "INTERNAL SERVER ERROR");
SecurityError.NOT_IMPLEMENTED = new SecurityError(501, "NOT IMPLEMENTED");
SecurityError.UNAUTHORIZED = new SecurityError(401, "UNAUTHORIZED");

module.exports = SecurityError;