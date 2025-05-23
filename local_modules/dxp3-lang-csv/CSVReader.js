/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-lang-csv
 *
 * NAME
 * CSVReader
 */
const packageName = 'dxp3-lang-csv';
const moduleName = 'CSVReader';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * @module dxp3-lang-html/CSVReader
 */
const CSVDocument = require('./CSVDocument');
const CSVError = require('./CSVError');
const CSVReaderOptions = require('./CSVReaderOptions');
const CSVReaderState = require('./CSVReaderState');
const fs = require('fs'); 
const fsPromises = fs.promises;
const fsConstants = fs.constants;
const logging = require('dxp3-logging');
const util = require('dxp3-util');

const logger = logging.getLogger(canonicalName);

class CSVReader {
    /*********************************************
     * CONSTRUCTOR
     ********************************************/

	constructor(_options) {
        this._options = CSVReaderOptions.parse(_options);
        logger.info('Delimiter      : ' + this._options.delimiter);
        logger.info('Skip empty rows: ' + this._options.skipEmptyRows);
        logger.info('Trim columns   : ' + this._options.trimColumns);
	}

    async read(_csv) {
        this.parse(_csv);
    }

    _read() {
        this.index++;
        if(this.index >= this.length) {
            return null;
        }
        return this.csv.charAt(this.index);
    }

    _reset() {
        this.index = -1;
        this.length = 0;
        this.csv = '';
        this.marker = -1;
        this.setState(CSVReaderState.INITIALIZED);
    }

    async load(_csv) {
        this.parse(_csv);
    }

	async parse(_csv) {
        this._reset();
        this.csv = _csv;
        this.length = this.csv.length;

        let csvDocument = new CSVDocument();
        let csvRow = await this._nextCSVRow();
        while(csvRow != null) {
            console.log('ROW: ' + csvRow);
            csvDocument.addCSVRow(csvRow);
            csvRow = await this._nextCSVRow();
        }
        return csvDocument;
	}

    async _nextCSVRow() {
        let result = [];
        let columnValue = null;
        let numberOfColumns = 0;
        // As we attempt to read a csv row, we set our state accordingly.
        // We start by parsing a column.
        this.setState(CSVReaderState.PARSING_COLUMN);
        // Keep reading until:
        // - we read a non-double quoted column ended with a new line, or
        // - we read a double quoted column ended with a new line, or
        // - we reach the end of the file.
        while (this._state != CSVReaderState.PARSING_ROW_DONE) {
            switch (this._state) {
                case CSVReaderState.PARSING_COLUMN:
                    // Read until:
                    // - we encounter a delimiter (default a comma), or
                    // - we read a new line, or
                    // - we encounter a " (double quote), or
                    // - we reach the end of the file
                    if(this._options.trimColumns) {
                        columnValue = this._parseTrimmedString();
                    } else {
                        columnValue = this._parseString();
                    }
                    break;
                case CSVReaderState.PARSING_DOUBLE_QUOTED_COLUMN:
                    // Read until:
                    // - we encounter a delimiter (default a comma), or
                    // - we read a new line, or
                    // - we reach the end of the file
                    if(this._options.trimColumns) {
                        columnValue = this._parseTrimmedDoubleQuotedString();
                    } else {
                        columnValue = this._parseDoubleQuotedString();
                    }
                    break;
                case CSVReaderState.PARSING_DELIMITER:
                    // We just finished reading a column and we
                    // encountered a delimiter.
                    // Add the read column to our result,
                    // increase our column counter and
                    // start reading the next column
                    result.push(columnValue);
                    numberOfColumns++;
                    this.setState(CSVReaderState.PARSING_COLUMN);
                    break;
                case CSVReaderState.PARSING_NEW_LINE:
                    // We just finished reading a column and we
                    // encountered a new line (LF or CRLF)
                    // Check if we are skipping empty rows.
                    // If we are skipping empty rows and the column
                    // we read was an empty string and the current row
                    // is empty, we start reading the first column of
                    // the next row.
                    // Otherwise add the read column to our result set,
                    // increase our column counter and
                    // indicate we have finished reading the current row.
                    if(this._options.skipEmptyRows &&
                       (numberOfColumns <= 0) &&
                       (columnValue.length <= 0)) {
                        this.setState(CSVReaderState.PARSING_COLUMN);
                    } else {
                        result.push(columnValue);
                        numberOfColumns++;
                        this.setState(CSVReaderState.PARSING_ROW_DONE);
                    }
                    break;
                case CSVReaderState.PARSING_END_OF_FILE:
                    // We just finished reading a column and we
                    // encountered the end of the file.
                    // If the column has a value, we enter it to our
                    // result set. After which we indicate we
                    // are finished reading this row.
                    // If we haven't yet read any columns we return null
                    // to indicate the end of file
                    if(columnValue.length > 0) {
                        result.push(columnValue);
                        numberOfColumns++;
                        this.setState(CSVReaderState.PARSING_ROW_DONE);
                    } else if(numberOfColumns <= 0) {
                        return null;
                    }
                    break;
                default:
                    break;
            }
        }
        return result;
    }

