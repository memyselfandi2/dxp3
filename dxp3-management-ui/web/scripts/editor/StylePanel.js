class StylePanel extends AcePanel {
    constructor(id, _reference, _dao) {
        super(id, 'Styles', false, true);

        // The actual editor.
        // Currently this is an ace editor.
        this.styleEditor = null;
        // The current code
        this.currentCode = '';
        // A reference to an application, page or a feature.
        // Either way this is an UUID.
        this.reference = _reference;
        // A DAO to create, read, update, delete styles
        // (from an application, a page or a feature).
        this.dao = _dao;

        this.selectStyleInputField = new SelectStyleInputField(null,
                                                                         null,
                                                                         '...',
                                                                         true,
                                                                         _reference,
                                                                         _dao);

        this.selectVersionInputField = new SelectVersionInputField(null,
                                                                   null,
                                                                   null,
                                                                   true);

        this.createStylePopup = new CreateStylePopup(null, POPUP_SIZES.SMALL, true,true, true);

        let thisStylePanel = this;
        super.addMenuInputField(this.selectStyleInputField, 'medium');
        super.addMenuInputField(this.selectVersionInputField, 'smallest');
        
        this.actionNew = new Action(null, this.reference,'action-new', 'New', 'New', 'fa fa-magic', false, function(reference) {
        });
        this.createStylePopup.alignLeft();
        this.actionNew.popup = this.createStylePopup;
        this.createStylePopup.addEventListener('submit', function(ev) {
            let styleName = ev.styleName;
            let description = ev.description;
            thisStylePanel.dao.createStyle(thisStylePanel.reference,
                               styleName,
                               description,
                               null,
                               function(error, uuid, name) {
                    thisStylePanel.createStylePopup.hideLoading();
                    if(error) {
                        thisStylePanel.createStylePopup.showWarningMessage(error.message);
                        thisStylePanel.createStylePopup.focus();
                        return;
                    }
                    thisStylePanel.createStylePopup.reset();
                    if(ev.closeOnSuccess) {
                        thisStylePanel.createStylePopup.hide();
                        thisStylePanel.styleEditor.focus();
                        thisStylePanel.styleEditor.navigateFileEnd();
                    } else {
                        thisStylePanel.createStylePopup.focus();
                    }
                    thisStylePanel.selectStyleInputField.value = name;
                    thisStylePanel.selectStyleInputField.uuid = uuid;
                    thisStylePanel.setValue('');
                    thisStylePanel.actionDelete.enable();
               }
           );            
        });
        this.createStylePopup.addEventListener('cancel', function(ev) {
            thisStylePanel.createStylePopup.hide();
        });
        super.addMenuAction(this.actionNew);

        this.actionFonts = new Action(null, this.reference,'action-fonts', 'Fonts', 'Fonts', 'fa fa-font', false, function(reference) {
        });
        super.addMenuAction(this.actionFonts);

        this.actionImages = new Action(null, this.reference,'action-images', 'Images', 'Images', 'far fa-image', false, function(reference) {
        });
        super.addMenuAction(this.actionImages);

        this.actionSave = new Action(null, this.reference,'action-save', 'Save', 'Save', 'far fa-save', false, function(reference) { 
            thisStylePanel.save(reference);
            thisStylePanel.styleEditor.focus();
        });
        super.addMenuAction(this.actionSave);

        this.actionCancel = new Action(null, this.reference,'action-cancel', 'Cancel', 'Cancel', 'fa fa-times', false, function(reference) {
            thisStylePanel.cancel(reference);
            thisStylePanel.styleEditor.focus();
        });
        super.addMenuAction(this.actionCancel);

        this.deleteConfirmationPopup = new ConfirmationPopup(null, POPUP_SIZES.SMALL);
        this.deleteConfirmationPopup.addEventListener('submit', function(ev) {
            let styleName = thisStylePanel.selectStyleInputField.value;
            let styleUUID = thisStylePanel.selectStyleInputField.uuid;
            thisStylePanel.dao.deleteStyle(thisStylePanel.reference,
                styleUUID,
                function(error, uuid) {
                    thisStylePanel.loadFirstStyle();
                }
            );
            thisStylePanel.deleteConfirmationPopup.hide();
        });
        this.deleteConfirmationPopup.addEventListener('cancel', function(event) {
            thisStylePanel.deleteConfirmationPopup.hide();
        });
        this.actionDelete = new Action(null, this.reference, 'action-delete', 'Delete', '', 'fa fa-trash-alt', false, function(reference) {
            return false;
        });
        this.actionDelete.popup = this.deleteConfirmationPopup;



        // this.actionDelete = new Action(null, this.reference,'action-delete', 'Delete', '', 'fa fa-trash-alt', true, function(reference) {
        //     let styleName = thisStylePanel.selectStyleInputField.value;
        //     let styleUUID = thisStylePanel.selectStyleInputField.uuid;
        //     thisStylePanel.dao.deleteStyle(thisStylePanel.reference,
        //         styleUUID,
        //         function(error, uuid) {
        //             thisStylePanel.loadFirstStyle();
        //         }
        //     );
        // });

        super.addMenuAction(this.actionDelete);

        this.selectStyleInputField.addEventListener('select', function(ev) {
            thisStylePanel.selectStyleInputField.popup.showLoading();
            thisStylePanel.dao.readStyle(thisStylePanel.reference, ev.styleUUID, function(err, style) {
                thisStylePanel.selectStyleInputField.popup.hideLoading();
                if(err) {
                    thisStylePanel.selectStyleInputField.popup.showErrorMessage(error.message);
                    return;
                }
                thisStylePanel.selectStyleInputField.popup.close();
                thisStylePanel.setValue(style.code);
                thisStylePanel.actionSave.disable();
                thisStylePanel.actionCancel.disable();
                thisStylePanel.actionDelete.enable();
                thisStylePanel.styleEditor.focus();
                thisStylePanel.styleEditor.navigateFileEnd();
            });
        })
    }

    getDocumentFragment() {
    let template = '<div class="style-panel border">';
    // template += '<div class="header">' +
             //                        '<a href="#" title="fullscreen" class="action-fullscreen" style=""><i class="fa fa-arrows-alt"></i></a>' +
             //                        '<a href="#" title="minimize" class="action-minimize hide"><i class="fa fa-compress"></i></a>' +
             //                        '<div class="column small">Styles</div>' +
             //                        '<div class="column medium">' +
             //                        '<div id="select-style-input-field"></div>' +
             //                            // '<div class="input-field dropdown border">' +
             //                            //     '<input class="action-select-page-style" type="text" placeholder="Select style" name="search">' +
    //                            //              '<div class="input-field-buttons">' +
    //                            //                  '<button class="clear-button" type="reset" title="Clear"><i class="fa fa-trash-alt"></i></button>' +
    //                            //                  '<button class="search-button" type="submit" title="Search"><i class="fa fa-chevron-down"></i></button>' +
    //                            //              '</div>' +
    //                            //              '<div class="page-select-style-popup popup toplevel border hide">' +
    //                            //                  '<div class="menu">' +
    //                            //                      '<div class="loading menu-icon"><img class="icon-loading" src="/web/images/loading-spinner.gif"/></div>' +
    //                            //                      '<a class="action-close menu-icon" href="#" title="Close" ><i class="far fa-window-close"></i></a>' +
    //                            //                  '</div>' +
    //                            //                  '<div class="page-select-style-list"><ul></ul></div>' +
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
             //                            '<a href="#" title="Save" class="action-save action-save-page-style"><i class="far fa-save"></i>Save</a>' +
    //                                     '<a href="#" title="Commit" class="action-commit action-commit-page-style"><i class="far fa-check-square"></i>Commit</a>' +
             //                            '<a href="#" title="Cancel" class="action-cancel action-cancel-page-style"><i class="fa fa-times"></i>Cancel</a>' +
             //                            '<a class="action-message hide" href="#" title="Message"><i class="fa fa-bullhorn"></i></a>' +
             //                            '<a class="action-help" href="#" title="Help"><i class="fa fa-question"></i></a>' +
             //                        '</div>' +
             //                    '</div>';
    template += '</div>';
    // frag = document.createRange().createContextualFragment(styleHeader);
    // // Save action
    // frag.querySelector('.action-save-page-style').addEventListener('click', function(ev) {
    //     ev.preventDefault();
    //     let fileName = this.closest('.header').querySelector('.select-page-style').value;
    //     editorPagePanel.savePageStyle(pageUUID, fileName);
    //     return false;
    // });
    // frag.querySelector('.action-select-page-style').addEventListener('click', function(ev) {
    //     ev.preventDefault();
    //     ev.stopPropagation();
    //     return false;
    // });
    // frag.querySelector('.action-select-page-style').addEventListener('focus', function(ev) {
    //     ev.preventDefault();
    //     ev.stopPropagation();
    //     let popup = this.parentNode.querySelector('.page-select-style-popup');
    //     Popup.show(popup);
    //     return false;
    // });
    // frag.querySelector('.input-page-style-version').addEventListener('click', function(ev) {
    //     ev.preventDefault();
    //     ev.stopPropagation();
    //     return false;
    // });
    // frag.querySelector('.input-page-style-version').addEventListener('focus', function(ev) {
    //     ev.preventDefault();
    //     ev.stopPropagation();
    //     let popup = this.parentNode.querySelector('.page-select-style-version-popup');
    //     Popup.show(popup);
    //     return false;
    // });
    let myDocumentFragment = document.createRange().createContextualFragment(template);
    let mergedDocumentFragment = super.getDocumentFragment(myDocumentFragment);

    // let child = mergedDocumentFragment.getElementById('select-style-input-field');
    // child.parentNode.replaceChild(this.selectStyleInputField.getDocumentFragment(), child);

    // child = mergedDocumentFragment.getElementById('select-version-input-field');
    // child.parentNode.replaceChild(this.selectVersionInputField.getDocumentFragment(), child);

    var styleEditor = document.createElement('div');
    styleEditor.setAttribute('id', 'style-' + this.id);
    styleEditor.setAttribute('class', 'style-editor text-editor');
    mergedDocumentFragment.querySelector('.style-panel').appendChild(styleEditor);
    return mergedDocumentFragment;
    }

    init() {
        this.styleEditor = ace.edit("style-" + this.id);
        this.styleEditor.setTheme("ace/theme/chrome");
        this.styleEditor.getSession().setMode("ace/mode/css");
        this.styleEditor.setValue('', -1);
        this.actionNew.enable();
        this.actionSave.disable();
        this.actionCancel.disable();
        this.actionDelete.disable();

        let thisStylePanel = this;
        this.styleEditor.session.on('change', function(delta) {
            thisStylePanel.actionSave.enable();
            thisStylePanel.actionCancel.enable();
        });

        super.init();

        this.loadFirstStyle();
    }

    reset() {
        this.selectStyleInputField.value = '';
        this.selectStyleInputField.uuid = null;
        this.setValue('');
        this.actionSave.disable();
        this.actionCancel.disable();
        this.actionDelete.disable();
//        this.styleEditor.focus();
    }

    loadFirstStyle() {
        let thisStylePanel = this;
        this.showLoading();
        this.dao.readStyle(this.reference, null, function(err, result) {
            if(err) {
                thisStylePanel.hideLoading();
                thisStylePanel.reset();
                return;
            }
            if(result === undefined || result === null) {
                thisStylePanel.hideLoading();
                thisStylePanel.reset();
                return;
            }
            if(result.list.length <= 0) {
                thisStylePanel.hideLoading();
                thisStylePanel.reset();
                return;
            }
            thisStylePanel.dao.readStyle(thisStylePanel.reference, result.list[0].uuid, function(err, data) {
                thisStylePanel.hideLoading();
                if(err) {
                    thisStylePanel.reset();
                    return;
                }
                thisStylePanel.selectStyleInputField.value = data.name;
                thisStylePanel.selectStyleInputField.uuid = data.uuid;
                thisStylePanel.setValue(data.code);
                thisStylePanel.actionSave.disable();
                thisStylePanel.actionCancel.disable();
                thisStylePanel.actionDelete.enable();
                thisStylePanel.styleEditor.focus();
                thisStylePanel.styleEditor.navigateFileEnd();
            });
        });
    }

    cancel(reference) {
        this.styleEditor.setValue(this.currentCode);
        this.actionSave.disable();
        this.actionCancel.disable();
    }

    new(reference) {
        this.createStylePopup.show();
        // this.styleEditor.setValue('');
        // this.selectStyleInputField.value = 'random';
        // save(reference);
    }

    save(reference) {
        let code = this.styleEditor.getValue();
        if(code === this.currentCode) {
            return;
        }
        let thisStylePanel = this;
        thisStylePanel.showLoading();
        let styleName = this.selectStyleInputField.value;
        let styleUUID = this.selectStyleInputField.uuid;
        if(styleName === undefined || styleName === null) {
            styleName = '';
        }
        styleName = styleName.trim();
        if(styleName.length <= 0) {
            styleName = 'default';
            this.selectStyleInputField.value = styleName;
        }
        if(styleUUID === undefined || styleUUID === null) {
            this.dao.createStyle(this.reference, styleName, null, code, function(error, uuid, name) {
                thisStylePanel.hideLoading();
                if(error) {
                    return;
                }
                thisStylePanel.selectStyleInputField.value = name;
                thisStylePanel.selectStyleInputField.uuid = uuid;
                thisStylePanel.currentCode = code;
                thisStylePanel.actionSave.disable();
                thisStylePanel.actionCancel.disable();
                thisStylePanel.actionDelete.enable();
            });
        } else {
            this.dao.updateStyle(this.reference, styleUUID, styleName, null, code, function(error, uuid) {
                thisStylePanel.hideLoading();
                if(error) {
                    return;
                }
                thisStylePanel.currentCode = code;
                thisStylePanel.actionSave.disable();
                thisStylePanel.actionCancel.disable();
                thisStylePanel.actionDelete.enable();
            });
        }
    }

    setValue(code) {
        if(code === undefined || code === null) {
            code = '';
        }
        this.currentCode = code;
        this.styleEditor.setValue(this.currentCode);
    }
}