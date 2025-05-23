const INPUT_FIELD_TYPES = {
	CREATE: "Create",
	DEFAULT: "Default",
	DROPDOWN: "Dropdown",
	EDIT: "Edit",
	SEARCH: "Search"
}

class InputField extends EditorElement {

	constructor(id, _label, _initialValue, _type, _hasBorder, _hasResetButton, _hasClearButton, _popup) {
		super(id);
		// property: label
	    if(_label === undefined) {
	        _label = null;
	    }
	    if(_label != null) {
		    _label = _label.trim();
		}
		this.label = _label;
		// property: initialValue
	    if(_initialValue === undefined || _initialValue === null) {
	        _initialValue = '';
	    }
	    this.initialValue = _initialValue.trim();
	    // property: type
		if(_type === undefined || _type === null) {
			_type = INPUT_FIELD_TYPES.DEFAULT;
		}
		this.type = _type;
	    // property: hasBorder
    	this.hasBorder = true;
	    if((_hasBorder != undefined) && (_hasBorder != null)) {
			if(typeof _hasBorder === "boolean") {
				this.hasBorder = _hasBorder;
		    } else if(typeof _hasBorder === "string") {
				_hasBorder = _hasBorder.trim().toLowerCase();
	            if(_hasBorder === "false" ||
	               _hasBorder === "off" ||
	               _hasBorder === "no" ||
	               _hasBorder === 'faux' ||
	               _hasBorder === 'non' ||
	               _hasBorder === 'falsa' ||
	               _hasBorder === 'falso') {
	                this.hasBorder = false;
	            }
	        }
	    }
	    // property: hasResetButton
	    this.hasResetButton = true;
	    if((_hasResetButton != undefined) && (_hasResetButton != null)) {
	        if(typeof _hasResetButton === "boolean") {
	            this.hasResetButton = _hasResetButton;
	        } else if(typeof _hasResetButton === "string") {
				_hasResetButton = _hasResetButton.trim().toLowerCase();
	            if(_hasResetButton === "false" ||
	               _hasResetButton === "off" ||
	               _hasResetButton === "no" ||
	               _hasResetButton === 'faux' ||
	               _hasResetButton === 'non' ||
	               _hasResetButton === 'falsa' ||
	               _hasResetButton === 'falso') {
	                this.hasResetButton = false;
	            }
	        }
	    }
	    // property: hasClearButton
	    this.hasClearButton = true;
	    if((_hasClearButton != undefined) && (_hasClearButton != null)) {
	        if(typeof _hasClearButton === "boolean") {
	            this.hasClearButton = _hasClearButton;
	        } else if(typeof _hasClearButton === "string") {
				_hasClearButton = _hasClearButton.trim().toLowerCase();
	            if(_hasClearButton === "false" ||
	               _hasClearButton === "off" ||
	               _hasClearButton === "no" ||
	               _hasClearButton === 'faux' ||
	               _hasClearButton === 'non' ||
	               _hasClearButton === 'falsa' ||
	               _hasClearButton === 'falso') {
	                this.hasClearButton = false;
	            }
	        }
	    }
	    this.popup = null;
	    if((_popup != undefined) && (_popup != null)) {
	    	this.popup = _popup;
	    }
	}

	getDocumentFragment(subclassDocumentFragment) {
		let template = '<div class="input-field';
	    if(this.label != null) {
			template += ' input-field-with-label';
	    }
	    template += '">';
	    if(this.label != null) {
			template += '<div class="label">' + this.label + '</div>';
	    }
	    template += '<input class="initial-value" type="hidden" value="' + this.initialValue + '"/>';
   	    template += '<div class="input-field-subclass';
	    if(this.hasBorder) {
	    	template += ' border';
	    }
	    template += '">';
   	    template += '<div id="to-be-replaced"></div>';
    	template += '<div class="input-field-buttons">';
    	if(this.hasResetButton) {
		    template += '<button class="reset-button hide" type="reset" title="Reset"><i class="fas fa-undo-alt"></i></button>';
		}
	    if(this.hasClearButton) {
	        template += '<button class="clear-button';
	        if(this.initialValue.length <= 0) {
	        	template += ' hide';
	        }
	        template += '" type="reset" title="Clear"><i class="fa fa-trash-alt"></i></button>';
	    }
	    switch(this.type) {
	    	case INPUT_FIELD_TYPES.CREATE:
		        template += '<button class="create-button" type="submit" title="Create"><i class="fa fa-magic"></i></button>';
		        break;
	    	case INPUT_FIELD_TYPES.DROPDOWN:
		        template += '<button class="dropdown-button" type="submit" title="Select"><i class="fa fa-chevron-down"></i></button>';
		        break;
		   	case INPUT_FIELD_TYPES.EDIT:
		        template += '<button class="edit-button" type="submit" title="Edit"><i class="fas fa-pen"></i></button>';
		        break;
		    case INPUT_FIELD_TYPES.SEARCH:
		        template += '<button class="search-button" type="submit" title="Search"><i class="fa fa-search"></i></button>';
		    	break;
		    default:
		    	break;
	    }
	    template += '</div>';
	    template += '</div>';
	    template += '</div>';
		let myDocumentFragment = document.createRange().createContextualFragment(template);
		if((subclassDocumentFragment != undefined) && (subclassDocumentFragment != null)) {
			let subclass = myDocumentFragment.getElementById('to-be-replaced');
			subclass.parentNode.replaceChild(subclassDocumentFragment, subclass);
		}
		let inputField = myDocumentFragment.querySelector('.input-field');
		// Add the popup if we have one...
		if((this.popup != undefined) && (this.popup != null)) {
			inputField.appendChild(this.popup.getDocumentFragment());
		}
		let mergedDocumentFragment = super.getDocumentFragment(myDocumentFragment);
		return mergedDocumentFragment;
	}

