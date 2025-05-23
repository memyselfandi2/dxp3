const packageName = 'dxp3-lang-html';
const moduleName = 'HTMLTokenizer';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * @module dxp3-lang-html/HTMLTokenizer
 */
const DOCTYPE = require('./DOCTYPE');
const http = require('http');
const https = require('https');
const HTMLComment = require('./HTMLComment');
const HTMLSymbol = require('./HTMLSymbol');
const HTMLTag = require('./HTMLTag');
const HTMLTagType = require('./HTMLTagType');
const HTMLText = require('./HTMLText');
const HTMLTokenizerOptions = require('./HTMLTokenizerOptions');
const HTMLTokenizerState = require('./HTMLTokenizerState');
const Javascript = require('./Javascript');
const logging = require('dxp3-logging');
const Stylesheet = require('./Stylesheet');
const url = require('url');
const util = require('dxp3-util');

const logger = logging.getLogger(canonicalName);
/**
 * A HTMLTokenizer.
 */
class HTMLTokenizer {

	constructor(_html) {
		if(_html != undefined && _html != null) {
			this.initialize(_html);
		} else {
			this.reset();
		}
	}
	getHTML() {
		return this.html;
	}
	getState() {
		return this.state;
	}
	/**
	 * This is an alias for our initialize method.
	 */
	init(_html) {
		this.initialize(_html);
	}

	initialize(_html) {
		this.reset();
		// Defensive programming...check input...
		if(_html === undefined || _html === null) {
			_html = '';
		}
		this.html = _html;
        this.length = this.html.length;
	}
	/**
	 * This is an alias for our initialize method.
	 */
	load(_html) {
		this.initialize(_html);
	}
	/**
	 * Set a marker to get back to.
	 */
    mark() {
        this.marker = this.index;
    }
	/**
	 * This is an alias for our initialize method.
	 */
	parse(_html) {
		this.initialize(_html);
	}

	read() {
        this.index++;
        if(this.index >= this.length) {
            return null;
        }
        return this.html.charAt(this.index);
    }

	reset() {
        this.index = -1;
        this.length = 0;
        this.html = '';
        this.marker = -1;
        this.setState(HTMLTokenizerState.INITIALIZED);
	}
	/**
	 * This is an alias for our initialize method.
	 */
	setHTML(_html) {
		this.initialize(_html);
	}

	setState(_state) {
		this.state = _state;
	}

