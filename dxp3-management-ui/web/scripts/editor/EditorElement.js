class EditorElement {

	constructor(_id) {
		EditorElement.sequence++;
		if(_id === undefined || _id === null) {
			_id = '';
		}
		_id = _id.trim();
		if(_id.length <= 0) {
			this.id = 'element_' + EditorElement.sequence;
		} else {
			this.id = _id;			
		}
		this.eventListenersByEventType = {};
		this.classList = [];
	}

	addClass(className) {
		if(className === undefined || className === null) {
			return;
		}
		className = className.trim();
		if(className.length <= 0) {
			return;
		}
		this.classList.push(className)
		let thisEditorElement = document.getElementById(this.id);
		if(thisEditorElement === undefined || thisEditorElement === null) {
			return;
		}
		thisEditorElement.classList.add(className);
	}

	removeClass(className) {
		if(className === undefined || className === null) {
			return;
		}
		className = className.trim();
		if(className.length <= 0) {
			return;
		}
		let index = this.classList.indexOf(className);
		if(index <= -1) {
			return;
		}
		this.classList.splice(index, 1);
		let thisEditorElement = document.getElementById(this.id);
		if(thisEditorElement === undefined || thisEditorElement === null) {
			return;
		}
		thisEditorElement.classList.remove(className);
	}

	getDocumentFragment(subclassDocumentFragment) {
		let myDocumentFragment = null;
		if((subclassDocumentFragment != undefined) && (subclassDocumentFragment != null)) {
			let rootElement = subclassDocumentFragment.firstChild;
			if((rootElement != undefined) && (rootElement != null)) {
				rootElement.setAttribute('id', this.id);
				rootElement.classList.add('editor-element');
				for(let i=0;i < this.classList.length;i++) {
					rootElement.classList.add(this.classList[i]);
				}
			}
			myDocumentFragment = subclassDocumentFragment;
		} else {
			let template = '';
			template += '<div';
			template += 	' id="' + this.id + '"';
			template += 	' class="editor-element';
			for(let i=0;i < this.classList.length;i++) {
				template += ' ' + this.classList[i];
			}
			template += '">';
			template += '</div>';
			myDocumentFragment = document.createRange().createContextualFragment(template);
		}
		return myDocumentFragment;
	}

	getDocumentElement() {
		return document.getElementById(this.id);
	}

	init() {
	}

	addEventListener(eventType, eventListener) {
		if(eventType === undefined || eventType === null) {
			return;
		}
		if(eventListener === undefined || eventListener === null) {
			return;
		}
		let eventListeners = this.eventListenersByEventType[eventType];
		if(eventListeners === undefined || eventListeners === null) {
			eventListeners = [];
			this.eventListenersByEventType[eventType] = eventListeners;
		}
		eventListeners.push(eventListener);
	}

	dispatchEvent(eventType, event) {
		if(eventType === undefined || eventType === null) {
			return;
		}
		let eventListeners = this.eventListenersByEventType[eventType];
		if(eventListeners === undefined || eventListeners === null) {
			return;
		}
		for(let i=0;i < eventListeners.length;i++) {
			eventListeners[i](event);
		}
	}
}
// STATIC PROPERTIES
EditorElement.sequence = 0;