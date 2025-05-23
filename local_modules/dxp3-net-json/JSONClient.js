/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-net-json
 *
 * NAME
 * JSONClient
 */
const packageName = 'dxp3-net-json';
const moduleName = 'JSONClient';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * @module dxp3-net-json/JSONClient
 */
const EventEmitter = require('events');
const JSONClientOptions = require('./JSONClientOptions');
const JSONClientCLI = require('./JSONClientCLI');
const JSONClientState = require('./JSONClientState');
const logging = require('dxp3-logging');
const tcp = require('dxp3-net-tcp');
const util = require('dxp3-util');

const logger = logging.getLogger(canonicalName);

class JSONClient extends tcp.TCPClient {

	constructor(args) {
		args = JSONClientOptions.parse(args);
		// Our arguments are essentially the same as TCPClientOptions.
		// We can simply reuse them when constructing our TCPClient.
		super(args);
		this.args = args;
		// Every message we send will get an 'unique' id.
		// It is only unique during this instance's lifetime.
		this.messageID = 0;
		// All done constructing our JSONClient.
		// It is time to set our state to INITIALIZED.
		this._state = JSONClientState.INITIALIZED;
	}

	sendFile(message, file, callback) {
	    // If the supplied message is not an object, lets encapsulate it
	    // in an object.
	    if(typeof message != 'object') {
	      let msg = message;
	      message = {};
	      message.message = msg;
	    }
	    // Get an unique message identifier
	    message.ID = this.messageID++;
	    // Our reply handler will make sure the socket gets released when
	    // a reply has been received or the socket gets destroyed
	    // when something went wrong.
		let replyHandler = function(error, socket) {
			if(error) {
				logger.error(error);
				socket.destroy();
				callback(error);
			} else {
				socket.readJSON().then(
					// Resolve
					(json) => {
						socket.release();
						callback(json.error, json.result);
					},
					(error) => {
						socket.destroy();
						callback(error);
					}
				);
			}
		}
		super.sendFile(message, file, replyHandler);
	}

	receiveFile(message, callback) {
	    // If the supplied message is not an object, lets encapsulate it
	    // in an object.
	    if(typeof message != 'object') {
	      let msg = message;
	      message = {};
	      message.message = msg;
	    }
	    // Get an unique message identifier
	    message.ID = this.messageID++;
	    // Our reply handler will make sure that the socket gets released when
	    // a reply has been received or that the socket gets destroyed
	    // when something went wrong.
		let replyHandler = function(error, socket) {
			if(error) {
				logger.error(error);
				socket.destroy();
				callback(error);
			} else {
				socket.once('stream.end', function(error, bytesRead) {
					if(error) {
						socket.destroy();
					} else {
						socket.release();
					}
				});
				callback(error, socket);
			}
		}
		super.send(message, replyHandler);
	}

	send(message, callback) {
	    // If the supplied message is not an object, lets encapsulate it
	    // in an object.
	    if(typeof message != 'object') {
	      let msg = message;
	      message = {};
	      message.message = msg;
	    }
	    // Get an unique message identifier
	    message.ID = this.messageID++;
	    
	    // console.log('JSONClient send: ' + JSON.stringify(message));

	    // Our reply handler will make sure the socket gets released when
	    // a reply has been received or the socket gets destroyed
	    // when something went wrong.
		let replyHandler = (error, socket) => {
			if(error) {
				logger.error(error);
				if((socket != undefined) && (socket != null)) {
					socket.destroy();
				}
				callback(error);
			} else {
				socket.readJSON().then(
					// Resolve
					(json) => {
						socket.release();
						callback(json.error, json.result);
					},
					(error) => {
						socket.destroy();
						callback(error);
					}
				);
			}
		}
		super.send(message, replyHandler);
	}
	/**
	 * Alias for send(...)
	 */
	sendJSON(message, callback) {
		this.send(message, callback);
	}
	/**
	 * Alias for send(...)
	 */
	sendObject(object, callback) {
		this.send(object, callback);
	}
	/**
	 * Alias for send(...)
	 */
	writeJSON(json, callback) {
		// console.log('JSONClient.writeJSON: ' + JSON.stringify(json));
		this.send(json, callback);
	}
	/**
	 * Alias for send(...)
	 */
	writeObject(object, callback) {
		this.send(object, callback);
	}

	static main() {
		try {
	        let jsonClientOptions = JSONClientOptions.parseCommandLine();
	        logging.setLevel(jsonClientOptions.logLevel);
	        if(jsonClientOptions.help) {
	            util.Help.print(this);
	            return;
	        }
			let jsonClient = new JSONClient(jsonClientOptions);
			jsonClient.send({data:"test"});
		} catch(exception) {
			console.log(exception.message);
		}
	}
}
// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
	JSONClient.main();
	return;
}

module.exports = JSONClient;