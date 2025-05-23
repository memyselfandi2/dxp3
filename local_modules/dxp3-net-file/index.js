/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-net-file
 *
 * NAME
 * index
 */
const packageName = 'dxp3-net-file';
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
 * <p>This module contains everything one needs to run a File server or a File Client.
 * Make sure this local module is defined as a dependency in your package.file.
 * Typically the dependency is defined by a file reference using a relative path.
 * Obviously that relative path may be different for different modules.<br/>
 * Here is an example of such a dependency in a package.file:<br/>
 * "dependencies": {<br/>
 *     "dxp3-net-file": "file:../../../local_modules/dxp3-net-file"<br/>
 * }<br/>
 * </p>
 *
 * @example
 * const file = require('dxp3-net-file');
 *
 * @module dxp3-net-file
 */
const file = {};

file.FileClient = require('./FileClient');
file.FileClientEvent = require('./FileClientEvent');
file.FileError = require('./FileError');
file.FileServer = require('./FileServer');
file.FileServerEvent = require('./FileServerEvent');
file.FileServerState = require('./FileServerState');

module.exports = file;