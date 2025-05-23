class ConfirmationPopup extends Popup {

	constructor(id, size) {
		super(id, size, true, true, true);
		let thisEditorElement = this;
		this.yesButton = new Button(null, 'action-confirm shade-of-green', 'Yes', 'fa fa-check', 'Yes');
		this.yesButton.addEventListener('click', function() {
			let event = {};
			thisEditorElement.dispatchEvent('submit', event)
		});
		this.noButton = new Button(null, 'action-cancel shade-of-red', 'No', 'fa fa-times', 'No');
		this.noButton.addEventListener('click', function() {
			let event = {};
			thisEditorElement.dispatchEvent('cancel', event)
		});
		this.confirmationMessage = 'Are you sure?';
		super.addButton(this.yesButton);
		super.addButton(this.noButton);
		super.center();
	}

	getDocumentFragment() {
   		let myDocumentFragment = document.createDocumentFragment();
		let template = '';
   		template += '<div>';
   		template += this.confirmationMessage;
   		template += '</div>';
   		let message = document.createRange().createContextualFragment(template);
   		myDocumentFragment.appendChild(message);
		let mergedDocumentFragment = super.getDocumentFragment(myDocumentFragment);
		return mergedDocumentFragment;
	}

	init() {
		super.init();		
	}
}