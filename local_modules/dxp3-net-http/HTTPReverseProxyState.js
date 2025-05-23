/**
 * DXP3 - Digital Experience Platform 3<br/>
 * <br/>
 * PACKAGE<br/>
 * dxp3-net-http<br/>
 * <br/>
 * NAME<br/>
 * HTTPReverseProxyStates<br/>
 * <br/>
 * DESCRIPTION<br/>
 * A collection of different states a HTTPReverseProxy can be in.
 *
 * @module dxp3-net-http/HTTPReverseProxyStates
 */
const packageName = 'dxp3-net-http';
const moduleName = 'HTTPReverseProxyStates';
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
const HTTPReverseProxyStates = {
	INITIALIZED: 'Initialized',
	RUNNING: 'Running',
	STARTING: 'Starting',
	STOPPED: 'Stopped',
	STOPPING: 'Stopping'
}

module.exports = HTTPReverseProxyStates;