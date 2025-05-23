const editorPagePanel = {};

editorPagePanel.fetchDefinitionAbortController = null;
editorPagePanel.fetchPageLayoutAbortController = null;
editorPagePanel.fetchPageControllerAbortController = null;
editorPagePanel.fetchPageStyleAbortController = null;
editorPagePanel.layoutEditors = {};
editorPagePanel.controllerEditors = {};
editorPagePanel.styleEditors = {};

editorPagePanel.createPage = function(inputField, input, popup, closeOnSuccess) {
	var name = input.value;
	name = name.trim();
	if(name.length <= 0) {
    	Popup.showWarningMessage(popup, 'Please provide a name for this page.');
		input.focus();
		return;
	}
	Popup.showLoading(popup);
	var isTemplate = popup.querySelector('.create-page-is-template-yes').checked;
	var description = popup.querySelector('.create-page-description').value;
	description = description.trim();
	var applicationUUID = popup.closest('.application-panel').getAttribute('id');
	if(applicationUUID === undefined || applicationUUID === null) {
    	Popup.showWarningMessage(popup, 'Something went wrong retrieving the application.');
		input.focus();
		return;
	}
	applicationUUID = applicationUUID.trim();
	var parentUUIDs = [];
    editorSecurity.fetch('/page/', { 
    	method: "POST",
        body: {"name": name,
        	   "parentUUIDs": parentUUIDs,
        	   "isTemplate": isTemplate,
               "description": description,
               "applicationUUID": applicationUUID},
    	headers: {"Content-Type": "application/json"}
    })
	.then(function(response) {
		Popup.hideLoading(popup);
		if(response.status === 409) {
       		let errorMessage = "A page with the same name already exists. Please try a different name.";
        	Popup.showWarningMessage(popup, errorMessage);
			input.focus();
		} else if(response.status != 200) {
        	let errorMessage = 'An unknown error occurred. Please try again later.';
        	Popup.showWarningMessage(popup, errorMessage);
			input.focus();
		} else {
			response.json().then(function(data) {
				if(closeOnSuccess) {
					Popup.hide(popup);
				} else {
					input.focus();
				}
	            var uuid = data.uuid;
				editorPagePanel.loadPage(uuid);
			});
		}
	})
	.catch(function(error) {
		Popup.hideLoading(popup);
    	var errorMessage = 'An unknown error occurred. Please try again later.';
    	Popup.showWarningMessage(popup, errorMessage);
		input.focus();
	});
}

editorPagePanel.loadPage = function(pageUUID) {
	if(pageUUID === undefined || pageUUID === null) {
		pageUUID = '';
	}
	pageUUID = pageUUID.trim();
	if(pageUUID.length <= 0) {
		pageUUID = null;
	}
    editorPagePanel.loadPageDefinition(pageUUID);
    editorPagePanel.loadPageLayout(pageUUID);
    editorPagePanel.loadPageController(pageUUID);
    editorPagePanel.loadPageStyle(pageUUID);
}

editorPagePanel.loadPageDefinition = function(pageUUID) {
	if(editorPagePanel.fetchDefinitionAbortController != null) {
		editorPagePanel.fetchDefinitionAbortController.abort();
	}
    editorPagePanel.fetchDefinitionAbortController = new AbortController();
    editorSecurity.fetch('/page/' + pageUUID, { 
    	method: "GET",
    	headers: {"Content-Type": "application/json"}
    }, editorPagePanel.fetchDefinitionAbortController)
	.then(function(response) {
		if(response.status === 404) {
		} else {
			response.json().then(function(data) {
				editorPagePanel.addPageView(data.applicationUUID, data.uuid, data.name);
			});
		}
	})
	.catch(function(error) {
	});
}

