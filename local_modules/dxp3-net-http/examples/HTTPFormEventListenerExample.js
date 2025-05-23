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
	httpForm.on('field', (_fieldName, _value) => {
		console.log('Received field \'' + _fieldName + '\'.');
		console.log('Value \'' + _value + '\'.');
	});
	httpForm.on('file', (_name, _fileName, _fileExtension, _filePath, _numberOfBytes) => {
		console.log('Received file  : \'' + _name + '\'.');
		console.log('Filename       : \'' + _fileName + '\'.');
		console.log('Extension      : \'' + _fileExtension + '\'.');
		console.log('Path           : \'' + _filePath + '\'.');
		console.log('Number of bytes: \'' + _numberOfBytes + '\'.');
	});
	httpForm.on('close', () => {
		_response.type('text/html').send(template);
	});
	httpForm.parse(_request);
});
httpServer.start();