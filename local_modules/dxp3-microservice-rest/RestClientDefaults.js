/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-microservice
 *
 * NAME
 * RestClientDefaults
 */
const packageName = 'dxp3-microservice-rest';
const moduleName = 'RestClientDefaults';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
// Check if someone tried to run/execute this file.
const util = require('dxp3-util');
if(util.Assert.isFileToExecute(canonicalName)) {
	util.Help.print();
	return;
}
/**
 * A constant representing all the default properties for a RestClient.
 *
 * @module dxp3-microservice/RestClientDefaults
 */
const RestClientDefaults = {
	// Default reconnect wait time is 5 seconds
	DEFAULT_RECONNECT_WAIT_TIME: 5000
}

module.exports = RestClientDefaults;