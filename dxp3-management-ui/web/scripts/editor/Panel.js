class Panel extends EditorElement {

	constructor(id, _name, _isHidden, _hasBorder) {
		super(id);
		if(_name === undefined || _name === null) {
			_name = '';
		}
		this.name = _name.trim();
	    // property: isHidden
    	this.isHidden = false;
	    if((_isHidden != undefined) && (_isHidden != null)) {
			if(typeof _isHidden === "boolean") {
				this.isHidden = _isHidden;
		    } else if(typeof _isHidden === "string") {
				_isHidden = _isHidden.trim().toLowerCase();
	            if(_isHidden === "true" ||
	               _isHidden === "on" ||
	               _isHidden === "yes" ||
	               _isHidden === 'vrai' ||
	               _isHidden === 'si' ||
	               _isHidden === 'vera' ||
	               _isHidden === 'vero' ||
	               _isHidden === 'ja' ||
	               _isHidden === 'aan' ||
	               _isHidden === 'waar') {
	                this.isHidden = true;
	            }
	        }
	    }
	    // property: hasBorder
    	this.hasBorder = false;
	    if((_hasBorder != undefined) && (_hasBorder != null)) {
			if(typeof _hasBorder === "boolean") {
				this.hasBorder = _hasBorder;
		    } else if(typeof _hasBorder === "string") {
				_hasBorder = _hasBorder.trim().toLowerCase();
	            if(_hasBorder === "true" ||
	               _hasBorder === "on" ||
	               _hasBorder === "yes" ||
	               _hasBorder === 'vrai' ||
	               _hasBorder === 'si' ||
	               _hasBorder === 'vera' ||
	               _hasBorder === 'vero' ||
	               _hasBorder === 'ja' ||
	               _hasBorder === 'aan' ||
	               _hasBorder === 'waar') {
	                this.hasBorder = true;
	            }
	        }
	    }
	}

	getDocumentFragment(subclassDocumentFragment) {
		let myDocumentFragment = null;
		if((subclassDocumentFragment != undefined) && (subclassDocumentFragment != null)) {
			let rootElement = subclassDocumentFragment.firstChild;
			if((rootElement != undefined) && (rootElement != null)) {
				rootElement.classList.add('panel');
				if(this.isHidden) {
					rootElement.classList.add('hide');
				}
				if(this.hasBorder) {
					rootElement.classList.add('border');
				}
			}
			myDocumentFragment = subclassDocumentFragment;
		} else {
			let template = '<div class="panel';
			if(this.isHidden) {
				template += ' hide';
			}
			if(this.hasBorder) {
				template += ' border';
			}
			template += '"></div>';
			myDocumentFragment = document.createRange().createContextualFragment(template);
		}
		let mergedDocumentFragment = super.getDocumentFragment(myDocumentFragment);
		return mergedDocumentFragment;
	}

	init() {
		super.init();
	}

	setBorder() {
		this.addBorder();
	}

	addBorder() {
		this.hasBorder = true;
		let panel = document.getElementById(this.id);
		if(panel) {
			panel.classList.add('border');
		}
	}

	deleteBorder() {
		this.removeBorder();
	}

	removeBorder() {
		this.hasBorder = false;
		let panel = document.getElementById(this.id);
		if(panel) {
			panel.classList.remove('border');
		}
	}

	show() {
		this.isHidden = false;
		let panel = document.getElementById(this.id);
		if(panel) {
			panel.classList.remove('hide');
			panel.classList.add('show');
		}
	}

	hide() {
		this.isHidden = true;
		let panel = document.getElementById(this.id);
		if(panel) {
			panel.classList.add('hide');
			panel.classList.remove('show');
		}
	}
}