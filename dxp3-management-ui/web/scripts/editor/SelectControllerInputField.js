class SelectControllerInputField extends TextInputField {

	constructor(id, label, placeholder, isTopLevel, _reference, _dao) {
		super(id,
			  label,
			  'select-controller-name-regex',
			  'select-controller',
			  null,
			  placeholder,
			  INPUT_FIELD_TYPES.DROPDOWN,
			  true,
			  false,
			  false);

		this.reference = _reference;
		this.dao = _dao;
		this.popup = new SelectControllerPopup(this.id + '-popup',
											   POPUP_SIZES.SMALL,
											   isTopLevel,
											   true,
											   true,
											   _reference,
											   _dao);
		this.filterBy = '';
		this.currentValue = '';

		let thisEditorElement = this;
		this.popup.addEventListener('show', function(ev) {
			thisEditorElement.currentValue = thisEditorElement.value;
			thisEditorElement.value = thisEditorElement.filterBy;
			thisEditorElement.popup.refresh();
		});
		this.popup.addEventListener('hide', function(ev) {
			thisEditorElement.value = thisEditorElement.currentValue;
		});

		// this.popup.addEventListener('hide', function(ev) {
		// 	thisEditorElement.currentValue = thisEditorElement.value;
		// 	thisEditorElement.value = '';
		// });
		this.popup.addEventListener('select', function(ev) {
			thisEditorElement.blur();
			thisEditorElement.currentValue = ev.controllerName;
			thisEditorElement.value = ev.controllerName;
			thisEditorElement.uuid = ev.controllerUUID;
			thisEditorElement.dispatchEvent('select', ev);
		});
	}

	init() {
		this.popup.init();
		super.init();
	}
}