class ImageInputField extends InputField {

	constructor(id, label, _name, _className, initialValue, type, hasBorder, hasResetButton, hasClearButton, popup) {
		super(id, label, initialValue, INPUT_FIELD_TYPES.SEARCH, hasBorder, hasResetButton, hasClearButton, popup);
		// property: name
	    if(_name === undefined || _name === null) {
	        _name = '';
	    }
	    this.name = _name.trim();
		// property: className
	    if(_className === undefined || _className === null) {
	        _className = '';
	    }
	    this.className = _className.trim();

	    this.popup = new ImagesPopup(this.id + '-popup',
								   POPUP_SIZES.LARGE,
								   true,
								   true,
								   true);
	}

	getDocumentFragment(subclassDocumentFragment) {
		let template = '<img width="40" src="' + this.initialValue + '"/>';
		let myDocumentFragment = document.createRange().createContextualFragment(template);
		let mergedDocumentFragment = super.getDocumentFragment(myDocumentFragment);
		let inputField = mergedDocumentFragment.querySelector('.input-field');
		inputField.classList.add('image-input-field');

		return mergedDocumentFragment;
	}

	preview(file) {
		let inputField = document.getElementById(this.id);
		let image = inputField.querySelector('img');
		image.src = window.URL.createObjectURL(file);

	}
	init() {
		let thisImageInputField = this;
		let dropArea = document.getElementById(this.id);
		dropArea.addEventListener('dragenter', function(ev) {
			ev.preventDefault();
			ev.stopPropagation();
			thisImageInputField.highlight();
			console.log('dragenter');
			return false;
		});
		dropArea.addEventListener('dragleave', function(ev) {
			ev.preventDefault();
			ev.stopPropagation();
			thisImageInputField.unhighlight();
			console.log('dragleave');
			return false;
		});
		dropArea.addEventListener('dragover', function(ev) {
			ev.preventDefault();
			ev.stopPropagation();
			thisImageInputField.highlight();
			console.log('dragover');
			return false;
		});
		dropArea.addEventListener('drop', function(ev) {
			ev.preventDefault();
			ev.stopPropagation();

			thisImageInputField.unhighlight();
			let dataTransfer = ev.dataTransfer;
			let files = dataTransfer.files;
			([...files]).forEach(function(file) {
				let url = 'YOUR URL HERE'
				let formData = new FormData()

				formData.append('file', file)

				thisImageInputField.preview(file);

				fetch(url, {
					method: 'POST',
					body: formData
				})
				.then(() => {
					alert('done uploading');
				 /* Done. Inform the user */
				})
				.catch(() => {
					alert('error uploading');
				 /* Error. Inform the user */
				})
			});
			return false;
		});
	}

	isUpdated() {
		// let input = document.getElementById(this.id).querySelector('input[type="text"]');
		// return input.value != this.initialValue;
		return false;
	}

	clear() {
		let input = document.getElementById(this.id).querySelector('input[type="text"]');
		input.value = '';
		var inputEvent = new Event('input');
		input.dispatchEvent(inputEvent);
	}

	reset() {
		// let input = document.getElementById(this.id).querySelector('input[type="text"]');
		// input.value = this.initialValue;
		// let inputEvent = new Event('input');
		// input.dispatchEvent(inputEvent);
	}

	get value() {
		let input = document.getElementById(this.id).querySelector('input[type="text"]');
		return input.value;
	}

	set value(newValue) {
		let input = document.getElementById(this.id).querySelector('input[type="text"]');
		input.value = newValue;
		let inputEvent = new Event('input');
		input.dispatchEvent(inputEvent);
	}

	focus() {
		document.getElementById(this.id).querySelector('input[type="text"]').focus();
	}

	blur() {
		document.getElementById(this.id).querySelector('input[type="text"]').blur();
	}
}