var pageAdminPanel = {}

jQuery(document).ready(function() {
	pageAdminPanel.init();
});

pageAdminPanel.currentPageNameRegex = '';
pageAdminPanel.hasUnsavedChanges = false;
pageAdminPanel.currentPageUuid = null;
pageAdminPanel.currentPageParentUuids = null;
pageAdminPanel.currentPageName = null;
pageAdminPanel.currentPageDescription = null;
pageAdminPanel.ajaxCallDefinition = {abort: function(){}};
pageAdminPanel.currentLayout = '';
pageAdminPanel.ajaxCallLayout = {abort: function(){}};
pageAdminPanel.currentController = '';
pageAdminPanel.currentControllerName = '';
pageAdminPanel.ajaxCallController = {abort: function(){}};
pageAdminPanel.currentStyle = '';
pageAdminPanel.currentStyleName = '';
pageAdminPanel.ajaxCallStyle = {abort: function(){}};
pageAdminPanel.ajaxCallList = {abort: function(){}};
pageAdminPanel.ajaxCallParentsList = {abort:function(){}};
pageAdminPanel.currentPreviewChannel = 'desktop';
pageAdminPanel.currentPreviewDebug = false;

pageAdminPanel.init = function() {
	$('#action-publish-page').on('click', function(ev) {
		ev.preventDefault();
		pageAdminPanel.showPublishPagePopup();
		return false;
	});
	$('#action-publish-page-confirm').on('click', function(ev) {
		ev.preventDefault();
		pageAdminPanel.publishPage();		
		return false;
	});
	// On load we disable everything except for
	// - Searching for pages and
	// - Creating pages
	$('#pages-admin-panel .maskable').addClass('blur');
	$('#pages-admin-panel .mask').show();

	$('#pages-admin-panel-select-page-input').on('click', function(ev) {
		ev.preventDefault();
		$(this).val(pageAdminPanel.currentPageNameRegex);
		popup.show('#pages-admin-panel-select-page-popup');
		pageAdminPanel.list('#pages-admin-panel-select-page-popup', pageAdminPanel.currentPageNameRegex);
		return false;
	});
	$('#pages-admin-panel-select-page .clear-button').on('click', function(ev) {
		ev.preventDefault();
		pageAdminPanel.currentPageNameRegex = '';
		$('#pages-admin-panel-select-page-input').val(pageAdminPanel.currentPageNameRegex);
		pageAdminPanel.list('#pages-admin-panel-select-page-popup', pageAdminPanel.currentPageNameRegex);
		return false;
	});
	$('#pages-admin-panel-select-page .search-button').on('click', function(ev) {
		ev.preventDefault();
		$('#pages-admin-panel-select-page-input').val(pageAdminPanel.currentPageNameRegex);
		pageAdminPanel.list('#pages-admin-panel-select-page-popup', pageAdminPanel.currentPageNameRegex);
		return false;
	});
	$('#pages-admin-panel-select-page-input').on('keyup', function(ev) {
		pageAdminPanel.currentPageNameRegex = $(this).val();
		pageAdminPanel.list('#pages-admin-panel-select-page-popup', pageAdminPanel.currentPageNameRegex);
	});
	$('#pages-admin-panel-select-page-popup input.filter-radio-button').on('change', function(ev) {
		ev.preventDefault();
		pageAdminPanel.list('#pages-admin-panel-select-page-popup', pageAdminPanel.currentPageNameRegex);
		return false;
	});
	$('#pages-admin-panel-select-page-popup').on('hide', function(ev) {
		$('#pages-admin-panel-select-page-input').val(pageAdminPanel.currentPageName);
	});


	$('#select-page-controller').on('click', function(ev) {
		ev.preventDefault();
		var displayAttribute = $('#page-select-controller-popup').css('display');
		if(displayAttribute === 'none') {
			pageAdminPanel.showSelectControllerPopup();
		} else {
			popup.hide('#page-select-controller-popup');
		}
		return false;
	});
	$('#action-page-libraries').on('click', function(ev) {
		ev.preventDefault();
		popup.toggle('#page-libraries-popup');
		return false;
	})
	$('#select-page-style').on('click', function(ev) {
		ev.preventDefault();
		var displayAttribute = $('#page-select-style-popup').css('display');
		if(displayAttribute === 'none') {
			pageAdminPanel.showSelectStylePopup();
		} else {
			popup.hide('#page-select-style-popup');
		}
		return false;
	});
	$('#action-page-images').on('click', function(ev) {
		ev.preventDefault();
		popup.hide('#page-locales-popup');
		var displayAttribute = $('#page-images-popup').css('display');
		if(displayAttribute === 'none') {
			pageAdminPanel.showImagesPopup();
		} else {
			popup.hide('#page-images-popup');
		}
		return false;
	});
	$('#page-images-popup-form').on('submit', function(ev) {
		ev.preventDefault();
		pageAdminPanel.uploadImage();
		return false;
	});
	$('#page-style-images-popup-form').on('submit', function(ev) {
		ev.preventDefault();
		pageAdminPanel.uploadStyleImage();
		return false;
	});
	$('#action-page-locales').on('click', function(ev) {
		ev.preventDefault();
		popup.hide('#page-images-popup');
		$('#page-locales-popup').toggle();
		return false;
	});
	$('#action-page-style-fonts').on('click', function(ev) {
		ev.preventDefault();
		var displayAttribute = $('#page-select-fonts-popup').css('display');
		if(displayAttribute === 'none') {
			pageAdminPanel.showFontsPopup();
		} else {
			popup.hide('#page-select-fonts-popup');
		}
		return false;
	});	
	$('#action-page-style-images').on('click', function(ev) {
		ev.preventDefault();
		var displayAttribute = $('#page-style-images-popup').css('display');
		if(displayAttribute === 'none') {
			pageAdminPanel.showStyleImagesPopup();
		} else {
			popup.hide('#page-style-images-popup');
		}
		return false;
	});	
	$('#create-page-parentUuids-popup').on('show', function(ev) {
		ev.preventDefault();
		pageAdminPanel.showCreateParentUuidsDropdown();
		return false;
	});
	$('#create-page-parentUuids-popup .filter-radio-button').on('change', function(ev) {
		ev.preventDefault();
		pageAdminPanel.showCreateParentUuidsDropdown();
		return false;
	});
	$('#create-page-parentUuids-popup .filter-by-name').on('keyup', function(ev) {
		ev.preventDefault();
		pageAdminPanel.showCreateParentUuidsDropdown();
		return false;
	});
	$('#create-page-parentUuids-popup').on('click', '.action-select-page', function(ev) {
		ev.preventDefault();
		var uuid = $(this).attr('href').substring(1);
		var name = $(this).text();
		$('#create-page-parentUuids-hidden').val(uuid);
		$('#create-page-parentUuids').val(name);
		popup.hide('#create-page-parentUuids-popup');
		return false;
	});	$('#update-page-popup .action-cancel').on('click', function(ev) {
		$('input[tabindex]').attr('tabindex', '');
		popup.hide('#update-page-popup');
	});
	$('#publish-page-popup .action-cancel').on('click', function(ev) {
		$('input[tabindex]').attr('tabindex', '');
		$('textarea[tabindex]').attr('tabindex', '');
		$('.popup').hide();
	});
	$('#create-page-name').on('keyup', function(ev) {
		var key = ev.which;
		if(key === 13) {
			pageAdminPanel.createPage(true);
			return false;
		}
	});
	$('#create-page-cancel').on('click', function(ev) {
		ev.preventDefault();
		$('#create-page-popup input').val('');
		$('#create-page-popup textarea').val('');
		popup.close('#create-page-popup');
		return false;
	});
	$('#create-page-save-and-close').on('click', function(ev) {
		ev.preventDefault();
		pageAdminPanel.createPage(true);
		return false;
	});
	$('#create-page-save-and-new').on('click', function(ev) {
		ev.preventDefault();
		pageAdminPanel.createPage(false);
		return false;
	});
	$('#update-page-save-and-close').on('click', function(ev) {
		ev.preventDefault();
		pageAdminPanel.updatePage(true);
		return false;
	});
	$('#update-page-save').on('click', function(ev) {
		ev.preventDefault();
		pageAdminPanel.updatePage(false);
		return false;
	});
	$('#pages-admin-panel-select-page-popup-list').on('click', '.action-load-page', function(ev) {
		ev.preventDefault();
		var uuid = $(this).attr('href').substring(1);
		pageAdminPanel.loadPage(uuid);
		return false;
	});
	$('.update-page-form').on('submit', function(ev) {
		ev.preventDefault();
		pageAdminPanel.updatePage(true);
		return false;
	});
	$('#create-page-name').on('click', function(ev) {
		ev.preventDefault();
		pageAdminPanel.showCreatePagePopup();
		return false;
	});
	$('#create-page-name').on('focus', function(ev) {
		ev.preventDefault();
		pageAdminPanel.showCreatePagePopup();
		return false;
	});
	$('#create-page-parentUuids').on('click', function(ev) {
		ev.preventDefault();
		popup.show('#create-page-parentUuids-popup');
		return false;
	});
	$('#pages-admin-panel-select-page-popup-list').on('click', '.action-delete-page', function(ev) {
		ev.preventDefault();
		if(confirm('Are you sure?')) {
			var uuid = $(this).attr('href').substring(1);
			pageAdminPanel.deletePage(uuid);
		}
		return false;
	});
	$('#action-delete-page').on('click', function(ev) {
		ev.preventDefault();
		if(confirm('Are you sure?')) {
			pageAdminPanel.deletePage(pageAdminPanel.currentPageUuid);
		}
		return false;
	});
	$('#page-select-fonts-popup').on('click', '.action-page-delete-font', function(ev) {
		ev.preventDefault();
		if(confirm('Are you sure?')) {
			var fontName = $(this).attr('href').substring(1);
			pageAdminPanel.deleteFont(pageAdminPanel.currentPageUuid, fontName);
		}
		return false;
	});
	$('#page-select-controller-list').on('click', '.action-page-load-controller', function(ev) {
		ev.preventDefault();
		var controllerName = $(this).attr('href').substring(1);
		popup.hide('#page-select-controller-popup');
	    pageAdminPanel.loadPageController(pageAdminPanel.currentPageUuid, controllerName);
		return false;
	});
	$('#page-select-controller-list').on('click', '.action-page-delete-controller', function(ev) {
		ev.preventDefault();
		if(confirm('Are you sure?')) {
			var name = $(this).attr('href').substring(1);
		    pageAdminPanel.deleteController(pageAdminPanel.currentPageUuid, name);
		}
		return false;
	});
	$('#page-select-style-list').on('click', '.action-page-load-style', function(ev) {
		ev.preventDefault();
		var styleName = $(this).attr('href').substring(1);
		popup.hide('#page-select-style-popup');
	    pageAdminPanel.loadPageStyle(pageAdminPanel.currentPageUuid, styleName);
		return false;
	});
	$('#page-select-style-list').on('click', '.action-page-delete-style', function(ev) {
		ev.preventDefault();
		if(confirm('Are you sure?')) {
			var name = $(this).attr('href').substring(1);
		    pageAdminPanel.deleteStyle(pageAdminPanel.currentPageUuid, name);
		}
		return false;
	});
	$('.action-save-page').on('click', function(ev) {
		ev.preventDefault();
		pageAdminPanel.savePageLayout();
		pageAdminPanel.savePageController();
		pageAdminPanel.savePageStyle();
		return false;
	})
	$('#action-save-page-layout').on('click', function(ev) {
		ev.preventDefault();
		pageAdminPanel.savePageLayout();
		return false;
	});
	$('#action-cancel-page-layout').on('click', function(ev) {
		ev.preventDefault();
		pageLayoutEditor.setValue(pageAdminPanel.currentLayout);
		return false;
	});
	$('#action-save-page-controller').on('click', function(ev) {
		ev.preventDefault();
		pageAdminPanel.savePageController();
		return false;
	});
	$('#action-cancel-page-controller').on('click', function(ev) {
		ev.preventDefault();
		pageControllerEditor.setValue(pageAdminPanel.currentController);
		return false;
	});
	$('#action-save-page-style').on('click', function(ev) {
		ev.preventDefault();
		pageAdminPanel.savePageStyle();
		return false;
	});
	$('#action-cancel-page-style').on('click', function(ev) {
		ev.preventDefault();
		pageStyleEditor.setValue(pageAdminPanel.currentStyle);
		return false;
	});
	$('#action-refresh-page-preview').on('click', function(ev) {
		ev.preventDefault();
		pageAdminPanel.refreshPagePreview();
		return false;
	});
	$('#page-preview-frame').on('load', function(ev) {
		$('#page-preview .icon-loading').hide();
		var title = $(this).contents().find('title').text();
		$('#page-preview-title').text(title)
	});
	$('#action-page-toggle-debug').on('click', function(ev) {
		ev.preventDefault();
		pageAdminPanel.currentPreviewDebug = !pageAdminPanel.currentPreviewDebug;
		if(pageAdminPanel.currentPreviewDebug) {
			$(this).addClass('shade-of-red');
		} else {
			$(this).removeClass('shade-of-red');
		}
		pageAdminPanel.refreshPagePreview();
		return false;
	});
	$('#action-page-mobile-preview').on('click', function(ev) {
		ev.preventDefault();
		pageAdminPanel.currentPreviewChannel = 'mobile';
		$(this).addClass('shade-of-green');
		$('#action-page-tablet-preview').removeClass('shade-of-green');
		$('#action-page-desktop-preview').removeClass('shade-of-green');
		pageAdminPanel.refreshPagePreview();
		return false;
	});
	$('#action-page-tablet-preview').on('click', function(ev) {
		ev.preventDefault();
		pageAdminPanel.currentPreviewChannel = 'tablet';
		$(this).addClass('shade-of-green');
		$('#action-page-mobile-preview').removeClass('shade-of-green');
		$('#action-page-desktop-preview').removeClass('shade-of-green');
		pageAdminPanel.refreshPagePreview();
		return false;
	});
	$('#action-page-desktop-preview').on('click', function(ev) {
		ev.preventDefault();
		pageAdminPanel.currentPreviewChannel = 'desktop';
		$(this).addClass('shade-of-green');
		$('#action-page-mobile-preview').removeClass('shade-of-green');
		$('#action-page-tablet-preview').removeClass('shade-of-green');
		pageAdminPanel.refreshPagePreview();
		return false;
	});
	$('#select-page-style').on('click', function(ev) {
		ev.preventDefault();
		$('#search-page-styles-popup').height('100%');
		return false;
	});	
	$('#search-page-styles-popup').on('mouseleave', function(ev) {
		ev.preventDefault();
		$('#search-page-styles-popup').height('0px');
		return false;
	});
	$('#create-page-font-save').on('click', function(ev) {
		ev.preventDefault();
		pageAdminPanel.saveFont();
		return false;
	});
	$('#action-page-locale').on('click', function(ev) {
		ev.preventDefault();
		pageAdminPanel.showContentPopup();
		return false;
	});
}