	highlight() {
		let inputField = document.getElementById(this.id);
		let subclass = inputField.querySelector('.input-field-subclass');
		subclass.classList.add('highlight');
	}

	unhighlight() {
		let inputField = document.getElementById(this.id);
		let subclass = inputField.querySelector('.input-field-subclass');
		subclass.classList.remove('highlight');
	}

	isUpdated() {
		return false;
	}

	setInitialValue(_initialValue) {
		if(_initialValue === undefined || _initialValue === null) {
			_initialValue = '';
		}
		if(typeof _initialValue === "boolean") {
			_initialValue = _initialValue.toString();
		}
		this.initialValue = _initialValue;
		let inputField = document.getElementById(this.id);
	    let initialValueInput = inputField.querySelector('input.initial-value');
    	initialValueInput.value = this.initialValue;
	}

	// static init() {
	// 	var allInputFields = document.querySelectorAll('.input-field');
	//     for(var i=0;i < allInputFields.length;i++) {
	//     	InputField.initInputField(allInputFields[i]);
	//     }
	// }

	// static initInputField(inputField) {
	//     if(inputField.classList.contains('text')) {
	//         InputField.initTextInput(inputField);
	//     } else if(inputField.classList.contains('textarea')) {
	//         InputField.initTextAreaInput(inputField);
	//     } else if(inputField.classList.contains('radio-buttons')) {
	//         InputField.initRadioButtonsInput(inputField);
	//     }
	// }

	// static initTextInput(inputField) {
	//     var input = inputField.querySelector('input[type="text"]');
	//     InputField.initInputFieldButtons(inputField, input);
	// }

	// static initTextAreaInput(inputField) {
	//     var textarea = inputField.querySelector('textarea');
	//     InputField.initInputFieldButtons(inputField, textarea);
	// }

	// static initInputFieldButtons(inputField, input) {
	//     if(input) {
	//         input.addEventListener('input', function(ev) {
	//             let inputEvent = new Event('input');
	//             let inputField = this.closest('.input-field');
	//             inputField.dispatchEvent(inputEvent);
	//         });
	//         if(inputField.classList === undefined || inputField.classList === null) {
	//             inputField = inputField.querySelector('.input-field');
	//         }
	//         inputField.addEventListener('input', function(ev) {
	//             let clearButton = this.querySelector('.clear-button');
	//             if(clearButton) {
	//                 let theInput = null;
	//                 if(this.classList.contains('text')) {
	//                     theInput = this.querySelector('input[type="text"]');
	//                 } else if(this.classList.contains('textarea')) {
	//                     theInput = this.querySelector('textarea');
	//                 }
	//                 let value = theInput.value;
	//                 if(value.length <= 0) {
	//                     clearButton.classList.add('hide');
	//                 } else {
	//                     clearButton.classList.remove('hide');
	//                 }
	//             }
	//             let resetButton = this.querySelector('.reset-button');
	//             if(resetButton) {
	//                 if(InputField.isUpdated(this)) {
	//                     resetButton.classList.remove('hide');
	//                 } else {
	//                     resetButton.classList.add('hide');
	//                 }
	//             }
	//         });
	//     }
	//     var clearButton = inputField.querySelector('.clear-button');
	//     if(clearButton) {
	//         clearButton.addEventListener('click', function(ev) {
	//             ev.preventDefault();
	//             ev.stopPropagation();
	//             var theParent = this.closest('.input-field');
	//             let theInput = null;
	//             if(theParent.classList.contains('text')) {
	//                 theInput = theParent.querySelector('input[type="text"]');
	//             } else if(theParent.classList.contains('textarea')) {
	//                 theInput = theParent.querySelector('textarea');
	//             }
	//             var currentValue = theInput.value;
	//             if(currentValue.length > 0) {
	//                 theInput.value = '';
	//                 var inputEvent = new Event('input');
	//                 theInput.dispatchEvent(inputEvent);
	//             }
	//             theInput.focus();
	//             var thePopup = theParent.querySelector('.popup');
	//             if(thePopup) {
	//                 Popup.show(thePopup);
	//             }
	//             return false;
	//         });
	//         if(input) {
	//             let value = input.value;
	//             if(value.length <= 0) {
	//                 clearButton.classList.add('hide');
	//             } else {
	//                 clearButton.classList.remove('hide');
	//             }
	//         }
	//     }
	//     var resetButton = inputField.querySelector('.reset-button');
	//     if(resetButton) {
	//         resetButton.addEventListener('click', function(ev) {
	//             let inputField = this.closest('.input-field');
	//             if(InputField.isUpdated(inputField)) {
	//                 InputField.reset(inputField);
	//             }
	//         });
	//     }
	// }

