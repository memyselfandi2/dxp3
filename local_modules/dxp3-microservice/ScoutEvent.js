const MicroServiceError = require('./MicroServiceError');

const ScoutEvent = {
	FOUND_SCOUT: 'Found scout',
	LOST_SCOUT: 'Lost scout',
	PAUSED: 'Paused',
	PAUSING: 'Pausing',
	RUNNING: 'Running',
	STARTING: 'Starting',
	STOPPED: 'Stopped',
	STOPPING: 'Stopping',
	parse: function(scoutEventAsString) {
		if(scoutEventAsString === undefined || scoutEventAsString === null) {
			throw MicroServiceError.ILLEGAL_ARGUMENT;
		}
		if(typeof scoutEventAsString != 'string') {
			throw MicroServiceError.ILLEGAL_ARGUMENT;
		}
		scoutEventAsString = scoutEventAsString.trim();
		if(scoutEventAsString.length <= 0) {
			throw MicroServiceError.ILLEGAL_ARGUMENT;
		}
		scoutEventAsString = scoutEventAsString.toUpperCase();
		switch(scoutModeAsString) {
			case 'FOUNDSCOUT':
			case 'FOUND-SCOUT':
			case 'FOUND_SCOUT':
			case 'FOUND SCOUT':
				return ScoutEvent.FOUND_SCOUT;
			case 'LOSTSCOUT':
			case 'LOST-SCOUT':
			case 'LOST_SCOUT':
			case 'LOST SCOUT':
				return ScoutEvent.LOST_SCOUT;
			case 'PAUSED':
				return ScoutEvent.PAUSED;
			case 'PAUSING':
				return ScoutEvent.PAUSING;
			case 'RUNNING':
				return ScoutEvent.RUNNING;
			case 'STARTING':
				return ScoutEvent.STARTING;
			case 'STOPPED':
				return ScoutEvent.STOPPED;
			case 'STOPPING':
				return ScoutEvent.STOPPING;
			default:
				throw MicroServiceError.ILLEGAL_ARGUMENT;
		}
	}
}

module.exports = ScoutEvent;