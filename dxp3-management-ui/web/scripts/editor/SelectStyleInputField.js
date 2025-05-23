class SelectStyleInputField extends TextInputField {

	constructor(id, label, placeholder, isTopLevel, _reference, _dao) {
		super(id,
			  label,
			  'select-style-name-regex',
			  'select-style',
			  null,
			  placeholder,
			  INPUT_FIELD_TYPES.DROPDOWN,
			  true,
			  false,
			  false);

		this.reference = _reference;
		this.dao = _dao;
		this.popup = new SelectStylePopup(this.id + '-popup',
											   POPUP_SIZES.SMALL,
											   isTopLevel,
											   true,
											   true,
											   _reference,
											   _dao);
		// this.currentValue = '';

		let thisEditorElement = this;
		this.popup.addEventListener('show', function(ev) {
			thisEditorElement.popup.refresh();
		});
		// this.popup.addEventListener('hide', function(ev) {
		// 	thisEditorElement.currentValue = thisEditorElement.value;
		// 	thisEditorElement.value = '';
		// });
		this.popup.addEventListener('select', function(ev) {
			thisEditorElement.blur();
			thisEditorElement.value = ev.styleName;
			thisEditorElement.uuid = ev.styleUUID;
			thisEditorElement.dispatchEvent('select', ev);
		});
	}
}