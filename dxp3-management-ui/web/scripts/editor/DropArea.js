class DropArea extends EditorElement {

	constructor(id, _reference, _dao) {
		super(id);

		this.reference = _reference;
		this.dao = _dao;

		let thisDropArea = this;
		this.browseButton = new Button(null, 'action-browse', 'Browse', 'fa fa-plus', 'Browse');
		this.browseButton.addEventListener('click', function() {
			thisDropArea.browse();
		});
		this.uploadButton = new Button(null, 'action-upload', 'Upload', 'fa fa-check', 'Upload');
		this.uploadButton.addEventListener('click', function() {
			thisDropArea.upload();
		});
		this.uploadButton.disable();
		this.cancelButton = new Button(null, 'action-cancel shade-of-red', 'Cancel', 'fa fa-times', 'Cancel');
		this.cancelButton.addEventListener('click', function() {
			thisDropArea.reset();
		});
		this.cancelButton.disable();
		this.toBeUploadedFiles = [];
	}

	getDocumentFragment() {
		let template = '<div class="droparea">';
		template += '<input type="file" multiple hidden="hidden"/>';
		template += '<table>';
		template += '<tbody>';
		template += '</tbody>';
		template += '</table>';
        template += '<div class="buttons">';
        template += '</div>';
		template += '</div>';
		let myDocumentFragment = document.createRange().createContextualFragment(template);
		let mergedDocumentFragment = super.getDocumentFragment(myDocumentFragment);

		let buttonsElement = mergedDocumentFragment.querySelector('.buttons');
		buttonsElement.appendChild(this.browseButton.getDocumentFragment());
		buttonsElement.appendChild(this.uploadButton.getDocumentFragment());
		buttonsElement.appendChild(this.cancelButton.getDocumentFragment());

		return mergedDocumentFragment;
	}

	init() {
		super.init();
		this.browseButton.init();
		this.uploadButton.init();
		this.cancelButton.init();

		let thisDropArea = this;
		let thisEditorElement = document.getElementById(this.id);
		thisEditorElement.addEventListener('dragenter', function(ev) {
			ev.preventDefault();
			ev.stopPropagation();
			return false;
		});
		thisEditorElement.addEventListener('dragleave', function(ev) {
			ev.preventDefault();
			ev.stopPropagation();
			return false;
		});
		thisEditorElement.addEventListener('dragover', function(ev) {
			ev.preventDefault();
			ev.stopPropagation();
			return false;
		});
		thisEditorElement.addEventListener('drop', function(ev) {
			ev.preventDefault();
			ev.stopPropagation();
			let dataTransfer = ev.dataTransfer;
			let files = dataTransfer.files;
			([...files]).forEach(function(file) {
				console.log('file: ' + file.name + ', size:' + file.size + ', type: ' + file.type + ', lastModified: ' + file.lastModified);
				thisDropArea.preview(file);
			});
			return false;
		});
		let thisFile = thisEditorElement.querySelector('input[type="file"]');
		thisFile.addEventListener('change', function() {
			for(let i=0;i < thisFile.files.length;i++) {
				let file = thisFile.files[i];				
				console.log('file: ' + file.name + ', size:' + file.size + ', type: ' + file.type + ', lastModified: ' + file.lastModified);
				thisDropArea.preview(file);
			}
		});
	}

	reset() {
		this.toBeUploadedFiles = [];
	    let thisEditorElement = document.getElementById(this.id);
		let tbodyElement = thisEditorElement.querySelector('table > tbody');
		let trElement = tbodyElement.firstChild;
		while (trElement) {
		    trElement.remove()
			trElement = tbodyElement.firstChild;
		}
		this.uploadButton.disable();
		this.cancelButton.disable();
	}

	upload() {

		alert('there are ' + this.toBeUploadedFiles.length + ' files to be uploaded.');
		for(let i=0;i < this.toBeUploadedFiles.length;i++) {
			let file = this.toBeUploadedFiles[i];

			let formData = new FormData();
	    	let request = new XMLHttpRequest();
		 
		    formData.set('file', file);
		    this.dao.uploadImage(file)
		    
		    request.open("POST", '/application/8f0314e4-fd52-4979-9179-909e5f63e348/image/');
		    request.send(formData);

			request.upload.addEventListener('progress', function(e) {
				var percent_complete = (e.loaded / e.total)*100;
				
				// Percentage of upload completed
				console.log(percent_complete);
			});

			request.addEventListener('load', function(e) {
				// HTTP status message
				console.log(request.status);

				// request.response will hold the response from the server
				console.log(request.response);
			});
		}
	}

	browse() {
	    let thisEditorElement = document.getElementById(this.id);
		let thisFile = thisEditorElement.querySelector('input[type="file"]');
	    thisFile.click();
	}

	preview(file) {
		this.toBeUploadedFiles.push(file);

		let thisDropArea = this;
		this.uploadButton.enable();
		this.cancelButton.enable();
	    let thisEditorElement = document.getElementById(this.id);
		let fileList = thisEditorElement.querySelector('table > tbody');
		let trElement = document.createElement('tr');
		let tdElement = document.createElement('td');
		let fileNameElement = document.createTextNode(file.name);
		tdElement.appendChild(fileNameElement);
		trElement.appendChild(tdElement);
		tdElement = document.createElement('td');
		let aElement = document.createElement('a');
		aElement.setAttribute('class', 'action-delete');
		aElement.setAttribute('href', '#');
		let aContent = document.createTextNode('delete');
		aElement.appendChild(aContent);
		tdElement.appendChild(aElement);
		trElement.appendChild(tdElement);
		fileList.appendChild(trElement);
		aElement.addEventListener('click', function(ev) {
			let tdElement = this.parentNode;
			let trElement = tdElement.parentNode;
			let table = trElement.parentNode;
			table.removeChild(trElement);
			if(table.children.length <= 0) {
				thisDropArea.uploadButton.disable();
				thisDropArea.cancelButton.disable();
			}
		});
	}
}