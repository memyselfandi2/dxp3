var applicationAdminPanel = {}

jQuery(document).ready(function() {
	applicationAdminPanel.init();
});

applicationAdminPanel.sortOrder = 'ascending';
applicationAdminPanel.sortColumn = 'name';
applicationAdminPanel.hasUnsavedChanges = false;
applicationAdminPanel.currentApplicationNameRegex = '';
applicationAdminPanel.currentApplicationUuid = null;
applicationAdminPanel.currentApplicationParentUuids = null;
applicationAdminPanel.currentApplicationShortName = null;
applicationAdminPanel.currentApplicationHomePage = null;
applicationAdminPanel.currentApplicationName = null;
applicationAdminPanel.currentApplicationDescription = null;
applicationAdminPanel.ajaxCallDefinition = {abort:function(){}};
applicationAdminPanel.currentController = '';
applicationAdminPanel.currentControllerName = '';
applicationAdminPanel.ajaxCallController = {abort:function(){}};
applicationAdminPanel.currentStyle = '';
applicationAdminPanel.currentStyleName = '';
applicationAdminPanel.ajaxCallStyle = {abort:function(){}};
applicationAdminPanel.ajaxCallList = {abort:function(){}};
applicationAdminPanel.ajaxCallParentsList = {abort:function(){}};
applicationAdminPanel.ajaxCallHomePageList = {abort:function(){}};
applicationAdminPanel.ajaxCallPreviewPageList = {abort:function(){}};
applicationAdminPanel.currentPreviewChannel = 'desktop';
applicationAdminPanel.currentPreviewDebug = false;

