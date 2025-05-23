/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-microservice
 *
 * NAME
 * MicroService
 */
const packageName = 'dxp3-microservice';
const moduleName = 'MicroService';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
// Check if someone tried to run/execute this file.
const util = require('dxp3-util');
if(util.Assert.isFileToExecute(canonicalName)) {
	util.Help.print();
	return;
}
// Best next thing: logging.
const logging = require('dxp3-logging');
const logger = logging.getLogger(canonicalName);
// Micro services emit events.
const EventEmitter = require('events');
const MicroServiceOptions = require('./MicroServiceOptions');
const MicroServiceDefinition = require('./MicroServiceDefinition');
const MicroServiceError = require('./MicroServiceError');
const MicroServiceEvent = require('./MicroServiceEvent');
const MicroServiceState = require('./MicroServiceState');
const MicroServiceType = require('./MicroServiceType');
const Scout = require('./Scout');
const ScoutEvent = require('./ScoutEvent');
/**
 * Microservices - also known as the microservice architecture - is an architectural style that
 * structures an application as a collection of services that are:<br/>
 * <ul>
 * <li>Highly maintainable and testable</li>
 * <li>Loosely coupled</li>
 * <li>Independently deployable</li>
 * <li>Organized around business capabilities</li>
 * <li>Owned by a small team</li>
 * </ul>
 * The microservice architecture enables the rapid, frequent and reliable delivery of large,
 * complex applications. It also enables an organization to evolve its technology stack.
 *
 * @example
 * let microservice = require('dxp3-microservice');
 */
