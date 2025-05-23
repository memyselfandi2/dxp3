/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-lang-css
 *
 * NAME
 * AttributeSelector
 */
const packageName = 'dxp3-lang-css';
const moduleName = 'AttributeSelector';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * @module dxp3-lang-css/AttributeSelector
 */
const AdjacentSiblingCombinator = require('./AdjacentSiblingCombinator');
const ChildCombinator = require('./ChildCombinator');
const DescendantCombinator = require('./DescendantCombinator');
const DirectCombinator = require('./DirectCombinator');
const GeneralSiblingCombinator = require('./GeneralSiblingCombinator');
const SimpleSelector = require('./SimpleSelector');
const util = require('dxp3-util');

class AttributeSelector extends SimpleSelector {
    /*********************************************
     * CONSTRUCTOR
     ********************************************/

    constructor() {
        super();
        this.name = '';
        this.namespace = '';
        this.value = '';
        this.operator = AttributeSelector.NONE;
    }

    /*********************************************
     * PUBLIC METHODS
     ********************************************/

    match(domDocument, domElementArray, combinator) {
        if(combinator === undefined || combinator === null) {
            let result = [];
            let elements = domDocument.getElements();
            for(let i=0;i < elements.length;i++) {
                let element = elements[i];
                if(this._matchElement(element)) {
                    result.push(element);
                }
            }
            return result;
        }
        if(combinator instanceof AdjacentSiblingCombinator) {
            return this.matchAdjacentSiblingCombinator(domDocument, domElementArray);
        }
        if(combinator instanceof ChildCombinator) {
            return this.matchChildCombinator(domDocument, domElementArray);
        }
        if(combinator instanceof DescendantCombinator) {
            return this.matchDescendantCombinator(domDocument, domElementArray);
        }
        if(combinator instanceof DirectCombinator) {
            return this.matchDirectCombinator(domDocument, domElementArray);
        }
        if(combinator instanceof GeneralSiblingCombinator) {
            return this.matchGeneralSiblingCombinator(domDocument, domElementArray);
        }        
    }

    matchAdjacentSiblingCombinator(domDocument, domElementArray) {
        // Defensive programming...check input...
        if(domDocument === undefined || domDocument === null) {
            return [];
        }
        if(domElementArray === undefined || domElementArray === null) {
            return [];
        }
        let result = [];
        for(let i=0;i < domElementArray.length;i++) {
            let domElement = domElementArray[i];
            // Shouldn't happen...but still...
            if(domElement === undefined || domElement === null) {
                continue;
            }
            let adjacentSibling = domElement.nextElementSibling();
            if(adjacentSibling === undefined || adjacentSibling === null) {
                continue;
            }
            if(this._matchElement(adjacentSibling)) {
                result.push(adjacentSibling);
            }
        }
        return result;
    }

    matchChildCombinator(domDocument, domElementArray) {
        // Defensive programming...check input...
        if(domDocument === undefined || domDocument === null) {
            return [];
        }
        if(domElementArray === undefined || domElementArray === null) {
            return [];
        }
        let result = [];
        for(let i=0;i < domElementArray.length;i++) {
            let domElement = domElementArray[i];
            // Shouldn't happen...but still...
            if(domElement === undefined || domElement === null) {
                continue;
            }
            let children = domElement.getChildElements();
            if(children === undefined || children === null) {
                continue;
            }
            for(let j=0;j < children.length;j++) {
                let child = children[j];
                if(child === undefined || child === null) {
                    continue;
                }
                if(!child.hasAttribute(this.name)) {
                    continue;
                }
                if(this._matchElement(child)) {
                    result.push(child);
                }
            }
        }
        return result;
    }

    matchDescendantCombinator(domDocument, domElementArray) {
        // Defensive programming...check input...
        if(domDocument === undefined || domDocument === null) {
            return [];
        }
        if(domElementArray === undefined || domElementArray === null) {
            return [];
        }
        let tmpMap = new Map();
        for(let i=0;i < domElementArray.length;i++) {
            let domElement = domElementArray[i];
            // Shouldn't happen...but still...
            if(domElement === undefined || domElement === null) {
                continue;
            }
            let descendants = domElement.getElementDescendants();
            if(descendants === undefined || descendants === null) {
                continue;
            }
            // It is possible the descendants of the DOM elements in the
            // domElementArray overlap. We ensure uniqueness by keeping track
            // of them in a map.
            for(let j=0;j < descendants.length;j++) {
                let descendant = descendants[j];
                if(descendant === undefined || descendant === null) {
                    continue;
                }
                if(this._matchElement(descendant)) {
                    tmpMap.set(descendant.domIndex, descendant);
                }
            }
        }
        return Array.from(tmpMap.values());
    }

