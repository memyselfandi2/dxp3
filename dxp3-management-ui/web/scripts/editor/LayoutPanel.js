class LayoutPanel extends AcePanel {
	constructor(id, _reference, _dao) {
		super(id, 'Layout', false, true);

		this.layoutEditor = null;
		this.currentLayout = '';
		this.reference = _reference;
		this.dao = _dao;

	    let layoutVersionInputField = new TextInputField(null,
	                                                         null,
	                                                         'select-layout-version-regex',
	                                                         'select-layout-version',
	                                                         null,
	                                                         null,
	                                                         INPUT_FIELD_TYPES.SEARCH,
	                                                         true,
	                                                         false,
	                                                         false);

	    let thisLayoutPanel = this;
        this.actionLocale = new Action(null, this.reference,'action-locale', 'Locale', 'Locale', 'fa fa-flag', false, function(reference) {
        });
        super.addMenuAction(this.actionLocale);

        this.actionImages = new Action(null, this.reference,'action-images', 'Images', 'Images', 'far fa-image', false, function(reference) {
        });
        super.addMenuAction(this.actionImages);
        this.actionSave = new Action(null, this.reference,'action-save', 'Save', 'Save', 'far fa-save', false, function(reference) {
            thisLayoutPanel.save(reference);
        });
        super.addMenuAction(this.actionSave);

        this.actionCancel = new Action(null, this.reference,'action-cancel', 'Cancel', 'Cancel', 'fa fa-times', false, function(reference) {
        	thisLayoutPanel.cancel(reference);
        });
        super.addMenuAction(this.actionCancel);

        this.actionDelete = new Action(null, this.reference,'action-delete', 'Delete', '', 'fa fa-trash-alt', false, function(reference) {
            let layoutUUID = thisLayoutPanel.layoutUUID;
            thisLayoutPanel.dao.deleteLayout(thisLayoutPanel.reference,
                layoutUUID,
                function(error, uuid) {
                    thisLayoutPanel.loadFirstLayout();
                }
            );
        });
        super.addMenuAction(this.actionDelete);
	}

	getDocumentFragment() {
    let template = '<div class="layout-panel border">';
//     template += '<div class="header">' +
//                         '<a href="#" title="fullscreen" class="action-fullscreen"><i class="fa fa-arrows-alt"></i></a>' +
//                         '<a href="#" title="minimize" class="action-minimize hide"><i class="fa fa-compress"></i></a>' +
//                         '<div class="column smaller">Layout</div>' +
//                         '<div class="column smallest">';
//         template +=             '<div id="layout-version-input-field"></div>';
//                                 // '<div class="page-select-layout-version-popup popup toplevel border hide">' +
//                                 //     '<div class="menu">' +
//                                 //         '<div class="loading menu-icon"><img class="icon-loading" src="/web/images/loading-spinner.gif"/></div>' +
//                                 //         '<a class="action-close menu-icon" href="#" title="Close" ><i class="far fa-window-close"></i></a>' +
//                                 //     '</div>' +
//                                 //     '<div class="page-select-controller-list"><ul></ul></div>' +
//                                 // '</div>' +
// template +=                        '</div>' +
//                         '<div class="loading hide"><img class="icon-loading hide" src="/web/images/loading-spinner.gif"></div>' +
//                         '<div class="menu">' +
//                             '<a href="#" title="Locale" class="action-locale" id="action-page-locale"><i class="fa fa-flag"></i>Locale</a>' +
//                             '<a href="#" title="Images" class="action-images action-page-images"><i class="far fa-image"></i>Images</a>' +
//                             '<a href="#" title="Save" class="action-save action-save-layout"><i class="far fa-save"></i>Save</a>' +
//                             '<a href="#" title="Commit" class="action-commit action-commit-layout"><i class="far fa-check-square"></i>Commit</a>' +
//                             '<a href="#" title="Cancel" class="action-cancel action-cancel-layout"><i class="fa fa-times"></i>Cancel</a>' +
//                             '<a class="action-message hide" href="#" title="Message"><i class="fa fa-bullhorn"></i></a>' +
//                             '<a class="action-help" href="#" title="Help"><i class="fa fa-question"></i></a>' +
//                         '</div>' +
//                     '</div>';
    template += '</div>';

    let myDocumentFragment = document.createRange().createContextualFragment(template);
    let mergedDocumentFragment = super.getDocumentFragment(myDocumentFragment);

    var layoutEditor = document.createElement('div');
    layoutEditor.setAttribute('id', 'layout-' + this.id);
    layoutEditor.setAttribute('class', 'layout-editor text-editor');
    mergedDocumentFragment.querySelector('.layout-panel').appendChild(layoutEditor);
    return mergedDocumentFragment;
	}

	init() {
		this.layoutEditor = ace.edit('layout-' + this.id);
		this.layoutEditor.setTheme("ace/theme/monokai");
		this.layoutEditor.getSession().setMode("ace/mode/html");
		this.layoutEditor.setValue('', -1);
		this.actionSave.disable();
		this.actionCancel.disable();

		let thisLayoutPanel = this;
		this.layoutEditor.session.on('change', function(delta) {
			thisLayoutPanel.actionSave.enable();
			thisLayoutPanel.actionCancel.enable();
		});

		super.init();

        this.loadFirstLayout();
	}


    reset() {
        this.layoutName = null;
        this.layoutUUID = null;
        this.setValue('');
        this.actionSave.disable();
        this.actionCancel.disable();
        this.actionDelete.disable();
        this.layoutEditor.focus();
    }

    loadFirstLayout() {
        let thisLayoutPanel = this;
        this.showLoading();
        this.dao.readLayout(this.reference, null, function(err, result) {
            if(err) {
                thisLayoutPanel.hideLoading();
                thisLayoutPanel.reset();
                return;
            }
            if(result === undefined || result === null) {
                thisLayoutPanel.hideLoading();
                thisLayoutPanel.reset();
                return;
            }
            if(result.list.length <= 0) {
                thisLayoutPanel.hideLoading();
                thisLayoutPanel.reset();
                return;
            }
            thisLayoutPanel.dao.readLayout(thisLayoutPanel.reference, result.list[0].uuid, function(err, data) {
                thisLayoutPanel.hideLoading();
                if(err) {
                    thisLayoutPanel.reset();
                    return;
                }
                thisLayoutPanel.layoutUUID = data.uuid;
                thisLayoutPanel.setValue(data.code);
                thisLayoutPanel.actionSave.disable();
                thisLayoutPanel.actionCancel.disable();
                thisLayoutPanel.actionDelete.enable();
            });
        });
    }

	cancel(reference) {
		this.layoutEditor.setValue(this.currentLayout);
		this.actionSave.disable();
		this.actionCancel.disable();
	}

	save(reference) {
        let code = this.layoutEditor.getValue();
        if(code === this.currentCode) {
            return;
        }
        let thisLayoutPanel = this;
        thisLayoutPanel.showLoading();
        let layoutName = this.layoutName;
        let layoutUUID = this.layoutUUID;
        if(layoutName === undefined || layoutName === null) {
            layoutName = '';
        }
        layoutName = layoutName.trim();
        if(layoutName.length <= 0) {
            layoutName = 'default';
        }
        if(layoutUUID === undefined || layoutUUID === null) {
            this.dao.createLayout(this.reference, layoutName, null, code, function(error, uuid, name) {
                thisLayoutPanel.hideLoading();
                if(error) {
                    return;
                }
                thisLayoutPanel.layoutName = name;
                thisLayoutPanel.layoutUUID = uuid;
                thisLayoutPanel.currentCode = code;
                thisLayoutPanel.actionSave.disable();
                thisLayoutPanel.actionCancel.disable();
                thisLayoutPanel.actionDelete.enable();
            });
        } else {
            this.dao.updateLayout(this.reference, layoutUUID, layoutName, null, code, function(error, uuid) {
                thisLayoutPanel.hideLoading();
                if(error) {
                    return;
                }
                thisLayoutPanel.currentCode = code;
                thisLayoutPanel.actionSave.disable();
                thisLayoutPanel.actionCancel.disable();
                thisLayoutPanel.actionDelete.enable();
            });
        }
	}

	setValue(code) {
		if(code === undefined || code === null) {
			code = '';
		}
		this.currentLayout = code;
		this.layoutEditor.setValue(this.currentLayout);
	}
}