class MicroService extends EventEmitter {
	/**
	 * @param {MicroServiceOptions|Object} _options
	 *
	 * @param {String} _options.name
	 * A mandatory (not undefined, not null and not empty) name. This will be forced to lower case.
	 *
	 * @param {Array|String} _options.produces
	 * An optional list of subjects this micro service serves. Typically used for data producers like web servers.
	 * Even though it is optional it really does not make sense for a micro service to neither be a consumer nor producer.
	 * Note that this can be an array or a comma separated values string.
	 *
	 * @param {Array|String} _options.consumes
	 * An optional list of subjects this micro service needs. Typically used for data consumers like rest clients.
	 * Even though it is optional it really does not make sense for a micro service to neither be a consumer nor producer.
	 * Note that this can be an array or a comma separated values string.
	 *
	 * @param {Number|String} _options.port
	 *
 	 * @throws {MicroServiceError.ILLEGAL_ARGUMENT} When name is undefined, null, whitespace or empty.
 	 */
	constructor(_options) {
		// Defensive programming...check input...
		if(_options === undefined || _options === null) {
			logger.warn('Unable to construct a MicroService with undefined or null arguments.');
			throw MicroServiceError.ILLEGAL_ARGUMENT;
		}
		// Call our super class constructor.
		super();
		// Parse and validate our arguments and store a reference in this._options.
		this._options = MicroServiceOptions.create(_options);
		this.definition = new MicroServiceDefinition();
		let name = this._options.name;
		// name must be defined and not null.
		if(name === undefined || name === null) {
			logger.warn('Unable to construct a MicroService with undefined or null name.');
			throw MicroServiceError.ILLEGAL_ARGUMENT;
		}
		// name must be a string.
		if(typeof name != 'string') {
			logger.warn('Unable to construct a MicroService with a non-string name.');
			throw MicroServiceError.ILLEGAL_ARGUMENT;
		}
		// name can not be empty.
		name = name.trim();
		if(name.length <= 0) {
			logger.warn('Unable to construct a MicroService with an empty name.');
			throw MicroServiceError.ILLEGAL_ARGUMENT;
		}
		// Force the name to be lower case.
		name = name.toLowerCase();
		this.definition.name = name;
		// Calling the consumes setter will clean up each consumption, force it to lowercase
		// and add them to our this.definition MicroServiceDefinition.
		this.consumes = this._options.consumes;
		// Calling the produces setter will clean up each product, force it to lowercase
		// and add them to our this.definition MicroServiceDefinition.
		this.produces = this._options.produces;
		// The type of micro service must be implemented by the implementor/subclass by
		// overriding the get type() method.
		this.definition.type = this.type;
		// Not every microservice has a port (realistically only producers need a port).
		// Our MicroServiceOptions class will have at least set a default.
		this.definition.port = this._options.port;
		// The settings property is optional.
		this.definition.settings = this._options.settings;
		// We keep an active list of compatible producers and consumers based on their type
		// and our compatibleTypes property. 
		this.compatibleProducers = new Map();
		this.compatibleConsumers = new Map();
		this.scout = new Scout({microService: this});
		// Lets define our scout event handlers.
		this.scoutFoundScoutHandler = (otherScout) => {
			// If our scout found another scout we need to determine if this microservice
			// is compatible with us.
			let otherScoutType = otherScout.type;
			if(otherScoutType === undefined || otherScoutType === null) {
				return;
			}
			if(typeof otherScoutType != 'string') {
				return;
			}
			otherScoutType = otherScoutType.trim();
			if(otherScoutType.length <= 0) {
				return;
			}
			otherScoutType = otherScoutType.toUpperCase();
			if(!this.compatibleTypes.includes(otherScoutType)) {
				// Maybe it is a monitor.
				if(otherScoutType === MicroServiceType.MONITOR) {
					
				}
				return;
			}
			let otherScoutProduces = otherScout.produces;
			if(otherScoutProduces === undefined || otherScoutProduces === null) {
				otherScoutProduces = [];
			}
			if(typeof otherScoutProduces === 'string') {
				otherScoutProduces = otherScoutProduces.split(',');
			}
			let otherScoutConsumes = otherScout.consumes;
			if(otherScoutConsumes === undefined || otherScoutConsumes === null) {
				otherScoutConsumes = [];
			}
			if(typeof otherScoutConsumes === 'string') {
				otherScoutConsumes = otherScoutConsumes.split(',');
			}
			let compatibleProduction = [];
			for(let i=0;i < otherScoutProduces.length;i++) {
				let production = otherScoutProduces[i];
				if(this.definition.consumes.includes(production)) {
					compatibleProduction.push(production);
				}
			}
			let compatibleConsumption = [];
			for(let i=0;i < otherScoutConsumes.length;i++) {
				let consumption = otherScoutConsumes[i];
				if(this.definition.produces.includes(consumption)) {
					compatibleConsumption.push(consumption);
				}
			}
			if((compatibleProduction.length <= 0) && (compatibleConsumption.length <= 0)) {
				return;
			}
			let compatibleMicroServiceDefinition = new MicroServiceDefinition();
			compatibleMicroServiceDefinition.id = otherScout.id;
			compatibleMicroServiceDefinition.address = otherScout.address;
			compatibleMicroServiceDefinition.port = otherScout.port;
			compatibleMicroServiceDefinition.type = otherScout.type;
			compatibleMicroServiceDefinition.settings = otherScout.settings;
			compatibleMicroServiceDefinition.produces = compatibleProduction;
			compatibleMicroServiceDefinition.consumes = compatibleConsumption;
			if(compatibleProduction.length > 0) {
				logger.info('Found compatible \'' + otherScout.type + '\' producer of \'' + compatibleProduction + '\' with ID \'' + otherScout.id + '\' located at ' + otherScout.address + ':' + otherScout.port );
				this.compatibleProducers.set(otherScout.id, compatibleMicroServiceDefinition);
				this.addCompatibleProducer(otherScout.id, compatibleMicroServiceDefinition);
				this.emit(MicroServiceEvent.FOUND_PRODUCER, otherScout.id, compatibleMicroServiceDefinition);
			}
			if(compatibleConsumption.length > 0) {
				logger.info('Found compatible \'' + otherScout.type + '\' consumer of \'' + compatibleConsumption + '\' with ID \'' + otherScout.id + '\' located at ' + otherScout.address + ':' + otherScout.port);
				this.compatibleConsumers.set(otherScout.id, compatibleMicroServiceDefinition);
				this.addCompatibleConsumer(otherScout.id, compatibleMicroServiceDefinition);
				this.emit(MicroServiceEvent.FOUND_CONSUMER, otherScout.id, compatibleMicroServiceDefinition);
			}
		};
		this.scoutHeardHelloHandler = () => {
		};
		this.scoutLostScoutHandler = (otherScout) => {
			// Defensive programming...check input...
			if(otherScout === undefined || otherScout === null) {
				return;
			}
			// We only care about losing micro services we are compatible with.
			let compatibleProducer = this.compatibleProducers.get(otherScout.id);
			if(compatibleProducer != undefined && compatibleProducer != null) {
				this.compatibleProducers.delete(otherScout.id);
				logger.info('Lost compatible \'' + otherScout.type + '\' producer with ID \'' + otherScout.id + '\' at ' + otherScout.address + ':' + otherScout.port);
				this.deleteCompatibleProducer(otherScout.id, compatibleProducer);
				this.emit(MicroServiceEvent.LOST_PRODUCER, otherScout.id, compatibleProducer);
			}
			let compatibleConsumer = this.compatibleConsumers.get(otherScout.id);
			if(compatibleConsumer != undefined && compatibleConsumer != null) {
				this.compatibleConsumers.delete(otherScout.id);
				logger.info('Lost compatible \'' + otherScout.type + '\' consumer with ID \'' + otherScout.id + '\' at ' + otherScout.address + ':' + otherScout.port);
				this.deleteCompatibleConsumer(otherScout.id, compatibleConsumer);
				this.emit(MicroServiceEvent.LOST_CONSUMER, otherScout.id, compatibleConsumer);
			}
		};
		this.scoutPausedHandler = () => {
			// When our scout is paused it means we are paused.
			this.state = MicroServiceState.PAUSED;
			// Let anyone who is interested know that we are paused.
			logger.debug('Paused');
			this.emit(MicroServiceEvent.PAUSED);
		};
		this.scoutPausingHandler = () => {
		};
		this.scoutRunningHandler = () => {
			// When our scout is running it means we have started successfully.
			// Set our state to RUNNING.
			this.state = MicroServiceState.RUNNING;
			// Let anyone who is interested know that we are up and running.
			logger.debug('Running');
			this.emit(MicroServiceEvent.RUNNING);
		};
		this.scoutSaidHelloHandler = () => {
		};
		this.scoutStartingHandler = () => {
		};
		this.scoutStoppedHandler = () => {
			// When our scout is stopped, we are stopped.
			this.state = MicroServiceState.STOPPED;
			this.compatibleConsumers.clear();
			this.compatibleProducers.clear();
			// Let anyone who is interested know that we have stopped.
			logger.debug('Stopped');
			this.emit(MicroServiceEvent.STOPPED);
		};
		this.scoutStoppingHandler = () => {
		};
		this.scout.on(ScoutEvent.FOUND_SCOUT, this.scoutFoundScoutHandler);
		this.scout.on(ScoutEvent.HEARD_HELLO, this.scoutHeardHelloHandler);
		this.scout.on(ScoutEvent.LOST_SCOUT, this.scoutLostScoutHandler);
		this.scout.on(ScoutEvent.PAUSED, this.scoutPausedHandler);
		this.scout.on(ScoutEvent.PAUSING, this.scoutPausingHandler);
		this.scout.on(ScoutEvent.SAID_HELLO, this.scoutSaidHelloHandler);
		this.scout.on(ScoutEvent.RUNNING, this.scoutRunningHandler);
		this.scout.on(ScoutEvent.STARTING, this.scoutStartingHandler);
		this.scout.on(ScoutEvent.STOPPED, this.scoutStoppedHandler);
		this.scout.on(ScoutEvent.STOPPING, this.scoutStoppingHandler);
		this.state = MicroServiceState.INITIALIZED;
	}

