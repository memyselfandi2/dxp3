/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-lang-csv
 *
 * NAME
 * CSVParser
 */
const packageName = 'dxp3-lang-csv';
const moduleName = 'CSVParser';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * @module dxp3-lang-csv/CSVParser
 */
const CSVDocument = require('./CSVDocument');
const CSVParserOptions = require('./CSVParserOptions');
const CSVParserState = require('./CSVParserState');
const CSVRow = require('./CSVRow');
const fs = require('fs');
const logging = require('dxp3-logging');
const stream = require('stream');
const util = require('dxp3-util');

const [newline] = Buffer.from('\n');
const [carriageReturn] = Buffer.from('\r');
const [doubleQuote] = Buffer.from('"');

class CSVParser extends stream.Transform {

	constructor (_options) {
		_options = CSVParserOptions.parse(_options);
		let transformOptions = {
			objectMode: true,
			highWaterMark: _options.highWaterMark
		}
		super(transformOptions);
		this._options = _options;
		this._options.encoding = 'utf8';
		if(this._options.hasComments) {
			this._options.commentsPrefix = Buffer.from(this._options.commentsPrefix)[0];
		}
		this._options.delimiter = Buffer.from(this._options.delimiter)[0];
		this._options.startAtLine--;
		this._buffer = null;
		this._bufferLength = -1;
		this._bufferIndex = -1;
		this._fieldStartIndex = -1;
		this._numberOfLines = 0;
		this._numberOfEmptyLines = 0;
		this._numberOfComments = 0;
		this._numberOfRows = 0;
		this._numberOfEmptyRows = 0;
		this._numberOfSkippedRows = 0;
		this._character = null;
		this._headers = [];
		this._values = [];
		this._header = '';
		this._state = CSVParserState.INITIALIZED;

		// console.log('carriageReturn        : ' + carriageReturn);
		// console.log('newline               : ' + newline);
		// console.log('options.hasComments   : ' + this._options.hasComments);
		// console.log('options.commentsPrefix: ' + this._options.commentsPrefix);
		// console.log('options.skipEmptyRows : ' + this._options.skipEmptyRows);
	}

	_flush(_callback) {
		switch(this._state) {
			case CSVParserState.PARSING_ROW_VALUES:
				let value = this._buffer.toString(this._options.encoding, this._fieldStartIndex, this._buffer.length);
				this._values.push(value);
				this.emit('data', this._values);
				this._numberOfLines++;
				this._numberOfRows++;
				break;
			case CSVParserState.PARSING_HEADERS_COMMENTS:
			case CSVParserState.PARSING_ROW_COMMENTS:
				this._numberOfLines++;
				this._numberOfComments++;
		}
		_callback();
	}

	_transform(_chunk, _encoding, _callback) {
		// Make sure the supplied data is
		// always a buffer.
		if (typeof _chunk === 'string') {
			_chunk = Buffer.from(_chunk);
		}
		// There may be some left over data from the previous
		// call. That was stored in a private buffer.
		// Lets concatenate it with the new data/chunk.
		if(this._buffer === null) {
			this._buffer = _chunk;
			this._bufferIndex = 0;
			this._fieldStartIndex = 0;
		} else {
			this._bufferIndex = this._buffer.length;
			this._buffer = Buffer.concat([this._buffer, _chunk]);
		}
		this._bufferLength = this._buffer.length;
		let hasMoreToParse = true;
		while(hasMoreToParse) {
			switch(this._state) {
				case CSVParserState.INITIALIZED:
					if(this._options.hasHeaders) {
						this._state = CSVParserState.PARSING_HEADERS;
					} else if(this._options.startAtLine > 1) {
						this._state = CSVParserState.SKIPPING_ROWS;
					} else {
						this._state = CSVParserState.PARSING_ROW;
					}
					break;
				case CSVParserState.PARSING_HEADERS:
					hasMoreToParse = this._parsingHeaders();
					break;
				case CSVParserState.PARSING_HEADERS_COMMENTS:
					hasMoreToParse = this._parsingHeadersComments();
					break;
				case CSVParserState.PARSING_HEADERS_ROW:
					hasMoreToParse = this._parsingHeadersRow();
					break;
				case CSVParserState.SKIPPING_ROWS:
					hasMoreToParse = this._skippingRows();
					break;
				case CSVParserState.SKIPPING_ROW:
					hasMoreToParse = this._skippingRow();
					break;
				case CSVParserState.PARSING_ROW:
					hasMoreToParse = this._parsingRow();
					break;
				case CSVParserState.PARSING_ROW_COMMENTS:
					hasMoreToParse = this._parsingRowComments();
					break;
				case CSVParserState.PARSING_ROW_VALUES:
					hasMoreToParse = this._parsingRowValues();
					break;
			}
		}
		_callback();
	}