pageAdminPanel.showSelectControllerPopup = function() {
	popup.show('#page-select-controller-popup');
	pageAdminPanel.refreshControllers();
}

pageAdminPanel.publishPage = function() {
	var data = {};
	data.type = 'page';
	data.uuid = pageAdminPanel.currentPageUuid;
	data.destinationUuid = $('.publish-page-destination:checked').val();
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

pageAdminPanel.refreshControllers = function() {
	popup.showLoading('#page-select-controller-popup');
	var ulElement = $('#page-select-controller-list > ul');
	ulElement.empty();
	securityManager.ajax({type: 'GET',
        url: '/page/' + pageAdminPanel.currentPageUuid + '/controller/',
        dataType: 'json',
        success: function(data) {
            for(var index in data) {
            	ulElement.append('<li><a class="action-page-load-controller action-list-item" href="#' + data[index] + '">' + data[index] + '</a><a class="action-page-delete-controller" href="#' + data[index] + '"><i class="fa fa-trash"></i></a></li>');
            }
			popup.hideLoading('#page-select-controller-popup');
        },
        error: function() {
			popup.hideLoading('#page-select-controller-popup');
        }
    })
}

pageAdminPanel.showSelectStylePopup = function() {
	popup.show('#page-select-style-popup');
	pageAdminPanel.refreshStyles();
}

pageAdminPanel.refreshStyles = function() {
	popup.showLoading('#page-select-style-popup');
	var ulElement = $('#page-select-style-list > ul');
	ulElement.empty();
	securityManager.ajax({type: 'GET',
        url: '/page/' + pageAdminPanel.currentPageUuid + '/style/',
        dataType: 'json',
        success: function(data) {
            for(var index in data) {
            	ulElement.append('<li><a class="action-page-load-style action-list-item" href="#' + data[index] + '">' + data[index] + '</a><a class="action-page-delete-style" href="#' + data[index] + '"><i class="fa fa-trash"></i></a></li>');
            }
			popup.hideLoading('#page-select-style-popup');
        },
        error: function() {
			popup.hideLoading('#page-select-style-popup');
        }
    });
}

pageAdminPanel.showImagesPopup = function() {
	var ulElement = $('#page-images-list > ul');
	ulElement.empty();
	popup.show('#page-images-popup');
	popup.showLoading('#page-images-popup');
	securityManager.ajax({type: 'GET',
        url: '/page/' + pageAdminPanel.currentPageUuid + '/image/',
        dataType: 'json',
        success: function(data) {
            for(var index in data) {
            	ulElement.append('<li>' + data[index] + '</li>');
            }
			popup.hideLoading('#page-images-popup');
        },
        error: function() {
			popup.hideLoading('#page-images-popup');
        }
    });
}

pageAdminPanel.showStyleImagesPopup = function() {
	var ulElement = $('#page-style-images-list > ul');
	ulElement.empty();
	popup.show('#page-style-images-popup');
	popup.showLoading('#page-style-images-popup');
	securityManager.ajax({type: 'GET',
        url: '/page/' + pageAdminPanel.currentPageUuid + '/style/image/',
        dataType: 'json',
        success: function(data) {
            for(var index in data) {
            	ulElement.append('<li>' + data[index] + '</li>');
            }
			popup.hideLoading('#page-style-images-popup');
        },
        error: function() {
			popup.hideLoading('#page-style-images-popup');
        }
    });
}

pageAdminPanel.uploadImage = function() {
	var files = $('#page-images-select')[0].files;
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
        url: '/page/' + pageAdminPanel.currentPageUuid + '/image/',
        data: formData,
        contentType: false,
        processData: false,
        success: function(data) {
        	alert('uploaded');
        },
        error: function() {
        	alert('something went wrong');
        }
    });
}