    matchDirectCombinator(domDocument, domElementArray) {
        // Defensive programming...check input...
        if(domDocument === undefined || domDocument === null) {
            return [];
        }
        if(domElementArray === undefined || domElementArray === null) {
            return [];
        }
        let result = [];
        for(let i=0;i < domElementArray.length;i++) {
            let domElement = domElementArray[i];
            // Shouldn't happen...but still...
            if(domElement === undefined || domElement === null) {
                continue;
            }
            if(this._matchElement(domElement)) {
                result.push(domElement);
            }
        }
        return result;
    }

    matchGeneralSiblingCombinator(domDocument, domElementArray) {
        // Defensive programming...check input...
        if(domDocument === undefined || domDocument === null) {
            return [];
        }
        if(domElementArray === undefined || domElementArray === null) {
            return [];
        }
        let result = [];
        for(let i=0;i < domElementArray.length;i++) {
            let domElement = domElementArray[i];
            // Shouldn't happen...but still...
            if(domElement === undefined || domElement === null) {
                continue;
            }
            let siblings = domElement.getElementSiblings();
            if(siblings === undefined || siblings === null) {
                continue;
            }
            for(let j=0;j < siblings.length;j++) {
                let sibling = siblings[j];
                if(sibling === undefined || sibling === null) {
                    continue;
                }
                if(this._matchElement(sibling)) {
                    result.push(sibling);
                }
            }
        }
        return result;
    }

    toString() {
        let result = '[';
        if(this.name.length > 0) {
            if(this.namespace.length > 0) {
                result += this.namespace + '|';
            }
            result += this.name;
        }
        if(this.operator != AttributeSelector.NONE) {
            result += this.operator + '"' + this.value + '"';
        }
        result += ']';
        return result;
    }

    /*********************************************
     * GETTERS
     ********************************************/

    getName() {
        return this.name;
    }

    getNameSpace() {
        return this.namespace;
    }

    getOperator() {
        return this.operator;
    }

    getValue() {
        return this.value;
    }

    /*********************************************
     * SETTERS
     ********************************************/

    setName(_name) {
        if((_name != undefined) && (_name != null)) {
            this.name = _name;
        } else {
            this.name = '';
        }
    }

    setNameSpace(_namespace) {
        if((_namespace != undefined) && (_namespace != null)) {
            this.namespace = _namespace.trim();
        } else {
            this.namespace = '';
        }
    }

    setOperator(_operator) {
        this.operator = this._parseOperator(_operator);
    }

    setValue(_value) {
        if((_value != undefined) && (_value != null)) {
            this.value = _value;
        } else {
            this.value = '';
        }
    }

    /*********************************************
     * PRIVATE METHODS
     ********************************************/

    _matchElement(_element) {
        if(!(_element.hasAttribute(this.name))) {
            return false;
        }
        let attributeValue = _element.getAttribute(this.name);
        switch(this.operator) {
            case AttributeSelector.ASTERISK_EQUALS:
                if(attributeValue.indexOf(this.value) >= 0) {
                    return true;
                }
                break;
            case AttributeSelector.DOLLAR_EQUALS:
                if(attributeValue.endsWith(this.value)) {
                    return true;
                }
                break;
            case AttributeSelector.EQUALS:
                if(attributeValue === this.value) {
                    return true;
                }
                break;
            case AttributeSelector.NONE:
                return true;
            case AttributeSelector.PIPE_EQUALS:
                if(attributeValue === this.value) {
                    return true;
                } else if(attributeValue.indexOf(this.value + '-') === 0) {
                    return true;
                }
                break;
            case AttributeSelector.TILDE_EQUALS:
                let values = this.attributeValue.split(' ');
                if(values.includes(this.value)) {
                    return true;
                }
                break;
            case AttributeSelector.UP_EQUALS:
                if(attributeValue.startsWith(this.value)) {
                    return true;
                }
                break;
        }
        return false;
    }

    _parseOperator(_operator) {
        if(_operator === undefined || _operator === null) {
            return AttributeSelector.NONE;
        }
        _operator = _operator.trim();
        switch(_operator) {
            case '*=':
                return AttributeSelector.ASTERISK_EQUALS;
            case '$=':
                return AttributeSelector.DOLLAR_EQUALS;
            case '=':
                return AttributeSelector.EQUALS;
            case '|=':
                return AttributeSelector.PIPE_EQUALS;
            case '~=':
                return AttributeSelector.TILDE_EQUALS;
            case '^=':
                return AttributeSelector.UP_EQUALS;
            default:
                return AttributeSelector.NONE;
        }
    }
}
AttributeSelector.ASTERISK_EQUALS = '*=';
AttributeSelector.DOLLAR_EQUALS = '$=';
AttributeSelector.EQUALS = '=';
AttributeSelector.NONE = '';
AttributeSelector.PIPE_EQUALS = '|=';
AttributeSelector.TILDE_EQUALS = '~=';
AttributeSelector.UP_EQUALS = '^=';

// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
    util.Help.print(AttributeSelector);
    return;
}
module.exports = AttributeSelector;