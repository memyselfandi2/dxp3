const html = require('dxp3-lang-html');
const HTTPDownloader = require('./HTTPDownloader');
const HTTPClient = require('./HTTPClient');

const httpClient = new HTTPClient();
const httpDownloader = new HTTPDownloader('C:\\temp\\');
const htmlReader = new html.HTMLReader();

function start(_startURL) {
	// Load the start URL and handle any redirects.
	// This will also set any required cookies.
	// Make sure to reuse the HTTPClient.
	httpClient.get(_startURL, function(_error, _resp, _startURL) {
		if(_error) {
			console.log('httpClient.get(...) error for URL: ' + _startURL);
			console.log('httpClient.get(...) error: ' + _error);
			return;
		}
		htmlReader.parseIncomingMessage(_resp, function(_error, _domDocument) {
			if(_error) {
				console.log('htmlReader.parseIncomingMessage(...) error for URL: ' + _startURL);
				console.log('htmlReader.parseIncomingMessage(...) error: ' + _error);
				return;
			}
			processDOMDocument(_domDocument, _startURL, function(_error) {
				if(_error) {
					console.log('processDOMDocument(...) error for URL: ' + _startURL);
					console.log('processDOMDocument(...) error: ' + _error);
					return;
				}
				_domDocument.queryAll("div.pagenav>table>tr>td.alt1>a", function(_error, _aElements) {
					if(_error) {
						console.log('_domDocument.queryAll(...) error for URL: ' + _startURL);
						console.log('_domDocument.queryAll(...) error: ' + _error);
						return;
					}
					let lastIndex = -1;
					let url = null;
					let pageURL = null;
					for(let i=0;i < _aElements.length;i++) {
						let href = _aElements[i].getAttribute('href');
						url = new URL(href, _startURL).toString();
						url = url.replace(/&amp;/g, '&');
						let indexOfPage = url.indexOf('page=');
						let pageIndex = url.substring(indexOfPage + 5);
						pageURL = url.substring(0, indexOfPage + 5);
						pageIndex = parseInt(pageIndex);
						if(pageIndex > lastIndex) {
							lastIndex = pageIndex;
						}
					}
					console.log('highest index: ' + lastIndex);
					console.log('pageURL: ' + pageURL);
					let loadPage = function(_pageURL, _pageIndex) {
						if(_pageIndex > lastIndex) {
							return;
						}
						let currentURL = _pageURL + _pageIndex;
						// console.log('build url: ' + currentURL);
						processPageURL(currentURL, function(_error) {
							if(_error) {
								console.log('processPageURL(...) error: ' + _error);
							}
							loadPage(_pageURL, _pageIndex + 1);
						});
					}
					loadPage(pageURL, 2);
				});
			});
		});
	});
}

function processPageURL(_pageURL, _callback) {
	let delayedFunction = function(_pageURL, _callback) {
		console.log('process page: ' + _pageURL);
		httpClient.get(_pageURL, function(_error, _resp, _redirectedURL) {
		 	if(_error) {
		 		console.log('httpClient.get(...) error for URL: ' + _pageURL);
		 		console.log('httpClient.get(...) error: ' + _error);
		 		return _callback(_error);
		 	}
		 	htmlReader.parseIncomingMessage(_resp, function(_error, _domDocument) {
		 		if(_error) {
		 			console.log('htmlReader.parseIncomingMessage(...) error for URL: ' + _redirectedURL);
		 			console.log('htmlReader.parseIncomingMessage(...) error: ' + _error);
		 			return _callback(_error);
		 		}
		 		processDOMDocument(_domDocument, _redirectedURL, function(_error) {
		 			if(_error) {
		 				console.log('processDOMDocument(...) error for URL: ' + _redirectedURL);
		 				console.log('processDOMDocument(...) error: ' + _error);
		 				return callback(_error);
		 			}
					return _callback(null);
		 		});
		 	});
		});
	}
	setTimeout(delayedFunction, 2000, _pageURL, _callback);
}

