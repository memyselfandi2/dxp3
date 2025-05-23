****************************************
* DXP3 - Digital Experience Platform 3 *
*                                      *
* MODULE: dxp3-net                     *
****************************************
The dxp3-net module contains all the necessary functionality to configure and
run HTTP/TCP/UDP servers and/or clients.
Make sure this local module is defined as a dependency in your package.json.
Typically the dependency is defined by a file reference using a relative path.
Obviously that relative path may be different for different modules.
Here is an example of such a dependency in a package.json:
"dependencies": {
  "dxp3-net": "file:../../../local_modules/dxp3-net"
}

****************************************
* EXAMPLES                             *
****************************************

// Get a reference to our net code.
const net = require('dxp3-net');
// Create a http server.
let myHTTPServer = new net.HTTPServer();
// Listen for the running event. That way we know we started properly.
myHTTPServer.on(net.HTTPServerEvents.RUNNING, function() {
    console.log('HTTP server is running');	
});
// Listen for any errors.
myHTTPServer.on(net.HTTPServerEvents.ERROR, function(err) {
    console.log('Something went wrong: ' + err);
});
// Lets set the port. If we don't supply a port, a free one will be 
// found for us.
myHTTPServer.setPort(8081);
// Everything is in place to attempt a hopefully successful start.
myHTTPServer.start();