/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-net-udp
 *
 * NAME
 * index
 */
const packageName = 'dxp3-net-udp';
const moduleName = 'index';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * <p>The dxp3-net-udp module contains all the necessary functionality to configure and
 * run UDP servers and to use UDP clients to send messages.<br/>
 * It gives you access to:<br/>
 * <ul>
 * <li>{@link module:dxp3-net-udp/UDPBridge}</li>
 * <li>{@link module:dxp3-net-udp/UDPBridgeEvent}</li>
 * <li>{@link module:dxp3-net-udp/UDPBridgeOptions}</li>
 * <li>{@link module:dxp3-net-udp/UDPClient}</li>
 * <li>{@link module:dxp3-net-udp/UDPClientEvent}</li>
 * <li>{@link module:dxp3-net-udp/UDPClientOptions}</li>
 * <li>{@link module:dxp3-net-udp/UDPError}</li>
 * <li>{@link module:dxp3-net-udp/UDPMode}</li>
 * <li>{@link module:dxp3-net-udp/UDPServer}</li>
 * <li>{@link module:dxp3-net-udp/UDPServerEvent}</li>
 * <li>{@link module:dxp3-net-udp/UDPServerEventMode}</li>
 * <li>{@link module:dxp3-net-udp/UDPServerOptions}</li>
 * </ul>
 * </p>
 * <p>Make sure this local module is defined as a dependency in your package.json.
 * Typically the dependency is defined by a file reference using a relative path.
 * Obviously that relative path may be different for different modules.<br/>
 * Here is an example of such a dependency in a package.json:<br/>
 * "dependencies": {<br/>
 *     "dxp3-net-udp": "file:../../../local_modules/dxp3-net-udp"<br/>
 * }<br/>
 * </p>
 * <p>Here is some background information on UDP networking:<br/>
 * A broadcast address is a network address at which all devices connected to
 * a multiple-access communications network are enabled to receive datagrams.
 * A message sent to a broadcast address may be received by all network-attached hosts.<br/>
 * In contrast, a multicast address is used to address a specific group of devices and
 * an unicast address is used to address a single device.<br/>
 * Setting all the bits of an IP address to one, or 255.255.255.255, forms the limited broadcast address.
 * Sending a UDP datagram to this address delivers the message to any host on the local network segment.
 * Because routers never forward messages sent to this address, only hosts on the network segment
 * receive the broadcast message.<br/>
 * Broadcasts can be directed to specific portions of a network by setting all bits of the host identifier.
 * For example, to send a broadcast to all hosts on the network identified by IP addresses starting
 * with 192.168.1, use the address 192.168.1.255.
 * </p>
 * 
 * @example
 * const udp = require('dxp3-net-udp');
 * // Lets create an UDP server. We trust the default options will suffice.
 * let udpServer = new udp.UDPServer();
 * udpServer.on(udp.UDPServerEvent.RUNNING, (_address, _port) => {
 *    console.log('UDP Server is running at ' + _address + ':' + _port);
 * });
 * // Messages are send as events and and are emitted by the UDPServer.
 * udpServer.on('test', (_data, _remoteAddressInformation) => {
 *    console.log('received a test message: ' + JSON.stringify(_data));
 *    console.log('from address: ' + _remoteAddressInformation.address);
 *    console.log('from port: ' + _remoteAddressInformation.port);
 * });
 * // We are ready to start our UDP server.
 * udpServer.start();
 *
 * // Next we create an UDP client to send a test message.
 * let udpClient = new udp.UDPClient();
 * udpClient.send('test', {id:1001,name: 'test one'});
 *
 * @module dxp3-net-udp
 */
// We use the util.Help class to print out help information.
const util = require('dxp3-util');

const udp = {};
/** @member {module:dxp3-net-udp/UDPBridge} UDPBridge */
udp.UDPBridge = require('./UDPBridge');
/** @member {module:dxp3-net-udp/UDPBridgeEvent} UDPBridgeEvent */
udp.UDPBridgeEvent = require('./UDPBridgeEvent');
/** @member {module:dxp3-net-udp/UDPBridgeOptions} UDPBridgeOptions */
udp.UDPBridgeOptions = require('./UDPBridgeOptions');
/** @member {module:dxp3-net-udp/UDPClient} UDPClient */
udp.UDPClient = require('./UDPClient');
/** @member {module:dxp3-net-udp/UDPClientEvent} UDPClientEvent */
udp.UDPClientEvent = require('./UDPClientEvent');
/** @member {module:dxp3-net-udp/UDPClientOptions} UDPClientOptions */
udp.UDPClientOptions = require('./UDPClientOptions');
/** @member {module:dxp3-net-udp/UDPError} UDPError */
udp.UDPError = require('./UDPError');
/** @member {module:dxp3-net-udp/UDPMode} UDPMode */
udp.UDPMode = require('./UDPMode');
/** @member {module:dxp3-net-udp/UDPServer} UDPServer */
udp.UDPServer = require('./UDPServer');
/** @member {module:dxp3-net-udp/UDPServerEvent} UDPServerEvent */
udp.UDPServerEvent = require('./UDPServerEvent');
/** @member {module:dxp3-net-udp/UDPServerEventMode} UDPServerEventMode */
udp.UDPServerEventMode = require('./UDPServerEventMode');
/** @member {module:dxp3-net-udp/UDPServerOptions} UDPServerOptions */
udp.UDPServerOptions = require('./UDPServerOptions');

// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
    util.Help.print();
    return;
}
module.exports = udp;