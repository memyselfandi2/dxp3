class PagePanel extends Panel {
	constructor(_applicationUUID, pageUUID, pageName, isTemplate, parentUUIDs, parentNames, description) {
		super(pageUUID, pageName);
		this.applicationUUID = _applicationUUID;
		this.pageUUID = pageUUID;
		this.pageName = pageName;
		this.isTemplate = isTemplate;
		this.parentUUIDs = parentUUIDs;
		this.parentNames = parentNames;
		this.description = description;

		this.infoPanel = new PageInfoPanel(null,
										'Details',
										this,
										this.applicationUUID,
										this.pageUUID,
										this.pageName,
										this.isTemplate,
										this.parentUUIDs,
										this.parentNames,
										this.description);
		this.infoPanel.addClass('one-column');
		this.infoPanel.collapse();
		this.layoutPanel = new LayoutPanel(null, pageUUID, PageDAO);
		this.layoutPanel.addClass('two-column');
		this.controllerPanel = new ControllerPanel(null, pageUUID, PageDAO);
		this.controllerPanel.addClass('two-column');
		this.stylePanel = new StylePanel(null, pageUUID, PageDAO);
		this.stylePanel.addClass('two-column');
		this.previewPanel = new PreviewPanel(null, this.applicationUUID, pageUUID, PageDAO);
		this.previewPanel.addClass('two-column');
	}

	getDocumentFragment() {
		let template = '';
		template += '<div class="page-panel">';
		template += '</div>';
		let myDocumentFragment = document.createRange().createContextualFragment(template);
		let mergedDocumentFragment = super.getDocumentFragment(myDocumentFragment);

		let element = mergedDocumentFragment.querySelector('.page-panel');
		element.appendChild(this.infoPanel.getDocumentFragment());
		element.appendChild(this.layoutPanel.getDocumentFragment());
		element.appendChild(this.controllerPanel.getDocumentFragment());
		element.appendChild(this.stylePanel.getDocumentFragment());
		element.appendChild(this.previewPanel.getDocumentFragment());


    // // Save action
    // frag.querySelector('.action-save-page-layout').addEventListener('click', function(ev) {
    //     editorPagePanel.savePageLayout(pageUUID);
    // });
    // frag.querySelector('.select-page-layout-version').addEventListener('click', function(ev) {
    //     ev.preventDefault();
    //     ev.stopPropagation();
    //     return false;
    // });
    // frag.querySelector('.select-page-layout-version').addEventListener('focus', function(ev) {
    //     ev.preventDefault();
    //     ev.stopPropagation();
    //     let popup = this.parentNode.querySelector('.page-select-layout-version-popup');
    //     Popup.show(popup);
    //     return false;
    // });
    // frag.querySelector('.action-fullscreen').addEventListener('click', function(ev) {
    //     this.parentNode.parentNode.classList.add('fullscreen');
    //     this.classList.add('hide');
    //     let minimizeAction = this.parentNode.querySelector('.action-minimize');
    //     minimizeAction.classList.remove('hide');
    // });
    // frag.querySelector('.action-minimize').addEventListener('click', function(ev) {
    //     this.parentNode.parentNode.classList.remove('fullscreen');
    //     this.classList.add('hide');
    //     let fullscreenAction = this.parentNode.querySelector('.action-fullscreen');
    //     fullscreenAction.classList.remove('hide');
    // });
		return mergedDocumentFragment;
	}

	init() {
		this.infoPanel.init();
		this.layoutPanel.init();
		this.controllerPanel.init();
		this.stylePanel.init();
		this.previewPanel.init();
		this.previewPanel.previewPage(this.pageUUID);
		
	    super.init();
	}

	update(name, isTemplate, parentUUIDs, parentNames, description) {
		this.name = name;
		this.isTemplate = isTemplate;
		this.parentUUIDs = parentUUIDs;
		this.parentNames = parentNames;
		this.description = description;
		this.infoPanel.update(name, isTemplate, parentUUIDs, parentNames, description);
	}
}