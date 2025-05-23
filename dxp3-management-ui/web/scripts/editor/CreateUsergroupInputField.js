class CreateUsergroupInputField extends TextInputField {

	constructor(id, label, placeholder, isTopLevel) {
		super(id,
			  label,
			  'create-usergroup-name-regex',
			  'create-usergroup',
			  null,
			  placeholder,
			  INPUT_FIELD_TYPES.CREATE,
			  true,
			  false,
			  true);
	}
}