class ApplicationDetailsPanel extends Panel {

	constructor(id, name, _applicationPanel, _applicationUUID, _applicationName, _isTemplate, _parentUUIDs, _parentNames, _shortName, _pageUUID, _pageName, _description) {
		super(id, name);
		this.applicationUUID = _applicationUUID;
		this.applicationName = _applicationName;
		this.applicationPanel = _applicationPanel;
		this.isTemplate = _isTemplate;
		this.parentUUIDs = _parentUUIDs;
		this.parentNames = _parentNames;
		this.shortName = _shortName;
		this.pageUUID = _pageUUID;
		this.pageName = _pageName;
		this.description = _description;

		this.applicationInfoPanel = new ApplicationInfoPanel(null, name,_applicationPanel, _applicationUUID, _applicationName, _isTemplate, _parentUUIDs, _parentNames, _shortName, _pageUUID, _pageName, _description);
		this.controllerPanel = new ControllerPanel(null, this.applicationUUID, ApplicationDAO);
		this.stylePanel = new StylePanel(null, this.applicationUUID, ApplicationDAO);
		this.previewPanel = new PreviewPanel(null, this.applicationUUID, null, PageDAO);

		let thisPreviewPanel = this.previewPanel;
		this.selectPageToPreview = new SelectPageInputField(null, this.applicationUUID, null, 'Select page...');
		this.previewPanel.addMenuInputField(this.selectPageToPreview);
		this.selectPageToPreview.addEventListener('select', function(ev) {
			let pageUUID = ev.pageUUID;
			thisPreviewPanel.previewPage(pageUUID);
		});
	}

	getDocumentFragment() {
		let template = '';
		template += '<div class="application-details-panel">';
		template += '</div>';
		let myDocumentFragment = document.createRange().createContextualFragment(template);
		let mergedDocumentFragment = super.getDocumentFragment(myDocumentFragment);

		let element = mergedDocumentFragment.querySelector('.application-details-panel');
		element.appendChild(this.applicationInfoPanel.getDocumentFragment());
		element.appendChild(this.controllerPanel.getDocumentFragment());
		element.appendChild(this.stylePanel.getDocumentFragment());
		element.appendChild(this.previewPanel.getDocumentFragment());
		return mergedDocumentFragment;
	}

	init() {
		this.applicationInfoPanel.init();
		this.controllerPanel.init();
		this.stylePanel.init();
		this.previewPanel.init();

		super.init();
	}

	update(applicationName, isTemplate, parentUUIDs, parentNames, shortName, pageUUID, pageName, description) {
		this.applicationInfoPanel.update(applicationName, isTemplate, parentUUIDs, parentNames, shortName, pageUUID, pageName, description);
	}
}