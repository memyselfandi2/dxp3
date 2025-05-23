class Test {

	constructor() {
		this.sortOrder = 'ascending';
		this.sortColumn = 'name';
		this.ajaxCallList = {abort:function(){}};
		this.categoryNameRegex = '';
	}

	init() {
		document.getElementById('action-create').addEventListener('click', function() {
			let parentUuids = document.getElementById('create-usergroup-parent-uuids').value;
			let applicationUuid = document.getElementById('create-usergroup-application-uuid').value;
			let name = document.getElementById('create-usergroup-name').value;
			let description = document.getElementById('create-usergroup-description').value;
			Security.fetch('/api/usergroup/', { 
				method: "POST",
			    body: {"applicationUuid": applicationUuid,
			    	   "name": name,
			    	   "parentUuids": parentUuids,
			           "description": description},
				headers: {"Content-Type": "application/json"}
			})
			.then(function(response) {
				if(response.status === 409) {
					alert("An usergroup with the same name already exists. Please try a different name.");
					return;
				} else if(response.status != 200) {
					alert("An unknown error occurred. Please try again later.");
					return;
				} else {
					document.getElementById('create-usergroup-parent-uuids').value = '';
					document.getElementById('create-usergroup-application-uuid').value = '';
					document.getElementById('create-usergroup-name').value = '';
					document.getElementById('create-usergroup-description').value = '';
					response.json().then(function(data) {
						alert(data);
			        });
				}
			})
			.catch(function(exception) {
				alert("An unknown error occurred. Please try again later.");
			});
		});
	}

	list(nameRegex) {
	    testPanel.ajaxCallList.abort();
		$('#list-categories-panel div.list>ul.content').empty();
		var checkedFilterType = $('#list-categories-panel input.filter-radio-button:checked').val();
		var filterBy = '';
		if(checkedFilterType === 'globalonly') {
		 	filterBy = 'filterBy[isGlobal]=true';
		} else if(checkedFilterType === 'applicationonly') {
		 	filterBy = 'filterBy[isGlobal]=false';
		}
		categoryNameRegex = (categoryNameRegex === undefined || categoryNameRegex === null) ? '' : categoryNameRegex;
		categoryNameRegex = categoryNameRegex.trim();
		if(categoryNameRegex.length > 0) {
			if(filterBy.length > 0) {
				filterBy += '&';
			}
			filterBy += 'filterBy[name]=' + categoryNameRegex;
		}
		var sortBy = 'sortBy=';
		if(testPanel.sortOrder === 'descending') {
			sortBy += '-';
		}
		sortBy += testPanel.sortColumn;
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
		var url = '/category/';
		if(filterByAndSortBy.length > 0) {
			url += '?' + filterByAndSortBy;
		}
		$('#list-categories-panel .message').text(url);
	    testPanel.ajaxCallList = securityManager.ajax({type: 'GET',
			url: url,
			dataType: 'json',
			success: function(data) {
	        	var noResults = false;
	            if(data !== undefined && (data !== null) && (data != '')) {
	            	if(data.length <= 0) {
	            		noResults = true;
	            	} else {
	            		var ulElement = $('div.list>ul.content');
		                for(var index in data) {
		                    var uuid = data[index].uuid;
		                    var name = data[index].name;
		                    var liElement = '<li><a class="action-load-item action-list-item" href="#' + uuid + '">' + name + '</a>&nbsp;';
		                    var parentUuids = data[index].parentUuids;
		                    var parentNames = data[index].parentNames;
		                    for(i=0;i < parentUuids.length;i++) {
		                    	var parentUuid = parentUuids[i];
		                    	if(parentNames.length > i) {
			                    	var parentName = parentNames[i];
				                	liElement += '<a class="action-load-item action-list-item" href="#';
				                	if(parentUuid.length > 0) {
				                		liElement += parentUuid + '">' + parentName;
				                	} else {
				                		liElement += uuid + '">';
				                	}
				                	liElement += '</a>&nbsp;';
				                }
		                    }
		                    liElement += '<a class="action-delete-item" href="#' + uuid + '"><i class="fa fa-trash"></i>Delete</a></li>';
		                    ulElement.append(liElement);
		                }
		            }
	            } else {
	            	noResults = true;
	            }
	            if(noResults) {
	            	$('.message').text('No categories found.');
	            } else {
	            	$('.message').text('');
	            }
			},
	        error: function(data) {
				alert(data);
	        }
		});
	}
}

