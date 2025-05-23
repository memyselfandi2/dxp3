const HTMLElement = require('./HTMLElement');

class Stylesheet extends HTMLElement {
    constructor(_style) {
        super();
        this.style = '';
        if(_style != undefined && _style != null) {
            this.style = _style;
        }
    }

    setStyle(_style) {
        this.style = _style;
    }

    getStyle() {
        return this.style;
    }
    /**
     * @override
     */
    toString() {
        return this.style;
    }
}

module.exports = Stylesheet;