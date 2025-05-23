const DOMNode = require('./DOMNode');
const DOMNodeType = require('./DOMNodeType');

class DOMElementNode extends DOMNode {

	constructor(_domDocument, _domIndex, _name) {
		super(_domIndex);
		this.domDocument = _domDocument;
		this.name = _name.trim().toLowerCase();
        super._nodeName = this.name;
        super._nodeType = DOMNodeType.ELEMENT_NODE;
		this.attributes = new Map();
        this.idAttributeNode = null;
        this.classAttributeNode = null;
        this.classNames = [];
        this.childElements = [];
	}

    isEmpty() {
        return (this.childElements.length === 0);
    }

    isOnlyChild() {
        if(this._parentElement === null) {
            return true;
        }
        return (this._parentElement.getNumberOfChildElements() === 1);
    }

    getNumberOfChildElements() {
        return this.childElements.length;
    }

    getChildElements() {
        return this.childElements;
    }

    get nextElementSibling() {
        return this.getNextElementSibling();
    }

    getNextElementSibling() {
        if(this._parentElement === null) {
            return null;
        }
        let elementSiblings = this._parentElement.getChildElements();
        // We loop through each sibling until we find
        // ourselves. We don't bother checking the last sibling,
        // because if we are the last sibling there is no next one.
        const numberOfElementSiblings = elementSiblings.length - 1;
        for(let i=0;i < numberOfElementSiblings;i++) {
            let elementSibling = elementSiblings[i];
            if(elementSibling.domIndex === this.domIndex) {
                return elementSiblings[i + 1];
            }
        }
        return null;
    }

    get previousElementSibling() {
        return this.getPreviousElementSibling();
    }

    getPreviousElementSibling() {
        if(this._parentElement === null) {
            return null;
        }
        let elementSiblings = this._parentElement.getChildElements();
        // We loop through each sibling until we find
        // ourselves. We don't bother checking the first sibling,
        // because if we are the first sibling there is no previous one.
        for(let i=1;i < elementSiblings.length;i++) {
            let elementSibling = elementSiblings[i];
            if(elementSibling.domIndex === this.domIndex) {
                return elementSiblings[i - 1];
            }
        }
        return null;
    }

    // getAdjacentSibling(domElementNode) {
    //     if(domElementNode === undefined || domElementNode === null) {
    //         return null;
    //     }
    //     for(let i=0;i < this.children.length();i++) {
    //         let child = this.children[i];
    //         if(child.domIndex === domElementNode.domIndex) {
    //             for(let j=i+1;j < this.children.length();j++) {
    //                 let sibling = this.children[j];
    //                 if(sibling.nodeType === DOMNodeType.ELEMENT_NODE) {
    //                     return sibling;
    //                 }
    //             }
    //         }
    //     }
    //     return null;
    // }

    // getSiblings(domElementNode) {
    //     return this.getGeneralSiblings(domElementNode);
    // }

    // getGeneralSiblings(domElementNode) {
    //     let result = [];
    //     for(let i=0;i < this.children.length();i++) {
    //         let child = this.children[i];
    //         if(child.domIndex === domElementNode.domIndex) {
    //             continue;
    //         }
    //         if(sibling.nodeType === DOMNodeType.ELEMENT_NODE) {
    //             result.push(child);
    //         }
    //     }
    //     return result;
    // }

    get elementDescendants() {
        return this.getElementDescendants();
    }

    getElementDescendants() {
        // Add each child
        let result = [...this.childElements];
        // Add the descendants of each child
        for(let i=0;i < this.childElements.length;i++) {
            result = result.concat(this.childElements[i].getElementDescendants());
        }
        return result;
    }

    get elementSiblings() {
        return this.getElementSiblings();
    }

    getElementSiblings() {
        if(this._parentElement === null) {
            return [];
        }
        let elementSiblings = this._parentElement.getChildElements();
        if(elementSiblings === undefined || elementSiblings === null) {
            return [];
        }
        let result = [];
        // We remove ourselves from the siblings array.
        for(let i=0;i < elementSiblings.length;i++) {
            let elementSibling = elementSiblings[i];
            if(elementSibling === undefined || elementSibling === null) {
                continue;
            }
            if(elementSibling.domIndex === this.domIndex) {
                continue;
            }
            result.push(elementSibling);
        }
        return null;
    }

