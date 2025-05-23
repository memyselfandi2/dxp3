/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-net-udp
 *
 * NAME
 * UDPServerDefaults
 */
const packageName = 'dxp3-net-udp';
const moduleName = 'UDPServerDefaults';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * A constant representing all the default properties of an UDPServer.
 *
 * @module dxp3-net-udp/UDPServerDefaults
 */
// It's important to log errors and warnings.
const logging = require('dxp3-logging');
const UDPMode = require('./UDPMode');
// We use the util.Help class to print out help information.
const util = require('dxp3-util');

const UDPServerDefaults = {
	/**
	 * @member {String} DEFAULT_UDP_MODE
	 * We start out with UDPMode.MULTICAST, as some private networks do not allow
	 * limited broadcasts (A limited broadcast in essence broadcasts to every node on the local network).
	 * @see module:dxp3-net-udp/UDPMode
	 */
	DEFAULT_UDP_MODE: UDPMode.MULTICAST,
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
	 * the limited broadcast address.
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
	 * @member {String} DEFAULT_ADDRESS
	 * In the context of servers 0.0.0.0 can mean "all IPv4 addresses on the local machine".
	 * If a host has two IP addresses, 192.168.1.1 and 10.1.2.1, and a server running on
	 * the host is configured to listen on 0.0.0.0, it will be reachable at both of those IP addresses.
	 * When the UDPServer mode is set to multicast the address should be 0.0.0.0.
	 */
	DEFAULT_ADDRESS: '0.0.0.0',
	/**
	 * @member {Number} DEFAULT_PORT
	 * When you select a UDP port, select an available 16-bit integer from the 
	 * available ports in the private range 49152 to 65535.
	 * The default port is 53879.
	 */
	DEFAULT_PORT: 53879,
	/**
	 * @member {Boolean} DEFAULT_IGNORE_PARENT_PROCESS
	 * By default we ignore UDP messages send by our parent process.
	 * This is set to true.
	 */
	DEFAULT_IGNORE_PARENT_PROCESS: true,
	/**
	 * @member {Boolean} DEFAULT_IGNORE_OURSELVES
	 * By default we ignore UDP messages send by ourselves.
	 * This is set to true.
	 */
	DEFAULT_IGNORE_OURSELVES: true,
	/**
	 * @member {Boolean} DEFAULT_REUSE_ADDR
	 * The reuse address setting allows us to bind on the address even if another process has
	 * has already bound a socket on it. By default we allow this as it allows for using
	 * multicast between processes on the same machine/host.
	 * This is set to true.
	 */
	DEFAULT_REUSE_ADDR: true,
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
module.exports = UDPServerDefaults;