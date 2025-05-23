/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-net-json
 *
 * NAME
 * index
 */
const packageName = 'dxp3-net-json';
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
 * <p>This module contains everything one needs to run a JSON server or a JSON Client.
 * Make sure this local module is defined as a dependency in your package.json.
 * Typically the dependency is defined by a file reference using a relative path.
 * Obviously that relative path may be different for different modules.<br/>
 * Here is an example of such a dependency in a package.json:<br/>
 * "dependencies": {<br/>
 *     "dxp3-net-json": "file:../../../local_modules/dxp3-net-json"<br/>
 * }<br/>
 * </p>
 *
 * @example
 * const json = require('dxp3-net-json');
 *
 * @module dxp3-net-json
 */
const json = {};

json.JSONClient = require('./JSONClient');
json.JSONClientEvent = require('./JSONClientEvent');
json.JSONError = require('./JSONError');
json.JSONServer = require('./JSONServer');
json.JSONServerEvent = require('./JSONServerEvent');
json.JSONServerState = require('./JSONServerState');

module.exports = json;