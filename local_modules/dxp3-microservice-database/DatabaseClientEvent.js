const packageName = 'dxp3-microservice-database';
const moduleName = 'DatabaseClientEvent';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
// Check if someone tried to run/execute this file.
const util = require('dxp3-util');
if(util.Assert.isFileToExecute(canonicalName)) {
	util.Help.print();
	return;
}
const rest = require('dxp3-microservice-rest');

const DatabaseClientEvent = {
	CLOSED: rest.RestClientEvent.CLOSED,
	CONNECTED: rest.RestClientEvent.CONNECTED,
	ERROR: rest.RestClientEvent.ERROR,
	QUEUING: rest.RestClientEvent.QUEUING,
	RUNNING: rest.MicroServiceEvent.RUNNING,
	STARTING: rest.MicroServiceEvent.STARTING,
	STOPPED: rest.MicroServiceEvent.STOPPED,
	STOPPING: rest.MicroServiceEvent.STOPPING
}

module.exports = DatabaseClientEvent;