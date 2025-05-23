class AcePanel extends Panel {

	constructor(id, name, isHidden, hasBorder) {
		super(id, name, isHidden, hasBorder);
		this.isFullScreen = false;
		this.isCollapsed = null;
		this.isExpanded = null;
		this.menuInputFields = [];
		this.menuInputFieldSizes = [];
		this.menuActions = [];

		let thisAcePanel = this;
		this.menuActionHelp = new Action(null, null,'action-help', 'Help', '', 'fa fa-question', false, function(reference) {
			thisAcePanel.help();
		});
	}

	collapse() {
		this.isCollapsed = true;
		this.isExpanded = false;
		super.removeClass('expanded');
		super.addClass('collapsed');
		let thisAcePanel = document.getElementById(this.id);
		if(thisAcePanel === undefined || thisAcePanel === null) {
			return;
		}
		let actionCollapse = thisAcePanel.querySelector('.action-collapse')
		actionCollapse.classList.remove('show');
		actionCollapse.classList.add('hide');
		let actionExpand = thisAcePanel.querySelector('.action-expand')
		actionExpand.classList.remove('hide');
		actionExpand.classList.add('show');
	}

	expand() {
		this.isExpanded = true;
		this.isCollapsed = false;
		super.removeClass('collapsed');
		super.addClass('expanded');
		let thisAcePanel = document.getElementById(this.id);
		if(thisAcePanel === undefined || thisAcePanel === null) {
			return;
		}
		let actionExpand = thisAcePanel.querySelector('.action-expand')
		actionExpand.classList.remove('show');
		actionExpand.classList.add('hide');
		let actionCollapse = thisAcePanel.querySelector('.action-collapse')
		actionCollapse.classList.remove('hide');
		actionCollapse.classList.add('show');
	}

	fullscreen() {
		this.isFullScreen = true;
		super.addClass('fullscreen');
		let thisAcePanel = document.getElementById(this.id);
		if(thisAcePanel === undefined || thisAcePanel === null) {
			return;
		}
		let actionFullscreen = thisAcePanel.querySelector('.action-fullscreen')
		actionFullscreen.classList.add('hide');
		actionFullscreen.classList.remove('show');
		let actionMinimize = thisAcePanel.querySelector('.action-minimize')
		actionMinimize.classList.add('show');
		actionMinimize.classList.remove('hide');
		console.log('hide expand/collapse');
		let actionExpand = thisAcePanel.querySelector('.action-expand')
		actionExpand.classList.add('hide');
		actionExpand.classList.remove('show');
		let actionCollapse = thisAcePanel.querySelector('.action-collapse')
		actionCollapse.classList.add('hide');
		actionCollapse.classList.remove('show');
	}

	minimize() {
		this.isFullScreen = false;
		super.removeClass('fullscreen');
		let thisAcePanel = document.getElementById(this.id);
		if(thisAcePanel === undefined || thisAcePanel === null) {
			return;
		}
		let actionFullscreen = thisAcePanel.querySelector('.action-fullscreen')
		actionFullscreen.classList.add('show');
		actionFullscreen.classList.remove('hide');
		let actionMinimize = thisAcePanel.querySelector('.action-minimize')
		actionMinimize.classList.add('hide');
		actionMinimize.classList.remove('show');
		if(this.isCollapsed != null) {
			if(this.isCollapsed) {
				let actionCollapse = thisAcePanel.querySelector('.action-collapse')
				actionCollapse.classList.add('hide');
				actionCollapse.classList.remove('show');
				let actionExpand = thisAcePanel.querySelector('.action-expand')
				actionExpand.classList.remove('hide');
				actionExpand.classList.add('show');
			} else {
				let actionExpand = thisAcePanel.querySelector('.action-expand')
				actionExpand.classList.add('hide');
				actionExpand.classList.remove('show');
				let actionCollapse = thisAcePanel.querySelector('.action-collapse')
				actionCollapse.classList.remove('hide');
				actionCollapse.classList.add('show');
			}
		}
	}

	addMenuInputField(inputField, size) {
		if(inputField === undefined || inputField === null) {
			return;
		}
		if(size === undefined || size === null) {
			size = 'medium';
		}
		this.menuInputFields.push(inputField);
		this.menuInputFieldSizes.push(size);
	}

	addMenuAction(action) {
		if(action === undefined || action === null) {
			return;
		}
		this.menuActions.push(action);
	}

	// addMenuAction(menuActionReference, menuActionClass, menuActionTitle, menuActionText, menuActionIcon, isDisabled, menuActionCallback) {
	// 	let menuAction = {};
	// 	menuAction.reference = menuActionReference;
	// 	menuAction.class = menuActionClass;
	// 	menuAction.title = menuActionTitle;
	// 	menuAction.text = menuActionText;
	// 	menuAction.icon = menuActionIcon;
	// 	menuAction.isDisabled = isDisabled;
	// 	menuAction.callback = menuActionCallback;
	// 	this.menuActions.push(menuAction);
	// }

	// disableMenuAction(menuActionClass) {
	// 	let thisEditorElement = document.getElementById(this.id);
	// 	if(thisEditorElement == undefined || thisEditorElement === null) {
	// 		for(let i=0;i < this.menuActions.length;i++) {
	// 			if(this.menuActions[i].class === menuActionClass) {
	// 				this.menuActions[i].isDisabled = true;
	// 				break;
	// 			}
	// 		}
	// 		return;
	// 	}
 //        let button = thisEditorElement.querySelector('a.' + menuActionClass);
 //        button.classList.add('disabled');
	// }

	// enableMenuAction(menuActionClass) {
	// 	let thisEditorElement = document.getElementById(this.id);
	// 	if(thisEditorElement == undefined || thisEditorElement === null) {
	// 		for(let i=0;i < this.menuActions.length;i++) {
	// 			if(this.menuActions[i].class === menuActionClass) {
	// 				this.menuActions[i].isDisabled = false;
	// 				break;
	// 			}
	// 		}
	// 		return;
	// 	}
	// 	console.log('getting button: ' + 'a.' + menuActionClass);
 //        let button = thisEditorElement.querySelector('a.' + menuActionClass);
 //        button.classList.remove('disabled');
	// }

	getDocumentFragment(subclassDocumentFragment) {
		let myDocumentFragment = null;
		if((subclassDocumentFragment != undefined) && (subclassDocumentFragment != null)) {
			let rootElement = subclassDocumentFragment.firstChild;
			if((rootElement != undefined) && (rootElement != null)) {
				rootElement.classList.add('ace-panel');
			}
			myDocumentFragment = subclassDocumentFragment;
		} else {
			let template = '<div class="ace-panel"></div>';
			myDocumentFragment = document.createRange().createContextualFragment(template);
		}
		let template = '';
		template += '<div class="header">';
		if(this.isFullScreen) {
			template += 	'<a href="#" title="fullscreen" class="action-fullscreen hide"><i class="fa fa-arrows-alt"></i></a>';
			template += 	'<a href="#" title="minimize" class="action-minimize"><i class="fa fa-compress"></i></a>';
		} else {
			template += 	'<a href="#" title="fullscreen" class="action-fullscreen"><i class="fa fa-arrows-alt"></i></a>';
			template += 	'<a href="#" title="minimize" class="action-minimize hide"><i class="fa fa-compress"></i></a>';
		}
		if(this.isCollapsed != null) {
			if(this.isCollapsed) {
				template += 	'<a href="#" title="collapse" class="action-collapse hide"><i class="fas fa-angle-double-up"></i></a>';
				template += 	'<a href="#" title="expand" class="action-expand"><i class="fas fa-angle-double-down"></i></a>';
			} else {
				template += 	'<a href="#" title="collapse" class="action-collapse"><i class="fas fa-angle-double-up"></i></a>';
				template += 	'<a href="#" title="expand" class="action-expand hide"><i class="fas fa-angle-double-down"></i></a>';
			}
		} else {
			template += 	'<a href="#" title="collapse" class="action-collapse hide"><i class="fas fa-angle-double-up"></i></a>';
			template += 	'<a href="#" title="expand" class="action-expand hide"><i class="fas fa-angle-double-down"></i></a>';
		}
		template += 	'<div class="column smaller">' + this.name + '</div>';
		for(let i=0;i < this.menuInputFields.length;i++) {
			template += '<div class="column ' + this.menuInputFieldSizes[i] + '"><div id="inputfield-' + i + '"></div></div>';
		}
		template += 	'<div class="loading"><img class="icon-loading hide" src="/web/images/loading-spinner.gif"></div>';
		template += 	'<div class="menu">';
		for(let i=0;i < this.menuActions.length;i++) {
			template += '<div id="action-' + i + '"></div>';
		}
		template +=			'<a class="action-message hide" href="#" title="Message"><i class="fa fa-bullhorn"></i></a>';
		template +=			'<div id="actionhelp"></div>';
		template +=		'</div>';
		template +=	'</div>';

		let header = document.createRange().createContextualFragment(template);
		for(let i=0;i < this.menuInputFields.length;i++) {
		 	let child = header.querySelector('#inputfield-' + i);
			child.parentNode.replaceChild(this.menuInputFields[i].getDocumentFragment(), child);
		}	
		for(let i=0;i < this.menuActions.length;i++) {
		 	let child = header.querySelector('#action-' + i);
			child.parentNode.replaceChild(this.menuActions[i].getDocumentFragment(), child);
		}
		let child = header.querySelector('#actionhelp');
		child.parentNode.replaceChild(this.menuActionHelp.getDocumentFragment(), child);

		let thisAcePanel = myDocumentFragment.querySelector('.ace-panel');
		thisAcePanel.prepend(header);
		let mergedDocumentFragment = super.getDocumentFragment(myDocumentFragment);
		return mergedDocumentFragment;
	}

	hideLoading() {
		let thisAcePanel = document.getElementById(this.id);
		let iconLoading = thisAcePanel.querySelector('.loading > img.icon-loading');
		iconLoading.classList.remove('show');
		iconLoading.classList.add('hide');
	}

	showLoading() {
		let thisAcePanel = document.getElementById(this.id);
		let iconLoading = thisAcePanel.querySelector('.loading > img.icon-loading');
		iconLoading.classList.remove('hide');
		iconLoading.classList.add('show');
	}

	init() {
		for(let i=0;i < this.menuInputFields.length;i++) {
			this.menuInputFields[i].init();
		}
		for(let i=0;i < this.menuActions.length;i++) {
			this.menuActions[i].init();
		}
		let thisAcePanel = this;
		let thisElement = document.getElementById(this.id);
		thisElement.querySelector('.action-fullscreen').addEventListener('click', function(ev) {
			ev.preventDefault();
			ev.stopPropagation();
			thisAcePanel.fullscreen();
			return false;
		});
		thisElement.querySelector('.action-minimize').addEventListener('click', function(ev) {
			ev.preventDefault();
			ev.stopPropagation();
			thisAcePanel.minimize();
			return false;
		});
		thisElement.querySelector('.action-collapse').addEventListener('click', function(ev) {
			ev.preventDefault();
			ev.stopPropagation();
			thisAcePanel.collapse();
			return false;
		});
		thisElement.querySelector('.action-expand').addEventListener('click', function(ev) {
			ev.preventDefault();
			ev.stopPropagation();
			thisAcePanel.expand();
			return false;
		});
		thisElement.querySelector('.header').addEventListener('click', function(ev) {
			console.log('click in header ');
			if(thisAcePanel.isCollapsed != null) {
				if(thisAcePanel.isCollapsed) {
					thisAcePanel.expand();
				} else {
					thisAcePanel.collapse();
				}
			}
		});

		super.init();
	}

	help() {
	}
}