const packageName = 'dxp3-microservice-rest';
const moduleName = 'RestClientEvent';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
// Check if someone tried to run/execute this file.
const util = require('dxp3-util');
if(util.Assert.isFileToExecute(canonicalName)) {
	util.Help.print();
	return;
}

const RestClientEvent = {
	CLOSED: 'Closed',
	CLOSING: 'Closing',
	CONNECTED: 'Connected',
	CONNECTING: 'Connecting',
	ERROR: 'Error',
	QUEUING: 'Queuing'
}

module.exports = RestClientEvent;