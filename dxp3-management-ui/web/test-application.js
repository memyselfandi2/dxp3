var testPanel = {}

jQuery(document).ready(function() {
	testPanel.init();
});

testPanel.sortOrder = 'ascending';
testPanel.sortColumn = 'name';
testPanel.ajaxCallList = {abort:function(){}};
testPanel.applicationNameRegex = '';

testPanel.init = function() {

	$('.sort-by-template').on('click', function(ev) {
		ev.preventDefault();
		// return columns to default sort icon
		$(this).parent().find('i').attr('class', 'fa fa-sort');
		var icon = $(this).find('i');
		icon.removeClass('fa-sort');
		if(testPanel.sortColumn === 'isTemplate') {
			if(testPanel.sortOrder === 'ascending') {
				icon.addClass('fa-sort-alpha-desc');
				testPanel.sortOrder = 'descending';
			} else {
				icon.addClass('fa-sort-alpha-asc');
				testPanel.sortOrder = 'ascending';
			}
		} else {
			icon.addClass('fa-sort-alpha-asc');
			testPanel.sortOrder = 'ascending';
		}
		testPanel.sortColumn = 'isTemplate';
		testPanel.list(testPanel.applicationNameRegex);
		return false;
	});

	$('.sort-by-name').on('click', function(ev) {
		ev.preventDefault();
		// return columns to default sort icon
		$(this).parent().find('i').attr('class', 'fa fa-sort');
		var icon = $(this).find('i');
		icon.removeClass('fa-sort');
		if(testPanel.sortColumn === 'name') {
			if(testPanel.sortOrder === 'ascending') {
				icon.addClass('fa-sort-alpha-desc');
				testPanel.sortOrder = 'descending';
			} else {
				icon.addClass('fa-sort-alpha-asc');
				testPanel.sortOrder = 'ascending';
			}
		} else {
			icon.addClass('fa-sort-alpha-asc');
			testPanel.sortOrder = 'ascending';
		}
		testPanel.sortColumn = 'name';
		testPanel.list(testPanel.applicationNameRegex);
		return false;
	});

	$('.sort-by-shortname').on('click', function(ev) {
		ev.preventDefault();
		// return columns to default sort icon
		$(this).parent().find('i').attr('class', 'fa fa-sort');
		var icon = $(this).find('i');
		icon.removeClass('fa-sort');
		if(testPanel.sortColumn === 'shortName') {
			if(testPanel.sortOrder === 'ascending') {
				icon.addClass('fa-sort-alpha-desc');
				testPanel.sortOrder = 'descending';
			} else {
				icon.addClass('fa-sort-alpha-asc');
				testPanel.sortOrder = 'ascending';
			}
		} else {
			icon.addClass('fa-sort-alpha-asc');
			testPanel.sortOrder = 'ascending';
		}
		testPanel.sortColumn = 'shortName';
		testPanel.list(testPanel.applicationNameRegex);
		return false;
	});

	$('.sort-by-parent').on('click', function(ev) {
		ev.preventDefault();
		// return columns to default sort icon
		$(this).parent().find('i').attr('class', 'fa fa-sort');
		var icon = $(this).find('i');
		icon.removeClass('fa-sort');
		if(testPanel.sortColumn === 'parentNames') {
			if(testPanel.sortOrder === 'ascending') {
				icon.addClass('fa-sort-alpha-desc');
				testPanel.sortOrder = 'descending';
			} else {
				icon.addClass('fa-sort-alpha-asc');
				testPanel.sortOrder = 'ascending';
			}
		} else {
			icon.addClass('fa-sort-alpha-asc');
			testPanel.sortOrder = 'ascending';
		}
		testPanel.sortColumn = 'parentNames';
		testPanel.list(testPanel.applicationNameRegex);
		return false;
	});

	$('#action-update').on('click', function() {
		var uuid = $('#update-application-uuid').text();
		var _parentUuids = $('#update-application-parent-uuid').val();
		var _name = $('#update-application-name').val();
		var _shortname = $('#update-application-shortname').val();
		var _isTemplate = $('#update-application-is-template-yes').prop('checked');
		var _description = $('#update-application-description').val();
		var url = '/application/' + uuid;
		securityManager.ajax({type: 'PUT',
			url: url,
			dataType: 'json',
			data:{parentUuids:_parentUuids, name:_name, shortName:_shortname, description:_description,isTemplate:_isTemplate},
			success: function(data) {
				testPanel.list(testPanel.applicationNameRegex);
			},
			error: function(data) {
				alert('failed');
			}
		});
	});

	$('#action-create-random').on('click', function() {
		var numberOfRandom = $('#number-of-random').val();
		numberOfRandom = parseInt(numberOfRandom);
		if(isNaN(numberOfRandom)) {
			numberOfRandom = 100;
			$('#number-of-random').val(numberOfRandom);
		}
		for(var j=0;j < numberOfRandom;j++) {
			var name = randomString(10);
			var shortName = randomString(3);
	   		$('#create-application-name').val(name);
	   		$('#create-application-shortname').val(shortName);
	   		$('#action-create').trigger('click');
   		}
	});

function randomString(length) {
	var name = '';
	var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	var charactersLength = characters.length;
	for ( var i = 0; i < length; i++ ) {
		name += characters.charAt(Math.floor(Math.random() * charactersLength));
	}
	return name;
}
	$('#action-create').on('click', function() {
		var _parentUuids = $('#create-application-parent-uuid').val();
		var _name = $('#create-application-name').val();
		var _shortname = $('#create-application-shortname').val();
		var _isTemplate = $('#create-application-is-template-yes').prop('checked');
		var _description = $('#create-application-description').val();
		$.post('/application/',{parentUuids:_parentUuids, name:_name, shortName:_shortname, description:_description,isTemplate:_isTemplate},
			function(data,status) {
				$('#create-application-parent-uuid').val('');
				$('#create-application-name').val('');
				$('#create-application-shortname').val('');
				$('#create-application-is-template-yes').prop('checked', false);
				$('#create-application-description').val('');
				testPanel.list(testPanel.applicationNameRegex);
			}
		)
		.fail(function(response) {
			alert('failed');
		});
	});

	$('#application-name-input').on('keyup', function(ev) {
		testPanel.applicationNameRegex = $(this).val();
		testPanel.list(testPanel.applicationNameRegex);
	});

	$('#action-refresh').on('click', function() {
		testPanel.list(testPanel.applicationNameRegex);
	});

	$('div.list>ul.content').on('click', '.action-delete-item', function() {
		var uuid = $(this).attr('href').substring(1);
		var url = '/application/' + uuid;
		securityManager.ajax({type: 'DELETE',
			url: url,
			dataType: 'json',
			success: function(data) {
				testPanel.list(testPanel.applicationNameRegex);
			},
			error: function(data) {
				alert('failed');
			}
		});
	});
	$('div.list>ul.content').on('click', '.action-load-item', function() {
		var uuid = $(this).attr('href').substring(1);
		var url = '/application/' + uuid;
		securityManager.ajax({type: 'GET',
			url: url,
			dataType: 'json',
			success: function(data) {
				$('#update-application-uuid').text(data.uuid);
				$('#update-application-name').val(data.name);
				$('#update-application-shortname').val(data.shortName);
				$('#update-application-is-template-yes').prop('checked', data.isTemplate);
				$('#update-application-is-template-no').prop('checked', !data.isTemplate);
				$('#update-application-description').val(data.description);
				var parentUuids = '';
				var parentNames = '';
				if(data.parentUuids) {
					var numberOfParents = data.parentUuids.length;
					data.parentUuids.forEach(function(item, index) {
						parentUuids += item;
						if(index < (numberOfParents - 1)) {
							parentUuids += ',';
						}
					});
					if(data.parentNames) {
						data.parentNames.forEach(function(item, index) {
							parentNames += item;
							if(index < (numberOfParents - 1)) {
								parentNames += ',';
							}
						});
					}
				}
				$('#update-application-parent-uuid').val(parentUuids);
				$('#update-application-parent-name').text(parentNames);
			},
			error: function(data) {
				alert('failed');
			}
		});
	});
}