pageAdminPanel.uploadStyleImage = function() {
	var files = $('#page-style-images-select')[0].files;
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
        url: '/page/' + pageAdminPanel.currentPageUuid + '/style/image/',
        data: formData,
        contentType: false,
        processData: false,
        success: function(data) {
        	alert('uploaded');
        },
        error: function() {
        	alert('something went wrong');
        }
    });
}

pageAdminPanel.refreshPagePreview = function() {
	var uuid = pageAdminPanel.currentPageUuid;
	if(uuid === undefined || uuid === null) {
		$('#page-preview-frame').attr('src', '');
		return;
	}
	$('#page-preview .icon-loading').show();
	var url = '/preview?type=page&uuid=' + uuid;
	var locale = $('#select-page-preview-locale-input').val();
	if(locale === undefined || locale === null) {
		locale = '';
	}
	locale = locale.trim();
	if(locale.length > 0) {
		url += '&locale=' + locale;
	}
	// Check if debugging is on...
	if(pageAdminPanel.currentPreviewDebug) {
		url += '&debug=true';
	}
	// Select the preview channel...
	url += '&channel=' + pageAdminPanel.currentPreviewChannel;
	securityManager.setSrc('page-preview-frame', url);
}

pageAdminPanel.list = function(popupSelector, pageNameRegex) {
    pageAdminPanel.ajaxCallList.abort();
	$(popupSelector + ' div.list>ul').empty();
	popup.showLoading(popupSelector);
	var url = '/page/';
	var hasRequestParameter = false;
	// Get the filter elements
	var applicationUuid = applicationAdminPanel.currentApplicationUuid;
	if(applicationUuid !== null) {
		url += '?applicationUuid=' + applicationUuid;
		hasRequestParameter = true;
	}
	var checkedFilterType = $(popupSelector + ' input.filter-radio-button:checked').val();
	var filterBy = '';
	if(checkedFilterType === 'templateonly') {
		filterBy = 'filterBy[isTemplate]=true';
	} else if(checkedFilterType === 'applicationonly') {
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
	pageAdminPanel.ajaxCallList = securityManager.ajax({type: 'GET',
        url: url,
        dataType: 'json',
        success: function(data) {
        	var noResults = false;
            if(data !== undefined && (data !== null) && (data != '')) {
            	if(data.length <= 0) {
            		noResults = true;
            	} else {
            		var ulElement = $(popupSelector + ' div.list>ul');
	                for(var index in data) {
	                    var uuid = data[index].uuid;
	                    var pageName = data[index].name;
	                    var isTemplate = data[index].isTemplate;
	                    if(isTemplate === undefined || isTemplate === null) {
	                    	isTemplate = false;
	                    }
	                    var liElement = '<li><a id="action-update-' + uuid + '" class="action-load-page action-list-item" href="#' + uuid + '">' + pageName + '</a>';
	                	liElement += '<a id="action-update-' + uuid + '" class="action-load-page action-list-item small" href="#' + uuid + '">';
	                    if(isTemplate) {
	                    	liElement += 'Yes';
	                    }
	                	liElement += '</a>';
	                    liElement += '<a id="action-delete-' + uuid + '" class="action-delete-page" href="#' + uuid + '"><i class="fa fa-trash"></i></a></li>';
	                    ulElement.append(liElement);
	                }
	            }
            } else {
            	noResults = true;
            }
            if(noResults) {
            	popup.showInfoMessage(popupSelector, 'No pages found.');
            } else {
            	popup.hideMessage(popupSelector);
            }
			popup.hideLoading(popupSelector);
        },
        error: function() {
			popup.hideLoading(popupSelector);
        }
    });
}

pageAdminPanel.savePageLayout = function() {
	if(pageAdminPanel.currentPageUuid === null) {
		return;
	}
	var code = pageLayoutEditor.getValue();
	if(code === pageAdminPanel.currentLayout) {
		// We might as well still attempt to refresh.
		// Who knows why the user keeps hitting save.
		pageAdminPanel.refreshPagePreview();
		return;
	}
	$('#page-layout .icon-loading').show();
    securityManager.ajax({type: "PUT",
        url: '/page/' + pageAdminPanel.currentPageUuid + '/layout/',
        data: {"code": code},
        dataType: 'text',
        success: function(data) {
			$('#page-layout .icon-loading').hide();
			pageAdminPanel.currentLayout = code;
			// Next we refresh the preview
			pageAdminPanel.refreshPagePreview();
        },
        error: function(data) {
            $('#page-preview-frame').attr('src', '#');			
			$('#page-layout .icon-loading').hide();
        	var errorMessage = 'An unknown error occurred. Please try again later. 0';
        	alert(errorMessage);
        }
    });		
}

pageAdminPanel.savePageController = function() {
	if(pageAdminPanel.currentPageUuid === null) {
		return;
	}
	var name = $('#select-page-controller').val();
	var code = pageControllerEditor.getValue();
	if((code === pageAdminPanel.currentController) && (name === pageAdminPanel.currentControllerName)) {
		// We might as well still attempt to refresh.
		// Who knows why the user keeps hitting save.
		pageAdminPanel.refreshPagePreview();
		return;
	}
	$('#page-controller .icon-loading').show();
    securityManager.ajax({type: "PUT",
        url: '/page/' + pageAdminPanel.currentPageUuid + '/controller/',
        data: {"name": name,
        	   "code": code},
        dataType: 'text',
        success: function(data) {
			$('#page-controller .icon-loading').hide();
			pageAdminPanel.currentControllerName = name;
			pageAdminPanel.currentController = code;
			// Next we refresh the preview
			pageAdminPanel.refreshPagePreview();
        },
        error: function(data) {
            $('#page-preview-frame').attr('src', '#');			
			$('#page-controller .icon-loading').hide();
        	var errorMessage = 'An unknown error occurred. Please try again later. ';
        	alert(errorMessage);
        }
    });		
}

pageAdminPanel.savePageStyle = function() {
	if(pageAdminPanel.currentPageUuid === null) {
		return;
	}
	var name = $('#select-page-style').val();
	var code = pageStyleEditor.getValue();
	if((code === pageAdminPanel.currentStyle) && (name === pageAdminPanel.currentStyleName)) {
		// We might as well still attempt to refresh.
		// Who knows why the user keeps hitting save.
		pageAdminPanel.refreshPagePreview();
		return;
	}
	$('#page-style .icon-loading').show();
    securityManager.ajax({type: "PUT",
        url: '/page/' + pageAdminPanel.currentPageUuid + '/style/',
        data: {"name": name,
        	   "code": code},
        dataType: 'text',
        success: function(data) {
			$('#page-style .icon-loading').hide();
			pageAdminPanel.currentStyleName = name;
			pageAdminPanel.currentStyle = code;
			// Next we refresh the preview
			pageAdminPanel.refreshPagePreview();
        },
        error: function(data) {
            $('#page-preview-frame').attr('src', '#');			
			$('#page-style .icon-loading').hide();
        	var errorMessage = 'An unknown error occurred. Please try again later. 2';
        	alert(errorMessage);
        }
    });		
}

pageAdminPanel.loadPage = function(uuid) {
	if(uuid === undefined || uuid === null) {
		uuid = '';
	}
	uuid = uuid.trim();
	if(uuid.length <= 0) {
		uuid = null;
	}
	pageAdminPanel.currentPageUuid = uuid;
	pageAdminPanel.hasUnsavedChanges = false;
	pageAdminPanel.loadPageDefinition(uuid);
    pageAdminPanel.loadPageLayout(uuid);
    pageAdminPanel.loadPageStyle(uuid);
    pageAdminPanel.loadPageController(uuid);
    pageAdminPanel.refreshPagePreview();
}

pageAdminPanel.loadPageDefinition = function(uuid) {
    pageAdminPanel.ajaxCallDefinition.abort();
	$('#page-overview .icon-loading').show();
	$('#page-name').text('');
	$('#page-template').text('');
	$('#page-parents').text('');
	$('#page-description').text('');
	$('#update-page-name').val('');
	$('#update-page-description').val('');
	var ulElement = $('#page-parents-list');
	ulElement.empty();
	pageAdminPanel.currentPageName = '';
	if(uuid === null) {
		pageAdminPanel.currentPageName = '';
		pageAdminPanel.currentPageParentUuids = '';
		pageAdminPanel.currentPageDescription = '';
		$('input.select-page').val('');
		// enable the mask
		$('#pages-admin-panel .maskable').addClass('blur');					
		$('#pages-admin-panel .mask').show();
		return;
	}
	pageAdminPanel.ajaxCallDefinition = securityManager.ajax({type: 'GET',
        url: '/page/' + uuid,
        dataType: 'json',
        success: function(data) {
            if(data !== undefined && (data !== null) && (data != '')) {
            	pageAdminPanel.currentPageName = data.name;
            	$('#page-uuid').text(data.uuid);
            	$('#update-page-name').val(data.name);
            	$('#update-page-title').val(data.title);
            	$('#update-page-url').val(data.url);
            	$('#page-name').text(data.name);
            	var isTemplate = (data.isTemplate != undefined && data.isTemplate != null) ? data.isTemplate : false;
       			$('#update-page-is-template-yes').prop('checked', isTemplate);
        		$('#update-page-is-template-no').prop('checked', !isTemplate);
        		if(isTemplate) {
        			$('#page-template').text('Yes');
        		} else {
        			$('#page-template').text('No');
        		}
        		var foundAtLeastOneValidParent = false;
        		var parentUuidsString = '';
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
			            	ulElement.append('<li>' + data.parentNames[index] + '</li>');
			            }
		            }
            	}
            	if(foundAtLeastOneValidParent) {
            		$('#update-page-parentUuids').val(parentUuidsString);
            		$('#page-parents').text('');
            	} else {
        			$('#page-parents').text('No');            		
            	}
        		$('#page-description').text(data.description);
            	$('#update-page-description').val(data.description);
            	$('#search-pages-input').val(data.name);
				// disable the mask
				$('#pages-admin-panel .maskable').removeClass('blur');					
				$('#pages-admin-panel .mask').hide();					
				// close the popup
				popup.hide('#pages-admin-panel-select-page-popup');
				$('#page-overview .icon-loading').hide();
            }
        },
        error: function() {
			$('#page-overview .icon-loading').hide();
        }
    });
}

