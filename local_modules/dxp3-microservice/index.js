/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-microservice
 *
 * NAME
 * index
 */
const packageName = 'dxp3-microservice';
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
 * <p>The dxp3-microservice module contains all the necessary functionality to configure and
 * run web servers, rest servers, publishers, subscribers, gateways and/or their respective clients.<br/>
 * Make sure this local module is defined as a dependency in your package.json.
 * Typically the dependency is defined by a file reference using a relative path.
 * Obviously that relative path may be different for different modules.
 * Here is an example of such a dependency in a package.json:<br/>
 * "dependencies": {<br/>
 *   "dxp3-microservice": "file:../../../local_modules/dxp3-microservice"<br/>
 * }<br/>
 *
 * @example
 * let microservice = require('dxp3-microservice');
 * let logging = require('dxp3-logging');
 * logging.setLevel(logging.Level.INFO);
 *
 * // Create three web servers
 * let numberOfWebServers = 3;
 * let mainWebSite = 'main website server pool';
 * for(let i=0;i < numberOfWebServers;i++) {
 *    let webServerName = 'myWebServer' + i;
 *    let webServer = new microservice.WebServer({name:webServerName,produces:mainWebSite});
 *    // request is an intance of a dxp3-net-http.HTTPRequest.
 *    // response is an instance of a dxp3-net-http.HTTPResponse.
 *    webServer.all('*', function(request, response, route) {
 *       console.log('request received');
 *       route.next();
 *    });
 *    webServer.get('/echo/', function(request, response) {
 *       console.log('handling details request');
 *       let message = request.query.message;
 *       response.status(200).send(message);
 *    });
 *    webServer.start();
 * }
 * // Create a gateway to act as a load balancer.
 * let gateway = new microservice.WebGateway({name:'myGateway',forwardsto:mainWebSite});
 * gateway.on(microservice.MicroServiceEvent.RUNNING, function() {
 *    console.log('Gateway is running.');
 * }
 * gateway.start();
 *
 * @module dxp3-microservice
 */
const microservice = {};

/** @member {module:dxp3-microservice/MicroService} MicroService */
microservice.MicroService = require('./MicroService');
/** @member {module:dxp3-microservice/MicroServiceOptions} MicroServiceOptions */
microservice.MicroServiceOptions = require('./MicroServiceOptions');
/** @member {module:dxp3-microservice/MicroServiceDefaults} MicroServiceDefaults */
microservice.MicroServiceDefaults = require('./MicroServiceDefaults');
/** @member {module:dxp3-microservice/MicroServiceDefinition} MicroServiceDefinition */
microservice.MicroServiceDefinition = require('./MicroServiceDefinition');
/** @member {module:dxp3-microservice/MicroServiceError} MicroServiceError */
microservice.MicroServiceError = require('./MicroServiceError');
/** @member {module:dxp3-microservice/MicroServiceEvent} MicroServiceEvent */
microservice.MicroServiceEvent = require('./MicroServiceEvent');
/** @member {module:dxp3-microservice/MicroServiceState} MicroServiceState */
microservice.MicroServiceState = require('./MicroServiceState');
/** @member {module:dxp3-microservice/MicroServiceType} MicroServiceType */
microservice.MicroServiceType = require('./MicroServiceType');
/** @member {module:dxp3-microservice/Scout} Scout */
microservice.Scout = require('./Scout');
/** @member {module:dxp3-microservice/ScoutEvent} ScoutEvent */
microservice.ScoutEvent = require('./ScoutEvent');

module.exports = microservice;