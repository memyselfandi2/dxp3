/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-lang-css
 *
 * NAME
 * PseudoElementSelector
 */
const packageName = 'dxp3-lang-css';
const moduleName = 'PseudoElementSelector';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * ::after
 * specifies content to be inserted after another element
 * 
 * ::before
 * specifies content to be inserted before another element
 * 
 * ::first-letter
 * represents the first character of the first line of text within an element
 * 
 * ::first-line
 * represents the first formatted line of text
 * 
 * ::selection
 * represents a part of the document that’s been highlighted by the user
 *
 * @module dxp3-lang-css/PseudoElementSelector
 */
const SimpleSelector = require('./SimpleSelector');
const util = require('dxp3-util');

class PseudoElementSelector extends SimpleSelector {
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

    parse(typeAsString) {
        if(typeAsString === undefined || typeAsString === null) {
            return PseudoElementSelector.UNKNOWN;
        }
        typeAsString = typeAsString.trim();
        if(typeAsString.length <= 0) {
            return PseudoElementSelector.UNKNOWN;
        }
        typeAsString = typeAsString.toLowerCase();
        switch(typeAsString) {
            case 'after':
                return PseudoElementSelector.AFTER;
            case 'before':
                return PseudoElementSelector.BEFORE;
            case 'cue':
                return PseudoElementSelector.CUE;
            case 'cueregion':
            case 'cue region':
            case 'cue-region':
            case 'cue_region':
                return PseudoElementSelector.CUE_REGION;
            case 'firstletter':
            case 'first letter':
            case 'first-letter':
            case 'first_letter':
                return PseudoElementSelector.FIRST_LETTER;
            case 'firstline':
            case 'first line':
            case 'first-line':
            case 'first_line':
                return PseudoElementSelector.FIRST_LINE;
            case 'selection':
                return PseudoElementSelector.SELECTION;
            default:
                return PseudoElementSelector.UNKNOWN;
        }
    }

    toString() {
        let result = '::';
        if(this.type === PseudoElementSelector.UNKNOWN) {
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

    setType(_type) {
        this.typeName = _type;
        this.type = this.parse(_type);
    }
}
PseudoElementSelector.AFTER = 'after';
PseudoElementSelector.BEFORE = 'before';
PseudoElementSelector.CUE = 'cue';
PseudoElementSelector.CUE_REGION = 'cue-region';
PseudoElementSelector.FIRST_LETTER = 'first-letter';
PseudoElementSelector.FIRST_LINE = 'first-line';
PseudoElementSelector.SELECTION = 'selection';
PseudoElementSelector.UNKNOWN = 'unknown';

// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
    util.Help.print(PseudoElementSelector);
    return;
}
module.exports = PseudoElementSelector;