const web = require('dxp3-microservice-web');
const WebForm = web.WebForm;

const template = '<!doctype html>' +
'<html>' +
'<body>' +
'hi there' +
'<form method="post" action="/upload/" enctype="multipart/form-data">' +
'<label>File 1:</label><input type="file" name="fileToUpload[]" multiple="multiple" id="fileToUploadID"><br/>' +
'<label>File 2:</label><input type="file" name="fileToUpload[]" multiple="multiple" id="fileToUploadID2"><br/>' +
'<label>First Name:</label><input type="text" name="firstName" id="firstNameID"><br/>' +
'<label>Last Name:</label><input type="text" name="lastName" id="lastNameID"><br/>' +
'<input type="submit" value="Upload image" name="submit">' +
'</form>' +
'</body>' +
'</html>';

module.exports = function(webServer) {
	webServer.get('/ping/', function(req, res) {
		res.status(200).type('text/plain').send('pong');
	});

	webServer.get('/upload/', function(req, res) {
		res.type('text/html').send(template);
	});

    webServer.post('/upload/', function(req, res) {
        let form = new WebForm();

        form.on('close', function() {
			console.log('Finished parsing the form.');
			res.type('text/html').send(template);
        });
        form.on('error', function(error) {
			console.log('Form error: ' + error);
        });
        form.on('part', function(part) {
			console.log('Form received a part: ' + part.length);
        });
        form.on('field', function(name, value) {
			console.log('Form received a field: ' + name + '=' + value);
        });
        form.on('file', function(name, fileName, fileExtension, filePath, numberOfBytes) {
        	console.log('File (' + numberOfBytes + ' bytes): ' + name + ', ' + fileName + ', ' + fileExtension + ', ' + filePath);
        });

        form.parse(req);
    });
}