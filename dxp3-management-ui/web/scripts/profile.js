let documentReady = function(){
	let registrationUUID = null;
	let accountUUID = null;
	let tokenId = null;
	let userUUID = null;
	let firstName = null;
	let lastName = null;

	document.getElementById('action-cancel-save-user-profile').addEventListener('click', function(ev) {
		setInput('user-profile-first-name', firstName);
		setInput('user-profile-last-name', lastName);
	});
	document.getElementById('welcome-first-name').addEventListener('keyup', function(ev) {
		if(ev.keyCode == 13) {
			let clickEvent = new Event('click');
			document.getElementById('button-save-welcome').dispatchEvent(clickEvent);
		}
	});
	document.getElementById('welcome-first-name').addEventListener('input', function(ev) {
		updateWelcomeButtonState(ev);
	});
	document.getElementById('welcome-last-name').addEventListener('keyup', function(ev) {
		if(ev.keyCode == 13) {
			let clickEvent = new Event('click');
			document.getElementById('button-save-welcome').dispatchEvent(clickEvent);
		}
	});
	document.getElementById('welcome-last-name').addEventListener('input', function(ev) {
		updateWelcomeButtonState(ev);
	});
	document.getElementById('welcome-password').addEventListener('keyup', function(ev) {
		if(ev.keyCode == 13) {
			let clickEvent = new Event('click');
			document.getElementById('button-save-welcome').dispatchEvent(clickEvent);
		}
	});
	document.getElementById('welcome-password').addEventListener('input', function(ev) {
		updateWelcomeButtonState(ev);
	});
	document.getElementById('welcome-password-too').addEventListener('keyup', function(ev) {
		if(ev.keyCode == 13) {
			let clickEvent = new Event('click');
			document.getElementById('button-save-welcome').dispatchEvent(clickEvent);
		}
	});
	document.getElementById('welcome-password-too').addEventListener('input', function(ev) {
		updateWelcomeButtonState(ev);
	});

	document.getElementById('user-profile-first-name').addEventListener('keyup', function(ev) {
		if(ev.keyCode == 13) {
			let clickEvent = new Event('click');
			document.getElementById('button-save-user-profile').dispatchEvent(clickEvent);
		}
	});
	document.getElementById('user-profile-first-name').addEventListener('input', function(ev) {
		updateSaveUserProfileButtonState(ev);
	});
	document.getElementById('user-profile-last-name').addEventListener('keyup', function(ev) {
		if(ev.keyCode == 13) {
			let clickEvent = new Event('click');
			document.getElementById('button-save-user-profile').dispatchEvent(clickEvent);
		}
	});
	document.getElementById('user-profile-last-name').addEventListener('input', function(ev) {
		updateSaveUserProfileButtonState(ev);
	});
	document.getElementById('user-profile-password').addEventListener('keyup', function(ev) {
		if(ev.keyCode == 13) {
			let clickEvent = new Event('click');
			document.getElementById('button-save-user-profile').dispatchEvent(clickEvent);
		}
	});
	document.getElementById('user-profile-password').addEventListener('input', function(ev) {
		updateSaveUserProfileButtonState(ev);
	});
	document.getElementById('user-profile-password-too').addEventListener('keyup', function(ev) {
		if(ev.keyCode == 13) {
			let clickEvent = new Event('click');
			document.getElementById('button-save-user-profile').dispatchEvent(clickEvent);
		}
	});
	document.getElementById('user-profile-password-too').addEventListener('input', function(ev) {
		updateSaveUserProfileButtonState(ev);
	});

	function updateWelcomeButtonState(ev) {
		let _firstName = document.getElementById('welcome-first-name').value;
		_firstName = _firstName.trim();
		let _lastName = document.getElementById('welcome-last-name').value;
		_lastName = _lastName.trim();
		let password = document.getElementById('welcome-password').value;
		password = password.trim();
		let passwordToo = document.getElementById('welcome-password-too').value;
		passwordToo = passwordToo.trim();
		let isActive = false;
		if(_firstName != firstName) {
			isActive = true;
		}
		if(_lastName != lastName) {
			isActive = true;
		}
		if((password.length > 0) || (passwordToo.length > 0)) {
			if(password == passwordToo) {
				isActive = true;
			} else {
				isActive = false;
			}
		}
		if(isActive) {
			let buttonSaveWelcome = document.getElementById('button-save-welcome');
			buttonSaveWelcome.classList.remove('disabled');
			let key = ev.which;
			if(key === 13) {
				let clickEvent = new Event('click');
				buttonSaveWelcome.dispatchEvent(clickEvent);
			}
		} else {
			document.getElementById('button-save-welcome').classList.add('disabled');
		}
	}

	function updateSaveUserProfileButtonState(ev) {
		let _firstName = document.getElementById('user-profile-first-name').value;
		_firstName = _firstName.trim();
		let _lastName = document.getElementById('user-profile-last-name').value;
		_lastName = _lastName.trim();
		let password = document.getElementById('user-profile-password').value;
		password = password.trim();
		let passwordToo = document.getElementById('user-profile-password-too').value;
		passwordToo = passwordToo.trim();
		let isActive = false;
		if(_firstName != firstName) {
			isActive = true;
		}
		if(_lastName != lastName) {
			isActive = true;
		}
		if((password.length > 0) || (passwordToo.length > 0)) {
			if(password == passwordToo) {
				isActive = true;
			} else {
				isActive = false;
			}
		}
		if(isActive) {
			let buttonSaveUserProfile = document.getElementById('button-save-user-profile');
			buttonSaveUserProfile.classList.remove('disabled');
			let key = ev.which;
			if(key === 13) {
				let clickEvent = new Event('click');
				buttonSaveUserProfile.dispatchEvent(clickEvent);
			}
		} else {
			document.getElementById('button-save-user-profile').classList.add('disabled');
		}
	}

	document.getElementById('action-clear-interrupt').addEventListener('click', function(ev) {
		fetch('/user/' + userUUID + '/interrupt/', {
			method: 'DELETE',
			mode: 'cors',
			cache: 'no-cache',
			credentials: 'same-origin',
			headers: {
				'Content-Type': 'application/json'
			},
			redirect: 'follow',
			referrer: 'no-referrer'
		})
		.then(function(response) {
		});
	});

	function saveUserProfile(_firstName, _lastName, _password, _passwordToo, callback) {
		_password = _password.trim();
		_passwordToo = _passwordToo.trim();
		if(_password.length > 0) {
			if(_password != _passwordToo) {
				return;
			}
			fetch('/user/' + userUUID + '/password', {
				method: 'PUT',
				mode: 'cors',
				cache: 'no-cache',
				credentials: 'same-origin',
				headers: {
					'Content-Type': 'application/json'
				},
				redirect: 'follow',
				referrer: 'no-referrer',
				body: JSON.stringify({password:_password})
			})
			.then(function(response) {
				response.json().then(function(data) {
					alert('password changed');
				});
			});
		}
		_firstName = _firstName.trim();
		_lastName = _lastName.trim();
		fetch('/user/' + userUUID + '/profile/', {
			method: 'PUT',
			mode: 'cors',
			cache: 'no-cache',
			credentials: 'same-origin',
			headers: {
				'Content-Type': 'application/json'
			},
			redirect: 'follow',
			referrer: 'no-referrer',
			body: JSON.stringify({firstName:_firstName,lastName:_lastName})
		})
		.then(function(response) {
			response.json().then(function(data) {
				firstName = _firstName;
				lastName = _lastName;
				callback(null);
			});
		});
	}

	document.getElementById('button-save-user-profile').addEventListener('click', function(ev) {
		if(this.classList.contains('disabled')) {
			return;
		}
		let self = this;
		self.classList.add('disabled');
		let loading = this.parentNode.querySelector('div.loading');
		loading.classList.remove('hide');
		let _firstName = document.getElementById('user-profile-first-name').value;
		let _lastName = document.getElementById('user-profile-last-name').value;
		let _password = document.getElementById('user-profile-password').value;
		let _passwordToo = document.getElementById('user-profile-password-too').value;
		saveUserProfile(_firstName, _lastName, _password, _passwordToo,
			function(err) {
				self.classList.remove('disabled');
				loading.classList.add('hide');
				if(err != undefined && err != null) {
				} else {
					showCard('accounts-card');
				}
			}
		);
	});

	document.getElementById('button-save-welcome').addEventListener('click', function(ev) {
		if(this.classList.contains('disabled')) {
			return;
		}
		let self = this;
		self.classList.add('disabled');
		let loading = this.parentNode.querySelector('div.loading');
		loading.classList.remove('hide');
		let _firstName = document.getElementById('welcome-first-name').value;
		let _lastName = document.getElementById('welcome-last-name').value;
		let _password = document.getElementById('welcome-password').value;
		let _passwordToo = document.getElementById('welcome-password-too').value;
		saveUserProfile(_firstName, _lastName, _password, _passwordToo,
			function(err) {
				self.classList.remove('disabled');
				loading.classList.add('hide');
				if(err != undefined && err != null) {
				} else {
					showCard('accounts-card');
				}
			}
		);
	});

	let actionShowCard = document.getElementsByClassName('action-show-card');
	for(let i=0;i < actionShowCard.length;i++) {
		actionShowCard[i].addEventListener('click', function(ev) {
			ev.preventDefault();
			let cardId = this.getAttribute('href').substring(1);
			showCard(cardId);
		});
	}

	document.getElementById('action-sign-out').addEventListener('click', function(ev) {
//		fetch('/logoff/' + userUUID, {
		fetch('/logoff/', {
			method: 'DELETE',
			mode: 'cors',
			cache: 'no-cache',
			credentials: 'same-origin',
			headers: {
				'Content-Type': 'application/json'
			},
			redirect: 'follow',
			referrer: 'no-referrer'
		})
		.then(function(response) {
			window.location.href = '/';
		});
	});

	document.getElementById('account-name').addEventListener('input', function(ev) {
		if(ev.keyCode == 13) {
			let accountName = this.value;
			if(accountName.length <= 0) {
				return;
			}
			let clickEvent = new Event('click');
			document.getElementById('button-create-account').dispatchEvent(clickEvent);
		}
	});

	document.getElementById('action-account').addEventListener('mouseenter', function(ev) {
		ev.preventDefault();
		ev.stopPropagation();
		showAccountMenu();
	});

	document.getElementById('account-menu').addEventListener('mouseleave', function(ev) {
		ev.preventDefault();
		ev.stopPropagation();
		hideAccountMenu();
	});

	document.getElementById('action-account').addEventListener('click', function(ev) {
		ev.preventDefault();
		ev.stopPropagation();
		toggleAccountMenu();
	});

	function showAccountMenu() {
		let accountMenu = document.getElementById('account-menu-popup');
		accountMenu.classList.remove('hide');
		accountMenu.classList.add('show');
		let i = document.getElementById('action-account').querySelector('i.chevron');
		i.classList.remove('fa-chevron-down');
		i.classList.add('fa-chevron-up');
	}

	function hideAccountMenu() {
		let accountMenu = document.getElementById('account-menu-popup');
		accountMenu.classList.add('hide');
		accountMenu.classList.remove('show');
		let i = document.getElementById('action-account').querySelector('i.chevron');
		i.classList.remove('fa-chevron-up');
		i.classList.add('fa-chevron-down');
	}

	function toggleAccountMenu() {
		let accountMenu = document.getElementById('account-menu-popup');
		if(accountMenu.classList.contains('hide')) {
			showAccountMenu();
		} else {
			hideAccountMenu();
		}
	}

	function refreshUser() {
		let cookies = document.cookie;
		let cookieArray = cookies.split(';')
		for(let i=0;i < cookieArray.length;i++) {
			let cookie = cookieArray[i];
			cookie = cookie.trim();
			if(cookie.indexOf('user=') === 0) {
				userUUID = cookie.split('=')[1];
				break;
			}
		}
		fetch('/user/' + userUUID, {
			method: 'GET',
			mode: 'cors',
			cache: 'no-cache',
			credentials: 'same-origin',
			headers: {
				'Content-Type': 'application/json'
			},
			redirect: 'follow',
			referrer: 'no-referrer'
		})
		.then(function(response) {
			response.json().then(function(data) {
				if(data.profile.interrupt === 'yes') {
					showCard('welcome-card');
				} else {
					showCard('accounts-card');
				}
				// Profile
				firstName = data.profile.firstName;
				lastName = data.profile.lastName;
				setInput('welcome-first-name', firstName);
				setInput('welcome-last-name', lastName);
				setInput('user-profile-first-name', firstName);
				setInput('user-profile-last-name', lastName);
				let organizations = document.getElementById('organization_list');
				let organization = organizations.firstChild;
				while (organization) {
					organizations.removeChild(organization);
				    organization = organizations.firstChild;
				}
				let accounts = data.accounts;
				let accountNames = [];
				if(accounts === undefined || accounts === null) {
					accounts = [];
				}
				for(let i=0;i < accounts.length;i++) {
					accountNames.push(accounts[i].name);
				}
				accountNames.sort();
				for(let i=0;i < accountNames.length;i++) {
					for(let j=0;j < accounts.length;j++) {
						if(accounts[j].name === accountNames[i]) {
							let liElement = document.createElement('li');
							let aElement = document.createElement('a');
							aElement.setAttribute('href', '#' + accounts[j].uuid);
							aElement.setAttribute('class', 'action_account');
							let aContent = document.createTextNode(accountNames[i]);
							aElement.appendChild(aContent);
							liElement.appendChild(aElement);
							organizations.appendChild(liElement);
							aElement.addEventListener('click', function() {
								let accountUUID = this.getAttribute('href').substring(1);
								fetch('/accountselection/', {
									method: 'POST',
									mode: 'cors',
									cache: 'no-cache',
									credentials: 'same-origin',
									headers: {
										'Content-Type': 'application/json'
									},
									redirect: 'follow',
									referrer: 'no-referrer',
									body: JSON.stringify({uuid:accountUUID})
								})
								.then(function(response) {
									if(response.status != 200) {
										let accountErrorMessage = document.getElementById('account-error-message');
										let messageContent = accountErrorMessage.querySelector('.message-content');
										messageContent.innerHTML = 'This name is unfortunately already in use.';
										accountErrorMessage.classList.remove('hide');
										window.setTimeout(function() {
											document.getElementById('account-error-message').classList.add('hide');
										}, 2000);
										document.getElementById('account-name').focus();
										return;
									}
									window.location.href = '/editor/';
								})
								.catch(function(error) {
									alert(error.message);
								});
							});
							break;
						}
					}
				}
			});
		})
		.catch(function(error) {
			alert(error.message);
		});
	}

	let allInputContainerInputs = document.querySelectorAll('.input-container input');
	for(let i=0;i < allInputContainerInputs.length;i++) {
		allInputContainerInputs[i].addEventListener('input', function(ev) {
			let value = this.value;
			if(value === undefined || value === null) {
				return;
			}
			let parentNode = this.parentNode;
			let clearButton = parentNode.querySelector('button.clear-button');
			if(value.length > 0) {
				clearButton.classList.remove('hide');
			} else {
				clearButton.classList.add('hide');				
			}
		})
	}

	let clearButtons = document.getElementsByClassName('clear-button');
	for(let i=0;i < clearButtons.length;i++) {
		clearButtons[i].addEventListener('click', function(ev) {
			ev.preventDefault();
			let input = this.parentNode.querySelector('input');
			setInput(input, '');
			let inputEvent = new Event('input');
			input.dispatchEvent(inputEvent);
			input.focus();
		});
	}

	document.getElementById('account-name').addEventListener('keyup', function(ev) {
		if(ev.keyCode == 13) {
			let clickEvent = new Event('click');
			document.getElementById('button-create-account').dispatchEvent(clickEvent);
		}
	});		

	document.getElementById('account-name').addEventListener('input', function(ev) {
		ev.preventDefault();
		let accountName = this.value;
		if(accountName.length > 0) {
			document.getElementById('button-create-account').classList.remove('disabled');
		} else {
			document.getElementById('button-create-account').classList.add('disabled');
			this.parentNode.querySelector('.clear-button').classList.add('hide')
		}
	});

	document.getElementById('button-create-account').addEventListener('click', function(ev) {
		ev.preventDefault();
		if(this.classList.contains('disabled')) {
			return;
		}
		let self = this;
		self.classList.add('disabled');
		let loading = this.parentNode.querySelector('div.loading');
		loading.classList.remove('hide');
		let _accountName = document.getElementById('account-name').value;
		fetch('/account/', {
			method: 'POST',
			mode: 'cors',
			cache: 'no-cache',
			credentials: 'same-origin',
			headers: {
				'Content-Type': 'application/json'
			},
			redirect: 'follow',
			referrer: 'no-referrer',
			body: JSON.stringify({accountname:_accountName,token:tokenId})
		})
		.then(function(response) {
			self.classList.remove('disabled');
			loading.classList.add('hide');
			if(response.status === 409) {
				let accountErrorMessage = document.getElementById('account-error-message');
				let messageContent = accountErrorMessage.querySelector('.message-content');
				messageContent.innerHTML = 'This name is unfortunately already in use.';
				accountErrorMessage.classList.remove('hide');
				window.setTimeout(function() {
					document.getElementById('account-error-message').classList.add('hide');
				}, 2000);
				document.getElementById('account-name').focus();
				return;
			} else if(response.status != 200) {
				let accountErrorMessage = document.getElementById('account-error-message');
				let messageContent = accountErrorMessage.querySelector('.message-content');
				messageContent.innerHTML = 'Something went wrong. Please try again later.';
				accountErrorMessage.classList.remove('hide');
				window.setTimeout(function() {
					document.getElementById('account-error-message').classList.add('hide');
				}, 2000);
				document.getElementById('account-name').focus();
				return;
			}
			setInput('account-name', '');
			response.json().then(function(data) {
				accountUUID = data.uuid;
				accountName = data.name;
				refreshUser(userUUID);
			});
		})
		.catch(function(error) {
			alert(error.message);
		});
	});

	let visibleCardId = null;

	function setInput(input, value) {
		if(value === undefined || value === null) {
			value = '';
		}
		let element = input;
		if(typeof input === 'string') {
			element = document.getElementById(input);
		}
		element.value = value;
		clearButton = element.parentNode.querySelector('.clear-button');
		if(clearButton) {
			if(value.length <= 0) {
				clearButton.classList.add('hide');
			} else {
				clearButton.classList.remove('hide');
			}
		}
	}

	function showCard(cardId) {
		let card = document.getElementById(cardId);
		if(visibleCardId === null) {
			card.classList.remove('hidden');
			card.classList.add('show');
		} else {
			// Hide the current shown card
			let visibleCard = document.getElementById(visibleCardId)
			visibleCard.classList.remove('show');
			visibleCard.classList.add('hide');
			let inputs = visibleCard.querySelectorAll('input.clear-on-hide');
			for(let i=0;i < inputs.length;i++) {
				setInput(inputs[i], '');
			}
			let buttons = visibleCard.querySelectorAll('button.clear-on-hide');
			for(let i=0;i < buttons.length;i++) {
				buttons[i].classList.add('disabled');
			}
			// Show the new card
			let card = document.getElementById(cardId);
			card.classList.remove('hidden');
			card.classList.remove('hide');
			card.classList.add('show');
		}
		let input = card.querySelector('input');
		input.focus();
		visibleCardId = cardId;
	}

	refreshUser();
};

if((document.readyState === "complete") ||
   (document.readyState !== "loading" && !document.documentElement.doScroll)) {
	documentReady();
} else {
	document.addEventListener("DOMContentLoaded", documentReady);
}