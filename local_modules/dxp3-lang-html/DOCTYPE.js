const HTMLElement = require('./HTMLElement');

class DOCTYPE extends HTMLElement {

    constructor(_doctypeBody) {
        super();
        this.doctypeBody = '';
        if(_doctypeBody != undefined && _doctypeBody != null) {
            if(typeof _doctypeBody === 'string') {
                this.doctypeBody = _doctypeBody;
            }
        }
    }
    /**
     * @override
     */
    toString() {
        return '<!DOCTYPE' + this.doctypeBody + '>';
    }
}

module.exports = DOCTYPE;