/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-lang-html
 *
 * NAME
 * HTMLReader
 */
const packageName = 'dxp3-lang-html';
const moduleName = 'HTMLReader';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * @module dxp3-lang-html/HTMLReader
 */
const logging = require('dxp3-logging');
const DOCTYPE = require('./DOCTYPE');
const DOMDocument = require('./DOMDocument');
const http = require('http');
const https = require('https');
const fs = require('fs');
const HTMLComment = require('./HTMLComment');
const HTMLReaderOptions = require('./HTMLReaderOptions');
const HTMLReaderError = require('./HTMLReaderError');
const HTMLReaderState = require('./HTMLReaderState');
const HTMLSymbol = require('./HTMLSymbol');
const HTMLTag = require('./HTMLTag');
const HTMLTagType = require('./HTMLTagType');
const HTMLText = require('./HTMLText');
const HTMLTokenizer = require('./HTMLTokenizer');
const Javascript = require('./Javascript');
const Stylesheet = require('./Stylesheet');
const util = require('dxp3-util');

const logger = logging.getLogger(canonicalName);

class HTMLReader {

    constructor(args) {
        this._args = HTMLReaderOptions.parse(args);
        // A HTMLReader typically follows redirects.
        // This behavior can be turned off.
        logger.info('Follow redirects: ' + this._args.followRedirects);
        logger.info('Timeout         : ' + this._args.timeout);
        logger.info('Useragent       : ' + this._args.useragent);
    }

    readFile(_fileName, _callback) {
        this.parseFile(_fileName, _callback);
    }

    loadFile(_fileName, _callback) {
        this.parseFile(_fileName, _callback);
    }

    parseFile(_fileName, _callback) {
		logger.trace('parseFile(...): start.');
    	// Defensive programming...check input...
    	if(_fileName === undefined || _fileName === null ||
    	   _callback === undefined || _callback === null) {
			// Calling parseFile(...) without any arguments could be
			// a programming error. Lets log a warning.
			logger.warn('parseFile(...): Missing arguments.');
			logger.trace('parseFile(...): end.');
    		if(_callback) {
    			return _callback(HTMLReaderError.ILLEGAL_ARGUMENT);
    		}
    		return;
    	}
    	if(typeof _fileName != 'string') {
			logger.warn('parseFile(...): The supplied filename is not a String.');
			logger.trace('parseFile(...): end.');
			return _callback(HTMLReaderError.ILLEGAL_ARGUMENT);
    	}
        let self = this;
		logger.debug('parseFile(...): Filename \'' + _fileName + '\'.');
        fs.readFile(_fileName, 'UTF-8', function(_error, _html) {
            if(_error) {
				logger.error('parseFile(...): ' + _error);
				logger.trace('parseFile(...): end.');
                return _callback(_error);
            }
            self.parse(_html, function(_error, _domDocument) {
	            if(_error) {
					logger.error('parseFile(...): ' + _error);
					logger.trace('parseFile(...): end.');
	            	return _callback(_error);
				}
				logger.trace('parseFile(...): end.');
            	_callback(_error, _domDocument);
            });
        });
    }

    readURL(_url, _callback) {
        this.parseURL(_url, _callback);
    }

    loadURL(_url, _callback) {
        this.parseURL(_url, _callback);
    }

