$(document).ready(function() {
	$('#button-submit').on('click', function() {
		// get user name
		var email = $('#signin-email').val();
		// get password
		var passwordValue = $('#signin-password').val();
		$.post('/login',{username:email, password:passwordValue},
			function(data,status) {
				alert(data);
				alert(status);
			}
		)
		.fail(function(response) {
			alert('failed');
		});
	});
});
