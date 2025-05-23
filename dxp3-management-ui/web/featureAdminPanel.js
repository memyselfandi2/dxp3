var featureAdminPanel = {}

jQuery(document).ready(function() {
	featureAdminPanel.init();
});

/*
 * A feature consists of:
 * A name
 * A description
 * 0 or more layouts. There can only be one default layout and optionally one layout per locale.
 * 0 or more controllers. Each controller can be assigned to 0 or more locales.
 * 0 or more styles. Each style can be assigned to 0 or more locales.
 * 0 or more fonts.
 */
featureAdminPanel.currentFeatureNameRegex = '';
featureAdminPanel.hasUnsavedChanges = false;
featureAdminPanel.currentFeatureUuid = null;
featureAdminPanel.currentFeatureName = '';
featureAdminPanel.ajaxCallDefinition = {abort: function(){}};
featureAdminPanel.currentLayout = '';
featureAdminPanel.ajaxCallLayout = {abort: function(){}};
featureAdminPanel.currentLocale = '';
featureAdminPanel.currentLocaleLabels = [];
featureAdminPanel.ajaxCallLocales = {abort: function(){}};
featureAdminPanel.ajaxCallLocale = {abort: function(){}};
featureAdminPanel.currentController = '';
featureAdminPanel.currentControllerName = '';
featureAdminPanel.ajaxCallController = {abort: function(){}};
featureAdminPanel.currentStyle = '';
featureAdminPanel.currentStyleName = '';
featureAdminPanel.ajaxCallStyle = {abort: function(){}};
featureAdminPanel.ajaxCallList = {abort: function(){}};
featureAdminPanel.currentPreviewChannel = 'desktop';
featureAdminPanel.currentPreviewDebug = false;