	// TO BE OVERRIDDEN
	addCompatibleConsumer(id, microServiceDefinition) {
		throw MicroServiceError.NOT_IMPLEMENTED;
	}

	addCompatibleProducer(id, microServiceDefinition) {
		throw MicroServiceError.NOT_IMPLEMENTED;
	}

	// TO BE OVERRIDDEN
	deleteCompatibleConsumer(id, microServiceDefinition) {
		throw MicroServiceError.NOT_IMPLEMENTED;
	}

	// TO BE OVERRIDDEN
	deleteCompatibleProducer(id, microServiceDefinition) {
		throw MicroServiceError.NOT_IMPLEMENTED;
	}

	// Alias of isStopped()
	hasStopped() {
		return this.isStopped();
	}

	isStopped() {
		if(this.state === MicroServiceState.INITIALIZED) {
			return true;
		}
		if(this.state === MicroServiceState.PAUSED) {
			return true;
		}
		if(this.state === MicroServiceState.STOPPED) {
			return true;
		}
		return false;
	}

	isRunning() {
		if(this.state === MicroServiceState.RUNNING) {
			return true;
		}
		return false;
	}

	/**
	 * Pausing a microservice effectively stops it from serving clients or sending requests.
	 * However, the difference between stopping and pausing, is that we still listen for and act upon
	 * other microservices coming and going.
	 * @throws {MicroServiceError.ILLEGAL_STATE} When the microservice is already paused or pausing.
	 */
	pause() {
		// No point in pausing if we are already paused or are in the process
		// of pausing.
		if((this.state === MicroServiceState.PAUSED) ||
		   (this.state === MicroServiceState.PAUSING)) {
		   	// Initially we threw an illegal state exception, but we deem that to harsh.
			// There really is no problem with calling pause again if we are already pausing or paused.
		   	return;
		}
		// If we are INITIALIZED, we can go directly to paused.
		if(this.state === MicroServiceState.INITIALIZED) {
			// Set our state to PAUSED.
			this.state = MicroServiceState.PAUSED;
			// Let anyone who is interested know that we are paused.
			logger.debug('Paused');
			this.emit(MicroServiceEvent.PAUSED);
			return;
		}
		// No point in pausing if we are not running.
		if(this.state != MicroServiceState.RUNNING) {
			logger.warn('Attempting to pause a microservice that is not running.')
			throw MicroServiceError.ILLEGAL_STATE;
		}
		// Set our state to PAUSING.
		this.state = MicroServiceState.PAUSING;
		// Let anyone who is interested know that we are pausing.
		logger.debug('Pausing');
		this.emit(MicroServiceEvent.PAUSING);
		this.pausing((_error) => {
			// Pause our scout.
			this.scout.pause();
		});
	}

