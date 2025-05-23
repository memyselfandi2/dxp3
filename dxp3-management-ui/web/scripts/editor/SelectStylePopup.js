class SelectStylePopup extends Popup {

	constructor(id, size, isTopLevel, hasBorder, hasMenu, _reference, _dao) {
		super(id, size, isTopLevel, hasBorder, hasMenu);
		this.fetchListAbortController = null;
		this.nameRegex = '';
		this.reference = _reference;
		this.dao = _dao;

		let selectStylePopup = this;
		// this.addButton('rename-style', 'action-rename', 'Rename', 'fas fa-pen', 'Rename', function() {
		// });
		// this.addButton('select-style-cancel', 'action-cancel shade-of-red', 'Cancel', 'fa fa-times', 'Cancel', function() {
		// 	selectStylePopup.close();
		// });
	}

	getDocumentFragment() {
		let template = '';
		template += '<div class="select-style-popup">';
    	template += 	'<div class="style-list list">';
		template += 		'<table>';
		// template += 			'<thead>';
		// template += 				'<tr>';
		// template += 					'<th><a href="#name">Order</a></th>';
		// template += 					'<th><a href="#name">Name</a></th>';
		// template += 				'</tr>';
		// template += 			'</thead>';
		template += 			'<tbody>';
		template += 			'</tbody>';
		template += 		'</table>';
    	template += 	'</div>';
    	template += '</div>';
		let myDocumentFragment = document.createRange().createContextualFragment(template);
		let mergedDocumentFragment = super.getDocumentFragment(myDocumentFragment);

		return mergedDocumentFragment;
	}

	init() {
		super.init();
	}

	refresh(text) {
		this.nameRegex = text;
		this.list(this.nameRegex);
	}

	list(nameRegex) {
	    let popupSelector = '#' + this.id;
	    this.showLoading();
		if(this.fetchListAbortController != null) {
			this.fetchListAbortController.abort();
		}
	    this.fetchListAbortController = new AbortController();
	    if(nameRegex === null) {
	    	nameRegex = this.nameRegex;
	    }
	    let thisSelectStylePopup = this;
	    let thisEditorElement = document.getElementById(this.id);
		var currentList = thisEditorElement.querySelector('div.list>table>tbody');
		this.dao.readStyle(this.reference, null, function(err, result) {
	    	thisSelectStylePopup.hideLoading();
			if(err) {
	        	let errorMessage = 'An unknown error occurred. Please try again later.';
	        	thisSelectStylePopup.showWarningMessage(errorMessage);
	        	return;
			}
			let child = currentList.firstChild;
			while(child) {
				currentList.removeChild(child);
				child = currentList.firstChild;
			}
  	        for(let i=0;i < result.list.length;i++) {
				let trElement = document.createElement('tr');
				let tdElement = document.createElement('td');
				let aElement = document.createElement('a');
				aElement.setAttribute('class', 'action-load-style action-list-item');
				aElement.setAttribute('href', '#' + i);
				let aContent = document.createTextNode(i + 1);
				aElement.appendChild(aContent);
				tdElement.appendChild(aElement);
				trElement.appendChild(tdElement);
				tdElement = document.createElement('td');
				aElement = document.createElement('a');
				aElement.setAttribute('class', 'action-load-style action-list-item');
				aElement.setAttribute('href', '#' + result.list[i].uuid + ';' + result.list[i].name);
				aContent = document.createTextNode(result.list[i].name);
				aElement.appendChild(aContent);
				tdElement.appendChild(aElement);
				trElement.appendChild(tdElement);
				currentList.appendChild(trElement);
				aElement.addEventListener('click', function(ev) {
					ev.preventDefault();
					var href = this.getAttribute('href');
					href = href.substring(1);
					href = href.split(';');
					let event = {};
					event.applicationUUID = thisSelectStylePopup.reference;
					event.styleUUID = href[0];
					event.styleName = href[1];
					thisSelectStylePopup.dispatchEvent('select', event);
					return false;
				});
  	        }
		});
	}
}
// 	    Security.fetch(url, { 
// 	    	method: "GET",
// 	    	headers: {"Content-Type": "application/json"}
// 	    }, this.fetchListAbortController)
// 		.then(function(response) {
// 			thisEditorElement.hideLoading();
// 			let child = currentList.firstChild;
// 			while(child) {
// 				currentList.removeChild(child);
// 				child = currentList.firstChild;
// 			}
// 			if(response.status != 200) {
// 	        	let errorMessage = 'An unknown error occurred. Please try again later.';
// 	        	thisEditorElement.showWarningMessage(errorMessage);
// 			} else {
// 				response.json().then(function(data) {
// 	      	        for(var index in data.list) {
// 						var uuid = data.list[index].uuid;
// 	                    var applicationName = data.list[index].name;
// 	                    var isTemplate = data.list[index].isTemplate;
// 	                    if(isTemplate === undefined || isTemplate === null) {
// 	                    	isTemplate = false;
// 	                    }
// 	                    var parentUUIDs = data.list[index].parentUUIDs;
// 	                    var parentUUID = '';
// 	                    if(parentUUIDs != undefined && parentUUIDs != null) {
// 	                    	if(Array.isArray(parentUUIDs) && (parentUUIDs.length > 0)) {
// 	                    		parentUUID = parentUUIDs[0];
// 	                    		if(parentUUID != undefined && (parentUUID != null)) {
// 	                    			parentUUID = parentUUID.trim();
// 	                    		}
// 	                    	}
// 	                    }
// 	                    var parentNames = data.list[index].parentNames;
// 	                    var parentName = '';
// 	                    if(parentNames != undefined && parentNames != null) {
// 	                    	if(Array.isArray(parentNames) && (parentNames.length > 0)) {
// 	                    		var _parentName = parentNames[0];
// 	                    		if(_parentName != undefined && (_parentName != null)) {
// 	                    			parentName = _parentName.trim();
// 								}
// 	                    	}
// 					    }
// 						var trElement = document.createElement('tr');
// 						var tdElement = document.createElement('td');
// 						var aElement = document.createElement('a');
// 						aElement.setAttribute('class', 'action-load-application action-list-item');
// 						aElement.setAttribute('href', '#' + uuid);
// 						var aContent = document.createTextNode(applicationName);
// 						aElement.appendChild(aContent);
// 						tdElement.appendChild(aElement);
// 						trElement.appendChild(tdElement);
// 						tdElement = document.createElement('td');
// 	                	if(parentUUID.length > 0) {
// 							aElement = document.createElement('a');
// 							aElement.setAttribute('class', 'action-load-application action-list-item');
// 							aElement.setAttribute('href', '#' + parentUUID);
// 							aContent = document.createTextNode(parentName);
// 							aElement.appendChild(aContent);
// 							tdElement.appendChild(aElement);
// 						}
// 						trElement.appendChild(tdElement);
// 						tdElement = document.createElement('td');
// 						if(isTemplate) {
// 							var tdContent = document.createTextNode('Yes');
// 							tdElement.appendChild(tdContent);						
// 						}
// 						trElement.appendChild(tdElement);
// 						currentList.appendChild(trElement);
// 					}
// 					var loadApplicationActions = currentList.querySelectorAll('.action-load-application');
// 					for(var i=0;i < loadApplicationActions.length;i++) {
// 						loadApplicationActions[i].addEventListener('click', function(ev) {
// 							ev.preventDefault();
// 							thisEditorElement.hide();
// 							var href = this.getAttribute('href');
// 							var applicationUUID = href.substring(1);
// 							let event = {};
// 							event.applicationUUID = applicationUUID;
// 							event.applicationName = this.text;
// 							console.log('click action-load-application in select application popup');
// 							thisEditorElement.dispatchEvent('select', event);
// 							return false;
// 						})
// 					}
// 	  			});
// 			}
// 		})
// 		.catch(function(error) {
// 			if(error.name === 'AbortError') {
// 				// ignore. This probably means the user is typing faster than we can return results.
// 				return;
// 			} else {
// 				Popup.hideLoading(popupSelector);
// 		    	var errorMessage = 'An unknown error occurred. Please try again later.';
// 		    	Popup.showWarningMessage(popupSelector, errorMessage);
// 		    }
// 		});
// 	   //  applicationsAdminPanel.ajaxCallList = Security.ajax({type: 'GET',
// 	   //      url: url,
// 	   //      dataType: 'json',
// 	   //      success: function(data) {
// 	   //      	var noResults = false;
// 	   //          if(data !== undefined && (data !== null) && (data != '')) {
// 	   //          	if(data.length <= 0) {
// 	   //          		noResults = true;
// 	   //          	} else {
// 	   //          		var ulElement = $(popupSelector + ' div.list>ul.content');
// 		  //               for(var index in data) {
// 		  //                   var uuid = data[index].uuid;
// 		  //                   var applicationName = data[index].name;
// 		  //                   var isTemplate = data[index].isTemplate;
// 		  //                   if(isTemplate === undefined || isTemplate === null) {
// 		  //                   	isTemplate = false;
// 		  //                   }
// 		  //                   var liElement = '<li><a class="action-load-application action-list-item" href="#' + uuid + '">' + applicationName + '</a>';
// 		  //                   var parentUUIDs = data[index].parentUUIDs;
// 		  //                   var parentUUID = '';
// 		  //                   if(parentUUIDs != undefined && parentUUIDs != null) {
// 		  //                   	if(Array.isArray(parentUUIDs) && (parentUUIDs.length > 0)) {
// 		  //                   		parentUUID = parentUUIDs[0];
// 		  //                   		if(parentUUID != undefined && (parentUUID != null)) {
// 		  //                   			parentUUID = parentUUID.trim();
// 		  //                   		}
// 		  //                   	}
// 		  //                   }
// 		  //                   var parentNames = data[index].parentNames;
// 		  //                   var parentName = '';
// 		  //                   if(parentNames != undefined && parentNames != null) {
// 		  //                   	if(Array.isArray(parentNames) && (parentNames.length > 0)) {
// 		  //                   		var _parentName = parentNames[0];
// 		  //                   		if(_parentName != undefined && (_parentName != null)) {
// 		  //                   			parentName = _parentName.trim();
// 	   //  							}
// 		  //                   	}
// 				// 		    }
// 		  //               	liElement += '<a class="action-load-application action-list-item" href="#';
// 		  //               	if(parentUUID.length > 0) {
// 		  //               		liElement += parentUUID + '">' + parentName;
// 		  //               	} else {
// 		  //               		liElement += uuid + '">';
// 		  //               	}
// 		  //               	liElement += '</a>';
// 		  //               	liElement += '<a class="action-load-application action-list-item small" href="#' + uuid + '">';
// 		  //                   if(isTemplate) {
// 		  //                   	liElement += 'Yes';
// 		  //                   }
// 		  //               	liElement += '</a>';
// 		  //                   liElement += '<a class="action-delete-application" href="#' + uuid + '"><i class="fa fa-trash"></i></a></li>';
// 		  //                   ulElement.append(liElement);
// 		  //               }
// 		  //           }
// 	   //          } else {
// 	   //          	noResults = true;
// 	   //          }
// 	   //          if(noResults) {
// 	   //          	popup.showInfoMessage(popupSelector, 'No applications found.');
// 	   //      		$(popupSelector + ' div.list>ul.header').hide();
// 	   //          } else {
// 	   //      		$(popupSelector + ' div.list>ul.header').show();
// 	   //          	popup.hideMessage(popupSelector);
// 	   //          }
// 				// popup.hideLoading(popupSelector);
// 	   //      },
// 	   //      error: function() {
// 				// popup.hideLoading(popupSelector);
// 	   //      }
// 	   //  });
// 	}
// }