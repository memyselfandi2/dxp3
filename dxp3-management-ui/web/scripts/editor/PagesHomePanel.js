class PagesHomePanel extends Panel {
	constructor(id) {
		super(id, 'Pages');
	}

	getDocumentFragment() {
		let template = '';
		template = '<div>Welcome to the pages panel.</div>';

		let myDocumentFragment = document.createRange().createContextualFragment(template);
		let mergedDocumentFragment = super.getDocumentFragment(myDocumentFragment);

		return mergedDocumentFragment;
	}

	init() {
		super.init();
	}
}