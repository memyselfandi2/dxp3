class ApplicationsAdminPanel extends AdminPanel {
	
	constructor(id, name) {
		super(id, name);

		this.selectApplicationInputField = new SelectApplicationInputField('applications-admin-panel-select-application',
																		   null,
																		   'Select an application',
																		   true);
		let thisEditorElement = this;
		this.selectApplicationInputField.addEventListener('select', function(ev) {
			thisEditorElement.loadApplication(ev.applicationUUID);
		});

		this.createApplicationInputField = new CreateApplicationInputField('applications-admin-panel-create-application',
																		   null,
																		   'Create an application');
		this.applicationPanels = new Map();

		this.applicationsTabMenu = new TabMenu();
		this.homePanel = new ApplicationsHomePanel();

		this.applicationsTabMenu.addPanel(this.homePanel, 'fa fa-home', false);
		this.applicationsTabMenu.selectPanelById(this.homePanel.id);
		this.applicationsTabMenu.addEventListener('close', function(applicationUUID) {
			let applicationPanel = thisEditorElement.applicationPanels.get(applicationUUID);
			if(applicationPanel === undefined || applicationPanel == null) {
				return;
			}
			thisEditorElement.applicationPanels.delete(applicationUUID);
			document.getElementById(applicationPanel.id).remove();
			let selectedPanel = thisEditorElement.applicationsTabMenu.getSelectedPanel();
			if(selectedPanel === null) {
				thisEditorElement.applicationsTabMenu.selectPanelById(thisEditorElement.homePanel.id);
			}
		});

		ApplicationDAO.addEventListener('create', function(applicationUUID) {
			thisEditorElement.loadApplication(applicationUUID);
		});
		ApplicationDAO.addEventListener('delete', function(applicationUUID) {
			thisEditorElement.applicationsTabMenu.removePanelById(applicationUUID);
		});
		ApplicationDAO.addEventListener('update', function(applicationUUID) {
			thisEditorElement.loadApplication(applicationUUID);
		});
	}

	getDocumentFragment() {
		let template = '<div class="applications-admin-panel">';
		template += 	'<div class="header">';
		template += 		'<div class="column large">';
		template += 			'<div id="select-application-input-field-and-popup"></div>';
		template += 		'</div>';
		template += 		'<div class="column large">';
		template += 			'<div id="create-application-input-field-and-popup"></div>';
		template += 		'</div>';
		template += 	'</div>';
		template += 	'<div class="application-panels content"></div>';
		template += '</div>';
		let myDocumentFragment = document.createRange().createContextualFragment(template);
		let mergedDocumentFragment = super.getDocumentFragment(myDocumentFragment);

		let child = mergedDocumentFragment.querySelector('.application-panels');
		child.appendChild(this.applicationsTabMenu.getDocumentFragment());
		child.appendChild(this.homePanel.getDocumentFragment());

		child = mergedDocumentFragment.querySelector('#select-application-input-field-and-popup');
		child.parentNode.replaceChild(this.selectApplicationInputField.getDocumentFragment(), child);

		child = mergedDocumentFragment.querySelector('#create-application-input-field-and-popup');
		child.parentNode.replaceChild(this.createApplicationInputField.getDocumentFragment(), child);
		return mergedDocumentFragment;
	}

	init() {
		this.applicationsTabMenu.init();
		this.homePanel.init();
		this.selectApplicationInputField.init();
		this.createApplicationInputField.init();

		super.init();
	}
	    // var aElement = mergedDocumentFragment.getElementById('action-select-applications-home');
	    // aElement.addEventListener('click', function(ev) {
	    //     var href = this.getAttribute('href');
	    //     var selected = this.closest('.tabs-menu').querySelector('ul li.selected');
	    //     if(selected) {
	    //         selected.classList.remove('selected');
	    //     }
	    //     this.closest('li').classList.add('selected');
	    //     let applicationUUID = href.substring(1);
	    //     var applicationPanelToShow = document.getElementById(applicationUUID);
	    //     var tabs = document.querySelectorAll('.application-panel.tab.show');
	    //     for(var j=0;j < tabs.length;j++) {
	    //         tabs[j].classList.remove('show');
	    //         tabs[j].classList.add('hide');
	    //     }
	    //     applicationPanelToShow.classList.remove('hide');
	    //     applicationPanelToShow.classList.add('show');
	    // });

		// this.selectApplicationInputField.initDocumentFragment();

		// let toBeReplaced = documentFragment.getElementById('tobereplaced');
		// console.log('to be replaced : ' + toBeReplaced);
		// console.log('with : ' + this.selectApplicationInputField.documentFragment);
		// toBeReplaced.parentNode.replaceChild(this.selectApplicationInputField.documentFragment, toBeReplaced);
		// let thisEditorElement = this;

		// var createApplicationParentsInput = documentFragment.getElementById('create-application-parentUUIDs');
		// // We add the click event to intercept and stop propagation.
		// // This will ensure the popup (opened by the accompanying focus event) stays open.
		// // The focus event will open the popup and initiate the 'get a list of applications' request.
		// createApplicationParentsInput.addEventListener('click', function(ev) {
		// 	ev.preventDefault();
		// 	ev.stopPropagation();
		// 	return false;
		// });
		// createApplicationParentsInput.addEventListener('focus', function(ev) {
		// 	ev.preventDefault();
		// 	thisEditorElement.showCreateApplicationParentsPopup();
		// 	return false;
		// });
		// var createApplicationParentsButton = createApplicationParentsInput.parentNode.querySelector('.search-button');
		// createApplicationParentsButton.addEventListener('click', function(ev) {
		// 	ev.preventDefault();
		// 	thisEditorElement.showCreateApplicationParentsPopup();
		// 	return false;
		// });
		// // var filterActions = documentFragment.querySelectorAll('#applications-admin-panel-select-application-popup input.filter-radio-button');
		// // for(var i=0;i< filterActions.length;i++) {
		// // 	filterActions[i].addEventListener('change', function(ev) {
		// // 		ev.preventDefault();
		// // 		thisEditorElement.list('#applications-admin-panel-select-application-popup', thisEditorElement.currentApplicationNameRegex);
		// // 	return false;
		// // 	});
		// // }

		// // let sortActions = documentFragment.querySelectorAll('#applications-admin-panel-select-application-popup-list .sort-by');
		// // for(var i=0;i < sortActions.length;i++) {
		// // 	sortActions[i].addEventListener('click', function(ev) {
		// // 		ev.preventDefault();
		// // 		var icon = this.parentNode.querySelector('i');
		// // 		var href = this.getAttribute('href');
		// // 		var sortColumn = href.substring(1);
		// // 		if(sortColumn === thisEditorElement.sortColumn) {
		// // 			if(thisEditorElement.sortOrder === 'ascending') {
		// // 				icon.classList.remove('fa-sort-alpha-asc');
		// // 				icon.classList.add('fa-sort-alpha-desc');
		// // 				thisEditorElement.sortOrder = 'descending';
		// // 			} else {
		// // 				icon.classList.remove('fa-sort-alpha-desc');
		// // 				icon.classList.add('fa-sort-alpha-asc');
		// // 				thisEditorElement.sortOrder = 'ascending';
		// // 			}
		// // 		} else {
		// // 			thisEditorElement.sortOrder = 'descending';
		// // 		}
		// // 		thisEditorElement.sortColumn = sortColumn;
		// // 		thisEditorElement.list('#applications-admin-panel-select-application-popup', thisEditorElement.currentApplicationNameRegex);
		// // 		return false;
		// // 	});
		// // }

		// // 		// return columns to default sort icon
		// // 		let icons = this.parentNode.parentNode.querySelectorAll('i');
		// // 	for(var i=0;i < icons.length;i++) {
		// // 		icons[i].classList.add('fa');
		// // 		icons[i].classList.add('fa-sort');
		// // 		icons[i].classList.remove('')
		// // 	var icon = $(this).find('i');
		// // 	icon.classList.remove('fa-sort');
		// // 	if(thisEditorElement.sortColumn === 'name') {
		// // 		if(thisEditorElement.sortOrder === 'ascending') {
		// // 			icon.addClass('fa-sort-alpha-desc');
		// // 			thisEditorElement.sortOrder = 'descending';
		// // 		} else {
		// // 			icon.addClass('fa-sort-alpha-asc');
		// // 			thisEditorElement.sortOrder = 'ascending';
		// // 		}
		// // 	} else {
		// // 		icon.addClass('fa-sort-alpha-asc');
		// // 		thisEditorElement.sortOrder = 'ascending';
		// // 	}
		// // });

		// var createApplicationInput = documentFragment.getElementById('applications-admin-panel-create-application-input');
		// createApplicationInput.addEventListener('click', function(ev) {
		// 	ev.preventDefault();
		// 	ev.stopPropagation();
		// 	thisEditorElement.showCreateApplicationPopup();
		// 	return false;
		// });
		// createApplicationInput.addEventListener('focus', function(ev) {
		// 	ev.preventDefault();
		// 	thisEditorElement.showCreateApplicationPopup();
		// 	return false;
		// });
		// createApplicationInput.addEventListener('keyup', function(ev) {
		// 	var key = ev.which;
		// 	if(key === 13) {
		// 		thisEditorElement.createApplication(true);
		// 		return false;
		// 	}
		// });
		// var createApplicationButton = documentFragment.getElementById('applications-admin-panel-create-application').querySelector('.create-button');
		// createApplicationButton.addEventListener('click', function(ev) {
		// 	ev.preventDefault();
		// 	ev.stopPropagation();
		// 	let createApplicationInput = documentFragment.getElementById('applications-admin-panel-create-application-input');
		// 	createApplicationInput.focus();
		// 	return false;
		// });
		// documentFragment.getElementById('create-application-save-and-close').addEventListener('click', function(ev) {
		// 	ev.preventDefault();
		// 	thisEditorElement.createApplication(true);
		// 	return false;
		// });
		// documentFragment.getElementById('create-application-save-and-new').addEventListener('click', function(ev) {
		// 	ev.preventDefault();
		// 	thisEditorElement.createApplication(false);
		// 	return false;
		// });
		// documentFragment.getElementById('create-application-cancel').addEventListener('click', function(ev) {
		// 	ev.preventDefault();
		// 	Popup.hide('#applications-admin-panel-create-application-popup');
		// 	return false;
		// });
		// documentFragment.getElementById('create-application-parentUUIDs').addEventListener('focus', function(ev) {

		// });

	// addApplication(applicationUUID, applicationName, isTemplate, parentUUIDs, parentNames, shortName, pageUUID, pageName, description) {
	//     // Check if this application has already been loaded
	//     if(this.applicationPanels.has(applicationUUID)) {
	//     	let applicationPanel = this.applicationPanels.get(applicationUUID);
	//     	applicationPanel.update(applicationName, isTemplate, parentUUIDs, parentNames, shortName, pageUUID, pageName, description);
	//         // let clickEvent = new Event('click');
	//         // let tabsMenu = document.getElementById(this.id).querySelector('.tabs-menu ul');
	//         // let aElement = tabsMenu.querySelector('a.action-select-application[href=\'#' + applicationUUID + '\']');
	//         // aElement.textContent = applicationName;
	//         // aElement.dispatchEvent(clickEvent);
	//     	this.applicationsTabMenu.selectPanelById(applicationPanel.id);
	//     	return;
	//     }
	// 	let applicationPanel = new ApplicationPanel(applicationUUID, applicationName, isTemplate, parentUUIDs, parentNames, shortName, pageUUID, pageName, description);
	// 	this.applicationPanels.set(applicationUUID, applicationPanel);

	// 	let applications = document.getElementById(this.id).querySelector('.application-panels');
	// 	applications.appendChild(applicationPanel.getDocumentFragment());
	// 	this.applicationsTabMenu.addPanel(applicationPanel, null);
 //    	this.applicationsTabMenu.selectPanelById(applicationPanel.id);
	    // Check if this application has already been loaded
	    // var applicationDiv = document.getElementById(applicationUUID);
	    // if(applicationDiv) {
	    //     // is already open. Lets update any details.


	    //     let details = applicationDiv.querySelector('.details');
	    //     let input = details.querySelector('.update-application-name');
	    //     let inputField = input.closest('.input-field');
	    //     editorInputField.refreshInputField(inputField, applicationName);
	    //     input =  details.querySelector('.update-application-shortname');
	    //     inputField = input.closest('.input-field');
	    //     editorInputField.refreshInputField(inputField, shortName);
	    //     input = details.querySelector('.update-application-is-template-yes');
	    //     inputField = input.closest('.input-field');
	    //     editorInputField.refreshInputField(inputField, isTemplate);
	    //     input =  details.querySelector('.update-application-description');
	    //     inputField = input.closest('.input-field');
	    //     editorInputField.refreshInputField(inputField, description);
	    //     return;
	    // }
	    // let thisEditorElement = this;
	    // let tabsMenu = document.getElementById(this.id).querySelector('.tabs-menu ul');
	    // var liElement = document.createElement('li');
	    // var aElement = document.createElement('a');
	    // aElement.setAttribute('href', '#' + applicationUUID);
	    // aElement.setAttribute('class', 'action-select-application');
	    // var aContent = document.createTextNode(applicationName);
	    // aElement.appendChild(aContent);
	    // var buttonElement = document.createElement('button');
	    // buttonElement.setAttribute('class', 'close-button');
	    // buttonElement.setAttribute('type', 'reset');
	    // buttonElement.setAttribute('title', 'Close');
	    // var iElement = document.createElement('i');
	    // iElement.setAttribute('class', 'fa fa-times fa-lg');
	    // buttonElement.appendChild(iElement);
	    // liElement.appendChild(aElement);
	    // liElement.appendChild(buttonElement);
	    // tabsMenu.appendChild(liElement);
	    // // var newLineElement = document.createTextNode('\n');
	    // // tabsMenu.appendChild(newLineElement);
	    // aElement.addEventListener('click', function(ev) {
	    //     var href = this.getAttribute('href');
	    //     var selected = this.closest('.tabs-menu').querySelector('ul li.selected');
	    //     if(selected) {
	    //         selected.classList.remove('selected');
	    //     }
	    //     this.closest('li').classList.add('selected');
	    //     applicationUUID = href.substring(1);
	    //     let applicationPanel = thisEditorElement.applicationPanels.get(applicationUUID);
	    //     console.log('attempting to show: ' + applicationPanel.id);
	    //     applicationPanel.show();
	    //     // var applicationPanelToShow = document.getElementById(applicationUUID);
	    //     // var tabs = document.querySelectorAll('.application-panel.tab.show');
	    //     // for(var j=0;j < tabs.length;j++) {
	    //     //     tabs[j].classList.remove('show');
	    //     //     tabs[j].classList.add('hide');
	    //     // }
	    //     // applicationPanelToShow.classList.remove('hide');
	    //     // applicationPanelToShow.classList.add('show');
	    // });
	    // buttonElement.addEventListener('click', function(ev) {
	    // 	ev.preventDefault();
	    //     var liParent = this.parentNode;
	    //     var aElement = liParent.querySelector('a');
	    //     var href = aElement.getAttribute('href');
	    //     applicationUUID = href.substring(1);
	    //     thisEditorElement.removeApplication(applicationUUID);
	    //     return false;
	    // });
	    // let clickEvent = new Event('click');
	    // aElement.dispatchEvent(clickEvent);
	//     var divElement = document.createElement('div');
	//     divElement.setAttribute('id', applicationUUID);
	//     divElement.setAttribute('class', 'application-panel tab hide');
	//     var applicationMenuString = '<nav class="application-panel-menu">'+
	//                         '<ul>'+
	//                             '<li><a class="action-select-application-panel-card selected" href="#details" title="Details"><i class="fa fa-info"></i>&nbsp;Details</a></li>'+
	//                             '<li><a class="action-select-application-panel-card" href="#pages-panel" title="Pages"><i class="fa fa-object-group"></i>&nbsp;Pages</a></li>'+
	//                             '<li><a class="action-select-application-panel-card" href="#features" title="Features"><i class="fa fa-code"></i>&nbsp;Features</a></li>'+
	//                             '<li><a class="action-select-application-panel-card" href="#categories" title="Categories"><i class="fa fa-tags"></i>&nbsp;Categories</a></li>'+
	//                             '<li><a class="action-select-application-panel-card" href="#content-types" title="Content types"><i class="fa fa-table"></i>&nbsp;Content types</a></li>'+
	//                             '<li><a class="action-select-application-panel-card" href="#contents" title="Content"><i class="fa fa-file"></i>&nbsp;Content</a></li>'+
	//                         '</ul>'+
	//                     '</nav>';
	//     let frag = document.createRange().createContextualFragment(applicationMenuString);

	//     let applicationMenu = frag.querySelector('.application-panel-menu');
	//     applicationMenu.addEventListener('mouseenter', function(ev) {
	//         editorApplicationMenu.show(this);
	//     });
	//     applicationMenu.addEventListener('mouseleave', function(ev) {
	//         editorApplicationMenu.hide(this);
	//     });
	//     var actions = frag.querySelectorAll('.application-panel-menu a');
	//     for(var i=0;i < actions.length;i++) {
	// //      actions[i].classList.add('hide');
	//         actions[i].addEventListener('click', function(ev) {
	//             var href = this.getAttribute('href');
	//             var element = this.closest('.application-panel-menu');
	//             var currentSelected = this.parentNode.parentNode.querySelector('a.selected');
	//             if(currentSelected) {
	//                 currentSelected.classList.remove('selected');
	//             }
	//             this.classList.add('selected');
	//             editorApplicationMenu.hide(element);

	//         });
	//     }

	//     divElement.appendChild(frag);

	//     var contentsString = '<div class="application-panel-main">' +
	//                             '<div class="details show">' +
	//                             '</div>' +
	//                             '<div class="pages-panel hide">' +
	//                             '</div>' +
	//                             '<div class="features hide">' +
	//                             'Features</div>' +
	//                             '<div class="categories hide">' +
	//                             'Categories</div>' +
	//                             '<div class="content-types hide">' +
	//                             'Content types</div>' +
	//                             '<div class="contents hide">' +
	//                             'Actual content.</div>' +
	//                         '</div>';
	//     frag = document.createRange().createContextualFragment(contentsString);
	//     divElement.appendChild(frag);
	//     let tabs = document.querySelector('#applications-admin-panel > .content');
	//     tabs.appendChild(divElement);
	//     actions = divElement.querySelectorAll('.action-select-application-panel-card');
	//     for(var i=0;i < actions.length;i++) {
	//         actions[i].addEventListener('click', function(ev) {
	//             ev.preventDefault();
	//             let href = this.getAttribute('href');
	//             console.log('click : ' + href);
	//             let cardClass = href.substring(1);
	//             var theCurrentlyShownCard = this.closest('.application-panel').querySelector('.application-panel-main > .show');
	//             if(theCurrentlyShownCard) {
	//                 console.log('the currently shown card: ' + theCurrentlyShownCard.classList);
	//                 theCurrentlyShownCard.classList.remove('show');
	//                 theCurrentlyShownCard.classList.add('hide');
	//             }
	//             var theCard = this.closest('.application-panel').querySelector('.application-panel-main > .' + cardClass);
	//             theCard.classList.remove('hide');
	//             theCard.classList.add('show');
	//             return false;
	//         })
	//     }
	//     let template =  '<div class="header">' +
	//                         '<div class="loading hide"><img class="icon-loading hide" src="/web/images/loading-spinner.gif"></div>' +
	//                         '<div class="menu">' +
	//                             '<a href="#' + applicationUUID + '" title="Save" class="action-save action-save-application disabled"><i class="far fa-save"></i>Save</a>' +
	//                             '<a href="#' + applicationUUID + '" title="Cancel" class="action-cancel action-cancel-edit-application disabled"><i class="fa fa-times"></i>Cancel</a>' +
	//                             '<a href="#' + applicationUUID + '" title="Publish" class="action-publish action-publish-application"><i class="fa fa-cloud-upload-alt"></i>Publish</a>' +
	//                             '<a href="#' + applicationUUID + '" title="Copy" class="action-copy action-copy-application"><i class="far fa-copy"></i>Copy</a>' +
	//                             '<a href="#' + applicationUUID + '" title="Paste" class="action-paste action-paste-application disabled"><i class="fas fa-paste"></i>Paste</a>' +
	//                             '<a href="#' + applicationUUID + '" title="Delete" class="action-delete action-delete-application"><i class="fa fa-trash-alt"></i>Delete</a>' +
	//                             '<a href="#' + applicationUUID + '" title="Message" class="action-message hide"><i class="fa fa-bullhorn"></i></a>' + 
	//                             '<a href="#' + applicationUUID + '" title="Help" class="action-help"><i class="fa fa-question"></i></a>' +
	//                         '</div>' +
	//                     '</div>';
	    
	//     frag = document.createRange().createContextualFragment(template);
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
	//     var theCard = divElement.querySelector('.application-panel-main > .pages-panel');
	//     frag = document.createRange().createContextualFragment(template);
	//     var popups = frag.querySelectorAll('.popup');
	//     for(var i=0;i < popups.length;i++) {
	//         Popup.initPopupElement(popups[i]);
	//     }
	//     var inputFields = frag.querySelectorAll('.input-field');
	//     for(var i=0;i < inputFields.length;i++) {
	//         InputField.initInputField(inputFields[i]);
	//     }

	//     var filterActions = frag.querySelectorAll('.select-page-popup input.filter-radio-button');
	//     for(var i=0;i< filterActions.length;i++) {
	//         filterActions[i].addEventListener('change', function(ev) {
	//             ev.preventDefault();
	//             let popup = this.closest('.select-page-popup');
	//             let inputField = popup.closest('.select-page-input-field');
	//             let input = inputField.querySelector('input.select-page');
	//             editorPagesPanel.list(popup, input.value);
	//         return false;
	//         });
	//     }

	//     // Show the select page popup when the user clicks in the select page input field.
	//     // Also refresh the page list.
	//     var selectPageInput = frag.querySelector('.select-page-input-field > input');
	//     // We add the click event to intercept and stop propagation.
	//     // This will ensure the popup (opened by the accompanying focus event) stays open.
	//     // The focus event will open the popup and initiate the 'get a list of pages' request.
	//     selectPageInput.addEventListener('click', function(ev) {
	//         ev.preventDefault();
	//         ev.stopPropagation();
	//         return false;
	//     });
	//     selectPageInput.addEventListener('focus', function(ev) {
	//         ev.preventDefault();
	//         let popup = this.parentNode.querySelector('.select-page-popup');
	//         Popup.show(popup);
	//         editorPagesPanel.list(popup, this.value);
	//         return false;
	//     });
	//     selectPageInput.addEventListener('keyup', function(ev) {
	//         var key = ev.which;
	//         if(key === 13) {
	//             let pagesList = this.parentNode.querySelector('.select-page-popup .list');
	//             var action = pagesList.querySelector('table tbody tr:first-child a');
	//             if(action) {
	//                 var clickEvent = new Event('click');
	//                 action.dispatchEvent(clickEvent);
	//             }
	//         } else {
	//             let popup = this.parentNode.querySelector('.select-page-popup');
	//             editorPagesPanel.list(popup, this.value);
	//         }
	//     });
	//     var selectPageButton = frag.querySelector('.select-page-input-field .search-button');
	//     selectPageButton.addEventListener('click', function(ev) {
	//         ev.preventDefault();
	//         ev.stopPropagation();
	//         let selectPageInput = this.parentNode.querySelector('input');
	//         var focusEvent = new Event('focus');
	//         selectPageInput.dispatchEvent(focusEvent);
	//         return false;
	//     });
	//     var createPageInput = frag.querySelector('.create-page-input-field > input');
	//     createPageInput.addEventListener('click', function(ev) {
	//         ev.preventDefault();
	//         ev.stopPropagation();
	//         return false;
	//     });
	//     createPageInput.addEventListener('focus', function(ev) {
	//         ev.preventDefault();
	//         let popup = this.parentNode.querySelector('.create-page-popup');
	//         Popup.show(popup);
	//         return false;
	//     });
	//     createPageInput.addEventListener('keyup', function(ev) {
	//         var key = ev.which;
	//         if(key === 13) {
	//             let popup = this.parentNode.querySelector('.create-page-popup');
	//             editorPagePanel.createPage(this.parentNode, this, popup, true);
	//             return false;
	//         }
	//     });

	//     theCard.appendChild(frag);
	//     template = '<div class="content"><nav class="tabs-menu"><ul><li class="selected"><a class="action-page-home" href="#"><i class="fa fa-home"></i></a></li></ul></nav><div class="page-panel-home page-panel tab show">this is the pages panel home</div></div>';
	//     frag = document.createRange().createContextualFragment(template);

	//     var actionHome = frag.querySelector('.action-page-home');
	//     actionHome.addEventListener('click', function(ev) {
	//         var href = this.getAttribute('href');
	//         var selected = this.closest('.tabs-menu').querySelector('ul li.selected');
	//         if(selected) {
	//             selected.classList.remove('selected');
	//         }
	//         this.closest('li').classList.add('selected');
	//         let contentPanel = this.closest('.content');
	//         let pagePanelToShow = contentPanel.querySelector('.page-panel-home');
	//         var tabs = document.querySelectorAll('.page-panel.tab.show');
	//         for(var j=0;j < tabs.length;j++) {
	//             tabs[j].classList.remove('show');
	//             tabs[j].classList.add('hide');
	//         }
	//         pagePanelToShow.classList.remove('hide');
	//         pagePanelToShow.classList.add('show');
	//     });

	//     theCard.appendChild(frag);
	//     var clickEvent = new Event('click');
	//     aElement.dispatchEvent(clickEvent);

	showCreateApplicationParentsPopup() {
		Popup.show('#create-application-parentUUIDs-popup');
		this.list('#create-application-parentUUIDs-popup', this.currentApplicationNameRegex);
	}

	showCreateApplicationPopup() {
		// var allInputs = document.querySelectorAll('input[tabindex]');
		// for(var i=0;i < allInputs.length;i++ ) {
		// 	allInputs[i].setAttribute('tabindex', '');
		// }
		// document.getElementById('applications-admin-panel-create-application-input').setAttribute('tabindex', 1);
		// document.getElementById('create-application-is-template-yes').setAttribute('tabindex', 2);
		// document.getElementById('create-application-is-template-no').setAttribute('tabindex', 3);
		// document.getElementById('create-application-parentUUIDs').setAttribute('tabindex', 4);
		// document.getElementById('create-application-shortname').setAttribute('tabindex', 5);
		// document.getElementById('create-application-description').setAttribute('tabindex', 7);
		// document.getElementById('create-application-save-and-close').setAttribute('tabindex', 8);
		// document.getElementById('create-application-save-and-new').setAttribute('tabindex', 9);
		// document.getElementById('create-application-cancel').setAttribute('tabindex', 10);
		Popup.show('#applications-admin-panel-create-application-popup');
	}

	updateApplication(applicationUUID) {
		if(applicationUUID === undefined || applicationUUID === null) {
			applicationUUIDapplicationUUID = '';
		}
		applicationUUID = applicationUUID.trim();
		if(applicationUUID.length <= 0) {
			return;
		}
		let applicationPanel = document.getElementById(applicationUUID);
		let name = applicationPanel.querySelector('.update-application-name').value;
		name = name.trim();
		if(name.length <= 0) {
			return;
		}
		let isTemplate = applicationPanel.querySelector('.update-application-is-template-yes').checked;
		let parentUUIDs =  applicationPanel.querySelector('.update-application-parentUUIDs-hidden').value;
		let shortName =  applicationPanel.querySelector('.update-application-shortname').value;
		let pageUUID =  applicationPanel.querySelector('.update-application-homepage-hidden').value;
		let description =  applicationPanel.querySelector('.update-application-description').value;
		let thisEditorElement = this;
	    Security.fetch('/application/' + applicationUUID, { 
	    	method: "PUT",
	    	body: {"name": name,
	               "parentUUIDs": parentUUIDs,
	        	   "shortName": shortName,
	        	   "isTemplate": isTemplate,
	        	   "pageUUID": pageUUID,
	               "description": description},
	    	headers: {"Content-Type": "application/json"}
	    })
		.then(function(response) {
			if(response.status === 404) {
				alert('not found');
			} else {
				response.json().then(function(data) {
					thisEditorElement.addApplication(data.uuid, data.name, data.isTemplate, data.parentUUIDs, data.parentNames, data.shortName, data.pageUUID, data.pageName, data.description);
				});
			}
		})
		.catch(function(error) {
			console.log(error);
		});
	}

	loadApplication(applicationUUID) {
		if(applicationUUID === undefined || applicationUUID === null) {
			applicationUUID = '';
		}
		applicationUUID = applicationUUID.trim();
		if(applicationUUID.length <= 0) {
			return;
		}
		// document.getElementById('#applications-admin-panel .action-message').hide();
		this.loadApplicationDefinition(applicationUUID);
	 //    thisEditorElement.loadApplicationStyle(uuid);
	 //    thisEditorElement.loadApplicationController(uuid);
	 //    thisEditorElement.refreshApplicationPreview(uuid);

	}

	loadApplicationDefinition(applicationUUID) {
		let thisEditorElement = this;
		ApplicationDAO.read(applicationUUID, function(data, error) {
			if(error) {
				return;
			}
			// First we check if this application already has a panel.
			let applicationPanel = thisEditorElement.applicationPanels.get(applicationUUID);
			if(applicationPanel != null) {
				applicationPanel.name = data.name;
	    		applicationPanel.update(data.name, data.isTemplate, data.parentUUIDs, data.parentNames, data.shortName, data.pageUUID, data.pageName, data.description);
				thisEditorElement.applicationsTabMenu.updatePanel(applicationPanel, null);
	    	} else {
				applicationPanel = new ApplicationPanel(applicationUUID, data.name, data.isTemplate, data.parentUUIDs, data.parentNames, data.shortName, data.pageUUID, data.pageName, data.description);
				thisEditorElement.applicationPanels.set(applicationUUID, applicationPanel);
				let applications = document.getElementById(thisEditorElement.id).querySelector('.application-panels');
				applications.appendChild(applicationPanel.getDocumentFragment());
				applicationPanel.init();
				thisEditorElement.applicationsTabMenu.addPanel(applicationPanel, null);
			}
	    	thisEditorElement.applicationsTabMenu.selectPanelById(applicationPanel.id);
		});
	}
//			thisEditorElement.addApplication(data.uuid, data.name, data.isTemplate, data.parentUUIDs, data.parentNames, data.shortName, data.pageUUID, data.pageName, data.description);
		    // if(this.applicationPanels.has(applicationUUID)) {
		    // 	let applicationPanel = this.applicationPanels.get(applicationUUID);
		    // 	applicationPanel.update(applicationName, isTemplate, parentUUIDs, parentNames, shortName, pageUUID, pageName, description);
		    //     // let clickEvent = new Event('click');
		    //     // let tabsMenu = document.getElementById(this.id).querySelector('.tabs-menu ul');
		    //     // let aElement = tabsMenu.querySelector('a.action-select-application[href=\'#' + applicationUUID + '\']');
		    //     // aElement.textContent = applicationName;
		    //     // aElement.dispatchEvent(clickEvent);
		    // 	this.applicationsTabMenu.selectPanelById(applicationPanel.id);
		    // 	return;
		    // }

		// $('#update-application-name').val('');
		// $('#application-template').val('');
		// $('#update-application-parentUUIDs').val('');
		// $('#update-application-parentUUIDs-hidden').val('');
		// $('#update-application-shortname').val('');
		// $('#update-application-homepage').val('');
		// $('#update-application-homepage-hidden').val('');
		// $('#update-application-description').val('');
		// var ulElement = $('#application-parents-list');
		// ulElement.empty();
		// if(uuid === null) {
		// 	thisEditorElement.currentApplicationName = '';
		// 	thisEditorElement.currentApplicationParentUUIDs = '';
		// 	thisEditorElement.currentApplicationShortName = '';
		// 	thisEditorElement.currentApplicationHomePage = null;
		// 	thisEditorElement.currentApplicationDescription = '';
		// 	$('input.select-application').val('');
		// 	// enable the mask
		// 	$('#applications-admin-panel .maskable').addClass('blur');					
		// 	$('#applications-admin-panel .mask').show();
		// 	return;				
		// }
	// 	thisEditorElement.fetchDefinition = Security.fetch({type: 'GET',
	//         url: '/application/' + uuid,
	//         dataType: 'json',
	//         success: function(data) {
	//             if(data !== undefined && (data !== null) && (data != '')) {
	// 				thisEditorElement.currentApplicationName = data.name;
	// 				thisEditorElement.currentApplicationShortName = data.shortName;
	// 				thisEditorElement.currentApplicationHomePage = data.pageUUID;
	// 				thisEditorElement.currentApplicationDescription = data.description;
	//             	$('#update-application-name').val(data.name);
	//             	var isTemplate = (data.isTemplate != undefined && data.isTemplate != null) ? data.isTemplate : false;
	//        			$('#update-application-is-template-yes').prop('checked', isTemplate);
	//         		$('#update-application-is-template-no').prop('checked', !isTemplate);
	//         		if(isTemplate) {
	// //	        			$('#application-template').text('Yes');
	//         		} else {
	// //	        			$('#application-template').text('No');
	//         		}
	// 				var foundAtLeastOneValidParent = false;
	// 				var parentUUIDsString = '';
	// 				var parentName = '';
	// 				var hasParentsArray = ((data.parentUUIDs != undefined) && (data.parentUUIDs != null) && (Array.isArray(data.parentUUIDs)) && (data.parentUUIDs.length > 0));
	// 				if(hasParentsArray) {
	// 				    for(var index in data.parentUUIDs) {
	// 				    	var parentUUID = data.parentUUIDs[index];
	// 				    	if(parentUUID === undefined || parentUUID === null) {
	// 				    		parentUUID = '';
	// 				    	}
	// 				    	parentUUID = parentUUID.trim();
	// 				    	if(parentUUID.length > 0) {
	// 				    		parentUUIDsString = parentUUID;
	// 							foundAtLeastOneValidParent = true;
	// 				        	ulElement.append('<li>' + data.parentUUIDs[index] + '</li>');
	// 				        }
	// 				    }
	// 				}
	// 				if(foundAtLeastOneValidParent) {
	// 					parentName = data.parentNames[0];
	// 					$('#update-application-parentUUIDs-hidden').val(parentUUIDsString);
	// 					$('#update-application-parentUUIDs').val(parentName);
	// 				} else {
	// 					$('#update-application-parentUUIDs-hidden').val('');
	// 					$('#update-application-parentUUIDs').val('');						
	// 				}
	//             	$('#update-application-shortname').val(data.shortName);
	//             	$('#update-application-homepage').val(data.pageName);
	//             	$('#update-application-homepage-hidden').val(data.pageUUID);
	//             	$('#update-application-description').val(data.description);
	//             	$('#application-pages-input').val(data.name);
	//             	$('#application-applications-input').val(data.name);
	//             	$('#application-categories-input').val(data.name);
	// 				$('input.select-application').val(data.name);
	// 				// disable the mask
	// 				$('#applications-admin-panel .maskable').removeClass('blur');					
	// 				$('#applications-admin-panel .mask').hide();					
	// 				// close the popup
	// 				popup.hide('#applications-admin-panel-select-application-popup');
	//             }
	//         },
	//         error: function() {
	//         }
	//     });

	deleteApplication(applicationUUID) {
		if(applicationUUID === undefined || applicationUUID === null) {
			applicationUUIDapplicationUUID = '';
		}
		applicationUUID = applicationUUID.trim();
		if(applicationUUID.length <= 0) {
			return;
		}
		let thisEditorElement = this;
	    Security.fetch('/application/' + applicationUUID, { 
	    	method: "DELETE",
	    	headers: {"Content-Type": "application/json"}
	    })
		.then(function(response) {
			if(response.status === 404) {
				alert('not found');
			} else {
				response.json().then(function(data) {
					thisEditorElement.removeApplication(data.uuid, data.name);
				});
			}
		})
		.catch(function(error) {
			console.log(error);
		});
	}

	list(popupSelector, applicationNameRegex) {
		if(this.fetchListAbortController != null) {
			this.fetchListAbortController.abort();
		}
	    this.fetchListAbortController = new AbortController();
		var currentList = document.querySelector(popupSelector + ' div.list>table>tbody');
	    Popup.showLoading(popupSelector);
		// Get the filter elements
		var checkedFilterType = document.querySelector(popupSelector + ' input.filter-radio-button:checked').value;
		var filterBy = '';
		if(checkedFilterType === 'templateonly') {
			filterBy = 'filterBy[isTemplate]=true';
		} else if(checkedFilterType === 'applicationonly') {
			filterBy = 'filterBy[isTemplate]=false';
		}
		applicationNameRegex = (applicationNameRegex === undefined || applicationNameRegex === null) ? '' : applicationNameRegex;
		applicationNameRegex = applicationNameRegex.trim();
		if(applicationNameRegex.length > 0) {
			if(filterBy.length > 0) {
				filterBy += '&';
			}
			filterBy += 'filterBy[name]=' + applicationNameRegex;
		}
		var sortBy = 'sortBy=';
		if(this.sortOrder === 'descending') {
			sortBy += '-';
		}
		sortBy += this.sortColumn;
		var filterByAndSortBy = '';
		if(filterBy.length > 0) {
			filterByAndSortBy = filterBy;
		}
		if(sortBy.length > 0) {
			if(filterByAndSortBy.length > 0) {
				filterByAndSortBy += '&';
			}
			filterByAndSortBy += sortBy;
		}
		var url = '/application/';
		if(filterByAndSortBy.length > 0) {
			url += '?' + filterByAndSortBy;
		}
		let thisEditorElement = this;
	    Security.fetch(url, { 
	    	method: "GET",
	    	headers: {"Content-Type": "application/json"}
	    }, this.fetchListAbortController)
		.then(function(response) {
			Popup.hideLoading(popupSelector);
			let child = currentList.firstChild;
			while(child) {
				currentList.removeChild(child);
				child = currentList.firstChild;
			}
			if(response.status != 200) {
	        	let errorMessage = 'An unknown error occurred. Please try again later.';
	        	Popup.showWarningMessage(popupSelector, errorMessage);
			} else {
				response.json().then(function(data) {
	      	        for(var index in data.list) {
						var uuid = data.list[index].uuid;
	                    var applicationName = data.list[index].name;
	                    var isTemplate = data.list[index].isTemplate;
	                    if(isTemplate === undefined || isTemplate === null) {
	                    	isTemplate = false;
	                    }
	                    var parentUUIDs = data.list[index].parentUUIDs;
	                    var parentUUID = '';
	                    if(parentUUIDs != undefined && parentUUIDs != null) {
	                    	if(Array.isArray(parentUUIDs) && (parentUUIDs.length > 0)) {
	                    		parentUUID = parentUUIDs[0];
	                    		if(parentUUID != undefined && (parentUUID != null)) {
	                    			parentUUID = parentUUID.trim();
	                    		}
	                    	}
	                    }
	                    var parentNames = data.list[index].parentNames;
	                    var parentName = '';
	                    if(parentNames != undefined && parentNames != null) {
	                    	if(Array.isArray(parentNames) && (parentNames.length > 0)) {
	                    		var _parentName = parentNames[0];
	                    		if(_parentName != undefined && (_parentName != null)) {
	                    			parentName = _parentName.trim();
								}
	                    	}
					    }
						var trElement = document.createElement('tr');
						var tdElement = document.createElement('td');
						var aElement = document.createElement('a');
						aElement.setAttribute('class', 'action-load-application action-list-item');
						aElement.setAttribute('href', '#' + uuid);
						var aContent = document.createTextNode(applicationName);
						aElement.appendChild(aContent);
						tdElement.appendChild(aElement);
						trElement.appendChild(tdElement);
						tdElement = document.createElement('td');
	                	if(parentUUID.length > 0) {
							aElement = document.createElement('a');
							aElement.setAttribute('class', 'action-load-application action-list-item');
							aElement.setAttribute('href', '#' + parentUUID);
							aContent = document.createTextNode(parentName);
							aElement.appendChild(aContent);
							tdElement.appendChild(aElement);
						}
						trElement.appendChild(tdElement);
						tdElement = document.createElement('td');
						if(isTemplate) {
							var tdContent = document.createTextNode('Yes');
							tdElement.appendChild(tdContent);						
						}
						trElement.appendChild(tdElement);
						currentList.appendChild(trElement);
					}
					var loadApplicationActions = currentList.querySelectorAll('.action-load-application');
					for(var i=0;i < loadApplicationActions.length;i++) {
						loadApplicationActions[i].addEventListener('click', function(ev) {
							ev.preventDefault();
							Popup.hide('#applications-admin-panel-select-application-popup');
							var href = this.getAttribute('href');
							var applicationUUID = href.substring(1);
							thisEditorElement.loadApplication(applicationUUID);
							return false;
						})
					}
	  			});
			}
		})
		.catch(function(error) {
			if(error.name === 'AbortError') {
				// ignore. This probably means the user is typing faster than we can return results.
				return;
			} else {
				Popup.hideLoading(popupSelector);
		    	var errorMessage = 'An unknown error occurred. Please try again later.';
		    	Popup.showWarningMessage(popupSelector, errorMessage);
		    }
		});
	   //  thisEditorElement.ajaxCallList = Security.ajax({type: 'GET',
	   //      url: url,
	   //      dataType: 'json',
	   //      success: function(data) {
	   //      	var noResults = false;
	   //          if(data !== undefined && (data !== null) && (data != '')) {
	   //          	if(data.length <= 0) {
	   //          		noResults = true;
	   //          	} else {
	   //          		var ulElement = $(popupSelector + ' div.list>ul.content');
		  //               for(var index in data) {
		  //                   var uuid = data[index].uuid;
		  //                   var applicationName = data[index].name;
		  //                   var isTemplate = data[index].isTemplate;
		  //                   if(isTemplate === undefined || isTemplate === null) {
		  //                   	isTemplate = false;
		  //                   }
		  //                   var liElement = '<li><a class="action-load-application action-list-item" href="#' + uuid + '">' + applicationName + '</a>';
		  //                   var parentUUIDs = data[index].parentUUIDs;
		  //                   var parentUUID = '';
		  //                   if(parentUUIDs != undefined && parentUUIDs != null) {
		  //                   	if(Array.isArray(parentUUIDs) && (parentUUIDs.length > 0)) {
		  //                   		parentUUID = parentUUIDs[0];
		  //                   		if(parentUUID != undefined && (parentUUID != null)) {
		  //                   			parentUUID = parentUUID.trim();
		  //                   		}
		  //                   	}
		  //                   }
		  //                   var parentNames = data[index].parentNames;
		  //                   var parentName = '';
		  //                   if(parentNames != undefined && parentNames != null) {
		  //                   	if(Array.isArray(parentNames) && (parentNames.length > 0)) {
		  //                   		var _parentName = parentNames[0];
		  //                   		if(_parentName != undefined && (_parentName != null)) {
		  //                   			parentName = _parentName.trim();
	   //  							}
		  //                   	}
				// 		    }
		  //               	liElement += '<a class="action-load-application action-list-item" href="#';
		  //               	if(parentUUID.length > 0) {
		  //               		liElement += parentUUID + '">' + parentName;
		  //               	} else {
		  //               		liElement += uuid + '">';
		  //               	}
		  //               	liElement += '</a>';
		  //               	liElement += '<a class="action-load-application action-list-item small" href="#' + uuid + '">';
		  //                   if(isTemplate) {
		  //                   	liElement += 'Yes';
		  //                   }
		  //               	liElement += '</a>';
		  //                   liElement += '<a class="action-delete-application" href="#' + uuid + '"><i class="fa fa-trash"></i></a></li>';
		  //                   ulElement.append(liElement);
		  //               }
		  //           }
	   //          } else {
	   //          	noResults = true;
	   //          }
	   //          if(noResults) {
	   //          	popup.showInfoMessage(popupSelector, 'No applications found.');
	   //      		$(popupSelector + ' div.list>ul.header').hide();
	   //          } else {
	   //      		$(popupSelector + ' div.list>ul.header').show();
	   //          	popup.hideMessage(popupSelector);
	   //          }
				// popup.hideLoading(popupSelector);
	   //      },
	   //      error: function() {
				// popup.hideLoading(popupSelector);
	   //      }
	   //  });
	}

	removeApplication(applicationUUID) {
		this.applicationPanels.delete(applicationUUID);
	    let tabsMenu = document.querySelector('#applications-admin-panel .tabs-menu ul');
	    let aElement = tabsMenu.querySelector('a.action-select-application[href=\'#' + applicationUUID + '\']');
	    let liElement = aElement.parentNode;
        if(liElement.classList.contains('selected')) {
			var clickEvent = new Event('click');
			document.getElementById('action-select-applications-home').dispatchEvent(clickEvent);
		}
	    liElement.remove();
	}

//	get template() {
//                     template += '<div id="applications-admin-panel-select-application" class="input-field text border">';
//                         template += '<input id="applications-admin-panel-select-application-input" class="select-application" type="text" name="select-application-name-regex" placeholder="Select an application">';
//                         template += '<div class="input-field-buttons">';
//                             template += '<button class="clear-button" type="reset" title="Clear"><i class="fa fa-trash-alt"></i></button>';
//                             template += '<button class="search-button" type="submit" title="Search"><i class="fa fa-search"></i></button>';
//                         template += '</div>';
// template += '<div id="applications-admin-panel-select-application-popup" class="popup large toplevel border">';
//                             template += '<div class="menu">';
//                                 template += '<div class="loading menu-icon"><img class="icon-loading" src="/web/images/loading-spinner.gif"/></div><a class="action-help menu-icon" href="#" title="Help"><i class="far fa-question-circle"></i></a><a class="action-close menu-icon" href="#" title="Close" ><i class="far fa-window-close"></i></a>';
//                             template += '</div>';
//                             template += '<div class="form-panel">';
//                                 template += '<div class="filter-panel">';
//                                     template += '<form>';
//                                         template += '<fieldset>';
//                                             template += '<legend>Filter</legend>';
//                                             template += '<label><input id="application-type-all" class="filter-radio-button" type="radio" name="filter-application-type" value="all" checked="checked"/>Include all</label><br/>';
//                                             template += '<label><input id="application-type-application-only" class="filter-radio-button" type="radio" name="filter-application-type" value="applicationonly"/>Application only</label><br/>';
//                                             template += '<label><input id="application-type-template-only" class="filter-radio-button" type="radio" name="filter-application-type" value="templateonly"/>Template only</label><br/>';
//                                         template += '</fieldset>';
//                                     template += '</form>';
//                                 template += '</div>';
//                                 template += '<div class="message-panel">';
//                                     template += '<span class="message"></span>&nbsp;<i class="fa fa-warning"></i>';
//                                 template += '</div>';
//                                 template += '<div id="applications-admin-panel-select-application-popup-list" class="list">';
//                                     template += '<table>';
//                                         template += '<thead>';
//                                             template += '<tr>';
//                                                 template += '<th><a class="action-list-item sort-by" href="#name">Name&nbsp;<i class="fa fa-sort"></i></a></th>';
//                                                 template += '<th><a class="action-list-item sort-by" href="#parentNames">Parent&nbsp;<i class="fa fa-sort"></i></a></th>';
//                                                 template += '<th><a class="action-list-item small sort-by" href="#isTemplate">Template&nbsp;<i class="fa fa-sort"></i></a></th>';
//                                             template += '</tr>';
//                                         template += '</thead>';
//                                         template += '<tbody>';
//                                         template += '</tbody>';
//                                     template += '</table>';
//                                 template += '</div>';
//                             template += '</div>';
//                         template += '</div>';
//                     template += '</div>';
                    // template += '<div id="applications-admin-panel-create-application" class="input-field text border">';
                    //     template += '<input id="applications-admin-panel-create-application-input" type="text" name="name" placeholder="Create an application"/>';
                    //     template += '<div class="input-field-buttons">';
                    //         template += '<button class="clear-button" type="reset" title="Clear"><i class="fa fa-trash-alt"></i></button>';
                    //         template += '<button class="create-button" type="submit" title="Create"><i class="fa fa-magic"></i></button>';
                    //     template += '</div>';
                    //     template += '<div id="applications-admin-panel-create-application-popup" class="popup toplevel border">';
                    //         template += '<div class="menu">';
                    //             template += '<div class="loading menu-icon"><img class="icon-loading" src="/web/images/loading-spinner.gif"/></div><a class="action-help menu-icon" href="#" title="Help"><i class="far fa-question-circle"></i></a><a class="action-close menu-icon" href="#" title="Close" ><i class="far fa-window-close"></i></a>';
                    //         template += '</div>';
                    //         template += '<div class="form-panel">';
                    //             template += '<div class="input-field radio-buttons border">';
                    //                 template += '<span>Is this a template?</span>';
                    //                 template += '<label><input id="create-application-is-template-yes" type="radio" name="isTemplate" value="true"/>Yes</label>';
                    //                 template += '<label><input id="create-application-is-template-no" type="radio" name="isTemplate" value="false" checked="checked"/>No</label>';
                    //             template += '</div>';
                    //             template += '<div class="input-field border">';
                    //                 template += '<input id="create-application-parentUUIDs-hidden" type="hidden" name="parentUUIDs"/>';
                    //                 template += '<input id="create-application-parentUUIDs" type="text" name="parentUUIDs" placeholder="Based on application...">';
                    //                 template += '<div class="input-field-buttons">';
                    //                     template += '<button type="reset" class="clear-button" title="Clear"><i class="fa fa-trash-alt"></i></button>';
                    //                     template += '<button type="submit" class="search-button" title="Search"><i class="fa fa-search"></i></button>';
                    //                 template += '</div>';
                    //                 template += '<div id="create-application-parentUUIDs-popup" class="popup large border">';
                    //                     template += '<div class="menu">';
                    //                         template += '<div class="loading menu-icon"><img class="icon-loading" src="/web/images/loading-spinner.gif"/></div><a class="action-help menu-icon" href="#" title="Help"><i class="far fa-question-circle"></i></a><a class="action-close menu-icon" href="#" title="Close" ><i class="far fa-window-close"></i></a>';
                    //                     template += '</div>';
                    //                     template += '<div class="form-panel">';
                    //                         template += '<div class="filter-panel">';
                    //                             template += '<form>';
                    //                                 template += '<fieldset>';
                    //                                     template += '<legend>Filter</legend>';
                    //                                     template += '<label><input id="application-type-all2" class="filter-radio-button" type="radio" name="filter-application-type" value="all" checked="checked"/>Include all</label><br/>';
                    //                                     template += '<label><input id="application-type-application-only2" class="filter-radio-button" type="radio" name="filter-application-type" value="applicationonly"/>Application only</label><br/>';
                    //                                     template += '<label><input id="application-type-template-only2" class="filter-radio-button" type="radio" name="filter-application-type" value="templateonly"/>Template only</label><br/>';
                    //                                     template += '<div class="input-field border">';
                    //                                         template += '<input class="filter-by-name" type="text" placeholder="Filter by name">';
                    //                                         template += '<div class="input-field-buttons">';
                    //                                             template += '<button type="reset" class="clear-button" title="Clear"><i class="fa fa-trash-alt"></i></button>';
                    //                                         template += '</div>';
                    //                                     template += '</div>';
                    //                                 template += '</fieldset>';
                    //                             template += '</form>';
                    //                         template += '</div>';
                    //                         template += '<div class="message-panel">';
                    //                             template += '<span class="message"></span>&nbsp;<i class="fa fa-warning"></i>';
                    //                         template += '</div>';
                    //                         template += '<div id="create-application-parentUUIDs-popup-list" class="list">';
                    //                             template += '<table>';
                    //                                 template += '<thead>';
                    //                                     template += '<tr>';
                    //                                         template += '<th><a class="action-list-item sort-by" href="#name">Name&nbsp;<i class="fa fa-sort"></i></a></th>';
                    //                                         template += '<th><a class="action-list-item sort-by" href="#parentNames">Parent&nbsp;<i class="fa fa-sort"></i></a></th>';
                    //                                         template += '<th><a class="action-list-item small sort-by" href="#isTemplate">Template&nbsp;<i class="fa fa-sort"></i></a></th>';
                    //                                     template += '</tr>';
                    //                                 template += '</thead>';
                    //                                 template += '<tbody>';
                    //                                 template += '</tbody>';
                    //                             template += '</table>';
                    //                         template += '</div>';
                    //                     template += '</div>';
                    //                 template += '</div>';
                    //             template += '</div>';
                    //             template += '<div class="input-field text border">';
                    //                 template += '<input id="create-application-shortname" type="text" name="shortname" placeholder="Short name">';
                    //                 template += '<div class="input-field-buttons">';
                    //                     template += '<button type="reset" class="clear-button" title="Clear"><i class="fa fa-trash-alt"></i></button>';
                    //                 template += '</div>';
                    //             template += '</div>';
                    //             template += '<div class="input-field text border">';
                    //                 template += '<input id="create-application-homepage" type="text" name="shortname" placeholder="Home/Index/Landing/Start page">';
                    //                 template += '<div class="input-field-buttons">';
                    //                     template += '<button type="reset" class="clear-button" title="Clear"><i class="fa fa-trash-alt"></i></button>';
                    //                 template += '</div>';
                    //             template += '</div>';
                    //             template += '<div class="input-field textarea border">';
                    //                 template += '<textarea id="create-application-description" name="description" placeholder="Description"></textarea>';
                    //                 template += '<div class="input-field-buttons">';
                    //                     template += '<button type="reset" class="clear-button" title="Clear"><i class="fa fa-trash-alt"></i></button>';
                    //                 template += '</div>';
                    //             template += '</div>';
                    //             template += '<div class="message-panel">';
                    //                 template += '<span class="message"></span>&nbsp;<i class="fa fa-warning"></i>';
                    //             template += '</div>';
                    //             template += '<div class="buttons">';
                    //                 template += '<a id="create-application-save-and-close" class="action-save shade-of-green" title="Save and close" href="#">';
                    //                     template += '<i class="fa fa-check"></i>&nbsp;Save';
                    //                 template += '</a>';
                    //                 template += '<a id="create-application-save-and-new" class="action-save" title="Save and new" href="#">';
                    //                     template += '<i class="fa fa-plus"></i>&nbsp;Save and new';
                    //                 template += '</a>';
                    //                 template += '<a id="create-application-cancel" class="action-cancel shade-of-red" title="Cancel" href="#">';
                    //                     template += '<i class="fa fa-times"></i>&nbsp;Cancel';
                    //                 template += '</a>';
                    //             template += '</div>';
                    //         template += '</div>';
                    //     template += '</div>';
        // return template;
//	}
}