    _parseTrimmedString() {
        let textState = CSVReaderState.PARSING_WHITESPACE;
        let text = '';
        let whitespaceText = '';
        let character = null;
        // Read until:
        // - we encounter a delimiter (default a comma), or
        // - we read a new line, or
        // - we encounter a " (double quote), or
        // - we reach the end of the file
        while ((character = this._read()) != null) {
            switch (textState) {
                case CSVReaderState.PARSING_WHITESPACE:
                    switch (character) {
                        case ' ':
                        case '\t':
                        case '\r':
                            // We ignore whitespace
                            break;
                        case '\n':
                            // This indicates an end of line
                            // Return empty string
                            this.setState(CSVReaderState.PARSING_NEW_LINE);
                            return text;
                        case '"':
                            // This means we encountered a double quoted
                            // column value. Return empty string
                            this.setState(CSVReaderState.PARSING_DOUBLE_QUOTED_COLUMN);
                            return text;
                        default:
                            if(character === this._options.delimiter) {
                                this.setState(CSVReaderState.PARSING_DELIMITER);
                                // Return trimmed empty string
                                return text;
                            }
                            text += character;
                            textState = CSVReaderState.PARSING_CHARACTER;
                            break;
                    }
                    break;
                case CSVReaderState.PARSING_CHARACTER:
                    switch (character) {
                        case ' ':
                        case '\t':
                            whitespaceText += character;
                            textState = CSVReaderState.PARSING_CHARACTER_WHITESPACE;
                            break;
                        case '\r':
                            textState = CSVReaderState.PARSING_CR;
                            break;
                        case '\n':
                            // If this is the case we have reached the end
                            // of the csv row
                            this.setState(CSVReaderState.PARSING_NEW_LINE);
                            return text;
                        case '"':
                            // This really is an error, but we'll try to be forgiving.
                            // We'll keep reading until the next delimiter or \n
                            text += character;
                            break;
                        default:
                            if(character == this._options.delimiter) {
                                this.setState(CSVReaderState.PARSING_DELIMITER);
                                // Return the string read sofar
                                return text;
                            }
                            text += character;
                            break;
                    }
                    break;
                case CSVReaderState.PARSING_CR:
                    switch(character) {
                        case ' ':
                        case '\t':
                        case '\r':
                            whitespaceText += '\r';
                            whitespaceText += character;
                            textState = CSVReaderState.PARSING_CHARACTER_WHITESPACE;
                            break;
                        case '\n':
                            // If this is the case we have reached the end
                            // of the csv row
                            this.setState(CSVReaderState.PARSING_NEW_LINE);
                            return text;
                        default:
                            if(character == this._options.delimiter) {
                                this.setState(CSVReaderState.PARSING_DELIMITER);
                                // Return the string read sofar
                                return text;
                            }
                            whitespaceText += '\r';
                            text += whitespaceText;
                            text += character;
                            whitespaceText = "";
                            textState = CSVReaderState.PARSING_CHARACTER;
                            break;
                    }
                    break;
                case CSVReaderState.PARSING_CHARACTER_WHITESPACE:
                    switch(character) {
                        case ' ':
                        case '\t':
                            whitespaceText += character;
                            break;
                        case '\r':
                            textState = CSVReaderState.PARSING_CR;
                            break;
                        case '\n':
                            // If this is the case we have reached the end
                            // of the csv row
                            this.setState(CSVReaderState.PARSING_NEW_LINE);
                            return text;
                        default:
                            if(character == this._options.delimiter) {
                                this.setState(CSVReaderState.PARSING_DELIMITER);
                                // Return the string read sofar
                                return text;
                            }
                            text += whitespaceText;
                            text += character;
                            whitespaceText = "";
                            textState = CSVReaderState.PARSING_CHARACTER;
                            break;
                    }
                    break;
                default:
                    return null;
            }
        }
        this.setState(CSVReaderState.PARSING_END_OF_FILE);
        return text;
    }

