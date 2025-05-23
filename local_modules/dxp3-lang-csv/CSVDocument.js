const CSVRow = require('./CSVRow');

class CSVDocument {

	constructor() {
		this._headers = [];
		this._csvRows = [];
	}

	setHeaders(_headers) {
		this._headers = [];
		if(_headers === undefined || _headers === null) {
			return;
		}
		for(let i=0;i < _headers.length;i++) {
			this.addHeader(_headers[i]);
		}
	}

	addHeader(_header) {
		this._headers.push(_header);
	}

	addCSVRow(_csvRow) {
		if(Array.isArray(_csvRow)) {
			_csvRow = CSVRow.from(_csvRow);
		}
		this._csvRows.push(_csvRow);
	}

	addRow(_csvRow) {
		this.addCSVRow(_csvRow);
	}

	toString() {
		let result = '';
		if(this._headers.length > 0) {
			for(let i=0;i < this._headers.length - 1;i++) {
				result += this._headers[i] + ',';
			}
			result += this._headers[this._headers.length - 1] + '\n';
		}
		for(let i=0;i < this._csvRows.length;i++) {
			result += this._csvRows[i].toString() + '\n';
		}
		return result;		
	}
}

module.exports = CSVDocument;