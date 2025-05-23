/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-microservice
 *
 * NAME
 * MicroServiceDefaults
 */
const packageName = 'dxp3-microservice';
const moduleName = 'MicroServiceDefaults';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
// Check if someone tried to run/execute this file.
const util = require('dxp3-util');
if(util.Assert.isFileToExecute(canonicalName)) {
	util.Help.print();
	return;
}
/**
 * A constant representing all the default properties for a MicroService.
 *
 * @module dxp3-microservice/MicroServiceDefaults
 */
const logging = require('dxp3-logging');

const MicroServiceDefaults = {
	/**
	 * @member {String} DEFAULT_LOG_LEVEL
	 * Default log level is dxp3-logging.Level.WARN.
	 * @see module:dxp3-logging/Level
	 */
	DEFAULT_LOG_LEVEL: logging.Level.WARN,
	/**
	 * @member {String} DEFAULT_PORT
	 * The general idea behind microservices that they come and go and that their port
	 * is assigned at creation. After creation a micro service will announce its existence
	 * and its port (when applicable) to interested parties.
	 * If port is omitted or is 0, the operating system will assign an arbitrary unused port.
	 */
	DEFAULT_PORT: 0
}

module.exports = MicroServiceDefaults;