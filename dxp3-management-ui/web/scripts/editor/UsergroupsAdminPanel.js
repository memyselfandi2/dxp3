class UsergroupsAdminPanel extends AdminPanel {
	
	constructor(id, name) {
		super(id, name);

		this.selectUsergroupInputField = new SelectUsergroupInputField(null, null, 'Select an usergroup...', true);
		this.createUsergroupInputField = new CreateUsergroupInputField(null, null, 'Create an usergroup...', true);
	}

	getDocumentFragment() {
		let template = '<div class="usergroups-admin-panel">';
		template += '<div class="header">';
		template += 	'<div class="column large">';
		template += 		'<div id="select-usergroup-input-field-and-popup">';
		template += 		'</div>';
		template += 	'</div>';
		template += 	'<div class="column large">';
		template += 		'<div id="create-usergroup-input-field-and-popup">';
		template += 		'</div>';
		template += 	'</div>';
		template += '</div>';
		template += '</div>';
		let myDocumentFragment = document.createRange().createContextualFragment(template);
		let mergedDocumentFragment = super.getDocumentFragment(myDocumentFragment);

		let child = mergedDocumentFragment.querySelector('#select-usergroup-input-field-and-popup');
		child.parentNode.replaceChild(this.selectUsergroupInputField.getDocumentFragment(), child);

		child = mergedDocumentFragment.querySelector('#create-usergroup-input-field-and-popup');
		child.parentNode.replaceChild(this.createUsergroupInputField.getDocumentFragment(), child);

		return mergedDocumentFragment;
	}
}