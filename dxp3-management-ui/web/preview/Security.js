var securityToken = null;
var loggedInUserUuid = null;
var accountUuid = null;

class Security {

	static init() {
	    // Make sure we are indeed logged in...
	    var cookies = document.cookie;
	    var cookieArray = cookies.split(';')
	    for(var i=0;i < cookieArray.length;i++) {
	        var cookie = cookieArray[i];
	        cookie = cookie.trim();
	        if(cookie.indexOf('token=') === 0) {
	            securityToken = cookie.split('=')[1];
	        }
			if(cookie.indexOf('user=') === 0) {
				loggedInUserUuid = cookie.split('=')[1];
			}
			if(cookie.indexOf('account=') === 0) {
				accountUuid = cookie.split('=')[1];
			}
		}
	}

	static getLoggedInUserUuid() {
		return loggedInUserUuid;
	}

	static getAccountUuid() {
		return accountUuid;
	}

	static fetch(url, params, abortController) {
		// Defensive programming...check input...
		if(url === undefined || url === null) {
			// Can't fetch a non-existent url
			return;
		}
		if(params === undefined || params === null) {
			// Can't fetch without any specifics
			return;
		}
	    // We need to add our security token to any requests.
	    // GET and DELETE requests do not have a body payload, so
	    // we'll add the token as a request parameter to the url.
	    if(params.method === 'GET' || params.method === 'DELETE') {
	        if(url.indexOf('?') >= 0) {
	            url += '&token=' + this.token;
	        } else {
	            url += '?token=' + this.token;
	        }
	    } else {
	    	// POST and PUT requests have a body payload.
	    	// Lets add the token there.
	        if(params.body === undefined || params.body === null) {
	            params.body = {};
	        }
	        if(params.body instanceof FormData) {
	            params.body.append('token', this.token);
	            if(params.headers) {
	                delete params.headers['Content-Type'];
	            }
	        } else {
	            params.body['token'] = this.token;
	            params.body = JSON.stringify(params.body);
	        }
	    }
	    if(abortController != undefined && abortController != null) {
	        params.signal = abortController.signal;
	    }
		return fetch(url, params);
	}

	static setSrc(elementId, url) {
		// Defensive programming...check input...
		if(elementId === undefined || elementId === null) {
			return;
		}
		if(url === undefined || url === null) {
			return;
		}
	    if(url.indexOf('?') >= 0) {
	        url += '&token=' + this.token;
	    } else {
	        url += '?token=' + this.token;
	    }
	    let element = document.getElementById(elementId);
	    if(element) {
	    	element.setAttribute('src', url);
	    }
	}

	static getSrc(url) {
		// Defensive programming...check input...
		if(url === undefined || url === null) {
			return '';
		}
	    if(url.indexOf('?') >= 0) {
	        url += '&token=' + this.token;
	    } else {
	        url += '?token=' + this.token;
	    }
	    return url;
	}

	static setHref(elementId, url) {
		// Defensive programming...check input...
		if(elementId === undefined || elementId === null) {
			return;
		}
		if(url === undefined || url === null) {
			return;
		}
	    if(url.indexOf('?') >= 0) {
	        url += '&token=' + this.token;
	    } else {
	        url += '?token=' + this.token;
	    }
	    let element = document.getElementById(elementId);
	    if(element) {
	    	element.setAttribute('href', url);
	    }
	}
}