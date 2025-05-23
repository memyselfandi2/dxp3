***************************************************************
* DXP3 - Digital Experience Platform 3                        *
*                                                             *
* MODULE: dxp3-net-http                                       *
***************************************************************

This module contains everything one needs to run a HTTP server/client,
a HTTP Reverse Proxy or a HTTP Spider. Make sure this local module
is defined as a dependency in your package.json. Typically
the dependency is defined by a file reference using a relative path.
Obviously that relative path may be different for different modules.
Here is an example of such a dependency in a package.json:
"dependencies": {
    "dxp3-net-http": "file:../../../local_modules/dxp3-net-http"
}

***************************************************************
* CODE EXAMPLES                                               *
***************************************************************

const http = require('dxp3-net-http');
// Set our host, port and timeout
let httpServerOptions = {};
// Typically one would listen on all available interfaces.
// However we can bind to a specific interface by specifying
// the IP address. To bind on all interfaces use the 
// 0.0.0.0 IP address.
httpServerOptions.address = '127.0.0.1';
httpServerOptions.port = 8080;
httpServerOptions.timeout = 10000;
// A HTTPServer may host multiple domains.
// Each domain will have its own routes.
httpServerOptions.domains = 'www.example.com, something.domain.org';
httpServerOptions.roots = '/var/www/example.com, /var/www/domain.org';
// Create a new HTTPServer
let httpServer = new http.HTTPServer(httpServerOptions);
httpServer.on(http.HTTPServerEvent.ERROR, (_error) => {
    console.log('HTTPServer errror: ' + _error);
});
httpServer.on(http.HTTPServerEvent.RUNNING, (_address, _port) {
    console.log('HTTPServer is running at ' + _address + ':' + _port);
});
// We can also add domains like so:
httpServer.addDomain('www.blaat.org', '/var/www/blaat.org/');
// Start the server
httpServer.start();

***************************************************************
* COMMAND LINE OPTIONS                                        *
***************************************************************

The HTTPClient, HTTPClientCLI, HTTPReverseProxy, HTTPReverseProxyCLI,
HTTPServer and HTTPServerCLI can all be executed from the command line.
Their command line options are explained in their respective help
documentation.

> node HTTPClient -help

> node HTTPReverseProxy -help

> node HTTPServer -help

***************************************************************
* COMMAND LINE EXAMPLES                                       *
***************************************************************

How to quickly start a HTTPServer on port 80 serving static content
from a local folder:

> node HTTPServer C:\temp\localhost\ -secure false

How to quickly retrieve a resource:

> node HTTPClient google.com

If you need fine grained control one should use the respective
command line interfaces:

> node HTTPClientCLI

> node HTTPServerCLI

> node HTTPReverseProxyCLI
