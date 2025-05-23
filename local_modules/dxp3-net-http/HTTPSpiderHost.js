/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-net-http
 *
 * NAME
 * HTTPSpiderHost
 */
const packageName = 'dxp3-net-http';
const moduleName = 'HTTPSpiderHost';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * @module dxp3-net-http/HTTPSpiderHost
 */
const dns = require('dns');
// We use the util.Help class to print out help information.
const util = require('dxp3-util');

class HTTPSpiderHost {

	constructor(_hostName, _port) {
		let self = this;
		self._hostName = _hostName;
		self._port = -1;
		if(_port != undefined && _port != null) {
			if(typeof _port === 'string') {
				_port = _port.trim();
				_port = parseInt(_port);
				if(!isNaN(_port)) {
					self._port = _port;
				}
			} else if(typeof _port === 'number') {
				self._port = _port;
			}
		}
		self._address = 'Resolving...';
		dns.lookup(self._hostName, (_error, _address, _family) => {
			if(_error) {
				self._address = 'Error resolving';
				return;
			}
			self._address = _address;
		});
		this.deadSpiderLinks = new Map();
	}

	get address() {
		return this.getAddress();
	}

	getAddress() {
		return this._address;
	}

	get hostName() {
		return this.getHostName();
	}

	getHostName() {
		return this._hostName;
	}

	get port() {
		return this.getPort();
	}

	getPort() {
		return this._port;
	}
}
// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
    util.Help.print(HTTPSpiderHost);
    return;
}
module.exports = HTTPSpiderHost;