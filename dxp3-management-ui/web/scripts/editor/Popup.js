const POPUP_SIZES = {
	DEFAULT: "Default",
	LARGE: "Large",
	MEDIUM: "Medium",
	SMALL: "Small"
}

const POPUP_ALIGNMENT = {
	CENTER: "Center",
	LEFT: "Left",
	RIGHT: "Right"
}
class Popup extends EditorElement {

	constructor(id, _size, _isTopLevel, _hasBorder, _hasMenu) {
		super(id);
		// property: size
		if(_size === undefined || _size === null) {
			_size = POPUP_SIZES.DEFAULT;
		}
		this.size = _size;
		// property: isTopLevel
    	this.isTopLevel = true;
	    if((_isTopLevel != undefined) && (_isTopLevel != null)) {
			if(typeof _isTopLevel === "boolean") {
				this.isTopLevel = _isTopLevel;
		    } else if(typeof _isTopLevel === "string") {
				_isTopLevel = _isTopLevel.trim().toLowerCase();
	            if(_isTopLevel === "false" ||
	               _isTopLevel === "off" ||
	               _isTopLevel === "no" ||
	               _isTopLevel === 'faux' ||
	               _isTopLevel === 'non' ||
	               _isTopLevel === 'falsa' ||
	               _isTopLevel === 'falso' ||
	               _isTopLevel === 'uit' ||
	               _isTopLevel === 'nee' ||
	               _isTopLevel === 'niet waar') {
	                this.isTopLevel = false;
	            }
	        }
	    }
	    // property: hasBorder
    	this.hasBorder = true;
	    if((_hasBorder != undefined) && (_hasBorder != null)) {
			if(typeof _hasBorder === "boolean") {
				this.hasBorder = _hasBorder;
		    } else if(typeof _hasBorder === "string") {
				_hasBorder = _hasBorder.trim().toLowerCase();
	            if(_hasBorder === "false" ||
	               _hasBorder === "off" ||
	               _hasBorder === "no" ||
	               _hasBorder === 'faux' ||
	               _hasBorder === 'non' ||
	               _hasBorder === 'falsa' ||
	               _hasBorder === 'falso' ||
	               _hasBorder === 'uit' ||
	               _hasBorder === 'nee' ||
	               _hasBorder === 'niet waar') {
	                this.hasBorder = false;
	            }
	        }
	    }
	    // property: hasMenu
    	this.hasMenu = true;
	    if((_hasMenu != undefined) && (_hasMenu != null)) {
			if(typeof _hasMenu === "boolean") {
				this.hasMenu = _hasMenu;
		    } else if(typeof _hasMenu === "string") {
				_hasMenu = _hasMenu.trim().toLowerCase();
	            if(_hasMenu === "false" ||
	               _hasMenu === "off" ||
	               _hasMenu === "no" ||
	               _hasMenu === 'faux' ||
	               _hasMenu === 'non' ||
	               _hasMenu === 'falsa' ||
	               _hasMenu === 'falso' ||
	               _hasMenu === 'uit' ||
	               _hasMenu === 'nee' ||
	               _hasMenu === 'niet waar') {
	                this.hasMenu = false;
	            }
	        }
	    }
	    this.buttons = [];
	    this.alignment = POPUP_ALIGNMENT.RIGHT;
	}

	addButton(button) {
		this.buttons.push(button);
	}

