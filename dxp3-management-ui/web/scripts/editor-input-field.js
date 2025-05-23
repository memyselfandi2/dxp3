const editorInputField = {};

editorInputField.addEventListener = function(inputField, eventType, callback) {
    let element = inputField.querySelector('.input-field');
    if(element === undefined || element === null) {
        element = inputField.querySelector('.input-textarea');
    }
    element.addEventListener(eventType, function(ev) {
        callback(this, ev);
    });
}

editorInputField.refreshInputField = function(inputField, initialValue) {
    let initialValueInput = inputField.querySelector('input.initial-value');
    initialValueInput.value = initialValue;
    console.log('refreshed input field: ' + initialValue);
    var inputEvent = new Event('input');
    inputField.dispatchEvent(inputEvent);
}

editorInputField.isUpdated = function(inputField) {
    if(inputField) {
        let initialValueInput = inputField.querySelector('input.initial-value');
        if(initialValueInput) {
            let initialValue = initialValueInput.value;
            let currentValue = null;
            if(inputField.classList.contains('text')) {
                let input = inputField.querySelector('input[type="text"]');
                currentValue = input.value;
            } else if(inputField.classList.contains('textarea')) {
                let input = inputField.querySelector('textarea');
                currentValue = input.value;
            } else if(inputField.classList.contains('radio-buttons')) {
                let input = inputField.querySelector('input[type="radio"]:checked');
                if(input === undefined || input === null) {
                    currentValue = '';
                } else {
                    currentValue = input.value;
                }
            }
            return (currentValue != initialValue);
        }
    }
    return false;
}

editorInputField.createTextInput = function(label, className, inputName, value, placeholder, hasBorder, hasClearButton, type) {
    let template = editorInputField.getTextInputTemplate(label, className, inputName, value, placeholder, hasBorder, hasClearButton, type);
    var inputField = document.createRange().createContextualFragment(template);
    InputField.initTextInput(inputField);
    return inputField;
}

editorInputField.createTextAreaInput = function(label, className, inputName, value, placeholder, hasBorder, hasClearButton, type) {
    let template = editorInputField.getTextAreaInputTemplate(label, className, inputName, value, placeholder, hasBorder, hasClearButton, type);
    let inputField = document.createRange().createContextualFragment(template);
    InputField.initTextAreaInput(inputField);
    return inputField;
}

editorInputField.createRadioButtonsInput = function(label, classNames, groupName, values, displayValues, checkedValue, hasBorder) {
    let template = editorInputField.getRadioButtonsInputTemplate(label, classNames, groupName, values, displayValues, checkedValue, hasBorder);
    let inputField = document.createRange().createContextualFragment(template);
    InputField.initRadioButtonsInput(inputField);
    return inputField;
}

editorInputField.getRadioButtonsInputTemplate = function(label, classNames, groupName, values, displayValues, checkedValue, _hasBorder) {
    if(label === undefined || label === null) {
        label = '';
    }
    label = label.trim();
    // Typically radio buttons do not have a border unless it is explicitly turned on.
    let hasBorder = false;
    if(_hasBorder) {
        if(typeof _hasBorder === "boolean") {
            hasBorder = _hasBorder;
        } else if(typeof _hasBorder === "string") {
            _hasBorder = _hasBorder.trim().toLowerCase();
            if(_hasBorder === "true" || _hasBorder === "on" || _hasBorder === "yes") {
                hasBorder = true;
            }
        }
    }
    let template = '';
    if(label.length > 0) {
        template += '<div class="input-field-with-label">' +
                        '<div class="label">' + label + '</div>';
    }
    template += '<div class="input-field radio-buttons';
    if(hasBorder) {
        template += ' border';   
    }
    template += '">';
    if(checkedValue === undefined || checkedValue === null) {
        checkedValue = '';
    }
    template += '<input class="initial-value" type="hidden" value="' + checkedValue + '"/>';
    template += '<form>';
    for(var i=0;i < classNames.length;i++) {
        template += '<label><input class="' + classNames[i] + '" type="radio" name="' + groupName + '" value="' + values[i] + '"';
        if(checkedValue === values[i]) {
            template += ' checked';
        }
        template += '/>' + displayValues[i] + '</label>';
    }
    template += '</form>';
    template += '<div class="input-field-buttons">';
    template += '<button class="reset-button hide" type="reset" title="Reset"><i class="fas fa-undo-alt"></i></button>';
    template += '</div>';    
    template += '</div>';
    if(label.length > 0) {
        template += '</div>';
    }
    return template;
}

