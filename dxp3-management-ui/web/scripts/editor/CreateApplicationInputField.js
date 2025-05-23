class CreateApplicationInputField extends TextInputField {

	constructor(id, label, placeholder) {
		super(id,
			  label,
			  'create-application-name',
			  'create-application',
			  null,
			  placeholder,
			  INPUT_FIELD_TYPES.CREATE,
  			  true,
			  false,
			  true);

		this.popup = new CreateApplicationPopup(id + '-popup',
											   POPUP_SIZES.SMALL,
											   true,
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
		this.popup.addEventListener('cancel', function(event) {
			thisEditorElement.value = '';
			thisEditorElement.popup.hide();
		});
		this.popup.addEventListener('submit', function(event) {
			event.applicationName = thisEditorElement.value;
			thisEditorElement.popup.showLoading();
			ApplicationDAO.create(event.applicationName,
							   event.isTemplate,
							   event.parentUUIDs,
							   event.shortName,
							   event.description,
							   function(applicationUUID, error) {
					thisEditorElement.popup.hideLoading();
					if(error) {
						if(error.code === 400) {
			  				thisEditorElement.popup.showWarningMessage(error.message);
		        			thisEditorElement.focus();
			  			} else if(error.code === 409) {
		        			thisEditorElement.popup.showWarningMessage(error.message);
		        			thisEditorElement.focus();
			  			} else {
				        	thisEditorElement.popup.showWarningMessage(error.message);
		        			thisEditorElement.focus();
			  			}
			  			return;
			  		}
			  		thisEditorElement.popup.reset();
			  		thisEditorElement.value = '';
			  		if(event.closeOnSuccess) {
				  		thisEditorElement.popup.hide();
				  	} else {
				  		thisEditorElement.focus();
				  	}
			   }
		   );
		});
	}

	init() {
		this.popup.init();
		super.init();
	}
}