featureAdminPanel.init = function() {
	$('#action-publish-feature').on('click', function(ev) {
		ev.preventDefault();
		featureAdminPanel.showPublishFeaturePopup();
		return false;
	});
	$('#action-publish-feature-confirm').on('click', function(ev) {
		ev.preventDefault();
		featureAdminPanel.publishFeature();		
		return false;
	});
	$('#feature-select-locale-list').on('click', '.action-feature-delete-locale', function(ev) {
		ev.preventDefault();
		var locale = $(this).attr('href').substring(1);
	    featureAdminPanel.deleteFeatureLocale(featureAdminPanel.currentFeatureUuid, locale);
		return false;
	});
	$('#feature-locale-save').on('click', function(ev) {
		ev.preventDefault();
		featureAdminPanel.saveLocale();
		return false;
	})
	$('#feature-layout-version').on('click', function(ev) {
		ev.preventDefault();
		featureAdminPanel.showLayoutVersionPopup();
		return false;
	});
	$('#feature-controller-version').on('click', function(ev) {
		ev.preventDefault();
		featureAdminPanel.showControllerVersionPopup();
		return false;
	});
	$('#feature-style-version').on('click', function(ev) {
		ev.preventDefault();
		featureAdminPanel.showStyleVersionPopup();
		return false;
	});
	// On load we disable everything except for
	// - Searching for features and
	// - Creating features
	$('#features-admin-panel .maskable').addClass('blur');
	$('#features-admin-panel .mask').show();
	$('#search-features').on('click', function(ev) {
		ev.preventDefault();
		$('#search-features-input').val(featureAdminPanel.currentFeatureNameRegex);
		popup.show('#search-features-popup');
		featureAdminPanel.list(featureAdminPanel.currentFeatureNameRegex);
		return false;
	});
	$('#search-features .clear-button').on('click', function(ev) {
		ev.preventDefault();
		featureAdminPanel.currentFeatureNameRegex = '';
		$('#search-features-input').val(featureAdminPanel.currentFeatureNameRegex);
		$(this).prev().focus();
		popup.show('#search-features-popup');
		featureAdminPanel.list(featureAdminPanel.currentFeatureNameRegex);
		return false;
	});
	$('#search-features .search-button').on('click', function(ev) {
		ev.preventDefault();
		$('#search-features-input').val(featureAdminPanel.currentFeatureNameRegex);
		$(this).prev().prev().focus();
		popup.show('#search-features-popup');
		featureAdminPanel.list(featureAdminPanel.currentFeatureNameRegex);
		return false;
	});
	$('#search-features-input').on('keyup', function(ev) {
		// if this is an enter
		if(ev.keyCode === 13) {
			var firstAction = $('#search-features-popup-list>ul>li>a');
			if(firstAction) {
				var uuid = firstAction.attr('href').substring(1);
				featureAdminPanel.loadFeature(uuid);
				return;
			}
		}
		featureAdminPanel.currentFeatureNameRegex = $(this).val();
		featureAdminPanel.list(featureAdminPanel.currentFeatureNameRegex);
	});
	$('#search-features-popup input.filter-radio-button').on('change', function(ev) {
		ev.preventDefault();
		featureAdminPanel.list();
		return false;
	});
	$('#select-feature-controller').on('click', function(ev) {
		ev.preventDefault();
		var displayAttribute = $('#feature-select-controller-popup').css('display');
		if(displayAttribute === 'none') {
			featureAdminPanel.showSelectControllerPopup();
		} else {
			popup.hide('#feature-select-controller-popup');
		}
		return false;
	});
	$('#action-feature-libraries').on('click', function(ev) {
		ev.preventDefault();
		popup.toggle('#feature-libraries-popup');
		return false;
	});
	$('#select-feature-style').on('click', function(ev) {
		ev.preventDefault();
		var displayAttribute = $('#feature-select-style-popup').css('display');
		if(displayAttribute === 'none') {
			featureAdminPanel.showSelectStylePopup();
		} else {
			popup.hide('#feature-select-style-popup');
		}
		return false;
	});
	$('#action-feature-images').on('click', function(ev) {
		ev.preventDefault();
		popup.hide('#feature-locales-popup');
		var displayAttribute = $('#feature-images-popup').css('display');
		if(displayAttribute === 'none') {
			featureAdminPanel.showImagesPopup();
		} else {
			popup.hide('#feature-images-popup');
		}
		return false;
	})
	$('#feature-images-popup-form').on('submit', function(ev) {
		ev.preventDefault();
		featureAdminPanel.uploadImage();
		return false;
	});
	$('#feature-style-images-popup-form').on('submit', function(ev) {
		ev.preventDefault();
		featureAdminPanel.uploadStyleImage();
		return false;
	});
	$('#action-feature-locales').on('click', function(ev) {
		ev.preventDefault();
		$('#feature-images-popup').hide();
		$('#feature-locales-popup').toggle();
		return false;
	});
	$('#action-feature-style-fonts').on('click', function(ev) {
		ev.preventDefault();
		var displayAttribute = $('#feature-select-fonts-popup').css('display');
		if(displayAttribute === 'none') {
			featureAdminPanel.showFontsPopup();
		} else {
			popup.hide('#feature-select-fonts-popup');
		}
		return false;
	});	
	$('#action-feature-style-images').on('click', function(ev) {
		ev.preventDefault();
		var displayAttribute = $('#feature-style-images-popup').css('display');
		if(displayAttribute === 'none') {
			featureAdminPanel.showStyleImagesPopup();
		} else {
			popup.hide('#feature-style-images-popup');
		}
		return false;
	});	
	$('#create-feature-popup .action-cancel').on('click', function(ev) {
		// clear all fields
		$(this).parents('form').find('input').val('');
		$('input[tabindex]').attr('tabindex', '');
		$('.popup').hide();
	});
	$('#update-feature-popup .action-cancel').on('click', function(ev) {
		$('input[tabindex]').attr('tabindex', '');
		$('.popup').hide();
	});
	$('#publish-feature-popup .action-cancel').on('click', function(ev) {
		$('input[tabindex]').attr('tabindex', '');
		$('textarea[tabindex]').attr('tabindex', '');
		$('.popup').hide();
	});
	$('#create-feature-save-and-close').on('click', function(ev) {
		ev.preventDefault();
		featureAdminPanel.createFeature(true);
		return false;
	});
	$('#create-feature-save-and-new').on('click', function(ev) {
		ev.preventDefault();
		featureAdminPanel.createFeature(false);
		return false;
	});
	$('#update-feature-save-and-close').on('click', function(ev) {
		ev.preventDefault();
		featureAdminPanel.updateFeature(true);
		return false;
	});
	$('#update-feature-save').on('click', function(ev) {
		ev.preventDefault();
		featureAdminPanel.updateFeature(false);
		return false;
	});
	$('#search-features-popup-list').on('click', '.action-load-feature', function(ev) {
		ev.preventDefault();
		var uuid = $(this).attr('href').substring(1);
		featureAdminPanel.loadFeature(uuid);
		return false;
	});
	$('#feature-select-controller-list').on('click', '.action-feature-load-controller', function(ev) {
		ev.preventDefault();
		var controllerName = $(this).attr('href').substring(1);
		popup.hide('#feature-select-controller-popup');
	    featureAdminPanel.loadFeatureController(featureAdminPanel.currentFeatureUuid, controllerName);
		return false;
	});
	$('#feature-select-locale-list').on('click', '.action-feature-load-locale', function(ev) {
		ev.preventDefault();
		var locale = $(this).attr('href').substring(1);
		$('#select-feature-locale-input').val(locale);
		$('#select-feature-locale .dropdown-content').hide();
	    featureAdminPanel.loadFeatureLocale(featureAdminPanel.currentFeatureUuid, locale);
		return false;
	});
	$('#feature-select-style-list').on('click', '.action-feature-load-locale', function(ev) {
		ev.preventDefault();
		var styleName = $(this).attr('href').substring(1);
		$('#feature-select-style-popup').hide();
	    featureAdminPanel.loadFeatureStyle(featureAdminPanel.currentFeatureUuid, styleName);
		return false;
	});

	$('.create-feature-form').on('submit', function(ev) {
		ev.preventDefault();
		featureAdminPanel.createFeature(true);
		return false;
	});
	$('.update-feature-form').on('submit', function(ev) {
		ev.preventDefault();
		featureAdminPanel.updateFeature(true);
		return false;
	});
	$('#create-feature-name').on('click', function(ev) {
		ev.preventDefault();
		featureAdminPanel.showCreateFeaturePopup();
		return false;
	});
	$('#create-feature-name').on('focus', function(ev) {
		ev.preventDefault();
		featureAdminPanel.showCreateFeaturePopup();
		return false;
	});
	$('#update-feature-name').on('click', function(ev) {
		ev.preventDefault();
		featureAdminPanel.showUpdateFeaturePopup();
		return false;
	});
	$('#update-feature-name').on('focus', function(ev) {
		ev.preventDefault();
		featureAdminPanel.showUpdateFeaturePopup();
		return false;
	});
	$('#search-features-popup-list').on('click', '.action-delete-feature', function(ev) {
		ev.preventDefault();
		if(confirm('Are you sure?')) {
			var uuid = $(this).attr('href').substring(1);
			featureAdminPanel.deleteFeature(uuid);
		}
		return false;
	});
	$('.action-save-feature').on('click', function(ev) {
		ev.preventDefault();
		featureAdminPanel.saveFeatureLayout();
		featureAdminPanel.saveFeatureController();
		featureAdminPanel.saveFeatureStyle();
		return false;
	})
	$('#action-save-feature-layout').on('click', function(ev) {
		ev.preventDefault();
		featureAdminPanel.saveFeatureLayout();
		return false;
	});
	$('#action-save-feature-controller').on('click', function(ev) {
		ev.preventDefault();
		featureAdminPanel.saveFeatureController();
		return false;
	});
	$('#action-save-feature-style').on('click', function(ev) {
		ev.preventDefault();
		featureAdminPanel.saveFeatureStyle();
		return false;
	});
	$('#feature-preview-locale-list').on('click', '.action-feature-preview-locale', function(ev) {
		ev.preventDefault();
		var locale = $(this).attr('href').substring(1);
		$('#select-feature-preview-locale .dropdown-content').hide();
		featureAdminPanel.refreshFeaturePreview(null, locale);
		return false;
	})
	$('#action-refresh-feature-preview').on('click', function(ev) {
		ev.preventDefault();
		featureAdminPanel.refreshFeaturePreview(null, null);
		return false;
	});
	$('#feature-preview-frame').on('load', function(ev) {
		$('#feature-preview .icon-loading').hide();
	});
	$('#action-feature-toggle-debug').on('click', function(ev) {
		ev.preventDefault();
		featureAdminPanel.currentPreviewDebug = !featureAdminPanel.currentPreviewDebug;
		if(featureAdminPanel.currentPreviewDebug) {
			$(this).addClass('shade-of-red');
		} else {
			$(this).removeClass('shade-of-red');
		}
		featureAdminPanel.refreshFeaturePreview(null, null);
		return false;
	});
	$('#action-feature-mobile-preview').on('click', function(ev) {
		ev.preventDefault();
		featureAdminPanel.currentPreviewChannel = 'mobile';
		$(this).addClass('shade-of-green');
		$('#action-feature-tablet-preview').removeClass('shade-of-green');
		$('#action-feature-desktop-preview').removeClass('shade-of-green');
		featureAdminPanel.refreshFeaturePreview(null, null);
		return false;
	});
	$('#action-feature-tablet-preview').on('click', function(ev) {
		ev.preventDefault();
		featureAdminPanel.currentPreviewChannel = 'tablet';
		$(this).addClass('shade-of-green');
		$('#action-feature-mobile-preview').removeClass('shade-of-green');
		$('#action-feature-desktop-preview').removeClass('shade-of-green');
		featureAdminPanel.refreshFeaturePreview(null, null);
		return false;
	});
	$('#action-feature-desktop-preview').on('click', function(ev) {
		ev.preventDefault();
		featureAdminPanel.currentPreviewChannel = 'desktop';
		$(this).addClass('shade-of-green');
		$('#action-feature-mobile-preview').removeClass('shade-of-green');
		$('#action-feature-tablet-preview').removeClass('shade-of-green');
		featureAdminPanel.refreshFeaturePreview(null, null);
		return false;
	});
	$('#create-feature-font-save').on('click', function(ev) {
		ev.preventDefault();
		featureAdminPanel.saveFont();
		return false;
	});
	$('#action-feature-locale').on('click', function(ev) {
		ev.preventDefault();
		featureAdminPanel.showLocalePopup();
		return false;
	});
	// Attempt to get an initial list of features
	featureAdminPanel.list();
}

