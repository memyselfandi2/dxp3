/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-lang-css
 *
 * NAME
 * SelectorTokenizer
 */
const packageName = 'dxp3-lang-css';
const moduleName = 'SelectorTokenizer';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * @module dxp3-lang-css/SelectorTokenizer
 */
const logging = require('dxp3-logging');
const util = require('dxp3-util');
// Combinators
const Combinator = require('./Combinator');
const AdjacentSiblingCombinator = require('./AdjacentSiblingCombinator');
const ChildCombinator = require('./ChildCombinator');
const DescendantCombinator = require('./DescendantCombinator');
const DirectCombinator = require('./DirectCombinator');
const GeneralSiblingCombinator = require('./GeneralSiblingCombinator');
// Selectors
const Selector = require('./Selector');
const SimpleSelector = require('./SimpleSelector');
const AttributeSelector = require('./AttributeSelector');
const ClassSelector = require('./ClassSelector');
const IDSelector = require('./IDSelector');
const PseudoClassSelector = require('./PseudoClassSelector');
const PseudoElementSelector = require('./PseudoElementSelector');
const TypeSelector = require('./TypeSelector');
const UniversalSelector = require('./UniversalSelector');
// Separator
const SelectorSeparator = require('./SelectorSeparator');

const SelectorTokenizerOptions = require('./SelectorTokenizerOptions');
const SelectorTokenizerState = require('./SelectorTokenizerState');

class SelectorTokenizer {
    /*********************************************
     * CONSTRUCTOR
     ********************************************/

	constructor(_text) {
		if(_text != undefined && _text != null) {
			this.initialize(_text);
		} else {
			this._reset();
		}
	}

    /*********************************************
     * PUBLIC METHODS
     ********************************************/

	/**
	 * This is an alias for our initialize method.
	 */
	init(_text) {
		this.initialize(_text);
	}
    /**
     * Initialize our selector tokenizer with the text to parse.
     */
	initialize(_text) {
		this._reset();
		// Defensive programming...check input...
		if(_text === undefined || _text === null) {
			_text = '';
		}
		this.text = _text;
        this.length = this.text.length;
	}
    /**
     * This is an alias for our initialize method.
     */
    load(_text) {
        this.initialize(_text);
    }
    /**
     * This is an alias for our nextSelector method.
     */
    next(callback) {
        this.nextSelector(callback);
    }

    nextSelector(callback) {
        let self = this;
        let selector = null;
        let processSelectorElement = function(selectorElement) {
            // If the supplied selector element is null, or if the supplied
            // selecter element is a separator, we have finished.
            if((selectorElement === null) || (selectorElement instanceof SelectorSeparator)) {
                // Return the current selector.
                return callback(selector);
            }
            // Apparently we have not yet finished reading all the different
            // elements of the selector. Lets start or continue.
            if(selector === null) {
                // If this was the first selector element we found, we still need to create
                // an actual selector instance.
                selector = new Selector();
            }
            if(selectorElement instanceof Combinator) {
                selector.addCombinator(selectorElement);
            } else if(selectorElement instanceof SimpleSelector) {
                selector.addSimpleSelector(selectorElement);
            }
            // Lets keep going
            self.nextSelectorElement(processSelectorElement);
        }
        self.nextSelectorElement(processSelectorElement);
    }

    nextSelectorElement(callback) {
        let selectorElement = null;
        // Keep reading until we have reached the end of the text.
        while (this.state != SelectorTokenizerState.PARSING_END_OF_FILE) {
            switch(this.state) {
                case SelectorTokenizerState.INITIALIZED:
                case SelectorTokenizerState.PARSING_SIMPLE_SELECTOR:
                    selectorElement = this._readSimpleSelector();
                    break;
                case SelectorTokenizerState.PARSING_SELECTOR_SEPARATOR:
                    selectorElement = new SelectorSeparator();
                    this._setState(SelectorTokenizerState.PARSING_SIMPLE_SELECTOR);
                    break;
                case SelectorTokenizerState.PARSING_PSEUDO_CLASS_SELECTOR:
                    selectorElement = this._readPseudoClassSelector();
                    break;
                case SelectorTokenizerState.PARSING_PSEUDO_ELEMENT_SELECTOR:
                    selectorElement = this._readPseudoElementSelector();
                    break;
                case SelectorTokenizerState.PARSING_ATTRIBUTE_SELECTOR:
                    selectorElement = this._readAttributeSelector();
                    break;
                case SelectorTokenizerState.PARSING_CLASS_SELECTOR:
                    selectorElement = this._readClassSelector();
                    break;
                case SelectorTokenizerState.PARSING_COMBINATOR:
                    selectorElement = this._readCombinator();
                    break;
                case SelectorTokenizerState.PARSING_ID_SELECTOR:
                    selectorElement = this._readIDSelector();
                    break;
                case SelectorTokenizerState.PARSING_UNIVERSAL_SELECTOR:
                    selectorElement = this._readUniversalSelector();
                    break;
                case SelectorTokenizerState.PARSING_TYPE_SELECTOR:
                    selectorElement = this._readTypeSelector();
                    break;
                default:
                    break;
            }
            // If we found a valid SelectorElement, lets return it.
            if (selectorElement != null) {
                return callback(selectorElement);
            }
        }
        return callback(selectorElement);
    }

