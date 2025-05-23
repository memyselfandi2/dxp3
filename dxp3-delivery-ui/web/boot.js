let documentReady = function() {
    // First things first: security.
    // The security manager handles all the ajax calls and other communication with the server.
    // It injects the necessary token(s).
	SecurityManager.init();
    // Second things second: locale.
    // We need to initialize our locale before we load any content.
    LocaleManager.init();
    // Third things third: event management.
    // We allow applications, pages and features to publish and subscribe to events
    EventManager.init();
    // The history manager listens for changes to the browser history and handles any
    // ajax requests to our own domain.
    HistoryManager.init();
    // The application manager will start by:
    // - loading the application styles
    // - initializing the page manager
    // - loading the application controller
	ApplicationManager.init(function(err, applicationUUID) {
		PageManager.init(function(err, pageUUID) {
			ApplicationManager.loadApplication(applicationUUID, pageUUID);
		});
	});
}

if((document.readyState === "complete") ||
   (document.readyState !== "loading" && !document.documentElement.doScroll)) {
	documentReady();
} else {
	document.addEventListener("DOMContentLoaded", documentReady);
}