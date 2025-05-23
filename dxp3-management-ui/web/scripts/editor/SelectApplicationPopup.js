class SelectApplicationPopup extends Popup {

	constructor(id, size, isTopLevel, hasBorder, hasMenu) {
		super(id, size, isTopLevel, hasBorder, hasMenu);
		this.sortOrder = 'ascending';
		this.sortColumn = 'name';
		this.fetchListAbortController = null;
		this.nameRegex = '';
	}

	getDocumentFragment() {
		let template = '<div class="filter-panel">';
		template += '<form>';
		template += '<fieldset>';
        template += '<legend>Filter</legend>';
        template += '<label><input id="application-type-all" class="filter-radio-button" type="radio" name="filter-application-type" value="all" checked="checked"/>Include all</label><br/>';
        template += '<label><input id="application-type-application-only" class="filter-radio-button" type="radio" name="filter-application-type" value="applicationonly"/>Application only</label><br/>';
        template += '<label><input id="application-type-template-only" class="filter-radio-button" type="radio" name="filter-application-type" value="templateonly"/>Template only</label><br/>';
        template += '</fieldset>';
    	template += '</form>';
		template += '</div>';
    	template += '<div id="applications-admin-panel-select-application-popup-list" class="list">';
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
		this.nameRegex = text;
		this.list(this.nameRegex);
	}

	select() {
	    let popupSelector = '#' + this.id;
		let currentList = document.querySelector(popupSelector + ' div.list>table>tbody');
		let loadApplicationActions = currentList.querySelectorAll('.action-load-application');
		if(loadApplicationActions === undefined || loadApplicationActions === null) {
			return;
		}
		if(loadApplicationActions.length <= 0) {
			return;
		}
		let clickEvent = new Event('click');
		loadApplicationActions[0].dispatchEvent(clickEvent);
	}

	list(nameRegex) {
	    let thisEditorElement = this;
	    let popupSelector = '#' + this.id;
	    thisEditorElement.showLoading();
		if(thisEditorElement.fetchListAbortController != null) {
			thisEditorElement.fetchListAbortController.abort();
		}
	    thisEditorElement.fetchListAbortController = new AbortController();
	    if(nameRegex === null) {
	    	nameRegex = thisEditorElement.nameRegex;
	    }
		var currentList = document.querySelector(popupSelector + ' div.list>table>tbody');
		// Get the filter elements
		var checkedFilterType = document.querySelector(popupSelector + ' input.filter-radio-button:checked').value;
		var filterBy = '';
		if(checkedFilterType === 'templateonly') {
			filterBy = 'filterBy[isTemplate]=true';
		} else if(checkedFilterType === 'applicationonly') {
			filterBy = 'filterBy[isTemplate]=false';
		}
		nameRegex = (nameRegex === undefined || nameRegex === null) ? '' : nameRegex;
		nameRegex = nameRegex.trim();
		if(nameRegex.length > 0) {
			if(filterBy.length > 0) {
				filterBy += '&';
			}
			filterBy += 'filterBy[name]=' + nameRegex;
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
		var url = '/application/';
		if(filterByAndSortBy.length > 0) {
			url += '?' + filterByAndSortBy;
		}
	    Security.fetch(url, { 
	    	method: "GET",
	    	headers: {"Content-Type": "application/json"}
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
						let infoMessage = 'No applications found';
						thisEditorElement.showInfoMessage(infoMessage);
						return;
					}
	      	        for(var index in data.list) {
						var uuid = data.list[index].uuid;
	                    var applicationName = data.list[index].name;
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
	                    		} else {
	                    			parentUUID = '';
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
						aElement.setAttribute('class', 'action-load-application action-list-item');
						aElement.setAttribute('href', '#' + uuid);
						var aContent = document.createTextNode(applicationName);
						aElement.appendChild(aContent);
						tdElement.appendChild(aElement);
						trElement.appendChild(tdElement);
						tdElement = document.createElement('td');
	                	if(parentUUID.length > 0) {
							aElement = document.createElement('a');
							aElement.setAttribute('class', 'action-load-application action-list-item');
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
					var loadApplicationActions = currentList.querySelectorAll('.action-load-application');
					for(var i=0;i < loadApplicationActions.length;i++) {
						loadApplicationActions[i].addEventListener('click', function(ev) {
							ev.preventDefault();
							thisEditorElement.hide();
							var href = this.getAttribute('href');
							var applicationUUID = href.substring(1);
							let event = {};
							event.applicationUUID = applicationUUID;
							event.applicationName = this.text;
							console.log('click action-load-application in select application popup');
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
	   //  applicationsAdminPanel.ajaxCallList = Security.ajax({type: 'GET',
	   //      url: url,
	   //      dataType: 'json',
	   //      success: function(data) {
	   //      	var noResults = false;
	   //          if(data !== undefined && (data !== null) && (data != '')) {
	   //          	if(data.length <= 0) {
	   //          		noResults = true;
	   //          	} else {
	   //          		var ulElement = $(popupSelector + ' div.list>ul.content');
		  //               for(var index in data) {
		  //                   var uuid = data[index].uuid;
		  //                   var applicationName = data[index].name;
		  //                   var isTemplate = data[index].isTemplate;
		  //                   if(isTemplate === undefined || isTemplate === null) {
		  //                   	isTemplate = false;
		  //                   }
		  //                   var liElement = '<li><a class="action-load-application action-list-item" href="#' + uuid + '">' + applicationName + '</a>';
		  //                   var parentUUIDs = data[index].parentUUIDs;
		  //                   var parentUUID = '';
		  //                   if(parentUUIDs != undefined && parentUUIDs != null) {
		  //                   	if(Array.isArray(parentUUIDs) && (parentUUIDs.length > 0)) {
		  //                   		parentUUID = parentUUIDs[0];
		  //                   		if(parentUUID != undefined && (parentUUID != null)) {
		  //                   			parentUUID = parentUUID.trim();
		  //                   		}
		  //                   	}
		  //                   }
		  //                   var parentNames = data[index].parentNames;
		  //                   var parentName = '';
		  //                   if(parentNames != undefined && parentNames != null) {
		  //                   	if(Array.isArray(parentNames) && (parentNames.length > 0)) {
		  //                   		var _parentName = parentNames[0];
		  //                   		if(_parentName != undefined && (_parentName != null)) {
		  //                   			parentName = _parentName.trim();
	   //  							}
		  //                   	}
				// 		    }
		  //               	liElement += '<a class="action-load-application action-list-item" href="#';
		  //               	if(parentUUID.length > 0) {
		  //               		liElement += parentUUID + '">' + parentName;
		  //               	} else {
		  //               		liElement += uuid + '">';
		  //               	}
		  //               	liElement += '</a>';
		  //               	liElement += '<a class="action-load-application action-list-item small" href="#' + uuid + '">';
		  //                   if(isTemplate) {
		  //                   	liElement += 'Yes';
		  //                   }
		  //               	liElement += '</a>';
		  //                   liElement += '<a class="action-delete-application" href="#' + uuid + '"><i class="fa fa-trash"></i></a></li>';
		  //                   ulElement.append(liElement);
		  //               }
		  //           }
	   //          } else {
	   //          	noResults = true;
	   //          }
	   //          if(noResults) {
	   //          	popup.showInfoMessage(popupSelector, 'No applications found.');
	   //      		$(popupSelector + ' div.list>ul.header').hide();
	   //          } else {
	   //      		$(popupSelector + ' div.list>ul.header').show();
	   //          	popup.hideMessage(popupSelector);
	   //          }
				// popup.hideLoading(popupSelector);
	   //      },
	   //      error: function() {
				// popup.hideLoading(popupSelector);
	   //      }
	   //  });
	}
}