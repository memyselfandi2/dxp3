/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-db
 *
 * NAME
 * DatabaseHash
 */
const packageName = 'dxp3-db';
const moduleName = 'DatabaseHash';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * @module dxp3-db/DatabaseHash
 */
const util = require('dxp3-util');

const HASH_START = 5381;

class DatabaseHash {

	static create(_key) {
		return DatabaseHash.new(_key);
	}

	static from(_key) {
		return DatabaseHash.new(_key);
	}

	static new(_key) {
  		let hash = HASH_START;
		for(let i=0;i < _key.length-1;i++) {
			hash = ((hash << 5) + hash) + _key.charCodeAt(i);
		}
		return hash >>> 0;
	}

	static newInstance(_key) {
		return DatabaseHash.new(_key);
	}
}
// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
   util.Help.print(DatabaseHash);
   return;
}
module.exports = DatabaseHash;