	_parsingHeaders() {
		// console.log('_parsingHeaders() @ ' + this._bufferIndex);
		// We need to skip any empty rows and comments
		// before we reach the actual headers.
		for (; this._bufferIndex < this._bufferLength; this._bufferIndex++) {
			this._character = this._buffer[this._bufferIndex];
			if(this._character === carriageReturn) {
				// console.log('skip header carriage return')
				continue;
			}
			if(this._character === newline) {
				this._numberOfLines++;
				this._numberOfEmptyLines++;
				// console.log('_parsingHeaders() number of lines: ' + this._numberOfLines);
				// console.log('_parsingHeaders() number of empty lines: ' + this._numberOfEmptyLines);
				continue;
			}
			if(this._options.hasComments) {
				if(this._character === this._options.commentsPrefix) {
					// console.log('_parsingHeaders() comment @ ' + this._bufferIndex);
					this._bufferIndex++;
					this._state = CSVParserState.PARSING_HEADERS_COMMENTS;
					return true;
				}
			}
			// console.log('character: ' + this._character + ' and newline : ' + newline);
			this._fieldStartIndex = this._bufferIndex;
			this._state = CSVParserState.PARSING_HEADERS_ROW;
			return true;
		}
		this._buffer = null;
		return false;
	}

	_parsingHeadersComments() {
		// console.log('_parsingHeadersComments() @ ' + this._bufferIndex);
		// We keep reading until the next newline
		for (; this._bufferIndex < this._bufferLength; this._bufferIndex++) {
			this._character = this._buffer[this._bufferIndex];
			if(this._character === newline) {
				this._numberOfLines++;
				this._numberOfComments++;
				this._bufferIndex++;
				this._state = CSVParserState.PARSING_HEADERS;
				return true;
			}
		}
		this._buffer = null;
		return false;
	}

	_parsingHeadersRow() {
		// console.log('_parsingHeadersRow() @ ' + this._bufferIndex);
		let header = null;
		for (; this._bufferIndex < this._bufferLength; this._bufferIndex++) {
			this._character = this._buffer[this._bufferIndex];
			if(this._character === newline) {
				this._numberOfLines++;
				header = this._buffer.toString(this._options.encoding, this._fieldStartIndex, this._bufferIndex);
				this._headers.push(header);
				this.emit('headers', this._headers);
				if(this._options.startAtLine > this._numberOfLines) {
					this._bufferIndex++;
					this._state = CSVParserState.SKIPPING_ROWS;
				} else {
					this._bufferIndex++;
					this._state = CSVParserState.PARSING_ROW;
				}
				return true;
			}
			if(this._character === doubleQuote) {
				if(this._state === CSVParserState.PARSING_ESCAPED) {

				} else {
					this._state = CSVParserState.PARSING_ESCAPED;
				}
			}
			if(this._character === this._options.delimiter) {
				header = this._buffer.toString(this._options.encoding, this._fieldStartIndex, this._bufferIndex);
				this._headers.push(header);
				this._fieldStartIndex = this._bufferIndex + 1;
			}
		}
		this._buffer = this._buffer.slice(this._fieldStartIndex);
		this._fieldStartIndex = 0;
		return false;
	}

	_skippingRows() {
		// console.log('skipping rows @ ' + this._bufferIndex);
		for(; this._bufferIndex < this._bufferLength; this._bufferIndex++) {
			this._character = this._buffer[this._bufferIndex];
			if(this._character === carriageReturn) {
				// console.log('parsing row carriage return.');
				continue;
			}
			if(this._character === newline) {
				this._numberOfLines++;
				this._numberOfEmptyLines++;
				// console.log('skipping rows number of empty lines: ' + this._numberOfEmptyLines);
				this._numberOfSkippedRows++;
				if(this._numberOfLines >= this._options.startAtLine) {
					this._bufferIndex++;
					this._state = CSVParserState.PARSING_ROW;
					return true;
				}
				continue;
			}
			this._bufferIndex++;
			this._state = CSVParserState.SKIPPING_ROW;
			return true;
		}
		this._buffer = null;
		return false;
	}

	_skippingRow() {
		// console.log('skipping row @ ' + this._bufferIndex);
		for(; this._bufferIndex < this._bufferLength; this._bufferIndex++) {
			this._character = this._buffer[this._bufferIndex];
			if(this._character === newline) {
				this._numberOfLines++;
				this._numberOfSkippedRows++;
				if(this._numberOfLines >= this._options.startAtLine) {
					this._bufferIndex++;
					this._state = CSVParserState.PARSING_ROW;
					return true;
				}
				this._bufferIndex++;
				this._state = CSVParserState.SKIPPING_ROWS;
				return true;
			}
		}
		this._buffer = null;
		return false;
	}

