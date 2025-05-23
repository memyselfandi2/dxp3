let documentReady = function() {
	let applicationManager = new ApplicationManager();
	applicationManager.init(function(err) {
		if(err) {
			return;
		}
		applicationManager.loadPreview();
	});
	let pageManager = new PageManager();
	pageManager.init(function(err) {
		if(err) {
			return;
		}
		pageManager.loadPreview();
	});

}

if((document.readyState === "complete") ||
   (document.readyState !== "loading" && !document.documentElement.doScroll)) {
	documentReady();
} else {
	document.addEventListener("DOMContentLoaded", documentReady);
}