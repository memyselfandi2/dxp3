class ControllerPanel extends AcePanel {
    constructor(id, _reference, _dao) {
        super(id, 'Controllers', false, true);

        // The actual editor.
        // Currently this is an ace editor.
        this.controllerEditor = null;
        // The current code
        this.currentCode = '';
        // A reference to an application, page or a feature.
        // Either way this is an UUID.
        this.reference = _reference;
        // A DAO to create, read, update, delete controllers
        // (from an application, a page or a feature).
        this.dao = _dao;

		this.selectControllerInputField = new SelectControllerInputField(null,
																		 null,
																		 '...',
																		 true,
																		 _reference,
																		 _dao);

		this.selectVersionInputField = new SelectVersionInputField(null,
																   null,
																   null,
    															   true);

        this.createControllerPopup = new CreateControllerPopup(null, POPUP_SIZES.SMALL, true,true, true);

        let thisControllerPanel = this;
        super.addMenuInputField(this.selectControllerInputField, 'medium');
        super.addMenuInputField(this.selectVersionInputField, 'smallest');
        
        this.actionNew = new Action(null, this.reference,'action-new', 'New', 'New', 'fa fa-magic', false, function(reference) {
        });
        this.createControllerPopup.alignLeft();
        this.actionNew.popup = this.createControllerPopup;
        this.createControllerPopup.addEventListener('submit', function(ev) {
            let controllerName = ev.controllerName;
            let description = ev.description;
            thisControllerPanel.dao.createController(thisControllerPanel.reference,
                               controllerName,
                               description,
                               null,
                               function(error, uuid, name) {
                    thisControllerPanel.createControllerPopup.hideLoading();
                    if(error) {
                        thisControllerPanel.createControllerPopup.showWarningMessage(error.message);
                        thisControllerPanel.createControllerPopup.focus();
                        return;
                    }
                    thisControllerPanel.createControllerPopup.reset();
                    if(ev.closeOnSuccess) {
                        thisControllerPanel.createControllerPopup.hide();
                        thisControllerPanel.controllerEditor.focus();
                    } else {
                        thisControllerPanel.createControllerPopup.focus();
                    }
                    thisControllerPanel.selectControllerInputField.value = name;
                    thisControllerPanel.selectControllerInputField.uuid = uuid;
                    thisControllerPanel.setValue('');
                    thisControllerPanel.actionDelete.enable();
               }
           );            
        });
        this.createControllerPopup.addEventListener('cancel', function(ev) {
            thisControllerPanel.createControllerPopup.hide();
        });
        super.addMenuAction(this.actionNew);

        this.actionSave = new Action(null, this.reference,'action-save', 'Save', 'Save', 'far fa-save', false, function(reference) { 
            thisControllerPanel.save(reference);
            thisControllerPanel.controllerEditor.focus();
        });
        super.addMenuAction(this.actionSave);

        this.actionCancel = new Action(null, this.reference,'action-cancel', 'Cancel', 'Cancel', 'fa fa-times', false, function(reference) {
            thisControllerPanel.cancel(reference);
            thisControllerPanel.controllerEditor.focus();
        });
        super.addMenuAction(this.actionCancel);

        this.deleteConfirmationPopup = new ConfirmationPopup(null, POPUP_SIZES.SMALL);
        this.deleteConfirmationPopup.addEventListener('submit', function(ev) {
            let controllerName = thisControllerPanel.selectControllerInputField.value;
            let controllerUUID = thisControllerPanel.selectControllerInputField.uuid;
            thisControllerPanel.dao.deleteController(thisControllerPanel.reference,
                controllerUUID,
                function(uuid, error) {
                    thisControllerPanel.loadFirstController();
                }
            );
            thisControllerPanel.deleteConfirmationPopup.hide();
        });
        this.deleteConfirmationPopup.addEventListener('cancel', function(event) {
            thisControllerPanel.deleteConfirmationPopup.hide();
        });
        this.actionDelete = new Action(null, this.reference, 'action-delete', 'Delete', '', 'fa fa-trash-alt', false, function(reference) {
            return false;
        });
        this.actionDelete.popup = this.deleteConfirmationPopup;
        super.addMenuAction(this.actionDelete);

        this.selectControllerInputField.addEventListener('select', function(ev) {
            thisControllerPanel.selectControllerInputField.popup.showLoading();
            thisControllerPanel.dao.readController(thisControllerPanel.reference, ev.controllerUUID, function(err, controller) {
                thisControllerPanel.selectControllerInputField.popup.hideLoading();
                if(err) {
                    thisControllerPanel.selectControllerInputField.popup.showErrorMessage(error.message);
                    return;
                }
                thisControllerPanel.selectControllerInputField.popup.close();
                thisControllerPanel.setValue(controller.code);
                thisControllerPanel.actionSave.disable();
                thisControllerPanel.actionCancel.disable();
                thisControllerPanel.actionDelete.enable();
                thisControllerPanel.controllerEditor.focus();
                thisControllerPanel.controllerEditor.navigateFileEnd();
            });
        })
	}

	getDocumentFragment() {
    let template = '<div class="controller-panel border">';
    // template += '<div class="header">' +
			 //                        '<a href="#" title="fullscreen" class="action-fullscreen" style=""><i class="fa fa-arrows-alt"></i></a>' +
			 //                        '<a href="#" title="minimize" class="action-minimize hide"><i class="fa fa-compress"></i></a>' +
			 //                        '<div class="column small">Controllers</div>' +
			 //                        '<div class="column medium">' +
			 //                        '<div id="select-controller-input-field"></div>' +
			 //                            // '<div class="input-field dropdown border">' +
			 //                            //     '<input class="action-select-page-controller" type="text" placeholder="Select controller" name="search">' +
    //                            //              '<div class="input-field-buttons">' +
    //                            //                  '<button class="clear-button" type="reset" title="Clear"><i class="fa fa-trash-alt"></i></button>' +
    //                            //                  '<button class="search-button" type="submit" title="Search"><i class="fa fa-chevron-down"></i></button>' +
    //                            //              '</div>' +
    //                            //              '<div class="page-select-controller-popup popup toplevel border hide">' +
    //                            //                  '<div class="menu">' +
    //                            //                      '<div class="loading menu-icon"><img class="icon-loading" src="/web/images/loading-spinner.gif"/></div>' +
    //                            //                      '<a class="action-close menu-icon" href="#" title="Close" ><i class="far fa-window-close"></i></a>' +
    //                            //                  '</div>' +
    //                            //                  '<div class="page-select-controller-list"><ul></ul></div>' +
    //                            //              '</div>' +
			 //                            // '</div>' +
			 //                        '</div>' +
			 //                        '<div class="column smallest">' +
			 //                        '<div id="select-version-input-field"></div>' +
			 //                        '</div>' +
			 //                        '<div class="loading hide">' +
			 //                            '<img class="icon-loading" src="/web/images/loading-spinner.gif">' +
			 //                        '</div>' +
			 //                        '<div class="menu">' +
			 //                            '<a href="#" title="Save" class="action-save action-save-page-controller"><i class="far fa-save"></i>Save</a>' +
    //                                     '<a href="#" title="Commit" class="action-commit action-commit-page-controller"><i class="far fa-check-square"></i>Commit</a>' +
			 //                            '<a href="#" title="Cancel" class="action-cancel action-cancel-page-controller"><i class="fa fa-times"></i>Cancel</a>' +
			 //                            '<a class="action-message hide" href="#" title="Message"><i class="fa fa-bullhorn"></i></a>' +
			 //                            '<a class="action-help" href="#" title="Help"><i class="fa fa-question"></i></a>' +
			 //                        '</div>' +
			 //                    '</div>';
    template += '</div>';
    // frag = document.createRange().createContextualFragment(controllerHeader);
    // // Save action
    // frag.querySelector('.action-save-page-controller').addEventListener('click', function(ev) {
    //     ev.preventDefault();
    //     let fileName = this.closest('.header').querySelector('.select-page-controller').value;
    //     editorPagePanel.savePageController(pageUUID, fileName);
    //     return false;
    // });
    // frag.querySelector('.action-select-page-controller').addEventListener('click', function(ev) {
    //     ev.preventDefault();
    //     ev.stopPropagation();
    //     return false;
    // });
    // frag.querySelector('.action-select-page-controller').addEventListener('focus', function(ev) {
    //     ev.preventDefault();
    //     ev.stopPropagation();
    //     let popup = this.parentNode.querySelector('.page-select-controller-popup');
    //     Popup.show(popup);
    //     return false;
    // });
    // frag.querySelector('.input-page-controller-version').addEventListener('click', function(ev) {
    //     ev.preventDefault();
    //     ev.stopPropagation();
    //     return false;
    // });
    // frag.querySelector('.input-page-controller-version').addEventListener('focus', function(ev) {
    //     ev.preventDefault();
    //     ev.stopPropagation();
    //     let popup = this.parentNode.querySelector('.page-select-controller-version-popup');
    //     Popup.show(popup);
    //     return false;
    // });
    let myDocumentFragment = document.createRange().createContextualFragment(template);
    let mergedDocumentFragment = super.getDocumentFragment(myDocumentFragment);

    // let child = mergedDocumentFragment.getElementById('select-controller-input-field');
    // child.parentNode.replaceChild(this.selectControllerInputField.getDocumentFragment(), child);

    // child = mergedDocumentFragment.getElementById('select-version-input-field');
    // child.parentNode.replaceChild(this.selectVersionInputField.getDocumentFragment(), child);

    var controllerEditor = document.createElement('div');
    controllerEditor.setAttribute('id', 'controller-' + this.id);
    controllerEditor.setAttribute('class', 'controller-editor text-editor');
    mergedDocumentFragment.querySelector('.controller-panel').appendChild(controllerEditor);
    return mergedDocumentFragment;
	}

    init() {
        this.controllerEditor = ace.edit("controller-" + this.id);
        this.controllerEditor.setTheme("ace/theme/twilight");
        this.controllerEditor.getSession().setMode("ace/mode/javascript");
        this.controllerEditor.setValue('', -1);
        this.actionNew.enable();
        this.actionSave.disable();
        this.actionCancel.disable();
        this.actionDelete.disable();

        let thisControllerPanel = this;
        this.controllerEditor.session.on('change', function(delta) {
            thisControllerPanel.actionSave.enable();
            thisControllerPanel.actionCancel.enable();
        });

        super.init();

        this.loadFirstController();
    }

    reset() {
        this.selectControllerInputField.value = '';
        this.selectControllerInputField.uuid = null;
        this.setValue('');
        this.actionSave.disable();
        this.actionCancel.disable();
        this.actionDelete.disable();
//        this.controllerEditor.focus();
    }

    loadFirstController() {
        let thisControllerPanel = this;
        this.showLoading();
        this.dao.readController(this.reference, null, function(err, result) {
            if(err) {
                thisControllerPanel.hideLoading();
                thisControllerPanel.reset();
                return;
            }
            if(result === undefined || result === null) {
                thisControllerPanel.hideLoading();
                thisControllerPanel.reset();
                return;
            }
            console.log('result: ' + result + ' typeof: ' + (typeof result));
            if(result.list.length <= 0) {
                thisControllerPanel.hideLoading();
                thisControllerPanel.reset();
                return;
            }
            thisControllerPanel.dao.readController(thisControllerPanel.reference, result.list[0].uuid, function(err, data) {
                thisControllerPanel.hideLoading();
                if(err) {
                    thisControllerPanel.reset();
                    return;
                }
                thisControllerPanel.selectControllerInputField.value = data.name;
                thisControllerPanel.selectControllerInputField.uuid = data.uuid;
                thisControllerPanel.setValue(data.code);
                thisControllerPanel.actionSave.disable();
                thisControllerPanel.actionCancel.disable();
                thisControllerPanel.actionDelete.enable();
                thisControllerPanel.controllerEditor.focus();
                thisControllerPanel.controllerEditor.navigateFileEnd();
            });
        });
    }

    cancel(reference) {
        this.controllerEditor.setValue(this.currentCode);
        this.actionSave.disable();
        this.actionCancel.disable();
    }

    new(reference) {
        this.createControllerPopup.show();
        // this.controllerEditor.setValue('');
        // this.selectControllerInputField.value = 'random';
        // save(reference);
    }

    save(reference) {
        let code = this.controllerEditor.getValue();
        if(code === this.currentCode) {
            return;
        }
        let thisControllerPanel = this;
        thisControllerPanel.showLoading();
        let controllerName = this.selectControllerInputField.value;
        let controllerUUID = this.selectControllerInputField.uuid;
        if(controllerName === undefined || controllerName === null) {
            controllerName = '';
        }
        controllerName = controllerName.trim();
        if(controllerName.length <= 0) {
            controllerName = 'default';
            this.selectControllerInputField.value = controllerName;
        }
        if(controllerUUID === undefined || controllerUUID === null) {
            this.dao.createController(this.reference, controllerName, null, code, function(error, uuid, name) {
                thisControllerPanel.hideLoading();
                if(error) {
                    return;
                }
                thisControllerPanel.selectControllerInputField.value = name;
                thisControllerPanel.selectControllerInputField.uuid = uuid;
                thisControllerPanel.currentCode = code;
                thisControllerPanel.actionSave.disable();
                thisControllerPanel.actionCancel.disable();
                thisControllerPanel.actionDelete.enable();
            });
        } else {
            this.dao.updateController(this.reference, controllerUUID, controllerName, null, code, function(error, uuid) {
                thisControllerPanel.hideLoading();
                if(error) {
                    return;
                }
                thisControllerPanel.currentCode = code;
                thisControllerPanel.actionSave.disable();
                thisControllerPanel.actionCancel.disable();
                thisControllerPanel.actionDelete.enable();
            });
        }
    }

    setValue(code) {
        if(code === undefined || code === null) {
            code = '';
        }
        this.currentCode = code;
        this.controllerEditor.setValue(this.currentCode);
    }
}