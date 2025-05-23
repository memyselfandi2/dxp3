/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-lang-css
 *
 * NAME
 * CSSTokenizer
 */
const packageName = 'dxp3-lang-css';
const moduleName = 'CSSTokenizer';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * @module dxp3-lang-css/CSSTokenizer
 */
const CSSCharsetAtRule = require('./CSSCharsetAtRule');
const CSSComment = require('./CSSComment');
const CSSDeclarationGroup = require('./CSSDeclarationGroup');
const CSSFontFaceAtRule = require('./CSSFontFaceAtRule');
const CSSKeyFramesAtRule = require('./CSSKeyFramesAtRule');
const CSSMediaAtRule = require('./CSSMediaAtRule');
const CSSRule = require('./CSSRule');
const CSSTokenizerOptions = require('./CSSTokenizerOptions');
const CSSTokenizerState = require('./CSSTokenizerState');
const http = require('http');
const https = require('https');
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

const logger = logging.getLogger(canonicalName);

class CSSTokenizer {
    /*********************************************
     * CONSTRUCTOR
     ********************************************/

	constructor(_css) {
		if(_css != undefined && _css != null) {
			this.initialize(_css);
		} else {
			this.reset();
		}
	}

    /*********************************************
     * PUBLIC METHODS
     ********************************************/

    /**
     * This is an alias for our initialize method.
     */
    init(_css) {
        this.initialize(_css);
    }

    initialize(_css) {
        this.reset();
        // Defensive programming...check input...
        if(_css === undefined || _css === null) {
            _css = '';
        }
        this.css = _css;
        this.length = this.css.length;
    }
    /**
     * This is an alias for our initialize method.
     */
    load(_css) {
        this.initialize(_css);
    }
    /**
     * Set a marker to get back to.
     */
    mark() {
        this.marker = this.index;
    }

    async nextCSSElement() {
        let self = this;
        return new Promise((resolve, reject) => {
            logger.trace('nextCSSElement(...): start.');
            let callback = CSSTokenizer._createCallbackToPromise(resolve, reject);
            try {
                let cssElement = null;
                // Keep reading until we have reached the end of the file/text.
                while (this.state != CSSTokenizerState.PARSING_END_OF_FILE) {
                    logger.debug('nextCSSElement(...): State: ' + this.state);
                    switch (this.state) {
                        case CSSTokenizerState.INITIALIZED:
                            this._setState(CSSTokenizerState.PARSING_RULE);                    
                            break;
                        case CSSTokenizerState.PARSING:
                            this._setState(CSSTokenizerState.PARSING_RULE);
                            break;
                        case CSSTokenizerState.PARSING_COMMENT:
                            cssElement = this._readCSSComment();
                            break;
                        case CSSTokenizerState.PARSING_RULE:
                            cssElement = this._readCSSRule();
                            break;
                        case CSSTokenizerState.PARSING_AT_RULE:
                            cssElement = this._readCSSAtRule();
                            this._setState(CSSTokenizerState.PARSING_RULE);
                            break;
                        case CSSTokenizerState.PARSING_ERROR:
                            logger.trace('nextCSSElement(...): end.');
                            return callback('Something went wrong parsing.');
                        // This should never be reached!
                        default:
                            logger.warn('Unknown state \'' + this.state + '\' while parsing the next CSS element.');
                            logger.trace('nextCSSElement(...): end.');
                            return callback('Unknown state \'' + this.state + '\'');
                    }
                    if (cssElement != null) {
                        logger.debug('CSSElement: ' + cssElement.toString());
                        logger.trace('nextCSSElement(...): end.');
                        return callback(null, cssElement);
                    }
                }
                logger.trace('nextCSSElement(...): end.');
                return callback(null, cssElement);
            } catch(exception) {
                callback(exception);
            }
        });
    }

    /**
     * This is an alias for our initialize method.
     */
    parse(_css) {
        this.initialize(_css);
    }

    reset() {
        this.index = -1;
        this.length = 0;
        this.css = '';
        this.marker = -1;
        this._setState(CSSTokenizerState.INITIALIZED);
    }

    /*********************************************
     * GETTERS
     ********************************************/

	getCSS() {
		return this.css;
	}

	getState() {
		return this.state;
	}

    /*********************************************
     * SETTERS
     ********************************************/

    /**
     * This is an alias for our initialize method.
     */
    setCSS(_css) {
        this.initialize(_css);
    }

    /*********************************************
     * PRIVATE METHODS
     ********************************************/

	_read() {
        this.index++;
        if(this.index >= this.length) {
            return null;
        }
        // console.log(this.css.charAt(this.index));
        return this.css.charAt(this.index);
    }

	_setState(_state) {
		this.state = _state;
	}

    _toMark() {
        this.index = this.marker;
    }

    static _createCallbackToPromise(resolve, reject) {
        return (err, result) => {
            if (err) {
                if (reject) {
                    reject(err);
                }
            }
            else {
                if (resolve) {
                    resolve(result);
                }
            }
        };
    }

    _readCSSRule() {
        logger.trace('_readCSSRule(...): start.');
        let textRead = '';
        let selectorGroup = null;
        let character = null;
        this.mark();
        while ((character = this._read()) != null) {
            switch(this.state) {
                case CSSTokenizerState.PARSING_RULE:
                    switch(character) {
                        case ' ': case '\t': case '\r': case '\n':
                            break;
                        case '/':
                            this._setState(CSSTokenizerState.PARSING_SLASH);
                            break;
                        case '@':
                            this._toMark();
                            this._setState(CSSTokenizerState.PARSING_AT_RULE);
                            logger.trace('_readCSSRule(...): end.');
                            return null;
                        default:
                            this._toMark();
                            let selectors = this._readSelectorGroup();
                            let declarationGroup = this._readDeclarationGroup();
                            // console.log('declarationgroup: ' + declarationGroup.toString());
                            let cssRule = new CSSRule();
                            for(let i=0;i < selectors.length;i++) {
                                cssRule.addSelector(selectors[i]);
                            }
                            cssRule.setDeclarationGroup(declarationGroup);
                            // console.log('CSSRULE: ' + cssRule.toString());
                            logger.trace('_readCSSRule(...): end.');
                            this._setState(CSSTokenizerState.PARSING_RULE);
                            return cssRule;
                    }
                    break;
                case CSSTokenizerState.PARSING_SLASH:
                    switch (character) {
                        case '*':
                            this._toMark();
                            this._setState(CSSTokenizerState.PARSING_COMMENT);
                            logger.trace('_readCSSRule(...): end.');
                            return null;
                        default:
                            this._setState(CSSTokenizerState.PARSING_ERROR);
                            logger.trace('_readCSSRule(...): end.');
                            return null;
                    }
                    break;
                default:
                    this._setState(CSSTokenizerState.PARSING_ERROR);
                    logger.trace('_readCSSRule(...): end.');
                    return null
            }
        }
        /*
         * the end of the file was reached before we finished reading the rule.
         */
        this._setState(CSSTokenizerState.PARSING_END_OF_FILE);
        logger.trace('_readCSSRule(...): end.');
        return null;
    }

    _readCSSComment() {
        logger.trace('_readCSSComment(...): start.');
        this._setState(CSSTokenizerState.PARSING_COMMENT);
        let textRead = '';
        let character = null;
        while ((character = this._read()) != null) {
            switch (this.state) {
                case CSSTokenizerState.PARSING_COMMENT:
                    switch(character) {
                        case ' ': case '\t': case '\r': case '\n':
                            break;
                        case '/':
                            this._setState(CSSTokenizerState.PARSING_SLASH);
                            break;
                        default:
                            this._setState(CSSTokenizerState.PARSING_ERROR);
                            logger.trace('_readCSSComment(...): end.');
                            return null;
                    }
                    break;
                case CSSTokenizerState.PARSING_SLASH:
                    switch (character) {
                        case '*':
                            this._setState(CSSTokenizerState.PARSING_SLASH_ASTERISK);
                            break;
                        default:
                            this._setState(CSSTokenizerState.PARSING_ERROR);
                            logger.trace('_readCSSComment(...): end.');
                            return null;
                    }
                    break;
                case CSSTokenizerState.PARSING_SLASH_ASTERISK:
                    switch (character) {
                        case '*':
                            this._setState(CSSTokenizerState.PARSING_COMMENT_ASTERISK);
                            break;
                        default:
                            textRead += character;
                            break;
                    }
                    break;
                case CSSTokenizerState.PARSING_COMMENT_ASTERISK:
                    switch (character) {
                        case '/':
                            this._setState(CSSTokenizerState.PARSING);
                            logger.trace('_readCSSComment(...): end.');
                            return new CSSComment(textRead);
                        default:
                            textRead += '*' + character;
                            this._setState(CSSTokenizerState.PARSING_SLASH_ASTERISK);
                            break;
                    }
                    break;
                default:
                    logger.trace('_readCSSComment(...): end.');
                    return null;
            }
        }
        /*
         * the end of the file was reached before we had completely read the comment. We give the author the benefit of
         * the doubt and return the remainder as a css comment.
         */
        this._setState(CSSTokenizerState.PARSING_END_OF_FILE);
        logger.trace('_readCSSComment(...): end.');
        return new CSSComment(textRead);
    }

    _readSelectorGroup() {
        logger.trace('_readSelectorGroup(...): start.');
        let selectors = [];
        this._setState(CSSTokenizerState.PARSING_SELECTOR_GROUP);
        // Keep reading until we hit { or end of line
        while (this.state != CSSTokenizerState.PARSING_END_OF_FILE) {
            let selector = this._readSelector();
            if(selector === undefined || selector === null) {
                return selectors;
            }
            selectors.push(selector);
        }
        /*
         * the end of the file was reached while parsing all the selectors.
         */
        logger.debug('_readSelectorGroup(...): reached end of file.');
        logger.trace('_readSelectorGroup(...): end.');
        return selectors;
    }

