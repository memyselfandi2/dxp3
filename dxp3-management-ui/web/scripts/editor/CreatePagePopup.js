class CreatePagePopup extends Popup {

	constructor(id, size, isTopLevel, hasBorder, hasMenu) {
		super(id, size, isTopLevel, hasBorder, hasMenu);

		this.isTemplateInputField = new RadioInputField(null,
														null,
														'Is this a template?',
														'isTemplate',
														['create-page-is-template-yes', 'create-page-is-template-no'],
														['true', 'false'],
														['Yes', 'No'],
														'false',
														true,
														false,
														false);
		this.parentInputField = new SelectPageInputField(null,
														null,
													   null,
													   'Based on page...',
													   false);
		let thisEditorElement = this;
		this.parentInputField.addEventListener('select', function(ev) {
			let parentsList = document.getElementById(thisEditorElement.id).querySelector('.parents-list');
			let action = parentsList.querySelector('a[href="#' + ev.pageUuid + '"]');
			if(action === undefined || action === null) {
				let template = '<li><a class="action-remove-parent" href="#' + ev.pageUuid + '">' + ev.pageName + '</a></li>';
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

		this.descriptionInputField = new TextAreaInputField(null,
			null,
			'description',
			'',
			null,
			'Description',
			INPUT_FIELD_TYPES.DEFAULT,
			true,
			false,
			true);

		this.saveButton = new Button(null,'action-save shade-of-green', 'Save and close', 'fa fa-check', 'Save');
		this.saveButton.addEventListener('click', function() {
			let event = {};
			event.isTemplate = thisEditorElement.isTemplateInputField.value;
			let parentsList = document.getElementById(thisEditorElement.id).querySelector('.parents-list');
			let aElements = parentsList.querySelectorAll('a');
			event.parentUuids = [];
			for(var i=0;i < aElements.length;i++) {
				let href = aElements[i].getAttribute('href');
				let parentUuid = href.substring(1);
				event.parentUuids.push(parentUuid);
			}
			event.description = thisEditorElement.descriptionInputField.value;
			event.closeOnSuccess = true;
			console.log('dispatch event save SUBMIT : Create Page Popup');
			thisEditorElement.dispatchEvent('submit', event);
		});
		this.saveAndNewButton = new Button(null, 'action-save', 'Save and new', 'fa fa-plus', 'Save and new');
		this.saveAndNewButton.addEventListener('click', function() {
			let event = {};
			event.isTemplate = thisEditorElement.isTemplateInputField.value;
			let parentsList = document.getElementById(thisEditorElement.id).querySelector('.parents-list');
			let aElements = parentsList.querySelectorAll('a');
			event.parentUuids = [];
			for(var i=0;i < aElements.length;i++) {
				let href = aElements[i].getAttribute('href');
				let parentUuid = href.substring(1);
				event.parentUuids.push(parentUuid);
			}
			event.description = thisEditorElement.descriptionInputField.value;
			event.closeOnSuccess = false;
			console.log('dispatch event save and new SUBMIT : Create Page Popup');
			thisEditorElement.dispatchEvent('submit', event);
		});
		this.cancelButton = new Button(null, 'action-cancel shade-of-red', 'Cancel', 'fa fa-times', 'Cancel');
		this.cancelButton.addEventListener('click', function() {
			thisEditorElement.reset();
			let event = {};
			thisEditorElement.dispatchEvent('cancel', event);
		});
		super.addButton(this.saveButton);
		super.addButton(this.saveAndNewButton);
		super.addButton(this.cancelButton);
	}

	init() {
		this.isTemplateInputField.init();
		this.parentInputField.init();
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
   		myDocumentFragment.appendChild(this.descriptionInputField.getDocumentFragment());
		let mergedDocumentFragment = super.getDocumentFragment(myDocumentFragment);

		return mergedDocumentFragment;

// template += '<div class="input-field radio-buttons border">';
//                 template += '<span>Is this a template?</span>';
//                 template += '<label><input id="create-page-is-template-yes" type="radio" name="isTemplate" value="true"/>Yes</label>';
//                 template += '<label><input id="create-page-is-template-no" type="radio" name="isTemplate" value="false" checked="checked"/>No</label>';
//             template += '</div>';
//             template += '<div class="input-field border">';
//                 template += '<input id="create-page-parentUuids-hidden" type="hidden" name="parentUuids"/>';
//                 template += '<input id="create-page-parentUuids" type="text" name="parentUuids" placeholder="Based on page...">';
//                 template += '<div class="input-field-buttons">';
//                     template += '<button type="reset" class="clear-button" title="Clear"><i class="fa fa-trash-alt"></i></button>';
//                     template += '<button type="submit" class="search-button" title="Search"><i class="fa fa-search"></i></button>';
//                 template += '</div>';
//                 template += '<div id="create-page-parentUuids-popup" class="popup large border">';
//                     template += '<div class="menu">';
//                         template += '<div class="loading menu-icon"><img class="icon-loading" src="/web/images/loading-spinner.gif"/></div><a class="action-help menu-icon" href="#" title="Help"><i class="far fa-question-circle"></i></a><a class="action-close menu-icon" href="#" title="Close" ><i class="far fa-window-close"></i></a>';
//                     template += '</div>';
//                     template += '<div class="form-panel">';
//                         template += '<div class="filter-panel">';
//                             template += '<form>';
//                                 template += '<fieldset>';
//                                     template += '<legend>Filter</legend>';
//                                     template += '<label><input id="page-type-all2" class="filter-radio-button" type="radio" name="filter-page-type" value="all" checked="checked"/>Include all</label><br/>';
//                                     template += '<label><input id="page-type-page-only2" class="filter-radio-button" type="radio" name="filter-page-type" value="pageonly"/>Page only</label><br/>';
//                                     template += '<label><input id="page-type-template-only2" class="filter-radio-button" type="radio" name="filter-page-type" value="templateonly"/>Template only</label><br/>';
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
//                         template += '<div id="create-page-parentUuids-popup-list" class="list">';
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
//                 template += '<input id="create-page-shortname" type="text" name="shortname" placeholder="Short name">';
//                 template += '<div class="input-field-buttons">';
//                     template += '<button type="reset" class="clear-button" title="Clear"><i class="fa fa-trash-alt"></i></button>';
//                 template += '</div>';
//             template += '</div>';
//             template += '<div class="input-field text border">';
//                 template += '<input id="create-page-homepage" type="text" name="shortname" placeholder="Home/Index/Landing/Start page">';
//                 template += '<div class="input-field-buttons">';
//                     template += '<button type="reset" class="clear-button" title="Clear"><i class="fa fa-trash-alt"></i></button>';
//                 template += '</div>';
//             template += '</div>';
//             template += '<div class="input-field textarea border">';
//                 template += '<textarea id="create-page-description" name="description" placeholder="Description"></textarea>';
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
		this.descriptionInputField.value = '';
	}
}