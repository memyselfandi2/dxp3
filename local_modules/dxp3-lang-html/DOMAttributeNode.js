const DOMNode = require('./DOMNode');
const DOMNodeType = require('./DOMNodeType');

class DOMAttributeNode extends DOMNode {

	constructor(_domDocument, _domIndex, _name) {
		super(_domIndex);
		this.domDocument = _domDocument;
		this.name = _name.trim().toLowerCase();
		super._nodeName = this.name;
		super._nodeType = DOMNodeType.ATTRIBUTE_NODE;
		this.value = null;
	}

	isId() {
		return (this.name === 'id');
	}

	isID() {
		return (this.name === 'id');
	}

	getName() {
		return this.name;
	}

	getNamespaceURI() {
		return this.namespaceURI;
	}

	getValue() {
		return this.value;
	}

	setValue(_value) {
		this.value = _value;
	}

	toString() {
		let result = this.name;
		if(this.value != null) {
			result += '="' + this.value + '"';
		}
		return result;
	}
}

module.exports = DOMAttributeNode;