featureAdminPanel.publishFeature = function() {
	var data = {};
	data.type = 'feature';
	data.uuid = featureAdminPanel.currentFeatureUuid;
	data.destinationUuid = '8d06db90-a202-11e6-a535-3d09009fcf14';
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

featureAdminPanel.showSelectControllerPopup = function() {
	var ulElement = $('#feature-select-controller-list > ul');
	ulElement.empty();
	popup.show('#feature-select-controller-popup');
	popup.showLoading('#feature-select-controller-popup');
	securityManager.ajax({type: 'GET',
        url: '/feature/' + featureAdminPanel.currentFeatureUuid + '/controller/',
        dataType: 'json',
        success: function(data) {
            for(var index in data) {
            	ulElement.append('<li><a class="action-feature-load-controller action-list-item" href="#' + data[index] + '">' + data[index] + '</a><a class="action-feature-delete-controller" href="#' + data[index] + '"><i class="fa fa-trash"></i></a></li>');
            }
			popup.hideLoading('#feature-select-controller-popup');
        },
        error: function() {
			popup.hideLoading('#feature-select-controller-popup');
        }
    });
}

featureAdminPanel.publishFeature = function() {
	var data = {};
	data.type = 'feature';
	data.uuid = featureAdminPanel.currentFeatureUuid;
	data.destinationUuid = $('.publish-feature-destination:checked').val();
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

featureAdminPanel.showSelectStylePopup = function() {
	var ulElement = $('#feature-select-style-list > ul');
	ulElement.empty();
	popup.show('#feature-select-style-popup');
	popup.showLoading('#feature-select-style-popup');
	securityManager.ajax({type: 'GET',
        url: '/feature/' + featureAdminPanel.currentFeatureUuid + '/style/',
        dataType: 'json',
        success: function(data) {
            for(var index in data) {
            	ulElement.append('<li><a class="action-feature-load-style action-list-item" href="#' + data[index] + '">' + data[index] + '</a><a class="action-feature-delete-style" href="#' + data[index] + '"><i class="fa fa-trash"></i></a></li>');
            }
			popup.hideLoading('#feature-select-style-popup');
        },
        error: function() {
			popup.hideLoading('#feature-select-style-popup');
        }
    })
}

featureAdminPanel.showImagesPopup = function() {
	var ulElement = $('#feature-images-list > ul');
	ulElement.empty();
	popup.show('#feature-images-popup');
	popup.showLoading('#feature-images-popup');
	securityManager.ajax({type: 'GET',
        url: '/feature/' + featureAdminPanel.currentFeatureUuid + '/image/',
        dataType: 'json',
        success: function(data) {
            for(var index in data) {
            	ulElement.append('<li>' + data[index] + '</li>');
            }
			popup.hideLoading('#feature-images-popup');
        },
        error: function() {
			popup.hideLoading('#feature-images-popup');
        }
    });
}

featureAdminPanel.showStyleImagesPopup = function() {
	var ulElement = $('#feature-style-images-list > ul');
	ulElement.empty();
	popup.show('#feature-style-images-popup');
	popup.showLoading('#feature-style-images-popup');
	securityManager.ajax({type: 'GET',
        url: '/feature/' + featureAdminPanel.currentFeatureUuid + '/style/image/',
        dataType: 'json',
        success: function(data) {
            for(var index in data) {
            	ulElement.append('<li>' + data[index] + '</li>');
            }
			popup.hideLoading('#feature-style-images-popup');
        },
        error: function() {
			popup.hideLoading('#feature-style-images-popup');
        }
    })
}

featureAdminPanel.showFontsPopup = function() {
	var ulElement = $('#feature-select-fonts-list > ul');
	ulElement.empty();
	popup.show('#feature-select-fonts-popup');
	popup.showLoading('#feature-select-fonts-popup');
	securityManager.ajax({type: 'GET',
        url: '/feature/' + featureAdminPanel.currentFeatureUuid + '/font/',
        dataType: 'json',
        success: function(data) {
            for(var index in data) {
            	ulElement.append('<li><a class="action-feature-load-font action-list-item" href="#' + data[index] + '">' + data[index] + '</a><a class="action-feature-delete-font" href="#' + data[index] + '"><i class="fa fa-trash"></i></a></li>');
            }
			popup.hideLoading('#feature-select-fonts-popup');
        },
        error: function() {
			popup.hideLoading('#feature-select-fonts-popup');
        }
    });
}

featureAdminPanel.uploadImage = function() {
	var files = $('#feature-images-select')[0].files;
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
        url: '/feature/' + featureAdminPanel.currentFeatureUuid + '/image/',
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

featureAdminPanel.uploadStyleImage = function() {
	var files = $('#feature-style-images-select')[0].files;
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
        url: '/feature/' + featureAdminPanel.currentFeatureUuid + '/style/image/',
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

featureAdminPanel.refreshFeaturePreview = function(uuid, locale) {
	if(uuid === undefined || uuid === null) {
		uuid = featureAdminPanel.currentFeatureUuid;
	}
	if(uuid === undefined || uuid === null) {
		$('#feature-preview-frame').attr('src', '');			
	} else {
		$('#feature-preview .icon-loading').show();
		var url = '/preview?type=feature&uuid=' + uuid;
		if(locale === undefined || locale === null) {
			locale = '';
		}
		locale = locale.trim();
		if(locale.length > 0) {
			url += '&locale=' + locale;
		}
		$('#select-feature-preview-locale-input').val(locale);
		// Check if debugging is on...
		if(featureAdminPanel.currentPreviewDebug) {
			url += '&debug=true';
		}
		// Select the preview channel...
		url += '&channel=' + featureAdminPanel.currentPreviewChannel;
		securityManager.setSrc('feature-preview-frame', url);
	}
}

featureAdminPanel.list = function(featureNameRegex) {
    featureAdminPanel.ajaxCallList.abort();
	$('#search-features-popup-list>ul').empty();
	popup.showLoading('#search-features-popup');
	var url = '/feature/';
	var hasRequestParameter = false;
	// Get the filter elements
	var applicationUuid = applicationAdminPanel.currentApplicationUuid;
	if(applicationUuid !== null) {
		url += '?applicationUuid=' + applicationUuid;
		hasRequestParameter = true;
	}
	var checkedFilterType = $('#search-applications-popup input.filter-radio-button:checked').val();
	var filterBy = '';
	if(checkedFilterType === 'templateonly') {
		filterBy = 'filterBy[isTemplate]=true';
	} else if(checkedFilterType === 'applicationonly') {
		filterBy = 'filterBy[isTemplate]=false';
	}
	featureNameRegex = (featureNameRegex === undefined || featureNameRegex === null) ? '' : featureNameRegex;
	featureNameRegex = featureNameRegex.trim();
	if(featureNameRegex.length > 0) {
		if(filterBy.length > 0) {
			filterBy += '&';
		}
		filterBy += 'filterBy[name]=' + featureNameRegex;
	}
	if(filterBy.length > 0) {
		if(!hasRequestParameter) {
			url += '?';
		} else {
			url += '&';
		}
		url += filterBy;
	}
	featureAdminPanel.ajaxCallList = securityManager.ajax({type: 'GET',
        url: url,
        dataType: 'json',
        success: function(data) {
            if(data !== undefined && (data !== null) && (data != '')) {
                for(var index in data) {
                    var uuid = data[index].uuid;
                    var featureName = data[index].name;
                    $('#search-features-popup-list>ul').append('<li><a id="action-update-' + uuid + '" class="action-load-feature action-list-item" href="#' + uuid + '">' + featureName + '</a><a id="action-delete-' + uuid + '" class="action-delete-feature" href="#' + uuid + '"><i class="fa fa-trash"></i></a></li>');
                }
            }
			popup.hideLoading('#search-features-popup');
        },
        error: function() {
			popup.hideLoading('#search-features-popup');
        }
    });}

featureAdminPanel.saveFeatureLayout = function() {
	if(featureAdminPanel.currentFeatureUuid === null) {
		return;
	}
	var code = featureLayoutEditor.getValue();
	if(code === featureAdminPanel.currentLayout) {
			return;
	}
	$('#feature-layout .icon-loading').show();
    securityManager.ajax({type: "PUT",
    	async: true,
        url: '/feature/' + featureAdminPanel.currentFeatureUuid + '/layout/',
        data: {"code": code},
        dataType: 'text',
        success: function(data) {
			$('#feature-layout .icon-loading').hide();
			featureAdminPanel.currentLayout = code;
			// Next we refresh the preview
			featureAdminPanel.refreshFeaturePreview(null, null);
        },
        error: function(data) {
            $('#feature-preview-frame').attr('src', '#');			
			$('#feature-layout .icon-loading').hide();
        	var errorMessage = 'An unknown error occurred. Please try again later. 0';
        	alert(errorMessage);
        }
    });		
}

featureAdminPanel.saveFeatureController = function() {
	if(featureAdminPanel.currentFeatureUuid === null) {
		return;
	}
	var name = $('#select-feature-controller').val();
	var code = featureControllerEditor.getValue();
	if((code === featureAdminPanel.currentController) && (name === featureAdminPanel.currentControllerName)) {
		// We might as well still attempt to refresh.
		// Who knows why the user keeps hitting save.
		featureAdminPanel.refreshFeaturePreview(null, null);
		return;
	}
	$('#feature-controller .icon-loading').show();
    securityManager.ajax({type: "PUT",
    	async: true,
        url: '/feature/' + featureAdminPanel.currentFeatureUuid + '/controller/',
        data: {"name": name,
        	   "code": code},
        dataType: 'text',
        success: function(data) {
			$('#feature-controller .icon-loading').hide();
			featureAdminPanel.currentControllerName = name;
			featureAdminPanel.currentController = code;
			// Next we refresh the preview
			featureAdminPanel.refreshFeaturePreview(null, null);
        },
        error: function(data) {
            $('#feature-preview-frame').attr('src', '#');			
			$('#feature-controller .icon-loading').hide();
        	var errorMessage = 'An unknown error occurred. Please try again later. ';
        	alert(errorMessage);
        }
    });		
}

featureAdminPanel.saveFeatureStyle = function() {
	if(featureAdminPanel.currentFeatureUuid === null) {
		return;
	}
	var name = $('#select-feature-style').val();
	var code = featureStyleEditor.getValue();
	if((code === featureAdminPanel.currentStyle) && (name === featureAdminPanel.currentStyleName)) {
		// We might as well still attempt to refresh.
		// Who knows why the user keeps hitting save.
		featureAdminPanel.refreshFeaturePreview(null, null);
		return;
	}
	$('#feature-style .icon-loading').show();
    securityManager.ajax({type: "PUT",
    	async: true,
        url: '/feature/' + featureAdminPanel.currentFeatureUuid + '/style/',
        data: {"name": name,
        	   "code": code},
        dataType: 'text',
        success: function(data) {
			$('#feature-style .icon-loading').hide();
			featureAdminPanel.currentStyleName = name;
			featureAdminPanel.currentStyle = code;
			// Next we refresh the preview
			featureAdminPanel.refreshFeaturePreview(null, null);
        },
        error: function(data) {
            $('#feature-preview-frame').attr('src', '#');			
			$('#feature-style .icon-loading').hide();
        	var errorMessage = 'An unknown error occurred. Please try again later.';
        	alert(errorMessage);
        }
    });		
}

featureAdminPanel.loadFeature = function(uuid) {
	if(uuid === undefined || uuid === null) {
		uuid = '';
	}
	uuid = uuid.trim();
	if(uuid.length <= 0) {
		uuid = null;
	}
	featureAdminPanel.currentFeatureUuid = uuid;
	featureAdminPanel.hasUnsavedChanges = false;
	featureAdminPanel.loadFeatureDefinition(uuid);
    featureAdminPanel.loadFeatureLayout(uuid);
    featureAdminPanel.loadFeatureStyle(uuid);
    featureAdminPanel.loadFeatureController(uuid);
    featureAdminPanel.loadFeatureLocales(uuid);
    featureAdminPanel.refreshFeaturePreview(uuid, null);
}

featureAdminPanel.loadFeatureLocales = function(uuid) {
    featureAdminPanel.ajaxCallLocales.abort();
    var ulElement = $('#feature-preview-locale-list > ul');
	featureAdminPanel.ajaxCallLocales = securityManager.ajax({type: 'GET',
        url: '/feature/' + uuid + '/locale/',
        dataType: 'json',
        success: function(data) {
            for(var index in data) {
            	ulElement.append('<li><a class="action-feature-preview-locale action-list-item" href="#' + data[index] + '">' + data[index] + '</a></li>');
            }
        },
        error: function() {
        }
    });
}

featureAdminPanel.loadFeatureDefinition = function(uuid) {
    featureAdminPanel.ajaxCallDefinition.abort();
	$('#update-feature-name').val('');
	$('#update-feature-description').val('');
	featureAdminPanel.currentFeatureName = '';
	if(uuid === null) {
		return;
	}
	featureAdminPanel.ajaxCallDefinition = securityManager.ajax({type: 'GET',
    	async: true,
        url: '/feature/' + uuid,
        dataType: 'json',
        success: function(data) {
            if(data !== undefined && (data !== null) && (data != '')) {
            	featureAdminPanel.currentFeatureName = data.name;
            	$('#update-feature-name').val(data.name);
            	var isTemplate = (data.isTemplate != undefined && data.isTemplate != null) ? data.isTemplate : false;
       			$('#update-feature-is-template-yes').prop('checked', isTemplate);
        		$('#update-feature-is-template-no').prop('checked', !isTemplate);
            	$('#update-feature-description').val(data.description);
            	$('#search-features-input').val(data.name);
				// disable the mask
				$('#features-admin-panel .maskable').removeClass('blur');					
				$('#features-admin-panel .mask').hide();
				popup.hide('#search-features-popup');
            }
        },
        error: function() {
        }
    });
}

featureAdminPanel.loadFeatureLayout = function(uuid) {
	featureAdminPanel.ajaxCallLayout.abort();
	featureAdminPanel.currentLayout = '';
	if(uuid === null) {
	    featureLayoutEditor.setValue('');
		return;
	}
	$('#feature-layout .icon-loading').show();
	featureAdminPanel.ajaxCallLayout = securityManager.ajax({type: "GET",
    	async: true,
        url: '/feature/' + uuid + '/layout/',
        dataType: 'text',
        success: function(featureLayout) {
        	featureAdminPanel.currentLayout = featureLayout;
            featureLayoutEditor.setValue(featureLayout);
			$('#feature-layout .icon-loading').hide();
        },
        error: function(err) {
		    featureLayoutEditor.setValue('');
			$('#feature-layout .icon-loading').hide();
        }
    });
}

featureAdminPanel.loadFeatureStyle = function(uuid, styleName) {
	featureAdminPanel.ajaxCallStyle.abort();
	if(styleName === undefined || styleName === null || styleName === '') {
		styleName = 'default';
	}
	featureAdminPanel.currentStyle = '';
	featureAdminPanel.currentStyleName = '';
	if(uuid === null) {
	    featureStyleEditor.setValue('');
		return;
	}
	$('#feature-style .icon-loading').show();
	featureAdminPanel.ajaxCallStyle = securityManager.ajax({type: "GET",
        url: '/feature/' + uuid + '/style/' + styleName + '/',
        dataType: 'text',
        success: function(featureStyle) {
        	$('#select-feature-style').val(styleName);
			featureAdminPanel.currentStyle = featureStyle;
            featureStyleEditor.setValue(featureStyle);
			$('#feature-style .icon-loading').hide();
        },
        error: function(err) {
		    featureStyleEditor.setValue('');
			$('#feature-style .icon-loading').hide();
        }
    });
}

featureAdminPanel.loadFeatureController = function(uuid, controllerName) {
	featureAdminPanel.ajaxCallController.abort();
	if(controllerName === undefined || controllerName === null || controllerName === '') {
		controllerName = 'default';
	}
	featureAdminPanel.currentController = '';
	featureAdminPanel.currentControllerName = '';
	if(uuid === null) {
	    featureControllerEditor.setValue('');
		return;
	}
	$('#feature-controller .icon-loading').show();
	featureAdminPanel.ajaxCallController = securityManager.ajax({type: "GET",
    	async: true,
        url: '/feature/' + uuid + '/controller/' + controllerName + '/',
        dataType: 'text',
        success: function(featureController) {
        	$('#select-feature-controller').val(controllerName);
			featureAdminPanel.currentController = featureController;
            featureControllerEditor.setValue(featureController);
			$('#feature-controller .icon-loading').hide();
        },
        error: function(err) {
		    featureControllerEditor.setValue('');
			$('#feature-controller .icon-loading').hide();
        }
    });
}

featureAdminPanel.createFeature = function(closeOnSuccess) {
	var name = $('#create-feature-name').val();
	name = name.trim();
	if(name === '') {
		if(closeOnSuccess) {
			$('#create-feature-popup').hide();
		} else {
			$('#create-feature-name').focus();
		}
		return;
	}
	var description = $('#create-feature-description').val();
	description = description.trim();
	var applicationUuid = applicationAdminPanel.currentApplicationUuid;
	if(applicationUuid === undefined || applicationUuid === null) {
		applicationUuid = '';
	}
	applicationUuid = applicationUuid.trim();
    securityManager.ajax({type: "POST",
        url: '/feature/',
        data: {"name": name,
               "description": description,
           	   "applicationUuid": applicationUuid},
        dataType: 'json',
        success: function(data) {
			$('#create-feature-name').val('');
			$('#create-feature-description').val('');
			if(closeOnSuccess) {
				$('#create-feature-poupup').hide();
			} else {
				$('#create-feature-name').focus();
			}
            var uuid = data.uuid;
			$('#search-features-popup-list>ul').append('<li><a id="action-update-' + uuid + '" class="action-load-feature action-list-item" href="#' + uuid + '">' + name + '</a><a id="action-delete-' + uuid + '" class="action-delete-feature" href="#' + uuid + '"><i class="fa fa-trash"></i></a></li>');
			featureAdminPanel.loadFeature(uuid);
        },
        error: function(data) {
        	var errorMessage = 'An unknown error occurred. Please try again later. 3';
        	if(data.status === 409) {
        		errorMessage = "A feature with the same name already exists. Please try a different name.";
        	}
        	alert(errorMessage);
        }
    });
}

featureAdminPanel.updateFeature = function(closeOnSuccess) {
	if(featureAdminPanel.currentFeatureUuid === null) {
		return;
	}
	var name = $('#update-feature-name').val();
	name = name.trim();
	if(name === '') {
		return;
	}
	var description = $('#update-feature-description').val();
	var applicationUuid = applicationAdminPanel.currentApplicationUuid;
	if(applicationUuid === undefined || applicationUuid === null) {
		applicationUuid = '';
	}
	applicationUuid = applicationUuid.trim();
    securityManager.ajax({type: "PUT",
        url: '/feature/' + featureAdminPanel.currentFeatureUuid,
        data: {"name": name,
               "description": description,
           	   "applicationUuid": applicationUuid},
        dataType: 'json',
        success: function(data) {
            var uuid = data.uuid;
			$('#action-update-' + uuid).text(name);
			if(closeOnSuccess) {
				$('#update-feature-popup').hide();
			} else {
				$('#update-feature-name').focus();
			}
        },
        error: function(data) {
        	var errorMessage = 'An unknown error occurred. Please try again later. 4';
        	if(data.status === 409) {
        		errorMessage = "A feature with the same name already exists. Please try a different name.";
        	}
        	alert(errorMessage);
        }
    });
}

featureAdminPanel.deleteFeature = function(uuid) {
	if(uuid === undefined || uuid === null) {
		return;
	}
    securityManager.ajax({type: "DELETE",
        url: '/feature/' + uuid,
        dataType: 'json',
        success: function(data) {
            var uuid = data.uuid;
			$('#action-delete-' + uuid).parent().remove();
        },
        error: function(data) {
        	if(data.status == 404) {
				$('#action-delete-' + uuid).parent().remove();
			}
        }
    });
}

featureAdminPanel.deleteFeatureLocale = function(uuid, locale) {

}

featureAdminPanel.selectApplication = function(uuid) {
	// Add the mask
	$('#features-admin-panel .maskable').addClass('blur');
	$('#features-admin-panel .mask').show();
	$('#search-features-input').val('');
	featureAdminPanel.currentFeatureNameRegex = '';
	featureAdminPanel.loadFeature(null);
}

featureAdminPanel.showCreateFeaturePopup = function() {
	$('input[tabindex]').attr('tabindex', '');
	$('#create-feature-name').attr('tabindex', 1);
	$('#create-feature-description').attr('tabindex', 4);
	$('#create-feature-save').attr('tabindex', 5);
	$('#create-feature-cancel').attr('tabindex', 6);
	popup.show('#create-feature-popup');
}

featureAdminPanel.showUpdateFeaturePopup = function() {
	$('input[tabindex]').attr('tabindex', '');
	$('#update-feature-name').attr('tabindex', 1);
	$('#update-feature-description').attr('tabindex', 4);
	$('#update-feature-save').attr('tabindex', 5);
	$('#update-feature-cancel').attr('tabindex', 6);
	popup.show('#update-feature-popup');
}

featureAdminPanel.showPublishFeaturePopup = function() {
	var ulElement = $('#publish-feature-destination-list > ul');
	ulElement.empty();
	popup.show('#publish-feature-popup');
	popup.showLoading('#publish-feature-popup');
	securityManager.ajax({type: 'GET',
        url: '/destination/',
        dataType: 'json',
        success: function(data) {
            for(var index in data) {
            	ulElement.append('<li><input id="destination-' + data[index].uuid + '" class="filter-radio-button publish-feature-destination" type="radio" name="destination" value="' + data[index].uuid + '"/><label for="destination-' + data[index].uuid + '">' + data[index].name + '&nbsp;' + data[index].domain + '</label></li>');
            }
			popup.hideLoading('#publish-feature-popup');
        },
        error: function() {
			popup.hideLoading('#publish-feature-popup');
        }
    });
}

featureAdminPanel.saveFont = function() {
	var name = $('#create-feature-font-name').val();
	var source = $('#create-feature-font-source').val();
	var description = $('#create-feature-font-description').val();
	popup.showLoading('#create-feature-font-popup');
    securityManager.ajax({type: "PUT",
        url: '/feature/' + featureAdminPanel.currentFeatureUuid + '/font/',
        data: {"name": name,
        	   "source": source,
        	   "description": description},
        dataType: 'text',
        success: function(data) {
			popup.hideLoading('#create-feature-font-popup');
			featureAdminPanel.showFontsPopup();
        },
        error: function(data) {
			popup.hideLoading('#create-feature-font-popup');
        }
    });		
}

featureAdminPanel.showLocalePopup = function() {
	// Two things:
	// 1) we find all the labels in the layout
	// 2) we ask the server for all the current labels
	var ulElement = $('#feature-select-locale-list > ul');
	ulElement.empty();
	popup.show('#feature-locale-popup');
	popup.showLoading('#feature-locale-popup');
	securityManager.ajax({type: 'GET',
        url: '/feature/' + featureAdminPanel.currentFeatureUuid + '/locale/',
        dataType: 'json',
        success: function(data) {
            for(var index in data) {
            	ulElement.append('<li><a class="action-feature-load-locale action-list-item" href="#' + data[index] + '">' + data[index] + '</a><a class="action-feature-delete-locale" href="#' + data[index] + '"><i class="fa fa-trash"></i></a></li>');
            }
			popup.hideLoading('#feature-locale-popup');
        },
        error: function() {
			popup.hideLoading('#feature-locale-popup');
        }
    });
	// find all the labels in the current layout
    var layout = featureLayoutEditor.getValue();
    featureAdminPanel.currentLocaleLabels = [];
    $('<div>' + layout + '</div>').find('*[class*="label_"]').each(function() {
        var theclasses = $(this).attr('class');
        var indexOfLabel = theclasses.indexOf('label_');
        theclasses = theclasses.substring(indexOfLabel + 6);
        var indexOfSpace = theclasses.indexOf(' ');
        if(indexOfSpace > 0) {
            theclasses = theclasses.substring(0, indexOfSpace);
        }
		featureAdminPanel.currentLocaleLabels.push(theclasses);
    });
    $('#feature-locale-labels').empty();
    for(var i=0;i < featureAdminPanel.currentLocaleLabels.length;i++) {
    	var row = '<div class="row">' +
                  '   <div class="column_x2">' + featureAdminPanel.currentLocaleLabels[i] + '</div>' +
                  '   <div class="column_x2">' +
                  '      <div class="input-field border">' +
                  '         <input class="feature-label" name="' + featureAdminPanel.currentLocaleLabels[i] + '" + type="text" placeholder=""/>' +
                  '         <button class="clear-button" title="Clear" type="reset"><i class="fa fa-remove"></i></button>' +
                  '      </div>' +
                  '   </div>' +
                  '</div>';
    	$('#feature-locale-labels').append(row);
    }
}

featureAdminPanel.showLayoutVersionPopup = function() {
	popup.show('#feature-layout-version-popup');
	popup.showLoading('#feature-layout-version-popup');
}

featureAdminPanel.showControllerVersionPopup = function() {
	popup.show('#feature-controller-version-popup');
	popup.showLoading('#feature-controller-version-popup');
}

featureAdminPanel.showStyleVersionPopup = function() {
	popup.show('#feature-style-version-popup');
	popup.showLoading('#feature-style-version-popup');
}

featureAdminPanel.saveLocale = function() {
	popup.showLoading('#feature-locale-popup');
    var data = new Object();
    var selectedLocale = $('#select-feature-locale-input').val();
    var uuid = featureAdminPanel.currentFeatureUuid;
    if(uuid != '') {
        $('*[class*="feature-label"]').each(function() {
            var key = $(this).attr('name');
            var value = $(this).val();
            data[key] = value;
        });
        var url = '/feature/' + uuid + '/locale/';
        securityManager.ajax({type: "PUT",
            url: url,
            data: {name:selectedLocale,
            	   code:JSON.stringify(data)},
            dataType: 'text',
            success: function(theresponse) {
				popup.hideLoading('#feature-locale-popup');
				// Next we refresh the preview
				featureAdminPanel.refreshFeaturePreview(null, selectedLocale);
            },
	        error: function() {
				popup.hideLoading('#feature-locale-popup');
	        }
        });
    }
}

featureAdminPanel.loadFeatureLocale = function(uuid, locale) {
	if(uuid === null) {
		return;
	}
	featureAdminPanel.ajaxCallLocale.abort();
	if(locale === undefined || locale === null || locale === '') {
		locale = 'en';
	}
	featureAdminPanel.currentLocale = '';
	popup.showLoading('#feature-locale-popup');
	featureAdminPanel.ajaxCallLocale = securityManager.ajax({type: "GET",
    	async: true,
        url: '/feature/' + uuid + '/locale/' + locale,
        dataType: 'json',
        success: function(locale) {
            for(var index in featureAdminPanel.currentLocaleLabels) {
                var label = featureAdminPanel.currentLocaleLabels[index];
                var value = locale[label];
                if(value === undefined || value === null) {
                    value = '';
                }
                $('.feature-label[name="' + label + '"]').val(value);
			}        	
			popup.hideLoading('#feature-locale-popup');
        },
        error: function(err) {
			popup.hideLoading('#feature-locale-popup');
        }
    });
}