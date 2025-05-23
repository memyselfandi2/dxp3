/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-management-gateway
 *
 * NAME
 * ApplicationDefaults
 */
const packageName = 'dxp3-management-gateway';
const moduleName = 'ApplicationDefaults';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
// Check if someone tried to run/execute this file.
const util = require('dxp3-util');
if(util.Assert.isFileToExecute(canonicalName)) {
	util.Help.print();
	return;
}
/**
 * A constant representing all the default properties for a DXP3 management gateway.
 * As our gateway is a WebGateway microservice, we simply copy most of
 * WebGatewayDefaults.
 *
 * @module dxp3-management-gateway/ApplicationDefaults
 */
const web = require('dxp3-microservice-web');

const WebGatewayDefaults = web.WebGatewayDefaults;

const ApplicationDefaults = {
	...WebGatewayDefaults
}

module.exports = ApplicationDefaults;