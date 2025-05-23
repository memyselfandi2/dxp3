class CreateStylePopup extends Popup {

	constructor(id, size, isTopLevel, hasBorder, hasMenu) {
		super(id, size, isTopLevel, hasBorder, hasMenu);

		this.styleNameInputField = new TextInputField(null,
													  null,
													  'name',
													  null,
													  null,
													  'Name',
													  INPUT_FIELD_TYPES.DEFAULT,
													  true,
													  false,
													  true);

		this.descriptionInputField = new TextAreaInputField('create-style-description',
			null,
			'description',
			'',
			null,
			'Description',
			INPUT_FIELD_TYPES.DEFAULT,
			true,
			false,
			true);

		let thisEditorElement = this;
		this.styleNameInputField.addEventListener('keyup', function(ev) {
			if(ev.which === 13) {
				let event = {};
				event.styleName = thisEditorElement.styleNameInputField.value;
				event.description = thisEditorElement.descriptionInputField.value;
				event.closeOnSuccess = true;
				thisEditorElement.dispatchEvent('submit', event);
			}
		});
		this.saveButton = new Button(null, 'action-save shade-of-green', 'Save and close', 'fa fa-check', 'Save');
		this.saveButton.addEventListener('click', function() {
			let event = {};
			event.styleName = thisEditorElement.styleNameInputField.value;
			event.description = thisEditorElement.descriptionInputField.value;
			event.closeOnSuccess = true;
			thisEditorElement.dispatchEvent('submit', event);
		});
		this.saveAndNewButton = new Button(null, 'action-save', 'Save and new', 'fa fa-plus', 'Save and new');
		this.saveAndNewButton.addEventListener('click', function() {
			let event = {};
			event.styleName = thisEditorElement.styleNameInputField.value;
			event.description = thisEditorElement.descriptionInputField.value;
			event.closeOnSuccess = false;
			thisEditorElement.dispatchEvent('submit', event);
		});
		this.cancelButton = new Button(null, 'action-cancel shade-of-red', 'Cancel', 'fa fa-times', 'Cancel');
		this.cancelButton.addEventListener('click', function() {
			thisEditorElement.reset();
			let event = {};
			thisEditorElement.dispatchEvent('cancel', event);
		});
		super.addButton(this.saveButton);
		super.addButton(this.saveAndNewButton);
		super.addButton(this.cancelButton);
	}

	select() {
		let clickEvent = new Event('click');
		this.saveButton.dispatchEvent('click', clickEvent);
	}

	getDocumentFragment() {
   		let myDocumentFragment = document.createDocumentFragment();
   		myDocumentFragment.appendChild(this.styleNameInputField.getDocumentFragment());
   		myDocumentFragment.appendChild(this.descriptionInputField.getDocumentFragment());
		let mergedDocumentFragment = super.getDocumentFragment(myDocumentFragment);

		return mergedDocumentFragment;
	}

	reset() {
		this.styleNameInputField.value = '';
		this.descriptionInputField.value = '';
	}

	focus() {
		this.styleNameInputField.focus();
	}

	init() {
		this.styleNameInputField.init();
		this.descriptionInputField.init();		

		super.init();
	}
}