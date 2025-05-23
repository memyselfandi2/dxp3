class Security {

	static init() {
	    // Make sure we are indeed logged in...
	    let cookies = document.cookie;
	    let cookieArray = cookies.split(';')
	    for(var i=0;i < cookieArray.length;i++) {
	        let cookie = cookieArray[i];
	        cookie = cookie.trim();
	        if(cookie.indexOf('token=') === 0) {
				Security.token = cookie.split('=')[1];
	        }
			if(cookie.indexOf('user=') === 0) {
				Security.loggedInUserUUID = cookie.split('=')[1];
			}
			if(cookie.indexOf('account=') === 0) {
				Security.accountUUID = cookie.split('=')[1];
			}
		}
	}

	static getLoggedInUserUUID() {
		return Security.loggedInUserUUID;
	}

	static getAccountUUID() {
		return Security.accountUUID;
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
	            url += '&token=' + Security.token;
	        } else {
	            url += '?token=' + Security.token;
	        }
	    } else {
	    	// POST and PUT requests have a body payload.
	    	// Lets add the token there.
	        if(params.body === undefined || params.body === null) {
	            params.body = {};
	        }
	        if(params.body instanceof FormData) {
	            params.body.append('token', Security.token);
	            if(params.headers) {
	                delete params.headers['Content-Type'];
	            }
	        } else {
	            params.body['token'] = Security.token;
	            params.body = JSON.stringify(params.body);
	        }
	    }
	    if(abortController != undefined && abortController != null) {
	        params.signal = abortController.signal;
	    }
		return fetch(url, params);
	}

	static setSrc(elementID, url) {
		// Defensive programming...check input...
		if(elementID === undefined || elementID === null) {
			return;
		}
		if(url === undefined || url === null) {
			return;
		}
	    if(url.indexOf('?') >= 0) {
	        url += '&token=' + Security.token;
	    } else {
	        url += '?token=' + Security.token;
	    }
	    let element = document.getElementById(elementID);
	    if(element === undefined || element === null) {
	    	return;
	    }
    	element.setAttribute('src', url);
	}

	static getSrc(url) {
		// Defensive programming...check input...
		if(url === undefined || url === null) {
			return '';
		}
	    if(url.indexOf('?') >= 0) {
	        url += '&token=' + Security.token;
	    } else {
	        url += '?token=' + Security.token;
	    }
	    return url;
	}

	static setHref(elementID, url) {
		// Defensive programming...check input...
		if(elementID === undefined || elementID === null) {
			return;
		}
		if(url === undefined || url === null) {
			return;
		}
	    if(url.indexOf('?') >= 0) {
	        url += '&token=' + Security.token;
	    } else {
	        url += '?token=' + Security.token;
	    }
	    let element = document.getElementById(elementID);
	    if(element === undefined || element === null) {
	    	return;
	    }
    	element.setAttribute('href', url);
	}
}
// STATIC PROPERTIES
Security.token = null;
Security.loggedInUserUUID = null;
Security.accountUUID = null;