    _parseString() {
        let textState = CSVReaderState.PARSING_WHITESPACE;
        let text = '';
        let character = null;
        // Read until:
        // - we encounter a delimiter (default a comma), or
        // - we read a new line, or
        // - we encounter a " (double quote), or
        // - we reach the end of the file
        while ((character = this._read()) != null) {
            switch (textState) {
                case CSVReaderState.PARSING_WHITESPACE:
                    switch (character) {
                        case ' ':
                        case '\t':
                            // Space or tab are added to our read string
                            text += character;
                            break;
                        case '\r':
                            // Carriage return is a special case, as
                            // it may indicate an end of line if it is
                            // followed by a line feed.
                            textState = CSVReaderState.PARSING_CR;
                            break;
                        case '\n':
                            // This indicates an end of line
                            // Return whitespace string
                            this.setState(CSVReaderState.PARSING_NEW_LINE);
                            return text;
                        case '"':
                            // This means we encountered a double quoted
                            // column value. Return whitespace string
                            this.setState(CSVReaderState.PARSING_DOUBLE_QUOTED_COLUMN);
                            return text;
                        default:
                            if(character == this._options.delimiter) {
                                this.setState(CSVReaderState.PARSING_DELIMITER);
                                // Return whitespace string
                                return text;
                            }
                            text += character;
                            textState = CSVReaderState.PARSING_CHARACTER;
                            break;
                    }
                    break;
                case CSVReaderState.PARSING_CR:
                    switch(character) {
                        case '\n':
                            this.setState(CSVReaderState.PARSING_NEW_LINE);
                            return text;
                        case '"':
                            this.setState(CSVReaderState.PARSING_DOUBLE_QUOTED_COLUMN);
                            text += '\r';
                            return text;
                        default:
                            text += '\r';
                            if(character == this._options.delimiter) {
                                this.setState(CSVReaderState.PARSING_DELIMITER);
                                // Return whitespace string
                                return text;
                            }
                            text += character;
                            textState = CSVReaderState.PARSING_CHARACTER;
                            break;
                    }
                    break;
                case CSVReaderState.PARSING_CHARACTER:
                    switch (character) {
                        case '\r':
                            textState = CSVReaderState.PARSING_CR;
                            break;
                        case '\n':
                            // If this is the case we have reached the end
                            // of the csv row
                            this.setState(CSVReaderState.PARSING_NEW_LINE);
                            return text;
                        case '"':
                            // This really is an error, but we'll try to be forgiving.
                            // We'll keep reading until the next delimiter or \n
                            text += character;
                            break;
                        default:
                            if(character == this._options.delimiter) {
                                this.setState(CSVReaderState.PARSING_DELIMITER);
                                // Return the string read sofar
                                return text;
                            }
                            text += character;
                            break;
                    }
                    break;
                default:
                    return null;
            }
        }
        this.setState(CSVReaderState.PARSING_END_OF_FILE);
        return text;
    }

