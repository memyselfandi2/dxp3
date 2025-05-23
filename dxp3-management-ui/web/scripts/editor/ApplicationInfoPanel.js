class ApplicationInfoPanel extends AcePanel {
	constructor(id, name, _applicationPanel, _applicationUUID, _applicationName, _isTemplate, _parentUUIDs, _parentNames, _shortName, _pageUUID, _pageName, _description) {
		super(id, name, false, true);
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
		this.inputFields = [];

		this.updateNameInputField = new TextInputField(null,
																'Name',
																'application-name',
																'update-application-name',
																this.applicationName,
																'',
																INPUT_FIELD_TYPES.DEFAULT,
																true,
																true,
																true);
		this.inputFields.push(this.updateNameInputField);
		this.updateShortNameInputField = new TextInputField(null,
															'Shortname',
															'application-shortname',
															'update-application-shortname',
															this.shortName,
															'',
															INPUT_FIELD_TYPES.DEFAULT,
															true,
															true,
															true);

		this.inputFields.push(this.updateShortNameInputField);
		this.updateIsTemplateInputField = new RadioInputField(null,
															 'Is this a template?',
															 null,
															 'isTemplate',
															 ['update-application-is-template-yes', 'update-application-is-template-no'],
															 ['true', 'false'],
															 ['Yes', 'No'],
															 this.isTemplate.toString(),
															 true,
															 true,
															 true);
		this.inputFields.push(this.updateIsTemplateInputField);

		this.updatePageInputField = new SelectPageInputField(null, this.applicationUUID, 'Home page', 'Home page', true);
		this.inputFields.push(this.updatePageInputField);

		this.updateFavIconInputField = new ImageInputField(null, 'Favicons');
		this.inputFields.push(this.updateFavIconInputField);

		this.updateDescriptionInputField = new TextAreaInputField(null,
															 'Description',
															 'application-description',
															 'update-application-description',
															 this.description,
															 '',
															 INPUT_FIELD_TYPES.DEFAULT,
															 true,
															 true,
															 true);
		this.inputFields.push(this.updateDescriptionInputField);

		this.updateParentInputField = new SelectApplicationInputField(null,
															'Parents',
															'Based on application...',
															true);
		this.inputFields.push(this.updateParentInputField);

		this.parentListInputField = new ListInputField(null, '', this.parentUUIDs, this.parentNames, null, false, true, false);
		this.inputFields.push(this.parentListInputField);

		let thisEditorElement = this;
		this.updateParentInputField.addEventListener('select', function(ev) {
			thisEditorElement.parentListInputField.addItem(ev.applicationUUID, ev.applicationName);
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

// template += '<a href="#' + this.applicationUUID + '" title="Save" class="action-save action-save-application disabled"><i class="far fa-save"></i>Save</a>';
// template += '<a href="#' + this.applicationUUID + '" title="Cancel" class="action-cancel action-cancel-edit-application disabled"><i class="fa fa-times"></i>Cancel</a>';
// template += '<a href="#' + this.applicationUUID + '" title="Publish" class="action-publish action-publish-application"><i class="fa fa-cloud-upload-alt"></i>Publish</a>';
// template += '<a href="#' + this.applicationUUID + '" title="Copy" class="action-copy action-copy-application"><i class="far fa-copy"></i>Copy</a>';
// template += '<a href="#' + this.applicationUUID + '" title="Paste" class="action-paste action-paste-application disabled"><i class="fas fa-paste"></i>Paste</a>';
// template += '<a href="#' + this.applicationUUID + '" title="Delete" class="action-delete action-delete-application"><i class="fa fa-trash-alt"></i>Delete</a>';
// template += '<a href="#' + this.applicationUUID + '" title="Message" class="action-message hide"><i class="fa fa-bullhorn"></i></a>';
// template += '<a href="#' + this.applicationUUID + '" title="Help" class="action-help"><i class="fa fa-question"></i></a>';
        this.imagesPopup = new ImagesPopup(null, POPUP_SIZES.LARGE, true,true, true, this.applicationUUID, ApplicationDAO);
        this.actionImages = new Action(null, this.applicationUUID,'action-images', 'Images', 'Images', 'far fa-image', false, function(reference) {
        });
        this.imagesPopup.alignRight();
        this.actionImages.popup = this.imagesPopup;
		this.imagesPopup.addEventListener('show', function(ev) {
			thisEditorElement.imagesPopup.refresh();
		});
        this.imagesPopup.addEventListener('submit', function(ev) {
            thisEditorElement.imagesPopup.hide();
        });
        this.imagesPopup.addEventListener('cancel', function(ev) {
            thisEditorElement.imagesPopup.hide();
        });
        super.addMenuAction(this.actionImages);

        this.actionPublish = new Action(null, this.applicationUUID, 'action-publish', 'Publish', 'Publish', 'fa fa-cloud-upload-alt', false, function(applicationUUID) {

        });
        super.addMenuAction(this.actionPublish);

        this.actionCopy = new Action(null, this.applicationUUID, 'action-copy', 'Copy', 'Copy', 'far fa-copy', false, function(applicationUUID) {
        });
        super.addMenuAction(this.actionCopy);

        this.actionPaste = new Action(null, this.applicationUUID, 'action-paste', 'Paste', 'Paste', 'fas fa-paste', true, function(applicationUUID) {

        });
        super.addMenuAction(this.actionPaste);

        this.actionSave = new Action(null, this.applicationUUID, 'action-save', 'Save', 'Save', 'far fa-save', true, function(applicationUUID) {
	        thisEditorElement.saveApplication(applicationUUID);
	        return false;
        });
        super.addMenuAction(this.actionSave);

        this.actionCancel = new Action(null, this.applicationUUID, 'action-cancel', 'Cancel', 'Cancel', 'fa fa-times', true, function(applicationUUID) {
			for(let i=0;i < thisEditorElement.inputFields.length;i++) {
				console.log('calling reset: ' + thisEditorElement.inputFields[i].id);
				thisEditorElement.inputFields[i].reset();
			}
			return false;
        });
        super.addMenuAction(this.actionCancel);

		this.deleteApplicationConfirmationPopup = new ConfirmationPopup(null, POPUP_SIZES.SMALL);
		this.deleteApplicationConfirmationPopup.addEventListener('submit', function(ev) {
	        thisEditorElement.deleteApplication(thisEditorElement.applicationUUID);
			thisEditorElement.deleteApplicationConfirmationPopup.hide();
		});
		this.deleteApplicationConfirmationPopup.addEventListener('cancel', function(event) {
			thisEditorElement.deleteApplicationConfirmationPopup.hide();
		});
        this.actionDelete = new Action(null, this.applicationUUID, 'action-delete', 'Delete', '', 'fa fa-trash-alt', false, function(applicationUUID) {
	        return false;
        });
        this.actionDelete.popup = this.deleteApplicationConfirmationPopup;
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
		let template = '<div class="details-panel">';
		// template += '<div class="header">';
		// template += 	'<div class="loading hide"><img class="icon-loading hide" src="/web/images/loading-spinner.gif"></div>';
		// template +=     '<div class="menu">';
		// template += '<a href="#' + this.applicationUUID + '" title="Save" class="action-save action-save-application disabled"><i class="far fa-save"></i>Save</a>';
		// template += '<a href="#' + this.applicationUUID + '" title="Cancel" class="action-cancel action-cancel-edit-application disabled"><i class="fa fa-times"></i>Cancel</a>';
		// template += '<a href="#' + this.applicationUUID + '" title="Publish" class="action-publish action-publish-application"><i class="fa fa-cloud-upload-alt"></i>Publish</a>';
		// template += '<a href="#' + this.applicationUUID + '" title="Copy" class="action-copy action-copy-application"><i class="far fa-copy"></i>Copy</a>';
		// template += '<a href="#' + this.applicationUUID + '" title="Paste" class="action-paste action-paste-application disabled"><i class="fas fa-paste"></i>Paste</a>';
		// template += '<a href="#' + this.applicationUUID + '" title="Delete" class="action-delete action-delete-application"><i class="fa fa-trash-alt"></i>Delete</a>';
		// template += '<a href="#' + this.applicationUUID + '" title="Message" class="action-message hide"><i class="fa fa-bullhorn"></i></a>';
		// template += '<a href="#' + this.applicationUUID + '" title="Help" class="action-help"><i class="fa fa-question"></i></a>';
		// template += '</div>';
		// template += '</div>';
		template += '</div>';
	    
		let myDocumentFragment = document.createRange().createContextualFragment(template);
		let root = myDocumentFragment.querySelector('.details-panel');
		root.appendChild(this.updateNameInputField.getDocumentFragment());
		root.appendChild(this.updateIsTemplateInputField.getDocumentFragment());
		root.appendChild(this.updateParentInputField.getDocumentFragment());
		// template = '';
  //  		template += '<div>';
  //  		template += '<ul class="parents-list hide"></ul>';
  //  		template += '</div>';
  //  		let myParentsList = document.createRange().createContextualFragment(template);
  //  		root.appendChild(myParentsList);
  		root.appendChild(this.parentListInputField.getDocumentFragment());
		root.appendChild(this.updateShortNameInputField.getDocumentFragment());
		root.appendChild(this.updatePageInputField.getDocumentFragment());
//		root.appendChild(this.updateFavIconInputField.getDocumentFragment());
		root.appendChild(this.updateDescriptionInputField.getDocumentFragment());

		root.appendChild(this.updateFavIconInputField.getDocumentFragment());

		// root.appendChild(this.confirmationPopup.getDocumentFragment());

		let mergedDocumentFragment = super.getDocumentFragment(myDocumentFragment);

		// let thisEditorElement = this;
	 //    mergedDocumentFragment.querySelector('.action-save-application').addEventListener('click', function(ev) {
	 //        ev.preventDefault();
	 //        var href = this.getAttribute('href');
	 //        var applicationUUID = href.substring(1);
	 //        thisEditorElement.saveApplication(applicationUUID);
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
	 //        thisEditorElement.deleteApplication(applicationUUID);
	 //        return false;
	 //    });
		return mergedDocumentFragment;
	}

	deleteApplication(applicationUUID) {
		if(applicationUUID === undefined || applicationUUID === null) {
			applicationUUIDapplicationUUID = '';
		}
		applicationUUID = applicationUUID.trim();
		if(applicationUUID.length <= 0) {
			return;
		}
		let thisEditorElement = this;
		ApplicationDAO.delete(applicationUUID, function(data, error) {
			console.log('details application deleted');
		});
	}

	saveApplication(applicationUUID) {
		if(applicationUUID === undefined || applicationUUID === null) {
			applicationUUIDapplicationUUID = '';
		}
		applicationUUID = applicationUUID.trim();
		if(applicationUUID.length <= 0) {
			return;
		}
		let name = this.updateNameInputField.value;
		name = name.trim();
		if(name.length <= 0) {
			return;
		}
		let isTemplate = this.updateIsTemplateInputField.value;
		let parentUUIDs =  this.parentListInputField.getValues();
		let shortName =  this.updateShortNameInputField.value;
		let pageUUID =  this.updatePageInputField.value;
		let description =  this.updateDescriptionInputField.value;
		let thisEditorElement = this;
		console.log('new name : ' + name);
		console.log('parents : ' + parentUUIDs);
		let self = this;
		ApplicationDAO.update(applicationUUID, name, isTemplate, parentUUIDs, shortName, pageUUID, description, function(err, data) {
			if(err != undefined && err != null) {
				alert(err.message);
				return;
			}
			self.refreshButtonState();
		});
	}

	update(applicationName, isTemplate, parentUUIDs, parentNames, shortName, pageUUID, pageName, description) {
		this.updateNameInputField.setInitialValue(applicationName);
		this.updateIsTemplateInputField.setInitialValue(isTemplate);
		this.parentListInputField.setInitialValues(parentUUIDs, parentNames);
		this.updateShortNameInputField.setInitialValue(shortName);
		this.updateDescriptionInputField.setInitialValue(description);
		this.updateNameInputField.value = applicationName;
		this.updateIsTemplateInputField.value = isTemplate;
		this.parentListInputField.setValues(parentUUIDs, parentNames);
		this.updateShortNameInputField.value = shortName;
		this.updateDescriptionInputField.value = description;
		this.refreshButtonState();
	}

	init() {
		let thisEditorElement = this;
	    for(let i=0;i < this.inputFields.length;i++) {
	    	let inputField = this.inputFields[i];
	    	inputField.init();
	    	inputField.addEventListener('input', function(ev) {
				thisEditorElement.refreshButtonState();
	    	});
		}

		super.init();
	}
	//     frag.querySelector('.action-save-application').addEventListener('click', function(ev) {
	//         ev.preventDefault();
	//         var href = this.getAttribute('href');
	//         var applicationUUID = href.substring(1);
	//         thisEditorElement.updateApplication(applicationUUID);
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
	//         thisEditorElement.deleteApplication(applicationUUID);
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

	// 	let parentInputField = new SelectApplicationInputField(null,
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