applicationAdminPanel.init = function() {
	$('#applications-admin-panel-select-application-popup-list .sort-by-name').on('click', function(ev) {
		ev.preventDefault();
		// return columns to default sort icon
		$(this).parent().find('i').attr('class', 'fa fa-sort');
		var icon = $(this).find('i');
		icon.removeClass('fa-sort');
		if(applicationAdminPanel.sortColumn === 'name') {
			if(applicationAdminPanel.sortOrder === 'ascending') {
				icon.addClass('fa-sort-alpha-desc');
				applicationAdminPanel.sortOrder = 'descending';
			} else {
				icon.addClass('fa-sort-alpha-asc');
				applicationAdminPanel.sortOrder = 'ascending';
			}
		} else {
			icon.addClass('fa-sort-alpha-asc');
			applicationAdminPanel.sortOrder = 'ascending';
		}
		applicationAdminPanel.sortColumn = 'name';
		applicationAdminPanel.list('#applications-admin-panel-select-application-popup', applicationAdminPanel.currentApplicationNameRegex);
		return false;
	});
	$('#applications-admin-panel-select-application-popup-list .sort-by-parent').on('click', function(ev) {
		ev.preventDefault();
		// return columns to default sort icon
		$(this).parent().find('i').attr('class', 'fa fa-sort');
		var icon = $(this).find('i');
		icon.removeClass('fa-sort');
		if(applicationAdminPanel.sortColumn === 'parentNames') {
			if(applicationAdminPanel.sortOrder === 'ascending') {
				icon.addClass('fa-sort-alpha-desc');
				applicationAdminPanel.sortOrder = 'descending';
			} else {
				icon.addClass('fa-sort-alpha-asc');
				applicationAdminPanel.sortOrder = 'ascending';
			}
		} else {
			icon.addClass('fa-sort-alpha-asc');
			applicationAdminPanel.sortOrder = 'ascending';
		}
		applicationAdminPanel.sortColumn = 'parentNames';
		applicationAdminPanel.list('#applications-admin-panel-select-application-popup', applicationAdminPanel.currentApplicationNameRegex);
		return false;
	});
	$('#applications-admin-panel-select-application-popup-list .sort-by-template').on('click', function(ev) {
		ev.preventDefault();
		// return columns to default sort icon
		$(this).parent().find('i').attr('class', 'fa fa-sort');
		var icon = $(this).find('i');
		icon.removeClass('fa-sort');
		if(applicationAdminPanel.sortColumn === 'isTemplate') {
			if(applicationAdminPanel.sortOrder === 'ascending') {
				icon.addClass('fa-sort-alpha-desc');
				applicationAdminPanel.sortOrder = 'descending';
			} else {
				icon.addClass('fa-sort-alpha-asc');
				applicationAdminPanel.sortOrder = 'ascending';
			}
		} else {
			icon.addClass('fa-sort-alpha-asc');
			applicationAdminPanel.sortOrder = 'ascending';
		}
		applicationAdminPanel.sortColumn = 'isTemplate';
		applicationAdminPanel.list('#applications-admin-panel-select-application-popup', applicationAdminPanel.currentApplicationNameRegex);
		return false;
	});

	$('#update-application-create-page').on('click', function(ev) {
		ev.preventDefault();
		navigationManager.selectAdminPanel('pages-admin-panel');
		$('#create-page-name').focus();
		return false;
	});
	$('#application-overview input').on('change', function(ev) {
		$('#application-overview .action-message').show();
	});
	$('#action-publish-application').on('click', function(ev) {
		ev.preventDefault();
		applicationAdminPanel.showPublishApplicationPopup();
		return false;
	});
	$('#action-publish-application-confirm').on('click', function(ev) {
		ev.preventDefault();
		applicationAdminPanel.publishApplication();		
		return false;
	});
	$('#create-application-parentUuids-popup').on('show', function(ev) {
		ev.preventDefault();
		applicationAdminPanel.showCreateParentUuidsDropdown();
		return false;
	});
	$('#create-application-parentUuids-popup .filter-radio-button').on('change', function(ev) {
		ev.preventDefault();
		applicationAdminPanel.showCreateParentUuidsDropdown();
		return false;
	});
	$('#create-application-parentUuids-popup .filter-by-name').on('keyup', function(ev) {
		ev.preventDefault();
		applicationAdminPanel.showCreateParentUuidsDropdown();
		return false;
	});
	$('#create-application-parentUuids-popup').on('click', '.action-select-application', function(ev) {
		ev.preventDefault();
		var uuid = $(this).attr('href').substring(1);
		var name = $(this).text();
		$('#create-application-parentUuids-hidden').val(uuid);
		$('#create-application-parentUuids').val(name);
		popup.hide('#create-application-parentUuids-popup');
		return false;
	});
	$('#update-application-homepage-popup').on('click', '.action-select-homepage', function(ev) {
		ev.preventDefault();
		var uuid = $(this).attr('href').substring(1);
		var name = $(this).text();
		$('#update-application-homepage-hidden').val(uuid);
		$('#update-application-homepage').val(name);
		popup.hide('#update-application-homepage-popup');
		return false;
	});
	$('#update-application-parentUuids-popup').on('show', function(ev) {
		ev.preventDefault();
		applicationAdminPanel.showUpdateParentUuidsDropdown();
		return false;
	});
	$('#update-application-parentUuids-popup .filter-radio-button').on('change', function(ev) {
		ev.preventDefault();
		applicationAdminPanel.showUpdateParentUuidsDropdown();
		return false;
	});
	$('#update-application-parentUuids-popup .filter-by-name').on('keyup', function(ev) {
		ev.preventDefault();
		applicationAdminPanel.showUpdateParentUuidsDropdown();
		return false;
	});
	$('#update-application-parentUuids-filter-by-name .clear-button').on('click', function(ev) {
		ev.preventDefault();
		applicationAdminPanel.showUpdateParentUuidsDropdown();
		return false;
	});
	$('#update-application-parentUuids-popup').on('click', '.action-select-application', function(ev) {
		ev.preventDefault();
		var uuid = $(this).attr('href').substring(1);
		var name = $(this).text();
		$('#update-application-parentUuids-hidden').val(uuid);
		$('#update-application-parentUuids').val(name);
		popup.hide('#update-application-parentUuids-popup');
		return false;
	});
	$('#select-application-preview-page-popup').on('show', function(ev) {
		ev.preventDefault();
		applicationAdminPanel.showPreviewPageDropdown();
		return false;
	});
	$('#select-application-preview-page-popup .filter-by-name').on('keyup', function(ev) {
		ev.preventDefault();
		applicationAdminPanel.showPreviewPageDropdown();
		return false;
	});
	$('#select-application-preview-page-filter-by-name .clear-button').on('click', function(ev) {
		ev.preventDefault();
		applicationAdminPanel.showPreviewPageDropdown();
		return false;
	});
	$('#select-application-preview-page-popup').on('click', '.action-select-application-preview-page', function(ev) {
		ev.preventDefault();
		var uuid = $(this).attr('href').substring(1);
		var name = $(this).text();
		$('#select-application-preview-page-hidden').val(uuid);
		$('#select-application-preview-page-input').val(name);
		popup.hide('#select-application-preview-page-popup');
		applicationAdminPanel.refreshApplicationPreview();
		return false;
	});
	$('#update-application-homepage-popup').on('show', function(ev) {
		ev.preventDefault();
		applicationAdminPanel.showUpdateHomePageDropdown();
		return false;
	});
	$('#update-application-homepage-popup .filter-by-name').on('keyup', function(ev) {
		ev.preventDefault();
		applicationAdminPanel.showUpdateHomePageDropdown();
		return false;
	});
	$('#update-application-homepage-filter-by-name .clear-button').on('click', function(ev) {
		ev.preventDefault();
		applicationAdminPanel.showUpdateHomePageDropdown();
		return false;
	});
	// On load we disable everything except for
	// - Searching for applications and
	// - Creating applications
	$('#applications-admin-panel .maskable').addClass('blur');
	$('#applications-admin-panel .mask').show();
	$('#applications-admin-panel-select-application-input').on('click', function(ev) {
		ev.preventDefault();
		$(this).val(applicationAdminPanel.currentApplicationNameRegex);
		popup.show('#applications-admin-panel-select-application-popup');
		applicationAdminPanel.list('#applications-admin-panel-select-application-popup', applicationAdminPanel.currentApplicationNameRegex);
		return false;
	});
	$('#applications-admin-panel-select-application .clear-button').on('click', function(ev) {
		ev.preventDefault();
		applicationAdminPanel.currentApplicationNameRegex = '';
		$('#applications-admin-panel-select-application-input').val(applicationAdminPanel.currentApplicationNameRegex);
		applicationAdminPanel.list('#applications-admin-panel-select-application-popup', applicationAdminPanel.currentApplicationNameRegex);
		return false;
	});
	$('#applications-admin-panel-select-application .search-button').on('click', function(ev) {
		ev.preventDefault();
		$('#applications-admin-panel-select-application-input').val(applicationAdminPanel.currentApplicationNameRegex);
		applicationAdminPanel.list('#applications-admin-panel-select-application-popup', applicationAdminPanel.currentApplicationNameRegex);
		return false;
	});
	$('#applications-admin-panel-select-application-input').on('keyup', function(ev) {
		applicationAdminPanel.currentApplicationNameRegex = $(this).val();
		applicationAdminPanel.list('#applications-admin-panel-select-application-popup', applicationAdminPanel.currentApplicationNameRegex);
	});
	$('#select-application-controller').on('click', function(ev) {
		ev.preventDefault();
		var displayAttribute = $('#application-select-controller-popup').css('display');
		if(displayAttribute === 'none') {
			applicationAdminPanel.showSelectControllerPopup();
		} else {
			$('#application-select-controller-popup').hide();
		}
		return false;
	});
	$('#action-application-libraries').on('click', function(ev) {
		ev.preventDefault();
		popup.toggle('#application-libraries-popup');
		return false;
	})
	$('#select-application-style').on('click', function(ev) {
		ev.preventDefault();
		var displayAttribute = $('#application-select-style-popup').css('display');
		if(displayAttribute === 'none') {
			applicationAdminPanel.showSelectStylePopup();
		} else {
			$('#application-select-style-popup').hide();
		}
		return false;
	});
	$('#action-application-images').on('click', function(ev) {
		applicationAdminPanel.listImages();
	});
	$('#action-application-style-images').on('click', function(ev) {
		applicationAdminPanel.listStyleImages();
	});
	$('#application-style-images-popup-form').on('submit', function(ev) {
		ev.preventDefault();
		applicationAdminPanel.uploadStyleImage();
		return false;
	});
	$('#application-images-popup-form').on('submit', function(ev) {
		ev.preventDefault();
		applicationAdminPanel.uploadImage();
		return false;
	});
	$('#action-application-style-fonts').on('click', function(ev) {
		ev.preventDefault();
		var displayAttribute = $('#application-select-fonts-popup').css('display');
		if(displayAttribute === 'none') {
			applicationAdminPanel.showFontsPopup();
		} else {
			popup.hide('#application-select-fonts-popup');
		}
		return false;
	});	
	// $('#action-application-style-images').on('click', function(ev) {
	// 	ev.preventDefault();
	// 	var displayAttribute = $('#application-style-images-popup').css('display');
	// 	if(displayAttribute === 'none') {
	// 		applicationAdminPanel.showStyleImagesPopup();
	// 	} else {
	// 		popup.hide('#application-style-images-popup');
	// 	}
	// 	return false;
	// });	
	$('#applications-admin-panel-select-application-popup input.filter-radio-button').on('change', function(ev) {
		ev.preventDefault();
		applicationAdminPanel.list('#applications-admin-panel-select-application-popup', applicationAdminPanel.currentApplicationNameRegex);
		return false;
	});
	$('#update-application-popup .action-cancel').on('click', function(ev) {
		$('input[tabindex]').attr('tabindex', '');
		$('textarea[tabindex]').attr('tabindex', '');
		$('.popup').hide();
	});
	$('#publish-application-popup .action-cancel').on('click', function(ev) {
		$('input[tabindex]').attr('tabindex', '');
		$('textarea[tabindex]').attr('tabindex', '');
		$('.popup').hide();
	});
	$('#create-application-name').on('keyup', function(ev) {
		var key = ev.which;
		if(key === 13) {
			applicationAdminPanel.createApplication(true);
			return false;
		}
	});
	$('#create-application-name').on('click', function(ev) {
		ev.preventDefault();
		applicationAdminPanel.showCreateApplicationPopup();
		return false;
	});
	$('#create-application-name').on('focus', function(ev) {
		ev.preventDefault();
		applicationAdminPanel.showCreateApplicationPopup();
		return false;
	});
	$('#create-application-parentUuids').on('click', function(ev) {
		ev.preventDefault();
		popup.show('#create-application-parentUuids-popup');
		return false;
	});
	$('#update-application-parentUuids').on('click', function(ev) {
		ev.preventDefault();
		popup.show('#update-application-parentUuids-popup');
		return false;
	});
	$('#create-application-parentUuids').on('focus', function(ev) {
		ev.preventDefault();
		popup.show('#create-application-parentUuids-popup');
		return false;
	});
	$('#create-application-cancel').on('click', function(ev) {
		ev.preventDefault();
		$('#create-application-popup input').val('');
		$('#create-application-popup textarea').val('');
		popup.close('#create-application-popup');
		return false;
	})
	$('#create-application-save-and-close').on('click', function(ev) {
		ev.preventDefault();
		applicationAdminPanel.createApplication(true);
		return false;
	});
	$('#create-application-save-and-new').on('click', function(ev) {
		ev.preventDefault();
		applicationAdminPanel.createApplication(false);
		return false;
	});
	$('#update-application-save').on('click', function(ev) {
		ev.preventDefault();
		applicationAdminPanel.updateApplication();
		return false;
	});
	$('#applications-admin-panel-select-application-popup-list').on('click', '.action-load-application', function(ev) {
		ev.preventDefault();
		var uuid = $(this).attr('href').substring(1);
		applicationAdminPanel.loadApplication(uuid);
		return false;
	});
	$('#application-select-controller-list').on('click', '.action-application-load-controller', function(ev) {
		ev.preventDefault();
		var controllerName = $(this).attr('href').substring(1);
		$('#application-select-controller-popup').hide();
	    applicationAdminPanel.loadApplicationController(applicationAdminPanel.currentApplicationUuid, controllerName);
		return false;
	});
	$('#application-select-controller-list').on('click', '.action-application-delete-controller', function(ev) {
		ev.preventDefault();
		if(confirm('Are you sure?')) {
			var name = $(this).attr('href').substring(1);
		    applicationAdminPanel.deleteController(applicationAdminPanel.currentApplicationUuid, name);
		}
		return false;
	});
	$('#application-select-style-list').on('click', '.action-application-load-style', function(ev) {
		ev.preventDefault();
		var styleName = $(this).attr('href').substring(1);
		$('#application-select-style-popup').hide();
	    applicationAdminPanel.loadApplicationStyle(applicationAdminPanel.currentApplicationUuid, styleName);
		return false;
	})
	$('#application-select-style-list').on('click', '.action-application-delete-style', function(ev) {
		ev.preventDefault();
		if(confirm('Are you sure?')) {
			var name = $(this).attr('href').substring(1);
		    applicationAdminPanel.deleteStyle(applicationAdminPanel.currentApplicationUuid, name);
		}
		return false;
	});
	$('#applications-admin-panel-select-application-popup-list').on('click', '.action-delete-application', function(ev) {
		ev.preventDefault();
		if(confirm('Are you sure?')) {
			var uuid = $(this).attr('href').substring(1);
			applicationAdminPanel.deleteApplication(uuid);
		}
		return false;
	});
	$('#action-delete-application').on('click', function(ev) {
		ev.preventDefault();
		if(confirm('Are you sure?')) {
			applicationAdminPanel.deleteApplication(applicationAdminPanel.currentApplicationUuid);
		}
		return false;
	});
	$('.action-save-application').on('click', function(ev) {
		ev.preventDefault();
		applicationAdminPanel.saveApplicationController();
		applicationAdminPanel.saveApplicationStyle();
		return false;
	})
	$('#action-save-application-controller').on('click', function(ev) {
		ev.preventDefault();
		applicationAdminPanel.saveApplicationController();
		return false;
	});
	$('#action-save-application-style').on('click', function(ev) {
		ev.preventDefault();
		applicationAdminPanel.saveApplicationStyle();
		return false;
	});
	$('#action-refresh-application-preview').on('click', function(ev) {
		ev.preventDefault();
		applicationAdminPanel.refreshApplicationPreview();
		return false;
	});
	$('#application-preview-frame').on('load', function(ev) {
		$('#application-preview .icon-loading').hide();
	});
	$('#action-application-toggle-debug').on('click', function(ev) {
		ev.preventDefault();
		applicationAdminPanel.currentPreviewDebug = !applicationAdminPanel.currentPreviewDebug;
		if(applicationAdminPanel.currentPreviewDebug) {
			$(this).addClass('shade-of-red');
		} else {
			$(this).removeClass('shade-of-red');
		}
		applicationAdminPanel.refreshApplicationPreview(null, null);
		return false;
	});
	$('#action-application-mobile-preview').on('click', function(ev) {
		ev.preventDefault();
		applicationAdminPanel.currentPreviewChannel = 'mobile';
		$(this).addClass('shade-of-green');
		$('#action-application-tablet-preview').removeClass('shade-of-green');
		$('#action-application-desktop-preview').removeClass('shade-of-green');
		applicationAdminPanel.refreshApplicationPreview(null, null);
		return false;
	});
	$('#action-application-tablet-preview').on('click', function(ev) {
		ev.preventDefault();
		applicationAdminPanel.currentPreviewChannel = 'tablet';
		$(this).addClass('shade-of-green');
		$('#action-application-mobile-preview').removeClass('shade-of-green');
		$('#action-application-desktop-preview').removeClass('shade-of-green');
		applicationAdminPanel.refreshApplicationPreview(null, null);
		return false;
	});
	$('#action-application-desktop-preview').on('click', function(ev) {
		ev.preventDefault();
		applicationAdminPanel.currentPreviewChannel = 'desktop';
		$(this).addClass('shade-of-green');
		$('#action-application-mobile-preview').removeClass('shade-of-green');
		$('#action-application-tablet-preview').removeClass('shade-of-green');
		applicationAdminPanel.refreshApplicationPreview(null, null);
		return false;
	});
	$('#create-application-font-save').on('click', function(ev) {
		ev.preventDefault();
		applicationAdminPanel.saveFont();
		return false;
	});
}

