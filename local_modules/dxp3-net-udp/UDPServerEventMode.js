/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-net-udp
 *
 * NAME
 * UDPServerEventMode
 */
const packageName = 'dxp3-net-udp';
const moduleName = 'UDPServerEventMode';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * A collection of different ways an UDPServer emits message events.<br/>
 * For example, an UDP server may emit received messages as:<br/>
 * <ul>
 * <li>raw, which does not unpack the received message, or as</li>
 * <li>message, which decodes the message, or as</li>
 * <li>event, which decodes the message and interprets the enclosed event.</li>
 * </ul>
 *
 * @module dxp3-net-udp/UDPServerEventMode
 */
const UDPError = require('./UDPError');
const util = require('dxp3-util');

const UDPServerEventMode = {
	/**
	 * @member {String} EVENT
	 */
	EVENT: "event",
	/**
	 * @member {String} MESSAGE
	 */
	MESSAGE: "message",
	/**
	 * @member {String} RAW
	 */
	RAW: "raw",
	/**
	 * @function parse
	 *
	 * @param {String} _eventModeAsString A String to be parsed/transformed to an UDPServerEventMode value.
	 * @returns {String} A String representing a UDPServerEventMode.
	 * @throws {module:dxp3-net-udp/UDPError~UDPError}
	 * When the supplied parameter is undefined, null, not a string or empty or is not a valid UDPServerEventMode value.
	 */
	parse: function(_eventModeAsString) {
		if(_eventModeAsString === undefined || _eventModeAsString === null) {
			throw UDPError.ILLEGAL_ARGUMENT;
		} 
		if(typeof _eventModeAsString != 'string') {
			throw UDPError.ILLEGAL_ARGUMENT;
		}
		_eventModeAsString = _eventModeAsString.trim();
		if(_eventModeAsString.length <= 0) {
			throw UDPError.ILLEGAL_ARGUMENT;
		}
		_eventModeAsString = _eventModeAsString.toLowerCase();
		switch(_eventModeAsString) {
			case 'event':
				return UDPServerEventMode.EVENT;
			case 'message':
				return UDPServerEventMode.MESSAGE;
			case 'raw':
				return UDPServerEventMode.RAW;
			default:
				throw UDPError.ILLEGAL_ARGUMENT;
		}
	}
}
// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
    util.Help.print();
    return;
}
module.exports = UDPServerEventMode;