editorPagePanel.loadPageLayout = function(pageUUID) {
    if(editorPagePanel.fetchPageLayoutAbortController != null) {
        editorPagePanel.fetchPageLayoutAbortController.abort();
    }
    editorPagePanel.fetchPageLayoutAbortController = new AbortController();
    editorSecurity.fetch('/page/' + pageUUID + '/layout/', { 
        method: "GET"
    }, editorPagePanel.fetchPageLayoutAbortController)
    .then(function(response) {
        if(response.status === 404) {
            return;
        }
        response.text().then(function(pageLayout) {
            let pageLayoutEditor = editorPagePanel.layoutEditors[pageUUID];
            pageLayoutEditor.setValue(pageLayout);
        });
    })
    .catch(function(error) {
        alert(error);
    });
}

editorPagePanel.loadPageStyle = function(pageUUID, styleName) {
    if(editorPagePanel.fetchPageStyleAbortController != null) {
        editorPagePanel.fetchPageStyleAbortController.abort();
    }
    if(styleName === undefined || styleName === null || styleName === '') {
        styleName = 'default';
    }
    editorPagePanel.fetchPageStyleAbortController = new AbortController();
    editorSecurity.fetch('/page/' + pageUUID + '/style/' + styleName, { 
        method: "GET"
    }, editorPagePanel.fetchPageStyleAbortController)
    .then(function(response) {
        if(response.status === 404) {
            return;
        }
        response.text().then(function(pageStyle) {
            let pageStyleEditor = editorPagePanel.styleEditors[pageUUID];
            pageStyleEditor.setValue(pageStyle);
        });
    })
    .catch(function(error) {
        alert(error);
    });
}

editorPagePanel.loadPageController = function(pageUUID, controllerName) {
    if(editorPagePanel.fetchPageControllerAbortController != null) {
        editorPagePanel.fetchPageControllerAbortController.abort();
    }
    if(controllerName === undefined || controllerName === null || controllerName === '') {
        controllerName = 'default';
    }
    editorPagePanel.fetchPageControllerAbortController = new AbortController();
    editorSecurity.fetch('/page/' + pageUUID + '/controller/' + controllerName, { 
        method: "GET"
    }, editorPagePanel.fetchPageControllerAbortController)
    .then(function(response) {
        if(response.status === 404) {
            return;
        }
        response.text().then(function(pageController) {
            let pageControllerEditor = editorPagePanel.controllerEditors[pageUUID];
            pageControllerEditor.setValue(pageController);
        });
    })
    .catch(function(error) {
        alert(error);
    });
}

editorPagePanel.savePageLayout = function(pageUUID) {
    var pagePanel = document.getElementById(pageUUID);
    var pageLayoutEditor = editorPagePanel.layoutEditors[pageUUID];
    var code = pageLayoutEditor.getValue();
    var loadingIcon = pagePanel.querySelector('.icon-loading');
    loadingIcon.classList.remove('hide');
    loadingIcon.classList.add('show');
    editorSecurity.fetch('/page/' + pageUUID + '/layout/', { 
        method: 'PUT',
        body: {"code": code},
        headers: {"Content-Type": "application/json"}
    }, null)
    .then(function(response) {
        loadingIcon.classList.remove('show');
        loadingIcon.classList.add('hide');
    })
    .catch(function(error) {
        loadingIcon.classList.remove('show');
        loadingIcon.classList.add('hide');
    });
}
editorPagePanel.savePageController = function(pageUUID, controllerName) {
    var pagePanel = document.getElementById(pageUUID);
    var pageControllerEditor = editorPagePanel.controllerEditors[pageUUID];
    var code = pageControllerEditor.getValue();
    var loadingIcon = pagePanel.querySelector('.icon-loading');
    loadingIcon.classList.remove('hide');
    loadingIcon.classList.add('show');
    editorSecurity.fetch('/page/' + pageUUID + '/controller/', { 
        method: 'PUT',
        body: {"name": controllerName,
               "code": code},
        headers: {"Content-Type": "application/json"}
    }, null)
    .then(function(response) {
        loadingIcon.classList.remove('show');
        loadingIcon.classList.add('hide');
    })
    .catch(function(error) {
        loadingIcon.classList.remove('show');
        loadingIcon.classList.add('hide');
    });
}
editorPagePanel.savePageStyle = function(pageUUID, styleName) {
    var pagePanel = document.getElementById(pageUUID);
    var pageStyleEditor = editorPagePanel.styleEditors[pageUUID];
    var code = pageStyleEditor.getValue();
    var loadingIcon = pagePanel.querySelector('.icon-loading');
    loadingIcon.classList.remove('hide');
    loadingIcon.classList.add('show');
    editorSecurity.fetch('/page/' + pageUUID + '/style/', { 
        method: 'PUT',
        body: {"name": styleName,
               "code": code},
        headers: {"Content-Type": "application/json"}
    }, null)
    .then(function(response) {
        loadingIcon.classList.remove('show');
        loadingIcon.classList.add('hide');
    })
    .catch(function(error) {
        loadingIcon.classList.remove('show');
        loadingIcon.classList.add('hide');
    });
}

