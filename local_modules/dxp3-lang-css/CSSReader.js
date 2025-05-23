/*
 * DXP3 - Digital Experience Platform 3
 *
 * PACKAGE
 * dxp3-lang-css
 *
 * NAME
 * CSSReader
 */
const packageName = 'dxp3-lang-css';
const moduleName = 'CSSReader';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
/**
 * @module dxp3-lang-css/CSSReader
 */
const logging = require('dxp3-logging');
const CSSAtRule = require('./CSSAtRule');
const CSSComment = require('./CSSComment');
const CSSReaderError = require('./CSSReaderError');
const CSSReaderOptions = require('./CSSReaderOptions');
const CSSRule = require('./CSSRule');
const CSSStyleSheet = require('./CSSStyleSheet');
const CSSTokenizer = require('./CSSTokenizer');
const http = require('http');
const https = require('https');
const fs = require('fs');
const util = require('dxp3-util');

const logger = logging.getLogger(canonicalName);

class CSSReader {
    /*********************************************
     * CONSTRUCTOR
     ********************************************/

    constructor(args) {
        this._args = CSSReaderOptions.parse(args);
        // A CSSReader typically follows redirects.
        // This behavior can be turned off.
        logger.info('Follow redirects: ' + this._args.followRedirects);
        logger.info('Timeout         : ' + this._args.timeout);
        logger.info('Useragent       : ' + this._args.useragent);
    }

    /*********************************************
     * PUBLIC METHODS
     ********************************************/

    load(_cssText, _callback) {
        this.parse(_cssText, _callback);
    }

    loadFile(_fileName, _callback) {
        this.parseFile(_fileName, _callback);
    }

    loadURL(_url, _callback) {
        this.parseURL(_url, _callback);
    }

