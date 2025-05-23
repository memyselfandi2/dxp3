/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-lang-css
 *
 * NAME
 * UniversalSelector
 */
const packageName = 'dxp3-lang-css';
const moduleName = 'UniversalSelector';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * The universal selector, written "*", matches the name of any element type.
 * It matches any single element in the document tree.
 * If the universal selector is not the only component of a simple selector,
 * the "*" may be omitted. For example:
 *
 * - *[lang=fr] and [lang=fr] are equivalent.
 * - *.warning and .warning are equivalent.
 * - *#myid and #myid are equivalent.
 *
 * If the universal selector is combined with another simple selector by
 * a combinator it will attempt to match as many elements as possible. List of combinators:
 *
 * Adjacent sibling combinator (+)
 * It separates two selectors and matches the second element only if it immediately follows
 * the first element, and both are children of the same parent element.
 * In the case of the universal selector it will match any first sibling.
 * Example: div+*
 * 
 * Child combinator (>)
 * It matches only those elements matched by the second selector that are
 * the direct children of elements matched by the first.
 * In the case of the universal selector it will match all the children of
 * the first selector.
 * Example: div>*
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
 * In the case of the universal selector it will match all the descendants of
 * the first selector.
 * Example: div *
 *
 * Direct combinator ()
 * It combines two selectors directly without any characters between them and will
 * create a result set with elements that adhere to both selectors.
 * In the case of the universal selector it will match all the elements of the first
 * selector.
 * Example: div*
 *
 * General sibling combinator (~)
 * It separates two selectors and matches all iterations of the second element,
 * that are following the first element (though not necessarily immediately), and
 * are children of the same parent element.
 * In the case of the universal selector it will match all the siblings of
 * the first selector.
 * Example: div~*
 * 
 * @module dxp3-lang-css/UniversalSelector
 */
const AdjacentSiblingCombinator = require('./AdjacentSiblingCombinator');
const ChildCombinator = require('./ChildCombinator');
const DescendantCombinator = require('./DescendantCombinator');
const DirectCombinator = require('./DirectCombinator');
const GeneralSiblingCombinator = require('./GeneralSiblingCombinator');
const SimpleSelector = require('./SimpleSelector');
const util = require('dxp3-util');

class UniversalSelector extends SimpleSelector {
    /*********************************************
     * CONSTRUCTOR
     ********************************************/

    constructor(_namespace) {
        super();
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
            return domDocument.getElements();
        }
        if(combinator instanceof AdjacentSiblingCombinator) {
            // For example: div+*
            return this.matchAdjacentSiblingCombinator(domDocument, domElementArray);
        }
        if(combinator instanceof ChildCombinator) {
            // For example: div>*
            return this.matchChildCombinator(domDocument, domElementArray);
        }
        if(combinator instanceof DescendantCombinator) {
            // For example: div *
            return this.matchDescendantCombinator(domDocument, domElementArray);
        }
        if(combinator instanceof DirectCombinator) {
            // For example: div*
            return this.matchDirectCombinator(domDocument, domElementArray);
        }
        if(combinator instanceof GeneralSiblingCombinator) {
            // For example: div~*
            return this.matchGeneralSiblingCombinator(domDocument, domElementArray);
        }
    }

    /*
     * Adjacent sibling combinator (+)
     * It separates two selectors and matches the second element only if it immediately follows
     * the first element, and both are children of the same parent element.
     * In the case of the universal selector it will match any first sibling.
     * Example: div+*
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
            result.push(adjacentSibling);
        }
        return result;
    }

    /*
     * Child combinator (>)
     * It matches only those elements matched by the second selector that are
     * the direct children of elements matched by the first.
     * In the case of the universal selector it will match all the children of
     * the first selector.
     * Example: div>*
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
            result.concat(domElement.getChildElements());
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
     * In the case of the universal selector it will match all the descendants of
     * the first selector.
     * Example: div *
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
                tmpMap.set(descendant.domIndex, descendant);
            }
        }
        return Array.from(tmpMap.values());
    }

    /*
     * Direct combinator ()
     * It combines two selectors directly without any characters between them and will
     * create a result set with elements that adhere to both selectors.
     * In the case of the universal selector it will match all the elements of the first
     * selector.
     * Example: div*
     */
    matchDirectCombinator(domDocument, domElementArray) {
        // Defensive programming...check input...
        if(domDocument === undefined || domDocument === null) {
            return [];
        }
        if(domElementArray === undefined || domElementArray === null) {
            return [];
        }
        return domElementArray;
    }

    /*
     * General sibling combinator (~)
     * It separates two selectors and matches all iterations of the second element,
     * that are following the first element (though not necessarily immediately), and
     * are children of the same parent element.
     * In the case of the universal selector it will match all the siblings of
     * the first selector.
     * Example: div~*
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
            result.concat(siblings);
        }
        return result;
    }

    toString() {
        if(this.namespace === null) {
            return '*';
        }
        return this.namespace + '|*';
    }

    /*********************************************
     * GETTERS
     ********************************************/

    getNameSpace() {
        return this.namespace;
    }

    /*********************************************
     * SETTERS
     ********************************************/

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
    util.Help.print(UniversalSelector);
    return;
}
module.exports = UniversalSelector;