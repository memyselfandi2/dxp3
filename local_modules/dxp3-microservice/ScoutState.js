const MicroServiceError = require('./MicroServiceError');

const ScoutState = {
	INITIALIZED: 'Initialized',
	PAUSED: 'Paused',
	RUNNING: 'Running',
	STARTING: 'Starting',
	STOPPED: 'Stopped',
	STOPPING: 'Stopping',
	parse: function(scoutStateAsString) {
		if(scoutStateAsString === undefined || scoutStateAsString === null) {
			throw MicroServiceError.ILLEGAL_ARGUMENT;
		}
		if(typeof scoutStateAsString != 'string') {
			throw MicroServiceError.ILLEGAL_ARGUMENT;
		}
		scoutStateAsString = scoutStateAsString.trim();
		if(scoutStateAsString.length <= 0) {
			throw MicroServiceError.ILLEGAL_ARGUMENT;
		}
		scoutStateAsString = scoutStateAsString.toLowerCase();
		switch(scoutStateAsString) {
			case 'initialized':
				return ScoutState.INITIALIZED;
			case 'paused':
				return ScoutState.PAUSED;
			case 'running':
				return ScoutState.RUNNING;
			case 'starting':
				return ScoutState.STARTING;
			case 'stopped':
				return ScoutState.STOPPED;
			case 'stopping':
				return ScoutState.STOPPING;
			default:
				throw MicroServiceError.ILLEGAL_ARGUMENT;
		}
	}
}

module.exports = ScoutState;