	getDocumentFragment(subclassDocumentFragment) {
		let template = '<div class="popup hide';
	    switch(this.size) {
	    	case POPUP_SIZES.LARGE:
	    		template += ' large';
	    		break;
	    	case POPUP_SIZES.MEDIUM:
	    		template += ' large';
	    		break;
	    	case POPUP_SIZES.SMALL:
	    		template += ' small';
	    		break;
	    	default:
	    		break;
	    }
	    if(this.isTopLevel) {
	        template += ' toplevel';   
	    }
	    if(this.hasBorder) {
	        template += ' border';   
	    }
	    switch(this.alignment) {
	    	case POPUP_ALIGNMENT.CENTER:
	    		template += ' center';
	    		break;
	    	case POPUP_ALIGNMENT.LEFT:
	    		template += ' align-left';
	    		break;
	    	case POPUP_ALIGNMENT.RIGHT:
	    		template += ' align-right';
	    		break;
	    	default:
	    		break;
	    }
	    template += '">';
	    if(this.hasMenu) {
			template += '<div class="menu">';
			template += '<div class="loading menu-icon"><img class="icon-loading" src="/web/images/loading-spinner.gif"/></div>';
			template += '<a class="action-help menu-icon" href="#" title="Help"><i class="far fa-question-circle"></i></a>';
			template += '<a class="action-close menu-icon" href="#" title="Close" ><i class="far fa-window-close"></i></a>';
    		template += '</div>';
	    }
    	template += '<div class="form-panel">';
    	template += '<div id="subclass"></div>';
    	template += '<div class="message-panel hide">';
    	template += '<i class="fa fa-warning"></i><span class="message"></span>';
    	template += '</div>';
		if(this.buttons.length > 0) {
	        template += '<div class="buttons">';
	        template += '</div>';
		}
	    template += "</div>";
	    template += "</div>";
		let myDocumentFragment = document.createRange().createContextualFragment(template);

		if((subclassDocumentFragment != undefined) && (subclassDocumentFragment != null)) {
			let formPanel = myDocumentFragment.querySelector('.form-panel');
			formPanel.prepend(subclassDocumentFragment);
		}
		let mergedDocumentFragment = super.getDocumentFragment(myDocumentFragment);
		if(this.buttons.length > 0) {
			let buttonsElement = mergedDocumentFragment.querySelector('.buttons');
			for(var i=0;i < this.buttons.length;i++) {
				let button = this.buttons[i];
				buttonsElement.appendChild(button.getDocumentFragment());
			}
		}
		let thisEditorElement = this;
	    let popup = mergedDocumentFragment.querySelector('.popup');
	    popup.addEventListener('hide', function(ev) {
	    	thisEditorElement.dispatchEvent('hide', ev);
	    });
	    popup.addEventListener('show', function(ev) {
	    	thisEditorElement.dispatchEvent('show', ev);
	    });
	    // If the escape key is pressed while this popup is shown
	    // we will close the popup.
	    popup.addEventListener('keyup', function(ev) {
	        if(ev.which === 27) {
	            ev.preventDefault();
	            ev.stopPropagation();
	            thisEditorElement.hide();
	            return false;
	        }
	    });
	    // The only click allowed to close the popup, within the popup itself, is the
	    // close button in the popup menu.
	    var closeAction = popup.querySelector('.menu > .action-close');
	    if(closeAction != undefined && closeAction != null) {
	        closeAction.addEventListener('click', function(ev) {
	            ev.preventDefault();
	            ev.stopPropagation();

	            thisEditorElement.hide();
	            return false;
	        });
	    }
	    popup.addEventListener('click', function(ev) {
	        ev.stopPropagation();
	        thisEditorElement.closeChildren();
	        return false;
	    });
		return mergedDocumentFragment;
	}

	init() {
		super.init();
		for(let i=0;i < this.buttons.length;i++) {
			let button = this.buttons[i];
			button.init();
		}
	}

	center() {
		this.alignment = POPUP_ALIGNMENT.CENTER;
		let thisEditorElement = document.getElementById(this.id);
		if(thisEditorElement === undefined || thisEditorElement === null) {
			return;
		}
		thisEditorElement.classList.remove('align-left');
		thisEditorElement.classList.remove('align-right');
		thisEditorElement.classList.add('center');
	}

	alignLeft() {
		this.alignment = POPUP_ALIGNMENT.LEFT;
		let thisEditorElement = document.getElementById(this.id);
		if(thisEditorElement === undefined || thisEditorElement === null) {
			return;
		}
		thisEditorElement.classList.remove('center');
		thisEditorElement.classList.remove('align-right');
		thisEditorElement.classList.add('align-left');
	}
	alignRight() {
		this.alignment = POPUP_ALIGNMENT.RIGHT;
		let thisEditorElement = document.getElementById(this.id);
		if(thisEditorElement === undefined || thisEditorElement === null) {
			return;
		}
		thisEditorElement.classList.remove('center');
		thisEditorElement.classList.remove('align-left');
		thisEditorElement.classList.add('align-right');
	}

	focus() {

	}

	refresh() {
	}

	closeChildren() {
		let allShownPopups = document.getElementById(this.id).getElementsByClassName('popup show');
		if((allShownPopups != undefined) && (allShownPopups != null)) {
			for(var i=0;i < allShownPopups.length;i++) {
				let shownPopup = allShownPopups[i];
				shownPopup.classList.add('hide');
				shownPopup.classList.remove('show');
			}
		}
	}