pageAdminPanel.loadPageLayout = function(uuid) {
	pageAdminPanel.ajaxCallLayout.abort();
	pageAdminPanel.currentLayout = '';
	if(uuid === null) {
	    pageLayoutEditor.setValue('');
	    return;
	}
	$('#page-layout .icon-loading').show();
	pageAdminPanel.ajaxCallLayout = securityManager.ajax({type: "GET",
        url: '/page/' + uuid + '/layout/',
        dataType: 'text',
        success: function(pageLayout) {
        	pageAdminPanel.currentLayout = pageLayout;
            pageLayoutEditor.setValue(pageLayout);
			$('#page-layout .icon-loading').hide();
        },
        error: function(err) {
		    pageLayoutEditor.setValue('');
			$('#page-layout .icon-loading').hide();
        }
    });
}

pageAdminPanel.loadPageStyle = function(uuid, styleName) {
	pageAdminPanel.ajaxCallStyle.abort();
	if(styleName === undefined || styleName === null || styleName === '') {
		styleName = 'default';
	}
	pageAdminPanel.currentStyle = '';
	pageAdminPanel.currentStyleName = '';
	if(uuid === null) {
	    pageStyleEditor.setValue('');
	    return;
	}
	$('#page-style .icon-loading').show();
	pageAdminPanel.ajaxCallStyle = securityManager.ajax({type: "GET",
        url: '/page/' + uuid + '/style/' + styleName + '/',
        dataType: 'text',
        success: function(pageStyle) {
        	$('#select-page-style').val(styleName);
			pageAdminPanel.currentStyle = pageStyle;
            pageStyleEditor.setValue(pageStyle);
			$('#page-style .icon-loading').hide();
        },
        error: function(err) {
		    pageStyleEditor.setValue('');
			$('#page-style .icon-loading').hide();
        }
    });
}