    parseURL(_url, _callback) {
		logger.trace('parseURL(...): start.');
        // Defensive programming...check input...
        if(_callback === undefined || _callback === null) {
            // Calling parseURL(...) without a callback could be
            // a programming error. Lets log a warning.
            logger.warn('parseURL(...): Missing _callback.');
            logger.trace('parseURL(...): end.');
            throw HTMLReaderError.ILLEGAL_ARGUMENT;
        }
        if(_url === undefined || _url === null) {
			// Calling parseURL(...) without an URL could be
			// a programming error. Lets log a warning.
			logger.warn('parseURL(...): Missing _url.');
			logger.trace('parseURL(...): end.');
            return _callback(HTMLReaderError.ILLEGAL_ARGUMENT);
        }
    	if(typeof _url != 'string') {
			logger.warn('parseURL(...): _url is not a String.');
			logger.trace('parseURL(...): end.');
			return _callback(HTMLReaderError.ILLEGAL_ARGUMENT);
    	}
        let self = this;
        let options = {};
        let parseRedirect = function(_url, _resp, _callback) {
            // Check if we are following redirects.
            if(!self._args.followRedirects) {
                logger.debug('parseURL(...): Not allowed to follow redirect.');
                // This response may still have a body
                self.parseIncomingMessage(_resp, function(_error, _domDocument) {
                    if(_error) {
                        logger.error('parseURL(...): ' + _error);
                        logger.trace('parseURL(...): end.');
                        return _callback(_error);
                    }
                    logger.trace('parseURL(...): end.');
                    _callback(_error, _domDocument);
                });
                return;
            }
            let redirectURL = _resp.headers.location;
            if(redirectURL === undefined || redirectURL === null) {
                // This response may still have a body
                self.parseIncomingMessage(_resp, function(_error, _domDocument) {
                    if(_error) {
                        logger.error('parseURL(...): ' + _error);
                        logger.trace('parseURL(...): end.');
                        return _callback(_error);
                    }
                    logger.trace('parseURL(...): end.');
                    _callback(_error, _domDocument);
                });
                return;
            }
            if(!(redirectURL.toLowerCase().startsWith('http'))) {
                redirectURL = new URL(redirectURL, _url);
            } else {
                redirectURL = new URL(redirectURL);
            }
            logger.debug('parseURL(...): Redirect \'' + _url + '\' to \'' + redirectURL.href + '\'.');
            self.parseURL(redirectURL.href, function(_error, _domDocument) {
                logger.trace('parseURL(...): end.');
                _callback(_error, _domDocument);
            });
        }
        let parseResponse = function(_url, _resp, _callback) {
            // Check if this is a redirect.
            if((_resp.statusCode >= 300) && (_resp.statusCode < 400)) {
                parseRedirect(_url, _resp, _callback);
            } else {
            	self.parseIncomingMessage(_resp, function(_error, _domDocument) {
            		if(_error) {
    					logger.error('parseURL(...): ' + _error);
    					logger.trace('parseURL(...): end.');
    	                return _callback(_error);
            		}
    				logger.trace('parseURL(...): end.');
    				_callback(_error, _domDocument);
            	});
            }
        }
		logger.debug('parseURL(...): URL \'' + _url + '\'.');
        let urlToLowerCase = _url.toLowerCase();
        if(urlToLowerCase.startsWith('http://')) {
            http.get(_url, options, function(_resp) {
            	parseResponse(_url, _resp, _callback);
            });
        } else if (urlToLowerCase.startsWith('https://')) {
            https.get(_url, options, function(_resp) {
            	parseResponse(_url, _resp, _callback);
            });
        } else {
            _url = 'http://' + _url;
            http.get(_url, options, function(_resp) {
            	parseResponse(_url, _resp, _callback);
            });
        }
    }

    readIncomingMessage(_resp, _callback) {
    	this.parseIncomingMessage(_resp, _callback);
    }

    loadIncomingMessage(_resp) {
    	this.parseIncomingMessage(_resp, _callback);
    }