	open() {
		this.show();
	}

	show() {
		let popup = document.getElementById(this.id);
		if(popup.classList.contains('show')) {
			return;
		}
		// Hide all currently shown popups if we are a top level popup
		if(popup.classList.contains('toplevel')) {
			let hideEvent = new Event('hide');
			let allShownPopups = document.getElementsByClassName('popup show');
			if((allShownPopups != undefined) && (allShownPopups != null)) {
				for(var i=0;i < allShownPopups.length;i++) {
					if(allShownPopups[i].getAttribute('id') != this.id) {
						let shownPopup = allShownPopups[i];
						shownPopup.classList.add('hide');
						shownPopup.classList.remove('show');
						shownPopup.dispatchEvent(hideEvent);
					}
				}
			}
		}
		popup.classList.remove('hide');
		popup.classList.add('show');
		let showEvent = new Event('show');
		popup.dispatchEvent(showEvent);
	}

	close() {
	    this.hide();
	}
	closed() {
		return this.isHidden();
	}
	isClosed() {
		return this.isHidden();
	}
	isOpen() {
		return !this.isHidden();
	}
	isShown() {
		return !this.isHidden();
	}
	visible() {
		return !this.isHidden();
	}
	invisible() {
		return this.isHidden();
	}
	shown () {
		return !this.isHidden();
	}
	hidden() {
		return this.isHidden();
	}
	isVisible() {
		return !this.isHidden();
	}
	isInvisible() {
		return this.isHidden();
	}
	isHidden() {
		let popup = document.getElementById(this.id);
	    return popup.classList.contains('hide');
	}

	hide() {
		let popup = document.getElementById(this.id);
	    if(popup.classList.contains('hide')) {
	    	return;
	    }
		popup.classList.remove('show');
		popup.classList.add('hide');
		var hideEvent = new Event('hide');
		popup.dispatchEvent(hideEvent);
	}

	toggle() {
		let popup = document.getElementById(this.id);
	    if(popup.classList.contains('hide')) {
			popup.classList.remove('hide');
			popup.classList.add('show');
			var showEvent = new Event('show');
			popup.dispatchEvent(showEvent);
	    } else {
			popup.classList.remove('show');
			popup.classList.add('hide');
			var hideEvent = new Event('hide');
			popup.dispatchEvent(hideEvent);
	    }
	}

	hideLoading() {
		let iconLoading = document.querySelector('#' + this.id + ' .loading > img.icon-loading');
		iconLoading.classList.remove('show');
		iconLoading.classList.add('hide');
	}

	showLoading() {
		let iconLoading = document.querySelector('#' + this.id + ' .loading > img.icon-loading');
		iconLoading.classList.remove('hide');
		iconLoading.classList.add('show');
	}

	showInfoMessage(text, millisecondsToShow) {
	    let messagePanel = document.querySelector('#' + this.id + ' > .form-panel > .message-panel');
		let message = document.querySelector('#' + this.id + ' > .form-panel > .message-panel .message');
		let messageIcon = document.querySelector('#' + this.id + ' > .form-panel > .message-panel i');
	    message.textContent = text;
	    messageIcon.classList.remove('fa-error');
	    messageIcon.classList.remove('shade-of-red');
	    messageIcon.classList.remove('fa-exclamation-triangle');
	    messageIcon.classList.remove('shade-of-yellow');
	    messageIcon.classList.add('fa-info-circle');
	    messageIcon.classList.add('shade-of-blue');
	    messagePanel.classList.remove('hide');
	    messagePanel.classList.add('show');
	    // Hide message after x seconds
	    if(millisecondsToShow === undefined || millisecondsToShow === null) {
	    	millisecondsToShow = 2000;
	    }
	    window.setTimeout(function() {
	        messagePanel.classList.remove('show');
	        messagePanel.classList.add('hide');
	    }, millisecondsToShow);
	}

