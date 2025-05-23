const applicationsAdminPanel = {};

applicationsAdminPanel.sortOrder = 'ascending';
applicationsAdminPanel.sortColumn = 'name';
applicationsAdminPanel.currentApplicationNameRegex = '';
applicationsAdminPanel.currentApplicationParentUUIDs = null;
applicationsAdminPanel.currentApplicationShortName = null;
applicationsAdminPanel.currentApplicationHomePage = null;
applicationsAdminPanel.currentApplicationName = null;
applicationsAdminPanel.currentApplicationDescription = null;
applicationsAdminPanel.fetchDefinitionAbortController = null;
applicationsAdminPanel.fetchListAbortController = null;
applicationsAdminPanel.currentController = '';
applicationsAdminPanel.currentControllerName = '';
applicationsAdminPanel.ajaxCallController = {abort:function(){}};
applicationsAdminPanel.currentStyle = '';
applicationsAdminPanel.currentStyleName = '';
applicationsAdminPanel.ajaxCallStyle = {abort:function(){}};
applicationsAdminPanel.ajaxCallParentsList = {abort:function(){}};
applicationsAdminPanel.ajaxCallHomePageList = {abort:function(){}};
applicationsAdminPanel.ajaxCallPreviewPageList = {abort:function(){}};
applicationsAdminPanel.currentPreviewChannel = 'desktop';
applicationsAdminPanel.currentPreviewDebug = false;

