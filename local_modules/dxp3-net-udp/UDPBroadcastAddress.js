const os = require('os');
const networkInterfaces = os.networkInterfaces();

class UDPBroadcastAddress {

	constructor() {

	}

	static forLocal() {
		let found = false;
		let networkAddress = null;
		for(const networkInterfaceID in networkInterfaces) {
			let networkInterface = networkInterfaces[networkInterfaceID];
			networkAddress = networkInterface.find(networkAddress => ((networkAddress.family === 'IPv4') && (!networkAddress.internal) && (networkAddress.address.match(/^(10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.|192\.168\.)/g))));
			if(networkAddress != null) {
				return UDPBroadcastAddress.forNetworkAddress(networkAddress);
			}
		}
		return '';
	}

	static forNetworkInterface(_networkInterfaceID) {
		let networkInterface = networkInterfaces[_networkInterfaceID];
		let networkAddress = networkInterface.find(networkAddress => (networkAddress.family === 'IPv4'));
		return UDPBroadcastAddress.forNetworkAddress(networkAddress);
	}

	static forNetworkAddress(_networkAddress) {
		let ipAddress = _networkAddress.address;
		let subnet = _networkAddress.netmask;
		let ipAddressComponents = ipAddress.split('.');
		let subnetComponents = subnet.split('.');
		return ipAddressComponents.map((e, i) => (~subnetComponents[i] & 0xFF) | e).join('.');
	}
}
console.log('Broadcast address: ' + UDPBroadcastAddress.forLocal());
console.log('');
for(const networkInterfaceID in networkInterfaces) {
	let networkInterface = networkInterfaces[networkInterfaceID];
	console.log(networkInterfaceID);
	console.log(JSON.stringify(networkInterface));
	console.log('');
}
module.exports = UDPBroadcastAddress;