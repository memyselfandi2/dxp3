$(document).ready(function() {
	var registrationUuid = null;
	var accountUuid = null;
	var tokenId = null;
	var userUuid = null;

	$('#button-register').on('click', function() {
		var _email = $('#register-email').val();
		$.post('/registration/',{emailaddress:_email},
			function(data,status) {
				registrationUuid = data;
			}
		)
		.fail(function(response) {
			alert('failed');
		});
	});

	$('#button-activate').on('click', function() {
		var code1 = $('#activation_code_1').val();
		var code2 = $('#activation_code_2').val();
		var code3 = $('#activation_code_3').val();
		var code4 = $('#activation_code_4').val();
		var code5 = $('#activation_code_5').val();
		var code6 = $('#activation_code_6').val();
		var _code = code1+code2+code3+code4+code5+code6;
		$.post('/activation/',{uuid:registrationUuid,code:_code},
			function(data,status) {
				userUuid = data.userUuid;
				refreshUser(userUuid);
			}
		)
		.fail(function(response) {
			alert('failed');
		});
	});

	$('#button-create-account').on('click', function() {
		var _accountName = $('#account-name').val();
		$.post('/account/',{accountname:_accountName,token:tokenId},
			function(data,status) {
				accountUuid = data.uuid;
				accountName = data.name;
				refreshUser(userUuid);
			}
		)
		.fail(function(response) {
			alert('failed');
		});
	});

	function refreshUser(userUuid) {
		// lets get all the accounts of the user
		$.get('/user/' + userUuid,
			function(data, status) {
				$('#organization_list').empty();
				var accounts = data.accounts;
				var accountNames = [];
				for(var i=0;i < accounts.length;i++) {
					accountNames.push(accounts[i].name);
				}
				accountNames.sort();
				for(var i=0;i < accountNames.length;i++) {
					for(var j=0;j < accounts.length;j++) {
						if(accounts[j].name === accountNames[i]) {
							$('#organization_list').append('<li><a href="#' + accounts[j].uuid + '" class="action_account">' + accountNames[i] + '</a></li>');
							break;
						}
					}
				}
			}
		)
		.fail(function(response) {
			alert('get user failed');	
		});
	}

	$('#organization_list').on('click', '.action_account', function() {
		var accountUuid = $(this).attr('href').substring(1);
		$.post('/accountselection/',{uuid:accountUuid},
			function(data, status) {
				alert('account selected');
				window.location.href = '/editor/';
			}
		)
		.fail(function(response) {

		});
	});
});
