/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-db
 *
 * NAME
 * Column
 */
const packageName = 'dxp3-db';
const moduleName = 'Column';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * @module dxp3-db/Column
 */
const DatabaseError = require('./DatabaseError');
const sql = require('dxp3-lang-sql');
const util = require('dxp3-util');
/**
 * A Column represents a column in a table with a name and a type (Columntype).
 * There are different subclasses for different types.
 */
class Column extends sql.SQLColumn {
    /*********************************************
     * CONSTRUCTOR
     ********************************************/

    /**
     * @param {String} _uuid
     * @param {String} _name
     * @param {ColumnType} _type
 	 * @throws {module:dxp3-db/DabaseError~DatabaseError.ILLEGAL_ARGUMENT} When the name is
 	 * undefined, null or empty.
     */
	constructor(_uuid, _name, _type) {
        // Check if the UUID is valid.
        if(_uuid === undefined || _uuid === null) {
			throw DatabaseError.ILLEGAL_ARGUMENT;
		}
        // Unique identifier for this column.
        _uuid = _uuid.trim();
		if(_uuid.length <= 0) {
			throw DatabaseError.ILLEGAL_ARGUMENT;
		}
        // Check if the name is valid.
		if(_name === undefined || _name === null) {
			throw DatabaseError.ILLEGAL_ARGUMENT;
		}
		_name = _name.trim();
		if(_name.length <= 0) {
			throw DatabaseError.ILLEGAL_ARGUMENT;
		}
		super(_name);
        this._uuid = _uuid;
		this._type = _type;
	}

    /*********************************************
     * PUBLIC METHODS
     ********************************************/

    equals(_object) {
    	throw DatabaseError.NOT_IMPLEMENTED;
	}

    toString() {
        let result = this._name;
        if(this._type != null) {
            result += ' ' + this._type.toString();
        }
        return result;
    }

    /*********************************************
     * GETTERS
     ********************************************/

	get type() {
		return this.getType();
	}

	getType() {
		return this._type;
	}

    get uuid() {
        return this.getUUID();
    }

    getUUID() {
        return this._uuid;
    }

    /*********************************************
     * SETTERS
     ********************************************/

    setUUID(_uuid) {
        this._uuid = _uuid;
    }

    set uuid(_uuid) {
        this.setUUID(_uuid);
    }
}
// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
   util.Help.print(Column);
   return;
}
module.exports = Column;