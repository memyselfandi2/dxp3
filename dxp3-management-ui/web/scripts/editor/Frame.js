class Frame extends EditorElement {

	constructor(id) {
		super(id);
	}

	getDocumentFragment(subclassDocumentFragment) {
		let template = '<iframe src=""></iframe>';
		let myDocumentFragment = document.createRange().createContextualFragment(template);
		let mergedDocumentFragment = super.getDocumentFragment(myDocumentFragment);
		return mergedDocumentFragment;
	}

	init() {
		super.init();
	}

	setSrc(url) {
		let frame = document.getElementById(this.id);
		frame.src = url;
	}
}