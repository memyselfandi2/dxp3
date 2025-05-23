class Tab {
	constructor(panel, icon, _hasCloseButton) {
		this.panel = panel;
	    // property: hasCloseButton
	    this.hasCloseButton = true;
	    if((_hasCloseButton != undefined) && (_hasCloseButton != null)) {
	        if(typeof _hasCloseButton === "boolean") {
	            this.hasCloseButton = _hasCloseButton;
	        } else if(typeof _hasCloseButton === "string") {
				_hasCloseButton = _hasCloseButton.trim().toLowerCase();
	            if(_hasCloseButton === "false" ||
	               _hasCloseButton === "off" ||
	               _hasCloseButton === "no" ||
	               _hasCloseButton === 'faux' ||
	               _hasCloseButton === 'non' ||
	               _hasCloseButton === 'falsa' ||
	               _hasCloseButton === 'falso') {
	                this.hasCloseButton = false;
	            }
	        }
	    }
	}
}