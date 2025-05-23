/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-db
 *
 * NAME
 * BooleanColumn
 */
const packageName = 'dxp3-db';
const moduleName = 'BooleanColumn';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * @module dxp3-db/BooleanColumn
 */
const Column = require('./Column');
const ColumnType = require('./ColumnType');
const util = require('dxp3-util');

class BooleanColumn extends Column {

    /**
     * @param {String} _uuid 
     * @param {String} _name 
     */
    constructor(_uuid, _name) {
        super(_uuid, _name, ColumnType.BOOLEAN);
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
   util.Help.print(BooleanColumn);
   return;
}
module.exports = BooleanColumn;