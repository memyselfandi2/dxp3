class CSVRow {

	constructor() {
		this._array = [];
	}

	get(_header) {

	}

	set(_header, _value) {

	}

	addValue(_value) {
		this._array.push(_value);
	}

	toString() {
		let result = '';
		if(this._array.length > 0) {
			for(let i=0;i < this._array.length - 1;i++) {
				result += this._array[i] + ',';
			}
			result += this._array[this._array.length - 1];
		}
		return result;
	}

	static from(_array) {
		let result = new CSVRow();
		for(let i=0;i < _array.length;i++) {
			result.addValue(_array[i]);
		}
		return result;
	}
}

module.exports = CSVRow;