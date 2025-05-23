class PagesPanel extends Panel {
	constructor(id, name, _applicationPanel, _applicationUUID, _applicationName) {
		super(id, name, true);
		this.applicationUUID = _applicationUUID;
		this.applicationPanel = _applicationPanel;
		this.applicationName = _applicationName;

		this.selectPageInputField = new SelectPageInputField(null,
															this.applicationUUID,
														   null,
														   'Select a page',
														   true);
		let thisEditorElement = this;
		this.selectPageInputField.addEventListener('select', function(ev) {
			thisEditorElement.loadPage(ev.pageUUID);
		});

		this.createPageInputField = new CreatePageInputField(null,
														   null,
														   'Create a page',
														   this.applicationUUID);
		this.pagePanels = new Map();

		this.pagesTabMenu = new TabMenu();
		this.homePanel = new PagesHomePanel();

		this.pagesTabMenu.addPanel(this.homePanel, 'fa fa-home', false);
		this.pagesTabMenu.selectPanelById(this.homePanel.id);
		this.pagesTabMenu.addEventListener('close', function(pageUUID) {
			let pagePanel = thisEditorElement.pagePanels.get(pageUUID);
			if(pagePanel === undefined || pagePanel == null) {
				return;
			}
			thisEditorElement.pagePanels.delete(pageUUID);
			document.getElementById(pagePanel.id).remove();
			let selectedPanel = thisEditorElement.pagesTabMenu.getSelectedPanel();
			if(selectedPanel === null) {
				thisEditorElement.pagesTabMenu.selectPanelById(thisEditorElement.homePanel.id);
			}
		});

		PageDAO.addEventListener('create', function(event) {
			let applicationUUID = event.applicationUUID;
			let pageUUID = event.uuid;
			if(thisEditorElement.applicationUUID != applicationUUID) {
				return;
			}
			thisEditorElement.loadPage(pageUUID);
		});
		PageDAO.addEventListener('delete', function(event) {
			let pageUUID = event.uuid;
			thisEditorElement.pagesTabMenu.removePanelById(pageUUID);
		});
		PageDAO.addEventListener('update', function(event) {
			let pageUUID = event.uuid;
			let pagePanel = thisEditorElement.pagePanels.get(pageUUID);
			if(pagePanel === undefined || pagePanel === null) {
				return;
			}
			thisEditorElement.loadPage(event.pageUUID);
		});
	}

	init() {
		this.homePanel.init();
		this.createPageInputField.init();
		this.selectPageInputField.init();
		super.init();
	}


	getDocumentFragment() {
		let template = '';
		template += '<div class="pages-panel">';
		template += 	'<div class="header">';
		template += 		'<div class="column large">';
		template += 			'<div id="select-page-input-field-and-popup"></div>';
		template += 		'</div>';
		template += 		'<div class="column large">';
		template += 			'<div id="create-page-input-field-and-popup"></div>';
		template += 		'</div>';
		template += 	'</div>';
		template += 	'<div class="page-panels content"></div>';
		template += '</div>';
		let myDocumentFragment = document.createRange().createContextualFragment(template);
		let mergedDocumentFragment = super.getDocumentFragment(myDocumentFragment);

		let child = mergedDocumentFragment.querySelector('.page-panels');
		child.appendChild(this.pagesTabMenu.getDocumentFragment());
		child.appendChild(this.homePanel.getDocumentFragment());

		child = mergedDocumentFragment.querySelector('#select-page-input-field-and-popup');
		child.parentNode.replaceChild(this.selectPageInputField.getDocumentFragment(), child);

		child = mergedDocumentFragment.querySelector('#create-page-input-field-and-popup');
		child.parentNode.replaceChild(this.createPageInputField.getDocumentFragment(), child);
		return mergedDocumentFragment;
	}

	loadPage(pageUUID) {
		if(pageUUID === undefined || pageUUID === null) {
			pageUUID = '';
		}
		pageUUID = pageUUID.trim();
		if(pageUUID.length <= 0) {
			return;
		}
		let thisEditorElement = this;
		PageDAO.read(pageUUID, function(data, error) {
			if((error != undefined) && (error != null)) {
				return;
			}
			console.log('read page : ' + pageUUID);
			// Check if this page already has a panel.
			let pagePanel = thisEditorElement.pagePanels.get(pageUUID);
			if(pagePanel === undefined || pagePanel === null) {
				pagePanel = new PagePanel(thisEditorElement.applicationUUID, data.uuid, data.name, data.isTemplate, data.parentUUIDs, data.parentNames, data.description);
				thisEditorElement.pagePanels.set(pageUUID, pagePanel);
				let pagesPanelElement = document.getElementById(thisEditorElement.id);
				let pagePanelsElement = pagesPanelElement.querySelector('.page-panels');
				pagePanelsElement.appendChild(pagePanel.getDocumentFragment());
				pagePanel.init();
				thisEditorElement.pagesTabMenu.addPanel(pagePanel, null);
			} else {
				pagePanel.name = data.name;
    			pagePanel.update(data.name, data.isTemplate, data.parentUUIDs, data.parentNames, data.description);
				thisEditorElement.pagesTabMenu.updatePanel(pagePanel, null);
    		}
	    	thisEditorElement.pagesTabMenu.selectPanelById(pagePanel.id);
		});
	}

	//     template = '<div class="header">' +
	// 					'<div class="column large">' +
	// 						'<div class="select-page-input-field input-field text border">' +
	//                             '<input class="select-page" type="text" name="search" placeholder="Select a page">' +
	//                             '<div class="input-field-buttons">' +
	//                                 '<button class="clear-button" type="reset" title="Clear"><i class="fa fa-trash-alt"></i></button>' +
	//                                 '<button class="search-button" type="submit" title="Search"><i class="fa fa-search"></i></button>' +
	//                             '</div>' +
	//                             '<div class="select-page-popup popup large toplevel border">' +
	//                                 '<div class="menu">' +
	//                                     '<div class="loading menu-icon"><img class="icon-loading" src="/web/images/loading-spinner.gif"/></div>' +
	//                                     '<a class="action-help menu-icon" href="#" title="Help"><i class="far fa-question-circle"></i></a>' +
	//                                     '<a class="action-close menu-icon" href="#" title="Close" ><i class="far fa-window-close"></i></a>' +
	//                                 '</div>' +
	//                                 '<div class="form-panel">' +
	//                                     '<div class="filter-panel">' +
	//                                         '<form>' +
	//                                             '<fieldset>' +
	//                                                 '<legend>Filter</legend>' +
	//                                                 '<label><input class="filter-radio-button" type="radio" name="filter-page-type" value="all" checked="checked"/>' +
	//                                                 'Include all</label><br/>' +
	//                                                 '<label><input class="filter-radio-button" type="radio" name="filter-page-type" value="pageonly"/>' +
	//                                                 'Page only</label><br/>' +
	//                                                 '<label><input class="filter-radio-button" type="radio" name="filter-page-type" value="templateonly"/>' +
	//                                                 'Template only</label><br/>' +
	//                                             '</fieldset>' +
	//                                         '</form>' +
	//                                     '</div>' +
	//                                     '<div class="message-panel">' +
	//                                         '<span class="message"></span>&nbsp;<i class="fa fa-warning"></i>' +
	//                                     '</div>' +
	//                                     '<div class="list">' +
	//                                         '<table>' +
	//                                             '<thead>' +
	//                                                 '<tr>' +
	//                                                     '<th><a class="action-list-item sort-by" href="#name">Name&nbsp;<i class="fa fa-sort"></i></a></th>' +
	//                                                     '<th><a class="action-list-item sort-by" href="#parentNames">Parent&nbsp;<i class="fa fa-sort"></i></a></th>' +
	//                                                     '<th><a class="action-list-item small sort-by" href="#isTemplate">Template&nbsp;<i class="fa fa-sort"></i></a></th>' +
	//                                                 '</tr>' +
	//                                             '</thead>' +
	//                                             '<tbody>' +
	//                                             '</tbody>' +
	//                                         '</table>' +
	//                                     '</div>' +
	//                                 '</div>' +
	//                             '</div>' +
	//                         '</div>' +
	// 					'</div>' +
	//                     '<div class="column large">' +
	//                         '<div class="create-page-input-field input-field text border">' +
	//                             '<input type="text" name="name" placeholder="Create a page"/>' +
	//                             '<div class="input-field-buttons">' +
	//                                 '<button class="clear-button" type="reset" title="Clear"><i class="fa fa-trash-alt"></i></button>' +
	//                                 '<button class="create-button" type="submit" title="Create"><i class="fa fa-magic"></i></button>' +
	//                             '</div>' +
	//                             '<div class="create-page-popup popup toplevel border">' +
	//                                 '<div class="menu">' +
	//                                     '<div class="loading menu-icon"><img class="icon-loading" src="/web/images/loading-spinner.gif"/></div>' +
	//                                     '<a class="action-help menu-icon" href="#" title="Help"><i class="far fa-question-circle"></i></a>' +
	//                                     '<a class="action-close menu-icon" href="#" title="Close" ><i class="far fa-window-close"></i></a>' +
	//                                 '</div>' +
	//                                 '<div class="form-panel">' +
	//                                     '<div class="input-field radio-buttons border">' +
	//                                         '<span>Is this a template?</span>' +
	//                                         '<input class="create-page-is-template-yes" type="radio" name="isTemplate" value="true"/>Yes' +
	//                                         '<input class="create-page-is-template-no" type="radio" name="isTemplate" value="false" checked="checked"/>No' +
	//                                     '</div>' +
	//                                     '<div class="input-field textarea border">' +
	//                                         '<textarea class="create-page-description" name="description" placeholder="Description"></textarea>' +
	//                                         '<div class="input-field-buttons">' +
	//                                             '<button type="reset" class="clear-button" title="Clear"><i class="fa fa-trash-alt"></i></button>' +
	//                                         '</div>' +
	//                                     '</div>' +
	//                                     '<div class="message-panel">' +
	//                                         '<span class="message"></span>&nbsp;<i class="fa fa-warning"></i>' +
	//                                     '</div>' +
	//                                     '<div class="buttons">' +
	//                                         '<a class="create-page-save-and-close action-save shade-of-green" title="Save and close" href="#">' +
	//                                             '<i class="fa fa-check"></i>&nbsp;Save' +
	//                                         '</a>' +
	//                                         '<a class="create-page-save-and-new action-save" title="Save and new" href="#">' +
	//                                             '<i class="fa fa-plus"></i>&nbsp;Save and new' +
	//                                         '</a>' +
	//                                         '<a class="create-page-cancel action-cancel shade-of-red" title="Cancel" href="#">' +
	//                                             '<i class="fa fa-times"></i>&nbsp;Cancel' +
	//                                         '</a>' +
	//                                     '</div>' +
	//                                 '</div>' +
	//                             '</div>' +
	//                         '</div>' +
	//                     '</div>' +
	//                 '</div>';
}