applicationAdminPanel.showSelectControllerPopup = function() {
	popup.show('#application-select-controller-popup');
	applicationAdminPanel.refreshControllers();
}

applicationAdminPanel.publishApplication = function() {
	var data = {};
	data.type = 'application';
	data.uuid = applicationAdminPanel.currentApplicationUuid;
	data.destinationUuid = $('.publish-application-destination:checked').val();
	securityManager.ajax({type: 'POST',
        url: '/publishrequest/',
        data: data,
        dataType: 'json',
        success: function(data) {
        },
        error: function() {
        }
    });
}

applicationAdminPanel.refreshControllers = function() {
	popup.showLoading('#application-select-controller-popup');
	var ulElement = $('#application-select-controller-list > ul');
	ulElement.empty();
	securityManager.ajax({type: 'GET',
        url: '/application/' + applicationAdminPanel.currentApplicationUuid + '/controller/',
        dataType: 'json',
        success: function(data) {
            for(var index in data) {
            	ulElement.append('<li><a class="action-application-load-controller action-list-item" href="#' + data[index] + '">' + data[index] + '</a><a class="action-application-delete-controller" href="#' + data[index] + '"><i class="fa fa-trash"></i></a></li>');
            }
			popup.hideLoading('#application-select-controller-popup');
        },
        error: function() {
			popup.hideLoading('#application-select-controller-popup');
        }
    })
}

applicationAdminPanel.showSelectStylePopup = function() {
	popup.show('#application-select-style-popup');
	applicationAdminPanel.refreshStyles();
}

