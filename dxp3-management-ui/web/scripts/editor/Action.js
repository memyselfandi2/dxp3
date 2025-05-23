class Action extends EditorElement {

	constructor(id, _reference, _className, _title, _text, _icon, _isDisabled, _callback) {
		super(id);
		this.reference = _reference;
		this.className = _className;
		this.title = _title;
		this.text = _text;
		this.icon = _icon;
		this.isDisabled = _isDisabled;
		this.popup = null;
		this.callback = _callback;
	}

	getDocumentFragment() {
		let template =	'<div class="action';
		if(this.isDisabled) {
			template += ' disabled';
		}
		template += '">';
		template += '<a';
		template += ' href="#' + this.reference + '"';
		template += ' class="' + this.className + '"';
		template += ' title="' + this.title + '">';
	    template +=		'<i class="' + this.icon + '"></i>';
	    template += this.text;
	    template += '</a>';
	    template += '</div>';
		let myDocumentFragment = document.createRange().createContextualFragment(template);
		let action = myDocumentFragment.querySelector('.action');
		// Add the popup if we have one...
		if((this.popup != undefined) && (this.popup != null)) {
			action.appendChild(this.popup.getDocumentFragment());
		}
		let mergedDocumentFragment = super.getDocumentFragment(myDocumentFragment);

		return mergedDocumentFragment;
	}

	init() {
		let thisEditorElement = this;
		let actionElement = document.getElementById(this.id);
		let anchor = actionElement.querySelector('a');
		anchor.addEventListener('click', function(ev) {
			ev.preventDefault();
			ev.stopPropagation();
			// If we have a toplevel popup we ask them to close their popup children
			if((thisEditorElement.popup != undefined) && (thisEditorElement.popup != null)) {
				thisEditorElement.popup.closeChildren();
				ev.stopPropagation();
				thisEditorElement.popup.show();
				thisEditorElement.popup.focus();
			}			
			thisEditorElement.callback(thisEditorElement.reference, thisEditorElement.className);
			return false;
		});

		if((this.popup != undefined) && (this.popup != null)) {
			this.popup.init();
		}

		super.init();
	}

	disable() {
		this.isDisabled = true;
		let thisEditorElement = document.getElementById(this.id);
		if(thisEditorElement === undefined || thisEditorElement === null) {
			return;
		}
        thisEditorElement.classList.add('disabled');
	}

	enable() {
		this.isDisabled = false;
		let thisEditorElement = document.getElementById(this.id);
		if(thisEditorElement === undefined || thisEditorElement === null) {
			return;
		}
        thisEditorElement.classList.remove('disabled');
	}
}