	// TO BE OVERRIDEN
	pausing(callback) {
		return callback();
	}

	/**
	 * Call this to start this microservice.
	 * @throws {MicroServiceError.ILLEGAL_STATE} when the MicroService is in the middle of pausing or stopping.
	 */
	start() {
		// No point in starting if we are already running or
		// are starting.
		if((this.state === MicroServiceState.RUNNING) ||
		   (this.state === MicroServiceState.STARTING)) {
		   	// Initially we threw an illegal state exception, but we deem that to harsh.
			// There really is no problem with calling start again if we are already starting or running. 
		   	return;
		}
		// If we are in the process of pausing, we'll have to wait until
		// we have completely paused before we can start again.
		if(this.state === MicroServiceState.PAUSING) {
		   	throw MicroServiceError.ILLEGAL_STATE;
		}
		// If we are in the process of stopping, we'll have to wait until
		// we have completely stopped before we can start again.
		if(this.state === MicroServiceState.STOPPING) {
		   	throw MicroServiceError.ILLEGAL_STATE;
		}
		// If we made it this far, it means we are either initialized,
		// paused or stopped. Set our state to STARTING.
		this.state = MicroServiceState.STARTING;
		// Let anyone who is interested know that we are starting.
		logger.debug('Starting');
		this.emit(MicroServiceEvent.STARTING);
		this.starting((_error) => {
			if((_error != undefined) && (_error != null)) {
				// If there was an error, we immediately stop
				this.state = MicroServiceState.STOPPED;
				// Let anyone who is interested know that we are stopped.
				logger.debug('Stopped');
				this.emit(MicroServiceEvent.STOPPED);
				return;
			}
			logger.info('Type    : ' + this.definition.type);
			logger.info('Name    : ' + this.definition.name);
			logger.info('Produces: ' + this.definition.produces);
			logger.info('Consumes: ' + this.definition.consumes);
			logger.info('Port    : ' + this.definition.port);
			// Now that any prerequisites are fullfilled and we are
			// ready to send or fullfill requests, we can start our scout.
			this.scout.start();
		});
	}

	// TO BE OVERRIDEN
	starting(callback) {
		// Defensive programming...check input...
		if(callback === undefined || callback === null) {
			return;
		}
		if(typeof callback != 'function') {
			return;
		}
		return callback();
	}

