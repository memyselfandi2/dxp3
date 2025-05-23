/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-lang-sql
 *
 * NAME
 * SQLTableIndex
 */
const packageName = 'dxp3-lang-sql';
const moduleName = 'SQLTableIndex';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
// Check if someone tried to run/execute this file.
const util = require('dxp3-util');
if(util.Assert.isFileToExecute(canonicalName)) {
	util.Help.print();
	return;
}
/**
 * @module dxp3-lang-sql/SQLTableIndex
 */
const SQLError = require('./SQLError');

class SQLTableIndex {
    /*********************************************
     * CONSTRUCTOR
     ********************************************/

	constructor() {
	}

    async between(_value1, _value2) {
    	throw SQLError.NOT_IMPLEMENTED;
    }

	async equal(_value) {
		throw SQLError.NOT_IMPLEMENTED;
    }

	async equalColumn(_columnName) {
		throw SQLError.NOT_IMPLEMENTED;
    }

	async greater(_value) {
		throw SQLError.NOT_IMPLEMENTED;
    }

	async greaterColumn(_columnName) {
		throw SQLError.NOT_IMPLEMENTED;
    }

	async greaterOrEqual(_value) {
		throw SQLError.NOT_IMPLEMENTED;
    }

	async greaterOrEqualColumn(_columnName) {
		throw SQLError.NOT_IMPLEMENTED;
    }

	async in(_values) {
		throw SQLError.NOT_IMPLEMENTED;
    }

    async includes(_value) {
    	throw SQLError.NOT_IMPLEMENTED;
    }

	async less(_value) {
		throw SQLError.NOT_IMPLEMENTED;
    }

	async lessColumn(_columnName) {
		throw SQLError.NOT_IMPLEMENTED;
    }

	async lessOrEqual(_value) {
		throw SQLError.NOT_IMPLEMENTED;
    }

	async lessOrEqualColumn(_columnName) {
		throw SQLError.NOT_IMPLEMENTED;
    }

    async like(_value) {
		throw SQLError.NOT_IMPLEMENTED;
    }

    async notBetween(_value1, _value2) {
    	throw SQLError.NOT_IMPLEMENTED;
    }

	async notIn(_values) {
		throw SQLError.NOT_IMPLEMENTED;
    }

    async refresh() {
		throw SQLError.NOT_IMPLEMENTED;
    }

	async unequal(_value) {
		throw SQLError.NOT_IMPLEMENTED;
    }

	async unequalColumn(_columnName) {
		throw SQLError.NOT_IMPLEMENTED;
    }
}

module.exports = SQLTableIndex;