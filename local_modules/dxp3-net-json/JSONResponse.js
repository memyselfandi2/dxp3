const fs = require('fs');

class JSONResponse {

	constructor(_request, _client, _next) {
		this.request = _request;
		this.client = _client;
		this.next = _next;
	}
	respond(error, result) {
		this.send(...arguments);
	}
	reply(error, result) {
		this.send(...arguments);
	}
	write(error, result) {
		this.send(...arguments);
	}
	send(error, result) {
		if(arguments.length === 1) {
			result = arguments[0];
			error = null;
		}
		let reply = {
			ID: this.request.ID,
			error: error,
			result: result
		}
// console.log('JSONResponse: ' + JSON.stringify(reply));
		let self = this;
		this.client.writeJSON(reply).then(
			() => {
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
	sendFile(error, fileName) {
		let self = this;
		if(arguments.length === 1) {
			fileName = arguments[0];
			error = null;
		}
		this.client.writeFile(fileName).then(
			(bytesSend) => {
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
	sendError(error) {
		let reply = {
			ID: this.request.ID,
			error: error,
			result: null
		}
		let self = this;
		this.client.writeJSON(reply).then(
			() => {
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

module.exports = JSONResponse;