	/**
	 * Call this to stop this microservice.
	 * @throws {MicroServiceError.ILLEGAL_STATE} when the MicroService is already stopped or is in the middle of stopping.
	 */
	stop() {
		// No point in stopping if we have already stopped or
		// are in the process of stopping.
		if((this.state === MicroServiceState.STOPPED) ||
		   (this.state === MicroServiceState.STOPPING)) {
		   	// Initially we threw an illegal state exception, but we deem that to harsh.
			// There really is no problem with calling stop again if we are stopping or have already stopped. 
		   	return;
		}
		// If we are INITIALIZED, we can go directly to stopped.
		if(this.state === MicroServiceState.INITIALIZED) {
			// Set our state to STOPPED.
			this.state = MicroServiceState.STOPPED;
			// Let anyone who is interested know that we are stopped.
			logger.debug('Stopped');
			this.emit(MicroServiceEvent.STOPPED);
			return;
		}
		// If we are in the process of pausing, we'll have to wait until
		// we are paused before we can stop.
		if(this.state === MicroServiceState.PAUSING) {
		   	throw MicroServiceError.ILLEGAL_STATE;
		}
		// If we are in the process of starting, we'll have to wait until
		// we are running before we can stop.
		if(this.state === MicroServiceState.STARTING) {
		   	throw MicroServiceError.ILLEGAL_STATE;
		}
		// Set our state to STOPPING.
		this.state = MicroServiceState.STOPPING;
		logger.debug('Stopping');
		this.emit(MicroServiceEvent.STOPPING);
		this.stopping((_error) => {
			this.scout.stop();
		});
	}

	// TO BE OVERRIDEN
	stopping(callback) {
		// Defensive programming...check input...
		if(callback === undefined || callback === null) {
			return;
		}
		if(typeof callback != 'function') {
			return;
		}
		return callback();
	}

	/*******************************************
	 * GETTERS                                 *
	 ******************************************/

	/**
	 * Retrieve the current state of the MicroService.
	 * @returns {module:dxp3-net/MicroServiceState}
	 */
	getState() {
		return this.state;
	}

	// TO BE OVERRIDDEN
	get type() {
		throw MicroServiceError.NOT_IMPLEMENTED;
	}

	// TO BE OVERRIDDEN
	get compatibleTypes() {
		throw MicroServiceError.NOT_IMPLEMENTED;
	}

	getPort() {
		return this.port;
	}

	get port() {
		return this.definition.port;
	}

	setPort(_port) {
		this.port = _port;
	}

	set port(port) {
		if(this.definition.port === port) {
			return;
		}
		this.definition.port = port;
	}

	/**
	 * Alias for addProductions(...).
	 */
	addProduces(productions) {
		this.addProductions(productions);
	}
	/**
	 * Alias of addProductions(...).
	 */
	addProduct(products) {
		this.addProductions(products);
	}
	/**
	 * Alias of addProductions(...).
	 */
	addProducts(products) {
		this.addProductions(products);
	}
	/**
	 * Alias of addProductions(...).
	 */
	addProduction(productions) {
		this.addProductions(productions);
	}

	addProductions(productions) {
		if(productions === undefined || productions === null) {
			return;
		}
		if(typeof productions === 'string') {
			productions = productions.trim();
			productions = productions.split(',');
		}
		if(!Array.isArray(productions)) {
			return;
		}
		// Productions must be an array by now.
		// Make sure each production is not undefined, not null and not empty.
		// Productions are forced to lower case.
		for(let i=0;i < productions.length;i++) {
			let production = productions[i];
			if(production === null) {
				continue;
			}
			if(typeof production != 'string') {
				continue;
			}
			production = production.trim();
			if(production.length <= 0) {
				continue;
			}
			production = production.toLowerCase();
			// Lets make sure our produces list is a set.
			let indexOf = this.definition.produces.indexOf(production);
			if(indexOf < 0) {
				this.definition.produces.push(production);
			}
		}
	}
	/**
	 * Alias for addConsumptions(...).
	 */
	addConsumes(consumptions) {
		this.addConsumptions(consumptions);
	}
	/**
	 * Alias for addConsumptions(...).
	 */
	addConsumption(consumptions) {
		this.addConsumptions(consumptions);
	}

