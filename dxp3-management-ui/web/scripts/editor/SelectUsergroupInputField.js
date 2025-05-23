class SelectUsergroupInputField extends TextInputField {

	constructor(id, label, placeholder, isTopLevel) {
		super(id,
			  label,
			  'select-usergroup-name-regex',
			  'select-usergroup',
			  null,
			  placeholder,
			  INPUT_FIELD_TYPES.SEARCH,
			  true,
			  false,
			  true);
	}
}