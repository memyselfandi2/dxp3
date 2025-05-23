var categoryManager = {}

jQuery(document).ready(function() {
	categoryManager.init();
});

categoryManager.currentCategoryUuid = null;
categoryManager.ajaxCallDefinition = {abort: function(){}};
categoryManager.currentController = '';
categoryManager.ajaxCallController = {abort: function(){}};
categoryManager.currentStyle = '';
categoryManager.ajaxCallStyle = {abort: function(){}};

categoryManager.init = function() {
	$('#create-category-popup .action-cancel').on('click', function(ev) {
		// clear all fields
		$(this).parents('form').find('input').val('');
		$('input[tabindex]').attr('tabindex', '');
		$('.popup').hide();
	});
	$('#update-category-popup .action-cancel').on('click', function(ev) {
		$('input[tabindex]').attr('tabindex', '');
		$('.popup').hide();
	});
	$('#create-category-save').on('click', function(ev) {
		ev.preventDefault();
		categoryManager.createCategory();
		return false;
	});
	$('#update-category-save').on('click', function(ev) {
		ev.preventDefault();
		categoryManager.updateCategory();
		return false;
	});
	$('#search-categories-popup-list').on('click', '.action-load-category', function(ev) {
		ev.preventDefault();
		var uuid = $(this).attr('href').substring(1);
		categoryManager.loadCategory(uuid);
		return false;
	});
	$('.create-category-form').on('submit', function(ev) {
		ev.preventDefault();
		categoryManager.createCategory();
		return false;
	});
	$('.update-category-form').on('submit', function(ev) {
		ev.preventDefault();
		categoryManager.updateCategory();
		return false;
	});
	$('#create-category-name').on('focus', function(ev) {
		$('.popup').hide();
		$('input[tabindex]').attr('tabindex', '');
		$('#create-category-name').attr('tabindex', 1);
		$('#create-category-description').attr('tabindex', 4);
		$('#create-category-save').attr('tabindex', 5);
		$('#create-category-cancel').attr('tabindex', 6);
		$('#create-category-popup').show();
	});
	$('#update-category-name').on('focus', function(ev) {
		$('.popup').hide();
		$('input[tabindex]').attr('tabindex', '');
		$('#update-category-name').attr('tabindex', 1);
		$('#update-category-description').attr('tabindex', 4);
		$('#update-category-save').attr('tabindex', 5);
		$('#update-category-cancel').attr('tabindex', 6);
    	$('#update-category-popup').stop(true, true);
		$('#update-category-popup').show();
	});
	$('#search-categories-popup-list').on('click', '.action-delete-category', function(ev) {
		ev.preventDefault();
		var uuid = $(this).attr('href').substring(1);
		categoryManager.deleteCategory(uuid);
		return false;
	});
	$('#search-categories').on('click', function(ev) {
		ev.preventDefault();
		$('.popup').hide();
		$('#search-categories-popup').height('100%');
		return false;
	});
	$('#search-categories-popup').on('mouseleave', function(ev) {
		ev.preventDefault();
		$('#search-categories-popup').height('0px');
		return false;
	});
	// Attempt to get an initial list of categories
	categoryManager.list();
}

categoryManager.list = function() {
	$('#search-categories-popup .icon-loading').show();
    securityManager.ajax({type: 'GET',
        url: '/category/',
        dataType: 'json',
        success: function(data) {
            if(data !== undefined && (data !== null) && (data != '')) {
                for(var index in data) {
                    var uuid = data[index].uuid;
                    var categoryName = data[index].name;
                    $('#search-categories-popup-list>ul').append('<li><a id="action-update-' + uuid + '" class="action-load-category action-list-item" href="#' + uuid + '">' + categoryName + '</a><a id="action-delete-' + uuid + '" class="action-delete-category" href="#' + uuid + '"><i class="fa fa-trash"></i></a></li>');
                }
            }
			$('#search-categories-popup .icon-loading').hide();
        },
        error: function() {
			$('#search-categories-popup .icon-loading').hide();
        }
    });
}

categoryManager.loadCategory = function(uuid) {
	categoryManager.currentCategoryUuid = uuid;
	categoryManager.loadCategoryDefinition(uuid);
}

categoryManager.loadCategoryDefinition = function(uuid) {
    categoryManager.ajaxCallDefinition.abort();
	$('#update-category-name').val('');
	categoryManager.ajaxCallDefinition = securityManager.ajax({type: 'GET',
        url: '/category/' + uuid,
        dataType: 'json',
        success: function(data) {
            if(data !== undefined && (data !== null) && (data != '')) {
            	$('#update-category-name').val(data.name);
            	$('#update-category-description').val(data.description);
            	$('#update-category-popup').stop(true, true);
            	$('#update-category-popup').show(0).fadeOut(3000);
            }
        },
        error: function() {
        }
    });
}

categoryManager.createCategory = function() {
	var name = $('#create-category-name').val();
	name = name.trim();
	if(name === '') {
		return;
	}
	var description = $('#create-category-description').val();
	description = description.trim();
    securityManager.ajax({type: "POST",
        url: '/category/',
        data: {"name": name,
               "description": description},
        dataType: 'json',
        success: function(data) {
			$('#create-category-name').val('');
			$('#create-category-description').val('');
			$('#create-category-name').focus();
            var uuid = data.uuid;
			$('#search-categories-popup-list>ul').append('<li><a id="action-update-' + uuid + '" class="action-load-category action-list-item" href="#' + uuid + '">' + name + '</a><a id="action-delete-' + uuid + '" class="action-delete-category" href="#' + uuid + '"><i class="fa fa-trash"></i></a></li>');
			categoryManager.loadCategory(uuid);
        },
        error: function(data) {
        	var errorMessage = 'An unknown error occurred. Please try again later. 3';
        	if(data.status === 409) {
        		errorMessage = "A category with the same name already exists. Please try a different name.";
        	}
        	alert(errorMessage);
        }
    });
}

categoryManager.updateCategory = function() {
	if(categoryManager.currentCategoryUuid === null) {
		return;
	}
	var name = $('#update-category-name').val();
	name = name.trim();
	if(name === '') {
		return;
	}
	var description = $('#update-category-description').val();
    securityManager.ajax({type: "PUT",
        url: '/category/' + categoryManager.currentCategoryUuid,
        data: {"name": name,
               "description": description},
        dataType: 'json',
        success: function(data) {
            var uuid = data.uuid;
			$('#action-update-' + uuid).text(name);
        },
        error: function(data) {
        	var errorMessage = 'An unknown error occurred. Please try again later. 4';
        	if(data.status === 409) {
        		errorMessage = "A category with the same name already exists. Please try a different name.";
        	}
        	alert(errorMessage);
        }
    });
}

categoryManager.deleteCategory = function(uuid) {
	if(uuid === undefined || uuid === null) {
		return;
	}
    securityManager.ajax({type: "DELETE",
        url: '/category/' + uuid,
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