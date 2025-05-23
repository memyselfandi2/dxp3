/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-lang-csv
 *
 * NAME
 * CSVError
 */
const packageName = 'dxp3-lang-csv';
const moduleName = 'CSVError';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * @module dxp3-lang-csv/CSVError
 */
const util = require('dxp3-util');

class CSVError extends Error {
	constructor(_code, _message) {
		super(_message);
		this.code = _code;
	}

	toString() {
		return this.code + ': ' + this.message;
	}

	static from(_error) {
		if(_error === undefined || _error === null) {
			return CSVError.INTERNAL_SERVER_ERROR;
		}
		return new CSVError(500, _error.message);
	}
}
CSVError.BAD_REQUEST = new CSVError(400,'BAD REQUEST');
CSVError.CONFLICT = new CSVError(409, 'CONFLICT');
CSVError.END_OF_FILE = new CSVError(416, 'END OF FILE');
CSVError.FILE_NOT_FOUND = new CSVError(404, 'FILE NOT FOUND');
CSVError.FORBIDDEN = new CSVError(403, 'FORBIDDEN');
// Alias of BAD_REQUEST
CSVError.ILLEGAL_ARGUMENT = new CSVError(400, 'ILLEGAL ARGUMENT');
// Alias of FORBIDDEN
CSVError.ILLEGAL_STATE = new CSVError(403, 'ILLEGAL STATE');
CSVError.INTERNAL_SERVER_ERROR = new CSVError(500, 'INTERNAL SERVER ERROR');
CSVError.NOT_IMPLEMENTED = new CSVError(501, 'NOT IMPLEMENTED');
// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
   util.Help.print(CSVError);
   return;
}
module.exports = CSVError;