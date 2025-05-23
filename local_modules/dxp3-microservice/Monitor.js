/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-microservice
 *
 * NAME
 * Monitor
 */
const packageName = 'dxp3-microservice';
const moduleName = 'Monitor';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
const util = require('dxp3-util');
/**
 * @module dxp3-microservice/Monitor
 */
const EventEmitter = require('events');
const MicroService = require('./MicroService');
const MicroServiceEvent = require('./MicroServiceEvent');
const MicroServiceType = require('./MicroServiceType')
/**
 * @class
 */
class Monitor extends MicroService {
	constructor() {
		super();
	}

	get type() {
		return MicroServiceType.MONITOR;
	}
}

module.exports=Monitor;