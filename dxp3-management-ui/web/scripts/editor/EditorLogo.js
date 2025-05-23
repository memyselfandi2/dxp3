class EditorLogo extends EditorElement {

	constructor(id) {
		super(id);
	}

	init() {
		this.addEventListener('click', function(ev) {
			window.location = '/editor/';
		});
	}

	getDocumentFragment() {
		let template = '<div>';
		template += '<a href="#"><img src="/web/images/kaiser_permanente_logo_400px.png"/></a>';
		template += '</div>';
		let myDocumentFragment = document.createRange().createContextualFragment(template);
		let mergedDocumentFragment = super.getDocumentFragment(myDocumentFragment);

		return mergedDocumentFragment;
	}
}