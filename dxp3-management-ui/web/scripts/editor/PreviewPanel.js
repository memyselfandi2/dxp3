class PreviewPanel extends AcePanel {
	constructor(id, _applicationUUID, _reference, _dao) {
		super(id, 'Preview');

        this.applicationUUID = _applicationUUID;
        this.reference = _reference;
        this.dao = _dao;

        this.frame = new Frame(null);

// '<a href="#" title="Show mobile view" class="action-mobile" id="action-page-mobile-preview"><i class="fa fa-mobile"></i></a>' + 
// '<a href="#" title="Show tablet view" class="action-tablet" id="action-page-tablet-preview"><i class="fa fa-tablet"></i></a>' + 
// '<a href="#" title="Show desktop view" class="action-desktop" id="action-page-desktop-preview"><i class="fa fa-desktop"></i></a>' + 
// '<a href="#" title="Toggle debug mode" class="action-debug" id="action-page-toggle-debug"><i class="fa fa-bug"></i></a>' + 
// '<a href="#" title="Refresh" class="action-refresh" id="action-refresh-page-preview"><i class="fa fa-refresh"></i></a>' + 

        let self = this;
        this.actionMobile = new Action(null, '', 'action-mobile', 'Show mobile view', '', 'fa fa-mobile', false, function() {
        });
        super.addMenuAction(this.actionMobile);

        this.actionTablet = new Action(null, '','action-tablet', 'Show tablet view', '', 'fa fa-tablet', false, function() {
        });
        super.addMenuAction(this.actionTablet);

        this.actionDesktop = new Action(null, '','action-desktop', 'Show desktop view', '', 'fa fa-desktop', false, function() {

        });
        super.addMenuAction(this.actionDesktop);

        this.actionDebug = new Action(null, '','action-debug', 'Toggle debug mode', '', 'fa fa-bug', false, function() {

        });
        super.addMenuAction(this.actionDebug);

        this.actionRefresh = new Action(null,'','action-refresh', 'Refresh', '', 'fa fa-redo', false, function() {
            self.refresh();
        });
        super.addMenuAction(this.actionRefresh);
	}

	getDocumentFragment() {
        let template = '<div class="page-preview border">';
    // template += '<div class="header">' +
    //                     '<a href="#" title="fullscreen" class="action-fullscreen" style=""><i class="fa fa-arrows-alt"></i></a>' + 
    //                     '<a href="#" title="minimize" class="action-minimize hide"><i class="fa fa-compress"></i></a>' + 
    //                     '<div class="column smaller">Preview</div>' + 
    //                     '<div class="column large">' + 
    //                         '<div class="select-page-preview-locale input-field dropdown border">' + 
    //                             '<input class="action-select-page-preview-locale-input" type="text" placeholder="Select locale" name="search">' + 
    //                             '<div class="input-field-buttons">' +
    //                                 '<button class="clear-button" type="reset" title="Clear"><i class="fa fa-trash-alt"></i></button>' +
    //                                 '<button class="search-button" type="submit" title="Search"><i class="fa fa-chevron-down"></i></button>' +
    //                             '</div>' +
    //                             '<div class="page-select-page-preview-locale-popup popup toplevel border hide">' +
    //                                 '<div class="menu">' +
    //                                     '<div class="loading menu-icon"><img class="icon-loading" src="/web/images/loading-spinner.gif"/></div>' +
    //                                     '<a class="action-close menu-icon" href="#" title="Close" ><i class="far fa-window-close"></i></a>' +
    //                                 '</div>' +
    //                                 '<div class="page-select-controller-list"><ul></ul></div>' +
    //                             '</div>' +
    //                         '</div>' + 
    //                     '</div>' + 
    //                     '<div class="loading hide">' + 
    //                         '<img class="icon-loading" src="/web/images/loading-spinner.gif">' + 
    //                     '</div>' + 
    //                     '<div class="menu">' + 
    //                         '<a href="#" title="Show mobile view" class="action-mobile" id="action-page-mobile-preview"><i class="fa fa-mobile"></i></a>' + 
    //                         '<a href="#" title="Show tablet view" class="action-tablet" id="action-page-tablet-preview"><i class="fa fa-tablet"></i></a>' + 
    //                         '<a href="#" title="Show desktop view" class="action-desktop" id="action-page-desktop-preview"><i class="fa fa-desktop"></i></a>' + 
    //                         '<a href="#" title="Toggle debug mode" class="action-debug" id="action-page-toggle-debug"><i class="fa fa-bug"></i></a>' + 
    //                         '<a href="#" title="Refresh" class="action-refresh" id="action-refresh-page-preview"><i class="fa fa-refresh"></i></a>' + 
    //                         '<a class="action-help" href="#" title="Help"><i class="fa fa-question"></i></a>' + 
    //                     '</div>' + 
    //                 '</div>';
    template += '</div>';

    let myDocumentFragment = document.createRange().createContextualFragment(template);
    let mergedDocumentFragment = super.getDocumentFragment(myDocumentFragment);
    mergedDocumentFragment.firstChild.appendChild(this.frame.getDocumentFragment());
    return mergedDocumentFragment;

	// frag = document.createRange().createContextualFragment(pagePreviewHeader);
 //    frag.querySelector('.action-fullscreen').addEventListener('click', function(ev) {
 //        this.parentNode.parentNode.classList.add('fullscreen');
 //        this.classList.add('hide');
 //        let minimizeAction = this.parentNode.querySelector('.action-minimize');
 //        minimizeAction.classList.remove('hide');
 //    });
 //    frag.querySelector('.action-minimize').addEventListener('click', function(ev) {
 //        this.parentNode.parentNode.classList.remove('fullscreen');
 //        this.classList.add('hide');
 //        let fullscreenAction = this.parentNode.querySelector('.action-fullscreen');
 //        fullscreenAction.classList.remove('hide');
 //    });
 //    pagePreview.appendChild(frag);
	}

    init() {
        let self = this;
        self.frame.init();
        self.dao.addEventListener('update', function(ev) {
            console.log('PreviewPanel caught update');
            if(self.reference === ev.uuid) {
                self.refresh();
            }
        });
        self.dao.addEventListener('create-controller', function(ev) {
            console.log('PreviewPanel caught create-controller. Self reference: ' + self.reference + '. UUID: ' + ev.ownerUUID);
            if(self.reference === ev.ownerUUID) {
                self.refresh();
            }
        });
        self.dao.addEventListener('create-layout', function(ev) {
            console.log('PreviewPanel caught create-layout. Self reference: ' + self.reference + '. UUID: ' + ev.ownerUUID);
            if(self.reference === ev.ownerUUID) {
                self.refresh();
            }
        });
        self.dao.addEventListener('create-style', function(ev) {
            console.log('PreviewPanel caught create-style. Self reference: ' + self.reference + '. UUID: ' + ev.ownerUUID);
            if(self.reference === ev.ownerUUID) {
                self.refresh();
            }
        });
        self.dao.addEventListener('update-controller', function(ev) {
            console.log('PreviewPanel caught update-controller. Self reference: ' + self.reference + '. UUID: ' + ev.ownerUUID);
            if(self.reference === ev.ownerUUID) {
                self.refresh();
            }
        });
        self.dao.addEventListener('update-layout', function(ev) {
            console.log('PreviewPanel caught update-layout. Self reference: ' + self.reference + '. UUID: ' + ev.ownerUUID);
            if(self.reference === ev.ownerUUID) {
                self.refresh();
            }
        });
        self.dao.addEventListener('update-style', function(ev) {
            console.log('PreviewPanel caught update-style. Self reference: ' + self.reference + '. UUID: ' + ev.ownerUUID);
            if(self.reference === ev.ownerUUID) {
                self.refresh();
            }
        });
        self.dao.addEventListener('delete-controller', function(ev) {
            console.log('PreviewPanel caught delete-controller. Self reference: ' + self.reference + '. UUID: ' + ev.ownerUUID);
            if(self.reference === ev.ownerUUID) {
                self.refresh();
            }
        });
        self.dao.addEventListener('delete-layout', function(ev) {
            console.log('PreviewPanel caught delete-layout. Self reference: ' + self.reference + '. UUID: ' + ev.ownerUUID);
            if(self.reference === ev.ownerUUID) {
                self.refresh();
            }
        });
        self.dao.addEventListener('delete-style', function(ev) {
            console.log('PreviewPanel caught delete-style. Self reference: ' + self.reference + '. UUID: ' + ev.ownerUUID);
            if(self.reference === ev.ownerUUID) {
                self.refresh();
            }
        });
        super.init();
    }

    refresh() {
        console.log('calling PreviewPanel refresh');
        Security.setSrc(this.frame.id, '/preview/' + this.applicationUUID + '/page/' + this.reference);
    }

    previewPage(pageUUID) {
        this.reference = pageUUID;
        this.refresh();
    }
}