pageAdminPanel.loadPageController = function(uuid, controllerName) {
	pageAdminPanel.ajaxCallController.abort();
	if(controllerName === undefined || controllerName === null || controllerName === '') {
		controllerName = 'default'
	}
	pageAdminPanel.currentController = '';
	pageAdminPanel.currentControllerName = '';
	if(uuid === null) {
	    pageControllerEditor.setValue('');
	    return;
	}
	$('#page-controller .icon-loading').show();
	pageAdminPanel.ajaxCallController = securityManager.ajax({type: "GET",
        url: '/page/' + uuid + '/controller/' + controllerName,
        dataType: 'text',
        success: function(pageController) {
        	$('#select-page-controller').val(controllerName);
			pageAdminPanel.currentController = pageController;
            pageControllerEditor.setValue(pageController);
			$('#page-controller .icon-loading').hide();
        },
        error: function(err) {
		    pageControllerEditor.setValue('');
			$('#page-controller .icon-loading').hide();
        }
    });
}

pageAdminPanel.createPage = function(closeOnSuccess) {
	var name = $('#create-page-name').val();
	name = name.trim();
	if(name.length <= 0) {
    	popup.showWarningMessage('#create-page-popup', 'Please provide a name for this page.');
		$('#create-page-name').focus();
		return;
	}
	popup.showLoading('#create-page-popup');
	var isTemplate = $('#create-page-is-template-yes').prop('checked');
	var parentUuids = $('#create-page-parentUuids-hidden').val();
	var title = $('#create-page-title').val();
	var pageUrl = $('#create-page-url').val();
	var description = $('#create-page-description').val();
	description = description.trim();
	var applicationUuid = applicationAdminPanel.currentApplicationUuid;
	if(applicationUuid === undefined || applicationUuid === null) {
		applicationUuid = '';
	}
	applicationUuid = applicationUuid.trim();
    securityManager.ajax({type: "POST",
        url: '/page/',
        data: {"name": name,
        	   "isTemplate": isTemplate,
        	   "parentUuids": parentUuids,
        	   "title": title,
        	   "url": pageUrl,
               "description": description,
               "applicationUuid": applicationUuid},
        dataType: 'json',
        success: function(data) {
			$('#create-page-name').val('');
			$('#create-page-is-template-no').prop('checked', true);
			$('#create-page-parentUuids').val('');
			$('#create-page-parentUuids-hidden').val('');
			$('#create-page-title').val('');
			$('#create-page-url').val('');
			$('#create-page-description').val('');
			popup.hideLoading('#create-page-popup');
			if(closeOnSuccess) {
				popup.hide('#create-page-popup');
			} else {
				$('#create-page-name').focus();
			}
            var uuid = data.uuid;
			pageAdminPanel.loadPage(uuid);
        },
        error: function(data) {
			popup.hideLoading('#create-page-popup');
        	var errorMessage = 'An unknown error occurred. Please try again later.';
        	if(data.status === 409) {
        		errorMessage = "A page with the same name already exists. Please try a different name.";
        	}
        	popup.showWarningMessage('#create-page-popup', errorMessage);
			$('#create-page-name').focus();
        }
    });
}

