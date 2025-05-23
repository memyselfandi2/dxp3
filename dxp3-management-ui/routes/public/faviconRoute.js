const path = require('path');

module.exports = function(webServer) {
	webServer.get('/favicon.ico', function(req, res) {
		console.log("GOT FAVICON.ICO GET REQUEST");
        res.sendFile('favicon.ico', {root: __dirname}, function(err) {
        });
	});
}