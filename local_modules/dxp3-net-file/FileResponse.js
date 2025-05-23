const fs = require('fs');

class FileResponse {

	constructor(_request, _client, _next) {
		this.request = _request;
		this.client = _client;
		this.next = _next;
	}
	respond(error, fileName) {
		this.send(...arguments);
	}
	reply(error, fileName) {
		this.send(...arguments);
	}
	write(error, fileName) {
		this.send(...arguments);
	}
	send(error, fileName) {
		this.sendFile(error, fileName);
	}
	sendFile(error, fileName) {
		let self = this;
		if(arguments.length === 1) {
			fileName = arguments[0];
			error = null;
		}
		self.client.writeFile(fileName).then(
			(bytesSend) => {
				console.log('Number of bytes written: ' + bytesSend);
				if(self.next) {
					self.next(null);
				}
			},
			(error) => {
				if(self.next) {
					self.next(error);
				}
			}
		);
	}
}

module.exports = FileResponse;