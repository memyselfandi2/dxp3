const WebServer = require('./WebServer');
const net = require('dxp3-net');
const WebForm = require('./WebForm');
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
		this.webServer = new WebServer({name:'TestPOST',port:8081,secure:false});
		this.webServer.get('/', function(req, res) {
			res.send('Hello World.<br/><a href="/api/upload">Click here for an upload form.</a>');
		});
		this.webServer.get('/api/:name', function(req, res) {
			res.type('text/html').send(template);
		});
		this.webServer.post('/upload/', function(req, res) {
			// let ws = fs.createWriteStream('C:\\temp\\blaat.csv', {flags: 'a'});
			let form = new WebForm();

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
		this.webServer.start();
	}
}

logging.setLevel(logging.Level.INFO);
let testPOST = new TestPOST();
testPOST.start();