    _readSelector() {
        logger.trace('_readSelector(...): start.');
        let selector = null;
        let selectorElement = null;
        this._setState(CSSTokenizerState.PARSING_SELECTOR);
        // Keep reading until we hit { or end of line
        while (this.state != CSSTokenizerState.PARSING_END_OF_FILE) {
            selectorElement = this._readSelectorElement();
            // If the supplied selector element is null, or if the supplied
            // selecter element is a separator, we have finished.
            if((selectorElement === null) || (selectorElement instanceof SelectorSeparator)) {
                // Return the current selector.
                logger.trace('_readSelector(...): end.');
                return selector;
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
        }
        /*
         * the end of the file was reached while parsing the selector.
         */
        logger.debug('_readSelector(...): reached end of file.');
        logger.trace('_readSelector(...): end.');
        return selector;
    }

    _readSelectorElement() {
        logger.trace('_readSelectorElement(...): start.');
        let selectorElement = null;
        // Keep reading until we have reached the end of the text.
        while ((this.state != CSSTokenizerState.PARSING_END_OF_FILE) &&
               (this.state != CSSTokenizerState.PARSING_DECLARATION_GROUP)) {
            switch(this.state) {
                case CSSTokenizerState.PARSING_SELECTOR:
                case CSSTokenizerState.PARSING_SIMPLE_SELECTOR:
                    selectorElement = this._readSimpleSelector();
                    break;
                case CSSTokenizerState.PARSING_SELECTOR_SEPARATOR:
                    selectorElement = new SelectorSeparator();
                    this._setState(CSSTokenizerState.PARSING_SIMPLE_SELECTOR);
                    break;
                case CSSTokenizerState.PARSING_PSEUDO_CLASS_SELECTOR:
                    selectorElement = this._readPseudoClassSelector();
                    break;
                case CSSTokenizerState.PARSING_PSEUDO_ELEMENT_SELECTOR:
                    selectorElement = this._readPseudoElementSelector();
                    break;
                case CSSTokenizerState.PARSING_ATTRIBUTE_SELECTOR:
                    selectorElement = this._readAttributeSelector();
                    break;
                case CSSTokenizerState.PARSING_CLASS_SELECTOR:
                    selectorElement = this._readClassSelector();
                    break;
                case CSSTokenizerState.PARSING_COMBINATOR:
                    selectorElement = this._readCombinator();
                    break;
                case CSSTokenizerState.PARSING_ID_SELECTOR:
                    selectorElement = this._readIDSelector();
                    break;
                case CSSTokenizerState.PARSING_UNIVERSAL_SELECTOR:
                    selectorElement = this._readUniversalSelector();
                    break;
                case CSSTokenizerState.PARSING_TYPE_SELECTOR:
                    selectorElement = this._readTypeSelector();
                    break;
                default:
                    break;
            }
            // If we found a valid SelectorElement, lets return it.
            if (selectorElement != null) {
                return selectorElement;
            }
        }
        return selectorElement;
    }
    _readAttributeSelector() {
        let simpleSelector = null;
        let textRead = '';
        let attributeName = null;
        let attributeOperator = null;
        let attributeValue = null;
        let character = null;
        while ((character = this._read()) != null) {
            switch(this.state) {
                case CSSTokenizerState.PARSING_ATTRIBUTE_SELECTOR:
                    switch (character) {
                        case ']':
                            simpleSelector = new AttributeSelector();
                            simpleSelector.setName(textRead);
                            simpleSelector.setOperator(null);
                            this._setState(CSSTokenizerState.PARSING_COMBINATOR);
                            return simpleSelector;
                        case '|':
                            attributeName = textRead;
                            textRead = '';
                            this._setState(CSSTokenizerState.PARSING_ATTRIBUTE_SELECTOR_OPERATOR_PIPE);
                            break;
                        case '^':
                            attributeName = textRead;
                            textRead = '';
                            this._setState(CSSTokenizerState.PARSING_ATTRIBUTE_SELECTOR_OPERATOR_UP);
                            break;
                        case '&':
                            attributeName = textRead;
                            textRead = '';
                            this._setState(CSSTokenizerState.PARSING_ATTRIBUTE_SELECTOR_OPERATOR_DOLLAR);
                            break;
                        case '*':
                            attributeName = textRead;
                            textRead = '';
                            this._setState(CSSTokenizerState.PARSING_ATTRIBUTE_SELECTOR_OPERATOR_ASTERISK);
                            break;
                        case '=':
                            attributeName = textRead;
                            attributeOperator = AttributeSelector.EQUALS;
                            textRead = '';
                            this._setState(CSSTokenizerState.PARSING_ATTRIBUTE_SELECTOR_VALUE);
                            break;
                        case '~':
                            attributeName = textRead;
                            textRead = '';
                            this._setState(CSSTokenizerState.PARSING_ATTRIBUTE_SELECTOR_OPERATOR_TILDE);
                            break;
                        default:
                            textRead += character;
                            break;
                    }
                    break;
                case CSSTokenizerState.PARSING_ATTRIBUTE_SELECTOR_OPERATOR_ASTERISK:
                    switch (character) {
                        case '=':
                            attributeOperator = AttributeSelector.ASTERISK_EQUALS;
                            this._setState(CSSTokenizerState.PARSING_ATTRIBUTE_SELECTOR_VALUE);
                            break;
                        default:
                            this._setState(CSSTokenizerState.PARSING_ATTRIBUTE_SELECTOR_END);
                            break;
                    }
                    break;
                case CSSTokenizerState.PARSING_ATTRIBUTE_SELECTOR_OPERATOR_DOLLAR:
                    switch (character) {
                        case '=':
                            attributeOperator = AttributeSelector.DOLLAR_EQUALS;
                            this._setState(CSSTokenizerState.PARSING_ATTRIBUTE_SELECTOR_VALUE);
                            break;
                        default:
                            this._setState(CSSTokenizerState.PARSING_ATTRIBUTE_SELECTOR_END);
                            break;
                    }
                    break;
                case CSSTokenizerState.PARSING_ATTRIBUTE_SELECTOR_OPERATOR_UP:
                    switch (character) {
                        case '=':
                            attributeOperator = AttributeSelector.UP_EQUALS;
                            this._setState(CSSTokenizerState.PARSING_ATTRIBUTE_SELECTOR_VALUE);
                            break;
                        default:
                            this._setState(CSSTokenizerState.PARSING_ATTRIBUTE_SELECTOR_END);
                            break;
                    }
                    break;
                case CSSTokenizerState.PARSING_ATTRIBUTE_SELECTOR_OPERATOR_PIPE:
                    switch (character) {
                        case '=':
                            attributeOperator = AttributeSelector.PIPE_EQUALS;
                            this._setState(CSSTokenizerState.PARSING_ATTRIBUTE_SELECTOR_VALUE);
                            break;
                        default:
                            this._setState(CSSTokenizerState.PARSING_ATTRIBUTE_SELECTOR_END);
                            break;
                    }
                    break;
                case CSSTokenizerState.PARSING_ATTRIBUTE_SELECTOR_OPERATOR_TILDE:
                    switch (character) {
                        case '=':
                            attributeOperator = AttributeSelector.TILDE_EQUALS;
                            this._setState(CSSTokenizerState.PARSING_ATTRIBUTE_SELECTOR_VALUE);
                            break;
                        default:
                            this._setState(CSSTokenizerState.PARSING_ATTRIBUTE_SELECTOR_END);
                            break;
                    }
                    break;
                case CSSTokenizerState.PARSING_ATTRIBUTE_SELECTOR_VALUE:
                    switch (character) {
                        case ']':
                            simpleSelector = new AttributeSelector();
                            simpleSelector.setName(attributeName);
                            simpleSelector.setOperator(attributeOperator);
                            simpleSelector.setValue(textRead);
                            this._setState(CSSTokenizerState.PARSING_COMBINATOR);
                            return simpleSelector;
                        case '\'':
                            this._setState(CSSTokenizerState.PARSING_ATTRIBUTE_SELECTOR_VALUE_SINGLE_QUOTED);
                            break;
                        case '"':
                            this._setState(CSSTokenizerState.PARSING_ATTRIBUTE_SELECTOR_VALUE_DOUBLE_QUOTED);
                            break;
                        default:
                            textRead += character;
                            this._setState(CSSTokenizerState.PARSING_ATTRIBUTE_SELECTOR_VALUE_NO_QUOTES);
                            break;
                    }
                    break;
                case CSSTokenizerState.PARSING_ATTRIBUTE_SELECTOR_VALUE_NO_QUOTES:
                    switch (character) {
                        case ']':
                            simpleSelector = new AttributeSelector();
                            simpleSelector.setName(attributeName);
                            simpleSelector.setOperator(attributeOperator);
                            simpleSelector.setValue(textRead);
                            this._setState(CSSTokenizerState.PARSING_COMBINATOR);
                            return simpleSelector;
                        default:
                            textRead += character;
                            break;
                    }
                    break;
                case CSSTokenizerState.PARSING_ATTRIBUTE_SELECTOR_VALUE_SINGLE_QUOTED:
                    switch (character) {
                        case '\'':
                            attributeValue = textRead;
                            this._setState(CSSTokenizerState.PARSING_ATTRIBUTE_SELECTOR_END);
                            break;
                        default:
                            textRead += character;
                            break;
                    }
                    break;
                case CSSTokenizerState.PARSING_ATTRIBUTE_SELECTOR_VALUE_DOUBLE_QUOTED:
                    switch (character) {
                        case '"':
                            attributeValue = textRead;
                            this._setState(CSSTokenizerState.PARSING_ATTRIBUTE_SELECTOR_END);
                            break;
                        default:
                            textRead += character;
                            break;
                    }
                    break;
                case CSSTokenizerState.PARSING_ATTRIBUTE_SELECTOR_END:
                    switch (character) {
                        case ']':
                            let simpleSelector = new AttributeSelector();
                            simpleSelector.setName(attributeName);
                            simpleSelector.setOperator(attributeOperator);
                            simpleSelector.setValue(attributeValue);
                            this._setState(CSSTokenizerState.PARSING_COMBINATOR);
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
        this._setState(CSSTokenizerState.PARSING_END_OF_FILE);
        return null;
    }
    _readClassSelector() {
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
                    simpleSelector = new ClassSelector(textRead);
                    this._setState(CSSTokenizerState.PARSING_COMBINATOR);
                    this._unread();
                    return simpleSelector;
                case ',':
                    simpleSelector = new ClassSelector(textRead);
                    this._setState(CSSTokenizerState.PARSING_SELECTOR_SEPARATOR);
                    return simpleSelector;
                case '{':
                    simpleSelector = new ClassSelector(textRead);
                    this._setState(CSSTokenizerState.PARSING_DECLARATION_GROUP);
                    this._unread();
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
        this._setState(CSSTokenizerState.PARSING_END_OF_FILE);
        return simpleSelector;
    }
    _readCombinator() {
        let combinator = null;
        let character = null;
        while ((character = this._read()) != null) {
            switch(this.state) {
                case CSSTokenizerState.PARSING_COMBINATOR:
                    switch (character) {
                        case ' ':
                        case '\t':
                        case '\n':
                            this._setState(CSSTokenizerState.PARSING);
                            break;
                        case '{':
                            this._setState(CSSTokenizerState.PARSING_DECLARATION_GROUP);
                            this._unread();
                            return null;
                        case '+':
                            combinator = new AdjacentSiblingCombinator();
                            this._setState(CSSTokenizerState.PARSING_SIMPLE_SELECTOR);
                            return combinator;
                        case '~':
                            combinator = new GeneralSiblingCombinator();
                            this._setState(CSSTokenizerState.PARSING_SIMPLE_SELECTOR);
                            return combinator;
                        case '>':
                            combinator = new ChildCombinator();
                            this._setState(CSSTokenizerState.PARSING_SIMPLE_SELECTOR);
                            return combinator;
                        default:
                            combinator = new DirectCombinator();
                            this._setState(CSSTokenizerState.PARSING_SIMPLE_SELECTOR);
                            this._unread();
                            return combinator;
                    }
                    break;
                case CSSTokenizerState.PARSING:
                    switch (character) {
                        case ' ':
                        case '\t':
                        case '\n':
                            break;
                        case '{':
                            this._setState(CSSTokenizerState.PARSING_DECLARATION_GROUP);
                            this._unread();
                            return null;
                        default:
                            combinator = new DescendantCombinator();
                            this._setState(CSSTokenizerState.PARSING_SIMPLE_SELECTOR);
                            this._unread();
                            return combinator;
                    }
                    break;
            }
        }
        // If we arrive here we have reached the end of the file.
        this._setState(CSSTokenizerState.PARSING_END_OF_FILE);
        return combinator;
    }
    _readIDSelector() {
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
                    simpleSelector = new IDSelector(textRead);
                    this._setState(CSSTokenizerState.PARSING_COMBINATOR);
                    this._unread();
                    return simpleSelector;
                case ',':
                    simpleSelector = new IDSelector(textRead);
                    this._setState(CSSTokenizerState.PARSING_SELECTOR_SEPARATOR);
                    return simpleSelector;
                case '{':
                    simpleSelector = new IDSelector(textRead);
                    this._setState(CSSTokenizerState.PARSING_DECLARATION_GROUP);
                    this._unread();
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
        this._setState(CSSTokenizerState.PARSING_END_OF_FILE);
        return simpleSelector;
    }
    _readPseudoClassSelector() {
        let simpleSelector = null;
        let textRead = '';
        let character = null;
        while ((character = this._read()) != null) {
            switch (character) {
                case ':':
                    this._setState(CSSTokenizerState.PARSING_PSEUDO_ELEMENT_SELECTOR);
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
                    this._setState(CSSTokenizerState.PARSING_COMBINATOR);
                    this._unread();
                    return simpleSelector;
                case ',':
                    simpleSelector = new PseudoClassSelector(textRead);
                    this._setState(CSSTokenizerState.PARSING_SELECTOR_SEPARATOR);
                    return simpleSelector;
                case '{':
                    simpleSelector = new PseudoClassSelector(textRead);
                    this._setState(CSSTokenizerState.PARSING_DECLARATION_GROUP);
                    this._unread();
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
        this._setState(CSSTokenizerState.PARSING_END_OF_FILE);
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
                    this._setState(CSSTokenizerState.PARSING_COMBINATOR);
                    this._unread();
                    return simpleSelector;
                case ',':
                    simpleSelector = new PseudoElementSelector(textRead);
                    this._setState(CSSTokenizerState.PARSING_SELECTOR_SEPARATOR);
                    return simpleSelector;
                case '{':
                    simpleSelector = new PseudoElementSelector(textRead);
                    this._setState(CSSTokenizerState.PARSING_DECLARATION_GROUP);
                    this._unread();
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
        this._setState(CSSTokenizerState.PARSING_END_OF_FILE);
        return simpleSelector;
    }
    _readSimpleSelector() {
        logger.trace('_readSimpleSelector(...): start.');
        let character = null;
        while ((character = this._read()) != null) {
            switch (character) {
                // Ignore whitespace
                case ' ':
                case '\t':
                case '\r':
                case '\n':
                    break;
                case '{':
                    this._setState(CSSTokenizerState.PARSING_DECLARATION_GROUP);
                    this._unread();
                    logger.trace('_readSimpleSelector(...): end.');
                    return null;
                case '[':
                    this._setState(CSSTokenizerState.PARSING_ATTRIBUTE_SELECTOR);
                    return null;
                case '.':
                    this._setState(CSSTokenizerState.PARSING_CLASS_SELECTOR);
                    return null;
                case '#':
                    this._setState(CSSTokenizerState.PARSING_ID_SELECTOR);
                    return null;
                case '*':
                    this._setState(CSSTokenizerState.PARSING_UNIVERSAL_SELECTOR);
                    return null;
                case ':':
                    this._setState(CSSTokenizerState.PARSING_PSEUDO_CLASS_SELECTOR);
                    return null;
                case '*':
                    this._setState(CSSTokenizerState.PARSING_UNIVERSAL_SELECTOR);
                    return null;
                case ',':
                    this._setState(CSSTokenizerState.PARSING_SELECTOR_SEPARATOR);
                    return null;
                default:
                    this._setState(CSSTokenizerState.PARSING_TYPE_SELECTOR);
                    this._unread();
                    return null;
            }
        }
        // If we arrive here we have reached the end of the file.
        this._setState(CSSTokenizerState.PARSING_END_OF_FILE);
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
                    this._setState(CSSTokenizerState.PARSING_COMBINATOR);
                    this._unread();
                    return simpleSelector;
                case ',':
                    simpleSelector = new TypeSelector(textRead);
                    this._setState(CSSTokenizerState.PARSING_SELECTOR_SEPARATOR);
                    return simpleSelector;
                case '{':
                    simpleSelector = new TypeSelector(textRead);
                    this._setState(CSSTokenizerState.PARSING_DECLARATION_GROUP);
                    this._unread();
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
        this._setState(CSSTokenizerState.PARSING_END_OF_FILE);
        return simpleSelector;
    }
    _readUniversalSelector() {
        let simpleSelector = new UniversalSelector();
        this._setState(CSSTokenizerState.PARSING_COMBINATOR);
        return simpleSelector;
    }
    _readDeclarationGroup() {
        logger.trace('_readDeclarationGroup(...): start.');
        let result = new CSSDeclarationGroup();
        let property = '';
        let value = '';
        let character = null;
        this._setState(CSSTokenizerState.PARSING_DECLARATION_GROUP);
        while ((character = this._read()) != null) {
            switch (this.state) {
                case CSSTokenizerState.PARSING_DECLARATION_GROUP:
                    switch (character) {
                        case ' ': case '\r': case '\t': case '\n':
                            break;
                        case '{':
                            this._setState(CSSTokenizerState.PARSING_DECLARATION_PROPERTY);
                            break;
                        default:
                            this._setState(CSSTokenizerState.PARSING_ERROR);
                            break;
                    }
                    break;
                case CSSTokenizerState.PARSING_DECLARATION_PROPERTY:
                    switch (character) {
                        case ' ': case '\r': case '\t': case '\n':
                            break;
                        case '/':
                            this._setState(CSSTokenizerState.PARSING_SLASH);
                            break;
                        case '}':
                            logger.trace('_readDeclarationGroup(...): end.');
                            return result;
                        case ';':
                            // ignore
                            property = '';
                            value = '';
                            break;
                        case ':':
                            this._setState(CSSTokenizerState.PARSING_DECLARATION_VALUE);
                            break;
                        default:
                            property += character;
                            break;
                    }
                    break;
                case CSSTokenizerState.PARSING_DECLARATION_VALUE:
                    switch(character) {
                        case ';':
                            result.addDeclaration(property, value);
                            property = '';
                            value = '';
                            this._setState(CSSTokenizerState.PARSING_DECLARATION_PROPERTY);
                            break;
                        case '}':
                            result.addDeclaration(property, value);
                            logger.trace('_readDeclarationGroup(...): end.');
                            return result;
                        default:
                            value += character;
                            break;
                    }
                    break;
                case CSSTokenizerState.PARSING_SLASH:
                    switch (character) {
                        case '*':
                            this._unread();
                            this._unread();
                            this._readCSSComment();
                            this._setState(CSSTokenizerState.PARSING_DECLARATION_PROPERTY);
                            break;
                        default:
                            this._setState(CSSTokenizerState.PARSING_UNTIL_NEWLINE);
                            break;
                    }
                    break;
                case CSSTokenizerState.PARSING_UNTIL_NEWLINE:
                    switch(character) {
                        case '\n':
                            this._setState(CSSTokenizerState.PARSING_DECLARATION_PROPERTY);
                            break;
                        default:
                            break;
                    }
            }
        }
        this._setState(CSSTokenizerState.PARSING_END_OF_FILE);
        logger.trace('_readDeclarationGroup(...): end.');
        return result;
    }

    _readCSSAtRule() {
        logger.trace('_readCSSAtRule(...): start.');
        let textRead = '';
        let character = null;
        while ((character = this._read()) != null) {
            switch (this.state) {
                case CSSTokenizerState.PARSING_AT_RULE:
                    switch(character) {
                        case '@':
                            break;
                        case 'C': case 'c':
                            this._setState(CSSTokenizerState.PARSING_AT_C);
                            break;
                        case 'F': case 'f':
                            this._setState(CSSTokenizerState.PARSING_AT_F);
                            break;
                        case 'I': case 'i':
                            this._setState(CSSTokenizerState.PARSING_AT_I);
                            break;
                        case 'K': case 'k':
                            this._setState(CSSTokenizerState.PARSING_AT_K);
                            break;
                        case 'M': case 'm':
                            this._setState(CSSTokenizerState.PARSING_AT_M);
                            break;
                        case 'N': case 'n':
                            this._setState(CSSTokenizerState.PARSING_AT_N);
                            break;
                        case 'P': case 'p':
                            this._setState(CSSTokenizerState.PARSING_AT_P);
                            break;
                        case '-':
                            textRead += character;
                            this._setState(CSSTokenizerState.PARSING_AT_DASH);
                            break;
                        default:
                            break;
                    }
                    break;
                case CSSTokenizerState.PARSING_AT_DASH:
                    switch(character) {
                        case 'M': case 'm':
                            textRead += character;
                            this._setState(CSSTokenizerState.PARSING_AT_DASH_M);
                            break;
                        case 'O': case 'o':
                            textRead += character;
                            this._setState(CSSTokenizerState.PARSING_AT_DASH_O);
                            break;
                        case 'W': case 'w':
                            textRead += character;
                            this._setState(CSSTokenizerState.PARSING_AT_DASH_W);
                            break;
                        default:
                            return null;
                    }
                    break;
                case CSSTokenizerState.PARSING_AT_DASH_W:
                    switch(character) {
                        case 'E': case 'e':
                            textRead += character;
                            this._setState(CSSTokenizerState.PARSING_AT_DASH_WE);
                            break;
                        default:
                            return null;
                    }
                    break;
                case CSSTokenizerState.PARSING_AT_DASH_WE:
                    switch(character) {
                        case 'B': case 'b':
                            textRead += character;
                            this._setState(CSSTokenizerState.PARSING_AT_DASH_WEB);
                            break;
                        default:
                            return null;
                    }
                    break;
                case CSSTokenizerState.PARSING_AT_DASH_WEB:
                    switch(character) {
                        case 'K': case 'k':
                            textRead += character;
                            this._setState(CSSTokenizerState.PARSING_AT_DASH_WEBK);
                            break;
                        default:
                            return null;
                    }
                    break;
                case CSSTokenizerState.PARSING_AT_DASH_WEBK:
                    switch(character) {
                        case 'I': case 'i':
                            textRead += character;
                            this._setState(CSSTokenizerState.PARSING_AT_DASH_WEBKI);
                            break;
                        default:
                            return null;
                    }
                    break;
                case CSSTokenizerState.PARSING_AT_DASH_WEBKI:
                    switch(character) {
                        case 'T': case 't':
                            textRead += character;
                            this._setState(CSSTokenizerState.PARSING_AT_DASH_WEBKIT);
                            break;
                        default:
                            return null;
                    }
                    break;
                case CSSTokenizerState.PARSING_AT_DASH_WEBKIT:
                    switch(character) {
                        case '-':
                            textRead += character;
                            this._setState(CSSTokenizerState.PARSING_AT_DASH_WEBKIT_DASH);
                            break;
                        default:
                            return null;
                    }
                    break;
                case CSSTokenizerState.PARSING_AT_DASH_WEBKIT_DASH:
                    switch(character) {
                        case 'K': case 'k':
                            textRead += character;
                            this._setState(CSSTokenizerState.PARSING_AT_K);
                            break;
                        default:
                            return null;
                    }
                    break;
                case CSSTokenizerState.PARSING_AT_DASH_M:
                    switch(character) {
                        case 'O': case 'o':
                            textRead += character;
                            this._setState(CSSTokenizerState.PARSING_AT_DASH_MO);
                            break;
                        default:
                            return null;
                    }
                    break;
                case CSSTokenizerState.PARSING_AT_DASH_MO:
                    switch(character) {
                        case 'Z': case 'z':
                            textRead += character;
                            this._setState(CSSTokenizerState.PARSING_AT_DASH_MOZ);
                            break;
                        default:
                            return null;
                    }
                    break;
                case CSSTokenizerState.PARSING_AT_DASH_MOZ:
                    switch(character) {
                        case '-':
                            textRead += character;
                            this._setState(CSSTokenizerState.PARSING_AT_DASH_MOZ_DASH);
                            break;
                        default:
                            return null;
                    }
                    break;
                case CSSTokenizerState.PARSING_AT_DASH_MOZ_DASH:
                    switch(character) {
                        case 'K': case 'k':
                            textRead += character;
                            this._setState(CSSTokenizerState.PARSING_AT_K);
                            break;
                        default:
                            return null;
                    }
                    break;
                case CSSTokenizerState.PARSING_AT_DASH_O:
                    switch(character) {
                        case '-':
                            textRead += character;
                            this._setState(CSSTokenizerState.PARSING_AT_DASH_O_DASH);
                            break;
                        default:
                            return null;
                    }
                    break;
                case CSSTokenizerState.PARSING_AT_DASH_O_DASH:
                    switch(character) {
                        case 'K': case 'k':
                            textRead += character;
                            this._setState(CSSTokenizerState.PARSING_AT_K);
                            break;
                        default:
                            return null;
                    }
                    break;
                case CSSTokenizerState.PARSING_AT_K:
                    switch(character) {
                        case 'E': case 'e':
                            textRead += character;
                            this._setState(CSSTokenizerState.PARSING_AT_KE);
                            break;
                        default:
                            return null;
                    }
                    break;
                case CSSTokenizerState.PARSING_AT_KE:
                    switch(character) {
                        case 'Y': case 'y':
                            textRead += character;
                            this._setState(CSSTokenizerState.PARSING_AT_KEY);
                            break;
                        default:
                            return null;
                    }
                    break;
                case CSSTokenizerState.PARSING_AT_KEY:
                    switch(character) {
                        case 'F': case 'f':
                            textRead += character;
                            this._setState(CSSTokenizerState.PARSING_AT_KEYF);
                            break;
                        default:
                            return null;
                    }
                    break;
                case CSSTokenizerState.PARSING_AT_KEYF:
                    switch(character) {
                        case 'R': case 'r':
                            textRead += character;
                            this._setState(CSSTokenizerState.PARSING_AT_KEYFR);
                            break;
                        default:
                            return null;
                    }
                    break;
                case CSSTokenizerState.PARSING_AT_KEYFR:
                    switch(character) {
                        case 'A': case 'a':
                            textRead += character;
                            this._setState(CSSTokenizerState.PARSING_AT_KEYFRA);
                            break;
                        default:
                            return null;
                    }
                    break;
                case CSSTokenizerState.PARSING_AT_KEYFRA:
                    switch(character) {
                        case 'M': case 'm':
                            textRead += character;
                            this._setState(CSSTokenizerState.PARSING_AT_KEYFRAM);
                            break;
                        default:
                            return null;
                    }
                    break;
                case CSSTokenizerState.PARSING_AT_KEYFRAM:
                    switch(character) {
                        case 'E': case 'e':
                            textRead += character;
                            this._setState(CSSTokenizerState.PARSING_AT_KEYFRAME);
                            break;
                        default:
                            return null;
                    }
                    break;
                case CSSTokenizerState.PARSING_AT_KEYFRAME:
                    switch(character) {
                        case 'S': case 's':
                            return this._readCSSKeyFramesAtRule();
                        default:
                            return null;
                    }
                    break;
                case CSSTokenizerState.PARSING_AT_M:
                    switch(character) {
                        case 'E': case 'e':
                            this._setState(CSSTokenizerState.PARSING_AT_ME);
                            break;
                        default:
                            return null;
                    }
                    break;
                case CSSTokenizerState.PARSING_AT_ME:
                    switch(character) {
                        case 'D': case 'd':
                            this._setState(CSSTokenizerState.PARSING_AT_MED);
                            break;
                        default:
                            return null;
                    }
                    break;
                case CSSTokenizerState.PARSING_AT_MED:
                    switch(character) {
                        case 'I': case 'i':
                            this._setState(CSSTokenizerState.PARSING_AT_MEDI);
                            break;
                        default:
                            return null;
                    }
                    break;
                case CSSTokenizerState.PARSING_AT_MEDI:
                    switch(character) {
                        case 'A': case 'a':
                            this._setState(CSSTokenizerState.PARSING_AT_MEDIA);
                            return this._readCSSMediaAtRule();
                        default:
                            return null;
                    }
                    break;
                case CSSTokenizerState.PARSING_AT_C:
                    switch(character) {
                        case 'H': case 'h':
                            this._setState(CSSTokenizerState.PARSING_AT_CH);
                            break;
                        default:
                            this._setState(CSSTokenizerState.PARSING_UNTIL_NEWLINE);
                            break;
                    }
                    break;
                case CSSTokenizerState.PARSING_AT_CH:
                    switch(character) {
                        case 'A': case 'a':
                            this._setState(CSSTokenizerState.PARSING_AT_CHA);
                            break;
                        default:
                            this._setState(CSSTokenizerState.PARSING_UNTIL_NEWLINE);
                            break;
                    }
                    break;
                case CSSTokenizerState.PARSING_AT_CHA:
                    switch(character) {
                        case 'R': case 'r':
                            this._setState(CSSTokenizerState.PARSING_AT_CHAR);
                            break;
                        default:
                            this._setState(CSSTokenizerState.PARSING_UNTIL_NEWLINE);
                            break;
                    }
                    break;
                case CSSTokenizerState.PARSING_AT_CHAR:
                    switch(character) {
                        case 'S': case 's':
                            this._setState(CSSTokenizerState.PARSING_AT_CHARS);
                            break;
                        default:
                            this._setState(CSSTokenizerState.PARSING_UNTIL_NEWLINE);
                            break;
                    }
                    break;
                case CSSTokenizerState.PARSING_AT_CHARS:
                    switch(character) {
                        case 'E': case 'e':
                            this._setState(CSSTokenizerState.PARSING_AT_CHARSE);
                            break;
                        default:
                            this._setState(CSSTokenizerState.PARSING_UNTIL_NEWLINE);
                            break;
                    }
                    break;
                case CSSTokenizerState.PARSING_AT_CHARSE:
                    switch(character) {
                        case 'T': case 't':
                            this._setState(CSSTokenizerState.PARSING_AT_CHARSET);
                            break;
                        default:
                            this._setState(CSSTokenizerState.PARSING_UNTIL_NEWLINE);
                            break;
                    }
                    break;
                case CSSTokenizerState.PARSING_AT_CHARSET:
                    switch(character) {
                        case ' ': case '\t': case '\n': case '\r':
                            break;
                        default:
                            textRead += character;
                            this._setState(CSSTokenizerState.PARSING_AT_CHARSET_ENCODING);
                            break;
                    }
                    break;
                case CSSTokenizerState.PARSING_AT_CHARSET_ENCODING:
                    switch(character) {
                        case ';':
                            let encoding = textRead;
                            encoding = encoding.replaceAll("\"", "");
                            this._setState(CSSTokenizerState.PARSING_RULE);
                            return new CSSCharsetAtRule(encoding);
                        default:
                            textRead += character;
                            break;
                    }
                    break;
                case CSSTokenizerState.PARSING_AT_P:
                    switch(character) {
                        case 'A': case 'a':
                            this._setState(CSSTokenizerState.PARSING_AT_PA);
                            break;
                        default:
                            this._setState(CSSTokenizerState.PARSING_UNTIL_NEWLINE);
                            break;
                    }
                    break;
                case CSSTokenizerState.PARSING_AT_PA:
                    switch(character) {
                        case 'G': case 'g':
                            this._setState(CSSTokenizerState.PARSING_AT_PAG);
                            break;
                        default:
                            this._setState(CSSTokenizerState.PARSING_UNTIL_NEWLINE);
                            break;
                    }
                    break;
                case CSSTokenizerState.PARSING_AT_PAG:
                    switch(character) {
                        case 'E': case 'e':
                            this._setState(CSSTokenizerState.PARSING_AT_PAGE);
                            break;
                        default:
                            this._setState(CSSTokenizerState.PARSING_UNTIL_NEWLINE);
                            break;
                    }
                    break;
                case CSSTokenizerState.PARSING_AT_PAGE:
                    switch(character) {
                        case '}' :
                            return new PageAtRule();
                        default:
                            break;
                    }
                    break;
                case CSSTokenizerState.PARSING_AT_I:
                    switch(character) {
                        case 'M': case 'm':
                            this._setState(CSSTokenizerState.PARSING_AT_IM);
                            break;
                        default:
                            this._setState(CSSTokenizerState.PARSING_UNTIL_NEWLINE);
                            break;
                    }
                    break;
                case CSSTokenizerState.PARSING_AT_IM:
                    switch(character) {
                        case 'P': case 'p':
                            this._setState(CSSTokenizerState.PARSING_AT_IMP);
                            break;
                        default:
                            this._setState(CSSTokenizerState.PARSING_UNTIL_NEWLINE);
                            break;
                    }
                    break;
                case CSSTokenizerState.PARSING_AT_IMP:
                    switch(character) {
                        case 'O': case 'o':
                            this._setState(CSSTokenizerState.PARSING_AT_IMPO);
                            break;
                        default:
                            this._setState(CSSTokenizerState.PARSING_UNTIL_NEWLINE);
                            break;
                    }
                    break;
                case CSSTokenizerState.PARSING_AT_IMPO:
                    switch(character) {
                        case 'R': case 'r':
                            this._setState(CSSTokenizerState.PARSING_AT_IMPOR);
                            break;
                        default:
                            this._setState(CSSTokenizerState.PARSING_UNTIL_NEWLINE);
                            break;
                    }
                    break;
                case CSSTokenizerState.PARSING_AT_IMPOR:
                    switch(character) {
                        case 'T': case 't':
                            this._setState(CSSTokenizerState.PARSING_AT_IMPORT);
                            break;
                        default:
                            this._setState(CSSTokenizerState.PARSING_UNTIL_NEWLINE);
                            break;
                    }
                    break;
                case CSSTokenizerState.PARSING_AT_IMPORT:
                    switch(character) {
                        case ' ': case '\n': case '\t': case '\r':
                            break;
                        default:
                            textRead += character;
                            this._setState(CSSTokenizerState.PARSING_AT_IMPORT_URL);
                            break;
                    }
                    break;
                case CSSTokenizerState.PARSING_AT_IMPORT_URL:
                    switch(character) {
                        case ';':
                            let importAtRule = new ImportAtRule();
                            let tmpString = textRead;
                            tmpString = tmpString.trim();
                            let parameters = tmpString.split(" ");
                            let urlString = parameters[0];
                            if(urlString.contains("url(")) {
                                urlString = urlString.substring(urlString.indexOf('(')+1,urlString.lastIndexOf(')'));
                                urlString = urlString.replaceAll("'", "");
                                urlString = urlString.replaceAll("\"", "");
                            }
                            importAtRule.setFileToBeImported(urlString);
                            return importAtRule;
                        default:
                            textRead += character;
                            break;
                    }
                    break;
                case CSSTokenizerState.PARSING_AT_F:
                    switch(character) {
                        case 'O': case 'o':
                            this._setState(CSSTokenizerState.PARSING_AT_FO);
                            break;
                        default:
                            this._setState(CSSTokenizerState.PARSING_UNTIL_NEWLINE);
                            break;
                    }
                    break;
                case CSSTokenizerState.PARSING_AT_FO:
                    switch(character) {
                        case 'N': case 'n':
                            this._setState(CSSTokenizerState.PARSING_AT_FON);
                            break;
                        default:
                            this._setState(CSSTokenizerState.PARSING_UNTIL_NEWLINE);
                            break;
                    }
                    break;
                case CSSTokenizerState.PARSING_AT_FON:
                    switch(character) {
                        case 'T': case 't':
                            this._setState(CSSTokenizerState.PARSING_AT_FONT);
                            break;
                        default:
                            this._setState(CSSTokenizerState.PARSING_UNTIL_NEWLINE);
                            break;
                    }
                    break;
                case CSSTokenizerState.PARSING_AT_FONT:
                    switch(character) {
                        case '-':
                            this._setState(CSSTokenizerState.PARSING_AT_FONT_);
                            break;
                        default:
                            this._setState(CSSTokenizerState.PARSING_UNTIL_NEWLINE);
                            break;
                    }
                    break;
                case CSSTokenizerState.PARSING_AT_FONT_:
                    switch(character) {
                        case 'F': case 'f':
                            this._setState(CSSTokenizerState.PARSING_AT_FONT_F);
                            break;
                        default:
                            this._setState(CSSTokenizerState.PARSING_UNTIL_NEWLINE);
                            break;
                    }
                    break;
                case CSSTokenizerState.PARSING_AT_FONT_F:
                    switch(character) {
                        case 'A': case 'a':
                            this._setState(CSSTokenizerState.PARSING_AT_FONT_FA);
                            break;
                        default:
                            this._setState(CSSTokenizerState.PARSING_UNTIL_NEWLINE);
                            break;
                    }
                    break;
                case CSSTokenizerState.PARSING_AT_FONT_FA:
                    switch(character) {
                        case 'C': case 'c':
                            this._setState(CSSTokenizerState.PARSING_AT_FONT_FAC);
                            break;
                        default:
                            this._setState(CSSTokenizerState.PARSING_UNTIL_NEWLINE);
                            break;
                    }
                    break;
                case CSSTokenizerState.PARSING_AT_FONT_FAC:
                    switch(character) {
                        case 'E': case 'e':
                            this._setState(CSSTokenizerState.PARSING_AT_FONT_FACE);
                            break;
                        default:
                            this._setState(CSSTokenizerState.PARSING_UNTIL_NEWLINE);
                            break;
                    }
                    break;
                case CSSTokenizerState.PARSING_AT_FONT_FACE:
                    return this._readCSSFontFaceAtRule(character);
                case CSSTokenizerState.PARSING_AT_N:
                    switch(character) {
                        case 'A': case 'a':
                            this._setState(CSSTokenizerState.PARSING_AT_NA);
                            break;
                        default:
                            this._setState(CSSTokenizerState.PARSING_UNTIL_NEWLINE);
                            break;
                    }
                    break;
                case CSSTokenizerState.PARSING_AT_NA:
                    switch(character) {
                        case 'M': case 'm':
                            this._setState(CSSTokenizerState.PARSING_AT_NAM);
                            break;
                        default:
                            this._setState(CSSTokenizerState.PARSING_UNTIL_NEWLINE);
                            break;
                    }
                    break;
                case CSSTokenizerState.PARSING_AT_NAM:
                    switch(character) {
                        case 'E': case 'e':
                            this._setState(CSSTokenizerState.PARSING_AT_NAME);
                            break;
                        default:
                            this._setState(CSSTokenizerState.PARSING_UNTIL_NEWLINE);
                            break;
                    }
                    break;
                case CSSTokenizerState.PARSING_AT_NAME:
                    switch(character) {
                        case 'S': case 's':
                            this._setState(CSSTokenizerState.PARSING_AT_NAMES);
                            break;
                        default:
                            this._setState(CSSTokenizerState.PARSING_UNTIL_NEWLINE);
                            break;
                    }
                    break;
                case CSSTokenizerState.PARSING_AT_NAMES:
                    switch(character) {
                        case 'P': case 'p':
                            this._setState(CSSTokenizerState.PARSING_AT_NAMESP);
                            break;
                        default:
                            this._setState(CSSTokenizerState.PARSING_UNTIL_NEWLINE);
                            break;
                    }
                    break;
                case CSSTokenizerState.PARSING_AT_NAMESP:
                    switch(character) {
                        case 'A': case 'a':
                            this._setState(CSSTokenizerState.PARSING_AT_NAMESPA);
                            break;
                        default:
                            this._setState(CSSTokenizerState.PARSING_UNTIL_NEWLINE);
                            break;
                    }
                    break;
                case CSSTokenizerState.PARSING_AT_NAMESPA:
                    switch(character) {
                        case 'C': case 'c':
                            this._setState(CSSTokenizerState.PARSING_AT_NAMESPAC);
                            break;
                        default:
                            this._setState(CSSTokenizerState.PARSING_UNTIL_NEWLINE);
                            break;
                    }
                    break;
                case CSSTokenizerState.PARSING_AT_NAMESPAC:
                    switch(character) {
                        case 'E': case 'e':
                            this._setState(CSSTokenizerState.PARSING_AT_NAMESPACE);
                            break;
                        default:
                            this._setState(CSSTokenizerState.PARSING_UNTIL_NEWLINE);
                            break;
                    }
                    break;
                case CSSTokenizerState.PARSING_AT_NAMESPACE:
                    break;
                case CSSTokenizerState.PARSING_UNTIL_NEWLINE:
                    switch(character) {
                        case '\n':
                            return null;
                        default:
                            break;
                    }
                    break;
            }
        }
        this._setState(CSSTokenizerState.PARSING_END_OF_FILE);
        return null;
    }

    _readCSSFontFaceAtRule() {
        let result = new CSSFontFaceAtRule();
        let textRead = '';
        let character = null;
        while ((character = this._read()) != null) {
            switch (this.state) {
                case CSSTokenizerState.PARSING_AT_FONT_FACE:
                    switch(character) {
                        case '}':
                            return result;
                        default:
                            textRead += character;
                            break;
                    }
                    break;
                default:
                    break;
            }
        }
        return result;
    }

    _readCSSKeyFramesAtRule() {
        logger.trace('_readCSSKeyFramesAtRule(...): start.');
        let result = new CSSKeyFramesAtRule();
        let textRead = '';
        let character = null;
        let selectors = [];
        this._setState(CSSTokenizerState.PARSING);
        while ((character = this._read()) != null) {
            switch(this.state) {
                case CSSTokenizerState.PARSING:
                    switch(character) {
                        case ' ': case '\t': case '\n': case '\r':
                            break;
                        case '{':
                            // Key frames MUST have a name...
                            logger.trace('_readCSSKeyFramesAtRule(...): end.');
                            return null;
                        default:
                            textRead += character;
                            this._setState(CSSTokenizerState.PARSING_AT_KEY_FRAMES);
                            break;
                    }
                    break;
                case CSSTokenizerState.PARSING_AT_KEY_FRAMES:
                    switch(character) {
                        case ' ': case '\t': case '\n': case '\r':
                            break;
                        case '{':
                            result.setName(textRead);
                            textRead = '';
                            this._setState(CSSTokenizerState.PARSING_SELECTOR_GROUP);
                            break;
                        default:
                            textRead += character;
                            break;
                    }
                    break;
                case CSSTokenizerState.PARSING_SELECTOR_GROUP:
                    switch(character) {
                        case ' ': case '\t': case '\n': case '\r':
                        case ',':
                            break;
                        case '}':
                            this._setState(CSSTokenizerState.PARSING);
                            logger.trace('_readCSSKeyFramesAtRule(...): end.');
                            return result;
                        case '{':
                            this._unread();
                            this._setState(CSSTokenizerState.PARSING_DECLARATION_GROUP);
                            break;
                        default:
                            textRead += character;
                            this._setState(CSSTokenizerState.PARSING_SELECTOR);
                            break;
                    }                    
                    break;
                case CSSTokenizerState.PARSING_SELECTOR:
                    switch(character) {
                        case ' ': case '\t': case '\n': case '\r':
                        case ',':
                            selectors.push(textRead);
                            textRead = '';
                            this._setState(CSSTokenizerState.PARSING_SELECTOR_GROUP);
                            break;
                        case '{':
                            this._unread();
                            selectors.push(textRead);
                            textRead = '';
                            this._setState(CSSTokenizerState.PARSING_DECLARATION_GROUP);
                            break;
                        default:
                            textRead += character;
                            break;
                    }
                    break;
                case CSSTokenizerState.PARSING_DECLARATION_GROUP:
                    switch(character) {
                        case ' ': case '\t': case '\n': case '\r':
                            break;
                        case '{':
                            this._unread();
                            let declarationGroup = this._readDeclarationGroup();
                            result.setPercentage(selectors,declarationGroup);
                            selectors = [];
                            this._setState(CSSTokenizerState.PARSING_SELECTOR_GROUP);
                            break;
                        default:
                            this._setState(CSSTokenizerState.PARSING_ERROR);
                            break;
                    }
                    break;    
                default:
                    logger.trace('_readCSSKeyFramesAtRule(...): end.');
                    return null;
            }
        }
        logger.trace('_readCSSKeyFramesAtRule(...): end.');
        return result;
    }

    _readCSSMediaAtRule() {
        logger.trace('_readCSSMediaAtRule(...): start.');
        let result = new CSSMediaAtRule();
        let condition = '';
        let selectors = [];
        let character = null;
        while ((character = this._read()) != null) {
            switch (this.state) {
                case CSSTokenizerState.PARSING_AT_MEDIA:
                    switch(character) {
                        case ' ': case '\t': case '\n': case '\r':
                            break;
                        case '{':
                            this._setState(CSSTokenizerState.PARSING_AT_MEDIA_CSS);
                            break;
                        default:
                            condition += character;
                            this._setState(CSSTokenizerState.PARSING_AT_MEDIA_CONDITION);
                            break;
                    }
                    break;
                case CSSTokenizerState.PARSING_AT_MEDIA_CONDITION:
                    switch(character) {
                        case '{':
                            result.addMediaType(condition);
                            this._setState(CSSTokenizerState.PARSING_AT_MEDIA_CSS);
                            break;
                        default:
                            condition += character;
                            break;
                    }
                    break;
                case CSSTokenizerState.PARSING_AT_MEDIA_CSS:
                    switch(character) {
                        case ' ': case '\t': case '\n': case '\r':
                            break;
                        case '}':
                            logger.trace('_readCSSMediaAtRule(...): end.');
                            return result;
                        default:
                            let selectors = this._readSelectorGroup();
                            let declarationGroup = this._readDeclarationGroup();
                            let cssRule = new CSSRule();
                            for(let i=0;i < selectors.length;i++) {
                                cssRule.addSelector(selectors[i]);
                            }
                            cssRule.setDeclarationGroup(declarationGroup);
                            result.addCSSRule(cssRule);
                            this._setState(CSSTokenizerState.PARSING_AT_MEDIA_CSS);
                    }
                    break;
                    
            }
        }
        logger.trace('_readCSSMediaAtRule(...): end.');
        return result;
    }
    
    // Unread one character.
    _unread() {
        this.index--;
    }

    static main() {
        let tokenize = async function(_css) {
            let cssTokenizer = new CSSTokenizer(_css);
            let cssElement = await cssTokenizer.nextCSSElement();
            while(cssElement != null) {
                console.log(cssElement.toString());
                cssElement = await cssTokenizer.nextCSSElement();
            }
        }
        try {
            let cssTokenizerOptions = CSSTokenizerOptions.parseCommandLineOptions();
            logging.setLevel(cssTokenizerOptions.logLevel);
            if(cssTokenizerOptions.help) {
                util.Help.print(this);
                return;
            }
            let text = cssTokenizerOptions.text;
            if(text != null) {
                tokenize(text);
            } else {
                let url = cssTokenizerOptions.url;
                if(url === null) {
                    console.log('Please supply a text or an url.');
                    process.exit(99);
                    return;
                }
                if(!url.startsWith('http')) {
                    url = 'http://' + url;
                }
                let processPage = function(url, res) {
                    if(res.statusCode === 301 || res.statusCode === 302) {
                        let redirectURL = res.headers.location;
                        if(!redirectURL.startsWith('http')) {
                            let tmpURL = new URL(redirectURL, url);
                            redirectURL = tmpURL.href;
                        }
                        return follow(redirectURL);
                    }
                    let data = '';
                    res.on('data', function(chunk) {
                        data += chunk;
                    });
                    res.on('end', function() {
                        tokenize(data);
                    });
                }
                let follow = function(url) {
                    if(url.startsWith('http://')) {
                        http.get(url, function(res) {
                            processPage(url, res);
                        });
                    } else if (url.startsWith('https://')) {
                        https.get(url, function(res) {
                            processPage(url, res)
                        });
                    }
                }
                follow(url);
            }
        } catch(exception) {
            console.log(exception);
        }
    }
}
// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
    CSSTokenizer.main();
    return;
}

module.exports = CSSTokenizer;

        // List<Selector> result = null;
        // Selector selector = null;
        // Combinator combinator;
        // SimpleSelector simpleSelector;
        // StringBuilder textRead = new StringBuilder();
        // AttributeSelector.AttributeSelectorOperator attributeSelectorOperator = AttributeSelector.AttributeSelectorOperator.NONE;
        // String attributeName = null;
        // String attributeValue = null;
//         let this.state = CSSTokenizerState.PARSING;

//         switch (character) {
//             case '/':
//                 this.state = CSSTokenizerState.PARSING_SLASH;
//                 break;
//             case ' ': case '\t': case '\r': case '\n':
//                 break;
//             case ',':
//                 break;
//             case '[':
//                 selector = new Selector();
//                 this.state = CSSTokenizerState.PARSING_ATTRIBUTE_SELECTOR;
//                 break;
//             case '.':
//                 selector = new Selector();
//                 this.state = CSSTokenizerState.PARSING_CLASS_SELECTOR;
//                 break;
//             case '#':
//                 selector = new Selector();
//                 this.state = CSSTokenizerState.PARSING_ID_SELECTOR;
//                 break;
//             case '*':
//                 selector = new Selector();
//                 this.state = CSSTokenizerState.PARSING_UNIVERSAL_SELECTOR;
//                 break;
//             default:
//                 selector = new Selector();
//                 this.state = CSSTokenizerState.PARSING_TYPE_SELECTOR;
//                 textRead.append(character);
//                 break;
//         }
//         while ((character = reader.read()) != -1) {
// //            System.out.println("SELECTOR TEXT READ:" + textRead.toString());
//             switch (this.state) {
//                 case PARSING:
//                     switch (character) {
//                         case '/':
//                             this.state = CSSTokenizerState.PARSING_SLASH;
//                             break;
//                         case ' ': case '\t': case '\r': case '\n':
//                             break;
//                         case '{':
//                             if(result == null) {
//                                 result = new ArrayList<Selector>();
//                             }
//                             selector = new Selector();
//                             result.add(selector);
//                             return result;
//                         case ',':
//                             break;
//                         case '[':
//                             selector = new Selector();
//                             this.state = CSSTokenizerState.PARSING_ATTRIBUTE_SELECTOR;
//                             break;
//                         case '.':
//                             selector = new Selector();
//                             this.state = CSSTokenizerState.PARSING_CLASS_SELECTOR;
//                             break;
//                         case '#':
//                             selector = new Selector();
//                             this.state = CSSTokenizerState.PARSING_ID_SELECTOR;
//                             break;
//                         case '*':
//                             selector = new Selector();
//                             this.state = CSSTokenizerState.PARSING_UNIVERSAL_SELECTOR;
//                             break;
//                         default:
//                             selector = new Selector();
//                             this.state = CSSTokenizerState.PARSING_TYPE_SELECTOR;
//                             textRead.append((char) character);
//                             break;
//                     }
//                     break;
//                 case CSSTokenizerState.PARSING_SELECTOR:
//                     switch (character) {
//                         case '/':
//                             this.state = CSSTokenizerState.PARSING_SLASH;
//                             break;
//                         case ' ': case '\t': case '\r': case '\n':
//                             break;
//                         case ',':
//                             this.state = CSSTokenizerState.PARSING;
//                             break;
//                         case '[':
//                             this.state = CSSTokenizerState.PARSING_ATTRIBUTE_SELECTOR;
//                             break;
//                         case '.':
//                             this.state = CSSTokenizerState.PARSING_CLASS_SELECTOR;
//                             break;
//                         case '#':
//                             this.state = CSSTokenizerState.PARSING_ID_SELECTOR;
//                             break;
//                         case '*':
//                             this.state = CSSTokenizerState.PARSING_UNIVERSAL_SELECTOR;
//                             break;
//                         case '{':
//                             if(result == null) {
//                                 result = new ArrayList<Selector>();
//                             }
//                             result.add(selector);
//                             return result;
//                         default:
//                             this.state = CSSTokenizerState.PARSING_TYPE_SELECTOR;
//                             textRead.append((char) character);
//                             break;
//                     }
//                     break;
//                 case CSSTokenizerState.PARSING_ATTRIBUTE_SELECTOR:
//                     switch(character) {
//                         case ']':
//                             AttributeSelector attributeSelector = new AttributeSelector();
//                             attributeSelector.setName(textRead.toString());
//                             attributeSelector.setOperator(AttributeSelector.AttributeSelectorOperator.NONE);
//                             selector.addSimpleSelector(attributeSelector);
//                             textRead = new StringBuilder();
//                             this.state = CSSTokenizerState.PARSING_SELECTOR;
//                             break;
//                         case '*':
//                             attributeName = textRead.toString();
//                             textRead = new StringBuilder();
//                             this.state = CSSTokenizerState.PARSING_ATTRIBUTE_SELECTOR_OPERATOR_ASTERISK;
//                             break;
//                         case '$':
//                             attributeName = textRead.toString();
//                             textRead = new StringBuilder();
//                             this.state = CSSTokenizerState.PARSING_ATTRIBUTE_SELECTOR_OPERATOR_DOLLAR;
//                             break;
//                         case '^':
//                             attributeName = textRead.toString();
//                             textRead = new StringBuilder();
//                             this.state = CSSTokenizerState.PARSING_ATTRIBUTE_SELECTOR_OPERATOR_UP;
//                             break;
//                         case '|':
//                             attributeName = textRead.toString();
//                             textRead = new StringBuilder();
//                             this.state = CSSTokenizerState.PARSING_ATTRIBUTE_SELECTOR_OPERATOR_PIPE;
//                             break;
//                         case '=':
//                             attributeName = textRead.toString();
//                             attributeSelectorOperator = AttributeSelector.AttributeSelectorOperator.EQUALS;
//                             textRead = new StringBuilder();
//                             this.state = CSSTokenizerState.PARSING_ATTRIBUTE_SELECTOR_VALUE;
//                             break;
//                         case '~':
//                             attributeName = textRead.toString();
//                             textRead = new StringBuilder();
//                             this.state = CSSTokenizerState.PARSING_ATTRIBUTE_SELECTOR_OPERATOR_TILDE;
//                             break;
//                         default:
//                             textRead.append((char) character);
//                             break;
//                     }
//                     break;
//                 case CSSTokenizerState.PARSING_ATTRIBUTE_SELECTOR_OPERATOR_ASTERISK:
//                     switch(character) {
//                         case '=':
//                             attributeSelectorOperator = AttributeSelector.AttributeSelectorOperator.ASTERISK_EQUALS;
//                             this.state = CSSTokenizerState.PARSING_ATTRIBUTE_SELECTOR_VALUE;
//                             break;
//                         default:
//                             this.state = CSSTokenizerState.PARSING_ATTRIBUTE_SELECTOR_END;
//                             break;
//                     }
//                     break;
//                 case CSSTokenizerState.PARSING_ATTRIBUTE_SELECTOR_OPERATOR_DOLLAR:
//                     switch(character) {
//                         case '=':
//                             attributeSelectorOperator = AttributeSelector.AttributeSelectorOperator.DOLLAR_EQUALS;
//                             this.state = CSSTokenizerState.PARSING_ATTRIBUTE_SELECTOR_VALUE;
//                             break;
//                         default:
//                             this.state = CSSTokenizerState.PARSING_ATTRIBUTE_SELECTOR_END;
//                             break;
//                     }
//                     break;
//                 case CSSTokenizerState.PARSING_ATTRIBUTE_SELECTOR_OPERATOR_UP:
//                     switch(character) {
//                         case '=':
//                             attributeSelectorOperator = AttributeSelector.AttributeSelectorOperator.UP_EQUALS;
//                             this.state = CSSTokenizerState.PARSING_ATTRIBUTE_SELECTOR_VALUE;
//                             break;
//                         default:
//                             this.state = CSSTokenizerState.PARSING_ATTRIBUTE_SELECTOR_END;
//                             break;
//                     }
//                     break;
//                 case CSSTokenizerState.PARSING_ATTRIBUTE_SELECTOR_OPERATOR_PIPE:
//                     switch(character) {
//                         case '=':
//                             attributeSelectorOperator = AttributeSelector.AttributeSelectorOperator.PIPE_EQUALS;
//                             this.state = CSSTokenizerState.PARSING_ATTRIBUTE_SELECTOR_VALUE;
//                             break;
//                         default:
//                             this.state = CSSTokenizerState.PARSING_ATTRIBUTE_SELECTOR_END;
//                             break;
//                     }
//                     break;
//                 case CSSTokenizerState.PARSING_ATTRIBUTE_SELECTOR_OPERATOR_TILDE:
//                     switch(character) {
//                         case '=':
//                             attributeSelectorOperator = AttributeSelector.AttributeSelectorOperator.TILDE_EQUALS;
//                             this.state = CSSTokenizerState.PARSING_ATTRIBUTE_SELECTOR_VALUE;
//                             break;
//                         default:
//                             this.state = CSSTokenizerState.PARSING_ATTRIBUTE_SELECTOR_END;
//                             break;
//                     }
//                     break;
//                 case CSSTokenizerState.PARSING_ATTRIBUTE_SELECTOR_VALUE:
//                     switch(character) {
//                         case ']':
//                             AttributeSelector attributeSelector = new AttributeSelector();
//                             attributeSelector.setName(attributeName);
//                             attributeSelector.setOperator(attributeSelectorOperator);
//                             attributeSelector.setValue(textRead.toString());
//                             selector.addSimpleSelector(attributeSelector);
//                             textRead = new StringBuilder();
//                             this.state = CSSTokenizerState.PARSING_SELECTOR;
//                             break;
//                         case '\'':
//                             this.state = CSSTokenizerState.PARSING_ATTRIBUTE_SELECTOR_VALUE_SINGLE_QUOTED;
//                             break;
//                         case '"':
//                             this.state = CSSTokenizerState.PARSING_ATTRIBUTE_SELECTOR_VALUE_DOUBLE_QUOTED;
//                             break;
//                         default:
//                             textRead += character;
//                             this.state = CSSTokenizerState.PARSING_ATTRIBUTE_SELECTOR_VALUE_NO_QUOTES;
//                             break;
//                     }
//                     break;
//                 case CSSTokenizerState.PARSING_ATTRIBUTE_SELECTOR_VALUE_NO_QUOTES:
//                     switch(character) {
//                         case ']':
//                             AttributeSelector attributeSelector = new AttributeSelector();
//                             attributeSelector.setName(attributeName);
//                             attributeSelector.setOperator(attributeSelectorOperator);
//                             attributeSelector.setValue(textRead.toString());
//                             selector.addSimpleSelector(attributeSelector);
//                             textRead = new StringBuilder();
//                             this.state = CSSTokenizerState.PARSING_SELECTOR;
//                             break;
//                         default:
//                             textRead += character;
//                             break;
//                     }
//                     break;
//                 case CSSTokenizerState.PARSING_ATTRIBUTE_SELECTOR_VALUE_SINGLE_QUOTED:
//                     switch(character) {
//                         case '\'':
//                             attributeValue = textRead.toString();
//                             this.state = CSSTokenizerState.PARSING_ATTRIBUTE_SELECTOR_END;
//                             break;
//                         default:
//                             textRead += character;
//                             break;
//                     }
//                     break;
//                 case CSSTokenizerState.PARSING_ATTRIBUTE_SELECTOR_VALUE_DOUBLE_QUOTED:
//                     switch(character) {
//                         case '"':
//                             attributeValue = textRead.toString();
//                             this.state = CSSTokenizerState.PARSING_ATTRIBUTE_SELECTOR_END;
//                             break;
//                         default:
//                             textRead += character;
//                             break;
//                     }
//                     break;
//                 case CSSTokenizerState.PARSING_ATTRIBUTE_SELECTOR_END:
//                     switch(character) {
//                         case ']':
//                             AttributeSelector attributeSelector = new AttributeSelector();
//                             attributeSelector.setName(attributeName);
//                             attributeSelector.setOperator(attributeSelectorOperator);
//                             attributeSelector.setValue(attributeValue);
//                             selector.addSimpleSelector(attributeSelector);
//                             textRead = new StringBuilder();
//                             this.state = CSSTokenizerState.PARSING_SELECTOR;
//                             break;
//                         default:
//                             break;
//                     }
//                     break;
//                 case CSSTokenizerState.PARSING_ID_SELECTOR:
//                     switch (character) {
//                         case '/':
//                             this.state = CSSTokenizerState.PARSING_SLASH;
//                             break;
//                         case '.':
//                             simpleSelector = new IDSelector(textRead.toString());
//                             selector.addSimpleSelector(simpleSelector);
//                             combinator = new DirectCombinator();
//                             selector.addCombinator(combinator);
//                             textRead = new StringBuilder();
//                             this.state = CSSTokenizerState.PARSING_CLASS_SELECTOR;
//                             break;
//                         case '#':
//                             simpleSelector = new IDSelector(textRead.toString());
//                             selector.addSimpleSelector(simpleSelector);
//                             combinator = new DirectCombinator();
//                             selector.addCombinator(combinator);
//                             textRead = new StringBuilder();
//                             this.state = CSSTokenizerState.PARSING_ID_SELECTOR;
//                             break;
//                         case ' ': case '\t': case '\n': case '\r':
//                             simpleSelector = new IDSelector(textRead.toString());
//                             selector.addSimpleSelector(simpleSelector);
//                             combinator = new DescendantCombinator();
//                             selector.addCombinator(combinator);
//                             textRead = new StringBuilder();
//                             this.state = CSSTokenizerState.PARSING_SELECTOR;
//                             break;
//                         case '+':
//                             simpleSelector = new IDSelector(textRead.toString());
//                             selector.addSimpleSelector(simpleSelector);
//                             combinator = new AdjacentSiblingCombinator();
//                             selector.addCombinator(combinator);
//                             textRead = new StringBuilder();
//                             this.state = CSSTokenizerState.PARSING_SELECTOR;
//                             break;
//                         case '~':
//                             simpleSelector = new IDSelector(textRead.toString());
//                             selector.addSimpleSelector(simpleSelector);
//                             combinator = new GeneralSiblingCombinator();
//                             selector.addCombinator(combinator);
//                             textRead = new StringBuilder();
//                             this.state = CSSTokenizerState.PARSING_SELECTOR;
//                             break;
//                         case '>':
//                             simpleSelector = new IDSelector(textRead.toString());
//                             selector.addSimpleSelector(simpleSelector);
//                             combinator = new ChildCombinator();
//                             selector.addCombinator(combinator);
//                             textRead = new StringBuilder();
//                             this.state = CSSTokenizerState.PARSING_SELECTOR;
//                             break;
//                         case ':':
//                             simpleSelector = new IDSelector(textRead.toString());
//                             selector.addSimpleSelector(simpleSelector);
//                             combinator = new DirectCombinator();
//                             selector.addCombinator(combinator);
//                             textRead = new StringBuilder();
//                             this.state = CSSTokenizerState.PARSING_PSEUDO_CLASS_SELECTOR;
//                             break;
//                         case '[':
//                             simpleSelector = new IDSelector(textRead.toString());
//                             selector.addSimpleSelector(simpleSelector);
//                             combinator = new DirectCombinator();
//                             selector.addCombinator(combinator);
//                             textRead = new StringBuilder();
//                             this.state = CSSTokenizerState.PARSING_ATTRIBUTE_SELECTOR;
//                             break;
//                         case ',':
//                             simpleSelector = new IDSelector(textRead.toString());
//                             selector.addSimpleSelector(simpleSelector);
//                             if(result == null) {
//                                 result = new ArrayList<Selector>();
//                             }
//                             result.add(selector);
//                             textRead = new StringBuilder();
//                             this.state = CSSTokenizerState.PARSING;
//                             break;
//                         case '{':
//                             simpleSelector = new IDSelector(textRead.toString());
//                             selector.addSimpleSelector(simpleSelector);
//                             if(result == null) {
//                                 result = new ArrayList<Selector>();
//                             }
//                             result.add(selector);
//                             return result;
//                         default:
//                             textRead += character;
//                             break;
//                     }
//                     break;
//                 case CSSTokenizerState.PARSING_CLASS_SELECTOR:
//                     switch (character) {
//                         case '/':
//                             this.state = CSSTokenizerState.PARSING_SLASH;
//                             break;
//                         case '.':
//                             simpleSelector = new ClassSelector(textRead.toString());
//                             selector.addSimpleSelector(simpleSelector);
//                             combinator = new DirectCombinator();
//                             selector.addCombinator(combinator);
//                             textRead = new StringBuilder();
//                             this.state = CSSTokenizerState.PARSING_CLASS_SELECTOR;
//                             break;
//                         case '#':
//                             simpleSelector = new ClassSelector(textRead.toString());
//                             selector.addSimpleSelector(simpleSelector);
//                             combinator = new DirectCombinator();
//                             selector.addCombinator(combinator);
//                             textRead = new StringBuilder();
//                             this.state = CSSTokenizerState.PARSING_ID_SELECTOR;
//                             break;
//                         case ' ': case '\t': case '\n': case '\r':
//                             simpleSelector = new ClassSelector(textRead.toString());
//                             selector.addSimpleSelector(simpleSelector);
//                             combinator = new DescendantCombinator();
//                             selector.addCombinator(combinator);
//                             textRead = new StringBuilder();
//                             this.state = CSSTokenizerState.PARSING_SELECTOR;
//                             break;
//                         case '+':
//                             simpleSelector = new ClassSelector(textRead.toString());
//                             selector.addSimpleSelector(simpleSelector);
//                             combinator = new AdjacentSiblingCombinator();
//                             selector.addCombinator(combinator);
//                             textRead = new StringBuilder();
//                             this.state = CSSTokenizerState.PARSING_SELECTOR;
//                             break;
//                         case '~':
//                             simpleSelector = new ClassSelector(textRead.toString());
//                             selector.addSimpleSelector(simpleSelector);
//                             combinator = new GeneralSiblingCombinator();
//                             selector.addCombinator(combinator);
//                             textRead = new StringBuilder();
//                             this.state = CSSTokenizerState.PARSING_SELECTOR;
//                             break;
//                         case '>':
//                             simpleSelector = new ClassSelector(textRead.toString());
//                             selector.addSimpleSelector(simpleSelector);
//                             combinator = new ChildCombinator();
//                             selector.addCombinator(combinator);
//                             textRead = new StringBuilder();
//                             this.state = CSSTokenizerState.PARSING_SELECTOR;
//                             break;
//                         case ':':
//                             simpleSelector = new ClassSelector(textRead.toString());
//                             selector.addSimpleSelector(simpleSelector);
//                             combinator = new DirectCombinator();
//                             selector.addCombinator(combinator);
//                             textRead = new StringBuilder();
//                             this.state = CSSTokenizerState.PARSING_PSEUDO_CLASS_SELECTOR;
//                             break;
//                         case '[':
//                             simpleSelector = new ClassSelector(textRead.toString());
//                             selector.addSimpleSelector(simpleSelector);
//                             combinator = new DirectCombinator();
//                             selector.addCombinator(combinator);
//                             textRead = new StringBuilder();
//                             this.state = CSSTokenizerState.PARSING_ATTRIBUTE_SELECTOR;
//                             break;
//                         case ',':
//                             simpleSelector = new ClassSelector(textRead.toString());
//                             selector.addSimpleSelector(simpleSelector);
//                             if(result == null) {
//                                 result = new ArrayList<Selector>();
//                             }
//                             result.add(selector);
//                             textRead = new StringBuilder();
//                             this.state = CSSTokenizerState.PARSING;
//                             break;
//                         case '{':
//                             simpleSelector = new ClassSelector(textRead.toString());
//                             selector.addSimpleSelector(simpleSelector);
//                             if(result == null) {
//                                 result = new ArrayList<Selector>();
//                             }
//                             result.add(selector);
//                             return result;
//                         default:
//                             textRead += character;
//                             break;
//                     }
//                     break;
//                 case CSSTokenizerState.PARSING_UNIVERSAL_SELECTOR:
//                     switch(character) {
//                         case '/':
//                             this.state = CSSTokenizerState.PARSING_SLASH;
//                             break;
//                         case '.':
//                             simpleSelector = new UniversalSelector();
//                             selector.addSimpleSelector(simpleSelector);
//                             combinator = new DirectCombinator();
//                             selector.addCombinator(combinator);
//                             textRead = new StringBuilder();
//                             this.state = CSSTokenizerState.PARSING_CLASS_SELECTOR;
//                             break;
//                         case '#':
//                             simpleSelector = new UniversalSelector();
//                             selector.addSimpleSelector(simpleSelector);
//                             combinator = new DirectCombinator();
//                             selector.addCombinator(combinator);
//                             textRead = new StringBuilder();
//                             this.state = CSSTokenizerState.PARSING_ID_SELECTOR;
//                             break;
//                         case ' ': case '\t': case '\n': case '\r':
//                             simpleSelector = new UniversalSelector();
//                             selector.addSimpleSelector(simpleSelector);
//                             combinator = new DescendantCombinator();
//                             selector.addCombinator(combinator);
//                             textRead = new StringBuilder();
//                             this.state = CSSTokenizerState.PARSING_SELECTOR;
//                             break;
//                         case '+':
//                             simpleSelector = new UniversalSelector();
//                             selector.addSimpleSelector(simpleSelector);
//                             combinator = new AdjacentSiblingCombinator();
//                             selector.addCombinator(combinator);
//                             textRead = new StringBuilder();
//                             this.state = CSSTokenizerState.PARSING_SELECTOR;
//                             break;
//                         case '~':
//                             simpleSelector = new UniversalSelector();
//                             selector.addSimpleSelector(simpleSelector);
//                             combinator = new GeneralSiblingCombinator();
//                             selector.addCombinator(combinator);
//                             textRead = new StringBuilder();
//                             this.state = CSSTokenizerState.PARSING_SELECTOR;
//                             break;
//                         case '>':
//                             simpleSelector = new UniversalSelector();
//                             selector.addSimpleSelector(simpleSelector);
//                             combinator = new ChildCombinator();
//                             selector.addCombinator(combinator);
//                             textRead = new StringBuilder();
//                             this.state = CSSTokenizerState.PARSING_SELECTOR;
//                             break;
//                         case ':':
//                             simpleSelector = new UniversalSelector();
//                             selector.addSimpleSelector(simpleSelector);
//                             combinator = new DirectCombinator();
//                             selector.addCombinator(combinator);
//                             textRead = new StringBuilder();
//                             this.state = CSSTokenizerState.PARSING_PSEUDO_CLASS_SELECTOR;
//                             break;
//                         case '[':
//                             simpleSelector = new UniversalSelector();
//                             selector.addSimpleSelector(simpleSelector);
//                             combinator = new DirectCombinator();
//                             selector.addCombinator(combinator);
//                             textRead = new StringBuilder();
//                             this.state = CSSTokenizerState.PARSING_ATTRIBUTE_SELECTOR;
//                             break;
//                         case ',':
//                             simpleSelector = new UniversalSelector();
//                             selector.addSimpleSelector(simpleSelector);
//                             if(result == null) {
//                                 result = new ArrayList<Selector>();
//                             }
//                             result.add(selector);
//                             textRead = new StringBuilder();
//                             this.state = CSSTokenizerState.PARSING;
//                             break;
//                         case '{':
//                             simpleSelector = new UniversalSelector();
//                             selector.addSimpleSelector(simpleSelector);
//                             if(result == null) {
//                                 result = new ArrayList<Selector>();
//                             }
//                             result.add(selector);
//                             return result;
//                         default:
//                             textRead += character;
//                             break;
//                     }
//                     break;
//                 case CSSTokenizerState.PARSING_TYPE_SELECTOR:
//                     switch (character) {
//                         case '/':
//                             this.state = CSSTokenizerState.PARSING_SLASH;
//                             break;
//                         case '.':
//                             simpleSelector = new TypeSelector(textRead.toString());
//                             selector.addSimpleSelector(simpleSelector);
//                             combinator = new DirectCombinator();
//                             selector.addCombinator(combinator);
//                             textRead = new StringBuilder();
//                             this.state = CSSTokenizerState.PARSING_CLASS_SELECTOR;
//                             break;
//                         case '#':
//                             simpleSelector = new TypeSelector(textRead.toString());
//                             selector.addSimpleSelector(simpleSelector);
//                             combinator = new DirectCombinator();
//                             selector.addCombinator(combinator);
//                             textRead = new StringBuilder();
//                             this.state = CSSTokenizerState.PARSING_ID_SELECTOR;
//                             break;
//                         case ' ': case '\t': case '\n': case '\r':
//                             simpleSelector = new TypeSelector(textRead.toString());
//                             selector.addSimpleSelector(simpleSelector);
//                             combinator = new DescendantCombinator();
//                             selector.addCombinator(combinator);
//                             textRead = new StringBuilder();
//                             this.state = CSSTokenizerState.PARSING_SELECTOR;
//                             break;
//                         case '+':
//                             simpleSelector = new TypeSelector(textRead.toString());
//                             selector.addSimpleSelector(simpleSelector);
//                             combinator = new AdjacentSiblingCombinator();
//                             selector.addCombinator(combinator);
//                             textRead = new StringBuilder();
//                             this.state = CSSTokenizerState.PARSING_SELECTOR;
//                             break;
//                         case '~':
//                             simpleSelector = new TypeSelector(textRead.toString());
//                             selector.addSimpleSelector(simpleSelector);
//                             combinator = new GeneralSiblingCombinator();
//                             selector.addCombinator(combinator);
//                             textRead = new StringBuilder();
//                             this.state = CSSTokenizerState.PARSING_SELECTOR;
//                             break;
//                         case '>':
//                             simpleSelector = new TypeSelector(textRead.toString());
//                             selector.addSimpleSelector(simpleSelector);
//                             combinator = new ChildCombinator();
//                             selector.addCombinator(combinator);
//                             textRead = new StringBuilder();
//                             this.state = CSSTokenizerState.PARSING_SELECTOR;
//                             break;
//                         case ':':
//                             simpleSelector = new TypeSelector(textRead.toString());
//                             selector.addSimpleSelector(simpleSelector);
//                             combinator = new DirectCombinator();
//                             selector.addCombinator(combinator);
//                             textRead = new StringBuilder();
//                             this.state = CSSTokenizerState.PARSING_PSEUDO_CLASS_SELECTOR;
//                             break;
//                         case '[':
//                             simpleSelector = new TypeSelector(textRead.toString());
//                             selector.addSimpleSelector(simpleSelector);
//                             combinator = new DirectCombinator();
//                             selector.addCombinator(combinator);
//                             textRead = new StringBuilder();
//                             this.state = CSSTokenizerState.PARSING_ATTRIBUTE_SELECTOR;
//                             break;
//                         case ',':
//                             simpleSelector = new TypeSelector(textRead.toString());
//                             selector.addSimpleSelector(simpleSelector);
//                             if(result == null) {
//                                 result = new ArrayList<Selector>();
//                             }
//                             result.add(selector);
//                             textRead = new StringBuilder();
//                             this.state = CSSTokenizerState.PARSING;
//                             break;
//                         case '{':
//                             simpleSelector = new TypeSelector(textRead.toString());
//                             selector.addSimpleSelector(simpleSelector);
//                             if(result == null) {
//                                 result = new ArrayList<Selector>();
//                             }
//                             result.add(selector);
//                             return result;
//                         default:
//                             textRead += character;
//                             break;
//                     }
//                     break;
//                 case CSSTokenizerState.PARSING_PSEUDO_ELEMENT_SELECTOR:
//                     switch (character) {
//                         case '/':
//                             this.state = CSSTokenizerState.PARSING_SLASH;
//                             break;
//                         case '.':
//                             simpleSelector = new PseudoElementSelector(textRead.toString());
//                             selector.addSimpleSelector(simpleSelector);
//                             combinator = new DirectCombinator();
//                             selector.addCombinator(combinator);
//                             textRead = new StringBuilder();
//                             this.state = CSSTokenizerState.PARSING_CLASS_SELECTOR;
//                             break;
//                         case '#':
//                             simpleSelector = new PseudoElementSelector(textRead.toString());
//                             selector.addSimpleSelector(simpleSelector);
//                             combinator = new DirectCombinator();
//                             selector.addCombinator(combinator);
//                             textRead = new StringBuilder();
//                             this.state = CSSTokenizerState.PARSING_ID_SELECTOR;
//                             break;
//                         case ' ': case '\t': case '\n': case '\r':
//                             simpleSelector = new PseudoElementSelector(textRead.toString());
//                             selector.addSimpleSelector(simpleSelector);
//                             combinator = new DescendantCombinator();
//                             selector.addCombinator(combinator);
//                             textRead = new StringBuilder();
//                             this.state = CSSTokenizerState.PARSING_SELECTOR;
//                             break;
//                         case '+':
//                             simpleSelector = new PseudoElementSelector(textRead.toString());
//                             selector.addSimpleSelector(simpleSelector);
//                             combinator = new AdjacentSiblingCombinator();
//                             selector.addCombinator(combinator);
//                             textRead = new StringBuilder();
//                             this.state = CSSTokenizerState.PARSING_SELECTOR;
//                             break;
//                         case '~':
//                             simpleSelector = new PseudoElementSelector(textRead.toString());
//                             selector.addSimpleSelector(simpleSelector);
//                             combinator = new GeneralSiblingCombinator();
//                             selector.addCombinator(combinator);
//                             textRead = new StringBuilder();
//                             this.state = CSSTokenizerState.PARSING_SELECTOR;
//                             break;
//                         case '>':
//                             simpleSelector = new PseudoElementSelector(textRead.toString());
//                             selector.addSimpleSelector(simpleSelector);
//                             combinator = new ChildCombinator();
//                             selector.addCombinator(combinator);
//                             textRead = new StringBuilder();
//                             this.state = CSSTokenizerState.PARSING_SELECTOR;
//                             break;
//                         case ':':
//                             simpleSelector = new PseudoElementSelector(textRead.toString());
//                             selector.addSimpleSelector(simpleSelector);
//                             combinator = new ChildCombinator();
//                             selector.addCombinator(combinator);
//                             textRead = new StringBuilder();
//                             this.state = CSSTokenizerState.PARSING_PSEUDO_CLASS_SELECTOR;
//                             break;
//                         case '[':
//                             simpleSelector = new PseudoElementSelector(textRead.toString());
//                             selector.addSimpleSelector(simpleSelector);
//                             combinator = new DirectCombinator();
//                             selector.addCombinator(combinator);
//                             textRead = new StringBuilder();
//                             this.state = CSSTokenizerState.PARSING_ATTRIBUTE_SELECTOR;
//                             break;
//                         case ',':
//                             simpleSelector = new PseudoElementSelector(textRead.toString());
//                             selector.addSimpleSelector(simpleSelector);
//                             if(result == null) {
//                                 result = new ArrayList<Selector>();
//                             }
//                             result.add(selector);
//                             textRead = new StringBuilder();
//                             this.state = CSSTokenizerState.PARSING;
//                             break;
//                         case '{':
//                             simpleSelector = new PseudoElementSelector(textRead.toString());
//                             selector.addSimpleSelector(simpleSelector);
//                             if(result == null) {
//                                 result = new ArrayList<Selector>();
//                             }
//                             result.add(selector);
//                             return result;
//                         default:
//                             textRead += character;
//                             break;
//                     }
//                     break;                    
//                 case CSSTokenizerState.PARSING_PSEUDO_CLASS_SELECTOR:
//                     switch (character) {
//                         case '/':
//                             this.state = CSSTokenizerState.PARSING_SLASH;
//                             break;
//                         case '.':
//                             simpleSelector = new PseudoClassSelector(textRead.toString());
//                             selector.addSimpleSelector(simpleSelector);
//                             combinator = new DirectCombinator();
//                             selector.addCombinator(combinator);
//                             textRead = new StringBuilder();
//                             this.state = CSSTokenizerState.PARSING_CLASS_SELECTOR;
//                             break;
//                         case '#':
//                             simpleSelector = new PseudoClassSelector(textRead.toString());
//                             selector.addSimpleSelector(simpleSelector);
//                             combinator = new DirectCombinator();
//                             selector.addCombinator(combinator);
//                             textRead = new StringBuilder();
//                             this.state = CSSTokenizerState.PARSING_ID_SELECTOR;
//                             break;
//                         case ' ': case '\t': case '\n': case '\r':
//                             simpleSelector = new PseudoClassSelector(textRead.toString());
//                             selector.addSimpleSelector(simpleSelector);
//                             combinator = new DescendantCombinator();
//                             selector.addCombinator(combinator);
//                             textRead = new StringBuilder();
//                             this.state = CSSTokenizerState.PARSING_SELECTOR;
//                             break;
//                         case '+':
//                             simpleSelector = new PseudoClassSelector(textRead.toString());
//                             selector.addSimpleSelector(simpleSelector);
//                             combinator = new AdjacentSiblingCombinator();
//                             selector.addCombinator(combinator);
//                             textRead = new StringBuilder();
//                             this.state = CSSTokenizerState.PARSING_SELECTOR;
//                             break;
//                         case '~':
//                             simpleSelector = new PseudoClassSelector(textRead.toString());
//                             selector.addSimpleSelector(simpleSelector);
//                             combinator = new GeneralSiblingCombinator();
//                             selector.addCombinator(combinator);
//                             textRead = new StringBuilder();
//                             this.state = CSSTokenizerState.PARSING_SELECTOR;
//                             break;
//                         case '>':
//                             simpleSelector = new PseudoClassSelector(textRead.toString());
//                             selector.addSimpleSelector(simpleSelector);
//                             combinator = new ChildCombinator();
//                             selector.addCombinator(combinator);
//                             textRead = new StringBuilder();
//                             this.state = CSSTokenizerState.PARSING_SELECTOR;
//                             break;
//                         case ':':
//                             this.state = CSSTokenizerState.PARSING_PSEUDO_ELEMENT_SELECTOR;
//                             break;
//                         case '[':
//                             simpleSelector = new PseudoClassSelector(textRead.toString());
//                             selector.addSimpleSelector(simpleSelector);
//                             combinator = new DirectCombinator();
//                             selector.addCombinator(combinator);
//                             textRead = new StringBuilder();
//                             this.state = CSSTokenizerState.PARSING_ATTRIBUTE_SELECTOR;
//                             break;
//                         case ',':
//                             simpleSelector = new PseudoClassSelector(textRead.toString());
//                             selector.addSimpleSelector(simpleSelector);
//                             if(result == null) {
//                                 result = new ArrayList<Selector>();
//                             }
//                             result.add(selector);
//                             textRead = new StringBuilder();
//                             this.state = CSSTokenizerState.PARSING;
//                             break;
//                         case '{':
//                             simpleSelector = new PseudoClassSelector(textRead.toString());
//                             selector.addSimpleSelector(simpleSelector);
//                             if(result == null) {
//                                 result = new ArrayList<Selector>();
//                             }
//                             result.add(selector);
//                             return result;
//                         default:
//                             textRead += character;
//                             break;
//                     }
//                     break;
//                 case CSSTokenizerState.PARSING_SLASH:
//                     switch (character) {
//                         case '*':
//                             readCssComment();
//                             this.state = CSSTokenizerState.PARSING;
//                             break;
//                         case ',':
//                             this.state = CSSTokenizerState.PARSING;
//                             break;
//                         default:
//                             this.state = CSSTokenizerState.PARSING;
//                             break;
//                     }
//                     break;
//             }
//         }
//         this._setState(CSSTokenizerState.PARSING_END_OF_FILE);
//         return result;
//     }