pageAdminPanel.updatePage = function(closeOnSuccess) {
	if(pageAdminPanel.currentPageUuid === null) {
		return;
	}
	var name = $('#update-page-name').val();
	name = name.trim();
	if(name === '') {
		return;
	}
	var isTemplate = $('#update-page-is-template-yes').prop('checked');
	var title = $('#update-page-title').val();
	var pageUrl = $('#update-page-url').val();
	var parentUuids = $('#update-page-parentUuids').val();
	var description = $('#update-page-description').val();
    securityManager.ajax({type: "PUT",
        url: '/page/' + pageAdminPanel.currentPageUuid,
        data: {"name": name,
        	   "parentUuids": parentUuids,
        	   "isTemplate": isTemplate,
        	   "title": title,
        	   "url": pageUrl,
               "description": description},
        dataType: 'json',
        success: function(data) {
            var uuid = data.uuid;
			$('#action-update-' + uuid).text(name);
			if(closeOnSuccess) {
				popup.hide('#update-page-popup');
			} else {
				$('#update-page-name').focus();
			}
			pageAdminPanel.refreshPagePreview();
        },
        error: function(data) {
        	var errorMessage = 'An unknown error occurred. Please try again later. 4';
        	if(data.status === 409) {
        		errorMessage = "A page with the same name already exists. Please try a different name.";
        	}
        	alert(errorMessage);
        }
    });
}

