class ApplicationPanel extends Panel {

	constructor(applicationUUID, applicationName, isTemplate, parentUUIDs, parentNames, shortName, pageUUID, pageName, description) {
		super(applicationUUID, applicationName);
		this.isTemplate = isTemplate;
		this.parentUUIDs = parentUUIDs;
		this.parentNames = parentNames;
		this.shortName = shortName;
		this.pageUUID = pageUUID;
		this.pageName = pageName;
		this.description = description;

		this.applicationDetailsPanel = new ApplicationDetailsPanel(null, 'Details', this, applicationUUID, applicationName, isTemplate, parentUUIDs, parentNames, shortName, pageUUID, pageName, description);
		this.pagesPanel = new PagesPanel(null, 'Pages', this, applicationUUID);
		this.featuresPanel = new FeaturesPanel(null, 'Features', this, applicationUUID);
		this.categoriesPanel = new CategoriesPanel(null, 'Categories', this, applicationUUID);
		this.contentTypesPanel = new ContentTypesPanel(null, 'Content types', this, applicationUUID);
		this.contentPanel = new ContentPanel(null, 'Content', this, applicationUUID);

		this.applicationPanelMenu = new PanelMenu();
		this.applicationPanelMenu.addPanel(this.applicationDetailsPanel, 'fa fa-info');
		this.applicationPanelMenu.addPanel(this.pagesPanel, 'fa fa-object-group');
		this.applicationPanelMenu.addPanel(this.featuresPanel, 'fa fa-code');
		this.applicationPanelMenu.addPanel(this.categoriesPanel, 'fa fa-tags');
		this.applicationPanelMenu.addPanel(this.contentTypesPanel, 'fa fa-table');
		this.applicationPanelMenu.addPanel(this.contentPanel, 'fa fa-file');

		this.applicationPanelMenu.selectPanelById(this.applicationDetailsPanel.id);
	}

	update(applicationName, isTemplate, parentUUIDs, parentNames, shortName, pageUUID, pageName, description) {
		console.log('application panel update : ' + applicationName + ', ' + isTemplate + ', ' + parentUUIDs + ', ' + parentNames + ', ' + shortName + ', ' + pageUUID + ', ' + pageName + ', ' + description);
		this.name = applicationName;
		this.isTemplate = isTemplate;
		this.parentUUIDs = parentUUIDs;
		this.parentNames = parentNames;
		this.shortName = shortName;
		this.pageUUID = pageUUID;
		this.pageName = pageName;
		this.description = description;
		this.applicationDetailsPanel.update(applicationName, isTemplate, parentUUIDs, parentNames, shortName, pageUUID, pageName, description);
	}

	getDocumentFragment() {
		let template = '<div class="application-panel">';
		template += '</div>';
		let myDocumentFragment = document.createRange().createContextualFragment(template);
		let mergedDocumentFragment = super.getDocumentFragment(myDocumentFragment);

		let element = mergedDocumentFragment.querySelector('.application-panel');
		element.appendChild(this.applicationPanelMenu.getDocumentFragment());
		element.appendChild(this.applicationDetailsPanel.getDocumentFragment());
		element.appendChild(this.pagesPanel.getDocumentFragment());
		element.appendChild(this.featuresPanel.getDocumentFragment());
		element.appendChild(this.categoriesPanel.getDocumentFragment());
		element.appendChild(this.contentTypesPanel.getDocumentFragment());
		element.appendChild(this.contentPanel.getDocumentFragment());
		return mergedDocumentFragment;
	}

	init() {
		this.applicationDetailsPanel.init();
		this.pagesPanel.init();
		this.featuresPanel.init();
		this.categoriesPanel.init();
		this.contentTypesPanel.init();
		this.contentPanel.init();
		this.applicationPanelMenu.init();
		
		super.init();
	}
}