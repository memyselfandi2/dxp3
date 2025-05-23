/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-microservice
 *
 * NAME
 * MicroServiceDefinition
 */
const packageName = 'dxp3-microservice';
const moduleName = 'MicroServiceDefinition';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
// Check if someone tried to run/execute this file.
const util = require('dxp3-util');
if(util.Assert.isFileToExecute(canonicalName)) {
	util.Help.print();
	return;
}
const MicroServiceType = require('./MicroServiceType');
/**
 * An instance of a MicroServiceDefinition class holds all the information required to access/understand a MicroService.
 * It has an address, a name (mandatory), a port (optional),
 * an array or comma separated list of production and/or consumption subjects and a type (mandatory).<br/>
 * At the time of writing the current known types are:<br/>
 * <ul>
 * <li>PUBLISHER</li>
 * <li>REST CLIENT</li>
 * <li>REST SERVER</li>
 * <li>SUBSCRIBER</li>
 * <li>WEB CLIENT</li>
 * <li>WEB GATEWAY</li>
 * <li>WEB SERVER</li>
 * </ul>
 *
 * @property {String} address
 * @property {String} name
 * @property {Number} port
 * @property {Array|String} produces
 * @property {Array|String} consumes
 * @property {MicroServiceType} type
 */
class MicroServiceDefinition {
	/**
	 * Create a new (MicroService) Definition.
	 */
	constructor() {
		this._name = '';
		this._address = '';
		this._port = -1;
		this._settings = null;
		this._produces = [];
		this._consumes = [];
		this._type = null;
	}

	get address() {
		return this._address;
	}

	get name() {
		return this._name;
	}

	get port() {
		return this._port;
	}

	get settings() {
		return this._settings;
	}

	get produces() {
		return this._produces;
	}

	get consumes() {
		return this._consumes;
	}

	get type() {
		return this._type;
	}

	set address(address) {
		this._address = address;
	}

	set name(name) {
		this._name = name;
	}

	set port(port) {
		this._port = port;
	}

	set settings(_settings) {
		this._settings = _settings;
	}

	set produces(subjects) {
		this._produces = [];
		if(subjects === undefined || subjects === null) {
			return;
		}
		if(typeof subjects === 'string') {
			subjects = subjects.split(',');
		}
		if(!Array.isArray(subjects)) {
			return;
		}
		for(let i=0;i < subjects.length;i++) {
			let subject = subjects[i];
			if(subject === null) {
				continue;
			}
			if(typeof subject != 'string') {
				continue;
			}
			subject = subject.trim();
			if(subject.length <= 0) {
				continue;
			}
			subject = subject.toLowerCase();
			this._produces.push(subject);
		}
	}

	set consumes(subjects) {
		this._consumes = [];
		if(subjects === undefined || subjects === null) {
			return;
		}
		if(typeof subjects === 'string') {
			subjects = subjects.split(',');
		}
		if(!Array.isArray(subjects)) {
			return;
		}
		for(let i=0;i < subjects.length;i++) {
			let subject = subjects[i];
			if(subject === null) {
				continue;
			}
			if(typeof subject != 'string') {
				continue;
			}
			subject = subject.trim();
			if(subject.length <= 0) {
				continue;
			}
			subject = subject.toLowerCase();
			this._consumes.push(subject);
		}
	}

	set type(type) {
		if(type === undefined || type === null) {
			this._type = null;
		} else {
			this._type = MicroServiceType.parse(type);
		}
	}
}

module.exports = MicroServiceDefinition;