	addConsumptions(consumptions) {
		// Defensive programming...check input...
		if(consumptions === undefined || consumptions === null) {
			return;
		}
		if(typeof consumptions === 'string') {
			consumptions = consumptions.trim();
			consumptions = consumptions.split(',');
		}
		// By now the consumptions parameter should be an array.
		// If it is not an array we give up and return.
		if(!Array.isArray(consumptions)) {
			return;
		}
		// Make sure each consumption is not undefined, not null and not empty.
		// Consumptions are forced to lower case.
		for(let i=0;i < consumptions.length;i++) {
			let consumption = consumptions[i];
			if(consumption === null) {
				continue;
			}
			if(typeof consumption != 'string') {
				continue;
			}
			consumption = consumption.trim();
			if(consumption.length <= 0) {
				continue;
			}
			consumption = consumption.toLowerCase();
			// Lets make sure our consumes list is a set.
			let indexOf = this.definition.consumes.indexOf(consumption);
			if(indexOf < 0) {
				this.definition.consumes.push(consumption);
			}
		}
	}
	get name() {
		return this.definition.name;
	}
	
	/**
	 * Alias for getting the produces property.
	 */
	get product() {
		return this.produces;
	}
	/**
	 * Alias for getting the produces property.
	 */
	get products() {
		return this.produces;
	}
	/**
	 * Alias for getting the produces property.
	 */
	get production() {
		return this.produces;
	}
	/**
	 * Alias for getting the produces property.
	 */
	get productions() {
		return this.produces;
	}

	get produces() {
		return this.definition.produces;
	}
	/**
	 * Alias for getting the consumes property.
	 */
	get consumption() {
		return this.consumes;
	}
	/**
	 * Alias for getting the consumes property.
	 */
	get consumptions() {
		return this.consumes;
	}

	get consumes() {
		return this.definition.consumes;
	}
	/**
	 * Alias for setting the consumes property.
	 */
	set consumption(consumptions) {
		this.consumes = consumptions;
	}
	/**
	 * Alias for setting the consumes property.
	 */
	set consumptions(consumptions) {
		this.consumes = consumptions;
	}

	set consumes(consumptions) {
		if(consumptions === undefined || consumptions === null) {
			consumptions = [];
		}
		if(typeof consumptions === 'string') {
			consumptions = consumptions.trim();
			consumptions = consumptions.split(',');
		}
		if(!Array.isArray(consumptions)) {
			logger.warn('set consumes(consumptions) only accepts a comma separated values list or a String array.');
			throw MicroService.ILLEGAL_ARGUMENT;
		}
		// Consumptions must be an array by now.
		// Make sure each consumption is not undefined, not null and not empty.
		// Consumptions are forced to lower case.
		this.definition.consumes = [];
		for(let i=0;i < consumptions.length;i++) {
			let consumption = consumptions[i];
			if(consumption === undefined || consumption === null) {
				continue;
			}
			if(typeof consumption != 'string') {
				continue;
			}
			consumption = consumption.trim();
			if(consumption.length <= 0) {
				continue;
			}
			consumption = consumption.toLowerCase();
			// Lets make sure our consumes list is a set.
			let indexOf = this.definition.consumes.indexOf(consumption);
			if(indexOf < 0) {
				this.definition.consumes.push(consumption);
			}
		}
	}
	/**
	 * Alias for setting the produces property.
	 */
	set product(products) {
		this.produces = products;
	}
	/**
	 * Alias for setting the produces property.
	 */
	set products(products) {
		this.produces = products;
	}
	/**
	 * Alias for setting the produces property.
	 */
	set production(productions) {
		this.produces = productions;
	}
	/**
	 * Alias for setting the produces property.
	 */
	set productions(productions) {
		this.produces = productions;
	}

	set produces(productions) {
		if(productions === undefined || productions === null) {
			productions = [];
		}
		if(typeof productions === 'string') {
			productions = productions.trim();
			productions = productions.split(',');
		}
		if(!Array.isArray(productions)) {
			logger.warn('set produces(productions) only accepts a comma separated values list or a String array.');
			throw MicroService.ILLEGAL_ARGUMENT;
		}
		// Productions must be an array by now.
		// Make sure each production is not undefined, not null and not empty.
		// Productions are forced to lower case.
		this.definition.produces = [];
		for(let i=0;i < productions.length;i++) {
			let production = productions[i];
			if(production === undefined || production === null) {
				continue;
			}
			if(typeof production != 'string') {
				continue;
			}
			production = production.trim();
			if(production.length <= 0) {
				continue;
			}
			production = production.toLowerCase();
			// Lets make sure our produces list is a set.
			let indexOf = this.definition.produces.indexOf(production);
			if(indexOf < 0) {
				this.definition.produces.push(production);
			}
		}
	}
}

module.exports = MicroService;