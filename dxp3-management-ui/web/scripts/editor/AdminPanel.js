class AdminPanel extends Panel {

	constructor(id, name) {
		// is initially hidden and has no border.
		super(id, name, true, false);
	}

	getDocumentFragment(subclassDocumentFragment) {
		let myDocumentFragment = null;
		if((subclassDocumentFragment != undefined) && (subclassDocumentFragment != null)) {
			let rootElement = subclassDocumentFragment.firstChild;
			if((rootElement != undefined) && (rootElement != null)) {
				rootElement.classList.add('admin-panel');
			}
			myDocumentFragment = subclassDocumentFragment;
		} else {
			let template = '<div class="admin-panel"></div>';
			myDocumentFragment = document.createRange().createContextualFragment(template);
		}
		let mergedDocumentFragment = super.getDocumentFragment(myDocumentFragment);
		return mergedDocumentFragment;
	}

	init() {
		super.init();
	}
}