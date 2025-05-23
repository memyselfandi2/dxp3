const HTTPServer = require('./HTTPServer');

let httpServer = new HTTPServer({secure:false,port:80});
httpServer.all('*', (_request, _response) => {
	_response.redirect('https://' + _request.host + '/');
});
httpServer.start();