/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-lang-css
 *
 * NAME
 * TypeSelector
 */
const packageName = 'dxp3-lang-css';
const moduleName = 'TypeSelector';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * A type selector matches elements by node name. In other words,
 * it selects all elements of the given type within a document.
 * Type selectors can be namespaced when using @namespace.
 * This is useful when dealing with documents containing multiple namespaces such as
 * HTML5 with inline SVG or MathML, or XML that mixes multiple vocabularies.
 *
 * If the type selector is combined with another simple selector by
 * a combinator it will attempt to match elements of the given type. List of combinators:
 *
 * Adjacent sibling combinator (+)
 * It separates two selectors and matches the second element only if it immediately follows
 * the first element, and both are children of the same parent element.
 * In the case of the type selector it will match the first sibling if it is of the given type.
 * Example: div+p
 * 
 * Child combinator (>)
 * It matches only those elements matched by the second selector that are
 * the direct children of elements matched by the first.
 * In the case of the type selector it will match all the children of
 * the first selector of the given type.
 * Example: div>p
 *
 * Descendant combinator ( )
 * It combines two selectors such that elements matched by the second selector
 * are selected if they have an ancestor (parent, parent's parent,
 * parent's parent's parent, etc) element matching the first selector.
 * The descendant combinator is technically one or more CSS white space characters.
 * Those are the space character and/or one of four control characters:
 * carriage return, form feed, new line, and tab characters.
 * Additionally, the white space characters of which the combinator is comprised
 * may contain any number of CSS comments.
 * In the case of the type selector it will match all the descendants of
 * the first selector of the given type.
 * Example: div p
 *
 * Direct combinator ()
 * It combines two selectors directly without any characters between them and will
 * create a result set with elements that adhere to both selectors.
 * The direct combinator is not straightforward to use with a type selector, as we can not
 * always identify where the previous selector ends and where the type selector starts.
 * Example: [class="article"]p
 *
 * General sibling combinator (~)
 * It separates two selectors and matches all iterations of the second element,
 * that are following the first element (though not necessarily immediately), and
 * are children of the same parent element.
 * In the case of the type selector it will match all the siblings of
 * the first selector of the given type.
 * Example: div~p
 *
 * @module dxp3-lang-css/TypeSelector
 */
const AdjacentSiblingCombinator = require('./AdjacentSiblingCombinator');
const ChildCombinator = require('./ChildCombinator');
const DescendantCombinator = require('./DescendantCombinator');
const DirectCombinator = require('./DirectCombinator');
const GeneralSiblingCombinator = require('./GeneralSiblingCombinator');
const SimpleSelector = require('./SimpleSelector');
const util = require('dxp3-util');

class TypeSelector extends SimpleSelector {
    /*********************************************
     * CONSTRUCTOR
     ********************************************/

    constructor(_name, _namespace) {
        super();
        this.name = '';
        if((_name != undefined) && (_name != null)) {
            this.name = _name;
        }
        this.namespace = null;
        if(_namespace != undefined && _namespace != null) {
            _namespace = _namespace.trim();
            if(_namespace.length > 0) {
                this.namespace = _namespace;
            }
        }
    }

    /*********************************************
     * PUBLIC METHODS
     ********************************************/

    match(domDocument, domElementArray, combinator) {
        if(combinator === undefined || combinator === null) {
            return domDocument.getElementsByTagName(this.name);
        }
        if(combinator instanceof AdjacentSiblingCombinator) {
            // For example: div+p
            return this.matchAdjacentSiblingCombinator(domDocument, domElementArray);
        }
        if(combinator instanceof ChildCombinator) {
            // For example: div>p
            return this.matchChildCombinator(domDocument, domElementArray);
        }
        if(combinator instanceof DescendantCombinator) {
            // For example: div p
            return this.matchDescendantCombinator(domDocument, domElementArray);
        }
        if(combinator instanceof DirectCombinator) {
            // For example: [class="article"]p
            return this.matchDirectCombinator(domDocument, domElementArray);
        }
        if(combinator instanceof GeneralSiblingCombinator) {
            // For example: div~p
            return this.matchGeneralSiblingCombinator(domDocument, domElementArray);
        }
    }

    /*
     * Adjacent sibling combinator (+)
     * It separates two selectors and matches the second element only if it immediately follows
     * the first element, and both are children of the same parent element.
     * In the case of the type selector it will match the first sibling if it is of the given type.
     * Example: div+p
     */
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
            if(adjacentSibling.getNodeName() === this.name) {
                result.push(adjacentSibling);
            }
        }
        return result;
    }

    /*
     * Child combinator (>)
     * It matches only those elements matched by the second selector that are
     * the direct children of elements matched by the first.
     * In the case of the type selector it will match all the children of
     * the first selector of the given type.
     * Example: div>p
     */
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
                if(child.getNodeName() === this.name) {
                    result.push(child);
                }
            }
        }
        return result;
    }

    /*
     * Descendant combinator ( )
     * It combines two selectors such that elements matched by the second selector
     * are selected if they have an ancestor (parent, parent's parent,
     * parent's parent's parent, etc) element matching the first selector.
     * The descendant combinator is technically one or more CSS white space characters.
     * Those are the space character and/or one of four control characters:
     * carriage return, form feed, new line, and tab characters.
     * Additionally, the white space characters of which the combinator is comprised
     * may contain any number of CSS comments.
     * In the case of the type selector it will match all the descendants of
     * the first selector of the given type.
     * Example: div p
     */
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
                if(descendant.getNodeName() === this.name) {
                    tmpMap.set(descendant.domIndex, descendant);
                }
            }
        }
        return Array.from(tmpMap.values());
    }

    /*
     * Direct combinator ()
     * It combines two selectors directly without any characters between them and will
     * create a result set with elements that adhere to both selectors.
     * The direct combinator is not straightforward to use with a type selector, as we can not
     * always identify where the previous selector ends and where the type selector starts.
     * Example: [class="article"]p
     */
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
            if(domElement.getNodeName() === this.name) {
                result.push(domElement);
            }
        }
        return result;
    }

    /*
     * General sibling combinator (~)
     * It separates two selectors and matches all iterations of the second element,
     * that are following the first element (though not necessarily immediately), and
     * are children of the same parent element.
     * In the case of the type selector it will match all the siblings of
     * the first selector of the given type.
     * Example: div~p
     */
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
                if(sibling.getNodeName() === this.name) {
                    result.push(sibling);
                }
            }
        }
        return result;
    }

    toString() {
        return this.name;
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

    /*********************************************
     * SETTERS
     ********************************************/

    setName(_name) {
        if(_name === undefined || _name === null) {
            this.name = '';
        } else {
            this.name = _name;
        }
    }

    setNameSpace(_namespace) {
        if(_namespace === undefined || _namespace === null) {
            this.namespace = null;
            return;
        }
        _namespace = _namespace.trim();
        if(_namespace.length <= 0) {
            this.namespace = null;
            return;
        }
        this.namespace = _namespace;
    }
}
// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
    util.Help.print(TypeSelector);
    return;
}
module.exports = TypeSelector;