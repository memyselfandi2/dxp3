/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-microservice-cache
 *
 * NAME
 * CacheClientEvent
 */
const packageName = 'dxp3-microservice-cache';
const moduleName = 'CacheClientEvent';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
// Check if someone tried to run/execute this file.
const util = require('dxp3-util');
if(util.Assert.isFileToExecute(canonicalName)) {
	util.Help.print();
	return;
}
/**
 * @module dxp3-microservice/CacheClientEvent
 */
const rest = require('dxp3-microservice-rest');

const CacheClientEvent = {
	...rest.RestClientEvent
}

module.exports = CacheClientEvent;