let documentReady = function() {
	Security.init();

	let test = new Test();
	test.init();
}

if((document.readyState === "complete") ||
   (document.readyState !== "loading" && !document.documentElement.doScroll)) {
	documentReady();
} else {
	document.addEventListener("DOMContentLoaded", documentReady);
}


// testPanel.init = function() {

// 	$('#action-update').on('click', function() {
// 		var uuid = $('#update-category-uuid').text();
// 		var _parentUuids = $('#update-category-parent-uuid').val();
// 		var _name = $('#update-category-name').val();
// 		var _description = $('#update-category-description').val();
// 		var _types = new Array();
// 		$('input.update-category-type:checked').each(function() {
// 			_types.push($(this).val());
// 		});
// 		var url = '/category/' + uuid;
// 		securityManager.ajax({type: 'PUT',
// 			url: url,
// 			dataType: 'json',
// 			data:{parentUuids:_parentUuids, name:_name, description:_description,types:_types},
// 			success: function(data) {
// 				testPanel.list(testPanel.categoryNameRegex);
// 			},
// 			error: function(data) {
// 				alert('failed');
// 			}
// 		});
// 	});


// 	$('#category-name-input').on('keyup', function(ev) {
// 		testPanel.categoryNameRegex = $(this).val();
// 		testPanel.list(testPanel.categoryNameRegex);
// 	});

// 	$('#update-select-all-category-types').on('click', function(ev) {
// 		if($(this).prop('checked')) {
// 			$('.update-category-type').prop('checked', true);
// 		} else {
// 			$('.update-category-type').prop('checked', false);
// 		}
// 	});

// 	$('input.update-category-type').on('click', function(ev) {
// 		var atLeastOneIsNotChecked = false;
// 		$('.update-category-type').each(function() {
// 			if(!$(this).prop('checked')) {
// 				atLeastOneIsNotChecked = true;
// 			};
// 		});
// 		$('#update-select-all-category-types').prop('checked', !atLeastOneIsNotChecked);
// 	});

// 	$('#select-all-category-types').on('click', function(ev) {
// 		if($(this).prop('checked')) {
// 			$('.category-type').prop('checked', true);
// 		} else {
// 			$('.category-type').prop('checked', false);
// 		}
// 	});

// 	$('input.category-type').on('click', function(ev) {
// 		var atLeastOneIsNotChecked = false;
// 		$('.category-type').each(function() {
// 			if(!$(this).prop('checked')) {
// 				atLeastOneIsNotChecked = true;
// 			};
// 		});
// 		$('#select-all-category-types').prop('checked', !atLeastOneIsNotChecked);
// 	});

// 	$('#action-refresh').on('click', function() {
// 		testPanel.list(testPanel.categoryNameRegex);
// 	});

