const DOMElementNode = require('./DOMElementNode');
/**
 * @class
 */
class DOMEmptyElementNode extends DOMElementNode {
	/**
	 * @constructor
	 */
	constructor(_domDocument, _domIndex, _name) {
		super(_domDocument, _domIndex, _name);
	}

	toString() {
		let result = '<' + this.name;
        for(let [attributeNodeName, attributeNode] of this.attributes) {
            result += ' ' + attributeNode.toString();
        }	
		result += '/>\n';
		return result;
	}
}

module.exports = DOMEmptyElementNode;