    parseIncomingMessage(_resp, _callback) {
		logger.trace('parseIncomingMessage(...): start.');
        // Defensive programming...check input...
    	if(_resp === undefined || _resp === null ||
           _callback === undefined || _callback === null) {
			// Calling parseIncomingMessage(...) without any arguments could be
			// a programming error. Lets log a warning.
			logger.warn('parseIncomingMessage(...): Missing arguments.');
			logger.trace('parseIncomingMessage(...): end.');
            if(_callback) {
                return _callback(HTMLReaderError.ILLEGAL_ARGUMENT);
            }
            return;
		}
    	if(!(_resp instanceof http.IncomingMessage)) {
			logger.warn('parseIncomingMessage(...): The supplied response is not an instance of http.IncomingMessage.');
			logger.trace('parseIncomingMessage(...): end.');
			return _callback(HTMLReaderError.ILLEGAL_ARGUMENT);
    	}
        let self = this;
		let parseIncomingMessageBody = function(_resp, _callback) {
	        let data = '';
	        _resp.on('data', function(chunk) {
	            data += chunk;
	        });
	        _resp.on('end', function() {
	            self.parse(data, function(_error, _domDocument) {
	        		if(_error) {
						logger.error('parseIncomingMessage(...): ' + _error);
						logger.trace('parseIncomingMessage(...): end.');
		                return _callback(_error);
	        		}
					logger.trace('parseIncomingMessage(...): end.');
	            	_callback(_error, _domDocument);
	            });
	        });    
		}
        let contentType = _resp.headers['content-type'];
		if(contentType === undefined || contentType === null) {
			parseIncomingMessageBody(_resp, _callback);
		} else if(contentType.startsWith('text/html')) {
			parseIncomingMessageBody(_resp, _callback);
        } else {
			logger.warn('parseIncomingMessage(...): Unsupported media type \'' + contentType + '\'.');
			logger.trace('parseIncomingMessage(...): end.');
            return _callback(HTMLReaderError.UNSUPPORTED_MEDIA_TYPE);
        }
    }

    read(_html, _callback) {
        this.parse(_html, _callback);
    }

    load(_html, _callback) {
        this.parse(_html, _callback);
    }

