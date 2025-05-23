/**
 * DXP3 - Digital Experience Platform 3<br/>
 * <br/>
 * PACKAGE<br/>
 * dxp3-net-http<br/>
 * <br/>
 * NAME<br/>
 * HTTPRoute<br/>
 * <br/>
 * DESCRIPTION<br/>
 *
 * @module dxp3-net-http/HTTPRoute
 */
const packageName = 'dxp3-net-http';
const moduleName = 'HTTPRoute';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
// Check if someone tried to run/execute this file.
const util = require('dxp3-util');
if(util.Assert.isFileToExecute(canonicalName)) {
    util.Help.print();
    return;
}
const logging = require('dxp3-logging');
const logger = logging.getLogger(canonicalName);

class HTTPRoute {
	constructor(_httpRequest, _httpResponse, _httpRouteRegexp) {
		this.httpRequest = _httpRequest;
		this.httpResponse = _httpResponse;
		this.httpRouteRegexp = _httpRouteRegexp;
	}

	next() {
		let nextHTTPRouteRegexp = this.httpRouteRegexp.nextHTTPRouteRegexp;
		if(nextHTTPRouteRegexp === null) {
			logger.debug('next(): Sending 404 for ' + this.httpRequest.host + this.httpRequest.request.url);
			this.httpResponse.status(404).send('404 Not Found\n');
			return;
		}
		nextHTTPRouteRegexp.handle(this.httpRequest, this.httpResponse);
	}
}

module.exports = HTTPRoute;