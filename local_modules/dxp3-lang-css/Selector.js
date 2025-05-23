/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-lang-css
 *
 * NAME
 * Selector
 */
const packageName = 'dxp3-lang-css';
const moduleName = 'Selector';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/*
 * A selector is a list of simple selectors separated by combinators.
 *
 * @module dxp3-lang-css/Selector
 */
const util = require('dxp3-util');

class Selector {
    /*********************************************
     * CONSTRUCTOR
     ********************************************/

    constructor() {
        this.simpleSelectors = [];
        this.combinators = [];
    }

    /*********************************************
     * PUBLIC METHODS
     ********************************************/

    match(domDocument) {
        if(this.simpleSelectors.length <= 0) {
            return [];
        }
        let simpleSelector = this.simpleSelectors[0];
        let result = simpleSelector.match(domDocument);
        if(this.combinators.length <= 0) {
            return result;
        }
        let index = 0;
        let combinator = null;
        do {
            combinator = this.combinators[index++];
            if(combinator === undefined || combinator === null) {
                return result;
            }
            simpleSelector = this.simpleSelectors[index];
            if(simpleSelector === undefined || simpleSelector === null) {
                return result;
            }
            result = simpleSelector.match(domDocument,result,combinator);
        } while(index < this.combinators.length);
        return result;
    }

    toString() {
        let result = '';
        let numberOfCombinators = this.combinators.length;
        for(let i=0;i < this.simpleSelectors.length;i++) {
            result += this.simpleSelectors[i].toString();
            if(i < numberOfCombinators) {
                result += this.combinators[i].toString();
            }
        }
        return result;
    }

    /*********************************************
     * GETTERS
     ********************************************/

    getSimpleSelectors() {
        return this.simpleSelectors;
    }

    getCombinators() {
        return this.combinators;
    }

    /*********************************************
     * SETTERS
     ********************************************/

    addSimpleSelector(_simpleSelector) {
        if(_simpleSelector === undefined || _simpleSelector == null) {
            return;
        }
        this.simpleSelectors.push(_simpleSelector);
    }

    addCombinator(_combinator) {
        if(_combinator === undefined || _combinator === null) {
            return;
        }
        this.combinators.push(_combinator);
    }
}
// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
    util.Help.print(Selector);
    return;
}
module.exports = Selector;