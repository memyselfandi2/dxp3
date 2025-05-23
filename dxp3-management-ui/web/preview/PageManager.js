class PageManager {
	constructor() {
		this.pageUUID = null;
	}

	init(callback) {
	    let tmpElement = document.getElementById('application-page-uuid');
	    if(tmpElement === undefined || tmpElement === null) {
	        if(callback) {
	            return callback('Missing page information');
	        }
	        return;
	    }
	    let _pageUUID = tmpElement.value;
	    if(_pageUUID.length <= 0) {
	        if(callback) {
	            return callback('Empty page information');
	        }
	        return;
	    }
	    this.pageUUID = _pageUUID;
	    return callback();
	}

	loadPreview() {
		let self = this;
		// First we load the page style
	    Security.fetch('/page/' + self.pageUUID + '/compiledstyle/preview', { 
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
		// Nxt we load the page layout
	    Security.fetch('/page/' + self.pageUUID + '/compiledlayout/preview', { 
	    	method: "GET",
	    	headers: {"Content-Type": "text/html"}
	    })
		.then(function(response) {
			if(response.status != 200) {
				alert('something went wrong loading the layout');
				return;
			}
			return response.text();
		})
		.then(function(html) {
			let pageContentElement = document.getElementById('application-page-content');
			pageContentElement.innerHTML = html;
			// Finally we load the page controller
			let scriptNode = document.createElement('script');
			document.body.appendChild(scriptNode);
			scriptNode.src = '/page/' + self.pageUUID + '/compiledcontroller/preview';
		})
		.catch(function(exception) {
			alert(exception);
		});
	}
}