// 	$('div.list>ul.content').on('click', '.action-delete-item', function() {
// 		var uuid = $(this).attr('href').substring(1);
// 		var url = '/category/' + uuid;
// 		securityManager.ajax({type: 'DELETE',
// 			url: url,
// 			dataType: 'json',
// 			success: function(data) {
// 				testPanel.list(testPanel.categoryNameRegex);
// 			},
// 			error: function(data) {
// 				alert('failed');
// 			}
// 		});
// 	});
// 	$('div.list>ul.content').on('click', '.action-load-item', function() {
// 		var uuid = $(this).attr('href').substring(1);
// 		var url = '/category/' + uuid;
// 		securityManager.ajax({type: 'GET',
// 			url: url,
// 			dataType: 'json',
// 			success: function(data) {
// 				$('#update-category-uuid').text(data.uuid);
// 				$('#update-category-name').val(data.name);
// 				$('#update-category-description').val(data.description);
// 				var parentUuids = '';
// 				var numberOfParents = data.parentUuids.length;
// 				data.parentUuids.forEach(function(item, index) {
// 					parentUuids += item;
// 					if(index < (parentUuids.length - 1)) {
// 						parentUuids += ',';
// 					}
// 				});
// 				$('#update-category-parent-uuid').val(parentUuids);
// 				$('input[name="update-category-type"]').prop('checked', false);
// 				data.types.forEach(function(item, index) {
// 					$('input[name="update-category-type"][value="' + item + '"]').prop('checked', true);
// 				});
// 			},
// 			error: function(data) {
// 				alert('failed');
// 			}
// 		});
// 	});
// }

