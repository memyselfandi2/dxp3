var accountManager = {}

jQuery(document).ready(function() {
	accountManager.init();
});

accountManager.init = function() {
	$('#action-sign-out').on('click', function(ev) {
		ev.preventDefault();
		accountManager.signOut();
		return false;
	});
}

accountManager.signOut = function() {
    securityManager.ajax({type: 'DELETE',
    	async: true,
        url: '/signout/',
        dataType: 'json',
        success: function(data) {
			document.location.href = '/';
        },
        error: function() {
			document.location.href = '/';
        }
    });
}