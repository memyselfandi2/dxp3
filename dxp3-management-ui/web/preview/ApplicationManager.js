class ApplicationManager {
	constructor() {
		this.applicationUUID = null;
	}

	init(callback) {
	    let tmpElement = document.getElementById('application-uuid');
	    if(tmpElement === undefined || tmpElement === null) {
	        if(callback) {
	            return callback('Missing application information');
	        }
	        return;
	    }
	    let _applicationUUID = tmpElement.value;
	    if(_applicationUUID.length <= 0) {
	        if(callback) {
	            return callback('Empty application information');
	        }
	        return;
	    }
	    this.applicationUUID = _applicationUUID;
	    return callback();
	}

	loadPreview() {
		let self = this;
		// First we load the application style
	    Security.fetch('/application/' + self.applicationUUID + '/compiledstyle/', { 
	    	method: "GET",
	    	headers: {"Content-Type": "text/css"}
	    })
		.then(function(response) {
			if(response.status != 200) {
				alert('something went wrong loading the style');
				return;
			}
			return response.text();
		})
		.then(function(css) {
			let styleNode = document.createElement('style');
			styleNode.innerHTML = css;
			let head = document.head.appendChild(styleNode);
		})
		.catch(function(exception) {
			alert(exception);
		});
		// Next we load the application controller
		let scriptNode = document.createElement('script');
		document.body.appendChild(scriptNode);
		scriptNode.src = '/application/' + self.applicationUUID + '/compiledcontroller/';
	}
}
