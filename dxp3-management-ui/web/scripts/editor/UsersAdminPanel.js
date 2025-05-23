class UsersAdminPanel extends AdminPanel {
	
	constructor(id, name) {
		super(id, name);

		this.selectUserInputField = new SelectUserInputField(null, null, 'Select an user...', true);
		this.createUserInputField = new CreateUserInputField(null, null, 'Create an user...', true);
	}

	getDocumentFragment() {
		let template = '<div class="users-admin-panel">';
		template += '<div class="header">';
		template += 	'<div class="column large">';
		template += 		'<div id="select-user-input-field-and-popup">';
		template += 		'</div>';
		template += 	'</div>';
		template += 	'<div class="column large">';
		template += 		'<div id="create-user-input-field-and-popup">';
		template += 		'</div>';
		template += 	'</div>';
		template += '</div>';
		template += '</div>';
		let myDocumentFragment = document.createRange().createContextualFragment(template);
		let mergedDocumentFragment = super.getDocumentFragment(myDocumentFragment);

		let child = mergedDocumentFragment.querySelector('#select-user-input-field-and-popup');
		child.parentNode.replaceChild(this.selectUserInputField.getDocumentFragment(), child);

		child = mergedDocumentFragment.querySelector('#create-user-input-field-and-popup');
		child.parentNode.replaceChild(this.createUserInputField.getDocumentFragment(), child);

		return mergedDocumentFragment;
	}
}