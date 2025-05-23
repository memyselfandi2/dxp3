const fs = require('fs');
const path = require('path');
const configuration = require('dxp3-configuration');
const ApplicationKeys = require('./ApplicationKeys');
const html = require('dxp3-lang-html');

class BootManager {
	static init() {
		BootManager.domainDAO = configuration.Manager.get(ApplicationKeys.DOMAIN_DAO);
	}	

	static boot(req, res, domain, locale) {
		BootManager.domainDAO.execute('get', domain, function(err, definition) {
			console.log('domain \'' + domain + '\' definition: ' + definition);
			if(definition === undefined || definition === null) {
				res.status(404).send('');
				return;
			}
	        let applicationUUID = definition.applicationUUID;
			console.log('application UUID : ' + applicationUUID);
	        if(applicationUUID === undefined || applicationUUID === null) {
	            res.status(404).send('');
	            return;
	        }
	        applicationUUID = applicationUUID.trim();
	        if(applicationUUID.length <= 0) {
	            res.status(404).send('');
	            return;
	        }
	        let pageUUID = definition.pageUUID;
	        if(pageUUID === undefined || pageUUID === null) {
	            res.status(404).send('');
	            return;
	        }
	        pageUUID = pageUUID.trim();
	        if(pageUUID.length <= 0) {
	            res.status(404).send('');
	            return;
	        }
	        console.log('blaat');
	        // If the locale was not overridden in the request (the supplied locale parameter is null),
	        // we attempt to read it from the application definition file.
	        if(locale === undefined || locale === null) {
	            locale = definition.locale;
	            if(locale === undefined || locale === null) {
	                locale = '';
	            }
	        }
            locale = locale.trim().toLowerCase();
//			res.type('text/html').send('<html><body>' + err + ' - ' + JSON.stringify(data) + '</body></html>');
	  		let bootFile =  __dirname + path.sep + 'web' + path.sep + 'boot.html';
	        fs.readFile(bootFile, 'utf-8', function(err, data) {
	        	console.log('read bootfile: ' + err);
	            if(err || data === undefined || data === null) {
	                res.status(404).send('');
	                return;
	            }
	            let htmlReader = new html.HTMLReader();
				htmlReader.load(data, function(err, domDocument) {
					domDocument.query('#application-uuid', function(err, element) {
						element.setValue(applicationUUID);
						domDocument.query('#application-page-uuid', function(err, element) {
							element.setValue(pageUUID);
							domDocument.query('#application-locale', function(err, element) {
								element.setValue(locale);
					        	res.type('text/html; charset=utf-8').send(domDocument.toString());
					        });
				        });
					});
					// if(element === undefined || element === null) {
					// res.status(500).send('');
					// return;
					// }
					// element.val(applicationUuid);
					// // Inject the page uuid
					// element = domDocument.query('#application-page-uuid');
					// if(element === undefined || element === null) {
					// res.status(500).send('');
					// return;
					// }
					// element.val(pageUuid);
					// // Inject the current locale
					// element = domDocument.query('#application-locale');
					// if(element === undefined || element === null) {
					// res.status(500).send('');
					// return;
					// }
					// element.val(locale);
					// var html = query.html();
		    	});
			});
		});
	}
}

module.exports = BootManager;