const HTTPServer = require('./HTTPServer');
const HTTPForm = require('./HTTPForm');
const logging = require('dxp3-logging');
const fs = require('fs');

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

class TestPOST {
	constructor() {
		this.httpServer = new HTTPServer({port:8081,secure:false});
		this.httpServer.get('/', function(req, res) {
			res.type('text/html').send('Hello World.<br/><a href="/api/testform">Click here for an upload form.</a>');
		});
		this.httpServer.get('/api/:name', function(req, res) {
			res.type('text/html').send(template);
		});
		this.httpServer.post('/upload/', function(req, res) {
			// let ws = fs.createWriteStream('C:\\temp\\blaat.csv', {flags: 'a'});
			let form = new HTTPForm();

			// form.on('close', function() {
			// 	console.log('Finished parsing the form.');
			// 	ws.end();
			// });
			// form.on('error', function(error) {
			// 	console.log('Form error: ' + error);
			// });
			// form.on('part', function(part) {
			// 	console.log('Form received a part: ' + part.length);
			// 	ws.write(payload);
			// });
			// form.on('field', function(name, value) {
			// 	console.log('Form received a field: ' + name + '=' + value);
			// });
			form.parse(req, function(err, fields, files) {
				for(let [fieldName, fieldArray] of fields) {
					console.log('got field named ' + fieldName);
					fieldArray.forEach(function(value) {
						console.log('value ' + value);
					});
				}

				for(let [fileName, fileArray] of files) {
					console.log('got file named ' + fileName);
					fileArray.forEach(function(value) {
						console.log('Filename: ' + value);
					});
				}
			});

			res.type('text/html').send(template);
		});
	}

	start() {
		this.httpServer.start();
	}
}

logging.setLevel(logging.Level.TRACE);
let testPOST = new TestPOST();
testPOST.start();