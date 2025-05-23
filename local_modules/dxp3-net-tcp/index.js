/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-net-tcp
 *
 * NAME
 * index
 */
const packageName = 'dxp3-net-tcp';
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
 * @module dxp3-net-tcp
 */
const tcp = {};

/** @member {module:dxp3-net-tcp/TCPClient} TCPClient */
tcp.TCPClient = require('./TCPClient');
/** @member {module:dxp3-net-tcp/TCPClientOptions} TCPClientOptions */
tcp.TCPClientOptions = require('./TCPClientOptions');
/** @member {module:dxp3-net-tcp/TCPClientEvent} TCPClientEvent */
tcp.TCPClientEvent = require('./TCPClientEvent');
/** @member {module:dxp3-net-tcp/TCPClientState} TCPClientState */
tcp.TCPClientState = require('./TCPClientState');
/** @member {module:dxp3-net-tcp/TCPError} TCPError */
tcp.TCPError = require('./TCPError');
/** @member {module:dxp3-net-tcp/TCPServer} TCPServer */
tcp.TCPServer = require('./TCPServer');
/** @member {module:dxp3-net-tcp/TCPServerOptions} TCPServerOptions */
tcp.TCPServerEvent = require('./TCPServerOptions');
/** @member {module:dxp3-net-tcp/TCPServerEvent} TCPServerEvent */
tcp.TCPServerEvent = require('./TCPServerEvent');
/** @member {module:dxp3-net-tcp/TCPServerPort} TCPServerPort */
tcp.TCPServerPort = require('./TCPServerPort');
/** @member {module:dxp3-net-tcp/TCPServerState} TCPServerState */
tcp.TCPServerState = require('./TCPServerState');

module.exports = tcp;