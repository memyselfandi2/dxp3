/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-microservice
 *
 * NAME
 * MicroServiceState
 */
const packageName = 'dxp3-microservice';
const moduleName = 'MicroServiceState';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
// Check if someone tried to run/execute this file.
const util = require('dxp3-util');
if(util.Assert.isFileToExecute(canonicalName)) {
	util.Help.print();
	return;
}
/**
 * @module dxp3-microservice/MicroServiceState
 */
const MicroServiceState = {
	INITIALIZED: "Initialized",
	PAUSED: "Paused",
	PAUSING: "Pausing",
	RUNNING: "Running",
	STARTING: "Starting",
	STOPPED: "Stopped",
	STOPPING: "Stopping"
};

module.exports = MicroServiceState;