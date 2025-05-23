/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-net-http
 *
 * NAME
 * HTTPForm
 */
const packageName = 'dxp3-net-http';
const moduleName = 'HTTPForm';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * @module dxp3-net-http/HTTPForm
 */
const fs = require('fs');
const HTTPFormOptions = require('./HTTPFormOptions');
const HTTPFormState = require('./HTTPFormState');
const logging = require('dxp3-logging');
const {StringDecoder} = require('string_decoder');
const {Writable} = require('stream');
const util = require('dxp3-util');
const uuid = require('dxp3-uuid');

const logger = logging.getLogger(canonicalName);

const CARRIAGE_RETURN = 13;
const COLON = 58;
const HYPHEN = 45;
const LINE_FEED = 10;
const HEADER_BUFFER_SIZE = 8192;

class HTTPForm extends Writable {

	constructor(args) {
		super();
		let self = this;
		args = HTTPFormOptions.parse(args);
		this.encoding = args.encoding;
		this.uploadDir = args.uploadDir;
		this.state = HTTPFormState.INITIALIZED;
		this.part = null;
		this.header = null;
		this.payloadStartIndex = -1;
		this.payloadEndIndex = -1;
		this.boundaryIndex = -1;
		// An user can choose to either listen for events or 
		// to supply a callback when the form is parsed.
		// If a callback is supplied, we will not throw any events.
		this.parseCallback = null;
		// When a callback is supplied to our parse(...) method,
		// we gather all our form fields and files into two
		// Maps. One specifically for fields and their string values and
		// another for files.
		this.formFields = new Map();
		this.formField = null;
		this.formFieldDecoder = null;
		this.formFiles = new Map();
		this.formFile = null;
		this.formFileWriteStream = null;
		this.hasFieldListener = false;
		this.hasFileListener = false;
		super.on('newListener', (event, listener) => {
			if(event === 'field') {
				self.hasFieldListener = true;
			} else if(event === 'file') {
				self.hasFileListener = true;
			}
		});
	}

