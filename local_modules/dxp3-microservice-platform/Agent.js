/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-microservice-platform
 *
 * NAME
 * Agent
 */
const packageName = 'dxp3-microservice-platform';
const moduleName = 'Agent';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * @module dxp3-microservice-platform/Agent
 */
const AgentOptions = require('./AgentOptions');
const logging = require('dxp3-logging');
const microservice = require('dxp3-microservice');
const util = require('dxp3-util');

const logger = logging.getLogger(canonicalName);

class Agent extends microservice.MicroService {
    /*********************************************
     * CONSTRUCTOR
     ********************************************/

	/**
 	 * @param {Object} _options
 	 *
	 * @param {String} _options.name
	 * An (optional) name. If ommitted the name will use the hostname of the machine this agent
	 * is running on.
 	 */
	constructor(_options) {
		// Defensive programming...check input...
		if(_options === undefined || _options === null) {
			_options = {};
		}
		// Next we parse the supplied arguments. This will fill in any missing properties with
		// their respective default value.
		_options = AgentOptions.parse(_options);
		logger.info('Name: ' + _options.name);
		// Now we are ready to call our MicroService super constructor.
		// Forward any required and optional argument properties (like name, port, produces, etc.).
		let microServiceOptions = {
			name: _options.name,
			port: _options.port,
			produces: _options.produces
		};
		super(microServiceOptions);
	}

	/**
	 * @override
	 * @throws {MicroServiceError.ILLEGAL_ARGUMENT}
	 */
	pausing(_callback) {
		// Defensive programming...check input...
		if(_callback === undefined || _callback === null) {
			throw MicroServiceError.ILLEGAL_ARGUMENT;
		}
		return _callback();
	}

	/**
	 * @override
	 * @throws {MicroServiceError.ILLEGAL_ARGUMENT}
	 */
	starting(_callback) {
		// Defensive programming...check input...
		if(_callback === undefined || _callback === null) {
			throw MicroServiceError.ILLEGAL_ARGUMENT;
		}
		return _callback();
	}

	/**
	 * @override
	 * @throws {MicroServiceError.ILLEGAL_ARGUMENT}
	 */
	stopping(_callback) {
		// Defensive programming...check input...
		if(_callback === undefined || _callback === null) {
			throw MicroServiceError.ILLEGAL_ARGUMENT;
		}
		return _callback();
	}

	static main() {
		try {
			let agentOptions = AgentOptions.parseCommandLine();
			logging.setLevel(agentOptions.logLevel);
			if(agentOptions.help) {
				util.Help.print(Agent);
				return;
			}
			let agent = new Agent(agentOptions);
			agent.on(microservice.MicroServiceEvent.ERROR, (_error) => {
				console.log('Agent error: ' + _error.message);
			});
			agent.on(microservice.MicroServiceEvent.RUNNING, () => {
				console.log('To get help include the -help option:');
				console.log('node Agent -help');
				console.log('');
				console.log('Agent \'' + agent.name + '\' running at port ' + webServer.port);
			});
			agent.start();
		} catch(_exception) {
			console.log('EXCEPTION: ' + _exception.code + ': ' + _exception.message);
		}
	}
}
// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
   Agent.main();
   return;
}
module.exports = Agent;