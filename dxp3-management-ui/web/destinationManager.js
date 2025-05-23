var destinationManager = {}

jQuery(document).ready(function() {
	destinationManager.init();
});

destinationManager.init = function() {
	$('#form-create-destination').on('submit', function(ev) {
		ev.preventDefault();
		destinationManager.createDestination();
		return false;
	})
    $('#destinations-list').on('click', '.action-delete-destination', function(ev) {
        ev.preventDefault();
        if(confirm('Are you sure?')) {
            var uuid = $(this).attr('href').substring(1);
            destinationManager.deleteDestination(uuid);
        }
        return false;
    });
	// Attempt to get an initial list of applications
	destinationManager.list();
}

destinationManager.createDestination = function() {
    var data = {};
    data.name = $('#form-create-destination-name').val();
    data.description = $('#form-create-destination-description').val();
    data.domain = $('#form-create-destination-domain').val();
    data.serverUuid = $('#form-create-destination-server-uuid').val();
    securityManager.ajax({type: "POST",
        url: '/destination/',
        data: data,
        dataType: 'json',
        success: function(data) {
            $('#form-create-destination-name').val('');
            $('#form-create-destination-description').val('');
            $('#form-create-destination-domain').val('');
            $('#form-create-destination-server').val('');
            $('#form-create-destination-server-uuid').val('');
            destinationManager.list();
        },
        error: function(data) {
        }
    });
}

destinationManager.list = function() {
    $('#panel-list-destinations .icon-loading').show();
    $('#destinations-list>ul').empty();
    securityManager.ajax({type: 'GET',
        url: '/destination/',
        dataType: 'json',
        success: function(data) {
            if(data !== undefined && (data !== null) && (data != '')) {
                for(var index in data) {
                    var uuid = data[index].uuid;
                    var destinationName = data[index].name;
                    var domain = data[index].domain;
                    var server = data[index].serverUuid;
                    $('#destinations-list>ul').append(
                        '<li>'+
                        '<a id="action-update-' + uuid + '" class="action-load-destination action-list-item" href="#' + uuid + '">' + destinationName + '</a>' +
                        '<a id="action-update-' + uuid + '" class="action-load-destination action-list-item" href="#' + uuid + '">' + domain + '</a>' +
                        '<a id="action-delete-' + uuid + '" class="action-delete-destination" href="#' + uuid + '"><i class="fa fa-trash"></i></a>' +
                        '</li>');
                }
            }
            $('#panel-list-destinations .icon-loading').hide();
        },
        error: function() {
            $('#panel-list-destinations .icon-loading').hide();
        }
    });
}

destinationManager.deleteDestination = function(uuid) {
    if(uuid === undefined || uuid === null) {
        return;
    }
    securityManager.ajax({type: "DELETE",
        url: '/destination/' + uuid,
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