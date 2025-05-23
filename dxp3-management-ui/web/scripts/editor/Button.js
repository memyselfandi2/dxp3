class Button extends EditorElement {
	constructor(id, _className, _title, _icon, _text) {
		super(id);
		// property: className
	    if(_className === undefined || _className === null) {
	        _className = '';
	    }
	    this.className = _className.trim();
		this.title = _title;
		this.icon = _icon;
		this.text = _text;
	}

	getDocumentFragment(subclassDocumentFragment) {
		let template =	'<div class="button';
		if(this.isDisabled) {
			template += ' disabled';
		}
		template += '">';
		template += '<a';
		template += ' class="' + this.className + '"';
		template += ' title="' + this.title + '" href="#">';
        template += '<i class="' + this.icon + '"></i>';
        template += this.text;
        template += '</a>';
	    template += '</div>';
		let myDocumentFragment = document.createRange().createContextualFragment(template);
		let mergedDocumentFragment = super.getDocumentFragment(myDocumentFragment);

		return mergedDocumentFragment;
	}

	init() {
		let thisButton = this;
		let buttonElement = document.getElementById(this.id);
		let anchor = buttonElement.querySelector('a');
		anchor.addEventListener('click', function(ev) {
			ev.preventDefault();
			thisButton.dispatchEvent('click', ev);
		});
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