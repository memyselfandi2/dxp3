const editorApplicationMenu = {}

editorApplicationMenu.init = function() {
}

editorApplicationMenu.addApplication = function() {

}

editorApplicationMenu.toggle = function() {
	let menu = document.getElementById('editor-menu');
	if(menu.classList.contains('maximized')) {
		editorApplicationMenu.hide();
	} else {
		editorApplicationMenu.show();
	}
}

editorApplicationMenu.show = function(element) {
	element.classList.add('maximized');
}

editorApplicationMenu.hide = function(element) {
	element.classList.remove('maximized');
}

var documentReady = function() {
	editorApplicationMenu.init();
}

if((document.readyState === "complete") ||
   (document.readyState !== "loading" && !document.documentElement.doScroll)) {
	documentReady();
} else {
	document.addEventListener("DOMContentLoaded", documentReady);
}