pageAdminPanel.deletePage = function(uuid) {
	if(uuid === undefined || uuid === null) {
		return;
	}
    securityManager.ajax({type: "DELETE",
        url: '/page/' + uuid,
        dataType: 'json',
        success: function(data) {
        	if(uuid === pageAdminPanel.currentPageUuid) {
        		pageAdminPanel.loadPage(null);
        	}
        	pageAdminPanel.list('#pages-admin-panel-select-page-popup', pageAdminPanel.currentPageNameRegex);
//            var uuid = data.uuid;
//			$('#action-delete-' + uuid).parent().remove();
        },
        error: function(data) {
        	if(data.status == 404) {
	        	pageAdminPanel.list('#pages-admin-panel-select-page-popup', pageAdminPanel.currentPageNameRegex);
			}
        }
    });
}

pageAdminPanel.deleteFont = function(pageUuid, fontName) {
	if(fontName === undefined || fontName === null) {
		fontName = '';
	}
	fontName = fontName.trim();
	if(fontName.length <= 0) {
		return;
	}
    securityManager.ajax({type: "DELETE",
        url: '/page/' + pageUuid + '/font/' + fontName,
        dataType: 'json',
        success: function(data) {
        	pageAdminPanel.refreshFonts();
			pageAdminPanel.refreshPagePreview();
        },
        error: function(data) {
        	pageAdminPanel.refreshFonts();
        }
    });
}

pageAdminPanel.deleteController = function(pageUuid, name) {
	if(name === undefined || name === null) {
		name = '';
	}
	name = name.trim();
	if(name.length <= 0) {
		return;
	}
    securityManager.ajax({type: "DELETE",
        url: '/page/' + pageUuid + '/controller/' + name,
        dataType: 'json',
        success: function(data) {
        	pageAdminPanel.refreshControllers();
			pageAdminPanel.refreshPagePreview();
        },
        error: function(data) {
        	pageAdminPanel.refreshControllers();
			pageAdminPanel.refreshPagePreview();
        }
    });
}

pageAdminPanel.deleteStyle = function(pageUuid, name) {
	if(name === undefined || name === null) {
		name = '';
	}
	name = name.trim();
	if(name.length <= 0) {
		return;
	}
    securityManager.ajax({type: "DELETE",
        url: '/page/' + pageUuid + '/style/' + name,
        dataType: 'json',
        success: function(data) {
        	pageAdminPanel.refreshStyles();
			pageAdminPanel.refreshPagePreview();
        },
        error: function(data) {
        	pageAdminPanel.refreshStyles();
			pageAdminPanel.refreshPagePreview();
        }
    });
}


pageAdminPanel.hasUnsavedChanges = function() {
	return false;
}

pageAdminPanel.selectApplication = function(uuid) {
	// Add the mask
	$('#pages-admin-panel .maskable').addClass('blur');
	$('#pages-admin-panel .mask').show();
	$('#search-pages-input').val('');
	pageAdminPanel.currentPageNameRegex = '';
	pageAdminPanel.loadPage(null);
	console.log('pageAdminPanel.selectApplication');
}

