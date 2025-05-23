/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-db
 *
 * NAME
 * StringColumn
 */
const packageName = 'dxp3-db';
const moduleName = 'StringColumn';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * @module dxp3-db/StringColumn
 */
const Column = require('./Column');
const ColumnType = require('./ColumnType');
const util = require('dxp3-util');

class StringColumn extends Column {
    /*********************************************
     * CONSTRUCTOR
     ********************************************/

    /**
     * @param {String} _uuid
     * @param {String} _name
     * @param {Number} _length
     * @throws {module:dxp3-db/DatabaseError~DatabaseError.ILLEGAL_ARGUMENT} When the name is
     * undefined, null or empty.
     */
    constructor(_uuid, _name, _length) {
        super(_uuid, _name, ColumnType.STRING);
        this._length = _length;
    }

    /*********************************************
     * PUBLIC METHODS
     ********************************************/

    equals(_object) {
        if(_object === undefined || _object === null) {
            return false;
        }
        if(_object.constructor.name != this.constructor.name) {
            return false;
        }
        return (_object.getName() === this.getName());
    }

    toString() {
        return this.getName() + ' ' + this.getType().toString() + ' ' + this.getLength();
    }

    /*********************************************
     * GETTERS
     ********************************************/

    get length() {
        return this.getLength();
    }

    getLength() {
        return this._length;
    }
}
// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
   util.Help.print(StringColumn);
   return;
}
module.exports = StringColumn;