class ListInputField extends InputField {

	constructor(id, label, _initialValues, _initialDisplayValues, type, hasBorder, hasResetButton, hasClearButton) {
		// the initialValue is a csv string
	    let initialValue = '';
	    if(_initialValues === undefined || _initialValues === null) {
	    	_initialValues = [];
	    } else if(Array.isArray(_initialValues)) {
	    	initialValue = _initialValues.join(',');
	    } else if(typeof _initialValues === "string") {
	    	intialValue = _initialValues;
	    	_initialValues = _initialValues.split(',');
	    }
		super(id, label, initialValue, type, hasBorder, hasResetButton, hasClearButton);
	    // property: initialValues
		this.initialValues = _initialValues;	    	
	    // property: initialDisplayValues
	    if(_initialDisplayValues === undefined || _initialDisplayValues === null) {
	    	this.initialDisplayValues = [];
	    } else if(Array.isArray(_initialDisplayValues)) {
			this.initialDisplayValues = _initialDisplayValues;	    	
	    } else if(typeof _initialDisplayValues === "string") {
	    	this.initialDisplayValues = _initialDisplayValues.split(',');
	    } else {
	    	this.initialDisplayValues = [];
	    }
	}

	addItem(value, displayValue) {
		// Defensive programming...check input...
		if(value === undefined || value === null) {
			return;
		}
		if(displayValue === undefined || displayValue === null) {
			displayValue = '';
		}
		let inputField = document.getElementById(this.id);
		let ulElement = inputField.querySelector('ul');
		// Don't allow duplicates
		let action = ulElement.querySelector('a[href="#' + value + '"]');
		if(action) {
			action.textContent = displayValue;
			let inputEvent = new Event('input');
			inputField.dispatchEvent(inputEvent);
			return;
		}
//		let template = '<li class="draggable" draggable="true"><a class="action-select" href="#' + value + '">' + displayValue + '</a><a class="action-remove"><i class="fa fa-trash-alt"></i></a></li>';
//  	let liElement = document.createRange().createContextualFragment(template);
   		let liElement = document.createElement('li');
   		liElement.setAttribute('class', 'draggable');
   		liElement.setAttribute('draggable', 'true');
   		let aElement = document.createElement('a');
   		aElement.setAttribute('class', 'action-select');
   		aElement.setAttribute('href', '#' + value);
   		let aContent = document.createTextNode(displayValue);
   		aElement.appendChild(aContent);
   		liElement.appendChild(aElement);
   		aElement = document.createElement('a');
   		aElement.setAttribute('class', 'action-remove');
   		aElement.setAttribute('href', '#');
   		let iElement = document.createElement('i');
   		iElement.setAttribute('class', 'fa fa-trash-alt');
   		aElement.appendChild(iElement);
   		liElement.appendChild(aElement);
   		ulElement.appendChild(liElement);
		this.initListElement(liElement);
  		ulElement.classList.remove('hide');
		let inputEvent = new Event('input');
		inputField.dispatchEvent(inputEvent);
	}

	getDocumentFragment(subclassDocumentFragment) {
		let template = '<ul>';
	    for(var i=0;i < this.initialValues.length;i++) {
			template += '<li class="draggable" draggable="true"><a class="action-select" href="#' + this.initialValues[i] + '">' + this.initialDisplayValues[i] + '</a><a class="action-remove"><i class="fa fa-trash-alt"></i></a></li>';
	    }
		template += '</ul>';
		let myDocumentFragment = document.createRange().createContextualFragment(template);
		let mergedDocumentFragment = super.getDocumentFragment(myDocumentFragment);
		return mergedDocumentFragment;
	}

	initListElement(liElement) {
		let inputField = document.getElementById(this.id);
   		let aElement = liElement.querySelector('.action-remove');
   		aElement.addEventListener('click', function(ev) {
   			let liElement = this.parentNode;
   			let ulElement = liElement.parentNode;
   			ulElement.removeChild(liElement);
   			if(ulElement.childNodes.length <= 0) {
   				ulElement.classList.add('hide');
   			}
			let inputEvent = new Event('input');
			inputField.dispatchEvent(inputEvent);
   		});
		liElement.addEventListener('dragstart', function(ev) {
			ev.stopPropagation();
			console.log('dragstart');
			return false;
		});
		liElement.addEventListener('dragenter', function(ev) {
			ev.preventDefault();
			ev.stopPropagation();
			liElement.classList.add('over');
			console.log('dragenter');
			return false;
		});
		liElement.addEventListener('dragover', function(ev) {
			ev.preventDefault();
			ev.stopPropagation();
			console.log('dragover');
			return false;
		});
		liElement.addEventListener('dragleave', function(ev) {
			ev.preventDefault();
			ev.stopPropagation();
			liElement.classList.remove('over');
			console.log('dragleave');
			return false;
		});
		liElement.addEventListener('drop', function(ev) {
			ev.preventDefault();
			ev.stopPropagation();
			console.log('drop');
			return false;
		});
		liElement.addEventListener('dragend', function(ev) {
			ev.preventDefault();
			ev.stopPropagation();
			console.log('dragend');
			return false;
		});
	}

