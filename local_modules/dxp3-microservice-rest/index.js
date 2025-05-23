/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-microservice-rest
 *
 * NAME
 * index
 */
const packageName = 'dxp3-microservice-web';
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
 * @module dxp3-microservice-rest
 */
const microservice = require('dxp3-microservice');

const rest = {};

/** @member {module:dxp3-microservice/MicroServiceOptions} MicroServiceOptions */
rest.MicroServiceOptions = microservice.MicroServiceOptions;
/** @member {module:dxp3-microservice/MicroServiceEvent} MicroServiceEvent */
rest.MicroServiceEvent = microservice.MicroServiceEvent;
/** @member {module:dxp3-microservice/MicroServiceState} MicroServiceState */
rest.MicroServiceState = microservice.MicroServiceState;
/** @member {module:dxp3-microservice/MicroServiceType} MicroServiceType */
rest.MicroServiceType = microservice.MicroServiceType;
/** @member {module:dxp3-microservice-rest/RestClient} RestClient */
rest.RestClient = require('./RestClient');
/** @member {module:dxp3-microservice-rest/RestClientOptions} RestClientOptions */
rest.RestClientOptions = require('./RestClientOptions');
/** @member {module:dxp3-microservice-rest/RestClientEvent} RestClientEvent */
rest.RestClientEvent = require('./RestClientEvent');
/** @member {module:dxp3-microservice-rest/RestServer} RestServer */
rest.RestServer = require('./RestServer');
/** @member {module:dxp3-microservice-rest/RestServerOptions} RestServerOptions */
rest.RestServerOptions = require('./RestServerOptions');
/** @member {module:dxp3-microservice-rest/RestServerEvent} RestServerEvent */
rest.RestServerEvent = require('./RestServerEvent');

module.exports = rest;