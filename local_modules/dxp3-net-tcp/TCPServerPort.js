/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-net-tcp
 *
 * NAME
 * TCPServerPort
 */
const packageName = 'dxp3-net-tcp';
const moduleName = 'TCPServerPort';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * @module dxp3-net-tcp/TCPServerPort
 */
const logging = require('dxp3-logging');
const net = require('net');
const TCPError = require('./TCPError');
const util = require('dxp3-util');
// CONSTANTS
const DEFAULT_START_PORT = 8000;
const DEFAULT_END_PORT = 65535;

const logger = logging.getLogger(canonicalName);

class TCPServerPort {
	/**
	 * @throws module:dxp3-net-tcp/TCPError when no callback function is supplied or
	 *                                      when the start port is greater than the end port.
	 */
	static getAvailablePort(_startPort, _endPort, callback) {
		if(arguments.length <= 0) {
			throw TCPError.ILLEGAL_ARGUMENT;
		}
		if(arguments.length === 1) {
			_startPort = null;
			_endPort = null;
			callback = arguments[0];
		}
		if(arguments.length === 2) {
			_startPort = arguments[0];
			_endPort = null;
			callback = arguments[1];
		}
		let startPort = DEFAULT_START_PORT;
		if(_startPort != undefined && _startPort != null) {
			if(typeof _startPort === 'string') {
				_startPort = parseInt(_startPort, 10);
			}
			if(typeof _startPort === 'number') {
				if(_startPort > 0) {
					startPort = _startPort;
				}
			}
		}
		let endPort = DEFAULT_END_PORT;
		if(_endPort != undefined && _endPort != null) {
			if(typeof _endPort === 'string') {
				_endPort = parseInt(_endPort);
			}
			if(typeof _endPort === 'number') {
				if(_endPort > 0) {
					endPort = _endPort;
				}
			}
		}
		if(startPort > endPort) {
			let error = TCPError.ILLEGAL_ARGUMENT;
			error.message = 'The start port ' + startPort + ' is greater than the end port ' + endPort + '.'; 
			return callback(error, -1);
		}
		let tryServer = function(_port, callback) {
			let port = _port;
			let server = net.createServer();
			server.on('error', function(err) {
				callback('Error', port);
			});
			server.on('listening', function() {
				server.close(function() {
					callback(null, port);
				});
			});
			logger.debug('Checking if port ' + port + ' is open.');
			server.listen(port, "0.0.0.0");
		}
		let evaluateResult = function(err, port) {
			if(err === null) {
				logger.debug('Found open port ' + port + ' between ' + startPort + ' and ' + endPort + '.');
				return callback(null, port);
			}
			if(port < endPort) {
				port = port + 1;
				tryServer(port, evaluateResult);
				return;
			}
			let error = TCPError.SOCKET_EXCEPTION;
			error.message = 'Unable to find an open port between ' + startPort + ' and ' + endPort + '.'; 
			return callback(error, -1);
		}
		logger.debug('Attempt to find an open port between ' + startPort + ' and ' + endPort + '.');
		tryServer(startPort, evaluateResult);
	}

	static main() {
		let parseCommandLine = function() {
			let result = {};
			let commandLineOptions = new util.CommandLineOptions();
			let commandLineOption = commandLineOptions.createFlag('help',
																'faq,info,information',
																'help');
			commandLineOptions.add(commandLineOption);
			commandLineOption = commandLineOptions.createObjectArray('loglevel',
																'log,logger,logging',
																'logLevel');
			commandLineOption.addStringProperty('regexp');
			commandLineOption.addEnumerationProperty('level', logging.Level);
			commandLineOptions.add(commandLineOption);
			commandLineOption = commandLineOptions.createNumber('start',
																'startport',
																'startPort');
			commandLineOptions.add(commandLineOption);
			commandLineOption = commandLineOptions.createNumber('end',
																'endport',
																'endPort');
			commandLineOptions.add(commandLineOption);
			result = commandLineOptions.parse(result);
			return result;
		}

		try {
			let tcpServerPortOptions = parseCommandLine();
			logging.setLevel(tcpServerPortOptions.logLevel);
			if(tcpServerPortOptions.help) {
				util.Help.print(this);
				return;
			}
			let startPort = tcpServerPortOptions.startPort;
			let endPort = tcpServerPortOptions.endPort;
			TCPServerPort.getAvailablePort(startPort, endPort, function(err, openPort) {
				if(err) {
					console.log(err.message);
					return;
				}
				console.log('Found an open port: ' + openPort);
			})
		} catch(exception) {
			console.log(exception.message);
		}				
	}
}
// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
	TCPServerPort.main();
	return;
}

module.exports = TCPServerPort;