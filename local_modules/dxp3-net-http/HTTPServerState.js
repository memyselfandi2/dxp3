/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-net-http
 *
 * NAME
 * HTTPServerState
 */
const packageName = 'dxp3-net-http';
const moduleName = 'HTTPServerState';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * @module dxp3-net-http/HTTPServerState
 */
// We throw an HTTPError when we are unable to parse/tranform a String
// to a valid HTTPServerState value.
const HTTPError = require('./HTTPError');
// We use the util.Help class to print out help information.
const util = require('dxp3-util');

/**
 * @enum {String}
 * @readonly
 */
const HTTPServerState = {
    /** @member {String} INITIALIZED */
	INITIALIZED: 'Initialized',
    /** @member {String} RUNNING */
	RUNNING: 'Running',
    /** @member {String} STARTING */
	STARTING: 'Starting',
    /** @member {String} STOPPED */
	STOPPED: 'Stopped',
    /** @member {String} STOPPING */
	STOPPING: 'Stopping',
    /**
     * @function parse
     *
     * @param {String} _stateAsString A String to be parsed/transformed to an HTTPServerState value.
     * @returns {String} A String representing an HTTPServerState.
     * @throws {module:dxp3-net-http/HTTPError~HTTPError}
     * When the supplied parameter is undefined, null, not a string or empty or is not a valid HTTPServerState value.
     */
    parse: function(_stateAsString) {
        if(_stateAsString === undefined || _stateAsString === null) {
            throw HTTPError.ILLEGAL_ARGUMENT;
        }
        if(typeof _stateAsString != 'string') {
            throw HTTPError.ILLEGAL_ARGUMENT;
        }
        _stateAsString = _stateAsString.trim();
        if(_stateAsString.length <= 0) {
            throw HTTPError.ILLEGAL_ARGUMENT;
        }
        _stateAsString = _stateAsString.toLowerCase();
        switch(_stateAsString) {
            case 'initialized':
                return HTTPServerState.INITIALIZED;
            case 'running':
                return HTTPServerState.RUNNING;
            case 'starting':
                return HTTPServerState.STARTING;
            case 'stopped':
                return HTTPServerState.STOPPED;
            case 'stopping':
                return HTTPServerState.STOPPING;
            default:
                throw HTTPError.ILLEGAL_ARGUMENT;
        }
    }   
}
// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
    util.Help.print();
    return;
}
module.exports = HTTPServerState;