    parse(_html, _callback) {
		logger.trace('parse(...): start.');
        // Defensive programming...check input...
    	if(_html === undefined || _html === null ||
           _callback === undefined || _callback === null) {
			// Calling parse(...) without any arguments could be
			// a programming error. Lets log a warning.
			logger.warn('parse(...): Missing arguments.');
			logger.trace('parse(...): end.');
            if(_callback) {
                return _callback(HTMLReaderError.ILLEGAL_ARGUMENT);
            }
            return;
		}
    	if(typeof _html != 'string') {
			logger.warn('parse(...): The supplied HTML is not a String.');
			logger.trace('parse(...): end.');
			return _callback(HTMLReaderError.ILLEGAL_ARGUMENT);
    	}
        let tokenize = async function(_html) {
            let htmlNode = null;
            let bodyNode = null;
            let currentNode = null;
            let parentNode = null;
            let root = null;
            let index = 0;
            let elementsRead = [];
            let whitespaceRegExp = new RegExp(/^\s+$/)
            let domDocument = new DOMDocument();
            let state = HTMLReaderState.PARSE_DOCTYPE;
            let htmlTokenizer = new HTMLTokenizer(_html);
            let htmlElement = await htmlTokenizer.nextHTMLElement();
            while(htmlElement != null) {
                switch(state) {
                    case HTMLReaderState.PARSE_DOCTYPE:
                        if(htmlElement instanceof DOCTYPE) {
                            // As expected, the first element is a DOCTYPE.
                            // Now we can start looking for our HTML element.
                            elementsRead = [];
                            state = HTMLReaderState.PARSE_HTML;
                        } else if(htmlElement instanceof HTMLText) {
                            // We keep track of our html text in case we never encounter a DOCTYPE.
                            // If we never encounter a DOCTYPE we interpret this HTML as an HTML fragment.
                            // We will still add all this text if it is an HTML fragment.
                            elementsRead.push(htmlElement);
                            if(!whitespaceRegExp.test(htmlElement.getText())) {
                                // This was non-empty text...
                                // Presumably this html does not contain a DOCTYPE.
                                // This is an HTML fragment.
                                htmlNode = domDocument.createElement('html');
                                bodyNode = domDocument.createElement('body');
                                htmlNode.appendChild(bodyNode);
                                currentNode = bodyNode;
                                root = htmlNode;
                                for(let i=0;i < elementsRead.length;i++) {
                                    htmlElement = elementsRead[i];
                                    let textNode = domDocument.createTextNode(htmlElement.getText());
                                    bodyNode.appendChild(textNode);
                                }
                                state = HTMLReaderState.PARSING_HTML;
                            }
                        } else if(htmlElement instanceof HTMLSymbol) {
                            elementsRead.push(htmlElement);
                            // This was non-empty text...
                            // Presumably this html does not contain a DOCTYPE.
                            // This is an HTML fragment.
                            htmlNode = domDocument.createElement('html');
                            bodyNode = domDocument.createElement('body');
                            htmlNode.appendChild(bodyNode);
                            currentNode = bodyNode;
                            root = htmlNode;
                            for(let i=0;i < elementsRead.length;i++) {
                                htmlElement = elementsRead[i];
                                let textNode = domDocument.createTextNode(htmlElement.getText());
                                bodyNode.appendChild(textNode);
                            }
                            state = HTMLReaderState.PARSING_HTML;
                        } else if(htmlElement instanceof HTMLTag) {
                            if(htmlElement.nodeName === 'html') {
                                htmlNode = domDocument.createElement(htmlElement.nodeName);
                                let attributes = htmlElement.getAttributes();
                                for (let [key, value] of attributes) {
                                    let attributeNode = domDocument.createAttribute(key);
                                    if(value != null) {
                                        attributeNode.value = value;
                                    }
                                    htmlNode.setAttributeNode(attributeNode);
                                }
                                currentNode = htmlNode;
                                root = htmlNode;
                                state = HTMLReaderState.PARSING_HTML;
                            } else {
                                // This was neither a DOCTYPE nor an <html>.
                                // This is an HTML fragment.
                                htmlNode = domDocument.createElement('html');
                                bodyNode = domDocument.createElement('body');
                                htmlNode.appendChild(bodyNode);
                                root = htmlNode;
                                for(let i=0;i < elementsRead.length;i++) {
                                    let htmlText = elementsRead[i];
                                    let textNode = domDocument.createTextNode(htmlText.getText());
                                    bodyNode.appendChild(textNode);
                                }
                                let elementNode = domDocument.createElement(htmlElement.nodeName);
                                let attributes = htmlElement.getAttributes();
                                for (let [key, value] of attributes) {
                                    let attributeNode = domDocument.createAttribute(key);
                                    if(value != null) {
                                        attributeNode.value = value;
                                    }
                                    elementNode.setAttributeNode(attributeNode);
                                }
                                bodyNode.appendChild(elementNode);
                                currentNode = elementNode;
                                state = HTMLReaderState.PARSING_HTML;
                            }
                        }
                        break;
                    case HTMLReaderState.PARSE_HTML:
                        if(htmlElement instanceof HTMLTag) {
                            if(htmlElement.nodeName === 'html') {
                                htmlNode = domDocument.createElement(htmlElement.nodeName);
                                let attributes = htmlElement.getAttributes();
                                for (let [key, value] of attributes) {
                                    let attributeNode = domDocument.createAttribute(key);
                                    if(value != null) {
                                        attributeNode.value = value;
                                    }
                                    htmlNode.setAttributeNode(attributeNode);
                                }
                                currentNode = htmlNode;
                                root = htmlNode;
                                state = HTMLReaderState.PARSING_HTML;
                            } else {
                                // This was not an <html>.
                                // This is an HTML fragment.
                                htmlNode = domDocument.createElement('html');
                                bodyNode = domDocument.createElement('body');
                                htmlNode.appendChild(bodyNode);
                                currentNode = bodyNode;
                                root = htmlNode;
                                for(let i=0;i < elementsRead.length;i++) {
                                    let htmlText = elementsRead[i];
                                    let textNode = domDocument.createTextNode(htmlText.getText());
                                    bodyNode.appendChild(textNode);
                                }
                                let elementNode = domDocument.createElement(htmlElement.nodeName);
                                let attributes = htmlElement.getAttributes();
                                for (let [key, value] of attributes) {
                                    let attributeNode = domDocument.createAttribute(key);
                                    if(value != null) {
                                        attributeNode.value = value;
                                    }
                                    elementNode.setAttributeNode(attributeNode);
                                }
                                state = HTMLReaderState.PARSING_HTML;
                            }
                        } else if(htmlElement instanceof HTMLText) {
                            // We keep track of our html text in case we never encounter an <html>.
                            // If we never encounter an <html> we interpret this HTML as an HTML fragment.
                            // We will still add all this text if it is an HTML fragment.
                            elementsRead.push(htmlElement);
                            let text = htmlElement.getText();
                            if(!whitespaceRegExp.test(text)) {
                                // This was non-empty text...
                                // Presumably this html does not contain an <html>.
                                // This is an HTML fragment.
                                htmlNode = domDocument.createElement('html');
                                bodyNode = domDocument.createElement('body');
                                htmlNode.appendChild(bodyNode);
                                currentNode = bodyNode;
                                root = htmlNode;
                                for(let i=0;i < elementsRead.length;i++) {
                                    htmlElement = elementsRead[i];
                                    let textNode = domDocument.createTextNode(htmlElement.getText());
                                    bodyNode.appendChild(textNode);
                                }
                                state = HTMLReaderState.PARSING_HTML;
                            }
                        } else if(htmlElement instanceof HTMLSymbol) {
                            elementsRead.push(htmlElement);
                            // This was non-empty text...
                            // Presumably this html does not contain an <html>.
                            // This is an HTML fragment.
                            htmlNode = domDocument.createElement('html');
                            bodyNode = domDocument.createElement('body');
                            htmlNode.appendChild(bodyNode);
                            currentNode = bodyNode;
                            root = htmlNode;
                            for(let i=0;i < elementsRead.length;i++) {
                                htmlElement = elementsRead[i];
                                let textNode = domDocument.createTextNode(htmlElement.getText());
                                bodyNode.appendChild(textNode);
                            }
                            state = HTMLReaderState.PARSING_HTML;
                        }
                        break;
                    case HTMLReaderState.PARSING_HTML:
                        if(currentNode === null) {
                            break;
                        }
                        if(htmlElement instanceof HTMLText) {
                            let textNode = domDocument.createTextNode(htmlElement.getText());
                            currentNode.appendChild(textNode);
                        } else if(htmlElement instanceof HTMLSymbol) {
                            let textNode = domDocument.createTextNode(htmlElement.toString());
                            currentNode.appendChild(textNode);
                        } else if(htmlElement instanceof HTMLTag) {
                            let attributes = null;
                            switch(htmlElement.htmlTagType) {
                                case HTMLTagType.START_TAG:
                                    parentNode = currentNode;
                                    currentNode = domDocument.createElement(htmlElement.nodeName);
                                    attributes = htmlElement.getAttributes();
                                    for (let [key, value] of attributes) {
                                        let attributeNode = domDocument.createAttribute(key);
                                        if(value != null) {
                                            attributeNode.value = value;
                                        }
                                        currentNode.setAttributeNode(attributeNode);
                                    }
                                    parentNode.appendChild(currentNode);
                                    break;
                                case HTMLTagType.START_END_TAG:
                                    parentNode = currentNode;
                                    currentNode = domDocument.createEmptyElement(htmlElement.nodeName);
                                    attributes = htmlElement.getAttributes();
                                    for (let [key, value] of attributes) {
                                        let attributeNode = domDocument.createAttribute(key);
                                        if(value != null) {
                                            attributeNode.value = value;
                                        }
                                        currentNode.setAttributeNode(attributeNode);
                                    }
                                    parentNode.appendChild(currentNode);
                                    currentNode = parentNode;
                                    parentNode = currentNode.parentNode;
                                    break;
                                case HTMLTagType.END_TAG:
                                    currentNode = currentNode.parentNode;
                                    if(currentNode === null) {
                                        parentNode = null;
                                    } else {
                                        parentNode = currentNode.parentNode;
                                    }
                                    break;
                                default:
                                    console.log('This should never have happened...');
                                    break;
                            }
                        } else if(htmlElement instanceof Javascript) {
                            let textNode = domDocument.createTextNode(htmlElement.getCode());
                            currentNode.appendChild(textNode);
                        } else if(htmlElement instanceof Stylesheet) {
                            let textNode = domDocument.createTextNode(htmlElement.getStyle());
                            currentNode.appendChild(textNode);
                        }
                        break;
                    default:
                        console.log('This should never have happened...');
                        break;
                }
                htmlElement = await htmlTokenizer.nextHTMLElement();
            }                
            domDocument.documentElement = root;
            return domDocument;
        }
        tokenize(_html)
        .then((_domDocument) => {
			logger.trace('parse(...): end.');
            return _callback(null, _domDocument);
        });
    }

