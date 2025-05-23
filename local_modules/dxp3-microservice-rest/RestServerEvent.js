/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-microservice-rest
 *
 * NAME
 * RestServerEvent
 */
const packageName = 'dxp3-microservice-rest';
const moduleName = 'RestServerEvent';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
// Check if someone tried to run/execute this file.
const util = require('dxp3-util');
if(util.Assert.isFileToExecute(canonicalName)) {
	util.Help.print();
	return;
}
/**
 * @module dxp3-microservice-rest/RestServerEvent
 */
const microservice = require('dxp3-microservice');
const MicroServiceEvent = microservice.MicroServiceEvent;

const RestServerEvent = {
	...MicroServiceEvent
}

module.exports = RestServerEvent;