applicationAdminPanel.refreshStyles = function() {
	popup.showLoading('#application-select-style-popup');
	var ulElement = $('#application-select-style-list > ul');
	ulElement.empty();
	securityManager.ajax({type: 'GET',
        url: '/application/' + applicationAdminPanel.currentApplicationUuid + '/style/',
        dataType: 'json',
        success: function(data) {
            for(var index in data) {
            	ulElement.append('<li><a class="action-application-load-style action-list-item" href="#' + data[index] + '">' + data[index] + '</a><a class="action-application-delete-style" href="#' + data[index] + '"><i class="fa fa-trash"></i></a></li>');
            }
			popup.hideLoading('#application-select-style-popup');
        },
        error: function() {
			popup.hideLoading('#application-select-style-popup');
        }
    });
}

applicationAdminPanel.refreshApplicationPreview = function() {
	var applicationUuid = applicationAdminPanel.currentApplicationUuid;
	if(applicationUuid === undefined || applicationUuid === null) {
		$('#application-preview-frame').attr('src', '');
		return;
	}
	$('#application-preview .icon-loading').show();
	var url = '/preview/';
	var pageUuid = $('#select-application-preview-page-hidden').val();
	pageUuid = pageUuid.trim();
	if(pageUuid.length <= 0) {
		url += '?type=application&uuid=' + applicationUuid;
	} else {
		url += '?type=page&uuid=' + pageUuid;
	}
	var locale = $('#select-application-preview-locale-input').val();
	if(locale === undefined || locale === null) {
		locale = '';
	}
	locale = locale.trim();
	if(locale.length > 0) {
		url += '&locale=' + locale;
	}
	// Check if debugging is on...
	if(applicationAdminPanel.currentPreviewDebug) {
		url += '&debug=true';
	}
	// Select the preview channel...
	url += '&channel=' + applicationAdminPanel.currentPreviewChannel;
	securityManager.setSrc('application-preview-frame', url);
}

applicationAdminPanel.list = function(popupSelector, applicationNameRegex) {
    applicationAdminPanel.ajaxCallList.abort();
	$(popupSelector + ' div.list>ul.content').empty();
	popup.showLoading(popupSelector);
	// Get the filter elements
	var checkedFilterType = $(popupSelector + ' input.filter-radio-button:checked').val();
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
	if(applicationAdminPanel.sortOrder === 'descending') {
		sortBy += '-';
	}
	sortBy += applicationAdminPanel.sortColumn;
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
    applicationAdminPanel.ajaxCallList = securityManager.ajax({type: 'GET',
        url: url,
        dataType: 'json',
        success: function(data) {
        	var noResults = false;
            if(data !== undefined && (data !== null) && (data != '')) {
            	if(data.length <= 0) {
            		noResults = true;
            	} else {
            		var ulElement = $(popupSelector + ' div.list>ul.content');
	                for(var index in data) {
	                    var uuid = data[index].uuid;
	                    var applicationName = data[index].name;
	                    var isTemplate = data[index].isTemplate;
	                    if(isTemplate === undefined || isTemplate === null) {
	                    	isTemplate = false;
	                    }
	                    var liElement = '<li><a class="action-load-application action-list-item" href="#' + uuid + '">' + applicationName + '</a>';
	                    var parentUuids = data[index].parentUuids;
	                    var parentUuid = '';
	                    if(parentUuids != undefined && parentUuids != null) {
	                    	if(Array.isArray(parentUuids) && (parentUuids.length > 0)) {
	                    		parentUuid = parentUuids[0];
	                    		if(parentUuid != undefined && (parentUuid != null)) {
	                    			parentUuid = parentUuid.trim();
	                    		}
	                    	}
	                    }
	                    var parentNames = data[index].parentNames;
	                    var parentName = '';
	                    if(parentNames != undefined && parentNames != null) {
	                    	if(Array.isArray(parentNames) && (parentNames.length > 0)) {
	                    		var _parentName = parentNames[0];
	                    		if(_parentName != undefined && (_parentName != null)) {
	                    			parentName = _parentName.trim();
    							}
	                    	}
					    }
	                	liElement += '<a class="action-load-application action-list-item" href="#';
	                	if(parentUuid.length > 0) {
	                		liElement += parentUuid + '">' + parentName;
	                	} else {
	                		liElement += uuid + '">';
	                	}
	                	liElement += '</a>';
	                	liElement += '<a class="action-load-application action-list-item small" href="#' + uuid + '">';
	                    if(isTemplate) {
	                    	liElement += 'Yes';
	                    }
	                	liElement += '</a>';
	                    liElement += '<a class="action-delete-application" href="#' + uuid + '"><i class="fa fa-trash"></i></a></li>';
	                    ulElement.append(liElement);
	                }
	            }
            } else {
            	noResults = true;
            }
            if(noResults) {
            	popup.showInfoMessage(popupSelector, 'No applications found.');
        		$(popupSelector + ' div.list>ul.header').hide();
            } else {
        		$(popupSelector + ' div.list>ul.header').show();
            	popup.hideMessage(popupSelector);
            }
			popup.hideLoading(popupSelector);
        },
        error: function() {
			popup.hideLoading(popupSelector);
        }
    });
}

applicationAdminPanel.saveApplicationController = function() {
	if(applicationAdminPanel.currentApplicationUuid === null) {
		return;
	}
	var name = $('#select-application-controller').val();
	var code = applicationControllerEditor.getValue();
	if((code === applicationAdminPanel.currentController) && (name === applicationAdminPanel.currentControllerName)) {
		// We might as well still attempt to refresh.
		// Who knows why the user keeps hitting save.
		applicationAdminPanel.refreshApplicationPreview();
		return;
	}
	name = name.trim();
	if(name.length <= 0) {
		name = 'default';
		$('#select-application-controller').val(name);
	}
	$('#application-controllers-section img.icon-loading').show();
    securityManager.ajax({type: "PUT",
        url: '/application/' + applicationAdminPanel.currentApplicationUuid + '/controller/',
        data: {"name": name,
        	   "code": code},
        dataType: 'text',
        success: function(data) {
			$('#application-controllers-section img.icon-loading').hide();
			applicationAdminPanel.currentControllerName = name;
			applicationAdminPanel.currentController = code;
			// Next we refresh the preview
			applicationAdminPanel.refreshApplicationPreview();
        },
        error: function(data) {
            $('#application-preview-frame').attr('src', '#');			
			$('#application-controllers-section img.icon-loading').hide();
        	var errorMessage = 'An unknown error occurred. Please try again later. ';
        	alert(errorMessage);
        }
    });		
}

applicationAdminPanel.saveApplicationStyle = function() {
	if(applicationAdminPanel.currentApplicationUuid === null) {
		return;
	}
	var name = $('#select-application-style').val();
	var code = applicationStyleEditor.getValue();
	if((code === applicationAdminPanel.currentStyle) && (name === applicationAdminPanel.currentStyleName)) {
		// We might as well still attempt to refresh.
		// Who knows why the user keeps hitting save.
		applicationAdminPanel.refreshApplicationPreview();
		return;
	}
	name = name.trim();
	if(name.length <= 0) {
		name = 'default';
		$('#select-application-style').val(name);
	}
	$('#application-styles-section img.icon-loading').show();
    securityManager.ajax({type: "PUT",
        url: '/application/' + applicationAdminPanel.currentApplicationUuid + '/style/',
        data: {"name": name,
        	   "code": code},
        dataType: 'text',
        success: function(data) {
			$('#application-styles-section img.icon-loading').hide();
			applicationAdminPanel.currentStyleName = name;
			applicationAdminPanel.currentStyle = code;
			// Next we refresh the preview
			applicationAdminPanel.refreshApplicationPreview();
        },
        error: function(data) {
            $('#application-preview-frame').attr('src', '#');			
			$('#application-styles-section img.icon-loading').hide();
        	var errorMessage = 'An unknown error occurred. Please try again later. 2';
        	alert(errorMessage);
        }
    });		
}

