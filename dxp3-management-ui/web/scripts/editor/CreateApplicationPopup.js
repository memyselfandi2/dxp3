class CreateApplicationPopup extends Popup {

	constructor(id, size, isTopLevel, hasBorder, hasMenu) {
		super(id, size, isTopLevel, hasBorder, hasMenu);

		this.isTemplateInputField = new RadioInputField(null,
														null,
														'Is this a template?',
														'isTemplate',
														['create-application-is-template-yes', 'create-application-is-template-no'],
														['true', 'false'],
														['Yes', 'No'],
														'false',
														true,
														false,
														false);
		this.parentInputField = new SelectApplicationInputField('applications-admin-panel-select-parent',
																		   null,
																		   'Based on application...',
																		   false);
		let thisEditorElement = this;
		this.parentInputField.addEventListener('select', function(ev) {
			let parentsList = document.getElementById(thisEditorElement.id).querySelector('.parents-list');
			let action = parentsList.querySelector('a[href="#' + ev.applicationUUID + '"]');
			if(action === undefined || action === null) {
				let template = '<li><a class="action-remove-parent" href="#' + ev.applicationUUID + '">' + ev.applicationName + '</a></li>';
		   		let liElement = document.createRange().createContextualFragment(template);
		   		let aElement = liElement.querySelector('.action-remove-parent');
		   		aElement.addEventListener('click', function(ev) {
		   			let liElement = this.parentNode;
		   			let ulElement = liElement.parentNode;
		   			ulElement.removeChild(liElement);
		   			if(ulElement.childNodes.length <= 0) {
		   				ulElement.classList.add('hide');
		   			}
		   		});
		   		parentsList.appendChild(liElement);
		   		parentsList.classList.remove('hide');
		   	}
		});

		this.shortNameInputField = new TextInputField('create-application-shortname',
													  null,
													  'shortname',
													  null,
													  null,
													  'Short name',
													  INPUT_FIELD_TYPES.DEFAULT,
													  true,
													  false,
													  true);

		this.descriptionInputField = new TextAreaInputField('create-application-description',
			null,
			'description',
			'',
			null,
			'Description',
			INPUT_FIELD_TYPES.DEFAULT,
			true,
			false,
			true);

		this.saveButton = new Button('create-application-save-and-close', 'action-save shade-of-green', 'Save and close', 'fa fa-check', 'Save');
		this.saveButton.addEventListener('click', function() {
			let event = {};
			event.isTemplate = thisEditorElement.isTemplateInputField.value;
			let parentsList = document.getElementById(thisEditorElement.id).querySelector('.parents-list');
			let aElements = parentsList.querySelectorAll('a');
			event.parentUUIDs = [];
			for(var i=0;i < aElements.length;i++) {
				let href = aElements[i].getAttribute('href');
				let parentUUID = href.substring(1);
				event.parentUUIDs.push(parentUUID);
			}
			event.shortName = thisEditorElement.shortNameInputField.value;
			event.description = thisEditorElement.descriptionInputField.value;
			event.closeOnSuccess = true;
			thisEditorElement.dispatchEvent('submit', event);
		});
		this.saveAndNewButton = new Button('create-application-save-and-new', 'action-save', 'Save and new', 'fa fa-plus', 'Save and new');
		this.saveAndNewButton.addEventListener('click', function() {
			let event = {};
			event.isTemplate = thisEditorElement.isTemplateInputField.value;
			let parentsList = document.getElementById(thisEditorElement.id).querySelector('.parents-list');
			let aElements = parentsList.querySelectorAll('a');
			event.parentUUIDs = [];
			for(var i=0;i < aElements.length;i++) {
				let href = aElements[i].getAttribute('href');
				let parentUUID = href.substring(1);
				event.parentUUIDs.push(parentUUID);
			}
			event.shortName = thisEditorElement.shortNameInputField.value;
			event.description = thisEditorElement.descriptionInputField.value;
			event.closeOnSuccess = false;
			thisEditorElement.dispatchEvent('submit', event);
		});
		this.cancelButton = new Button('create-application-cancel', 'action-cancel shade-of-red', 'Cancel', 'fa fa-times', 'Cancel');
		this.cancelButton.addEventListener('click', function() {
			thisEditorElement.reset();
			let event = {};
			thisEditorElement.dispatchEvent('cancel', event);
		});
		console.log('add button: saveButton');

		super.addButton(this.saveButton);
		super.addButton(this.saveAndNewButton);
		super.addButton(this.cancelButton);
	}

	init() {
		this.isTemplateInputField.init();
		this.parentInputField.init();
		this.shortNameInputField.init();
		this.descriptionInputField.init();
		super.init();
	}

	select() {
		let clickEvent = new Event('click');
		this.saveButton.dispatchEvent('click', clickEvent);
	}
	getDocumentFragment() {
   		let myDocumentFragment = document.createDocumentFragment();
   		myDocumentFragment.appendChild(this.isTemplateInputField.getDocumentFragment());
   		myDocumentFragment.appendChild(this.parentInputField.getDocumentFragment());
		let template = '';
   		template += '<div>';
   		template += '<ul class="parents-list hide"></ul>';
   		template += '</div>';
   		let myParentsList = document.createRange().createContextualFragment(template);
   		myDocumentFragment.appendChild(myParentsList);
   		myDocumentFragment.appendChild(this.shortNameInputField.getDocumentFragment());
   		myDocumentFragment.appendChild(this.descriptionInputField.getDocumentFragment());
		let mergedDocumentFragment = super.getDocumentFragment(myDocumentFragment);

		return mergedDocumentFragment;

// template += '<div class="input-field radio-buttons border">';
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
	}

	reset() {
		this.isTemplateInputField.value = 'false';
		let parentsList = document.getElementById(this.id).querySelector('.parents-list');
		let liElements = parentsList.querySelectorAll('li');
		for(var i=0;i < liElements.length;i++) {
			parentsList.removeChild(liElements[i]);
		}
		parentsList.classList.add('hide');
		this.shortNameInputField.value = '';
		this.descriptionInputField.value = '';
	}
}