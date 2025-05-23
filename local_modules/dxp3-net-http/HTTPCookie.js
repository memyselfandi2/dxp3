/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-net-http
 *
 * NAME
 * HTTPCookie
 */
const packageName = 'dxp3-net-http';
const moduleName = 'HTTPCookie';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
// Check if someone tried to run/execute this file.
const util = require('dxp3-util');
if(util.Assert.isFileToExecute(canonicalName)) {
	util.Help.print();
	return;
}
/**
 * @module dxp3-net-http/HTTPCookie
 */
class HTTPCookie {
	constructor() {
		this.key = null;
		this.value = null;
		this.domain = null;
		this.allowSubDomains = false;
		this.path = null;
		this.maxAge = null;
		this.expires = null;
		this.sameSite = null;
		this.httpOnly = false;
		this.secure = false;
	}

	toString() {
		let result = this.key;
		result += '=' + this.value;
		if(this.allowSubDomains) {
			if(this.domain != null) {
				result += '; Domain=' + this.domain;
			}
		}
		if(this.path != null) {
			result += '; Path=' + this.path;
		}
		if(this.maxAge != null) {
			result += '; max-age=' + this.maxAge;
		}
		if(this.expires != null) {
			result += '; Expires=' + this.expires;
		}
		if(this.sameSite != null) {
			result += '; SameSite=' + this.sameSite;
		}
		if(this.secure) {
			result += '; Secure';
		}
		if(this.httpOnly) {
			result += '; HttpOnly';
		}
		return result;
	}

	static parse(_url, _resp) {
		if(_url === undefined || _url === null) {
			return [];
		}
		if(_resp === undefined || _resp === null) {
			return [];
		}
        let setCookieArray = _resp.headers['set-cookie'];
        if(setCookieArray === undefined || setCookieArray === null) {
        	return [];
        }
        if(!Array.isArray(setCookieArray)) {
        	return [];
        }
        if(setCookieArray.length <= 0) {
        	return [];
        }
        let result = [];
        for(let i=0;i < setCookieArray.length;i++) {
            let setCookie = setCookieArray[i];
            if(setCookie === undefined || setCookie === null) {
                continue;
            }
            let cookieArray = setCookie.split(';');
            if(cookieArray.length > 0) {
            	let httpCookie = new HTTPCookie();
                let keyValue = cookieArray[0].split('=');
                let key = keyValue[0].trim();
                httpCookie.key = key;
                let value = keyValue[1].trim();
                httpCookie.value = value;
                for(let i=1;i < cookieArray.length;i++) {
                	keyValue = cookieArray[i].split('=');
                	key = keyValue[0].trim().toLowerCase();
                	// Ignore empty keys
                	if(key.length <= 0) {
                		continue;
                	}
                	switch(key) {
                		case 'domain':
							value = keyValue[1].trim();
							while(value.startsWith('.')) {
								value = value.substring(1);
							}
                			httpCookie.domain = value;
                			httpCookie.allowSubDomains = true;
                			break;
                		case 'path':
                			httpCookie.path = keyValue[1].trim();
                			break;
                		case 'max-age':
                			httpCookie.maxAge = keyValue[1].trim();
                			break;
                		case 'expires':
                			httpCookie.expires = keyValue[1].trim();
                			break;
                		case 'samesite':
                			httpCookie.sameSite = keyValue[1].trim();
                			break;
                		case 'secure':
                			httpCookie.secure = true;
                			break;
                		case 'httponly':
                			httpCookie.httpOnly = true;
                			break;
                		default:
                			console.log('Unknown key \'' + key + '\' for \'' + keyValue + '\' for cookie \'' + httpCookie.key + '\'.');
                			break;
                	}
                }
                if(httpCookie.domain === undefined || httpCookie.domain === null) {
                	httpCookie.domain = _url.hostname;
                }
                result.push(httpCookie);
            }
        }
        return result;
	}
}

module.exports = HTTPCookie;