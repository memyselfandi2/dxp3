/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-net-udp
 *
 * NAME
 * UDPClientEvent
 */
const packageName = 'dxp3-net-udp';
const moduleName = 'UDPClientEvent';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * A collection of events an UDPClient may emit.
 *
 * @module dxp3-net-udp/UDPClientEvent
 */
// We throw an UDPError when we are unable to parse/tranform a String
// to a valid UDPClientEvent value.
const UDPError = require('./UDPError');
// We use the util.Help class to print out help information.
const util = require('dxp3-util');

const UDPClientEvent = {
	/**
	 * @member {String} ERROR
	 * Emitted when an error is encountered by the UDPClient.
	 */
	ERROR: 'Error',
	/**
	 * @function parse
	 *
	 * @param {String} _udpClientEventAsString A String to be parsed/transformed to an UDPClientEvent value.
	 * @returns {String} A String representing a UDPClientEvent.
	 * @throws {module:dxp3-net-udp/UDPError~UDPError}
	 * When the supplied parameter is undefined, null, not a string or empty or is not a valid UDPClientEvent value.
	 */
	parse: function(_udpClientEventAsString) {
		if(_udpClientEventAsString === undefined || _udpClientEventAsString === null) {
			throw UDPError.ILLEGAL_ARGUMENT;
		}
		if(typeof _udpClientEventAsString != 'string') {
			throw UDPError.ILLEGAL_ARGUMENT;
		}
		_udpClientEventAsString = _udpClientEventAsString.trim();
		if(_udpClientEventAsString.length <= 0) {
			throw UDPError.ILLEGAL_ARGUMENT;
		}
		_udpClientEventAsString = _udpClientEventAsString.toLowerCase();
		switch(_udpClientEventAsString) {
			case 'error':
				return UDPClientEvent.ERROR;
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
module.exports = UDPClientEvent;