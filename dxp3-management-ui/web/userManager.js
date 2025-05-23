var userManager = {}

jQuery(document).ready(function() {
	userManager.init();
});

userManager.init = function() {
	$('#form-create-user').on('submit', function(ev) {
		ev.preventDefault();
		userManager.createUser();
		return false;
	})
    $('#users-list').on('click', '.action-delete-user', function(ev) {
        ev.preventDefault();
        if(confirm('Are you sure?')) {
            var uuid = $(this).attr('href').substring(1);
            userManager.deleteUser(uuid);
        }
        return false;
    });
	// Attempt to get an initial list of applications
	userManager.list();
}

userManager.createUser = function() {
	var emailAddress = $('#form-create-user-email-address').val();
    var userName = $('#form-create-user-user-name').val();
	var firstName = $('#form-create-user-first-name').val();
	var lastName = $('#form-create-user-last-name').val();
    securityManager.ajax({type: "POST",
        url: '/user/',
        data: {"emailaddress": emailAddress,
               "username": userName,
        	   "firstname": firstName,
        	   "lastname": lastName},
        dataType: 'json',
        success: function(data) {
            $('#form-create-user-email-address').val('');
            $('#form-create-user-user-name').val('');
			$('#form-create-user-first-name').val('');
			$('#form-create-user-last-name').val('');
            userManager.list();
        },
        error: function(data) {
        }
    });
}

userManager.list = function() {
    $('#panel-list-users .icon-loading').show();
    $('#users-list>ul').empty();
    securityManager.ajax({type: 'GET',
        url: '/user/',
        dataType: 'json',
        success: function(data) {
            if(data !== undefined && (data !== null) && (data != '')) {
                for(var index in data) {
                    var uuid = data[index].uuid;
                    var userName = data[index].name;
                    $('#users-list>ul').append('<li><a id="action-update-' + uuid + '" class="action-load-user action-list-item" href="#' + uuid + '">' + userName + '</a><a id="action-delete-' + uuid + '" class="action-delete-user" href="#' + uuid + '"><i class="fa fa-trash"></i></a></li>');
                }
            }
            $('#panel-list-users .icon-loading').hide();
        },
        error: function() {
            $('#panel-list-users .icon-loading').hide();
        }
    });
}

userManager.deleteUser = function(uuid) {
    if(uuid === undefined || uuid === null) {
        return;
    }
    securityManager.ajax({type: "DELETE",
        url: '/user/' + uuid,
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