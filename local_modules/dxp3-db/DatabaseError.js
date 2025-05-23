/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-db
 *
 * NAME
 * DatabaseError
 */
const packageName = 'dxp3-db';
const moduleName = 'DatabaseError';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * @module dxp3-db/DatabaseError
 */
const util = require('dxp3-util');

class DatabaseError extends Error {
	constructor(_code, _message) {
		super(_message);
		this.code = _code;
	}

	toString() {
		return this.code + ': ' + this.message;
	}

	static from(_error) {
		if(_error === undefined || _error === null) {
			return DatabaseError.INTERNAL_SERVER_ERROR;
		}
		return new DatabaseError(500, _error.message);
	}
}
DatabaseError.BAD_REQUEST = new DatabaseError(400,'BAD REQUEST');
DatabaseError.CONFLICT = new DatabaseError(409, 'CONFLICT');
DatabaseError.END_OF_FILE = new DatabaseError(416, 'END OF FILE');
DatabaseError.FILE_NOT_FOUND = new DatabaseError(404, 'FILE NOT FOUND');
DatabaseError.FULL = new DatabaseError(507, 'INSUFFICIENT STORAGE');
DatabaseError.FORBIDDEN = new DatabaseError(403, 'FORBIDDEN');
// Alias of BAD_REQUEST
DatabaseError.ILLEGAL_ARGUMENT = new DatabaseError(400, 'ILLEGAL ARGUMENT');
// Alias of FORBIDDEN
DatabaseError.ILLEGAL_STATE = new DatabaseError(403, 'ILLEGAL STATE');
DatabaseError.INTERNAL_SERVER_ERROR = new DatabaseError(500, 'INTERNAL SERVER ERROR');
DatabaseError.NOT_IMPLEMENTED = new DatabaseError(501, 'NOT IMPLEMENTED');
DatabaseError.UNAUTHORIZED = new DatabaseError(401, 'UNAUTHORIZED');
// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
   util.Help.print(DatabaseError);
   return;
}
module.exports = DatabaseError;