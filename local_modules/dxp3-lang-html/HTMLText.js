const HTMLElement = require('./HTMLElement');
/**
 * @class
 */
class HTMLText extends HTMLElement {
	/**
	 * @constructor
	 */
    constructor(_value) {
        super();
    	this.value = '';
    	if(_value != undefined && _value != null) {
    		this.value = _value;
    	}
    }

    getText() {
        return this.value;
    }

    get text() {
        return this.getText();
    }
    /**
     * @override
     */
    toString() {
        return this.value;
    }
}

module.exports = HTMLText;