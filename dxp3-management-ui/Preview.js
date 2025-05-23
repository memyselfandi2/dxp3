const fileSystem = require('fs');
const path = require('path');
// const cheerio = require('cheerio');
const html = require('dxp3-lang-html');

class Preview {
	static getFeaturePreview(accountUUID, loggedInUserUUID, applicationUUID, featureUUID, callback) {
	    let previewHTMLFile = __dirname + path.sep + 'web' + path.sep + 'preview' + path.sep + 'preview.html';
	    fileSystem.readFile(previewHTMLFile, 'utf-8', function(err, data) {
			return callback(null, data);
		});
	}
	static getPagePreview(accountUUID, loggedInUserUUID, applicationUUID, pageUUID, authenticationToken, callback) {
	    let previewHTMLFile = __dirname + path.sep + 'web' + path.sep + 'preview' + path.sep + 'preview.html';
console.log('previeHTMLFile: ' + previewHTMLFile);
	    fileSystem.readFile(previewHTMLFile, 'utf-8', function(err, data) {
	        if(err != undefined && err != null) {
	            return callback(err);
	        }
	        let htmlReader = new html.HTMLReader();
	        htmlReader.parse(data, function(err, domDocument) {
		        let tokenElement = domDocument.getElementById('token');
		        if(tokenElement === undefined || tokenElement === null) {
		            return callback(401);
		        }
console.log('this is 1');
				if(authenticationToken === undefined || authenticationToken === null) {
					return callback(401);
				}
				tokenElement.setValue(authenticationToken);
				let applicationElement = domDocument.getElementById('application-uuid');
console.log('this is 2');
				applicationElement.setValue(applicationUUID)
				let pageElement = domDocument.getElementById('application-page-uuid');
				pageElement.setValue(pageUUID);
console.log('this is 3');
				callback(null, domDocument.toString());
	        });
			// let element = query('#application-uuid');
			// element.val(applicationUuid);
			// if(type === 'page') {
			// 	element = query('#application-page-uuid');
			// 	element.val(uuid);
			// 	element = query('#application-title');
			// 	element.text(applicationTitle);
			// } else if(type === 'feature') {
			// 	element = query('#application-feature-uuid');
			// 	element.val(uuid);
			// }
			// element = query('#application-locale');
			// element.val(locale);
			// element = query('#application-compilation');
			// element.val(compilationStatus);
			// element = query('#application-debug');
			// element.val(debug);
			// callback(null, query.html());
		});
	}
}

module.exports = Preview;