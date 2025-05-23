const DOMNode = require('./DOMNode');
const DOMNodeType = require('./DOMNodeType');

class DOMTextNode extends DOMNode {
	constructor(_domDocument, _domIndex, _text) {
		super(_domIndex);
		super._nodeName = "#text";
		super._nodeType = DOMNodeType.TEXT_NODE;
		this.domDocument = _domDocument;
		this.text = _text;
	}

	toString() {
		return this.text;
	}
}

module.exports = DOMTextNode;