applicationsAdminPanel.init = function() {

	let selectApplicationInputField = new TextInputField('applications-admin-panel-select-application',
														 null,
														 'select-application-name-regex',
														 'select-application',
														 null,
														 'Select an application',
														 true,
														 false,
														 true,
														 TEXT_INPUT_FIELD_TYPES.SEARCH);
	let selectApplicationPopup = new SelectApplicationPopup('applications-admin-panel-select-application-popup',
														   POPUP_SIZES.LARGE,
														   true,
														   true);
	
	var createApplicationParentsInput = document.getElementById('create-application-parentUUIDs');
	// We add the click event to intercept and stop propagation.
	// This will ensure the popup (opened by the accompanying focus event) stays open.
	// The focus event will open the popup and initiate the 'get a list of applications' request.
	createApplicationParentsInput.addEventListener('click', function(ev) {
		ev.preventDefault();
		ev.stopPropagation();
		return false;
	});
	createApplicationParentsInput.addEventListener('focus', function(ev) {
		ev.preventDefault();
		applicationsAdminPanel.showCreateApplicationParentsPopup();
		return false;
	});
	var createApplicationParentsButton = createApplicationParentsInput.parentNode.querySelector('.search-button');
	createApplicationParentsButton.addEventListener('click', function(ev) {
		ev.preventDefault();
		applicationsAdminPanel.showCreateApplicationParentsPopup();
		return false;
	});
	var filterActions = document.querySelectorAll('#applications-admin-panel-select-application-popup input.filter-radio-button');
	for(var i=0;i< filterActions.length;i++) {
		filterActions[i].addEventListener('change', function(ev) {
			ev.preventDefault();
			applicationsAdminPanel.list('#applications-admin-panel-select-application-popup', applicationsAdminPanel.currentApplicationNameRegex);
		return false;
		});
	}

	let sortActions = document.querySelectorAll('#applications-admin-panel-select-application-popup-list .sort-by');
	for(var i=0;i < sortActions.length;i++) {
		sortActions[i].addEventListener('click', function(ev) {
			ev.preventDefault();
			var icon = this.parentNode.querySelector('i');
			var href = this.getAttribute('href');
			var sortColumn = href.substring(1);
			if(sortColumn === applicationsAdminPanel.sortColumn) {
				if(applicationsAdminPanel.sortOrder === 'ascending') {
					icon.classList.remove('fa-sort-alpha-asc');
					icon.classList.add('fa-sort-alpha-desc');
					applicationsAdminPanel.sortOrder = 'descending';
				} else {
					icon.classList.remove('fa-sort-alpha-desc');
					icon.classList.add('fa-sort-alpha-asc');
					applicationsAdminPanel.sortOrder = 'ascending';
				}
			} else {
				applicationsAdminPanel.sortOrder = 'descending';
			}
			applicationsAdminPanel.sortColumn = sortColumn;
			applicationsAdminPanel.list('#applications-admin-panel-select-application-popup', applicationsAdminPanel.currentApplicationNameRegex);
			return false;
		});
	}

	// 		// return columns to default sort icon
	// 		let icons = this.parentNode.parentNode.querySelectorAll('i');
	// 	for(var i=0;i < icons.length;i++) {
	// 		icons[i].classList.add('fa');
	// 		icons[i].classList.add('fa-sort');
	// 		icons[i].classList.remove('')
	// 	var icon = $(this).find('i');
	// 	icon.classList.remove('fa-sort');
	// 	if(applicationsAdminPanel.sortColumn === 'name') {
	// 		if(applicationsAdminPanel.sortOrder === 'ascending') {
	// 			icon.addClass('fa-sort-alpha-desc');
	// 			applicationsAdminPanel.sortOrder = 'descending';
	// 		} else {
	// 			icon.addClass('fa-sort-alpha-asc');
	// 			applicationsAdminPanel.sortOrder = 'ascending';
	// 		}
	// 	} else {
	// 		icon.addClass('fa-sort-alpha-asc');
	// 		applicationsAdminPanel.sortOrder = 'ascending';
	// 	}
	// });

    var aElement = document.getElementById('action-select-applications-home');
    aElement.addEventListener('click', function(ev) {
        var href = this.getAttribute('href');
        var selected = this.closest('.tabs-menu').querySelector('ul li.selected');
        if(selected) {
            selected.classList.remove('selected');
        }
        this.closest('li').classList.add('selected');
        applicationUUID = href.substring(1);
        var applicationPanelToShow = document.getElementById(applicationUUID);
        var tabs = document.querySelectorAll('.application-panel.tab.show');
        for(var j=0;j < tabs.length;j++) {
            tabs[j].classList.remove('show');
            tabs[j].classList.add('hide');
        }
        applicationPanelToShow.classList.remove('hide');
        applicationPanelToShow.classList.add('show');
    });
	// Show the select application popup when the user clicks in the select application input field.
	// Also refresh the application list.
	var selectApplicationInput = document.getElementById('applications-admin-panel-select-application-input');
	// We add the click event to intercept and stop propagation.
	// This will ensure the popup (opened by the accompanying focus event) stays open.
	// The focus event will open the popup and initiate the 'get a list of applications' request.
	selectApplicationInput.addEventListener('click', function(ev) {
		ev.preventDefault();
		ev.stopPropagation();
		return false;
	});
	selectApplicationInput.addEventListener('focus', function(ev) {
		ev.preventDefault();
		this.value = applicationsAdminPanel.currentApplicationNameRegex;
		applicationsAdminPanel.showSelectApplicationPopup();
		return false;
	});
	selectApplicationInput.addEventListener('keyup', function(ev) {
		var key = ev.which;
		if(key === 13) {
			var applicationsList = document.getElementById('applications-admin-panel-select-application-popup-list');
			var action = applicationsList.querySelector('table tbody tr:first-child a');
			if(action) {
				var selectApplicationInput = document.getElementById('applications-admin-panel-select-application-input');
				var clickEvent = new Event('click');
				action.dispatchEvent(clickEvent);
			}
		} else {
			applicationsAdminPanel.currentApplicationNameRegex = this.value;
			applicationsAdminPanel.list('#applications-admin-panel-select-application-popup', applicationsAdminPanel.currentApplicationNameRegex);
		}
	});
	var selectApplicationClearButton = document.querySelector('#applications-admin-panel-select-application > .input-field-buttons > .clear-button');
	selectApplicationClearButton.addEventListener('click', function(ev) {
		ev.preventDefault();
		applicationsAdminPanel.currentApplicationNameRegex = '';
		return false;
	});
	var selectApplicationButton = document.getElementById('applications-admin-panel-select-application').querySelector('.search-button');
	selectApplicationButton.addEventListener('click', function(ev) {
		ev.preventDefault();
		ev.stopPropagation();
		var selectApplicationInput = document.getElementById('applications-admin-panel-select-application-input');
		selectApplicationInput.focus();
		return false;
	});
	selectApplicationButton.addEventListener('keydown', function(ev) {
		var key = ev.which;
		if(key === 13) {
			ev.preventDefault();
			ev.stopPropagation();
			return false;
		}
	});
	selectApplicationButton.addEventListener('keyup', function(ev) {
		console.log('keyup');
		var key = ev.which;
		if(key === 13) {
			ev.preventDefault();
			ev.stopPropagation();
			var selectApplicationInput = document.getElementById('applications-admin-panel-select-application-input');
			selectApplicationInput.focus();
			return false;
		}
	});
	var createApplicationInput = document.getElementById('applications-admin-panel-create-application-input');
	createApplicationInput.addEventListener('click', function(ev) {
		ev.preventDefault();
		ev.stopPropagation();
		applicationsAdminPanel.showCreateApplicationPopup();
		return false;
	});
	createApplicationInput.addEventListener('focus', function(ev) {
		ev.preventDefault();
		applicationsAdminPanel.showCreateApplicationPopup();
		return false;
	});
	createApplicationInput.addEventListener('keyup', function(ev) {
		var key = ev.which;
		if(key === 13) {
			applicationsAdminPanel.createApplication(true);
			return false;
		}
	});
	var createApplicationButton = document.getElementById('applications-admin-panel-create-application').querySelector('.create-button');
	createApplicationButton.addEventListener('click', function(ev) {
		ev.preventDefault();
		ev.stopPropagation();
		let createApplicationInput = document.getElementById('applications-admin-panel-create-application-input');
		createApplicationInput.focus();
		return false;
	});
	document.getElementById('create-application-save-and-close').addEventListener('click', function(ev) {
		ev.preventDefault();
		applicationsAdminPanel.createApplication(true);
		return false;
	});
	document.getElementById('create-application-save-and-new').addEventListener('click', function(ev) {
		ev.preventDefault();
		applicationsAdminPanel.createApplication(false);
		return false;
	});
	document.getElementById('create-application-cancel').addEventListener('click', function(ev) {
		ev.preventDefault();
		Popup.hide('#applications-admin-panel-create-application-popup');
		return false;
	});
	document.getElementById('create-application-parentUUIDs').addEventListener('focus', function(ev) {

	});
}

