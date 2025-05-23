class SelectVersionInputField extends TextInputField {

	constructor(id, label, placeholder, isTopLevel) {
		super(id,
			  label,
			  'select-version-name-regex',
			  'select-version',
			  null,
			  placeholder,
			  INPUT_FIELD_TYPES.DROPDOWN,
			  true,
			  false,
			  true);

		// this.popup = new SelectApplicationPopup(this.id + '-popup',
		// 									   POPUP_SIZES.LARGE,
		// 									   isTopLevel,
		// 									   true,
		// 									   true);
		// this.currentValue = '';

		// let thisEditorElement = this;
		// this.popup.addEventListener('show', function(ev) {
		// 	thisEditorElement.value = thisEditorElement.currentValue;
		// 	thisEditorElement.popup.refresh(thisEditorElement.value);
		// });
		// this.popup.addEventListener('hide', function(ev) {
		// 	thisEditorElement.currentValue = thisEditorElement.value;
		// 	thisEditorElement.value = '';
		// });
		// this.popup.addEventListener('select', function(ev) {
		// 	thisEditorElement.blur();
		// 	thisEditorElement.dispatchEvent('select', ev);
		// });
	}
}