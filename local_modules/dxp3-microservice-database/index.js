/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-microservice-database
 *
 * NAME
 * index
 */
const packageName = 'dxp3-microservice-database';
const moduleName = 'index';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
// Check if someone tried to run/execute this file.
const util = require('dxp3-util');
if(util.Assert.isFileToExecute(canonicalName)) {
    util.Help.print();
    return;
}
/**
 * @module dxp3-microservice-database
 */
const database = {};

/** @member {module:dxp3-microservice-database/DatabaseClient} DatabaseClient */
database.DatabaseClient = require('./DatabaseClient');
/** @member {module:dxp3-microservice-database/DatabaseClientEvent} DatabaseClientEvent */
database.DatabaseClientEvent = require('./DatabaseClientEvent');
/** @member {module:dxp3-microservice-database/DatabaseServer} DatabaseServer */
database.DatabaseServer = require('./DatabaseServer');

module.exports = database;