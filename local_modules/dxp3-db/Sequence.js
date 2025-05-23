/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-db
 *
 * NAME
 * Sequence
 */
const packageName = 'dxp3-db';
const moduleName = 'Sequence';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * @module dxp3-db/Sequence
 */
const DatabaseError = require('./DatabaseError');
const util = require('dxp3-util');

class Sequence {
    /*********************************************
     * CONSTRUCTOR
     ********************************************/

    /**
     * @param {String} _uuid
     * @param {String} _name
     */
	constructor(_uuid, _name) {
        this._uuid = _uuid;
        this._name = _name;
    }

    /*********************************************
     * PUBLIC METHODS
     ********************************************/

    async desc() {
        throw DatabaseError.NOT_IMPLEMENTED;
    }

    async next() {
        return this.nextValue();
    }

    async nextValue() {
        throw DatabaseError.NOT_IMPLEMENTED;
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
        this._name = _name;
    }
}
// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
   util.Help.print(Sequence);
   return;
}
module.exports = Sequence;