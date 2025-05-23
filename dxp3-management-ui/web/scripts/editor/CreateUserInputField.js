class CreateUserInputField extends TextInputField {

	constructor(id, label, placeholder, isTopLevel) {
		super(id,
			  label,
			  'create-user-name-regex',
			  'create-user',
			  null,
			  placeholder,
			  INPUT_FIELD_TYPES.CREATE,
			  true,
			  false,
			  true);
	}
}