    _parseTrimmedDoubleQuotedString() {
        let textState = CSVReaderState.PARSING_WHITESPACE;
        let text = '';
        let whitespaceText = '';
        let character = null;
        /*
         * Read a character until:
         * - we reach the end of the file or
         * - we encounter a non-escaped double quote,
         */
        while ((character = this._read()) != null) {
            switch (textState) {
                case CSVReaderState.PARSING_WHITESPACE:
                    switch (character) {
                        case ' ':
                        case '\t':
                        case '\r':
                            break;
                        case '"':
                            textState = CSVReaderState.PARSING_DOUBLE_QUOTE;
                            break;
                        default:
                            text += character;
                            textState = CSVReaderState.PARSING_CHARACTER;
                            break;
                    }
                    break;
                case CSVReaderState.PARSING_CHARACTER:
                    switch (character) {
                        case ' ':
                        case '\t':
                        case '\r':
                            whitespaceText += character;
                            textState = CSVReaderState.PARSING_CHARACTER_WHITESPACE;
                            break;
                        case '"':
                            textState = CSVReaderState.PARSING_DOUBLE_QUOTE;
                            break;
                        default:
                            text += character;
                            break;
                    }
                    break;
                case CSVReaderState.PARSING_CHARACTER_WHITESPACE:
                    switch(character) {
                        case ' ':
                        case '\t':
                        case '\r':
                            whitespaceText += character;
                            break;
                        case '"':
                            textState = CSVReaderState.PARSING_DOUBLE_QUOTE;
                            break;
                        default:
                            text += whitespaceText;
                            text += character;
                            whitespaceText = "";
                            textState = CSVReaderState.PARSING_CHARACTER;
                            break;
                    }
                    break;
                case CSVReaderState.PARSING_DOUBLE_QUOTE:
                    switch (character) {
                        case '"':
                            text += whitespaceText;
                            text += '"';
                            whitespaceText = "";
                            textState = CSVReaderState.PARSING_CHARACTER;
                            break;
                        case ' ':
                        case '\t':
                        case '\r':
                            textState = CSVReaderState.PARSING_DOUBLE_QUOTE_WHITESPACE;
                            break;
                        case '\n':
                            this.setState(CSVReaderState.PARSING_NEW_LINE);
                            return text;
                        default:
                            if(character == this._options.delimiter) {
                                this.setState(CSVReaderState.PARSING_DELIMITER);
                                return text;
                            }
                            // This should not happen
                            // We'll treat this as if it is whitespace
                            textState = CSVReaderState.PARSING_DOUBLE_QUOTE_WHITESPACE;
                            break;
                    }
                    break;
                case CSVReaderState.PARSING_DOUBLE_QUOTE_WHITESPACE:
                    switch (character) {
                        case ' ':
                        case '\t':
                        case '\r':
                            break;
                        case '\n':
                            this.setState(CSVReaderState.PARSING_NEW_LINE);
                            return text;
                        default:
                            if(character == this._options.delimiter) {
                                this.setState(CSVReaderState.PARSING_DELIMITER);
                                return text;
                            }
                            // Should not happen.
                            break;
                    }
                    break;
                default:
                    return null;
            }
        }
        this.setState(CSVReaderState.PARSING_END_OF_FILE);
        return text;
    }

