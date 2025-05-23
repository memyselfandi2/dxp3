var adminPanel = {}

jQuery(document).ready(function() {
	adminPanel.init();
});

adminPanel.init = function() {
    $('.action-message').hide();
    // All clear buttons should clear their parent input(s) and/or textarea(s)
	$('.input-field > .clear-button').on('click', function(ev) {
        ev.preventDefault();
        var theParent = $(this).parent();
        var theInput = theParent.children('input');
        var currentValue = theInput.val();
        if(currentValue.length > 0) {
            theInput.val('').trigger('change');
        }
        theInput.focus();
        var thePopup = theParent.children('.popup');
        popup.show(thePopup);
        return false;
	});
    
	$('.input-textarea > .clear-button').on('click', function(ev) {
		ev.preventDefault();
        var theParent = $(this).parent();
        var theTextArea = theParent.children('textarea');
        var currentValue = theTextArea.val();
        if(currentValue.length > 0) {
            theTextArea.val('').trigger('change');
        }
        theTextArea.focus();
        var thePopup = theParent.children('.popup');
        popup.show(thePopup);
		return false;
	});
    // All fullscreen actions/buttons should make their parent div go fullscreen
    $('.action-fullscreen').on('click', function(ev) {
        ev.preventDefault();
        // admin panel can go 'fullscreen'
        var adminPanel = $(this).parent().parent();
        adminPanel.css({'background': 'white none repeat scroll 0 0',
        							   'height': '100%',
        							   'left': '0px',
        							   'position': 'absolute',
        							   'top': '0px',
        							   'width': '100%',
        							   'z-index': '10000'});
        adminPanel.find('.editor').css({'height': '100%'});
        $('.action-fullscreen').hide();
        $('.action-minimize').show();
        return false;
    });

    $('.action-minimize').on('click', function(ev) {
        ev.preventDefault();
        var adminPanel = $(this).parent().parent();
        adminPanel.removeAttr('style');
        adminPanel.find('.editor').removeAttr('style');
        $('.action-fullscreen').show();
        $('.action-minimize').hide();
        return false;
    });
}