// testPanel.list = function(categoryNameRegex) {
//     testPanel.ajaxCallList.abort();
// 	$('#list-categories-panel div.list>ul.content').empty();
// 	var checkedFilterType = $('#list-categories-panel input.filter-radio-button:checked').val();
// 	var filterBy = '';
// 	if(checkedFilterType === 'globalonly') {
// 	 	filterBy = 'filterBy[isGlobal]=true';
// 	} else if(checkedFilterType === 'applicationonly') {
// 	 	filterBy = 'filterBy[isGlobal]=false';
// 	}
// 	categoryNameRegex = (categoryNameRegex === undefined || categoryNameRegex === null) ? '' : categoryNameRegex;
// 	categoryNameRegex = categoryNameRegex.trim();
// 	if(categoryNameRegex.length > 0) {
// 		if(filterBy.length > 0) {
// 			filterBy += '&';
// 		}
// 		filterBy += 'filterBy[name]=' + categoryNameRegex;
// 	}
// 	var sortBy = 'sortBy=';
// 	if(testPanel.sortOrder === 'descending') {
// 		sortBy += '-';
// 	}
// 	sortBy += testPanel.sortColumn;
// 	var filterByAndSortBy = '';
// 	if(filterBy.length > 0) {
// 		filterByAndSortBy = filterBy;
// 	}
// 	if(sortBy.length > 0) {
// 		if(filterByAndSortBy.length > 0) {
// 			filterByAndSortBy += '&';
// 		}
// 		filterByAndSortBy += sortBy;
// 	}
// 	var url = '/category/';
// 	if(filterByAndSortBy.length > 0) {
// 		url += '?' + filterByAndSortBy;
// 	}
// 	$('#list-categories-panel .message').text(url);
//     testPanel.ajaxCallList = securityManager.ajax({type: 'GET',
// 		url: url,
// 		dataType: 'json',
// 		success: function(data) {
//         	var noResults = false;
//             if(data !== undefined && (data !== null) && (data != '')) {
//             	if(data.length <= 0) {
//             		noResults = true;
//             	} else {
//             		var ulElement = $('div.list>ul.content');
// 	                for(var index in data) {
// 	                    var uuid = data[index].uuid;
// 	                    var name = data[index].name;
// 	                    var liElement = '<li><a class="action-load-item action-list-item" href="#' + uuid + '">' + name + '</a>&nbsp;';
// 	                    var parentUuids = data[index].parentUuids;
// 	                    var parentNames = data[index].parentNames;
// 	                    for(i=0;i < parentUuids.length;i++) {
// 	                    	var parentUuid = parentUuids[i];
// 	                    	if(parentNames.length > i) {
// 		                    	var parentName = parentNames[i];
// 			                	liElement += '<a class="action-load-item action-list-item" href="#';
// 			                	if(parentUuid.length > 0) {
// 			                		liElement += parentUuid + '">' + parentName;
// 			                	} else {
// 			                		liElement += uuid + '">';
// 			                	}
// 			                	liElement += '</a>&nbsp;';
// 			                }
// 	                    }
// 	                    liElement += '<a class="action-delete-item" href="#' + uuid + '"><i class="fa fa-trash"></i>Delete</a></li>';
// 	                    ulElement.append(liElement);
// 	                }
// 	            }
//             } else {
//             	noResults = true;
//             }
//             if(noResults) {
//             	$('.message').text('No categories found.');
//             } else {
//             	$('.message').text('');
//             }
// 		},
//         error: function(data) {
// 			alert(data);
//         }
// 	});
//  //        	var noResults = false;
//  //            if(data !== undefined && (data !== null) && (data != '')) {
//  //            	if(data.length <= 0) {
//  //            		noResults = true;
//  //            	} else {
//  //            		var ulElement = $(popupSelector + ' div.list>ul.content');
// 	//                 for(var index in data) {
// 	//                     var uuid = data[index].uuid;
// 	//                     var applicationName = data[index].name;
// 	//                     var isTemplate = data[index].isTemplate;
// 	//                     if(isTemplate === undefined || isTemplate === null) {
// 	//                     	isTemplate = false;
// 	//                     }
// 	//                     var liElement = '<li><a class="action-load-application action-list-item" href="#' + uuid + '">' + applicationName + '</a>&nbsp;';
// 	//                     var parentUuids = data[index].parentUuids;
// 	//                     var parentUuid = '';
// 	//                     if(parentUuids != undefined && parentUuids != null) {
// 	//                     	if(Array.isArray(parentUuids) && (parentUuids.length > 0)) {
// 	//                     		parentUuid = parentUuids[0];
// 	//                     		if(parentUuid != undefined && (parentUuid != null)) {
// 	//                     			parentUuid = parentUuid.trim();
// 	//                     		}
// 	//                     	}
// 	//                     }
// 	//                     var parentNames = data[index].parentNames;
// 	//                     var parentName = '';
// 	//                     if(parentNames != undefined && parentNames != null) {
// 	//                     	if(Array.isArray(parentNames) && (parentNames.length > 0)) {
// 	//                     		var _parentName = parentNames[0];
// 	//                     		if(_parentName != undefined && (_parentName != null)) {
// 	//                     			parentName = _parentName.trim();
//  //    							}
// 	//                     	}
// 	// 				    }
// 	//                 	liElement += '<a class="action-load-application action-list-item" href="#';
// 	//                 	if(parentUuid.length > 0) {
// 	//                 		liElement += parentUuid + '">' + parentName;
// 	//                 	} else {
// 	//                 		liElement += uuid + '">';
// 	//                 	}
// 	//                 	liElement += '</a>&nbsp;';
// 	//                 	liElement += '<a class="action-load-application action-list-item small" href="#' + uuid + '">';
// 	//                     if(isTemplate) {
// 	//                     	liElement += 'Yes';
// 	//                     }
// 	//                 	liElement += '</a>&nbsp;';
// 	//                     liElement += '<a class="action-delete-application" href="#' + uuid + '"><i class="fa fa-trash"></i></a></li>';
// 	//                     ulElement.append(liElement);
// 	//                 }
// 	//             }
//  //            } else {
//  //            	noResults = true;
//  //            }
//  //            if(noResults) {
//  //            	popup.showInfoMessage(popupSelector, 'No applications found.');
//  //        		$(popupSelector + ' div.list>ul.header').hide();
//  //            } else {
//  //        		$(popupSelector + ' div.list>ul.header').show();
//  //            	popup.hideMessage(popupSelector);
//  //            }
// 	// 		popup.hideLoading(popupSelector);
//  //        },
//  //        error: function() {
// 	// 		popup.hideLoading(popupSelector);
//  //        }
//  //    });
// }