	_write(buffer, encoding, cb) {
		let bufferLength = buffer.length;
		for(let i=0;i < bufferLength;i++) {
			let byte = buffer[i];
			switch(this.state) {
				case HTTPFormState.INITIALIZED:
					// We skip the first carriage return and linefeed
					this.boundaryIndex = 1;
					this.state = HTTPFormState.PARSE_BOUNDARY;
				case HTTPFormState.PARSE_BOUNDARY:
					this.boundaryIndex++;
					if(this.boundaryIndex === this.boundaryLength - 1) {
						this.state = HTTPFormState.PARSE_BOUNDARY_CARRIAGE_RETURN;
					} else if(this.boundary[this.boundaryIndex] != byte) {
						this.state = HTTPFormState.DRAIN;
					}
					break;
				case HTTPFormState.PARSE_BOUNDARY_CARRIAGE_RETURN:
					if(byte === CARRIAGE_RETURN) {
						this.state = HTTPFormState.PARSE_BOUNDARY_LINE_FEED;
					} else if(byte === HYPHEN) {
						this.state = HTTPFormState.PARSE_BOUNDARY_HYPHEN;
					} else {
						// console.log('expected a carriage return!');
						this.state = HTTPFormState.DRAIN;
					}
					break;
				case HTTPFormState.PARSE_BOUNDARY_HYPHEN:
					if(byte === HYPHEN) {
						this.state = HTTPFormState.PARSE_END;
					} else {
						// console.log('expected an hyphen');
						this.state = HTTPFormState.DRAIN;
					}
					break;
				case HTTPFormState.PARSE_BOUNDARY_LINE_FEED:
					if(byte === LINE_FEED) {
						this.part = {};
						// console.log('------ BOUNDARY ------');
						this.state = HTTPFormState.PARSE_HEADERS;
					} else {
						// console.log('expected a line feed!');
						this.state = HTTPFormState.DRAIN;
					}
					break;
				case HTTPFormState.PARSE_HEADERS:
					this.part.headers = new Map();
					// By default the content type is 'text/plain', unless explicitly specified
					// as a header.
					let contentTypeHeader = {
						name: 'content-type',
						value: 'text/plain'
					}
					this.part.headers.set(contentTypeHeader.name, contentTypeHeader);
					this.state = HTTPFormState.PARSE_HEADER;
				case HTTPFormState.PARSE_HEADER:
					if(byte === CARRIAGE_RETURN) {
						this.state = HTTPFormState.PARSE_HEADERS_LINE_FEED;
					} else {
						this.header = {};
						this.header.buffer = Buffer.alloc(HEADER_BUFFER_SIZE);
						this.header.bufferIndex = 0;
						this.header.buffer[this.header.bufferIndex++] = byte;
						this.state = HTTPFormState.PARSE_HEADER_NAME;
					}
					break;
				case HTTPFormState.PARSE_HEADER_NAME:
					if(byte === CARRIAGE_RETURN) {
						this.state = HTTPFormState.PARSE_HEADER_LINE_FEED;
					} else if(byte === COLON) {
						this.header.colonIndex = this.header.bufferIndex;
						this.header.buffer[this.header.bufferIndex++] = byte;
						this.state = HTTPFormState.PARSE_HEADER_VALUE;
					} else {
						this.header.buffer[this.header.bufferIndex++] = byte;
					}
					break;
				case HTTPFormState.PARSE_HEADER_VALUE:
					if(byte === CARRIAGE_RETURN) {
						this.state = HTTPFormState.PARSE_HEADER_LINE_FEED;
					} else {
						this.header.buffer[this.header.bufferIndex++] = byte;
					}
					break;
				case HTTPFormState.PARSE_HEADER_LINE_FEED:
					if(byte === LINE_FEED) {
						this.header.name = this.header.buffer.toString('utf-8', 0, this.header.colonIndex).trim().toLowerCase();
						this.header.value = this.header.buffer.toString('utf-8', this.header.colonIndex + 1).trim();
						this.part.headers.set(this.header.name, this.header);
						if(this.header.name === 'content-disposition') {
							let name = this.header.value.match(/[;\s]name=['"](.*?)['"]/);
							name = name[1];
							let fileName = this.header.value.match(/filename=['"](.*?)['"]/);
							if(fileName === undefined || fileName === null) {
								this.part.fileName = null;
								this._startField(name);
							} else {
								this.part.fileName = fileName[1];
								this._startFile(name, this.part.fileName);
							}
						}
						this.state = HTTPFormState.PARSE_HEADER;
					} else {
						this.state = HTTPFormState.DRAIN;
					}
					break;
				case HTTPFormState.PARSE_HEADERS_LINE_FEED:
					if(byte === LINE_FEED) {
						this.payloadStartIndex = i + 1;
						this.state = HTTPFormState.PARSE_PAYLOAD;
					} else {
						// console.log('end of headers expected a line feed!');
						this.state = HTTPFormState.DRAIN;
					}
					break;
				case HTTPFormState.PARSE_PAYLOAD:
					if(byte === this.boundary[0]) {
						this.payloadEndIndex = i;
						this.boundaryIndex = 0;
						this.state = HTTPFormState.PARSE_POTENTIAL_BOUNDARY;
					}
					break;
				case HTTPFormState.PARSE_POTENTIAL_BOUNDARY:
					this.boundaryIndex++;
					if(this.boundaryIndex === this.boundaryLength - 1) {
						let payload = buffer.slice(this.payloadStartIndex, this.payloadEndIndex);
						if(this.part.fileName != null) {
							this._endFile(payload);
						} else {
							this._endField(payload);
						}
						this.state = HTTPFormState.PARSE_BOUNDARY_CARRIAGE_RETURN;
					} else if(this.boundary[this.boundaryIndex] != byte) {
						i--;
						this.state = HTTPFormState.PARSE_PAYLOAD;
					}
					break;
				case HTTPFormState.PARSE_END:
					break;
				case HTTPFormState.DRAIN:
					break;
			}
		}
		if(this.state === HTTPFormState.PARSE_PAYLOAD) {
			this.payloadEndIndex = buffer.length;
			let payload = buffer.slice(this.payloadStartIndex,this.payloadEndIndex);
			this.payloadStartIndex = 0;
			if(this.part.fileName != null) {
				this._handleFilePayload(payload);
			} else {
				this._handleFieldPayload(payload);
			}
		}
		cb();
	}

	_startFile(name, fileName) {
		if(this.parseCallback != null || this.hasFileListener) {
			this.formFile = {};
			this.formFile.numberOfBytes = 0;
			this.formFile.name = name;
			this.formFile.fileName = fileName;
  			let fileExtension = path.extname(fileName);
			this.formFile.fileExtension = fileExtension;
			let baseDir = this.uploadDir;
  			let tmpFileName = uuid.new() + fileExtension;
  			let tmpFilePath = path.join(this.uploadDir, tmpFileName);
			this.formFile.filePath = tmpFilePath;
			this.formFileWriteStream = fs.createWriteStream(tmpFilePath, {flags: 'wx'});
		}
	}

	_handleFilePayload(payload) {
		if(this.parseCallback != null || this.hasFileListener) {
			this.formFile.numberOfBytes += payload.length;
			this.formFileWriteStream.write(payload);
		} else {
			this.emit('part', payload);
		}
	}

	_endFile(payload) {
		let self = this;
		if(this.parseCallback != null) {
			this.formFile.numberOfBytes += payload.length;
			this.formFileWriteStream.end(payload);
			let formFileArray = this.formFiles.get(this.formFile.name);
			if(formFileArray === undefined || formFileArray === null) {
				formFileArray = [];
				this.formFiles.set(this.formFile.name, formFileArray);
			}
			formFileArray.push(this.formFile.fileName);
		} else if(this.hasFileListener) {
			this.formFile.numberOfBytes += payload.length;
			this.formFileWriteStream.end(payload);
			this.emit('file', this.formFile.name, this.formFile.fileName, this.formFile.fileExtension, this.formFile.filePath, this.formFile.numberOfBytes);
		} else {
			this.emit('part', payload);
		}
	}

	_startField(name) {
		if(this.parseCallback != null || this.hasFieldListener) {
			this.formField = {};
			this.formField.name = name;
			this.formField.value = '';
			this.formFieldDecoder = new StringDecoder(this.encoding);
		}
	}

	_handleFieldPayload(payload) {
		if(this.parseCallback != null || this.hasFieldListener) {
			this.formField.value += this.formFieldDecoder.write(payload);
		} else {
			this.emit('part', payload);
		}
	}

	_endField(payload) {
		if(this.parseCallback != null) {
			this.formField.value += this.formFieldDecoder.write(payload);
			let formFieldArray = this.formFields.get(this.formField.name);
			if(formFieldArray === undefined || formFieldArray === null) {
				formFieldArray = [];
				this.formFields.set(this.formField.name, formFieldArray);
			}
			formFieldArray.push(this.formField.value);
		} else if(this.hasFieldListener) {
			this.formField.value += this.formFieldDecoder.write(payload);
			this.emit('field', this.formField.name, this.formField.value);
		}
	}

	_final(callback) {
		if(this.parseCallback != null) {
			this.parseCallback(null, this.formFields, this.formFiles);
		} else {
			this.emit('close');
		}
		callback();
	}

	parse(httpRequest, callback) {
		if(callback != undefined && callback != null) {
			this.parseCallback = callback;
		}
		let contentType = httpRequest.request.headers['content-type'];
		if(!contentType.startsWith('multipart/form-data')) {
			return;
		}
		let indexOfBoundary = contentType.indexOf('boundary=');
		this.boundaryString = contentType.substring(indexOfBoundary + 9);
		// Each boundary is prefixed with two hyphens.
		// We simply make those -- part of the boundary.
		this.boundary = Buffer.alloc(this.boundaryString.length + 4);
		this.boundary.write('\r\n--', 0, this.boundaryString.length + 4, 'ascii');
		this.boundary.write(this.boundaryString, 4, this.boundaryString.length, 'ascii');
		this.boundaryLength = this.boundary.length;
		// Now that we have our boundary defined we are ready to
		// pipe the rest of the data through.
		httpRequest.request.pipe(this);
	}
}
// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
    util.Help.print(HTTPForm);
    return;
}
module.exports = HTTPForm;