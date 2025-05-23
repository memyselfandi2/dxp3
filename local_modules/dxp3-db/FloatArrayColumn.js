/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-db
 *
 * NAME
 * FloatColumn
 */
const packageName = 'dxp3-db';
const moduleName = 'FloatColumn';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * @module dxp3-db/FloatColumn
 */
const Column = require('./Column');
const ColumnType = require('./ColumnType');
const util = require('dxp3-util');

class FloatArrayColumn extends Column {
    /*********************************************
     * CONSTRUCTOR
     ********************************************/

    /**
     * @param {String} _uuid
     * @param {String} _name
     * @throws {module:dxp3-db/DatabaseError~DatabaseError.ILLEGAL_ARGUMENT} When the name is
     * undefined, null or empty.
     */
    constructor(_uuid, _name) {
        super(_uuid, _name, ColumnType.FLOAT_ARRAY);
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
}
// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
   util.Help.print(FloatArrayColumn);
   return;
}
module.exports = FloatArrayColumn;