class RadioInputField extends InputField {

	constructor(id, label, _subLabel, _name, _classNames, _values, _displayValues, initialValue, hasBorder, hasResetButton, hasClearButton, popup) {
		super(id, label, initialValue, INPUT_FIELD_TYPES.DEFAULT, hasBorder, hasResetButton, hasClearButton, popup);
		// property: subLabel
	    if(_subLabel === undefined) {
	        _subLabel = null;
	    }
	    if(_subLabel != null) {
		    _subLabel = _subLabel.trim();
		}
		this.subLabel = _subLabel;
		// property: name
	    if(_name === undefined || _name === null) {
	        _name = '';
	    }
	    this.name = _name.trim();
		// property: classNames
	    if(_classNames === undefined || _classNames === null) {
	    	this.classNames = [];
	    } else if(Array.isArray(_classNames)) {
			this.classNames = _classNames;	    	
	    } else if(typeof _classNames === "string") {
	    	this.classNames = _classNames.split(',');
	    } else {
	    	this.classNames = [];
	    }
		// property: values
	    if(_values === undefined || _values === null) {
	    	this.values = [];
	    } else if(Array.isArray(_values)) {
			this.values = _values;	    	
	    } else if(typeof _values === "string") {
	    	this.values = _values.split(',');
	    } else {
	    	this.values = [];
	    }
	    // property: displayValues
	    if(_displayValues === undefined || _displayValues === null) {
	    	this.displayValues = [];
	    } else if(Array.isArray(_displayValues)) {
			this.displayValues = _displayValues;	    	
	    } else if(typeof _displayValues === "string") {
	    	this.displayValues = _displayValues.split(',');
	    } else {
	    	this.displayValues = [];
	    }
	}

	getDocumentFragment() {
		let template = '';
	    if(this.subLabel) {
	    	template += '<span>' + this.subLabel + '</span>';
	    }
    	let className = this.classNames[0];
    	let value = this.values[0];
	    template += '<form>';
	    for(var i=0;i < this.classNames.length;i++) {
	        template += '<label><input class="' + this.classNames[i] + '" type="radio" name="' + this.name + '" value="' + this.values[i] + '"';
	        if(this.initialValue === this.values[i]) {
	            template += ' checked';
	        }
	        template += '/>' + this.displayValues[i] + '</label>';
	    }
	    template += '</form>';
		let myDocumentFragment = document.createRange().createContextualFragment(template);
		let mergedDocumentFragment = super.getDocumentFragment(myDocumentFragment);
		let inputField = mergedDocumentFragment.querySelector('.input-field');
		inputField.classList.add('radio-input-field');
		let thisEditorElement = this;
		// Get a reference to all of our buttons.
		let clearButton = inputField.querySelector('.clear-button');
	    let resetButton = inputField.querySelector('.reset-button');
		// Start adding event listeners.
	    inputField.addEventListener('input', function(ev) {
        	console.log('input field input');
			if(clearButton) {
	            if(!thisEditorElement.isChecked()) {
	                clearButton.classList.add('hide');
	            } else {
	                clearButton.classList.remove('hide');
	            }
			}
	        if(resetButton) {
	        	console.log('radio has reset button');
	            if(thisEditorElement.isUpdated()) {
	            	console.log('show reset button');
	                resetButton.classList.remove('hide');
	            } else {
	            	console.log('hide reset button');
	                resetButton.classList.add('hide');
	            }
	        }
            thisEditorElement.dispatchEvent('input', ev);
	    });
	    let allRadioButtons = inputField.querySelectorAll('input[type="radio"]');
	    for(var i=0;i < allRadioButtons.length;i++) {
	        allRadioButtons[i].addEventListener('click', function(ev) {
	        	console.log('radio button click');
	            let inputEvent = new Event('input');
	            inputField.dispatchEvent(inputEvent);
	        });
	    }
		if(clearButton) {
			clearButton.addEventListener('click', function(ev) {
				ev.preventDefault();
				ev.stopPropagation();
				thisEditorElement.clear();
				return false;
			});
		}
	    if(resetButton) {
	        resetButton.addEventListener('click', function(ev) {
	            ev.preventDefault();
	            ev.stopPropagation();
	            thisEditorElement.reset();
	            return false;
	        });
	    }

		return mergedDocumentFragment;
	}

	isChecked() {
		let inputField = document.getElementById(this.id);
		let radioElement = inputField.querySelector('input[type="radio"]:checked');
		return ((radioElement != undefined) && (radioElement != null));
	}
	clear() {
		console.log('radio clear');
		let inputField = document.getElementById(this.id);
		let radioElement = inputField.querySelector('input:checked');
		radioElement.checked = false;
		let inputEvent = new Event('input');
		inputField.dispatchEvent(inputEvent);
	}

	reset() {
		console.log('radio reset');
		let inputField = document.getElementById(this.id);
		let radioButton = inputField.querySelector('input[type="radio"][value="' + this.initialValue + '"]');
		radioButton.checked = true;
		let inputEvent = new Event('input');
		inputField.dispatchEvent(inputEvent);
	}

	isUpdated() {
		let inputField = document.getElementById(this.id);
		let radioElement = inputField.querySelector('input[type="radio"]:checked');
		let currentValue = '';
		if((radioElement != undefined) && (radioElement != null)) {
		    currentValue = radioElement.value;
		}
		console.log('radio currentvalue: ' + currentValue + ' initialvalue: ' + this.initialValue);
		console.log('radio is updated: ' + (currentValue != this.initialValue));
		return (currentValue != this.initialValue);
	}

	get value() {
		let inputField = document.getElementById(this.id);
		let checkedRadioElement = inputField.querySelector('input:checked');
		if(checkedRadioElement === undefined || checkedRadioElement === null) {
			return '';
		}
		return checkedRadioElement.value;
	}

	set value(newValue) {
		console.log('set radio new value: ' + newValue);
		let inputField = document.getElementById(this.id);
		let checkedRadioElement = inputField.querySelector('input:checked');
		if(checkedRadioElement) {
			checkedRadioElement.checked = false;
		}
		let toCheckRadioElement = inputField.querySelector('input[type="radio"][value="' + newValue + '"]');
		if(toCheckRadioElement) {
			toCheckRadioElement.checked = true;
		}
    	console.log('dispatch click inputfield');
		let inputEvent = new Event('input');
		inputField.dispatchEvent(inputEvent);
	}
}