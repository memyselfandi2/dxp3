// const http = require('dxp3-net-http');
const http = require('../index');
let httpServer = new http.HTTPServer({port:80, secure: false, domains:'*'});
httpServer.on(http.HTTPServerEvent.RUNNING, (_address, _port) => {
    console.log('Running @ ' + _address + ':' + _port);
});
httpServer.on(http.HTTPServerEvent.STARTING, () => {
    console.log('Starting.');
});
httpServer.get('*', (_request, _response, _next) => {
    console.log('Received a request: ' + _request.host + ' -> ' + _request.URL.path);
    _next.next();
});
httpServer.redirect('/heartbeat', '/ping');
httpServer.get('/ping', (_request, _response) => {
    _response.send('pong');
});
httpServer.redirect('/message/:name', '/event/{name}{request.search}');
httpServer.get('/event/:name', (_request, _response) => {
    _response.send('Received event: ' + _request.params.name + ' and query: ' + _request.query.prut);
});
httpServer.start();
console.log('Allowed paths:');
console.log('http://localhost/heartbeat');
console.log('http://localhost/ping');
console.log('http://localhost/message/:name');
console.log('http://localhost/event/:name');