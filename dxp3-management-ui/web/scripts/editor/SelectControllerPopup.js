class SelectControllerPopup extends Popup {

	constructor(id, size, isTopLevel, hasBorder, hasMenu, _reference, _dao) {
		super(id, size, isTopLevel, hasBorder, hasMenu);
		this.fetchListAbortController = null;
		this.nameRegex = '';
		this.reference = _reference;
		this.dao = _dao;

		let selectControllerPopup = this;

		this.saveButton = new Button(null, 'action-save shade-of-green', 'Save', 'fa fa-check', 'Save');
		this.saveButton.addEventListener('click', function() {
			selectControllerPopup._saveControllerList();
		});
		this.cancelButton = new Button(null, 'action-cancel shade-of-red', 'Cancel', 'fa fa-times', 'Cancel');
		this.cancelButton.addEventListener('click', function() {
			selectControllerPopup.close();
		});
		this.saveButton.disable();
		super.addButton(this.saveButton);
		super.addButton(this.cancelButton);

		// this.addButton('rename-controller', 'action-rename', 'Rename', 'fas fa-pen', 'Rename', function() {
		// });
		// this.addButton('select-controller-cancel', 'action-cancel shade-of-red', 'Cancel', 'fa fa-times', 'Cancel', function() {
		// 	selectControllerPopup.close();
		// });

		this.dragSrcEl = null;
	}

	_saveControllerList() {
		let thisSelectControllerPopup = this;
	    let thisEditorElement = document.getElementById(this.id);
		let ulNode = thisEditorElement.querySelector('div.list>ul');
		let liNodes = ulNode.childNodes;
		let controllerUUIDs = [];
		for(let i=0;i < liNodes.length;i++) {
			let liNode = liNodes[i];
			let aNode = liNode.querySelector('.action-load-controller');
			let href = aNode.getAttribute('href');
			href = href.substring(1);
			href = href.split(';');
			controllerUUIDs.push(href[0]);
		}
		this.dao.updateControllerList(this.reference, controllerUUIDs, function(error, result) {
			if(error) {
				return;
			}
			thisSelectControllerPopup.close();
		});
	}

	getDocumentFragment() {
		let template = '';
		template += '<div class="select-controller-popup">';
    	template += 	'<div class="controller-list list">';
		template += 		'<ul>';
		// template += 			'<thead>';
		// template += 				'<tr>';
		// template += 					'<th><a href="#name">Order</a></th>';
		// template += 					'<th><a href="#name">Name</a></th>';
		// template += 				'</tr>';
		// template += 			'</thead>';
		// template += 			'<tbody>';
		// template += 			'</tbody>';
		template += 		'</ul>';
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
		// alert('refresh');
		if(text === undefined || text === null) {
			text = '';
		}
		this.nameRegex = text;
		this.list(this.nameRegex);
	}

	_refreshButtonState() {
		let isUpdated = false;
	    let thisEditorElement = document.getElementById(this.id);
		let ulNode = thisEditorElement.querySelector('div.list>ul');
		let liNodes = ulNode.childNodes;
		for(let i=0;i < liNodes.length;i++) {
			let liNode = liNodes[i];
			if(!liNode.classList.contains('sequence_' + i)) {
				isUpdated = true;
				break;
			}
		} 
	    if(isUpdated) {
	    	this.saveButton.enable();
	    } else {
	    	this.saveButton.disable();
	    }
	}

	list(nameRegex) {
		// alert('list: ' + nameRegex);
	    let popupSelector = '#' + this.id;
	    this.showLoading();
		if(this.fetchListAbortController != null) {
			this.fetchListAbortController.abort();
		}
	    if(nameRegex === undefined || nameRegex === null) {
	    	nameRegex = this.nameRegex;
	    }
	    let thisSelectControllerPopup = this;
	    let thisEditorElement = document.getElementById(this.id);
		let currentList = thisEditorElement.querySelector('div.list>ul');
    	this.saveButton.disable();
		let child = currentList.firstChild;
		while(child) {
			currentList.removeChild(child);
			child = currentList.firstChild;
		}
		this.fetchListAbortController = this.dao.readController(this.reference, null, function(err, result) {
	    	thisSelectControllerPopup.hideLoading();
			if(err) {
	        	let errorMessage = 'An unknown error occurred. Please try again later.';
	        	thisSelectControllerPopup.showWarningMessage(errorMessage);
	        	return;
			}
			let found = false;
  	        for(let i=0;i < result.list.length;i++) {
  	        	if(nameRegex.length > 0) {
					if(!result.list[i].name.match(nameRegex)) {
						continue;
					}
  	        	}
  	        	found = true;
  	        	let aElement = null;
				let liElement = document.createElement('li');
  	        	if(nameRegex.length > 0) {
					liElement.setAttribute('draggable', 'false');
				} else {
					liElement.setAttribute('draggable', 'true');
				}
				liElement.setAttribute('class', 'sequence_' + i);
				// let spanElement = document.createElement('span');
				// // aElement.setAttribute('class', 'action-load-controller action-list-item');
				// // aElement.setAttribute('href', '#' + i);

				// let spanContent = document.createTextNode(i + 1);
				// spanElement.appendChild(spanContent);
				// liElement.appendChild(spanElement);

				aElement = document.createElement('a');
  	        	if(nameRegex.length > 0) {
					aElement.setAttribute('class','action-move-up invisible');
  	        	} else {
					aElement.setAttribute('class','action-move-up');
				}
				aElement.setAttribute('href','#');
				aElement.addEventListener('click', function(ev) {
					let liNode = this.parentNode;
					let previousSibling = liNode.previousSibling;
					if(previousSibling === undefined || previousSibling === null) {
						return;
					}
					let parent = liNode.parentNode;
					parent.insertBefore(liNode, previousSibling);
					thisSelectControllerPopup._refreshButtonState();
				});
				// if(i <= 0) {
				// 	aElement.setAttribute('class', 'invisible');
				// }
				let iElement = document.createElement('i');
				iElement.setAttribute('class', 'fa fa-arrow-up');
				aElement.appendChild(iElement);
				liElement.appendChild(aElement);
				aElement = document.createElement('a');
  	        	if(nameRegex.length > 0) {
					aElement.setAttribute('class','action-move-down invisible');
  	        	} else {
					aElement.setAttribute('class','action-move-down');
				}
				aElement.setAttribute('href', '#');
				aElement.addEventListener('click', function(ev) {
					let liNode = this.parentNode;
					let nextSibling = liNode.nextSibling;
					if(nextSibling === undefined || nextSibling === null) {
						return;
					}
					nextSibling = nextSibling.nextSibling;
					let parent = liNode.parentNode;
					if(nextSibling === undefined || nextSibling === null) {
						parent.appendChild(liNode);
					} else {
						parent.insertBefore(liNode, nextSibling);
					}
					thisSelectControllerPopup._refreshButtonState();
				});
				// if(i >= (result.list.length - 1)) {
				// 	aElement.setAttribute('class', 'invisible');
				// }
				iElement = document.createElement('i');
				iElement.setAttribute('class', 'fa fa-arrow-down');
				aElement.appendChild(iElement);
				liElement.appendChild(aElement);

				let actionLoad = document.createElement('a');
				actionLoad.setAttribute('class', 'action-load-controller action-list-item');
				actionLoad.setAttribute('href', '#' + result.list[i].uuid + ';' + result.list[i].name);

				let aContent = document.createTextNode(result.list[i].name);
				actionLoad.appendChild(aContent);

				liElement.appendChild(actionLoad);

				let actionDelete = document.createElement('a');
				actionDelete.setAttribute('class', 'action-delete-controller action-list-item-delete');
				actionDelete.setAttribute('href', '#' + result.list[i].uuid);

				iElement = document.createElement('i');
				iElement.setAttribute('class', 'fa fa-trash-alt');
				actionDelete.appendChild(iElement);
				liElement.appendChild(actionDelete);

				currentList.appendChild(liElement);
				actionDelete.addEventListener('click', function(ev) {
					ev.preventDefault();
					let href = this.getAttribute('href');

				});
				actionLoad.addEventListener('click', function(ev) {
					ev.preventDefault();
					let href = this.getAttribute('href');
					href = href.substring(1);
					href = href.split(';');
					let event = {};
					event.applicationUUID = thisSelectControllerPopup.reference;
					event.controllerUUID = href[0];
					event.controllerName = href[1];
					thisSelectControllerPopup.dispatchEvent('select', event);
					return false;
				});
  	        	if(nameRegex.length <= 0) {
					liElement.addEventListener('dragstart', function(ev) {
						ev.stopPropagation();
						thisSelectControllerPopup.dragSrcEl = this;
						// ev.dataTransfer.effectAllowed = 'move';
						// ev.dataTransfer.setData('text/html', this.innerHTML);
						return false;
					});
					liElement.addEventListener('dragenter', function(ev) {
						ev.preventDefault();
						ev.stopPropagation();
						this.classList.add('over');
						return false;
					});
					liElement.addEventListener('dragover', function(ev) {
						ev.preventDefault();
						ev.stopPropagation();
						return false;
					});
					liElement.addEventListener('dragleave', function(ev) {
						ev.preventDefault();
						ev.stopPropagation();
						this.classList.remove('over');
						return false;
					});
					liElement.addEventListener('drop', function(ev) {
						ev.preventDefault();
						ev.stopPropagation();
						this.classList.remove('over');
						if (thisSelectControllerPopup.dragSrcEl != this) {
							let parent = this.parentNode;
							parent.removeChild(thisSelectControllerPopup.dragSrcEl);
							parent.insertBefore(thisSelectControllerPopup.dragSrcEl, this);
							// thisSelectControllerPopup.dragSrcEl.innerHTML = this.innerHTML;
							// this.innerHTML = ev.dataTransfer.getData('text/html');
							thisSelectControllerPopup._refreshButtonState();
						}
						return false;
					});
					liElement.addEventListener('dragend', function(ev) {
						ev.preventDefault();
						ev.stopPropagation();
						this.classList.remove('over');
						return false;
					});
				}
  	        }
			if(!found) {
				let infoMessage = 'No controllers found';
				thisSelectControllerPopup.showInfoMessage(infoMessage);
				return;
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