	_parsingRow() {
		// console.log('_parsingRow() @ ' + this._bufferIndex);
		for(; this._bufferIndex < this._bufferLength; this._bufferIndex++) {
			this._character = this._buffer[this._bufferIndex];
			if(this._character === carriageReturn) {
				// console.log('_parsingRow() carriage return @ ' + this._bufferIndex);
				continue;
			}
			if(this._character === newline) {
				// console.log('_parsingRow() new line @ ' + this._bufferIndex);
				this._numberOfLines++;
				this._numberOfEmptyLines++;
				this._numberOfEmptyRows++;
				if(this._options.skipEmptyRows) {
					// console.log('_parsingRow() skip empty row @ ' + this._bufferIndex);
					this._numberOfSkippedRows++;
					continue;
				}
				this._numberOfRows++;
				this._values = [];
				this._values.push('');
				this.emit('data', this._values);
				// console.log('_parsingRow(): number of rows: ' + this._numberOfRows);
				this._bufferIndex++;
				return true;
			}
			if(this._options.hasComments) {
				if(this._character === this._options.commentsPrefix) {
					// console.log('_parsingRow() comments prefix @ ' + this._bufferIndex);
					this._bufferIndex++;
					this._state = CSVParserState.PARSING_ROW_COMMENTS;
					return true;
				}
			}
			this._values = [];
			this._fieldStartIndex = this._bufferIndex;
			this._state = CSVParserState.PARSING_ROW_VALUES;
			return true;
		}
		this._buffer = null;
		return false;
	}

	_parsingRowComments() {
		// console.log('_parsingRowComment() @ ' + this._bufferIndex);
		// We keep reading until the next newline
		for (; this._bufferIndex < this._bufferLength; this._bufferIndex++) {
			this._character = this._buffer[this._bufferIndex];
			if(this._character === newline) {
				this._numberOfLines++;
				this._numberOfComments++;
				this._bufferIndex++;
				this._state = CSVParserState.PARSING_ROW;
				return true;
			}
		}
		this._buffer = null;
		return false;
	}

	_parsingRowValues() {
		// console.log('parsing row values @ ' + this._bufferIndex);
		let value = null;
		for (; this._bufferIndex < this._bufferLength; this._bufferIndex++) {
			this._character = this._buffer[this._bufferIndex];
			if(this._character === newline) {
				this._numberOfLines++;
				this._numberOfRows++;
				value = this._buffer.toString(this._options.encoding, this._fieldStartIndex, this._bufferIndex - 1);
				if(this._options.trimWhitespace) {
					value = value.trim();
				}
				this._values.push(value);
				this.emit('data', this._values);
				// console.log('_parsingRowValues(): number of rows: ' + this._numberOfRows);
				this._bufferIndex++;
				this._state = CSVParserState.PARSING_ROW;
				return true;
			}
			if(this._character === this._options.delimiter) {
				value = this._buffer.toString(this._options.encoding, this._fieldStartIndex, this._bufferIndex);
				if(this._options.trimWhitespace) {
					value = value.trim();
				}
				this._values.push(value);
				this._fieldStartIndex = this._bufferIndex + 1;
			}
		}
		this._buffer = this._buffer.slice(this._fieldStartIndex);
		this._fieldStartIndex = 0;
		return false;
	}

	_parsingRowDoubleQuotedValue() {

	}

	static main() {
		try {
	        let csvParserOptions = CSVParserOptions.parseCommandLine();
	        logging.setLevel(csvParserOptions.logLevel);
	        if(csvParserOptions.help) {
	        	util.Help.print(CSVParser);
	        	return;
	        }
            let csvFileName = csvParserOptions.fileName;
            if(csvFileName === undefined || csvFileName === null) {
            	console.log('Please provide a file name.');
            	return;
            }
			let csvParser = new CSVParser(csvParserOptions);
			let fileReadStream = fs.createReadStream(csvFileName);
			let lineCount = 0;
			csvParser.on('headers', (_headers) => {
				console.log('headers: ' + _headers);
			});
			csvParser.on('data', (_values) => {
				lineCount++;
				console.log('' + lineCount + ': ' + _values);
			});
			csvParser.on('end', () => {
			    console.log('number of lines       : ' + csvParser._numberOfLines);
			    console.log('number of empty lines : ' + csvParser._numberOfEmptyLines);
			    console.log('number of comments    : ' + csvParser._numberOfComments);
			    console.log('number of skipped rows: ' + csvParser._numberOfSkippedRows);
			    console.log('number of empty rows  : ' + csvParser._numberOfEmptyRows);
			    console.log('number of valid rows  : ' + csvParser._numberOfRows);
			});
			fileReadStream.pipe(csvParser);
		} catch(_exception) {
			console.log(_exception.message);
			process.exit(99);
		}
	}
}
// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
	CSVParser.main();
	return;
}
module.exports = CSVParser;