applicationAdminPanel.loadApplication = function(uuid) {
	if(uuid === undefined || uuid === null) {
		uuid = '';
	}
	uuid = uuid.trim();
	if(uuid.length <= 0) {
		uuid = null;
	}
	$('#applications-admin-panel .action-message').hide();
	applicationAdminPanel.currentApplicationUuid = uuid;
	applicationAdminPanel.hasUnsavedChanges = false;
	applicationAdminPanel.loadApplicationDefinition(uuid);
    applicationAdminPanel.loadApplicationStyle(uuid);
    applicationAdminPanel.loadApplicationController(uuid);
    applicationAdminPanel.refreshApplicationPreview(uuid);
    pageAdminPanel.selectApplication(uuid);
    featureAdminPanel.selectApplication(uuid);
}

applicationAdminPanel.loadApplicationDefinition = function(uuid) {
    applicationAdminPanel.ajaxCallDefinition.abort();
	$('#update-application-name').val('');
	$('#application-template').val('');
	$('#update-application-parentUuids').val('');
	$('#update-application-parentUuids-hidden').val('');
	$('#update-application-shortname').val('');
	$('#update-application-homepage').val('');
	$('#update-application-homepage-hidden').val('');
	$('#update-application-description').val('');
	var ulElement = $('#application-parents-list');
	ulElement.empty();
	if(uuid === null) {
		applicationAdminPanel.currentApplicationName = '';
		applicationAdminPanel.currentApplicationParentUuids = '';
		applicationAdminPanel.currentApplicationShortName = '';
		applicationAdminPanel.currentApplicationHomePage = null;
		applicationAdminPanel.currentApplicationDescription = '';
		$('input.select-application').val('');
		// enable the mask
		$('#applications-admin-panel .maskable').addClass('blur');					
		$('#applications-admin-panel .mask').show();
		return;				
	}
	applicationAdminPanel.ajaxCallDefinition = securityManager.ajax({type: 'GET',
        url: '/application/' + uuid,
        dataType: 'json',
        success: function(data) {
            if(data !== undefined && (data !== null) && (data != '')) {
				applicationAdminPanel.currentApplicationName = data.name;
				applicationAdminPanel.currentApplicationShortName = data.shortName;
				applicationAdminPanel.currentApplicationHomePage = data.pageUuid;
				applicationAdminPanel.currentApplicationDescription = data.description;
            	$('#update-application-name').val(data.name);
            	var isTemplate = (data.isTemplate != undefined && data.isTemplate != null) ? data.isTemplate : false;
       			$('#update-application-is-template-yes').prop('checked', isTemplate);
        		$('#update-application-is-template-no').prop('checked', !isTemplate);
        		if(isTemplate) {
//	        			$('#application-template').text('Yes');
        		} else {
//	        			$('#application-template').text('No');
        		}
				var foundAtLeastOneValidParent = false;
				var parentUuidsString = '';
				var parentName = '';
				var hasParentsArray = ((data.parentUuids != undefined) && (data.parentUuids != null) && (Array.isArray(data.parentUuids)) && (data.parentUuids.length > 0));
				if(hasParentsArray) {
				    for(var index in data.parentUuids) {
				    	var parentUuid = data.parentUuids[index];
				    	if(parentUuid === undefined || parentUuid === null) {
				    		parentUuid = '';
				    	}
				    	parentUuid = parentUuid.trim();
				    	if(parentUuid.length > 0) {
				    		parentUuidsString = parentUuid;
							foundAtLeastOneValidParent = true;
				        	ulElement.append('<li>' + data.parentUuids[index] + '</li>');
				        }
				    }
				}
				if(foundAtLeastOneValidParent) {
					parentName = data.parentNames[0];
					$('#update-application-parentUuids-hidden').val(parentUuidsString);
					$('#update-application-parentUuids').val(parentName);
				} else {
					$('#update-application-parentUuids-hidden').val('');
					$('#update-application-parentUuids').val('');						
				}
            	$('#update-application-shortname').val(data.shortName);
            	$('#update-application-homepage').val(data.pageName);
            	$('#update-application-homepage-hidden').val(data.pageUuid);
            	$('#update-application-description').val(data.description);
            	$('#application-pages-input').val(data.name);
            	$('#application-applications-input').val(data.name);
            	$('#application-categories-input').val(data.name);
				$('input.select-application').val(data.name);
				// disable the mask
				$('#applications-admin-panel .maskable').removeClass('blur');					
				$('#applications-admin-panel .mask').hide();					
				// close the popup
				popup.hide('#applications-admin-panel-select-application-popup');
            }
        },
        error: function() {
        }
    });
}

applicationAdminPanel.loadApplicationStyle = function(uuid, styleName) {
	applicationAdminPanel.ajaxCallStyle.abort();
    applicationStyleEditor.setValue('');
	applicationAdminPanel.currentStyle = '';
	if(uuid === null) {
		return;
	}
	if(styleName === undefined || styleName === null || styleName === '') {
		$('#select-application-style').val('');
		styleName = 'default';
	}
	$('#application-styles-section img.icon-loading').show();
	applicationAdminPanel.ajaxCallStyle = securityManager.ajax({type: "GET",
        url: '/application/' + uuid + '/style/' + styleName + '/',
        dataType: 'text',
        success: function(applicationStyle) {
        	$('#select-application-style').val(styleName);
			applicationAdminPanel.currentStyle = applicationStyle;
            applicationStyleEditor.setValue(applicationStyle);
			$('#application-styles-section img.icon-loading').hide();
        },
        error: function(err) {
			$('#application-styles-section img.icon-loading').hide();
        }
    });
}

applicationAdminPanel.loadApplicationController = function(uuid, controllerName) {
	applicationAdminPanel.ajaxCallController.abort();
    applicationControllerEditor.setValue('');
	applicationAdminPanel.currentController = '';
	if(uuid === null) {
		return;
	}
	if(controllerName === undefined || controllerName === null || controllerName === '') {
		$('#select-application-controller').val('');
		controllerName = 'default';
	}
	$('#application-controllers-section img.icon-loading').show();
    applicationAdminPanel.ajaxCallController = securityManager.ajax({type: "GET",
        url: '/application/' + uuid + '/controller/' + controllerName + '/',
        dataType: 'text',
        success: function(applicationController) {
        	$('#select-application-controller').val(controllerName);
			applicationAdminPanel.currentController = applicationController;
            applicationControllerEditor.setValue(applicationController);
			$('#application-controllers-section img.icon-loading').hide();
        },
        error: function(err) {
			$('#application-controllers-section img.icon-loading').hide();
        }
    });
}

