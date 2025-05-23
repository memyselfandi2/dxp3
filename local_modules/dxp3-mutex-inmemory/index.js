/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-mutex-inmemory
 *
 * NAME
 * index
 */
const packageName = 'dxp3-mutex-inmemory';
const moduleName = 'index';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
// Check if someone tried to run/execute this file.
const util = require('dxp3-util');
if(util.Assert.isFileToExecute(canonicalName)) {
    require('dxp3-util').Help.print();
    return;
}
/**
 * @module dxp3-mutex-inmemory
 */
const mutex = {};

/** @member {module:dxp3-mutex-inmemory/ReadWriteLock} ReadWriteLock */
mutex.ReadWriteLock = require('./ReadWriteLock');

module.exports = mutex;