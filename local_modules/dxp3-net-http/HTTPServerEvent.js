/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-net-http
 *
 * NAME
 * HTTPServerEvent
 */
const packageName = 'dxp3-net-http';
const moduleName = 'HTTPServerEvent';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * @module dxp3-net-http/HTTPServerEvent
 */
// We throw an HTTPError when we are unable to parse/tranform a String
// to a valid HTTPServerEvent value.
const HTTPError = require('./HTTPError');
// We use the util.Help class to print out help information.
const util = require('dxp3-util');

/**
 * @enum {String}
 * @readonly
 */
const HTTPServerEvent = {
	/** @event module:dxp3-net/HTTPServerEvent#ADDED_CLIENT */
	ADDED_CLIENT: 'Added client',
	/** @event module:dxp3-net/HTTPServerEvent#DATA */
	DATA: 'Data',
	/** @event module:dxp3-net/HTTPServerEvent#ERROR */
	ERROR: 'Error',
	/** @event module:dxp3-net/HTTPServerEvent#CLOSED_CLIENT */
	CLOSED_CLIENT: 'Closed client',
	/** @event module:dxp3-net/HTTPServerEvent#RUNNING */
	RUNNING: 'Running',
	/** @event module:dxp3-net/HTTPServerEvent#STARTING */
	STARTING: 'Starting',
	/** @event module:dxp3-net/HTTPServerEvent#STOPPED */
	STOPPED: 'Stopped',
	/** @event module:dxp3-net/HTTPServerEvent#STOPPING */
	STOPPING: 'Stopping',
    /**
     * @function parse
     *
     * @param {String} _eventAsString A String to be parsed/transformed to an HTTPServerEvent value.
     * @returns {String} A String representing an HTTPServerEvent.
     * @throws {module:dxp3-net-http/HTTPError~HTTPError}
     * When the supplied parameter is undefined, null, not a string or empty or is not a valid HTTPServerEvent value.
     */
    parse: function(_eventAsString) {
        if(_eventAsString === undefined || _eventAsString === null) {
            throw HTTPError.ILLEGAL_ARGUMENT;
        }
        if(typeof _eventAsString != 'string') {
            throw HTTPError.ILLEGAL_ARGUMENT;
        }
        _eventAsString = _eventAsString.trim();
        if(_eventAsString.length <= 0) {
            throw HTTPError.ILLEGAL_ARGUMENT;
        }
        _eventAsString = _eventAsString.toUpperCase();
        switch(_eventAsString) {
            case 'ADDED_CLIENT':
                return HTTPServerEvent.ADDED_CLIENT;
            case 'DATA':
                return HTTPServerEvent.DATA;
            case 'ERROR':
                return HTTPServerEvent.ERROR;
            case 'CLOSED_CLIENT':
                return HTTPServerEvent.CLOSED_CLIENT;
            case 'RUNNING':
                return HTTPServerEvent.RUNNING;
            case 'STARTING':
                return HTTPServerEvent.STARTING;
            case 'STOPPED':
                return HTTPServerEvent.STOPPED;
            case 'STOPPING':
                return HTTPServerEvent.STOPPING;
            default:
                throw HTTPError.ILLEGAL_ARGUMENT;
        }
    }   
};
// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
    util.Help.print();
    return;
}
module.exports = HTTPServerEvent;