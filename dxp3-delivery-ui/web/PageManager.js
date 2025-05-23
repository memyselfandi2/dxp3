class PageManager {
	
	static init(callback) {
	    let tmpElement = document.getElementById('application-page-uuid');
	    if(tmpElement === undefined || tmpElement === null) {
	        if(callback) {
	            return callback('Missing page information');
	        }
	        return;
	    }
	    let pageUUID = tmpElement.value;
	    if((pageUUID === undefined) || (pageUUID === null)) {
	        if(callback) {
	            return callback('Empty page information');
	        }
	        return;
	    }
	    pageUUID = pageUUID.trim();
	    if(pageUUID.length <= 0) {
	    	if(callback) {
	    		return callback('Empty page information');
	    	}
	    	return;
	    }
	    if(callback) {
	    	return callback(null, pageUUID);
	    }
	}

	static loadPage(pageUUID, addToHistory, callback) {
	    // 1) Load the page definition
	    let pageDefinitionURL = '/api/page/' + pageUUID + '/';
	    SecurityManager.fetch(pageDefinitionURL, {
	    	method:'GET',
	    	headers: {"Content-Type": "text/json"}
	    })
	    .then(function(response) {
	    	if(response.status != 200) {
				if(callback) {
					return callback(response.status);
				}
				return;
	    	}
			return response.json();
		})
		.then(function(pageDefinition) {
            // 2) Load the page URL
            // Different locales, potentially different url's.
            let pageURL = pageDefinition.url;
            if(pageURL === undefined || pageURL === null) {
            	pageURL = '';
            }
            if(typeof pageURL === 'object') {
				if(pageURL.hasOwnProperty(LocaleManager.currentLocale)) {
                    pageURL = pageURL[LocaleManager.currentLocale];
                } else {
                    pageURL = pageURL['default'];
                }
	            if(pageURL === undefined || pageURL === null) {
	            	pageURL = '';
	            }
            }
            pageURL = pageURL.trim();
            if(addToHistory === undefined || addToHistory === null) {
                addToHistory = true;
            }
            if(addToHistory) {
                HistoryManager.addPage(pageUUID, pageURL, LocaleManager.currentLocale);
            }
            // 3) Load the page title
            // Different locales, potentially different titles.
            let pageTitle = pageDefinition.title;
            if(pageTitle === undefined || pageTitle === null) {
                pageTitle = '';
            }
            if(typeof pageTitle === 'object') {
				if(pageTitle.hasOwnProperty(LocaleManager.currentLocale)) {
                    pageTitle = pageTitle[LocaleManager.currentLocale];
                } else {
                    pageTitle = pageTitle['default'];                
                }
	            if(pageTitle === undefined || pageTitle === null) {
	                pageTitle = '';
	            }
            }
            pageTitle = pageTitle.trim();
            document.title = pageTitle;
            // 4) Load the page style
            PageManager.loadStyle(pageUUID);
            // 5) Load the page layout
            PageManager.loadLayout(pageUUID, function(err) {
	            // 6) Load the page controller
				PageManager.loadController(pageUUID);
				if(callback) {
					return callback();
				}
            });
        });
	}

	static loadLayout(pageUUID, callback) {
        let pageLayoutURL = '/api/page/' + pageUUID + '/layout/';
        if(LocaleManager.currentLocale.length > 0) {
            pageLayoutURL += '?locale=' + LocaleManager.currentLocale;
        }
        // SecurityManager.load('#application-page-content', pageLayoutUrl, function() {
	    SecurityManager.fetch(pageLayoutURL, { 
	    	method: "GET",
	    	headers: {"Content-Type": "text/html"}
	    })
		.then(function(response) {
			if(response.status != 200) {
				return callback();
			}
			return response.text();
		})
		.then(function(html) {
			let pageContentElement = document.getElementById('application-page-content');
			pageContentElement.innerHTML = html;
			return callback();
		})
		.catch(function(exception) {
			alert(exception);
			return callback();
		});
	}

	static loadStyle(pageUUID) {
		let element = document.createElement('link');
		element.rel = 'stylesheet';
		document.head.appendChild(element);
		let styleURL = '/api/page/' + pageUUID + '/style/';
        if(LocaleManager.currentLocale.length > 0) {
            styleURL += '?locale=' + LocaleManager.currentLocale;
        }
		element.href = styleURL;
	}

	static loadController(pageUUID) {
		let element = document.createElement('script');
		document.body.appendChild(element);
		let controllerURL = '/api/page/' + pageUUID + '/controller/';
		if(LocaleManager.currentLocale.length > 0) {
			controllerURL += '?locale=' + LocaleManager.currentLocale;
		}
		element.src = controllerURL;
	}
}