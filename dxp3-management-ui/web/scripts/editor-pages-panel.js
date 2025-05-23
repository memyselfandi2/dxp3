const editorPagesPanel = {};

editorPagesPanel.fetchListAbortController = null;

editorPagesPanel.list = function(popup, pageNameRegex) {
	if(editorPagesPanel.fetchListAbortController != null) {
		editorPagesPanel.fetchListAbortController.abort();
	}
    editorPagesPanel.fetchListAbortController = new AbortController();
	var currentList = popup.querySelector('div.list>table>tbody');
    Popup.showLoading(popup);
	// Get the filter elements
	let applicationPanel = popup.closest('.application-panel');
	var applicationUUID = applicationPanel.getAttribute('id');
	let url = '/page/';
	if(applicationUUID !== null) {
		url += '?applicationUUID=' + applicationUUID;
		hasRequestParameter = true;
	}
	var checkedFilterType = popup.querySelector('input.filter-radio-button:checked').value;
	var filterBy = '';
	if(checkedFilterType === 'templateonly') {
		filterBy = 'filterBy[isTemplate]=true';
	} else if(checkedFilterType === 'pageonly') {
		filterBy = 'filterBy[isTemplate]=false';
	}
	pageNameRegex = (pageNameRegex === undefined || pageNameRegex === null) ? '' : pageNameRegex;
	pageNameRegex = pageNameRegex.trim();
	if(pageNameRegex.length > 0) {
		if(filterBy.length > 0) {
			filterBy += '&';
		}
		filterBy += 'filterBy[name]=' + pageNameRegex;
	}
	if(filterBy.length > 0) {
		if(!hasRequestParameter) {
			url += '?';
		} else {
			url += '&';
		}
		url += filterBy;
	}
    editorSecurity.fetch(url, { 
    	method: "GET",
    	headers: {"Content-Type": "application/json"}
    }, editorPagesPanel.fetchListAbortController)
	.then(function(response) {
		Popup.hideLoading(popup);
		let child = currentList.firstChild;
		while(child) {
			currentList.removeChild(child);
			child = currentList.firstChild;
		}
		if(response.status != 200) {
        	let errorMessage = 'An unknown error occurred. Please try again later.';
        	Popup.showWarningMessage(popup, errorMessage);
		} else {
			response.json().then(function(data) {
      	        for(var index in data.list) {
					var uuid = data.list[index].uuid;
                    var pageName = data.list[index].name;
                    var isTemplate = data.list[index].isTemplate;
                    if(isTemplate === undefined || isTemplate === null) {
                    	isTemplate = false;
                    }
                    var parentUUIDs = data.list[index].parentUUIDs;
                    var parentUUID = '';
                    if(parentUUIDs != undefined && parentUUIDs != null) {
                    	if(Array.isArray(parentUUIDs) && (parentUUIDs.length > 0)) {
                    		parentUUID = parentUUIDs[0];
                    		if(parentUUID != undefined && (parentUUID != null)) {
                    			parentUUID = parentUUID.trim();
                    		}
                    	}
                    }
                    var parentNames = data.list[index].parentNames;
                    var parentName = '';
                    if(parentNames != undefined && parentNames != null) {
                    	if(Array.isArray(parentNames) && (parentNames.length > 0)) {
                    		var _parentName = parentNames[0];
                    		if(_parentName != undefined && (_parentName != null)) {
                    			parentName = _parentName.trim();
							}
                    	}
				    }
					var trElement = document.createElement('tr');
					var tdElement = document.createElement('td');
					var aElement = document.createElement('a');
					aElement.setAttribute('class', 'action-load-page action-list-item');
					aElement.setAttribute('href', '#' + uuid);
					var aContent = document.createTextNode(pageName);
					aElement.appendChild(aContent);
					tdElement.appendChild(aElement);
					trElement.appendChild(tdElement);
					tdElement = document.createElement('td');
                	if(parentUUID.length > 0) {
						aElement = document.createElement('a');
						aElement.setAttribute('class', 'action-load-page action-list-item');
						aElement.setAttribute('href', '#' + parentUUID);
						aContent = document.createTextNode(parentName);
						aElement.appendChild(aContent);
						tdElement.appendChild(aElement);
					}
					trElement.appendChild(tdElement);
					tdElement = document.createElement('td');
					if(isTemplate) {
						var tdContent = document.createTextNode('Yes');
						tdElement.appendChild(tdContent);						
					}
					trElement.appendChild(tdElement);
					currentList.appendChild(trElement);
				}
				var loadPageActions = currentList.querySelectorAll('.action-load-page');
				for(var i=0;i < loadPageActions.length;i++) {
					loadPageActions[i].addEventListener('click', function(ev) {
						ev.preventDefault();
						let popup = this.closest('.popup');
						Popup.hide(popup);
						var href = this.getAttribute('href');
						var pageUUID = href.substring(1);
						editorPagePanel.loadPage(pageUUID);
						return false;
					})
				}
  			});
		}
	})
	.catch(function(error) {
		if(error.name === 'AbortError') {
			// ignore. This probably means the user is typing faster than we can return results.
			return;
		} else {
			Popup.hideLoading(popup);
	    	var errorMessage = 'An unknown error occurred. Please try again later.';
	    	Popup.showWarningMessage(popup, errorMessage);
	    }
	});
}
