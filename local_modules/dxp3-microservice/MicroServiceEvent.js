/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-microservice
 *
 * NAME
 * MicroServiceEvent
 */
const packageName = 'dxp3-microservice';
const moduleName = 'MicroServiceEvent';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
// Check if someone tried to run/execute this file.
const util = require('dxp3-util');
if(util.Assert.isFileToExecute(canonicalName)) {
	util.Help.print();
	return;
}
/**
 * @module dxp3-microservice/MicroServiceEvent
 */
const MicroServiceEvent = {
	ERROR: 'Error',
	FOUND_CONSUMER: 'Found consumer',
	FOUND_PRODUCER: 'Found producer',
	LOST_CONSUMER: 'Lost consumer',
	LOST_PRODUCER: 'Lost producer',
	PAUSED: 'Paused',
	PAUSING: 'Pausing',
	RUNNING: 'Running',
	STARTING: 'Starting',
	STOPPED: 'Stopped',
	STOPPING: 'Stopping',
	is(microServiceEvent) {
		if(microServiceEvent === undefined || microServiceEvent === null) {
			return false;
		}
		if(typeof microServiceEvent != 'string') {
			return false;
		}
		microServiceEvent = microServiceEvent.trim();
		if(microServiceEvent.length <= 0) {
			return false;
		}
		microServiceEvent = microServiceEvent.toUpperCase();
		switch(microServiceEvent) {
			case 'ERROR':
			case 'FOUND CONSUMER':
			case 'FOUND PRODUCER':
			case 'LOST CONSUMER':
			case 'LOST PRODUCER':
			case 'PAUSED':
			case 'PAUSING':
			case 'RUNNING':
			case 'STARTING':
			case 'STOPPED':
			case 'STOPPING':
				return true;
			default:
				return false;
		}
	}
}

module.exports = MicroServiceEvent;