applicationAdminPanel.createApplication = function(closeOnSuccess) {
	alert('create application');
	var name = $('#create-application-name').val();
	name = name.trim();
	if(name.length <= 0) {
    	popup.showWarningMessage('#create-application-popup', 'Please provide a name for this application.');
		$('#create-application-name').focus();
		return;
	}
	popup.showLoading('#create-application-popup');
	var isTemplate = $('#create-application-is-template-yes').prop('checked');
	var parentUuids = $('#create-application-parentUuids-hidden').val();
	var shortname = $('#create-application-shortname').val();
	var pageUuid = $('#create-application-homepage').val();
	var description = $('#create-application-description').val();
	description = description.trim();
    securityManager.ajax({type: "POST",
        url: '/application/',
        data: {"name": name,
        	   "parentUuids": parentUuids,
        	   "shortName": shortname,
        	   "isTemplate": isTemplate,
               "pageUuid": pageUuid,
               "description": description},
        dataType: 'json',
        success: function(data) {
			$('#create-application-name').val('');
			$('#create-application-is-template-no').prop('checked', true);
			$('#create-application-parentUuids').val('');
			$('#create-application-parentUuids-hidden').val('');
			$('#create-application-shortname').val('');
			$('#create-application-homepage').val('');
			$('#create-application-description').val('');
			popup.hideLoading('#create-application-popup');
			if(closeOnSuccess) {
				popup.hide('#create-application-popup');
				$('#update-application-name').focus();
			} else {
				$('#create-application-name').focus();
			}
            var uuid = data.uuid;
			applicationAdminPanel.loadApplication(uuid);
        },
        error: function(data) {
			popup.hideLoading('#create-application-popup');
        	var errorMessage = 'An unknown error occurred. Please try again later.';
        	if(data.status === 409) {
        		errorMessage = "An application with the same name already exists. Please try a different name.";
        	}
        	popup.showWarningMessage('#create-application-popup', errorMessage);
			$('#create-application-name').focus();
        }
    });
}

applicationAdminPanel.updateApplication = function() {
	if(applicationAdminPanel.currentApplicationUuid === null) {
		return;
	}
	var name = $('#update-application-name').val();
	name = name.trim();
	if(name.length <= 0) {
		return;
	}
	// show loading image
	$('#application-overview img.icon-loading').show();
	var isTemplate = $('#update-application-is-template-yes').prop('checked');
	var parentUuids = $('#update-application-parentUuids-hidden').val();
	var shortname = $('#update-application-shortname').val();
	var pageUuid = $('#update-application-homepage-hidden').val();
	var description = $('#update-application-description').val();
    securityManager.ajax({type: "PUT",
        url: '/application/' + applicationAdminPanel.currentApplicationUuid,
        data: {"name": name,
               "parentUuids": parentUuids,
        	   "shortName": shortname,
        	   "isTemplate": isTemplate,
        	   "pageUuid": pageUuid,
               "description": description},
        dataType: 'json',
        success: function(data) {
			// hide loading image
			$('#application-overview img.icon-loading').hide();
			// hide bullhorn message
			$('#application-overview .action-message').hide();
			applicationAdminPanel.refreshApplicationPreview();
        },
        error: function(data) {
			// hide loading image
			$('#application-overview img.icon-loading').hide();
        	var errorMessage = 'An unknown error occurred. Please try again later. 4';
        	if(data.status === 409) {
        		errorMessage = "A application with the same name already exists. Please try a different name.";
        	}
			$('#update-application-name').focus();
        }
    });
}

applicationAdminPanel.deleteApplication = function(uuid) {
	if(uuid === undefined || uuid === null) {
		return;
	}
    securityManager.ajax({type: "DELETE",
        url: '/application/' + uuid,
        dataType: 'json',
        success: function(data) {
        	if(uuid === applicationAdminPanel.currentApplicationUuid) {
        		applicationAdminPanel.loadApplication(null);
        	}
        	applicationAdminPanel.list('#applications-admin-panel-select-application-popup', applicationAdminPanel.currentApplicationNameRegex);
//            var uuid = data.uuid;
//			$('#action-delete-' + uuid).parent().remove();
        },
        error: function(data) {
        	if(data.status == 404) {
	        	applicationAdminPanel.list('#applications-admin-panel-select-application-popup', applicationAdminPanel.currentApplicationNameRegex);
			}
        }
    });
}

applicationAdminPanel.showCreateApplicationPopup = function() {
	$('input[tabindex]').attr('tabindex', '');
	$('#create-application-name').attr('tabindex', 1);
	$('#create-application-is-template-yes').attr('tabindex', 2);
	$('#create-application-is-template-no').attr('tabindex', 3);
	$('#create-application-parentUuids').attr('tabindex', 4);
	$('#create-application-description').attr('tabindex', 5);
	$('#create-application-save-and-close').attr('tabindex', 6);
	$('#create-application-save-and-new').attr('tabindex', 7);
	$('#create-application-cancel').attr('tabindex', 8);
	popup.show('#create-application-popup');
}

applicationAdminPanel.showPublishApplicationPopup = function() {
	var ulElement = $('#publish-application-destination-list > ul');
	ulElement.empty();
	popup.show('#publish-application-popup');
	popup.showLoading('#publish-application-popup');
	securityManager.ajax({type: 'GET',
        url: '/destination/',
        dataType: 'json',
        success: function(data) {
            for(var index in data) {
            	ulElement.append('<li><input id="destination-' + data[index].uuid + '" class="filter-radio-button publish-application-destination" type="radio" name="destination" value="' + data[index].uuid + '"/><label for="destination-' + data[index].uuid + '">' + data[index].name + '&nbsp;' + data[index].domain + '</label></li>');
            }
			popup.hideLoading('#publish-application-popup');
        },
        error: function() {
			popup.hideLoading('#publish-application-popup');
        }
    });
}

// applicationAdminPanel.showStyleImagesPopup = function() {
// 	var ulElement = $('#application-style-images-list > ul');
// 	ulElement.empty();
// 	popup.show('#application-style-images-popup');
// 	popup.showLoading('#application-style-images-popup');
// 	securityManager.ajax({type: 'GET',
//         url: '/application/' + applicationAdminPanel.currentApplicationUuid + '/style/image/',
//         dataType: 'json',
//         success: function(data) {
//             for(var index in data) {
//             	ulElement.append('<li>' + data[index] + '</li>');
//             }
// 			popup.hideLoading('#application-style-images-popup');
//         },
//         error: function() {
// 			popup.hideLoading('#application-style-images-popup');
//         }
//     });
// }

applicationAdminPanel.showFontsPopup = function() {
	var ulElement = $('#application-select-fonts-list > ul');
	ulElement.empty();
	popup.show('#application-select-fonts-popup');
	popup.showLoading('#application-select-fonts-popup');
	securityManager.ajax({type: 'GET',
        url: '/application/' + applicationAdminPanel.currentApplicationUuid + '/font/',
        dataType: 'json',
        success: function(data) {
            for(var index in data) {
            	ulElement.append('<li><a class="action-application-load-font action-list-item" href="#' + data[index] + '">' + data[index] + '</a><a class="action-application-delete-font" href="#' + data[index] + '"><i class="fa fa-trash"></i></a></li>');
            }
			popup.hideLoading('#application-select-fonts-popup');
        },
        error: function() {
			popup.hideLoading('#application-select-fonts-popup');
        }
    });
}

