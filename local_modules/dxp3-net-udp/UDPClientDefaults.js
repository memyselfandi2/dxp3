/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-net-udp
 *
 * NAME
 * UDPClientDefaults
 */
const packageName = 'dxp3-net-udp';
const moduleName = 'UDPClientDefaults';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * A constant representing all the default properties for an UDPClient.
 *
 * @module dxp3-net-udp/UDPClientDefaults
 */
// It's important to log errors and warnings.
const logging = require('dxp3-logging');
// We use the util.Help class to print out help information.
const util = require('dxp3-util');

const UDPClientDefaults = {
	/**
	 * @member {String} DEFAULT_LIMITED_BROADCAST_ADDRESS
	 * The default limited broadcast address is 255.255.255.255.
	 * It means the traffic will go to every node on the local network (if allowed by the firewall).
	 */
	DEFAULT_LIMITED_BROADCAST_ADDRESS: '255.255.255.255',
	/**
	 * @member {String} DEFAULT_DIRECTED_BROADCAST_ADDRESS
	 * A directed broadcast address sets all the host bits to 1.
	 * Examples are: 192.168.1.255 or 10.0.4.255 which will broadcast to
	 * all nodes on the 192.168.1.0/24 or 10.0.4.0/24 network respectively.
	 * If the directed broadcast address is not explicitly set we revert back to
	 * the limited broadcast address by default.
	 */
	DEFAULT_DIRECTED_BROADCAST_ADDRESS: '255.255.255.255',
	/**
	 * @member {String} DEFAULT_MULTICAST_ADDRESS
	 * IP multicast address range			Description					Routable<br/>
	 * 224.000.000.000 to 224.000.000.255	Local subnetwork			No<br/>
	 * 224.000.001.000 to 224.000.001.255	Internetwork control		Yes<br/>
	 * 224.000.002.000 to 224.000.255.255	AD-HOC block 1				Yes<br/>
	 * 224.003.000.000 to 224.004.255.255	AD-HOC block 2				Yes<br/>
	 * 232.000.000.000 to 232.255.255.255	Source-specific Multicast 	Yes<br/>
	 * 233.000.000.000 to 233.251.255.255	GLOP addressing				Yes<br/>
	 * 233.252.000.000 to 233.255.255.255	AD-HOC block 3				Yes<br/>
	 * 234.000.000.000 to 234.255.255.255	Unicast-prefix-based		Yes<br/>
	 * 239.000.000.000 to 239.255.255.255	Administratively scoped		Yes<br/>
	 * Hence we are using an administratively scoped multicast address:<br/>
	 * 239.128.1.1
	 */
	DEFAULT_MULTICAST_ADDRESS: '239.128.1.1',
	/**
	 * @member {String} DEFAULT_UNICAST_ADDRESS
	 * An unicast address is the address of one node. It allows for direct peer to peer UDP messaging.
	 * The default unicast address is 127.0.0.1.
	 */
	DEFAULT_UNICAST_ADDRESS: '127.0.0.1',
	/**
	 * @member {Number} DEFAULT_PORT
	 * When you select a UDP port, select an available 16-bit integer from the 
	 * available ports in the private range 49152 to 65535.
	 * The default port is 53879.
	 */
	DEFAULT_PORT: 53879,
	/**
	 * @member {Boolean} DEFAULT_ENCRYPTION_KEY
	 * By default we do not have any encryption password and therefore
	 * we do not have any encryption.
	 * This is set to null.
	 */
	DEFAULT_ENCRYPTION_KEY: null,
	/**
	 * @member {String} DEFAULT_ENCRYPTION_ALGORITHM
	 * Our default encryption algorithm is aes-256-cbc.
	 */
	DEFAULT_ENCRYPTION_ALGORITHM: 'aes-256-cbc',
	/**
	 * @member {String} DEFAULT_LOG_LEVEL
	 * Default log level is dxp3-logging.Level.WARN.
	 * @see module:dxp3-logging/Level
	 */
	DEFAULT_LOG_LEVEL: logging.Level.WARN
}
// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
    util.Help.print();
    return;
}
module.exports = UDPClientDefaults;