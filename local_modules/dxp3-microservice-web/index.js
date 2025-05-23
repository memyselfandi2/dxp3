/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-microservice-web
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
 * @module dxp3-microservice-web
 */
const microservice = require('dxp3-microservice');

const web = {};

/** @member {module:dxp3-microservice/MicroServiceState} MicroServiceState */
web.MicroServiceState = microservice.MicroServiceState;
/** @member {module:dxp3-microservice-web/WebForm} WebForm */
web.WebForm = require('./WebForm');
/** @member {module:dxp3-microservice-web/WebGateway} WebGateway */
web.WebGateway = require('./WebGateway');
/** @member {module:dxp3-microservice-web/WebGatewayOptions} WebGatewayOptions */
web.WebGatewayOptions = require('./WebGatewayOptions');
/** @member {module:dxp3-microservice-web/WebGatewayDefaults} WebGatewayDefaults */
web.WebGatewayDefaults = require('./WebGatewayDefaults');
/** @member {module:dxp3-microservice-web/WebGatewayEvent} WebGatewayEvent */
web.WebGatewayEvent = require('./WebGatewayEvent');
/** @member {module:dxp3-microservice-web/WebServer} WebServer */
web.WebServer = require('./WebServer');
/** @member {module:dxp3-microservice-web/WebServerOptions} WebServerOptions */
web.WebServerOptions = require('./WebServerOptions');
/** @member {module:dxp3-microservice-web/WebServerDefaults} WebServerDefaults */
web.WebServerDefaults = require('./WebServerDefaults');
/** @member {module:dxp3-microservice-web/WebServerEvent} WebServerEvent */
web.WebServerEvent = require('./WebServerEvent');

module.exports = web;