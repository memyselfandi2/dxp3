class ApplicationManager {

	static init(callback) {
	    let tmpElement = document.getElementById('application-uuid');
	    if(tmpElement === undefined || tmpElement === null) {
	        if(callback) {
	            return callback('Missing application information');
	        }
	        return;
	    }
	    let applicationUUID = tmpElement.value;
	    if((applicationUUID === undefined) || (applicationUUID === null)) {
	        if(callback) {
	            return callback('Empty application information');
	        }
	        return;
	    }
	    applicationUUID = applicationUUID.trim();
	    if(applicationUUID.length <= 0) {
	    	if(callback) {
	    		return callback('Empty application information');
	    	}
	    	return;
	    }
	    if(callback) {
	    	return callback(null, applicationUUID);
	    }
	}

	static loadApplication(applicationUUID, pageUUID, callback) {
		// 0) Defensive programming...check input...
		if(applicationUUID === undefined || applicationUUID === null) {
			if(callback) {
				return callback('Missing applicationUUID.');
			}
			return;
		}
		if(pageUUID === undefined || pageUUID === null) {
			if(callback) {
				return callback('Missing pageUUID.');
			}
			return;
		}
		// 1) Load the application style
		ApplicationManager.loadStyle(applicationUUID);
	    // 2) Initialize our page. This will load any page specific styles, 
	    //    features and controllers.
	    PageManager.loadPage(pageUUID, true, function(err) {
	        // Now that the page has loaded we can:
	        // 3) Load the application controller
	        ApplicationManager.loadController(applicationUUID);
	    });
	}

	static loadStyle(applicationUUID) {
		let element = document.createElement('link');
		element.rel = 'stylesheet';
		document.head.appendChild(element);
		let styleURL = '/api/application/' + applicationUUID + '/style/';
        if(LocaleManager.currentLocale.length > 0) {
            styleURL += '?locale=' + LocaleManager.currentLocale;
        }
		element.href = styleURL;
	}

	static loadController(applicationUUID) {
		let element = document.createElement('script');
		document.body.appendChild(element);
		let controllerURL = '/api/application/' + applicationUUID + '/controller/';
		if(LocaleManager.currentLocale.length > 0) {
			controllerURL += '?locale=' + LocaleManager.currentLocale;
		}
		element.src = controllerURL;
	}
}