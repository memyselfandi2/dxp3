var serverManager = {}

jQuery(document).ready(function() {
	serverManager.init();
});

serverManager.init = function() {
	$('#form-create-server').on('submit', function(ev) {
		ev.preventDefault();
		serverManager.createServer();
		return false;
	})
    $('#servers-list').on('click', '.action-delete-server', function(ev) {
        ev.preventDefault();
        if(confirm('Are you sure?')) {
            var uuid = $(this).attr('href').substring(1);
            serverManager.deleteServer(uuid);
        }
        return false;
    });
	// Attempt to get an initial list of applications
	serverManager.list();
}

serverManager.createServer = function() {
    var data = {};
    data.type = $('#form-create-server-type option:selected').val();
    data.name = $('#form-create-server-name').val();
    if(data.type === 'ftp') {
        data.address = $('#form-create-server-ftp-address').val();
        data.port = $('#form-create-server-ftp-port').val();
        data.username = $('#form-create-server-ftp-username').val();
        data.password = $('#form-create-server-ftp-password').val();
    } else if(data.type === 'local') {
        data.folder = $('#form-create-server-local-folder').val();
    }
    securityManager.ajax({type: "POST",
        url: '/server/',
        data: data,
        dataType: 'json',
        success: function(data) {
            $('#form-create-server-name').val('');
            serverManager.list();
        },
        error: function(data) {
        }
    });
}

serverManager.list = function() {
    $('#panel-list-servers .icon-loading').show();
    $('#servers-list>ul').empty();
    securityManager.ajax({type: 'GET',
        url: '/server/',
        dataType: 'json',
        success: function(data) {
            if(data !== undefined && (data !== null) && (data != '')) {
                for(var index in data) {
                    var uuid = data[index].uuid;
                    var serverName = data[index].name;
                    $('#servers-list>ul').append('<li><a id="action-update-' + uuid + '" class="action-load-server action-list-item" href="#' + uuid + '">' + serverName + '</a><a id="action-delete-' + uuid + '" class="action-delete-server" href="#' + uuid + '"><i class="fa fa-trash"></i></a></li>');
                }
            }
            $('#panel-list-servers .icon-loading').hide();
        },
        error: function() {
            $('#panel-list-servers .icon-loading').hide();
        }
    });
}

serverManager.deleteServer = function(uuid) {
    if(uuid === undefined || uuid === null) {
        return;
    }
    securityManager.ajax({type: "DELETE",
        url: '/server/' + uuid,
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