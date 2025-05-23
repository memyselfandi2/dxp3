/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-net-file
 *
 * NAME
 * FileClientCLI
 */
const packageName = 'dxp3-net-file';
const moduleName = 'FileClientCLI';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * @module dxp3-net-file/FileClientCLI
 */
const logging = require('dxp3-logging');
const util = require('dxp3-util');
const readline = require('readline');
const FileClient = require('./FileClient'); 
const FileClientEvent = require('./FileClientEvent'); 
const FileClientOptions = require('./FileClientOptions'); 
/**
 * A FileClient command line interface program.
 */
class FileClientCLI {
	/**
	 * @param {module:dxp3-net-file/FileClient~FileClient} _fileClient
	 */
	constructor(_fileClient) {
		this._fileClient = _fileClient;
		this._rl = null;
		this._state = 'PARSE';
	}

	start() {
		this._rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout,
			prompt: 'DXP3-FILE-CLIENT>'
		});
		this._rl.on('close', () => {
			this._parseExit();
		});
		this._fileClient.on(FileClientEvent.CLOSED, () => {
			console.log('FileClient closed.');
			this._rl.prompt();
		});
		this._fileClient.on(FileClientEvent.CONNECTED, () => {
			console.log('FileClient connected.');
			this._rl.prompt();
		});
		this._fileClient.on(FileClientEvent.CONNECTING, () => {
			console.log('FileClient connecting.');
			this._rl.prompt();
		});
		this._fileClient.on(FileClientEvent.SOCKET_CONNECTED, (socketPoolID, socketID, remoteAddress, remotePort) => {
			console.log('Socket pool ' + socketPoolID + ' connected socket ' + socketID + ' to ' + remoteAddress + ':' + remotePort + '.');
			this._rl.prompt();
		});
		this._fileClient.on(FileClientEvent.SOCKET_POOL_CLOSED, (socketPoolID) => {
			console.log('Socket pool ' + socketPoolID + ' closed.');
			this._rl.prompt();
		});
		this._fileClient.on(FileClientEvent.SOCKET_POOL_CONNECTED, (socketPoolID, remoteAddress, remotePort) => {
			console.log('Socket pool ' + socketPoolID + ' connected to ' + remoteAddress + ':' + remotePort + '.');
			this._rl.prompt();
		});
		this._fileClient.on(FileClientEvent.SOCKET_TIMEOUT, (socketPoolID, socketID) => {
			console.log('Socket pool ' + socketPoolID + ' timed out socket ' + socketID + '.');
			this._rl.prompt();
		});
		this._fileClient.on(FileClientEvent.SOCKET_CLOSED, (socketPoolID, socketID) => {
			console.log('Socket pool ' + socketPoolID + ' closed socket ' + socketID + '.');
			this._rl.prompt();
		});
		this._fileClient.on(FileClientEvent.ERROR, (err) => {
			console.log('Connection error: ' + err);
			this._rl.prompt();
		});
		this._fileClient.on(FileClientEvent.QUEUING, () => {
			console.log('FileClient queuing.');
			this._rl.prompt();
		});
		console.log('Use this interface to communicate with a FileServer.');
		this._parse();
	}

	_parse() {
		this._rl.prompt();
		this._rl.on('line', (line) => {
			this._parseLine(line);
		});
	}

	async _parseLine(line) {
		let command = null;
		let commandArguments = null;
		let subCommand = null;
		let subCommandArguments = null;
		let lineLowerCase = null;
		line = line.trim();
		lineLowerCase = line.toLowerCase();
		let parts = line.split(' ');
		command = parts[0];
		if(parts.length === 1) {
			commandArguments = '';
			subCommand = '';
			subCommandArguments = '';
		} else if(parts.length > 1) {
			commandArguments = '';
			for(let i=1;i < parts.length;i++) {
				commandArguments += parts[i] + ' ';
			}
			commandArguments = commandArguments.trim();
			subCommand = parts[1];
			subCommandArguments = '';
			if(parts.length > 2) {
				for(let i=2;i < parts.length;i++) {
					subCommandArguments += parts[i] + ' ';
				}
				subCommandArguments = subCommandArguments.trim();
			}
		}
		switch(this._state) {
			case 'PARSE_LOGGING':
				this._parseLogging(line);
				this._state = 'PARSE';
				break;
			case 'PARSE_WRITE':
				let msg = line;
				this._fileClient.send(msg, (error, socket) => {
					if(error) {
						console.log('Error: ' + error);
					} else {
						socket.readFile('C:\\temp\\henkie.jpg');
					}
					this._rl.prompt();
				});
				this._state = 'PARSE_CMD';
				break;
			case 'PARSE_CONNECT':
				let addressPort = line.split(':');
				let address = addressPort[0];
				let port = addressPort[1];
				if(port === undefined || port === null) {
					port = 0;
				}
				this._fileClient.connect(address, port);
				this._state = 'PARSE_CMD';
				break;
			default:
				switch(line) {
					case 'clear':
						console.clear();
						break;
					case 'connect':
						console.log('Specify the address and port separated by a :');
						this._state = 'PARSE_CONNECT';
						break;
					case 'log':
					case 'logger':
					case 'logging':
					case 'loglevel':
						if(commandArguments.length > 0) {
							this._parseLogging(commandArguments);
						} else {
							console.log('What should the log level be?');
							console.log('Type trace,debug,info,warning,error,fatal or off.');
							console.log('Type cancel, exit, quit or stop to cancel.');
							this._state = 'PARSE_LOGGING';
						}
						break;
					case 'disconnect':
					case 'destroy':
						this._state = 'PARSE_DISCONNECT';
						break;
					case 'close':
					case 'stop':
						this._fileClient.close();
						break;
					case 'list':
					case 'connections':
						break;
					case 'send':
					case 'msg':
					case 'message':
					case 'write':
					case 'retrieve':
					case 'get':
						console.log('Specify the message (or file string) to send.');
						this._state = 'PARSE_WRITE';
						break;
					case 'config':
					case 'configuration':
					case 'prefs':
					case 'preferences':
					case 'settings':
					case 'status':
					case 'state':
						this._parseStatus();
						break;
					case 'exit':
					case 'quit':
						this._parseExit();
						break;
					case 'help':
					case 'info':
					case 'information':
					case 'faq':
						this._parseHelp();
						break;
					default:
						break;
				}
				break;
		}
		this._rl.prompt();
	}

	_parseStatus() {
		console.log('State  : ' + this._fileClient.getState());
		console.log('Logging: ' + logging.Level.toString(logging.getLevel()));
		this._rl.prompt();
	}

	_parseExit() {
		console.log('Goodbye.');
		process.exit(1);
	}

	_parseLogging(line) {
		let lineLowerCase = line.toLowerCase();
		if(lineLowerCase === 'cancel'  || lineLowerCase === 'exit' ||
		   lineLowerCase === 'quit'    || lineLowerCase === 'stop') {
		   	console.log('Cancelled.');
			this._rl.prompt();
			return;
		}
		logging.setLevel(line);
		console.log('Logging set to \'' + logging.Level.toString(logging.getLevel()) + '\'.');
		this._rl.prompt();
	}

	_parseHelp() {
		// Clear the scroll buffer.
		process.stdout.write('\u001b[3J\u001b[1J');
		// Clear the window.
		console.clear();
		console.log('CONFIGURATION / PREFERENCES: Commands to control the FileClient.');
		console.log('');
		console.log('COMMAND -----------------------------+ ALIASES -------------+ DESCRIPTION -----------------------------------+');
		console.log('close                                + stop,                + Disconnect/destroy all connections.            |');
		console.log('connect           			          +                      + Connect to a FileServer.                       |');
		console.log('                                     |                      | You will be prompted to provide an address and |');
		console.log('                                     |                      | port.                                          |');
		console.log('disconnect                           + destroy              + Disconnect from a FileServer.                  |');
		console.log('send                                 +                      + Request a file from the server.                |');
		console.log('status                               + config,              + Get the current state of the FileClient.       |');
		console.log('                                     | configuration,       |                                                |');
		console.log('                                     | prefs, preferences,  |                                                |');
		console.log('                                     | settings, state      |                                                |');
		console.log('-------------------------------------+----------------------+------------------------------------------------+');
		console.log('');
		console.log('PROGRAM FLOW: Commands to control this command line interface program.');
		console.log('');
		console.log('COMMAND -----------------------------+ ALIASES -------------+ DESCRIPTION -----------------------------------+');
		console.log('clear                                +                      + Clear the console/screen.                      |')
		console.log('exit                                 + quit                 + Exit this program.                             |');
		console.log('help                                 + faq, info,           + Show this help screen.                         |');
		console.log('                                     + information          +                                                |');
		console.log('loglevel            <level>          + log, logger, logging + Set the log level.                             |');
		console.log('                                     |                      | One of trace, debug, info, warning, error,     |');
		console.log('                                     |                      | fatal or off.                                  |');
		console.log('-------------------------------------+----------------------+------------------------------------------------+');
		console.log('');
	}

	static main() {
		try {
			let fileClientOptions = FileClientOptions.parseCommandLine();
			logging.setLevel(fileClientOptions.logLevel);
			if(fileClientOptions.help) {
				console.log('help apparently');
				// util.Help.print(this);
				// return;
			}
			let fileClient = new FileClient(fileClientOptions);
			let fileClientCLI = new FileClientCLI(fileClient);
			fileClientCLI.start();
		} catch(_exception) {
			console.log('EXCEPTION:'  + _exception);
		}
	}
}
// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
	FileClientCLI.main();
	return;
}

module.exports = FileClientCLI;