applicationsAdminPanel.showSelectApplicationPopup = function() {
	Popup.show('#applications-admin-panel-select-application-popup');
	applicationsAdminPanel.list('#applications-admin-panel-select-application-popup', applicationsAdminPanel.currentApplicationNameRegex);
}

applicationsAdminPanel.showCreateApplicationParentsPopup = function() {
	Popup.show('#create-application-parentUUIDs-popup');
	applicationsAdminPanel.list('#create-application-parentUUIDs-popup', applicationsAdminPanel.currentApplicationNameRegex);
}

applicationsAdminPanel.showCreateApplicationPopup = function() {
	// var allInputs = document.querySelectorAll('input[tabindex]');
	// for(var i=0;i < allInputs.length;i++ ) {
	// 	allInputs[i].setAttribute('tabindex', '');
	// }
	// document.getElementById('applications-admin-panel-create-application-input').setAttribute('tabindex', 1);
	// document.getElementById('create-application-is-template-yes').setAttribute('tabindex', 2);
	// document.getElementById('create-application-is-template-no').setAttribute('tabindex', 3);
	// document.getElementById('create-application-parentUUIDs').setAttribute('tabindex', 4);
	// document.getElementById('create-application-shortname').setAttribute('tabindex', 5);
	// document.getElementById('create-application-description').setAttribute('tabindex', 7);
	// document.getElementById('create-application-save-and-close').setAttribute('tabindex', 8);
	// document.getElementById('create-application-save-and-new').setAttribute('tabindex', 9);
	// document.getElementById('create-application-cancel').setAttribute('tabindex', 10);
	Popup.show('#applications-admin-panel-create-application-popup');
}

