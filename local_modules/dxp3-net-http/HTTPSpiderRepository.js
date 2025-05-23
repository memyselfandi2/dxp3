/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-net-http
 *
 * NAME
 * HTTPSpiderRepository
 */
const packageName = 'dxp3-net-http';
const moduleName = 'HTTPSpiderRepository';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * @module dxp3-net-http/HTTPSpiderRepository
 */
// We use the util.Help class to print out help information.
const util = require('dxp3-util');

class HTTPSpiderRepository {

	constructor() {
		this.toBeProcessedMap = new Map();
		this.processingMap = new Map();
		this.processedMap = new Map();
	}

	clear() {
		this.toBeProcessedMap.clear();
		this.processingMap.clear();
		this.processedMap.clear();
	}

	addToBeProcessedConditional(spiderLink) {
		if(spiderLink === undefined || spiderLink === null) {
			return;
		}
		let destinationURLString = spiderLink.getDestinationURLString();
		if(this.toBeProcessedMap.has(destinationURLString)) {
			return;
		}
		if(this.processingMap.has(destinationURLString)) {
			return;
		}
		if(this.processedMap.has(destinationURLString)) {
			return;
		}
		this.toBeProcessedMap.set(destinationURLString, spiderLink);
	}

	addToBeProcessedUnconditional(spiderLink) {
		if(spiderLink == undefined || spiderLink === null) {
			return;
		}
		let destinationURLString = spiderLink.getDestinationURLString();
		this.toBeProcessedMap.set(destinationURLString, spiderLink);
	}

	getNextToBeProcessed() {
		if(this.toBeProcessedMap.length <= 0) {
			return null;
		}
		for(let [key,value] of this.toBeProcessedMap) {
			this.processingMap.set(key, value);
			this.toBeProcessedMap.delete(key);
			return value;			
		}
		return null;
	}

	processed(spiderLink) {
		if(spiderLink === undefined || spiderLink === null) {
			return;
		}
		let destinationURLString = spiderLink.getDestinationURLString();
		spiderLink = this.processingMap.get(destinationURLString);
		this.processedMap.set(destinationURLString, spiderLink);
		this.processingMap.delete(destinationURLString);
	}

	hasToBeProcessed() {
		return (this.toBeProcessedMap.size > 0)
	}

	getToBeProcessed() {
		return this.toBeProcessedMap.values();
	}
}
// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
    util.Help.print(HTTPSpiderRepository);
    return;
}
module.exports = HTTPSpiderRepository;