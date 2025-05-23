/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-microservice
 *
 * NAME
 * ScoutDefaults
 */
const packageName = 'dxp3-microservice';
const moduleName = 'ScoutDefaults';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * A constant representing all the default properties for a Scout.
 *
 * @module dxp3-microservice/ScoutDefaults
 */
const logging = require('dxp3-logging');
const ScoutMode = require('./ScoutMode');
const util = require('dxp3-util');

const ScoutDefaults = {
	DEFAULT_SCOUT_MODE: ScoutMode.MULTICAST,
	DEFAULT_LIMITED_BROADCAST_ADDRESS: '255.255.255.255',
	// We don't really know (here) what our local ip address is, so
	// if the user did not supply our directed broadcast address we 
	// simply default to the limited broadcast address.
	DEFAULT_DIRECTED_BROADCAST_ADDRESS: '255.255.255.255',
	DEFAULT_MULTICAST_ADDRESS: '239.128.1.1',
	DEFAULT_UNICAST_ADDRESS: '127.0.0.1',
	/**
	 * @member {Number} DEFAULT_SAY_HELLO_INTERVAL
	 * By default we send hello messages every 2.5 seconds.
	 */
	DEFAULT_SAY_HELLO_INTERVAL: 2500,
	/**
	 * @member {Number} DEFAULT_RECONCILE_INTERVAL
	 * By default we check every 2.5 seconds how long it has been
	 * since the last time each known scout transmitted a hello message.
	 * This works in conjuction with the DEFAULT_TIMEOUT.
	 * We must reconcile more often if we require a shorter scout timeout.
	 */
	DEFAULT_RECONCILE_INTERVAL: 2500,
	/**
	 * @member {Number} DEFAULT_TIMEOUT
	 * By default we assume a scout is offline if they have not
	 * send a hello message for at least 5 seconds.
	 */
	DEFAULT_TIMEOUT: 5000,
	/**
	 * @member {Number} DEFAULT_PORT
	 * When you select an UDP port, select an available 16-bit integer from the 
	 * available ports in the private range 49152 to 65535.
	 * At the time of writing the port is set to 53876.
	 */
	DEFAULT_PORT: 53876,
	/**
	 * @member {Boolean} DEFAULT_IGNORE_PARENT_PROCESS
	 * A parent process may initiate multiple microservices. Each microservice
	 * will have their own scout. It is possible a process may start both
	 * a consumer and a compatible producer. Therefor we do not ignore scouts from
	 * microservices which share the same parent process.
	 */
	DEFAULT_IGNORE_PARENT_PROCESS: false,
	/**
	 * @member {Boolean} DEFAULT_IGNORE_OURSELVES
	 * There hardly is a need for scouts to act on and forward hello messages from
	 * themselves. This may be useful for debugging purposes, but otherwise 
	 * we should ignore ourselves.
	 */
	DEFAULT_IGNORE_OURSELVES: true,
	/**
	 * @member {module:dxp3-logging/Level} DEFAULT_LOG_LEVEL
	 * Speaks for itself.
	 */
	DEFAULT_LOG_LEVEL: logging.Level.WARN,
	/**
	 * @member {String} DEFAULT_ENCRYPTION_KEY
	 * By default we have some rudimentary security by using a default
	 * encryption key.
	 */
	DEFAULT_ENCRYPTION_KEY: 'dxp3-microservice/Scout'
}
// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
	util.Help.print();
	return;
}
module.exports = ScoutDefaults;