applicationsAdminPanel.updateApplication = function(applicationUUID) {
	if(applicationUUID === undefined || applicationUUID === null) {
		applicationUUIDapplicationUUID = '';
	}
	applicationUUID = applicationUUID.trim();
	if(applicationUUID.length <= 0) {
		return;
	}
	let applicationPanel = document.getElementById(applicationUUID);
	let name = applicationPanel.querySelector('.update-application-name').value;
	name = name.trim();
	if(name.length <= 0) {
		return;
	}
	let isTemplate = applicationPanel.querySelector('.update-application-is-template-yes').checked;
	let parentUUIDs =  applicationPanel.querySelector('.update-application-parentUUIDs-hidden').value;
	let shortname =  applicationPanel.querySelector('.update-application-shortname').value;
	let pageUUID =  applicationPanel.querySelector('.update-application-homepage-hidden').value;
	let description =  applicationPanel.querySelector('.update-application-description').value;
    editorSecurity.fetch('/application/' + applicationUUID, { 
    	method: "PUT",
    	body: {"name": name,
               "parentUUIDs": parentUUIDs,
        	   "shortName": shortname,
        	   "isTemplate": isTemplate,
        	   "pageUUID": pageUUID,
               "description": description},
    	headers: {"Content-Type": "application/json"}
    })
	.then(function(response) {
		if(response.status === 404) {
			alert('not found');
		} else {
			response.json().then(function(data) {
				editorAdminPanel.addApplication(data.uuid, data.name, data.shortName, data.isTemplate, data.description);
			});
		}
	})
	.catch(function(error) {
		console.log(error);
	});
}

applicationsAdminPanel.createApplication = function(closeOnSuccess) {
	var name = document.getElementById('applications-admin-panel-create-application-input').value;
	name = name.trim();
	if(name.length <= 0) {
    	Popup.showWarningMessage('#applications-admin-panel-create-application-popup', 'Please provide a name for this application.');
		document.getElementById('applications-admin-panel-create-application-input').focus();
		return;
	}
	Popup.showLoading('#applications-admin-panel-create-application-popup');
	var isTemplate = document.getElementById('create-application-is-template-yes').checked;
	var parentUUIDs = document.getElementById('create-application-parentUUIDs-hidden').value;
	var shortname = document.getElementById('create-application-shortname').value;
	var description = document.getElementById('create-application-description').value;
	description = description.trim();
    editorSecurity.fetch('/application/', { 
    	method: "POST",
        body: {"name": name,
        	   "parentUUIDs": parentUUIDs,
        	   "shortName": shortname,
        	   "isTemplate": isTemplate,
               "description": description},
    	headers: {"Content-Type": "application/json"}
    })
	.then(function(response) {
		Popup.hideLoading('#applications-admin-panel-create-application-popup');
		if(response.status === 409) {
       		let errorMessage = "An application with the same name already exists. Please try a different name.";
        	Popup.showWarningMessage('#applications-admin-panel-create-application-popup', errorMessage);
			document.getElementById('applications-admin-panel-create-application-input').focus();
		} else if(response.status != 200) {
        	let errorMessage = 'An unknown error occurred. Please try again later.';
        	Popup.showWarningMessage('#applications-admin-panel-create-application-popup', errorMessage);
			document.getElementById('applications-admin-panel-create-application-input').focus();
		} else {
			response.json().then(function(data) {
				document.getElementById('applications-admin-panel-create-application-input').value = '';
				document.getElementById('create-application-is-template-no').checked = true;
				document.getElementById('create-application-parentUUIDs').value = '';
				document.getElementById('create-application-parentUUIDs-hidden').value = '';
				document.getElementById('create-application-shortname').value = '';
				document.getElementById('create-application-homepage').value = '';
				document.getElementById('create-application-description').value = '';
				if(closeOnSuccess) {
					Popup.hide('#applications-admin-panel-create-application-popup');
//					document.getElementById('update-application-name').focus();
				} else {
					document.getElementById('applications-admin-panel-create-application-input').focus();
				}
	            var uuid = data.uuid;
				applicationsAdminPanel.loadApplication(uuid);
	        });
		}
	})
	.catch(function(error) {
		Popup.hideLoading('#applications-admin-panel-create-application-popup');
    	var errorMessage = 'An unknown error occurred. Please try again later.';
    	Popup.showWarningMessage('#applications-admin-panel-create-application-popup', errorMessage);
		document.getElementById('applications-admin-panel-create-application-input').focus();
	});
}

applicationsAdminPanel.loadApplication = function(uuid) {
	if(uuid === undefined || uuid === null) {
		uuid = '';
	}
	uuid = uuid.trim();
	if(uuid.length <= 0) {
		uuid = null;
	}
	// document.getElementById('#applications-admin-panel .action-message').hide();
	applicationsAdminPanel.loadApplicationDefinition(uuid);
 //    applicationsAdminPanel.loadApplicationStyle(uuid);
 //    applicationsAdminPanel.loadApplicationController(uuid);
 //    applicationsAdminPanel.refreshApplicationPreview(uuid);

}

