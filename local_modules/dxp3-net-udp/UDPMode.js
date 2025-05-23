/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-net-udp
 *
 * NAME
 * UDPMode
 */
const packageName = 'dxp3-net-udp';
const moduleName = 'UDPMode';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * A collection of modes an UDP client or server can operate in.<br/>
 * For example, an UDP message may be send to:<br/>
 * <ul>
 * <li>everyone on a network (limited broadcast),</li>
 * <li>to a subset of nodes (directed broadcast),</li>
 * <li>to a group nodes have subscribed to (multicast),</li>
 * <li>to a specific set of nodes (unicast)</li>
 * </ul>
 *
 * @module dxp3-net-udp/UDPMode
 */
const UDPError = require('./UDPError');
const util = require('dxp3-util');

const UDPMode = {
	/**
	 * @member {String} DIRECTED_BROADCAST
	 * With directed broadcast, all recipients are always within the target network.
	 * A combination of the number of the target network and the setting of all host bits to 1
	 * produces the broadcast address in this case. If the destination is not located
	 * in its own (sub-)network, a router forwards the data packet.
	 * Host bits are the part of an IP address identifying a specific host in a subnet.
	 * The subnet mask determines what proportion of the address is used for network bits and
	 * for host bits. For example, an IPv4 address 192.168.0.64/26 has a 6-bit host part, because
	 * 26 of 32 bits are reserved for the network part.
	 */
	DIRECTED_BROADCAST: "Directed broadcast",
	/**
	 * @member {String} LIMITED_BROADCAST
	 * With limited broadcast the destination IP address is always 255.255.255.255.
	 * Technically, this broadcast should be sent to all the IP addresses that exist.
	 * However, it actually serves as an address for the broadcast within the network.
	 * This destination is always in its own network and can therefore be implemented in
	 * an ethernet broadcast. A router does not forward such a packet.
	 */
	LIMITED_BROADCAST: "Limited broadcast",
	/**
	 * @member {String} MULTICAST
	 * IPv4 Multicast addresses use the reserved class D address range:
	 * 224.0.0.0 through 239.255.255.255
	 * The addresses range between 224.0.0.0 and 224.0.0.255 is reserved for use by routing and
	 * maintenance protocols inside a network. See table below:
	 * IP multicast address range			Description					Routable
	 * 224.000.000.000 to 224.000.000.255	Local subnetwork			No
	 * 224.000.001.000 to 224.000.001.255	Internetwork control		Yes
	 * 224.000.002.000 to 224.000.255.255	AD-HOC block 1				Yes
	 * 224.003.000.000 to 224.004.255.255	AD-HOC block 2				Yes
	 * 232.000.000.000 to 232.255.255.255	Source-specific Multicast 	Yes
	 * 233.000.000.000 to 233.251.255.255	GLOP addressing				Yes
	 * 233.252.000.000 to 233.255.255.255	AD-HOC block 3				Yes
	 * 234.000.000.000 to 234.255.255.255	Unicast-prefix-based		Yes
	 * 239.000.000.000 to 239.255.255.255	Administratively scoped		Yes
	 */
	MULTICAST: "Multicast",
	/**
	 * @member {String} UNICAST
	 * Unicast represents a peer to peer UDP connection.
	 */
	UNICAST: "Unicast",
	/**
	 * @function parse
	 *
	 * @param {String} udpModeAsString A String to be parsed/transformed to an UDPMode value.
	 * @returns {String} A String representing a UDPMode.
	 * @throws {module:dxp3-net-udp/UDPError~UDPError}
	 * When the supplied parameter is undefined, null, not a string or empty or is not a valid UDPMode value.
	 */
	parse: function(udpModeAsString) {
		if(udpModeAsString === undefined || udpModeAsString === null) {
			throw UDPError.ILLEGAL_ARGUMENT;
		} 
		if(typeof udpModeAsString != 'string') {
			throw UDPError.ILLEGAL_ARGUMENT;
		}
		udpModeAsString = udpModeAsString.trim();
		if(udpModeAsString.length <= 0) {
			throw UDPError.ILLEGAL_ARGUMENT;
		}
		udpModeAsString = udpModeAsString.toLowerCase();
		switch(udpModeAsString) {
			case 'uni':
			case 'unicast':
			case 'uni-cast':
			case 'uni_cast':
			case 'uni cast':
				return UDPMode.UNICAST;
			// If the supplied mode is broadcast, we assume the user meant limited broadcast.
			case 'broadcast':
			case 'broad-cast':
			case 'broad_cast':
			case 'broad cast':
			case 'limited':
			case 'limitedbroadcast':
			case 'limited-broadcast':
			case 'limited_broadcast':
			case 'limited broadcast':
				return UDPMode.LIMITED_BROADCAST;
			case 'directed':
			case 'directedbroadcast':
			case 'directed-broadcast':
			case 'directed_broadcast':
			case 'directed broadcast':
				return UDPMode.DIRECTED_BROADCAST;
			case 'multi':
			case 'multicast':
			case 'multi-cast':
			case 'multi_cast':
			case 'multi cast':
				return UDPMode.MULTICAST;
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
module.exports = UDPMode;