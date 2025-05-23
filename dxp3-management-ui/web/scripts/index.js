var documentReady = function(){
	var registrationUUID = null;
	var accountUUID = null;
	var tokenId = null;
	var userUUID = null;

	document.getElementById('register-email').addEventListener('keyup', function(ev) {
		if(ev.keyCode == 13) {
			var email = this.value;
			if(email.length <= 0) {
				return;
			}
			var clickEvent = new Event('click');
			document.getElementById('button-register').dispatchEvent(clickEvent);
		}
	});

	function emailIsValid(text) {
		if(text === undefined || text === null) {
			return false;
		}
		text = text.trim();
		// Make sure an email address has a minimum length of 5
		// For example: a@b.c
		if(text.length < 5) {
			return false;
		}
		// An email address is not allowed to contain whitespace
		if(text.indexOf(' ') >= 0) {
			return false;
		}
		var lastIndexOfPeriod = text.lastIndexOf('.');
		var indexOfAt = text.indexOf('@');
		var lastIndexOfAt = text.lastIndexOf('@');
		// Make sure there is at least one period
		if(lastIndexOfPeriod < 0) {
			return false;
		}
		// Make sure there is at least one @ and
		// it is not the first character
		if(indexOfAt <= 0) {
			return false;
		}
		// Make sure there is at most one @
		if(indexOfAt != lastIndexOfAt) {
			return false;
		}
		// Make sure the period comes after the at
		if(lastIndexOfPeriod < indexOfAt) {
			return false;
		}
		// Make sure the period is not the last character
		if(lastIndexOfPeriod === (text.length - 1)) {
			return false;
		}
		return true;
	}

	function nextInput(element) {
		var currentInput = element.id;
		var index = currentInput.substring(16);
		index = parseInt(index);
		index++;
		if(index <= 6) {
			var inputId = 'activation_code_' + index;
			var newInput = document.getElementById(inputId);
			newInput.focus();
			newInput.select();
		}
		var hasEmptyValue = false;
		var allInputs = document.getElementsByClassName('inline_input');
		for(var i=0;i < allInputs.length;i++) {
			var inputValue = allInputs[i].value;
			inputValue = inputValue.trim();
			if(inputValue.length <= 0) {
				hasEmptyValue = true;
			}
		}
		var activateButton = document.getElementById('button-activate');
		if(hasEmptyValue) {
			activateButton.classList.add('disabled');
		} else {
			activateButton.classList.remove('disabled');
			if(index > 6) {
				activateButton.focus();
			}
		}
	}

	var inlineInputs = document.getElementsByClassName('inline_input');
	for(var i=0;i < inlineInputs.length;i++) {
		inlineInputs[i].addEventListener('input', function(ev) {
			nextInput(this);
		});
	}

	function refreshUser() {
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
				alert(data);
				let organizations = document.getElementById('organization_list');
				let organization = organizations.firstChild;
				while (organization) {
					organizations.removeChild(organization);
				    organization = organizations.firstChild;
				}
				var accounts = data.accounts;
				var accountNames = [];
				for(var i=0;i < accounts.length;i++) {
					accountNames.push(accounts[i].name);
				}
				accountNames.sort();
				for(var i=0;i < accountNames.length;i++) {
					for(var j=0;j < accounts.length;j++) {
						if(accounts[j].name === accountNames[i]) {
							organizations.append('<li><a href="#' + accounts[j].uuid + '" class="action_account">' + accountNames[i] + '</a></li>');
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

	var visibleCardId = null;

	function showCard(cardId) {
		var card = document.getElementById(cardId);
		if(visibleCardId === null) {
			card.classList.remove('hidden');
			card.classList.add('show');
		} else {
			// Hide the current shown card
			var visibleCard = document.getElementById(visibleCardId)
			visibleCard.classList.remove('show');
			visibleCard.classList.add('hide');
			var inputs = visibleCard.querySelectorAll('input.clear-on-hide');
			for(var i=0;i < inputs.length;i++) {
				setInput(inputs[i], '');
			}
			var buttons = visibleCard.querySelectorAll('button.clear-on-hide');
			for(var i=0;i < buttons.length;i++) {
				buttons[i].classList.add('disabled');
			}
			// Show the new card
			var card = document.getElementById(cardId);
			card.classList.remove('hidden');
			card.classList.remove('hide');
			card.classList.add('show');
		}
		var input = card.querySelector('input');
		input.focus();
		visibleCardId = cardId;
	}

	document.getElementById('signin-email').addEventListener('keyup', function(ev) {
		ev.preventDefault();
		var email = document.getElementById('signin-email').value;
		if(emailIsValid(email)) {
			document.getElementById('button-signin').classList.remove('disabled');
			if(ev.keyCode == 13) {
				var clickEvent = new Event('click');
				document.getElementById('button-signin').dispatchEvent(clickEvent);
			}
		} else {
			document.getElementById('button-signin').classList.add('disabled');
		}
	});

	document.getElementById('signin-password').addEventListener('keyup', function(ev) {
		ev.preventDefault();
		if(ev.keyCode == 13) {
			var clickEvent = new Event('click');
			document.getElementById('button-signin').dispatchEvent(clickEvent);
		}
	});

	document.getElementById('button-signin').addEventListener('click', function(ev) {
		ev.preventDefault();
		var email = document.getElementById('signin-email').value;
		if(!emailIsValid(email)) {
			setErrorMessage('signin-error-message', 'Unable to sign in.');
			document.getElementById('signin-email').focus();
			return;
		}
		if(this.classList.contains('disabled')) {
			return;
		}
		let self = this;
		self.classList.add('disabled');
		var loading = this.parentNode.querySelector('div.loading');
		loading.classList.remove('hide');
		var _password = document.getElementById('signin-password').value;
		fetch('/login/', {
			method: 'POST',
			mode: 'cors',
			cache: 'no-cache',
			credentials: 'same-origin',
			headers: {
				'Content-Type': 'application/json'
			},
			redirect: 'follow',
			referrer: 'no-referrer',
			body: JSON.stringify({emailAddress:email,password:_password})
		})
		.then(function(response) {
			self.classList.remove('disabled');
			loading.classList.add('hide');
			if(response.status != 200) {
				setErrorMessage('signin-error-message', 'Unable to login. Please validate your email address and password and try again.');
				return;
			}
			response.json().then(function(data) {
				userUUID = data.userUUID;
				window.location.href = '/profile/';
			});
		})
		.catch(function(error) {
			alert(error.message);
		});
	});

	document.getElementById('reset-email').addEventListener('keyup', function(ev) {
		ev.preventDefault();
		var email = document.getElementById('reset-email').value;
		if(emailIsValid(email)) {
			document.getElementById('button-reset').classList.remove('disabled');
			if(ev.keyCode == 13) {
				var clickEvent = new Event('click');
				document.getElementById('button-reset').dispatchEvent(clickEvent);
			}
		} else {
			document.getElementById('button-reset').classList.add('disabled');
		}
	});

	document.getElementById('button-reset').addEventListener('click', function(ev) {
		ev.preventDefault();
		var email = document.getElementById('reset-email').value;
		if(!emailIsValid(email)) {
			setErrorMessage('reset-error-message', 'This is not a valid email address.');
			document.getElementById('reset-email').focus();
			return;
		}
		if(this.classList.contains('disabled')) {
			return;
		}
		let self = this;
		self.classList.add('disabled');
		var _email = document.getElementById('reset-email').value;
		var loading = this.parentNode.querySelector('div.loading');
		loading.classList.remove('hide');
		fetch('/registration/', {
			method: 'POST',
			mode: 'cors',
			cache: 'no-cache',
			credentials: 'same-origin',
			headers: {
				'Content-Type': 'application/json'
			},
			redirect: 'follow',
			referrer: 'no-referrer',
			body: JSON.stringify({emailaddress:_email})
		})
		.then(function(response) {
			self.classList.remove('disabled');
			loading.classList.add('hide');
			if(response.status === 500) {
				setErrorMessage('reset-error-message', 'Server error. Please try again later.');
				return;
			}
			response.text().then(function(text) {
				registrationUUID = text;
				showCard('activation-card');
			});
		})
		.catch(function(error) {
			alert(error.message);
		});
	});

	var allInputContainerInputs = document.querySelectorAll('.input-container input');
	for(var i=0;i < allInputContainerInputs.length;i++) {
		allInputContainerInputs[i].addEventListener('input', function(ev) {
			var value = this.value;
			if(value === undefined || value === null) {
				return;
			}
			var parentNode = this.parentNode;
			var clearButton = parentNode.querySelector('button.clear-button');
			if(value.length > 0) {
				clearButton.classList.remove('hide');
			} else {
				clearButton.classList.add('hide');				
			}
		})
	}
	document.getElementById('button-activate').addEventListener('click', function(ev) {
		ev.preventDefault();
		if(this.classList.contains('disabled')) {
			return;
		}
		var loading = this.parentNode.querySelector('div.loading');
		loading.classList.remove('hide');
		var code1 = document.getElementById('activation_code_1').value;
		var code2 = document.getElementById('activation_code_2').value;
		var code3 = document.getElementById('activation_code_3').value;
		var code4 = document.getElementById('activation_code_4').value;
		var code5 = document.getElementById('activation_code_5').value;
		var code6 = document.getElementById('activation_code_6').value;
		var _code = code1+code2+code3+code4+code5+code6;
		fetch('/activation/', {
			method: 'POST',
			mode: 'cors',
			cache: 'no-cache',
			credentials: 'same-origin',
			headers: {
				'Content-Type': 'application/json'
			},
			redirect: 'follow',
			referrer: 'no-referrer',
			body: JSON.stringify({uuid:registrationUUID,code:_code})
		})
		.then(function(response) {
			loading.classList.add('hide');
			if(response.status === 401) {
				setErrorMessage('activation-error-message', 'Unfortunately this does not seem to be the right activation code.');
				return;
			}
			response.json().then(function(data) {
				userUUID = data.userUUID;
				window.location.href = '/profile/';
			});
		})
		.catch(function(error) {
			alert(error.message);
		});
	});

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

	function setErrorMessage(theId, theMessage) {
			var theElement = document.getElementById(theId)
			var theMessageContent = theElement.querySelector('.message-content');
			theMessageContent.innerHTML = theMessage;
			theElement.classList.remove('hide');
			window.setTimeout(function() {
				document.getElementById(theId).classList.add('hide');
			}, 3000);
	}
	document.getElementById('button-register').addEventListener('click', function(ev) {
		ev.preventDefault();
		var email = document.getElementById('register-email').value;
		if(!emailIsValid(email)) {
			setErrorMessage('registration-error-message', 'This is not a valid email address.');
			document.getElementById('register-email').focus();
			return;
		}
		let self = this;
		var _email = document.getElementById('register-email').value;
		self.classList.add('disabled');
		var loading = this.parentNode.querySelector('div.loading');
		loading.classList.remove('hide');
		fetch('/registration/', {
			method: 'POST',
			mode: 'cors',
			cache: 'no-cache',
			credentials: 'same-origin',
			headers: {
				'Content-Type': 'application/json'
			},
			redirect: 'follow',
			referrer: 'no-referrer',
			body: JSON.stringify({emailaddress:_email})
		})
		.then(function(response) {
			self.classList.remove('disabled');
			loading.classList.add('hide');
			if(response.status === 500) {
				setErrorMessage('registration-error-message', 'Server error. Please try again later.');
				return;
			}
			response.text().then(function(text) {
				registrationUUID = text;
				showCard('activation-card');
			});
		})
		.catch(function(error) {
			alert(error.message);
		});
	});

	var actionShowCard = document.getElementsByClassName('action-show-card');
	for(var i=0;i < actionShowCard.length;i++) {
		actionShowCard[i].addEventListener('click', function(ev) {
			ev.preventDefault();
			var cardId = this.getAttribute('href').substring(1);
			showCard(cardId);
		});
	}

	var clearButtons = document.getElementsByClassName('clear-button');
	for(var i=0;i < clearButtons.length;i++) {
		clearButtons[i].addEventListener('click', function(ev) {
			ev.preventDefault();
			let input = this.parentNode.querySelector('input');
			setInput(input, '');
			var inputEvent = new Event('input');
			input.dispatchEvent(inputEvent);
			input.focus();
		});
	}

	showCard('registration-card');
};

if((document.readyState === "complete") ||
   (document.readyState !== "loading" && !document.documentElement.doScroll)) {
	documentReady();
} else {
	document.addEventListener("DOMContentLoaded", documentReady);
}