applicationAdminPanel.showCreateParentUuidsDropdown = function() {
	applicationAdminPanel.ajaxCallParentsList.abort();
	$('#create-application-parentUuids-popup div.list>ul').empty();
	popup.showLoading('#create-application-parentUuids-popup');
	// Get the filter elements
	var checkedFilterType = $('#create-application-parentUuids-popup input.filter-radio-button:checked').val();
	var filterBy = '';
	if(checkedFilterType === 'templateonly') {
		filterBy = 'filterBy[isTemplate]=true';
	} else if(checkedFilterType === 'applicationonly') {
		filterBy = 'filterBy[isTemplate]=false';
	}
	var applicationNameRegex = $('#create-application-parentUuids-popup .filter-by-name').val();
	applicationNameRegex = applicationNameRegex.trim();
	if(applicationNameRegex.length > 0) {
		if(filterBy.length > 0) {
			filterBy += '&';
		}
		filterBy += 'filterBy[name]=' + applicationNameRegex;
	}
	var url = '/application/';
	if(filterBy.length > 0) {
		url += '?' + filterBy;
	}
    applicationAdminPanel.ajaxCallParentsList = securityManager.ajax({type: 'GET',
        url: url,
        dataType: 'json',
        success: function(data) {
        	var noResults = false;
            if(data !== undefined && (data !== null) && (data != '')) {
            	if(data.length <= 0) {
            		noResults = true;
            	} else {
            		var ulElement = $('#create-application-parentUuids-popup div.list>ul');
	                for(var index in data) {
	                    var uuid = data[index].uuid;
	                    var applicationName = data[index].name;
	                    var isTemplate = data[index].isTemplate;
	                    if(isTemplate === undefined || isTemplate === null) {
	                    	isTemplate = false;
	                    }
	                    var liElement = '<li><a id="action-select-' + uuid + '" class="action-select-application action-list-item" href="#' + uuid + '">' + applicationName + '</a>';
	                	liElement += '<a id="action-select-' + uuid + '" class="action-select-application action-list-item small" href="#' + uuid + '">';
	                    if(isTemplate) {
	                    	liElement += 'Yes';
	                    }
	                	liElement += '</a></li>';
	                    ulElement.append(liElement);
	                }
	            }
            } else {
            	noResults = true;
            }
            if(noResults) {
            	popup.showInfoMessage('#create-application-parentUuids-popup', 'No applications found.');
            } else {
            	popup.hideMessage('#create-application-parentUuids-popup');
            }
			popup.hideLoading('#create-application-parentUuids-popup');
        },
        error: function() {
			popup.hideLoading('#create-application-parentUuids-popup');
        }
    });
}

applicationAdminPanel.showUpdateHomePageDropdown = function() {
	applicationAdminPanel.ajaxCallHomePageList.abort();
	$('#update-application-homepage-popup div.list>ul').empty();
	popup.showLoading('#update-application-homepage-popup');
	// Get the filter elements
	var checkedFilterType = $('#update-application-homepage-popup input.filter-radio-button:checked').val();
	var filterBy = 'applicationUuid=' + applicationAdminPanel.currentApplicationUuid;
	if(checkedFilterType === 'templateonly') {
		filterBy += '&filterBy[isTemplate]=true';
	} else if(checkedFilterType === 'applicationonly') {
		filterBy += '&filterBy[isTemplate]=false';
	}
	var pageNameRegex = $('#update-application-homepage-popup .filter-by-name').val();
	pageNameRegex = pageNameRegex.trim();
	if(pageNameRegex.length > 0) {
		filterBy += '&filterBy[name]=' + pageNameRegex;
	}
	var url = '/page/';
	if(filterBy.length > 0) {
		url += '?' + filterBy;
	}
    applicationAdminPanel.ajaxCallHomePageList = securityManager.ajax({type: 'GET',
        url: url,
        dataType: 'json',
        success: function(data) {
        	var noResults = false;
            if(data !== undefined && (data !== null) && (data != '')) {
            	if(data.length <= 0) {
            		noResults = true;
            	} else {
            		var ulElement = $('#update-application-homepage-popup div.list>ul');
	                for(var index in data) {
	                    var uuid = data[index].uuid;
	                    var pageName = data[index].name;
	                    var isTemplate = data[index].isTemplate;
	                    if(isTemplate === undefined || isTemplate === null) {
	                    	isTemplate = false;
	                    }
	                    var liElement = '<li><a id="action-homepage-select-' + uuid + '" class="action-select-homepage action-list-item" href="#' + uuid + '">' + pageName + '</a>';
	                	liElement += '<a id="action-homepage-select-' + uuid + '" class="action-select-homepage action-list-item small" href="#' + uuid + '">';
	                    if(isTemplate) {
	                    	liElement += 'Yes';
	                    }
	                	liElement += '</a></li>';
	                    ulElement.append(liElement);
	                }
	            }
            } else {
            	noResults = true;
            }
            if(noResults) {
            	popup.showInfoMessage('#update-application-homepage-popup', 'No pages found.');
            } else {
            	popup.hideMessage('#update-application-homepage-popup');
            }
			popup.hideLoading('#update-application-homepage-popup');
        },
        error: function() {
			popup.hideLoading('#update-application-homepage-popup');
        }
    });
}

applicationAdminPanel.showUpdateParentUuidsDropdown = function() {
	applicationAdminPanel.ajaxCallParentsList.abort();
	$('#update-application-parentUuids-popup div.list>ul').empty();
	popup.showLoading('#update-application-parentUuids-popup');
	// Get the filter elements
	var checkedFilterType = $('#update-application-parentUuids-popup input.filter-radio-button:checked').val();
	var filterBy = '';
	if(checkedFilterType === 'templateonly') {
		filterBy = 'filterBy[isTemplate]=true';
	} else if(checkedFilterType === 'applicationonly') {
		filterBy = 'filterBy[isTemplate]=false';
	}
	var applicationNameRegex = $('#update-application-parentUuids-popup .filter-by-name').val();
	applicationNameRegex = applicationNameRegex.trim();
	if(applicationNameRegex.length > 0) {
		if(filterBy.length > 0) {
			filterBy += '&';
		}
		filterBy += 'filterBy[name]=' + applicationNameRegex;
	}
	var url = '/application/';
	if(filterBy.length > 0) {
		url += '?' + filterBy;
	}
    applicationAdminPanel.ajaxCallParentsList = securityManager.ajax({type: 'GET',
        url: url,
        dataType: 'json',
        success: function(data) {
        	var noResults = false;
            if(data !== undefined && (data !== null) && (data != '')) {
            	if(data.length <= 0) {
            		noResults = true;
            	} else {
            		var ulElement = $('#update-application-parentUuids-popup div.list>ul');
	                for(var index in data) {
	                    var uuid = data[index].uuid;
	                    var applicationName = data[index].name;
	                    var isTemplate = data[index].isTemplate;
	                    if(isTemplate === undefined || isTemplate === null) {
	                    	isTemplate = false;
	                    }
	                    var liElement = '<li><a id="action-select-' + uuid + '" class="action-select-application action-list-item" href="#' + uuid + '">' + applicationName + '</a>';
	                	liElement += '<a id="action-select-' + uuid + '" class="action-select-application action-list-item small" href="#' + uuid + '">';
	                    if(isTemplate) {
	                    	liElement += 'Yes';
	                    }
	                	liElement += '</a></li>';
	                    ulElement.append(liElement);
	                }
	            }
            } else {
            	noResults = true;
            }
            if(noResults) {
            	popup.showInfoMessage('#update-application-parentUuids-popup', 'No applications found.');
            } else {
            	popup.hideMessage('#update-application-parentUuids-popup');
            }
			popup.hideLoading('#update-application-parentUuids-popup');
        },
        error: function() {
			popup.hideLoading('#update-application-parentUuids-popup');
        }
    });
}