editorInputField.getTextAreaInputTemplate = function(label, className, inputName, value, placeholder, _hasBorder, _hasClearButton, type) {
    if(label === undefined || label === null) {
        label = '';
    }
    label = label.trim();
    if(className === undefined || className === null) {
        className = '';
    }
    if(inputName === undefined || inputName === null) {
        inputName = '';
    }
    if(value === undefined || value === null) {
        value = '';
    }
    if(placeholder === undefined || placeholder === null) {
        placeholder = '';
    }
    // Each input field will have a border unless it is explicitly turned off.
    let hasBorder = true;
    if(_hasBorder) {
        if(typeof _hasBorder === "boolean") {
            hasBorder = _hasBorder;
        } else if(typeof _hasBorder === "string") {
            _hasBorder = _hasBorder.trim().toLowerCase();
            if(_hasBorder === "false" || _hasBorder === "off" || _hasBorder === "no") {
                hasBorder = false;
            }
        }
    }
    // Each input field will have a clear button unless it is explicitly turned off.
    let hasClearButton = true;
    if(_hasClearButton) {
        if(typeof _hasClearButton === "boolean") {
            hasClearButton = _hasClearButton;
        } else if(typeof _hasClearButton === "string") {
            _hasClearButton = _hasClearButton.trim().toLowerCase();
            if(_hasClearButton === "false" || _hasClearButton === "off" || hasClearButton === "no") {
                hasClearButton = false;
            }
        }
    }
    let template = '';
    if(label.length > 0) {
        template += '<div class="input-field-with-label">' +
                        '<div class="label">' + label + '</div>';
    }
    template += '<div class="input-field textarea';
    if(hasBorder) {
        template += ' border';   
    }
    template += '">';
    template += '<input class="initial-value" type="hidden" value="' + value + '"/>';
    template += '<textarea class="' + className + '" type="text" name="' + inputName + '" placeholder="' + placeholder + '">' + value + '</textarea>';
    template += '<div class="input-textarea-buttons">';
    if(type != undefined && type != null && (typeof type === "string")) {
        type = type.trim().toLowerCase();
        if(type === 'search') {
            template += '<button class="search-button" type="submit" title="Search"><i class="fa fa-chevron-down"></i></button>';
        } else if(type === 'create') {
            template += '<button class="create-button" type="submit" title="Create"><i class="fa fa-magic"></i></button>';
        } else if(type === 'edit') {
            template += '<button class="create-button" type="submit" title="Create"><i class="fas fa-pen"></i></button>';
        }
    }
    template += '<button class="reset-button hide" type="reset" title="Reset"><i class="fas fa-undo-alt"></i></button>';
    if(hasClearButton) {
        template += '<button class="clear-button" type="reset" title="Clear"><i class="fa fa-trash-alt"></i></button>';
    }
    template += '</div>';    
    template += '</div>';
    if(label.length > 0) {
        template += '</div>';
    }
    return template;
}

editorInputField.getTextInputTemplate = function(label, className, inputName, value, placeholder, _hasBorder, _hasClearButton, type) {
    if(label === undefined || label === null) {
        label = '';
    }
    label = label.trim();
    if(className === undefined || className === null) {
        className = '';
    }
    if(inputName === undefined || inputName === null) {
        inputName = '';
    }
    if(value === undefined || value === null) {
        value = '';
    }
    if(placeholder === undefined || placeholder === null) {
        placeholder = '';
    }
    // Each input field will have a border unless it is explicitly turned off.
    let hasBorder = true;
    if(_hasBorder) {
        if(typeof _hasBorder === "boolean") {
            hasBorder = _hasBorder;
        } else if(typeof _hasBorder === "string") {
            _hasBorder = _hasBorder.trim().toLowerCase();
            if(_hasBorder === "false" || _hasBorder === "off" || _hasBorder === "no") {
                hasBorder = false;
            }
        }
    }
    // Each input field will have a clear button unless it is explicitly turned off.
    let hasClearButton = true;
    if(_hasClearButton) {
        if(typeof _hasClearButton === "boolean") {
            hasClearButton = _hasClearButton;
        } else if(typeof _hasClearButton === "string") {
            _hasClearButton = _hasClearButton.trim().toLowerCase();
            if(_hasClearButton === "false" || _hasClearButton === "off" || hasClearButton === "no") {
                hasClearButton = false;
            }
        }
    }
    let template = '';
    if(label.length > 0) {
        template += '<div class="input-field-with-label">' +
                        '<div class="label">' + label + '</div>';
    }
    template += '<div class="input-field text';
    if(hasBorder) {
        template += ' border';   
    }
    template += '">';
    template += '<input class="initial-value" type="hidden" value="' + value + '"/>';
    template += '<input class="current-value ' + className + '" type="text" name="' + inputName + '" value="' + value + '" placeholder="' + placeholder + '"/>';
    template += '<div class="input-field-buttons">';
    if(type != undefined && type != null && (typeof type === "string")) {
        type = type.trim().toLowerCase();
        if(type === 'search') {
            template += '<button class="search-button" type="submit" title="Search"><i class="fa fa-chevron-down"></i></button>';
        } else if(type === 'create') {
            template += '<button class="create-button" type="submit" title="Create"><i class="fa fa-magic"></i></button>';
        } else if(type === 'edit') {
            template += '<button class="create-button" type="submit" title="Create"><i class="fas fa-pen"></i></button>';
        }
    }
    template += '<button class="reset-button hide" type="reset" title="Reset"><i class="fas fa-undo-alt"></i></button>';
    if(hasClearButton) {
        template += '<button class="clear-button" type="reset" title="Clear"><i class="fa fa-trash-alt"></i></button>';
    }
    template += '</div>';
    template += '</div>';
    if(label.length > 0) {
        template += '</div>';
    }
    return template;
}