testPanel.list = function(applicationNameRegex) {
    testPanel.ajaxCallList.abort();
    var startIndex = parseInt($('#start-index').val());
    if(isNaN(startIndex)) {
    	startIndex = 0;
    }
    var maximumNumberOfResults = parseInt($('#number-of-results').val());
    if(isNaN(maximumNumberOfResults)) {
    	maximumNumberOfResults = -1;
	}
	$('#list-applications-panel div.list>ul.content').empty();
	var checkedFilterType = $('#list-applications-panel input.filter-radio-button:checked').val();
	var filterBy = '';
	if(checkedFilterType === 'globalonly') {
	 	filterBy = 'filterBy[isGlobal]=true';
	} else if(checkedFilterType === 'applicationonly') {
	 	filterBy = 'filterBy[isGlobal]=false';
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
	var url = '/application/';
	var needsAmpersand = false;
	if(filterByAndSortBy.length > 0) {
		url += '?' + filterByAndSortBy;
		needsAmpersand = true;
	}
	if(maximumNumberOfResults > -1) {
		if(needsAmpersand) {
			url += '&';
		} else {
			url += '?';
			needsAmpersand = true;
		}
		url += 'maximumNumberOfResults=' + maximumNumberOfResults;
	}
	if(startIndex > 0) {
		if(needsAmpersand) {
			url += '&';
		} else {
			url += '?';
			needsAmpersand = true;
		}
		url += 'startIndex=' + startIndex;
	}
	$('#list-applications-panel .message').text(url);
    testPanel.ajaxCallList = securityManager.ajax({type: 'GET',
		url: url,
		dataType: 'json',
		success: function(data) {
        	var noResults = false;
            if(data !== undefined && (data !== null) && (data != '')) {
            	if(data.numberOfResults <= 0) {
            		noResults = true;
            	} else {
            		var ulElement = $('div.list>ul.content');
	                for(var index in data.list) {
	                    var uuid = data.list[index].uuid;
	                    var name = data.list[index].name;
	                    var shortName = data.list[index].shortName;
	                    var isTemplate = data.list[index].isTemplate;
	                    var liElement = '<li><a class="action-load-item action-list-item" href="#' + uuid + '">' + name + '</a>&nbsp;';
	                    liElement += '<a class="action-load-item action-list-item" href="#' + uuid + '">' + shortName + '</a>&nbsp;';
	                    var parentUuids = data.list[index].parentUuids;
	                    var parentNames = data.list[index].parentNames;
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
	                    liElement += isTemplate + '&nbsp;';
	                    liElement += '<a class="action-delete-item" href="#' + uuid + '"><i class="fa fa-trash"></i>Delete</a></li>';
	                    ulElement.append(liElement);
	                }
	            }
            } else {
            	noResults = true;
            }
            if(noResults) {
            	$('.message').text('No applications found.');
            } else {
            	$('.message').text('Showing ' + data.numberOfResults + ' of ' + data.totalNumberOfResults + ' found records');
            }
		},
        error: function(data) {
        }
	});
 //        	var noResults = false;
 //            if(data !== undefined && (data !== null) && (data != '')) {
 //            	if(data.length <= 0) {
 //            		noResults = true;
 //            	} else {
 //            		var ulElement = $(popupSelector + ' div.list>ul.content');
	//                 for(var index in data) {
	//                     var uuid = data[index].uuid;
	//                     var applicationName = data[index].name;
	//                     var isTemplate = data[index].isTemplate;
	//                     if(isTemplate === undefined || isTemplate === null) {
	//                     	isTemplate = false;
	//                     }
	//                     var liElement = '<li><a class="action-load-application action-list-item" href="#' + uuid + '">' + applicationName + '</a>&nbsp;';
	//                     var parentUuids = data[index].parentUuids;
	//                     var parentUuid = '';
	//                     if(parentUuids != undefined && parentUuids != null) {
	//                     	if(Array.isArray(parentUuids) && (parentUuids.length > 0)) {
	//                     		parentUuid = parentUuids[0];
	//                     		if(parentUuid != undefined && (parentUuid != null)) {
	//                     			parentUuid = parentUuid.trim();
	//                     		}
	//                     	}
	//                     }
	//                     var parentNames = data[index].parentNames;
	//                     var parentName = '';
	//                     if(parentNames != undefined && parentNames != null) {
	//                     	if(Array.isArray(parentNames) && (parentNames.length > 0)) {
	//                     		var _parentName = parentNames[0];
	//                     		if(_parentName != undefined && (_parentName != null)) {
	//                     			parentName = _parentName.trim();
 //    							}
	//                     	}
	// 				    }
	//                 	liElement += '<a class="action-load-application action-list-item" href="#';
	//                 	if(parentUuid.length > 0) {
	//                 		liElement += parentUuid + '">' + parentName;
	//                 	} else {
	//                 		liElement += uuid + '">';
	//                 	}
	//                 	liElement += '</a>&nbsp;';
	//                 	liElement += '<a class="action-load-application action-list-item small" href="#' + uuid + '">';
	//                     if(isTemplate) {
	//                     	liElement += 'Yes';
	//                     }
	//                 	liElement += '</a>&nbsp;';
	//                     liElement += '<a class="action-delete-application" href="#' + uuid + '"><i class="fa fa-trash"></i></a></li>';
	//                     ulElement.append(liElement);
	//                 }
	//             }
 //            } else {
 //            	noResults = true;
 //            }
 //            if(noResults) {
 //            	popup.showInfoMessage(popupSelector, 'No applications found.');
 //        		$(popupSelector + ' div.list>ul.header').hide();
 //            } else {
 //        		$(popupSelector + ' div.list>ul.header').show();
 //            	popup.hideMessage(popupSelector);
 //            }
	// 		popup.hideLoading(popupSelector);
 //        },
 //        error: function() {
	// 		popup.hideLoading(popupSelector);
 //        }
 //    });
}