	init() {
		let inputField = document.getElementById(this.id);
		inputField.classList.add('list-input-field');
		let thisEditorElement = this;
		// Get a reference to all of our buttons.
		let clearButton = inputField.querySelector('.clear-button');
	    let resetButton = inputField.querySelector('.reset-button');
   		let liElements = inputField.querySelectorAll('li');
   		if(liElements) {
   			for(let i=0;i < liElements.length;i++) {
		   		this.initListElement(liElements[i]);
   			}
   		}
	    inputField.addEventListener('input', function(ev) {
			if(clearButton) {
				let items = inputField.querySelector('li');
	            if(items === undefined || items === null || (items.length <= 0)) {
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
            thisEditorElement.dispatchEvent('input', ev);
	    });
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
		super.init();
	}

	clear() {
		let inputField = document.getElementById(this.id);
		let ulElement = inputField.querySelector('ul');
		let child = ulElement.firstChild;
		while(child) {
			ulElement.removeChild(child)
			child = ulElement.firstChild;
		}
		let inputEvent = new Event('input');
		inputField.dispatchEvent(inputEvent);
	}

	reset() {
		let inputField = document.getElementById(this.id);
		let ulElement = inputField.querySelector('ul');
		let child = ulElement.firstChild;
		while(child) {
			ulElement.removeChild(child)
			child = ulElement.firstChild;
		}
	    for(var i=0;i < this.initialValues.length;i++) {
			let template = '<li class="draggable" draggable="true"><a class="action-select" href="#' + this.initialValues[i] + '">' + this.initialDisplayValues[i] + '</a><a class="action-remove"><i class="fa fa-trash-alt"></i></a></li>';
	   		let liElement = document.createRange().createContextualFragment(template);
	   		this.initListElement(liElement);
	   		ulElement.appendChild(liElement);
	    }
  		ulElement.classList.remove('hide');
		let inputEvent = new Event('input');
		inputField.dispatchEvent(inputEvent);
	}

	isUpdated() {
		let inputField = document.getElementById(this.id);
		let actions = inputField.querySelectorAll('a[class="action-select"]');
		if(actions === undefined || actions === null || actions.length <= 0) {
			return (this.initialValues.length > 0);
		}
		if(actions.length != this.initialValues.length) {
			return true;
		}
		for(let i=0;i < actions.length;i++) {
			let href = actions[i].getAttribute('href');
			let value = href.substring(1);
			if(!this.initialValues.includes(value)) {
				return true;
			}
		}
		return false;
	}

	setInitialValues(_initialValues, _initialDisplayValues) {
		let initialValue = '';
		if(_initialValues === undefined || _initialValues === null) {
			this.initialValues = [];
		} else if(Array.isArray(_initialValues)) {
			initialValue = _initialValues.join(',');
			this.initialValues = _initialValues;
		} else if(typeof _initialValues === "string") {
			initialValue = _initialValues;
			this.initialValues = _initialValues.split(',');
		} else {
			this.initialValues = [];
		}
	    if(_initialDisplayValues === undefined || _initialDisplayValues === null) {
	    	this.initialDisplayValues = [];
	    } else if(Array.isArray(_initialDisplayValues)) {
			this.initialDisplayValues = _initialDisplayValues;	    	
	    } else if(typeof _initialDisplayValues === "string") {
	    	this.initialDisplayValues = _initialDisplayValues.split(',');
	    } else {
	    	this.initialDisplayValues = [];
	    }
	    super.setInitialValue(initialValue);
	}

	getValues() {
		let values = '';
		let inputField = document.getElementById(this.id);
		let actions = inputField.querySelectorAll('a[class="action-select"]');
		if((actions != undefined) && (actions != null)) {
			for(let i=0;i < actions.length;i++) {
				let href = actions[i].getAttribute('href');
				let value = href.substring(1);
				if(i > 0) {
					values += ',';
				}
				values += value;
			}
		}
		return values;
	}

	setValues(values, displayValues) {
		// Clear
		let inputField = document.getElementById(this.id);
		let ulElement = inputField.querySelector('ul');
		let child = ulElement.firstChild;
		while(child) {
			ulElement.removeChild(child)
			child = ulElement.firstChild;
		}
		if(values === undefined || values === null) {
			return;
		}
		if(displayValues === undefined || displayValues === null) {
			displayValues = values;
		}
		for(let i=0;i < values.length;i++) {
			let template = '<li class="draggable" draggable="true"><a class="action-select" href="#' + values[i] + '">' + displayValues[i] + '</a><a class="action-remove"><i class="fa fa-trash-alt"></i></a></li>';
	   		let liElement = document.createRange().createContextualFragment(template);
	   		this.initListElement(liElement);
	   		ulElement.appendChild(liElement);
	   	}
  		ulElement.classList.remove('hide');
		let inputEvent = new Event('input');
		inputField.dispatchEvent(inputEvent);
	}
}