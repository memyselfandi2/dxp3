class DestinationsAdminPanel extends AdminPanel {

	constructor(id, name) {
		super(id, name);
	}

	getDocumentFragment() {
		let template = '';
        template += '<p>Destinations!</p>';
		let myDocumentFragment = document.createRange().createContextualFragment(template);
		let mergedDocumentFragment = super.getDocumentFragment(myDocumentFragment);
		return mergedDocumentFragment;
	}
}