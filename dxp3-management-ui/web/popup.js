/*
A popup may have:
    - a menu with
        - a loading icon
        - a help button
        - a close button
    - a filter panel to filter queries
    - a message panel to show any info/warning/error messages
    - a footer

Popups close when one clicks outside of them.
When a popup closes it fires a hide event.
*/
var popup = {}

jQuery(document).ready(function() {
	popup.init();
});

popup.init = function() {
    // If the click event bubbles all the way up to the document,
    // we can safely assume it was a click outside of any popup.
    // If this is the case, we close any open popups.
    // We fire a 'hide' event for each popup we hide.
    $(document).on('click', function(ev) {
        $('.popup').hide().trigger('hide');
    });
    // If there is a click within the boundaries of a popup, we
    // stop the event from bubbling up. This way the popup is not closed by the
    // document.
    $('.popup').on('click', function(ev) {
        ev.stopPropagation();
    });
    // The only click allowed to close the popup, within the popup itself, is the
    // close button in the popup menu.
	$('.popup > .menu > .action-close').on('click', function(ev) {
		ev.preventDefault();
		$(this).parent().parent().hide().trigger('hide');
		return false;
	});  
}

popup.open = function(selector) {
    popup.show(selector);
}

popup.show = function(selector) {
    if(selector === undefined || selector === null) {
        return;
    }
    var thePopup = null;
    if(Object.prototype.toString.call(selector) === '[object String]') {
        thePopup = $(selector);
    } else {
        thePopup = selector;
    }
    if(thePopup === undefined || thePopup === null) {
        return;
    }
    // Hide all other popups if we are a top level popup
    if(thePopup.hasClass('toplevel')) {
        $('.popup').not(thePopup).hide().trigger('hide');
    }
    thePopup.show().trigger('show');
}

popup.close = function(selector) {
    popup.hide(selector);
}

popup.hide = function(selector) {
    if(selector === undefined || selector === null) {
        return;
    }
    var thePopup = null;
    if(Object.prototype.toString.call(selector) === '[object String]') {
        thePopup = $(selector);
    } else {
        thePopup = selector;
    }
    if(thePopup === undefined || thePopup === null) {
        return;
    }
    thePopup.hide().trigger('hide');
}

popup.toggle = function(selector) {
    if(selector === undefined || selector === null) {
        return;
    }
    var thePopup = null;
    if(Object.prototype.toString.call(selector) === '[object String]') {
        thePopup = $(selector);
    } else {
        thePopup = selector;
    }
    if(thePopup === undefined || thePopup === null) {
        return;
    }
    var displayAttribute = thePopup.css('display');
    if(displayAttribute === 'none') {
        // Hide all other popups
        $('.popup').not(thePopup).hide().trigger('hide');
        thePopup.show().trigger('show');
    } else {
        thePopup.hide().trigger('hide');
    }
}

popup.showLoading = function(selector) {
    if(selector === undefined || selector === null) {
        return;
    }
    if(Object.prototype.toString.call(selector) === '[object String]') {
        $(selector + ' .loading > img.icon-loading').show();
    } else {
        selector.find('.loading > img.icon-loading').show();
    }
}

popup.hideLoading = function(selector) {
    if(selector === undefined || selector === null) {
        return;
    }
    if(Object.prototype.toString.call(selector) === '[object String]') {
        $(selector + ' .loading > img.icon-loading').hide();
    } else {
        selector.find('.loading > img.icon-loading').hide();
    }
}

popup.hideMessage = function(selector) {
    if(selector === undefined || selector === null) {
        return;
    }
    if(Object.prototype.toString.call(selector) === '[object String]') {
        $(selector + ' .message-panel').hide();
    } else {
        selector.find('.message-panel').hide();
    }
}

popup.showInfoMessage = function(selector, text) {
    if(selector === undefined || selector === null) {
        return;
    }
    var messagePanel = null;
    var message = null;
    var messageIcon = null;
    if(Object.prototype.toString.call(selector) === '[object String]') {
        messagePanel = $(selector + ' .message-panel');
        message = $(selector + ' .message-panel .message');
        messageIcon = $(selector + ' .message-panel i');
    } else {
        messagePanel = selector.find(' .message-panel');
        message = selector.find(' .message-panel .message');
        messageIcon = selector.find(' .message-panel i');
    }
    if(message === undefined || message === null) {
        return;
    }
    message.text(text);
    messageIcon.removeClass('fa-error');
    messageIcon.removeClass('shade-of-red');
    messageIcon.removeClass('fa-warning');
    messageIcon.removeClass('shade-of-yellow');
    messageIcon.addClass('fa-info-circle');
    messageIcon.addClass('shade-of-blue');
    messagePanel.stop(true, true).fadeIn(500).delay(1000).fadeOut(1000);
}

popup.showWarningMessage = function(selector, text) {
    if(selector === undefined || selector === null) {
        return;
    }
    var messagePanel = null;
    var message = null;
    var messageIcon = null;
    if(Object.prototype.toString.call(selector) === '[object String]') {
        messagePanel = $(selector + ' .message-panel');
        message = $(selector + ' .message-panel .message');
        messageIcon = $(selector + ' .message-panel i');
    } else {
        messagePanel = selector.find(' .message-panel');
        message = selector.find(' .message-panel .message');
        messageIcon = selector.find(' .message-panel i');
    }
    if(message === undefined || message === null) {
        return;
    }
    message.text(text);
    messageIcon.removeClass('fa-error');
    messageIcon.removeClass('shade-of-red');
    messageIcon.removeClass('fa-info-circle');
    messageIcon.removeClass('shade-of-blue');
    messageIcon.addClass('fa-warning');
    messageIcon.addClass('shade-of-yellow');
    messagePanel.stop(true, true).fadeIn(500).delay(1000).fadeOut(1000);
}

popup.showErrorMessage = function(selector, text) {
    if(selector === undefined || selector === null) {
        return;
    }
    var messagePanel = null;
    var message = null;
    var messageIcon = null;
    if(Object.prototype.toString.call(selector) === '[object String]') {
        messagePanel = $(selector + ' .message-panel');
        message = $(selector + ' .message-panel .message');
        messageIcon = $(selector + ' .message-panel i');
    } else {
        messagePanel = selector.find(' .message-panel');
        message = selector.find(' .message-panel .message');
        messageIcon = selector.find(' .message-panel i');
    }
    if(message === undefined || message === null) {
        return;
    }
    message.text(text);
    messageIcon.removeClass('fa-warning');
    messageIcon.removeClass('shade-of-yellow');
    messageIcon.removeClass('fa-info-circle');
    messageIcon.removeClass('shade-of-blue');
    messageIcon.addClass('fa-fire');
    messageIcon.addClass('shade-of-red');
    messagePanel.stop(true, true).fadeIn(500).delay(1000).fadeOut(1000);
}