class SettingsAdminPanel extends AdminPanel {

	constructor(id, name) {
		super(id, name);
	}

	getDocumentFragment() {
		let template = '';
        template += '<p>Settings!</p>';
		let myDocumentFragment = document.createRange().createContextualFragment(template);
		let mergedDocumentFragment = super.getDocumentFragment(myDocumentFragment);
		return mergedDocumentFragment;
	}
}