applicationsAdminPanel.loadApplicationDefinition = function(uuid) {
	if(applicationsAdminPanel.fetchDefinitionAbortController != null) {
		applicationsAdminPanel.fetchDefinitionAbortController.abort();
	}
    applicationsAdminPanel.fetchDefinitionAbortController = new AbortController();
    editorSecurity.fetch('/application/' + uuid, { 
    	method: "GET",
    	headers: {"Content-Type": "application/json"}
    }, applicationsAdminPanel.fetchDefinitionAbortController)
	.then(function(response) {
		if(response.status === 404) {
			alert('not found');
		} else {
			response.json().then(function(data) {
				editorAdminPanel.addApplication(data.uuid, data.name, data.shortName, data.isTemplate, data.description);
			});
		}
	})
	.catch(function(error) {
		console.log(error);
	});
	// $('#update-application-name').val('');
	// $('#application-template').val('');
	// $('#update-application-parentUUIDs').val('');
	// $('#update-application-parentUUIDs-hidden').val('');
	// $('#update-application-shortname').val('');
	// $('#update-application-homepage').val('');
	// $('#update-application-homepage-hidden').val('');
	// $('#update-application-description').val('');
	// var ulElement = $('#application-parents-list');
	// ulElement.empty();
	// if(uuid === null) {
	// 	applicationsAdminPanel.currentApplicationName = '';
	// 	applicationsAdminPanel.currentApplicationParentUUIDs = '';
	// 	applicationsAdminPanel.currentApplicationShortName = '';
	// 	applicationsAdminPanel.currentApplicationHomePage = null;
	// 	applicationsAdminPanel.currentApplicationDescription = '';
	// 	$('input.select-application').val('');
	// 	// enable the mask
	// 	$('#applications-admin-panel .maskable').addClass('blur');					
	// 	$('#applications-admin-panel .mask').show();
	// 	return;				
	// }
// 	applicationsAdminPanel.fetchDefinition = editorSecurity.fetch({type: 'GET',
//         url: '/application/' + uuid,
//         dataType: 'json',
//         success: function(data) {
//             if(data !== undefined && (data !== null) && (data != '')) {
// 				applicationsAdminPanel.currentApplicationName = data.name;
// 				applicationsAdminPanel.currentApplicationShortName = data.shortName;
// 				applicationsAdminPanel.currentApplicationHomePage = data.pageUUID;
// 				applicationsAdminPanel.currentApplicationDescription = data.description;
//             	$('#update-application-name').val(data.name);
//             	var isTemplate = (data.isTemplate != undefined && data.isTemplate != null) ? data.isTemplate : false;
//        			$('#update-application-is-template-yes').prop('checked', isTemplate);
//         		$('#update-application-is-template-no').prop('checked', !isTemplate);
//         		if(isTemplate) {
// //	        			$('#application-template').text('Yes');
//         		} else {
// //	        			$('#application-template').text('No');
//         		}
// 				var foundAtLeastOneValidParent = false;
// 				var parentUUIDsString = '';
// 				var parentName = '';
// 				var hasParentsArray = ((data.parentUUIDs != undefined) && (data.parentUUIDs != null) && (Array.isArray(data.parentUUIDs)) && (data.parentUUIDs.length > 0));
// 				if(hasParentsArray) {
// 				    for(var index in data.parentUUIDs) {
// 				    	var parentUUID = data.parentUUIDs[index];
// 				    	if(parentUUID === undefined || parentUUID === null) {
// 				    		parentUUID = '';
// 				    	}
// 				    	parentUUID = parentUUID.trim();
// 				    	if(parentUUID.length > 0) {
// 				    		parentUUIDsString = parentUUID;
// 							foundAtLeastOneValidParent = true;
// 				        	ulElement.append('<li>' + data.parentUUIDs[index] + '</li>');
// 				        }
// 				    }
// 				}
// 				if(foundAtLeastOneValidParent) {
// 					parentName = data.parentNames[0];
// 					$('#update-application-parentUUIDs-hidden').val(parentUUIDsString);
// 					$('#update-application-parentUUIDs').val(parentName);
// 				} else {
// 					$('#update-application-parentUUIDs-hidden').val('');
// 					$('#update-application-parentUUIDs').val('');						
// 				}
//             	$('#update-application-shortname').val(data.shortName);
//             	$('#update-application-homepage').val(data.pageName);
//             	$('#update-application-homepage-hidden').val(data.pageUUID);
//             	$('#update-application-description').val(data.description);
//             	$('#application-pages-input').val(data.name);
//             	$('#application-applications-input').val(data.name);
//             	$('#application-categories-input').val(data.name);
// 				$('input.select-application').val(data.name);
// 				// disable the mask
// 				$('#applications-admin-panel .maskable').removeClass('blur');					
// 				$('#applications-admin-panel .mask').hide();					
// 				// close the popup
// 				popup.hide('#applications-admin-panel-select-application-popup');
//             }
//         },
//         error: function() {
//         }
//     });
}

