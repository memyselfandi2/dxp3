/**
 * DXP3 - Digital Experience Platform 3<br/>
 * <br/>
 * PACKAGE<br/>
 * dxp3-net-http<br/>
 * <br/>
 * NAME<br/>
 * HTTPReverseProxyEvent<br/>
 * <br/>
 * DESCRIPTION<br/>
 * A collection of different events a HTTPReverseProxy may fire.
 *
 * @module dxp3-net-http/HTTPReverseProxyEvent
 */
const packageName = 'dxp3-net-http';
const moduleName = 'HTTPReverseProxyEvent';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
// Check if someone tried to run/execute this file.
const util = require('dxp3-util');
if(util.Assert.isFileToExecute(canonicalName)) {
    util.Help.print();
    return;
}
/**
 * @enum {String}
 * @readonly
 */
const HTTPReverseProxyEvent = {
	/** @event module:dxp3-net/HTTPReverseProxyEvent#ADDED_CLIENT */
	ADDED_CLIENT: 'Added client',
	/** @event module:dxp3-net/HTTPReverseProxyEvent#DATA */
	DATA: 'Data',
	/** @event module:dxp3-net/HTTPReverseProxyEvent#ERROR */
	ERROR: 'Error',
	/** @event module:dxp3-net/HTTPReverseProxyEvent#CLOSED_CLIENT */
	CLOSED_CLIENT: 'Closed client',
	/** @event module:dxp3-net/HTTPReverseProxyEvent#RUNNING */
	RUNNING: 'Running',
	/** @event module:dxp3-net/HTTPReverseProxyEvent#STARTING */
	STARTING: 'Starting',
	/** @event module:dxp3-net/HTTPReverseProxyEvent#STOPPED */
	STOPPED: 'Stopped',
	/** @event module:dxp3-net/HTTPReverseProxyEvent#STOPPING */
	STOPPING: 'Stopping'
};

module.exports = HTTPReverseProxyEvent;