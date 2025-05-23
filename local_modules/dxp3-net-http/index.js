/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-net-http
 *
 * NAME
 * index
 */
const packageName = 'dxp3-net-http';
const moduleName = 'index';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * <p>This module contains everything one needs to run a HTTP server/client,
 * a HTTP Reverse Proxy or a HTTP Spider. Make sure this local module
 * is defined as a dependency in your package.json. Typically
 * the dependency is defined by a file reference using a relative path.
 * Obviously that relative path may be different for different modules.<br/>
 * Here is an example of such a dependency in a package.json:<br/>
 * "dependencies": {<br/>
 *     "dxp3-net-http": "file:../../../local_modules/dxp3-net-http"<br/>
 * }<br/>
 * </p>
 *
 * @example
 * const http = require('dxp3-net-http');
 * // Set our host, port and timeout
 * let httpServerOptions = {};
 * // Typically one would listen on all available interfaces.
 * // However we can bind to a specific interface by specifying
 * // the IP address. To bind on all interfaces use the 
 * // 0.0.0.0 IP address.
 * httpServerOptions.address = '127.0.0.1';
 * httpServerOptions.port = 8080;
 * httpServerOptions.timeout = 10000;
 * // A HTTPServer may host multiple domains.
 * // Each domain will have its own routes.
 * httpServerOptions.domains = 'www.example.com, something.domain.org';
 * httpServerOptions.roots = '/var/www/example.com, /var/www/domain.org';
 * // Create a new HTTPServer
 * let httpServer = new http.HTTPServer(httpServerOptions);
 * httpServer.on(http.HTTPServerEvent.ERROR, (_error) => {
 *     console.log('HTTPServer errror: ' + _error);
 * });
 * httpServer.on(http.HTTPServerEvent.RUNNING, (_address, _port) {
 *     console.log('HTTPServer is running at ' + _address + ':' + _port);
 * });
 * // We can also add domains like so:
 * httpServer.addDomain('www.blaat.org', '/var/www/blaat.org/');
 * // Start the server
 * httpServer.start();
 *
 * @module dxp3-net-http
 */
// We use the util.Help class to print out help information.
const util = require('dxp3-util');

const http = {};

/** @member {module:dxp3-net-http/HTTPClient} HTTPClient */
http.HTTPClient = require('./HTTPClient');
/** @member {module:dxp3-net-http/HTTPClientDefaults} HTTPClientDefaults */
http.HTTPClientDefaults = require('./HTTPClientDefaults');
/** @member {module:dxp3-net-http/HTTPClientError} HTTPClientError */
http.HTTPClientError = require('./HTTPClientError');
/** @member {module:dxp3-net-http/HTTPClientOptions} HTTPClientOptions */
http.HTTPClientOptions = require('./HTTPClientOptions');
/** @member {module:dxp3-net-http/HTTPError} HTTPError */
http.HTTPError = require('./HTTPError');
/** @member {module:dxp3-net-http/HTTPForm} HTTPForm */
http.HTTPForm = require('./HTTPForm');
/** @member {module:dxp3-net-http/HTTPFormOptions} HTTPFormOptions */
http.HTTPFormOptions = require('./HTTPFormOptions');
/** @member {module:dxp3-net-http/HTTPReverseProxy} HTTPReverseProxy */
http.HTTPReverseProxy = require('./HTTPReverseProxy');
/** @member {module:dxp3-net-http/HTTPReverseProxyDefaults} HTTPReverseProxyDefaults */
http.HTTPReverseProxyDefaults = require('./HTTPReverseProxyDefaults');
/** @member {module:dxp3-net-http/HTTPReverseProxyEvent} HTTPReverseProxyEvent */
http.HTTPReverseProxyEvent = require('./HTTPReverseProxyEvent');
/** @member {module:dxp3-net-http/HTTPReverseProxyOptions} HTTPReverseProxyOptions */
http.HTTPReverseProxyOptions = require('./HTTPReverseProxyOptions');
/** @member {module:dxp3-net-http/HTTPReverseProxyState} HTTPReverseProxyState */
http.HTTPReverseProxyState = require('./HTTPReverseProxyState');
/** @member {module:dxp3-net-http/HTTPServer} HTTPServer */
http.HTTPServer = require('./HTTPServer');
/** @member {module:dxp3-net-http/HTTPServerDefaults} HTTPServerDefaults */
http.HTTPServerDefaults = require('./HTTPServerDefaults');
/** @member {module:dxp3-net-http/HTTPServerEvent} HTTPServerEvent */
http.HTTPServerEvent = require('./HTTPServerEvent');
/** @member {module:dxp3-net-http/HTTPServerOptions} HTTPServerOptions */
http.HTTPServerOptions = require('./HTTPServerOptions');
/** @member {module:dxp3-net-http/HTTPServerState} HTTPServerState */
http.HTTPServerState = require('./HTTPServerState');
/** @member {module:dxp3-net-http/HTTPSpider} HTTPSpider */
http.HTTPSpider = require('./HTTPSpider');
/** @member {module:dxp3-net-http/HTTPSpiderEvent} HTTPSpiderEvent */
http.HTTPSpiderEvent = require('./HTTPSpiderEvent');

// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
    util.Help.print();
    return;
}
module.exports = http;