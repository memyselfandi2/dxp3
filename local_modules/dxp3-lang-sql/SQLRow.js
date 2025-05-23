const SQLError = require('./SQLError');

class SQLRow {
	constructor() {
	}

	equals(_sqlRow) {
    	throw SQLError.NOT_IMPLEMENTED;
	}

	getValue(_column) {
    	throw SQLError.NOT_IMPLEMENTED;
	}
}

module.exports = SQLRow;