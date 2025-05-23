/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-lang-css
 *
 * NAME
 * IDSelector
 */
const packageName = 'dxp3-lang-css';
const moduleName = 'IDSelector';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * @module dxp3-lang-css/IDSelector
 */
const AdjacentSiblingCombinator = require('./AdjacentSiblingCombinator');
const ChildCombinator = require('./ChildCombinator');
const DescendantCombinator = require('./DescendantCombinator');
const DirectCombinator = require('./DirectCombinator');
const GeneralSiblingCombinator = require('./GeneralSiblingCombinator');
const SimpleSelector = require('./SimpleSelector');
const util = require('dxp3-util');

class IDSelector extends SimpleSelector {
    /*********************************************
     * CONSTRUCTOR
     ********************************************/

    constructor(_name) {
        super();
        this.name = '';
        if((_name != undefined) && (_name != null)) {
            this.name = _name.trim();
        }
    }

    /*********************************************
     * PUBLIC METHODS
     ********************************************/

    match(domDocument, domElementNodeArray, combinator) {
        if(combinator === undefined || combinator === null) {
            let result = [];
            let domElement = domDocument.getElementById(this.name);
            if(domElement != null) {
                result.push(domElement);
            }
            return result;
        }
        if(combinator instanceof AdjacentSiblingCombinator) {
            return this.matchAdjacentSiblingCombinator(domDocument, domElementNodeArray);
        }
        if(combinator instanceof ChildCombinator) {
            return this.matchChildCombinator(domDocument, domElementNodeArray);
        }
        if(combinator instanceof DescendantCombinator) {
            return this.matchDescendantCombinator(domDocument, domElementNodeArray);
        }
        if(combinator instanceof DirectCombinator) {
            return this.matchDirectCombinator(domDocument, domElementNodeArray);
        }
        if(combinator instanceof GeneralSiblingCombinator) {
            return this.matchGeneralSiblingCombinator(domDocument, domElementNodeArray);
        }        
    }

    matchAdjacentSiblingCombinator(domDocument, domElementNodeArray) {
        // For example: div + #something
        let result = [];
        for(let i=0;i < domElementNodeArray.length;i++) {
            let domElementNode = domElementNodeArray[i];
            let parentElementNode = domElementNode.getParent();
            let adjacentSibling = parentElementNode.getAdjacentSibling(domElementNode);
            if(adjacentSibling != null) {
                if(adjacentSibling.getID() === this.name) {
                    result.push(adjacentSibling);
                }
            }
        }
        return result;
    }

    matchChildCombinator(domDocument, domElementNodeArray) {
        // For example: div > p
        let result = [];
        for(let i=0;i < domElementNodeArray.length;i++) {
            let domElementNode = domElementNodeArray[i];
            let children = domElementNode.getChildren();
            if(children != null) {
                for(let j=0;j < children.length;j++) {
                    let child = children[j];
                    if(child.getID() === this.name) {
                        result.push(child);
                    }
                }
            }
        }
        return result;
    }

    matchDescendantCombinator(domDocument, domElementNodeArray) {
        // For example div p
        let tmpMap = new Map();
        for(let i=0;i < domElementNodeArray.length;i++) {
            let domElementNode = domElementNodeArray[i];
            let children = domElementNode.getDescendants();
            if(children != null) {
                for(let j=0;j < children.length;j++) {
                    let child = children[j];
                    if(child.getID() === this.name) {
                        tmpMap.set(child.domIndex, child);
                    }
                }
            }
        }
        return Array.from(tmpMap.values());
    }

    matchDirectCombinator(domDocument, domElementNodeArray) {
        // For example: div + #something
        let result = [];
        for(let i=0;i < domElementNodeArray.length;i++) {
            let domElementNode = domElementNodeArray[i];
            if(domElementNode.getID() === this.name) {
                result.push(domElementNode);
            }
        }
        return result;
    }

    matchGeneralSiblingCombinator(domDocument, domElementNodeArray) {
        // For example: div~p
        let result = [];
        for(let i=0;i < domElementNodeArray.length;i++) {
            let domElementNode = domElementNodeArray[i];
            let parentElementNode = domElementNode.getParent();
            let siblings = parentElementNode.getSiblings(domElementNode);
            if(siblings != null) {
                for(let j=0;j < siblings.length;j++) {
                    let sibling = siblings[j];
                    if(sibling.getID() === this.name) {
                        result.push(sibling);
                    }
                }
            }
        }
        return result;
    }

    toString() {
        return '#' + this.name;
    }

    /*********************************************
     * GETTERS
     ********************************************/

    getName() {
        return this.name;
    }

    /*********************************************
     * SETTERS
     ********************************************/

    setName(_name) {
        if((_name != undefined) && (_name != null)) {
            this.name = _name.trim();
        } else {
            this.name = '';
        }
    }
}
// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
    util.Help.print(IDSelector);
    return;
}
module.exports = IDSelector;