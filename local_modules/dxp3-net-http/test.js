const http = require('./index');
const HTTPServerEvent = http.HTTPServerEvent;
// Set our host, port and timeout
let httpServerOptions = {};
httpServerOptions.address = '127.0.0.1';
httpServerOptions.port = 8080;
httpServerOptions.secure = false;
httpServerOptions.timeout = 10000;
httpServerOptions.domains = 'www.example.com, something.domain.org,localhost';
httpServerOptions.roots = '/var/www/example.com, /var/www/domain.org,/var/www/localhost';
httpServerOptions.redirects = [{domains:"example.com",regexp:"/images/:image",location:"https://{request.host}/galleries/{image}"}]
// Create a new HTTPServer
let httpServer = new http.HTTPServer(httpServerOptions);
httpServer.on(HTTPServerEvent.ADDED_CLIENT, () => {
    console.log('Added client.');
});
httpServer.on(HTTPServerEvent.DATA, () => {
    console.log('Data.');
});
httpServer.on(HTTPServerEvent.ERROR, (_error) => {
    console.log(_error.code + ':' + _error.message);
});
httpServer.on(HTTPServerEvent.CLOSED_CLIENT, () => {
    console.log('Closed client.');
});
httpServer.on(HTTPServerEvent.RUNNING, () => {
    console.log('Running.');
});
httpServer.on(HTTPServerEvent.STARTING, () => {
    console.log('Starting.');
});
httpServer.on(HTTPServerEvent.STOPPED, () => {
    console.log('Stopped.');
});
httpServer.on(HTTPServerEvent.STOPPING, () => {
    console.log('Stopping.');
});
httpServer.get('/heartbeat', 'localhost', (_request, _response) => {
   _response.send('Still alive');
});
// Start the server
httpServer.start();