    get classList() {
        if(this.classAttributeNode === null) {
            return [];
        }
        return this.classAttributeNode.value.split(' ');
    }

    getClassList() {
        return this.classList;
    }

    get class() {
        if(this.classAttributeNode === null) {
            return '';
        }
        return this.classAttributeNode.value;
    }

    getClass() {
        return this.class;
    }

    get className() {
        return this.class;
    }

    getClassName() {
        return this.class;
    }

    get id() {
        if(this.idAttributeNode === null) {
            return '';
        }
        return this.idAttributeNode.value;
    }

    getId() {
        return this.id;
    }

    getID() {
        return this.id;
    }

    getName() {
        return this.name;
    }

    getAttribute(_key) {
        if(_key === undefined || _key === null) {
            return null;
        }
        let key = _key.trim().toLowerCase();
        if(key.length <= 0) {
            return null;
        }
        let attributeNode = this.attributes.get(key);
        if(attributeNode === undefined || attributeNode === null) {
            return null;
        }
        return attributeNode.getValue();
    }

    hasAttribute(_key) {
        if(_key === undefined || _key === null) {
            return false;
        }
        let key = _key.trim().toLowerCase();
        if(key.length <= 0) {
            return false;
        }
        return this.attributes.has(key);
    }

    hasClass(_value) {
        return this.classNames.includes(_value);
    }

    hasClassName(_value) {
        return hasClass(_value);
    }

    set class(_value) {
        this.setAttributeValue('class', _value);
    }

    set className(_value) {
        this.class = _value;
    }

    setClassName(_value) {
        this.class = _value;
    }

    set id(_value) {
        this.setAttributeValue('id', _value);
    }

    set ID(_value) {
        this.id = _value;
    }

    set Id(_value) {
        this.id = _value;
    }

    setValue(_value) {
        this.setAttributeValue('value', _value);
    }

    setAttribute(_key, _value) {
        this.setAttributeValue(_key, _value);
    }

    setAttributeValue(_key, _value) {
        if(_key === undefined || _key === null) {
            return;
        }
        let key = _key.trim().toLowerCase();
        if(key.length <= 0) {
            return;
        }
        let attributeNode = this.attributes.get(key);
        if(attributeNode === undefined || attributeNode === null) {
        	attributeNode = this.domDocument.createAttribute(key);
	        setAttributeNode(attributeNode);
        }
        let value = null;
        if(_value != undefined && _value != null) {
            value = _value;
        }
        attributeNode.setValue(value);
    }

	setAttributeNode(_attributeNode) {
		if(_attributeNode === undefined || _attributeNode === null) {
			return;
		}
		this.attributes.set(_attributeNode.name, _attributeNode);
		if(_attributeNode.name === 'id') {
			this.domDocument.setElementId(this.domIndex, _attributeNode.value);
            this.idAttributeNode = _attributeNode;
		} else if(_attributeNode.name === 'class') {
            this.domDocument.setElementClass(this.domIndex, _attributeNode.value);
            this.classAttributeNode = _attributeNode;
            this.classNames = _attributeNode.value.split(' ');
        }
	}

	toString() {
		let result = '<' + this.name;
        for(let [attributeNodeName, attributeNode] of this.attributes) {
            result += ' ' + attributeNode.toString();
        }	
		result += '>';
		for(let i=0;i < this._childNodes.length;i++) {
			result += this._childNodes[i].toString();
		}
		result += '</' + this.name + '>';
		return result;
	}

    innerHTML() {
        let result = '';
        for(let i=0;i < this._childNodes.length;i++) {
            result += this._childNodes[i].toString();
        }
        return result;
    }

    appendChild(_domNode) {
        super.appendChild(_domNode);
        if(_domNode === undefined || _domNode === null) {
            return;
        }
        if(_domNode.nodeType === DOMNodeType.ELEMENT_NODE) {
            this.childElements.push(_domNode);
        }
    }
}

module.exports = DOMElementNode;