    /*********************************************
     * SETTERS
     ********************************************/

    /**
     * This is an alias for our initialize method.
     */
    setText(_text) {
        this.initialize(_text);
    }

    /*********************************************
     * PRIVATE METHODS
     ********************************************/

    // Read one character.
    _read() {
        this.index++;
        if(this.index >= this.length) {
            return null;
        }
        return this.text.charAt(this.index);
    }
    _readAttributeSelector() {
        let simpleSelector = null;
        let parsingState = SelectorTokenizerState.PARSING_ATTRIBUTE_SELECTOR;
        let textRead = '';
        let attributeName = null;
        let attributeOperator = null;
        let attributeValue = null;
        let character = null;
        while ((character = this._read()) != null) {
            switch(parsingState) {
                case SelectorTokenizerState.PARSING_ATTRIBUTE_SELECTOR:
                    switch (character) {
                        case ']':
                            simpleSelector = new AttributeSelector();
                            simpleSelector.setName(textRead);
                            simpleSelector.setOperator(null);
                            this._setState(SelectorTokenizerState.PARSING_COMBINATOR);
                            return simpleSelector;
                        case '|':
                            attributeName = textRead;
                            textRead = '';
                            parsingState = SelectorTokenizerState.PARSING_ATTRIBUTE_SELECTOR_OPERATOR_PIPE;
                            break;
                        case '^':
                            attributeName = textRead;
                            textRead = '';
                            parsingState = SelectorTokenizerState.PARSING_ATTRIBUTE_SELECTOR_OPERATOR_UP;
                            break;
                        case '&':
                            attributeName = textRead;
                            textRead = '';
                            parsingState = SelectorTokenizerState.PARSING_ATTRIBUTE_SELECTOR_OPERATOR_DOLLAR;
                            break;
                        case '*':
                            attributeName = textRead;
                            textRead = '';
                            parsingState = SelectorTokenizerState.PARSING_ATTRIBUTE_SELECTOR_OPERATOR_ASTERISK;
                            break;
                        case '=':
                            attributeName = textRead;
                            attributeOperator = AttributeSelector.EQUALS;
                            textRead = '';
                            parsingState = SelectorTokenizerState.PARSING_ATTRIBUTE_SELECTOR_VALUE;
                            break;
                        case '~':
                            attributeName = textRead;
                            textRead = '';
                            parsingState = SelectorTokenizerState.PARSING_ATTRIBUTE_SELECTOR_OPERATOR_TILDE;
                            break;
                        default:
                            textRead += character;
                            break;
                    }
                    break;
                case SelectorTokenizerState.PARSING_ATTRIBUTE_SELECTOR_OPERATOR_ASTERISK:
                    switch (character) {
                        case '=':
                            attributeOperator = AttributeSelector.ASTERISK_EQUALS;
                            parsingState = SelectorTokenizerState.PARSING_ATTRIBUTE_SELECTOR_VALUE;
                            break;
                        default:
                            parsingState = SelectorTokenizerState.PARSING_ATTRIBUTE_SELECTOR_END;
                            break;
                    }
                    break;
                case SelectorTokenizerState.PARSING_ATTRIBUTE_SELECTOR_OPERATOR_DOLLAR:
                    switch (character) {
                        case '=':
                            attributeOperator = AttributeSelector.DOLLAR_EQUALS;
                            parsingState = SelectorTokenizerState.PARSING_ATTRIBUTE_SELECTOR_VALUE;
                            break;
                        default:
                            parsingState = SelectorTokenizerState.PARSING_ATTRIBUTE_SELECTOR_END;
                            break;
                    }
                    break;
                case SelectorTokenizerState.PARSING_ATTRIBUTE_SELECTOR_OPERATOR_UP:
                    switch (character) {
                        case '=':
                            attributeOperator = AttributeSelector.UP_EQUALS;
                            parsingState = SelectorTokenizerState.PARSING_ATTRIBUTE_SELECTOR_VALUE;
                            break;
                        default:
                            parsingState = SelectorTokenizerState.PARSING_ATTRIBUTE_SELECTOR_END;
                            break;
                    }
                    break;
                case SelectorTokenizerState.PARSING_ATTRIBUTE_SELECTOR_OPERATOR_PIPE:
                    switch (character) {
                        case '=':
                            attributeOperator = AttributeSelector.PIPE_EQUALS;
                            parsingState = SelectorTokenizerState.PARSING_ATTRIBUTE_SELECTOR_VALUE;
                            break;
                        default:
                            parsingState = SelectorTokenizerState.PARSING_ATTRIBUTE_SELECTOR_END;
                            break;
                    }
                    break;
                case SelectorTokenizerState.PARSING_ATTRIBUTE_SELECTOR_OPERATOR_TILDE:
                    switch (character) {
                        case '=':
                            attributeOperator = AttributeSelector.TILDE_EQUALS;
                            parsingState = SelectorTokenizerState.PARSING_ATTRIBUTE_SELECTOR_VALUE;
                            break;
                        default:
                            parsingState = SelectorTokenizerState.PARSING_ATTRIBUTE_SELECTOR_END;
                            break;
                    }
                    break;
                case SelectorTokenizerState.PARSING_ATTRIBUTE_SELECTOR_VALUE:
                    switch (character) {
                        case ']':
                            simpleSelector = new AttributeSelector();
                            simpleSelector.setName(attributeName);
                            simpleSelector.setOperator(attributeOperator);
                            simpleSelector.setValue(textRead);
                            this._setState(SelectorTokenizerState.PARSING_COMBINATOR);
                            return simpleSelector;
                        case '\'':
                            parsingState = SelectorTokenizerState.PARSING_ATTRIBUTE_SELECTOR_VALUE_SINGLE_QUOTED;
                            break;
                        case '"':
                            parsingState = SelectorTokenizerState.PARSING_ATTRIBUTE_SELECTOR_VALUE_DOUBLE_QUOTED;
                            break;
                        default:
                            textRead += character;
                            parsingState = SelectorTokenizerState.PARSING_ATTRIBUTE_SELECTOR_VALUE_NO_QUOTES;
                            break;
                    }
                    break;
                case SelectorTokenizerState.PARSING_ATTRIBUTE_SELECTOR_VALUE_NO_QUOTES:
                    switch (character) {
                        case ']':
                            simpleSelector = new AttributeSelector();
                            simpleSelector.setName(attributeName);
                            simpleSelector.setOperator(attributeOperator);
                            simpleSelector.setValue(textRead);
                            this._setState(SelectorTokenizerState.PARSING_COMBINATOR);
                            return simpleSelector;
                        default:
                            textRead += character;
                            break;
                    }
                    break;
                case SelectorTokenizerState.PARSING_ATTRIBUTE_SELECTOR_VALUE_SINGLE_QUOTED:
                    switch (character) {
                        case '\'':
                            attributeValue = textRead;
                            parsingState = SelectorTokenizerState.PARSING_ATTRIBUTE_SELECTOR_END;
                            break;
                        default:
                            textRead += character;
                            break;
                    }
                    break;
                case SelectorTokenizerState.PARSING_ATTRIBUTE_SELECTOR_VALUE_DOUBLE_QUOTED:
                    switch (character) {
                        case '"':
                            attributeValue = textRead;
                            parsingState = SelectorTokenizerState.PARSING_ATTRIBUTE_SELECTOR_END;
                            break;
                        default:
                            textRead += character;
                            break;
                    }
                    break;
                case SelectorTokenizerState.PARSING_ATTRIBUTE_SELECTOR_END:
                    switch (character) {
                        case ']':
                            let simpleSelector = new AttributeSelector();
                            simpleSelector.setName(attributeName);
                            simpleSelector.setOperator(attributeOperator);
                            simpleSelector.setValue(attributeValue);
                            this._setState(SelectorTokenizerState.PARSING_COMBINATOR);
                            return simpleSelector;
                        default:
                            break;
                    }
                    break;
                default:
                    break;
            }
        }
        // If we arrive here we have reached the end of the file.
        this._setState(SelectorTokenizerState.PARSING_END_OF_FILE);
        return null;
    }
    _readClassSelector() {
        let simpleSelector = null;
        let parsingState = SelectorTokenizerState.PARSING_CLASS_SELECTOR;
        let textRead = '';
        let character = null;
        while ((character = this._read()) != null) {
            switch (character) {
                case '.':
                case '#':
                case ' ':
                case '\t':
                case '\n':
                case '+':
                case '~':
                case '>':
                case ':':
                case '[':
                    simpleSelector = new ClassSelector(textRead);
                    this._setState(SelectorTokenizerState.PARSING_COMBINATOR);
                    this._unread();
                    return simpleSelector;
                case ',':
                    simpleSelector = new ClassSelector(textRead);
                    this._setState(SelectorTokenizerState.PARSING_SELECTOR_SEPARATOR);
                    return simpleSelector;
                default:
                    textRead += character;
                    break;
            }
        }
        if(textRead.length > 0) {
            simpleSelector = new ClassSelector(textRead);
        }
        // If we arrive here we have reached the end of the file.
        this._setState(SelectorTokenizerState.PARSING_END_OF_FILE);
        return simpleSelector;
    }
    _readCombinator() {
        let combinator = null;
        let character = null;
        while ((character = this._read()) != null) {
            switch (character) {
                case ' ':
                case '\t':
                case '\n':
                    combinator = new DescendantCombinator();
                    this._setState(SelectorTokenizerState.PARSING_SIMPLE_SELECTOR);
                    return combinator;
                case '+':
                    combinator = new AdjacentSiblingCombinator();
                    this._setState(SelectorTokenizerState.PARSING_SIMPLE_SELECTOR);
                    return combinator;
                case '~':
                    combinator = new GeneralSiblingCombinator();
                    this._setState(SelectorTokenizerState.PARSING_SIMPLE_SELECTOR);
                    return combinator;
                case '>':
                    combinator = new ChildCombinator();
                    this._setState(SelectorTokenizerState.PARSING_SIMPLE_SELECTOR);
                    return combinator;
                default:
                    combinator = new DirectCombinator();
                    this._setState(SelectorTokenizerState.PARSING_SIMPLE_SELECTOR);
                    this._unread();
                    return combinator;
            }
        }
        // If we arrive here we have reached the end of the file.
        this._setState(SelectorTokenizerState.PARSING_END_OF_FILE);
        return combinator;
    }
    _readIDSelector() {
        let simpleSelector = null;
        let parsingState = SelectorTokenizerState.PARSING_PSEUDO_CLASS_SELECTOR;
        let textRead = '';
        let character = null;
        while ((character = this._read()) != null) {
            switch (character) {
                case '.':
                case '#':
                case ' ':
                case '\t':
                case '\n':
                case '+':
                case '~':
                case '>':
                case ':':
                case '[':
                    simpleSelector = new IDSelector(textRead);
                    this._setState(SelectorTokenizerState.PARSING_COMBINATOR);
                    this._unread();
                    return simpleSelector;
                case ',':
                    simpleSelector = new IDSelector(textRead);
                    this._setState(SelectorTokenizerState.PARSING_SELECTOR_SEPARATOR);
                    return simpleSelector;
                default:
                    textRead += character;
                    break;
            }
        }
        if(textRead.length > 0) {
            simpleSelector = new IDSelector(textRead);
        }
        // If we arrive here we have reached the end of the file.
        this._setState(SelectorTokenizerState.PARSING_END_OF_FILE);
        return simpleSelector;
    }
    _readPseudoClassSelector() {
        let simpleSelector = null;
        let textRead = '';
        let character = null;
        while ((character = this._read()) != null) {
            switch (character) {
                case ':':
                    this._setState(SelectorTokenizerState.PARSING_PSEUDO_ELEMENT_SELECTOR);
                    return null;
                case '.':
                case '#':
                case ' ':
                case '\t':
                case '\n':
                case '+':
                case '~':
                case '>':
                case '[':
                    simpleSelector = new PseudoClassSelector(textRead);
                    this._setState(SelectorTokenizerState.PARSING_COMBINATOR);
                    this._unread();
                    return simpleSelector;
                case ',':
                    simpleSelector = new PseudoClassSelector(textRead);
                    this._setState(SelectorTokenizerState.PARSING_SELECTOR_SEPARATOR);
                    return simpleSelector;
                default:
                    textRead += character;
                    break;
            }
        }
        if(textRead.length > 0) {
            simpleSelector = new PseudoClassSelector(textRead);
        }
        // If we arrive here we have reached the end of the file.
        this._setState(SelectorTokenizerState.PARSING_END_OF_FILE);
        return simpleSelector;
    }
    _readPseudoElementSelector() {
        let simpleSelector = null;
        let textRead = '';
        let character = null;
        while ((character = this._read()) != null) {
            switch (character) {
                case '.':
                case '#':
                case ' ':
                case '\t':
                case '\n':
                case '+':
                case '~':
                case '>':
                case '[':
                case ':':
                    simpleSelector = new PseudoElementSelector(textRead);
                    this._setState(SelectorTokenizerState.PARSING_COMBINATOR);
                    this._unread();
                    return simpleSelector;
                case ',':
                    simpleSelector = new PseudoElementSelector(textRead);
                    this._setState(SelectorTokenizerState.PARSING_SELECTOR_SEPARATOR);
                    return simpleSelector;
                default:
                    textRead += character;
                    break;
            }
        }
        if(textRead.length > 0) {
            simpleSelector = new PseudoElementSelector(textRead);
        }
        // If we arrive here we have reached the end of the file.
        this._setState(SelectorTokenizerState.PARSING_END_OF_FILE);
        return simpleSelector;
    }
    _readSimpleSelector() {
        let character = null;
        while ((character = this._read()) != null) {
            switch (character) {
                // Ignore whitespace
                case ' ':
                case '\t':
                case '\r':
                case '\n':
                    break;
                case '[':
                    this._setState(SelectorTokenizerState.PARSING_ATTRIBUTE_SELECTOR);
                    return null;
                case '.':
                    this._setState(SelectorTokenizerState.PARSING_CLASS_SELECTOR);
                    return null;
                case '#':
                    this._setState(SelectorTokenizerState.PARSING_ID_SELECTOR);
                    return null;
                case '*':
                    this._setState(SelectorTokenizerState.PARSING_UNIVERSAL_SELECTOR);
                    return null;
                case ':':
                    this._setState(SelectorTokenizerState.PARSING_PSEUDO_CLASS_SELECTOR);
                    return null;
                case '*':
                    this._setState(SelectorTokenizerState.PARSING_UNIVERSAL_SELECTOR);
                    return null;
                case ',':
                    this._setState(SelectorTokenizerState.PARSING_SELECTOR_SEPARATOR);
                    return null;
                default:
                    this._setState(SelectorTokenizerState.PARSING_TYPE_SELECTOR);
                    this._unread();
                    return null;
            }
        }
        // If we arrive here we have reached the end of the file.
        this._setState(SelectorTokenizerState.PARSING_END_OF_FILE);
        return null;
     }
    _readTypeSelector() {
        let simpleSelector = null;
        let textRead = '';
        let character = null;
        while ((character = this._read()) != null) {
            switch (character) {
                case '.':
                case '#':
                case ' ':
                case '\t':
                case '\n':
                case '+':
                case '~':
                case '>':
                case ':':
                case '[':
                    simpleSelector = new TypeSelector(textRead);
                    this._setState(SelectorTokenizerState.PARSING_COMBINATOR);
                    this._unread();
                    return simpleSelector;
                case ',':
                    simpleSelector = new TypeSelector(textRead);
                    this._setState(SelectorTokenizerState.PARSING_SELECTOR_SEPARATOR);
                    return simpleSelector;
                default:
                    textRead += character;
                    break;
            }
        }
        if(textRead.length > 0) {
            simpleSelector = new TypeSelector(textRead);
        }
        // If we arrive here we have reached the end of the file.
        this._setState(SelectorTokenizerState.PARSING_END_OF_FILE);
        return simpleSelector;
    }
    _readUniversalSelector() {
        let simpleSelector = new UniversalSelector();
        this._setState(SelectorTokenizerState.PARSING_COMBINATOR);
        return simpleSelector;
    }

    // Reset everything.
    _reset() {
        this.index = -1;
        this.length = 0;
        this.text = '';
        this._setState(SelectorTokenizerState.INITIALIZED);
    }
    // Set our state.
    _setState(_state) {
        this.state = _state;
    }
    // Unread one character.
    _unread() {
        this.index--;
    }

    static main() {
        try {
            let selectorTokenizerOptions = SelectorTokenizerOptions.parseCommandLine();
            logging.setLevel(selectorTokenizerOptions.logLevel);
            if(selectorTokenizerOptions.help) {
                util.Help.print(this);
                return;
            }
            let selectorText = selectorTokenizerOptions.text;
            let selectorTokenizer = new SelectorTokenizer(selectorText);
            let processNextSelector = (_selector) => {
                if(_selector != null) {
                    console.log('SELECTOR: ' + _selector.toString());
                    selectorTokenizer.nextSelector(processNextSelector);
                }
            }
            selectorTokenizer.nextSelector(processNextSelector);
        } catch(exception) {
            console.log(exception);
        }
    }
}
// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
    SelectorTokenizer.main();
    return;
}
module.exports = SelectorTokenizer;