	// static initRadioButtonsInput(inputField) {
	//     if(inputField.classList === undefined || inputField.classList === null) {
	//         inputField = inputField.querySelector('.input-field');
	//     }
	//     inputField.addEventListener('input', function(ev) {
	//         let resetButton = this.querySelector('.reset-button');
	//         if(resetButton) {
	//             if(InputField.isUpdated(this)) {
	//                 resetButton.classList.remove('hide');
	//             } else {
	//                 resetButton.classList.add('hide');
	//             }
	//         }
	//     });
	//     var allRadioButtons = inputField.querySelectorAll('input[type="radio"]');
	//     for(var i=0;i < allRadioButtons.length;i++) {
	//         allRadioButtons[i].addEventListener('click', function(ev) {
	//             let inputField = this.closest('.input-field');
	//             let inputEvent = new Event('input');
	//             inputField.dispatchEvent(inputEvent);
	//         });
	//     }
	//     var resetButton = inputField.querySelector('.reset-button');
	//     if(resetButton) {
	//         resetButton.addEventListener('click', function(ev) {
	//             let inputField = this.closest('.input-field');
	//             if(InputField.isUpdated(inputField)) {
	//                 InputField.reset(inputField);
	//             }
	//         });
	//     }
	// }

	// static reset(inputField) {
	//     if(inputField) {
	//         let initialValueInput = inputField.querySelector('input.initial-value');
	//         if(initialValueInput) {
	//             let initialValue = initialValueInput.value;
	//             if(inputField.classList.contains('text')) {
	//                 let input = inputField.querySelector('input[type="text"]');
	//                 input.value = initialValue;
	//                 let inputEvent = new Event('input');
	//                 input.dispatchEvent(inputEvent);
	//             } else if(inputField.classList.contains('textarea')) {
	//                 let input = inputField.querySelector('textarea');
	//                 input.value = initialValue;
	//                 let inputEvent = new Event('input');
	//                 input.dispatchEvent(inputEvent);
	//             } else if(inputField.classList.contains('radio-buttons')) {
	//                 let radioButton = inputField.querySelector('input[type="radio"][value="' + initialValue + '"]');
	//                 radioButton.checked = true;
	//                 let inputEvent = new Event('click');
	//                 radioButton.dispatchEvent(inputEvent);
	//             }
	//         }
	//     }
	// }

	// static isUpdated(inputField) {
	//     if(inputField) {
	//         let initialValueInput = inputField.querySelector('input.initial-value');
	//         if(initialValueInput) {
	//             let initialValue = initialValueInput.value;
	//             let currentValue = null;
	//             if(inputField.classList.contains('text')) {
	//                 let input = inputField.querySelector('input[type="text"]');
	//                 currentValue = input.value;
	//             } else if(inputField.classList.contains('textarea')) {
	//                 let input = inputField.querySelector('textarea');
	//                 currentValue = input.value;
	//             } else if(inputField.classList.contains('radio-buttons')) {
	//                 let input = inputField.querySelector('input[type="radio"]:checked');
	//                 if(input === undefined || input === null) {
	//                     currentValue = '';
	//                 } else {
	//                     currentValue = input.value;
	//                 }
	//             } else if(inputField.classList.contains('list')) {

	//             }
	//             return (currentValue != initialValue);
	//         }
	//     }
 //    	return false;
	// }
}