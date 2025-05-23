/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-net-file
 *
 * NAME
 * FileClient
 */
const packageName = 'dxp3-net-file';
const moduleName = 'FileClient';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * @module dxp3-net-file/FileClient
 */
const EventEmitter = require('events');
const FileClientOptions = require('./FileClientOptions');
const FileClientState = require('./FileClientState');
const logging = require('dxp3-logging');
const tcp = require('dxp3-net-tcp');
const util = require('dxp3-util');

const logger = logging.getLogger(canonicalName);

class FileClient extends tcp.TCPClient {

	constructor(_options) {
		_options = FileClientOptions.parse(_options);
		// Our options are essentially the same as TCPClientOptions.
		// We can simply reuse them when constructing our TCPClient.
		super(_options);
		this._options = _options;
		// Every message we send will get an 'unique' id.
		// It is only unique during this instance's lifetime.
		this.messageID = 0;
		// All done constructing our FileClient.
		// It is time to set our state to INITIALIZED.
		this._state = FileClientState.INITIALIZED;
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

	static main() {
		try {
			let fileClientOptions = FileClientOptions.parseCommandLine();
			logging.setLevel(fileClientOptions.logLevel);
			if(fileClientOptions.help) {
				util.Help.print(this);
				return;
			}
			let fileClient = new FileClient(fileClientOptions);
		} catch(exception) {
			console.log('Exception: ' + exception);
		}
	}
}
// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
	FileClient.main();
	return;
}

module.exports = FileClient;