    get followRedirects() {
        return this.getFollowRedirects();
    }

    getFollowRedirects() {
        return this._args.followRedirects;
    }

    get timeout() {
        return this.getTimeout();
    }

    getTimeout() {
        return this._args.timeout;
    }

    get useragent() {
        return this.getUserAgent();
    }

    getUserAgent() {
        return this._args.useragent;
    }

    set followRedirects(_followRedirects) {
        this.setFollowRedirects(_followRedirects);
    }

    setFollowRedirects(_followRedirects) {
        this._args.followRedirects = _followRedirects;
    }

    set timeout(_timeout) {
        this.setTimeout(_timeout);
    }

    setTimeout(_timeout) {
        this._args.timeout = _timeout;
    }

    set useragent(_useragent) {
        this.setUserAgent(_useragent);
    }

    setUserAgent(_useragent) {
        this._args.useragent = _useragent;
    }

    static main() {
    	let processDOMDocument = function(_error, _domDocument, _query) {
    		if(_error) {
    			console.log('Something went wrong: ' + _error);
    			return;
    		}
    		if(_query === null) {
	            console.log(_domDocument.toString());
	            return
	        }
	        _domDocument.queryAll(_query, function(_error, _result) {
	        	for(let i=0;i < _result.length;i++) {
	        		console.log(_result[i].toString());
	        	}
	        });
    	}
        try {
            let htmlReaderOptions = HTMLReaderOptions.parseCommandLine();
            logging.setLevel(htmlReaderOptions.logLevel);
            if(htmlReaderOptions.help) {
                util.Help.print(HTMLReader);
                return;
            }
            let html = htmlReaderOptions.text;
            let url = htmlReaderOptions.url;
            let htmlFileName = htmlReaderOptions.fileName;
            let htmlReader = new HTMLReader();
            let query = htmlReaderOptions.query;
            if(html != undefined && html != null && html.length > 0) {
                htmlReader.load(html, function(_error, _domDocument) {
                	processDOMDocument(_error, _domDocument, query);
                });
            } else if(url != undefined && url != null && url.length > 0) {
                htmlReader.loadURL(url, function(_error, _domDocument) {
                	processDOMDocument(_error, _domDocument, query);
                });
            } else if(htmlFileName != undefined && htmlFileName != null && htmlFileName.length > 0) {
                htmlReader.loadFile(_htmlFileName, function(_error, _domDocument) {
                	processDOMDocument(_error, _domDocument, query);
                });
            }
        } catch(exception) {
            console.log(exception.message);
            process.exit(99);
        }
    }
}
// Check if someone tried to run/execute this file.
if(util.Assert.isFileToExecute(canonicalName)) {
    HTMLReader.main();
    return;
}

module.exports = HTMLReader;