    _parseDoubleQuotedString() {
        let textState = CSVReaderState.PARSING_CHARACTER;
        let text = '';
        let character = null;
        /*
         * Read a character until:
         * - we reach the end of the file or
         * - we encounter a non-escaped double quote,
         */
        while ((character = this._read()) != null) {
            switch (textState) {
                case CSVReaderState.PARSING_CHARACTER:
                    switch (character) {
                        case '"':
                            textState = CSVReaderState.PARSING_DOUBLE_QUOTE;
                            break;
                        default:
                            text += character;
                            break;
                    }
                    break;
                case CSVReaderState.PARSING_DOUBLE_QUOTE:
                    switch (character) {
                        case '"':
                            text += '"';
                            textState = CSVReaderState.PARSING_CHARACTER;
                            break;
                        case ' ':
                        case '\t':
                        case '\r':
                            textState = CSVReaderState.PARSING_DOUBLE_QUOTE_WHITESPACE;
                            break;
                        case '\n':
                            this.setState(CSVReaderState.PARSING_NEW_LINE);
                            return text;
                        default:
                            if(character == this._options.delimiter) {
                                this.setState(CSVReaderState.PARSING_DELIMITER);
                                return text;
                            }
                            // Should not happen.
                            // lets treat it as whitespace
                            textState = CSVReaderState.PARSING_DOUBLE_QUOTE_WHITESPACE;
                            break;
                    }
                    break;
                case CSVReaderState.PARSING_DOUBLE_QUOTE_WHITESPACE:
                    switch (character) {
                        case ' ':
                        case '\t':
                        case '\r':
                            break;
                        case '\n':
                            this.setState(CSVReaderState.PARSING_NEW_LINE);
                            return text;
                        default:
                            if(character == this._options.delimiter) {
                                this.setState(CSVReaderState.PARSING_DELIMITER);
                                // Return whitespace string
                                return text;
                            }
                            // Should not happen.
                            break;
                    }
                    break;
                default:
                    return null;
            }
        }
        this.setState(CSVReaderState.PARSING_END_OF_FILE);
        return text;
    }

    async readFile(_fileName) {
        this.parseFile(_fileName);
    }

    async loadFile(_fileName) {
        this.parseFile(_fileName);
    }

    async parseFile(_fileName) {
		logger.trace('parseFile(...): start.');
    	// Defensive programming...check input...
    	if(_fileName === undefined || _fileName === null) {
			// Calling parseFile(...) without any arguments could be
			// a programming error. Lets log a warning.
			logger.warn('parseFile(...): Missing arguments.');
			logger.trace('parseFile(...): end.');
			throw CSVError.ILLEGAL_ARGUMENT;
    	}
    	if(typeof _fileName != 'string') {
			logger.warn('parseFile(...): The supplied filename is not a String.');
			logger.trace('parseFile(...): end.');
			throw CSVError.ILLEGAL_ARGUMENT;
    	}
        let self = this;
		logger.debug('parseFile(...): Filename \'' + _fileName + '\'.');
		try {
	        let csv = await fsPromises.readFile(_fileName, 'UTF-8');
            let csvDocument = await this.parse(csv);
			logger.trace('parseFile(...): end.');
       		return csvDocument;
        } catch(_exception) {
			logger.error('parseFile(...): ' + _exception);
			logger.trace('parseFile(...): end.');
            throw _exception;
        }
    }

    setState(_state) {
        this._state = _state;
    }

	static main() {
    	let processCSVDocument = function(_error, _csvDocument) {
    		if(_error) {
    			console.log('Something went wrong: ' + _error);
    			return;
    		}
    		console.log(_csvDocument.toString());
    	}
		try {
	        let csvReaderOptions = CSVReaderOptions.parseCommandLine();
	        logging.setLevel(csvReaderOptions.logLevel);
	        if(csvReaderOptions.help) {
	        	util.Help.print(CSVReader);
	        	return;
	        }
            let csv = csvReaderOptions.text;
            let csvFileName = csvReaderOptions.fileName;
			let csvReader = new CSVReader(csvReaderOptions);
            if(csv != undefined && csv != null && csv.length > 0) {
                csvReader.load(csv, function(_error, _csvDocument) {
                	processCSVDocument(_error, _csvDocument);
                });
            } else if(csvFileName != undefined && csvFileName != null && csvFileName.length > 0) {
                csvReader.loadFile(csvFileName, function(_error, _csvDocument) {
                	processCSVDocument(_error, _csvDocument);
                });
            }
		} catch(_exception) {
			console.log(_exception.message);
			process.exit(99);
		}
	}
}
// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
   CSVReader.main();
   return;
}
module.exports = CSVReader;