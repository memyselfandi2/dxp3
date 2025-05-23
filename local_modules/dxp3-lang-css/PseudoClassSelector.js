/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-lang-css
 *
 * NAME
 * PseudoClassSelector
 */
const packageName = 'dxp3-lang-css';
const moduleName = 'PseudoClassSelector';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/*
 * @module dxp3-lang-css/PseudoClassSelector
 */
const AdjacentSiblingCombinator = require('./AdjacentSiblingCombinator');
const ChildCombinator = require('./ChildCombinator');
const DescendantCombinator = require('./DescendantCombinator');
const DirectCombinator = require('./DirectCombinator');
const GeneralSiblingCombinator = require('./GeneralSiblingCombinator');
const SimpleSelector = require('./SimpleSelector');
const util = require('dxp3-util');

class PseudoClassSelector extends SimpleSelector {
    /*********************************************
     * CONSTRUCTOR
     ********************************************/

    constructor(_type) {
        super();
        this.typeName = _type;
        this.type = this.parse(_type);
    }

    /*********************************************
     * PUBLIC METHODS
     ********************************************/

    match(domDocument, domElementArray, combinator) {
        if(combinator === undefined || combinator === null) {
            let result = [];
            let elements = null;
            switch(this.type) {
                case PseudoClassSelector.CHECKED:
                    elements = domDocument.getElements();
                    for(let i=0;i < elements.length;i++) {
                        let element = elements[i];
                        let attribute = element.getAttribute('checked');
                        if(attribute === undefined || attribute === null) {
                            continue;
                        }
                        result.push(element);
                    }
                    break;
                case PseudoClassSelector.EMPTY:
                    elements = domDocument.getElements();
                    for(let i=0;i < elements.length;i++) {
                        let element = elements[i];
                        if(element.isEmpty()) {
                            result.push(element);
                        }
                    }
                    break;
                case PseudoClassSelector.FIRST_CHILD:
                    result.push(domDocument.documentElement);
                    break;
                case PseudoClassSelector.LAST_CHILD:
                    result.push(domDocument.documentElement);
                    break;
                case PseudoClassSelector.ROOT:
                    result.push(domDocument.documentElement);
                    break;
                case PseudoClassSelector.ONLY_CHILD:
                    elements = domDocument.getElements();
                    for(let i=0;i < elements.length;i++) {
                        let element = elements[i];
                        if(element.isOnlyChild()) {
                            result.push(element);
                        }
                    }
                default:
                    result = [];
            }
            return result;
        }
        if(combinator instanceof DirectCombinator) {
            // For example: div:first-child
            return this.matchDirectCombinator(domDocument, domElementArray);
        }
        return [];
    }

    matchDirectCombinator(domDocument, domElementArray) {
        // Defensive programming...check input...
        if(domDocument === undefined || domDocument === null) {
            return [];
        }
        if(domElementArray === undefined || domElementArray === null) {
            return [];
        }
        if(domElementArray.length <= 0) {
            return [];
        }
        let result = [];
        let byParent = null;
        switch(this.type) {
            case PseudoClassSelector.CHECKED:
                for(let i=0;i < domElementArray.length;i++) {
                    let element = domElementArray[i];
                    let attribute = element.getAttribute('checked');
                    if(attribute === undefined || attribute === null) {
                        continue;
                    }
                    result.push(element);
                }
                break;
            case PseudoClassSelector.EMPTY:
                for(let i=0;i < domElementArray.length;i++) {
                    let element = domElementArray[i];
                    if(element.isEmpty()) {
                        result.push(element);
                    }
                }
                break;
            case PseudoClassSelector.FIRST_CHILD:
                byParent = new Map();
                for(let i=0;i < domElementArray.length;i++) {
                    let element = domElementArray[i];
                    let parentElement = element._parentElement;
                    let blaat = byParent.get(parentElement.domIndex);
                    if(blaat === undefined || blaat === null) {
                        byParent.set(parentElement.domIndex, element);
                        result.push(element);
                    }
                }
                break;
            case PseudoClassSelector.LAST_CHILD:
                byParent = new Map();
                for(let i=0;i < domElementArray.length;i++) {
                    let element = domElementArray[i];
                    let parentElement = element._parentElement;
                    let blaat = byParent.get(parentElement.domIndex);
                    byParent.set(parentElement.domIndex, element);
                }
                for(let [key, value] of byParent) {
                    result.push(value);
                }
                break;
            case PseudoClassSelector.ONLY_CHILD:
                for(let i=0;i < domElementArray.length;i++) {
                    let element = domElementArray[i];
                    if(element.isOnlyChild()) {
                        result.push(element);
                    }
                }
                break;
            case PseudoClassSelector.ROOT:
                result.push(domDocument.documentElement);
                break;
            default:
                break;
        }
        return result;
    }

