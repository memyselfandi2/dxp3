/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-net-http
 *
 * NAME
 * HTTPClientError
 */
const packageName = 'dxp3-net-http';
const moduleName = 'HTTPClientError';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * @see module:dxp3-net-http/HTTPError
 *
 * @module dxp3-net-http/HTTPClientError
 */
const HTTPError = require('./HTTPError');
// We use the util.Help class to print out help information.
const util = require('dxp3-util');

/**
 * @extends module:dxp3-net-http/HTTPError~HTTPError
 */
class HTTPClientError extends HTTPError {
    /*********************************************
     * CONSTRUCTOR
     ********************************************/

	constructor(_code, _message) {
		super(_code, _message);
	}
}
// Thrown when you attempt to go back or forward when there is no history yet.
HTTPClientError.NO_HISTORY = new HTTPClientError('NO_HISTORY', 'No history');
// Thrown when you attempt to go back,
// but you are already at the beginning of time.
HTTPClientError.AT_HISTORY_START = new HTTPClientError('AT_HISTORY_START', 'At history start');
// Thrown when you attempt to go forward,
// but you are already at the present.
HTTPClientError.AT_HISTORY_END = new HTTPClientError('AT_HISTORY_END', 'At history end');
// Thrown when you attempt to refresh,
// but there is no url to refresh.
HTTPClientError.NO_URL = new HTTPClientError('NO_URL', 'No URL');

// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
    util.Help.print(HTTPClientError);
    return;
}
module.exports = HTTPClientError;