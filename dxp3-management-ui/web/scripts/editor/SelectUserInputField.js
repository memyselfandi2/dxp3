class SelectUserInputField extends TextInputField {

	constructor(id, label, placeholder, isTopLevel) {
		super(id,
			  label,
			  'select-user-name-regex',
			  'select-user',
			  null,
			  placeholder,
			  INPUT_FIELD_TYPES.SEARCH,
			  true,
			  false,
			  true);
	}
}