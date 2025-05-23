/**
 * DXP3 - Digital Experience Platform 3<br/>
 * <br/>
 * PACKAGE<br/>
 * dxp3-net-http<br/>
 * <br/>
 * NAME<br/>
 * HTTPRouteRegexp<br/>
 * <br/>
 * DESCRIPTION<br/>
 */
const packageName = 'dxp3-net-http';
const moduleName = 'HTTPRouteRegexp';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * @module dxp3-net-http/HTTPRouteRegexp
 */
const HTTPRoute = require('./HTTPRoute');
const logging = require('dxp3-logging');
const util = require('dxp3-util');

const logger = logging.getLogger(canonicalName);

class HTTPRouteRegexp {
	constructor(_method, _regexpString, _callback) {
		this.method = _method;
		this.regexpString = _regexpString;
		this.regexp = HTTPRouteRegexp.toRegExp(_regexpString);
		this.callback = _callback;
		this.nextHTTPRouteRegexp = null;
	}

	addHTTPRouteRegexp(httpRouteRegexp) {
		if(this.nextHTTPRouteRegexp === null) {
			this.nextHTTPRouteRegexp = httpRouteRegexp;
		} else {
			this.nextHTTPRouteRegexp.addHTTPRouteRegexp(httpRouteRegexp);
		}
	}

	static toRegExp(routeString) {
		if(routeString === undefined || routeString === null) {
			return null;
		}
		if(typeof routeString != 'string') {
			return null;
		}
		routeString = routeString.trim();
		if(routeString.length <= 0) {
			return null;
		}
		let state = 'PARSING';
		let characterArray = Array.from(routeString)
		let i=0;
		let tmpString = '';
		let regexpString = '^';
		while(i < characterArray.length) {
			let character = characterArray[i];
			switch(state) {
				case 'PARSING':
					if(character === ':') {
						regexpString += '(?<';
						tmpString = '';
						state = 'PARSING_VARIABLE';
					} else if(character === '*') {
						regexpString += '(.*?)';
					} else {
						regexpString += character;
					}
					break;
				case 'PARSING_VARIABLE':
					if(character === '/') {
						regexpString += tmpString;
						regexpString += '>[,\'\\\w.-\\\s]+)/';
						state = 'PARSING';
					} else {
						tmpString += character;
					}
					break;
				default:
					break;
			}
			i++;
		}
		if(state === 'PARSING_VARIABLE') {
			regexpString += tmpString;
			regexpString += '>[,\'\\\w.-\\\s]+)';
		}
		regexpString += '$';
		return new RegExp(regexpString);

		// regexpString = regexpString.replace(/[-\/\\^$+?.()|[\]{}]/g, '\\$&');
		// let regexp = null;
		// if(regexpString.endsWith('*')) {
		// 	regexpString = regexpString.slice(0, -1);
		// 	regexpString += '(.*?)$';
		// 	regexp = new RegExp('^' + regexpString);
		// } else {
		// 	regexp = new RegExp('^' + regexpString + '$');
		// }
		// return regexp;
	}

	handle(httpRequest, httpResponse) {
		let self = this;
		let requestURLPath = httpRequest.pathname;
		// console.log('HTTPRouteRegexp \'' + this.regexpString + '\' (parsed: \'' + this.regexp.toString() + '\') checking: ' + requestURLPath);
		let	match = self.regexp.exec(requestURLPath);
		if(match) {
			httpRequest.params = match.splice(1,1);
//			httpRequest.params = match;
			if(match.groups) {
				for(let prop in match.groups) {
					if(match.hasOwnProperty(prop)) {
						httpRequest.params[prop] = match.groups[prop]; 
					}
				}
				// BUG? This seems weird considering the for loop above.
				httpRequest.params = match.groups;
			}
			let httpRoute = new HTTPRoute(httpRequest, httpResponse, self);
			// console.log('HTTPRouteRegexp \'' + this.regexpString + '\' matched: ' + requestURLPath);
			self.callback(httpRequest, httpResponse, httpRoute);
		} else if(this.nextHTTPRouteRegexp != null) {
			this.nextHTTPRouteRegexp.handle(httpRequest, httpResponse);
		} else {
			logger.info('404 for \'' + requestURLPath + '\'');
			httpResponse.status(404).send('404 Not Found');
		}
	}
}
// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
    util.Help.print(httpRouteRegexp);
    return;
}
module.exports = HTTPRouteRegexp;