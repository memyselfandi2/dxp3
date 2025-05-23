/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-microservice-web
 *
 * NAME
 * WebServerEvent
 */
const packageName = 'dxp3-microservice-web';
const moduleName = 'WebServerEvent';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
// Check if someone tried to run/execute this file.
const util = require('dxp3-util');
if(util.Assert.isFileToExecute(canonicalName)) {
	util.Help.print();
	return;
}
/**
 * @module dxp3-microservice-web/WebServerEvent
 */
const microservice = require('dxp3-microservice');
const MicroServiceEvent = microservice.MicroServiceEvent;

const WebServerEvent = {
	...MicroServiceEvent
}

module.exports = WebServerEvent;