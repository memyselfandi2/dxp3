***************************************************************
* DXP3 - Digital Experience Platform 3                        *
*                                                             *
* MODULE: dxp3-net-udp                                        *
***************************************************************

This library contains all the necessary functionality to configure and
run UDP servers and to use UDP clients to send messages.

Make sure this local module is defined as a dependency in your package.json.
Typically the dependency is defined by a file reference using a relative path.
Obviously that relative path may be different for different modules.
Here is an example of such a dependency in a package.json:
"dependencies": {
  "dxp3-net-udp": "file:../../../local_modules/dxp3-net-udp"
}

Here is some background information on UDP networking:
A broadcast address is a network address at which all devices connected to
a multiple-access communications network are enabled to receive datagrams.
A message sent to a broadcast address may be received by all network-attached hosts.
In contrast, a multicast address is used to address a specific group of devices and
a unicast address is used to address a single device.
Setting all the bits of an IP address to one, or 255.255.255.255, forms the limited
broadcast address. Sending a UDP datagram to this address delivers the message to
any host on the local network segment. Because routers never forward messages sent to
this address, only hosts on the network segment receive the broadcast message.
Broadcasts can be directed to specific portions of a network by setting all bits of
the host identifier. For example, to send a broadcast to all hosts on the network
identified by IP addresses starting with 192.168.1, use the address 192.168.1.255.

***************************************************************
* CODE EXAMPLES                                               *
***************************************************************

const udp = require('dxp3-net-udp');
// Lets create an UDP server. We trust the default options will suffice.
let udpServer = new udp.UDPServer();
udpServer.on(udp.UDPServerEvent.RUNNING, (_address, _port) => {
   console.log('UDP Server is running at ' + _address + ':' + _port);
});
// Messages are send as events and are emitted by the UDPServer.
udpServer.on('test', (_data, _remoteAddressInformation) => {
   console.log('received a test message: ' + JSON.stringify(_data));
   console.log('from address: ' + _remoteAddressInformation.address);
   console.log('from port: ' + _remoteAddressInformation.port);
});
// We are ready to start our UDP server.
udpServer.start();

// Next we create an UDP client to send a test message.
let udpClient = new udp.UDPClient();
udpClient.send('test', {id:1001,name: 'test one'});

***************************************************************
* COMMAND LINE OPTIONS                                        *
***************************************************************

The UDPClient, UDPClientCLI, UDPServer and UDPServerCLI can all be executed
from the command line. Their command line options are explained in their
respective help documentation.

> node UDPClient -help

> node UDPServer -help

***************************************************************
* COMMAND LINE EXAMPLES                                       *
***************************************************************

Typically one would use the UDPServerCLI to receive/send UDP messages from
the command line. However if you need to perform a quick test, you can run
the UDPServer from the command line. On the sending end you'd probably
run an UDPClient. The UDPClient has a default hardcoded test message, but
it can be overwritten using the -event and -eventBody options.

> node UDPServer -loglevel * trace -multicastaddress 239.128.1.1 -port 10123 -encryption toughencryptionkey

> node UDPClient -loglevel * info -port 10123 -destinations 239.128.1.1 -event namechange -eventBody {\"id\":99,\"from\":\"Henk\",\"to\":\"David\"} -encryption toughencryptionkey