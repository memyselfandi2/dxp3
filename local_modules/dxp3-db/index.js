/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-db
 *
 * NAME
 * index
 */
const packageName = 'dxp3-db';
const moduleName = 'index';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
const util = require('dxp3-util');
// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
   util.Help.print();
   return;
}
/**
 * @module dxp3-db
 */
const db = {};

db.Database = require('./Database');
db.DatabaseAdmin = require('./DatabaseAdmin');

module.exports = db;