class ImagesPopup extends Popup {

	constructor(id, size, isTopLevel, hasBorder, hasMenu, _reference, _dao) {
		super(id, size, isTopLevel, hasBorder, hasMenu);
		this.fetchListAbortController = null;
		this.nameRegex = '';
		this.reference = _reference;
		this.dao = _dao;

		this.dropArea = new DropArea(null, this.reference, this.dao);
	}

	getDocumentFragment() {
		let template = '<div class="list">';
		template += '<div id="droparea"></div>';
		template += '<table>';
		template += '<thead>';
		template += '<tr>';
		template += '<th>Image</th>'
		template += '<th><a class="action-list-item sort-by" href="#name">Name<i class="fa fa-sort"></i></a></th>';
		template += '<th><a class="action-list-item sort-by" href="#filename">File name<i class="fa fa-sort"></i></a></th>';
		template += '<th><a class="action-list-item sort-by" href="#date">Date<i class="fa fa-sort"></i></a></th>';
		template += '</tr>';
		template += '</thead>';
		template += '<tbody>';
		template += '</tbody>';
		template += '</table>';
    	template += '</div>';
		let myDocumentFragment = document.createRange().createContextualFragment(template);
		let mergedDocumentFragment = super.getDocumentFragment(myDocumentFragment);

		let child = mergedDocumentFragment.querySelector('#droparea');
		child.parentNode.replaceChild(this.dropArea.getDocumentFragment(), child);

		return mergedDocumentFragment;
	}

	init() {
		super.init();

		this.dropArea.init();
	}

	upload(files) {
		var formData = new FormData();
    	var request = new XMLHttpRequest();
	 
	    formData.set('file', file);
	    request.open("POST", '/upload');
	    request.send(formData);
	}

	reset() {
	}

	refresh(text) {
		this.nameRegex = text;
		this.list(this.nameRegex);
	}

	list(nameRegex) {
	    this.showLoading();
		if(this.fetchListAbortController != null) {
			this.fetchListAbortController.abort();
		}
	    this.fetchListAbortController = new AbortController();
	    if(nameRegex === null) {
	    	nameRegex = this.nameRegex;
	    }
	    let thisImagesPopup = this;
	    let thisEditorElement = document.getElementById(this.id);
		let currentList = thisEditorElement.querySelector('div.list>table>tbody');
		this.dao.listImages(this.reference, function(err, result) {
	    	thisImagesPopup.hideLoading();
			if(err) {
	        	let errorMessage = 'An unknown error occurred. Please try again later.';
	        	thisImagesPopup.showWarningMessage(errorMessage);
	        	return;
			}
			let child = currentList.firstChild;
			while(child) {
				currentList.removeChild(child);
				child = currentList.firstChild;
			}
			if(result.totalNumberOfResults <= 0) {
				let infoMessage = 'No images found';
				thisImagesPopup.showInfoMessage(infoMessage);
				return;
			}
  	        for(let i=0;i < result.list.length;i++) {

				// let trElement = document.createElement('tr');
				// let tdElement = document.createElement('td');
				// let aElement = document.createElement('a');
				// aElement.setAttribute('class', 'action-load-controller action-list-item');
				// aElement.setAttribute('href', '#' + i);
				// let aContent = document.createTextNode(i + 1);
				// aElement.appendChild(aContent);
				// tdElement.appendChild(aElement);
				// trElement.appendChild(tdElement);
				// tdElement = document.createElement('td');
				// aElement = document.createElement('a');
				// aElement.setAttribute('class', 'action-load-controller action-list-item');
				// aElement.setAttribute('href', '#' + result.list[i].uuid + ';' + result.list[i].name);
				// aContent = document.createTextNode(result.list[i].name);
				// aElement.appendChild(aContent);
				// tdElement.appendChild(aElement);
				// trElement.appendChild(tdElement);
				// currentList.appendChild(trElement);
				// aElement.addEventListener('click', function(ev) {
				// 	ev.preventDefault();
				// 	var href = this.getAttribute('href');
				// 	href = href.substring(1);
				// 	href = href.split(';');
				// 	let event = {};
				// 	event.applicationUUID = thisImagesPopup.reference;
				// 	event.controllerUUID = href[0];
				// 	event.controllerName = href[1];
				// 	thisImagesPopup.dispatchEvent('select', event);
				// 	return false;
				// });
  	        }
		});
	}
}