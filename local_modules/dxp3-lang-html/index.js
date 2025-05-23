const packageName = 'dxp3-lang-html';
const moduleName = 'index';
const path = require('path');
const canonicalName = packageName + path.sep + moduleName;
// Check if someone tried to run/execute this file.
const util = require('dxp3-util');
if(util.Assert.isFileToExecute(canonicalName)) {
	util.Help.print();
	return;
}
const DOMDocument = require('./DOMDocument');
const HTMLReader = require('./HTMLReader');
const HTMLTokenizer = require('./HTMLTokenizer');

const html = {};

html.DOMDocument = DOMDocument;
html.HTMLReader = HTMLReader;
html.HTMLTokenizer = HTMLTokenizer;

module.exports = html;