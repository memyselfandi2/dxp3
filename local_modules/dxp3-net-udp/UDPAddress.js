/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-net-udp
 *
 * NAME
 * UDPAddress
 */
const packageName = 'dxp3-net-udp';
const moduleName = 'UDPAddress';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * @module dxp3-net-udp/UDPAddress
 */
// We use the util.Help class to print out help information.
const util = require('dxp3-util');

class UDPAddress {

	static isLimitedBroadcastAddress(_ipAddress) {
		return _ipAddress === '255.255.255.255';
	}

	static isDirectedBroadcastAddress(_ipAddress) {
		return _ipAddress.endsWith('.255');
	}

	static isMulticastAddress(_ipAddress) {
		let ipNumber = UDPAddress.convertIPAddressToNumber(_ipAddress);
		if(ipNumber === 0) {
			return false;
		}
		return (ipNumber >= UDPAddress.MULTICAST_ADDRESS_MIN && ipNumber <= UDPAddress.MULTICAST_ADDRESS_MAX);
	}

	static convertIPAddressToNumber(_ipAddressAsString) {
	    var arr = _ipAddressAsString.split(".");
	    var n = 0
	    for (let i = 0; i < 4; i++) {
	        n = n * 256;
	        n += parseInt(arr[i],10);
	    }
	    return n;
	}
}
UDPAddress.MULTICAST_ADDRESS_MIN = UDPAddress.convertIPAddressToNumber("224.0.0.0");
UDPAddress.MULTICAST_ADDRESS_MAX = UDPAddress.convertIPAddressToNumber("239.255.255.255");
// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
	util.Help.print(UDPAddress);
	return;
}
module.exports = UDPAddress;