applicationAdminPanel.uploadStyleImage = function() {
	var files = $('#application-style-images-select')[0].files;
	var formData = new FormData();
	for (var i = 0; i < files.length; i++) {
	  var file = files[i];

	  // Check the file type.
	  if (!file.type.match('image.*')) {
	    continue;
	  }

	  // Add the file to the request.
	  formData.append('thefile', file, file.name);
	}
    securityManager.fileUpload({type: 'PUT',
        url: '/application/' + applicationAdminPanel.currentApplicationUuid + '/style/image/',
        data: formData,
        contentType: false,
        processData: false,
        success: function(data) {
        	applicationAdminPanel.listStyleImages();
        },
        error: function() {
        	alert('something went wrong');
        }
    });
}

applicationAdminPanel.uploadImage = function() {
	var files = $('#application-images-select')[0].files;
	var formData = new FormData();
	for (var i = 0; i < files.length; i++) {
	  var file = files[i];

	  // Check the file type.
	  if (!file.type.match('image.*')) {
	    continue;
	  }

	  // Add the file to the request.
	  formData.append('thefile', file, file.name);
	}
    securityManager.fileUpload({type: 'PUT',
        url: '/application/' + applicationAdminPanel.currentApplicationUuid + '/image/',
        data: formData,
        contentType: false,
        processData: false,
        success: function(data) {
        	applicationAdminPanel.listImages();
        },
        error: function() {
        	alert('something went wrong');
        }
    });
}

applicationAdminPanel.saveFont = function() {
	var name = $('#create-application-font-name').val();
	var source = $('#create-application-font-source').val();
	var description = $('#create-application-font-description').val();
	popup.showLoading('#create-application-font-popup');
    securityManager.ajax({type: "PUT",
        url: '/application/' + applicationAdminPanel.currentApplicationUuid + '/font/',
        data: {"name": name,
        	   "source": source,
        	   "description": description},
        dataType: 'text',
        success: function(data) {
			popup.hideLoading('#create-application-font-popup');
			applicationAdminPanel.showFontsPopup();
        },
        error: function(data) {
			popup.hideLoading('#create-application-font-popup');
        }
    });		
}

applicationAdminPanel.deleteController = function(applicationUuid, name) {
	if(name === undefined || name === null) {
		name = '';
	}
	name = name.trim();
	if(name.length <= 0) {
		return;
	}
    securityManager.ajax({type: "DELETE",
        url: '/application/' + applicationUuid + '/controller/' + name,
        dataType: 'json',
        success: function(data) {
        	applicationAdminPanel.refreshControllers();
			applicationAdminPanel.refreshApplicationPreview();
        },
        error: function(data) {
        	applicationAdminPanel.refreshControllers();
			applicationAdminPanel.refreshApplicationPreview();
        }
    });
}

applicationAdminPanel.deleteStyle = function(applicationUuid, name) {
	if(name === undefined || name === null) {
		name = '';
	}
	name = name.trim();
	if(name.length <= 0) {
		return;
	}
    securityManager.ajax({type: "DELETE",
        url: '/application/' + applicationUuid + '/style/' + name,
        dataType: 'json',
        success: function(data) {
        	applicationAdminPanel.refreshStyles();
			applicationAdminPanel.refreshApplicationPreview();
        },
        error: function(data) {
        	applicationAdminPanel.refreshStyles();
			applicationAdminPanel.refreshApplicationPreview();
        }
    });
}

applicationAdminPanel.listImages = function() {
	var ulElement = $('#application-images-list > ul');
	ulElement.empty();
	popup.showLoading('#application-images-popup');
	securityManager.ajax({type: 'GET',
        url: '/application/' + applicationAdminPanel.currentApplicationUuid + '/image/',
        dataType: 'json',
        success: function(data) {
            for(var index in data) {
            	ulElement.append('<li>' + data[index] + '</li>');
            }
			popup.hideLoading('#application-images-popup');
        },
        error: function() {
			popup.hideLoading('#application-images-popup');
        }
    });
}

applicationAdminPanel.listStyleImages = function() {
	var ulElement = $('#application-style-images-list > ul');
	ulElement.empty();
	popup.showLoading('#application-style-images-popup');
	securityManager.ajax({type: 'GET',
        url: '/application/' + applicationAdminPanel.currentApplicationUuid + '/style/image/',
        dataType: 'json',
        success: function(data) {
            for(var index in data) {
            	ulElement.append('<li>' + data[index] + '</li>');
            }
			popup.hideLoading('#application-style-images-popup');
        },
        error: function() {
			popup.hideLoading('#application-style-images-popup');
        }
    });
}

applicationAdminPanel.showPreviewPageDropdown = function() {
	applicationAdminPanel.ajaxCallPreviewPageList.abort();
	$('#select-application-preview-page-popup div.list>ul').empty();
	popup.showLoading('#select-application-preview-page-popup');
	// Get the filter elements
	var checkedFilterType = $('#select-application-preview-page-popup input.filter-radio-button:checked').val();
	var filterBy = 'applicationUuid=' + applicationAdminPanel.currentApplicationUuid;
	if(checkedFilterType === 'templateonly') {
		filterBy += '&filterBy[isTemplate]=true';
	} else if(checkedFilterType === 'applicationonly') {
		filterBy += '&filterBy[isTemplate]=false';
	}
	var pageNameRegex = $('#select-application-preview-page-popup .filter-by-name').val();
	pageNameRegex = pageNameRegex.trim();
	if(pageNameRegex.length > 0) {
		filterBy += '&filterBy[name]=' + pageNameRegex;
	}
	var url = '/page/';
	if(filterBy.length > 0) {
		url += '?' + filterBy;
	}
    applicationAdminPanel.ajaxCallPreviewPageList = securityManager.ajax({type: 'GET',
        url: url,
        dataType: 'json',
        success: function(data) {
        	var noResults = false;
            if(data !== undefined && (data !== null) && (data != '')) {
            	if(data.length <= 0) {
            		noResults = true;
            	} else {
            		var ulElement = $('#select-application-preview-page-popup div.list>ul');
	                for(var index in data) {
	                    var uuid = data[index].uuid;
	                    var pageName = data[index].name;
	                    var isTemplate = data[index].isTemplate;
	                    if(isTemplate === undefined || isTemplate === null) {
	                    	isTemplate = false;
	                    }
	                    var liElement = '<li><a id="action-application-preview-page-select-' + uuid + '" class="action-select-application-preview-page action-list-item" href="#' + uuid + '">' + pageName + '</a>';
	                	liElement += '<a id="action-application-preview-page-select-' + uuid + '" class="action-select-application-preview-page action-list-item small" href="#' + uuid + '">';
	                    if(isTemplate) {
	                    	liElement += 'Yes';
	                    }
	                	liElement += '</a></li>';
	                    ulElement.append(liElement);
	                }
	            }
            } else {
            	noResults = true;
            }
            if(noResults) {
            	popup.showInfoMessage('#select-application-preview-page-popup', 'No pages found.');
            } else {
            	popup.hideMessage('#select-application-preview-page-popup');
            }
			popup.hideLoading('#select-application-preview-page-popup');
        },
        error: function() {
			popup.hideLoading('#select-application-preview-page-popup');
        }
    });
}