    parse(typeAsString) {
        if(typeAsString === undefined || typeAsString === null) {
            return PseudoClassSelector.UNKNOWN;
        }
        typeAsString = typeAsString.trim();
        if(typeAsString.length <= 0) {
            return PseudoClassSelector.UNKNOWN;
        }
        typeAsString = typeAsString.toLowerCase();
        switch(typeAsString) {
            case 'after':
                return PseudoClassSelector.AFTER;
            case 'active':
                return PseudoClassSelector.ACTIVE;
            case 'before':
                return PseudoClassSelector.BEFORE;
            case 'checked':
                return PseudoClassSelector.CHECKED;
            case 'disabled':
                return PseudoClassSelector.DISABLED;
            case 'empty':
                return PseudoClassSelector.EMPTY;
            case 'enabled':
                return PseudoClassSelector.ENABLED;
            case 'firstchild':
            case 'first child':
            case 'first-child':
            case 'first_child':
                return PseudoClassSelector.FIRST_CHILD;
            case 'firstletter':
            case 'first letter':
            case 'first-letter':
            case 'first_letter':
                return PseudoClassSelector.FIRST_LETTER;
            case 'firstline':
            case 'first line':
            case 'first-line':
            case 'first_line':
                return PseudoClassSelector.FIRST_LINE;
            case 'firstofchild':
            case 'first of child':
            case 'first-of-child':
            case 'first_of_child':
                return PseudoClassSelector.FIRST_OF_CHILD;
            case 'firstoftype':
            case 'first of type':
            case 'first-of-type':
            case 'first_of_type':
                return PseudoClassSelector.FIRST_OF_TYPE;
            case 'focus':
                return PseudoClassSelector.FOCUS;
            case 'hover':
                return PseudoClassSelector.HOVER;
            case 'indeterminate':
                return PseudoClassSelector.INDETERMINATE;
            case 'lang':
                return PseudoClassSelector.LANG;
            case 'lastchild':
            case 'last child':
            case 'last-child':
            case 'last_child':
                return PseudoClassSelector.LAST_CHILD;
            case 'lastoftype':
            case 'last of type':
            case 'last-of-type':
            case 'last_of_type':
                return PseudoClassSelector.LAST_OF_TYPE;
            case 'link':
                return PseudoClassSelector.LINK;
            case 'not':
                return PseudoClassSelector.NOT;
            case 'nthchild':
            case 'nth child':
            case 'nth-child':
            case 'nth_child':
                return PseudoClassSelector.NTH_CHILD;
            case 'nthlastchild':
            case 'nth last child':
            case 'nth-last-child':
            case 'nth_last_child':
                return PseudoClassSelector.NTH_LAST_CHILD;
            case 'nthlastoftype':
            case 'nth last of type':
            case 'nth-last-of-type':
            case 'nth_last_of_type':
                return PseudoClassSelector.NTH_LAST_OF_TYPE;
            case 'nthoftype':
            case 'nth of type':
            case 'nth-of-type':
            case 'nth_of_type':
                return PseudoClassSelector.NTH_OF_TYPE;
            case 'onlychild':
            case 'only child':
            case 'only-child':
            case 'only_child':
                return PseudoClassSelector.ONLY_CHILD;
            case 'onlyoftype':
            case 'only of type':
            case 'only-of-type':
            case 'only_of_type':
                return PseudoClassSelector.ONLY_OF_TYPE;
            case 'root':
                return PseudoClassSelector.ROOT;
            case 'target':
                return PseudoClassSelector.TARGET;
            case 'visited':
                return PseudoClassSelector.VISITED;
            default:
                return PseudoClassSelector.UNKNOWN;
        }
    }

    toString() {
        let result = ':';
        if (this.type === PseudoClassSelector.UNKNOWN) {
            result += this.typeName;
        } else {
            result += this.type;
        }
        return result;
    }

    /*********************************************
     * GETTERS
     ********************************************/

    getType() {
        return this.type;
    }

    /*********************************************
     * SETTERS
     ********************************************/

    setType(_typeName) {
        this.typeName = _typeName;
        this.type = this.parse(_typeName);
    }
}
// After is really a pseudo element, but due to backwards
// compatibility with CSS2 it may appear with a 
// single colon(:after) instead of a double colon (::after).
PseudoClassSelector.AFTER = "after";
PseudoClassSelector.ACTIVE = "active";
// Before is really a pseudo element, but due to backwards
// compatibility with CSS2 it may appear with a 
// single colon(:before) instead of a double colon (::before).
PseudoClassSelector.BEFORE = "before";
PseudoClassSelector.CHECKED = "checked";
PseudoClassSelector.DISABLED = "disabled";
PseudoClassSelector.EMPTY = "empty";
PseudoClassSelector.ENABLED = "enabled";
PseudoClassSelector.FIRST_CHILD = "first-child";
// First-letter is really a pseudo element, but due to backwards
// compatibility with CSS1 and CSS2 it may appear with a 
// single colon(:first-letter) instead of a double colon (::first-letter).
PseudoClassSelector.FIRST_LETTER = "first-letter";
// First-line is really a pseudo element, but due to backwards
// compatibility with CSS1 and CSS2 it may appear with a 
// single colon(:first-line) instead of a double colon (::first-line).
PseudoClassSelector.FIRST_LINE = "first-line";
PseudoClassSelector.FIRST_OF_CHILD = "first-of-child";
PseudoClassSelector.FIRST_OF_TYPE = "first-of-type";
PseudoClassSelector.FOCUS = "focus";
PseudoClassSelector.HOVER = "hover";
PseudoClassSelector.INDETERMINATE = "indeterminate";
PseudoClassSelector.LANG = "lang";
PseudoClassSelector.LAST_CHILD = "last-child";
PseudoClassSelector.LAST_OF_TYPE = "last-of-type";
PseudoClassSelector.LINK = "link";
PseudoClassSelector.NOT = "not";
PseudoClassSelector.NTH_CHILD = "nth-child";
PseudoClassSelector.NTH_LAST_CHILD = "nth-last-child";
PseudoClassSelector.NTH_LAST_OF_TYPE = "nth-last-of-type";
PseudoClassSelector.NTH_OF_TYPE = "nth-of-type";
PseudoClassSelector.ONLY_CHILD = "only-child";
PseudoClassSelector.ONLY_OF_TYPE = "only-of-type";
PseudoClassSelector.ROOT = "root";
PseudoClassSelector.TARGET = "target";
PseudoClassSelector.VISITED = "visited";
PseudoClassSelector.UNKNOWN = "unknown";

// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
    util.Help.print(PseudoClassSelector);
    return;
}
module.exports = PseudoClassSelector;