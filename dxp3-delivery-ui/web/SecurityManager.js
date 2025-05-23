class SecurityManager {

	static init() {
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

	static setHref(elementId, url) {
		// Defensive programming...check input...
		if(elementId === undefined || elementId === null) {
			return;
		}
		if(url === undefined || url === null) {
			return;
		}
	    let element = document.getElementById(elementId);
	    if(element) {
	    	element.setAttribute('href', url);
	    }
	}
}