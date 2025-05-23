/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-net
 *
 * NAME
 * index
 */
const packageName = 'dxp3-net';
const moduleName = 'index';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
// Check if someone tried to run/execute this file.
const util = require('dxp3-util');
if(util.Assert.isFileToExecute(canonicalName)) {
	util.Help.print();
	return;
}
/**
 * <p>The dxp3-net module contains all the necessary functionality to configure and
 * run HTTP/TCP/UDP servers and/or clients.<br/>
 * Make sure this local module is defined as a dependency in your package.json.
 * Typically the dependency is defined by a file reference using a relative path.
 * Obviously that relative path may be different for different modules.
 * Here is an example of such a dependency in a package.json:<br/>
 * "dependencies": {<br/>
 *   "dxp3-net": "file:../../../local_modules/dxp3-net"<br/>
 * }<br/>
 *
 * @example
 * // Get a reference to our net code.
 * const net = require('dxp3-net');
 * // Create a http server.
 * let myHTTPServer = new net.HTTPServer();
 * // Create another http server the longer way.
 * let anotherHTTPServer = new net.http.HTTPServer();
 * // Listen for the running event. That way we know we started properly.
 * myHTTPServer.on(net.HTTPServerEvent.RUNNING, function() {
 *     console.log('HTTP server is running');	
 * });
 * // Listen for any errors.
 * myHTTPServer.on(net.HTTPServerEvent.ERROR, function(err) {
 *     console.log('Something went wrong: ' + err);
 * });
 * // Lets set the port. If we don't supply a port, an available one will be 
 * // found for us.
 * myHTTPServer.setPort(8081);
 * // Everything is in place to attempt a hopefully successful start.
 * myHTTPServer.start();
 *
 * @module dxp3-net
 */
const file = require('dxp3-net-file');
const http = require('dxp3-net-http');
const json = require('dxp3-net-json');
const tcp = require('dxp3-net-tcp');
const udp = require('dxp3-net-udp');

const net = {};

net.file = file;
net.FileClient = file.FileClient;
net.FileClientEvent = file.FileClientEvent;
net.FileServer = file.FileServer;
net.FileServerEvent = file.FileServerEvent;
net.FileServerState = file.FileServerState;
net.http = http;
net.HTTPForm = http.HTTPForm;
net.HTTPReverseProxy = http.HTTPReverseProxy;
net.HTTPReverseProxyOptions = http.HTTPReverseProxyOptions;
net.HTTPReverseProxyDefaults = http.HTTPReverseProxyDefaults;
net.HTTPReverseProxyError = http.HTTPReverseProxyError;
net.HTTPReverseProxyEvent = http.HTTPReverseProxyEvent;
net.HTTPReverseProxyState = http.HTTPReverseProxyState;
net.HTTPServer = http.HTTPServer;
net.HTTPServerDefaults = http.HTTPServerDefaults;
net.HTTPServerError = http.HTTPServerError;
net.HTTPServerEvent = http.HTTPServerEvent;
net.HTTPServerOptions = http.HTTPServerOptions;
net.HTTPServerState = http.HTTPServerState;
net.json = json;
net.JSONClient = json.JSONClient;
net.JSONClientEvent = json.JSONClientEvent;
net.JSONServer = json.JSONServer;
net.JSONServerEvent = json.JSONServerEvent;
net.JSONServerState = json.JSONServerState;
/** @member {module:dxp3-net-tcp/TCPClient} TCPClient */
net.TCPClient = tcp.TCPClient;
/** @member {module:dxp3-net-tcp/TCPClientEvent} TCPClientEvent */
net.TCPClientEvent = tcp.TCPClientEvent;
/** @member {module:dxp3-net-tcp/TCPServer} TCPServer */
net.TCPServer = tcp.TCPServer;
/** @member {module:dxp3-net-tcp/TCPServerPort} TCPServerPort */
net.TCPServerPort = tcp.TCPServerPort;
/** @member {module:dxp3-net-udp} udp */
net.udp = udp;
/** @member {module:dxp3-net-udp/UDPBridge} UDPBridge */
net.UDPBridge = udp.UDPBridge;
/** @member {module:dxp3-net-udp/UDPBridgeEvent} UDPBridgeEvent */
net.UDPBridgeEvent = udp.UDPBridgeEvent;
/** @member {module:dxp3-net-udp/UDPBridgeOptions} UDPBridgeOptions */
net.UDPBridgeOptions = udp.UDPBridgeOptions;
/** @member {module:dxp3-net-udp/UDPClient} UDPClient */
net.UDPClient = udp.UDPClient;
/** @member {module:dxp3-net-udp/UDPClientEvent} UDPClientEvent */
net.UDPClientEvent = udp.UDPClientEvent;
/** @member {module:dxp3-net-udp/UDPClientOptions} UDPClientOptions */
net.UDPClientOptions = udp.UDPClientOptions;
/** @member {module:dxp3-net-udp/UDPError} UDPError */
net.UDPError = udp.UDPError;
/** @member {module:dxp3-net-udp/UDPMode} UDPMode */
net.UDPMode = udp.UDPMode;
/** @member {module:dxp3-net-udp/UDPServer} UDPServer */
net.UDPServer = udp.UDPServer;
/** @member {module:dxp3-net-udp/UDPServerEvent} UDPServerEvent */
net.UDPServerEvent = udp.UDPServerEvent;
/** @member {module:dxp3-net-udp/UDPServerOptions} UDPServerOptions */
net.UDPServerOptions = udp.UDPServerOptions;

module.exports = net;