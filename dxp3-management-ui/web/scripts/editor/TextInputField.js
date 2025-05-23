class TextInputField extends InputField {

	constructor(id, label, _name, _className, initialValue, _placeholder, type, hasBorder, hasResetButton, hasClearButton, popup) {
		super(id, label, initialValue, type, hasBorder, hasResetButton, hasClearButton, popup);
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
	    // property: placeholder
	    if(_placeholder === undefined || _placeholder === null) {
	    	_placeholder = '';
	    }
	    this.placeholder = _placeholder.trim();
	}

	getDocumentFragment(subclassDocumentFragment) {
		let template = '<input class="current-value ' + this.className + '" type="text" name="' + this.name + '" value="' + this.initialValue + '" placeholder="' + this.placeholder + '"/>';
		let myDocumentFragment = document.createRange().createContextualFragment(template);
		let mergedDocumentFragment = super.getDocumentFragment(myDocumentFragment);
		// // Show the popup when the user clicks in the input field.
		// // Also refresh the popup (if any).
		// // We add the click event to intercept and stop propagation.
		// // This will ensure the popup (opened by the accompanying focus event) stays open.
		// // The focus event will open the popup and initiate the refresh request.
		// let popup = this.popup;
		// input.addEventListener('click', function(ev) {
		// 	ev.preventDefault();
		// 	ev.stopPropagation();
		// 	let event = {};
		// 	event.source = thisEditorElement;
		// 	thisEditorElement.dispatchEvent('click', event);
		// 	return false;
		// });
		// input.addEventListener('focus', function(ev) {
		// 	ev.preventDefault();
		// 	if(popup != undefined && popup != null) {
		// 		popup.show();
		// 		popup.refresh(this.value);
		// 	}
		// 	let event = {};
		// 	event.source = thisEditorElement;
		// 	thisEditorElement.dispatchEvent('focus', event);
		// 	return false;
		// });
		// input.addEventListener('keyup', function(ev) {
		// 	var key = ev.which;
		// 	if(key === 13) {
		// 		if((this.popup != undefined) && (this.popup != null)) {
		// 			popup.select();
		// 		}
		// 	} else {
		// 		if((this.popup != undefined) && (this.popup != null)) {
		// 			popup.refresh(this.value);
		// 		}
		// 	}
		// 	if(this.value.length <= 0) {

		// 	}
		// });
		// var clearButton = mergedDocumentFragment.querySelector('.input-field-buttons > .clear-button');
		// clearButton.addEventListener('click', function(ev) {
		// 	ev.preventDefault();
		// 	console.log('clear click');
		// 	return false;
		// });
		// var submitButtons = mergedDocumentFragment.querySelectorAll('button[type="submit"]');
		// for(var i=0;i < submitButtons.length;i++) {
		// 	let submitButton = submitButtons[i];
		// 	submitButton.addEventListener('click', function(ev) {
		// 		console.log('submit click');
		// 		ev.preventDefault();
		// 		ev.stopPropagation();
		// 		let theInput = this.closest('.input-field').querySelector('input[type="text"]');
		// 		theInput.focus();
		// 		return false;
		// 	});
		// 	submitButton.addEventListener('keydown', function(ev) {
		// 		var key = ev.which;
		// 		if(key === 13) {
		// 			ev.preventDefault();
		// 			ev.stopPropagation();
		// 			return false;
		// 		}
		// 	});
		// 	submitButton.addEventListener('keyup', function(ev) {
		// 		var key = ev.which;
		// 		if(key === 13) {
		// 			ev.preventDefault();
		// 			ev.stopPropagation();
		// 			let theInput = this.closest('.input-field').querySelector('input[type="text"]');
		// 			theInput.focus();
		// 			return false;
		// 		}
		// 	});
		// }
		return mergedDocumentFragment;
	}

	init() {
		let inputField = document.getElementById(this.id);
		inputField.classList.add('text-input-field');
		let thisEditorElement = this;
		// Get a reference to all of our buttons.
		let clearButton = inputField.querySelector('.clear-button');
	    let resetButton = inputField.querySelector('.reset-button');
		let submitButtons = inputField.querySelectorAll('button[type="submit"]');
	    // Get a reference to the actual input text element.
		let input = inputField.querySelector('input[type="text"]');
		// Start adding event listeners.
		// When someone types in our input field we activate/deactivate clear and reset
		// buttons based on the current value.
		input.addEventListener('click', function(ev) {
			ev.preventDefault();
			// If we have a toplevel popup we ask them to close their popup children
			if((thisEditorElement.popup != undefined) && (thisEditorElement.popup != null)) {
				thisEditorElement.popup.closeChildren();
				ev.stopPropagation();
			}
			return false;
		});
		input.addEventListener('input', function(ev) {
			if(clearButton) {
	            if(this.value.length <= 0) {
	                clearButton.classList.add('hide');
	            } else {
	                clearButton.classList.remove('hide');
	            }
			}
			if(resetButton) {
	            if(thisEditorElement.isUpdated()) {
	                resetButton.classList.remove('hide');
	            } else {
	                resetButton.classList.add('hide');
	            }
	        }
	        if(thisEditorElement.popup != undefined && thisEditorElement.popup != null) {
	        	if(thisEditorElement.popup.isVisible()) {
		        	thisEditorElement.popup.refresh(this.value);
		        }
	        }
            thisEditorElement.dispatchEvent('input', ev);
		});
		input.addEventListener('keyup', function(ev) {
			var key = ev.which;
			if(key === 13) {
		        if(thisEditorElement.popup != undefined && thisEditorElement.popup != null) {
					thisEditorElement.popup.select();
				} else {
					thisEditorElement.dispatchEvent('keyup', ev);
				}
			}
		});
		input.addEventListener('focus', function(ev) {
			if(thisEditorElement.popup != undefined && thisEditorElement.popup != null) {
				if(thisEditorElement.popup.isHidden()) {
					thisEditorElement.popup.show();
				}
			}
		});
		if(clearButton) {
	        clearButton.addEventListener('click', function(ev) {
	            ev.preventDefault();
	            ev.stopPropagation();
	            thisEditorElement.clear();
	            input.focus();
	            return false;
	        });
		}
	    if(resetButton) {
		    resetButton.addEventListener('click', function(ev) {
	            ev.preventDefault();
	            ev.stopPropagation();
	            thisEditorElement.reset();
	            input.focus();
	            return false;
	        });
	    }
		for(var i=0;i < submitButtons.length;i++) {
			let submitButton = submitButtons[i];
			submitButton.addEventListener('click', function(ev) {
				ev.preventDefault();
				ev.stopPropagation();
				input.focus();
				return false;
			});
			submitButton.addEventListener('keydown', function(ev) {
				var key = ev.which;
				if(key === 13) {
					ev.preventDefault();
					ev.stopPropagation();
					return false;
				}
			});
			submitButton.addEventListener('keyup', function(ev) {
				var key = ev.which;
				if(key === 13) {
					ev.preventDefault();
					ev.stopPropagation();
					input.focus();
					return false;
				}
			});
		}
		super.init();
	}

	isUpdated() {
		let input = document.getElementById(this.id).querySelector('input[type="text"]');
		return input.value != this.initialValue;
	}

	clear() {
		let input = document.getElementById(this.id).querySelector('input[type="text"]');
		input.value = '';
		var inputEvent = new Event('input');
		input.dispatchEvent(inputEvent);
	}

	reset() {
		let input = document.getElementById(this.id).querySelector('input[type="text"]');
		input.value = this.initialValue;
		let inputEvent = new Event('input');
		input.dispatchEvent(inputEvent);
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