pageAdminPanel.showCreatePagePopup = function() {
	$('input[tabindex]').attr('tabindex', '');
	$('#create-page-name').attr('tabindex', 1);
	$('#create-page-is-template-yes').attr('tabindex', 2);
	$('#create-page-is-template-no').attr('tabindex', 3);
	$('#create-page-parentUuids').attr('tabindex', 4);
	$('#create-page-description').attr('tabindex', 5);
	$('#create-page-save-and-close').attr('tabindex', 6);
	$('#create-page-save-and-new').attr('tabindex', 7);
	$('#create-page-cancel').attr('tabindex', 8);
	popup.show('#create-page-popup');
}

pageAdminPanel.showPublishPagePopup = function() {
	var ulElement = $('#publish-page-destination-list > ul');
	ulElement.empty();
	popup.show('#publish-page-popup');
	popup.showLoading('#publish-page-popup');
	securityManager.ajax({type: 'GET',
        url: '/destination/',
        dataType: 'json',
        success: function(data) {
            for(var index in data) {
            	ulElement.append('<li><input id="destination-' + data[index].uuid + '" class="filter-radio-button publish-page-destination" type="radio" name="destination" value="' + data[index].uuid + '"/><label for="destination-' + data[index].uuid + '">' + data[index].name + '&nbsp;' + data[index].domain + '</label></li>');
            }
			popup.hideLoading('#publish-page-popup');
        },
        error: function() {
			popup.hideLoading('#publish-page-popup');
        }
    });
}

pageAdminPanel.showFontsPopup = function() {
	popup.show('#page-select-fonts-popup');
	pageAdminPanel.refreshFonts();
}

pageAdminPanel.refreshFonts = function() {
	popup.showLoading('#page-select-fonts-popup');
	var ulElement = $('#page-select-fonts-list > ul');
	ulElement.empty();
	securityManager.ajax({type: 'GET',
        url: '/page/' + pageAdminPanel.currentPageUuid + '/font/',
        dataType: 'json',
        success: function(data) {
            for(var index in data) {
            	ulElement.append('<li><a class="action-page-load-font action-list-item" href="#' + data[index] + '">' + data[index] + '</a><a class="action-page-delete-font" href="#' + data[index] + '"><i class="fa fa-trash"></i></a></li>');
            }
			popup.hideLoading('#page-select-fonts-popup');
        },
        error: function() {
			popup.hideLoading('#page-select-fonts-popup');
        }
    });
}

pageAdminPanel.saveFont = function() {
	var name = $('#create-page-font-name').val();
	var source = $('#create-page-font-source').val();
	var description = $('#create-page-font-description').val();
	popup.showLoading('#create-page-font-popup');
    securityManager.ajax({type: "PUT",
        url: '/page/' + pageAdminPanel.currentPageUuid + '/font/',
        data: {"name": name,
        	   "source": source,
        	   "description": description},
        dataType: 'text',
        success: function(data) {
			popup.hideLoading('#create-page-font-popup');
			pageAdminPanel.showFontsPopup();
        },
        error: function(data) {
			popup.hideLoading('#create-page-font-popup');
        }
    });		
}

pageAdminPanel.showContentPopup = function() {
	popup.show('#page-locale-popup');
	popup.showLoading('#page-locale-popup');
	popup.hideLoading('#page-locale-popup');
}

pageAdminPanel.showCreateParentUuidsDropdown = function() {
	pageAdminPanel.ajaxCallParentsList.abort();
	$('#create-page-parentUuids-popup div.list>ul').empty();
	popup.showLoading('#create-page-parentUuids-popup');
	// Get the filter elements
	var checkedFilterType = $('#create-page-parentUuids-popup input.filter-radio-button:checked').val();
	var filterBy = '';
	if(checkedFilterType === 'templateonly') {
		filterBy = 'filterBy[isTemplate]=true';
	} else if(checkedFilterType === 'pageonly') {
		filterBy = 'filterBy[isTemplate]=false';
	}
	var pageNameRegex = $('#create-page-parentUuids-popup .filter-by-name').val();
	pageNameRegex = pageNameRegex.trim();
	if(pageNameRegex.length > 0) {
		if(filterBy.length > 0) {
			filterBy += '&';
		}
		filterBy += 'filterBy[name]=' + pageNameRegex;
	}
	var url = '/page/';
	if(filterBy.length > 0) {
		url += '?' + filterBy;
	}
    pageAdminPanel.ajaxCallParentsList = securityManager.ajax({type: 'GET',
        url: url,
        dataType: 'json',
        success: function(data) {
        	var noResults = false;
            if(data !== undefined && (data !== null) && (data != '')) {
            	if(data.length <= 0) {
            		noResults = true;
            	} else {
            		var ulElement = $('#create-page-parentUuids-popup div.list>ul');
	                for(var index in data) {
	                    var uuid = data[index].uuid;
	                    var pageName = data[index].name;
	                    var isTemplate = data[index].isTemplate;
	                    if(isTemplate === undefined || isTemplate === null) {
	                    	isTemplate = false;
	                    }
	                    var liElement = '<li><a id="action-select-' + uuid + '" class="action-select-page action-list-item" href="#' + uuid + '">' + pageName + '</a>';
	                	liElement += '<a id="action-select-' + uuid + '" class="action-select-page action-list-item small" href="#' + uuid + '">';
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
            	popup.showInfoMessage('#create-page-parentUuids-popup', 'No pages found.');
            } else {
            	popup.hideMessage('#create-page-parentUuids-popup');
            }
			popup.hideLoading('#create-page-parentUuids-popup');
        },
        error: function() {
			popup.hideLoading('#create-page-parentUuids-popup');
        }
    });
}