    toMark() {
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

	nextHTMLElement() {
        let self = this;
        return new Promise((resolve, reject) => {
            let callback = HTMLTokenizer._createCallbackToPromise(resolve, reject);
            try {
                let htmlElement = null;
                /*
                 * If we have just finished reading javascript we identified the end of the javascript by a </SCRIPT> tag.
                 * We still need to sent this tag.
                 */
                if (this.state === HTMLTokenizerState.PARSING_SCRIPT_FINISHED) {
                    this.setState(HTMLTokenizerState.PARSING_TEXT);
                    return callback(null, new HTMLTag("script", HTMLTagType.END_TAG));
                }
                /*
                 * If we have just finished reading a style we identified the end of the style by a </STYLE> tag.
                 * We still need to sent this tag.
                 */
                if (this.state === HTMLTokenizerState.PARSING_STYLE_FINISHED) {
                    this.setState(HTMLTokenizerState.PARSING_TEXT);
                    return callback(null, new HTMLTag("style", HTMLTagType.END_TAG));
                }
                // Keep reading until we have reached the end of the file/text.
                while (this.state != HTMLTokenizerState.END_OF_FILE) {
                    switch (this.state) {
                    	case HTMLTokenizerState.INITIALIZED:
                    		this.setState(HTMLTokenizerState.PARSING_DOCTYPE);
                    		break;
                        case HTMLTokenizerState.PARSING_COMMENT:
                            htmlElement = this.readHTMLComment();
                            break;
                        case HTMLTokenizerState.PARSING_DOCTYPE:
                            htmlElement = this.readDoctype();
                            break;
                        case HTMLTokenizerState.PARSING_TEXT:
                        // console.log('calling readHTMLText();');
                            // Try to read html text and update our state
                            // depending on if we encounter
                            // a potential tag, potential special text, reach
                            // the end of the file etc.
                            htmlElement = this.readHTMLText();
                            break;
                        case HTMLTokenizerState.PARSING_AMPERSAND:
                            // Attempt to read special text text and
                            // update our state depending on if we encounter
                            // a potential tag, more potential special text, reach
                            // the end of the file etc.
                            htmlElement = this.readHTMLSymbol();
                            break;
                        case HTMLTokenizerState.PARSING_LT:
                            htmlElement = this.readHTMLTag();
                            if(htmlElement != null && (htmlElement instanceof HTMLTag)) {
                            	let htmlTag = htmlElement;
                            	if(htmlTag.getHTMLTagType() === HTMLTagType.START_TAG) {
                            		switch(htmlTag.getId()) {
                            			case HTMLTag.TAG_SCRIPT:
                            				this.setState(HTMLTokenizerState.PARSING_SCRIPT);
                            				break;
                            			case HTMLTag.TAG_STYLE:
                            				this.setState(HTMLTokenizerState.PARSING_STYLE);
                            				break;
                                        case HTMLTag.TAG_AREA:
                                        case HTMLTag.TAG_BASE:
                                        case HTMLTag.TAG_BR:
                                        case HTMLTag.TAG_COL:
                                        case HTMLTag.TAG_EMBED:
                                        case HTMLTag.TAG_HR:
                                        case HTMLTag.TAG_IMG:
                                        case HTMLTag.TAG_INPUT:
                                        case HTMLTag.TAG_LINK:
                                        case HTMLTag.TAG_META:
                                        case HTMLTag.TAG_PARAM:
                                        case HTMLTag.TAG_SOURCE:
                                        case HTMLTag.TAG_TRACK:
                                        case HTMLTag.TAG_WBR:
                                            htmlElement.setHTMLTagType(HTMLTagType.START_END_TAG);
                                            break;
                            			default:
                            				break;
                            		}
                                } else if (htmlTag.getHTMLTagType() === HTMLTagType.END_TAG) {
                                    switch(htmlTag.getId()) {
                                        case HTMLTag.TAG_AREA:
                                        case HTMLTag.TAG_BASE:
                                        case HTMLTag.TAG_BR:
                                        case HTMLTag.TAG_COL:
                                        case HTMLTag.TAG_EMBED:
                                        case HTMLTag.TAG_HR:
                                        case HTMLTag.TAG_IMG:
                                        case HTMLTag.TAG_INPUT:
                                        case HTMLTag.TAG_LINK:
                                        case HTMLTag.TAG_META:
                                        case HTMLTag.TAG_PARAM:
                                        case HTMLTag.TAG_SOURCE:
                                        case HTMLTag.TAG_TRACK:
                                        case HTMLTag.TAG_WBR:
                                            // we are going to ignore this
                                            htmlElement = null;
                                            break;
                                        default:
                                            break;
                                    }
                                }
                            }
                            break;
                        case HTMLTokenizerState.PARSING_SCRIPT:
                            htmlElement = this.readScript();
                            this.setState(HTMLTokenizerState.PARSING_SCRIPT_FINISHED);
                            break;
                        case HTMLTokenizerState.PARSING_STYLE:
                            htmlElement = this.readStyle();
                            this.setState(HTMLTokenizerState.PARSING_STYLE_FINISHED);
                            break;
                        // This should never be reached!
                        default:
                        	logger.warn('Unknown state \'' + this.state + '\' while parsing the next HTML element.');
                            return callback('Unknown state \'' + this.state + '\'');
                    }
                    // console.log('and we are out of the switch');
                    // If we found a valid HTMLElement, lets return it.
                    if (htmlElement != null) {
        // console.log('htmlElement: ' + htmlElement.toString());
                        return callback(null, htmlElement);
                    }
                }
                return callback(null, htmlElement);
            } catch(exception) {
                callback(exception);
            }
        });
	}

    readStyle() {
        let textRead = '';
        let tagState = HTMLTokenizerState.PARSING_STYLE;
        let character = null;
        // Keep reading until we encounter </script>
        while ((character = this.read()) != null) {
            switch (tagState) {
                case HTMLTokenizerState.PARSING_STYLE:
                    switch (character) {
                        case '<':
                            tagState = HTMLTokenizerState.PARSING_LT;
                            break;
                        default:
                            textRead += character;
                            break;
                    }
                    break;
                case HTMLTokenizerState.PARSING_LT:
                    switch (character) {
                        case '/':
                            tagState = HTMLTokenizerState.PARSING_LT_SLASH;
                            break;
                        default:
                            textRead += '<' + character;
                            tagState = HTMLTokenizerState.PARSING_STYLE;
                            break;
                    }
                    break;
                case HTMLTokenizerState.PARSING_LT_SLASH:
                    switch (character) {
                        case 's':
                        case 'S':
                            tagState = HTMLTokenizerState.PARSING_LT_SLASH_S;
                            break;
                        default:
                            textRead += "</" + character;
                            tagState = HTMLTokenizerState.PARSING_STYLE;
                            break;
                    }
                    break;
                case HTMLTokenizerState.PARSING_LT_SLASH_S:
                    switch (character) {
                        case 't':
                        case 'T':
                            tagState = HTMLTokenizerState.PARSING_LT_SLASH_ST;
                            break;
                        default:
                            textRead += "</s" + character;
                            tagState = HTMLTokenizerState.PARSING_STYLE;
                            break;
                    }
                    break;
                case HTMLTokenizerState.PARSING_LT_SLASH_ST:
                    switch (character) {
                        case 'y':
                        case 'Y':
                            tagState = HTMLTokenizerState.PARSING_LT_SLASH_STY;
                            break;
                        default:
                            textRead += "</st" + character;
                            tagState = HTMLTokenizerState.PARSING_STYLE;
                            break;
                    }
                    break;
                case HTMLTokenizerState.PARSING_LT_SLASH_STY:
                    switch (character) {
                        case 'l':
                        case 'L':
                            tagState = HTMLTokenizerState.PARSING_LT_SLASH_STYL;
                            break;
                        default:
                            textRead += "</sty" + character;
                            tagState = HTMLTokenizerState.PARSING_STYLE;
                            break;
                    }
                    break;
                case HTMLTokenizerState.PARSING_LT_SLASH_STYL:
                    switch (character) {
                        case 'e':
                        case 'E':
                            tagState = HTMLTokenizerState.PARSING_LT_SLASH_STYLE;
                            break;
                        default:
                            textRead += "</styl" + character;
                            tagState = HTMLTokenizerState.PARSING_STYLE;
                            break;
                    }
                    break;
                case HTMLTokenizerState.PARSING_LT_SLASH_STYLE:
                    switch (character) {
                        case '>':
                            return new Stylesheet(textRead);
                        default:
                            textRead += "</style" + character;
                            tagState = HTMLTokenizerState.PARSING_STYLE;
                            break;
                    }
                    break;
                default:
                    break;
            }
        }
        this.setState(HTMLTokenizerState.END_OF_FILE);
        return new Stylesheet(textRead);
    }

    readScript() {
        let textRead = '';
        let tagState = HTMLTokenizerState.PARSING_SCRIPT;
        let character = null;
        // Keep reading until we encounter </script>
        while ((character = this.read()) != null) {
            switch (tagState) {
                case HTMLTokenizerState.PARSING_SCRIPT:
                    switch (character) {
                        case '<':
                            tagState = HTMLTokenizerState.PARSING_LT;
                            break;
                        default:
                            textRead += character;
                            break;
                    }
                    break;
                case HTMLTokenizerState.PARSING_LT:
                    switch (character) {
                        case '/':
                            tagState = HTMLTokenizerState.PARSING_LT_SLASH;
                            break;
                        default:
                            textRead += '<' + character;
                            tagState = HTMLTokenizerState.PARSING_SCRIPT;
                            break;
                    }
                    break;
                case HTMLTokenizerState.PARSING_LT_SLASH:
                    switch (character) {
                        case 's':
                        case 'S':
                            tagState = HTMLTokenizerState.PARSING_LT_SLASH_S;
                            break;
                        default:
                            textRead += "</" + character;
                            tagState = HTMLTokenizerState.PARSING_SCRIPT;
                            break;
                    }
                    break;
                case HTMLTokenizerState.PARSING_LT_SLASH_S:
                    switch (character) {
                        case 'c':
                        case 'C':
                            tagState = HTMLTokenizerState.PARSING_LT_SLASH_SC;
                            break;
                        default:
                            textRead += "</s" + character;
                            tagState = HTMLTokenizerState.PARSING_SCRIPT;
                            break;
                    }
                    break;
                case HTMLTokenizerState.PARSING_LT_SLASH_SC:
                    switch (character) {
                        case 'r':
                        case 'R':
                            tagState = HTMLTokenizerState.PARSING_LT_SLASH_SCR;
                            break;
                        default:
                            textRead += "</sc" + character;
                            tagState = HTMLTokenizerState.PARSING_SCRIPT;
                            break;
                    }
                    break;
                case HTMLTokenizerState.PARSING_LT_SLASH_SCR:
                    switch (character) {
                        case 'i':
                        case 'I':
                            tagState = HTMLTokenizerState.PARSING_LT_SLASH_SCRI;
                            break;
                        default:
                            textRead += "</scr" + character;
                            tagState = HTMLTokenizerState.PARSING_SCRIPT;
                            break;
                    }
                    break;
                case HTMLTokenizerState.PARSING_LT_SLASH_SCRI:
                    switch (character) {
                        case 'p':
                        case 'P':
                            tagState = HTMLTokenizerState.PARSING_LT_SLASH_SCRIP;
                            break;
                        default:
                            textRead += "</scri" + character;
                            tagState = HTMLTokenizerState.PARSING_SCRIPT;
                            break;
                    }
                    break;
                case HTMLTokenizerState.PARSING_LT_SLASH_SCRIP:
                    switch (character) {
                        case 't':
                        case 'T':
                            tagState = HTMLTokenizerState.PARSING_LT_SLASH_SCRIPT;
                            break;
                        default:
                            textRead += "</scrip" + character;
                            tagState = HTMLTokenizerState.PARSING_SCRIPT;
                            break;
                    }
                    break;
                case HTMLTokenizerState.PARSING_LT_SLASH_SCRIPT:
                    switch (character) {
                        case '>':
                            return new Javascript(textRead);
                        default:
                            textRead += "</script" + character;
                            tagState = HTMLTokenizerState.PARSING_SCRIPT;
                            break;
                    }
                    break;
                default:
                    break;
            }
        }
        this.setState(HTMLTokenizerState.END_OF_FILE);
        return new Javascript(textRead);
    }

    readHTMLSymbol() {
        let textRead = '&';
        let character = null;
        while ((character = this.read()) != null) {
            switch (character) {
                case '<':
                    this.setState(HTMLTokenizerState.PARSING_LT);
                    return new HTMLText(textRead);
                case '&':
                    this.setState(HTMLTokenizerState.PARSING_AMPERSAND);
                    return new HTMLText(textRead);
                case ' ': case '\t': case '\r': case '\n':
                    this.setState(HTMLTokenizerState.PARSING_TEXT);
                	return new HTMLText(textRead);
                case ';':
                    this.setState(HTMLTokenizerState.PARSING_TEXT);
                    let htmlSymbol = HTMLSymbol.getHTMLSymbol(textRead);
                    if(htmlSymbol.entityNumber === HTMLSymbol.ENTITY_UNKNOWN.entityNumber) {
                        textRead += character;
                        return new HTMLText(textRead);
                    }
                    return htmlSymbol;
                default:
                    break;
            }
            textRead += character;
        }
        this.setState(HTMLTokenizerState.END_OF_FILE);
        return new HTMLText(textRead);
    }

    readHTMLTag() {
        let tagName = '';
        let textRead = '<';
        let tagState = HTMLTokenizerState.PARSING_LT;
        let character = null;
        while ((character = this.read()) != null) {
            switch (tagState) {
                case HTMLTokenizerState.PARSING_LT:
                    switch (character) {
                        // A tag does not contain another < character.
                        case '<':
                            // Parsing potential tag.
                            // Treat everything before as html text
                            return new HTMLText(textRead);
                        // A HTML tag does not start with a whitespace character.
                        case ' ': case '\t': case '\r':
                            this.setState(HTMLTokenizerState.PARSING_TEXT);
                            textRead += character;
                            return new HTMLText(textRead);
                        case '!':
                            tagState = HTMLTokenizerState.PARSING_LT_EXPL;
                            break;
                        case '/':
                            tagState = HTMLTokenizerState.PARSING_LT_SLASH;
                            break;
                        default:
                            tagState = HTMLTokenizerState.PARSING_LT_CHAR;
                            tagName += character;
                            break;
                    }
                    break;
                case HTMLTokenizerState.PARSING_LT_EXPL:
                    switch (character) {
                        case '<':
                            // Parsing potential tag.
                            // Treat everything before as html text
                            return new HTMLText(textRead);
                        case '-':
                            tagState = HTMLTokenizerState.PARSING_LT_EXPL_DASH;
                            break;
                        default:
                            this.setState(HTMLTokenizerState.PARSING_TEXT);
                            textRead += character;
                            return new HTMLText(textRead);
                    }
                    break;
                case HTMLTokenizerState.PARSING_LT_EXPL_DASH:
                    switch (character) {
                        case '<':
                            // Parsing potential tag.
                            // Treat everything before as html text
                            return new HTMLText(textRead);
                        case '-':
                            this.setState(HTMLTokenizerState.PARSING_COMMENT);
                            return null;
                        default:
                            this.setState(HTMLTokenizerState.PARSING_TEXT);
                            textRead += character;
                            return new HTMLText(textRead);
                    }
//                break;
                case HTMLTokenizerState.PARSING_LT_CHAR:
                    switch (character) {
                        case '<':
                            // Parsing potential tag.
                            // Treat everything before as html text
                            return new HTMLText(textRead);
                        case ' ': case '\t': case '\r': case '\n':
                            this.setState(HTMLTokenizerState.PARSING_TEXT);
                            textRead += character;
                            if (HTMLTag.isValid(tagName)) {
                                return this.readAttributes(tagName, textRead);
                            }
                            // An unknown html tag...what to do ?
                            return new HTMLText(textRead);
                        case '>':
                            this.setState(HTMLTokenizerState.PARSING_TEXT);
                            if (HTMLTag.isValid(tagName)) {
                                return new HTMLTag(tagName, HTMLTagType.START_TAG);
                            }
                            // An unknown html tag...what to do ?
                            return new HTMLText(textRead);
                        case '/':
                            tagState = HTMLTokenizerState.PARSING_LT_CHAR_SLASH;
                            break;
                        default:
                            tagName += character;
                            break;
                    }
                    break;
                case HTMLTokenizerState.PARSING_LT_CHAR_SLASH:
                    switch (character) {
                        case ' ': case '\t': case '\r': case '\n':
                            break;
                        case '>':
                            this.setState(HTMLTokenizerState.PARSING_TEXT);
                            if (HTMLTag.isValid(tagName)) {
                                return new HTMLTag(tagName, HTMLTagType.START_END_TAG);
                            }
                            // An unknown html tag...what to do ?
                            return new HTMLText(textRead);
                        default:
                            this.setState(HTMLTokenizerState.PARSING_TEXT);
                            textRead += character;
                            return new HTMLText(textRead);
                    }
                    break;
                case HTMLTokenizerState.PARSING_LT_SLASH:
                    switch (character) {
                        case ' ': case '\t': case '\r':
                            this.setState(HTMLTokenizerState.PARSING_TEXT);
                            textRead += character;
                            return new HTMLText(textRead);
                        default:
                            tagState = HTMLTokenizerState.PARSING_LT_SLASH_CHAR;
                            tagName += character;
                            break;
                    }
                    break;
                case HTMLTokenizerState.PARSING_LT_SLASH_CHAR:
                    switch (character) {
                        case ' ': case '\t': case '\r':
                            tagState = HTMLTokenizerState.PARSING_LT_SLASH_CHAR_WHITESPACE;
                            break;
                        case '>':
                            this.setState(HTMLTokenizerState.PARSING_TEXT);
                            if (HTMLTag.isValid(tagName)) {
                                return new HTMLTag(tagName, HTMLTagType.END_TAG);
                            }
                            // An unknown html tag...what to do ?
                            return new HTMLText(textRead);
                        default:
                            tagName += character;
                            break;
                    }
                    break;
                case HTMLTokenizerState.PARSING_LT_SLASH_CHAR_WHITESPACE:
                    switch (character) {
                        case ' ': case '\t': case '\r':
                            break;
                        case '>':
                            this.setState(HTMLTokenizerState.PARSING_TEXT);
                            if (HTMLTag.isValid(tagName)) {
                                return new HTMLTag(tagName, HTMLTagType.END_TAG);
                            }
                            // An unknown html tag...what to do ?
                            return new HTMLText(textRead);
                        default:
                            this.setState(HTMLTokenizerState.PARSING_TEXT);
                            textRead += character;
                            return new HTMLText(textRead);
                    }
                    break;
                // This should never be reached!
                default:
		        	logger.warn('Unknown state \'' + tagState + '\' while parsing HTML tag.');
                    this.setState(HTMLTokenizerState.PARSING_TEXT);
                    textRead += character;
                    return new HTMLText(textRead);
            }
            textRead += character;
        }
        this.setState(HTMLTokenizerState.PARSING_END_OF_FILE);
        return new HTMLText(textRead);
    }

    readAttributes(tagName, textRead) {
        let attribute = null;
        let value = null;
        let tagState = HTMLTokenizerState.PARSING_ATTRIBUTE;
        let htmlTag = null;
        let attributes = new Map();
        let character = null;
        while ((character = this.read()) != null) {
            switch (tagState) {
                case HTMLTokenizerState.PARSING_ATTRIBUTE:
                    switch (character) {
                        case '<':
                            this.setState(HTMLTokenizerState.PARSING_LT);
                            return new HTMLText(textRead);
                        case '&':
                            this.setState(HTMLTokenizerState.PARSING_AMPERSAND);
                            return new HTMLText(textRead);
		                case ' ': case '\t': case '\r': case '\n':
                            break;
                        case '>':
                            htmlTag = new HTMLTag(tagName, HTMLTagType.START_TAG);
                            htmlTag.addAttributes(attributes);
                            return htmlTag;
                        case '/':
                            tagState = HTMLTokenizerState.PARSING_LT_SLASH;
                            break;
                        default:
                            attribute = '';
                            attribute += character;
                            tagState = HTMLTokenizerState.PARSING_CHAR;
                            break;
                    }
                    break;
                case HTMLTokenizerState.PARSING_EQUALS:
                    switch (character) {
		                case ' ': case '\t': case '\r': case '\n':
                            break;
                        case '<':
                            this.setState(HTMLTokenizerState.PARSING_LT);
                            return new HTMLText(textRead);
                        case '&':
                            this.setState(HTMLTokenizerState.PARSING_AMPERSAND);
                            return new HTMLText(textRead);
                        case '=':
                            tagState = HTMLTokenizerState.PARSING_VALUE;
                            break;
                        case '>':
                            attributes.set(attribute, null);
                            htmlTag = new HTMLTag(tagName, HTMLTagType.START_TAG);
                            htmlTag.addAttributes(attributes);
                            return htmlTag;
                        case '/':
                            attributes.set(attribute, null);
                            tagState = HTMLTokenizerState.PARSING_LT_SLASH;
                            break;
                        default:
                            attributes.set(attribute, null);
                            attribute = '';
                            attribute += character;
                            tagState = HTMLTokenizerState.PARSING_CHAR;
                            break;
                    }
                    break;
                case HTMLTokenizerState.PARSING_CHAR:
                    switch (character) {
                        case '<':
                            this.setState(HTMLTokenizerState.PARSING_LT);
                            return new HTMLText(textRead);
                        case '&':
                            this.setState(HTMLTokenizerState.PARSING_AMPERSAND);
                            return new HTMLText(textRead);
                        case ' ': case '\t': case '\r': case '\n':
                            tagState = HTMLTokenizerState.PARSING_EQUALS;
                            break;
                        case '=':
                            tagState = HTMLTokenizerState.PARSING_VALUE;
                            break;
                        case '>':
                            attributes.set(attribute, null);
                            htmlTag = new HTMLTag(tagName, HTMLTagType.START_TAG);
                            htmlTag.addAttributes(attributes);
                            return htmlTag;
                        case '/':
                            attributes.set(attribute, null);
                            tagState = HTMLTokenizerState.PARSING_LT_SLASH;
                            break;
                        default:
                            attribute += character;
                            break;
                    }
                    break;
                case HTMLTokenizerState.PARSING_LT_SLASH:
                    switch (character) {
                        case '<':
                            this.setState(HTMLTokenizerState.PARSING_LT);
                            return new HTMLText(textRead);
                        case '&':
                            this.setState(HTMLTokenizerState.PARSING_AMPERSAND);
                            return new HTMLText(textRead);
                        case '>':
                            htmlTag = new HTMLTag(tagName, HTMLTagType.START_END_TAG);
                            htmlTag.addAttributes(attributes);
                            return htmlTag;
                        default:
                            textRead += character;
                            this.setState(HTMLTokenizerState.PARSING_TEXT);
                            return new HTMLText(textRead);
                    }
                case HTMLTokenizerState.PARSING_VALUE:
                    switch (character) {
                        case '<':
                            this.setState(HTMLTokenizerState.PARSING_LT);
                            return new HTMLText(textRead);
                        case '&':
                            this.setState(HTMLTokenizerState.PARSING_AMPERSAND);
                            return new HTMLText(textRead);
                        case ' ': case '\t': case '\r': case '\n':
                            break;
                        case '>':
                            htmlTag = new HTMLTag(tagName, HTMLTagType.START_END_TAG);
                            htmlTag.addAttributes(attributes);
                            return htmlTag;
                        case '\'':
                            tagState = HTMLTokenizerState.PARSING_SINGLE_QUOTED_CHAR;
                            value = '';
                            break;
                        case '\"':
                            tagState = HTMLTokenizerState.PARSING_DOUBLE_QUOTED_CHAR;
                            value = '';
                            break;
                        default:
                            tagState = HTMLTokenizerState.PARSING_NO_QUOTED_CHAR;
                            value = '';
                            value += character;
                            break;
                    }
                    break;
                case HTMLTokenizerState.PARSING_NO_QUOTED_CHAR:
                    switch (character) {
                        case '<':
                            this.setState(HTMLTokenizerState.PARSING_LT);
                            return new HTMLText(textRead);
                        case '&':
                            this.setState(HTMLTokenizerState.PARSING_AMPERSAND);
                            return new HTMLText(textRead);
                        case ' ': case '\t': case '\r': case '\n':
                            attributes.set(attribute, value);
                            tagState = HTMLTokenizerState.PARSING_ATTRIBUTE;
                            break;
                        case '/':
                            tagState = HTMLTokenizerState.PARSING_NO_QUOTED_CHAR_SLASH;
                            break;
                        case '>':
                            attributes.set(attribute, value);
                            htmlTag = new HTMLTag(tagName, HTMLTagType.START_TAG);
                            htmlTag.addAttributes(attributes);
                            return htmlTag;
                        default:
                            value += character;
                            break;
                    }
                    break;
                case HTMLTokenizerState.PARSING_NO_QUOTED_CHAR_SLASH:
                    switch (character) {
                        case '<':
                            this.setState(HTMLTokenizerState.PARSING_LT);
                            return new HTMLText(textRead);
                        case '&':
                            value += "/";
                            value += character;
                            tagState = HTMLTokenizerState.PARSING_NO_QUOTED_CHAR;
                            break;
                        case ' ': case '\t': case '\r': case '\n':
                            value += "/";
                            attributes.set(attribute, value);
                            tagState = HTMLTokenizerState.PARSING_ATTRIBUTE;
                            break;
                        case '/':
                            value += "/";
                            break;
                        case '>':
                            attributes.set(attribute, value);
                            htmlTag = new HTMLTag(tagName, HTMLTagType.START_TAG);
                            htmlTag.addAttributes(attributes);
                            return htmlTag;
                        default:
                            value += "/";
                            value += character;
                            tagState = HTMLTokenizerState.PARSING_NO_QUOTED_CHAR;
                            break;
                    }
                    break;
                case HTMLTokenizerState.PARSING_SINGLE_QUOTED_CHAR:
                    switch (character) {
                        case '\'':
                            attributes.set(attribute, value);
                            tagState = HTMLTokenizerState.PARSING_ATTRIBUTE;
                            break;
                        default:
                            value += character;
                            break;
                    }
                    break;
                case HTMLTokenizerState.PARSING_DOUBLE_QUOTED_CHAR:
                    switch (character) {
                        case '\"':
                            attributes.set(attribute, value);
                            tagState = HTMLTokenizerState.PARSING_ATTRIBUTE;
                            break;
                        default:
                            value += character;
                            break;
                    }
                    break;
                default:
		        	logger.warn('Unknown state \'' + tagState + '\' while parsing HTML attributes.');
                    this.setState(HTMLTokenizerState.PARSING_TEXT);
                    textRead += character;
                    return new HTMLText(textRead);
            }
            textRead += character;
        }
        this.setState(HTMLTokenizerState.END_OF_FILE);
        return new HTMLText(textRead);
    }

    readHTMLComment() {
        let textRead = '';
        let tagState = HTMLTokenizerState.PARSING_LT_EXPL_DASH_DASH;
        let character = null;
        while ((character = this.read()) != null) {
            switch (tagState) {
                case HTMLTokenizerState.PARSING_LT_EXPL_DASH_DASH:
                    switch (character) {
                        case '-':
                            tagState = HTMLTokenizerState.PARSING_COMMENT_DASH;
                            break;
                        default:
                            textRead += character;
                            break;
                    }
                    break;
                case HTMLTokenizerState.PARSING_COMMENT_DASH:
                    switch (character) {
                        case '-':
                            tagState = HTMLTokenizerState.PARSING_COMMENT_DASH_DASH;
                            break;
                        default:
                            textRead += '-' + character;
                            tagState = HTMLTokenizerState.PARSING_LT_EXPL_DASH_DASH;
                            break;
                    }
                    break;
                case HTMLTokenizerState.PARSING_COMMENT_DASH_DASH:
                    switch (character) {
                        case '>':
                        	this.setState(HTMLTokenizerState.PARSING_TEXT);
                            return new HTMLComment(textRead);
                        case '-':
                            textRead += '-';
                            break;
                        default:
                            textRead += '--' + character;
                            tagState = HTMLTokenizerState.PARSING_LT_EXPL_DASH_DASH;
                            break;
                    }
                    break;
                default:
		        	logger.warn('Unknown state \'' + tagState + '\' while parsing HTML comment.');
                    this.setState(HTMLTokenizerState.PARSING_TEXT);
                    textRead += character;
                    return new HTMLComment(textRead);
            }
        }
        /*
         * the end of the file was reached before we had completely read the comment. We give the author the benefit of
         * the doubt and return the remainder as a html comment.
         */
        this.setState(HTMLTokenizerState.END_OF_FILE);
        return new HTMLComment(textRead);
    }

    readHTMLText() {
// console.log('readHTMLText');
        let textRead = '';
        let tagState = HTMLTokenizerState.PARSING_TEXT;
        let character = null;
        /*
         * Read a character until:
         * - we reach the end of the file or
         * - we encounter a '<', which would indicate the possible start of a html tag.
         * - we encounter a '&', which would indicate the possible start of a special character
         */
        while ((character = this.read()) != null) {
// console.log('I read: ' + character);
            switch (tagState) {
                case HTMLTokenizerState.PARSING_TEXT:
                    switch (character) {
                        case '<':
                            this.setState(HTMLTokenizerState.PARSING_LT);
                            return null;
                        case '&':
                            this.setState(HTMLTokenizerState.PARSING_AMPERSAND);
                            return null;
                        default:
                            tagState = HTMLTokenizerState.PARSING_CHAR;
                            break;
                    }
                    break;
                case HTMLTokenizerState.PARSING_CHAR:
                    switch (character) {
                        case '<':
                            this.setState(HTMLTokenizerState.PARSING_LT);
                            return new HTMLText(textRead);
                        case '&':
                            this.setState(HTMLTokenizerState.PARSING_AMPERSAND);
                            return new HTMLText(textRead);
                        default:
                            break;
                    }
            }
            textRead += character;
        }
        /*
         * If we arrive here we have reached the end of the file. return new HTMLText if we actually read some
         * characters. If not we return null.
         */
// console.log('end of file reached');
        this.setState(HTMLTokenizerState.END_OF_FILE);
        if (textRead.length > 0) {
            return new HTMLText(textRead);
        }
        return null;
    }

    readDoctype() {
        let textRead = '';
        let doctypeBody = '';
        let tagState = HTMLTokenizerState.PARSING_DOCTYPE;
        let character = null;
        while ((character = this.read()) != null) {
            switch (tagState) {
                case HTMLTokenizerState.PARSING_DOCTYPE:
                    switch (character) {
                        case '<':
                            this.mark();
                            tagState = HTMLTokenizerState.PARSING_LT;
                            break;
                        case ' ': case '\t': case '\r': case '\n':
                            break;
                        case '&':
                            this.setState(HTMLTokenizerState.PARSING_AMPERSAND);
                            return new HTMLText(textRead);
                        default:
                            this.setState(HTMLTokenizerState.PARSING_TEXT);
                            textRead += character;
                            return new HTMLText(textRead);
                    }
                    break;
                case HTMLTokenizerState.PARSING_LT:
                    switch (character) {
                        case '!':
                            tagState = HTMLTokenizerState.PARSING_LT_EXPL;
                            break;
                        case ' ': case '\t': case '\r': case '\n':
                            this.setState(HTMLTokenizerState.PARSING_TEXT);
                            textRead += character;
                            return new HTMLText(textRead);
                        case '&':
                            this.setState(HTMLTokenizerState.PARSING_AMPERSAND);
                            return new HTMLText(textRead);
                        case '<':
                            this.setState(HTMLTokenizerState.PARSING_LT);
                            return new HTMLText(textRead);
                        default:
                            this.setState(HTMLTokenizerState.PARSING_LT);
                            this.toMark();
                            return null;
                    }
                    break;
                case HTMLTokenizerState.PARSING_LT_EXPL:
                    switch (character) {
                        case '<':
                            this.setState(HTMLTokenizerState.PARSING_LT);
                            return new HTMLText(textRead);
                        case '&':
                            this.setState(HTMLTokenizerState.PARSING_AMPERSAND);
                            return new HTMLText(textRead);
                        case '-':
                            tagState = HTMLTokenizerState.PARSING_LT_EXPL_DASH;
                            break;
                        case 'D': case 'd':
                            tagState = HTMLTokenizerState.PARSING_LT_EXPL_D;
                            break;
                        default:
                            this.setState(HTMLTokenizerState.PARSING_TEXT);
                            textRead += character;
                            return new HTMLText(textRead);
                    }
                    break;
                case HTMLTokenizerState.PARSING_LT_EXPL_DASH:
                    switch (character) {
                        case '<':
                            this.setState(HTMLTokenizerState.PARSING_LT);
                            return new HTMLText(textRead);
                        case '&':
                            this.setState(HTMLTokenizerState.PARSING_AMPERSAND);
                            return new HTMLText(textRead);
                        case '-':
                            this.setState(HTMLTokenizerState.PARSING_COMMENT);
                            return null;
                        default:
                            this.setState(HTMLTokenizerState.PARSING_TEXT);
                            textRead += character;
                            return new HTMLText(textRead);
                    }
                case HTMLTokenizerState.PARSING_LT_EXPL_D:
                    switch (character) {
                        case '<':
                            this.setState(HTMLTokenizerState.PARSING_LT);
                            return new HTMLText(textRead);
                        case '&':
                            this.setState(HTMLTokenizerState.PARSING_AMPERSAND);
                            return new HTMLText(textRead);
                        case 'O': case 'o':
                            tagState = HTMLTokenizerState.PARSING_LT_EXPL_DO;
                            break;
                        default:
                            this.setState(HTMLTokenizerState.PARSING_TEXT);
                            textRead += character;
                            return new HTMLText(textRead);
                    }
                    break;
                case HTMLTokenizerState.PARSING_LT_EXPL_DO:
                    switch (character) {
                        case '<':
                            this.setState(HTMLTokenizerState.PARSING_LT);
                            return new HTMLText(textRead);
                        case '&':
                            this.setState(HTMLTokenizerState.PARSING_AMPERSAND);
                            return new HTMLText(textRead);
                        case 'C': case 'c':
                            tagState = HTMLTokenizerState.PARSING_LT_EXPL_DOC;
                            break;
                        default:
                            this.setState(HTMLTokenizerState.PARSING_TEXT);
                            textRead += character;
                            return new HTMLText(textRead);
                    }
                    break;
                case HTMLTokenizerState.PARSING_LT_EXPL_DOC:
                    switch (character) {
                        case '<':
                            this.setState(HTMLTokenizerState.PARSING_LT);
                            return new HTMLText(textRead);
                        case '&':
                            this.setState(HTMLTokenizerState.PARSING_AMPERSAND);
                            return new HTMLText(textRead);
                        case 'T': case 't':
                            tagState = HTMLTokenizerState.PARSING_LT_EXPL_DOCT;
                            break;
                        default:
                            this.setState(HTMLTokenizerState.PARSING_TEXT);
                            textRead += character;
                            return new HTMLText(textRead);
                    }
                    break;
                case HTMLTokenizerState.PARSING_LT_EXPL_DOCT:
                    switch (character) {
                        case '<':
                            this.setState(HTMLTokenizerState.PARSING_LT);
                            return new HTMLText(textRead);
                        case '&':
                            this.setState(HTMLTokenizerState.PARSING_AMPERSAND);
                            return new HTMLText(textRead);
                        case 'Y': case 'y':
                            tagState = HTMLTokenizerState.PARSING_LT_EXPL_DOCTY;
                            break;
                        default:
                            this.setState(HTMLTokenizerState.PARSING_TEXT);
                            textRead += character;
                            return new HTMLText(textRead);
                    }
                    break;
                case HTMLTokenizerState.PARSING_LT_EXPL_DOCTY:
                    switch (character) {
                        case '<':
                            this.setState(HTMLTokenizerState.PARSING_LT);
                            return new HTMLText(textRead);
                        case '&':
                            this.setState(HTMLTokenizerState.PARSING_AMPERSAND);
                            return new HTMLText(textRead);
                        case 'P': case 'p':
                            tagState = HTMLTokenizerState.PARSING_LT_EXPL_DOCTYP;
                            break;
                        default:
                            this.setState(HTMLTokenizerState.PARSING_TEXT);
                            textRead += character;
                            return new HTMLText(textRead);
                    }
                    break;
                case HTMLTokenizerState.PARSING_LT_EXPL_DOCTYP:
                    switch (character) {
                        case '<':
                            this.setState(HTMLTokenizerState.PARSING_LT);
                            return new HTMLText(textRead);
                        case '&':
                            this.setState(HTMLTokenizerState.PARSING_AMPERSAND);
                            return new HTMLText(textRead);
                        case 'E': case 'e':
                            tagState = HTMLTokenizerState.PARSING_LT_EXPL_DOCTYPE;
                            break;
                        default:
                            this.setState(HTMLTokenizerState.PARSING_TEXT);
                            textRead += character;
                            return new HTMLText(textRead);
                    }
                    break;
                case HTMLTokenizerState.PARSING_LT_EXPL_DOCTYPE:
                    switch (character) {
                        case '<':
                            this.setState(HTMLTokenizerState.PARSING_LT);
                            return new HTMLText(textRead);
                        case '&':
                            this.setState(HTMLTokenizerState.PARSING_AMPERSAND);
                            return new HTMLText(textRead);
                        case '>':
                            this.setState(HTMLTokenizerState.PARSING_TEXT);
                            return new DOCTYPE(doctypeBody);
                        default:
                            doctypeBody += character;
                            break;
                    }
                    break;
                default:
		        	logger.warn('Unknown state \'' + tagState + '\' while parsing DOCTYPE.');
                    this.setState(HTMLTokenizerState.PARSING_TEXT);
                    textRead += character;
                    return new HTMLText(textRead);
            }
            textRead += character;
        }
        /*
         * If we arrive here we have reached the end of the file. return new HTMLText if we actually read some
         * characters. If not we return null.
         */
        this.setState(HTMLTokenizerState.END_OF_FILE);
        if (textRead.length > 0) {
            return new HTMLText(textRead);
        }
        return null;
    }

	static main() {
        let tokenize = async function(html) {
            let htmlTokenizer = new HTMLTokenizer(html);
            let htmlElement = await htmlTokenizer.nextHTMLElement();
            while(htmlElement != null) {
                console.log(htmlElement.constructor.name + ': ' + htmlElement.toString());
                htmlElement = await htmlTokenizer.nextHTMLElement();
            }
        }
        try {
//            let htmlTokenizer = new HTMLTokenizer();
            let htmlTokenizerOptions = HTMLTokenizerOptions.parseCommandLineOptions();
            logging.setLevel(htmlTokenizerOptions.logLevel);
            if(htmlTokenizerOptions.help) {
                util.Help.print(this);
                return;
            }
            let text = htmlTokenizerOptions.text;
            if(text != null) {
                tokenize(text);
            } else {
                let url = htmlTokenizerOptions.url;
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
                // http.get(url, function(res) {
                //   console.log("Got response: " + res.statusCode);
                //   if(res.statusCode === 301 || res.statusCode === 302) {
                //     console.log('redirect to: ' + res.headers.location);
                //     https.get(res.headers.location, function(res) {
                //         console.log("got Response: " + res.statusCode);
                //         let data = '';
                //         res.on('data', function(chunk) {
                //             data += chunk;
                //         });
                //         res.on('end', function() {
                //             let fs = require('fs');
                //             let ws = fs.writeFile('C:\\temp\\nunl.html', data, function(err) {
                //                 if(err) {
                //                     console.log(err);
                //                 }
                //                 htmlTokenizer.setHTML(data);
                //                 loop().then(() => console.log('all done!'))
                //             });
                //         });
                //     }); 
                //   }
                //   let data = '';
                //   res.on('data', function(chunk) {
                //     data += chunk;
                //   });
                //   res.on('end', function() {
                //     console.log(data);
                //   });
                // }).on('error', function(e) {
                //   console.log("Got error: " + e.message);
                // });                
            }
        } catch(exception) {
            console.log(exception);
        }
	}
}
// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
	HTMLTokenizer.main();
	return;
}

module.exports = HTMLTokenizer;