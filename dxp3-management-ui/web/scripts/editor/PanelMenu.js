class PanelMenu extends EditorElement {

	constructor(id) {
		super(id);
		this.currentPanel = null;
		this.currentPanelID = null;
		this.panels = new Map();
		this.panelIcons = new Map();
	}

	addPanel(panel, panelIcon) {
		if(panel === undefined || panel === null) {
			return;
		}
		this.panels.set(panel.id, panel);
		this.panelIcons.set(panel.id, panelIcon);
		panel.hide();
	}

	init() {
		let thisEditorElement = this;
		let nav = document.getElementById(this.id);
		nav.addEventListener('mouseenter', function(ev) {
			thisEditorElement.show();
		});
		nav.addEventListener('mouseleave', function(ev) {
			thisEditorElement.hide();
		});
		let actions = nav.querySelectorAll('.action-select-panel');
		for(let i=0;i < actions.length;i++) {
			actions[i].addEventListener('click', function(ev) {
				let href = this.getAttribute('href');
				let panelID = href.substring(1);
				thisEditorElement.selectPanelById(panelID);
			});
		}
	}

	getDocumentFragment() {
		let template = '<nav class="panel-menu">';
		template += '<ul>';
		for(let [panelID, panel] of this.panels) {
			template += '<li';
			if(panelID === this.currentPanelID) {
				template += ' class="selected"';
			}
			template += '>';
			template += '<a class="action-select-panel" href="#' + panelID + '" title="' + panel.name + '">';
			template += '<i class="' + this.panelIcons.get(panelID) + '"></i>';
			template += panel.name;
			template += '</a></li>';
		}
		template += '</ul>';
		template += '</nav>';
		let myDocumentFragment = document.createRange().createContextualFragment(template);
		let mergedDocumentFragment = super.getDocumentFragment(myDocumentFragment);

		return mergedDocumentFragment;
	}

	selectPanelById(panelID) {
		// Defensive programming...check input...
		if(panelID === undefined || panelID === null) {
			return;
		}
		panelID = panelID.trim();
		if(panelID.length <= 0) {
			return;
		}
		// If this is already the currently selected panel, we ignore the request.
		if(this.currentPanelID === panelID) {
			return;
		}
		// Check if we have already been initialized (getDocumentFragment was called and
		// we were added to the DOM).
		let thisEditorElement = document.getElementById(this.id);
		if(thisEditorElement === undefined || thisEditorElement === null) {
			// We haven't even been added to the DOM yet. All we do is set our
			// currentPanel and currentPanelID properties.
			if(this.panels.has(panelID)) {
				this.currentPanel = this.panels.get(panelID);
				this.currentPanelID = panelID;
				this.currentPanel.show();
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
		// Remove the selected class from the currently selected menu item.
	    let selected = thisEditorElement.querySelector('li.selected');
	    if((selected != undefined) && (selected != null)) {
			selected.classList.remove('selected');
		}
		// Retrieve the new currently selected panel.
		this.currentPanel = this.panels.get(panelID);
		if(this.currentPanel != null) {
			this.currentPanelID = panelID;
			this.currentPanel.show();
			let actionSelectPanel = thisEditorElement.querySelector('a.action-select-panel[href="#' + this.currentPanel.id + '"]');
			if((actionSelectPanel != undefined) && (actionSelectPanel != null)) {
				actionSelectPanel.parentNode.classList.add('selected');
			}
		} else {
			this.currentPanelID = null;
		}
		this.hide();
	}

	toggle() {
		let nav = document.getElementById(this.id);
		if(nav.classList.contains('maximized')) {
			this.hide();
		} else {
			this.show();
		}
	}

	show() {
		let nav = document.getElementById(this.id);
		nav.classList.add('maximized');
	}

	hide() {
		let nav = document.getElementById(this.id);
		nav.classList.remove('maximized');
	}
}