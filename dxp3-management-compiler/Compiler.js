const packageName = 'dxp3-management-compiler';
const moduleName = 'Compiler';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
const html = require('dxp3-lang-html');
const fs = require('fs');
const rest = require('dxp3-microservice-rest');
const controllerDAO = new rest.RestClient({name: canonicalName, consumes: 'dxp3-management-dao-ControllerDAO'});
const layoutDAO = new rest.RestClient({name: canonicalName, consumes: 'dxp3-management-dao-LayoutDAO'});
const styleDAO = new rest.RestClient({name: canonicalName, consumes: 'dxp3-management-dao-StyleDAO'});
controllerDAO.start();
layoutDAO.start();
styleDAO.start();

// const tmpFolder = 'C:\\temp\\';
const tmpFolder = path.sep + 'var' + path.sep + 'www' + path.sep;

class Compiler {
	static compileControllers(accountUUID, loggedInUserUUID, ownerUUID) {
		// Retrieve a list of all the controllers
		controllerDAO.execute('list', accountUUID, loggedInUserUUID, ownerUUID, 0, -1, null, null, null, function(err, result) {
			if(result === undefined || result === null) {
				return;
			}
			let list = result.list;
			if(list === undefined || list === null) {
				return;
			}
			parseControllers(0, list);
		});
        let mergedController = tmpFolder + 'mergedController.js';
        let wstream = fs.createWriteStream(mergedController);
		let parseControllers = function(index, controllers) {
			if(index >= controllers.length) {
                wstream.end(function() {
                    processMergedControllerFile();
                });
                return;
			}
			let item = controllers[index];
			controllerDAO.execute('get', accountUUID, loggedInUserUUID, item.ownerUUID, item.uuid, function(err, controller) {
                wstream.write(controller.code);
                wstream.write('\n');
                parseControllers(index+1, controllers);
			});
		}
        let processMergedControllerFile = function() {
        	actualCompilation(mergedController, '')
        }
	    let actualCompilation = function(sourceFile, pageContext) {
            let compiledFile = tmpFolder + ownerUUID + '_compiled.js';
            fs.readFile(sourceFile, function(err, data) {
                if(err) {
                    data = '';
                }
                let pageEvents = '';
                var pageId = 'page_' + ownerUUID;
                var packageName = pageId.replace(/-/g, '_') + '_controller';
                var transformedData = transform(pageId, packageName, data);
                var transformedContext = transform(pageId, packageName, pageContext);
                var transformedEvents = transform(pageId, packageName, pageEvents);
                transformedData = 'var ' + packageName + ' = {init : function() {\n' + transformedEvents + '\n' + transformedContext + '\n' + transformedData + '\n}\n';
                transformedData = transformedData + '};' + packageName + '.init();';
                var expression = new RegExp('#' + pageId + ' #', 'g');
                transformedData = transformedData.replace(expression, '#' + pageId + ' #' + pageId + '_');
                var wstream = fs.createWriteStream(compiledFile);
                wstream.write(transformedData);            
                wstream.end(function() {
                	console.log('finished compilation');
                });
	        });
	    };
	    let transform = function(pageId, packageName, data) {
	        var prefix = pageId.replace(/-/g, '_');
	        var transformedData = data.toString().replace(/\$\('(?!<)([\s\S]*?)'\)/g, "$('#" + pageId + " $1')");
	        transformedData = transformedData.replace(/\$\("(?!<)([\s\S]*?)"\)/g, "$(\"#" + pageId + " $1\")");
	        transformedData = transformedData.replace(/\.addEventListener\('click'\s*,\s*'(?!<)([\s\S]*?)'\s*,\s*function/g, ".addEventListener('click', '#" + pageId + " $1', function");
	        transformedData = transformedData.replace(/\.addEventListener\("click"\s*,\s*"(?!<)([\s\S]*?)"\s*,\s*function/g, ".addEventListener(\"click\", \"#" + pageId + " $1\", function");
	        transformedData = transformedData.replace(/id="/g, "id=\"" + pageId + "_");
	        transformedData = transformedData.replace(/id='/g, "id='" + pageId + "_");
	        transformedData = transformedData.replace(/data-target="#/g, "data-target=\"#" + pageId + "_");
	        transformedData = transformedData.replace(/data-target='#/g, "data-target='#" + pageId + "_");
	        transformedData = transformedData.replace(/\.find\('#(?!<)([\s\S]*?)'\)/g, ".find('#" + pageId + "_$1')");
	        transformedData = transformedData.replace(/\.find\("#(?!<)([\s\S]*?)"\)/g, ".find(\"#" + pageId + "_$1\")");
	        transformedData = transformedData.replace(/\.children\('#(?!<)([\s\S]*?)'\)/g, ".parent('#" + pageId + "_$1')");
	        transformedData = transformedData.replace(/\.children\("#(?!<)([\s\S]*?)"\)/g, ".parent(\"#" + pageId + "_$1\")");
	        transformedData = transformedData.replace(/\.parent\('(?!<)([\s\S]*?)'\)/g, ".parent('#" + pageId + " $1')");
	        transformedData = transformedData.replace(/\.parent\("(?!<)([\s\S]*?)"\)/g, ".parent(\"#" + pageId + " $1\")");
	        transformedData = transformedData.replace(/\.parents\('(?!<)([\s\S]*?)'\)/g, ".parents('#" + pageId + " $1')");
	        transformedData = transformedData.replace(/\.parents\("(?!<)([\s\S]*?)"\)/g, ".parents(\"#" + pageId + " $1\")");
	        transformedData = transformedData.replace(/[\s]publish\((?!<)([\s\S]*?)\)/g, packageName + ".publish($1)");
	        transformedData = transformedData.replace(/eventManager.subscribe\(/g, "tpmEventManagerSubscribe(");
	        transformedData = transformedData.replace(/(?!\n)([\s\S]*?)\.subscribe\(([\s\S]*?)\);/g, prefix + "_$1_controller.subscribe(" + prefix + "_$2_controller);");
	        transformedData = transformedData.replace(/tpmEventManagerSubscribe\(/g, "eventManager.subscribe(");
	        var putBodyBack = new RegExp('#' + pageId + ' body');
	        transformedData = transformedData.replace(putBodyBack, 'body');
	        var putHtmlBack = new RegExp('#' + pageId + ' html');
	        transformedData = transformedData.replace(putHtmlBack, 'html');        
	        return transformedData;
	    }
	}

	static compileLayouts(accountUUID, loggedInUserUUID, ownerUUID) {
		// Retrieve a list of all the layouts
		layoutDAO.execute('list', accountUUID, loggedInUserUUID, ownerUUID, 0, -1, null, null, null, function(err, result) {
			if(result === undefined || result === null) {
				return;
			}
			let list = result.list;
			if(list === undefined || list === null) {
				return;
			}
			parseLayouts(0, list);
		});
        let mergedLayout = tmpFolder + 'mergedLayout.html';
        let wstream = fs.createWriteStream(mergedLayout);
		let parseLayouts = function(index, layouts) {
			if(index >= layouts.length) {
                wstream.end(function() {
                    processMergedLayoutFile();
                });
                return;
			}
			let item = layouts[index];
			layoutDAO.execute('get', accountUUID, loggedInUserUUID, item.ownerUUID, item.uuid, function(err, layout) {
                wstream.write(layout.code);
                wstream.write('\n');
                parseLayouts(index+1, layouts);
			});
		}
        let processMergedLayoutFile = function() {
			let compiledFile = tmpFolder + ownerUUID + '_compiled.html';
			fs.readFile(mergedLayout, 'utf8', function(err, data) {
		        let htmlReader = new html.HTMLReader();
		        htmlReader.parse(data, function(err, domDocument) {
	                var wstream = fs.createWriteStream(compiledFile);
		            wstream.write('<div id="' + ownerUUID + '">');
		            let documentElement = domDocument.documentElement;
		            // we are only interested in the body element
        	        wstream.write(domDocument.documentElement.innerHTML());
            	    wstream.write('</div>');
                	wstream.end(function() {
                		console.log('finished compilation');
                	});
                });
 			});
        }
	}

	static compileStyles(accountUUID, loggedInUserUUID, ownerUUID) {
		// Retrieve a list of all the styles
		styleDAO.execute('list', accountUUID, loggedInUserUUID, ownerUUID, 0, -1, null, null, null, function(err, result) {
			if(result === undefined || result === null) {
				return;
			}
			let list = result.list;
			if(list === undefined || list === null) {
				return;
			}
			parseStyles(0, list);
		});
        let mergedStyle = tmpFolder + 'mergedStyle.css';
        let wstream = fs.createWriteStream(mergedStyle);
		let parseStyles = function(index, styles) {
			if(index >= styles.length) {
                wstream.end(function() {
                    processMergedStyleFile();
                });
                return;
			}
			let item = styles[index];
			styleDAO.execute('get', accountUUID, loggedInUserUUID, item.ownerUUID, item.uuid, function(err, style) {
                wstream.write(style.code);
                wstream.write('\n');
                parseStyles(index+1, styles);
			});
		}
        let processMergedStyleFile = function() {
			let compiledFile = tmpFolder + ownerUUID + '_compiled.css';
			fs.readFile(mergedStyle, function(err, data) {
                var wstream = fs.createWriteStream(compiledFile);
                wstream.write(data);            
                wstream.end(function() {
                	console.log('finished compilation');
                });
 			});
        }
	}
}

module.exports = Compiler;