class AccountMenu extends EditorElement {

	constructor(id) {
		super(id);

		this.searchInputField = new TextInputField(null,
												   null,
												   null,
												   null,
												   null,
												   'Search...',
												   INPUT_FIELD_TYPES.SEARCH,
												   true,
												   false,
												   true,
												   null);
	}

	init() {
		let accountMenu = this;
		let topNav = document.getElementById(this.id);
		let actionAccount = topNav.querySelector('a.action-account');
		actionAccount.addEventListener('mouseenter', function(ev) {
			ev.preventDefault();
			ev.stopPropagation();
			accountMenu.show();
			return false;
		});
		let nav = topNav.querySelector('li.menu');
		nav.addEventListener('mouseleave', function(ev) {
			ev.preventDefault();
			ev.stopPropagation();
			accountMenu.hide();
			return false;
		});
		actionAccount.addEventListener('click', function(ev) {
			ev.preventDefault();
			ev.stopPropagation();
			accountMenu.toggle();
			return false;
		});
		let actionUserProfile = topNav.querySelector('a.action-user-profile');
		actionUserProfile.addEventListener('click', function(ev) {
			ev.preventDefault();
			ev.stopPropagation();
			return false;
		});
		let actionAccountSettings = topNav.querySelector('a.action-account-settings');
		actionAccountSettings.addEventListener('click', function(ev) {
			ev.preventDefault();
			ev.stopPropagation();
			return false;
		});
		let actionSignOut = topNav.querySelector('a.action-sign-out');
		actionSignOut.addEventListener('click', function(ev) {
//			Security.fetch('/logoff/' + Security.getLoggedInUserUUID(), {
			Security.fetch('/logoff/', {
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
	}

	load() {
		Security.fetch('/user/' + Security.getLoggedInUserUUID(), {
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
				let editorAccountMenuText = '';
				let profile = data.profile;
				if(profile != undefined && profile != null) {
					let firstName = profile.firstName;
					let lastName = profile.lastName;
					editorAccountMenuText += firstName + ' ' + lastName;
				}
				for(var i=0;i < data.accounts.length;i++) {
					if(data.accounts[i].uuid === Security.getAccountUUID()) {
						editorAccountMenuText += ' @ ' + data.accounts[i].name;
					}
				}
				document.getElementById('account-menu-account-name').textContent = editorAccountMenuText;
			});
		})
		.catch(function(error) {
			
		});
	}

	getDocumentFragment() {
		let template = '<nav class="account-menu">';
		template += '<ul>';
		template += '<li class="menu">';
		template += '<a class="action-account" href="#" title="Account"><span id="account-menu-account-name">Account</span><i class="fa fa-chevron-down chevron"></i></a>';
		template += '<div class="account-menu-dropdown hide">';
		template += '<a class="action-account-settings" href="#" title="Account settings"><i class="fa fa-cogs"></i>&nbsp;Account settings</a>';
		template += '<a class="action-user-profile" href="#" title="Your profile"><i class="fa fa-user"></i>&nbsp;Your profile</a>';
		template += '<a class="action-sign-out" href="#" title="Sign out"><i class="fa fa-sign-out-alt"></i>&nbsp;Sign out</a>';
		template += '</div>';
		template += '</li>';
		template += '<li class="search">';
		template += '</li>';
		template += '</ul>';
		template += '</nav>';
		let myDocumentFragment = document.createRange().createContextualFragment(template);
		myDocumentFragment.querySelector('li.search').appendChild(this.searchInputField.getDocumentFragment());
		let mergedDocumentFragment = super.getDocumentFragment(myDocumentFragment);
		
		return mergedDocumentFragment;
	}

	show() {
		let topNav = document.getElementById(this.id);
		let dropdown = topNav.querySelector('div.account-menu-dropdown');
		dropdown.classList.remove('hide');
		dropdown.classList.add('show');
		let i = topNav.querySelector('a.action-account').querySelector('i.chevron');
		i.classList.remove('fa-chevron-down');
		i.classList.add('fa-chevron-up');
	}

	hide() {
		let topNav = document.getElementById(this.id);
		let dropdown = topNav.querySelector('div.account-menu-dropdown');
		dropdown.classList.add('hide');
		dropdown.classList.remove('show');
		let i = topNav.querySelector('a.action-account').querySelector('i.chevron');
		i.classList.remove('fa-chevron-up');
		i.classList.add('fa-chevron-down');
	}

	toggle() {
		let topNav = document.getElementById(this.id);
		let dropdown = topNav.querySelector('div.account-menu-dropdown');
		if(dropdown.classList.contains('hide')) {
			this.show();
		} else {
			this.hide();
		}
	}
}