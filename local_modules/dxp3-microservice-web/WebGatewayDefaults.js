/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-microservice-web
 *
 * NAME
 * WebGatewayDefaults
 */
const packageName = 'dxp3-microservice-web';
const moduleName = 'WebGatewayDefaults';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
// Check if someone tried to run/execute this file.
const util = require('dxp3-util');
if(util.Assert.isFileToExecute(canonicalName)) {
	util.Help.print();
	return;
}
/**
 * A constant representing all the default properties for a WebGateway.
 * As a WebGateway basically is a HTTPReverseProxy, we simply copy most of 
 * HTTPReverseProxyDefaults.
 *
 * @module dxp3-microservice/WebGatewayDefaults
 */
const microservice = require('dxp3-microservice');
const net = require('dxp3-net');

const WebGatewayDefaults = {
	...microservice.MicroServiceDefaults,
	...net.http.HTTPReverseProxyDefaults
}

module.exports = WebGatewayDefaults;