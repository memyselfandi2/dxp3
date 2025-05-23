const SQLResult = require('./SQLResult');

class SQLDescResult extends SQLResult {
    constructor(_result) {
        this._result = _result;
    }

    getResult() {
        return this._result;
    }

    toString() {
        return this._result;
    }
}