class SelectPageInputField extends TextInputField {

	constructor(id, applicationUUID, label, placeholder, isTopLevel) {
		super(id,
			  label,
			  'select-page-name-regex',
			  'select-page',
			  null,
			  placeholder,
			  INPUT_FIELD_TYPES.SEARCH,
			  true,
			  false,
			  true);

		this.applicationUUID = applicationUUID;
		this.popup = new SelectPagePopup(null,
										this.applicationUUID,
									   POPUP_SIZES.LARGE,
									   isTopLevel,
									   true,
									   true);
		this.currentValue = '';

		let thisEditorElement = this;
		this.popup.addEventListener('show', function(ev) {
			thisEditorElement.value = thisEditorElement.currentValue;
			thisEditorElement.popup.refresh(thisEditorElement.value);
		});
		this.popup.addEventListener('hide', function(ev) {
			thisEditorElement.currentValue = thisEditorElement.value;
			thisEditorElement.value = '';
		});
		this.popup.addEventListener('select', function(ev) {
			thisEditorElement.blur();
			thisEditorElement.dispatchEvent('select', ev);
		});
	}
}