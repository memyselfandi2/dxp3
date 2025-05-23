const DOMNodeType = require('./DOMNodeType');

class DOMNode {

	constructor(_domIndex) {
		this.domIndex = _domIndex;
		this._nodeName = '';
		this._nodeType = null;
		this._parentElement = null;
		this._parentNode = null;
		this._childNodes = [];
	}

	get childNodes() {
		return this._childNodes;
	}

	get firstChild() {
		if(this._childNodes.length <= 0) {
			return null;
		}
		return this._childNodes[0];
	}

	get lastChild() {
		if(this._childNodes.length <= 0) {
			return null;
		}
		return this._childNodes[this._childNodes.length - 1];
	}

	get nextSibling() {
		if(this._parentNode === null) {
			return null;
		}
		let siblings = this._parentNode.getChildNodes();
		// We loop through each sibling until we find
		// ourselves. We don't bother checking the last sibling,
		// because if we are the last sibling there is no next one.
		const numberOfSiblings = siblings.length - 1;
        for(let i=0;i < numberOfSiblings;i++) {
            let sibling = siblings[i];
            if(sibling.domIndex === this.domIndex) {
            	// Found myself. The next sibling is the one
            	// we are looking for.
                return siblings[i + 1];
            }
        }
        return null;
	}

	get parentElement() {
		return this.getParentElement();
	}

	getParentElement() {
		return this._parentElement;
	}

	get previousSibling() {
		return this.getPreviousSibling();
	}

	getPreviousSibling() {
		if(this._parentNode === null) {
			return null;
		}
		let siblings = this._parentNode.getChildNodes();
		// We loop through each sibling until we find
		// ourselves. We don't bother checking the first sibling,
		// because if we are the first sibling there is no previous one.
        for(let i=1;i < siblings.length;i++) {
            let sibling = siblings[i];
            if(sibling.domIndex === this.domIndex) {
            	// Found myself. The one before this is the one
            	// we are looking for.
                return siblings[i - 1];
            }
        }
        return null;
	}

	getChildNodes() {
		return this._childNodes;
	}

	getChildren() {
		return this._childNodes;
	}

	get nodeName() {
		return this._nodeName;
	}

	getNodeName() {
		return this._nodeName;
	}

	get nodeType() {
		return this._nodeType;
	}

	getNodeType() {
		return this._nodeType;
	}

	getParentNode() {
		return this._parentNode;
	}

	set parentElement(_domElementNode) {
		this.setParentNode(_domElementNode);
	}

	get parentNode() {
		return this.getParentNode();
	}

	set parentNode(_domNode) {
		this.setParentNode(_domNode);
	}

	setParentNode(_domNode) {
		if(_domNode === undefined || _domNode === null) {
			this._parentElement = null;
			this._parentNode = null;
			return;
		}
		this._parentNode = _domNode;
		if(this._parentNode.nodeType === DOMNodeType.ELEMENT_NODE) {
			this._parentElement = this.parentNode;
		} else {
			this._parentElement = null;
		}
	}

	appendChild(_domNode) {
		if(_domNode === undefined || _domNode === null) {
			return;
		}
		_domNode.setParentNode(this);
		this._childNodes.push(_domNode);
	}

	toString() {
	}
}

module.exports = DOMNode;