const packageName = 'dxp3-net-tcp';
const moduleName = 'TCPSocketPoolEvent';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
// Check if someone tried to run/execute this file.
const util = require('dxp3-util');
if(util.Assert.isFileToExecute(canonicalName)) {
    util.Help.print();
    return;
}
/**
 * @module dxp3-net-tcp/TCPSocketPoolEvent
 */
const TCPSocketPoolEvent = {
	CLOSED: 'Closed',
	CLOSING: 'Closing',	
	CONNECTED: 'Connected',
	CONNECTING: 'Connecting',
	ERROR: 'Error',
	SOCKET_ACQUIRED: 'Socket acquired',
	SOCKET_CLOSED: 'Socket closed',
	SOCKET_ERROR: 'Socket error',
	SOCKET_RELEASED: 'Socket released',
	SOCKET_TIMEOUT: 'Socket timeout'
}

module.exports = TCPSocketPoolEvent;