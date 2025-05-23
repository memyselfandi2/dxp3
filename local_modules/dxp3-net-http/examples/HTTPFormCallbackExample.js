// const http = require('dxp3-net-http');
const http = require('../index');

const template = '<html>' +
'<body>' +
'hi' +
'<form method="post" action="/upload/" enctype="multipart/form-data">' +
'<label>File 1:</label><input type="file" name="fileToUpload[]" multiple="multiple" id="fileToUploadID"><br/>' +
'<label>File 2:</label><input type="file" name="fileToUpload[]" multiple="multiple" id="fileToUploadID2"><br/>' +
'<label>First Name:</label><input type="text" name="firstName" id="firstNameID"><br/>' +
'<label>Last Name:</label><input type="text" name="lastName" id="lastNameID"><br/>' +
'<input type="submit" value="Upload image" name="submit">' +
'</form>' +
'</body>' +
'</html>';

let httpServer = new http.HTTPServer({port:80,secure:false});
httpServer.on(http.HTTPServerEvent.RUNNING, (_address, _port) => {
    console.log('Running @ ' + _address + ':' + _port);
});
httpServer.on(http.HTTPServerEvent.STARTING, () => {
    console.log('Starting.');
});
httpServer.get('/', (_request, _response) => {
	_response.type('text/html').send('Hello World.<br/><a href="/api/testform">Click here for an upload form.</a>');
});
httpServer.get('/api/:name', (_request, _response) => {
	_response.type('text/html').send(template);
});
httpServer.post('/upload/', (_request, _response) => {
	let httpForm = new http.HTTPForm();
	httpForm.parse(_request, (_error, _fields, _files) => {
		for(let [fieldName, fieldArray] of _fields) {
			console.log('Received field \'' + fieldName + '\'.');
			fieldArray.forEach((_value) => {
				console.log('Value \'' + _value + '\'.');
			});
		}

		for(let [fileName, fileArray] of _files) {
			console.log('Received file \'' + fileName + '\'.');
			fileArray.forEach((_value) => {
				console.log('Filename \'' + _value + '\'.');
			});
		}
		_response.type('text/html').send(template);
	});
});
httpServer.start();