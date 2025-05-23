const HTMLElement = require('./HTMLElement');
/**
 * @class
 */
class HTMLComment extends HTMLElement {
    constructor(_comment) {
        super();
    	this.comment = '';
    	if(_comment != undefined && _comment != null) {
    		if(typeof _comment === 'string') {
    			this.comment = _comment;
    		}
    	}
    }
    /**
     * @override
     */
    toString() {
        return '<!-- ' + this.comment + ' -->';
    }
}

module.exports = HTMLComment;