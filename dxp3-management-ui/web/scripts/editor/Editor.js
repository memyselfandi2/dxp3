class Editor {

	static create() {
		Editor.editorLogo = new EditorLogo('editor-logo');
		Editor.editorMenu = new PanelMenu('editor-panel-menu');
		Editor.accountMenu = new AccountMenu('account-menu');
		Editor.applicationsAdminPanel = new ApplicationsAdminPanel('applications-admin-panel', 'Applications');
		Editor.dashboardAdminPanel = new DashboardAdminPanel('dashboard-admin-panel', 'Dashboard');
		Editor.destinationsAdminPanel = new DestinationsAdminPanel('destinations-admin-panel', 'Destinations');
		Editor.localesAdminPanel = new LocalesAdminPanel('locales-admin-panel', 'Locales');
		Editor.serversAdminPanel = new ServersAdminPanel('servers-admin-panel', 'Servers');
		Editor.settingsAdminPanel = new SettingsAdminPanel('settings-admin-panel', 'Settings');
		Editor.usergroupsAdminPanel = new UsergroupsAdminPanel('usergroups-admin-panel', 'Usergroups');
		Editor.usersAdminPanel = new UsersAdminPanel('users-admin-panel', 'Users');

		Editor.editorMenu.addPanel(Editor.dashboardAdminPanel, "fa fa-tachometer-alt");
		Editor.editorMenu.addPanel(Editor.applicationsAdminPanel, "fa fa-sitemap");
		Editor.editorMenu.addPanel(Editor.usersAdminPanel, "fa fa-user");
		Editor.editorMenu.addPanel(Editor.usergroupsAdminPanel, "fa fa-users");
		Editor.editorMenu.addPanel(Editor.localesAdminPanel, "fa fa-flag");
		Editor.editorMenu.addPanel(Editor.serversAdminPanel, "fa fa-server");
		Editor.editorMenu.addPanel(Editor.destinationsAdminPanel, "fa fa-bullseye");
		Editor.editorMenu.addPanel(Editor.settingsAdminPanel, "fa fa-cogs");
	}

	static draw() {
		let main = document.querySelector('main');
		main.appendChild(Editor.editorLogo.getDocumentFragment());
		main.appendChild(Editor.editorMenu.getDocumentFragment());
		main.appendChild(Editor.accountMenu.getDocumentFragment());
		main.appendChild(Editor.applicationsAdminPanel.getDocumentFragment());
		main.appendChild(Editor.dashboardAdminPanel.getDocumentFragment());
		main.appendChild(Editor.destinationsAdminPanel.getDocumentFragment());
		main.appendChild(Editor.localesAdminPanel.getDocumentFragment());
		main.appendChild(Editor.serversAdminPanel.getDocumentFragment());
		main.appendChild(Editor.settingsAdminPanel.getDocumentFragment());
		main.appendChild(Editor.usergroupsAdminPanel.getDocumentFragment());
		main.appendChild(Editor.usersAdminPanel.getDocumentFragment());
	}

	static init() {
		Editor.editorLogo.init();
		Editor.editorMenu.init();
		Editor.accountMenu.init();
		Editor.applicationsAdminPanel.init();
		Editor.dashboardAdminPanel.init();
		Editor.destinationsAdminPanel.init();
		Editor.localesAdminPanel.init();
		Editor.serversAdminPanel.init();
		Editor.settingsAdminPanel.init();
		Editor.usergroupsAdminPanel.init();
		Editor.usersAdminPanel.init();

		Editor.accountMenu.load();
		Editor.editorMenu.selectPanelById(Editor.applicationsAdminPanel.id);
	}

	static documentReady() {
		// First things first...lets initialize our security system...
		Security.init();
		// Next we need to ensure top-level popups are closed when there is a click outside of the popup.
		// This is done by calling the static initDocument method.
		Popup.initDocument();
		// Now we are ready to build our UI.
		Editor.create();
		// Lets draw our UI.
		Editor.draw();
		// Add events listeners to our components.
		Editor.init();
	}
}

if((document.readyState === "complete") ||
   (document.readyState !== "loading" && !document.documentElement.doScroll)) {
	Editor.documentReady();
} else {
	document.addEventListener("DOMContentLoaded", Editor.documentReady);
}