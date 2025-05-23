const HTMLElement = require('./HTMLElement');

class Javascript extends HTMLElement {
    constructor(_code) {
        super();
        this.code = '';
        if(_code != undefined && _code != null) {
            this.code = _code;
        }
    }
    
    getCode() {
        return this.code;
    }
    /**
     * @override
     */
    toString() {
        return this.code;
    }
}

module.exports = Javascript;