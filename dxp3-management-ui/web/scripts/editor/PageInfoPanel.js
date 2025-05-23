class PageInfoPanel extends AcePanel {
	constructor(id, name, _pagePanel, _applicationUUID, _pageUUID, _pageName, _isTemplate, _parentUUIDs, _parentNames, _description) {
		super(id, name, false, true);
		this.pagePanel = _pagePanel;
		this.applicationUUID = _applicationUUID;
		this.pageUUID = _pageUUID;
		this.pageName = _pageName;
		this.isTemplate = _isTemplate;
		this.parentUUIDs = _parentUUIDs;
		this.parentNames = _parentNames;
		this.description = _description;
		this.inputFields = [];

		this.updateNameInputField = new TextInputField(null,
														'Name',
														'page-name',
														'update-page-name',
														this.pageName,
														'',
														INPUT_FIELD_TYPES.DEFAULT,
														true,
														true,
														true);
		this.inputFields.push(this.updateNameInputField);

		this.updateIsTemplateInputField = new RadioInputField(null,
															 'Is this a template?',
															 null,
															 'isTemplate',
															 ['update-page-is-template-yes', 'update-page-is-template-no'],
															 ['true', 'false'],
															 ['Yes', 'No'],
															 this.isTemplate.toString(),
															 true,
															 true,
															 true);
		this.inputFields.push(this.updateIsTemplateInputField);

		this.updateDescriptionInputField = new TextAreaInputField(null,
															 'Description',
															 'page-description',
															 'update-page-description',
															 this.description,
															 '',
															 INPUT_FIELD_TYPES.DEFAULT,
															 true,
															 true,
															 true);
		this.inputFields.push(this.updateDescriptionInputField);

		this.updateParentInputField = new SelectPageInputField(null,
															this.applicationUUID,
															'Parents',
															'Based on page...',
															true);
		this.inputFields.push(this.updateParentInputField);

		this.parentListInputField = new ListInputField(null, '', this.parentUUIDs, this.parentNames, null, false, true, true);
		this.inputFields.push(this.parentListInputField);

		let thisEditorElement = this;
		this.updateParentInputField.addEventListener('select', function(ev) {
			thisEditorElement.parentListInputField.addItem(ev.uuid, ev.name);
			// let parentsList = document.getElementById(thisEditorElement.id).querySelector('.parents-list');
			// let action = parentsList.querySelector('a[href="#' + ev.applicationUUID + '"]');
			// if(action === undefined || action === null) {
			// 	let template = '<li><a class="action-remove-parent" href="#' + ev.applicationUUID + '">' + ev.applicationName + '</a></li>';
		 //   		let liElement = document.createRange().createContextualFragment(template);
		 //   		let aElement = liElement.querySelector('.action-remove-parent');
		 //   		aElement.addEventListener('click', function(ev) {
		 //   			let liElement = this.parentNode;
		 //   			let ulElement = liElement.parentNode;
		 //   			ulElement.removeChild(liElement);
		 //   			if(ulElement.childNodes.length <= 0) {
		 //   				ulElement.classList.add('hide');
		 //   			}
		 //   		});
		 //   		parentsList.appendChild(liElement);
		 //   		parentsList.classList.remove('hide');
		 //   	}
		});

	    for(let i=0;i < this.inputFields.length;i++) {
	    	this.inputFields[i].addEventListener('input', function(ev) {
				thisEditorElement.refreshButtonState();
	    	});
		}

// template += '<a href="#' + this.applicationUUID + '" title="Save" class="action-save action-save-application disabled"><i class="far fa-save"></i>Save</a>';
// template += '<a href="#' + this.applicationUUID + '" title="Cancel" class="action-cancel action-cancel-edit-application disabled"><i class="fa fa-times"></i>Cancel</a>';
// template += '<a href="#' + this.applicationUUID + '" title="Publish" class="action-publish action-publish-application"><i class="fa fa-cloud-upload-alt"></i>Publish</a>';
// template += '<a href="#' + this.applicationUUID + '" title="Copy" class="action-copy action-copy-application"><i class="far fa-copy"></i>Copy</a>';
// template += '<a href="#' + this.applicationUUID + '" title="Paste" class="action-paste action-paste-application disabled"><i class="fas fa-paste"></i>Paste</a>';
// template += '<a href="#' + this.applicationUUID + '" title="Delete" class="action-delete action-delete-application"><i class="fa fa-trash-alt"></i>Delete</a>';
// template += '<a href="#' + this.applicationUUID + '" title="Message" class="action-message hide"><i class="fa fa-bullhorn"></i></a>';
// template += '<a href="#' + this.applicationUUID + '" title="Help" class="action-help"><i class="fa fa-question"></i></a>';
        this.actionPublish = new Action(null, this.pageUUID, 'action-publish', 'Publish', 'Publish', 'fa fa-cloud-upload-alt', false, function(pageUUID) {

        });
        super.addMenuAction(this.actionPublish);
        this.actionCopy = new Action(null, this.pageUUID, 'action-copy', 'Copy', 'Copy', 'far fa-copy', false, function(pageUUID) {
        });
        super.addMenuAction(this.actionCopy);

        this.actionPaste = new Action(null, this.pageUUID, 'action-paste', 'Paste', 'Paste', 'fas fa-paste', true, function(pageUUID) {

        });
        super.addMenuAction(this.actionPaste);

        this.actionSave = new Action(null, this.pageUUID, 'action-save', 'Save', 'Save', 'far fa-save', true, function(pageUUID) {
	        thisEditorElement.savePage(pageUUID);
	        return false;
        });
        super.addMenuAction(this.actionSave);

        this.actionCancel = new Action(null, this.pageUUID, 'action-cancel', 'Cancel', 'Cancel', 'fa fa-times', true, function(pageUUID) {
			for(let i=0;i < thisEditorElement.inputFields.length;i++) {
				thisEditorElement.inputFields[i].reset();
			}
			return false;
        });
        super.addMenuAction(this.actionCancel);

		this.deletePageConfirmationPopup = new ConfirmationPopup(null, POPUP_SIZES.SMALL);
		this.deletePageConfirmationPopup.alignLeft();
		this.deletePageConfirmationPopup.addEventListener('submit', function(ev) {
	        thisEditorElement.deletePage(thisEditorElement.pageUUID);
			thisEditorElement.deletePageConfirmationPopup.hide();
		});
		this.deletePageConfirmationPopup.addEventListener('cancel', function(event) {
			thisEditorElement.deletePageConfirmationPopup.hide();
		});
        this.actionDelete = new Action(null, this.pageUUID, 'action-delete', 'Delete', '', 'fa fa-trash-alt', false, function(pageUUID) {
	        return false;
        });
        this.actionDelete.popup = this.deletePageConfirmationPopup;

        super.addMenuAction(this.actionDelete);
	}

	refreshButtonState() {
		let isUpdated = false;
	    for(let i=0;i < this.inputFields.length;i++) {
	        if(this.inputFields[i].isUpdated()) {
	            isUpdated = true;
	            break;
	        }
	    }
	    if(isUpdated) {
	    	this.actionSave.enable();
	    	this.actionCancel.enable();
	    } else {
	    	this.actionSave.disable();
	    	this.actionCancel.disable();
	    }
	}

	getDocumentFragment() {
		let template = '<div class="page-info-panel">';
		// template += '<div class="header">';
		// template += 	'<div class="loading hide"><img class="icon-loading hide" src="/web/images/loading-spinner.gif"></div>';
		// template +=     '<div class="menu">';
		// template += '<a href="#' + this.pageUUID + '" title="Save" class="action-save action-save-application disabled"><i class="far fa-save"></i>Save</a>';
		// template += '<a href="#' + this.pageUUID + '" title="Cancel" class="action-cancel action-cancel-edit-application disabled"><i class="fa fa-times"></i>Cancel</a>';
		// template += '<a href="#' + this.pageUUID + '" title="Publish" class="action-publish action-publish-application"><i class="fa fa-cloud-upload-alt"></i>Publish</a>';
		// template += '<a href="#' + this.pageUUID + '" title="Copy" class="action-copy action-copy-application"><i class="far fa-copy"></i>Copy</a>';
		// template += '<a href="#' + this.pageUUID + '" title="Paste" class="action-paste action-paste-application disabled"><i class="fas fa-paste"></i>Paste</a>';
		// template += '<a href="#' + this.pageUUID + '" title="Delete" class="action-delete action-delete-application"><i class="fa fa-trash-alt"></i>Delete</a>';
		// template += '<a href="#' + this.pageUUID + '" title="Message" class="action-message hide"><i class="fa fa-bullhorn"></i></a>';
		// template += '<a href="#' + this.pageUUID + '" title="Help" class="action-help"><i class="fa fa-question"></i></a>';
		// template += '</div>';
		// template += '</div>';
		template += '</div>';
	    
		let myDocumentFragment = document.createRange().createContextualFragment(template);
		let root = myDocumentFragment.querySelector('.page-info-panel');
		root.appendChild(this.updateIsTemplateInputField.getDocumentFragment());
		root.appendChild(this.updateParentInputField.getDocumentFragment());
		// template = '';
  //  		template += '<div>';
  //  		template += '<ul class="parents-list hide"></ul>';
  //  		template += '</div>';
  //  		let myParentsList = document.createRange().createContextualFragment(template);
  //  		root.appendChild(myParentsList);
  		root.appendChild(this.parentListInputField.getDocumentFragment());
		root.appendChild(this.updateNameInputField.getDocumentFragment());
		root.appendChild(this.updateDescriptionInputField.getDocumentFragment());
		let mergedDocumentFragment = super.getDocumentFragment(myDocumentFragment);

		// let thisEditorElement = this;
	 //    mergedDocumentFragment.querySelector('.action-save-application').addEventListener('click', function(ev) {
	 //        ev.preventDefault();
	 //        var href = this.getAttribute('href');
	 //        var applicationUUID = href.substring(1);
	 //        thisEditorElement.savePage(applicationUUID);
	 //        return false;
	 //    });
	 //    mergedDocumentFragment.querySelector('.action-cancel-edit-application').addEventListener('click', function(ev) {
	 //        ev.preventDefault();
		//     for(let i=0;i < thisEditorElement.inputFields.length;i++) {
		//     	thisEditorElement.inputFields[i].reset();
		// 	}
	 //        return false;
	 //    });
	 //    mergedDocumentFragment.querySelector('.action-publish-application').addEventListener('click', function(ev) {
	 //        ev.preventDefault();
	 //        return false;
	 //    });
	 //    mergedDocumentFragment.querySelector('.action-copy-application').addEventListener('click', function(ev) {
	 //        ev.preventDefault();
	 //        return false;
	 //    });
	 //    mergedDocumentFragment.querySelector('.action-paste-application').addEventListener('click', function(ev) {
	 //        ev.preventDefault();
	 //        return false;
	 //    });
	 //    mergedDocumentFragment.querySelector('.action-delete-application').addEventListener('click', function(ev) {
	 //        ev.preventDefault();
	 //        var href = this.getAttribute('href');
	 //        var applicationUUID = href.substring(1);
	 //        thisEditorElement.deletePage(applicationUUID);
	 //        return false;
	 //    });
		return mergedDocumentFragment;
	}

	deletePage(pageUUID) {
		if(pageUUID === undefined || pageUUID === null) {
			pageUUID = '';
		}
		pageUUID = pageUUID.trim();
		if(pageUUID.length <= 0) {
			return;
		}
		let thisEditorElement = this;
		PageDAO.delete(pageUUID, function(data, error) {
			console.log('details page deleted');
		});
	}

	savePage(pageUUID) {
		if(pageUUID === undefined || pageUUID === null) {
			pageUUID = '';
		}
		pageUUID = pageUUID.trim();
		if(pageUUID.length <= 0) {
			return;
		}
		let name = this.updateNameInputField.value;
		name = name.trim();
		if(name.length <= 0) {
			return;
		}
		let isTemplate = this.updateIsTemplateInputField.value;
		let parentUUIDs =  this.parentListInputField.getValues();
		let description =  this.updateDescriptionInputField.value;
		let thisEditorElement = this;
		PageDAO.update(pageUUID, this.applicationUUID, name, isTemplate, parentUUIDs, description, function(data, error) {
		});
	}

	update(pageName, isTemplate, parentUUIDs, parentNames, description) {
		this.updateNameInputField.setInitialValue(pageName);
		this.updateIsTemplateInputField.setInitialValue(isTemplate);
		this.parentListInputField.setInitialValues(parentUUIDs, parentNames);
		this.updateDescriptionInputField.setInitialValue(description);
		this.updateNameInputField.value = pageName;
		this.updateIsTemplateInputField.value = isTemplate;
		this.parentListInputField.setValues(parentUUIDs, parentNames);
		this.updateDescriptionInputField.value = description;
		this.refreshButtonState();
	}

	init() {
		super.init();
	}
	//     frag.querySelector('.action-save-application').addEventListener('click', function(ev) {
	//         ev.preventDefault();
	//         var href = this.getAttribute('href');
	//         var applicationUUID = href.substring(1);
	//         thisEditorElement.updatePage(applicationUUID);
	//         return false;
	//     });
	//     frag.querySelector('.action-cancel-edit-application').addEventListener('click', function(ev) {
	//         ev.preventDefault();
	//         // get all input fields and reset them
	//         var href = this.getAttribute('href');
	//         var applicationUUID = href.substring(1);
	//         var applicationPanel = document.getElementById(applicationUUID);
	//         var inputFields = applicationPanel.querySelectorAll('.details .input-field');
	//         for(var i=0;i < inputFields.length;i++) {
	//             editorInputField.reset(inputFields[i]);
	//         }
	//         var inputTextAreas = applicationPanel.querySelectorAll('.details .input-textarea');
	//         for(var i=0;i < inputTextAreas.length;i++) {
	//             editorInputField.reset(inputTextAreas[i]);
	//         }
	//         return false;
	//     });
	//     frag.querySelector('.action-publish-application').addEventListener('click', function(ev) {
	//         ev.preventDefault();
	//         return false;
	//     });
	//     frag.querySelector('.action-copy-application').addEventListener('click', function(ev) {
	//         ev.preventDefault();

	//         return false;
	//     });
	//     frag.querySelector('.action-paste-application').addEventListener('click', function(ev) {
	//         ev.preventDefault();
	//         return false;
	//     });
	//     frag.querySelector('.action-delete-application').addEventListener('click', function(ev) {
	//         ev.preventDefault();
	//         var href = this.getAttribute('href');
	//         var applicationUUID = href.substring(1);
	//         thisEditorElement.deletePage(applicationUUID);
	//         return false;
	//     });
	//     var details = divElement.querySelector('.details');
	//     details.appendChild(frag);

	//     // label (null or empty if no label is required),
	//     // class name (use this to select the actual input dom element), 
	//     // the name of the input,
	//     // value (null or empty if there is no initial value),
	//     // placeholder,
	//     // has border?,
	//     // has clear button?,
	//     // type
	//     var inputField = editorInputField.createTextInput('Name', 'update-application-name', 'name', applicationName, '', true, true);
	//     editorInputField.addEventListener(inputField, 'input', function(source, ev) {
	//         let applicationPanel = source.closest('.application-panel');
	//         refreshButtonState(applicationPanel);
	//     });
	//     function refreshButtonState(applicationPanel) {
	//     	console.log('refreshButtonState');
	//         var inputFields = applicationPanel.querySelectorAll('.details .input-field');
	//         var isUpdated = false;
	//         for(var i=0;i < inputFields.length;i++) {
	//             if(editorInputField.isUpdated(inputFields[i])) {
	//                 isUpdated = true;
	//                 break;
	//             }
	//         }
	//         if(isUpdated) {
	//             let button = applicationPanel.querySelector('.action-save-application');
	//             button.classList.remove('disabled');
	//             button = applicationPanel.querySelector('.action-cancel-edit-application');
	//             button.classList.remove('disabled');
	//         } else {
	//             let button = applicationPanel.querySelector('.action-save-application');
	//             button.classList.add('disabled');
	//             button = applicationPanel.querySelector('.action-cancel-edit-application');
	//             button.classList.add('disabled');
	//         }
	//     }
	//     details.appendChild(inputField);
	//     inputField = editorInputField.createTextInput('Shortname', 'update-application-shortname', 'shortname', shortName, '', true, true);
	//     editorInputField.addEventListener(inputField, 'input', function(source, ev) {
	//         let applicationPanel = source.closest('.application-panel');
	//         refreshButtonState(applicationPanel);
	//     });
	//     details.appendChild(inputField);

	//     // inputField = editorInputField.createRadioButtonsInput('Is this a template?',
	//     //                                                     ['update-application-is-template-yes', 'update-application-is-template-no'],
	//     //                                                     'isTemplate',
	//     //                                                     ['true', 'false'],
	//     //                                                     ['Yes', 'No'],
	//     //                                                      isTemplate.toString(), true);
	//     let isTemplateInputField = new RadioInputField(null,
	// 									'Is this a template?',
	// 									null,
	// 									'isTemplate',
 //                                            ['update-application-is-template-yes', 'update-application-is-template-no'],
	// 									['true', 'false'],
	// 									['Yes', 'No'],
	// 									isTemplate.toString(),
	// 									true,
	// 									true,
	// 									true);
	//     // inputField.addEventListener('input', function(ev) {
	//     //     let applicationPanel = source.closest('.application-panel');
	//     //     refreshButtonState(applicationPanel);
	//     // });
	//     details.appendChild(isTemplateInputField.getDocumentFragment());

	// 	let parentInputField = new SelectPageInputField(null,
	// 														'Parents',
	// 															'Based on application...',
	// 															false);
	// 	let parentsListInputField = new ListInputField(null, '', null, 'action-remove-parent', parentUUIDs, parentNames, false, true, true);

 //   		details.appendChild(parentInputField.getDocumentFragment());
 //   		details.appendChild(parentsListInputField.getDocumentFragment());
		
	// 	// parentInputField.addEventListener('select', function(ev) {
	// 	// 	console.log('select parent');
	// 	// 	let parentsList = document.getElementById(applicationUUID).querySelector('.details .parents-list');
	// 	// 	let action = parentsList.querySelector('a[href="#' + ev.applicationUUID + '"]');
	// 	// 	if(action === undefined || action === null) {
	// 	// 		let template = '<li><a class="action-remove-parent" href="#' + ev.applicationUUID + '">' + ev.applicationName + '</a></li>';
	// 	//    		let liElement = document.createRange().createContextualFragment(template);
	// 	//    		let aElement = liElement.querySelector('.action-remove-parent');
	// 	//    		aElement.addEventListener('click', function(ev) {
	// 	//    			let liElement = this.parentNode;
	// 	//    			let ulElement = liElement.parentNode;
	// 	//    			ulElement.removeChild(liElement);
	// 	//    			if(ulElement.childNodes.length <= 0) {
	// 	//    				ulElement.classList.add('hide');
	// 	//    			}
	// 	//    		});
	// 	//    		parentsList.appendChild(liElement);
	// 	//    		parentsList.classList.remove('hide');
	// 	//    	}
	// 	// });

	// 	let parentListCsv = '';
	//     template =      '<div class="input-field-with-label">' +
	//                         '<div class="label">Children</div>' +
	//                         '<div class="list-field">' +
	//                             '<input class="update-application-childUUIDs-hidden" type="hidden" name="childUUIDs"/>' +
	//                         '</div>' +
	//                     '</div>';

	//     frag = document.createRange().createContextualFragment(template);
	//     details.appendChild(frag);
	//   //   if(parentUUIDs.length > 0) {
	// 		// let parentsList = details.querySelector('.parents-list');
	// 		// let parentUUIDsHidden = details.querySelector('.update-application-parentUUIDs-hidden');
	// 	 //    for(var i=0;i < parentUUIDs.length;i++) {
	// 	 //    	if(i > 0) {
	// 	 //    		parentListCsv += ',';
	// 	 //    	}
	// 	 //    	parentListCsv += parentUUIDs[i];
	// 		// 	let template = '<li><a class="action-remove-parent" href="#' + parentUUIDs[i] + '">' + parentNames[i] + '</a></li>';
	// 	 //   		let liElement = document.createRange().createContextualFragment(template);
	// 	 //   		let aElement = liElement.querySelector('.action-remove-parent');
	// 	 //   		aElement.addEventListener('click', function(ev) {
	// 	 //   			let liElement = this.parentNode;
	// 	 //   			let ulElement = liElement.parentNode;
	// 	 //   			ulElement.removeChild(liElement);
	// 	 //   			if(ulElement.childNodes.length <= 0) {
	// 	 //   				ulElement.classList.add('hide');
	// 	 //   			}
	// 	 //   		});
	// 	 //   		parentsList.appendChild(liElement);
	// 	 //    }
	// 	 //    parentUUIDsHidden.value = parentListCsv;
	//   //  		parentsList.classList.remove('hide');
	//   //  	}

	//     inputField = editorInputField.createTextInput('Home page', 'update-application-homepage-hidden', 'homepage', null, '', true, true);
	//     editorInputField.addEventListener(inputField, 'input', function(source, ev) {
	//         let applicationPanel = source.closest('.application-panel');
	//         refreshButtonState(applicationPanel);
	//     });
	//     details.appendChild(inputField);

	//     inputField = editorInputField.createTextInput('Favicon', 'update-application-favicon', 'favicon', null, '', true, true);
	//     editorInputField.addEventListener(inputField, 'input', function(source, ev) {
	//         let applicationPanel = source.closest('.application-panel');
	//         refreshButtonState(applicationPanel);
	//     });
	//     details.appendChild(inputField);

	//     let inputTextArea = editorInputField.createTextAreaInput('Description', 'update-application-description', 'description', description, '', true, true);
	//     editorInputField.addEventListener(inputTextArea, 'input', function(source, ev) {
	//         let applicationPanel = source.closest('.application-panel');
	//         refreshButtonState(applicationPanel);
	//     });
	//     details.appendChild(inputTextArea);
}