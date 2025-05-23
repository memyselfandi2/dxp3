class ApplicationsHomePanel extends Panel {
	constructor(id) {
		super(id, 'Applications');
	}

	getDocumentFragment() {
		let template = '';
		template = '<div>Welcome to the applications panel.</div>';

		let myDocumentFragment = document.createRange().createContextualFragment(template);
		let mergedDocumentFragment = super.getDocumentFragment(myDocumentFragment);

		return mergedDocumentFragment;
	}

	init() {
		super.init();
	}
}