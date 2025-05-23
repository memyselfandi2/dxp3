const path = require('path');
let fileID = 0;
let uploadDir = 'C:\\temp\\';

const fileSocketConnectionHandler = (_tcpSocket) => {
	const processFile = function() {
		fileID++;
		let tmpFilePath = uploadDir + path.sep + 'tmpfile_' + fileID;
		console.log('Next file: ' + tmpFilePath);

	    _tcpSocket.readFileHeader().then(
	        (_fileInformation) => {
	            if(_fileInformation.error) {
	            }
	            _tcpSocket.readFile(tmpFilePath).then(
					(_numberOfBytesWritten) => {
						console.log('Number of bytes written: ' + _numberOfBytesWritten);
						processFile();
					},
					(_error) => {
						console.log('Error: ' + _error);
						_tcpSocket.destroy();
					}
	            );
	        },
	        (_error) => {
				console.log('Error: ' + _error);
				_tcpSocket.destroy();
	        }
	    );
	}
	processFile();
}

module.exports = fileSocketConnectionHandler;