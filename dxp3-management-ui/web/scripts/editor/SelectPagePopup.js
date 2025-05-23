class SelectPagePopup extends Popup {

	constructor(id, _applicationUUID, size, isTopLevel, hasBorder, hasMenu) {
		super(id, size, isTopLevel, hasBorder, hasMenu);
		if(_applicationUUID === undefined || _applicationUUID === null) {
			_applicationUUID = '';
		}
		this.applicationUUID = _applicationUUID.trim();
		this.sortOrder = 'ascending';
		this.sortColumn = 'name';
		this.fetchListAbortController = null;
		this.pageNameRegex = '';

		let newPageAction = new Action(null, this.applicationUUID, 'action-create-page', 'Create page', null, 'fa fa-magic', false, function(applicationUUID) {

		});
	}

	getDocumentFragment() {
		let template = '<div class="filter-panel">';
		template += '<form>';
		template += '<fieldset>';
        template += '<legend>Filter</legend>';
        template += '<label><input id="page-type-all" class="filter-radio-button" type="radio" name="filter-page-type" value="all" checked="checked"/>Include all</label><br/>';
        template += '<label><input id="page-type-page-only" class="filter-radio-button" type="radio" name="filter-page-type" value="pageonly"/>Page only</label><br/>';
        template += '<label><input id="page-type-template-only" class="filter-radio-button" type="radio" name="filter-page-type" value="templateonly"/>Template only</label><br/>';
        template += '</fieldset>';
    	template += '</form>';
		template += '</div>';
    	template += '<div id="pages-admin-panel-select-page-popup-list" class="list">';
		template += '<table>';
		template += '<thead>';
		template += '<tr>';
		template += '<th><a class="action-list-item sort-by" href="#name">Name<i class="fa fa-sort"></i></a></th>';
		template += '<th><a class="action-list-item sort-by" href="#parentNames">Parent<i class="fa fa-sort"></i></a></th>';
		template += '<th><a class="action-list-item small sort-by" href="#isTemplate">Template<i class="fa fa-sort"></i></a></th>';
		template += '</tr>';
		template += '</thead>';
		template += '<tbody>';
		template += '</tbody>';
		template += '</table>';
    	template += '</div>';
		let myDocumentFragment = document.createRange().createContextualFragment(template);
		let mergedDocumentFragment = super.getDocumentFragment(myDocumentFragment);

		let thisEditorElement = this;
		var filterActions = mergedDocumentFragment.querySelectorAll('input.filter-radio-button');
		for(var i=0;i< filterActions.length;i++) {
			filterActions[i].addEventListener('change', function(ev) {
				ev.preventDefault();
				thisEditorElement.list(null);
				return false;
			});
		}
		let sortActions = mergedDocumentFragment.querySelectorAll('.sort-by');
		for(var i=0;i < sortActions.length;i++) {
			sortActions[i].addEventListener('click', function(ev) {
				ev.preventDefault();
				var icon = this.parentNode.querySelector('i');
				var href = this.getAttribute('href');
				var sortColumn = href.substring(1);
				if(sortColumn === thisEditorElement.sortColumn) {
					if(thisEditorElement.sortOrder === 'ascending') {
						thisEditorElement.sortOrder = 'descending';
					} else {
						thisEditorElement.sortOrder = 'ascending';
					}
				} else {
					let allIs = this.closest('thead').querySelectorAll('i');
					for(var i=0;i < allIs.length;i++) {
						allIs[i].classList.remove('fa-sort-alpha-down-alt');
						allIs[i].classList.remove('fa-sort-alpha-down');
					}
					thisEditorElement.sortColumn = sortColumn;
					thisEditorElement.sortOrder = 'descending';
				}
				if(thisEditorElement.sortOrder === 'ascending') {
					icon.classList.remove('fa-sort-alpha-down-alt');
					icon.classList.add('fa-sort-alpha-down');
				} else {
					icon.classList.remove('fa-sort-alpha-down');
					icon.classList.add('fa-sort-alpha-down-alt');
				}
				thisEditorElement.list(null);
				return false;
			});
		}
		return mergedDocumentFragment;
	}

	refresh(text) {
		this.pageNameRegex = text;
		this.list(this.pageNameRegex);
	}

	select() {
	    let popupSelector = '#' + this.id;
		let currentList = document.querySelector(popupSelector + ' div.list>table>tbody');
		let loadPageActions = currentList.querySelectorAll('.action-load-page');
		if(loadPageActions === undefined || loadPageActions === null) {
			return;
		}
		if(loadPageActions.length <= 0) {
			return;
		}
		let clickEvent = new Event('click');
		loadPageActions[0].dispatchEvent(clickEvent);
	}

	list(pageNameRegex) {
	    let thisEditorElement = this;
	    let popupSelector = '#' + this.id;
	    thisEditorElement.showLoading();
		if(thisEditorElement.fetchListAbortController != null) {
			thisEditorElement.fetchListAbortController.abort();
		}
	    thisEditorElement.fetchListAbortController = new AbortController();
	    if(pageNameRegex === null) {
	    	pageNameRegex = thisEditorElement.pageNameRegex;
	    }
		var currentList = document.querySelector(popupSelector + ' div.list>table>tbody');
		// Get the filter elements
		var checkedFilterType = document.querySelector(popupSelector + ' input.filter-radio-button:checked').value;
		var filterBy = '';
		if(this.applicationUUID.length > 0) {
			filterBy = 'applicationUUID=' + this.applicationUUID;
		}
		if(checkedFilterType === 'templateonly') {
			if(filterBy.length > 0) {
				filterBy += '&';
			}
			filterBy += 'filterBy[isTemplate]=true';
		} else if(checkedFilterType === 'pageonly') {
			if(filterBy.length > 0) {
				filterBy += '&';
			}
			filterBy += 'filterBy[isTemplate]=false';
		}
		pageNameRegex = (pageNameRegex === undefined || pageNameRegex === null) ? '' : pageNameRegex;
		pageNameRegex = pageNameRegex.trim();
		if(pageNameRegex.length > 0) {
			if(filterBy.length > 0) {
				filterBy += '&';
			}
			filterBy += 'filterBy[name]=' + pageNameRegex;
		}
		var sortBy = 'sortBy=';
		if(thisEditorElement.sortOrder === 'descending') {
			sortBy += '-';
		}
		sortBy += thisEditorElement.sortColumn;
		var filterByAndSortBy = '';
		if(filterBy.length > 0) {
			filterByAndSortBy = filterBy;
		}
		if(sortBy.length > 0) {
			if(filterByAndSortBy.length > 0) {
				filterByAndSortBy += '&';
			}
			filterByAndSortBy += sortBy;
		}
		var url = '/page/';
		if(filterByAndSortBy.length > 0) {
			url += '?' + filterByAndSortBy;
		}
	    Security.fetch(url, { 
	    	method: "GET",
	    	headers: {"Content-Type": "page/json"}
	    }, this.fetchListAbortController)
		.then(function(response) {
			thisEditorElement.hideLoading();
			let child = currentList.firstChild;
			while(child) {
				currentList.removeChild(child);
				child = currentList.firstChild;
			}
			if(response.status != 200) {
	        	let errorMessage = 'An unknown error occurred. Please try again later.';
	        	thisEditorElement.showWarningMessage(errorMessage);
			} else {
				response.json().then(function(data) {
					if(data.totalNumberOfResults <= 0) {
						let infoMessage = 'No pages found';
						thisEditorElement.showInfoMessage(infoMessage);
						return;
					}
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
							thisEditorElement.hide();
							var href = this.getAttribute('href');
							var pageUUID = href.substring(1);
							let event = {};
							event.pageUUID = pageUUID;
							event.pageName = this.text;
							console.log('click action-load-page in select page popup');
							thisEditorElement.dispatchEvent('select', event);
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
				Popup.hideLoading(popupSelector);
		    	var errorMessage = 'An unknown error occurred. Please try again later.';
		    	Popup.showWarningMessage(popupSelector, errorMessage);
		    }
		});
	}
}