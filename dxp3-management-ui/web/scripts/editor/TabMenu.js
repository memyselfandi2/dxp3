class TabMenu extends EditorElement {

	constructor(id) {
		super(id);
		this.currentPanel = null;
		this.currentPanelID = null;
		this.panels = new Map();
		this.tabIcons = new Map();
		this.hasCloseButtons = new Map();
	}

	removePanelById(panelID) {
		// Defensive programming...check input...
		if(panelID === undefined || panelID === null) {
			return;
		}
		panelID = panelID.trim();
		// Remove the panel and its associated icon from our collection of panels.
		this.panels.delete(panelID);
		this.tabIcons.delete(panelID);
		// Next remove the tab from our menu.
		let tabMenu = document.getElementById(this.id);
	    let aElement = tabMenu.querySelector('a.action-select-tab[href=\'#' + panelID + '\']');
	    if(aElement === undefined || aElement === null) {
	    	return;
	    }
	    let liElement = aElement.parentNode;
	    liElement.remove();
	    // If we removed the currently selected panel we reset our current panel and its ID to null.
	    if(panelID === this.currentPanelID) {
	    	this.currentPanel = null;
	    	this.currentPanelID = null;
	    }
	    // Let everyone know...
	    this.dispatchEvent('close', panelID);
	}

	getSelectedPanel() {
		return this.currentPanel;
	}

	updatePanel(panel, tabIcon) {
		// Defensive programming...check input...
		if(panel === undefined || panel === null) {
			return;
		}
		let currentPanel = this.panels.get(panel.id);
		if(currentPanel === undefined || currentPanel === null) {
			return;
		}
		this.panels.set(panel.id, panel);
		this.tabIcons.set(panel.id, tabIcon);
		let tabMenu = document.getElementById(this.id);
		if(tabMenu === undefined || tabMenu === null) {
			return;
		}
		let aElement = tabMenu.querySelector('a[href="#' + panel.id + '"]');
		aElement.textContent = panel.name;
	}

	addPanel(panel, tabIcon, hasCloseButton) {
		// Defensive programming...check input...
		if(panel === undefined || panel === null) {
			return;
		}
		this.panels.set(panel.id, panel);
		this.tabIcons.set(panel.id, tabIcon);
		if(hasCloseButton === undefined || hasCloseButton === null) {
			hasCloseButton = true;
		}
		this.hasCloseButtons.set(panel.id, hasCloseButton);
		// If our getDocumentFragment has already been called we should be
		// part of the dom already. Lets check.
		let tabMenu = document.getElementById(this.id);
		if(tabMenu === undefined || tabMenu === null) {
			return;
		}
	    let ulElement = tabMenu.querySelector('ul');
	    var liElement = document.createElement('li');
	    var aElement = document.createElement('a');
	    aElement.setAttribute('href', '#' + panel.id);
	    aElement.setAttribute('class', 'action-select-tab');
	    aElement.setAttribute('title', panel.name);
	    var aContent = document.createTextNode(panel.name);
	    aElement.appendChild(aContent);
	    let thisEditorElement = this;
	    aElement.addEventListener('click', function(ev) {
	    	ev.preventDefault();
	        var href = this.getAttribute('href');
	        let panelID = href.substring(1);
	        thisEditorElement.selectPanelById(panelID);
	        return false;
	    });
	    liElement.appendChild(aElement);
	    if(hasCloseButton) {
		    var buttonElement = document.createElement('button');
		    buttonElement.setAttribute('class', 'close-button');
		    buttonElement.setAttribute('type', 'reset');
		    buttonElement.setAttribute('title', 'Close');
		    var iElement = document.createElement('i');
		    iElement.setAttribute('class', 'fa fa-times fa-lg');
		    buttonElement.appendChild(iElement);
		    liElement.appendChild(buttonElement);
		    buttonElement.addEventListener('click', function(ev) {
		    	ev.preventDefault();
		        var liParent = this.parentNode;
		        var aElement = liParent.querySelector('a');
		        var href = aElement.getAttribute('href');
		        let panelID = href.substring(1);
		        thisEditorElement.removePanelById(panelID);
		        return false;
		    });
		}
	    ulElement.appendChild(liElement);
	}

	getDocumentFragment() {
		let template = '<nav class="tab-menu">';
		template += '<ul>';
		for(let [panelID, panel] of this.panels) {
			template += '<li';
			if(panelID === this.currentPanelID) {
				template += ' class="selected"';
			}
			template += '>';
			template += '<a class="action-select-tab" href="#' + panelID + '" title="' + panel.name + '">';
			let tabIcon = this.tabIcons.get(panelID);
			if(tabIcon != null) {
				template += '<i class="' + tabIcon + '"></i>';
			}
			template += panel.name;
			template += '</a>';
			if(this.hasCloseButtons.get(panelID)) {
				template += '<button class="close-button" type="reset" title="Close"><i class="fa fa-times fa-lg"></i></button>';
			}
			template += '</li>';
		}
		template += '</ul>';
		let myDocumentFragment = document.createRange().createContextualFragment(template);
		let mergedDocumentFragment = super.getDocumentFragment(myDocumentFragment);

		return mergedDocumentFragment;
	}

	init() {
	    let thisEditorElement = this;
	    let tabMenu = document.getElementById(this.id);
		let aElements = tabMenu.querySelectorAll('.action-select-tab');
		if(aElements) {
			for(let i=0;i < aElements.length;i++) {
			    aElements[i].addEventListener('click', function(ev) {
			    	ev.preventDefault();
			        let href = this.getAttribute('href');
			        let panelID = href.substring(1);
			        thisEditorElement.selectPanelById(panelID);
			        return false;
			    });
			}
		}
		let closeButtons = tabMenu.querySelectorAll('.close-button');
		if(closeButtons) {
			for(let i=0;i < closeButtons.length;i++) {
			    closeButtons[i].addEventListener('click', function(ev) {
			    	ev.preventDefault();
			        let liParent = this.parentNode;
			        let aElement = liParent.querySelector('a');
			        let href = aElement.getAttribute('href');
			        let panelID = href.substring(1);
			        thisEditorElement.removePanelById(panelID);
			        return false;
			    });
			}
		}
	}

	selectPanelById(panelID) {
		// Defensive programming...check input...
		if(panelID === undefined || panelID === null) {
			return;
		}
		panelID = panelID.trim();
		// If this is already the currently selected panel, we ignore the request.
		if(this.currentPanelID === panelID) {
			return;
		}
		// Check if we have already been initialized (getDocumentFragment was called and
		// we were added to the DOM).
		let tabMenu = document.getElementById(this.id);
		if(tabMenu === undefined || tabMenu === null) {
			// We haven't even been added to the DOM yet. All we do is set our
			// currentPanel and currentPanelID properties.
			if(this.panels.has(panelID)) {
				this.currentPanel = this.panels.get(panelID);
				this.currentPanelID = panelID;
			} else {
				this.currentPanel = null;
				this.currentPanelID = null;
			}
			return;
		}
		// Hide the currently selected panel.
		if(this.currentPanel != null) {
			this.currentPanel.hide();
		}
		// Remove the selected class from the currently selected tab item.
	    let selected = tabMenu.querySelector('li.selected');
	    if((selected != undefined) && (selected != null)) {
			selected.classList.remove('selected');
		}
		// Retrieve the new currently selected panel.
		this.currentPanel = this.panels.get(panelID);
		if(this.currentPanel != null) {
			this.currentPanelID = panelID;
			this.currentPanel.show();
			let actionSelectTab = tabMenu.querySelector('a.action-select-tab[href="#' + this.currentPanel.id + '"]');
			if((actionSelectTab != undefined) && (actionSelectTab != null)) {
				actionSelectTab.parentNode.classList.add('selected');
			}
		} else {
			this.currentPanelID = null;
		}
	}
}