applicationsAdminPanel.deleteApplication = function(applicationUUID) {
	if(applicationUUID === undefined || applicationUUID === null) {
		applicationUUIDapplicationUUID = '';
	}
	applicationUUID = applicationUUID.trim();
	if(applicationUUID.length <= 0) {
		return;
	}
    editorSecurity.fetch('/application/' + applicationUUID, { 
    	method: "DELETE",
    	headers: {"Content-Type": "application/json"}
    })
	.then(function(response) {
		if(response.status === 404) {
			alert('not found');
		} else {
			response.json().then(function(data) {
				editorAdminPanel.removeApplication(data.uuid, data.name);
			});
		}
	})
	.catch(function(error) {
		console.log(error);
	});
}

applicationsAdminPanel.list = function(popupSelector, applicationNameRegex) {
	if(applicationsAdminPanel.fetchListAbortController != null) {
		applicationsAdminPanel.fetchListAbortController.abort();
	}
    applicationsAdminPanel.fetchListAbortController = new AbortController();
	var currentList = document.querySelector(popupSelector + ' div.list>table>tbody');
    Popup.showLoading(popupSelector);
	// Get the filter elements
	var checkedFilterType = document.querySelector(popupSelector + ' input.filter-radio-button:checked').value;
	var filterBy = '';
	if(checkedFilterType === 'templateonly') {
		filterBy = 'filterBy[isTemplate]=true';
	} else if(checkedFilterType === 'applicationonly') {
		filterBy = 'filterBy[isTemplate]=false';
	}
	applicationNameRegex = (applicationNameRegex === undefined || applicationNameRegex === null) ? '' : applicationNameRegex;
	applicationNameRegex = applicationNameRegex.trim();
	if(applicationNameRegex.length > 0) {
		if(filterBy.length > 0) {
			filterBy += '&';
		}
		filterBy += 'filterBy[name]=' + applicationNameRegex;
	}
	var sortBy = 'sortBy=';
	if(applicationsAdminPanel.sortOrder === 'descending') {
		sortBy += '-';
	}
	sortBy += applicationsAdminPanel.sortColumn;
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
    editorSecurity.fetch(url, { 
    	method: "GET",
    	headers: {"Content-Type": "application/json"}
    }, applicationsAdminPanel.fetchListAbortController)
	.then(function(response) {
		Popup.hideLoading(popupSelector);
		let child = currentList.firstChild;
		while(child) {
			currentList.removeChild(child);
			child = currentList.firstChild;
		}
		if(response.status != 200) {
        	let errorMessage = 'An unknown error occurred. Please try again later.';
        	Popup.showWarningMessage(popupSelector, errorMessage);
		} else {
			response.json().then(function(data) {
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
						Popup.hide('#applications-admin-panel-select-application-popup');
						var href = this.getAttribute('href');
						var applicationUUID = href.substring(1);
						applicationsAdminPanel.loadApplication(applicationUUID);
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
   //  applicationsAdminPanel.ajaxCallList = editorSecurity.ajax({type: 'GET',
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

var documentReady = function() {
    applicationsAdminPanel.init();        
}

if((document.readyState === "complete") ||
   (document.readyState !== "loading" && !document.documentElement.doScroll)) {
    documentReady();
} else {
    document.addEventListener("DOMContentLoaded", documentReady);
}