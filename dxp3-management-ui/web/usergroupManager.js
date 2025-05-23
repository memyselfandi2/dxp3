var usergroupManager = {}

jQuery(document).ready(function() {
	usergroupManager.init();
});

usergroupManager.init = function() {
	$('#form-create-usergroup').on('submit', function(ev) {
		ev.preventDefault();
		usergroupManager.createUsergroup();
		return false;
	})
    $('#usergroups-list').on('click', '.action-delete-usergroup', function(ev) {
        ev.preventDefault();
        if(confirm('Are you sure?')) {
            var uuid = $(this).attr('href').substring(1);
            usergroupManager.deleteUsergroup(uuid);
        }
        return false;
    });
	// Attempt to get an initial list of applications
	usergroupManager.list();
}

usergroupManager.createUsergroup = function() {
    var name = $('#form-create-usergroup-name').val();
    securityManager.ajax({type: "POST",
        url: '/usergroup/',
        data: {"name": name},
        dataType: 'json',
        success: function(data) {
            $('#form-create-usergroup-name').val('');
            usergroupManager.list();
        },
        error: function(data) {
        }
    });
}

usergroupManager.list = function() {
    $('#panel-list-usergroups .icon-loading').show();
    $('#usergroups-list>ul').empty();
    securityManager.ajax({type: 'GET',
        url: '/usergroup/',
        dataType: 'json',
        success: function(data) {
            if(data !== undefined && (data !== null) && (data != '')) {
                for(var index in data) {
                    var uuid = data[index].uuid;
                    var usergroupName = data[index].name;
                    $('#usergroups-list>ul').append('<li><a id="action-update-' + uuid + '" class="action-load-usergroup action-list-item" href="#' + uuid + '">' + usergroupName + '</a><a id="action-delete-' + uuid + '" class="action-delete-usergroup" href="#' + uuid + '"><i class="fa fa-trash"></i></a></li>');
                }
            }
            $('#panel-list-usergroups .icon-loading').hide();
        },
        error: function() {
            $('#panel-list-usergroups .icon-loading').hide();
        }
    });
}

usergroupManager.deleteUsergroup = function(uuid) {
    if(uuid === undefined || uuid === null) {
        return;
    }
    securityManager.ajax({type: "DELETE",
        url: '/usergroup/' + uuid,
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