class CreatePageInputField extends TextInputField {

	constructor(id, label, placeholder, applicationUUID) {
		super(id,
			  label,
			  'create-page-name',
			  'create-page',
			  null,
			  placeholder,
			  INPUT_FIELD_TYPES.CREATE,
  			  true,
			  false,
			  true);

		this.applicationUUID = applicationUUID;

		this.popup = new CreatePagePopup(null,
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
			console.log('cancel buton');
			thisEditorElement.value = '';
			thisEditorElement.popup.hide();
		});
		this.popup.addEventListener('submit', function(event) {
			console.log('CREATE PAGE INPUT FIELD caught a submit event to create : ' + event.pageName);
			event.pageName = thisEditorElement.value;
			thisEditorElement.popup.showLoading();
			PageDAO.create(thisEditorElement.applicationUUID,
							event.pageName,
							event.isTemplate,
							event.parentUUIDs,
							event.description,
							function(err, result) {
					thisEditorElement.popup.hideLoading();
					if(err) {
						if(err.code === 400) {
			  				thisEditorElement.popup.showWarningMessage(err.message);
		        			thisEditorElement.focus();
			  			} else if(err.code === 409) {
		        			thisEditorElement.popup.showWarningMessage(err.message);
		        			thisEditorElement.focus();
			  			} else {
				        	thisEditorElement.popup.showWarningMessage(err.message);
		        			thisEditorElement.focus();
			  			}
			  			return;
			  		}
//					alert('create successfull');
			  		thisEditorElement.popup.reset();
			  		thisEditorElement.value = '';
			  		if(event.closeOnSuccess) {
//			  			alert('attempt to hide popup: ' + thisEditorElement.popup.id);
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