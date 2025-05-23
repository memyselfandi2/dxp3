const css = require('dxp3-lang-css');
const DOMAttributeNode = require('./DOMAttributeNode');
const DOMElementNode = require('./DOMElementNode');
const DOMEmptyElementNode = require('./DOMEmptyElementNode');
const DOMNode = require('./DOMNode');
const DOMNodeType = require('./DOMNodeType');
const DOMTextNode = require('./DOMTextNode');

class DOMDocument extends DOMNode {

	constructor() {
		super(0);
        super._nodeName = "#document";
        super._nodeType = DOMNodeType.DOCUMENT_NODE;
		this.index = 0;
        this.root = null;
        this.elementsByIndex = new Map();
        this.elementsById = new Map();
        this.elementsByTagName = new Map();
        this.elementsByClassName = new Map();
	}

	createAttribute(name) {
		this.index++;
		let domAttributeNode = new DOMAttributeNode(this, this.index, name);
		return domAttributeNode;
	}

	createTextNode(text) {
		this.index++;
		let domTextNode = new DOMTextNode(this, this.index, text);
		return domTextNode;
	}

	createEmptyElement(name) {
		this.index++;
		let domElementNode = new DOMEmptyElementNode(this, this.index, name);
		this.elementsByIndex.set(this.index, domElementNode);
		let elements = this.elementsByTagName.get(name);
		if(elements === undefined || elements === null) {
			elements = new Map();
			this.elementsByTagName.set(name, elements);
		}
		elements.set(this.index, domElementNode);
		return domElementNode;
	}

	createElement(name) {
		this.index++;
		let domElementNode = new DOMElementNode(this, this.index, name);
		this.elementsByIndex.set(this.index, domElementNode);
		let elements = this.elementsByTagName.get(name);
		if(elements === undefined || elements === null) {
			elements = new Map();
			this.elementsByTagName.set(name, elements);
		}
		elements.set(this.index, domElementNode);
		return domElementNode;
	}

	getElementById(id) {
		return this.elementsById.get(id);
	}

	getElementsByClassName(classNames) {
		let result = [];
		if(classNames === undefined || classNames === null) {
			return result;
		}
		let classNamesArray = classNames.trim().split(' ');
		let	elements = this.elementsByClassName.get(classNamesArray[0]);
		if(elements === undefined || elements === null) {
			return result;
		}
		if(classNamesArray.length === 1) {
			return elements;
		}
		for(let i=0;i < elements.length;i++) {
			let element = elements[i];
			let elementClassName = element.className;
			let elementClassNameArray = elementClassName.split(' ');
			let match = true;
			for(let j=1;j < classNamesArray.length;j++) {
				let className = classNamesArray[j];
				if(!elementClassNameArray.includes(className)) {
					match = false;
					break;
				}
			}
			if(match) {
				result.push(element);
			}
		}
		return result;
	}

	getElements() {
		let result = this.elementsByIndex.values();
		if(result === undefined || result === null) {
			return [];
		}
		return Array.from(result);
	}

	getElementsByTagName(tagName) {
		let elements = this.elementsByTagName.get(tagName);
		if(elements === undefined || elements === null) {
			return [];
		}
		return Array.from(elements.values());
	}

	setElementId(index, id) {
		let domElementNode = this.elementsByIndex.get(index);
		this.elementsById.set(id, domElementNode);
	}

	setElementClass(index, classNames) {
		let domElementNode = this.elementsByIndex.get(index);
		let classNamesArray = classNames.split(' ');
		for(let i=0;i < classNamesArray.length;i++) {
			let className = classNamesArray[i];
			let elements = this.elementsByClassName.get(className);
			if(elements === undefined || elements === null) {
				elements = [];
				this.elementsByClassName.set(className, elements);
			}
			elements.push(domElementNode);
		}
	}

	getDocumentElement() {
		return this.root;
	}

	get documentElement() {
		return this.root;
	}

	setDocumentElement(_documentElement) {
		this.root = _documentElement;
	}

	set documentElement(_documentElement) {
		this.root = _documentElement;
	}

	query(selectors, callback) {
		this.querySelector(selectors, callback);
	}

	querySelector(selectors, callback) {
		let self = this;
		let selectorTokenizer = new css.SelectorTokenizer(selectors);
		let processNextSelector = function(selector) {
			if(selector === null) {
				return callback(null, null);
			}
			let matches = selector.match(self);
			if(matches.length > 0) {
				let result = matches[0];
				return callback(null, result);
			}
			selectorTokenizer.nextSelector(processNextSelector);
		}
		selectorTokenizer.nextSelector(processNextSelector);
	}

	queryAll(selectors, callback) {
		this.querySelectorAll(selectors, callback);
	}

	querySelectorAll(selectors, callback) {
		let self = this;
		let selectorTokenizer = new css.SelectorTokenizer(selectors);
		let matches = [];
		let processNextSelector = function(selector) {
			if(selector === null) {
				return callback(null, matches);
			}
			let selection = selector.match(self);
			if(selection.length > 0) {
				matches = matches.concat(selection);
			}
			selectorTokenizer.nextSelector(processNextSelector);
		}
		selectorTokenizer.nextSelector(processNextSelector);
	}

	toString() {
		if(this.root === undefined || this.root === null) {
			return '';
		}
		return '<!DOCTYPE html>\n' + this.root.toString();
	}
}

module.exports = DOMDocument;