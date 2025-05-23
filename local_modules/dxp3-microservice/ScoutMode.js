const MicroServiceError = require('./MicroServiceError');

const ScoutMode = {
	// With limited broadcast the destination IP address is always 255.255.255.255.
	// Technically, this broadcast should be sent to all the IP addresses that exist.
	// However, it actually serves as an address for the broadcast within the network.
	// This destination is always in its own network and can therefore be implemented in
	// an Ethernet broadcast. A router does not forward such a packet.
	LIMITED_BROADCAST: "Limited broadcast",
	// With directed broadcast, all recipients are always within the target network.
	// A combination of the number of the target network and the setting of all host bits to 1
	// produces the broadcast address in this case. If the destination is not located
	// in its own (sub-)network, a router forwards the data packet.
	// Host bits are the part of an IP address identifying a specific host in a subnet.
	// The subnet mask determines what proportion of the address is used for network bits and
	// for host bits. For example, an IPv4 address 192.168.0.64/26 has a 6-bit host part, because
	// 26 of 32 bits are reserved for the network part.
	DIRECTED_BROADCAST: "Directed broadcast",
	// IPv4 Multicast addresses use the reserved class D address range:
	// 224.0.0.0 through 239.255.255.255
	// The addresses range between 224.0.0.0 and 224.0.0.255 is reserved for use by routing and
	// maintenance protocols inside a network. See table below:
	//
	// IP multicast address range			Description					Routable
	// 224.000.000.000 to 224.000.000.255	Local subnetwork			No
	// 224.000.001.000 to 224.000.001.255	Internetwork control		Yes
	// 224.000.002.000 to 224.000.255.255	AD-HOC block 1				Yes
	// 224.003.000.000 to 224.004.255.255	AD-HOC block 2				Yes
	// 232.000.000.000 to 232.255.255.255	Source-specific Multicast 	Yes
	// 233.000.000.000 to 233.251.255.255	GLOP addressing				Yes
	// 233.252.000.000 to 233.255.255.255	AD-HOC block 3				Yes
	// 234.000.000.000 to 234.255.255.255	Unicast-prefix-based		Yes
	// 239.000.000.000 to 239.255.255.255	Administratively scoped		Yes
	MULTICAST: "Multicast",
	UNICAST: "Unicast",
	/**
	 * @function
	 * @param {String} scoutModeAsString - The scout mode given as a string to be transformed to
	 *                                     a value of the ScoutMode enumeration.
	 * @returns {ScoutMode}
	 */
	parse: function(scoutModeAsString) {
		if(scoutModeAsString === undefined || scoutModeAsString === null) {
			throw MicroServiceError.ILLEGAL_ARGUMENT;
		}
		if(typeof scoutModeAsString != 'string') {
			throw MicroServiceError.ILLEGAL_ARGUMENT;
		}
		scoutModeAsString = scoutModeAsString.trim();
		if(scoutModeAsString.length <= 0) {
			throw MicroServiceError.ILLEGAL_ARGUMENT;
		}
		scoutModeAsString = scoutModeAsString.toUpperCase();
		switch(scoutModeAsString) {
			case 'DIRECTED':
			case 'DIRECTEDBROADCAST':
			case 'DIRECTED-BROADCAST':
			case 'DIRECTED_BROADCAST':
			case 'DIRECTED BROADCAST':
				return ScoutMode.DIRECTED_BROADCAST;
			case 'LIMITED':
			case 'LIMITEDBROADCAST':
			case 'LIMITED-BROADCAST':
			case 'LIMITED_BROADCAST':
			case 'LIMITED BROADCAST':
			case 'BROADCAST':
				return ScoutMode.LIMITED_BROADCAST;
			case 'MULTICAST':
			case 'MULTI-CAST':
			case 'MULTI_CAST':
			case 'MULTI CAST':
				return ScoutMode.MULTICAST;
			case 'UNICAST':
			case 'UNI-CAST':
			case 'UNI_CAST':
			case 'UNI CAST':
				return ScoutMode.UNICAST;
			default:
				throw MicroServiceError.ILLEGAL_ARGUMENT;
		}
	}
}

module.exports = ScoutMode;