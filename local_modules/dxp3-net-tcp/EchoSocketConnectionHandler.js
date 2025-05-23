const path = require('path');

const echoSocketConnectionHandler = function(_tcpSocket) {
	let processMessage = function() {
		_tcpSocket.read().then(function(msg) {
			msg = '' + msg;
			if(msg.startsWith('{') && msg.endsWith('}')) {
				let reply = {
					message: 'Server received message'
				}
				_tcpSocket.writeJSON(reply).then(
					() => {
					},
					(error) => {
						_tcpSocket.destroy();
					}
				);
			} else {
				let reply = 'Server received: ' + msg;
				_tcpSocket.write(reply).then(
					() => {
					},
					(error) => {
						_tcpSocket.destroy();
					}
				);
			}
			processMessage();
		});
	}
	processMessage();
}

module.exports = echoSocketConnectionHandler;