editorPagePanel.addPageView = function(applicationUUID, pageUUID, pageName) {
    // Check if this page has already been loaded
    var pageDiv = document.getElementById(pageUUID);
    if(pageDiv) {
        let clickEvent = new Event('click');
        let tabsMenu = pageDiv.parentNode.querySelector('.tabs-menu ul');
        let aElement = tabsMenu.querySelector('a.action-select-page[href=\'#' + pageUUID + '\']');
        aElement.dispatchEvent(clickEvent);
        return;
    }
    let applicationPanel = document.getElementById(applicationUUID);
    let pagesPanel = applicationPanel.querySelector('.pages-panel > .content');
    let tabsMenu = pagesPanel.querySelector('.tabs-menu ul');
    var liElement = document.createElement('li');
    var aElement = document.createElement('a');
    aElement.setAttribute('href', '#' + pageUUID);
    aElement.setAttribute('class', 'action-select-page');
    var aContent = document.createTextNode(pageName);
    aElement.appendChild(aContent);
    var buttonElement = document.createElement('button');
    buttonElement.setAttribute('class', 'close-button');
    buttonElement.setAttribute('type', 'reset');
    buttonElement.setAttribute('title', 'Close');
    var iElement = document.createElement('i');
    iElement.setAttribute('class', 'fa fa-times fa-lg');
    buttonElement.appendChild(iElement);
    liElement.appendChild(aElement);
    liElement.appendChild(buttonElement);
    tabsMenu.appendChild(liElement);
    aElement.addEventListener('click', function(ev) {
        var href = this.getAttribute('href');
        var selected = this.closest('.tabs-menu').querySelector('ul li.selected');
        if(selected) {
            selected.classList.remove('selected');
        }
        this.closest('li').classList.add('selected');
        pageUUID = href.substring(1);
        var tab = pagesPanel.querySelector('.page-panel.tab.show');
        if(tab) {
            tab.classList.remove('show');
            tab.classList.add('hide');
            console.log('somehow this was triggered');
        }
        var pagePanelToShow = document.getElementById(pageUUID);
        if(pagePanelToShow) {
	        pagePanelToShow.classList.remove('hide');
	        pagePanelToShow.classList.add('show');
	    }
    });
    buttonElement.addEventListener('click', function(ev) {
        var liParent = this.parentNode;
        var aElement = liParent.querySelector('a');
        var href = aElement.getAttribute('href');
        pageUUID = href.substring(1);
        var pagePanelToUnload = document.getElementById(pageUUID);
        if(pagePanelToUnload) {
	        pagePanelToUnload.parentNode.removeChild(pagePanelToUnload);
	    }
        if(liParent.classList.contains('selected')) {
            var clickEvent = new Event('click');
            liParent.parentNode.querySelector('.action-page-home').dispatchEvent(clickEvent);
        }
        liParent.parentNode.removeChild(liParent);
    });
    var divElement = document.createElement('div');
    divElement.setAttribute('id', pageUUID);
    divElement.setAttribute('class', 'page-panel tab hide');

    var pageLayout = document.createElement('div');
    pageLayout.setAttribute('class', 'page-layout border');

    let pageLayoutVersionInputField = new TextInputField(null,
                                                         null,
                                                         'select-page-layout-version-regex',
                                                         'select-page-layout-version',
                                                         null,
                                                         null,
                                                         true,
                                                         false,
                                                         false,
                                                         TEXT_INPUT_FIELD_TYPES.SEARCH);


    // let pageLayoutVersionPopup = new Popup(null,
    //                                        POPUP_SIZES.SMALL,
    //                                        true,
    //                                        true);

    let pageLayoutHeader = '<div class="header">' +
                        '<a href="#" title="fullscreen" class="action-fullscreen"><i class="fa fa-arrows-alt"></i></a>' +
                        '<a href="#" title="minimize" class="action-minimize hide"><i class="fa fa-compress"></i></a>' +
                        '<div class="column smaller">Layout</div>' +
                        '<div class="column smallest">' +
                        pageLayoutVersionInputField.template +
                                // '<div class="page-select-layout-version-popup popup toplevel border hide">' +
                                //     '<div class="menu">' +
                                //         '<div class="loading menu-icon"><img class="icon-loading" src="/web/images/loading-spinner.gif"/></div>' +
                                //         '<a class="action-close menu-icon" href="#" title="Close" ><i class="far fa-window-close"></i></a>' +
                                //     '</div>' +
                                //     '<div class="page-select-controller-list"><ul></ul></div>' +
                                // '</div>' +
                        '</div>' +
                        '<div class="loading hide"><img class="icon-loading hide" src="/web/images/loading-spinner.gif"></div>' +
                        '<div class="menu">' +
                            '<a href="#" title="Locale" class="action-locale" id="action-page-locale"><i class="fa fa-flag"></i>Locale</a>' +
                            '<a href="#" title="Images" class="action-images action-page-images"><i class="far fa-image"></i>Images</a>' +
                            '<a href="#" title="Save" class="action-save action-save-page-layout"><i class="far fa-save"></i>Save</a>' +
                            '<a href="#" title="Commit" class="action-commit action-commit-page-layout"><i class="far fa-check-square"></i>Commit</a>' +
                            '<a href="#" title="Cancel" class="action-cancel action-cancel-page-layout"><i class="fa fa-times"></i>Cancel</a>' +
                            '<a class="action-message hide" href="#" title="Message"><i class="fa fa-bullhorn"></i></a>' +
                            '<a class="action-help" href="#" title="Help"><i class="fa fa-question"></i></a>' +
                        '</div>' +
                    '</div>';

    // let element = pageLayoutVersionPopup.createPopupElement();

    var frag = document.createRange().createContextualFragment(pageLayoutHeader);
    // Save action
    frag.querySelector('.action-save-page-layout').addEventListener('click', function(ev) {
        editorPagePanel.savePageLayout(pageUUID);
    });
    frag.querySelector('.select-page-layout-version').addEventListener('click', function(ev) {
        ev.preventDefault();
        ev.stopPropagation();
        return false;
    });
    frag.querySelector('.select-page-layout-version').addEventListener('focus', function(ev) {
        ev.preventDefault();
        ev.stopPropagation();
        let popup = this.parentNode.querySelector('.page-select-layout-version-popup');
        Popup.show(popup);
        return false;
    });
    frag.querySelector('.action-fullscreen').addEventListener('click', function(ev) {
        this.parentNode.parentNode.classList.add('fullscreen');
        this.classList.add('hide');
        let minimizeAction = this.parentNode.querySelector('.action-minimize');
        minimizeAction.classList.remove('hide');
    });
    frag.querySelector('.action-minimize').addEventListener('click', function(ev) {
        this.parentNode.parentNode.classList.remove('fullscreen');
        this.classList.add('hide');
        let fullscreenAction = this.parentNode.querySelector('.action-fullscreen');
        fullscreenAction.classList.remove('hide');
    });
    pageLayout.appendChild(frag);
    var pageLayoutEditor = document.createElement('div');
    pageLayoutEditor.setAttribute('id', 'layout-' + pageUUID);
    pageLayoutEditor.setAttribute('class', 'page-layout-editor editor');
    pageLayout.appendChild(pageLayoutEditor);
    var pageController = document.createElement('div');
    pageController.setAttribute('class', 'page-controller border');
    var pageControllerHeader =	'<div class="header">' +
			                        '<a href="#" title="fullscreen" class="action-fullscreen" style=""><i class="fa fa-arrows-alt"></i></a>' +
			                        '<a href="#" title="minimize" class="action-minimize hide"><i class="fa fa-compress"></i></a>' +
			                        '<div class="column small">Controllers</div>' +
			                        '<div class="column medium">' +
			                            '<div class="input-field dropdown border">' +
			                                '<input class="action-select-page-controller" type="text" placeholder="Select controller" name="search">' +
                                            '<div class="input-field-buttons">' +
                                                '<button class="clear-button" type="reset" title="Clear"><i class="fa fa-trash-alt"></i></button>' +
                                                '<button class="search-button" type="submit" title="Search"><i class="fa fa-chevron-down"></i></button>' +
                                            '</div>' +
                                            '<div class="page-select-controller-popup popup toplevel border hide">' +
                                                '<div class="menu">' +
                                                    '<div class="loading menu-icon"><img class="icon-loading" src="/web/images/loading-spinner.gif"/></div>' +
                                                    '<a class="action-close menu-icon" href="#" title="Close" ><i class="far fa-window-close"></i></a>' +
                                                '</div>' +
                                                '<div class="page-select-controller-list"><ul></ul></div>' +
                                            '</div>' +
			                            '</div>' +
			                        '</div>' +
			                        '<div class="column smallest">' +
			                            '<div class="input-field border">' +
			                                '<input class="input-page-controller-version" type="text" placeholder="" name="version">' +
                                            '<div class="input-field-buttons">' +
                                                '<button class="search-button" type="submit" title="Search"><i class="fa fa-chevron-down"></i></button>' +
                                            '</div>' +
                                            '<div class="page-select-controller-version-popup popup toplevel border hide">' +
                                                '<div class="menu">' +
                                                    '<div class="loading menu-icon"><img class="icon-loading" src="/web/images/loading-spinner.gif"/></div>' +
                                                    '<a class="action-close menu-icon" href="#" title="Close" ><i class="far fa-window-close"></i></a>' +
                                                '</div>' +
                                                '<div class="page-select-controller-list"><ul></ul></div>' +
                                            '</div>' +
			                            '</div>' +
			                        '</div>' +
			                        '<div class="loading hide">' +
			                            '<img class="icon-loading" src="/web/images/loading-spinner.gif">' +
			                        '</div>' +
			                        '<div class="menu">' +
			                            '<a href="#" title="Save" class="action-save action-save-page-controller"><i class="far fa-save"></i>Save</a>' +
                                        '<a href="#" title="Commit" class="action-commit action-commit-page-controller"><i class="far fa-check-square"></i>Commit</a>' +
			                            '<a href="#" title="Cancel" class="action-cancel action-cancel-page-controller"><i class="fa fa-times"></i>Cancel</a>' +
			                            '<a class="action-message hide" href="#" title="Message"><i class="fa fa-bullhorn"></i></a>' +
			                            '<a class="action-help" href="#" title="Help"><i class="fa fa-question"></i></a>' +
			                        '</div>' +
			                    '</div>';
    frag = document.createRange().createContextualFragment(pageControllerHeader);
    // Save action
    frag.querySelector('.action-save-page-controller').addEventListener('click', function(ev) {
        ev.preventDefault();
        let fileName = this.closest('.header').querySelector('.select-page-controller').value;
        editorPagePanel.savePageController(pageUUID, fileName);
        return false;
    });
    frag.querySelector('.action-select-page-controller').addEventListener('click', function(ev) {
        ev.preventDefault();
        ev.stopPropagation();
        return false;
    });
    frag.querySelector('.action-select-page-controller').addEventListener('focus', function(ev) {
        ev.preventDefault();
        ev.stopPropagation();
        let popup = this.parentNode.querySelector('.page-select-controller-popup');
        Popup.show(popup);
        return false;
    });
    frag.querySelector('.input-page-controller-version').addEventListener('click', function(ev) {
        ev.preventDefault();
        ev.stopPropagation();
        return false;
    });
    frag.querySelector('.input-page-controller-version').addEventListener('focus', function(ev) {
        ev.preventDefault();
        ev.stopPropagation();
        let popup = this.parentNode.querySelector('.page-select-controller-version-popup');
        Popup.show(popup);
        return false;
    });
    frag.querySelector('.action-fullscreen').addEventListener('click', function(ev) {
        this.parentNode.parentNode.classList.add('fullscreen');
        this.classList.add('hide');
        let minimizeAction = this.parentNode.querySelector('.action-minimize');
        minimizeAction.classList.remove('hide');
    });
    frag.querySelector('.action-minimize').addEventListener('click', function(ev) {
        this.parentNode.parentNode.classList.remove('fullscreen');
        this.classList.add('hide');
        let fullscreenAction = this.parentNode.querySelector('.action-fullscreen');
        fullscreenAction.classList.remove('hide');
    });
    pageController.appendChild(frag);
    var pageControllerEditor = document.createElement('div');
    pageControllerEditor.setAttribute('id', 'controller-' + pageUUID);
    pageControllerEditor.setAttribute('class', 'page-controller-editor editor');
    pageController.appendChild(pageControllerEditor);
    var pageStyle = document.createElement('div');
    pageStyle.setAttribute('class', 'page-style border');
    let pageStyleHeader = '<div class="header">' +
                        '<a href="#" title="fullscreen" class="action-fullscreen" style=""><i class="fa fa-arrows-alt"></i></a>' +
                        '<a href="#" title="minimize" class="action-minimize hide"><i class="fa fa-compress"></i></a>' +
                        '<div class="column smallest">Styles</div>' +
                        '<div class="column medium">' +
                            '<div class="input-field dropdown border">' +
                                '<input class="action-select-page-style" type="text" placeholder="Select style" name="search">' +
                                '<div class="input-field-buttons">' +
                                    '<button class="clear-button" type="reset" title="Clear"><i class="fa fa-trash-alt"></i></button>' +
                                    '<button class="search-button" type="submit" title="Search"><i class="fa fa-chevron-down"></i></button>' +
                                '</div>' +
                                '<div class="page-select-style-popup popup toplevel border hide">' +
                                    '<div class="menu">' +
                                        '<div class="loading menu-icon"><img class="icon-loading" src="/web/images/loading-spinner.gif"/></div>' +
                                        '<a class="action-close menu-icon" href="#" title="Close" ><i class="far fa-window-close"></i></a>' +
                                    '</div>' +
                                    '<div class="page-select-controller-list"><ul></ul></div>' +
                                '</div>' +
                            '</div>' +
                        '</div>' +
                        '<div class="column smallest">' +
                            '<div class="input-field border">' +
                                '<input class="input-page-style-version" type="text" placeholder="" name="version">' +
                                '<div class="input-field-buttons">' +
                                    '<button class="search-button" type="submit" title="Search"><i class="fa fa-chevron-down"></i></button>' +
                                '</div>' +
                                '<div class="page-select-style-version-popup popup toplevel border hide">' +
                                    '<div class="menu">' +
                                        '<div class="loading menu-icon"><img class="icon-loading" src="/web/images/loading-spinner.gif"/></div>' +
                                        '<a class="action-close menu-icon" href="#" title="Close" ><i class="far fa-window-close"></i></a>' +
                                    '</div>' +
                                    '<div class="page-select-controller-list"><ul></ul></div>' +
                                '</div>' +
                            '</div>' +
                        '</div>' +
                        '<div class="loading hide">' +
                            '<img class="icon-loading" src="/web/images/loading-spinner.gif">' +
                        '</div>' +
                        '<div class="menu">' +
                            '<a href="#" title="Fonts" class="action-fonts action-page-style-fonts"><i class="fa fa-font"></i>Fonts</a>' +
                            '<a href="#" title="Images" class="action-images action-page-style-images"><i class="far fa-image"></i>Images</a>' +
                            '<a href="#" title="Save" class="action-save action-save-page-style"><i class="far fa-save"></i>Save</a>' +
                            '<a href="#" title="Commit" class="action-commit action-commit-page-style"><i class="far fa-check-square"></i>Commit</a>' +
                            '<a href="#" title="Cancel" class="action-cancel action-cancel-page-style"><i class="fa fa-times"></i>Cancel</a>' +
                            '<a class="action-message hide" href="#" title="Message"><i class="fa fa-bullhorn"></i></a>' +
                            '<a class="action-help" href="#" title="Help"><i class="fa fa-question"></i></a>' +
                        '</div>' +
                    '</div>';
    frag = document.createRange().createContextualFragment(pageStyleHeader);
    // Save action
    frag.querySelector('.action-save-page-style').addEventListener('click', function(ev) {
        let fileName = this.closest('.header').querySelector('.select-page-style').value;
        editorPagePanel.savePageStyle(pageUUID, fileName);
    });
    frag.querySelector('.action-select-page-style').addEventListener('click', function(ev) {
        ev.preventDefault();
        ev.stopPropagation();
        return false;
    });
    frag.querySelector('.action-select-page-style').addEventListener('focus', function(ev) {
        ev.preventDefault();
        ev.stopPropagation();
        let popup = this.parentNode.querySelector('.page-select-style-popup');
        Popup.show(popup);
        return false;
    });
    frag.querySelector('.input-page-style-version').addEventListener('click', function(ev) {
        ev.preventDefault();
        ev.stopPropagation();
        return false;
    });
    frag.querySelector('.input-page-style-version').addEventListener('focus', function(ev) {
        ev.preventDefault();
        ev.stopPropagation();
        let popup = this.parentNode.querySelector('.page-select-style-version-popup');
        Popup.show(popup);
        return false;
    });
    frag.querySelector('.action-fullscreen').addEventListener('click', function(ev) {
        this.parentNode.parentNode.classList.add('fullscreen');
        this.classList.add('hide');
        let minimizeAction = this.parentNode.querySelector('.action-minimize');
        minimizeAction.classList.remove('hide');
    });
    frag.querySelector('.action-minimize').addEventListener('click', function(ev) {
        this.parentNode.parentNode.classList.remove('fullscreen');
        this.classList.add('hide');
        let fullscreenAction = this.parentNode.querySelector('.action-fullscreen');
        fullscreenAction.classList.remove('hide');
    });
    pageStyle.appendChild(frag);
    var pageStyleEditor = document.createElement('div');
    pageStyleEditor.setAttribute('id', 'style-' + pageUUID);
    pageStyleEditor.setAttribute('class', 'page-style-editor editor');
    pageStyle.appendChild(pageStyleEditor);
    var pagePreview = document.createElement('div');
    pagePreview.setAttribute('class', 'page-preview border');
    let pagePreviewHeader = '<div class="header">' + 
                        '<a href="#" title="fullscreen" class="action-fullscreen" style=""><i class="fa fa-arrows-alt"></i></a>' + 
                        '<a href="#" title="minimize" class="action-minimize hide"><i class="fa fa-compress"></i></a>' + 
                        '<div class="column smaller">Preview</div>' + 
                        '<div class="column large">' + 
                            '<div class="select-page-preview-locale input-field dropdown border">' + 
                                '<input class="action-select-page-preview-locale-input" type="text" placeholder="Select locale" name="search">' + 
                                '<div class="input-field-buttons">' +
                                    '<button class="clear-button" type="reset" title="Clear"><i class="fa fa-trash-alt"></i></button>' +
                                    '<button class="search-button" type="submit" title="Search"><i class="fa fa-chevron-down"></i></button>' +
                                '</div>' +
                                '<div class="page-select-page-preview-locale-popup popup toplevel border hide">' +
                                    '<div class="menu">' +
                                        '<div class="loading menu-icon"><img class="icon-loading" src="/web/images/loading-spinner.gif"/></div>' +
                                        '<a class="action-close menu-icon" href="#" title="Close" ><i class="far fa-window-close"></i></a>' +
                                    '</div>' +
                                    '<div class="page-select-controller-list"><ul></ul></div>' +
                                '</div>' +
                            '</div>' + 
                        '</div>' + 
                        '<div class="loading hide">' + 
                            '<img class="icon-loading" src="/web/images/loading-spinner.gif">' + 
                        '</div>' + 
                        '<div class="menu">' + 
                            '<a href="#" title="Show mobile view" class="action-mobile" id="action-page-mobile-preview"><i class="fa fa-mobile"></i></a>' + 
                            '<a href="#" title="Show tablet view" class="action-tablet" id="action-page-tablet-preview"><i class="fa fa-tablet"></i></a>' + 
                            '<a href="#" title="Show desktop view" class="action-desktop" id="action-page-desktop-preview"><i class="fa fa-desktop"></i></a>' + 
                            '<a href="#" title="Toggle debug mode" class="action-debug" id="action-page-toggle-debug"><i class="fa fa-bug"></i></a>' + 
                            '<a href="#" title="Refresh" class="action-refresh" id="action-refresh-page-preview"><i class="fa fa-refresh"></i></a>' + 
                            '<a class="action-help" href="#" title="Help"><i class="fa fa-question"></i></a>' + 
                        '</div>' + 
                    '</div>';
	frag = document.createRange().createContextualFragment(pagePreviewHeader);
    frag.querySelector('.action-fullscreen').addEventListener('click', function(ev) {
        this.parentNode.parentNode.classList.add('fullscreen');
        this.classList.add('hide');
        let minimizeAction = this.parentNode.querySelector('.action-minimize');
        minimizeAction.classList.remove('hide');
    });
    frag.querySelector('.action-minimize').addEventListener('click', function(ev) {
        this.parentNode.parentNode.classList.remove('fullscreen');
        this.classList.add('hide');
        let fullscreenAction = this.parentNode.querySelector('.action-fullscreen');
        fullscreenAction.classList.remove('hide');
    });
    pagePreview.appendChild(frag);

    divElement.appendChild(pageLayout);
    divElement.appendChild(pageController);
    divElement.appendChild(pageStyle);
    divElement.appendChild(pagePreview);

	let tabs = applicationPanel.querySelector('.pages-panel > .content');
    tabs.appendChild(divElement);

	var acePageLayoutEditor = ace.edit("layout-" + pageUUID);
	acePageLayoutEditor.setTheme("ace/theme/monokai");
	acePageLayoutEditor.getSession().setMode("ace/mode/html");
	acePageLayoutEditor.setValue('', -1);
    editorPagePanel.layoutEditors[pageUUID] = acePageLayoutEditor;

    var acePageControllerEditor = ace.edit("controller-" + pageUUID);
    acePageControllerEditor.setTheme("ace/theme/twilight");
    acePageControllerEditor.getSession().setMode("ace/mode/javascript");
    acePageControllerEditor.setValue('', -1);
    editorPagePanel.controllerEditors[pageUUID] = acePageControllerEditor;

    var acePageStyleEditor = ace.edit("style-" + pageUUID);
    acePageStyleEditor.setTheme("ace/theme/chrome");
    acePageStyleEditor.getSession().setMode("ace/mode/css");
    acePageStyleEditor.setValue('', -1);
    editorPagePanel.styleEditors[pageUUID] = acePageStyleEditor;

    var clickEvent = new Event('click');
    aElement.dispatchEvent(clickEvent);
}