	showWarningMessage(text, millisecondsToShow) {
	    let messagePanel = document.querySelector('#' + this.id + ' > .form-panel > .message-panel');
		let message = document.querySelector('#' + this.id + ' > .form-panel > .message-panel .message');
		let messageIcon = document.querySelector('#' + this.id + ' > .form-panel > .message-panel i');
	    message.textContent = text;
	    messageIcon.classList.remove('fa-error');
	    messageIcon.classList.remove('shade-of-red');
	    messageIcon.classList.remove('fa-info-circle');
	    messageIcon.classList.remove('shade-of-blue');
	    messageIcon.classList.add('fa-exclamation-triangle');
	    messageIcon.classList.add('shade-of-yellow');
	    messagePanel.classList.remove('hide');
	    messagePanel.classList.add('show');
	    // Hide message after x seconds
	    if(millisecondsToShow === undefined || millisecondsToShow === null) {
	    	millisecondsToShow = 2000;
	    }
	    window.setTimeout(function() {
	        messagePanel.classList.remove('show');
	        messagePanel.classList.add('hide');
	    }, millisecondsToShow);
	}

	showErrorMessage(text, millisecondsToShow) {
	    let messagePanel = document.querySelector('#' + this.id + ' > .form-panel > .message-panel');
		let message = document.querySelector('#' + this.id + ' > .form-panel > .message-panel .message');
		let messageIcon = document.querySelector('#' + this.id + ' > .form-panel > .message-panel i');
	    message.textContent = text;
	    messageIcon.classList.remove('fa-exclamation-triangle');
	    messageIcon.classList.remove('shade-of-yellow');
	    messageIcon.classList.remove('fa-info-circle');
	    messageIcon.classList.remove('shade-of-blue');
	    messageIcon.classList.add('fa-fire');
	    messageIcon.classList.add('shade-of-red');
	    messagePanel.classList.remove('hide');
	    messagePanel.classList.add('show');
	    // Hide message after x seconds
	    if(millisecondsToShow === undefined || millisecondsToShow === null) {
	    	millisecondsToShow = 2000;
	    }
	    window.setTimeout(function() {
	        messagePanel.classList.add('hide');
	        messagePanel.classList.remove('show');
	    }, millisecondsToShow);
	}

	static initDocument() {
	    // If the click event bubbles all the way up to the document,
	    // we can safely assume it was a click outside of any popup.
	    // If this is the case, we close any open popups.
	    // We fire a 'hide' event for each popup we hide.
	    document.addEventListener('click', function(ev) {
			let hideEvent = new Event('hide');
			let shownPopup = null;
			do {
				shownPopup = document.querySelector('.popup.show');
				if(shownPopup) {
					shownPopup.classList.add('hide');
					shownPopup.classList.remove('show');
					shownPopup.dispatchEvent(hideEvent);
				}
			} while(shownPopup != null);
	    });
	}

	// static init() {
	//     // If the click event bubbles all the way up to the document,
	//     // we can safely assume it was a click outside of any popup.
	//     // If this is the case, we close any open popups.
	//     // We fire a 'hide' event for each popup we hide.
	//     document.addEventListener('click', function(ev) {
	// 		var allShownPopups = document.getElementsByClassName('popup show');
	// 		for(var i=0;i < allShownPopups.length;i++) {
	// 			Popup.hide(allShownPopups[i]);
	// 		}
	//     });
	//     // There may already be popups defined in our html.
	//     // Lets initialize them.
	// 	var allPopups = document.getElementsByClassName('popup');
	// 	for(var i=0;i < allPopups.length;i++) {
	//         Popup.initPopupElement(allPopups[i]);
	// 	}
	// }

	// static initPopupElement(popupElement) {
	//     // First thing we do is to hide the popup.
	//     Popup.hide(popupElement);
	//     // If there is a click within the boundaries of a popup, we
	//     // stop the event from bubbling up. This way the popup is not closed by the
	//     // document.
	//     popupElement.addEventListener('click', function(ev) {
	//         ev.stopPropagation();
	//         // We do however close any child popups.
	//         console.log('close children');
	// 		let allShownPopups = this.getElementsByClassName('popup show');
	// 		for(var i=0;i < allShownPopups.length;i++) {
	// 			Popup.hide(allShownPopups[i]);
	// 		}
	//         return false;
	//     });
	//     // If the escape key is pressed while this popup is shown
	//     // we will close the popup.
	//     popupElement.addEventListener('keyup', function(ev) {
	//         if(ev.which === 27) {
	//             ev.preventDefault();
	//             ev.stopPropagation();
	//             Popup.hide(this);
	//             return false;
	//         }
	//     });
	//     // The only click allowed to close the popup, within the popup itself, is the
	//     // close button in the popup menu.
	//     var closeActions = popupElement.querySelectorAll('.menu > .action-close');
	//     for(var i=0;i < closeActions.length;i++) {
	//         closeActions[i].addEventListener('click', function(ev) {
	//             ev.preventDefault();
	//             let popupElement = this.closest('.popup');
	//             Popup.hide(popupElement);
	//         });
	//     }
	// }

