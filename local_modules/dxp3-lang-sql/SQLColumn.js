/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-lang-sql
 *
 * NAME
 * SQLColumn
 */
const packageName = 'dxp3-lang-sql';
const moduleName = 'SQLColumn';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
// Check if someone tried to run/execute this file.
const util = require('dxp3-util');
if(util.Assert.isFileToExecute(canonicalName)) {
   util.Help.print();
   return;
}
/**
 * @module dxp3-lang-sql/SQLColumn
 */
const SQLError = require('./SQLError');

class SQLColumn {
    /*********************************************
     * CONSTRUCTOR
     ********************************************/

    /**
     * @param {String} _name
 	 * @throws {module:dxp3-lang-sql/SQLError~SQLError.ILLEGAL_ARGUMENT} When the name is
 	 * undefined, null or empty.
     */
	constructor(_name) {
		if(_name === undefined || _name === null) {
			throw SQLError.ILLEGAL_ARGUMENT;
		}
		_name = _name.trim();
		if(_name.length <= 0) {
			throw SQLError.ILLEGAL_ARGUMENT;
		}
		this._name = _name;
	}

    /*********************************************
     * PUBLIC METHODS
     ********************************************/

    toString() {
        return this._name;
    }

    toStringForQuery() {
    	if(this._name.indexOf(' ') < 0) {
    		return this._name;
    	} else {
    		return '[' + this._name + ']';
    	}
    }

    /*********************************************
     * GETTERS
     ********************************************/

	get name() {
		return this.getName();
	}

	getName() {
		return this._name;
	}

    /*********************************************
     * SETTERS
     ********************************************/

	set name(_name) {
		this.setName(_name);
	}

	setName(_name) {
		if(_name === undefined || _name === null) {
			throw SQLError.ILLEGAL_ARGUMENT;
		}
		_name = _name.trim();
		if(_name.length <= 0) {
			throw SQLError.ILLEGAL_ARGUMENT;
		}
		this._name = _name;
	}
}

module.exports = SQLColumn;