function processDOMDocument(_domDocument, _pageURL, _callback) {
	if(_domDocument === undefined || _domDocument === null) {
		if(_callback) {
			return _callback("Illegal argument");
		}
		return;
	}
	let self = this;
	// console.log('processDOMDocument: ' + _pageURL);
	let processImageBam = function(_domDocument, _callback) {
		// console.log('Imagebam.com url: ' + _imagePageURL);
		_domDocument.query('[title="Continue to your image"]', function(_error, _aElement) {
			if(_aElement === undefined || _aElement === null) {
				processImageHost(_domDocument, _callback);
			} else {
				// console.log('Clicking continue: ' + _imagePageURL);
				let href = _aElement.getAttribute('href');
				visitImagePage(href, _callback);
			}
		});
	}
	let processPimpAndHost = function(_domDocument, _callback) {
		// console.log('processing image host');
		_domDocument.queryAll('img.normal', function(_error, _imgElements) {
			if(_imgElements === undefined || _imgElements === null) {
				return _callback();
			}
			if(_imgElements.length <= 0) {
				return _callback();
			}
			let imgHref = null;
			for(let i=0;i < _imgElements.length;i++) {
				let imgElement = _imgElements[i];
				let src = imgElement.getAttribute('src');
				if(src === undefined || src === null) {
					continue;
				}
				if(src.startsWith('//')) {
					imgHref = src;
					break;
				}
			}
			if(imgHref === null) {
				return _callback();
			}
			// console.log('Downloading from image host: ' + imgHref);
			httpDownloader.downloadURL(imgHref, function(_error) {
		 		if(_error) {
		 			console.log('httpDownloader.downloadURL(...) error for URL: ' + imgHref);
		 			console.log('httpDownloader.downloadURL(...) error: ' + _error);
		 		}
				_callback();
			});
		});
	}
	let processImageHost = function(_domDocument, _callback) {
		// console.log('processing image host');
		_domDocument.queryAll('img', function(_error, _imgElements) {
			if(_imgElements === undefined || _imgElements === null) {
				return _callback();
			}
			if(_imgElements.length <= 0) {
				return _callback();
			}
			let imgHref = null;
			for(let i=0;i < _imgElements.length;i++) {
				let imgElement = _imgElements[i];
				let src = imgElement.getAttribute('src');
				if(src === undefined || src === null) {
					continue;
				}
				if(src.startsWith('http')) {
					imgHref = src;
					break;
				}
			}
			if(imgHref === null) {
				return _callback();
			}
			// console.log('Downloading from image host: ' + imgHref);
			httpDownloader.downloadURL(imgHref, function(_error) {
		 		if(_error) {
		 			console.log('httpDownloader.downloadURL(...) error for URL: ' + imgHref);
		 			console.log('httpDownloader.downloadURL(...) error: ' + _error);
		 		}
				_callback();
			});
		});
	}
	let visitImagePage = function(_imagePageURL, _callback) {
		// if(true) {
		// 	_callback();
		// 	return;
		// }
		// console.log('visiting image page: ' + _imagePageURL);
		httpClient.get(_imagePageURL, function(_error, _resp, _redirectedURL) {
			// console.log('visited image page: ' + _imagePageURL);
			if(_error) {
				console.log('httpClient.get(...) error for URL: ' + _imagePageURL);
				console.log('httpClient.get(...) error: ' + _error);
				return _callback(_error);
			}
			// console.log('parsing image page: ' + _imagePageURL);
			htmlReader.parseIncomingMessage(_resp, function(_error, _domDocument) {
				// console.log('parsed image page: ' + _imagePageURL);
				if(_error) {
					console.log('htmlReader.parseIncomingMessage(...) error for URL: ' + _redirectedURL);
					console.log('htmlReader.parseIncomingMessage(...) error: ' + _error);
					return _callback(_error);
				}
				if(_redirectedURL.hostname.indexOf('imagebam.com') >= 0) {
					processImageBam(_domDocument, _callback);
				} else if(_redirectedURL.hostname.indexOf('pimpandhost.com') >= 0) {
					processPimpAndHost(_domDocument, _callback);
				} else {
					processImageHost(_domDocument, _callback);
				}
			});
		});
	}
	let processImage = function(_imgElements, _i, _callback) {
		if(_i >= _imgElements.length) {
			if(_callback) {
				_callback(null);
			}
			return;
		}
		let imgElement = _imgElements[_i];
		let imgSrc = imgElement.getAttribute('src');
		let parentElement = imgElement.getParentElement();
		if(parentElement.getNodeName() === 'a') {
			let href = parentElement.getAttribute('href');
			if(href === undefined || href === null) {
				processImage(_imgElements,_i + 1, _callback);
				return;
			}
			if(href.startsWith('http')) {
		// console.log('processImage: ' + href);
				// visit image page
				visitImagePage(href, function() {
					processImage(_imgElements,_i + 1, _callback);
				});
			} else {
			// console.log('image link: ' + href);
			// httpDownloader.downloadURL(imgSrc, function() {
				processImage(_imgElements,_i + 1, _callback);
			}
			// });
		} else {
			processImage(_imgElements,_i + 1, _callback);
		}
	}
	_domDocument.queryAll('img', function(_error, _imgElements) {
		if(_error) {
			if(_callback) {
				return _callback(_error);
			}
			return;
		}
		console.log('found ' + _imgElements.length + ' images.');
		processImage(_imgElements, 0, _callback);
	});
}

start("http://cnn.com/");