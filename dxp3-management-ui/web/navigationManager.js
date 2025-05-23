var navigationManager = {}

jQuery(document).ready(function() {
	navigationManager.init();
});

navigationManager.state = null;

navigationManager.init = function() {
	$('#navigation-menu .action-toggle-navigation').on('click', function(ev) {
		ev.preventDefault();
		navigationManager.toggleNavigation();
		return false;
	});
	$('.action-select-admin-panel').on('click', function(ev) {
		var adminPanelId = $(this).attr('href').substring(1);
		navigationManager.selectAdminPanel(adminPanelId);
		return false;
	});
	navigationManager.hideNavigation();
	navigationManager.selectAdminPanel('applications-admin-panel');	
}

navigationManager.selectAdminPanel = function(adminPanelToShow) {
	$('.popup').hide();
	$('.admin-panel').hide();
	$('#' + adminPanelToShow).show();
	navigationManager.hideNavigation();
};

navigationManager.toggleNavigation = function() {
	if(navigationManager.state === 'hidden') {
		navigationManager.showNavigation();
	} else {
		navigationManager.hideNavigation();
	}
}

navigationManager.showNavigation = function() {
	var navigationMenu = $('#navigation-menu');
	navigationMenu.width('250px');
	var icon = $('#navigation-menu .action-toggle-navigation i').attr('class', 'fa fa-close');
	navigationManager.state = 'visible';
}

navigationManager.hideNavigation = function() {
	var navigationMenu = $('#navigation-menu');
	navigationMenu.width('40px');
	var icon = $('#navigation-menu .action-toggle-navigation i').attr('class', 'fa fa-bars');
	navigationManager.state = 'hidden';
}