    parse(_cssText, _callback) {
        logger.trace('parse(...): start.');
        // Defensive programming...check input...
        if(_cssText === undefined || _cssText === null ||
           _callback === undefined || _callback === null) {
            // Calling parse(...) without any arguments could be
            // a programming error. Lets log a warning.
            logger.warn('parse(...): Missing arguments.');
            logger.trace('parse(...): end.');
            if(_callback) {
                return _callback(CSSReaderError.ILLEGAL_ARGUMENT);
            }
            return;
        }
        if(typeof _cssText != 'string') {
            logger.warn('parse(...): The supplied CSS is not a String.');
            logger.trace('parse(...): end.');
            return _callback(CSSReaderError.ILLEGAL_ARGUMENT);
        }
        let tokenize = async function(_css) {
            let cssStyleSheet = new CSSStyleSheet();
            let cssTokenizer = new CSSTokenizer(_css);
            let cssElement = await cssTokenizer.nextCSSElement();
            while(cssElement != null) {
                if(cssElement instanceof CSSRule) {
                    cssStyleSheet.insertRule(cssElement);
                } else if(cssElement instanceof CSSAtRule) {
                    cssStyleSheet.insertRule(cssElement);
                } else if(cssElement instanceof CSSComment) {
                    // Ignore
                }
                cssElement = await cssTokenizer.nextCSSElement();
            }
            return cssStyleSheet;
        }
        tokenize(_cssText)
        .then((_cssStyleSheet) => {
            logger.trace('parse(...): end.');
            return _callback(null, _cssStyleSheet);
        });
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
                return _callback(CSSReaderError.ILLEGAL_ARGUMENT);
            }
            return;
        }
        if(typeof _fileName != 'string') {
            logger.warn('parseFile(...): The supplied filename is not a String.');
            logger.trace('parseFile(...): end.');
            return _callback(CSSReaderError.ILLEGAL_ARGUMENT);
        }
        let self = this;
        logger.debug('parseFile(...): Filename \'' + _fileName + '\'.');
        fs.readFile(_fileName, 'UTF-8', function(_error, _cssText) {
            if(_error) {
                logger.error('parseFile(...): ' + _error);
                logger.trace('parseFile(...): end.');
                return _callback(_error);
            }
            self.parse(_cssText, function(_error, _cssStyleSheet) {
                if(_error) {
                    logger.error('parseFile(...): ' + _error);
                    logger.trace('parseFile(...): end.');
                    return _callback(_error);
                }
                logger.trace('parseFile(...): end.');
                _callback(_error, _cssStyleSheet);
            });
        });
    }

    parseURL(_url, _callback) {
        logger.trace('parseURL(...): start.');
        // Defensive programming...check input...
        if(_callback === undefined || _callback === null) {
            // Calling parseURL(...) without a callback could be
            // a programming error. Lets log a warning.
            logger.warn('parseURL(...): Missing _callback.');
            logger.trace('parseURL(...): end.');
            throw CSSReaderError.ILLEGAL_ARGUMENT;
        }
        if(_url === undefined || _url === null) {
            // Calling parseURL(...) without an URL could be
            // a programming error. Lets log a warning.
            logger.warn('parseURL(...): Missing _url.');
            logger.trace('parseURL(...): end.');
            return _callback(CSSReaderError.ILLEGAL_ARGUMENT);
        }
        if(typeof _url != 'string') {
            logger.warn('parseURL(...): _url is not a String.');
            logger.trace('parseURL(...): end.');
            return _callback(CSSReaderError.ILLEGAL_ARGUMENT);
        }
        let self = this;
        let options = {};
        let parseRedirect = function(_url, _resp, _callback) {
            // Check if we are following redirects.
            if(!self._args.followRedirects) {
                logger.debug('parseURL(...): Not allowed to follow redirect.');
                // This response may still have a body
                self._parseIncomingMessage(_resp, function(_error, _cssStyleSheet) {
                    if(_error) {
                        logger.error('parseURL(...): ' + _error);
                        logger.trace('parseURL(...): end.');
                        return _callback(_error);
                    }
                    logger.trace('parseURL(...): end.');
                    _callback(_error, _cssStyleSheet);
                });
                return;
            }
            let redirectURL = _resp.headers.location;
            if(redirectURL === undefined || redirectURL === null) {
                // This response may still have a body
                self._parseIncomingMessage(_resp, function(_error, _cssStyleSheet) {
                    if(_error) {
                        logger.error('parseURL(...): ' + _error);
                        logger.trace('parseURL(...): end.');
                        return _callback(_error);
                    }
                    logger.trace('parseURL(...): end.');
                    _callback(_error, _cssStyleSheet);
                });
                return;
            }
            if(!(redirectURL.toLowerCase().startsWith('http'))) {
                redirectURL = new URL(redirectURL, _url);
            } else {
                redirectURL = new URL(redirectURL);
            }
            logger.debug('parseURL(...): Redirect \'' + _url + '\' to \'' + redirectURL.href + '\'.');
            self.parseURL(redirectURL.href, function(_error, _cssStyleSheet) {
                logger.trace('parseURL(...): end.');
                _callback(_error, _cssStyleSheet);
            });
        }
        let parseResponse = function(_url, _resp, _callback) {
            // Check if this is a redirect.
            if((_resp.statusCode >= 300) && (_resp.statusCode < 400)) {
                parseRedirect(_url, _resp, _callback);
            } else {
                self._parseIncomingMessage(_resp, function(_error, _cssStyleSheet) {
                    if(_error) {
                        logger.error('parseURL(...): ' + _error);
                        logger.trace('parseURL(...): end.');
                        return _callback(_error);
                    }
                    logger.trace('parseURL(...): end.');
                    _callback(_error, _cssStyleSheet);
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

    read(_cssText, _callback) {
        this.parse(_cssText, _callback);
    }

    readFile(_fileName, _callback) {
        this.parseFile(_fileName, _callback);
    }

    readURL(_url, _callback) {
        this.parseURL(_url, _callback);
    }

    /*********************************************
     * PRIVATE METHODS
     ********************************************/

    _parseIncomingMessage(_resp, _callback) {
        logger.trace('_parseIncomingMessage(...): start.');
        // Defensive programming...check input...
        if(_resp === undefined || _resp === null ||
           _callback === undefined || _callback === null) {
            // Calling _parseIncomingMessage(...) without any arguments could be
            // a programming error. Lets log a warning.
            logger.warn('_parseIncomingMessage(...): Missing arguments.');
            logger.trace('_parseIncomingMessage(...): end.');
            if(_callback) {
                return _callback(CSSReaderError.ILLEGAL_ARGUMENT);
            }
            return;
        }
        if(!(_resp instanceof http.IncomingMessage)) {
            logger.warn('_parseIncomingMessage(...): The supplied response is not an instance of http.IncomingMessage.');
            logger.trace('_parseIncomingMessage(...): end.');
            return _callback(CSSReaderError.ILLEGAL_ARGUMENT);
        }
        let self = this;
        let parseIncomingMessageBody = function(_resp, _callback) {
            let data = '';
            _resp.on('data', function(chunk) {
                data += chunk;
            });
            _resp.on('end', function() {
                self.parse(data, function(_error, _cssStyleSheet) {
                    if(_error) {
                        logger.error('_parseIncomingMessage(...): ' + _error);
                        logger.trace('_parseIncomingMessage(...): end.');
                        return _callback(_error);
                    }
                    logger.trace('_parseIncomingMessage(...): end.');
                    _callback(_error, _cssStyleSheet);
                });
            });    
        }
        let contentType = _resp.headers['content-type'];
        if(contentType === undefined || contentType === null) {
            parseIncomingMessageBody(_resp, _callback);
        } else if(contentType.startsWith('text/css')) {
            parseIncomingMessageBody(_resp, _callback);
        } else {
            logger.warn('_parseIncomingMessage(...): Unsupported media type \'' + contentType + '\'.');
            logger.trace('_parseIncomingMessage(...): end.');
            return _callback(CSSReaderError.UNSUPPORTED_MEDIA_TYPE);
        }
    }

    static main() {
        let processCSSStyleSheet = (_error, _cssStyleSheet) => {
            if(_error) {
                console.log('Something went wrong: ' + _error);
                return;
            }
            console.log(_cssStyleSheet.toString());
        }
        try {
            let cssReaderOptions = CSSReaderOptions.parseCommandLine();
            logging.setLevel(cssReaderOptions.logLevel);
            if(cssReaderOptions.help) {
                util.Help.print(CSSReader);
                return;
            }
            let cssText = cssReaderOptions.text;
            let url = cssReaderOptions.url;
            let cssFileName = cssReaderOptions.fileName;
            let cssReader = new CSSReader();
            if(cssText != undefined && cssText != null && cssText.length > 0) {
                cssReader.load(cssText, (_error, _cssStyleSheet) => {
                    processCSSStyleSheet(_error, _cssStyleSheet);
                });
            } else if(url != undefined && url != null && url.length > 0) {
                cssReader.loadURL(url, (_error, _cssStyleSheet) => {
                    processCSSStyleSheet(_error, _cssStyleSheet);
                });
            } else if(cssFileName != undefined && cssFileName != null && cssFileName.length > 0) {
                cssReader.loadFile(cssFileName, (_error, _cssStyleSheet) => {
                    processCSSStyleSheet(_error, _cssStyleSheet);
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
    CSSReader.main();
    return;
}
module.exports = CSSReader;