	// static open(selector) {
	//     Popup.show(selector);
	// }

	// static show(selector) {
	//     if(selector === undefined || selector === null) {
	//         return;
	//     }
	//     let thePopup = null;
	//     if(typeof selector === 'string') {
	//         thePopup = document.querySelector(selector);
	//         if(thePopup === undefined || thePopup === null) {
	//             return;
	//         }
	//     } else {
	//         thePopup = selector;
	//     }
	//     if(thePopup.classList.contains('show')) {
	//     	return;
	//     }
	//     // Hide all currently shown popups if we are a top level popup
	//     if(thePopup.classList.contains('toplevel')) {
	//     	let thePopupId = thePopup.getAttribute('id');
	//     	var allShownPopups = document.getElementsByClassName('popup show');
	//     	for(var i=0;i < allShownPopups.length;i++) {
	//     		if(allShownPopups[i].getAttribute('id') != thePopupId) {
	// 	    		Popup.hide(allShownPopups[i]);
	// 	    	}
	//     	}
	//     }
	// 	thePopup.classList.remove('hide');
	// 	thePopup.classList.add('show');
	// 	var showEvent = new Event('show');
	// 	thePopup.dispatchEvent(showEvent);
	// }

	// static close(selector) {
	//     Popup.hide(selector);
	// }

	// static hide(selector) {
	//     if(selector === undefined || selector === null) {
	//         return;
	//     }
	//     var thePopup = null;
	//     if(typeof selector === 'string') {
	//         thePopup = document.querySelector(selector);
	//         if(thePopup === undefined || thePopup === null) {
	//             return;
	//         }
	//     } else {
	//         thePopup = selector;
	//     }
	//     if(thePopup.classList.contains('hide')) {
	//     	return;
	//     }
	// 	thePopup.classList.remove('show');
	// 	thePopup.classList.add('hide');
	// 	var hideEvent = new Event('hide');
	// 	thePopup.dispatchEvent(hideEvent);
	// }

	// static toggle(selector) {
	//     if(selector === undefined || selector === null) {
	//         return;
	//     }
	//     var thePopup = null;
	//     if(typeof selector === 'string') {
	//         thePopup = document.querySelector(selector);
	//         if(thePopup === undefined || thePopup === null) {
	//             return;
	//         }
	//     } else {
	//         thePopup = selector;
	//     }
	//     if(thePopup.classList.contains('hide')) {
	//     	Popup.show(thePopup);
	//     } else {
	//     	Popup.hide(thePopup);
	//     }
	// }

	// static showLoading(selector) {
	//     if(selector === undefined || selector === null) {
	//         return;
	//     }
	//     let iconLoading = null;
	//     if(typeof selector === 'string') {
	//         iconLoading = document.querySelector(selector + ' .loading > img.icon-loading');
	//     } else {
	//         iconLoading = selector.querySelector('.loading > img.icon-loading');
	//     }
	//     if(iconLoading === undefined || iconLoading === null) {
	//         return;
	//     }
	//     iconLoading.classList.remove('hide');
	//     iconLoading.classList.add('show');
	// }

	// static hideLoading(selector) {
	//     if(selector === undefined || selector === null) {
	//         return;
	//     }
	//     let iconLoading = null;
	//     if(typeof selector === 'string') {
	//         iconLoading = document.querySelector(selector + ' .loading > img.icon-loading');
	//     } else {
	//         iconLoading = selector.querySelector('.loading > img.icon-loading');
	//     }
	//     if(iconLoading === undefined || iconLoading === null) {
	//         return;
	//     }
	//     iconLoading.classList.remove('show');
	//     iconLoading.classList.add('hide');
	// }

	// static hideMessage(selector) {
	//     if(selector === undefined || selector === null) {
	//         return;
	//     }
	//     let messagePanel = null;
	//     if(typeof selector === 'string') {
	//         messagePanel = document.querySelector(selector + ' .message-panel');
	//     } else {
	//         messagePanel = selector.querySelector('.message-panel');
	//     }
	//     if(messagePanel === undefined || messagePanel === null) {
	//         return;
	//     }
	//     messagePanel.classList.remove('show');
	//     messagePanel.classList.add('hide');
	// }
}